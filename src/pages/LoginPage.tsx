import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuth();
  const { toast } = useToast();
  const isMountedRef = useRef(true);
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user && profile) {
      console.log('🔐 Login: User and profile loaded, redirecting...', { role: profile.role });
      const redirectPath = profile.role === 'candidate' 
        ? '/dashboard/candidate' 
        : '/dashboard/employer';
      navigate(redirectPath, { replace: true });
    } else if (user && !profile) {
      // User logged in but profile not loaded yet - set timeout safety
      console.log('⏳ Login: User loaded, waiting for profile...');
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Login: Profile fetch timeout, forcing redirect to jobs page');
        if (isMountedRef.current) {
          toast({
            title: 'Avertisment',
            description: 'Profilul se încarcă mai lent decât de obicei.',
          });
          navigate('/jobs', { replace: true });
        }
      }, 5000); // 5 second safety timeout
    }
  }, [user, profile, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof LoginFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    console.log('🔑 Attempting login...');
    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      console.error('❌ Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast({
          variant: 'destructive',
          title: 'Autentificare eșuată',
          description: 'Email sau parolă incorectă. Te rugăm să încerci din nou.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Eroare',
          description: error.message || 'A apărut o eroare. Te rugăm să încerci din nou.',
        });
      }
      if (isMountedRef.current) {
        setLoading(false);
      }
    } else {
      console.log('✅ Login successful, waiting for profile...');
      toast({
        title: 'Autentificare reușită!',
        description: 'Bine ai revenit!',
      });
      // Keep loading true while waiting for redirect
      // Navigation handled by useEffect
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button 
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-button transition-smooth"
                disabled={loading}
              >
                {loading ? 'Se încarcă...' : 'Intră în cont'}
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
