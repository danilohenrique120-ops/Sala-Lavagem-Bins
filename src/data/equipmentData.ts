import { EquipmentItem } from '../types/archviz';

export const EQUIPMENT_LIST: EquipmentItem[] = [
  {
    id: 'bin_1000l_1',
    name: 'Bin Farmacêutico 1000L em Aço Inox AISI 316L (#1)',
    category: 'Processamento & Armazenamento Sanitário',
    description: 'Contêiner intermediário para sólidos (IBC 1000L tipo Canaan) com geometria prismática de cantos arredondados, acabamento espelhado eletropolido Ra < 0.4 µm. Equipado com válvula borboleta sanitária de descarga inferior, escotilha de inspeção superior com anel clamp, alças frontais ergonômicas, munhões laterais para elevação e chassi reforçado com 4 rodízios giratórios em poliuretano com freio.',
    dimensions: {
      width: 1.15,
      depth: 1.15,
      height: 1.95,
    },
    material: 'Aço Inoxidável AISI 316L (partes em contato) e AISI 304 (estrutura)',
    normative: 'Conforme cGMP, FDA 21 CFR e RDC 658 ANVISA',
    features: [
      'Capacidade nominal: 1000 Litros',
      'Funil cônico inferior com inclinação de 60° para escoamento total sem retenção',
      'Escotilha superior estanque com anel clamp e vedação de silicone farmacêutico',
      'Alças ergonômicas de movimentação e munhões de tombamento',
      'Base móvel com rodízios giratórios resistentes a lavagem com água quente'
    ],
    operationalRole: 'Posicionado na demarcada Área de Lavagem de Bins, isolado e desimpedido para ciclos de limpeza CIP/WIP e sanitização contínua.'
  },
  {
    id: 'bin_1000l_2',
    name: 'Bin Farmacêutico 1000L em Aço Inox AISI 316L (#2)',
    category: 'Processamento & Armazenamento Sanitário',
    description: 'Segundo contêiner IBC idêntico de 1000 Litros posicionado na baia contígua de lavagem, operando em rodízio contínuo para manter o fluxo asséptico da fábrica sem interrupção.',
    dimensions: {
      width: 1.15,
      depth: 1.15,
      height: 1.95,
    },
    material: 'Aço Inoxidável AISI 316L polido espelhado',
    normative: 'Conforme cGMP / ASME BPE',
    features: [
      'Válvula de saída sanitária tipo borboleta com alavanca de abertura rápida',
      'Geometria interna sem cantos vivos para evitar contaminação cruzada',
      'Chassi sanitário reforçado com sapatas de travamento e rodízios'
    ],
    operationalRole: 'Higienização e secagem em paralelo na baia dedicada de lavagem.'
  },
  {
    id: 'platform_stairs',
    name: 'Escada Plataforma Móvel em Aço Inox para Lavagem de Bins',
    category: 'Acesso & Operação de Higienização',
    description: 'Plataforma industrial móvel de elevação fabricada inteiramente em aço inox tubular AISI 304. Possui degraus largos antiderrapantes perfurados, guarda-corpos duplos laterais de segurança a 1.10m com rodapé sanitário, sapatas com freio e plataforma superior nivelada a 1.45m do chão.',
    dimensions: {
      width: 0.90,
      depth: 1.65,
      height: 2.35,
    },
    material: 'Aço Inoxidável AISI 304 escovado sanitário Scotch-Brite',
    normative: 'NR-12, NR-35 e padrões sanitários para salas limpas',
    features: [
      'Nivelamento superior ideal para acesso à escotilha superior do Bin de 1000L',
      'Guarda-corpo perimetral integral com rodapé de segurança',
      'Degraus em chapa xadrez perfurada anti-acúmulo de líquidos',
      'Posicionamento livre ao lado dos bins para operação ergonômica'
    ],
    operationalRole: 'Permite ao operador subir com total ergonomia e segurança para abrir a escotilha superior e higienizar internamente os Bins de 1000L.'
  },
  {
    id: 'overhead_piping',
    name: 'Tubulações Aéreas em Inox: Água Industrial e Ar Comprimido',
    category: 'Utilidades & Alimentação de Lavagem',
    description: 'Sistema aéreo suspenso de alimentação direta instalado no teto logo acima dos Bins 1000L. Composto por linha de Água de Lavagem (com válvula borboleta e mangueira espiralada suspensa com bico de alta pressão) e linha de Ar Comprimido seco/filtrado (com regulador de pressão de precisão, manômetro analógico e engates rápidos pneumáticos para secagem imediata pós-lavagem).',
    dimensions: {
      width: 3.20,
      depth: 0.50,
      height: 0.85,
    },
    material: 'Tubulação em Aço Inox AISI 316L com conexões sanitárias Tri-Clamp (TC)',
    normative: 'ASME BPE, ISO 8573-1 (Pureza do Ar Comprimido) e ANVISA',
    features: [
      'Tubulação de Água com descida vertical e bocal de lavagem para os bins',
      'Tubulação de Ar Comprimido com regulador e manômetro de controle',
      'Mangueiras flexíveis sanitárias alimentícias suspensas por suportes retráteis',
      'Instalação aérea que mantém o piso totalmente desimpedido e seguro'
    ],
    operationalRole: 'Fornece água de lavagem e ar comprimido filtrado diretamente no topo dos dois bins para higienização e secagem rápida.'
  },
  {
    id: 'marble_counter_sink',
    name: 'Bancada Contínua de Mármore Marrom Claro (7.24m) com Pia Hospitalar',
    category: 'Área de Trabalho & Lavagem Hospitalar',
    description: 'Bancada contínua de pedra nobre de mármore marrom claro (tonalidade Emperador Light polido) com tratamento impermeabilizante antibacteriano, estendendo-se por toda a extensão da parede de 7,24 metros. Incorpora pia hospitalar profissional em aço inox com cubas duplas estampadas proporcionais, torneira cirúrgica de bica alta com alavanca de cotovelo, comando liga/desliga funcional e armários inferiores herméticos.',
    dimensions: {
      width: 5.77,
      depth: 0.70,
      height: 0.90,
    },
    material: 'Tampo nobre em Mármore Marrom Claro com acabamento lateral chanfrado + Cubas e Armários em Inox AISI 316L',
    normative: 'RDC 50 ANVISA (Estabelecimentos de Saúde) e ISO 14644',
    features: [
      'Comprimento de 5,77 metros finalizado antes do canto direito para evitar interferências com os armários azuis',
      'Rodabanca sanitária em mármore contra infiltrações e acabamento lateral de topo nobre',
      'Pia de cubas duplas proporcionais com cantos suaves sanitários',
      'Torneiras monocomando contemporâneas cromadas padrão com sistema funcional de ligar/desligar',
      'Superfície ampla para apoio de recipientes, pesagens e preparos'
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
