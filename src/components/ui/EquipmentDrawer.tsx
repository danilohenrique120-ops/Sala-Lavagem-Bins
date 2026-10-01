import React from 'react';
import { X, CheckCircle2, ShieldCheck, Box, Crosshair, ArrowRight } from 'lucide-react';
import { EquipmentItem, CameraPreset } from '../../types/archviz';
import { CAMERA_PRESETS } from './CameraToolbar';

interface EquipmentDrawerProps {
  item: EquipmentItem | null;
  onClose: () => void;
  onSelectPreset: (preset: CameraPreset) => void;
}

export const EquipmentDrawer: React.FC<EquipmentDrawerProps> = ({
  item,
  onClose,
  onSelectPreset,
}) => {
  if (!item) return null;

  // Find matching camera preset
  const handleFocus = () => {
    let targetPresetId = 'overview';
    if (item.id.includes('bin')) targetPresetId = 'bins_area';
    else if (item.id === 'platform_stairs') targetPresetId = 'platform_wash';
    else if (item.id === 'overhead_piping') targetPresetId = 'overhead_pipes';
    else if (item.id === 'marble_counter_sink') targetPresetId = 'marble_counter';
    else if (item.id === 'shelving_units') targetPresetId = 'shelving_area';
    else if (item.id === 'sliding_door') targetPresetId = 'sliding_door';

    const p = CAMERA_PRESETS.find((cp) => cp.id === targetPresetId);
    if (p) onSelectPreset(p);
  };

  return (
    <div className="absolute top-16 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Drawer Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800 bg-slate-900/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
            {item.category}
          </span>
          <h2 className="text-base font-bold text-slate-100 leading-snug mt-0.5">
            {item.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fechar Detalhes"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">
        {/* Dimensions Card */}
        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Dimensões Reais Técnicas</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LARGURA</span>
              <span className="text-sm font-bold text-amber-400">
                {item.dimensions.width.toFixed(2)} m
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PROFUND.</span>
              <span className="text-sm font-bold text-amber-400">
                {item.dimensions.depth.toFixed(2)} m
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ALTURA</span>
              <span className="text-sm font-bold text-amber-400">
                {item.dimensions.height.toFixed(2)} m
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-slate-300 mb-1">Descrição Arquitetônica & Técnica</h3>
          <p className="text-slate-400 leading-relaxed text-[11.5px]">{item.description}</p>
        </div>

        {/* Material Specification */}
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
            Material Construtivo
          </span>
          <span className="font-medium text-slate-200 mt-0.5 block">{item.material}</span>
        </div>

        {/* Regulatory Compliance */}
        <div className="flex items-start gap-2 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold block text-[11px]">Conformidade Sanitária</span>
            <span className="text-[10.5px] text-emerald-400/90 leading-tight">
              {item.normative}
            </span>
          </div>
        </div>

        {/* Key Features List */}
        <div>
          <h3 className="font-semibold text-slate-300 mb-1.5">Recursos & Geometria</h3>
          <ul className="space-y-1.5">
            {item.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Role in Cleanroom */}
        <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-lg">
          <span className="text-[10px] font-mono text-sky-400 block uppercase tracking-wider font-semibold">
            Função no Fluxo de Sala Limpa
          </span>
          <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
            {item.operationalRole}
          </p>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2">
        <button
          onClick={handleFocus}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-xs transition-colors shadow-sm"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Focar Câmera no 3D</span>
        </button>
      </div>
    </div>
  );
};
