/**
 * Resource Library — DB-backed (PostgREST) via Content API.
 * Uses FileItem end-to-end with server-side filters and a client-side
 * medical-conditions filter for convenience.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import {
  ProgramSlugs,
  getProgramResourcesGrouped,
  getGlobalCategory,
  type ProgramSlug,
} from '../services/contentApi';

type Params = {
  q?: string;
  category?: string;
  subcategory?: string;
  video?: string; // '1' | '0' | undefined
  cond?: string;
};

function useQueryParams(): [Params, (next: Partial<Params>) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const params: Params = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return {
      q: qs.get('q') || undefined,
      category: qs.get('category') || undefined,
      subcategory: qs.get('subcategory') || undefined,
      video: qs.get('video') || undefined,
      cond: qs.get('cond') || undefined,
    };
  }, [location.search]);

  function setParams(next: Partial<Params>) {
    const qs = new URLSearchParams(location.search);
    Object.entries(next).forEach(([k, v]) => {
      if (v == null || v === '') qs.delete(k);
      else qs.set(k, String(v));
    });
    navigate({ pathname: location.pathname, search: qs.toString() }, { replace: false });
  }

  return [params, setParams];
}

export default function Resources() {
  const [params, setParams] = useQueryParams();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<FileItem[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const data = await listAllFiles({
          category: params.category,
          subcategory: params.subcategory,
          q: params.q,
          isVideo: params.video === '1' ? true : params.video === '0' ? false : undefined,
        });
        if (!mounted) return;
        setRows(data);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Failed to load resources.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [params.category, params.subcategory, params.q, params.video]);

  // Client-side medical conditions filter
  const filtered = useMemo(() => {
    const cond = (params.cond || '').trim().toLowerCase();
    if (!cond) return rows;
    return rows.filter(r => (r.medicalConditions || '').toLowerCase().includes(cond));
  }, [rows, params.cond]);

  // Build unique category/subcategory lists from the currently returned rows
  const categories = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach(r => { if (r.category) set.add(r.category); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filtered]);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach(r => { if (r.subcategory) set.add(r.subcategory); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filtered]);

  // Group for display: Category › Subcategory
  const grouped = useMemo(() => {
    const map = new Map<string, FileItem[]>();
    const keyOf = (r: FileItem) => `${r.category || 'Uncategorized'} › ${r.subcategory || 'General'}`;
    for (const r of filtered) {
      const k = keyOf(r);
      const arr = map.get(k) || [];
      arr.push(r);
      map.set(k, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.fileName || '').localeCompare(b.fileName || ''));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  // Handlers
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => setParams({ q: e.target.value || undefined });
  const onCond = (e: React.ChangeEvent<HTMLInputElement>) => setParams({ cond: e.target.value || undefined });
  const onCat = (e: React.ChangeEvent<HTMLSelectElement>) => setParams({ category: e.target.value || undefined });
  const onSub = (e: React.ChangeEvent<HTMLSelectElement>) => setParams({ subcategory: e.target.value || undefined });
  const onVid = (e: React.ChangeEvent<HTMLInputElement>) => setParams({ video: e.target.checked ? '1' : undefined });
  const onNonVid = (e: React.ChangeEvent<HTMLInputElement>) => setParams({ video: e.target.checked ? '0' : undefined });

  return (
    <AppShell sidebar={<MemberSidebar />}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Resource Library</h1>
          <p className="text-sm text-slate-600">Search and filter all files across programs.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Search filename</label>
            <input
              type="search"
              value={params.q || ''}
              onChange={onSearch}
              placeholder="e.g., counseling checklist"
              className="h-9 rounded-md border px-3 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Medical condition contains</label>
            <input
              type="search"
              value={params.cond || ''}
              onChange={onCond}
              placeholder="e.g., diabetes"
              className="h-9 rounded-md border px-3 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Category</label>
            <select value={params.category || ''} onChange={onCat} className="h-9 rounded-md border px-3 text-sm">
              <option value="">All</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Subcategory</label>
            <select value={params.subcategory || ''} onChange={onSub} className="h-9 rounded-md border px-3 text-sm">
              <option value="">All</option>
              {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Video toggles */}
        <div className="mb-6 flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={params.video === '1'} onChange={onVid} />
            <span>Show only videos</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={params.video === '0'} onChange={onNonVid} />
            <span>Hide videos</span>
          </label>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : err ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
        ) : grouped.length === 0 ? (
          <div className="text-sm text-slate-500">No results.</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([groupName, items]) => (
              <div key={groupName}>
                <div className="mb-2 text-sm font-medium text-slate-700">{groupName}</div>
                <div className="space-y-2">
                  {items.map(it => (
                    <ProgramResourceRow key={it.fileId ?? it.filePath} item={it} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
