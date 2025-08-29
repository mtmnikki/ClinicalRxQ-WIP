/**
 * Member Content page - Programs listing from database
 * Uses the programs table as specified in CLAUDE.md
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { BookOpen, FileText, Zap, Award, Loader2 } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SafeText from '../components/common/SafeText';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import { programsService, type Program } from '../services/supabaseClient';

/**
 * Convert program name to URL slug
 */
function generateSlug(programName: string): string {
  return programName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get visual styling based on experience level
 */
function getProgramVisuals(level?: string) {
  const lower = (level || '').toLowerCase();
  if (lower.includes('advanced') || lower.includes('expert')) {
    return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: Zap };
  }
  if (lower.includes('intermediate')) {
    return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: Award };
  }
  return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: FileText };
}

export default function MemberContent() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        setError(null);
        const data = await programsService.getAllPrograms();
        setPrograms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load programs');
        console.error('Error loading programs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  return (
    <AppShell sidebar={<MemberSidebar />}>
      {/* Hero Section */}
      <section className="relative -mx-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 px-3 py-12 text-white">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-4xl">
            <Breadcrumbs
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Clinical Programs' },
              ]}
              className="mb-4 text-white/80"
            />
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Clinical Programs
            </h1>
            <p className="text-lg leading-relaxed text-white/90 md:text-xl">
              Select a program below to access training modules, protocols, documentation forms, and additional resources.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-[1440px]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && programs.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No programs available at this time.</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && programs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => {
                const visuals = getProgramVisuals(program.experience_level);
                const Icon = visuals.icon;
                const slug = generateSlug(program.name);

                return (
                  <Card 
                    key={program.name}
                    className="group overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className={`h-2 bg-gradient-to-r ${visuals.color}`} />
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <div className={`rounded-lg bg-gradient-to-br p-2 ${visuals.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {program.experience_level && (
                          <span className="text-xs font-medium text-gray-500">
                            {program.experience_level}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl">
                        <SafeText text={program.name} />
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        <SafeText text={program.description || 'Click to view training modules and resources'} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/program/${slug}`}>
                        <Button 
                          className="w-full bg-gradient-to-r transition-all group-hover:shadow-md"
                          variant="default"
                        >
                          <span className="flex items-center">
                            View Program
                            <BookOpen className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}