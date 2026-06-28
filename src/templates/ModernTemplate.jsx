import { useContext } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/utils/brandIcons';
import { getFontById } from '@/utils/fonts';
import { HeadingStyleContext } from '@/templates/headingStyle';
import { SectionCaseContext } from '@/templates/sectionCase';

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };
const ROW_GAP = { compact: '4px', normal: '8px', relaxed: '14px' };

function isHtmlEmpty(html) {
  return !html || !html.replace(/<[^>]*>/g, '').trim();
}

function ItemDesc({ description, bullets, bulletColor }) {
  return (
    <>
      {!isHtmlEmpty(description) && (
        <div
          className="mt-1 leading-relaxed rich-text-output"
          style={{ color: 'inherit', opacity: 0.8 }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {bullets?.length > 0 && (
        <ul className="mt-1 pl-3" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {bullets.map((b, i) => b && (
            <li key={i} className="relative pl-2">
              <span className="absolute left-0 top-[6px] w-1 h-1 rounded-full" style={{ backgroundColor: bulletColor }} />
              {b}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ItemHeader({ title, subtitle, extra, date, titleStyle, centered, accent, textColor }) {
  const ts = titleStyle || 'stacked';
  if (ts === 'sidebyside') {
    return (
      <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-baseline'} gap-x-4`}>
        <div className={`flex items-baseline gap-2 flex-wrap min-w-0 ${centered ? 'justify-center' : ''}`}>
          <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</span>
          {(subtitle || extra) && <span style={{ color: accent, opacity: 0.85 }}>{subtitle}{extra}</span>}
        </div>
        {date && <span className="whitespace-nowrap shrink-0 ml-2 font-medium" style={{ color: accent }}>{date}</span>}
      </div>
    );
  }
  return (
    <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'} gap-x-3`}>
      <div className={centered ? 'text-center' : ''}>
        {ts === 'stacked' ? (
          <>
            <div className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</div>
            {(subtitle || extra) && <div style={{ color: accent, opacity: 0.85 }}>{subtitle}{extra}</div>}
          </>
        ) : (
          <div>
            <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{title}</span>
            {subtitle && <span style={{ color: accent }}> — {subtitle}</span>}
            {extra}
          </div>
        )}
      </div>
      {date && (
        <span className={`whitespace-nowrap shrink-0 ${centered ? '' : 'ml-2'} font-medium`} style={{ color: accent }}>
          {date}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ title, accent, borderColor, centered }) {
  const style = useContext(HeadingStyleContext);
  const sectionCase = useContext(SectionCaseContext);
  const caseClass = sectionCase === 'normal' ? '' : 'uppercase';
  const tracking = sectionCase === 'normal' ? 'tracking-normal' : 'tracking-widest';
  const bc = borderColor || accent;
  const h2 = (
    <h2 className={`font-bold ${caseClass} ${tracking} whitespace-nowrap`} style={{ color: accent, fontSize: 'var(--fs-section, 10pt)' }}>
      {title}
    </h2>
  );

  if (style === 'plain') return <div className={`mb-2 ${centered ? 'text-center' : ''}`}>{h2}</div>;
  if (style === 'underline') return <div className={`mb-2 pb-1 ${centered ? 'text-center' : ''}`} style={{ borderBottom: `var(--section-border-width,1px) solid ${bc}` }}>{h2}</div>;
  if (style === 'box') return <div className={`mb-2 px-2 py-1 rounded ${centered ? 'text-center' : ''}`} style={{ backgroundColor: accent + '14' }}>{h2}</div>;
  if (style === 'ruled') {
    return (
      <div className={`mb-2 ${centered ? 'text-center' : ''}`}>
        {h2}
        <div className="mt-0.5" style={{ height: 'var(--section-border-width,1px)', backgroundColor: borderColor || accent + '30' }} />
      </div>
    );
  }
  if (style === 'leftbar') {
    return (
      <div className={`mb-2 flex items-center gap-2 ${centered ? 'justify-center' : ''}`}>
        <div className="self-stretch shrink-0 rounded-full" style={{ width: 'var(--section-border-width,1px)', backgroundColor: bc }} />
        {h2}
      </div>
    );
  }
  // 'line' — Modern's default
  return (
    <div className="flex items-center gap-2 mb-2">
      {centered && <div className="flex-1 h-px" style={{ backgroundColor: borderColor || accent + '30' }} />}
      {h2}
      <div className="flex-1 h-px" style={{ backgroundColor: borderColor || accent + '30' }} />
    </div>
  );
}

function contactHref(key, val) {
  if (key === 'email') return `mailto:${val}`;
  if (key === 'phone') return `tel:${val.replace(/\s/g, '')}`;
  if (key === 'website' || key === 'linkedin' || key === 'github') {
    return val.startsWith('http') ? val : `https://${val}`;
  }
  return null;
}

function ContactLink({ ckey, val, children }) {
  const href = contactHref(ckey, val);
  if (!href) return <>{children}</>;
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{children}</a>;
}

export default function ModernTemplate({ data }) {
  const { personal, sections } = data;
  const st = data.settings || {};
  const fontFamily = st.customFont || getFontById(st.font)?.family || "'Inter', sans-serif";
  const accent = st.accentColor || '#2563eb';
  const textColor = st.textColor || '#1f2937';
  const borderColor = st.sectionBorderColor || '';
  const headerText = st.headerTextColor || '#ffffff';
  const nameColor = st.nameColor || headerText;
  const jobTitleColor = st.jobTitleColor || headerText;
  const hidden = new Set(personal?.hiddenFields || []);

  const baseSize = st.fontSizeBase || 11;
  const nameSize = baseSize + (st.fontSizeNameDelta ?? 8);
  const sectionSize = baseSize + (st.fontSizeSectionDelta ?? 1);
  const entrySize = baseSize + (st.fontSizeEntryDelta ?? 0);

  return (
    <SectionCaseContext.Provider value={st.sectionTitleCase || 'upper'}>
    <HeadingStyleContext.Provider value={st.headingStyle || 'line'}>
    <div style={{
      fontFamily,
      color: textColor,
      fontSize: baseSize + 'pt',
      lineHeight: st.lineHeightValue ?? 1.5,
      '--fs-base': baseSize + 'pt',
      '--fs-name': nameSize + 'pt',
      '--fs-section': sectionSize + 'pt',
      '--fs-entry': entrySize + 'pt',
      '--section-gap': (st.sectionGap ?? 16) + 'px',
      '--item-gap': (st.itemGap ?? 12) + 'px',
      '--section-border-width': (st.sectionBorderWidth ?? 1) + 'px',
    }}>
      {/* Header banner */}
      <div className="px-6 py-5 rounded-sm" style={{ backgroundColor: accent, color: headerText, marginBottom: 'var(--section-gap)' }}>
        <div className="flex items-start gap-4">
          {personal.photo && !hidden.has('photo') && (
            <img src={personal.photo} alt="" className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white/30" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold tracking-tight mb-0.5" style={{ color: nameColor, fontSize: 'var(--fs-name, 19pt)' }}>{personal.name || 'Your Name'}</h1>
            {personal.title && <p className="opacity-80 mb-2" style={{ color: jobTitleColor, fontSize: 'var(--fs-entry, 11pt)' }}>{personal.title}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 opacity-90" style={{ fontSize: baseSize + 'pt' }}>
              {!hidden.has('email')    && personal.email    && <span className="flex items-center gap-1"><Mail     size={9} strokeWidth={2}/><ContactLink ckey="email"    val={personal.email}   >{personal.email}</ContactLink></span>}
              {!hidden.has('phone')    && personal.phone    && <span className="flex items-center gap-1"><Phone    size={9} strokeWidth={2}/><ContactLink ckey="phone"    val={personal.phone}   >{personal.phone}</ContactLink></span>}
              {!hidden.has('location') && personal.location && <span className="flex items-center gap-1"><MapPin   size={9} strokeWidth={2}/>{personal.location}</span>}
              {!hidden.has('website')  && personal.website  && <span className="flex items-center gap-1"><Globe    size={9} strokeWidth={2}/><ContactLink ckey="website"  val={personal.website} >{personal.website}</ContactLink></span>}
              {!hidden.has('linkedin') && personal.linkedin && <span className="flex items-center gap-1"><LinkedinIcon size={9} strokeWidth={2}/><ContactLink ckey="linkedin" val={personal.linkedin}>{personal.linkedin}</ContactLink></span>}
              {!hidden.has('github')   && personal.github   && <span className="flex items-center gap-1"><GithubIcon   size={9} strokeWidth={2}/><ContactLink ckey="github"   val={personal.github}  >{personal.github}</ContactLink></span>}
            </div>
          </div>
        </div>
        {!isHtmlEmpty(personal.summary) && (
          <div
            className="mt-3 leading-relaxed rich-text-output"
            style={{ opacity: 0.85 }}
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

function ExperienceSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
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
                extra={loc ? <span style={{ opacity: 0.5 }}> · {loc}</span> : null}
                date={dateStr}
                titleStyle={s.titleStyle}
                centered={centered}
                accent={accent}
                textColor={textColor}
              />
              {!isHtmlEmpty(desc) && <ItemDesc description={desc} bullets={item.bullets} bulletColor={accent} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EducationSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
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
                  {item.fieldOfStudy && <span style={{ opacity: 0.5 }}> · {item.fieldOfStudy}</span>}
                  {showLoc && item.location && <span style={{ opacity: 0.5 }}> · {item.location}</span>}
                  {item.gpa && <span style={{ opacity: 0.5 }}> · GPA: {item.gpa}</span>}
                </>
              }
              date={showDates && (item.startDate || item.endDate)
                ? `${item.startDate || ''}${item.endDate ? ` – ${item.endDate}` : ''}` : ''}
              titleStyle={s.titleStyle}
              centered={centered}
              accent={accent}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const cols = s.columns || 1;
  const style = s.skillsStyle || 'tags';
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      {style === 'bars' ? (
        <div className={`grid gap-x-6 ${COLS[cols] || 'grid-cols-1'}`} style={{ gap: rowGap }}>
          {visibleItems.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider mr-2" style={{ color: accent }}>{item.category}:</span>}
              {(item.skills || '').split(',').map((sk, i) => sk.trim() && (
                <div key={i} className="flex items-center gap-2 mt-1">
                  <span className="w-24 shrink-0" style={{ opacity: 0.8 }}>{sk.trim()}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: accent + '20' }}>
                    <div className="h-1.5 rounded-full w-4/5" style={{ backgroundColor: accent + '70' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : style === 'tags' ? (
        <div className={`grid ${COLS[cols] || 'grid-cols-1'}`} style={{ gap: rowGap }}>
          {visibleItems.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: accent }}>{item.category}</span>}
              <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
                {(item.skills || '').split(',').map((sk, i) => sk.trim() && (
                  <span key={i} className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: accent + '10', color: accent, borderColor: accent + '30' }}>
                    {sk.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-1'}`} style={{ gap: rowGap }}>
          {visibleItems.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold mr-2" style={{ color: accent }}>{item.category}:</span>}
              <span style={{ opacity: 0.85 }}>{item.skills}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
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
                <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.name}</span>
                {item.technologies && <span style={{ opacity: 0.6 }}> · {item.technologies}</span>}
                {item.url && <span className="ml-1" style={{ color: accent }}> · {item.url}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0 font-medium" style={{ color: accent }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagesSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const cols = s.columns || 2;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`grid gap-x-4 ${COLS[cols] || 'grid-cols-2'}`} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={`flex ${centered ? 'justify-center gap-2' : 'items-center justify-between'}`}>
            <span className="font-medium" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.language}</span>
            <span style={{ opacity: 0.6 }}>{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'}`}>
            <div>
              <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.name}</span>
              {item.issuer && <span style={{ opacity: 0.6 }}> — {item.issuer}</span>}
              {item.url && <span className="ml-1" style={{ color: accent }}> · {item.url}</span>}
            </div>
            {showDates && item.date && (
              <span className="whitespace-nowrap ml-2 shrink-0 font-medium" style={{ color: accent }}>{item.date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardsSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const centered = s.alignment === 'center';
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'}`}>
              <div>
                <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.title}</span>
                {item.issuer && <span style={{ opacity: 0.6 }}> — {item.issuer}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-2 shrink-0 font-medium" style={{ color: accent }}>{item.date}</span>
              )}
            </div>
            {item.description && <p className="mt-0.5" style={{ opacity: 0.75 }}>{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VolunteeringSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const centered = s.alignment === 'center';
  const twoCol = s.columns > 1;
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-start'}`}>
              <div>
                <span className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.role}</span>
                {item.org && <span style={{ color: accent, opacity: 0.85 }}> — {item.org}</span>}
                {showLoc && item.location && <span style={{ opacity: 0.5 }}>, {item.location}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0 font-medium" style={{ color: accent }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferencesSection({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const cols = s.columns || 2;
  const centered = s.alignment === 'center';
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`grid ${COLS[cols] || 'grid-cols-2'}`} style={{ gap: rowGap }}>
        {visibleItems.map(item => (
          <div key={item.id} className="p-2 rounded-lg border" style={{ borderColor: accent + '20', backgroundColor: accent + '05' }}>
            <p className="font-bold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.name}</p>
            {item.jobTitle && <p style={{ opacity: 0.6 }}>{item.jobTitle}</p>}
            {item.company && <p style={{ opacity: 0.6 }}>{item.company}</p>}
            {item.email && <p className="mt-0.5" style={{ color: accent }}>{item.email}</p>}
            {item.phone && <p style={{ opacity: 0.5 }}>{item.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function InterestsSection({ section, accent, borderColor }) {
  const s = section.settings || {};
  const centered = s.alignment === 'center';
  const tagGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || '6px');
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div className={centered ? 'text-center' : ''} style={{ marginBottom: 'var(--section-gap)' }}>
      <SectionTitle title={section.title} accent={accent} borderColor={borderColor} centered={centered} />
      <div className={`flex flex-wrap ${centered ? 'justify-center' : ''}`} style={{ gap: tagGap }}>
        {visibleItems.map(item =>
          (item.interests || '').split(',').map((interest, i) => interest.trim() && (
            <span key={`${item.id}-${i}`} className="px-2 py-0.5 rounded border" style={{ backgroundColor: accent + '10', color: accent, borderColor: accent + '25' }}>
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
  const rowGap = s.itemGap != null ? s.itemGap + 'px' : (ROW_GAP[s.spacing] || ROW_GAP.normal);
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
              extra={item.location ? <span style={{ opacity: 0.5 }}> · {item.location}</span> : null}
              date={item.date || ''}
              titleStyle={s.titleStyle}
              centered={centered}
              accent={accent}
              textColor={textColor}
            />
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
