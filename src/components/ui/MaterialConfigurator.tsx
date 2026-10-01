import React from 'react';
import { X, Sparkles, Sun, Moon, ShieldAlert, Cpu, Palette, Sliders, Eye, Zap } from 'lucide-react';
import {
  RenderMode,
  LightingPreset,
  MarbleTone,
  SteelFinish,
  FloorColor,
  GlossLevel,
} from '../../types/archviz';

interface MaterialConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  renderMode?: RenderMode;
  onSelectRenderMode?: (mode: RenderMode) => void;
  lightingPreset: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
  glossLevel: GlossLevel;
  onSelectGloss: (level: GlossLevel) => void;
  bloomEnabled: boolean;
  onToggleBloom: () => void;
  exposure: number;
  onSelectExposure: (exp: number) => void;
  marbleTone: MarbleTone;
  onSelectMarble: (tone: MarbleTone) => void;
  steelFinish: SteelFinish;
  onSelectSteel: (finish: SteelFinish) => void;
  floorColor: FloorColor;
  onSelectFloor: (color: FloorColor) => void;
}

export const MaterialConfigurator: React.FC<MaterialConfiguratorProps> = ({
  isOpen,
  onClose,
  renderMode,
  onSelectRenderMode,
  lightingPreset,
  onSelectLighting,
  glossLevel,
  onSelectGloss,
  bloomEnabled,
  onToggleBloom,
  exposure,
  onSelectExposure,
  marbleTone,
  onSelectMarble,
  steelFinish,
  onSelectSteel,
  floorColor,
  onSelectFloor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-4 z-30 w-88 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Materiais & Controle de Brilho
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">
        {/* Status das Texturas PBR da Imagem */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-sky-950/40 border border-amber-500/40 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Texturas Calibradas da Imagem
            </span>
            <span className="text-[9px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 font-semibold">
              PBR Ativo
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Texturas com <strong>Normal Maps tangenciais</strong> (micro-relevo 3D) e <strong>Roughness Maps</strong> aplicados fielmente à imagem:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
            <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-amber-200/90 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Mármore Bege/Caramelo
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-sky-200/90 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Inox AISI 316L Escovado
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Epóxi Casca de Laranja
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-blue-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Armários Azul Hospitalar
            </div>
          </div>
        </div>

        {/* Nível de Brilho e Reflexos (Controle de Rugosidade PBR) */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              Nível de Brilho & Reflexos
            </span>
            <span className="text-[9px] text-emerald-300 font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
              Calibração PBR
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              {
                id: 'satin_hospital',
                label: 'Acetinado Hospitalar (Recomendado)',
                desc: 'Inox escovado natural e epóxi fosco/antiderrapante. Sem reflexos espelhados incômodos.',
                badge: 'Realista',
              },
              {
                id: 'balanced',
                label: 'Brilho Moderado',
                desc: 'Reflexos suaves e leve destaque especular.',
                badge: 'Equilibrado',
              },
              {
                id: 'high_gloss',
                label: 'Alto Brilho / Polido',
                desc: 'Superfícies polidas espelhadas (máxima reflexividade).',
                badge: 'Intenso',
              },
            ].map((gl) => (
              <button
                key={gl.id}
                onClick={() => onSelectGloss(gl.id as GlossLevel)}
                className={`w-full p-2 rounded-lg text-left border transition-all ${
                  glossLevel === gl.id
                    ? 'bg-emerald-950/50 border-emerald-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-slate-200">{gl.label}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                    glossLevel === gl.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {gl.badge}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">{gl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Exposição e Efeito Bloom */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                Exposição / Claridade da Cena
              </span>
              <span className="text-[10px] font-mono text-sky-300 font-bold">
                {exposure.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.30"
              step="0.05"
              value={exposure}
              onChange={(e) => onSelectExposure(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
              <span>0.70x (Suave)</span>
              <span>0.95x (Padrão)</span>
              <span>1.30x (Muito Claro)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div>
              <div className="font-semibold text-[11px] text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                Efeito Bloom (Glow de Lâmpadas)
              </div>
              <div className="text-[9.5px] text-slate-500">
                Difusão de brilho nas luminárias herméticas
              </div>
            </div>
            <button
              onClick={onToggleBloom}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                bloomEnabled
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {bloomEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>
        </div>

        {/* Lighting Simulation Preset */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Cenário de Iluminação Hospitalar
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              {
                id: 'daylight',
                label: 'Modo Diurno Hospitalar',
                desc: 'Luz neutra suave 4500K',
                icon: Sparkles,
                color: 'text-amber-300',
              },
              {
                id: 'cleanroom_1000lux',
                label: 'Inspeção Técnica (1000 Lux)',
                desc: 'Luz fria intensa 5000K',
                icon: Sun,
                color: 'text-sky-300',
              },
              {
                id: 'uvc_sanitization',
                label: 'Desinfecção UV-C Germicida',
                desc: 'Luz ultravioleta fluorescente',
                icon: ShieldAlert,
                color: 'text-purple-400',
              },
              {
                id: 'standby',
                label: 'Modo Standby Noturno',
                desc: 'Iluminação mínima de vigília',
                icon: Moon,
                color: 'text-slate-400',
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectLighting(p.id as LightingPreset)}
                  className={`flex flex-col p-2 rounded-lg text-left border transition-all ${
                    lightingPreset === p.id
                      ? 'bg-slate-800 border-sky-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                    <span className="text-[11px] font-medium text-slate-200">{p.label}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 mt-0.5">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stainless Steel Finishes */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Acabamento do Aço Inox (AISI 316L / 304)
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              {
                id: 'brushed_316',
                label: 'Escovado Sanitário Scotch-Brite (Padrão)',
                desc: 'Grão longitudinal clássico acetinado sem reflexo ofuscante',
              },
              {
                id: 'matte_sanitary',
                label: 'Fosco Sanitário Microesferado',
                desc: 'Anti-reflexo difuso para plataforma de lavagem',
              },
              {
                id: 'mirror_polish',
                label: 'Polido Espelhado Eletroquímico',
                desc: 'Ra < 0.4 µm (Alta reflexividade sanitária)',
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onSelectSteel(f.id as SteelFinish)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  steelFinish === f.id
                    ? 'bg-sky-950/50 border-sky-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-[11px] text-slate-200">{f.label}</div>
                <div className="text-[9.5px] text-slate-500">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Marble Tone Options */}
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block mb-1.5">
            Pedra da Bancada (Mármore Marrom Claro)
          </span>
          <div className="space-y-1.5">
            {[
              {
                id: 'emperador_light',
                label: 'Emperador Light Espanhol',
                desc: 'Tons caramelo com veios dourados e acabamento acetinado nobre',
                colorSample: '#c5a98d',
              },
              {
                id: 'crema_marfil',
                label: 'Crema Marfil Clássico',
                desc: 'Bege claro com veios marrom-quentes sutis',
                colorSample: '#d8cbba',
              },
              {
                id: 'travertine_warm',
                label: 'Travertino Dourado Resinatus',
                desc: 'Tons âmbar terrosos com acabamento semi-brilho',
                colorSample: '#cd9b63',
              },
            ].map((tone) => (
              <button
                key={tone.id}
                onClick={() => onSelectMarble(tone.id as MarbleTone)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left border transition-all ${
                  marbleTone === tone.id
                    ? 'bg-amber-950/50 border-amber-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-slate-700 shrink-0 shadow-inner"
                  style={{ backgroundColor: tone.colorSample }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-[11px] text-slate-200">{tone.label}</div>
                  <div className="text-[9.5px] text-slate-500">{tone.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cleanroom Epoxy Floor */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Revestimento do Piso (Epóxi Sanitário)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'hospital_blue', label: 'Azul Real', sample: '#6991af' },
              { id: 'surgical_green', label: 'Verde CME', sample: '#6e9e8c' },
              { id: 'clean_grey', label: 'Cinza ISO 7', sample: '#afb4b9' },
            ].map((fl) => (
              <button
                key={fl.id}
                onClick={() => onSelectFloor(fl.id as FloorColor)}
                className={`p-2 rounded-lg text-center border transition-all ${
                  floorColor === fl.id
                    ? 'bg-slate-800 border-sky-400 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full mx-auto mb-1 border border-slate-700"
                  style={{ backgroundColor: fl.sample }}
                />
                <span className="text-[10px] font-medium block">{fl.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
