/* Lentes por loja do catálogo + regra de grau (função pura, sem DOM).
   Hoje só a Magrini (Haytek, visão simples acabada). Grade = faixas em que a
   lente existe pronta; cada linha da tabela do fornecedor vira uma faixa.
   Convenção: cilíndrico NEGATIVO (receita com cil + é transposta antes). */
(function () {
  // faixa: esférico de a..b, cilíndrico de c..d (ordem tanto faz)
  function f(esfA, esfB, cilA, cilB) {
    return { esfMin: Math.min(esfA, esfB), esfMax: Math.max(esfA, esfB),
             cilMin: Math.min(cilA, cilB), cilMax: Math.max(cilA, cilB) };
  }
  // tratamentos que a cliente escolhe
  const TRATAMENTOS = [
    { id: 'antirreflexo', nome: 'Antirreflexo', desc: 'Menos reflexo e brilho. O básico bem feito.' },
    { id: 'blue', nome: 'Filtro de luz azul', desc: 'Pra quem passa o dia no celular e no computador.' },
    { id: 'foto', nome: 'Fotossensível', desc: 'Escurece no sol e clareia dentro de casa.' },
    { id: 'foto_blue', nome: 'Fotossensível + luz azul', desc: 'Escurece no sol e filtra a luz das telas.' },
    { id: 'basica', nome: 'Básica antirrisco', desc: 'Sem antirreflexo. Pode ser tingida (lente colorida).' }
  ];

  const MAIS_POS = f(0.25, 6, 0, -4);       // +0,25 a +6,00 | cil até -4,00
  const MAGRINI = [
    { id: 'h156-ar-verde', trat: 'antirreflexo', indice: '1.56', nome: 'Haytek 1.56 com Antirreflexo (reflexo verde)',
      faixas: [MAIS_POS, f(0, -6, -2.25, -4), f(0, -6, 0, -2)] },
    { id: 'h156-fa-verde', trat: 'blue', indice: '1.56', nome: 'Haytek 1.56 Filtro Azul com Antirreflexo (reflexo verde)',
      faixas: [MAIS_POS, f(0, -6, 0, -4)] },
    { id: 'h156-sc-fa-verde', trat: 'blue', indice: '1.56', nome: 'Haytek 1.56 Super Cilindro Filtro Azul com Antirreflexo (reflexo verde)',
      faixas: [f(0, -6, -4.25, -6)] },
    { id: 'h156-fa-azul', trat: 'blue', indice: '1.56', nome: 'Haytek 1.56 Filtro Azul com Antirreflexo (reflexo azul)',
      faixas: [f(0.25, 4, 0, -4), f(0, -4, 0, -4)] },
    { id: 'h156-foto-verde', trat: 'foto', indice: '1.56', nome: 'Haytek 1.56 Fotossensível com Antirreflexo (reflexo verde)',
      faixas: [f(0.25, 4, 0, -4), f(0, -4, 0, -4)] },
    { id: 'h156-fa-foto-azul', trat: 'foto_blue', indice: '1.56', nome: 'Haytek 1.56 Filtro Azul Fotossensível com Antirreflexo (reflexo azul)',
      faixas: [f(0.25, 4, 0, -4), f(0, -4, 0, -4)] },
    { id: 'h159-poli-tingivel', trat: 'basica', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato Antirrisco Tingível',
      faixas: [MAIS_POS, f(0, -6, 0, -4)] },
    { id: 'h159-poli-ar-verde', trat: 'antirreflexo', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato com Antirreflexo (reflexo verde)',
      faixas: [MAIS_POS, f(0, -6, 0, -4)] },
    { id: 'h159-poli-fa-verde', trat: 'blue', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato Filtro Azul com Antirreflexo (reflexo verde)',
      faixas: [MAIS_POS, f(0, -6, 0, -4)] },
    { id: 'h159-poli-fa-azul', trat: 'blue', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato Filtro Azul com Antirreflexo (reflexo azul)',
      faixas: [MAIS_POS, f(0, -6, 0, -4)] },
    { id: 'h159-poli-foto-verde', trat: 'foto', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato Fotossensível com Antirreflexo (reflexo verde)',
      faixas: [f(0.25, 4, 0, -4), f(0, -4, 0, -4)] },
    { id: 'h159-poli-fa-foto-azul', trat: 'foto_blue', indice: '1.59 Poli', nome: 'Haytek 1.59 Policarbonato Filtro Azul Fotossensível com Antirreflexo (reflexo azul)',
      faixas: [f(0.25, 4, 0, -4), f(0, -4, 0, -4)] },
    { id: 'h161-ar-verde', trat: 'antirreflexo', indice: '1.61', nome: 'Haytek 1.61 com Antirreflexo (reflexo verde)',
      faixas: [f(0.25, 4, 0, -4), f(0, -6, 0, -4)] },
    { id: 'h161-fa-azul', trat: 'blue', indice: '1.61', nome: 'Haytek 1.61 Filtro Azul com Antirreflexo (reflexo azul)',
      faixas: [f(0.25, 4, 0, -4), f(0, -6, 0, -4)] }
  ];
  // 1.67 asférica: mesma grade nas 4 versões
  const G167 = [f(0.25, 6, 0, -4), f(0, -8, 0, -4), f(-8.25, -10, 0, -3)];
  [['h167-ar-verde', 'antirreflexo', 'com Antirreflexo (reflexo verde)'],
   ['h167-fa-verde', 'blue', 'Filtro Azul com Antirreflexo Super-hidrofóbico (reflexo verde)'],
   ['h167-fa-azul', 'blue', 'Filtro Azul com Antirreflexo Super-hidrofóbico (reflexo azul)'],
   ['h167-foto-verde', 'foto', 'Fotossensível com Antirreflexo Super-hidrofóbico (reflexo verde)']
  ].forEach(([id, trat, resto]) => MAGRINI.push({ id, trat, indice: '1.67', nome: 'Haytek 1.67 Asférica ' + resto, faixas: G167 }));
  MAGRINI.push({ id: 'h174-fa-verde', trat: 'blue', indice: '1.74', nome: 'Haytek 1.74 Asférica Filtro Azul com Antirreflexo Super-hidrofóbico (reflexo verde)',
    faixas: [f(-10.25, -13, 0, -2), f(-13.25, -15, 0, 0), f(-6.25, -10, 0, -3), f(-1, -6, 0, -3)] });
  // preço: null = a ótica passa o valor na conversa. Preencher quando a loja mandar.
  MAGRINI.forEach(l => { if (l.preco === undefined) l.preco = null; });

  const LENTES_POR_LOJA = { oticasprimemagrini: MAGRINI };
  const ORDEM_INDICE = { '1.56': 1, '1.59 Poli': 2, '1.61': 3, '1.67': 4, '1.74': 5 };

  // receita com cilíndrico positivo -> forma negativa (mesma lente, outra escrita)
  function transpoe(esf, cil) {
    esf = Number(esf) || 0; cil = Number(cil) || 0;
    return cil > 0 ? { esf: esf + cil, cil: -cil } : { esf, cil };
  }
  function olhoCabe(lente, esf, cil) {
    const o = transpoe(esf, cil);
    return lente.faixas.some(x => o.esf >= x.esfMin - 1e-9 && o.esf <= x.esfMax + 1e-9 &&
                                  o.cil >= x.cilMin - 1e-9 && o.cil <= x.cilMax + 1e-9);
  }
  function cabe(lente, r) {
    return olhoCabe(lente, r.odEsf, r.odCil) && olhoCabe(lente, r.oeEsf, r.oeCil);
  }
  /* Lentes do tratamento escolhido que servem nos DOIS olhos, da mais simples
     (índice menor) pra mais fina. Vazio = grau fora do que a loja tem pronto. */
  function lentesQueServem(slug, trat, receita) {
    const todas = LENTES_POR_LOJA[slug] || [];
    return todas.filter(l => l.trat === trat && cabe(l, receita))
      .sort((a, b) => (ORDEM_INDICE[a.indice] || 9) - (ORDEM_INDICE[b.indice] || 9));
  }
  /* Tratamentos que têm pelo menos 1 lente pra esse grau (pra avisar antes). */
  function tratamentosQueServem(slug, receita) {
    const todas = LENTES_POR_LOJA[slug] || [];
    return TRATAMENTOS.filter(t => todas.some(l => l.trat === t.id && cabe(l, receita))).map(t => t.id);
  }

  const api = { LENTES_POR_LOJA, TRATAMENTOS, lentesQueServem, tratamentosQueServem, transpoe, cabe };
  if (typeof window !== 'undefined') window.PLLentes = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
