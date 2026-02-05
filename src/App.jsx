import React, { useState, useCallback, useEffect } from 'react';
import DropZone from './components/DropZone';
import ImageCard from './components/ImageCard';
import ModeSelector from './components/ModeSelector';
import SaveNotifications from './components/SaveNotifications';
import UpdateNotification from './components/UpdateNotification';
import { LogoIcon } from './components/Icons';
import { Download, Trash2, Loader2, Image, Zap, Upload } from 'lucide-react';

function App() {
  const [images, setImages] = useState([]);
  const [saveNotifications, setSaveNotifications] = useState([]);
  const [selectedMode, setSelectedMode] = useState('smart');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lossless, setLossless] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  const handleFilesAdded = useCallback((newFiles) => {
    const imageFiles = newFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      path: file.path,
      size: file.size,
      originalSize: file.size, // Keep original size for cumulative %
      preview: URL.createObjectURL(file),
      status: 'pending',
      result: null,
      processedData: null // base64 data after processing
    }));
    setImages(prev => [...prev, ...imageFiles]);
  }, []);

  // Notification handlers
  const addSaveNotification = useCallback((fileName, filePath) => {
    const id = Date.now() + Math.random();
    setSaveNotifications(prev => [...prev, { id, fileName, filePath }]);
  }, []);

  const removeSaveNotification = useCallback((id) => {
    setSaveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const openFolder = useCallback(async (filePath) => {
    await window.imageAPI.openFolder(filePath);
  }, []);

  // Global drag and drop handlers
  const handleGlobalDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGlobalDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsGlobalDragging(true);
    }
  }, []);

  const handleGlobalDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the window
    if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget)) {
      setIsGlobalDragging(false);
    }
  }, []);

  const handleGlobalDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      handleFilesAdded(files);
    }
  }, [handleFilesAdded]);

  // Prevent default browser behavior for drag/drop
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  }, [images]);

  // Process a single image
  const processImage = async (img, mode, width, height, isLossless) => {
    // Check if we're reprocessing (using processed data)
    const isReprocess = img.processedData !== null;
    const imageData = isReprocess ? img.processedData : img.path;
    const fileName = isReprocess ? img.result?.suggestedName || img.name : img.name;
    const quality = isLossless ? 100 : 80;

    let result;
    switch (mode) {
      case 'smart':
        result = await window.imageAPI.smartOptimize(imageData, fileName, isReprocess, quality);
        break;
      case 'webp':
        result = await window.imageAPI.convertToWebP(imageData, fileName, isReprocess, quality);
        break;
      case 'compress':
        result = await window.imageAPI.compressImage(imageData, fileName, isReprocess, quality);
        break;
      case 'resize':
        const w = width ? parseInt(width) : null;
        const h = height ? parseInt(height) : null;
        result = await window.imageAPI.resizeImage(imageData, fileName, isReprocess, w, h);
        break;
      default:
        result = { success: false, error: 'Unknown mode' };
    }
    return result;
  };

  const processImages = async () => {
    if (images.length === 0 || processing) return;
    setProcessing(true);

    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) {
      setProcessing(false);
      return;
    }

    // Set all pending images to processing state immediately
    setImages(prev => prev.map(item =>
      item.status === 'pending' ? { ...item, status: 'processing' } : item
    ));

    // Process all images concurrently
    const promises = pendingImages.map(async (img) => {
      try {
        const result = await processImage(img, selectedMode, resizeWidth, resizeHeight, lossless);

        if (result.success) {
          // Create preview URL from base64
          const mimeType = result.format === 'webp' ? 'image/webp' : 
                          result.format === 'png' ? 'image/png' : 'image/jpeg';
          const previewUrl = `data:${mimeType};base64,${result.base64}`;

          setImages(prev => prev.map(item =>
            item.id === img.id ? {
              ...item,
              status: 'done',
              result,
              processedData: result.base64,
              processedPreview: previewUrl,
              processedSize: result.finalSize,
              // Calculate cumulative savings from original
              cumulativeSavings: Math.round((1 - result.finalSize / item.originalSize) * 100)
            } : item
          ));
        } else {
          setImages(prev => prev.map(item =>
            item.id === img.id ? {
              ...item,
              status: 'error',
              result
            } : item
          ));
        }
      } catch (error) {
        setImages(prev => prev.map(item =>
          item.id === img.id ? {
            ...item,
            status: 'error',
            result: { success: false, error: error.message }
          } : item
        ));
      }
    });

    await Promise.all(promises);
    setProcessing(false);
  };

  // Reprocess a single image
  const reprocessImage = async (id) => {
    const img = images.find(i => i.id === id);
    if (!img || !img.processedData) return;

    setImages(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'processing' } : item
    ));

    try {
      const result = await processImage(img, selectedMode, resizeWidth, resizeHeight, lossless);

      if (result.success) {
        const mimeType = result.format === 'webp' ? 'image/webp' : 
                        result.format === 'png' ? 'image/png' : 'image/jpeg';
        const previewUrl = `data:${mimeType};base64,${result.base64}`;

        setImages(prev => prev.map(item =>
          item.id === id ? {
            ...item,
            status: 'done',
            result,
            processedData: result.base64,
            processedPreview: previewUrl,
            processedSize: result.finalSize,
            // Calculate cumulative savings from original
            cumulativeSavings: Math.round((1 - result.finalSize / item.originalSize) * 100),
            saved: false // Reset saved status so user can save the new version
          } : item
        ));
      } else {
        setImages(prev => prev.map(item =>
          item.id === id ? { ...item, status: 'error', result } : item
        ));
      }
    } catch (error) {
      setImages(prev => prev.map(item =>
        item.id === id ? {
          ...item,
          status: 'error',
          result: { success: false, error: error.message }
        } : item
      ));
    }
  };

  // Save processed image
  const saveImage = async (id) => {
    const img = images.find(i => i.id === id);
    if (!img || !img.processedData || !img.result) return;

    const result = await window.imageAPI.saveFile(
      img.processedData,
      img.result.suggestedName,
      img.result.format
    );

    if (result.success) {
      setImages(prev => prev.map(item =>
        item.id === id ? { ...item, saved: true } : item
      ));
      addSaveNotification(img.result.suggestedName, result.filePath);
    }
  };

  // Reset image to original state
  const resetImage = useCallback((id) => {
    setImages(prev => prev.map(item =>
      item.id === id ? {
        ...item,
        status: 'pending',
        result: null,
        processedData: null,
        processedPreview: null,
        processedSize: null,
        cumulativeSavings: null,
        saved: false
      } : item
    ));
  }, []);

  // Save all processed images
  const saveAllImages = async () => {
    const imagesToSave = images.filter(img => img.status === 'done' && !img.saved);
    if (imagesToSave.length === 0) return;

    const folderPath = await window.imageAPI.selectFolder();
    if (!folderPath) return;

    let savedCount = 0;
    for (const img of imagesToSave) {
      const result = await window.imageAPI.saveDirect(
        img.processedData,
        folderPath,
        img.result.suggestedName
      );

      if (result.success) {
        setImages(prev => prev.map(item =>
          item.id === img.id ? { ...item, saved: true } : item
        ));
        savedCount++;
        addSaveNotification(img.result.suggestedName, result.path);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pendingCount = images.filter(img => img.status === 'pending').length;
  const doneCount = images.filter(img => img.status === 'done').length;

  return (
    <div 
      className="min-h-screen p-8 relative"
      onDragOver={handleGlobalDragOver}
      onDragEnter={handleGlobalDragEnter}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Global Drop Overlay */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-12 rounded-3xl border-4 border-dashed border-gold-400 bg-gold-50/50">
            <div className="icon-container icon-container-lg mx-auto mb-6 bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold">
              <Upload className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gold-600 mb-2">Solte as imagens aqui!</h2>
            <p className="text-gray-500">Solte em qualquer lugar da tela</p>
          </div>
        </div>
      )}

      {/* Notifications */}
      <SaveNotifications
        notifications={saveNotifications}
        onRemove={removeSaveNotification}
        onOpenFolder={openFolder}
      />

      <UpdateNotification />

      {/* Background Pattern */}
      <div className="bg-pattern" />

      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <LogoIcon className="w-14 h-14 logo-icon" />
          <h1 className="text-5xl leading-snug font-bold gradient-text">ImgBuild</h1>
        </div>
        <p className="text-gray-500 text-lg">Processe suas imagens com facilidade</p>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Mode Selector */}
        <ModeSelector
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          resizeWidth={resizeWidth}
          resizeHeight={resizeHeight}
          onWidthChange={setResizeWidth}
          onHeightChange={setResizeHeight}
          lossless={lossless}
          onLosslessChange={setLossless}
          disabled={doneCount > 0}
        />

        {/* Drop Zone */}
        <DropZone onFilesAdded={handleFilesAdded} />

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="glass-card rounded-3xl p-6 fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-container">
                  <Image className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {images.length} {images.length === 1 ? 'Imagem' : 'Imagens'}
                  </h2>
                  {doneCount > 0 && (
                    <p className="text-sm text-green-600">
                      {doneCount} processada{doneCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {doneCount > 0 && images.some(img => img.status === 'done' && !img.saved) && (
                  <button
                    onClick={saveAllImages}
                    className="px-5 py-2.5 rounded-xl btn-success text-sm font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    Salvar todas
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-5 py-2.5 rounded-xl btn-danger text-sm font-semibold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                  Limpar tudo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-6">
              {images.map(img => (
                <ImageCard
                  key={img.id}
                  image={img}
                  onRemove={() => removeImage(img.id)}
                  onSave={() => saveImage(img.id)}
                  onReprocess={() => reprocessImage(img.id)}
                  onReset={() => resetImage(img.id)}
                  formatBytes={formatBytes}
                />
              ))}
            </div>

            {/* Process Button */}
            {pendingCount > 0 && (
              <button
                onClick={processImages}
                disabled={processing}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg transition-all
                  ${processing
                    ? 'bg-gray-200 text-gray-500 cursor-wait'
                    : 'btn-primary'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2} />
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" strokeWidth={2.5} />
                    Processar {pendingCount} {pendingCount === 1 ? 'Imagem' : 'Imagens'}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
