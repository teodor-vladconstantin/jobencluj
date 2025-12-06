import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CVUpload } from '@/components/jobs/CVUpload';
import { CVViewer } from '@/components/jobs/CVViewer';
import { Briefcase, FileText, User, ExternalLink, Loader2, Upload, Save } from 'lucide-react';
import { formatRelativeTime } from '@/lib/helpers';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/constants';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['applications']['Row'] & {
  jobs: Database['public']['Tables']['jobs']['Row'];
};

// Local query stale time (5 minutes) to avoid build issues with missing export
const QUERY_STALE_TIME = 5 * 60 * 1000;

const CandidateDashboard = () => {
  const { profile, refreshProfile, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    linkedin_url: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCVViewer, setShowCVViewer] = useState(false);

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['candidate-applications', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company_name,
            location,
            job_type,
            seniority,
            status
          )
        `)
        .eq('candidate_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      return data as Application[];
    },
    enabled: !!profile?.id,
    staleTime: QUERY_STALE_TIME,
  });

  const stats = {
    totalApplications: applications?.length || 0,
  };

  const isProfileComplete = !!(
    profile?.full_name &&
    profile?.phone &&
    profile?.linkedin_url &&
    profile?.cv_url
  );

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // If the session is missing after a refresh, prompt a quick re-login instead of a blank spinner
  if (!user || !profile) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground max-w-md">
            Sesiunea nu a putut fi reluată automat. Te rugăm să te reconectezi pentru a continua.
          </p>
          <Button asChild>
            <Link to="/login">Reautentifică-te</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Bine ai venit, {profile.full_name || 'Candidat'}!
          </h1>
          <p className="text-muted-foreground">
            Gestionează aplicațiile și profilul tău
          </p>
        </div>

        {!isProfileComplete && (
          <Card className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Profil incomplet
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    Completează-ți profilul pentru a putea aplica rapid la joburi cu un singur click.
                  </p>
                  <Button size="sm" className="mt-3" asChild>
                    <a href="#profile">Completează profilul →</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 mb-8 max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total aplicații</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="applications">Aplicațiile mele</TabsTrigger>
            <TabsTrigger value="profile" id="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Aplicațiile mele</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job</TableHead>
                          <TableHead>Companie</TableHead>
                          <TableHead>Data aplicării</TableHead>
                          <TableHead>Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.jobs?.title || 'N/A'}</TableCell>
                            <TableCell>{app.jobs?.company_name || 'N/A'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatRelativeTime(new Date(app.created_at))}
                            </TableCell>
                            <TableCell>
                              {app.jobs?.id && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/jobs/${app.jobs.id}`}>
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Nicio aplicație încă</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Începe să aplici la joburi pentru a le vedea aici
                    </p>
                    <Button asChild>
                      <Link to="/">Caută joburi</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profilul meu</CardTitle>
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        setFormData({
                          full_name: profile.full_name || '',
                          phone: profile.phone || '',
                          linkedin_url: profile.linkedin_url || '',
                        });
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? 'Anulează' : 'Editează profil'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUploading(true);
                  
                  try {
                    let cvUrl = profile.cv_url;
                    
                    if (cvFile) {
                      // Delete old CV if exists
                      if (profile.cv_url) {
                        // Extract file path from URL (remove domain and bucket path)
                        const oldFilePath = profile.cv_url.includes('/storage/v1/object/public/cvs/')
                          ? profile.cv_url.split('/storage/v1/object/public/cvs/')[1]
                          : profile.cv_url;
                        
                        await supabase.storage
                          .from('cvs')
                          .remove([oldFilePath]);
                      }
                      
                      const fileExt = cvFile.name.split('.').pop();
                      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError, data } = await supabase.storage
                        .from('cvs')
                        .upload(fileName, cvFile, { 
                          cacheControl: '3600',
                          upsert: true 
                        });
                      
                      if (uploadError) {
                        throw uploadError;
                      }
                      
                      cvUrl = fileName;
                    }
                    
                    const { error } = await supabase
                      .from('profiles')
                      .update({
                        full_name: formData.full_name,
                        phone: formData.phone,
                        linkedin_url: formData.linkedin_url,
                        cv_url: cvUrl,
                      })
                      .eq('id', profile.id);
                    
                    if (error) throw error;
                    
                    // Refresh profile data from AuthContext
                    await refreshProfile();
                    
                    toast({
                      title: 'Profil actualizat!',
                      description: 'Datele tale au fost salvate cu succes.',
                    });
                    
                    setIsEditing(false);
                    setCvFile(null);
                  } catch (error: any) {
                    toast({
                      title: 'Eroare',
                      description: error.message || 'Nu am putut salva profilul.',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Nume complet</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Introdu numele complet"
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base font-medium mt-1">{profile.full_name || 'Necompletat'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <p className="text-base font-medium mt-1 text-muted-foreground">{profile.email}</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Introdu numărul de telefon"
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base font-medium mt-1">{profile.phone || 'Necompletat'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        {isEditing ? (
                          <Input
                            id="linkedin"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            className="mt-1"
                          />
                        ) : profile.linkedin_url ? (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-primary hover:underline mt-1 block">
                            Vezi profil <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        ) : (
                          <p className="text-base font-medium mt-1 text-muted-foreground">Necompletat</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>CV</Label>
                      {isEditing ? (
                        <div className="mt-2">
                          <CVUpload
                            uploadPath={profile.id}
                            onFileSelect={(file) => setCvFile(file)}
                            onUploadComplete={() => {}}
                          />
                        </div>
                      ) : profile.cv_url ? (
                        <div className="flex items-center justify-between bg-secondary bg-opacity-50 rounded p-3 mt-2">
                          <span className="text-sm font-medium">CV încărcat</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowCVViewer(true)}
                          >
                            Vezi CV
                          </Button>
                        </div>
                      ) : (
                        <p className="text-base font-medium mt-1 text-destructive">CV neîncărcat</p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="pt-4 border-t flex gap-3">
                        <Button type="submit" disabled={isUploading}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Se salvează...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Salvează modificările
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CV Viewer Modal */}
      {profile?.cv_url && (
        <CVViewer
          cvPath={profile.cv_url}
          isOpen={showCVViewer}
          onClose={() => setShowCVViewer(false)}
          candidateName={profile.full_name || undefined}
        />
      )}
    </PageLayout>
  );
};

export default CandidateDashboard;
