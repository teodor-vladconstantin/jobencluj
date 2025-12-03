import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CVViewer } from '@/components/jobs/CVViewer';
import { Briefcase, FileText, Users, TrendingUp, Loader2, ExternalLink, Download, Edit, Building2, Upload, MoreVertical, Trash2, Archive, Eye } from 'lucide-react';
import { formatRelativeTime, getCompanyLogoUrl } from '@/lib/helpers';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS, JOB_STATUS_LABELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'] & {
  applications: { count: number }[];
};

type Application = Database['public']['Tables']['applications']['Row'] & {
  jobs: Pick<Database['public']['Tables']['jobs']['Row'], 'id' | 'title' | 'employer_id'>;
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email' | 'phone' | 'linkedin_url'> | null;
};

const EmployerDashboard = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Redirect to onboarding if company profile incomplete
  useEffect(() => {
    if (profile && !profile.company_name) {
      navigate('/employer/onboarding', { replace: true });
    }
  }, [profile, navigate]);
  
  // Company profile form state
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    company_website: '',
    company_description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Delete job confirmation state
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  
  // CV Viewer state
  const [cvViewerState, setCvViewerState] = useState<{ isOpen: boolean; cvPath: string | null; candidateName: string | null }>({
    isOpen: false,
    cvPath: null,
    candidateName: null,
  });

  // Initialize company form when profile loads
  useEffect(() => {
    if (profile) {
      setCompanyForm({
        company_name: profile.company_name || '',
        company_website: profile.company_website || '',
        company_description: profile.company_description || '',
      });
      if (profile.company_logo) {
        const logoUrl = getCompanyLogoUrl(profile.company_logo);
        if (logoUrl) setLogoPreview(logoUrl);
      }
    }
  }, [profile]);

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['employer-jobs', profile?.id],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `, { count: 'exact' })
        .eq('employer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['employer-applications', profile?.id],
    queryFn: async () => {
      console.log('Fetching applications for employer:', profile?.id);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            employer_id
          ),
          profiles (
            full_name,
            email,
            phone,
            linkedin_url
          )
        `)
        .eq('jobs.employer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      
      console.log('Applications fetched:', data);
      console.log('Number of applications:', data?.length || 0);
      return data as Application[];
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, newStatus }: { applicationId: string; newStatus: Database['public']['Enums']['application_status'] }) => {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          viewed_at: newStatus === 'viewed' ? new Date().toISOString() : undefined,
        })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      toast({
        title: 'Status actualizat',
        description: 'Statusul aplicației a fost modificat cu succes',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Eroare la actualizarea statusului',
        variant: 'destructive',
      });
    },
  });

  // Calculate stats
  const stats = {
    totalJobs: jobs?.length || 0,
    activeJobs: jobs?.filter(job => job.status === 'active').length || 0,
    totalApplications: applications?.length || 0,
    interviewCandidates: applications?.filter(app => app.status === 'interview').length || 0,
  };

  // Debug logging for stats
  useEffect(() => {
    console.log('Employer Dashboard Stats:', stats);
    console.log('Applications:', applications);
  }, [applications, stats]);

  const handleStatusChange = (applicationId: string, newStatus: Database['public']['Enums']['application_status']) => {
    updateStatusMutation.mutate({ applicationId, newStatus });
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Fișier prea mare',
          description: 'Logo-ul trebuie să fie mai mic de 2MB',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Save company profile
  const handleSaveCompanyProfile = async () => {
    if (!profile) return;
    
    setIsSavingProfile(true);
    try {
      let logoUrl = profile.company_logo;

      // Upload logo if changed
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;
        logoUrl = fileName;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyForm.company_name,
          company_website: companyForm.company_website,
          company_description: companyForm.company_description,
          company_logo: logoUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Profil actualizat',
        description: 'Profilul companiei a fost salvat cu succes',
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Eroare la salvarea profilului',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getCandidateName = (app: Application) => {
    console.log('Getting candidate name for application:', app.id, {
      profiles_full_name: app.profiles?.full_name,
      guest_name: (app as any).guest_name,
      candidate_id: app.candidate_id
    });
    if (app.profiles?.full_name) {
      return app.profiles.full_name;
    }
    if ((app as any).guest_name) {
      return `${(app as any).guest_name} (Guest)`;
    }
    return 'Candidat anonim';
  };

  const getCandidateEmail = (app: Application) => {
    return app.profiles?.email || (app as any).guest_email || 'N/A';
  };

  const getCandidatePhone = (app: Application) => {
    return app.profiles?.phone || (app as any).guest_phone || 'N/A';
  };

  const getCandidateLinkedIn = (app: Application) => {
    return app.profiles?.linkedin_url || (app as any).guest_linkedin_url || null;
  };

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('employer_id', profile!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast({
        title: 'Job șters',
        description: 'Jobul a fost șters cu succes',
      });
      setJobToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Eroare la ștergerea jobului',
        variant: 'destructive',
      });
    },
  });

  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: 'active' | 'paused' | 'closed' }) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)
        .eq('employer_id', profile!.id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      const statusMessages = {
        active: 'Jobul este acum activ și vizibil pentru candidați',
        paused: 'Jobul este în pauză și nu mai apare în căutări',
        closed: 'Jobul a fost închis și nu mai primește aplicații',
      };
      toast({
        title: 'Status actualizat',
        description: statusMessages[variables.status],
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Eroare la actualizarea statusului',
        variant: 'destructive',
      });
    },
  });

  if (!profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Dashboard Angajator
            </h1>
            <p className="text-muted-foreground">
              Gestionează joburile și aplicațiile primite
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/employer/post-job">+ Postează job nou</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total joburi</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joburi active</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total aplicații</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">În interviu</p>
                  <p className="text-2xl font-bold">{stats.interviewCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="jobs">Joburile mele</TabsTrigger>
            <TabsTrigger value="applications">Aplicații primite</TabsTrigger>
            <TabsTrigger value="company">Profil companie</TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Joburile mele</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titlu job</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aplicații</TableHead>
                          <TableHead>Data postării</TableHead>
                          <TableHead>Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>
                              <Select
                                value={job.status}
                                onValueChange={(value) => updateJobStatusMutation.mutate({ 
                                  jobId: job.id, 
                                  status: value as 'active' | 'paused' | 'closed' 
                                })}
                                disabled={updateJobStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      Activ
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="paused">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                      Pauză
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="closed">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                      Închis
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{job.applications[0]?.count || 0}</span> aplicații
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatRelativeTime(new Date(job.created_at))}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/dashboard/employer/post-job/${job.id}`}>
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editează
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/jobs/${job.id}`} target="_blank">
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => setJobToDelete(job.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Șterge job
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Niciun job postat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Postează primul tău job pentru a găsi candidați
                    </p>
                    <Button asChild>
                      <Link to="/dashboard/employer/post-job">Postează job</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Aplicații primite</CardTitle>
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
                          <TableHead>Candidat</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => {
                          const linkedIn = getCandidateLinkedIn(app);

                          return (
                            <TableRow key={app.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{getCandidateName(app)}</p>
                                  <p className="text-sm text-muted-foreground">{getCandidateEmail(app)}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{app.jobs.title}</TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <p>{getCandidatePhone(app)}</p>
                                  {linkedIn && (
                                    <a
                                      href={linkedIn}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-1"
                                    >
                                      LinkedIn <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={app.status}
                                  onValueChange={(value) => handleStatusChange(app.id, value as Database['public']['Enums']['application_status'])}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="submitted">Trimis</SelectItem>
                                    <SelectItem value="viewed">Văzut</SelectItem>
                                    <SelectItem value="interview">Interviu</SelectItem>
                                    <SelectItem value="rejected">Respins</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatRelativeTime(new Date(app.created_at))}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setCvViewerState({
                                      isOpen: true,
                                      cvPath: app.cv_url,
                                      candidateName: app.profiles?.full_name || null,
                                    });
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Vezi CV
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Nicio aplicație primită</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aplicațiile vor apărea aici când candidații aplică la joburile tale
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Profile Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Profil companie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label>Logo companie</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={logoPreview || undefined} />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {companyForm.company_name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="max-w-xs"
                        id="logo-upload"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG sau GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nume companie *</Label>
                  <Input
                    id="company_name"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                    placeholder="Ex: Acme Corporation"
                  />
                </div>

                {/* Company Website */}
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website companie</Label>
                  <Input
                    id="company_website"
                    type="url"
                    value={companyForm.company_website}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>

                {/* Company Description */}
                <div className="space-y-2">
                  <Label htmlFor="company_description">Descriere companie</Label>
                  <Textarea
                    id="company_description"
                    rows={6}
                    value={companyForm.company_description}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_description: e.target.value })}
                    placeholder="Descrie compania, cultura organizațională, beneficii pentru angajați..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Această descriere va fi afișată pe paginile de job.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCompanyProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se salvează...
                      </>
                    ) : (
                      'Salvează profilul'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur că vrei să ștergi acest job?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Jobul va fi șters permanent împreună cu toate aplicațiile primite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => jobToDelete && deleteJobMutation.mutate(jobToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CV Viewer Modal */}
      {cvViewerState.cvPath && (
        <CVViewer
          cvPath={cvViewerState.cvPath}
          isOpen={cvViewerState.isOpen}
          onClose={() => setCvViewerState({ isOpen: false, cvPath: null, candidateName: null })}
          candidateName={cvViewerState.candidateName || undefined}
        />
      )}
    </PageLayout>
  );
};

export default EmployerDashboard;
