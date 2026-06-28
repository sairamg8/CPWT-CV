import { useEffect, useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { FONTS, getFontById, loadGoogleFont, loadCustomGoogleFont, loadCustomFonts, saveCustomFont, removeCustomFont } from '@/utils/fonts';
import { ATS_DEFAULTS } from '@/utils/defaultData';

const TEMPLATES = [
  { id: 'classic', label: 'Classic', desc: 'ATS-friendly · Two-column header', ats: true },
  { id: 'modern',  label: 'Modern',  desc: 'Bold accent header · Full-width layout' },
  { id: 'minimal', label: 'Minimal', desc: 'ATS-friendly · Clean & whitespace-first', ats: true },
  { id: 'sidebar', label: 'Sidebar', desc: 'Colored left sidebar layout' },
];

const ACCENT_PRESETS = [
  { label: 'Blue',    color: '#2563eb' },
  { label: 'Indigo',  color: '#4f46e5' },
  { label: 'Violet',  color: '#7c3aed' },
  { label: 'Rose',    color: '#e11d48' },
  { label: 'Orange',  color: '#ea580c' },
  { label: 'Teal',    color: '#0d9488' },
  { label: 'Slate',   color: '#475569' },
  { label: 'Black',   color: '#0f172a' },
];

const TEXT_COLOR_PRESETS = [
  { label: 'Near Black', color: '#1a1a1a' },
  { label: 'Dark Gray',  color: '#374151' },
  { label: 'Slate',      color: '#334155' },
  { label: 'Ink',        color: '#1e293b' },
];

function Label({ children }) {
  return <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{children}</p>;
}

function SizeRow({ label, value, onChange, min = 6, max = 40 }) {
  const [raw, setRaw] = useState('');
  const [editing, setEditing] = useState(false);

  function commit(str) {
    const n = parseInt(str, 10);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 w-28">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
        >−</button>
        <input
          type="text"
          value={editing ? raw : value + 'pt'}
          onFocus={() => { setEditing(true); setRaw(String(value)); }}
          onChange={e => setRaw(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { commit(raw); e.target.blur(); }
            if (e.key === 'Escape') { setEditing(false); e.target.blur(); }
          }}
          className="w-14 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 h-6 cursor-text"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
        >+</button>
      </div>
    </div>
  );
}

function NumberRow({ label, value, onChange, min = 1, max = 200, step = 1, unit = '' }) {
  const [raw, setRaw] = useState('');
  const [editing, setEditing] = useState(false);

  function commit(str) {
    const n = parseFloat(str);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, Math.round(n / step) * step)));
    setEditing(false);
  }

  const display = editing ? raw : (Number.isInteger(value / step) && step >= 1 ? value + unit : value.toFixed(step < 1 ? 1 : 0) + unit);

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 w-28">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, Math.round((value - step) / step) * step))}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
        >−</button>
        <input
          type="text"
          value={display}
          onFocus={() => { setEditing(true); setRaw(String(value)); }}
          onChange={e => setRaw(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { commit(raw); e.target.blur(); }
            if (e.key === 'Escape') { setEditing(false); e.target.blur(); }
          }}
          className="w-14 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 h-6 cursor-text"
        />
        <button
          onClick={() => onChange(Math.min(max, Math.round((value + step) / step) * step))}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
        >+</button>
      </div>
    </div>
  );
}

function SegmentControl({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-xs font-medium rounded border transition-all ${
            value === opt.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DesignSection({ title, defaultOpen = false, onReset, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center justify-between pl-4 pr-2 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''} ml-2`} />
        </button>
        {onReset && (
          <button
            onClick={e => { e.stopPropagation(); onReset(); }}
            className="px-3 py-3 text-gray-300 hover:text-indigo-500 transition-colors shrink-0"
            title={`Reset ${title} to defaults`}
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>
      {open && <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">{children}</div>}
    </div>
  );
}

const COLOR_KEYS      = ['accentColor', 'textColor', 'sidebarBg', 'headerTextColor', 'nameColor', 'jobTitleColor'];
const TYPOGRAPHY_KEYS = ['font', 'fontSize', 'fontSizeBase', 'fontSizeNameDelta', 'fontSizeSectionDelta', 'fontSizeEntryDelta', 'customFont', 'iconSize'];
const SPACING_KEYS    = ['lineHeightValue', 'marginV', 'marginH', 'sectionGap', 'itemGap'];
const HEADING_KEYS    = ['headingStyle', 'sectionTitleCase', 'sectionBorderWidth', 'sectionBorderColor'];

export default function DesignPanel({ resume, updateSetting, setTemplate, resetSettings }) {
  const settings = resume.settings || {};
  const [customFontInput, setCustomFontInput] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedCustomFonts, setSavedCustomFonts] = useState(() => loadCustomFonts());

  function resetSection(keys) {
    keys.forEach(k => { if (k in ATS_DEFAULTS) updateSetting(k, ATS_DEFAULTS[k]); });
  }

  useEffect(() => {
    const font = getFontById(settings.font);
    if (font) loadGoogleFont(font);
  }, [settings.font]);

  // Load saved custom fonts into the browser on mount
  useEffect(() => {
    savedCustomFonts.forEach(name => loadCustomGoogleFont(name));
  }, []);

  return (
    <div className="space-y-3 py-2">

      {/* ── Template (open by default) ─────────────────────────────── */}
      <DesignSection title="Template" defaultOpen>
        <div className="space-y-1.5">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                resume.template === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-8 h-10 rounded shrink-0 flex flex-col gap-0.5 p-1 ${resume.template === t.id ? 'opacity-100' : 'opacity-40'}`}
                style={{ backgroundColor: resume.template === t.id ? settings.accentColor || '#2563eb' : '#94a3b8' }}
              >
                <div className="h-1 bg-white/60 rounded-sm w-full" />
                <div className="h-0.5 bg-white/40 rounded-sm w-3/4" />
                <div className="h-0.5 bg-white/30 rounded-sm w-full mt-0.5" />
                <div className="h-0.5 bg-white/30 rounded-sm w-5/6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-medium ${resume.template === t.id ? 'text-blue-700' : 'text-gray-700'}`}>{t.label}</p>
                  {t.ats && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700">ATS</span>}
                </div>
                <p className="text-[10px] text-gray-400">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </DesignSection>

      {/* ── Colors ────────────────────────────────────────────────────── */}
      <DesignSection title="Colors" onReset={() => resetSection(COLOR_KEYS)}>
        <div>
          <Label>Accent Color</Label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {ACCENT_PRESETS.map(p => (
              <button
                key={p.color}
                onClick={() => updateSetting('accentColor', p.color)}
                title={p.label}
                className={`h-8 rounded-md border-2 transition-all ${
                  settings.accentColor === p.color ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Custom:</label>
            <input
              type="color"
              value={settings.accentColor || '#2563eb'}
              onChange={e => updateSetting('accentColor', e.target.value)}
              className="h-7 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
            />
            <span className="text-xs text-gray-400 font-mono">{settings.accentColor || '#2563eb'}</span>
          </div>
        </div>

        <div>
          <Label>Text Color</Label>
          <div className="flex gap-2 mb-2">
            {TEXT_COLOR_PRESETS.map(p => (
              <button
                key={p.color}
                onClick={() => updateSetting('textColor', p.color)}
                title={p.label}
                className={`h-8 flex-1 rounded-md border-2 transition-all ${
                  (settings.textColor || '#1a1a1a') === p.color ? 'border-blue-500 scale-105' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Custom:</label>
            <input
              type="color"
              value={settings.textColor || '#1a1a1a'}
              onChange={e => updateSetting('textColor', e.target.value)}
              className="h-7 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
            />
            <span className="text-xs text-gray-400 font-mono">{settings.textColor || '#1a1a1a'}</span>
          </div>
        </div>

        {/* Header text color — for templates with a colored/dark header banner */}
        {(resume.template === 'modern' || resume.template === 'sidebar') && (
          <div className="pt-1 border-t border-gray-100">
            <Label>Header Text Color</Label>
            <p className="text-[10px] text-gray-400 mb-2">
              {resume.template === 'sidebar' ? 'Color for name text in the sidebar header.' : 'Color for name & text in the colored header banner.'}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Color:</label>
              <input
                type="color"
                value={settings.headerTextColor || '#ffffff'}
                onChange={e => updateSetting('headerTextColor', e.target.value)}
                className="h-7 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-xs text-gray-400 font-mono">{settings.headerTextColor || '#ffffff'}</span>
              {settings.headerTextColor && settings.headerTextColor !== '#ffffff' && (
                <button onClick={() => updateSetting('headerTextColor', '#ffffff')} className="text-[11px] text-gray-400 hover:text-gray-600" title="Reset to white">↺</button>
              )}
            </div>
          </div>
        )}

        {/* Name & job title color overrides */}
        <div className="pt-1 border-t border-gray-100 space-y-3">
          <Label>Name &amp; Title Colors</Label>
          {[
            { key: 'nameColor',     label: 'Name color',      placeholder: 'Template default' },
            { key: 'jobTitleColor', label: 'Job title color',  placeholder: 'Template default' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings[key] || '#000000'}
                  onChange={e => updateSetting(key, e.target.value)}
                  className="h-6 w-10 rounded border border-gray-200 cursor-pointer p-0.5"
                  title={label}
                />
                <span className="text-[11px] text-gray-400 font-mono w-16 truncate">{settings[key] || placeholder}</span>
                {settings[key] && (
                  <button onClick={() => updateSetting(key, '')} className="text-[11px] text-gray-400 hover:text-gray-600" title="Reset to template default">↺</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar template-specific color */}
        {resume.template === 'sidebar' && (
          <div className="pt-1 border-t border-gray-100">
            <Label>Sidebar Background</Label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { label: 'Navy',     color: '#1e293b' },
                { label: 'Indigo',   color: '#1e1b4b' },
                { label: 'Dark',     color: '#111827' },
                { label: 'Ocean',    color: '#0f2744' },
                { label: 'Charcoal', color: '#292524' },
                { label: 'Forest',   color: '#14532d' },
                { label: 'Purple',   color: '#2e1065' },
                { label: 'Crimson',  color: '#450a0a' },
              ].map(p => (
                <button
                  key={p.color}
                  onClick={() => updateSetting('sidebarBg', p.color)}
                  title={p.label}
                  className={`h-8 rounded-md border-2 transition-all ${
                    (settings.sidebarBg || '#1e293b') === p.color ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Custom:</label>
              <input type="color" value={settings.sidebarBg || '#1e293b'} onChange={e => updateSetting('sidebarBg', e.target.value)}
                className="h-7 w-16 rounded border border-gray-200 cursor-pointer p-0.5" />
              <span className="text-xs text-gray-400 font-mono">{settings.sidebarBg || '#1e293b'}</span>
              {settings.sidebarBg && settings.sidebarBg !== '#1e293b' && (
                <button onClick={() => updateSetting('sidebarBg', '#1e293b')} className="text-[11px] text-gray-400 hover:text-gray-600">↺</button>
              )}
            </div>
          </div>
        )}
      </DesignSection>

      {/* ── Typography ────────────────────────────────────────────────── */}
      <DesignSection title="Typography" onReset={() => resetSection(TYPOGRAPHY_KEYS)}>
        <div>
          <Label>Font Family</Label>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {FONTS.map(font => (
              <button
                key={font.id}
                onClick={() => { updateSetting('font', font.id); updateSetting('customFont', ''); setCustomFontInput(''); }}
                style={{ fontFamily: font.family }}
                className={`px-1.5 py-1.5 text-xs rounded-md border transition-all text-left truncate ${
                  settings.font === font.id && !settings.customFont
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
          {savedCustomFonts.length > 0 && (
            <div className="mb-2">
              <p className="text-[11px] text-gray-400 mb-1">Your custom fonts</p>
              <div className="flex flex-wrap gap-1">
                {savedCustomFonts.map(name => {
                  const active = settings.customFont === name;
                  return (
                    <div
                      key={name}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all ${
                        active ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <button
                        style={{ fontFamily: `'${name}', sans-serif` }}
                        onClick={() => { loadCustomGoogleFont(name); updateSetting('customFont', name); updateSetting('font', ''); }}
                        className="leading-none"
                      >{name}</button>
                      <button
                        onClick={() => { removeCustomFont(name); setSavedCustomFonts(loadCustomFonts()); if (settings.customFont === name) updateSetting('customFont', ''); }}
                        className="text-gray-300 hover:text-red-400 leading-none ml-0.5"
                        title="Remove font"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <p className="text-[11px] text-gray-400 mb-1">Add a Google Font:</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={customFontInput}
              onChange={e => setCustomFontInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customFontInput.trim()) {
                  const name = customFontInput.trim();
                  loadCustomGoogleFont(name); updateSetting('customFont', name); updateSetting('font', '');
                  saveCustomFont(name); setSavedCustomFonts(loadCustomFonts()); setCustomFontInput('');
                }
              }}
              placeholder="e.g. Nunito, Raleway, Poppins"
              className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const name = customFontInput.trim();
                if (name) {
                  loadCustomGoogleFont(name); updateSetting('customFont', name); updateSetting('font', '');
                  saveCustomFont(name); setSavedCustomFonts(loadCustomFonts()); setCustomFontInput('');
                }
              }}
              className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >Add</button>
          </div>
        </div>

        <div>
          <Label>Font Size</Label>
          <SegmentControl
            value={settings.fontSize || 'normal'}
            onChange={v => updateSetting('fontSize', v)}
            options={[
              { label: 'Small', value: 'small' },
              { label: 'Normal', value: 'normal' },
              { label: 'Large', value: 'large' },
            ]}
          />
        </div>

        <div>
          <Label>Typography Scale</Label>
          <div className="space-y-2.5">
            {(() => {
              const base = settings.fontSizeBase || 11;
              const nameDelta = settings.fontSizeNameDelta ?? 8;
              const sectionDelta = settings.fontSizeSectionDelta ?? 1;
              const entryDelta = settings.fontSizeEntryDelta ?? 0;
              return (
                <>
                  <SizeRow label="Base" value={base} onChange={v => updateSetting('fontSizeBase', v)} min={8} max={16} />
                  <SizeRow label="Full Name" value={base + nameDelta} onChange={v => updateSetting('fontSizeNameDelta', v - base)} min={base} max={36} />
                  <SizeRow label="Section Title" value={base + sectionDelta} onChange={v => updateSetting('fontSizeSectionDelta', v - base)} min={6} max={24} />
                  <SizeRow label="Entry Header" value={base + entryDelta} onChange={v => updateSetting('fontSizeEntryDelta', v - base)} min={6} max={24} />
                  <SizeRow label="Contact Icons" value={settings.iconSize ?? 11} onChange={v => updateSetting('iconSize', v)} min={8} max={20} />
                </>
              );
            })()}
          </div>
        </div>
      </DesignSection>

      {/* ── Spacing ───────────────────────────────────────────────────── */}
      <DesignSection title="Spacing" onReset={() => resetSection(SPACING_KEYS)}>
        <div className="space-y-3">
          <NumberRow
            label="Line Height"
            value={settings.lineHeightValue ?? 1.5}
            onChange={v => updateSetting('lineHeightValue', v)}
            min={1.0} max={3.0} step={0.1}
          />
          <div className="h-px bg-gray-100" />
          <NumberRow label="Top / Bottom margin" value={settings.marginV ?? 14} onChange={v => updateSetting('marginV', v)} min={0} max={40} step={1} unit="mm" />
          <NumberRow label="Left / Right margin" value={settings.marginH ?? 18} onChange={v => updateSetting('marginH', v)} min={0} max={40} step={1} unit="mm" />
          <div className="h-px bg-gray-100" />
          <NumberRow label="Between Sections" value={settings.sectionGap ?? 16} onChange={v => updateSetting('sectionGap', v)} min={0} max={60} step={1} unit="px" />
          <NumberRow label="Between Items" value={settings.itemGap ?? 12} onChange={v => updateSetting('itemGap', v)} min={0} max={40} step={1} unit="px" />
        </div>
      </DesignSection>

      {/* ── Section Headings ──────────────────────────────────────────── */}
      <DesignSection title="Section Headings" onReset={() => resetSection(HEADING_KEYS)}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Title case</span>
          <div className="flex gap-1">
            {[{ value: 'upper', label: 'ABC' }, { value: 'normal', label: 'Abc' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateSetting('sectionTitleCase', opt.value)}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-all ${
                  (settings.sectionTitleCase || 'upper') === opt.value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Border thickness</span>
          <div className="flex items-center gap-1">
            <button onClick={() => updateSetting('sectionBorderWidth', Math.max(1, (settings.sectionBorderWidth ?? 1) - 1))} className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none">−</button>
            <input type="number" min={1} max={8} value={settings.sectionBorderWidth ?? 1} onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) updateSetting('sectionBorderWidth', Math.min(8, Math.max(1, v))); }} className="w-10 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 h-6" />
            <button onClick={() => updateSetting('sectionBorderWidth', Math.min(8, (settings.sectionBorderWidth ?? 1) + 1))} className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none">+</button>
            <span className="text-[11px] text-gray-400 ml-1">px</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Border color</span>
          <div className="flex items-center gap-2">
            <input type="color" value={settings.sectionBorderColor || settings.accentColor || '#374151'} onChange={e => updateSetting('sectionBorderColor', e.target.value)} className="h-6 w-10 rounded border border-gray-200 cursor-pointer p-0.5" title="Pick border color" />
            <span className="text-[11px] text-gray-400 font-mono">{settings.sectionBorderColor || 'accent'}</span>
            {settings.sectionBorderColor && (
              <button onClick={() => updateSetting('sectionBorderColor', '')} className="text-[11px] text-gray-400 hover:text-gray-600" title="Reset to accent color">↺</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: 'ruled', label: 'Ruled' },
            { value: 'leftbar', label: 'Left bar' },
            { value: 'line', label: 'Line after' },
            { value: 'underline', label: 'Underline' },
            { value: 'box', label: 'Boxed' },
            { value: 'plain', label: 'Plain' },
          ].map(opt => {
            const active = (settings.headingStyle || 'ruled') === opt.value;
            const accent = settings.accentColor || '#374151';
            return (
              <button key={opt.value} onClick={() => updateSetting('headingStyle', opt.value)} className={`px-2 py-2 rounded-lg border text-left transition-all ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="mb-1">
                  {opt.value === 'ruled' && <div><span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#374151' }}>ABC</span><div className="h-px mt-0.5" style={{ backgroundColor: '#e5e7eb' }} /></div>}
                  {opt.value === 'leftbar' && <div className="flex items-center gap-1"><div className="w-0.5 self-stretch rounded-full" style={{ backgroundColor: accent }} /><span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#374151' }}>ABC</span></div>}
                  {opt.value === 'line' && <div className="flex items-center gap-1"><span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: accent }}>ABC</span><span className="flex-1 h-px" style={{ backgroundColor: accent + '60' }} /></div>}
                  {opt.value === 'underline' && <div className="pb-0.5 inline-block" style={{ borderBottom: `1.5px solid ${accent}` }}><span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: accent }}>ABC</span></div>}
                  {opt.value === 'box' && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: accent, backgroundColor: accent + '18' }}>ABC</span>}
                  {opt.value === 'plain' && <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: accent }}>ABC</span>}
                </div>
                <span className={`text-[10px] ${active ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </DesignSection>

      {/* ── Reset ─────────────────────────────────────────────────────── */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-amber-800">Reset Design Settings</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              {confirmReset
                ? 'This will reset all design settings to ATS defaults. Resume content is kept.'
                : 'Resets font, colors, spacing, and layout settings to ATS-safe defaults.'}
            </p>
          </div>
          {confirmReset ? (
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => { resetSettings?.(); setConfirmReset(false); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Yes, Reset</button>
              <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors shrink-0">Reset</button>
          )}
        </div>
      </div>
    </div>
  );
}
