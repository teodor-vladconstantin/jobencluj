# Schema Overview - Joben.eu Database

## Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION                          │
│                      auth.users                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ ON INSERT → trigger → handle_new_user()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      PROFILES                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ id (UUID) ─────────────────────────── FK: auth.users│   │
│  │ email (TEXT, UNIQUE)                                │   │
│  │ role (user_role) ──┬─ 'candidate'                   │   │
│  │                     └─ 'employer'                    │   │
│  │                                                       │   │
│  │ CANDIDATE FIELDS:                                    │   │
│  │   - full_name, phone, linkedin_url                  │   │
│  │   - cv_url (storage: cvs bucket)                    │   │
│  │                                                       │   │
│  │ EMPLOYER FIELDS:                                     │   │
│  │   - company_name, company_website                   │   │
│  │   - company_logo (storage: logos bucket)            │   │
│  │   - company_description                             │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ employer_id (FK)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        JOBS                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ id (UUID)                                            │   │
│  │ employer_id (FK: profiles) ─────────────────────────┤   │
│  │ title, company_name, location                       │   │
│  │ job_type ──────┬─ 'remote'                          │   │
│  │                ├─ 'hybrid'                           │   │
│  │                └─ 'onsite'                           │   │
│  │ seniority ─────┬─ 'junior'                          │   │
│  │                ├─ 'mid'                              │   │
│  │                ├─ 'senior'                           │   │
│  │                └─ 'lead'                             │   │
│  │ salary_min, salary_max, salary_public               │   │
│  │ description, requirements                            │   │
│  │ tech_stack (TEXT[])                                 │   │
│  │ status ────────┬─ 'active'                          │   │
│  │                ├─ 'paused'                           │   │
│  │                └─ 'closed'                           │   │
│  │ expires_at (default: +30 days)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          │ job_id(FK) │            │ job_id(FK)
          ▼            ▼            ▼
┌──────────────┐  ┌─────────────────────────────┐
│  SAVED_JOBS  │  │      APPLICATIONS           │
│ ┌──────────┐ │  │  ┌────────────────────────┐ │
│ │id        │ │  │  │id                      │ │
│ │user_id   │ │  │  │job_id (FK: jobs)       │ │
│ │job_id    │ │  │  │                        │ │
│ └──────────┘ │  │  │AUTHENTICATED:          │ │
│              │  │  │  - candidate_id        │ │
│ UNIQUE:      │  │  │                        │ │
│ user+job     │  │  │GUEST:                  │ │
└──────────────┘  │  │  - guest_name          │ │
                  │  │  - guest_email         │ │
                  │  │  - guest_phone         │ │
                  │  │  - guest_linkedin_url  │ │
                  │  │                        │ │
                  │  │COMMON:                 │ │
                  │  │  - cv_url (storage)    │ │
                  │  │  - cover_letter        │ │
                  │  │  - status ──┬ submit  │ │
                  │  │             ├ viewed   │ │
                  │  │             ├ rejected │ │
                  │  │             └ interview│ │
                  │  │  - created_at          │ │
                  │  │  - viewed_at           │ │
                  │  │  - rejected_at         │ │
                  │  │  - interview_at        │ │
                  │  └────────────────────────┘ │
                  │                             │
                  │ CONSTRAINT:                 │
                  │ (candidate_id XOR          │
                  │  guest_email)              │
                  └─────────────────────────────┘
```

## Storage Buckets

```
STORAGE
├── cvs/ (PRIVATE - 5MB limit, PDF/DOC/DOCX)
│   ├── {user_id}/
│   │   └── {filename}
│   └── guest/
│       └── {filename}
│
└── logos/ (PUBLIC - 2MB limit, Images)
    └── {employer_id}/
        └── {filename}
```

## RLS Security Model

### Profiles
- **SELECT**: 🌍 Public (everyone can view)
- **INSERT**: 🔐 Own profile only
- **UPDATE**: 🔐 Own profile only
- **DELETE**: 🔐 Own profile only

### Jobs
- **SELECT**: 🌍 Active jobs + own jobs (any status)
- **INSERT**: 👔 Employers only
- **UPDATE**: 👔 Own jobs only
- **DELETE**: 👔 Own jobs only

### Applications
- **SELECT**: 🔐 Own applications + employer's job applications
- **INSERT**: 🌍 Anyone (auth + guest)
- **UPDATE**: 👔 Employer only (status changes)
- **DELETE**: ❌ Not allowed

### Saved Jobs
- **SELECT**: 🔐 Own saved jobs only
- **INSERT**: 🔐 Own saved jobs only
- **DELETE**: 🔐 Own saved jobs only

## Key Features

### 🎯 Application Flow

**Authenticated Candidate:**
```
1. User logs in
2. Views job listing
3. Clicks "Apply"
4. Uploads CV (stored in cvs/{user_id}/)
5. Submits application (candidate_id set)
6. Can view in "My Applications"
```

**Guest Candidate:**
```
1. Visitor (no account)
2. Views job listing
3. Clicks "Apply"
4. Fills form: name, email, phone
5. Uploads CV (stored in cvs/guest/)
6. Submits application (guest_email set)
7. Receives confirmation email
```

### 📧 Notifications (to implement)

**Employer receives:**
- New application notification
- Application details + CV link

**Candidate receives:**
- Application confirmation
- Status updates (viewed, interview, rejected)

### 🔍 Search & Filters

Optimized indexes for:
- Location search
- Job type filter
- Seniority level filter
- Active jobs (with expiration check)
- Employer's jobs
- Candidate's applications

### ⏱️ Automatic Features

**Triggers:**
- ✅ Profile creation on user signup
- ✅ `updated_at` timestamp on profile/job changes
- ✅ Status timestamp tracking on applications

**Constraints:**
- ✅ XOR: application must be either authenticated OR guest
- ✅ Guest applications require name + email
- ✅ Minimum lengths on title, description, requirements
- ✅ Salary max >= salary min
- ✅ Unique applications per user/job
- ✅ Unique saved jobs per user

## Data Validation

### Jobs
- Title: 10-200 characters
- Description: minimum 50 characters
- Requirements: minimum 20 characters
- Salary: min >= 0, max >= min

### Applications
- Cover letter: maximum 1000 characters
- CV: Required for all applications
- Guest: name + email required

### Storage
- CVs: 5MB max, PDF/DOC/DOCX only
- Logos: 2MB max, Images only

## Performance Optimizations

### Indexes
- `idx_jobs_status_created`: Fast active job listing
- `idx_applications_job`: Fast job applications lookup
- `idx_applications_candidate`: Fast user applications
- `applications_authenticated_unique`: Prevent duplicate apps
- `applications_guest_unique`: Prevent duplicate guest apps

### Denormalization
- `company_name`, `company_logo`, `company_description` copied to jobs table
- Reduces JOINs when displaying job listings
- Updated when employer profile changes

## Security Best Practices

✅ RLS enabled on all tables
✅ Storage policies restrict access
✅ SECURITY DEFINER functions for controlled access
✅ Input validation via CHECK constraints
✅ Foreign key cascades for data integrity
✅ Unique constraints prevent duplicates
✅ Guest applications isolated from auth data

## Migration Strategy

To apply to new Supabase project:

```bash
1. Update .env with new credentials ✅
2. Run: supabase/migrations/20251206120000_complete_schema_setup.sql
3. Verify: supabase/migrations/verify_setup.sql
4. Test authentication flow
5. Test file uploads (CV + logo)
6. Test applications (auth + guest)
```

## Future Enhancements

Consider adding:
- [ ] Email notifications table
- [ ] Job view tracking/analytics
- [ ] Application ratings/notes by employers
- [ ] Automated job expiration cleanup
- [ ] Full-text search on job descriptions
- [ ] Job categories/tags
- [ ] Application templates
- [ ] Interview scheduling
