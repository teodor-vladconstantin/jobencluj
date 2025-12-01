import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ro });
};

export const formatSalary = (min?: number | null, max?: number | null): string => {
  if (!min && !max) return 'Salariu nediscutat';
  if (min && max) return `${min} - ${max} RON`;
  if (min) return `De la ${min} RON`;
  if (max) return `Până la ${max} RON`;
  return 'Salariu nediscutat';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getCompanyLogoUrl = (logoPath: string | null): string | undefined => {
  if (!logoPath) return undefined;
  
  // Dacă path-ul este deja un URL complet, returnează-l
  if (logoPath.startsWith('http')) return logoPath;
  
  // Altfel, construiește URL-ul din Supabase Storage
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  return `${SUPABASE_URL}/storage/v1/object/public/logos/${logoPath}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
