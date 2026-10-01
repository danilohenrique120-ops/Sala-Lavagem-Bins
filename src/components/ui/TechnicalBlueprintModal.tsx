import React from 'react';
import { X, Box, MoveRight } from 'lucide-react';
import { CameraPreset } from '../../types/archviz';
import { CAMERA_PRESETS } from './CameraToolbar';

interface TechnicalBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: CameraPreset) => void;
}

export const TechnicalBlueprintModal: React.FC<TechnicalBlueprintModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const navigateTo = (presetId: string) => {
    const p = CAMERA_PRESETS.find((cp) => cp.id === presetId);
    if (p) {
      onSelectPreset(p);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800 rounded">
                Desenho Técnico CAD
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Planta Baixa Arquitetônica & Layout Otimizado
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Conformidade rigorosa com cotas: 7,24m × 4,77m | Pé Direito 3,00m | Porta 3,50m | Área dos Bins Exclusiva
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: CAD SVG Diagram */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="relative w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 sm:p-6 overflow-x-auto">
            <svg
              viewBox="0 0 850 560"
              className="w-full min-w-[700px] h-auto font-mono text-xs select-none"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cadGrid)" />

              {/* Dimension: 7,24 m (Top Wall) */}
              <line x1="80" y1="50" x2="740" y2="50" stroke="#ef4444" strokeWidth="2" />
              <line x1="80" y1="40" x2="80" y2="60" stroke="#ef4444" strokeWidth="2" />
              <line x1="740" y1="40" x2="740" y2="60" stroke="#ef4444" strokeWidth="2" />
              <rect x="360" y="36" width="100" height="28" fill="#7f1d1d" rx="4" />
              <text x="410" y="55" fill="#fecaca" textAnchor="middle" fontWeight="bold" fontSize="14">
                7,24 m
              </text>

              {/* Dimension: 4,77 m (Right Wall) */}
              <line x1="770" y1="80" x2="770" y2="470" stroke="#ef4444" strokeWidth="2" />
              <line x1="760" y1="80" x2="780" y2="80" stroke="#ef4444" strokeWidth="2" />
              <line x1="760" y1="470" x2="780" y2="470" stroke="#ef4444" strokeWidth="2" />
              <rect x="735" y="260" width="70" height="28" fill="#7f1d1d" rx="4" />
              <text x="770" y="279" fill="#fecaca" textAnchor="middle" fontWeight="bold" fontSize="14">
                4,77 m
              </text>

              {/* Main Room Outer Walls */}
              <rect
                x="80"
                y="80"
                width="660"
                height="390"
                fill="#0f172a"
                stroke="#64748b"
                strokeWidth="6"
              />

              {/* 1. TOP WALL: Marble Counter (Ends before the right corner to avoid collision) */}
              <rect
                x="83"
                y="83"
                width="520"
                height="55"
                fill="#b89a74"
                stroke="#846342"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-85 transition-opacity"
                onClick={() => navigateTo('marble_counter')}
              />
              <text x="340" y="105" fill="#382312" textAnchor="middle" fontWeight="bold" fontSize="11">
                BANCADA DE MÁRMORE MARROM (5,8m)
              </text>

              {/* Normal proportioned double hospital sink with standard faucets */}
              <rect x="330" y="86" width="125" height="48" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
              <text x="392" y="115" fill="#0f172a" textAnchor="middle" fontWeight="bold" fontSize="10">
                PIA DUPLA (TORNEIRAS PADRÃO)
              </text>

              {/* Armário Azul no Canto Traseiro Direito (Sem conflito) */}
              <rect x="615" y="83" width="122" height="50" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />
              <text x="676" y="112" fill="#ffffff" textAnchor="middle" fontSize="9" fontWeight="bold">
                ARMÁRIOS AZUIS
              </text>

              {/* 2. LEFT SIDE: "ÁREA DE LAVAGEM DE BINS" Zone (DEDICADA E LIVRE) */}
              <rect
                x="86"
                y="150"
                width="240"
                height="310"
                fill="#0284c7"
                fillOpacity="0.08"
                stroke="#eab308"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <text x="206" y="178" fill="#eab308" textAnchor="middle" fontWeight="bold" fontSize="12">
                ÁREA DE LAVAGEM DE BINS (EXCLUSIVA)
              </text>

              {/* Overhead utility line indication in yellow/blue */}
              <line x1="140" y1="195" x2="260" y2="195" stroke="#38bdf8" strokeWidth="4" />
              <text x="200" y="210" fill="#38bdf8" textAnchor="middle" fontSize="9">
                TUBULAÇÕES AÉREAS (ÁGUA & AR)
              </text>

              {/* BIN 1000 #1 */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo('bins_area')}
              >
                <circle cx="150" cy="265" r="42" fill="#334155" stroke="#38bdf8" strokeWidth="3" />
                <rect x="122" y="237" width="56" height="56" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="150" cy="265" r="14" fill="#0284c7" />
                <text x="150" y="269" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontSize="9">
                  BIN 1000L
                </text>
              </g>

              {/* BIN 1000 #2 */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo('bins_area')}
              >
                <circle cx="150" cy="390" r="42" fill="#334155" stroke="#38bdf8" strokeWidth="3" />
                <rect x="122" y="362" width="56" height="56" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="150" cy="390" r="14" fill="#0284c7" />
                <text x="150" y="394" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontSize="9">
                  BIN 1000L
                </text>
              </g>

              {/* 3. Escada Plataforma de Inox ao lado dos Bins */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo('platform_wash')}
              >
                <rect x="235" y="275" width="60" height="95" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                <line x1="235" y1="295" x2="295" y2="295" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="235" y1="315" x2="295" y2="315" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="235" y1="335" x2="295" y2="335" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="265" y="360" fill="#f8fafc" textAnchor="middle" fontSize="9" fontWeight="bold">
                  PLATAFORMA
                </text>
              </g>

              {/* 4. Bateria de Armários Azuis Organizadores (NA PAREDE DIREITA) */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo('shelving_area')}
              >
                <rect x="675" y="160" width="60" height="220" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />
                <text x="705" y="260" fill="#ffffff" textAnchor="middle" fontSize="9" fontWeight="bold">
                  ARMÁRIOS AZUIS
                </text>
                <text x="705" y="275" fill="#bfdbfe" textAnchor="middle" fontSize="8">
                  ORGANIZADORES
                </text>
              </g>

              {/* 5. BOTTOM WALL: Sliding Door Opening (Porta de Correr 3,5m) */}
              <rect x="420" y="464" width="270" height="12" fill="#0f172a" />
              <line x1="420" y1="480" x2="555" y2="480" stroke="#38bdf8" strokeWidth="5" />
              <line x1="555" y1="480" x2="690" y2="480" stroke="#38bdf8" strokeWidth="5" />
              <line x1="390" y1="486" x2="710" y2="486" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2" />

              {/* Door Dimension: 3,5 m */}
              <line x1="420" y1="510" x2="690" y2="510" stroke="#ef4444" strokeWidth="2" />
              <line x1="420" y1="502" x2="420" y2="518" stroke="#ef4444" strokeWidth="2" />
              <line x1="690" y1="502" x2="690" y2="518" stroke="#ef4444" strokeWidth="2" />
              <rect x="515" y="520" width="80" height="24" fill="#7f1d1d" rx="4" />
              <text x="555" y="536" fill="#fecaca" textAnchor="middle" fontWeight="bold" fontSize="13">
                3,5 m
              </text>
            </svg>
          </div>

          {/* Quick Access Equipments List */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Navegar diretamente para os elementos no 3D:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'bins_area',
                  title: 'Dois Bins 1000L em Inox',
                  desc: 'Área exclusiva desobstruída com demarcação amarela',
                },
                {
                  id: 'overhead_pipes',
                  title: 'Tubulações Aéreas de Água & Ar',
                  desc: 'Linhas no teto com descidas para lavagem dos bins',
                },
                {
                  id: 'marble_counter',
                  title: 'Bancada Mármore 7,24m & Pia',
                  desc: 'Pia hospitalar normal dupla com torneira funcional',
                },
                {
                  id: 'platform_wash',
                  title: 'Escada Plataforma Inox',
                  desc: 'Acesso seguro à escotilha superior para lavagem',
                },
                {
                  id: 'shelving_area',
                  title: 'Estantes na Parede Direita',
                  desc: 'Prateleiras 5 andares reposicionadas sem atrapalhar os bins',
                },
                {
                  id: 'sliding_door',
                  title: 'Porta de Correr 3,5m',
                  desc: 'Vão livre automatizado para movimentação de bins',
                },
              ].map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => navigateTo(eq.id)}
                  className="flex items-start gap-3 p-3 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                    <MoveRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                      {eq.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{eq.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
