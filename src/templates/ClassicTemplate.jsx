import { useContext } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/utils/brandIcons';
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
  // circles must stay square; tall/taller only affect rounded/square shapes
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

// ContactRow supporting layout (single/justify/2grid) × style (icon/bullet/bar)
function ContactRow({ personal, hidden, contactStyle, contactLayout, iconSize = 11 }) {
  const items = [
    { key: 'email',    Icon: Mail,   val: personal.email,    display: personal.email },
    { key: 'phone',    Icon: Phone,  val: personal.phone,    display: personal.phone },
    { key: 'location', Icon: MapPin, val: personal.location, display: personal.location },
    { key: 'website',  Icon: Globe,  val: personal.website,  display: personal.websiteLabel || personal.website },
    { key: 'linkedin', Icon: LinkedinIcon, val: personal.linkedin, display: personal.linkedinLabel || personal.linkedin },
    { key: 'github',   Icon: GithubIcon,  val: personal.github,   display: personal.githubLabel || personal.github },
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
        <Icon size={iconSize} strokeWidth={2} className="shrink-0" />{label}
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
      <div className="mt-1 space-y-0.5" style={{ color }}>
        {items.map(({ key, Icon, val, display }) => <div key={key}>{decorated(key, Icon, val, display)}</div>)}
      </div>
    );
  }

  if (layout === '2grid') {
    return (
      <div className="mt-1" style={{ color, display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'start', gap: '2px 24px' }}>
        {items.map(({ key, Icon, val, display }) => decorated(key, Icon, val, display))}
      </div>
    );
  }

  // justify (default) — horizontal row
  if (contactStyle === 'icon') {
    return (
      <div className="mt-1 flex flex-wrap" style={{ color, gap: '2px 16px' }}>
        {items.map(({ key, Icon, val, display }) => decorated(key, Icon, val, display))}
      </div>
    );
  }
  if (contactStyle === 'bullet') {
    return (
      <div className="mt-1 flex flex-wrap items-center" style={{ color }}>
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
  // bar (default)
  return (
    <div className="mt-1 flex flex-wrap items-center" style={{ color }}>
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

const SP = { compact: 'space-y-1', normal: 'space-y-3', relaxed: 'space-y-5' };
const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

function ItemDesc({ description, bullets }) {
  return (
    <>
      {description && (
        <div
          className="mt-1 leading-relaxed rich-text-output"
          style={{ color: '#3d3d3d' }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {bullets?.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {bullets.map((b, i) => b && (
            <li key={i} className="flex gap-1.5" style={{ color: '#3d3d3d' }}>
              <span className="shrink-0 mt-0.5" style={{ color: '#888' }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SectionTitle({ title, accent, borderColor, centered }) {
  const style = useContext(HeadingStyleContext);
  const sectionCase = useContext(SectionCaseContext);
  const caseClass = sectionCase === 'normal' ? '' : 'uppercase';
  const tracking = sectionCase === 'normal' ? 'tracking-normal' : 'tracking-[0.06em]';
  const bc = borderColor || accent;
  const coloredH2 = (
    <h2 className={`font-bold ${caseClass} ${tracking} whitespace-nowrap`} style={{ color: accent, fontSize: 'var(--fs-section, 10pt)' }}>{title}</h2>
  );
  const neutralH2 = (
    <h2 className={`font-bold ${caseClass} ${tracking} whitespace-nowrap`} style={{ color: '#374151', fontSize: 'var(--fs-section, 10pt)' }}>{title}</h2>
  );

  if (style === 'plain') {
    return <div className={`mb-2 ${centered ? 'text-center' : ''}`}>{coloredH2}</div>;
  }
  if (style === 'underline') {
    return <div className={`mb-2 pb-1 ${centered ? 'text-center' : ''}`} style={{ borderBottom: `var(--section-border-width,1px) solid ${bc}` }}>{coloredH2}</div>;
  }
  if (style === 'box') {
    return (
      <div className={`mb-2 px-2 py-1 rounded ${centered ? 'text-center' : ''}`} style={{ backgroundColor: bc + '14' }}>
        {coloredH2}
      </div>
    );
  }
  if (style === 'ruled') {
    return (
      <div className={`mb-2 ${centered ? 'text-center' : ''}`}>
        {neutralH2}
        <div className="mt-0.5" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || '#e5e7eb' }} />
      </div>
    );
  }
  if (style === 'leftbar') {
    return (
      <div className={`mb-2 flex items-center gap-2 ${centered ? 'justify-center' : ''}`}>
        <div className="self-stretch shrink-0 rounded-full" style={{ width: 'var(--section-border-width,1px)', backgroundColor: bc }} />
        {neutralH2}
      </div>
    );
  }
  // 'line' (default) — title with a rule filling the remaining width
  const lineColor = borderColor || (accent + '40');
  return (
    <div className="flex items-center gap-2 mb-2">
      {centered && <div className="flex-1" style={{ height: 'var(--section-border-width,1px)', backgroundColor: lineColor }} />}
      {coloredH2}
      <div className="flex-1" style={{ height: 'var(--section-border-width,1px)', backgroundColor: lineColor }} />
    </div>
  );
}

export default function ClassicTemplate({ data }) {
  const { personal, sections } = data;
  const st = data.settings || {};
  const fontFamily = st.customFont || getFontById(st.font)?.family || "'Inter', sans-serif";
  const accent = st.accentColor || '#2563eb';
  const borderColor = st.sectionBorderColor || '';
  const textColor = st.textColor || '#1a1a1a';
  const nameColor = st.nameColor || textColor;
  const jobTitleColor = st.jobTitleColor || accent;
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

  const contactProps = { personal, hidden, contactStyle, contactLayout, accent, iconSize: st.iconSize ?? 11 };

  const NameTitle = () => headerLayout === 'inline' ? (
    <div className={`flex flex-wrap items-baseline ${centered ? 'justify-center' : ''}`} style={{ gap: `${st.headerInlineGap ?? 8}px` }}>
      <h1 className="font-bold leading-tight" style={{ color: nameColor, fontSize: 'var(--fs-name, 19pt)' }}>{personal.name || 'Your Name'}</h1>
      {personal.title && <span className="font-medium" style={{ color: jobTitleColor, fontSize: 'var(--fs-entry, 11pt)' }}>{personal.title}</span>}
    </div>
  ) : (
    <>
      <h1 className="font-bold leading-tight" style={{ color: nameColor, fontSize: 'var(--fs-name, 19pt)' }}>{personal.name || 'Your Name'}</h1>
      {personal.title && <p className="font-medium mt-0.5" style={{ color: jobTitleColor, fontSize: 'var(--fs-entry, 11pt)' }}>{personal.title}</p>}
    </>
  );

  return (
    <SectionCaseContext.Provider value={st.sectionTitleCase || 'upper'}>
    <HeadingStyleContext.Provider value={st.headingStyle || 'line'}>
      <div style={{ fontFamily, color: textColor, fontSize: baseSize + 'pt', '--fs-base': baseSize + 'pt', '--fs-name': nameSize + 'pt', '--fs-section': sectionSize + 'pt', '--fs-entry': entrySize + 'pt', '--section-gap': (st.sectionGap ?? 16) + 'px', '--item-gap': (st.itemGap ?? 12) + 'px', '--section-border-width': (st.sectionBorderWidth ?? 1) + 'px' }}>
        <div className={`mb-5 ${st.showHeaderBorder !== false ? 'pb-4' : ''}`} style={st.showHeaderBorder !== false ? { borderBottom: `${st.headerBorderWidth || 2}px solid ${accent}` } : {}}>
          <div className={`flex ${centered ? 'flex-col items-center text-center' : (st.photoTextAlign === 'center' ? 'items-center' : st.photoTextAlign === 'bottom' ? 'items-end' : 'items-start')} gap-3`}>
            {personal.photo && !hidden.has('photo') && (
              <img src={personal.photo} alt="" style={photoStyle(st, accent)} />
            )}
            <div className={centered ? 'text-center' : ''}>
              <NameTitle />
              <ContactRow {...contactProps} />
            </div>
          </div>
          {!hidden.has('summary') && !isHtmlEmpty(personal.summary) && (
            <div
              className="mt-3 leading-relaxed rich-text-output"
              style={{ color: '#3d3d3d' }}
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
          return <div key={s.id} style={ov}><Section section={s} accent={accent} borderColor={borderColor} textColor={textColor} /></div>;
        })}
      </div>
    </HeadingStyleContext.Provider>
    </SectionCaseContext.Provider>
  );
}

function Section({ section, accent, borderColor, textColor }) {
  const p = { section, accent, borderColor, textColor };
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

function ItemHeader({ title, subtitle, extra, date, titleStyle, centered, accent, textColor }) {
  const ts = titleStyle || 'stacked';

  if (ts === 'sidebyside') {
    return (
      <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-baseline'} gap-x-4`}>
        <div className={`flex items-baseline gap-3 flex-wrap min-w-0 ${centered ? 'justify-center' : ''}`}>
          <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</span>
          {(subtitle || extra) && (
            <span style={{ color: '#6b7280' }}>
              {subtitle}{extra}
            </span>
          )}
        </div>
        {date && <span className="whitespace-nowrap shrink-0 ml-2" style={{ color: accent + 'cc' }}>{date}</span>}
      </div>
    );
  }

  return (
    <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'} gap-x-3`}>
      <div className={centered ? 'text-center' : ''}>
        {ts === 'stacked' ? (
          <>
            <div className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</div>
            {(subtitle || extra) && (
              <div style={{ color: '#555' }}>
                {subtitle}{extra}
              </div>
            )}
          </>
        ) : (
          <div>
            <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</span>
            {subtitle && <span style={{ color: '#555' }}> — {subtitle}</span>}
            {extra}
          </div>
        )}
      </div>
      {date && (
        <span className={`whitespace-nowrap shrink-0 ${centered ? '' : 'ml-2'}`} style={{ color: accent + 'cc' }}>
          {date}
        </span>
      )}
    </div>
  );
}

function ExperienceSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const titleOrder = s.titleOrder || 'company';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
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
                extra={loc ? <span className="text-gray-400">, {loc}</span> : null}
                date={dateStr}
                titleStyle={s.titleStyle}
                centered={centered}
                accent={accent}
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

function EducationSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <ItemHeader
              title={item.institution}
              subtitle={item.degree}
              extra={
                <>
                  {item.fieldOfStudy && <span className="text-gray-400">, {item.fieldOfStudy}</span>}
                  {showLoc && item.location && <span className="text-gray-400"> · {item.location}</span>}
                  {item.gpa && <span className="text-gray-400"> · GPA: {item.gpa}</span>}
                </>
              }
              date={showDates && (item.startDate || item.endDate)
                ? `${item.startDate || ''}${item.endDate ? ` – ${item.endDate}` : ''}` : ''}
              titleStyle={s.titleStyle}
              centered={centered}
              accent={accent}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} />
          </div>
        ))}
      </div>
    </div>
  );
}

const SKILL_ROW_GAP = { compact: '4px', normal: '8px', relaxed: '14px' };

function SkillsSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const cols = s.columns || 1;
  const style = s.skillsStyle || 'inline';
  const centered = s.alignment === 'center';
  const sep = s.separator === 'dash' ? ' – ' : ': ';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const isBullet = style === 'bullet';
  const visibleItems = section.items.filter(i => i.visible !== false);

  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      {style === 'stacked' ? (
        <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-1'}`} style={{ rowGap }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk = item.skills && !iH.includes('skills');
            return (
              <div key={item.id}>
                {showCat && (
                  <div className="mb-1">
                    <div className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.category}</div>
                    <div className="h-px mt-0.5" style={{ backgroundColor: '#e5e7eb' }} />
                  </div>
                )}
                {showSk && <div className="text-gray-600 mt-1">{item.skills}</div>}
              </div>
            );
          })}
        </div>
      ) : style === 'tags' ? (
        <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-1'}`} style={{ rowGap }}>
          {visibleItems.map(item => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk = item.skills && !iH.includes('skills');
            return (
              <div key={item.id}>
                {showCat && <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: accent }}>{item.category}</span>}
                {showSk && (
                  <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
                    {item.skills.split(',').map((sk, i) => sk.trim() && (
                      <span key={i} className="px-1.5 py-0.5 rounded" style={{ backgroundColor: accent + '15', color: accent, border: `1px solid ${accent}30` }}>
                        {sk.trim()}
                      </span>
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
                {showCat && <span className="font-semibold" style={{ color: textColor }}>{item.category}{showSk ? sep : ''}</span>}
                {showSk && <span className="text-gray-600">{item.skills}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProjectsSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'}`}>
              <div>
                <span className="font-semibold text-xs" style={{ color: textColor }}>{item.name}</span>
                {item.technologies && <span className="text-gray-400"> · {item.technologies}</span>}
                {item.url && <span className="ml-1" style={{ color: accent }}> · {item.url}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className={`whitespace-nowrap shrink-0 ${centered ? '' : 'ml-2'}`} style={{ color: accent + 'cc' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} />
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
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-2'}`} style={{ rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="font-medium text-gray-900 text-xs">{item.language}</span>
            <span className="text-gray-400">{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-gray-900 text-xs">{item.name}</span>
              {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
              {item.credentialId && <span className="text-gray-400"> · ID: {item.credentialId}</span>}
              {item.url && (
                <a
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1"
                  style={{ color: accent, textDecoration: 'none' }}
                >
                  · {item.urlLabel || item.url}
                </a>
              )}
            </div>
            {showDates && (item.date || item.expiry) && (
              <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: accent + 'cc' }}>
                {item.date}{item.expiry ? ` – ${item.expiry}` : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-gray-900 text-xs">{item.title}</span>
                {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: accent + 'cc' }}>{item.date}</span>
              )}
            </div>
            {item.description && <p className="text-gray-600 mt-0.5">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VolunteeringSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-gray-900 text-xs">{item.role}</span>
                {item.org && <span className="text-gray-500"> — {item.org}</span>}
                {showLoc && item.location && <span className="text-gray-400">, {item.location}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: accent + 'cc' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} />
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
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`grid ${COLS[cols] || 'grid-cols-2'}`} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className="p-2 rounded border border-gray-100">
            <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
            {item.jobTitle && <p className="text-gray-500">{item.jobTitle}</p>}
            {item.company && <p className="text-gray-500">{item.company}</p>}
            {item.relationship && <p className="text-gray-400 italic">{item.relationship}</p>}
            {item.email && <p className="mt-0.5" style={{ color: accent }}>{item.email}</p>}
            {item.phone && <p className="text-gray-400">{item.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function InterestsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const centered = s.alignment === 'center';
  const tagGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || '6px');
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`flex flex-wrap ${centered ? 'justify-center' : ''}`} style={{ gap: tagGap }}>
        {visibleItems.map(item =>
          (item.interests || '').split(',').map((interest, i) => interest.trim() && (
            <span key={`${item.id}-${i}`} className="px-2 py-0.5 rounded" style={{ backgroundColor: accent + '12', color: accent }}>
              {interest.trim()}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function CustomSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (SKILL_ROW_GAP[s.spacing] || SKILL_ROW_GAP.normal);
  const twoCol = s.columns > 1;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
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
              accent={accent}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} />
          </div>
        ))}
      </div>
    </div>
  );
}
