/**
 * Resource Library page - Complete layout with quick filter cards
 * - 6 quick filter cards at top
 * - Search bar
 * - 20/80 split with comprehensive filters
 * - Uses storage_files_catalog table
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  FileText,
  BookText,
  FileSpreadsheet,
  Users,
  Stethoscope,
  LibraryBig,
  Search,
  Loader2,
  AlertCircle,
  Play,
  ClipboardList,
  CreditCard,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import ProgramResourceRow from '../components/resources/ProgramResourceRow';
import SafeText from '../components/common/SafeText';
import { catalogService } from '../lib/supabaseClient';
import type { Database } from '../types/database.types';
import type { StorageFileItem } from '../services/supabaseStorage';

type StorageFile = Database['public']['Tables']['storage_files_catalog']['Row'];

// ============================================
// Type Definitions
// ============================================

interface FilterState {
  search: string;
  quickFilter: string | null; // For the 6 cards
  programs: string[];
  medicalConditions: string[];
  contentFormats: string[];
  formCategories: string[];
}

interface QuickFilterCard {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  filterType: 'resource_type' | 'all';
  filterValue?: string;
}

// ============================================
// Constants
// ============================================

const QUICK_FILTERS: QuickFilterCard[] = [
  {
    key: 'patient-handouts',
    label: 'Patient Handouts',
    icon: Users,
    gradient: 'from-blue-600 to-cyan-500',
    filterType: 'resource_type',
    filterValue: 'patient_handout'
  },
  {
    key: 'clinical-guidelines',
    label: 'Clinical Guidelines',
    icon: Stethoscope,
    gradient: 'from-purple-600 to-pink-500',
    filterType: 'resource_type',
    filterValue: 'clinical_guideline'
  },
  {
    key: 'medical-billing',
    label: 'Medical Billing',
    icon: CreditCard,
    gradient: 'from-green-600 to-teal-500',
    filterType: 'resource_type',
    filterValue: 'medical_billing'
  },
  {
    key: 'protocols',
    label: 'Protocols',
    icon: ClipboardList,
    gradient: 'from-orange-600 to-red-500',
    filterType: 'resource_type',
    filterValue: 'protocol_manual'
  },
  {
    key: 'forms',
    label: 'Forms',
    icon: FileText,
    gradient: 'from-indigo-600 to-purple-500',
    filterType: 'resource_type',
    filterValue: 'documentation_form'
  },
  {
    key: 'all',
    label: 'All Resources',
    icon: LibraryBig,
    gradient: 'from-slate-600 to-slate-800',
    filterType: 'all'
  }
];

const PROGRAMS = [
  'MTM The Future Today',
  'TimeMyMeds',
  'Test and Treat',
  'HbA1c Testing',
  'Oral Contraceptives'
];

const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Failure',
  'Asthma/COPD',
  'Lipids',
  'Infections',
  'Contraceptives',
  'Pain Management'
];

const CONTENT_FORMATS = [
  { key: 'video', label: 'Video' },
  { key: 'document', label: 'Document' },
  { key: 'spreadsheet', label: 'Spreadsheet' }
];

const FORM_CATEGORIES = [
  'Patient Intake',
  'Consent',
  'Assessment',
  'Care Note',
  'Referral',
  'Billing',
  'Prescriber Communication',
  'Outcomes TIP',
  'Medical Condition Flowsheet'
];

// ============================================
// Helper Functions
// ============================================

function detectContentFormat(file: StorageFile): string {
  const filename = file.file_name.toLowerCase();
  if (file.resource_type === 'training_module' || 
      filename.endsWith('.mp4') || 
      filename.endsWith('.mov')) {
    return 'video';
  }
  if (filename.endsWith('.xls') || 
      filename.endsWith('.xlsx') || 
      filename.endsWith('.csv')) {
    return 'spreadsheet';
  }
  return 'document';
}

function filterFiles(files: StorageFile[], filters: FilterState): StorageFile[] {
  return files.filter(file => {
    // Quick filter (from cards)
    if (filters.quickFilter) {
      if (filters.quickFilter !== 'all' && file.resource_type !== filters.quickFilter) {
        return false;
      }
    }

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${file.file_name} ${file.program_name}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    // Program filter
    if (filters.programs.length > 0) {
      if (!filters.programs.some(p => file.program_name?.includes(p))) {
        return false;
      }
    }
    
    // Medical conditions filter
    if (filters.medicalConditions.length > 0) {
      // This would need to check the medical_conditions column
      // For now, we'll check if the filename contains condition keywords
      const fileText = file.file_name.toLowerCase();
      const hasCondition = filters.medicalConditions.some(condition => 
        fileText.includes(condition.toLowerCase().split('/')[0])
      );
      if (!hasCondition) return false;
    }

    // Content format filter
    if (filters.contentFormats.length > 0) {
      const format = detectContentFormat(file);
      if (!filters.contentFormats.includes(format)) {
        return false;
      }
    }

    // Form category filter
    if (filters.formCategories.length > 0) {
      // This would check the form_category column
      // For now, check if it's a form and contains category keywords
      if (file.resource_type !== 'documentation_form') return false;
      const fileText = file.file_name.toLowerCase();
      const hasCategory = filters.formCategories.some(category =>
        fileText.includes(category.toLowerCase().split(' ')[0])
      );
      if (!hasCategory) return false;
    }
    
    return true;
  });
}

// ============================================
// Components
// ============================================

interface FilterGroupProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function FilterGroup({ title, options, selected, onChange }: FilterGroupProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map(option => (
          <label 
            key={option}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleOption(option)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function Resources() {
  const [allFiles, setAllFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    quickFilter: null,
    programs: [],
    medicalConditions: [],
    contentFormats: [],
    formCategories: [],
  });

  // Load all resources on mount
  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        setError(null);
        const { data: files } = await catalogService.getAll();
        setAllFiles(files || []);
      } catch (err) {
        console.error('Error loading resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  // Filter files
  const filteredFiles = filterFiles(allFiles, filters);

  // Handle quick filter card click
  const handleQuickFilter = (filterKey: string, filterValue?: string) => {
    if (filterKey === 'all') {
      setFilters(prev => ({ ...prev, quickFilter: null }));
    } else {
      setFilters(prev => ({ ...prev, quickFilter: filterValue || null }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      quickFilter: null,
      programs: [],
      medicalConditions: [],
      contentFormats: [],
      formCategories: [],
    });
  };

  const hasActiveFilters = filters.search.trim() || 
                          filters.quickFilter ||
                          filters.programs.length > 0 || 
                          filters.medicalConditions.length > 0 ||
                          filters.contentFormats.length > 0 ||
                          filters.formCategories.length > 0;

  // Convert files to format expected by ProgramResourceRow
  const convertFileForRow = (file: StorageFile) => ({
    file_name: file.file_name,
    file_url: file.file_url,
    resource_type: file.resource_type,
    length: undefined, // Would come from database if available
  });

  return (
    <AppShell sidebar={<MemberSidebar />}>
      {/* Hero Section */}
      <section className="relative -mx-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 px-3 py-8 text-white">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Resource Library
          </h1>
          <p className="text-lg text-white/90">
            Access all clinical resources, training materials, and documentation
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-6">
        <div className="mx-auto max-w-[1440px]">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Quick Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {QUICK_FILTERS.map(filter => {
              const Icon = filter.icon;
              const isActive = filter.filterType === 'all' 
                ? !filters.quickFilter 
                : filters.quickFilter === filter.filterValue;
              
              return (
                <Card 
                  key={filter.key}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                    isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleQuickFilter(filter.key, filter.filterValue)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`mx-auto mb-2 h-12 w-12 rounded-lg bg-gradient-to-br ${filter.gradient} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {filter.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Area - 20/80 Split */}
          <div className="grid gap-6 lg:grid-cols-5">
            
            {/* Left Sidebar Filters - 20% */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                    {hasActiveFilters && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-7 px-2 text-xs text-blue-600"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-[600px] pr-3">
                    {/* Clinical Programs */}
                    <FilterGroup
                      title="Clinical Programs"
                      options={PROGRAMS}
                      selected={filters.programs}
                      onChange={(programs) => setFilters(prev => ({ ...prev, programs }))}
                    />

                    {/* Medical Conditions */}
                    <FilterGroup
                      title="Medical Conditions"
                      options={MEDICAL_CONDITIONS}
                      selected={filters.medicalConditions}
                      onChange={(medicalConditions) => setFilters(prev => ({ ...prev, medicalConditions }))}
                    />

                    {/* Content Format */}
                    <FilterGroup
                      title="Content Format"
                      options={CONTENT_FORMATS.map(f => f.label)}
                      selected={filters.contentFormats}
                      onChange={(formats) => {
                        const keys = formats.map(label => 
                          CONTENT_FORMATS.find(f => f.label === label)?.key || ''
                        ).filter(Boolean);
                        setFilters(prev => ({ ...prev, contentFormats: keys }));
                      }}
                    />

                    {/* Form Category */}
                    <FilterGroup
                      title="Form Category"
                      options={FORM_CATEGORIES}
                      selected={filters.formCategories}
                      onChange={(formCategories) => setFilters(prev => ({ ...prev, formCategories }))}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - 80% */}
            <div className="lg:col-span-4">
              <Card>
                <CardContent className="p-4">
                  {/* Results Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {loading ? 'Loading...' : 
                         `${filteredFiles.length} resources found`}
                      </span>
                      {hasActiveFilters && filters.quickFilter && (
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                      <p className="text-sm text-red-700 font-medium mb-1">Failed to load resources</p>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  {/* No Results */}
                  {!loading && !error && filteredFiles.length === 0 && (
                    <div className="py-12 text-center">
                      <Search className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-600 font-medium mb-1">No resources found</p>
                      <p className="text-xs text-gray-500">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  )}

                  {/* Results List */}
                  {!loading && !error && filteredFiles.length > 0 && (
                    <div className="space-y-2">
                      {filteredFiles.map((file, index) => (
                        <ProgramResourceRow 
                          key={`${file.file_url}-${index}`} 
                          item={convertFileForRow(file)} 
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}