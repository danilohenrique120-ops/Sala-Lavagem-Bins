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
    name: 'Bancada de Mármore Marrom com Cuba Inox e Torneira Hospitalar',
    category: 'Área de Trabalho & Lavagem Hospitalar',
    description: 'Bancada contínua de pedra nobre de mármore marrom com acabamento polido vítreo e frontão/espelho de parede alto de 15cm contra infiltrações. Incorpora cuba dupla profunda embutida em aço inox AISI 316L com ralo tipo cesto e torneira hospitalar com alavanca longa médica (acionamento clínico de cotovelo sem contato manual) e sistema funcional liga/desliga.',
    dimensions: {
      width: 5.77,
      depth: 0.70,
      height: 0.90,
    },
    material: 'Tampo em Mármore Nobre (Clearcoat 0.8) + Cubas e Armários em Inox AISI 316L',
    normative: 'RDC 50 ANVISA (Estabelecimentos de Saúde) e ISO 14644',
    features: [
      'Frontão/espelho sanitário elevado de 15cm em mármore polido',
      'Duas cubas profundas estampadas com cantos arredondados de fácil assepsia',
      'Torneiras clínicas com alavanca longa de cotovelo para assepsia sem toque',
      'Armários inferiores em aço inox com puxadores e divisórias estéreis'
    ],
    operationalRole: 'Lavagem de instrumentais, apoio de recipientes, preparo de soluções químicas de limpeza e procedimentos estéreis.'
  },
  {
    id: 'shelving_units',
    name: 'Baterias de Armários Azuis Organizadores para Sala Limpa',
    category: 'Armazenamento & Vestiário Sanitário',
    description: 'Conjunto modular de armários/lockers organizadores fabricados com portas em azul hospitalar (RAL 5005) e corpo sanitário em cinza claro com teto inclinado a 45° anti-acúmulo de partículas. Inclui módulo de 3 portas no canto traseiro direito e bateria de 5 portas ao longo da parede lateral direita, substituindo as prateleiras abertas e eliminando qualquer conflito com a bancada da pia.',
    dimensions: {
      width: 3.35,
      depth: 0.52,
      height: 2.25,
    },
    material: 'Chapa de aço com pintura eletrostática a pó antibacteriana e portas azuis em laminado de alta pressão',
    normative: 'Conforme GMP / cGMP e ISO 14644 (Salas Limpas)',
    features: [
      'Teto inclinado sanitário a 45° que impede deposição de poeira per cGMP',
      'Puxadores embutidos cromados e venezianas de ventilação inferior',
      'Porta-etiquetas identificadores de conteúdo estéril',
      'Posicionamento sem qualquer conflito com a bancada da pia'
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
  }
];

export const HOTSPOTS_DATA: HotspotItem[] = [
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
    title: 'Bancada & Cuba Inox',
    subtitle: 'Torneira Clínica de Cotovelo',
    position: [0.2, 1.35, -2.15],
    equipmentId: 'marble_counter_sink',
  },
  {
    id: 'hs_lockers',
    title: 'Armários Organizadores',
    subtitle: 'Teto Inclinado 45° cGMP',
    position: [3.3, 1.6, 0.55],
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
