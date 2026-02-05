import React, { useState } from 'react';
import { 
  X, 
  Save, 
  RotateCw, 
  RotateCcw, 
  Eye, 
  Sparkles,
  Check,
  Loader2,
  ArrowRight
} from 'lucide-react';

function ImageCard({ image, onRemove, onSave, onReprocess, onReset, formatBytes }) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  const isProcessed = image.status === 'done' && image.processedPreview;
  const displayPreview = isProcessed && !showOriginal ? image.processedPreview : image.preview;

  const getStatusBadge = () => {
    switch (image.status) {
      case 'pending':
        return (
          <span className="badge badge-pending">
            Pendente
          </span>
        );
      case 'processing':
        return (
          <span className="badge badge-processing shimmer">
            Processando
          </span>
        );
      case 'done':
        return (
          <span className="badge badge-done">
            <Check className="w-3 h-3" strokeWidth={3} />
            Pronto
          </span>
        );
      case 'error':
        return (
          <span className="badge badge-error">
            <X className="w-3 h-3" strokeWidth={3} />
            Erro
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="image-card glass-card rounded-2xl overflow-hidden group">
      {/* Image Preview */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={displayPreview}
          alt={image.name}
          className="w-full h-full object-cover"
        />
        
        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-gray-500 
            hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all
            flex items-center justify-center shadow-lg backdrop-blur-sm"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Toggle Original/Processed */}
        {isProcessed && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="absolute top-2 left-2 px-3 py-1.5 rounded-full text-xs bg-white/90 text-gray-600
              hover:bg-white transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-sm font-medium"
          >
            {showOriginal ? (
              <>
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                Original
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-gold-500" strokeWidth={2} />
                Processada
              </>
            )}
          </button>
        )}

        {/* Processing Overlay */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">Processando...</span>
            </div>
          </div>
        )}

        {/* Saved Badge */}
        {image.saved && (
          <div className="absolute bottom-2 left-2 badge badge-saved shadow-lg">
            <Check className="w-3 h-3" strokeWidth={3} />
            Salvo
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-800 truncate flex-1" title={image.name}>
            {image.result?.suggestedName || image.name}
          </p>
          {getStatusBadge()}
        </div>

        {/* Size info */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            {isProcessed ? (
              <>
                <span>{formatBytes(image.originalSize)}</span>
                <ArrowRight className="w-3 h-3 text-gold-500" strokeWidth={2.5} />
                <span className="font-medium text-gray-700">{formatBytes(image.processedSize)}</span>
              </>
            ) : (
              formatBytes(image.size)
            )}
          </span>
          {isProcessed && image.cumulativeSavings > 0 && (
            <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              -{image.cumulativeSavings}%
            </span>
          )}
        </div>

        {/* Error message */}
        {image.status === 'error' && image.result?.error && (
          <p className="text-xs text-red-500 truncate bg-red-50 px-2 py-1 rounded" title={image.result.error}>
            {image.result.error}
          </p>
        )}

        {/* Action Buttons */}
        {isProcessed && (
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={image.saved}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2
                  ${image.saved 
                    ? 'btn-success cursor-default'
                    : 'btn-primary'
                  }`}
              >
                {image.saved ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    Salvo
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={2} />
                    Salvar
                  </>
                )}
              </button>
              <button
                onClick={onReprocess}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold btn-secondary flex items-center justify-center gap-2"
                title="Comprimir mais a imagem atual"
              >
                <RotateCw className="w-4 h-4" strokeWidth={2} />
                + Compactar
              </button>
            </div>
            <button
              onClick={onReset}
              className="w-full py-2.5 rounded-xl text-xs font-semibold btn-secondary flex items-center justify-center gap-2"
              title="Voltar à imagem original para usar outro modo"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
              Resetar (usar outro modo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageCard;
