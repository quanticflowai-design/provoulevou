(function () {
  var faq = [
    ['Preciso pagar alguma coisa para ser afiliado?', 'Não. O cadastro é gratuito e você não tem meta mínima. Você ganha quando uma loja que você indicou (ou que alguém da sua rede indicou) paga a mensalidade.'],
    ['Quanto eu ganho?', 'Quando você vende: 20% da 1ª mensalidade e 10% de todas as mensalidades seguintes. Quando alguém que você convidou vende: 5% e depois 2%. Quando o convidado do seu convidado vende: 2% e depois 1%. Tudo enquanto o cliente estiver ativo.'],
    ['Até quando eu recebo?', 'Enquanto o cliente estiver ativo. Se a loja cancelar ou parar de pagar, a comissão daquela loja para.'],
    ['Como a Provou Levou sabe que a loja veio de mim?', 'Pelo seu link de indicação (o lojista cai direto no nosso WhatsApp com o seu código) ou pelo cadastro da loja no seu painel, com o WhatsApp do dono, antes de ele falar com a gente. Vale quem trouxe primeiro, por 90 dias.'],
    ['Eu preciso fechar a venda e receber o pagamento?', 'Não. Você apresenta e indica. O nosso time cria o provador, cobra e dá suporte. O pagamento é sempre direto para a Provou Levou, e a sua comissão é registrada automaticamente.'],
    ['Quem pode ser afiliado?', 'Qualquer pessoa: lojistas, agências, gestores de tráfego, consultores de e-commerce, representantes de ótica e de moda, criadores de conteúdo.'],
    ['Até que nível vai a rede?', 'Até o 3º nível: você, quem você convidou e quem esse convidado convidou. Daí para baixo não gera comissão.'],
    ['Onde acompanho minhas comissões?', 'No seu painel de afiliado: rede em formato de árvore, lojas indicadas, comissões a receber e já pagas.']
  ];
  document.querySelectorAll('[data-faq]').forEach(function (el) {
    el.innerHTML = faq.map(function (f) { return '<details><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>'; }).join('');
  });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
  document.querySelectorAll('.rise').forEach(function (el) { io.observe(el); });
})();
