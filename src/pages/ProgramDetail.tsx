/**
 * ProgramDetail page backed by Supabase tables.
 * Displays a single program with grouped resources.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { LibraryBig } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SafeText from '../components/common/SafeText';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import ProgramResourceRow from '../components/resources/ProgramResourceRow';
import { getProgramBySlug, listFilesByProgramId, type FileItem, type Program } from '../services/contentApi';

/** Tab identifiers */
type ProgramTab = 'overview' | 'training' | 'protocols' | 'forms' | 'resources';

function normalizeTab(v: string | null | undefined): ProgramTab {
  const val = (v || '').toLowerCase();
  return val === 'training' || val === 'protocols' || val === 'forms' || val === 'resources' ? val : 'overview';
}

export default function ProgramDetail() {
  const { programSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const currentTab = normalizeTab(new URLSearchParams(location.search).get('tab'));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!programSlug) return;
      try {
        setLoading(true);
        setErr(null);
        const prog = await getProgramBySlug(programSlug);
        if (!prog) {
          navigate('/member-content');
          return;
        }
        if (cancelled) return;
        setProgram(prog);
        const rows = await listFilesByProgramId(prog.id);
        if (!cancelled) setFiles(rows);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || 'Failed to load program');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [programSlug, navigate]);

  const training = useMemo(() => files.filter((f) => f.category?.toLowerCase() === 'training'), [files]);
  const protocols = useMemo(() => files.filter((f) => f.category?.toLowerCase() === 'protocols'), [files]);
  const forms = useMemo(() => files.filter((f) => f.category?.toLowerCase() === 'forms'), [files]);
  const resources = useMemo(() => files.filter((f) => f.category?.toLowerCase() === 'resources'), [files]);
  const counts = {
    training: training.length,
    protocols: protocols.length,
    forms: forms.length,
    resources: resources.length,
  };

  function handleTabChange(v: ProgramTab) {
    const params = new URLSearchParams(location.search);
    params.set('tab', v);
    navigate({ search: params.toString() }, { replace: true });
  }

  function renderRows(items: FileItem[], empty: string) {
    if (!items.length) {
      return <div className="rounded-md border p-6 text-sm text-slate-600">{empty}</div>;
    }
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <ProgramResourceRow key={item.fileId} item={item} />
        ))}
      </div>
    );
  }

  if (!programSlug) return null;

  const { name = '', description } = program || {};

  return (
    <AppShell>
      <MemberSidebar />
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Programs', path: '/member-content' },
          { label: name || programSlug, path: `/program/${programSlug}` },
        ]}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 py-10 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <LibraryBig className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold leading-tight">
                <SafeText value={name} />
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!loading ? (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    {counts.training} training • {counts.protocols} protocols • {counts.forms} forms • {counts.resources} resources
                  </Badge>
                ) : null}
              </div>
              {description ? (
                <p className="mt-3 max-w-3xl text-sm text-white">
                  <SafeText value={description} />
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        {loading ? (
          <div className="rounded-md border p-6 text-sm text-slate-600">Loading program…</div>
        ) : err ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">{err}</div>
        ) : (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300" />
              <CardContent className="p-0">
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  <div className="sticky top-0 z-20 border-b bg-white/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <TabsList className="h-9">
                      <TabsTrigger value="overview" className="text-sm">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="training" className="text-sm">
                        Training {counts.training ? `(${counts.training})` : ''}
                      </TabsTrigger>
                      <TabsTrigger value="protocols" className="text-sm">
                        Protocols {counts.protocols ? `(${counts.protocols})` : ''}
                      </TabsTrigger>
                      <TabsTrigger value="forms" className="text-sm">
                        Forms {counts.forms ? `(${counts.forms})` : ''}
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="text-sm">
                        Additional Resources {counts.resources ? `(${counts.resources})` : ''}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="px-4 py-4">
                    <div className="space-y-4">
                      {description ? (
                        <p className="text-sm text-slate-700">
                          <SafeText value={description} />
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600">
                          This program includes training modules, protocols, documentation forms, and additional resources.
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-md border bg-white p-3 text-center text-sm">
                          <div className="text-2xl font-semibold text-slate-900">{counts.training}</div>
                          <div className="text-slate-600">Training</div>
                        </div>
                        <div className="rounded-md border bg-white p-3 text-center text-sm">
                          <div className="text-2xl font-semibold text-slate-900">{counts.protocols}</div>
                          <div className="text-slate-600">Protocols</div>
                        </div>
                        <div className="rounded-md border bg-white p-3 text-center text-sm">
                          <div className="text-2xl font-semibold text-slate-900">{counts.forms}</div>
                          <div className="text-slate-600">Forms</div>
                        </div>
                        <div className="rounded-md border bg-white p-3 text-center text-sm">
                          <div className="text-2xl font-semibold text-slate-900">{counts.resources}</div>
                          <div className="text-slate-600">Resources</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="training" className="px-4 py-4">
                    {renderRows(training, 'No training modules available yet.')}
                  </TabsContent>

                  <TabsContent value="protocols" className="px-4 py-4">
                    {renderRows(protocols, 'No protocol manuals available yet.')}
                  </TabsContent>

                  <TabsContent value="forms" className="px-4 py-4">
                    {renderRows(forms, 'No documentation forms available yet.')}
                  </TabsContent>

                  <TabsContent value="resources" className="px-4 py-4">
                    {renderRows(resources, 'No additional resources available yet.')}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </AppShell>
  );
}
