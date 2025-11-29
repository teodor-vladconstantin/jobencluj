import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, LogIn, UserPlus, LogOut, User, Bookmark, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    return profile.role === 'candidate' ? '/dashboard/candidate' : '/dashboard/employer';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              joben.eu
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                {profile.role === 'employer' && (
                  <Button size="sm" asChild className="bg-gradient-primary hover:shadow-button transition-smooth hidden md:flex">
                    <Link to="/dashboard/employer/post-job">
                      <FileText className="w-4 h-4 mr-2" />
                      Postează job
                    </Link>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{profile.full_name || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile.full_name}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    {profile.role === 'candidate' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard/candidate/applications" className="cursor-pointer">
                            <FileText className="w-4 h-4 mr-2" />
                            Aplicări
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard/candidate/saved" className="cursor-pointer">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Joburi salvate
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Deconectare
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Intră în cont
                  </Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-primary hover:shadow-button transition-smooth">
                  <Link to="/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Înregistrare
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
