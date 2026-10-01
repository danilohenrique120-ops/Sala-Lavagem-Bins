import React from 'react';
import { X, Sparkles, Sun, Moon, ShieldAlert, Cpu, Palette } from 'lucide-react';
import {
  RenderMode,
  LightingPreset,
  MarbleTone,
  SteelFinish,
  FloorColor,
} from '../../types/archviz';

interface MaterialConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  renderMode: RenderMode;
  onSelectRenderMode: (mode: RenderMode) => void;
  lightingPreset: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
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
  marbleTone,
  onSelectMarble,
  steelFinish,
  onSelectSteel,
  floorColor,
  onSelectFloor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-4 z-30 w-84 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Materiais & Shader UE5
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
        {/* Render Engine Simulation Mode */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Motor de Renderização / Shader
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'lumen', label: 'UE5 Lumen GI', desc: 'PBR Fotorrealista' },
              { id: 'ssr', label: 'Raytrace SSR', desc: 'Reflexos de Inox' },
              { id: 'clay', label: 'Argila Clay / AO', desc: 'Oclusão Ambiental' },
              { id: 'wireframe', label: 'Wireframe CAD', desc: 'Malha Técnica' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectRenderMode(m.id as RenderMode)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  renderMode === m.id
                    ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-[11px]">{m.label}</div>
                <div className="text-[9.5px] text-slate-500">{m.desc}</div>
              </button>
            ))}
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
                id: 'cleanroom_1000lux',
                label: 'Operação 1000 Lux',
                icon: Sun,
                color: 'text-amber-300',
              },
              {
                id: 'daylight',
                label: 'Turno Diurno',
                icon: Sparkles,
                color: 'text-sky-300',
              },
              {
                id: 'uvc_sanitization',
                label: 'Desinfecção UV-C',
                icon: ShieldAlert,
                color: 'text-purple-400',
              },
              {
                id: 'standby',
                label: 'Modo Standby',
                icon: Moon,
                color: 'text-slate-400',
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectLighting(p.id as LightingPreset)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left border transition-all ${
                    lightingPreset === p.id
                      ? 'bg-slate-800 border-sky-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                  <span className="text-[11px] font-medium">{p.label}</span>
                </button>
              );
            })}
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
                desc: 'Tons caramelo com veios dourados e marrons nobres',
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
                desc: 'Tons âmbar terrosos com acabamento polido',
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

        {/* Stainless Steel Finishes */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Acabamento do Aço Inox (AISI 316L / 304)
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              {
                id: 'mirror_polish',
                label: 'Polido Espelhado Eletroquímico',
                desc: 'Ra < 0.4 µm (Máxima reflexividade sanitária para Bins 1000L)',
              },
              {
                id: 'brushed_316',
                label: 'Escovado Sanitário Scotch-Brite',
                desc: 'Grão longitudinal clássico para armários e estantes',
              },
              {
                id: 'matte_sanitary',
                label: 'Fosco Sanitário Microesferado',
                desc: 'Anti-reflexo difuso para plataforma de lavagem',
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

        {/* Cleanroom Epoxy Floor */}
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block mb-1.5">
            Revestimento do Piso (Epóxi Autonivelante)
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
