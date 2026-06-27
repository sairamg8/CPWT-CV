import { useContext } from 'react';
import { Mail, Phone, MapPin, Globe, Link2, Code } from 'lucide-react';
import { getFontById } from '../utils/fonts';
import { HeadingStyleContext } from './headingStyle';
import { SectionCaseContext } from './sectionCase';


function photoStyle(settings, accent) {
  const sh = settings?.photoShape || 'circle';
  const sz = settings?.photoSize || 'md';
  const br = settings?.photoBorder || 'accent';
  const ph = settings?.photoHeight || 'match';
  const w = sz === 'sm' ? 130 : sz === 'lg' ? 200 : 165;
  const h = sh === 'circle' ? w : ph === 'tall' ? Math.round(w * 1.4) : ph === 'taller' ? Math.round(w * 1.8) : w;
  return {
    width: w + 'px',
    height: h + 'px',
    borderRadius: sh === 'rounded' ? '10px' : sh === 'square' ? '3px' : '50%',
    border: br === 'none' ? 'none' : br === 'thin' ? '1.5px solid rgba(255,255,255,0.25)' : `2px solid ${accent}80`,
    objectFit: 'cover',
    display: 'block',
    margin: '0 auto 12px',
  };
}

function ItemDesc({ description, bullets, accent }) {
  return (
    <>
      {description && (
        <div className="leading-relaxed mt-1 rich-text-output" style={{ color: '#374151' }} dangerouslySetInnerHTML={{ __html: description }} />
      )}
      {bullets?.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {bullets.map((b, i) => b && (
            <li key={i} className="flex gap-1.5" style={{ color: '#4b5563' }}>
              <span className="shrink-0 mt-0.5" style={{ color: accent }}>•</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function MainTitle({ title, accent, borderColor }) {
  const style = useContext(HeadingStyleContext);
  const sectionCase = useContext(SectionCaseContext);
  const caseClass = sectionCase === 'normal' ? '' : 'uppercase';
  const tracking = sectionCase === 'normal' ? 'tracking-normal' : 'tracking-[0.06em]';
  const bc = borderColor || accent || '#374151';
  const h2 = <h2 className={`text-xs font-bold ${caseClass} ${tracking}`} style={{ color: '#374151' }}>{title}</h2>;

  if (style === 'plain') return <div className="mb-2">{h2}</div>;
  if (style === 'underline') return <div className="mb-2 pb-1" style={{ borderBottom: `var(--section-border-width,1px) solid ${bc}` }}>{h2}</div>;
  if (style === 'box') return <div className="mb-2 px-2 py-1 rounded" style={{ backgroundColor: bc + '14' }}>{h2}</div>;
  if (style === 'ruled') {
    return (
      <div className="mb-2">
        {h2}
        <div className="mt-0.5" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#e5e7eb' }} />
      </div>
    );
  }
  if (style === 'leftbar') {
    return (
      <div className="mb-2 flex items-center gap-2">
        <div className="self-stretch shrink-0 rounded-full" style={{ width: 'var(--section-border-width,1px)', backgroundColor: bc }} />
        {h2}
      </div>
    );
  }
  // 'line' (default)
  return (
    <div className="mb-2 flex items-center gap-2">
      {h2}
      <div className="flex-1" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#e5e7eb' }} />
    </div>
  );
}

function SideTitle({ title }) {
  return (
    <div className="mb-2">
      <h2 className="font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#94a3b8', fontSize: '9px' }}>{title}</h2>
      <div className="h-px" style={{ backgroundColor: '#334155' }} />
    </div>
  );
}

export default function SidebarTemplate({ data }) {
  const { personal, sections } = data;
  const fontFamily = data.settings?.customFont || getFontById(data.settings?.font)?.family || "'Inter', sans-serif";
  const accent = data.settings?.accentColor || '#2563eb';
  const borderColor = data.settings?.sectionBorderColor || '';
  const hidden = new Set(personal?.hiddenFields || []);

  const SIDEBAR_TYPES = new Set(['skills', 'education', 'languages', 'certifications', 'interests', 'references']);
  const visibleSections = sections.filter(s => s.visible !== false);
  const sidebarSections = visibleSections.filter(s => SIDEBAR_TYPES.has(s.type));
  const mainSections = visibleSections.filter(s => !SIDEBAR_TYPES.has(s.type));

  function renderSide(section) {
    switch (section.type) {
      case 'skills':         return <SideSkills         key={section.id} section={section} accent={accent} />;
      case 'education':      return <SideEducation      key={section.id} section={section} accent={accent} />;
      case 'languages':      return <SideLanguages      key={section.id} section={section} accent={accent} />;
      case 'certifications': return <SideCertifications key={section.id} section={section} accent={accent} />;
      case 'interests':      return <SideInterests      key={section.id} section={section} accent={accent} />;
      case 'references':     return <SideReferences     key={section.id} section={section} accent={accent} />;
      default:               return null;
    }
  }

  function renderMain(section) {
    switch (section.type) {
      case 'experience':   return <MainExperience   key={section.id} section={section} accent={accent} borderColor={borderColor} />;
      case 'projects':     return <MainProjects     key={section.id} section={section} accent={accent} borderColor={borderColor} />;
      case 'awards':       return <MainAwards       key={section.id} section={section} accent={accent} borderColor={borderColor} />;
      case 'volunteering': return <MainVolunteering key={section.id} section={section} accent={accent} borderColor={borderColor} />;
      default:             return <MainCustom       key={section.id} section={section} accent={accent} borderColor={borderColor} />;
    }
  }

  return (
    <SectionCaseContext.Provider value={data.settings?.sectionTitleCase || 'upper'}>
    <HeadingStyleContext.Provider value={data.settings?.headingStyle || 'line'}>
    <div className="flex" style={{ fontFamily, minHeight: '100%', '--section-gap': (data.settings?.sectionGap ?? 16) + 'px', '--item-gap': (data.settings?.itemGap ?? 12) + 'px', '--section-border-width': (data.settings?.sectionBorderWidth ?? 1) + 'px' }}>
      {/* Sidebar */}
      <div className="w-[38%] shrink-0 px-4 py-5" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>
        {/* Avatar + Name */}
        <div className="mb-5 text-center">
          {personal.photo && !hidden.has('photo') ? (
            <img src={personal.photo} alt="" style={photoStyle(data.settings, accent)} />
          ) : !personal.photo ? (
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: '#334155', color: accent }}>
              {(personal.name || 'J').charAt(0)}
            </div>
          ) : null}
          <h1 className="text-sm font-bold text-white leading-tight">{personal.name || 'Your Name'}</h1>
          {personal.title && <p className="text-[10px] mt-0.5" style={{ color: accent }}>{personal.title}</p>}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 'var(--section-gap)' }}>
          <SideTitle title="Contact" />
          <div className="space-y-1.5">
            {!hidden.has('email')    && personal.email    && <SideContact icon={Mail}   ckey="email"    label="Email"    text={personal.email}    iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
            {!hidden.has('phone')    && personal.phone    && <SideContact icon={Phone}  ckey="phone"    label="Phone"    text={personal.phone}    iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
            {!hidden.has('location') && personal.location && <SideContact icon={MapPin} ckey="location" label="Location" text={personal.location} iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
            {!hidden.has('website')  && personal.website  && <SideContact icon={Globe}  ckey="website"  label="Website"  text={personal.website}  display={personal.websiteLabel || personal.website}  iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
            {!hidden.has('linkedin') && personal.linkedin && <SideContact icon={Link2}  ckey="linkedin" label="LinkedIn" text={personal.linkedin} display={personal.linkedinLabel || personal.linkedin} iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
            {!hidden.has('github')   && personal.github   && <SideContact icon={Code}   ckey="github"   label="GitHub"   text={personal.github}   display={personal.githubLabel || personal.github}   iconSize={data.settings?.iconSize ?? 8} accent={accent} personal={personal} />}
          </div>
        </div>

        {sidebarSections.map(section => {
          const ss = section.settings || {};
          const ov = {};
          if (ss.spaceBefore != null) ov.marginTop = ss.spaceBefore + 'px';
          if (ss.spaceAfter  != null) ov['--section-gap'] = ss.spaceAfter + 'px';
          if (ss.itemGap     != null) ov['--item-gap']    = ss.itemGap    + 'px';
          return <div key={section.id} style={ov}>{renderSide(section)}</div>;
        })}
      </div>

      {/* Main */}
      <div className="flex-1 px-5 py-5" style={{ color: '#1e293b' }}>
        {!hidden.has('summary') && personal.summary && personal.summary.replace(/<[^>]*>/g, '').trim() && (
          <div style={{ marginBottom: 'var(--section-gap)' }}>
            <MainTitle title="About Me" accent={accent} borderColor={borderColor} />
            <div
              className="leading-relaxed rich-text-output"
              style={{ color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: personal.summary }}
            />
          </div>
        )}
        {mainSections.map(section => {
          const ss = section.settings || {};
          const ov = {};
          if (ss.spaceBefore != null) ov.marginTop = ss.spaceBefore + 'px';
          if (ss.spaceAfter  != null) ov['--section-gap'] = ss.spaceAfter + 'px';
          if (ss.itemGap     != null) ov['--item-gap']    = ss.itemGap    + 'px';
          return <div key={section.id} style={ov}>{renderMain(section)}</div>;
        })}
      </div>
    </div>
    </HeadingStyleContext.Provider>
    </SectionCaseContext.Provider>
  );
}

function contactHref(key, val, personal) {
  if (key === 'email') return `mailto:${val}`;
  if (key === 'phone') return `tel:${val.replace(/\s/g, '')}`;
  if (key === 'website' || key === 'linkedin' || key === 'github') {
    const urlOverride = personal?.[key + 'Url'];
    const url = urlOverride || val;
    return url.startsWith('http') ? url : `https://${url}`;
  }
  return null;
}

function SideContact({ icon: Icon, label, text, display, ckey, iconSize = 8, accent, personal }) {
  const href = contactHref(ckey, text, personal);
  return (
    <div>
      <div className="flex items-center gap-1" style={{ color: '#94a3b8', fontSize: '9px' }}>
        <Icon size={iconSize} strokeWidth={1.8} />
        <span className="uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '10px', wordBreak: 'break-all' }}>
        {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{display || text}</a> : (display || text)}
      </div>
    </div>
  );
}

function SideSkills({ section, accent }) {
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  const style = section.settings?.skillsStyle || 'tags';
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      {style === 'tags' ? (
        <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            return (
              <div key={item.id}>
                {item.category && !iH.includes('category') && <div className="font-bold uppercase tracking-wider mb-0.5" style={{ color: '#64748b', fontSize: '9px' }}>{item.category}</div>}
                {item.skills && !iH.includes('skills') && (
                  <div className="flex flex-wrap gap-0.5">
                    {item.skills.split(',').map((sk, i) => sk.trim() && (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: '#334155', color: '#cbd5e1' }}>
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : style === 'bars' ? (
        <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            return (
              <div key={item.id}>
                {item.category && !iH.includes('category') && <div className="font-bold uppercase tracking-wider mb-0.5" style={{ color: '#64748b', fontSize: '9px' }}>{item.category}</div>}
                {item.skills && !iH.includes('skills') && item.skills.split(',').map((sk, i) => sk.trim() && (
                  <div key={i} className="mb-1">
                    <div className="text-[10px] mb-0.5" style={{ color: '#cbd5e1' }}>{sk.trim()}</div>
                    <div className="h-1 rounded-full" style={{ backgroundColor: '#334155' }}>
                      <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: accent + '80' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            return (
              <div key={item.id}>
                {item.category && !iH.includes('category') && <span className="font-bold text-[9px] uppercase mr-1" style={{ color: '#64748b' }}>{item.category}: </span>}
                {item.skills && !iH.includes('skills') && <span className="text-[10px]" style={{ color: '#cbd5e1' }}>{item.skills}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SideEducation({ section, accent }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="font-semibold text-[11px]" style={{ color: '#e2e8f0' }}>{item.degree}</div>
            {item.institution && <div className="text-[10px]" style={{ color: '#94a3b8' }}>{item.institution}</div>}
            {item.gpa && <div className="text-[10px]" style={{ color: '#64748b' }}>GPA: {item.gpa}</div>}
            {showDates && (item.startDate || item.endDate) && (
              <div className="text-[10px]" style={{ color: '#64748b' }}>
                {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SideLanguages({ section }) {
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id} className="flex justify-between">
            <span className="text-[10px]" style={{ color: '#e2e8f0' }}>{item.language}</span>
            <span className="text-[10px]" style={{ color: '#64748b' }}>{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SideCertifications({ section }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="font-semibold text-[10px]" style={{ color: '#e2e8f0' }}>{item.name}</div>
            {item.issuer && <div className="text-[10px]" style={{ color: '#94a3b8' }}>{item.issuer}</div>}
            {showDates && item.date && <div className="text-[10px]" style={{ color: '#64748b' }}>{item.date}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SideInterests({ section }) {
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      <div className="flex flex-wrap gap-0.5">
        {visibleItems.map(item =>
          (item.interests || '').split(',').map((interest, i) => interest.trim() && (
            <span key={`${item.id}-${i}`} className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: '#334155', color: '#cbd5e1' }}>
              {interest.trim()}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SideReferences({ section }) {
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SideTitle title={section.title} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="font-semibold text-[10px]" style={{ color: '#e2e8f0' }}>{item.name}</div>
            {item.jobTitle && <div className="text-[10px]" style={{ color: '#94a3b8' }}>{item.jobTitle}</div>}
            {item.email && <div className="text-[10px]" style={{ color: '#64748b' }}>{item.email}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MainExperience({ section, accent, borderColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const titleOrder = s.titleOrder || 'role';
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => {
          const iH = new Set(item.hiddenFields || []);
          const company = iH.has('company') ? '' : item.company;
          const role = iH.has('role') ? '' : item.role;
          const loc = (!iH.has('location') && showLoc && item.location) ? item.location : null;
          const sd = iH.has('startDate') ? '' : (item.startDate || '');
          const ed = iH.has('endDate') ? '' : (item.current ? 'Present' : (item.endDate || ''));
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          const primaryTitle = titleOrder === 'role' ? role : company;
          const secondaryTitle = titleOrder === 'role' ? company : role;
          const desc = iH.has('description') ? '' : item.description;
          return (
            <div key={item.id} className="relative pl-3" style={{ borderLeft: `2px solid #e5e7eb` }}>
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
              <div className="flex justify-between items-start">
                <div>
                  {primaryTitle && <div className="font-semibold text-xs" style={{ color: '#111827' }}>{primaryTitle}</div>}
                  {secondaryTitle && (
                    <div className="text-[10px]" style={{ color: '#6b7280' }}>
                      {secondaryTitle}{loc ? ` · ${loc}` : ''}
                    </div>
                  )}
                </div>
                {dateStr && <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>{dateStr}</span>}
              </div>
              {desc && <ItemDesc description={desc} bullets={item.bullets} accent={accent} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MainProjects({ section, accent, borderColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id} className="relative pl-3" style={{ borderLeft: `2px solid #e5e7eb` }}>
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-xs" style={{ color: '#111827' }}>{item.name}</span>
                {item.technologies && <span className="text-[10px]" style={{ color: '#6b7280' }}> · {item.technologies}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            {item.url && <div className="text-[10px]" style={{ color: accent }}>{item.url}</div>}
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MainAwards({ section, accent, borderColor }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-xs" style={{ color: '#111827' }}>{item.title}</span>
                {item.issuer && <span className="text-[10px]" style={{ color: '#6b7280' }}> — {item.issuer}</span>}
              </div>
              {showDates && item.date && <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>{item.date}</span>}
            </div>
            {item.description && <p className="mt-0.5" style={{ color: '#374151', fontSize: '10.5px' }}>{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MainVolunteering({ section, accent, borderColor }) {
  const s = section.settings || {};
  const showDates = s.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-xs" style={{ color: '#111827' }}>{item.role}</span>
                {item.org && <span style={{ color: '#6b7280' }}> — {item.org}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MainCustom({ section, accent, borderColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const visibleItems = section.items.filter(i => i.visible !== false);
  if (!visibleItems.length) return null;
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                {item.title && <span className="font-semibold text-xs" style={{ color: '#111827' }}>{item.title}</span>}
                {item.subtitle && <span style={{ color: '#6b7280' }}> — {item.subtitle}</span>}
              </div>
              <div className="text-right whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                {item.location && <div>{item.location}</div>}
                {item.date && <div>{item.date}</div>}
              </div>
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
