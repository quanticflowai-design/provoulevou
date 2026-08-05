// [PL] Fluxos — Motor (cron interpretador). Roda a cada 1 min.
const SVC='<SUPABASE_SERVICE_ROLE_KEY>';
const BASE='https://quantic-supabase.k5jwra.easypanel.host/rest/v1';
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const patch=(u,b)=>this.helpers.httpRequest({method:'PATCH',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const post=(u,b,extra)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:(extra||'return=minimal')},H),body:b,json:true});
const send=b=>this.helpers.httpRequest({method:'POST',url:'https://n8n.segredosdodrop.com/webhook/pl-wa-send',body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
// A API da Meta aceita o template (devolve wamid) e SÓ DEPOIS reprova a entrega via webhook de status
// (ex.: conta sem cartão => status 'failed'). Por isso o passo seguinte espera a confirmação antes de rodar.
const CHECK_MS=120000;   // margem p/ o webhook de status chegar
const CHECK_MAX=3;       // rodadas de espera antes de seguir sem confirmação
const semMarca=c=>{const o=Object.assign({},c);delete o._last_wamid;delete o._wamid_checks;return o;};
const nowIso=new Date().toISOString();
const due=await get(`/flow_enrollments?status=eq.ativo&proxima_acao_em=lte.${nowIso}&select=*&limit=200`);
const log=(e,tipo,res,det)=>post('/flow_runs_log',{enrollment_id:e.id,flow_id:e.flow_id,lojista_email:e.lojista_email,lead_phone:e.lead_phone,passo_idx:e.passo_idx,tipo_no:tipo,resultado:res,detalhe:det||{}});
let enviados=0;
for(const e of due){
  try{
    const flow=(await get(`/flows?id=eq.${e.flow_id}&select=*`))[0];
    if(!flow||!flow.ativo){await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'concluido'});continue;}
    const cfg=(await get(`/lojistas?email=eq.${encodeURIComponent(e.lojista_email)}&select=origem,tabela_pedidos,campo_status_pedido,valores_status_pago,campo_telefone_pedido,campo_data_pedido`))[0]||{};
    const exits=flow.exits||{};
    // SAIDA: comprou
    if(exits.para_se_comprou && cfg.tabela_pedidos){
      const sc=cfg.campo_status_pedido||'payment_status', fc=cfg.campo_telefone_pedido||'customer_phone', dc=cfg.campo_data_pedido||'created_at';
      const pagos=(cfg.valores_status_pago||['paid']).join(',');
      const ords=await get(`/${cfg.tabela_pedidos}?${sc}=in.(${encodeURIComponent(pagos)})&${dc}=gte.${e.enrolled_at}&select=${fc}&limit=500`);
      if(ords.some(o=>norm(o[fc])===e.lead_phone)){await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'parou_comprou'});await log(e,'exit','parou',{motivo:'comprou'});continue;}
    }
    // SAIDA: respondeu
    if(exits.para_se_respondeu){
      const resp=await get(`/whatsapp_mensagens?email=eq.${encodeURIComponent(e.lojista_email)}&direction=eq.in&lead_phone=ilike.*${e.lead_phone}*&created_at=gte.${e.enrolled_at}&select=id&limit=1`);
      if(resp.length){await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'parou_respondeu'});await log(e,'exit','parou',{motivo:'respondeu'});continue;}
    }
    const passos=flow.passos||[]; const no=passos[e.passo_idx];
    if(!no){await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'concluido'});continue;}
    let c=e.contexto||{};   // contexto do lead: visível a todos os nós (não redeclarar dentro dos ramos)
    // GUARDA DE ENTREGA: só continua o fluxo se a Meta não reprovou a mensagem do passo anterior.
    if(c._last_wamid){
      const ent=await get(`/whatsapp_mensagens?meta_message_id=eq.${encodeURIComponent(c._last_wamid)}&select=status&limit=1`);
      const st=(ent[0]||{}).status||null;
      if(st==='failed'){
        // mensagem não chegou (ex.: sem cartão no Meta) => para aqui. Nada de mover_crm com envio reprovado.
        await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'erro',contexto:semMarca(c),updated_at:new Date().toISOString()});
        await log(e,'enviar','falhou',{motivo:'meta_reprovou_entrega',wamid:c._last_wamid,status:st});
        continue;
      }
      const checks=(c._wamid_checks||0)+1;
      if(!st && checks<=CHECK_MAX){
        await patch(`/flow_enrollments?id=eq.${e.id}`,{proxima_acao_em:new Date(Date.now()+CHECK_MS).toISOString(),contexto:Object.assign({},c,{_wamid_checks:checks}),updated_at:new Date().toISOString()});
        await log(e,'enviar','esperou',{motivo:'aguarda_status_meta',wamid:c._last_wamid,tentativa:checks});
        continue;
      }
      // entregue/lida (ou sem status após CHECK_MAX rodadas): segue o fluxo sem o marcador
      c=semMarca(c);
      await patch(`/flow_enrollments?id=eq.${e.id}`,{contexto:c,updated_at:new Date().toISOString()});
    }
    // JANELA (so envio)
    if(no.tipo==='enviar'){
      const j=flow.janela_envio||{}; const d=new Date();
      const horaBR=Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:j.tz||'America/Sao_Paulo'}).format(d));
      const hi=(j.hora_ini==null?9:j.hora_ini), hf=(j.hora_fim==null?21:j.hora_fim);
      if(horaBR<hi||horaBR>=hf){const next=new Date(d);next.setHours(hi,0,0,0);if(next<=d)next.setDate(next.getDate()+1);await patch(`/flow_enrollments?id=eq.${e.id}`,{proxima_acao_em:next.toISOString()});await log(e,'janela','esperou',{horaBR});continue;}
    }
    // EXECUTA NO
    let nextIdx=e.passo_idx+1, nextAt=new Date().toISOString();
    if(no.tipo==='espera'){
      const ms=(no.qtd||0)*({min:60000,hora:3600000,dia:86400000}[no.unidade]||60000);
      nextAt=new Date(Date.now()+ms).toISOString();
      await log(e,'espera','esperou',{qtd:no.qtd,unidade:no.unidade});
    } else if(no.tipo==='enviar'){
      const dict={image:'',nome:c.nome||'👋',produto:c.produto||'o modelo que você provou',link:c.url||''};
      const mapk=k=>(Object.prototype.hasOwnProperty.call(dict,k)?dict[k]:k);
      const bodyParams=(no.params||[]).map(mapk);
      const body={email:e.lojista_email,to:e.lead_phone,template:no.template,language:no.language||'pt_BR',params:bodyParams};
      // botão URL com variável {{1}}: monta components com body + button personalizados por lead
      if(no.button!=null && no.button!==''){
        body.components=[
          {type:'body',parameters:bodyParams.map(t=>({type:'text',text:String(t)}))},
          {type:'button',sub_type:'url',index:'0',parameters:[{type:'text',text:String(mapk(no.button))}]}
        ];
      } else if(no.components){ body.components=no.components; }   // back-compat (components literal)
      let r; try{r=await send(body);}catch(se){r={ok:false,error:String(se.message||se).slice(0,160)};}
      if(r&&r.ok){
        enviados++;
        const wamid=(r&&r.meta_message_id)||null;
        await log(e,'enviar','enviado',{template:no.template,wamid});
        if(wamid){
          // avança o passo mas segura a execução: o próximo nó só roda depois de conferir o status na Meta
          await patch(`/flow_enrollments?id=eq.${e.id}`,{passo_idx:nextIdx,proxima_acao_em:new Date(Date.now()+CHECK_MS).toISOString(),contexto:Object.assign({},c,{_last_wamid:wamid,_wamid_checks:0,_envio_tries:0}),updated_at:new Date().toISOString()});
          continue;
        }
      } else {
        // falha transitória do envio: retenta o MESMO passo (backoff 3min) até 3x antes de desistir
        const tries=((c&&c._envio_tries)||0)+1;
        const respStr=(typeof r==='string'?r:JSON.stringify(r)).slice(0,250);
        if(tries<3){
          await patch(`/flow_enrollments?id=eq.${e.id}`,{proxima_acao_em:new Date(Date.now()+180000).toISOString(),contexto:Object.assign({},c,{_envio_tries:tries}),updated_at:new Date().toISOString()});
          await log(e,'enviar','falhou',{template:no.template,tentativa:tries,retry:true,resp:respStr});
          continue;
        }
        // desistiu: o lead NÃO avança (senão um mover_crm seguinte marcaria como contatado sem mensagem)
        await log(e,'enviar','falhou',{template:no.template,tentativa:tries,desistiu:true,resp:respStr});
        await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'erro',contexto:semMarca(c),updated_at:new Date().toISOString()});
        continue;
      }
    } else if(no.tipo==='mover_crm'){
      try{
        await post('/crm_lead_overrides',{lojista_email:e.lojista_email,telefone:e.lead_phone,column_key:no.estagio},'resolution=merge-duplicates');
        await log(e,'mover_crm','movido',{estagio:no.estagio});
      }catch(ce){
        await log(e,'mover_crm','falhou',{estagio:no.estagio,err:String((ce&&ce.message)||ce).slice(0,200)});
      }
    }
    await patch(`/flow_enrollments?id=eq.${e.id}`,{passo_idx:nextIdx,proxima_acao_em:nextAt,updated_at:new Date().toISOString()});
  }catch(err){
    await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'ativo',proxima_acao_em:new Date(Date.now()+300000).toISOString()});
    await log(e,'erro','falhou',{err:String((err&&err.message)||err).slice(0,200)});
  }
}
return [{json:{processados:due.length,enviados}}];
