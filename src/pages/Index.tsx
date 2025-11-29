import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Zap, Clock, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Aplică instant la joburi în tech
            </div>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
              Aplică la joburi în{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                &lt;30 secunde
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Fără formularе interminabile. Fără pierderi de timp. 
              Doar tu și jobul potrivit în câteva click-uri.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-3 p-2 rounded-2xl bg-background shadow-glow border border-border">
                <div className="flex-1 flex items-center gap-2 px-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Caută poziție sau tehnologie..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button size="lg" className="bg-gradient-primary hover:shadow-button transition-smooth md:w-auto w-full">
                  <Search className="w-5 h-5 mr-2" />
                  Caută joburi
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  &lt;30s
                </div>
                <p className="text-sm text-muted-foreground">Timp mediu aplicare</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  100+
                </div>
                <p className="text-sm text-muted-foreground">Joburi active</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <p className="text-sm text-muted-foreground">Aplicări de succes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              De ce joben.eu?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simplificăm procesul de aplicare la joburi pentru că timpul tău este prețios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-smooth">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Rapid ca fulgerul
              </h3>
              <p className="text-muted-foreground">
                Aplică în mai puțin de 30 de secunde. Un click, un CV, gata.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-smooth">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Fără formularе
              </h3>
              <p className="text-muted-foreground">
                Nu mai completa aceleași informații de zeci de ori. Salvăm tot automat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-smooth">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Doar joburi relevante
              </h3>
              <p className="text-muted-foreground">
                Filtrăm joburile să găsești exact ce cauți. Remote, hybrid sau onsite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            Gata să-ți găsești jobul perfect?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Înregistrează-te acum și aplică la primul job în mai puțin de un minut
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="shadow-button">
              Înregistrare gratuită
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              Vezi joburi
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
