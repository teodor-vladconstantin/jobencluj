import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Eye, CheckCircle2, Zap, Users, TrendingUp, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Despre <span className="text-gradient-primary">joben.eu</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conectăm talente cu oportunități în România
          </p>
        </div>

        {/* Misiune și Viziune */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Misiune */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Misiunea noastră</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Misiunea noastră este să simplificăm procesul de căutare a unui loc de muncă și de recrutare, oferind o platformă intuitivă, rapidă și accesibilă pentru toți profesioniștii din România, indiferent de domeniul de activitate.
              </p>
            </CardContent>
          </Card>

          {/* Viziune */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Viziunea noastră</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Viziunea noastră este să devenim principala platformă de conectare între talente și oportunități profesionale în România, unde fiecare candidat găsește jobul potrivit și fiecare angajator găsește candidatul ideal, într-un mod simplu, transparent și eficient.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Valori */}
        <div className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Valorile noastre</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Transparență */}
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transparență</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ Informații clare despre joburi</li>
                  <li>✓ Salariu vizibil (când angajatorul alege)</li>
                  <li>✓ Proces simplu de aplicare</li>
                </ul>
              </CardContent>
            </Card>

            {/* Simplitate */}
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Simplitate</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ Fără formulare interminabile</li>
                  <li>✓ One-click apply pentru candidați autentificați</li>
                  <li>✓ Interface intuitivă</li>
                </ul>
              </CardContent>
            </Card>

            {/* Incluziune */}
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Incluziune</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ Job board general, nu limitat la tech</li>
                  <li>✓ Oportunități pentru toate nivelurile</li>
                  <li>✓ Accesibil pentru toți profesioniștii</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pentru Candidați și Angajatori */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Pentru Candidați */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Pentru Candidați</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Găsește jobul potrivit din toate industriile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Aplică rapid cu un singur click</span>
                </li>
              </ul>
              <Button className="w-full mt-6" asChild>
                <Link to="/register">Creează cont candidat</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pentru Angajatori */}
          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Pentru Angajatori</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Găsește candidați calificați rapid și eficient</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Postează joburi în câteva minute</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gestionează aplicațiile într-un singur loc</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Contactează candidații potriviți</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link to="/register">Creează cont angajator</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Ai întrebări sau sugestii?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Suntem aici să te ajutăm. Contactează-ne și îți vom răspunde în cel mai scurt timp.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Contactează-ne
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AboutUs;
