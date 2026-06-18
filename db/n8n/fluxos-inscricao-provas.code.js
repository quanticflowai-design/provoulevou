// [PL] Fluxos — Inscrição Provas. Schedule a cada 10 min.
const SVC='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MjE0NzQ4MzY0N30.JHL5vWMfoj2266HGBfecfDzmYKdILojVNspL9lUMu7M';
const BASE='https://quantic-supabase.k5jwra.easypanel.host/rest/v1';
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const post=(u,b)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
const since=new Date(Date.now()-20*60*1000).toISOString();   // janela 20min (schedule 10min => overlap, dedup cobre)
const flows=await get(`/flows?ativo=eq.true&gatilho=in.(provou_nao_comprou,clicou_comprar_nao_comprou)&select=id,lojista_email,gatilho`);
let vistos=0, inscritos=0;
for(const f of flows){
  const cfg=(await get(`/lojistas?email=eq.${encodeURIComponent(f.lojista_email)}&select=origem`))[0];
  if(!cfg||!cfg.origem)continue;
  const provas=await get(`/geracoes_provou_levou?origin=ilike.*${encodeURIComponent(cfg.origem)}*&created_at=gte.${since}&select=telefone_cliente,produtos,produto_url,carrinho_adicionado,created_at`);
  for(const p of provas){
    vistos++;
    const ph=norm(p.telefone_cliente); if(ph.length<10)continue;
    const clicou=!!p.carrinho_adicionado;
    const querClicou=f.gatilho==='clicou_comprar_nao_comprou';
    if(querClicou!==clicou)continue;                       // casa a classificação do gatilho
    const ja=await get(`/flow_enrollments?flow_id=eq.${f.id}&lead_phone=eq.${ph}&status=eq.ativo&select=id&limit=1`);
    if(ja.length)continue;                                  // já inscrito ativo
    try{
      await post('/flow_enrollments',{flow_id:f.id,lojista_email:f.lojista_email,lead_phone:ph,
        contexto:{nome:'',produto:(String(p.produtos||'').split(',')[0]||'').trim(),url:p.produto_url||''},
        status:'ativo',passo_idx:0});
      inscritos++;
    }catch(err){ /* 23505 corrida: índice único parcial já garante dedup */ }
  }
}
return [{json:{flows:flows.length,vistos,inscritos}}];
