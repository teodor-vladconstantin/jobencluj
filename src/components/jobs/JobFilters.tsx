import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { LOCATIONS, JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';

export interface JobFiltersState {
  location: string;
  jobTypes: string[];
  seniorities: string[];
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onChange: (filters: JobFiltersState) => void;
  onReset: () => void;
}

const JobFilters = ({ filters, onChange, onReset }: JobFiltersProps) => {
  const handleJobTypeToggle = (type: string) => {
    const newTypes = filters.jobTypes.includes(type)
      ? filters.jobTypes.filter((t) => t !== type)
      : [...filters.jobTypes, type];
    onChange({ ...filters, jobTypes: newTypes });
  };

  const handleSeniorityToggle = (seniority: string) => {
    const newSeniorities = filters.seniorities.includes(seniority)
      ? filters.seniorities.filter((s) => s !== seniority)
      : [...filters.seniorities, seniority];
    onChange({ ...filters, seniorities: newSeniorities });
  };

  const activeFilterCount =
    (filters.location !== 'all' ? 1 : 0) +
    filters.jobTypes.length +
    filters.seniorities.length;

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filtre</CardTitle>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
            <X className="w-4 h-4 mr-1" />
            Șterge ({activeFilterCount})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Locație</Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onChange({ ...filters, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate locațiile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate locațiile</SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tip job</Label>
          <div className="space-y-2">
            {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-type-${value}`}
                  checked={filters.jobTypes.includes(value)}
                  onCheckedChange={() => handleJobTypeToggle(value)}
                />
                <Label
                  htmlFor={`job-type-${value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Seniority Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Nivel experiență</Label>
          <div className="space-y-2">
            {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`seniority-${value}`}
                  checked={filters.seniorities.includes(value)}
                  onCheckedChange={() => handleSeniorityToggle(value)}
                />
                <Label
                  htmlFor={`seniority-${value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Domeniu job (opțional) */}
        {/* Poți adăuga aici filtre suplimentare dacă vrei să segmentezi joburile pe domenii, industrii etc. */}
      </CardContent>
    </Card>
  );
};

export { JobFilters };
export default JobFilters;
