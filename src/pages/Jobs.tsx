import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { JobList } from '@/components/jobs/JobList';
import { JobFilters } from '@/components/jobs/JobFilters';
import { useState } from 'react';

const Jobs = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <PageLayout>
      <SEO
        title="Joburi disponibile"
        description="Caută și aplică la joburi în România. Remote, hybrid și onsite. Aplică în mai puțin de 30 de secunde."
        canonical="https://joben.eu/jobs"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Toate joburile disponibile
          </h1>
          <p className="text-muted-foreground text-lg">
            Găsește jobul perfect pentru tine din lista noastră actualizată
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <JobFilters onFilterChange={handleFilterChange} />
          </aside>
          
          <main className="lg:col-span-3">
            <JobList filters={filters} />
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

export default Jobs;
