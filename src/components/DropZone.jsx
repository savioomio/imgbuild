import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

function DropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onFilesAdded(files);
    }
    e.target.value = '';
  }, [onFilesAdded]);

  return (
    <div
      className={`
        drop-zone glass-card rounded-2xl p-12 border-2 border-dashed cursor-pointer
        ${isDragging
          ? 'border-gold-400 bg-gold-50/50 dragover'
          : 'border-gray-300 hover:border-gold-300'
        }
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="text-center">
        <div className={`
          icon-container icon-container-lg mx-auto mb-6 transition-all duration-300
          ${isDragging ? 'scale-110 bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold' : ''}
        `}>
          <Upload className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <p className={`text-lg font-semibold mb-2 transition-colors ${isDragging ? 'text-gold-600' : 'text-gray-700'}`}>
          {isDragging ? 'Solte as imagens aqui!' : 'Arraste imagens aqui'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou clique para selecionar
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="px-2 py-1 rounded-full bg-gray-100">PNG</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">JPG</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">JPEG</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">WebP</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">GIF</span>
        </div>
      </div>
    </div>
  );
}

export default DropZone;
