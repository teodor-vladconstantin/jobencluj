import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="font-heading font-extrabold text-8xl bg-gradient-primary bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="font-heading font-bold text-3xl mb-4">
              Pagina nu există
            </h2>
            <p className="text-muted-foreground text-lg">
              Ne pare rău, dar pagina pe care o cauți nu poate fi găsită. 
              Poate a fost mutată sau nu a existat niciodată.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-primary hover:shadow-button transition-smooth">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Înapoi acasă
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">
                <Search className="w-5 h-5 mr-2" />
                Caută joburi
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
