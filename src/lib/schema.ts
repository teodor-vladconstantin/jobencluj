import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

export const generateJobPostingSchema = (job: Job, companyName?: string) => {
  const baseUrl = 'https://joben.eu';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || '',
    identifier: {
      '@type': 'PropertyValue',
      name: 'Joben.eu',
      value: job.id,
    },
    datePosted: job.created_at,
    validThrough: job.expires_at || undefined,
    employmentType: job.job_type?.toUpperCase(),
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName || 'Companie Verificată',
      sameAs: baseUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || 'România',
        addressCountry: 'RO',
      },
    },
    baseSalary: job.salary_min && job.salary_max ? {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: 'MONTH',
      },
    } : undefined,
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: job.seniority === 'junior' ? 0 : job.seniority === 'mid' ? 24 : job.seniority === 'senior' ? 60 : 84,
    },
  };
};

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Joben.eu',
    url: 'https://joben.eu',
    logo: 'https://joben.eu/logo.png',
    description: 'Platformă de job-uri în România - Aplică în mai puțin de 30 de secunde',
    sameAs: [
      'https://facebook.com/joben.eu',
      'https://twitter.com/joben_eu',
      'https://linkedin.com/company/joben-eu',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@joben.eu',
      availableLanguage: ['Romanian', 'English'],
    },
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export const generateHowToSchema = (steps: Array<{ name: string; text: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cum să aplici la un job pe Joben.eu',
    description: 'Ghid pas cu pas pentru aplicarea rapidă la joburi',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
};

export const generateLocalBusinessSchema = (jobLocation?: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Joben.eu',
    image: 'https://joben.eu/logo.png',
    '@id': 'https://joben.eu',
    url: 'https://joben.eu',
    telephone: '+40-XXX-XXX-XXX',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: jobLocation || 'Cluj-Napoca',
      postalCode: '',
      addressCountry: 'RO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.7712,
      longitude: 23.6236,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
  };
};

export const generateWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Joben.eu',
    url: 'https://joben.eu',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://joben.eu/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
};
