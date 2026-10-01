import React from 'react';
import {
  Layers,
  Camera,
  FileText,
  Palette,
  Ruler,
  Cpu,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RenderMode, LightingPreset, WallVisibility } from '../../types/archviz';

interface HeaderNavProps {
  fps: number;
  renderMode: RenderMode;
  onSelectRenderMode: (mode: RenderMode) => void;
  lightingPreset: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
  wallVisibility: WallVisibility;
  onCycleWallVisibility: () => void;
  showDimensions: boolean;
  onToggleDimensions: () => void;
  onOpenMaterials: () => void;
  onOpenBlueprint: () => void;
  onTakeScreenshot: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  fps,
  wallVisibility,
  onCycleWallVisibility,
  showDimensions,
  onToggleDimensions,
  onOpenMaterials,
  onOpenBlueprint,
  onTakeScreenshot,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white select-none">
      {/* Title & Technical Specs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-sky-400 text-white font-bold text-xs tracking-wider shadow-sm">
          UE5
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">
              SALA DE LAVAGEM DE BINS 1000L
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 rounded">
              Lumen Realtime
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-amber-400 font-medium">7,24 m</span>
            <span>×</span>
            <span className="text-amber-400 font-medium">4,77 m</span>
            <span>·</span>
            <span>Pé Direito: <span className="text-amber-400 font-medium">3,00 m</span></span>
            <span>·</span>
            <span>Porta: <span className="text-sky-400 font-medium">3,50 m</span></span>
          </div>
        </div>
      </div>

      {/* Realtime Engine Metrics & Control Center */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        {/* FPS & Performance Metric */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-emerald-400 font-semibold">{fps} FPS</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px]">ACES Tone</span>
        </div>

        {/* Hide/Cutaway Walls Toggle Button */}
        <button
          onClick={onCycleWallVisibility}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-medium transition-colors shadow-sm ${
            wallVisibility === 'cutaway'
              ? 'bg-purple-950/70 border-purple-500/70 text-purple-300'
              : wallVisibility === 'none'
              ? 'bg-indigo-950/70 border-indigo-500/70 text-indigo-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
          }`}
          title="Ocultar paredes para ver apenas o interior da sala"
        >
          {wallVisibility === 'all' ? (
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span className="hidden sm:inline">
            {wallVisibility === 'all' ? 'Ver Paredes' : wallVisibility === 'cutaway' ? 'Corte Interno' : 'Sem Paredes'}
          </span>
        </button>

        {/* Technical Blueprint Modal Toggle */}
        <button
          onClick={onOpenBlueprint}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/60 rounded text-xs font-medium text-slate-200 transition-colors shadow-sm"
          title="Ver Planta Baixa e Desenho Técnico Original"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Planta CAD</span>
        </button>

        {/* 3D Dimensions Toggle */}
        <button
          onClick={onToggleDimensions}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-medium transition-colors shadow-sm ${
            showDimensions
              ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
          }`}
          title="Alternar Linhas de Cotas e Medidas em Tempo Real"
        >
          <Ruler className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Cotas 3D</span>
        </button>

        {/* Material & Lighting Configurator */}
        <button
          onClick={onOpenMaterials}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 rounded text-xs font-medium text-slate-200 transition-colors shadow-sm"
          title="Configurar Mármore, Inox, Piso Epóxi e Iluminação"
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Materiais & Luz</span>
        </button>

        {/* 4K Screenshot Capture */}
        <button
          onClick={onTakeScreenshot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
          title="Baixar Captura Arquitetônica em Alta Definição"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capturar Render</span>
        </button>
      </div>
    </header>
  );
};
