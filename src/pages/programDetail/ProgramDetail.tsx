/**
 * ProgramDetail page - Uses proper Supabase services
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronDown, ChevronRight, LibraryBig } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SafeText from '@/components/common/SafeText';
import AppShell from '@/components/layout/AppShell';
import MemberSidebar from '@/components/layout/MemberSidebar';
import ProgramResourceRow from '@/components/resources/ProgramResourceRow';
import { programsService, trainingService, resourceService } from '@/lib/supabaseClient';
import type { Database } from '@/types/database.types';
import type { StorageFileItem } from '@/services/supabaseStorage';

type Program = Database['public']['Tables']['programs']['Row'];
type TrainingResource = Database['public']['Views']['training_resources_view']['Row'];
type ResourceRow = Database['public']['Views']['hba1c_view']['Row'];

// Map URL slugs to program names
const SLUG_TO_PROGRAM = {
  'hba1c-testing': 'HbA1C Testing (A1C)',
  'hba1c': 'HbA1C Testing (A1C)',
  'timemymeds': 'TimeMyMeds',
  'time-my-meds': 'TimeMyMeds',
  'oral-contraceptives': 'Oral Contraceptives',
  'oralcontraceptives': 'Oral Contraceptives',
  'mtm-the-future-today': 'MTM The Future Today',
  'mtmthefuturetoday': 'MTM The Future Today',
  'test-and-treat': 'Test and Treat',
  'testandtreat': 'Test and Treat',
} as const;

// Map program names to view names
const PROGRAM_TO_VIEW = {
  'HbA1C Testing (A1C)': 'hba1c_view',
  'TimeMyMeds': 'timemymeds_view',
  'Oral Contraceptives': 'oralcontraceptives_view',
  'MTM The Future Today': 'mtmthefututuretoday_view',
  'Test and Treat': 'testandtreat_view',
} as const;

/**
 * Convert database row to StorageFileItem for compatibility
 */
function convertToStorageFileItem(row: ResourceRow): StorageFileItem {
  return {
    path: row.file_path || '',
    url: row.file_url || '',
    filename: row.file_name || '',
    title: row.file_name?.replace(/\.[^/.]+$/, '') || '',
    mimeType: undefined,
    size: undefined,
  };
}

/**
 * Convert training resource to StorageFileItem for compatibility
 */
function convertTrainingToStorageFileItem(row: TrainingResource): StorageFileItem {
  return {
    path: row.file_path || '',
    url: row.file_url || '',
    filename: row.file_name || '',
    title: row.file_name?.replace(/\.[^/.]+$/, '') || '',
    mimeType: row.mime_type || undefined,
    size: row.file_size || undefined,
  };
}

export default function ProgramDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [training, setTraining] = useState<StorageFileItem[]>([]);
  const [protocols, setProtocols] = useState<StorageFileItem[]>([]);
  const [forms, setForms] = useState<StorageFileItem[]>([]);
  const [resources, setResources] = useState<StorageFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get active tab from URL
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(location.search);
    if (tab === 'overview') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tab);
    }
    const newSearch = newParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  };

  // Get program name from slug
  const programName = slug ? SLUG_TO_PROGRAM[slug as keyof typeof SLUG_TO_PROGRAM] : null;

  useEffect(() => {
    if (!slug || !programName) {
      setError('Program not found');
      setLoading(false);
      return;
    }

    const loadProgramData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get program details
        const { data: programs } = await programsService.getAll();
        const foundProgram = programs?.find(p => p.name === programName);
        if (foundProgram) {
          setProgram(foundProgram);
        }

        // Get training resources
        const { data: trainingData } = await trainingService.getForProgram(programName);
        if (trainingData) {
          setTraining(trainingData.map(convertTrainingToStorageFileItem));
        }

        // Get other resources
        const viewName = PROGRAM_TO_VIEW[programName as keyof typeof PROGRAM_TO_VIEW];
        if (viewName) {
          const [protocolsRes, formsRes, resourcesRes] = await Promise.all([
            resourceService.getForProgram(viewName as any, 'protocol_manual'),
            resourceService.getForProgram(viewName as any, 'documentation_form'),
            resourceService.getForProgram(viewName as any, 'additional_resource'),
          ]);

          if (protocolsRes.data) {
            setProtocols(protocolsRes.data.map(convertToStorageFileItem));
          }
          if (formsRes.data) {
            setForms(formsRes.data.map(convertToStorageFileItem));
          }
          if (resourcesRes.data) {
            setResources(resourcesRes.data.map(convertToStorageFileItem));
          }
        }
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Failed to load program data');
      } finally {
        setLoading(false);
      }
    };

    loadProgramData();
  }, [slug, programName]);

  if (loading) {
    return (
      <AppShell sidebar={<MemberSidebar />}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading program...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell sidebar={<MemberSidebar />}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Link to="/member-content">
              <Button className="mt-4">Back to Programs</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell sidebar={<MemberSidebar />}>
      {/* Hero Section */}
      <section className="relative -mx-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 px-3 py-12 text-white">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-4xl">
            <Breadcrumbs
              items={[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Clinical Programs', to: '/member-content' },
                { label: program?.name || programName || slug || 'Program' },
              ]}
              className="mb-4 text-white/80"
            />
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              <SafeText value={program?.name || programName || slug || 'Program'} />
            </h1>
            {(program?.description || program?.overview) && (
              <p className="text-lg leading-relaxed text-white/90 md:text-xl">
                <SafeText value={program.description || program.overview || ''} />
              </p>
            )}
            {program?.experience_level && (
              <Badge className="mt-4 bg-white/20 text-white hover:bg-white/30">
                {program.experience_level}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <div className="mx-auto max-w-[1440px] px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training ({training.length})</TabsTrigger>
            <TabsTrigger value="protocols">Protocols ({protocols.length})</TabsTrigger>
            <TabsTrigger value="forms">Forms ({forms.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold">Program Overview</h2>
                <p className="text-gray-600">
                  <SafeText value={program?.overview || program?.description || 'No overview available.'} />
                </p>
                {program?.experience_level && (
                  <div className="mt-4">
                    <strong>Experience Level:</strong> {program.experience_level}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <div className="space-y-2">
              {training.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <LibraryBig className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No training modules available.</p>
                  </CardContent>
                </Card>
              ) : (
                training.map((item, index) => (
                  <ProgramResourceRow key={index} item={item} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="protocols" className="mt-6">
            <div className="space-y-2">
              {protocols.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <LibraryBig className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No protocols available.</p>
                  </CardContent>
                </Card>
              ) : (
                protocols.map((item, index) => (
                  <ProgramResourceRow key={index} item={item} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="forms" className="mt-6">
            <div className="space-y-2">
              {forms.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <LibraryBig className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No forms available.</p>
                  </CardContent>
                </Card>
              ) : (
                forms.map((item, index) => (
                  <ProgramResourceRow key={index} item={item} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="space-y-2">
              {resources.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <LibraryBig className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No additional resources available.</p>
                  </CardContent>
                </Card>
              ) : (
                resources.map((item, index) => (
                  <ProgramResourceRow key={index} item={item} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}