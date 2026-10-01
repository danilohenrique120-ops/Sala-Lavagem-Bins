import React from 'react';
import { Footprints, MousePointer, Move, ZoomIn } from 'lucide-react';
import { CameraMode } from '../../types/archviz';

interface WalkthroughGuideProps {
  cameraMode: CameraMode;
}

export const WalkthroughGuide: React.FC<WalkthroughGuideProps> = ({ cameraMode }) => {
  if (cameraMode === 'walkthrough') {
    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-slate-300 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 font-mono">
            <Footprints className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200">W A S D</span>
            <span className="text-slate-500">ou</span>
            <span className="font-semibold text-slate-200">Setas</span>
            <span className="text-slate-400 text-[11px]">(Mover)</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5 font-mono">
            <MousePointer className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Arrastar</span>
            <span className="text-slate-400 text-[11px]">(Olhar)</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5 font-mono text-purple-300">
            <Move className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Shift + Arrastar</span>
            <span className="text-slate-400 text-[11px]">(Pan H/V)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none hidden md:block">
      <div className="flex items-center gap-3 px-3.5 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl text-[11.5px] text-slate-400 shadow-lg">
        <div className="flex items-center gap-1 text-slate-300 font-mono">
          <MousePointer className="w-3 h-3 text-sky-400" />
          <span>Arrastar: Órbita</span>
        </div>
        <span className="text-slate-600">·</span>
        <div className="flex items-center gap-1 text-purple-300 font-mono font-medium">
          <Move className="w-3 h-3 text-purple-400" />
          <span>Shift + Arrastar: Mover Câmera (Pan H/V)</span>
        </div>
        <span className="text-slate-600">·</span>
        <div className="flex items-center gap-1 text-slate-300 font-mono">
          <ZoomIn className="w-3 h-3 text-amber-400" />
          <span>Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
