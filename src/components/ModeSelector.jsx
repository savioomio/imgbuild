import React from 'react';
import { Zap, RefreshCw, Minimize2, Maximize2, Lock, Settings } from 'lucide-react';

const modes = [
  {
    id: 'smart',
    Icon: Zap,
    title: 'Otimização Inteligente',
    description: 'Compacta + converte para WebP automaticamente se ficar menor'
  },
  {
    id: 'webp',
    Icon: RefreshCw,
    title: 'Converter para WebP',
    description: 'Apenas converte para o formato WebP'
  },
  {
    id: 'compress',
    Icon: Minimize2,
    title: 'Comprimir',
    description: 'Compacta ao máximo mantendo qualidade visual'
  },
  {
    id: 'resize',
    Icon: Maximize2,
    title: 'Redimensionar',
    description: 'Altera para o tamanho desejado'
  }
];

function ModeSelector({
  selectedMode,
  onModeChange,
  resizeWidth,
  resizeHeight,
  onWidthChange,
  onHeightChange,
  lossless,
  onLosslessChange,
  disabled
}) {
  return (
    <div className="space-y-4 relative">

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 z-50 locked-overlay rounded-2xl flex flex-col items-center justify-center text-center p-6">
          <div className="glass-card p-6 rounded-2xl border-2 border-gold-400/30 shadow-xl max-w-sm">
            <div className="icon-container icon-container-lg mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gold-700 mb-2">Modo Bloqueado</h3>
            <p className="text-sm text-gray-500">
              Para trocar de modo, limpe ou resete as imagens processadas.
            </p>
          </div>
        </div>
      )}
      
      {/* Mode Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              mode-card glass-card rounded-2xl p-5 text-left border-2 transition-all
              ${selectedMode === mode.id
                ? 'border-gold-400 selected'
                : 'border-transparent hover:border-gold-200'
              }
            `}
          >
            <div className="icon-container mb-4">
              <mode.Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-gray-800">{mode.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Quality Toggle */}
      <div className="glass-card rounded-2xl p-5 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-container">
              <Settings className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-0.5">Modo de Qualidade</h3>
              <p className="text-xs text-gray-500">
                {lossless 
                  ? 'Sem perda de qualidade (arquivo maior)'
                  : 'Menor arquivo (perda imperceptível)'
                }
              </p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${!lossless ? 'text-gold-600' : 'text-gray-400'}`}>
              Menor
            </span>
            <button
              onClick={() => onLosslessChange(!lossless)}
              className={`
                toggle-track
                ${lossless 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-gold-400 to-gold-500'
                }
              `}
            >
              <div
                className={`
                  toggle-thumb
                  ${lossless ? 'left-[31px]' : 'left-[3px]'}
                `}
              />
            </button>
            <span className={`text-xs font-medium ${lossless ? 'text-green-600' : 'text-gray-400'}`}>
              Sem perda
            </span>
          </div>
        </div>
      </div>

      {/* Resize Options */}
      {selectedMode === 'resize' && (
        <div className="glass-card rounded-2xl p-5 mt-4 fade-in-up">
          <h3 className="font-medium mb-4 text-gray-700">Dimensões (deixe vazio para manter proporção)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Largura (px)</label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => onWidthChange(e.target.value)}
                placeholder="Ex: 800"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Altura (px)</label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => onHeightChange(e.target.value)}
                placeholder="Ex: 600"
                className="input-field w-full"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-500" />
            Se preencher apenas uma dimensão, a outra será calculada automaticamente mantendo a proporção original.
          </p>
        </div>
      )}
    </div>
  );
}

export default ModeSelector;
