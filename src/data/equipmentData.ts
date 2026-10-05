import { EquipmentItem, HotspotItem } from '../types/archviz';

export const EQUIPMENT_LIST: EquipmentItem[] = [
  {
    id: 'bin_1000l_1',
    name: 'Bin Farmacêutico 1000L em Aço Inox AISI 316L (#1)',
    category: 'Processamento & Armazenamento Sanitário',
    description: 'Contêiner intermediário para sólidos (IBC 1000L tipo Canaan) com geometria prismática de cantos arredondados, acabamento espelhado eletropolido Ra < 0.4 µm. Equipado com válvula borboleta sanitária Tri-Clamp de descarga inferior, escotilha de inspeção superior de 450mm com clamp sanitário, visor de nível em policarbonato graduado, alças frontais ergonômicas, munhões laterais para elevação e chassi tubular com 4 rodízios giratórios em poliuretano com freio.',
    dimensions: {
      width: 1.15,
      depth: 1.15,
      height: 1.95,
    },
    material: 'Aço Inoxidável AISI 316L (partes em contato) e AISI 304 (estrutura)',
    normative: 'Conforme cGMP, FDA 21 CFR, ASME BPE e RDC 658 ANVISA',
    features: [
      'Capacidade nominal: 1000 Litros',
      'Funil cônico inferior com inclinação de 60° para escoamento total sem retenção',
      'Visor de nível graduado para acompanhamento de volume',
      'Escotilha superior estanque com anel clamp e vedação de silicone farmacêutico',
      'Alças ergonômicas de movimentação e munhões de tombamento',
      'Base móvel com 4 rodízios industriais giratórios em poliuretano de alta carga com freio'
    ],
    operationalRole: 'Posicionado na demarcada Área de Lavagem de Bins, isolado e desimpedido para ciclos de limpeza CIP/WIP e sanitização contínua.'
  },
  {
    id: 'bin_1000l_2',
    name: 'Bin Farmacêutico 1000L em Aço Inox AISI 316L (#2)',
    category: 'Processamento & Armazenamento Sanitário',
    description: 'Segundo contêiner IBC idêntico de 1000 Litros posicionado na baia contígua de lavagem, operando em rodízio contínuo para manter o fluxo asséptico da fábrica sem interrupção de produção.',
    dimensions: {
      width: 1.15,
      depth: 1.15,
      height: 1.95,
    },
    material: 'Aço Inoxidável AISI 316L polido espelhado (Ra < 0.4 µm)',
    normative: 'Conforme cGMP / ASME BPE / ANVISA',
    features: [
      'Válvula sanitária de descarga tipo borboleta com engate rápido Tri-Clamp',
      'Geometria interna sem cantos vivos para evitar contaminação cruzada',
      'Chassi sanitário reforçado com cantoneiras de travamento e rodízios'
    ],
    operationalRole: 'Higienização e secagem em paralelo na baia dedicada de lavagem.'
  },
  {
    id: 'overhead_piping',
    name: 'Instalações e Tubulações Sanitárias Aéreas (Água & Ar)',
    category: 'Utilidades & Alimentação de Lavagem',
    description: 'Sistema aéreo suspenso de utilidades sanitárias instalado sob o forro diretamente acima dos Bins 1000L. Composto por tubos em aço inox AISI 316L polido com curvas suaves de 90°, suportes pendurais Unistrut, linha de Água de Lavagem (com válvulas de esfera e mangueira espiralada com pistola sanitária de alta pressão) e linha de Ar Comprimido filtrado (com regulador de pressão e manômetro analógico com mostrador e ponteiro).',
    dimensions: {
      width: 3.20,
      depth: 0.50,
      height: 0.85,
    },
    material: 'Tubulação em Aço Inox AISI 316L com conexões sanitárias Tri-Clamp (TC)',
    normative: 'ASME BPE, ISO 8573-1 (Pureza do Ar Comprimido) e ANVISA',
    features: [
      'Curvas suaves de 90° e abraçadeiras fixadas em perfil Unistrut sanitário',
      'Duas descidas verticais independentes com válvulas sanitárias de alavanca',
      'Regulador de pressão pneumático com manômetro analógico de precisão',
      'Mangueira espiralada suspensa com pistola sanitária de lavagem de alta pressão'
    ],
    operationalRole: 'Alimenta os ciclos manuais e automatizados de lavagem CIP e secagem pós-limpeza dos Bins.'
  },
  {
    id: 'floor_drain',
    name: 'Canaleta Linear de Drenagem Sanitária em Aço Inox',
    category: 'Drenagem & Efluentes Hospitalares',
    description: 'Sistema de drenagem linear embutido no piso epóxi logo abaixo da área dos Bins 1000L. Fabricado integralmente em aço inox AISI 304 com grelha perfurada removível antiderrapante, cesto coletor interno e declividade interna de 1% para escoamento instantâneo da água residuária da lavagem, impedindo acúmulo de poças.',
    dimensions: {
      width: 0.28,
      depth: 3.20,
      height: 0.12,
    },
    material: 'Aço Inoxidável AISI 304 escovado antiderrapante',
    normative: 'RDC 50 ANVISA, ABNT NBR 8160 e diretrizes GMP de drenagem',
    features: [
      'Grelha linear perfurada removível com travamento anti-tombamento',
      'Declividade de fluxo interno e conexão direta com caixa sifonada sanitária',
      'Nivelamento milimétrico em relação ao piso epóxi com vedação em poliuretano'
    ],
    operationalRole: 'Captação e escoamento imediato de toda a água de enxágue dos Bins sem molhar os corredores da sala.'
  },
  {
    id: 'demarcation_counter_right',
    name: 'Faixa Amarela: Lateral da Bancada',
    category: 'Demarcações do Piso & Segurança',
    description: 'Faixa amarela de segurança de 8cm em poliuretano acetinado demarcando a lateral direita da bancada de mármore e a transição para a bateria de armários da sala limpa.',
    dimensions: {
      width: 0.08,
      depth: 1.24,
      height: 0.003,
    },
    material: 'Pintura Poliuretânica de alta resistência amarelo segurança (RAL 1023)',
    normative: 'RDC 658 ANVISA e NR-26 (Sinalização de Segurança)',
    features: [
      'Delimitação da área de operação lateral da bancada',
      'Faixa individual independente destacável e editável em tempo real'
    ],
    operationalRole: 'Sinalização visual da zona de acesso lateral da bancada.'
  },
  {
    id: 'demarcation_counter_front',
    name: 'Faixa Amarela: Frontal da Bancada',
    category: 'Demarcações do Piso & Segurança',
    description: 'Faixa amarela de segurança de 8cm em poliuretano acetinado com 3,23m de comprimento contínuo ao longo da frente da bancada de mármore de 3 metros.',
    dimensions: {
      width: 3.23,
      depth: 0.08,
      height: 0.003,
    },
    material: 'Pintura Poliuretânica de alta resistência amarelo segurança (RAL 1023)',
    normative: 'RDC 658 ANVISA e NR-26 (Sinalização de Segurança)',
    features: [
      'Delimitação da área frontal da bancada e cuba profunda de lavagem',
      'Faixa individual independente destacável e editável em tempo real'
    ],
    operationalRole: 'Sinalização visual da área de trabalho do operador na bancada.'
  },
  {
    id: 'demarcation_bay_divider',
    name: 'Faixa Amarela: Divisória Baia dos Bins',
    category: 'Demarcações do Piso & Segurança',
    description: 'Faixa longitudinal amarela de segurança de 8cm com 2,80m de extensão separando a baia de lavagem dos Bins 1000L da circulação central da sala limpa.',
    dimensions: {
      width: 0.08,
      depth: 2.80,
      height: 0.003,
    },
    material: 'Pintura Poliuretânica de alta resistência amarelo segurança (RAL 1023)',
    normative: 'RDC 658 ANVISA e NR-26 (Sinalização de Segurança)',
    features: [
      'Separação entre zona úmida de lavagem dos Bins e zona de circulação',
      'Faixa individual independente destacável e editável em tempo real'
    ],
    operationalRole: 'Delimita a área molhada dos Bins impedindo invasão de tráfego.'
  },
  {
    id: 'demarcation_front_corridor',
    name: 'Faixa Amarela: Corredor da Porta',
    category: 'Demarcações do Piso & Segurança',
    description: 'Faixa amarela de segurança de 8cm com 1,50m de extensão na frente da sala orientando o fluxo de entrada e saída pela porta de 3,50m.',
    dimensions: {
      width: 1.50,
      depth: 0.08,
      height: 0.003,
    },
    material: 'Pintura Poliuretânica de alta resistência amarelo segurança (RAL 1023)',
    normative: 'RDC 658 ANVISA e NR-26 (Sinalização de Segurança)',
    features: [
      'Orientação do fluxo de pedestres e entrada dos Bins 1000L',
      'Faixa individual independente destacável e editável em tempo real'
    ],
    operationalRole: 'Canalização do tráfego limpo a partir da porta deslizante.'
  },
  {
    id: 'platform_stairs',
    name: 'Escada Plataforma Móvel em Aço Inox para Lavagem de Bins',
    category: 'Acesso & Operação de Higienização',
    description: 'Plataforma industrial móvel de elevação fabricada inteiramente em aço inox tubular AISI 304. Possui 4 degraus largos antiderrapantes perfurados, guarda-corpos duplos laterais de segurança a 1.10m com rodapé sanitário, sapatas com freio e plataforma superior nivelada a 1.38m do chão.',
    dimensions: {
      width: 0.90,
      depth: 1.65,
      height: 2.35,
    },
    material: 'Aço Inoxidável AISI 304 escovado sanitário Scotch-Brite',
    normative: 'NR-12, NR-35 e padrões sanitários para salas limpas',
    features: [
      'Nivelamento superior ideal para acesso à escotilha superior do Bin de 1000L',
      'Guarda-corpo perimetral integral com rodapé de segurança de 10cm',
      'Degraus em chapa perfurada antiderrapante anti-acúmulo de líquidos',
      'Posicionamento livre ao lado dos bins para operação ergonômica'
    ],
    operationalRole: 'Permite ao operador subir com total ergonomia e segurança para abrir a escotilha superior e higienizar internamente os Bins de 1000L.'
  },
  {
    id: 'marble_counter_sink',
    name: 'Bancada de Mármore 3,00m com Cuba Profunda e Torneira Central',
    category: 'Área de Trabalho & Lavagem Hospitalar',
    description: 'Bancada sanitária de 3,00 metros de largura com tampo em pedra nobre de mármore e acabamento polido vitrificado (clearcoat: 0.8), frontão/espelho de parede alto de 15cm contra respingos. Possui cuba central embutida extra profunda (40cm de profundidade) em aço inox AISI 316L com ralo tipo cesto removível, torneira hospitalar centralizada de bica alta com alavanca longa médica de cotovelo, e 6 portas inferiores modulares organizadoras com puxadores sanitários.',
    dimensions: {
      width: 3.00,
      depth: 0.72,
      height: 0.88,
    },
    material: 'Tampo em Mármore Nobre (Clearcoat 0.8) + Cuba Profunda Inox AISI 316L + Gabinete Modular',
    normative: 'RDC 50 ANVISA (Estabelecimentos de Saúde), ABNT NBR e ISO 14644',
    features: [
      'Bancada otimizada com 3,00 metros de extensão frontal',
      'Cuba central extra profunda (40cm) com bordas anti-respingos para imersão e lavagem',
      'Torneira hospitalar de bica alta orientada para o centro com alavancas duplas de cotovelo',
      '6 portas frontais inferiores com puxadores ergonômicos e rodapé sanitário recuado cGMP'
    ],
    operationalRole: 'Lavagem de instrumentais, higienização de conexões e componentes dos Bins 1000L com cuba de alta capacidade.'
  },
  {
    id: 'shelving_units',
    name: 'Armário Sanitário de Canto para Sala Limpa',
    category: 'Armazenamento & Vestiário Sanitário',
    description: 'Armário/locker de canto com 2 portas em azul hospitalar (RAL 5005) e corpo sanitário com teto inclinado a 45° anti-acúmulo de partículas cGMP. Otimizado para o canto traseiro direito, mantendo a parede lateral totalmente desimpedida e limpa.',
    dimensions: {
      width: 0.95,
      depth: 0.52,
      height: 2.25,
    },
    material: 'Chapa de aço com pintura eletrostática a pó antibacteriana e portas azuis em laminado de alta pressão',
    normative: 'Conforme GMP / cGMP e ISO 14644 (Salas Limpas)',
    features: [
      'Teto inclinado sanitário a 45° que impede deposição de poeira per cGMP',
      'Puxadores ergonômicos cromados e venezianas de ventilação inferior',
      'Porta-etiquetas identificadores de conteúdo estéril',
      'Parede lateral livre para circulação operacional desimpedida'
    ],
    operationalRole: 'Armazenamento seguro e organizado de embalagens, reagentes, EPIs e acessórios higienizados sem interferir na área dos Bins.'
  },
  {
    id: 'sliding_door',
    name: 'Porta de Correr Automatizada Hermética para Sala Limpa (3,50m)',
    category: 'Controle de Acesso & Pressurização',
    description: 'Sistema de porta deslizante hospitalar de vão ampliado de 3,50 metros com trilho aéreo em alumínio anodizado. Folhas duplas herméticas revestidas em laminado antibacteriano com visores de vidro duplo flush.',
    dimensions: {
      width: 3.50,
      depth: 0.12,
      height: 2.40,
    },
    material: 'Alumínio anodizado, painel estanque e gaxetas de vedação hermética',
    normative: 'Controle de fluxo de pressão diferencial ISO 14644',
    features: [
      'Vão livre de 3,50 metros permitindo passagem confortável dos Bins de 1000L',
      'Visores de vidro duplo laminado com cantos arredondados',
      'Comando interativo de abertura e fechamento das folhas duplas'
    ],
    operationalRole: 'Entrada e saída de equipamentos de grande porte como os Bins 1000L mantendo a integridade da sala limpa.'
  },
  {
    id: 'bumper_rail_left',
    name: 'Bate-Rodas Inox Tubular (Parede Esquerda)',
    category: 'Proteção & Rodapé Sanitário',
    description: 'Bate-rodas sanitário tubular duplo fabricado em aço inoxidável AISI 304/316L com acabamento escovado higiênico. Instalado na parede esquerda (baia dos Bins 1000L) com pilaretes de fixação e canoplas vedadas ao piso, protegendo os painéis contra choques de carrinhos e rodízios.',
    dimensions: {
      width: 0.16,
      depth: 4.10,
      height: 0.12,
    },
    material: 'Tubo em Aço Inox AISI 304 Schedule Sanitário Ø48mm com Canoplas cGMP',
    normative: 'Normas Sanitárias cGMP, ANVISA RDC e ISO 14644',
    features: [
      'Trilho duplo tubular com extremidades esféricas que evitam acidentes',
      'Canoplas de inox com vedação hermética ao piso vinílico',
      'Elemento independente destacável/removível no editor 3D'
    ],
    operationalRole: 'Proteção contra colisões mecânicas de rodízios e paleteiras na movimentação dos Bins.'
  },
  {
    id: 'bumper_rail_right',
    name: 'Bate-Rodas Inox Tubular (Parede Direita)',
    category: 'Proteção & Rodapé Sanitário',
    description: 'Bate-rodas sanitário tubular duplo em aço inoxidável AISI 304/316L instalado ao longo do rodapé da parede lateral direita. Proporciona proteção total aos painéis farmacêuticos com extremidades abauladas e fixação estanque ao piso.',
    dimensions: {
      width: 0.16,
      depth: 3.70,
      height: 0.12,
    },
    material: 'Tubo em Aço Inox AISI 304 Schedule Sanitário Ø48mm com Canoplas cGMP',
    normative: 'Normas Sanitárias cGMP, ANVISA RDC e ISO 14644',
    features: [
      'Trilho duplo tubular com extremidades esféricas que evitam acidentes',
      'Canoplas de inox com vedação hermética ao piso vinílico',
      'Elemento independente destacável/removível no editor 3D'
    ],
    operationalRole: 'Proteção do rodapé da parede direita contra colisões de equipamentos móveis.'
  },
  {
    id: 'bumper_rail_back',
    name: 'Bate-Rodas Inox Tubular (Parede Traseira)',
    category: 'Proteção & Rodapé Sanitário',
    description: 'Bate-rodas sanitário tubular duplo em aço inoxidável AISI 304/316L instalado no fundo da baia de lavagem dos Bins 1000L. Impede que os containers atinjam a parede de fundo durante as manobras.',
    dimensions: {
      width: 2.60,
      depth: 0.16,
      height: 0.12,
    },
    material: 'Tubo em Aço Inox AISI 304 Schedule Sanitário Ø48mm com Canoplas cGMP',
    normative: 'Normas Sanitárias cGMP, ANVISA RDC e ISO 14644',
    features: [
      'Trilho duplo tubular com extremidades esféricas que evitam acidentes',
      'Canoplas de inox com vedação hermética ao piso vinílico',
      'Elemento independente destacável/removível no editor 3D'
    ],
    operationalRole: 'Proteção do fundo da baia contra impactos traseiros dos Bins.'
  },
  {
    id: 'bumper_rail_front',
    name: 'Bate-Rodas Inox Tubular (Parede Frontal)',
    category: 'Proteção & Rodapé Sanitário',
    description: 'Bate-rodas sanitário tubular duplo em aço inoxidável AISI 304/316L instalado no rodapé da parede frontal ao lado do vão da porta de 3,50m. Resiste ao tráfego pesado de entrada e saída.',
    dimensions: {
      width: 3.50,
      depth: 0.16,
      height: 0.12,
    },
    material: 'Tubo em Aço Inox AISI 304 Schedule Sanitário Ø48mm com Canoplas cGMP',
    normative: 'Normas Sanitárias cGMP, ANVISA RDC e ISO 14644',
    features: [
      'Trilho duplo tubular com extremidades esféricas que evitam acidentes',
      'Canoplas de inox com vedação hermética ao piso vinílico',
      'Elemento independente destacável/removível no editor 3D'
    ],
    operationalRole: 'Proteção da parede frontal no trajeto de entrada e saída dos recipientes.'
  },
  {
    id: 'hose_reel_mount',
    name: 'Suporte de Parede Inox para Mangueira',
    category: 'Lavagem & Utilidades',
    description: 'Sela/carretel de parede sanitário em chapa de aço inoxidável AISI 304 com raio curvo amplo que previne vincos e dobras na mangueira. Equipado com abas de contenção frontal e suporte lateral tipo coldre para pistola de água.',
    dimensions: {
      width: 0.40,
      depth: 0.28,
      height: 0.45,
    },
    material: 'Aço Inox AISI 304 com acabamento escovado sanitário Ra < 0,8µm',
    normative: 'Boas Práticas de Fabricação (cGMP) e ANVISA RDC',
    features: [
      'Berço curvo com raio suave de curvatura que prolonga a vida útil da mangueira',
      'Abas frontais anti-queda de retenção das voltas',
      'Coldre integrado para encaixe rápido da pistola de lavagem',
      'Elemento 3D independente e totalmente editável'
    ],
    operationalRole: 'Acomodação organizada e higiênica da mangueira de limpeza dos Bins 1000L na parede traseira.'
  },
  {
    id: 'wash_hose_coiled',
    name: 'Mangueira Sanitária Enrolada com Pistola de Alta Pressão',
    category: 'Lavagem & Utilidades',
    description: 'Mangueira flexível azul para lavagem industrial farmacêutica (FDA / USP Classe VI) com reforço têxtil trançado e bocal de engate rápido. Acompanha pistola sanitária em aço inox com gatilho ergonômico e bico cônico regulável para higienização completa dos Bins 1000L.',
    dimensions: {
      width: 0.48,
      depth: 0.32,
      height: 0.65,
    },
    material: 'Elastômero sanitário atóxico FDA com reforço poliéster + Pistola Inox AISI 316L',
    normative: 'FDA 21 CFR 177.2600, USP Classe VI e ISO 22196',
    features: [
      'Mangueira sanitária trançada azul resistente a produtos químicos de CIP',
      'Pistola ergonômica de alto impacto com bico regulável leque/jato reto',
      'Voltas enroladas de forma realista com laço de gravidade pendente',
      'Elemento 3D independente e totalmente editável'
    ],
    operationalRole: 'Lavagem manual externa, enxágue de válvulas e assepsia profunda dos Bins 1000L na baia de higienização.'
  },
  {
    id: 'cleanroom_window_left',
    name: 'Janela Farmacêutica Quadrada Esquerda',
    category: 'Esquadrias & Visores cGMP',
    description: 'Visor de observação farmacêutico quadrado (0,95m x 0,95m) com caixilho em alumínio anodizado preto acetinado e vidro duplo de segurança temperado rente ao painel (flush double glazing). Possui serigrafia cerâmica perimetral preta sem acúmulo de partículas, permitindo supervisão visual da bancada e processo de lavagem.',
    dimensions: {
      width: 0.95,
      depth: 0.05,
      height: 0.95,
    },
    material: 'Alumínio anodizado preto fosco + Vidro duplo temperado laminado com serigrafia cerâmica',
    normative: 'ISO 14644 e Diretrizes cGMP para Visores Farmacêuticos',
    features: [
      'Borda/caixilho preto acetinado com perfil sanitário antibacteriano',
      'Vidro duplo nivelado (flush) que elimina ressaltos e depósitos de poeira',
      'Serigrafia cerâmica preta perimetral estética e funcional cGMP',
      'Elemento 3D independente e totalmente editável'
    ],
    operationalRole: 'Supervisão visual da área de lavagem e bancada a partir da área adjacente.'
  },
  {
    id: 'cleanroom_window_right',
    name: 'Janela Farmacêutica Quadrada Direita',
    category: 'Esquadrias & Visores cGMP',
    description: 'Visor de observação farmacêutico quadrado (0,95m x 0,95m) com moldura preta acetinada e vidro duplo hermético instalado na parede traseira atrás da bancada, simétrico ao visor esquerdo em relação à torneira central.',
    dimensions: {
      width: 0.95,
      depth: 0.05,
      height: 0.95,
    },
    material: 'Alumínio anodizado preto fosco + Vidro duplo temperado laminado com serigrafia cerâmica',
    normative: 'ISO 14644 e Diretrizes cGMP para Visores Farmacêuticos',
    features: [
      'Borda/caixilho preto acetinado com perfil sanitário antibacteriano',
      'Vidro duplo nivelado (flush) que elimina ressaltos e depósitos de poeira',
      'Serigrafia cerâmica preta perimetral estética e funcional cGMP',
      'Elemento 3D independente e totalmente editável'
    ],
    operationalRole: 'Supervisão visual da área de lavagem e bancada a partir da área adjacente.'
  },
  {
    id: 'quadro_utensilios',
    name: 'Quadro de Utensílios em Aço Inox (cGMP)',
    category: 'Acessórios & Parede Sanitária',
    description: 'Painel suporte sanitário para utensílios em chapa de aço inoxidável AISI 304 com acabamento espelhado de alta higienização. Equipado com matriz de pinos inclinados para secagem/drenagem de conchas dosadoras e copos graduados cônicos em inox invertidos, suporte superior de fita adesiva, bolsa porta-documentos, prateleira aramada com frascos borrifadores dosadores (Álcool 70% e detergente), trilho com mini-funis e triângulo de emergência.',
    dimensions: {
      width: 1.25,
      depth: 0.18,
      height: 0.80,
    },
    material: 'Aço Inoxidável AISI 304/316L com acabamento polido espelho sanitário Ra < 0,4µm',
    normative: 'Normas Sanitárias cGMP, ANVISA RDC e ISO 14644',
    features: [
      'Pinos inclinados para drenagem gravitacional dos copos e conchas invertidas',
      'Porta-frascos com frascos borrifadores de álcool 70% e detergente neutro',
      'Dispensador de fita e compartimento para fichas de higienização',
      'Triângulo de acionamento de segurança em inox no lado esquerdo',
      'Elemento 3D independente totalmente móvel e rotacionável no espaço 3D'
    ],
    operationalRole: 'Armazenamento organizado, asséptico e de secagem rápida dos utensílios dosadores de pesagem e lavagem na sala limpa.'
  }
];

export const HOTSPOTS_DATA: HotspotItem[] = [
  {
    id: 'hs_utensils',
    title: 'Quadro de Utensílios Inox',
    subtitle: 'Conchas, Frascos & Acessórios cGMP',
    position: [-1.05, 1.75, -2.32],
    equipmentId: 'quadro_utensilios',
  },
  {
    id: 'hs_window_left',
    title: 'Visor Farmacêutico',
    subtitle: 'Borda Preta & Vidro Flush',
    position: [0.10, 1.85, -2.32],
    equipmentId: 'cleanroom_window_left',
  },
  {
    id: 'hs_window_right',
    title: 'Visor Farmacêutico',
    subtitle: 'Borda Preta & Vidro Flush',
    position: [1.60, 1.85, -2.32],
    equipmentId: 'cleanroom_window_right',
  },
  {
    id: 'hs_hose',
    title: 'Mangueira de Lavagem',
    subtitle: 'Pistola Inox & Carretel cGMP',
    position: [-2.55, 1.45, -2.15],
    equipmentId: 'wash_hose_coiled',
  },
  {
    id: 'hs_bin1',
    title: 'Bin 1000L AISI 316L',
    subtitle: 'Válvula Tri-Clamp & Visor',
    position: [-2.55, 1.85, -0.95],
    equipmentId: 'bin_1000l_1',
  },
  {
    id: 'hs_bin2',
    title: 'Bin 1000L Baia 2',
    subtitle: 'Rodízios PU & Escotilha',
    position: [-2.55, 1.85, 0.95],
    equipmentId: 'bin_1000l_2',
  },
  {
    id: 'hs_pipes',
    title: 'Tubulações Sanitárias',
    subtitle: 'Água CIP & Ar Comprimido',
    position: [-2.55, 2.7, 0.0],
    equipmentId: 'overhead_piping',
  },
  {
    id: 'hs_drain',
    title: 'Canaleta de Dreno Inox',
    subtitle: 'Captação RDC 50 ANVISA',
    position: [-2.55, 0.12, 0.0],
    equipmentId: 'floor_drain',
  },
  {
    id: 'hs_sink',
    title: 'Bancada 3,00m & Cuba Profunda',
    subtitle: 'Cuba 40cm & Torneira Central',
    position: [0.85, 1.35, -2.0],
    equipmentId: 'marble_counter_sink',
  },
  {
    id: 'hs_lockers',
    title: 'Armário de Canto',
    subtitle: 'Teto Inclinado 45° cGMP',
    position: [2.88, 1.6, -2.1],
    equipmentId: 'shelving_units',
  },
  {
    id: 'hs_door',
    title: 'Porta de Correr 3,5m',
    subtitle: 'Vão Livre Automatizado',
    position: [1.7, 1.8, 2.4],
    equipmentId: 'sliding_door',
  },
];
