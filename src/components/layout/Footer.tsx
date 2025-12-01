import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl mb-4">
              <img src="/logo.png" alt="Joben.eu" className="w-10 h-10 rounded-lg" />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Joben.eu
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Platforma unde aplici la joburi în mai puțin de 30 de secunde.
              Fără formularе interminabile.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Pentru candidați</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-smooth">Caută joburi</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-smooth">Înregistrare</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Pentru companii</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-smooth">Postează job</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-smooth">Intră în cont</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-smooth">Despre noi</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-smooth">Termeni și condiții</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-smooth">Politica de confidențialitate</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 joben.eu. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
