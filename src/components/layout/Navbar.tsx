import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LogOut, User, Bookmark, FileText, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
    const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
            <img src="/logo.png" alt="Joben.eu" className="w-8 h-8 rounded-lg" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Joben.eu
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activează modul întunecat' : 'Activează modul luminos'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {user && profile ? (
              <>
                {profile.role === 'employer' && (
                  <Button size="sm" asChild className="bg-gradient-primary hover:shadow-button transition-smooth">
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
                      <span className="inline">{profile.full_name || 'User'}</span>
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

          {/* Burger button for mobile */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
            onClick={() => setDrawerOpen(true)}
            aria-label="Deschide meniul"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
      {/* Drawer menu for mobile */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="p-0">
          <DrawerHeader>
            <DrawerTitle>
              <span className="font-heading font-bold text-xl">joben.eu</span>
            </DrawerTitle>
            <DrawerDescription>Meniu navigare</DrawerDescription>
          </DrawerHeader>
          <nav className="flex flex-col gap-2 px-4 pb-4">
            {/* Theme toggle in mobile menu */}
            <button
              onClick={toggleTheme}
              className="py-2 px-3 rounded hover:bg-muted transition flex items-center gap-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  Mod întunecat
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  Mod luminos
                </>
              )}
            </button>
            <Link to="/" className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Acasă</Link>
            <Link to="/" className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Caută joburi</Link>
            {!user && (
              <>
                <Link to="/login" className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Intră în cont</Link>
                <Link to="/register" className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Înregistrare</Link>
              </>
            )}
            {user && profile && (
              <>
                <Link to={getDashboardLink()} className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Dashboard</Link>
                <Link to="/dashboard/profile" className="py-2 px-3 rounded hover:bg-muted transition" onClick={()=>setDrawerOpen(false)}>Profil</Link>
                <button onClick={()=>{signOut();setDrawerOpen(false);}} className="py-2 px-3 rounded hover:bg-muted transition text-destructive">Deconectare</button>
              </>
            )}
          </nav>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default Navbar;
