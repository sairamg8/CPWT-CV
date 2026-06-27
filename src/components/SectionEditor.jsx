import { useState, useEffect } from 'react';
import {
  Trash2, Plus, ChevronDown, ChevronUp, GripVertical, Settings2,
  AlignLeft, AlignCenter, Eye, EyeOff, X, RotateCcw,
} from 'lucide-react';
import { SECTION_TYPE_DEFAULTS } from '../utils/defaultData';
import RichTextEditor from './RichTextEditor';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// ── Month/Year date picker ────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CUR_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 55 }, (_, i) => CUR_YEAR + 5 - i);

function MonthPicker({ label, value, onChange, disabled }) {
  const parts = (value || '').split(' ');
  const monthStr = MONTHS.includes(parts[0]) ? parts[0] : '';
  const yearStr = parts[1] || '';

  function update(m, y) {
    if (!m && !y) { onChange(''); return; }
    if (m && y) { onChange(`${m} ${y}`); return; }
    if (m) { onChange(yearStr ? `${m} ${yearStr}` : m); return; }
    onChange(monthStr ? `${monthStr} ${y}` : y);
  }

  return (
    <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <div className="flex gap-1 items-center">
        <select
          value={monthStr}
          onChange={e => update(e.target.value, yearStr)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={yearStr}
          onChange={e => update(monthStr, e.target.value)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {value && (
          <button onClick={() => onChange('')} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// Wraps a form field with a label + Eye toggle for per-field visibility
function FieldRow({ label, field, hiddenSet, onToggle, children }) {
  const isHidden = hiddenSet.has(field);
  return (
    <div className={isHidden ? 'opacity-50' : ''}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500">{label}</label>
        <button
          onClick={() => onToggle(field)}
          className={`p-0.5 ${isHidden ? 'text-gray-300 hover:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
          title={isHidden ? 'Show field on resume' : 'Hide field from resume'}
        >
          {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
        </button>
      </div>
      {children}
    </div>
  );
}

function ItemCard({ label, onRemove, onToggleVisibility, visible = true, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-lg overflow-hidden ${visible ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`text-sm font-medium truncate flex-1 ${visible ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{label || 'New Entry'}</span>
        <div className="flex items-center gap-1 shrink-0">
          {onToggleVisibility && (
            <button
              onClick={e => { e.stopPropagation(); onToggleVisibility(); }}
              className={`p-1 ${visible ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-gray-500'}`}
              title={visible ? 'Hide entry' : 'Show entry'}
            >
              {visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
          {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
        </div>
      </div>
      {open && <div className="p-3 space-y-2.5">{children}</div>}
    </div>
  );
}

// ── Item editors ──────────────────────────────────────────────────────────────

function ExperienceItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  const itemHidden = new Set(item.hiddenFields || []);
  function toggleField(f) {
    const cur = item.hiddenFields || [];
    onUpdate({ ...item, hiddenFields: itemHidden.has(f) ? cur.filter(x => x !== f) : [...cur, f] });
  }
  return (
    <ItemCard label={item.role || item.company} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <FieldRow label="Company" field="company" hiddenSet={itemHidden} onToggle={toggleField}>
        <InputField value={item.company} onChange={v => u('company', v)} placeholder="Company Name" />
      </FieldRow>
      <FieldRow label="Job Title" field="role" hiddenSet={itemHidden} onToggle={toggleField}>
        <InputField value={item.role} onChange={v => u('role', v)} placeholder="Software Engineer" />
      </FieldRow>
      <FieldRow label="Location" field="location" hiddenSet={itemHidden} onToggle={toggleField}>
        <InputField value={item.location} onChange={v => u('location', v)} placeholder="City, State" />
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Start Date" field="startDate" hiddenSet={itemHidden} onToggle={toggleField}>
          <MonthPicker value={item.startDate} onChange={v => u('startDate', v)} />
        </FieldRow>
        <FieldRow label="End Date" field="endDate" hiddenSet={itemHidden} onToggle={toggleField}>
          <MonthPicker value={item.current ? '' : item.endDate} onChange={v => u('endDate', v)} disabled={item.current} />
        </FieldRow>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={item.current || false} onChange={e => onUpdate({ ...item, current: e.target.checked, endDate: '' })} className="rounded" />
        Currently working here
      </label>
      <FieldRow label="Description" field="description" hiddenSet={itemHidden} onToggle={toggleField}>
        <RichTextEditor key={item.id + '_desc'} value={item.description} onChange={v => u('description', v)} placeholder="Use bullet list for achievements; bold/italic for emphasis..." rows={5} />
      </FieldRow>
    </ItemCard>
  );
}

function EducationItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.institution || item.degree} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Institution" value={item.institution} onChange={v => u('institution', v)} placeholder="University Name" />
      <InputField label="Degree" value={item.degree} onChange={v => u('degree', v)} placeholder="B.S. Computer Science" />
      <InputField label="Field of Study" value={item.fieldOfStudy} onChange={v => u('fieldOfStudy', v)} placeholder="Computer Science" />
      <InputField label="Location" value={item.location} onChange={v => u('location', v)} placeholder="City, State" />
      <div className="grid grid-cols-2 gap-2">
        <MonthPicker label="Start Date" value={item.startDate} onChange={v => u('startDate', v)} />
        <MonthPicker label="End Date" value={item.endDate} onChange={v => u('endDate', v)} />
      </div>
      <InputField label="GPA (optional)" value={item.gpa} onChange={v => u('gpa', v)} placeholder="3.8" />
      <RichTextEditor
        key={item.id + '_desc'}
        label="Description"
        value={item.description}
        onChange={v => u('description', v)}
        placeholder="Relevant coursework, activities, honors..."
        rows={3}
      />
    </ItemCard>
  );
}

function SkillItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  const itemHidden = new Set(item.hiddenFields || []);
  function toggleField(f) {
    const cur = item.hiddenFields || [];
    onUpdate({ ...item, hiddenFields: itemHidden.has(f) ? cur.filter(x => x !== f) : [...cur, f] });
  }
  return (
    <ItemCard label={item.category || 'Skill Group'} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <FieldRow label="Title / Category" field="category" hiddenSet={itemHidden} onToggle={toggleField}>
        <InputField value={item.category} onChange={v => u('category', v)} placeholder="e.g. Frontend Development" />
      </FieldRow>
      <FieldRow label="Skills / Details" field="skills" hiddenSet={itemHidden} onToggle={toggleField}>
        <InputField value={item.skills} onChange={v => u('skills', v)} placeholder="JavaScript, React, TypeScript, Next.js" />
      </FieldRow>
    </ItemCard>
  );
}

function ProjectItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.name} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Project Name" value={item.name} onChange={v => u('name', v)} placeholder="My Awesome Project" />
      <InputField label="URL (optional)" value={item.url} onChange={v => u('url', v)} placeholder="github.com/you/project" />
      <InputField label="Technologies" value={item.technologies} onChange={v => u('technologies', v)} placeholder="React, Node.js, PostgreSQL" />
      <div className="grid grid-cols-2 gap-2">
        <MonthPicker label="Start Date" value={item.startDate} onChange={v => u('startDate', v)} />
        <MonthPicker label="End Date" value={item.endDate} onChange={v => u('endDate', v)} />
      </div>
      <RichTextEditor
        key={item.id + '_desc'}
        label="Description"
        value={item.description}
        onChange={v => u('description', v)}
        placeholder="What this project does and why it matters..."
        rows={4}
      />
    </ItemCard>
  );
}

function LanguageItem({ item, onUpdate, onRemove }) {
  const visible = item.visible !== false;
  return (
    <div className={`flex gap-2 items-center ${visible ? '' : 'opacity-50'}`}>
      <div className="flex-1 grid grid-cols-[2fr_3fr] gap-2">
        <input
          type="text"
          value={item.language || ''}
          onChange={e => onUpdate({ ...item, language: e.target.value })}
          placeholder="Language"
          className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={item.proficiency || 'Professional'}
          onChange={e => onUpdate({ ...item, proficiency: e.target.value })}
          className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onUpdate({ ...item, visible: !visible })}
        className={`p-1.5 shrink-0 ${visible ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-gray-500'}`}
        title={visible ? 'Hide entry' : 'Show entry'}
      >
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function CertificationItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.name} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Certification Name" value={item.name} onChange={v => u('name', v)} placeholder="AWS Certified Developer" />
      <InputField label="Issuing Organization" value={item.issuer} onChange={v => u('issuer', v)} placeholder="Amazon Web Services" />
      <div className="grid grid-cols-2 gap-2">
        <MonthPicker label="Issue Date" value={item.date} onChange={v => u('date', v)} />
        <MonthPicker label="Expiry Date" value={item.expiry} onChange={v => u('expiry', v)} />
      </div>
      <InputField label="Credential ID (optional)" value={item.credentialId} onChange={v => u('credentialId', v)} placeholder="ABC-12345" />
      <InputField label="Link URL (optional)" value={item.url} onChange={v => u('url', v)} placeholder="https://credential.example.com" />
      {item.url && (
        <InputField label="Link label (optional)" value={item.urlLabel || ''} onChange={v => u('urlLabel', v)} placeholder="View Certificate" />
      )}
    </ItemCard>
  );
}

function AwardItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.title} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Award Title" value={item.title} onChange={v => u('title', v)} placeholder="Dean's List Award" />
      <InputField label="Issuing Organization" value={item.issuer} onChange={v => u('issuer', v)} placeholder="University of California" />
      <MonthPicker label="Date" value={item.date} onChange={v => u('date', v)} />
      <RichTextEditor
        key={item.id + '_desc'}
        label="Description (optional)"
        value={item.description}
        onChange={v => u('description', v)}
        placeholder="Brief description of the award..."
        rows={2}
      />
    </ItemCard>
  );
}

function VolunteeringItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.role || item.org} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Organization" value={item.org} onChange={v => u('org', v)} placeholder="Non-profit Organization" />
      <InputField label="Role" value={item.role} onChange={v => u('role', v)} placeholder="Volunteer Coordinator" />
      <InputField label="Location" value={item.location} onChange={v => u('location', v)} placeholder="City, State" />
      <div className="grid grid-cols-2 gap-2">
        <MonthPicker label="Start Date" value={item.startDate} onChange={v => u('startDate', v)} />
        <MonthPicker label="End Date" value={item.endDate} onChange={v => u('endDate', v)} />
      </div>
      <RichTextEditor
        key={item.id + '_desc'}
        label="Description"
        value={item.description}
        onChange={v => u('description', v)}
        placeholder="What you did and impact made..."
        rows={3}
      />
    </ItemCard>
  );
}

function ReferenceItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.name} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Name" value={item.name} onChange={v => u('name', v)} placeholder="Jane Smith" />
      <InputField label="Job Title" value={item.jobTitle} onChange={v => u('jobTitle', v)} placeholder="Engineering Manager" />
      <InputField label="Company" value={item.company} onChange={v => u('company', v)} placeholder="Acme Corp" />
      <InputField label="Relationship" value={item.relationship} onChange={v => u('relationship', v)} placeholder="Former Manager" />
      <div className="grid grid-cols-2 gap-2">
        <InputField label="Email" value={item.email} onChange={v => u('email', v)} placeholder="jane@acme.com" />
        <InputField label="Phone" value={item.phone} onChange={v => u('phone', v)} placeholder="+1 555-0000" />
      </div>
    </ItemCard>
  );
}

function InterestItem({ item, onUpdate, onRemove }) {
  const visible = item.visible !== false;
  return (
    <div className={`flex gap-2 items-center ${visible ? '' : 'opacity-50'}`}>
      <input
        type="text"
        value={item.interests || ''}
        onChange={e => onUpdate({ ...item, interests: e.target.value })}
        placeholder="e.g. Photography, Hiking, Open Source"
        className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => onUpdate({ ...item, visible: !visible })}
        className={`p-1.5 shrink-0 ${visible ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-gray-500'}`}
        title={visible ? 'Hide entry' : 'Show entry'}
      >
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function CustomItem({ item, onUpdate, onRemove }) {
  const u = (k, v) => onUpdate({ ...item, [k]: v });
  const visible = item.visible !== false;
  return (
    <ItemCard label={item.title} onRemove={onRemove} visible={visible} onToggleVisibility={() => onUpdate({ ...item, visible: !visible })}>
      <InputField label="Title" value={item.title} onChange={v => u('title', v)} placeholder="Entry Title" />
      <InputField label="Subtitle" value={item.subtitle} onChange={v => u('subtitle', v)} placeholder="Organization or Context" />
      <div className="grid grid-cols-2 gap-2">
        <MonthPicker label="Date / Period" value={item.date} onChange={v => u('date', v)} />
        <InputField label="Location" value={item.location} onChange={v => u('location', v)} placeholder="City, State" />
      </div>
      <RichTextEditor
        key={item.id + '_desc'}
        label="Description"
        value={item.description}
        onChange={v => u('description', v)}
        placeholder="Free-form description..."
        rows={3}
      />
    </ItemCard>
  );
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const NEW_ITEM = {
  experience:     () => ({ id: `exp_${Date.now()}`,   company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', bullets: [] }),
  education:      () => ({ id: `edu_${Date.now()}`,   institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', gpa: '', description: '', bullets: [] }),
  skills:         () => ({ id: `sk_${Date.now()}`,    category: '', skills: '' }),
  projects:       () => ({ id: `proj_${Date.now()}`,  name: '', url: '', technologies: '', startDate: '', endDate: '', description: '', bullets: [] }),
  languages:      () => ({ id: `lang_${Date.now()}`,  language: '', proficiency: 'Professional' }),
  certifications: () => ({ id: `cert_${Date.now()}`,  name: '', issuer: '', date: '', expiry: '', credentialId: '', url: '' }),
  awards:         () => ({ id: `awd_${Date.now()}`,   title: '', issuer: '', date: '', description: '' }),
  volunteering:   () => ({ id: `vol_${Date.now()}`,   org: '', role: '', location: '', startDate: '', endDate: '', description: '', bullets: [] }),
  references:     () => ({ id: `ref_${Date.now()}`,   name: '', jobTitle: '', company: '', relationship: '', email: '', phone: '' }),
  interests:      () => ({ id: `int_${Date.now()}`,   interests: '' }),
  custom:         () => ({ id: `cust_${Date.now()}`,  title: '', subtitle: '', date: '', location: '', description: '', bullets: [] }),
};

const ADD_LABEL = {
  experience: 'Add Experience', education: 'Add Education', skills: 'Add Skill Group',
  projects: 'Add Project', languages: 'Add Language', certifications: 'Add Certification',
  awards: 'Add Award', volunteering: 'Add Volunteering', references: 'Add Reference',
  interests: 'Add Interest', custom: 'Add Entry',
};

// ── Section Customizer Panel ──────────────────────────────────────────────────

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SegmentRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-600 shrink-0">{label}</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 text-[11px] rounded border transition-all ${
              value === opt.value
                ? 'bg-blue-600 border-blue-600 text-white font-medium'
                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionCustomizer({ section, updateSectionSettings }) {
  const s = section.settings || {};
  const isSkills = section.type === 'skills';
  const hasLocation = ['experience', 'education', 'volunteering'].includes(section.type);
  const hasDates = !['skills', 'languages', 'references', 'interests'].includes(section.type);
  const hasCols = !['interests'].includes(section.type);
  const hasTitleStyle = ['experience', 'education', 'volunteering', 'custom'].includes(section.type);
  const set = (k, v) => updateSectionSettings(section.id, k, v);

  return (
    <div className="px-3 py-3 bg-slate-50 border-b border-slate-100 space-y-2.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section Options</p>

      <SegmentRow
        label="Alignment"
        value={s.alignment || 'left'}
        onChange={v => set('alignment', v)}
        options={[
          { label: <span className="flex items-center gap-1"><AlignLeft size={11} />Left</span>, value: 'left' },
          { label: <span className="flex items-center gap-1"><AlignCenter size={11} />Center</span>, value: 'center' },
        ]}
      />

      <SegmentRow
        label={isSkills ? 'Rows' : 'Spacing'}
        value={s.spacing || 'normal'}
        onChange={v => set('spacing', v)}
        options={[{ label: 'Tight', value: 'compact' }, { label: 'Normal', value: 'normal' }, { label: 'Spacious', value: 'relaxed' }]}
      />

      {hasCols && (
        <SegmentRow
          label="Grids"
          value={s.columns || 1}
          onChange={v => set('columns', v)}
          options={isSkills
            ? [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]
            : [{ label: '1', value: 1 }, { label: '2', value: 2 }]}
        />
      )}

      {isSkills && (
        <>
          <SegmentRow
            label="Style"
            value={s.skillsStyle || 'inline'}
            onChange={v => set('skillsStyle', v)}
            options={[{ label: 'Inline', value: 'inline' }, { label: 'Stacked', value: 'stacked' }, { label: 'Bullet', value: 'bullet' }, { label: 'Tags', value: 'tags' }]}
          />
          {(s.skillsStyle || 'inline') === 'inline' && (
            <SegmentRow
              label="Separator"
              value={s.separator || 'colon'}
              onChange={v => set('separator', v)}
              options={[{ label: 'Colon  :', value: 'colon' }, { label: 'Dash  –', value: 'dash' }]}
            />
          )}
        </>
      )}

      {section.type === 'experience' && (
        <SegmentRow
          label="Order"
          value={s.titleOrder || 'company'}
          onChange={v => set('titleOrder', v)}
          options={[{ label: 'Co. / Role', value: 'company' }, { label: 'Role / Co.', value: 'role' }]}
        />
      )}

      {hasTitleStyle && (
        <SegmentRow
          label="Title"
          value={s.titleStyle || 'stacked'}
          onChange={v => set('titleStyle', v)}
          options={[{ label: 'Stacked', value: 'stacked' }, { label: 'Inline', value: 'inline' }, { label: 'Side by side', value: 'sidebyside' }]}
        />
      )}

      {hasDates && (
        <ToggleRow
          label="Show dates"
          value={s.showDates !== false}
          onChange={v => set('showDates', v)}
        />
      )}

      {hasLocation && (
        <ToggleRow
          label="Show location"
          value={s.showLocation !== false}
          onChange={v => set('showLocation', v)}
        />
      )}

      <div className="pt-1 border-t border-slate-200 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spacing Override</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Before', key: 'spaceBefore', title: 'Space before section (px)' },
            { label: 'After',  key: 'spaceAfter',  title: 'Space after section (px)' },
            { label: 'Item gap', key: 'itemGap', title: 'Gap between items (px)' },
          ].map(({ label, key, title }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">{label}</span>
              <div className="flex items-center gap-0.5">
                <input
                  type="number"
                  min={0}
                  max={80}
                  title={title}
                  value={s[key] ?? ''}
                  placeholder="—"
                  onChange={e => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value);
                    set(key, v);
                  }}
                  className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 text-center outline-none focus:border-blue-400 bg-white"
                />
                {s[key] != null && (
                  <button
                    title="Reset"
                    onClick={() => set(key, undefined)}
                    className="text-gray-300 hover:text-gray-500 shrink-0"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sortable item wrapper ─────────────────────────────────────────────────────

function SortableItemWrapper({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-start gap-1 group/item"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-2.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 touch-none"
        tabIndex={-1}
      >
        <GripVertical size={13} />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ── SortableSection ───────────────────────────────────────────────────────────

export function SortableSection({
  section, updateSection, updateSectionSettings,
  removeSection, addItem, updateItem, removeItem, reorderItems,
  toggleSectionVisibility,
  forceOpen, forceOpenKey,
}) {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  useEffect(() => {
    if (forceOpenKey > 0) setSectionOpen(forceOpen);
  }, [forceOpenKey]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const itemSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isHidden = section.visible === false;

  function handleItemDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.items.findIndex(i => i.id === active.id);
    const newIndex = section.items.findIndex(i => i.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorderItems(section.id, oldIndex, newIndex);
  }

  function handleAddItem() {
    const factory = NEW_ITEM[section.type] || NEW_ITEM.custom;
    addItem(section.id, factory());
  }

  function renderItem(item) {
    const props = {
      item,
      onUpdate: u => updateItem(section.id, item.id, () => u),
      onRemove: () => removeItem(section.id, item.id),
    };
    switch (section.type) {
      case 'experience':     return <ExperienceItem     {...props} />;
      case 'education':      return <EducationItem      {...props} />;
      case 'skills':         return <SkillItem          {...props} />;
      case 'projects':       return <ProjectItem        {...props} />;
      case 'languages':      return <LanguageItem       {...props} />;
      case 'certifications': return <CertificationItem  {...props} />;
      case 'awards':         return <AwardItem          {...props} />;
      case 'volunteering':   return <VolunteeringItem   {...props} />;
      case 'references':     return <ReferenceItem      {...props} />;
      case 'interests':      return <InterestItem       {...props} />;
      default:               return <CustomItem         {...props} />;
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-colors ${isHidden ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
      {/* Section header */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 ${isHidden ? 'bg-gray-50/50' : 'bg-gray-50'}`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none shrink-0"
        >
          <GripVertical size={15} />
        </button>
        <input
          type="text"
          value={section.title}
          onChange={e => updateSection(section.id, s => ({ ...s, title: e.target.value }))}
          className={`flex-1 text-sm font-semibold bg-transparent focus:outline-none min-w-0 ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}
        />
        {isHidden && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded shrink-0">Hidden</span>
        )}
        <button
          onClick={() => toggleSectionVisibility?.(section.id)}
          className={`p-1.5 rounded transition-colors shrink-0 ${isHidden ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'}`}
          title={isHidden ? 'Show section on resume' : 'Hide section from resume'}
        >
          {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={() => setCustomizerOpen(o => !o)}
          className={`p-1.5 rounded transition-colors shrink-0 ${customizerOpen ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          title="Customize"
        >
          <Settings2 size={13} />
        </button>
        <button
          onClick={() => {
            const factory = SECTION_TYPE_DEFAULTS[section.type] || SECTION_TYPE_DEFAULTS.custom;
            const fresh = factory(section.id);
            updateSection(section.id, s => ({ ...s, settings: { ...fresh.settings } }));
          }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors shrink-0"
          title="Reset section style to defaults"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={() => setSectionOpen(o => !o)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors shrink-0"
        >
          {sectionOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {customizerOpen && (
        <SectionCustomizer section={section} updateSectionSettings={updateSectionSettings} />
      )}

      {sectionOpen && (
        <div className="p-3 space-y-2">
          <DndContext sensors={itemSensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
            <SortableContext items={section.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {section.items.map(item => (
                <SortableItemWrapper key={item.id} id={item.id}>
                  {renderItem(item)}
                </SortableItemWrapper>
              ))}
            </SortableContext>
          </DndContext>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 px-1 py-1"
          >
            <Plus size={13} /> {ADD_LABEL[section.type] || 'Add Entry'}
          </button>
        </div>
      )}
    </div>
  );
}
