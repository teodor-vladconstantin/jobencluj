import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-bold mb-6">Politica de Confidențialitate</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Ultima actualizare: 30 Noiembrie 2024 | Conformă GDPR (Regulamentul UE 2016/679)
        </p>

        <div className="space-y-8 text-foreground">
          {/* 1. Introducere */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introducere</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>joben.eu</strong> ("noi", "Platforma") respectă dreptul la confidențialitate și protecția datelor cu caracter personal ale utilizatorilor săi. Această Politică de Confidențialitate explică ce date colectăm, cum le folosim, și care sunt drepturile dumneavoastră conform GDPR.
            </p>
          </section>

          {/* 2. Date Personale Colectate */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Date Personale Colectate</h2>

            <h3 className="text-xl font-semibold mt-4 mb-2">Pentru Candidați:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Date de identificare:</strong> Nume, prenume, email, telefon</li>
              <li><strong>Date profesionale:</strong> CV (document încărcat), LinkedIn URL</li>
              <li><strong>Date de aplicare:</strong> Scrisori de intenție, istoric aplicații</li>
              <li><strong>Date de cont:</strong> Parolă (criptată), preferințe platformă</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">Pentru Angajatori:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Date companie:</strong> Nume companie, website</li>
              <li><strong>Date contact:</strong> Email, telefon</li>
              <li><strong>Date activitate:</strong> Joburi postate, aplicații primite</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">Date Tehnice:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Adresă IP</li>
              <li>Tip browser și versiune</li>
              <li>Cookies de autentificare</li>
              <li>Data și ora accesării</li>
            </ul>
          </section>

          {/* 3. Scopul Prelucrării Datelor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Scopul Prelucrării Datelor</h2>
            <p className="text-muted-foreground mb-3">Datele dumneavoastră personale sunt prelucrate pentru următoarele scopuri:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Furnizarea serviciilor de job board (căutare joburi, aplicare, postare oferte)</li>
              <li>Conectarea candidaților cu angajatorii prin intermediul aplicațiilor</li>
              <li>Comunicare între părți (notificări email, status aplicații)</li>
              <li>Îmbunătățirea și optimizarea Platformei</li>
              <li>Conformitate cu obligațiile legale</li>
              <li>Securitatea și prevenirea fraudelor</li>
            </ul>
          </section>

          {/* 4. Baza Legală */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Baza Legală pentru Prelucrarea Datelor (GDPR Art. 6)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Consimțământ (Art. 6.1.a):</strong> Prin înregistrare și utilizarea Platformei, vă exprimați consimțământul explicit pentru prelucrarea datelor.</p>
              <p><strong>Executarea unui contract (Art. 6.1.b):</strong> Prelucrarea este necesară pentru furnizarea serviciilor solicitate (aplicare la joburi, postare oferte).</p>
              <p><strong>Interes legitim (Art. 6.1.f):</strong> Îmbunătățirea Platformei, analiză statistică, securitate.</p>
              <p><strong>Obligație legală (Art. 6.1.c):</strong> Conformitate fiscală, raportări legale.</p>
            </div>
          </section>

          {/* 5. Partajarea Datelor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Partajarea Datelor cu Terțe Părți</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Cu Angajatorii:</strong> Când aplicați la un job, CV-ul și informațiile dumneavoastră de contact sunt partajate cu angajatorul respectiv.</p>
              <p><strong>Cu Parteneri Tehnici:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Supabase:</strong> Hosting bază de date și storage (servere EU)</li>
              </ul>
              <p><strong>NU vindem și NU partajăm datele dumneavoastră cu terțe părți pentru scopuri de marketing.</strong></p>
            </div>
          </section>

          {/* 6. Securitatea Datelor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Stocarea și Securitatea Datelor</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Locație:</strong> Datele sunt stocate pe servere Supabase în regiunea EU (conformitate GDPR).</p>
              <p><strong>Măsuri de securitate:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encriptare în tranzit (HTTPS/TLS)</li>
                <li>Encriptare la repaus (database encryption)</li>
                <li>Acces restricționat prin Row Level Security (RLS)</li>
                <li>Autentificare securizată (Supabase Auth)</li>
                <li>Backup-uri automate regulate</li>
                <li>Monitorizare și loguri de acces</li>
              </ul>
            </div>
          </section>

          {/* 7. Durata Păstrării Datelor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Durata Păstrării Datelor</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Conturi active:</strong> Indefinit, până la ștergerea contului de către utilizator</li>
              <li><strong>Aplicații:</strong> 2 ani de la ultima activitate (conform legislației muncii)</li>
              <li><strong>CV-uri:</strong> Până la ștergerea de către utilizator sau închiderea contului</li>
              <li><strong>Loguri tehnice:</strong> Maximum 6 luni</li>
            </ul>
          </section>

          {/* 8. Drepturile Utilizatorilor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Drepturile Dumneavoastră conform GDPR</h2>
            <p className="text-muted-foreground mb-3">Aveți următoarele drepturi privind datele personale:</p>

            <div className="space-y-3 text-muted-foreground">
              <p><strong>Dreptul de acces (Art. 15):</strong> Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră.</p>
              <p><strong>Dreptul la rectificare (Art. 16):</strong> Puteți actualiza sau corecta datele inexacte.</p>
              <p><strong>Dreptul la ștergere - "Dreptul de a fi uitat" (Art. 17):</strong> Puteți solicita ștergerea datelor personale în anumite condiții.</p>
              <p><strong>Dreptul la portabilitate (Art. 20):</strong> Puteți primi datele în format structurat (JSON/CSV) pentru transfer la alt furnizor.</p>
              <p><strong>Dreptul la opoziție (Art. 21):</strong> Puteți obiecta la prelucrarea datelor pentru anumite scopuri.</p>
              <p><strong>Dreptul la restricționare (Art. 18):</strong> Puteți solicita limitarea prelucrării în anumite situații.</p>
              <p><strong>Retragerea consimțământului (Art. 7.3):</strong> Puteți retrage consimțământul în orice moment.</p>
            </div>

            <p className="text-muted-foreground mt-4">
              Pentru exercitarea acestor drepturi, contactați-ne la:{' '}
              <a href="mailto:contact@joben.eu" className="text-primary hover:underline">
                contact@joben.eu
              </a>
            </p>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies și Tracking</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Platforma utilizează următoarele tipuri de cookies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cookies esențiale:</strong> Necesare pentru funcționarea Platformei (session, autentificare)</li>
                <li><strong>Cookies Supabase:</strong> Pentru autentificare și management sesiune</li>
              </ul>
              <p><strong>NU folosim cookies de publicitate sau tracking de la terțe părți.</strong></p>
              <p>Puteți dezactiva cookies din setările browser-ului, dar acest lucru poate afecta funcționalitatea Platformei.</p>
            </div>
          </section>

          {/* 10. Transferuri Internaționale */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Transferuri Internaționale de Date</h2>
            <p className="text-muted-foreground">
              Datele sunt stocate și procesate în Uniunea Europeană (regiunea EU Supabase). Nu transferăm date în afara UE/SEE fără măsuri adecvate de protecție conform GDPR (clauzele contractuale standard ale UE).
            </p>
          </section>

          {/* 11. Modificări */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Modificări ale Politicii de Confidențialitate</h2>
            <p className="text-muted-foreground">
              Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate. Modificările majore vor fi comunicate prin email. Vă recomandăm să verificați periodic această pagină pentru actualizări.
            </p>
          </section>

          {/* 12. Contact DPO */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Date de Contact - Responsabil Protecția Datelor</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Pentru orice întrebări legate de protecția datelor personale sau pentru exercitarea drepturilor GDPR:</p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@joben.eu" className="text-primary hover:underline">
                  contact@joben.eu
                </a>
              </p>
              <p>
                <strong>Formular de contact:</strong>{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  Contactează-ne
                </Link>
              </p>
              <p className="mt-4">
                <strong>Timp de răspuns:</strong> Maximum 30 zile conform GDPR (Art. 12.3)
              </p>
            </div>
          </section>

          {/* 13. Autoritate de Supraveghere */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Autoritatea de Supraveghere</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Aveți dreptul de a depune o plângere la autoritatea de supraveghere din România:</p>
              <p className="font-semibold mt-2">
                ANSPDCP - Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
              </p>
              <p>
                Website:{' '}
                <a
                  href="https://www.dataprotection.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.dataprotection.ro
                </a>
              </p>
              <p>Email: anspdcp@dataprotection.ro</p>
              <p>Telefon: +40 21 252 5599</p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
