import React from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  Trash2,
  Copy,
  RotateCcw,
  Magnet,
  X,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  Unlock,
} from 'lucide-react';
import { TransformMode, TransformData, SceneItemMeta } from '../../types/editor';

interface ObjectEditorPanelProps {
  selectedItem: SceneItemMeta | null;
  transformMode: TransformMode;
  onSelectTransformMode: (mode: TransformMode) => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  lockCameraRotation?: boolean;
  onToggleLockCameraRotation?: () => void;
  transformData: TransformData | null;
  onUpdateTransform: (data: Partial<TransformData>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onResetSelected: () => void;
  onClose: () => void;
  onOpenOutliner: () => void;
}

export const ObjectEditorPanel: React.FC<ObjectEditorPanelProps> = ({
  selectedItem,
  transformMode,
  onSelectTransformMode,
  snapEnabled,
  onToggleSnap,
  lockCameraRotation = true,
  onToggleLockCameraRotation,
  transformData,
  onUpdateTransform,
  onDeleteSelected,
  onDuplicateSelected,
  onResetSelected,
  onClose,
  onOpenOutliner,
}) => {
  if (!selectedItem || !transformData) return null;

  const handleNudge = (axis: 'x' | 'y' | 'z', delta: number) => {
    const current = transformData.position[axis];
    onUpdateTransform({
      position: {
        ...transformData.position,
        [axis]: Number((current + delta).toFixed(3)),
      },
    });
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdateTransform({
        position: {
          ...transformData.position,
          [axis]: Number(num.toFixed(3)),
        },
      });
    }
  };

  const handleRotationYChange = (deg: number) => {
    onUpdateTransform({
      rotation: {
        ...transformData.rotation,
        y: deg,
      },
    });
  };

  const handleScaleChange = (factor: number) => {
    onUpdateTransform({
      scale: {
        x: Number(factor.toFixed(2)),
        y: Number(factor.toFixed(2)),
        z: Number(factor.toFixed(2)),
      },
    });
  };

  const handleScaleAxisChange = (axis: 'x' | 'y' | 'z', val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0.05) {
      onUpdateTransform({
        scale: {
          ...transformData.scale,
          [axis]: Number(num.toFixed(2)),
        },
      });
    }
  };

  const isDrain = selectedItem.id === 'floor_drain' || selectedItem.id.includes('drain');
  const isDemarcation = selectedItem.id === 'floor_demarcation' || selectedItem.id.includes('demarcation');
  const isBin = selectedItem.id.includes('bin');

  return (
    <div className="absolute top-14 right-4 z-30 w-84 bg-slate-950/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden max-h-[88vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400 shrink-0">
            {transformMode === 'translate' ? (
              <Move className="w-4 h-4" />
            ) : transformMode === 'rotate' ? (
              <RotateCw className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-white tracking-wide truncate">
              {selectedItem.name}
            </h3>
            <span className="text-[10px] text-sky-400/80 font-mono tracking-tight block truncate">
              {selectedItem.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenOutliner}
            className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
            title="Ver todos os itens da sala"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-white rounded-md transition-colors"
            title="Deselecionar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar text-xs">
        {/* Transform Mode Switcher (W, E, R) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Modo de Transformação 3D
            </span>
            <span className="text-[9px] font-mono text-slate-500">Atalhos: W, E, R</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => onSelectTransformMode('translate')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
                transformMode === 'translate'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Mover</span>
            </button>
            <button
              onClick={() => onSelectTransformMode('rotate')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
                transformMode === 'rotate'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar</span>
            </button>
            <button
              onClick={() => onSelectTransformMode('scale')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
                transformMode === 'scale'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Escalar</span>
            </button>
          </div>
        </div>

        {/* Snap Control */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Magnet className={`w-3.5 h-3.5 ${snapEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-[11px] font-medium text-slate-300">Ajuste com Snap Magnético</span>
          </div>
          <button
            onClick={onToggleSnap}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
              snapEnabled
                ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {snapEnabled ? '5cm / 15°' : 'Livre'}
          </button>
        </div>

        {/* Camera Rotation Lock Control */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            {lockCameraRotation ? (
              <Lock className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-slate-500" />
            )}
            <div>
              <div className="text-[11px] font-medium text-slate-300">Giro da Tela (Câmera)</div>
              <div className="text-[9.5px] text-slate-500 font-mono">
                {lockCameraRotation ? 'Travado (não gira na edição)' : 'Giro 3D livre'}
              </div>
            </div>
          </div>
          <button
            onClick={onToggleLockCameraRotation}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
              lockCameraRotation
                ? 'bg-rose-500/20 border border-rose-500/60 text-rose-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400'
            }`}
            title="Clique para alternar entre travar ou liberar o giro da tela"
          >
            {lockCameraRotation ? 'TRAVADO' : 'LIVRE'}
          </button>
        </div>

        {/* Numeric Position Inputs (X, Y, Z) */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span>Posição no Espaço (Metros)</span>
            <span className="text-sky-400">Origem da Sala</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => {
              const labelColor =
                axis === 'x' ? 'text-red-400' : axis === 'y' ? 'text-green-400' : 'text-blue-400';
              const val = transformData.position[axis];
              return (
                <div key={axis} className="bg-slate-950/80 border border-slate-800 rounded-lg p-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase ${labelColor}`}>
                      {axis}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleNudge(axis, -0.05)}
                        className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono"
                        title="-5cm"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleNudge(axis, 0.05)}
                        className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono"
                        title="+5cm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={val}
                    onChange={(e) => handlePositionChange(axis, e.target.value)}
                    className="w-full bg-slate-900 text-white font-mono text-center rounded px-1 py-0.5 text-xs border border-slate-700 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span>Rotação Horizontal (Ângulo Y)</span>
            <span className="text-amber-400 font-bold">{Math.round(transformData.rotation.y)}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={transformData.rotation.y}
            onChange={(e) => handleRotationYChange(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex items-center justify-between gap-1 pt-1">
            {[0, 90, 180, -90].map((deg) => (
              <button
                key={deg}
                onClick={() => handleRotationYChange(deg)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-medium border transition-colors ${
                  Math.round(transformData.rotation.y) === deg
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {deg >= 0 ? `${deg}°` : `${deg}°`}
              </button>
            ))}
          </div>
        </div>

        {/* Scale & Dimensions */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span>Escala & Tamanho</span>
            <span className="text-emerald-400 font-bold">
              {transformData.scale.x.toFixed(2)}x
            </span>
          </div>
          {/* Quick Uniform Scale Buttons */}
          <div className="flex items-center justify-between gap-1">
            {[0.75, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => handleScaleChange(s)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-medium border transition-colors ${
                  Math.abs(transformData.scale.x - s) < 0.05
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Individual Axis Scale */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">{axis}:</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="5"
                  value={transformData.scale[axis]}
                  onChange={(e) => handleScaleAxisChange(axis, e.target.value)}
                  className="w-full bg-transparent text-white font-mono text-center text-xs focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Smart Tips */}
        {isDrain && (
          <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Ajuste da Canaleta / Ralo Inox</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Arraste as setas do gizmo para posicionar o ralo em qualquer ponto do piso ou use o modo Escala para torná-lo mais longo ou largo.
            </p>
          </div>
        )}

        {isDemarcation && (
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Ajuste das Demarcações no Chão</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Você pode mover as faixas amarelas pelo chão, rotacionar para novas disposições ou escalar para expandir a área de segurança.
            </p>
          </div>
        )}

        {/* Action Buttons: Duplicate, Reset, Delete */}
        <div className="pt-1 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={onDuplicateSelected}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-sky-950/80 hover:bg-sky-900/80 border border-sky-500/50 hover:border-sky-400 text-sky-200 rounded-xl text-xs font-semibold transition-all shadow-sm"
            title="Criar uma cópia deste objeto na sala (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span>Duplicar</span>
          </button>

          <button
            onClick={onResetSelected}
            className="flex items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs transition-colors"
            title="Redefinir este objeto para a posição e tamanho original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDeleteSelected}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 hover:border-red-400 text-red-200 rounded-xl text-xs font-semibold transition-all"
            title="Excluir este item da sala (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
