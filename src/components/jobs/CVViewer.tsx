import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker for react-pdf v9
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'unknown'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    let blobUrl: string | null = null;
    let isMounted = true;

    const loadCV = async () => {
      if (!isOpen || !cvPath) return;

      setIsLoading(true);
      try {
        // Detect file type from path
        const extension = cvPath.toLowerCase().split('.').pop();
        const detectedType = extension === 'pdf' ? 'pdf' : extension === 'docx' || extension === 'doc' ? 'docx' : 'unknown';
        setFileType(detectedType);

        const { data, error } = await supabase.storage
          .from('cvs')
          .download(cvPath);

        if (error) throw error;

        if (!isMounted) return;

        setCvBlob(data);
        // Create a local blob URL for viewing (not shareable outside)
        blobUrl = URL.createObjectURL(data);
        setCvUrl(blobUrl);
      } catch (error: any) {
        if (!isMounted) return;
        
        toast({
          title: 'Eroare',
          description: 'Nu am putut încărca CV-ul',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCV();

    // Cleanup blob URL when component unmounts or dependencies change
    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, cvPath]);

  const handleDownload = () => {
    if (!cvBlob) return;

    const url = URL.createObjectURL(cvBlob);
    const a = document.createElement('a');
    a.href = url;
    const extension = cvPath.toLowerCase().split('.').pop() || 'pdf';
    a.download = `CV_${candidateName || 'candidate'}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'CV descărcat',
      description: 'CV-ul a fost descărcat cu succes',
    });
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {candidateName ? `CV - ${candidateName}` : 'Vizualizare CV'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Vizualizează sau descarcă CV-ul candidatului. Folosește controalele de zoom și navigare pentru PDF-uri.
            </DialogDescription>
            <div className="flex items-center gap-2">
              {numPages > 0 && fileType === 'pdf' && (
                <>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomIn}
                      disabled={scale >= 2.0}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="border-l h-6 mx-2" />
                </>
              )}
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
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : cvUrl && fileType === 'pdf' ? (
            <div className="flex flex-col items-center py-4">
              <Document
                file={cvUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-96 text-destructive gap-4">
                    <p>Eroare la încărcarea PDF-ului</p>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Descarcă CV
                    </Button>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>
              
              {numPages > 1 && (
                <div className="flex items-center gap-4 mt-4 bg-background border rounded-lg px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Pagina {pageNumber} din {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : cvUrl && fileType === 'docx' ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Document Word</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Fișierele Word (.docx) nu pot fi previzualizate în browser. 
                  Descarcă documentul pentru a-l vizualiza.
                </p>
              </div>
              <Button onClick={handleDownload} size="lg">
                <Download className="w-5 h-5 mr-2" />
                Descarcă CV ({candidateName || 'Candidat'})
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip fișier: Microsoft Word Document (.docx)
              </p>
            </div>
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
