import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Contactează-ne</h1>
          <p className="text-lg text-muted-foreground">
            Ai întrebări sau sugestii? Suntem aici să te ajutăm!
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Email Icon */}
              <div className="p-4 bg-primary/10 rounded-full">
                <Mail className="w-8 h-8 text-primary" />
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Trimite-ne un email</h2>
                <p className="text-muted-foreground">
                  Pentru întrebări generale, suport tehnic sau raportare probleme, ne poți contacta la:
                </p>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <a
                    href="mailto:contact@joben.eu"
                    className="text-xl font-semibold text-primary hover:underline"
                  >
                    contact@joben.eu
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                <Clock className="w-4 h-4" />
                <span>Timp de răspuns: 24-48 ore în zile lucrătoare</span>
              </div>

              {/* CTA Button */}
              <Button size="lg" asChild className="mt-6">
                <a href="mailto:contact@joben.eu">
                  <Mail className="w-4 h-4 mr-2" />
                  Trimite email
                </a>
              </Button>

              {/* Additional Info */}
              <div className="pt-6 border-t w-full">
                <h3 className="font-semibold mb-3">Subiecte frecvente:</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ Întrebări generale despre platformă</li>
                  <li>✓ Suport tehnic și probleme de cont</li>
                  <li>✓ Raportare joburi neconforme</li>
                  <li>✓ Solicitări GDPR (acces, ștergere date)</li>
                  <li>✓ Feedback și sugestii de îmbunătățire</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Contact;
