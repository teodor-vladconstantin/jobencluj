import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CVViewerProps {
  cvPath: string;
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export const CVViewer = ({ cvPath, isOpen, onClose, candidateName }: CVViewerProps) => {
  const [cvBlob, setCvBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCV = async () => {
      if (!isOpen || !cvPath) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from('cvs')
          .download(cvPath);

        if (error) throw error;

        setCvBlob(data);
        // Create a local blob URL for viewing (not shareable outside)
        const url = URL.createObjectURL(data);
        setCvUrl(url);
      } catch (error: any) {
        console.error('Error loading CV:', error);
        toast({
          title: 'Eroare',
          description: 'Nu am putut încărca CV-ul',
          variant: 'destructive',
        });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadCV();

    // Cleanup blob URL when component unmounts
    return () => {
      if (cvUrl) {
        URL.revokeObjectURL(cvUrl);
      }
    };
  }, [isOpen, cvPath]);

  const handleDownload = () => {
    if (!cvBlob) return;

    const url = URL.createObjectURL(cvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${candidateName || 'candidate'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'CV descărcat',
      description: 'CV-ul a fost descărcat cu succes',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {candidateName ? `CV - ${candidateName}` : 'Vizualizare CV'}
            </DialogTitle>
            {cvBlob && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Descarcă
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : cvUrl ? (
            <iframe
              src={cvUrl}
              className="w-full h-full border-0"
              title="CV Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nu s-a putut încărca CV-ul
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
