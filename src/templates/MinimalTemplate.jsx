import { useContext } from 'react';
import { Mail, Phone, MapPin, Globe, Link2, Code } from 'lucide-react';
import { getFontById } from '@/utils/fonts';
import { HeadingStyleContext } from '@/templates/headingStyle';
import { SectionCaseContext } from '@/templates/sectionCase';

function isHtmlEmpty(html) {
  return !html || !html.replace(/<[^>]*>/g, '').trim();
}

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
    border: br === 'none' ? 'none' : br === 'thin' ? '1.5px solid #e5e7eb' : `1.5px solid ${accent}60`,
    objectFit: 'cover',
    flexShrink: 0,
  };
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

function ContactRow({ personal, hidden, contactStyle, contactLayout, iconSize = 11 }) {
  const items = [
    { key: 'email',    Icon: Mail,   val: personal.email,    display: personal.email },
    { key: 'phone',    Icon: Phone,  val: personal.phone,    display: personal.phone },
    { key: 'location', Icon: MapPin, val: personal.location, display: personal.location },
    { key: 'website',  Icon: Globe,  val: personal.website,  display: personal.websiteLabel || personal.website },
    { key: 'linkedin', Icon: Link2,  val: personal.linkedin, display: personal.linkedinLabel || personal.linkedin },
    { key: 'github',   Icon: Code,   val: personal.github,   display: personal.githubLabel || personal.github },
  ].filter(({ key, val }) => !hidden.has(key) && val);

  if (!items.length) return null;

  const layout = contactLayout || 'justify';
  const color = '#555';

  function decorated(key, Icon, val, display) {
    const href = contactHref(key, val, personal);
    const label = href
      ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{display}</a>
      : display;
    if (contactStyle === 'icon') return (
      <span key={key} className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere' }}>
        <Icon size={iconSize} className="shrink-0" />{label}
      </span>
    );
    if (contactStyle === 'bullet') return (
      <span key={key} className="flex items-center gap-1" style={{ overflowWrap: 'anywhere' }}>
        <span style={{ color: '#bbb' }}>•</span>{label}
      </span>
    );
    return <span key={key} style={{ overflowWrap: 'anywhere' }}>{label}</span>;
  }

  if (layout === 'single') {
    return (
      <div className="space-y-0.5" style={{ color }}>
        {items.map(({ key, Icon, val, display }) => <div key={key}>{decorated(key, Icon, val, display)}</div>)}
      </div>
    );
  }

  if (layout === '2grid') {
    return (
      <div style={{ color, display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'start', gap: '2px 24px' }}>
        {items.map(({ key, Icon, val, display }) => decorated(key, Icon, val, display))}
      </div>
    );
  }

  // justify (default)
  if (contactStyle === 'icon') {
    return (
      <div className="flex flex-wrap" style={{ color, gap: '2px 16px' }}>
        {items.map(({ key, Icon, val, display }) => decorated(key, Icon, val, display))}
      </div>
    );
  }
  if (contactStyle === 'bullet') {
    return (
      <div className="flex flex-wrap items-center" style={{ color }}>
        {items.map(({ key, val, display }, i) => {
          const href = contactHref(key, val, personal);
          return (
            <span key={key} className="flex items-center">
              {i > 0 && <span className="mx-1.5" style={{ color: '#bbb' }}>•</span>}
              {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{display}</a> : <span>{display}</span>}
            </span>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center" style={{ color }}>
      {items.map(({ key, val, display }, i) => {
        const href = contactHref(key, val, personal);
        return (
          <span key={key} className="flex items-center">
            {i > 0 && <span className="mx-1.5" style={{ color: '#ccc' }}>|</span>}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{display}</a> : <span>{display}</span>}
          </span>
        );
      })}
    </div>
  );
}

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
const ROW_GAP = { compact: '4px', normal: '8px', relaxed: '14px' };

// title + subtitle stacked (top/bottom) or inline (side by side), date on the right
function ItemHeader({ title, subtitle, extra, date, titleStyle, centered, textColor }) {
  const stacked = (titleStyle || 'stacked') === 'stacked';
  return (
    <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'} gap-x-4`}>
      <div className={centered ? 'text-center' : ''}>
        {stacked ? (
          <>
            <div className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</div>
            {(subtitle || extra) && <div style={{ color: '#555' }}>{subtitle}{extra}</div>}
          </>
        ) : (
          <div className={`flex items-baseline gap-1.5 flex-wrap ${centered ? 'justify-center' : ''}`}>
            <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</span>
            {subtitle && <span style={{ color: '#555' }}>— {subtitle}</span>}
            {extra}
          </div>
        )}
      </div>
      {date && <div className="whitespace-nowrap shrink-0" style={{ color: '#4b5563' }}>{date}</div>}
    </div>
  );
}

function ItemDesc({ description, bullets }) {
  return (
    <>
      {description && (
        <div className="mt-1 leading-relaxed rich-text-output" style={{ color: '#3d3d3d' }} dangerouslySetInnerHTML={{ __html: description }} />
      )}
      {bullets?.length > 0 && (
        <ul className="mt-1 space-y-0.5 pl-3" style={{ color: '#3d3d3d' }}>
          {bullets.map((b, i) => b && <li key={i} className="list-['–_']">{b}</li>)}
        </ul>
      )}
    </>
  );
}

function SectionTitle({ title, centered, accent, borderColor }) {
  const style = useContext(HeadingStyleContext);
  const sectionCase = useContext(SectionCaseContext);
  const caseClass = sectionCase === 'normal' ? '' : 'uppercase';
  const tracking = sectionCase === 'normal' ? 'tracking-normal' : 'tracking-[0.08em]';
  const base = `font-semibold ${caseClass} ${tracking}`;
  const darkColor = '#374151';
  const bc = borderColor || accent || '#64748b';

  const sizeStyle = { fontSize: 'var(--fs-section, 10pt)', color: darkColor };

  const gap = { marginTop: 'var(--section-gap)', marginBottom: '6px' };

  if (style === 'plain') {
    return <h2 className={`${base} first:mt-0 ${centered ? 'text-center' : ''}`} style={{ ...sizeStyle, ...gap, color: accent }}>{title}</h2>;
  }
  if (style === 'box') {
    return (
      <div className={`first:mt-0 px-2 py-1 rounded ${centered ? 'text-center' : ''}`} style={{ ...gap, backgroundColor: bc + '12' }}>
        <h2 className={base} style={{ ...sizeStyle, color: accent }}>{title}</h2>
      </div>
    );
  }
  if (style === 'ruled') {
    return (
      <div className={`first:mt-0 ${centered ? 'text-center' : ''}`} style={gap}>
        <h2 className={base} style={sizeStyle}>{title}</h2>
        <div className="mt-0.5" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#d1d5db' }} />
      </div>
    );
  }
  if (style === 'leftbar') {
    return (
      <div className={`first:mt-0 flex items-center gap-2 ${centered ? 'justify-center' : ''}`} style={gap}>
        <div className="self-stretch shrink-0 rounded-full" style={{ width: 'var(--section-border-width,1px)', backgroundColor: bc }} />
        <h2 className={`${base} whitespace-nowrap`} style={sizeStyle}>{title}</h2>
      </div>
    );
  }
  if (style === 'line') {
    return (
      <div className="flex items-center gap-2 first:mt-0" style={gap}>
        {centered && <div className="flex-1" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#d1d5db' }} />}
        <h2 className={`${base} whitespace-nowrap`} style={{ ...sizeStyle, color: accent }}>{title}</h2>
        <div className="flex-1" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#d1d5db' }} />
      </div>
    );
  }
  // 'underline' (Minimal default look) — full-width bottom border
  return (
    <div className={`first:mt-0 ${centered ? 'text-center' : ''}`} style={gap}>
      <h2 className={`${base} pb-1`} style={{ ...sizeStyle, borderBottom: `var(--section-border-width,1px) solid ${borderColor || '#e5e7eb'}` }}>{title}</h2>
    </div>
  );
}

export default function MinimalTemplate({ data }) {
  const { personal, sections } = data;
  const st = data.settings || {};
  const fontFamily = st.customFont || getFontById(st.font)?.family || "'Inter', sans-serif";
  const accent = st.accentColor || '#2563eb';
  const borderColor = st.sectionBorderColor || '';
  const textColor = st.textColor || '#1a1a1a';
  const nameColor = st.nameColor || textColor;
  const jobTitleColor = st.jobTitleColor || '#555';
  const headerAlign = st.headerAlign || 'left';
  const headerLayout = st.headerLayout || 'stack';
  const contactStyle = st.contactStyle || 'bar';
  const contactLayout = st.contactLayout || 'justify';
  const centered = headerAlign === 'center';
  const hidden = new Set(personal?.hiddenFields || []);

  const baseSize = st.fontSizeBase || 11;
  const nameSize = baseSize + (st.fontSizeNameDelta ?? 8);
  const sectionSize = baseSize + (st.fontSizeSectionDelta ?? 1);
  const entrySize = baseSize + (st.fontSizeEntryDelta ?? 0);

  const contactProps = { personal, hidden, contactStyle, contactLayout, iconSize: st.iconSize ?? 11 };

  const NameTitle = () => headerLayout === 'inline' ? (
    <div className={`flex flex-wrap items-baseline ${centered ? 'justify-center' : ''}`} style={{ gap: `${st.headerInlineGap ?? 8}px` }}>
      <h1 className="font-light tracking-tight" style={{ color: nameColor, fontSize: 'var(--fs-name, 19pt)' }}>{personal.name || 'Your Name'}</h1>
      {personal.title && <span style={{ color: jobTitleColor, fontSize: 'var(--fs-entry, 11pt)' }}>{personal.title}</span>}
    </div>
  ) : (
    <>
      <h1 className="font-light tracking-tight" style={{ color: nameColor, fontSize: 'var(--fs-name, 19pt)' }}>{personal.name || 'Your Name'}</h1>
      {personal.title && <p className="mb-1" style={{ color: jobTitleColor, fontSize: 'var(--fs-entry, 11pt)' }}>{personal.title}</p>}
    </>
  );

  return (
    <SectionCaseContext.Provider value={st.sectionTitleCase || 'upper'}>
    <HeadingStyleContext.Provider value={st.headingStyle || 'underline'}>
      <div style={{ fontFamily, color: textColor, fontSize: baseSize + 'pt', lineHeight: st.lineHeightValue ?? 1.5, '--fs-base': baseSize + 'pt', '--fs-name': nameSize + 'pt', '--fs-section': sectionSize + 'pt', '--fs-entry': entrySize + 'pt', '--section-gap': (st.sectionGap ?? 16) + 'px', '--item-gap': (st.itemGap ?? 12) + 'px', '--section-border-width': (st.sectionBorderWidth ?? 1) + 'px' }}>
        <div className="mb-5">
          <div className={`flex ${centered ? 'flex-col items-center text-center' : (st.photoTextAlign === 'center' ? 'items-center' : st.photoTextAlign === 'bottom' ? 'items-end' : 'items-start')} gap-3`}>
            {personal.photo && !hidden.has('photo') && (
              <img src={personal.photo} alt="" style={photoStyle(st, accent)} />
            )}
            <div className={centered ? 'text-center' : 'flex-1'}>
              <NameTitle />
              <ContactRow {...contactProps} />
            </div>
          </div>
          {!hidden.has('summary') && !isHtmlEmpty(personal.summary) && (
            <div
              className="mt-3 leading-relaxed border-l-2 pl-3 italic rich-text-output"
              style={{ color: '#555', borderColor: accent + '60' }}
              dangerouslySetInnerHTML={{ __html: personal.summary }}
            />
          )}
        </div>
        {sections.filter(s => s.visible !== false).map(s => {
          const ss = s.settings || {};
          const ov = {};
          if (ss.spaceBefore != null) ov.marginTop = ss.spaceBefore + 'px';
          if (ss.spaceAfter  != null) ov['--section-gap'] = ss.spaceAfter + 'px';
          if (ss.itemGap     != null) ov['--item-gap']    = ss.itemGap    + 'px';
          return <div key={s.id} style={ov}><Section section={s} accent={accent} textColor={textColor} borderColor={borderColor} /></div>;
        })}
      </div>
    </HeadingStyleContext.Provider>
    </SectionCaseContext.Provider>
  );
}

function Section({ section, accent, textColor, borderColor }) {
  const p = { section, accent, textColor, borderColor };
  switch (section.type) {
    case 'experience':     return <ExperienceSection     {...p} />;
    case 'education':      return <EducationSection      {...p} />;
    case 'skills':         return <SkillsSection         {...p} />;
    case 'projects':       return <ProjectsSection       {...p} />;
    case 'languages':      return <LanguagesSection      {...p} />;
    case 'certifications': return <CertificationsSection {...p} />;
    case 'awards':         return <AwardsSection         {...p} />;
    case 'volunteering':   return <VolunteeringSection   {...p} />;
    case 'references':     return <ReferencesSection     {...p} />;
    case 'interests':      return <InterestsSection      {...p} />;
    default:               return <CustomSection         {...p} />;
  }
}

function ExperienceSection({ section, accent, textColor, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const titleOrder = s.titleOrder || 'company';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => {
          const iH = new Set(item.hiddenFields || []);
          const company = iH.has('company') ? '' : item.company;
          const role = iH.has('role') ? '' : item.role;
          const loc = (!iH.has('location') && showLoc && item.location) ? item.location : null;
          const sd = iH.has('startDate') ? '' : (item.startDate || '');
          const ed = iH.has('endDate') ? '' : (item.current ? 'Present' : (item.endDate || ''));
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          const desc = iH.has('description') ? '' : item.description;
          return (
            <div key={item.id}>
              <ItemHeader
                title={titleOrder === 'role' ? role : company}
                subtitle={titleOrder === 'role' ? company : role}
                extra={loc ? <span className="text-gray-400"> · {loc}</span> : null}
                date={dateStr}
                titleStyle={s.titleStyle}
                centered={centered}
                textColor={textColor}
              />
              {!isHtmlEmpty(desc) && <ItemDesc description={desc} bullets={item.bullets} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EducationSection({ section, accent, textColor, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <ItemHeader
              title={item.institution}
              subtitle={item.degree}
              extra={
                <>
                  {item.fieldOfStudy && <span className="text-gray-400"> · {item.fieldOfStudy}</span>}
                  {showLoc && item.location && <span className="text-gray-400"> · {item.location}</span>}
                  {item.gpa && <span className="text-gray-400"> · GPA {item.gpa}</span>}
                </>
              }
              date={showDates && (item.startDate || item.endDate)
                ? `${item.startDate || ''}${item.endDate ? ` – ${item.endDate}` : ''}` : ''}
              titleStyle={s.titleStyle}
              centered={centered}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ section, accent, textColor, borderColor }) {
  const s = section.settings || {};
  const cols = s.columns || 1;
  const style = s.skillsStyle || 'inline';
  const centered = s.alignment === 'center';
  const sep = s.separator === 'dash' ? ' – ' : ': ';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const isBullet = style === 'bullet';
  const visibleItems = section.items.filter(i => i.visible !== false);

  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      {style === 'tags' ? (
        <div className={`grid ${COLS[cols] || 'grid-cols-1'}`} style={{ rowGap }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk = item.skills && !iH.includes('skills');
            return (
              <div key={item.id}>
                {showCat && <span className="text-gray-500 font-medium block mb-1">{item.category}</span>}
                {showSk && (
                  <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
                    {item.skills.split(',').map((sk, i) => sk.trim() && (
                      <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{sk.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <ul className={`grid gap-x-6 ${COLS[cols] || 'grid-cols-1'} ${isBullet ? 'list-disc pl-4' : 'list-none'}`} style={{ rowGap }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk = item.skills && !iH.includes('skills');
            return (
              <li key={item.id} className="break-words">
                {showCat && <span className="font-medium" style={{ color: textColor }}>{item.category}{showSk ? sep : ''}</span>}
                {showSk && <span className="text-gray-600">{item.skills}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProjectsSection({ section, accent, textColor, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={!twoCol && !centered ? 'grid grid-cols-[1fr_auto] gap-x-4' : undefined}>
            <div>
              <span className="font-semibold" style={{ color: textColor }}>{item.name}</span>
              {item.technologies && <span className="text-gray-400"> · {item.technologies}</span>}
              {item.url && <span style={{ color: accent }}> · {item.url}</span>}
              <ItemDesc description={item.description} bullets={item.bullets} />
            </div>
            {!twoCol && !centered && showDates && (item.startDate || item.endDate) && (
              <div className="text-right text-gray-400 whitespace-nowrap">
                {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagesSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const cols = s.columns || 2;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-2'}`} style={{ rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={`flex ${centered ? 'justify-center gap-2' : 'justify-between'}`}>
            <span className="font-medium text-gray-900">{item.language}</span>
            <span style={{ color: '#4b5563' }}>{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={centered ? '' : 'grid grid-cols-[1fr_auto] gap-x-4'}>
            <div>
              <span className="font-semibold text-gray-900">{item.name}</span>
              {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
            </div>
            {showDates && item.date && <span className="whitespace-nowrap" style={{ color: '#4b5563' }}>{item.date}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className={centered ? '' : 'grid grid-cols-[1fr_auto] gap-x-4'}>
              <div>
                <span className="font-semibold text-gray-900">{item.title}</span>
                {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
              </div>
              {showDates && item.date && <span className="whitespace-nowrap" style={{ color: '#4b5563' }}>{item.date}</span>}
            </div>
            {item.description && <p className="text-gray-600 mt-0.5 rich-text-output" dangerouslySetInnerHTML={{ __html: item.description }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function VolunteeringSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={centered ? '' : 'grid grid-cols-[1fr_auto] gap-x-4'}>
            <div>
              <span className="font-semibold text-gray-900">{item.role}</span>
              {item.org && <span className="text-gray-500"> — {item.org}</span>}
              <ItemDesc description={item.description} bullets={item.bullets} />
            </div>
            {!centered && showDates && (item.startDate || item.endDate) && (
              <span className="text-gray-400 whitespace-nowrap">{item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferencesSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const cols = s.columns || 2;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={`grid ${COLS[cols] || 'grid-cols-2'}`} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <p className="font-semibold text-gray-900">{item.name}</p>
            {item.jobTitle && <p className="text-gray-500">{item.jobTitle}</p>}
            {item.company && <p className="text-gray-400">{item.company}</p>}
            {item.email && <p className="text-gray-500 mt-0.5">{item.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function InterestsSection({ section, accent, borderColor }) {
  const centered = section.settings?.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <p className="text-gray-600">
        {visibleItems.map(item => item.interests).filter(Boolean).join(' · ')}
      </p>
    </div>
  );
}

function CustomSection({ section, accent, textColor, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''}>
      <SectionTitle title={section.title} centered={centered} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <ItemHeader
              title={item.title}
              subtitle={item.subtitle}
              extra={item.location ? <span className="text-gray-400"> · {item.location}</span> : null}
              date={item.date || ''}
              titleStyle={s.titleStyle}
              centered={centered}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} />
          </div>
        ))}
      </div>
    </div>
  );
}
