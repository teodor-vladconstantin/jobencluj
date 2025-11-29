import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl mb-2">
              Intră în cont
            </h1>
            <p className="text-muted-foreground">
              Bine ai revenit! Loghează-te pentru a continua.
            </p>
          </div>

          <Card className="p-6 border border-border shadow-card">
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nume@exemplu.ro"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Parolă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-button transition-smooth">
                Intră în cont
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Nu ai cont?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Înregistrează-te
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
