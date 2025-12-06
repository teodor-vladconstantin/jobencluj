# 🚀 SETUP BAZĂ DE DATE SUPABASE - JOBEN.EU

## ✅ Ce am făcut

Am creat o schemă completă pentru baza ta de date și am actualizat credențialele pentru noul proiect Supabase.

### 1. Credențiale Actualizate ✓

Fișierul `.env` a fost actualizat cu noile credențiale:
- **Project ID**: `qepjawbbhmckwmcllkre`
- **URL**: `https://qepjawbbhmckwmcllkre.supabase.co`
- **Anon Key**: Actualizat cu noul token

### 2. Schema Completă Creată ✓

Am creat fișierul de migrare: `supabase/migrations/20251206120000_complete_schema_setup.sql`

## 📊 Schema Bazei de Date

### Tabele Create:

1. **profiles** - Profiluri utilizatori (candidați și angajatori)
   - Informații personale
   - Rol (candidate/employer)
   - Detalii companie pentru angajatori
   - CV pentru candidați

2. **jobs** - Anunțuri de joburi
   - Titlu, descriere, cerințe
   - Salariu (min/max, public/privat)
   - Locație, tip (remote/hybrid/onsite)
   - Seniority (junior/mid/senior/lead)
   - Status (active/paused/closed)
   - Tech stack (array)

3. **applications** - Aplicații la joburi
   - Suport pentru candidați autentificați ȘI guest
   - CV, cover letter
   - Status tracking (submitted/viewed/rejected/interview)
   - Timestamp-uri automate

4. **saved_jobs** - Joburi salvate (bookmark)
   - Candidații pot salva joburi pentru mai târziu

### Features:

✅ **Row Level Security (RLS)** - Securitate completă
✅ **Storage Buckets** - Pentru CV-uri și logo-uri
✅ **Indexuri Optimizate** - Pentru performanță
✅ **Triggers Automate** - Pentru profile și timestamps
✅ **Guest Applications** - Candidații pot aplica fără cont
✅ **Validări Complete** - Constraints pe toate datele

## 🔧 Cum Aplici Schema

### Opțiunea 1: Supabase Dashboard (Recomandat)

1. Deschide [Supabase Dashboard](https://app.supabase.com/project/qepjawbbhmckwmcllkre)
2. Mergi la **SQL Editor**
3. Creează un **New Query**
4. Copiază conținutul din `supabase/migrations/20251206120000_complete_schema_setup.sql`
5. Click **Run** (sau Ctrl+Enter)
6. Așteaptă confirmarea: "✅ Setup Complete!"

### Opțiunea 2: Supabase CLI

```powershell
# Instalează Supabase CLI (dacă nu e instalat)
npm install -g supabase

# Login la Supabase
supabase login

# Link proiectul
supabase link --project-ref qepjawbbhmckwmcllkre

# Aplică migrarea
supabase db push
```

## 📦 Storage Buckets

Schema creează automat 2 buckets:

### 1. **cvs** (Private)
- Limite: 5MB per fișier
- Formate: PDF, DOC, DOCX
- Acces: Candidați pot vedea propriile CV-uri, angajatorii pot vedea CV-urile din aplicații

### 2. **logos** (Public)
- Limite: 2MB per fișier
- Formate: JPEG, PNG, WEBP, SVG
- Acces: Toată lumea poate vedea logo-urile

## 🔒 Securitate (RLS Policies)

### Profiles
- ✅ Oricine poate vedea profilurile (pentru info angajator)
- ✅ Utilizatorii pot actualiza doar propriul profil

### Jobs
- ✅ Toată lumea vede joburile active
- ✅ Doar angajatorii pot crea joburi
- ✅ Angajatorii pot edita/șterge doar joburile lor

### Applications
- ✅ Oricine poate aplica (autentificat SAU guest)
- ✅ Candidații văd doar aplicațiile lor
- ✅ Angajatorii văd aplicațiile la joburile lor
- ✅ Doar angajatorii pot schimba statusul aplicațiilor

### Saved Jobs
- ✅ Utilizatorii văd doar joburile lor salvate

## 🧪 Testare

După aplicarea schemei, poți testa:

```sql
-- Verifică tabelele
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifică politicile RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verifică buckets
SELECT * FROM storage.buckets;
```

## 📝 Diferențe față de Schema Veche

Schema nouă include:
- ✅ Suport complet pentru aplicații guest (fără cont)
- ✅ Company logo și description pe joburi (denormalizat pentru performanță)
- ✅ Tech stack ca array (în loc de NULL)
- ✅ Politici RLS mai stricte și mai sigure
- ✅ Indexuri optimizate pentru căutare
- ✅ Limite pe storage buckets
- ✅ Validări mai stricte (lungime minim/maxim)

## ⚠️ Important

1. **Backup**: Dacă ai date în vechea bază, fă backup înainte!
2. **Testing**: Testează aplicația după migrare
3. **Storage**: Asigură-te că buckets-urile sunt create corect
4. **Auth**: Prima autentificare va crea automat un profil via trigger

## 🆘 Troubleshooting

### Dacă întâmpini probleme:

```sql
-- Verifică dacă există duplicate policies
SELECT policyname, COUNT(*) 
FROM pg_policies 
GROUP BY policyname 
HAVING COUNT(*) > 1;

-- Verifică triggere
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verifică funcții
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 📞 Next Steps

După aplicarea schemei:

1. ✅ Testează autentificarea (signup/login)
2. ✅ Verifică crearea automată a profilului
3. ✅ Testează upload de CV (candidate)
4. ✅ Testează upload de logo (employer)
5. ✅ Creează un job de test
6. ✅ Fă o aplicație de test (autentificat și guest)
7. ✅ Verifică dashboard-ul candidat și employer

## 🎉 Succes!

Baza ta de date este acum gata de utilizare cu toate feature-urile aplicației tale!
