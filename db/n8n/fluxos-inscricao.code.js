const primeiroNome=v=>String(v||'').trim().split(/\s+/)[0]||'';
// [PL] Fluxos — Inscrição (provas + carrinho + pagamento pendente + CRM). Schedule a cada 10 min.
const SVC='<SUPABASE_SERVICE_ROLE_KEY>';
const BASE='https://quantic-supabase.k5jwra.easypanel.host/rest/v1';
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const post=(u,b)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
const canonicalEmail=email=>{const e=String(email||'').toLowerCase();const groups=[['gustavomota@oculoslindamenina.com','olm@oculoslindamenina.com'],['cacifebrand@outlook.com','meta-review@provoulevou.com.br'],['contato@santieyewear.com.br','santieyewear@gmail.com'],['alex.rodrigues@programmoda.com.br','projeto@agencia2bdigital.com.br','zafirakc@gmail.com'],['contato@korosoculos.com.br','julliana.negocios@gmail.com']];const g=groups.find(x=>x.includes(e));return g?g.slice().sort()[0]:e;};
const isPending=v=>['pending','pendente','aguardando pagamento','aguardando_pagamento','unpaid'].includes(String(v||'').trim().toLowerCase());
const enc=encodeURIComponent;
const since=new Date(Date.now()-60*60*1000).toISOString();      // janela do scan (10min schedule => overlap, dedup cobre)
const freshCut=new Date(Date.now()-3*60*60*1000).toISOString(); // gate: não inscrever carrinho com visita > 3h (anti backlog)
const flows=await get(`/flows?ativo=eq.true&gatilho=in.(provou_nao_comprou,clicou_comprar_nao_comprou,carrinho_abandonado,pagamento_pendente,crm_etapa)&select=id,lojista_email,gatilho,gatilho_etapa`);
let vistos=0, inscritos=0;
for(const f of flows){
  const cand=[];   // {phone, contexto}
  if(f.gatilho==='crm_etapa'){
    // gatilho: lead entrou numa etapa do CRM (sinal = crm_lead_overrides).
    // A chave do CRM tem só 9 dígitos (sem DDD) => resolve o número completo via prova p/ poder enviar.
    if(!f.gatilho_etapa)continue;
    const cfg=(await get(`/lojistas?email=eq.${enc(f.lojista_email)}&select=origem`))[0];
    const etapaCod=String(f.gatilho_etapa||'');
    const etapaLentes=etapaCod.startsWith('lentes:');
    const etapaAlvo=etapaLentes?etapaCod.slice(7):etapaCod;
    if(etapaLentes){
      if(!cfg||!cfg.origem)continue;
      const rows=await get(`/lentes_funnel?origin=ilike.*${enc(cfg.origem)}*&created_at=gte.${since}&select=session_id,telefone,step,detail,produto,created_at&order=created_at.asc&limit=1000`);
      const eventos=(rows||[]).filter(r=>r.step===etapaAlvo||((r.step==='crm_lentes_etapa'||r.step==='crm_etapa_lentes')&&r.detail&&r.detail.etapa===etapaAlvo));
      const sids=[...new Set(eventos.map(r=>r.session_id).filter(Boolean))];
      const porSessao={};
      if(sids.length){
        const hist=await get(`/lentes_funnel?origin=ilike.*${enc(cfg.origem)}*&session_id=in.(${sids.map(enc).join(',')})&select=session_id,telefone,produto,detail,created_at&order=created_at.desc&limit=3000`);
        for(const r of (hist||[])){ const s=porSessao[r.session_id]||(porSessao[r.session_id]={telefone:'',produto:'',url:''}); if(!s.telefone&&r.telefone)s.telefone=r.telefone;if(!s.produto&&r.produto)s.produto=r.produto;const d=r.detail||{};if(!s.url)s.url=d.produto_url||d.url||''; }
      }
      for(const r of eventos){ const s=porSessao[r.session_id]||{}; const d=r.detail||{}; cand.push({phone:r.telefone||s.telefone,contexto:{nome:primeiroNome(d.nome),produto:r.produto||s.produto||d.produto||'',url:d.produto_url||d.url||s.url||''}}); }
      // O fluxo de lentes já foi resolvido acima; o CRM tradicional continua abaixo.
      if(eventos.length||etapaLentes){ /* segue para deduplicação */ }
    }
    const movs=etapaLentes?[]:await get(`/crm_lead_overrides?lojista_email=eq.${enc(f.lojista_email)}&column_key=eq.${enc(etapaAlvo)}&updated_at=gte.${since}&select=telefone&limit=500`);
    for(const m of movs){
      const key=String(m.telefone||'').replace(/\D/g,''); if(key.length<8)continue;
      let full=null, ctx={nome:'',produto:'',url:''};
      if(cfg&&cfg.origem){
        // telefone_cliente é NUMÉRICO (sem ilike): testa DDDs 11..99 (+ variante 55) concatenados à chave
        const cands=[]; for(let ddd=11;ddd<=99;ddd++){ cands.push(ddd+key); cands.push('55'+ddd+key); }
        const pr=await get(`/geracoes_provou_levou?origin=ilike.*${enc(cfg.origem)}*&telefone_cliente=in.(${cands.join(',')})&select=telefone_cliente,produtos,produto_url,nome_cliente&order=created_at.desc&limit=1`);
        // nome_cliente = o nome que a pessoa digitou NO PROVADOR. Ficava vazio na marra e o
        // template caia no coringa 👋. O carrinho abandonado ja usava contact_name; o caminho
        // da prova nao usava nada. (Hazon, 31/08/2026)
        if(pr[0]&&pr[0].telefone_cliente){ full=String(pr[0].telefone_cliente); ctx={nome:primeiroNome(pr[0].nome_cliente), produto:(String(pr[0].produtos||'').split(',')[0]||'').trim(), url:pr[0].produto_url||''}; }
      }
      if(!full)continue;   // sem número completo resolvível => não inscreve (evita envio pra número errado)
      cand.push({phone:full, contexto:ctx});
    }
  } else {
    const cfg=(await get(`/lojistas?email=eq.${enc(f.lojista_email)}&select=origem,tabela_pedidos,campo_status_pedido,campo_telefone_pedido,campo_nome_pedido,campo_produto_pedido,campo_total_pedido,campo_data_pedido`))[0];
    if(!cfg)continue;
    if(f.gatilho==='pagamento_pendente'){
      if(!cfg.tabela_pedidos)continue;
      const statusField=cfg.campo_status_pedido||'payment_status';
      const phoneField=cfg.campo_telefone_pedido||'customer_phone';
      const nameField=cfg.campo_nome_pedido||'customer_name';
      const productField=cfg.campo_produto_pedido||'product_name';
      const totalField=cfg.campo_total_pedido||'total';
      const dateField=cfg.campo_data_pedido||'created_at';
      const orders=await get(`/${enc(cfg.tabela_pedidos)}?${enc(dateField)}=gte.${enc(since)}&select=*&limit=500`);
      for(const o of orders){
        if(!isPending(o[statusField]))continue;
        cand.push({phone:o[phoneField]||o.customer_phone||o.contact_phone||o.shipping_phone,contexto:{nome:primeiroNome(o[nameField]),produto:String(o[productField]||'').trim(),url:o.checkout_url||o.order_url||'',total:o[totalField]||0,pedido:o.order_number||o.id_pedido||o.id||''}});
      }
    } else if(f.gatilho==='carrinho_abandonado'){
      if(!cfg.origem)continue;
      const carts=await get(`/abandoned_checkouts?abandoned_checkout_url=ilike.*${enc(cfg.origem)}*&completed_at=is.null&recovered_at=is.null&customer_visit_created_at=gte.${freshCut}&or=(updated_at.gte.${since},synced_at.gte.${since})&select=contact_phone,shipping_phone,contact_name,abandoned_checkout_url,total&limit=500`);
      for(const ch of carts){
        cand.push({phone:ch.contact_phone||ch.shipping_phone, contexto:{nome:String(ch.contact_name||'').trim().split(/\s+/)[0]||'', produto:'', url:ch.abandoned_checkout_url||'', total:ch.total}});
      }
    } else {
      if(!cfg.origem)continue;
      const provas=await get(`/geracoes_provou_levou?origin=ilike.*${enc(cfg.origem)}*&created_at=gte.${since}&select=telefone_cliente,produtos,produto_url,carrinho_adicionado,nome_cliente&limit=500`);
      const querClicou=f.gatilho==='clicou_comprar_nao_comprou';
      for(const p of provas){
        if((!!p.carrinho_adicionado)!==querClicou)continue;   // casa classificação do gatilho
        cand.push({phone:p.telefone_cliente, contexto:{nome:primeiroNome(p.nome_cliente), produto:(String(p.produtos||'').split(',')[0]||'').trim(), url:p.produto_url||''}});
      }
    }
  }
  // Consolida candidatos e carrega as travas uma vez por fluxo. Antes eram duas
  // consultas REST por candidato, o que fazia o runner ficar sem responder.
  const candidatos=new Map();
  for(const c of cand){
    vistos++;
    const ph=norm(c.phone); if(ph.length<10)continue;
    if(!candidatos.has(ph))candidatos.set(ph,c);
  }
  const _carencia=new Date(Date.now()-30*86400000).toISOString();
  const anteriores=await get(`/flow_enrollments?flow_id=eq.${f.id}&or=(status.eq.ativo,enrolled_at.gte.${enc(_carencia)})&select=lead_phone&limit=5000`);
  const jaPhones=new Set((anteriores||[]).map(x=>norm(x.lead_phone)));
  let crmBloqueados=new Set();
  if(f.gatilho!=='crm_etapa'){
    const bloqueios=await get(`/crm_lead_overrides?lojista_email=eq.${enc(canonicalEmail(f.lojista_email))}&column_key=in.(msg-1,msg-2,msg-3,em-contato,convertido,perdido,negociando)&select=telefone&limit=5000`);
    crmBloqueados=new Set((bloqueios||[]).map(x=>norm(x.telefone).slice(-8)).filter(Boolean));
  }
  for(const [ph,c] of candidatos){
    if(jaPhones.has(ph))continue;
    if(f.gatilho!=='crm_etapa'&&crmBloqueados.has(ph.slice(-8)))continue;
    try{
      await post('/flow_enrollments',{flow_id:f.id,lojista_email:f.lojista_email,lead_phone:ph,contexto:c.contexto,status:'ativo',passo_idx:0});
      inscritos++; jaPhones.add(ph);
    }catch(err){ /* índice único parcial garante dedup */ }
  }
}
return [{json:{flows:flows.length,vistos,inscritos}}];
