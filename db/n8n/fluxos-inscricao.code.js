// [PL] Fluxos — Inscrição (provas + carrinho abandonado). Schedule a cada 10 min.
const SVC='<SUPABASE_SERVICE_ROLE_KEY>';
const BASE='https://quantic-supabase.k5jwra.easypanel.host/rest/v1';
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const post=(u,b)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
const enc=encodeURIComponent;
const since=new Date(Date.now()-20*60*1000).toISOString();      // janela do scan (10min schedule => overlap, dedup cobre)
const freshCut=new Date(Date.now()-3*60*60*1000).toISOString(); // gate: não inscrever carrinho com visita > 3h (anti backlog)
const flows=await get(`/flows?ativo=eq.true&gatilho=in.(provou_nao_comprou,clicou_comprar_nao_comprou,carrinho_abandonado,crm_etapa)&select=id,lojista_email,gatilho,gatilho_etapa`);
let vistos=0, inscritos=0;
for(const f of flows){
  const cand=[];   // {phone, contexto}
  if(f.gatilho==='crm_etapa'){
    // gatilho: lead entrou numa etapa do CRM (sinal = crm_lead_overrides).
    // A chave do CRM tem só 9 dígitos (sem DDD) => resolve o número completo via prova p/ poder enviar.
    if(!f.gatilho_etapa)continue;
    const cfg=(await get(`/lojistas?email=eq.${enc(f.lojista_email)}&select=origem`))[0];
    const movs=await get(`/crm_lead_overrides?lojista_email=eq.${enc(f.lojista_email)}&column_key=eq.${enc(f.gatilho_etapa)}&updated_at=gte.${since}&select=telefone&limit=500`);
    for(const m of movs){
      const key=String(m.telefone||'').replace(/\D/g,''); if(key.length<8)continue;
      let full=null, ctx={nome:'',produto:'',url:''};
      if(cfg&&cfg.origem){
        // telefone_cliente é NUMÉRICO (sem ilike): testa DDDs 11..99 (+ variante 55) concatenados à chave
        const cands=[]; for(let ddd=11;ddd<=99;ddd++){ cands.push(ddd+key); cands.push('55'+ddd+key); }
        const pr=await get(`/geracoes_provou_levou?origin=ilike.*${enc(cfg.origem)}*&telefone_cliente=in.(${cands.join(',')})&select=telefone_cliente,produtos,produto_url&order=created_at.desc&limit=1`);
        if(pr[0]&&pr[0].telefone_cliente){ full=String(pr[0].telefone_cliente); ctx={nome:'', produto:(String(pr[0].produtos||'').split(',')[0]||'').trim(), url:pr[0].produto_url||''}; }
      }
      if(!full)continue;   // sem número completo resolvível => não inscreve (evita envio pra número errado)
      cand.push({phone:full, contexto:ctx});
    }
  } else {
    const cfg=(await get(`/lojistas?email=eq.${enc(f.lojista_email)}&select=origem`))[0];
    if(!cfg||!cfg.origem)continue;
    if(f.gatilho==='carrinho_abandonado'){
      const carts=await get(`/abandoned_checkouts?abandoned_checkout_url=ilike.*${enc(cfg.origem)}*&completed_at=is.null&recovered_at=is.null&customer_visit_created_at=gte.${freshCut}&updated_at=gte.${since}&select=contact_phone,shipping_phone,contact_name,abandoned_checkout_url,total&limit=500`);
      for(const ch of carts){
        cand.push({phone:ch.contact_phone||ch.shipping_phone, contexto:{nome:String(ch.contact_name||'').trim().split(/\s+/)[0]||'', produto:'', url:ch.abandoned_checkout_url||'', total:ch.total}});
      }
    } else {
      const provas=await get(`/geracoes_provou_levou?origin=ilike.*${enc(cfg.origem)}*&created_at=gte.${since}&select=telefone_cliente,produtos,produto_url,carrinho_adicionado&limit=500`);
      const querClicou=f.gatilho==='clicou_comprar_nao_comprou';
      for(const p of provas){
        if((!!p.carrinho_adicionado)!==querClicou)continue;   // casa classificação do gatilho
        cand.push({phone:p.telefone_cliente, contexto:{nome:'', produto:(String(p.produtos||'').split(',')[0]||'').trim(), url:p.produto_url||''}});
      }
    }
  }
  for(const c of cand){
    vistos++;
    const ph=norm(c.phone); if(ph.length<10)continue;
    const ja=await get(`/flow_enrollments?flow_id=eq.${f.id}&lead_phone=eq.${ph}&status=eq.ativo&select=id&limit=1`);
    if(ja.length)continue;
    try{ await post('/flow_enrollments',{flow_id:f.id,lojista_email:f.lojista_email,lead_phone:ph,contexto:c.contexto,status:'ativo',passo_idx:0}); inscritos++; }
    catch(err){ /* 23505: índice único parcial garante dedup */ }
  }
}
return [{json:{flows:flows.length,vistos,inscritos}}];
