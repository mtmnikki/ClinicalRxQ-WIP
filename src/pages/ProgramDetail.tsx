/**
 * ProgramDetail page — DB-backed (storage_files_catalog) via Content API.
 * Uses Content API FileItem types (no StorageFileItem).
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ChevronDown, ChevronRight, LibraryBig } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SafeText from '../components/common/SafeText';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import ProgramResourceRow from '../components/resources/ProgramResourceRow';
import {
  getProgramResourcesGrouped,
  ProgramSlugs,
  listProgramsFromStorage,
  type ProgramSlug,
  type StorageFileItem,
} from '../services/contentApi';

import { getProgramBySlug, listFilesByProgramId, type FileItem } from '../services/contentApi';

type ProgramTab = 'overview' | 'training' | 'protocols' | 'forms' | 'resources';

function normalizeTab(v?: string | null): ProgramTab {
  const t = String(v || '').toLowerCase();
  return (['overview', 'training', 'protocols', 'forms', 'resources'] as const).includes(t as ProgramTab)
    ? (t as ProgramTab)
    : 'overview';
}

/** Heuristics to bucket a file into a tab, using filePath and category/class. */
function inferBucket(f: FileItem): ProgramTab {
  const p = (f.filePath || '').toLowerCase();
  const cat = (f.category || '').toLowerCase();
  const cls = (f.contentClass || '').toLowerCase();

  if (p.includes('/training/') || cat.startsWith('training') || cls === 'training') return 'training';
  if (p.includes('/protocol') || cat.startsWith('protocol') || cls === 'protocol') return 'protocols';
  if (p.includes('/forms/') || cat.startsWith('form') || cls === 'forms') return 'forms';
  return 'resources';
}

/** Collapse helpers for MTM/Test&Treat (driven by folder names in filePath) */
type SectionDef = { key: string; label: string; match: string[] };

const MTM_SECTIONS: SectionDef[] = [
  { key: 'general', label: 'General Forms', match: ['/forms/utilityforms/'] },
  { key: 'flowsheets', label: 'Medical Conditions Flowsheets', match: ['/forms/medflowsheets/'] },
  { key: 'outcomes', label: 'Outcomes TIP Forms', match: ['/forms/outcomestip/'] },
  { key: 'prescriber', label: 'Prescriber Communication Forms', match: ['/forms/prescribercomm/'] },
];

type PrescriberKey = 'general' | 'interactions' | 'needsDrugTherapy' | 'optimizeMedication' | 'suboptimalHighRisk';

const MTM_PRESCRIBER_SECTIONS: SectionDef[] = [
  { key: 'interactions', label: 'Drug Interactions', match: ['/forms/prescribercomm/druginteractions/'] },
  { key: 'needsDrugTherapy', label: 'Needs Drug Therapy', match: ['/forms/prescribercomm/needsdrugtherapy/'] },
  { key: 'optimizeMedication', label: 'Optimize Medication Therapy', match: ['/forms/prescribercomm/optimizemedicationtherapy/'] },
  { key: 'suboptimalHighRisk', label: 'Suboptimal Drug Selection/ High Risk Medication', match: ['/forms/prescribercomm/suboptimaldrugselection_hrm/','/forms/prescribercomm/suboptimaldrugselection/'] },
];

const TNT_SECTIONS: SectionDef[] = [
  { key: 'covid', label: 'COVID', match: ['/forms/test&treat/covid/'] },
  { key: 'flu', label: 'Flu', match: ['/forms/test&treat/flu/'] },
  { key: 'strep', label: 'Strep', match: ['/forms/test&treat/strep/'] },
];

export default function ProgramDetail() {
  const { programSlug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState<string>(programSlug);
  const [description, setDescription] = useState<string | undefined>(undefined);

  // 👇 Use FileItem arrays instead of StorageFileItem
  const [training, setTraining] = useState<FileItem[]>([]);
  const [protocols, setProtocols] = useState<FileItem[]>([]);
  const [forms, setForms] = useState<FileItem[]>([]);
  const [resources, setResources] = useState<FileItem[]>([]);

  const [mtmOpen, setMtmOpen] = useState<Record<string, boolean>>({});
  const [mtmPrescOpen, setMtmPrescOpen] = useState<Record<string, boolean>>({});
  const [tntOpen, setTntOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const program = await getProgramBySlug(programSlug);
        if (!program) throw new Error('Program not found.');
        if (!mounted) return;
        setName(program.name || programSlug);
        setDescription(program.description || undefined);

        const rows = await listFilesByProgramId(program.id);
        if (!mounted) return;

        const bucketed: Record<ProgramTab, FileItem[]> = {
          overview: [] as FileItem[],
          training: [] as FileItem[],
          protocols: [] as FileItem[],
          forms: [] as FileItem[],
          resources: [] as FileItem[],
        };
        for (const r of rows) bucketed[inferBucket(r)].push(r);

        setTraining(bucketed.training);
        setProtocols(bucketed.protocols);
        setForms(bucketed.forms);
        setResources(bucketed.resources);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Failed to load program.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [programSlug]);

  function handleTabChange(next: string) {
    const tab = normalizeTab(next);
    const qs = new URLSearchParams(location.search);
    qs.set('tab', tab);
    navigate({ pathname: location.pathname, search: qs.toString() }, { replace: false });
  }

  const activeTab: ProgramTab = normalizeTab(new URLSearchParams(location.search).get('tab'));
  const lower = (s: string) => s.toLowerCase();

  // 🔁 Update path references to filePath
  const mtmSections = useMemo(() => {
    const formsLower = forms.map(f => ({ f, p: lower(f.filePath) }));
    const sec = MTM_SECTIONS.map(s => ({
      key: s.key,
      label: s.label,
      items: formsLower.filter(x => s.match.some(m => x.p.includes(lower(m)))).map(x => x.f),
    }));

    const prescFiles = formsLower.filter(x => x.p.includes('/forms/prescribercomm/'));
    const presc = MTM_PRESCRIBER_SECTIONS.map(s => ({
      key: s.key,
      label: s.label,
      items: prescFiles.filter(x => s.match.some(m => x.p.includes(lower(m)))).map(x => x.f),
    }));
    const unionSpecific = new Set(presc.flatMap(p => p.items.map(i => i.filePath)));
    const general = prescFiles.filter(x => !unionSpecific.has(x.f.filePath)).map(x => x.f);

    return { sec, presc, prescGeneral: general };
  }, [forms]);

  const tntSections = useMemo(() => {
    const formsLower = forms.map(f => ({ f, p: lower(f.filePath) }));
    const grouped = TNT_SECTIONS.map(s => ({
      key: s.key,
      label: s.label,
      items: formsLower.filter(x => s.match.some(m => x.p.includes(lower(m)))).map(x => x.f),
    }));
    return grouped.filter(g => g.items.length > 0);
  }, [forms]);

  return (
    <AppShell sidebar={<MemberSidebar />}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Member Home', to: '/member' },
            { label: 'Programs', to: '/member/programs' },
            { label: name, to: `/member/programs/${programSlug}` },
          ]}
        />

        <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] shadow">
          <div className="rounded-2xl bg-white/90 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
                {description ? (
                  <p className="mt-1 max-w-3xl text-sm text-slate-600"><SafeText value={description || ""}></SafeText></p>
                ) : null}
              </div>
              <div className="hidden md:block">
                <Badge className="bg-blue-600">Clinical Program</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="training">Training Modules</TabsTrigger>
              <TabsTrigger value="protocols">Protocol Manuals</TabsTrigger>
              <TabsTrigger value="forms">Documentation Forms</TabsTrigger>
              <TabsTrigger value="resources">Additional Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card><CardContent className="py-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <LibraryBig className="h-5 w-5" />
                  <span>Choose a tab to explore training, protocols, forms, and resources for this program.</span>
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="training">
              <div className="space-y-2">
                {training.map((it) => (
                  <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                ))}
                {training.length === 0 ? <div className="text-sm text-slate-500">No training modules yet.</div> : null}
              </div>
            </TabsContent>

            <TabsContent value="protocols">
              <div className="space-y-2">
                {protocols.map((it) => (
                  <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                ))}
                {protocols.length === 0 ? <div className="text-sm text-slate-500">No protocol manuals yet.</div> : null}
              </div>
            </TabsContent>

            <TabsContent value="forms">
              <div className="space-y-4">
                {MTM_SECTIONS.map((sec) => {
                  const open = !!mtmOpen[sec.key];
                  const items = mtmSections.sec.find(s => s.key === sec.key)?.items || [];
                  return (
                    <div key={sec.key} className="rounded-md border bg-white">
                      <button
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                        onClick={() => setMtmOpen((prev) => ({ ...prev, [sec.key]: !open }))}
                      >
                        <span className="font-medium text-slate-900">{sec.label}</span>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {open ? (
                        <div className="border-t p-3 space-y-2">
                          {items.map((it) => (
                            <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                          ))}
                          {items.length === 0 ? <div className="text-sm text-slate-500 px-1">No forms in this section.</div> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {/* Prescriber Communication */}
                <div className="rounded-md border bg-white">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-medium text-slate-900">Prescriber Communication</span>
                  </div>
                  <div className="border-t">
                    {(['interactions','needsDrugTherapy','optimizeMedication','suboptimalHighRisk'] as PrescriberKey[]).map((key) => {
                      const open = !!mtmPrescOpen[key];
                      const label = MTM_PRESCRIBER_SECTIONS.find(s => s.key === key)?.label || key;
                      const items = (key === 'general')
                        ? mtmSections.prescGeneral
                        : (mtmSections.presc.find(s => s.key === key)?.items || []);
                      return (
                        <div key={key} className="border-t first:border-t-0">
                          <button
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                            onClick={() => setMtmPrescOpen((prev) => ({ ...prev, [key]: !open }))}
                          >
                            <span className="text-sm font-medium text-slate-900">{label}</span>
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          {open ? (
                            <div className="border-t p-3 space-y-2">
                              {items.map((it) => (
                                <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                              ))}
                              {items.length === 0 ? <div className="text-sm text-slate-500 px-1">None.</div> : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test & Treat */}
                {tntSections.length ? (
                  <div className="rounded-md border bg-white">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-medium text-slate-900">Test & Treat</span>
                    </div>
                    <div className="border-t">
                      {tntSections.map((sec) => {
                        const open = !!tntOpen[sec.key];
                        return (
                          <div key={sec.key} className="border-t first:border-t-0">
                            <button
                              className="flex w-full items-center justify-between px-4 py-3 text-left"
                              onClick={() => setTntOpen((prev) => ({ ...prev, [sec.key]: !open }))}
                            >
                              <span className="text-sm font-medium text-slate-900">{sec.label}</span>
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            {open ? (
                              <div className="border-t p-3 space-y-2">
                                {sec.items.map((it) => (
                                  <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                                ))}
                                {sec.items.length === 0 ? <div className="text-sm text-slate-500 px-1">None.</div> : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="space-y-2">
                {resources.map((it) => (
                  <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                ))}
                {resources.length === 0 ? <div className="text-sm text-slate-500">No additional resources yet.</div> : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {err ? (
          <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
