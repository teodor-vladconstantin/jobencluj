import PageLayout from '@/components/layout/PageLayout';

const TermsAndConditions = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-bold mb-6">Termeni și Condiții</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultima actualizare: 1 Decembrie 2024</p>

        <div className="space-y-8 text-foreground">
          {/* Introducere */}
          <section>
            <p className="text-muted-foreground leading-relaxed">
              Acest document stabilește modalitatea de colaborare între <strong>Joben.eu</strong>, o platformă online, și persoanele fizice sau juridice care utilizează site-ul web <strong>www.joben.eu</strong>. În acest document, stabilim următoarele denumiri: Joben.eu sau www.joben.eu ca "Noi", iar orice persoană fizică sau juridică va fi denumită "Utilizator".
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Accesarea platformei www.joben.eu și utilizarea serviciilor disponibile se realizează doar prin acceptarea termenilor și condițiilor prezentate în acest document. Pentru a accepta termenii și condițiile, vom solicita acordul necondiționat al utilizatorilor prin bifarea căsuței "Am citit, sunt de acord și mă voi conforma termenilor și condițiilor www.joben.eu". Prin bifarea căsuței, orice Utilizator confirmă că a citit, este de acord și se va conforma tuturor termenilor și condițiilor din acest document. De asemenea, prin bifarea căsuței, orice Utilizator confirmă acordul său cu privire la prelucrarea datelor cu caracter personal și confidențialitatea descrise mai jos.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pentru a avea informații corecte și complete, Utilizatorul trebuie să verifice periodic pagina de termeni și condiții de pe platforma www.joben.eu; informarea cu privire la toate modificările este responsabilitatea exclusivă a Utilizatorului. După acceptarea inițială a termenilor și condițiilor, neconsultarea periodică a acestora este considerată acceptare din partea Utilizatorului.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Dacă nu sunteți de acord cu prevederile termenilor și condițiilor platformei www.joben.eu, vă rugăm să nu utilizați sau să încetați utilizarea serviciilor oferite de www.joben.eu.
            </p>
          </section>

          {/* 1. Descrierea Serviciilor Oferite */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Descrierea Serviciilor Oferite</h2>
            <p className="text-muted-foreground leading-relaxed">
              www.joben.eu se adresează în principal persoanelor juridice care doresc să publice anunțuri de angajare. Persoanele fizice pot crea un cont cu intenția de a aplica la anunțurile de muncă publicate pe platformă sau pentru a fi contactate de persoane juridice care caută în mod proactiv potențiali candidați. Indiferent de statutul juridic, toți cei care dețin un cont de acces pe platforma www.joben.eu sunt denumiți "Utilizatori".
            </p>
          </section>

          {/* 2. Contul de Utilizator */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Contul de Utilizator</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">2.a Utilizator Candidat</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Eligibilitate:</strong> Vârsta minimă pentru Utilizatorii Candidați este de 18 ani.</li>
              <li><strong>Crearea Contului:</strong> Utilizatorii Candidați pot aplica la anunțurile de angajare fără a avea un cont de Utilizator. Pentru a fi găsiți în căutările efectuate de persoane juridice, Utilizatorii Candidați pot crea un cont prin interfața: Login – Register – Joben.eu. Activarea contului este efectuată de un administrator al platformei Joben.eu.</li>
              <li><strong>Asistență Cont:</strong> La cererea Utilizatorului Candidat, reprezentanții Joben.eu pot asista la crearea conturilor sau redactarea profilurilor, anumite servicii fiind taxabile conform politicii comerciale a platformei.</li>
              <li><strong>Partajarea Datelor:</strong> Prin crearea unui cont, Utilizatorii Candidați consimțesc să împărtășească detaliile de contact (de exemplu, număr de telefon, email, profil LinkedIn) cu Utilizatorii Companie în scopuri de recrutare.</li>
              <li><strong>Date Interzise:</strong> Utilizatorii Candidați nu trebuie să furnizeze informații sensibile precum adresa de domiciliu, vârsta, genul, religia sau alte date care pot duce la decizii discriminatorii în procesele de recrutare.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.b Utilizator Companie</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Eligibilitate și Verificare:</strong> Doar persoanele juridice active pot crea conturi.</li>
              <li><strong>Aprobarea Contului:</strong> Conturile Utilizatorilor Companie sunt aprobate de echipa de administrare Joben.eu.</li>
              <li><strong>Publicarea Anunțurilor:</strong> Anunțurile sunt publicate pentru 30 de zile după plată și aprobarea administratorului. Modificările sunt supuse unei noi revizuiri și aprobări.</li>
              <li><strong>Acces la Baza de Date:</strong> Utilizatorii Companie pot accesa baza de date a platformei strict în scopuri de recrutare.</li>
              <li><strong>Responsabilitatea Conținutului:</strong> Utilizatorii Companie sunt singurii responsabili pentru acuratețea, legalitatea și etica anunțurilor lor de angajare.</li>
            </ul>
          </section>

          {/* 3. Publicarea Anunțurilor de Angajare */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Publicarea Anunțurilor de Angajare</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Cerințe Anunțuri:</strong> Anunțurile de angajare trebuie să respecte standardele etice și legale. Joben.eu își rezervă dreptul de a respinge anunțurile care încalcă aceste standarde fără justificare sau compensație.</li>
              <li><strong>Structura Tarifelor:</strong> Anunțurile pot fi publicate pentru 30 de zile după plata taxei necesare sau prin utilizarea codurilor promoționale valide. Plățile nu sunt rambursabile.</li>
              <li><strong>Proces de Revizuire:</strong> Reprezentanții Joben.eu vor revizui anunțurile pentru a se asigura că sunt complete, explicite și non-discriminatorii. Anunțurile care nu îndeplinesc aceste standarde nu vor fi aprobate.</li>
              <li><strong>Prevenirea Fraudei:</strong> Încercările de a posta anunțuri înșelătoare sau neetice vor duce la suspendarea sau închiderea contului.</li>
            </ul>
          </section>

          {/* 4. Date cu Caracter Personal */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Date cu Caracter Personal</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Confidențialitatea Datelor:</strong> Joben.eu valorizează confidențialitatea datelor cu caracter personal și le utilizează în conformitate cu politica sa de confidențialitate.</li>
              <li><strong>Responsabilitatea Utilizatorului Companie:</strong> Persoanele juridice sunt responsabile pentru colectarea și prelucrarea datelor cu caracter personal în conformitate cu legile aplicabile.</li>
              <li><strong>Drepturile Utilizatorului Candidat:</strong> Utilizatorii Candidați pot solicita ștergerea datelor lor cu caracter personal din baza de date Joben.eu prin trimiterea unei cereri scrise la admin@joben.eu.</li>
              <li><strong>Păstrarea Datelor:</strong> Datele cu caracter personal ale Utilizatorilor Candidați vor fi stocate în baza de date Joben.eu timp de 24 de luni, cu excepția cazului în care se solicită ștergerea.</li>
            </ul>
          </section>

          {/* 5. Mențiuni Speciale */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Mențiuni Speciale</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Suspendarea Contului:</strong> Joben.eu poate suspenda sau anula conturile Utilizatorilor dacă există suspiciuni de utilizare abuzivă sau acțiuni împotriva intereselor platformei. Suspendarea sau anularea contului poate avea loc fără notificare prealabilă.</li>
              <li><strong>Acuratețea Informațiilor:</strong> Deși Joben.eu se străduiește să mențină acuratețea și calitatea informațiilor de pe platformă, nu garantează corectitudinea informațiilor furnizate de Utilizatori sau anunțurilor de angajare.</li>
              <li><strong>Responsabilitatea Utilizatorului:</strong> Utilizatorii sunt încurajați să exercite precauție atunci când răspund la anunțurile de angajare sau furnizează informații sensibile. Joben.eu nu este responsabilă pentru daunele financiare sau de reputație care decurg din utilizarea abuzivă a platformei.</li>
            </ul>
          </section>

          {/* 6. Forță Majoră */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Forță Majoră</h2>
            <p className="text-muted-foreground leading-relaxed">
              Joben.eu nu este responsabilă pentru erorile operaționale cauzate de evenimente de forță majoră cum ar fi defecțiuni ale internetului, probleme tehnice sau circumstanțe neprevăzute precum pandemii, greve sau alte perturbări.
            </p>
          </section>

          {/* 7. Soluționarea Disputelor */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Soluționarea Disputelor</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Orice dispută între Utilizatori și Joben.eu va fi soluționată mai întâi pe cale amiabilă.</p>
              <p>Dacă nu se poate ajunge la o rezolvare amiabilă, disputele vor fi trimise către instanțele competente din România.</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Pentru întrebări suplimentare sau notificări, vă rugăm să contactați:{' '}
              <a href="mailto:admin@joben.eu" className="text-primary hover:underline">
                admin@joben.eu
              </a>
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsAndConditions;
