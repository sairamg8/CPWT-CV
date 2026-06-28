import { useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Globe, Link, Code, FileText, Camera, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

const FIELDS = [
  { key: 'name',     label: 'Full Name',  icon: User,     placeholder: 'John Doe',            required: true },
  { key: 'title',    label: 'Job Title',  icon: FileText, placeholder: 'Software Engineer',    required: true },
  { key: 'email',    label: 'Email',      icon: Mail,     placeholder: 'john@email.com' },
  { key: 'phone',    label: 'Phone',      icon: Phone,    placeholder: '+1 (555) 000-0000' },
  { key: 'location', label: 'Location',   icon: MapPin,   placeholder: 'City, State' },
  { key: 'website',  label: 'Website',    icon: Globe,    placeholder: 'yoursite.com', hasUrl: true },
  { key: 'linkedin', label: 'LinkedIn',   icon: Link,     placeholder: 'linkedin.com/in/you', hasUrl: true },
  { key: 'github',   label: 'GitHub',     icon: Code,     placeholder: 'github.com/you', hasUrl: true },
];

// ── Visual layout preview mini-cards ─────────────────────────────────────────

function LayoutPreview({ type }) {
  const bar = (w, h = 'h-1', cls = 'bg-gray-300 rounded-sm') => (
    <div className={`${h} ${cls} rounded-sm`} style={{ width: w }} />
  );

  if (type === 'stack') return (
    <div className="flex flex-col gap-1 items-start w-full px-1">
      <div className="h-1.5 bg-gray-500 rounded-sm w-3/4" />
      <div className="h-1 bg-gray-300 rounded-sm w-1/2" />
      <div className="flex gap-1 mt-0.5">{bar('28%')}{bar('28%')}{bar('28%')}</div>
    </div>
  );

  if (type === 'inline') return (
    <div className="flex flex-col gap-1 items-start w-full px-1">
      <div className="flex gap-1 items-center">
        <div className="h-1.5 bg-gray-500 rounded-sm w-1/2" />
        <div className="h-px bg-gray-300 w-1" />
        <div className="h-1 bg-gray-300 rounded-sm w-1/3" />
      </div>
      <div className="flex gap-1 mt-0.5">{bar('28%')}{bar('28%')}{bar('28%')}</div>
    </div>
  );

  if (type === 'centered') return (
    <div className="flex flex-col gap-1 items-center w-full">
      <div className="h-1.5 bg-gray-500 rounded-sm w-3/5" />
      <div className="h-1 bg-gray-300 rounded-sm w-2/5" />
      <div className="flex gap-1 mt-0.5">{bar('22%')}{bar('22%')}{bar('22%')}</div>
    </div>
  );

  return null;
}

// ── Chip button ───────────────────────────────────────────────────────────────

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border transition-all ${
        active
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
          : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 bg-white'
      }`}
    >
      {children}
    </button>
  );
}

function PresetCard({ active, onClick, label, previewType }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-stretch gap-2 p-2 rounded-xl border-2 transition-all ${
        active
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className={`h-10 rounded-lg flex items-center justify-center ${active ? 'bg-blue-100' : 'bg-gray-50'}`}>
        <LayoutPreview type={previewType} />
      </div>
      <p className={`text-[11px] font-medium text-center ${active ? 'text-blue-700' : 'text-gray-500'}`}>{label}</p>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PersonalInfoEditor({ personal, updatePersonal, toggleFieldVisibility, settings, updateSetting, template }) {
  const photoInputRef = useRef(null);
  const hidden = new Set(personal.hiddenFields || []);
  const s = settings || {};
  const [headerOpen, setHeaderOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const isClassicOrMinimal = !template || template === 'classic' || template === 'minimal';
  const templateLabel = template ? template.charAt(0).toUpperCase() + template.slice(1) : 'Classic';

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updatePersonal('photo', ev.target.result);
    reader.readAsDataURL(file);
  }

  function set(key, val) { updateSetting?.(key, val); }

  return (
    <div className="space-y-5">

      {/* ── Header Section ── */}
      <div className="bg-gray-50 rounded-xl border border-gray-100">
        <button
          onClick={() => setHeaderOpen(o => !o)}
          className="w-full flex items-center justify-between p-3 text-left"
        >
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Header Customization</p>
          {headerOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </button>

        {headerOpen && (
          <div className="space-y-4 px-3 pb-3">
            {isClassicOrMinimal ? (
              <>
                {/* Text Alignment */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Text Alignment</p>
                  <div className="flex gap-2">
                    <PresetCard
                      active={(s.headerAlign || 'left') === 'left'}
                      onClick={() => set('headerAlign', 'left')}
                      label="Left"
                      previewType="stack"
                    />
                    <PresetCard
                      active={(s.headerAlign || 'left') === 'center'}
                      onClick={() => set('headerAlign', 'center')}
                      label="Center"
                      previewType="centered"
                    />
                  </div>
                </div>

                {/* Header Layout */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Name & Title Layout</p>
                  <div className="flex gap-2">
                    <PresetCard
                      active={(s.headerLayout || 'stack') === 'stack'}
                      onClick={() => set('headerLayout', 'stack')}
                      label="Stack"
                      previewType="stack"
                    />
                    <PresetCard
                      active={(s.headerLayout || 'stack') === 'inline'}
                      onClick={() => set('headerLayout', 'inline')}
                      label="Inline"
                      previewType="inline"
                    />
                  </div>
                </div>

                {/* Inline gap control */}
                {(s.headerLayout || 'stack') === 'inline' && (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">Name &amp; Title Spacing</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => set('headerInlineGap', Math.max(2, (s.headerInlineGap ?? 8) - 2))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >−</button>
                        <span className="w-14 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded h-6 flex items-center justify-center">
                          {s.headerInlineGap ?? 8}px
                        </span>
                        <button
                          onClick={() => set('headerInlineGap', Math.min(48, (s.headerInlineGap ?? 8) + 2))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >+</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Bottom Border */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">Header Bottom Border</p>
                    <button
                      onClick={() => set('showHeaderBorder', s.showHeaderBorder === false ? true : false)}
                      className={`p-1 rounded transition-colors ${s.showHeaderBorder === false ? 'text-gray-300 hover:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
                      title={s.showHeaderBorder === false ? 'Show border' : 'Hide border'}
                    >
                      {s.showHeaderBorder === false ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {s.showHeaderBorder !== false && (
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-gray-400">Thickness</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => set('headerBorderWidth', Math.max(1, (s.headerBorderWidth || 2) - 1))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={s.headerBorderWidth || 2}
                          onChange={e => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v)) set('headerBorderWidth', Math.min(12, Math.max(1, v)));
                          }}
                          className="w-14 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 h-6"
                        />
                        <button
                          onClick={() => set('headerBorderWidth', Math.min(12, (s.headerBorderWidth || 2) + 1))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >+</button>
                        <span className="text-[11px] text-gray-400 ml-1">px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Arrangement */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Contact Details</p>
                  <p className="text-[11px] text-gray-400 mb-1.5">Layout</p>
                  <div className="flex gap-2 mb-3">
                    {[
                      { val: 'single',  label: 'Single' },
                      { val: 'justify', label: 'Justify' },
                      { val: '2grid',   label: '2 Grid' },
                    ].map(({ val, label }) => (
                      <Chip key={val} active={(s.contactLayout || 'justify') === val} onClick={() => set('contactLayout', val)}>
                        {label}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1.5">Style</p>
                  <div className="flex gap-2 mb-2">
                    {[
                      { val: 'icon',   label: '⊕ Icon' },
                      { val: 'bullet', label: '• Bullet' },
                      { val: 'bar',    label: '| Bar' },
                    ].map(({ val, label }) => (
                      <Chip key={val} active={(s.contactStyle || 'icon') === val} onClick={() => set('contactStyle', val)}>
                        {label}
                      </Chip>
                    ))}
                  </div>
                  {(s.contactStyle === 'icon' || s.contactStyle === undefined) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Icon size</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => set('iconSize', Math.max(8, (s.iconSize ?? 11) - 1))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >−</button>
                        <span className="w-10 text-center text-xs font-medium text-gray-700 border border-gray-200 rounded h-6 flex items-center justify-center">
                          {s.iconSize ?? 11}px
                        </span>
                        <button
                          onClick={() => set('iconSize', Math.min(20, (s.iconSize ?? 11) + 1))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-100 text-base leading-none"
                        >+</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : template === 'sidebar' ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">Sidebar template layout</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The Sidebar template uses a fixed two-column layout — a dark left panel for contact/skills and the main area for experience. Header alignment and contact style don't apply here.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  To change sidebar background, name color, or text colors, open the <strong>Design</strong> tab → <strong>Colors</strong>.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">{templateLabel} template header</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The {templateLabel} template uses a fixed banner header — alignment, border, and contact layout controls apply to <strong>Classic</strong> and <strong>Minimal</strong> templates only.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  To change header text color, name color, or job title color, open the <strong>Design</strong> tab → <strong>Colors</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Photo Upload ── */}
      <div className="bg-gray-50 rounded-xl border border-gray-100">
        <button
          onClick={() => setPhotoOpen(o => !o)}
          className="w-full flex items-center justify-between p-3 text-left"
        >
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Photo</p>
            {personal.photo && !hidden.has('photo') && (
              <span className="text-[9px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Added</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {personal.photo && (
              <button
                onClick={e => { e.stopPropagation(); toggleFieldVisibility('photo'); }}
                className={`p-1 rounded transition-colors ${hidden.has('photo') ? 'text-gray-300 hover:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
                title={hidden.has('photo') ? 'Show photo on resume' : 'Hide photo from resume'}
              >
                {hidden.has('photo') ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
            {photoOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
        </button>

        {photoOpen && (
          <div className="space-y-3 px-3 pb-3">
            <div className="flex items-center gap-4">
              <div
                onClick={() => photoInputRef.current?.click()}
                className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden shrink-0"
              >
                {personal.photo ? (
                  <img src={personal.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-0.5 text-gray-400">
                    <Camera size={16} />
                    <span className="text-[9px]">Photo</span>
                  </div>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Profile Photo</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Optional. Click to upload.</p>
                {personal.photo && (
                  <button onClick={() => updatePersonal('photo', null)} className="text-[11px] text-red-500 hover:text-red-600 mt-1">
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Shape */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Shape</p>
              <div className="flex gap-2">
                {[
                  { val: 'circle',  label: 'Circle'  },
                  { val: 'rounded', label: 'Rounded' },
                  { val: 'square',  label: 'Square'  },
                ].map(({ val, label }) => (
                  <Chip key={val} active={(s.photoShape || 'circle') === val} onClick={() => set('photoShape', val)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Size</p>
              <div className="flex gap-2">
                {[
                  { val: 'sm', label: 'Small'  },
                  { val: 'md', label: 'Medium' },
                  { val: 'lg', label: 'Large'  },
                ].map(({ val, label }) => (
                  <Chip key={val} active={(s.photoSize || 'md') === val} onClick={() => set('photoSize', val)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Border */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Border</p>
              <div className="flex gap-2">
                {[
                  { val: 'none',   label: 'None'   },
                  { val: 'thin',   label: 'Thin'   },
                  { val: 'accent', label: 'Accent' },
                ].map(({ val, label }) => (
                  <Chip key={val} active={(s.photoBorder || 'accent') === val} onClick={() => set('photoBorder', val)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Height — only useful for rounded/square shapes */}
            {(s.photoShape || 'circle') !== 'circle' && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Height</p>
                <div className="flex gap-2">
                  {[
                    { val: 'match',  label: 'Square'   },
                    { val: 'tall',   label: 'Tall'     },
                    { val: 'taller', label: 'Portrait' },
                  ].map(({ val, label }) => (
                    <Chip key={val} active={(s.photoHeight || 'match') === val} onClick={() => set('photoHeight', val)}>
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Text Alignment relative to photo */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Text Position</p>
              <div className="flex gap-2">
                {[
                  { val: 'top',    label: '↑ Top'    },
                  { val: 'center', label: '↕ Center' },
                  { val: 'bottom', label: '↓ Bottom' },
                ].map(({ val, label }) => (
                  <Chip key={val} active={(s.photoTextAlign || 'center') === val} onClick={() => set('photoTextAlign', val)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Fields ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Fields
        </p>
        <p className="text-[11px] text-gray-400 mb-3">Toggle eye icon to show/hide on resume</p>
        <div className="space-y-2.5">
          {FIELDS.map(({ key, label, icon: Icon, placeholder, required, hasUrl }) => {
            const isHidden = hidden.has(key);
            const urlKey = key + 'Url';
            const labelKey = key + 'Label';
            const hasValue = !!personal[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Icon size={13} className="text-gray-400" />
                    {label}
                  </label>
                  {!required && (
                    <button
                      onClick={() => toggleFieldVisibility(key)}
                      className={`p-0.5 rounded transition-colors ${isHidden ? 'text-gray-300 hover:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
                      title={isHidden ? 'Show on resume' : 'Hide on resume'}
                    >
                      {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={personal[key] || ''}
                  onChange={e => updatePersonal(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isHidden ? 'border-gray-100 bg-gray-50 text-gray-400' : 'border-gray-200 bg-white'}`}
                />
                {hasUrl && hasValue && (
                  <div className="mt-1 flex gap-1.5">
                    <input
                      type="text"
                      value={personal[labelKey] || ''}
                      onChange={e => updatePersonal(labelKey, e.target.value)}
                      placeholder="Display label (optional)"
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-gray-600 placeholder-gray-300"
                    />
                    <input
                      type="text"
                      value={personal[urlKey] || ''}
                      onChange={e => updatePersonal(urlKey, e.target.value)}
                      placeholder="Link URL (e.g. https://...)"
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-gray-600 placeholder-gray-300"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Summary ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Professional Summary</p>
          <button
            onClick={() => toggleFieldVisibility('summary')}
            className={`p-0.5 rounded transition-colors ${hidden.has('summary') ? 'text-gray-300 hover:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
            title={hidden.has('summary') ? 'Show summary on resume' : 'Hide summary from resume'}
          >
            {hidden.has('summary') ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        <RichTextEditor
          label=""
          value={personal.summary || ''}
          onChange={v => updatePersonal('summary', v)}
          placeholder="Brief professional summary highlighting your experience, skills, and goals..."
          rows={4}
        />
      </div>
    </div>
  );
}
