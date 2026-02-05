import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, AlertCircle } from 'lucide-react';

function UpdateNotification() {
  const [updateStatus, setUpdateStatus] = useState(null); // 'available', 'downloading', 'downloaded', 'error'
  const [progress, setProgress] = useState(0);
  const [versionInfo, setVersionInfo] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for update status
    window.updaterAPI?.onUpdateStatus((data) => {
      console.log('Update status:', data);
      
      if (data.status === 'available') {
        setUpdateStatus('available');
        setVersionInfo(data.info);
        setShow(true);
      } else if (data.status === 'downloaded') {
        setUpdateStatus('downloaded');
        setShow(true);
      } else if (data.status === 'error') {
        console.error('Update error:', data.error);
        setUpdateStatus('error');
      }
    });

    // Listen for progress
    window.updaterAPI?.onUpdateProgress((data) => {
      setUpdateStatus('downloading');
      setProgress(data.percent);
    });

    return () => {
      window.updaterAPI?.removeListeners();
    };
  }, []);

  const handleDownload = () => {
    window.updaterAPI.downloadUpdate();
    setUpdateStatus('downloading');
  };

  const handleInstall = () => {
    window.updaterAPI.quitAndInstall();
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full glass-card rounded-xl border border-gold-200 shadow-xl fade-in-up p-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gold-100 rounded-full text-gold-600">
          <RefreshCw className={`w-6 h-6 ${updateStatus === 'downloading' ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">
            {updateStatus === 'available' && 'Nova versão disponível!'}
            {updateStatus === 'downloading' && 'Baixando atualização...'}
            {updateStatus === 'downloaded' && 'Atualização pronta!'}
            {updateStatus === 'error' && 'Erro na atualização'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3">
            {updateStatus === 'available' && `Versão ${versionInfo?.version} está disponível.`}
            {updateStatus === 'downloading' && `${Math.round(progress)}% concluído`}
            {updateStatus === 'downloaded' && 'Reinicie para instalar a nova versão.'}
            {updateStatus === 'error' && 'Tente novamente mais tarde.'}
          </p>

          {/* Progress Bar */}
          {updateStatus === 'downloading' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div 
                className="bg-gold-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}

          <div className="flex gap-2">
            {updateStatus === 'available' && (
              <button 
                onClick={handleDownload}
                className="btn-primary py-1.5 px-3 text-sm rounded-lg flex items-center gap-2"
              >
                <Download className="w-3 h-3" /> Baixar
              </button>
            )}
            
            {updateStatus === 'downloaded' && (
              <button 
                onClick={handleInstall}
                className="btn-success py-1.5 px-3 text-sm rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Reiniciar e Instalar
              </button>
            )}

            <button 
              onClick={handleClose}
              className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>

        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default UpdateNotification;
