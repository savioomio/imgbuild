import React, { useState, useEffect } from 'react';
import { FolderOpen, X, Check } from 'lucide-react';

function SaveNotification({ notification, onRemove, onOpenFolder }) {
  const [progress, setProgress] = useState(100);
  const duration = 10000; // 10 seconds
  const intervalTime = 50; // Update every 50ms for smooth animation

  useEffect(() => {
    const decrementAmount = (intervalTime / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - decrementAmount));
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 0) {
      // Use setTimeout to ensure we're out of the render cycle
      const timeout = setTimeout(() => {
        onRemove(notification.id);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [progress, notification.id, onRemove]);

  const handleOpenFolder = () => {
    onOpenFolder(notification.filePath);
  };

  return (
    <div className="save-notification glass-card rounded-xl overflow-hidden shadow-lg border border-green-200 fade-in-up">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Success icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 mb-0.5">
              Imagem salva!
            </p>
            <p className="text-xs text-gray-500 truncate" title={notification.fileName}>
              {notification.fileName}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFolder}
              className="p-2 rounded-lg bg-gold-50 text-gold-600 hover:bg-gold-100 transition-colors"
              title="Abrir pasta"
            >
              <FolderOpen className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => onRemove(notification.id)}
              className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveNotifications({ notifications, onRemove, onOpenFolder }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map(notification => (
        <SaveNotification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          onOpenFolder={onOpenFolder}
        />
      ))}
    </div>
  );
}

export default SaveNotifications;
