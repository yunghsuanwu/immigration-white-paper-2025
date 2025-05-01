import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file (MP3, WAV, etc.)');
      setSelectedFile(null);
      return;
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
        onClick={handleUploadClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="audio/*" 
          className="hidden"
        />
        <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
        <p className="text-slate-600 mb-1">
          {selectedFile ? selectedFile.name : 'Click to select an audio file'}
        </p>
        <p className="text-xs text-slate-500">
          Accepted formats: MP3, WAV, M4A, etc. (Max 50MB)
        </p>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-2 bg-red-50 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {selectedFile && (
        <div className="bg-slate-50 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-slate-500" />
            <div className="overflow-hidden">
              <p className="font-medium text-slate-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
          >
            Upload
          </Button>
        </div>
      )}
      
      {!selectedFile && (
        <div className="text-center pt-2">
          <Button 
            variant="outline" 
            onClick={handleUploadClick}
            icon={<Upload className="h-4 w-4" />}
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;