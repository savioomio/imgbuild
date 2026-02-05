import React from 'react';
import logoSrc from '../assets/logo.png'; // Importando para garantir o caminho correto no build

// Logo usando a imagem icon.png
export const LogoIcon = ({ className = "w-12 h-12" }) => (
  <img 
    src={logoSrc} 
    alt="ImgBuild Logo" 
    className={`${className} logo-icon`}
  />
);

// Re-export Lucide icons with custom names for convenience
export { 
  Zap as SmartIcon,
  RefreshCw as ConvertIcon,
  Minimize2 as CompressIcon,
  Maximize2 as ResizeIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  RotateCw as ReprocessIcon,
  RotateCcw as ResetIcon,
  X as CloseIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  Sparkles as SparkleIcon,
  Download as DownloadAllIcon,
  Loader2 as SpinnerIcon,
  ArrowRight as ArrowRightIcon,
  Image as ImageIcon,
  Settings as QualityIcon,
  ImagePlus as UploadImageIcon
} from 'lucide-react';
