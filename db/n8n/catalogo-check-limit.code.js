// [PL Catálogo] Check de limite — 3 provas por cliente, por dia, por catálogo.
//
// ONDE ENTRA: logo depois do Webhook, nos DOIS geradores (gerador-oculos e
// quantic-materialize), ANTES de qualquer chamada paga. O catalogo/app.js já
// avisa o cliente, mas aviso não é trava: quem posta direto no webhook passa
// por cima do front. Quem recusa de verdade é este nó.
//
// COMO LIGA: Code (este arquivo) → IF ({{ $json.limitado }} é true) →
//   • true  → Respond to Webhook com {"error":"limite_diario"}
//             (o app.js já entende essa resposta e trava o número na tela)
//   • false → segue o fluxo normal de geração
// O JSON pronto pra colar no canvas está em catalogo-check-limit.json.
//
// Prova de WIDGET não passa por aqui: sem catalog_slug o nó deixa seguir, que
// o limite das lojas é outro e não é este nó que decide.
const SVC = '<SUPABASE_SERVICE_ROLE_KEY>';
const RPC = 'https://quantic-supabase.k5jwra.easypanel.host/rest/v1/rpc/pl_catalog_check_limit';
const LIMITE = 3;

const out = [];
for (const item of $input.all()) {
  // multipart cai em $json.body em parte das versões do Webhook, e solto no
  // $json nas outras — lê dos dois sem depender de qual.
  const b = Object.assign({}, item.json, item.json.body || {});
  const slug = String(b.catalog_slug || '').trim();
  const fone = String(b.whatsapp || b.phone_raw || '').trim();
  const passa = extra => out.push({ json: Object.assign({}, item.json, extra), binary: item.binary });

  if (!slug || !fone) { passa({ limitado: false, motivo: 'nao_e_catalogo' }); continue; }

  let r = null;
  try {
    r = await this.helpers.httpRequest({
      method: 'POST', url: RPC,
      headers: { apikey: SVC, Authorization: 'Bearer ' + SVC, 'Content-Type': 'application/json' },
      body: { p_slug: slug, p_phone: fone, p_limite: LIMITE }, json: true
    });
  } catch (e) {
    // Banco fora do ar não pode derrubar quem ainda tem saldo: deixa passar e
    // registra o motivo na execução. Errar pro lado de recusar seria pior —
    // o cliente perde a prova e a loja perde a venda.
    passa({ limitado: false, motivo: 'check_indisponivel', check_erro: String((e && e.message) || e) });
    continue;
  }

  // A função devolve `erro` (loja/telefone que ela não reconheceu) em vez de
  // limited. Nesse caso não há contagem confiável pra barrar ninguém.
  if (!r || r.erro) { passa({ limitado: false, motivo: (r && r.erro) || 'sem_resposta' }); continue; }

  const usadas = Number(r.usadas) || 0;
  passa({
    limitado: r.limited === true,
    usadas,
    restantes: Math.max(0, LIMITE - usadas),
    limite: LIMITE,
    ip_usadas: Number(r.ip_usadas) || 0   // mesmo aparelho trocando de número; hoje não bloqueia
  });
}
return out;
