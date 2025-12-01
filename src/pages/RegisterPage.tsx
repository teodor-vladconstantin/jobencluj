import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, user, profile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'candidate',
    companyName: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (user && profile) {
      const redirectPath = profile.role === 'candidate' 
        ? '/dashboard/candidate' 
        : '/employer/onboarding';
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (newRole: 'candidate' | 'employer') => {
    setFormData(prev => ({ ...prev, role: newRole }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof RegisterFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role,
      formData.companyName
    );

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          variant: 'destructive',
          title: 'Email deja folosit',
          description: 'Acest email este deja înregistrat. Încearcă să te loghezi.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Eroare',
          description: error.message || 'A apărut o eroare. Te rugăm să încerci din nou.',
        });
      }
      setLoading(false);
    } else {
      toast({
        title: 'Cont creat cu succes!',
        description: 'Bine ai venit! Profilul tău a fost creat.',
      });
      // Navigation handled by useEffect
    }
  };

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
                onClick={() => handleRoleChange('candidate')}
                disabled={loading}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-smooth ${
                  formData.role === 'candidate'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Candidat
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('employer')}
                disabled={loading}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-smooth ${
                  formData.role === 'employer'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Angajator
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Nume complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Ion Popescu"
                    className="pl-10"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {formData.role === 'employer' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                    Nume companie
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="Tech Company SRL"
                      className="pl-10"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.companyName}
                    </p>
                  )}
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
                    name="email"
                    type="email"
                    placeholder="nume@exemplu.ro"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Parolă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmă parola
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }));
                      if (errors.acceptTerms) {
                        setErrors(prev => ({ ...prev, acceptTerms: undefined }));
                      }
                    }}
                    disabled={loading}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-muted-foreground leading-tight cursor-pointer"
                  >
                    Accept{' '}
                    <Link to="/terms" className="text-primary hover:underline" target="_blank">
                      termenii și condițiile
                    </Link>
                    {' '}și{' '}
                    <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                      politica de confidențialitate
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.acceptTerms}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-button transition-smooth"
                disabled={loading}
              >
                {loading ? 'Se creează contul...' : 'Creează cont'}
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
