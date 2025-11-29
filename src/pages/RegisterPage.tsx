import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Building } from 'lucide-react';
import { useState } from 'react';

const RegisterPage = () => {
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl mb-2">
              Creează cont
            </h1>
            <p className="text-muted-foreground">
              Începe să aplici la joburi în mai puțin de 30 de secunde
            </p>
          </div>

          <Card className="p-6 border border-border shadow-card">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-smooth ${
                  role === 'candidate'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Candidat
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-smooth ${
                  role === 'employer'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Angajator
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Nume complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ion Popescu"
                    className="pl-10"
                  />
                </div>
              </div>

              {role === 'employer' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                    Nume companie
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Tech Company SRL"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmă parola
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-button transition-smooth">
                Creează cont
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Ai deja cont?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Intră în cont
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default RegisterPage;
