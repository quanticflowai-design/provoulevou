// [PL] Fluxos — Motor (cron interpretador). Roda a cada 1 min.
const SVC='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MjE0NzQ4MzY0N30.JHL5vWMfoj2266HGBfecfDzmYKdILojVNspL9lUMu7M';
const BASE='https://quantic-supabase.k5jwra.easypanel.host/rest/v1';
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const patch=(u,b)=>this.helpers.httpRequest({method:'PATCH',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const post=(u,b,extra)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:(extra||'return=minimal')},H),body:b,json:true});
const send=b=>this.helpers.httpRequest({method:'POST',url:'https://n8n.segredosdodrop.com/webhook/pl-wa-send',body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
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
      const c=e.contexto||{};
      const dict={image:'',nome:c.nome||'👋',produto:c.produto||'o modelo que você provou',link:c.url||''};
      const params=(no.params||[]).map(k=>(Object.prototype.hasOwnProperty.call(dict,k)?dict[k]:k));
      const body={email:e.lojista_email,to:e.lead_phone,template:no.template,language:no.language||'pt_BR',params};
      if(no.components)body.components=no.components;
      let r; try{r=await send(body);}catch(se){r={ok:false,error:String(se.message||se).slice(0,160)};}
      if(r&&r.ok){
        enviados++;
        await log(e,'enviar','enviado',{template:no.template,wamid:(r&&r.meta_message_id)||null});
      } else {
        // falha transitória do envio: retenta o MESMO passo (backoff 3min) até 3x antes de desistir
        const tries=((c&&c._envio_tries)||0)+1;
        const respStr=(typeof r==='string'?r:JSON.stringify(r)).slice(0,250);
        if(tries<3){
          await patch(`/flow_enrollments?id=eq.${e.id}`,{proxima_acao_em:new Date(Date.now()+180000).toISOString(),contexto:Object.assign({},c,{_envio_tries:tries}),updated_at:new Date().toISOString()});
          await log(e,'enviar','falhou',{template:no.template,tentativa:tries,retry:true,resp:respStr});
          continue;
        }
        await log(e,'enviar','falhou',{template:no.template,tentativa:tries,desistiu:true,resp:respStr});
      }
    } else if(no.tipo==='mover_crm'){
      try{await post('/crm_lead_overrides',{lojista_email:e.lojista_email,telefone:e.lead_phone,column_key:no.estagio},'resolution=merge-duplicates');}catch(ce){}
      await log(e,'mover_crm','movido',{estagio:no.estagio});
    }
    await patch(`/flow_enrollments?id=eq.${e.id}`,{passo_idx:nextIdx,proxima_acao_em:nextAt,updated_at:new Date().toISOString()});
  }catch(err){
    await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'ativo',proxima_acao_em:new Date(Date.now()+300000).toISOString()});
    await log(e,'erro','falhou',{err:String((err&&err.message)||err).slice(0,200)});
  }
}
return [{json:{processados:due.length,enviados}}];
