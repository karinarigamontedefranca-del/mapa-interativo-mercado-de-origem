/* ==========================================================
   MERCADO DE ORIGEM · Mapa interativo (simulação)
   Dados do mapa: andares, lojas, serviços e pontos de referência.
   Coordenadas no sistema 0..1000 x 0..720 (mesmo para todos os andares).
   As posições são ILUSTRATIVAS: ainda não temos a planta oficial.
   Para editar uma loja, basta alterar o objeto correspondente.
   ========================================================== */
window.MO_DATA = (function () {

  const info = {
    nome: 'Mercado de Origem',
    sub: 'Design, Gastronomia e Cultura',
    cidade: 'Belo Horizonte · MG',
    endereco: 'R. Adriano Chaves e Matos, 447 · Olhos D’Água',
    abre: 9, fecha: 19,
    numeros: [
      { v: '6', l: 'pavimentos' },
      { v: '20 mil m²', l: 'construídos' },
      { v: '350', l: 'vagas com valet' }
    ],
    instagram: 'mercadodeorigem'
  };

  /* Andares, de baixo para cima */
  const floors = [
    { id: 'g', short: 'G',  nome: 'Estacionamento', tema: 'Valet, vagas e acesso aos elevadores' },
    { id: '1', short: '1º', nome: '1º Andar & Deck', tema: 'Mercado, gastronomia, artesanato, feiras e festivais' },
    { id: '2', short: '2º', nome: '2º Andar', tema: 'Design & Decor · móveis, decoração e moda' },
    { id: '3', short: '3º', nome: '3º Andar', tema: 'Design & Decor · salões de eventos' },
    { id: 'r', short: 'R',  nome: 'Rooftop', tema: 'Eventos, ativações e experiências' }
  ];

  /* Categorias (cores derivadas do símbolo da marca) */
  const cats = {
    emporio:     { nome: 'Empórios & Sabores',     cor: '#B9801A', soft: '#F1DCAB', icon: 'basket' },
    restaurante: { nome: 'Bares & Restaurantes',   cor: '#7B2226', soft: '#E9C5BD', icon: 'utensils' },
    decor:       { nome: 'Design & Decor',         cor: '#55664A', soft: '#D2DBC4', icon: 'sofa' },
    cultura:     { nome: 'Moda, Arte & Cultura',   cor: '#9A5B38', soft: '#EBCFBB', icon: 'sparkle' },
    servicos:    { nome: 'Serviços & Bem-estar',   cor: '#4E6268', soft: '#D3DCDB', icon: 'briefcase' },
    eventos:     { nome: 'Eventos & Experiências', cor: '#2C4A2B', soft: '#A9BCA3', icon: 'calendar' },
    embreve:     { nome: 'Em breve',               cor: '#8E877C', soft: '#E8E3DA', icon: 'clock' }
  };

  /* ---------- LOJAS / ESPAÇOS ----------
     kind: 'loja' (padrão) | 'zona' (área aberta) | 'wc' (sanitários) | 'vagas'
     anchor: true  -> loja âncora (proposta do moodboard)
  */
  const T = 70, TH = 130;       // linha superior
  const B = 420, BH = 130;      // linha inferior
  const M = 255, MH = 110;      // laterais do átrio

  const units = [
    /* ===================== 1º ANDAR ===================== */
    { id: 'wc1', f: '1', kind: 'wc', x: 60, y: T, w: 50, h: TH, n: 'Sanitários' },
    { id: 'verdemar', f: '1', x: 110, y: T, w: 190, h: TH, cat: 'emporio', anchor: true,
      n: 'Verdemar', tag: 'Supermercado & padaria', img: 'verdemar',
      d: 'Supermercado e padaria com hortifrúti fresco, adega e pães de fornada: a compra do dia a dia com a qualidade que o Mercado pede.',
      kw: 'supermercado padaria pão hortifruti frutas verduras vinho mercado compras' },
    { id: 'massas', f: '1', x: 300, y: T, w: 110, h: TH, cat: 'emporio', anchor: true,
      n: 'Massas Artesanais', tag: 'Massas frescas & molhos', img: 'massas',
      d: 'Massas frescas feitas à vista, molhos da casa e produtos italianos para levar o almoço de domingo para casa.',
      kw: 'massa macarrão pasta italiana molho talharim ravioli' },
    { id: 'maturei', f: '1', x: 410, y: T, w: 90, h: TH, cat: 'emporio',
      n: 'Maturei', tag: 'Queijaria & empório', ig: 'matureiqueijariaeemporio', img: 'maturei',
      d: 'Queijaria com câmara de maturação: queijos mineiros artesanais acompanhados de perto até o ponto certo.',
      kw: 'queijo queijaria canastra maturado minas empório' },
    { id: 'comqueijo', f: '1', x: 500, y: T, w: 90, h: TH, cat: 'emporio',
      n: 'Empório Comqueijo', tag: 'Cafeteria & empório', ig: 'comqueijo', img: 'comqueijo',
      d: 'Cafeteria e empório com queijos, quitandas e petiscos mineiros. Bom lugar para um café com pão de queijo.',
      kw: 'café cafeteria queijo pão de queijo quitanda torresmo empório' },
    { id: 'nilo', f: '1', x: 590, y: T, w: 90, h: TH, cat: 'emporio',
      n: 'Charcutaria Nilo Canastra', tag: 'Empório & charcutaria', ig: 'charcutaria_nilo_canastra', img: 'nilo',
      d: 'Charcutaria de produção própria: embutidos, defumados e curados com receita da Canastra.',
      kw: 'charcutaria linguiça defumado salame carne embutido canastra' },
    { id: 'armazem', f: '1', x: 680, y: T, w: 90, h: TH, cat: 'emporio',
      n: 'Armazém a Mineira', tag: 'Empório', ig: 'armazemamineira', img: 'armazem',
      d: 'Empório com o melhor da roça: ovos caipiras, doces, cachaças, temperos e produtos de pequenos produtores.',
      kw: 'empório armazém doce de leite goiabada cachaça ovos caipira roça' },
    { id: 'petz', f: '1', x: 770, y: T, w: 170, h: TH, cat: 'servicos', anchor: true,
      n: 'Petz', tag: 'Pet shop', img: 'petz',
      d: 'Pet shop completo, com banho e tosa. O Mercado é pet friendly: há potes de água para pets espalhados pelos andares.',
      kw: 'pet cachorro gato ração banho tosa animal' },
    { id: 'smartfit', f: '1', x: 60, y: M, w: 185, h: MH, cat: 'servicos', anchor: true,
      n: 'Smart Fit', tag: 'Academia', img: 'smartfit',
      d: 'Academia com musculação e aeróbico, para encaixar o treino na rotina antes ou depois das compras.',
      kw: 'academia treino musculação ginástica fitness' },
    { id: 'contorno', f: '1', x: 755, y: M, w: 185, h: MH, cat: 'servicos', anchor: true,
      n: 'Contorno do Corpo', tag: 'Academia & estúdio', img: 'contorno',
      d: 'Estúdio de treino com acompanhamento próximo, cercado pelo verde do átrio.',
      kw: 'academia estúdio pilates treino funcional' },
    { id: 'farmacia', f: '1', x: 60, y: B, w: 110, h: BH, cat: 'servicos', anchor: true,
      n: 'Farmácia', tag: 'Saúde & bem-estar', img: 'farmacia',
      d: 'Medicamentos, dermocosméticos e cuidados do dia a dia.',
      kw: 'farmácia remédio medicamento drogaria saúde' },
    { id: 'pontes', f: '1', x: 170, y: B, w: 100, h: BH, cat: 'emporio',
      n: 'Pontes de Origem', tag: 'Produtos orgânicos', ig: 'pontesdeorigem', img: 'pontes',
      d: 'Orgânicos direto do produtor: verduras, legumes, cogumelos e cestas da estação.',
      kw: 'orgânico verdura legume feira cogumelo saudável produtor' },
    { id: 'churrasco', f: '1', x: 270, y: B, w: 90, h: BH, cat: 'emporio',
      n: 'Churrasco de Origem', tag: 'Tudo para churrasco', ig: 'churrascodeorigem',
      d: 'Cortes, carvão, temperos e acessórios: tudo o que o churrasco de fim de semana precisa.',
      kw: 'churrasco carne açougue picanha carvão espeto' },
    { id: 'severinos', f: '1', x: 360, y: B, w: 90, h: BH, cat: 'emporio',
      n: 'Picanha Severino’s', tag: 'Picanha & pimentas', ig: 'pimentaseverinos', img: 'severinos',
      d: 'Picanhas e uma coleção de pimentas para todos os níveis de coragem.',
      kw: 'picanha pimenta carne molho açougue' },
    { id: 'viana', f: '1', x: 500, y: B, w: 100, h: BH, cat: 'restaurante',
      n: 'Charcutaria Viana', tag: 'Charcutaria & restaurante', ig: 'charcutariaviana', img: 'viana',
      d: 'Charcutaria com restaurante: embutidos da casa no balcão e pratos servidos à mesa.',
      kw: 'charcutaria restaurante almoço jantar embutido' },
    { id: 'cava', f: '1', x: 600, y: B, w: 100, h: BH, cat: 'restaurante',
      n: 'Cava Zé Ribeiro', tag: 'Cachaçaria & bistrô', ig: 'cavazeribeiro', img: 'cava',
      d: 'Cachaças envelhecidas em barril e um bistrô para harmonizar. Do alambique à mesa.',
      kw: 'cachaça pinga bistrô bar alambique degustação' },
    { id: 'voolivia', f: '1', x: 700, y: B, w: 90, h: BH, cat: 'cultura',
      n: 'Vó Olívia', tag: 'Artesanato mineiro', ig: 'emporiovoolivia',
      d: 'Artesanato mineiro feito à mão: peças de cozinha, decoração e presentes com memória afetiva.',
      kw: 'artesanato presente decoração mineiro feito à mão' },
    { id: 'cadim', f: '1', x: 790, y: B, w: 70, h: BH, cat: 'cultura',
      n: 'Cadim Cultural', tag: 'Discos & cultura', ig: 'cadinhocultural', img: 'cadim',
      d: 'Discos de vinil, música e programação cultural com DJs no Mercado.',
      kw: 'disco vinil música dj cultura' },
    { id: 'correios', f: '1', x: 860, y: B, w: 40, h: BH, cat: 'servicos',
      n: 'Correios', tag: 'Agência', ig: 'correiosoficial',
      d: 'Agência dos Correios para envios e retiradas sem sair do Mercado.',
      kw: 'correio envio encomenda carta sedex' },
    { id: 'sicoob', f: '1', x: 900, y: B, w: 40, h: BH, cat: 'servicos',
      n: 'Sicoob', tag: 'Agência & caixa', ig: 'sicoob',
      d: 'Agência da cooperativa de crédito, com caixa de autoatendimento.',
      kw: 'banco caixa eletrônico dinheiro saque agência' },

    /* ---- DECK ---- */
    { id: 'pingaefrita', f: '1', x: 120, y: 612, w: 115, h: 78, cat: 'restaurante', deck: true,
      n: 'Pinga e Frita', tag: 'Bar & restaurante', ig: 'pingaefrita', img: 'pingaefrita',
      d: 'Boteco mineiro de raiz no deck: petiscos, pratos para dividir e cachaça gelada.',
      kw: 'bar boteco petisco cachaça almoço happy hour cerveja' },
    { id: 'bistrohome', f: '1', x: 235, y: 612, w: 105, h: 78, cat: 'restaurante', deck: true,
      n: 'Bistrô Home', tag: 'Pizzas & bistrô', ig: 'pizzas_gourmet_bistro', img: 'bistrohome',
      d: 'Pizzas e pratos de bistrô para almoço e jantar ao ar livre.',
      kw: 'pizza bistrô restaurante jantar almoço' },
    { id: 'teilen', f: '1', x: 340, y: 612, w: 105, h: 78, cat: 'restaurante', deck: true,
      n: 'Cervejaria Teilen', tag: 'Cervejaria artesanal', ig: 'cervejariateilen',
      d: 'Cervejas artesanais na torneira para o happy hour no deck.',
      kw: 'cerveja chope cervejaria artesanal bar happy hour' },
    { id: 'pescador', f: '1', x: 445, y: 612, w: 115, h: 78, cat: 'restaurante', deck: true,
      n: 'O Pescador', tag: 'Peixes & frutos do mar', ig: 'pescador_bh', img: 'pescador',
      d: 'Moquecas, peixes e frutos do mar servidos na panela de barro.',
      kw: 'peixe frutos do mar moqueca camarão restaurante almoço' },
    { id: 'feiras', f: '1', x: 590, y: 600, w: 290, h: 90, kind: 'zona', cat: 'eventos', deck: true,
      n: 'Área de Feiras & Festivais', tag: 'Deck · programação especial', img: 'atrio',
      d: 'Espaço do deck que recebe feiras, festivais e expositores convidados ao longo do ano.',
      kw: 'feira festival evento expositor artesanato' },

    /* ===================== 2º ANDAR ===================== */
    { id: 'doimo', f: '2', x: 60, y: T, w: 560, h: TH, cat: 'decor', anchor: true,
      n: 'Doimo', tag: 'Showroom de mobiliário', ig: 'doimoconceitobh', img: 'doimo',
      d: 'Âncora do Mercado: um showroom vivo de mobiliário e design, referência para arquitetos, designers e quem está montando a casa.',
      kw: 'móveis sofá decoração design mobiliário arquitetura casa' },
    { id: 'kokemada', f: '2', x: 620, y: T, w: 160, h: TH, cat: 'decor',
      n: 'Kokemada', tag: 'Plantas & paisagismo', ig: 'minimundobh',
      d: 'Plantas, vasos e pequenos jardins para trazer o verde do Mercado para dentro de casa.',
      kw: 'planta vaso jardim paisagismo suculenta verde' },
    { id: 'eb21', f: '2', x: 780, y: T, w: 160, h: TH, cat: 'embreve', n: 'Em breve', tag: 'Nova operação · Design & Decor' },
    { id: 'wc2', f: '2', kind: 'wc', x: 60, y: M, w: 185, h: MH, n: 'Sanitários' },
    { id: 'museu', f: '2', x: 755, y: M, w: 185, h: MH, cat: 'cultura',
      n: 'Museu das Reduções', tag: 'Museu de miniaturas', ig: 'museudasreducoes',
      d: 'Miniaturas que contam a história e a arquitetura de Minas em escala reduzida. Ótimo programa para as crianças.',
      kw: 'museu miniatura cultura história passeio criança' },
    { id: 'floresca', f: '2', x: 60, y: B, w: 120, h: BH, cat: 'cultura',
      n: 'Floresça', tag: 'Moda feminina', ig: 'floresca_conceito',
      d: 'Moda feminina autoral, com peças leves e cheias de personalidade.',
      kw: 'roupa moda feminina vestido loja' },
    { id: 'todapatty', f: '2', x: 180, y: B, w: 110, h: BH, cat: 'cultura',
      n: 'Toda Patty', tag: 'Semijoias & acessórios', ig: 'todapattysemijoiaseacessorios',
      d: 'Semijoias e acessórios para presentear ou completar o look.',
      kw: 'semijoia brinco colar acessório presente joia' },
    { id: 'supercolor', f: '2', x: 290, y: B, w: 120, h: BH, cat: 'decor',
      n: 'Super Color', tag: 'Estamparia', ig: 'lojasupercolor',
      d: 'Estamparia e personalização em tecidos para casa, eventos e marcas.',
      kw: 'estamparia tecido personalizado estampa camiseta' },
    { id: 'vemproride', f: '2', x: 410, y: B, w: 150, h: BH, cat: 'servicos',
      n: 'Vem Pro Ride', tag: 'Agência de motos', ig: 'vemproride',
      d: 'Agência de viagens e passeios de moto: roteiros, encontros e a comunidade de motociclistas.',
      kw: 'moto motocicleta viagem passeio rota' },
    { id: 'eb22', f: '2', x: 560, y: B, w: 130, h: BH, cat: 'embreve', n: 'Em breve', tag: 'Nova operação · Design & Decor' },
    { id: 'kids', f: '2', x: 690, y: B, w: 250, h: BH, cat: 'servicos',
      n: 'Espaço Kids', tag: 'Aventura Kids', ig: 'espaco.aventurakidsbh',
      d: 'Espaço de brincar para as crianças enquanto a família aproveita o Mercado.',
      kw: 'criança kids brinquedoteca infantil brincar festa' },

    /* ===================== 3º ANDAR ===================== */
    { id: 'outlet', f: '3', x: 60, y: T, w: 300, h: TH, cat: 'decor',
      n: 'Outlet de Móveis', tag: 'Móveis com preço de outlet', ig: 'outletdemoveisbh',
      d: 'Móveis e peças de decoração com condições especiais de outlet.',
      kw: 'móveis outlet promoção sofá mesa cadeira decoração' },
    { id: 'eb31', f: '3', x: 360, y: T, w: 200, h: TH, cat: 'embreve', n: 'Em breve', tag: 'Nova operação · Design & Decor' },
    { id: 'eb32', f: '3', x: 560, y: T, w: 180, h: TH, cat: 'embreve', n: 'Em breve', tag: 'Nova operação · Design & Decor' },
    { id: 'mfw', f: '3', x: 740, y: T, w: 200, h: TH, cat: 'cultura',
      n: 'Minas Fashion Week', tag: 'Moda & desfiles', ig: 'minasfashionweekoficial',
      d: 'Espaço da Minas Fashion Week, plataforma de moda mineira com desfiles e ativações.',
      kw: 'moda desfile fashion estilista' },
    { id: 'wc3', f: '3', kind: 'wc', x: 60, y: M, w: 185, h: MH, n: 'Sanitários' },
    { id: 'hotel', f: '3', x: 755, y: M, w: 185, h: MH, cat: 'servicos',
      n: 'Hotel Fazenda Paciência', tag: 'Hospedagem', ig: 'hotelfazendapaciencia',
      d: 'Ponto de atendimento do Hotel Fazenda Paciência, para planejar a próxima escapada pelo interior de Minas.',
      kw: 'hotel fazenda hospedagem viagem férias' },
    { id: 'mallard', f: '3', x: 60, y: B, w: 300, h: BH, cat: 'eventos',
      n: 'Mallard Recepções', tag: 'Salão & buffet', ig: 'mallardorigem',
      d: 'Salão de festas e buffet para casamentos, aniversários e eventos corporativos.',
      kw: 'festa salão buffet casamento aniversário evento' },
    { id: 'mandacaru', f: '3', x: 360, y: B, w: 300, h: BH, cat: 'eventos',
      n: 'Mandacaru', tag: 'Restaurante · salão & buffet', ig: 'mandacaruorigem',
      d: 'Restaurante e salão para eventos, com buffet e cozinha regional.',
      kw: 'restaurante buffet salão evento festa almoço' },
    { id: 'fabrica', f: '3', x: 660, y: B, w: 140, h: BH, cat: 'eventos',
      n: 'A Fábrica Criativa', tag: 'Eventos', ig: 'afabricacriativa',
      d: 'Produção e cenografia de eventos com criatividade e cuidado nos detalhes.',
      kw: 'evento festa cenografia decoração produção' },
    { id: 'casadosol', f: '3', x: 800, y: B, w: 140, h: BH, cat: 'eventos',
      n: 'Casa do Sol', tag: 'Eventos', ig: 'casadosolorigem',
      d: 'Espaço para celebrações intimistas, encontros e eventos sociais.',
      kw: 'evento festa celebração encontro' },

    /* ===================== ROOFTOP ===================== */
    { id: 'palco', f: 'r', x: 60, y: T, w: 180, h: 480, kind: 'zona', cat: 'eventos',
      n: 'Palco', tag: 'Shows & apresentações', img: 'rooftop',
      d: 'Palco do rooftop para shows, apresentações e festas com vista para a cidade.',
      kw: 'show palco música apresentação festa' },
    { id: 'arena', f: 'r', x: 240, y: T, w: 470, h: 480, kind: 'zona', cat: 'eventos', under: true,
      n: 'Arena de Eventos', tag: 'Teto retrátil', img: 'rooftop2',
      d: 'Área panorâmica com teto retrátil para eventos, ativações de marca e experiências, faça sol ou chuva.',
      kw: 'evento rooftop festa ativação experiência teto retrátil' },
    { id: 'bar', f: 'r', x: 710, y: T, w: 230, h: TH, cat: 'restaurante',
      n: 'Bar do Rooftop', tag: 'Drinks & petiscos', img: 'hero',
      d: 'Bar de apoio aos eventos do rooftop, com drinks e petiscos.',
      kw: 'bar drink coquetel bebida rooftop' },
    { id: 'wcr', f: 'r', kind: 'wc', x: 755, y: M, w: 185, h: MH, n: 'Sanitários' },
    { id: 'mirante', f: 'r', x: 710, y: B, w: 230, h: BH, kind: 'zona', cat: 'eventos',
      n: 'Mirante', tag: 'Vista panorâmica', img: 'fachada',
      d: 'O ponto mais alto do Mercado, com vista para o eixo da BR-040 e o pôr do sol.',
      kw: 'mirante vista pôr do sol foto' },

    /* ===================== ESTACIONAMENTO ===================== */
    { id: 'vagas1', f: 'g', kind: 'vagas', x: 60, y: T, w: 880, h: TH, n: 'Vagas' },
    { id: 'vagas2', f: 'g', kind: 'vagas', x: 60, y: B, w: 880, h: BH, n: 'Vagas' },
    { id: 'valet', f: 'g', x: 60, y: M, w: 185, h: MH, cat: 'servicos',
      n: 'Valet & Recepção', tag: 'Atendimento ao cliente', img: 'fachadadia',
      d: 'Deixe o carro com o valet e suba direto pelos elevadores. São 350 vagas próprias.',
      kw: 'valet estacionamento carro vaga manobrista' },
    { id: 'pcd', f: 'g', x: 755, y: M, w: 185, h: MH, cat: 'servicos',
      n: 'Vagas PCD & 60+', tag: 'Vagas preferenciais', d: 'Vagas preferenciais próximas aos elevadores.',
      kw: 'vaga pcd idoso preferencial deficiente' }
  ];

  /* ---------- SERVIÇOS DO PRÉDIO (ícones) ---------- */
  const amenTypes = {
    wc:         { nome: 'Sanitários',            icon: 'wc' },
    pcd:        { nome: 'Sanitário acessível',   icon: 'wheelchair' },
    fraldario:  { nome: 'Fraldário',             icon: 'baby' },
    bebedouro:  { nome: 'Bebedouro',             icon: 'drop' },
    pet:        { nome: 'Água para pets',        icon: 'paw' },
    elevador:   { nome: 'Elevadores',            icon: 'elevator' },
    escada:     { nome: 'Escadaria central',     icon: 'stairs' },
    entrada:    { nome: 'Entrada',               icon: 'door' },
    valet:      { nome: 'Valet',                 icon: 'car' }
  };

  const amen = [];
  const add = (f, t, x, y, extra) => amen.push(Object.assign({ f, t, x, y }, extra || {}));
  ['g', '1', '2', '3', 'r'].forEach(f => { add(f, 'elevador', 670, 310); add(f, 'escada', 500, 310); });
  // 1º andar
  add('1', 'wc', 85, 100); add('1', 'pcd', 85, 135); add('1', 'fraldario', 85, 170);
  add('1', 'bebedouro', 300, 390); add('1', 'bebedouro', 710, 230);
  add('1', 'pet', 930, 230); add('1', 'pet', 880, 590);
  add('1', 'entrada', 40, 230, { label: 'Entrada principal' });
  add('1', 'entrada', 480, 560, { label: 'Acesso ao deck' });
  // 2º e 3º
  ['2', '3'].forEach(f => {
    add(f, 'wc', 110, 310); add(f, 'pcd', 152, 310); add(f, 'fraldario', 194, 310);
    add(f, 'bebedouro', 300, 390); add(f, 'pet', 710, 230);
  });
  // rooftop
  add('r', 'wc', 805, 310); add('r', 'pcd', 847, 310); add('r', 'fraldario', 889, 310);
  add('r', 'bebedouro', 730, 390); add('r', 'pet', 300, 230);
  // estacionamento
  add('g', 'entrada', 40, 230, { label: 'Entrada de veículos' });
  add('g', 'valet', 220, 285);

  /* ---------- PONTOS DE REFERÊNCIA ---------- */
  const refs = [
    { id: 'torre', f: '1', x: 33, y: 104, icon: 'tower', n: 'Torre do Relógio', img: 'fachada',
      d: 'A torre do relógio marca a fachada do Mercado e é a primeira referência de quem chega. A entrada principal fica logo ao lado.' },
    { id: 'jardim', f: '1', x: 390, y: 310, icon: 'leaf', n: 'Praça do Jardim', img: 'atrio',
      d: 'O coração do Mercado: mesas sob o átrio, com o jardim vertical descendo de todos os andares. O ponto de encontro mais fácil de combinar.' },
    { id: 'jardim2', f: '2', x: 390, y: 310, icon: 'leaf', n: 'Jardim Vertical', img: 'galeria',
      d: 'Do guarda-corpo dá para ver o jardim vertical e a praça lá embaixo. Use as passarelas para cruzar o átrio.' },
    { id: 'jardim3', f: '3', x: 390, y: 310, icon: 'leaf', n: 'Jardim Vertical', img: 'rodape',
      d: 'Vista do alto do átrio, com o verde pendente e a claraboia logo acima.' },
    { id: 'deck', f: '1', x: 900, y: 655, icon: 'sun', n: 'Deck & Pergolado', img: 'atrio',
      d: 'Área ao ar livre com mesas, restaurantes e a área de feiras. Acesso pela passagem central do 1º andar.' },
    { id: 'claraboia', f: 'r', x: 390, y: 310, icon: 'sun', n: 'Claraboia do Átrio', img: 'galeria',
      d: 'A claraboia ilumina o átrio de cima a baixo. Em volta dela fica a arena com teto retrátil.' }
  ];

  /* ---------- TOTENS (onde o visitante está) ----------
     Use ?totem=t2 na URL para indicar em qual totem a tela está instalada. */
  const totems = {
    t1: { f: '1', x: 80, y: 230, n: 'Entrada principal' },
    t2: { f: '2', x: 560, y: 230, n: 'Hall do 2º andar' },
    t3: { f: '3', x: 560, y: 230, n: 'Hall do 3º andar' },
    tr: { f: 'r', x: 620, y: 230, n: 'Chegada ao rooftop' },
    tg: { f: 'g', x: 300, y: 230, n: 'Estacionamento' }
  };

  /* ---------- CORREDORES (rede de caminhos para as rotas) ---------- */
  const corridors = {
    base: [
      [[60, 230], [940, 230]],      // corredor norte
      [[60, 390], [940, 390]],      // corredor sul
      [[270, 230], [270, 390]],     // lateral oeste
      [[730, 230], [730, 390]],     // lateral leste
      [[500, 230], [500, 390]],     // passarela / escadaria central
      [[670, 310], [730, 310]]      // elevadores
    ],
    '1': [
      [[480, 390], [480, 590]],     // passagem para o deck
      [[110, 590], [890, 590]]      // deck
    ]
  };

  const elevator = { x: 670, y: 310 };

  return { info, floors, cats, units, amenTypes, amen, refs, totems, corridors, elevator };
})();
