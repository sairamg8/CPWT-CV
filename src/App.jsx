import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useCloudSync';
import AuthBar from './components/AuthBar';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import {
  FileText, Plus, Copy, Trash2, Download, Upload, User, Sliders,
  Mail as MailIcon, ChevronDown, ChevronUp, Edit2, Check,
  PanelLeft, Columns2, Eye, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react';

import { useAppStore } from './hooks/useResumeStore';
import PersonalInfoEditor from './components/PersonalInfoEditor';
import { SortableSection } from './components/SectionEditor';
import DesignPanel from './components/DesignPanel';
import CoverLetterPanel from './components/CoverLetterPanel';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import DarkTemplate from './templates/DarkTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import CoverLetterTemplate from './templates/CoverLetterTemplate';
import { exportToPDF } from './utils/pdfExport';
import { exportToWord } from './utils/wordExport';
import { getFontById, loadGoogleFont, loadCustomGoogleFont } from './utils/fonts';

const TEMPLATE_MAP = {
  classic: ClassicTemplate,
  modern:  ModernTemplate,
  minimal: MinimalTemplate,
  dark:    DarkTemplate,
  sidebar: SidebarTemplate,
};

const SECTION_GROUPS = [
  {
    label: 'Core',
    types: [
      { type: 'experience',  label: 'Work Experience' },
      { type: 'education',   label: 'Education' },
      { type: 'skills',      label: 'Skills' },
      { type: 'projects',    label: 'Projects' },
    ],
  },
  {
    label: 'More',
    types: [
      { type: 'languages',     label: 'Languages' },
      { type: 'certifications',label: 'Certifications' },
      { type: 'awards',        label: 'Awards & Honors' },
      { type: 'volunteering',  label: 'Volunteering' },
      { type: 'references',    label: 'References' },
      { type: 'interests',     label: 'Interests' },
      { type: 'custom',        label: 'Custom Section' },
    ],
  },
];

const MARGIN_MAP = { narrow: '8mm 12mm', normal: '14mm 18mm', wide: '20mm 24mm' };
const FONT_SIZE_MAP = { small: '10px', normal: '11px', large: '12.5px' };
const LINE_HEIGHT_MAP = { tight: '1.4', normal: '1.6', relaxed: '1.8' };

function computeMargin(settings) {
  const v = settings.marginV ?? 14;
  const h = settings.marginH ?? 18;
  if (settings.marginV != null || settings.marginH != null) return `${v}mm ${h}mm`;
  return MARGIN_MAP[settings.margins] || MARGIN_MAP.normal;
}

function computeLineHeight(settings) {
  if (settings.lineHeightValue != null) return String(settings.lineHeightValue);
  return LINE_HEIGHT_MAP[settings.lineHeight] || '1.5';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function ResumeCard({ resume, onOpen, onDuplicate, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(resume.name);
  const accent = resume.settings?.accentColor || '#2563eb';

  function commitRename() {
    setEditing(false);
    if (name.trim()) onRename(resume.id, name.trim());
    else setName(resume.name);
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div
        className="h-36 flex items-center justify-center relative cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)` }}
        onClick={() => onOpen(resume.id)}
      >
        <div
          className="w-20 h-28 rounded shadow-md flex flex-col overflow-hidden"
          style={{ border: `2px solid ${accent}30` }}
        >
          <div className="h-7 flex items-center px-2" style={{ backgroundColor: accent }}>
            <div className="space-y-0.5 w-full">
              <div className="h-1 bg-white/70 rounded-sm w-4/5" />
              <div className="h-0.5 bg-white/40 rounded-sm w-1/2" />
            </div>
          </div>
          <div className="flex-1 bg-white p-1.5 space-y-1">
            {[0.9, 0.7, 0.85, 0.6, 0.75].map((w, i) => (
              <div key={i} className="h-1 rounded-sm" style={{ width: `${w * 100}%`, backgroundColor: `${accent}25` }} />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-4 py-2 bg-white rounded-lg shadow-md text-sm font-semibold text-gray-700">
            Open
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="px-3 pt-3 pb-1">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditing(false); setName(resume.name); } }}
              className="flex-1 text-sm font-semibold border-b border-blue-400 outline-none bg-transparent"
            />
            <button onClick={commitRename} className="p-0.5 text-blue-600"><Check size={13} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1 group/name">
            <p className="text-sm font-semibold text-gray-800 truncate flex-1">{resume.name}</p>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover/name:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 transition-opacity shrink-0"
            >
              <Edit2 size={11} />
            </button>
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{resume.template || 'classic'} · {timeAgo(resume.updatedAt)}</p>
      </div>

      {/* Action buttons — always visible */}
      <div className="flex border-t border-gray-100 mt-2">
        <button
          onClick={() => onOpen(resume.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <Edit2 size={11} /> Edit
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDuplicate(resume.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Copy size={11} /> Copy
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDelete(resume.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

function Dashboard({ store, auth, sync }) {
  const navigate = useNavigate();
  const importRef = useRef(null);
  const [importError, setImportError] = useState(null);

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.personal && Array.isArray(parsed.sections)) {
          const id = store.importResume(parsed);
          setImportError(null);
          navigate(`/resume/${id}`);
        } else {
          setImportError('Invalid resume file — missing required fields.');
          setTimeout(() => setImportError(null), 4000);
        }
      } catch {
        setImportError('Could not parse file. Make sure it\'s a valid CPWT-CV JSON.');
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CPWT-CV</span>
          </div>
          <div className="flex items-center gap-2">
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Upload size={15} /> Import
            </button>
            <button
              onClick={() => { const id = store.createResume('Cover Letter'); navigate(`/resume/${id}?tab=coverletter`); }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <MailIcon size={15} /> New Cover
            </button>
            <button
              onClick={() => { const id = store.createResume(); navigate(`/resume/${id}`); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> New Resume
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <AuthBar {...auth} {...sync} />
          </div>
        </div>
        {importError && (
          <div className="max-w-6xl mx-auto px-6 pb-3">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{importError}</p>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-sm text-gray-400">{store.appState.resumes.length} resume{store.appState.resumes.length !== 1 ? 's' : ''}</p>
        </div>

        {store.appState.resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No resumes yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first resume to get started</p>
            <button
              onClick={() => { const id = store.createResume(); navigate(`/resume/${id}`); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              <Plus size={15} /> Create Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {store.appState.resumes.map(r => (
              <ResumeCard
                key={r.id}
                resume={r}
                onOpen={id => navigate(`/resume/${id}`)}
                onDuplicate={id => { const newId = store.duplicateResume(id); if (newId) navigate(`/resume/${newId}`); }}
                onDelete={store.deleteResume}
                onRename={store.renameResume}
              />
            ))}
            <button
              onClick={() => { const id = store.createResume(); navigate(`/resume/${id}`); }}
              className="h-full min-h-[220px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl border-2 border-current flex items-center justify-center">
                <Plus size={22} />
              </div>
              <span className="text-sm font-medium">New Resume</span>
            </button>
            <button
              onClick={() => { const id = store.createResume('Cover Letter'); navigate(`/resume/${id}?tab=coverletter`); }}
              className="h-full min-h-[220px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-purple-500 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl border-2 border-current flex items-center justify-center">
                <MailIcon size={22} />
              </div>
              <span className="text-sm font-medium">New Cover Letter</span>
            </button>
          </div>
        )}
      </div>

      {/* Dashboard footer */}
      <div className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© 2026 CPWT-CV. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <button onClick={() => navigate('/terms')} className="hover:text-gray-700 transition-colors">Terms &amp; Conditions</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-gray-700 transition-colors">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Paginated preview ───────────────────────────────────────────────────────
// Renders an off-screen single-content source (id="resume-preview") used for
// measuring + PDF/Word export, and a stack of real A4 page sheets for display.
// Each visible page clips one page-height slice of the content via translateY,
// so overflow flows onto page 2, 3, … exactly like the printed output.

const PX_PER_MM = 96 / 25.4;

// Walk the rendered content and collect "line-level" leaf blocks (elements whose
// children are inline only). Their top/bottom offsets are safe break boundaries.
function collectLeaves(root) {
  const base = root.getBoundingClientRect().top;
  const leaves = [];
  function isBlockish(el) {
    const d = getComputedStyle(el).display;
    return d.includes('block') || d.includes('flex') || d.includes('grid') || d.includes('list-item') || d.includes('table');
  }
  function walk(el) {
    for (const child of el.children) {
      const hasBlockChild = Array.from(child.children).some(isBlockish);
      if (!hasBlockChild) {
        const r = child.getBoundingClientRect();
        if (r.height > 0) leaves.push({ top: r.top - base, bottom: r.bottom - base });
      } else {
        walk(child);
      }
    }
  }
  walk(root);
  leaves.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
  return leaves;
}

// Greedily pack leaf blocks into A4-height pages, breaking BETWEEN blocks so no
// line of text is sliced across a page boundary.
function computeRanges(contentEl, pageContentPx) {
  const leaves = collectLeaves(contentEl);
  const total = contentEl.scrollHeight;
  if (!leaves.length) return [{ start: 0, height: total }];

  const ranges = [];
  let start = 0;
  let i = 0;
  while (i < leaves.length && ranges.length < 40) {
    const limit = start + pageContentPx;
    let j = i;
    while (j < leaves.length && leaves[j].bottom <= limit + 0.5) j++;
    if (j === i) {
      // A single block is taller than a page — hard cut as a fallback.
      ranges.push({ start, height: pageContentPx });
      start += pageContentPx;
      while (i < leaves.length && leaves[i].top < start - 0.5) i++;
    } else {
      const nextStart = j < leaves.length ? leaves[j].top : total;
      ranges.push({ start, height: nextStart - start });
      start = nextStart;
      i = j;
    }
  }
  if (start < total - 1) ranges.push({ start, height: total - start });
  return ranges;
}

function PaginatedPreview({ resume, ActiveTemplate, margin, fontSize, lineHeight, pageContentMm }) {
  const contentRef = useRef(null);
  const [ranges, setRanges] = useState([{ start: 0, height: 0 }]);

  useLayoutEffect(() => {
    function measure() {
      const el = contentRef.current;
      if (!el) return;
      const next = computeRanges(el, pageContentMm * PX_PER_MM);
      setRanges(prev =>
        prev.length === next.length && prev.every((r, k) => Math.abs(r.start - next[k].start) < 1)
          ? prev : next
      );
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    // fonts can shift layout after load
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [resume, margin, fontSize, lineHeight, pageContentMm]);

  return (
    <>
      {/* Off-screen single-content source — measured and cloned for export */}
      <div
        id="resume-preview"
        aria-hidden
        className="bg-white"
        style={{
          position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none',
          width: '210mm', padding: margin, fontSize, lineHeight,
        }}
      >
        <div ref={contentRef}>
          <ActiveTemplate data={resume} />
        </div>
      </div>

      {/* Visible A4 pages */}
      <div className="flex flex-col items-center gap-6">
        {ranges.map((range, i) => (
          <div
            key={i}
            className="bg-white shadow-2xl relative"
            style={{ width: '210mm', height: '297mm', padding: margin, fontSize, lineHeight }}
          >
            <div style={{ height: `${Math.min(range.height, pageContentMm * PX_PER_MM)}px`, overflow: 'hidden' }}>
              <div style={{ transform: `translateY(-${range.start}px)` }}>
                <ActiveTemplate data={resume} />
              </div>
            </div>
            {ranges.length > 1 && (
              <span className="absolute bottom-3 right-4 text-[9px] text-gray-300 select-none">
                Page {i + 1} of {ranges.length}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function LayoutToggle({ layoutMode, setLayoutMode }) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
      {[
        { mode: 'editor',  Icon: PanelLeft,  title: 'Editor only' },
        { mode: 'split',   Icon: Columns2,   title: 'Split view' },
        { mode: 'preview', Icon: Eye,        title: 'Preview only' },
      ].map(({ mode, Icon, title }) => (
        <button
          key={mode}
          title={title}
          onClick={() => setLayoutMode(mode)}
          className={`p-1.5 rounded-md transition-all ${layoutMode === mode ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

function Editor({ store, auth, sync }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialTab = searchParams.get('tab') || 'resume';

  // Sync URL id → store on mount and when id changes
  useEffect(() => {
    if (id && store.appState.activeId !== id) {
      const exists = store.appState.resumes.some(r => r.id === id);
      if (exists) store.setActiveId(id);
      else navigate('/', { replace: true });
    }
  }, [id]);

  const resume = store.activeResume;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [personalOpen, setPersonalOpen] = useState(true);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // null | 'pdf' | 'word'
  const importJsonRef = useRef(null);
  const [resumeName, setResumeName] = useState(resume?.name || '');
  const [editingName, setEditingName] = useState(false);
  const [layoutMode, setLayoutMode] = useState('split'); // 'editor' | 'split' | 'preview'

  // ── Collapse-all state ──────────────────────────────────────────────────────
  const [allExpanded, setAllExpanded] = useState(true);
  const [forceOpenKey, setForceOpenKey] = useState(0);

  function toggleAllSections() {
    const next = !allExpanded;
    setAllExpanded(next);
    setPersonalOpen(next);
    setForceOpenKey(k => k + 1);
  }

  // ── Draggable panel width ───────────────────────────────────────────────────
  const [panelWidth, setPanelWidth] = useState(() => {
    const stored = localStorage.getItem('cpwtcv-panel-width');
    return stored ? Math.min(640, Math.max(240, parseInt(stored, 10))) : 360;
  });
  const dragState = useRef(null);

  function onDragHandleMouseDown(e) {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startW: panelWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(e) {
      if (!dragState.current) return;
      const delta = e.clientX - dragState.current.startX;
      const next = Math.min(640, Math.max(240, dragState.current.startW + delta));
      setPanelWidth(next);
    }

    function onMouseUp(e) {
      if (dragState.current) {
        const delta = e.clientX - dragState.current.startX;
        const final = Math.min(640, Math.max(240, dragState.current.startW + delta));
        localStorage.setItem('cpwtcv-panel-width', String(final));
      }
      dragState.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  const ActiveTemplate = TEMPLATE_MAP[resume?.template] || ClassicTemplate;
  const settings = resume?.settings || {};
  const margin = computeMargin(settings);
  const fontSize = FONT_SIZE_MAP[settings.fontSize] || '11px';
  const lineHeight = computeLineHeight(settings);

  // Vertical page margin (mm) → printable content height per A4 page, used to
  // draw page-break guides on the live preview so multi-page flow is visible.
  const vMarginMm = parseFloat(margin.split(' ')[0]) || 14;
  const pageContentMm = Math.max(100, 297 - vMarginMm * 2);

  useEffect(() => {
    const font = getFontById(settings.font);
    if (font) loadGoogleFont(font);
  }, [settings.font]);

  useEffect(() => {
    if (settings.customFont) loadCustomGoogleFont(settings.customFont);
  }, [settings.customFont]);

  useEffect(() => {
    setResumeName(resume?.name || '');
  }, [resume?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleSectionDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const sections = resume.sections;
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      store.updateSections(arrayMove(sections, oldIndex, newIndex));
    }
  }

  async function handleExportPDF() {
    setExporting('pdf');
    const filename = (resume?.personal?.name || resume?.name || 'resume').replace(/\s+/g, '_');
    await exportToPDF(activeTab === 'coverletter' ? 'cover-letter-preview' : 'resume-preview', `${filename}.pdf`, margin);
    setExporting(null);
  }

  async function handleExportWord() {
    setExporting('word');
    const filename = (resume?.personal?.name || resume?.name || 'resume').replace(/\s+/g, '_');
    try {
      await exportToWord(resume, `${filename}.docx`);
    } catch (e) {
      console.error('Word export failed:', e);
    }
    setExporting(null);
  }

  function commitName() {
    setEditingName(false);
    if (resumeName.trim()) store.renameResume(resume.id, resumeName.trim());
    else setResumeName(resume.name);
  }

  if (!resume) return null;

  const TABS = [
    { id: 'resume',      label: 'Resume',       icon: User },
    { id: 'design',      label: 'Design',       icon: Sliders },
    { id: 'coverletter', label: 'Cover Letter',  icon: MailIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f3ef]">
      {/* Left Panel */}
      <div
        className={`${layoutMode === 'preview' ? 'hidden' : layoutMode === 'editor' ? 'flex-1' : ''} bg-white flex flex-col overflow-hidden shadow-sm`}
        style={layoutMode === 'split' ? { width: panelWidth, minWidth: panelWidth, flexShrink: 0 } : undefined}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-white">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={resumeName}
                onChange={e => setResumeName(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setEditingName(false); setResumeName(resume.name); } }}
                className="w-full text-sm font-semibold border-b border-blue-400 outline-none bg-transparent text-gray-800"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm font-semibold text-gray-800 hover:text-gray-600 truncate w-full text-left"
              >
                {resume.name}
              </button>
            )}
          </div>

          {/* Layout toggle */}
          <LayoutToggle layoutMode={layoutMode} setLayoutMode={setLayoutMode} />

          <div className="flex gap-1 shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={!!exporting}
              title="Export as PDF"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Download size={12} />
              {exporting === 'pdf' ? '...' : 'PDF'}
            </button>
            <button
              onClick={handleExportWord}
              disabled={!!exporting}
              title="Export as Word (.docx)"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              <FileText size={12} />
              {exporting === 'word' ? '...' : 'Word'}
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(resume, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(resume?.personal?.name || resume?.name || 'resume').replace(/\s+/g, '_')}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Export as JSON"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-600 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={12} />
              JSON
            </button>
            <input
              ref={importJsonRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  try {
                    const parsed = JSON.parse(ev.target.result);
                    if (parsed.personal && Array.isArray(parsed.sections)) {
                      const newId = store.importResume(parsed);
                      navigate(`/resume/${newId}`);
                    }
                  } catch {}
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => importJsonRef.current?.click()}
              title="Import JSON resume"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
            >
              <Upload size={12} />
              Import
            </button>
            <div className="w-px h-4 bg-gray-200 self-center" />
            <AuthBar {...auth} {...sync} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
                activeTab === id
                  ? 'text-blue-600 border-blue-600 bg-white'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'resume' && (
            <div className="px-4 py-4 space-y-3">
              {/* Collapse / Expand all */}
              <div className="flex justify-end">
                <button
                  onClick={toggleAllSections}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                  title={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
                >
                  {allExpanded
                    ? <><ChevronsDownUp size={12} /> Collapse All</>
                    : <><ChevronsUpDown size={12} /> Expand All</>
                  }
                </button>
              </div>

              {/* Personal Info */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 text-left select-none"
                  onClick={() => setPersonalOpen(o => !o)}
                >
                  <User size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-semibold text-gray-700 flex-1">Personal Info</span>
                  {personalOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {personalOpen && (
                  <div className="p-4 border-t border-gray-100">
                    <PersonalInfoEditor
                      personal={resume.personal}
                      updatePersonal={store.updatePersonal}
                      toggleFieldVisibility={store.toggleFieldVisibility}
                      settings={resume.settings}
                      updateSetting={store.updateSetting}
                    />
                  </div>
                )}
              </div>

              {/* Sections */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                <SortableContext
                  items={resume.sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {resume.sections.map(section => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      updateSection={store.updateSection}
                      updateSectionSettings={store.updateSectionSettings}
                      removeSection={store.removeSection}
                      addItem={store.addItem}
                      updateItem={store.updateItem}
                      removeItem={store.removeItem}
                      reorderItems={store.reorderItems}
                      toggleSectionVisibility={store.toggleSectionVisibility}
                      forceOpen={allExpanded}
                      forceOpenKey={forceOpenKey}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Section */}
              <div className="border border-dashed border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setAddSectionOpen(o => !o)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={15} />
                  Add Section
                  {addSectionOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {addSectionOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-100">
                    {SECTION_GROUPS.map(group => (
                      <div key={group.label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">{group.label}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {group.types.map(({ type, label }) => (
                            <button
                              key={type}
                              onClick={() => { store.addSection(type); setAddSectionOpen(false); }}
                              className="px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 text-left transition-colors"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-4" />
            </div>
          )}

          {activeTab === 'design' && (
            <div className="px-4 py-4">
              <DesignPanel
                resume={resume}
                updateSetting={store.updateSetting}
                setTemplate={store.setTemplate}
                resetSettings={store.resetSettings}
              />
            </div>
          )}

          {activeTab === 'coverletter' && (
            <div className="px-4 py-4">
              <CoverLetterPanel
                coverLetter={resume.coverLetter}
                personal={resume.personal}
                updateCoverLetter={store.updateCoverLetter}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drag handle — only in split mode */}
      {layoutMode === 'split' && (
        <div
          onMouseDown={onDragHandleMouseDown}
          title="Drag to resize panel"
          className="w-1 shrink-0 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors z-10"
        />
      )}

      {/* Right Preview Panel */}
      <div className={`${layoutMode === 'editor' ? 'hidden' : 'flex-1'} overflow-auto bg-[#f5f3ef] flex flex-col items-center py-8`}>
        <div className="mb-4 flex items-center gap-3">
          <LayoutToggle layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            {activeTab === 'coverletter' ? 'Cover Letter' : 'Resume'} · A4
          </span>
        </div>

        {activeTab === 'coverletter' ? (
          <div
            id="cover-letter-preview"
            className="bg-white shadow-2xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: margin,
              fontSize,
              lineHeight,
            }}
          >
            <CoverLetterTemplate data={resume} />
          </div>
        ) : (
          <PaginatedPreview
            resume={resume}
            ActiveTemplate={ActiveTemplate}
            margin={margin}
            fontSize={fontSize}
            lineHeight={lineHeight}
            pageContentMm={pageContentMm}
          />
        )}

        <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
          <span>Auto-saved to your browser</span>
          <span>·</span>
          <button onClick={() => navigate('/terms')} className="hover:text-gray-600 transition-colors">Terms</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-gray-600 transition-colors">Privacy</button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const store  = useAppStore();
  const auth   = useAuth();
  const sync   = useCloudSync({ user: auth.user, appState: store.appState, store });

  const authSync = { auth, sync };

  return (
    <Routes>
      <Route path="/" element={<Dashboard store={store} {...authSync} />} />
      <Route path="/resume/:id" element={<Editor store={store} {...authSync} />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
