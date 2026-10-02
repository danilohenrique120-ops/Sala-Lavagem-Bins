import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RotateCcw,
  Download,
  Upload,
  X,
  Move,
  Package,
  Check,
} from 'lucide-react';
import { SceneItemMeta } from '../../types/editor';

interface SceneOutlinerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SceneItemMeta[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (type: 'bin' | 'drain' | 'demarcation') => void;
  onResetAll: () => void;
  onExportLayout: () => void;
  onImportLayout: () => void;
}

export const SceneOutlinerDrawer: React.FC<SceneOutlinerDrawerProps> = ({
  isOpen,
  onClose,
  items,
  selectedId,
  onSelectItem,
  onToggleVisibility,
  onDeleteItem,
  onAddItem,
  onResetAll,
  onExportLayout,
  onImportLayout,
}) => {
  if (!isOpen) return null;

  const visibleCount = items.filter((i) => i.visible).length;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 max-w-[92vw] bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Itens da Sala & Layout 3D
            </h2>
            <div className="text-[11px] text-slate-400 font-mono">
              {visibleCount} de {items.length} itens visíveis
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Bar */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
          Adicionar Novos Elementos
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onAddItem('bin')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 hover:border-blue-400 text-blue-200 rounded-lg text-[11px] font-medium transition-colors"
            title="Adicionar mais um Bin 1000L na sala"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Bin 1000L</span>
          </button>
          <button
            onClick={() => onAddItem('drain')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 rounded-lg text-[11px] font-medium transition-colors"
            title="Adicionar canaleta linear de ralo inox no piso"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Ralo Inox</span>
          </button>
          <button
            onClick={() => onAddItem('demarcation')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 hover:border-amber-400 text-amber-200 rounded-lg text-[11px] font-medium transition-colors"
            title="Adicionar nova faixa de demarcação no chão"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Demarcação</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-950/70 border-sky-400/80 shadow-md text-white'
                  : item.visible
                  ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                  : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : item.visible
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isCustom && (
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-mono">
                        Novo
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {item.category}
                  </div>
                </div>
              </div>

              {/* Action buttons per row */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleVisibility(item.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.visible
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'hover:bg-slate-800 text-amber-400'
                  }`}
                  title={item.visible ? 'Ocultar elemento' : 'Mostrar elemento'}
                >
                  {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                  title="Excluir item da sala"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls: Reset & Export */}
      <div className="p-4 border-t border-slate-800/90 bg-slate-900/80 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAll}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            title="Restaurar posições, rotações, escalas e itens padrão da sala"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={onExportLayout}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            title="Baixar arquivo JSON com as posições e customizações do layout"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Salvar JSON</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center font-mono">
          Clique em qualquer item na tela ou na lista para mover, rotacionar ou redimensionar.
        </p>
      </div>
    </div>
  );
};
