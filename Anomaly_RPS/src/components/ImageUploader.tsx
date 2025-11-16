import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const ImageUploader = ({ onImageUpload, isProcessing }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-police-saffron bg-police-saffron/5' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-12 w-12 text-police-navy" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-police-navy">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</div>
        </div>
      </div>
      <Button
        onClick={onButtonClick}
        disabled={isProcessing}
        className="w-full police-button-primary"
      >
        {isProcessing ? 'Processing...' : 'Upload Image'}
      </Button>
    </div>
  );
};

export default ImageUploader;