import { Mail, Phone, MapPin, Globe, Link2, Code } from 'lucide-react';
import { getFontById } from '../utils/fonts';

const SP = { compact: 'space-y-1', normal: 'space-y-3', relaxed: 'space-y-5' };
const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

function ItemDesc({ description, bullets, bulletColor }) {
  return (
    <>
      {description && <p className="text-gray-600 mt-1 leading-relaxed">{description}</p>}
      {bullets?.length > 0 && (
        <ul className="mt-1 space-y-0.5 pl-3">
          {bullets.map((b, i) => b && (
            <li key={i} className="relative pl-2 text-gray-700 before:absolute before:left-0 before:top-[6px] before:w-1 before:h-1 before:rounded-full" style={{ '--tw-content': `''` }}>
              <span className="absolute left-0 top-[6px] w-1 h-1 rounded-full" style={{ backgroundColor: bulletColor }} />
              {b}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SectionTitle({ title, accent }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h2 className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: accent }}>{title}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: accent + '30' }} />
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
  const fontFamily = getFontById(data.settings?.font)?.family || "'Inter', sans-serif";
  const accent = data.settings?.accentColor || '#2563eb';
  const hidden = new Set(personal?.hiddenFields || []);

  return (
    <div className="text-gray-800" style={{ fontFamily }}>
      <div className="text-white px-6 py-5 mb-5 rounded-sm" style={{ backgroundColor: accent }}>
        <div className="flex items-start gap-4">
          {personal.photo && (
            <img src={personal.photo} alt="" className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white/30" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight mb-0.5">{personal.name || 'Your Name'}</h1>
            {personal.title && <p className="text-sm opacity-80 mb-2">{personal.title}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 opacity-90">
              {!hidden.has('email')    && personal.email    && <span className="flex items-center gap-1"><Mail size={9}/><ContactLink ckey="email"    val={personal.email}   >{personal.email}</ContactLink></span>}
              {!hidden.has('phone')    && personal.phone    && <span className="flex items-center gap-1"><Phone size={9}/><ContactLink ckey="phone"    val={personal.phone}   >{personal.phone}</ContactLink></span>}
              {!hidden.has('location') && personal.location && <span className="flex items-center gap-1"><MapPin size={9}/>{personal.location}</span>}
              {!hidden.has('website')  && personal.website  && <span className="flex items-center gap-1"><Globe size={9}/><ContactLink ckey="website"  val={personal.website} >{personal.website}</ContactLink></span>}
              {!hidden.has('linkedin') && personal.linkedin && <span className="flex items-center gap-1"><Link2 size={9}/><ContactLink ckey="linkedin" val={personal.linkedin}>{personal.linkedin}</ContactLink></span>}
              {!hidden.has('github')   && personal.github   && <span className="flex items-center gap-1"><Code size={9}/><ContactLink ckey="github"   val={personal.github}  >{personal.github}</ContactLink></span>}
            </div>
          </div>
        </div>
        {personal.summary && <p className="mt-3 opacity-85 leading-relaxed">{personal.summary}</p>}
      </div>
      {sections.map(s => <Section key={s.id} section={s} accent={accent} />)}
    </div>
  );
}

function Section({ section, accent }) {
  switch (section.type) {
    case 'experience':     return <ExperienceSection     section={section} accent={accent} />;
    case 'education':      return <EducationSection      section={section} accent={accent} />;
    case 'skills':         return <SkillsSection         section={section} accent={accent} />;
    case 'projects':       return <ProjectsSection       section={section} accent={accent} />;
    case 'languages':      return <LanguagesSection      section={section} accent={accent} />;
    case 'certifications': return <CertificationsSection section={section} accent={accent} />;
    case 'awards':         return <AwardsSection         section={section} accent={accent} />;
    case 'volunteering':   return <ExperienceSection     section={{ ...section, items: section.items.map(i => ({ ...i, role: i.role, company: i.org })) }} accent={accent} />;
    case 'references':     return <ReferencesSection     section={section} accent={accent} />;
    case 'interests':      return <InterestsSection      section={section} accent={accent} />;
    default:               return <CustomSection         section={section} accent={accent} />;
  }
}

function ExperienceSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-900 text-xs">{item.role}</span>
                {item.company && <span style={{ color: accent }}> @ {item.company}</span>}
              </div>
              {(showDates || showLoc) && (
                <div className="text-right text-gray-500 whitespace-nowrap ml-2 shrink-0">
                  {showLoc && item.location && <div>{item.location}</div>}
                  {showDates && (item.startDate || item.endDate || item.current) && (
                    <div className="font-medium" style={{ color: accent }}>
                      {item.startDate}{(item.endDate || item.current) ? ` – ${item.current ? 'Present' : item.endDate}` : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || 'space-y-2';
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <div key={item.id} className="flex justify-between items-start">
            <div>
              <span className="font-bold text-gray-900 text-xs">{item.degree}</span>
              {item.institution && <span style={{ color: accent }}> — {item.institution}</span>}
              {item.fieldOfStudy && <span className="text-gray-400"> · {item.fieldOfStudy}</span>}
              {showLoc && item.location && <span className="text-gray-400"> · {item.location}</span>}
              {item.gpa && <span className="text-gray-400"> · GPA: {item.gpa}</span>}
            </div>
            {showDates && (item.startDate || item.endDate) && (
              <span className="whitespace-nowrap ml-2 shrink-0 text-gray-500">
                {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const cols = s.columns || 1;
  const style = s.skillsStyle || 'tags';
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      {style === 'bars' ? (
        <div className={`grid gap-x-6 gap-y-2 ${COLS[cols] || 'grid-cols-1'}`}>
          {section.items.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider mr-2" style={{ color: accent }}>{item.category}:</span>}
              {(item.skills || '').split(',').map((sk, i) => sk.trim() && (
                <div key={i} className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 w-24 shrink-0">{sk.trim()}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 rounded-full w-4/5" style={{ backgroundColor: accent + '70' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : style === 'tags' ? (
        <div className={`grid gap-y-1.5 ${COLS[cols] || 'grid-cols-1'}`}>
          {section.items.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: accent }}>{item.category}</span>}
              <div className="flex flex-wrap gap-1">
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
        <div className={`grid gap-x-4 gap-y-1 ${COLS[cols] || 'grid-cols-1'}`}>
          {section.items.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold mr-2" style={{ color: accent }}>{item.category}:</span>}
              <span className="text-gray-700">{item.skills}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-900 text-xs">{item.name}</span>
                {item.technologies && <span className="text-gray-500"> · {item.technologies}</span>}
                {item.url && <span className="ml-1" style={{ color: accent }}> · {item.url}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0 text-gray-500">
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

function LanguagesSection({ section, accent }) {
  if (!section.items.length) return null;
  const cols = section.settings?.columns || 2;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={`grid gap-x-4 gap-y-1 ${COLS[cols] || 'grid-cols-2'}`}>
        {section.items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="font-medium text-gray-900 text-xs">{item.language}</span>
            <span className="text-gray-500">{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const showDates = s.showDates !== false;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={spacing}>
        {section.items.map(item => (
          <div key={item.id} className="flex justify-between items-start">
            <div>
              <span className="font-bold text-gray-900 text-xs">{item.name}</span>
              {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
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

function AwardsSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const showDates = s.showDates !== false;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={spacing}>
        {section.items.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-900 text-xs">{item.title}</span>
                {item.issuer && <span className="text-gray-500"> — {item.issuer}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-2 shrink-0 font-medium" style={{ color: accent }}>{item.date}</span>
              )}
            </div>
            {item.description && <p className="text-gray-600 mt-0.5">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferencesSection({ section, accent }) {
  if (!section.items.length) return null;
  const cols = section.settings?.columns || 2;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={`grid gap-3 ${COLS[cols] || 'grid-cols-2'}`}>
        {section.items.map(item => (
          <div key={item.id} className="p-2 rounded-lg border" style={{ borderColor: accent + '20', backgroundColor: accent + '05' }}>
            <p className="font-bold text-gray-900 text-xs">{item.name}</p>
            {item.jobTitle && <p className="text-gray-500">{item.jobTitle}</p>}
            {item.company && <p className="text-gray-500">{item.company}</p>}
            {item.email && <p className="mt-0.5" style={{ color: accent }}>{item.email}</p>}
            {item.phone && <p className="text-gray-400">{item.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function InterestsSection({ section, accent }) {
  if (!section.items.length) return null;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className="flex flex-wrap gap-1.5">
        {section.items.map(item =>
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

function CustomSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || 'space-y-2';
  const twoCol = s.columns > 1;
  return (
    <div className="mb-4">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                {item.title && <span className="font-bold text-gray-900 text-xs">{item.title}</span>}
                {item.subtitle && <span className="text-gray-500"> — {item.subtitle}</span>}
              </div>
              <div className="text-right whitespace-nowrap ml-2 shrink-0" style={{ color: accent }}>
                {item.location && <div>{item.location}</div>}
                {item.date && <div>{item.date}</div>}
              </div>
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} bulletColor={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
