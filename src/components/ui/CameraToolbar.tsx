import React from 'react';
import {
  RotateCcw,
  Footprints,
  Compass,
  DoorOpen,
  DoorClosed,
  Droplet,
  Eye,
  EyeOff,
  Ruler,
  Crosshair,
  Waves,
  MapPin,
  Move,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { CameraMode, CameraPreset, WallVisibility } from '../../types/archviz';

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'reference_render',
    label: 'Vista da Foto de Referência',
    position: [0.65, 3.35, 5.05],
    target: [-0.25, 1.15, -0.45],
    fov: 48,
  },
  {
    id: 'overview',
    label: 'Visão Geral 3D',
    position: [4.4, 3.8, 4.8],
    target: [0, 1.2, 0],
  },
  {
    id: 'bins_area',
    label: 'Área Bins 1000L',
    position: [-0.6, 2.1, 0.2],
    target: [-2.55, 1.3, 0.0],
  },
  {
    id: 'overhead_pipes',
    label: 'Tubulações Água & Ar',
    position: [-1.1, 2.4, 0.0],
    target: [-2.55, 2.5, 0.0],
  },
  {
    id: 'floor_drain',
    label: 'Canaleta Dreno Inox',
    position: [-1.4, 1.5, 0.0],
    target: [-2.55, 0.1, 0.0],
  },
  {
    id: 'marble_counter',
    label: 'Bancada 3m & Cuba Profunda',
    position: [0.85, 1.6, -0.6],
    target: [0.85, 1.0, -2.1],
  },
  {
    id: 'platform_wash',
    label: 'Escada Plataforma Inox',
    position: [-0.3, 1.9, -0.3],
    target: [-1.4, 1.2, 0.0],
  },
  {
    id: 'shelving_area',
    label: 'Armário de Canto cGMP',
    position: [1.6, 1.7, -0.8],
    target: [2.88, 1.2, -2.1],
  },
  {
    id: 'sliding_door',
    label: 'Porta Correr 3,5m',
    position: [1.2, 1.6, 0.8],
    target: [1.7, 1.2, 2.3],
  },
];

interface CameraToolbarProps {
  cameraMode: CameraMode;
  onSelectCameraMode: (mode: CameraMode) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: CameraPreset) => void;
  isDoorOpen: boolean;
  onToggleDoor: () => void;
  isTapActive: boolean;
  onToggleTap: () => void;
  isCipActive: boolean;
  onToggleCip: () => void;
  showHotspots?: boolean;
  onToggleHotspots?: () => void;
  wallVisibility: WallVisibility;
  onCycleWallVisibility: () => void;
  isMeasuring: boolean;
  onToggleMeasure: () => void;
  measuredDistance: number | null;
  isOutlinerOpen?: boolean;
  onToggleOutliner?: () => void;
  hasSelectedItem?: boolean;
  lockCameraRotation?: boolean;
  onToggleLockCameraRotation?: () => void;
}

export const CameraToolbar: React.FC<CameraToolbarProps> = ({
  cameraMode,
  onSelectCameraMode,
  activePresetId,
  onSelectPreset,
  isDoorOpen,
  onToggleDoor,
  isTapActive,
  onToggleTap,
  isCipActive,
  onToggleCip,
  showHotspots,
  onToggleHotspots,
  wallVisibility,
  onCycleWallVisibility,
  isMeasuring,
  onToggleMeasure,
  measuredDistance,
  isOutlinerOpen,
  onToggleOutliner,
  hasSelectedItem,
  lockCameraRotation = false,
  onToggleLockCameraRotation,
}) => {
  const getWallLabel = () => {
    if (wallVisibility === 'all') return 'Paredes: Todas';
    if (wallVisibility === 'cutaway') return 'Paredes: Corte';
    return 'Paredes: Ocultas';
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[96vw]">
      {/* Tape measurement output pill */}
      {isMeasuring && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-950/90 border border-sky-400/50 rounded-full text-xs font-mono text-sky-200 shadow-lg backdrop-blur-md animate-pulse">
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {measuredDistance !== null
              ? `Distância Medida: ${measuredDistance.toFixed(2)} m`
              : 'Clique no primeiro ponto e depois no segundo ponto para medir'}
          </span>
        </div>
      )}

      {/* Main floating action dock */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-x-auto max-w-full">
        {/* Navigation Mode Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectCameraMode('orbit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraMode === 'orbit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Órbita 360 Livre (Damping Ativo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Órbita</span>
          </button>

          <button
            onClick={() => onSelectCameraMode('walkthrough')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraMode === 'walkthrough'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Primeira Pessoa (WASD ou Setas)"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Walkthrough</span>
          </button>

          <button
            onClick={() => onSelectCameraMode('top')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraMode === 'top'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista Superior Planta Baixa"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Planta</span>
          </button>
        </div>

        <div className="w-[1px] h-6 bg-slate-800 mx-1 hidden sm:block" />

        {/* Camera Presets */}
        <div className="hidden xl:flex items-center gap-1">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activePresetId === preset.id
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Testar Lavagem CIP Simulation Toggle */}
        <button
          onClick={onToggleCip}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isCipActive
              ? 'bg-sky-950/90 border-sky-400 text-sky-300 shadow-md animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title="Simulação de Lavagem CIP: ativa jatos pressurizados d'água das tubulações para dentro dos Bins 1000L"
        >
          <Waves className={`w-3.5 h-3.5 ${isCipActive ? 'text-sky-400 animate-bounce' : 'text-slate-400'}`} />
          <span>{isCipActive ? 'Lavagem CIP Ativa' : 'Testar Lavagem CIP'}</span>
        </button>

        {/* 3D Layout Editor / Outliner Toggle */}
        <button
          onClick={onToggleOutliner}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
            isOutlinerOpen || hasSelectedItem
              ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold shadow-md shadow-sky-500/30'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-sky-500/60 text-sky-300'
          }`}
          title="Editar posições, rotações, tamanhos, demarcações e ralo 3D"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Editor de Layout</span>
        </button>

        {/* Lock Screen Rotation Toggle */}
        <button
          onClick={onToggleLockCameraRotation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
            lockCameraRotation
              ? 'bg-rose-950/80 border-rose-500/70 text-rose-300 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title={lockCameraRotation ? 'Giro da Tela Travado: clique para destravar o giro da câmera' : 'Travar giro da tela para facilitar a edição'}
        >
          {lockCameraRotation ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{lockCameraRotation ? 'Tela Travada' : 'Giro Livre'}</span>
        </button>

        {/* Wall Visibility Cutaway Program Toggle */}
        <button
          onClick={onCycleWallVisibility}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            wallVisibility === 'cutaway'
              ? 'bg-purple-950/70 border-purple-500/70 text-purple-300'
              : wallVisibility === 'none'
              ? 'bg-indigo-950/70 border-indigo-500/70 text-indigo-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title="Ocultar paredes para visualização interna sem obstáculos"
        >
          {wallVisibility === 'all' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-purple-400" />}
          <span>{getWallLabel()}</span>
        </button>

        {/* Tap Water Active Toggle */}
        <button
          onClick={onToggleTap}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isTapActive
              ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Ligar ou desligar a torneira hospitalar"
        >
          <Droplet className={`w-3.5 h-3.5 ${isTapActive ? 'text-sky-400 fill-sky-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{isTapActive ? 'Pia Ligada' : 'Pia Desligada'}</span>
        </button>

        {/* Sliding Door Toggle */}
        <button
          onClick={onToggleDoor}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isDoorOpen
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title="Abrir ou fechar a porta de correr de 3,50 metros"
        >
          {isDoorOpen ? <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> : <DoorClosed className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isDoorOpen ? 'Porta 3,5m Aberta' : 'Porta Fechada'}</span>
        </button>

        {/* Tape Measure Tool */}
        <button
          onClick={onToggleMeasure}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isMeasuring
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title="Fita Métrica: Clique em dois pontos para medir em metros"
        >
          <Ruler className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Medir</span>
        </button>
      </div>
    </div>
  );
};
