import { useState, useCallback } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_CV_SIZE, ALLOWED_CV_TYPES } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface CVUploadProps {
  onFileSelect: (file: File | null) => void;
  onUploadComplete?: (cvUrl: string) => void;
  uploadPath?: string;
  error?: string;
}

export const CVUpload = ({ onFileSelect, onUploadComplete, uploadPath = 'guest-applications', error }: CVUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      return 'Tipul fișierului nu este permis. Te rugăm să încarci un fișier PDF, DOC sau DOCX.';
    }
    if (file.size > MAX_CV_SIZE) {
      return `Fișierul este prea mare. Dimensiunea maximă este ${MAX_CV_SIZE / (1024 * 1024)}MB.`;
    }
    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setUploadError(null);
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    onFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    onFileSelect(null);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uploadPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Simulate upload progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from('cvs')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      if (onUploadComplete) {
        onUploadComplete(data.path);
      }

      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(err instanceof Error ? err.message : 'Eroare la încărcarea fișierului');
    }
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-3">
      {/* Drag & Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${selectedFile ? 'bg-secondary/50' : 'bg-background'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Încarcă CV-ul tău</p>
              <p className="text-xs text-muted-foreground mt-1">
                Trage și plasează sau click pentru a selecta
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX (max {MAX_CV_SIZE / (1024 * 1024)}MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-3">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Se încarcă... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="flex items-start space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{displayError}</p>
        </div>
      )}

      {/* Helper Text */}
      {!selectedFile && !displayError && (
        <p className="text-xs text-muted-foreground">
          Fișierele permise: PDF, DOC, DOCX. Dimensiune maximă: {MAX_CV_SIZE / (1024 * 1024)}MB
        </p>
      )}
    </div>
  );
};
