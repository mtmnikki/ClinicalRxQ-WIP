/**
 * Resource Library page backed by Content API.
 * Provides filtering by category, videos, program files, and medical conditions.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Grid2x2,
  FileText,
  BookText,
  FileSpreadsheet,
  LibraryBig,
  Play,
  Download,
  Search,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import { listAllFiles, type FileItem } from '../services/contentApi';

interface ResultItem {
  id: string;
  name: string;
  url: string;
  mimeType?: string | null;
  source: 'global' | 'program';
  medicalConditions?: string | null;
}

type FilterKey = 'all' | 'handouts' | 'clinical' | 'billing' | 'program' | 'videos' | 'conditions';

type ConditionKey =
  | 'diabetes'
  | 'hypertension'
  | 'heart-failure'
  | 'asthma-copd'
  | 'lipids'
  | 'infections'
  | 'contraceptives'
  | 'pain-opioids';

const CONDITION_OPTIONS: Array<{ key: ConditionKey; label: string; keywords: string[] }> = [
  { key: 'diabetes', label: 'Diabetes', keywords: ['diabetes', 'glycemic', 'blood sugar', 'a1c', 'hba1c'] },
  { key: 'hypertension', label: 'Hypertension', keywords: ['hypertension', 'blood pressure'] },
  { key: 'heart-failure', label: 'Heart Failure', keywords: ['heart failure', 'chf'] },
  { key: 'asthma-copd', label: 'Asthma/COPD', keywords: ['asthma', 'copd'] },
  { key: 'lipids', label: 'Lipids/Cholesterol', keywords: ['cholesterol', 'lipid', 'statin'] },
  {
    key: 'infections',
    label: 'Infections (Flu/Strep/COVID/UTI)',
    keywords: ['flu', 'influenza', 'strep', 'covid', 'covid-19', 'uti', 'urinary tract'],
  },
  { key: 'contraceptives', label: 'Contraceptives', keywords: ['contraceptive', 'us mec', 'us spr'] },
  {
    key: 'pain-opioids',
    label: 'Pain & Opioids',
    keywords: ['opioid', 'opioids', 'low back pain', 'opioid taper', 'tapering'],
  },
];

function isVideo({ url, mimeType }: { url?: string; mimeType?: string }): boolean {
  const mime = (mimeType || '').toLowerCase();
  if (mime.startsWith('video/')) return true;
  const u = (url || '').toLowerCase();
  return ['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv'].some((ext) => u.endsWith(ext));
}

function FileKindIcon({ isVid }: { isVid: boolean }) {
  return isVid ? (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300">
      <Play className="h-4 w-4 text-white" />
    </div>
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300">
      <FileText className="h-4 w-4 text-white" />
    </div>
  );
}

function SidebarCheckboxFilters({
  value,
  onChange,
  condition,
  onSelectCondition,
}: {
  value: FilterKey;
  onChange: (next: FilterKey) => void;
  condition: ConditionKey | null;
  onSelectCondition: (next: ConditionKey) => void;
}) {
  function Row({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
    return (
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-slate-50">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
          checked={checked}
          onChange={onClick}
        />
        <span className="text-sm text-slate-700">{label}</span>
      </label>
    );
  }

  return (
    <div className="space-y-4" aria-label="Content filters">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</div>
        <button
          type="button"
          onClick={() => onChange('all')}
          className="rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
        >
          Clear Filters
        </button>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Global categories</div>
        <div className="space-y-1">
          <Row label="Patient handouts" checked={value === 'handouts'} onClick={() => onChange('handouts')} />
          <Row label="Clinical guidelines" checked={value === 'clinical'} onClick={() => onChange('clinical')} />
          <Row label="Medical billing" checked={value === 'billing'} onClick={() => onChange('billing')} />
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Content types</div>
        <div className="space-y-1">
          <Row label="Program files" checked={value === 'program'} onClick={() => onChange('program')} />
          <Row label="Videos" checked={value === 'videos'} onClick={() => onChange('videos')} />
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Medical conditions</div>
        <div className="space-y-1">
          {CONDITION_OPTIONS.map((opt) => (
            <Row
              key={opt.key}
              label={opt.label}
              checked={value === 'conditions' && condition === opt.key}
              onClick={() => onSelectCondition(opt.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickFilterCard({
  title,
  subtitle,
  Icon,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'aspect-square w-full rounded-xl border transition-shadow hover:shadow-md',
        active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
      </div>
    </button>
  );
}

function useFilterFromQuery(): [FilterKey, (next: FilterKey, nav?: (url: string) => void) => void] {
  const location = useLocation();
  const current: FilterKey = (() => {
    const cat = new URLSearchParams(location.search).get('cat')?.toLowerCase();
    if (cat === 'handouts' || cat === 'clinical' || cat === 'billing') return cat as FilterKey;
    return 'all';
  })();
  function set(next: FilterKey, nav?: (url: string) => void) {
    if (next === 'handouts' || next === 'clinical' || next === 'billing') {
      nav?.(`/resources?cat=${next}`);
    } else {
      nav?.('/resources');
    }
  }
  return [current, set];
}

export default function Resources() {
  const navigate = useNavigate();
  const [filterFromQuery, setFilterFromQuery] = useFilterFromQuery();
  const [filter, setFilter] = useState<FilterKey>(filterFromQuery);
  const [selectedCondition, setSelectedCondition] = useState<ConditionKey | null>(null);
  useEffect(() => {
    if (filter === 'program' || filter === 'videos' || filter === 'conditions') return;
    setFilter(filterFromQuery);
  }, [filterFromQuery]);

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ResultItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const params: { category?: string; q?: string; isVideo?: boolean } = {};
        if (filter === 'handouts' || filter === 'clinical' || filter === 'billing') params.category = filter;
        if (filter === 'videos') params.isVideo = true;
        if (q) params.q = q;
        const rows = await listAllFiles(params);
        if (cancelled) return;
        const mapped: ResultItem[] = rows.map((r: FileItem) => ({
          id: r.fileId,
          name: r.fileName,
          url: r.fileUrl,
          mimeType: r.mimeType,
          source: r.programId ? 'program' : 'global',
          medicalConditions: r.medicalConditions,
        }));
        setItems(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load resources');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, q]);

  const filtered = useMemo(() => {
    let rows = items;
    if (filter === 'program') rows = rows.filter((r) => r.source === 'program');
    if (filter === 'conditions') {
      const opt = CONDITION_OPTIONS.find((o) => o.key === selectedCondition);
      if (opt) {
        rows = rows.filter((r) => {
          if (r.medicalConditions) {
            const mc = r.medicalConditions.toLowerCase();
            return opt.keywords.some((kw) => mc.includes(kw.toLowerCase()));
          }
          const name = r.name.toLowerCase();
          return opt.keywords.some((kw) => name.includes(kw.toLowerCase()));
        });
      }
    }
    return rows;
  }, [items, filter, selectedCondition]);

  function go(next: FilterKey) {
    setFilter(next);
    if (next === 'program' || next === 'videos' || next === 'conditions') {
      setFilterFromQuery('all', navigate);
    } else {
      setFilterFromQuery(next, navigate);
    }
  }

  function chooseCondition(next: ConditionKey) {
    setSelectedCondition(next);
    setFilter('conditions');
    setFilterFromQuery('all', navigate);
  }

  return (
    <AppShell>
      <MemberSidebar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Resource Library</h1>

        <div className="mb-6 flex gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search resources by name…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <QuickFilterCard title="All Resources" subtitle="Browse everything" Icon={Grid2x2} active={filter === 'all'} onClick={() => go('all')} />
          <QuickFilterCard title="Patient Handouts" subtitle="Patient-facing PDFs" Icon={FileText} active={filter === 'handouts'} onClick={() => go('handouts')} />
          <QuickFilterCard title="Clinical Guidelines" subtitle="Reference docs" Icon={BookText} active={filter === 'clinical'} onClick={() => go('clinical')} />
          <QuickFilterCard title="Medical Billing" subtitle="Codes & forms" Icon={FileSpreadsheet} active={filter === 'billing'} onClick={() => go('billing')} />
          <QuickFilterCard title="Program Files" subtitle="All training assets" Icon={LibraryBig} active={filter === 'program'} onClick={() => go('program')} />
          <QuickFilterCard title="Videos" subtitle="Watch training" Icon={Play} active={filter === 'videos'} onClick={() => go('videos')} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <aside className="md:col-span-1">
            <SidebarCheckboxFilters
              value={filter}
              onChange={go}
              condition={selectedCondition}
              onSelectCondition={chooseCondition}
            />
          </aside>

          <section className="md:col-span-3">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-sm text-slate-600">Loading…</div>
                ) : error ? (
                  <div className="p-6 text-sm text-red-600">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-sm text-slate-600">No results.</div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filtered.map((item) => {
                      const isVid = isVideo({ url: item.url, mimeType: item.mimeType });
                      return (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <FileKindIcon isVid={isVid} />
                            <div className="truncate text-sm font-medium text-slate-800">{item.name}</div>
                          </div>
                          <div className="shrink-0">
                            <a href={item.url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline" className="bg-transparent">
                                {isVid ? (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Play
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
