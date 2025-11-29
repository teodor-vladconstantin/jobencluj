import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
