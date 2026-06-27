import { Mail, Phone, MapPin, Globe, Link2, Code } from 'lucide-react';
import { getFontById } from '../utils/fonts';

const SP = { compact: 'space-y-1.5', normal: 'space-y-3.5', relaxed: 'space-y-6' };
const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

function ItemDesc({ description, bullets, accent }) {
  return (
    <>
      {description && <p className="mt-1 leading-relaxed" style={{ color: '#9ca3af' }}>{description}</p>}
      {bullets?.length > 0 && (
        <ul className="space-y-1 mt-1.5">
          {bullets.map((b, i) => b && (
            <li key={i} className="flex gap-2" style={{ color: '#9ca3af' }}>
              <span className="mt-0.5 shrink-0" style={{ color: accent }}>▸</span>
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
    <div className="flex items-center gap-3 mb-2.5">
      <span className="font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}60, transparent)` }} />
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

export default function DarkTemplate({ data }) {
  const { personal, sections } = data;
  const fontFamily = getFontById(data.settings?.font)?.family || "'Inter', sans-serif";
  const accent = data.settings?.accentColor || '#6366f1';
  const hidden = new Set(personal?.hiddenFields || []);

  return (
    <div style={{ fontFamily, backgroundColor: '#0f1117', color: '#e2e8f0', minHeight: '100%' }}>
      <div style={{ background: `linear-gradient(135deg, #1e1b4b 0%, ${accent}40 50%, #1e3a5f 100%)`, padding: '24px 28px' }}>
        <div className="flex items-start gap-4">
          {personal.photo && (
            <img src={personal.photo} alt="" className="w-14 h-14 rounded-full object-cover shrink-0 border-2" style={{ borderColor: accent + '60' }} />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5">{personal.name || 'Your Name'}</h1>
            {personal.title && <p className="text-sm font-medium mb-2" style={{ color: accent }}>{personal.title}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ color: '#a5b4fc', opacity: 0.9 }}>
              {!hidden.has('email')    && personal.email    && <span className="flex items-center gap-1"><Mail size={9}/><ContactLink ckey="email"    val={personal.email}   >{personal.email}</ContactLink></span>}
              {!hidden.has('phone')    && personal.phone    && <span className="flex items-center gap-1"><Phone size={9}/><ContactLink ckey="phone"    val={personal.phone}   >{personal.phone}</ContactLink></span>}
              {!hidden.has('location') && personal.location && <span className="flex items-center gap-1"><MapPin size={9}/>{personal.location}</span>}
              {!hidden.has('website')  && personal.website  && <span className="flex items-center gap-1"><Globe size={9}/><ContactLink ckey="website"  val={personal.website} >{personal.website}</ContactLink></span>}
              {!hidden.has('linkedin') && personal.linkedin && <span className="flex items-center gap-1"><Link2 size={9}/><ContactLink ckey="linkedin" val={personal.linkedin}>{personal.linkedin}</ContactLink></span>}
              {!hidden.has('github')   && personal.github   && <span className="flex items-center gap-1"><Code size={9}/><ContactLink ckey="github"   val={personal.github}  >{personal.github}</ContactLink></span>}
            </div>
          </div>
        </div>
        {personal.summary && (
          <p className="mt-3 leading-relaxed border-l-2 pl-3 italic" style={{ color: '#94a3b8', borderColor: accent + '80' }}>
            {personal.summary}
          </p>
        )}
      </div>
      <div style={{ padding: '20px 28px' }}>
        {sections.map(s => <Section key={s.id} section={s} accent={accent} />)}
      </div>
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
    case 'volunteering':   return <VolunteeringSection   section={section} accent={accent} />;
    case 'references':     return <ReferencesSection     section={section} accent={accent} />;
    case 'interests':      return <InterestsSection      section={section} accent={accent} />;
    default:               return <CustomSection         section={section} accent={accent} />;
  }
}

function Card({ children }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: '#1a1d27', border: '1px solid #2d2f3e' }}>
      {children}
    </div>
  );
}

function ExperienceSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <span className="font-semibold text-white text-xs">{item.role}</span>
                {item.company && <span style={{ color: accent }}> @ {item.company}</span>}
                {showLoc && item.location && <span style={{ color: '#64748b' }}> · {item.location}</span>}
              </div>
              {showDates && (item.startDate || item.endDate || item.current) && (
                <span className="whitespace-nowrap ml-3 shrink-0 font-medium" style={{ color: accent }}>
                  {item.startDate}{(item.endDate || item.current) ? ` – ${item.current ? 'Present' : item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </Card>
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
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-xs">{item.degree}</span>
                {item.institution && <span style={{ color: accent }}> — {item.institution}</span>}
                {showLoc && item.location && <span style={{ color: '#64748b' }}> · {item.location}</span>}
                {item.gpa && <span style={{ color: '#64748b' }}> · GPA: {item.gpa}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </Card>
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
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      {style === 'bars' ? (
        <div className={`grid gap-x-6 gap-y-2 ${COLS[cols] || 'grid-cols-1'}`}>
          {section.items.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider mr-2" style={{ color: accent }}>{item.category}:</span>}
              {(item.skills || '').split(',').map((sk, i) => sk.trim() && (
                <div key={i} className="flex items-center gap-2 mt-1">
                  <span className="w-24 shrink-0" style={{ color: '#9ca3af' }}>{sk.trim()}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#2d2f3e' }}>
                    <div className="h-1.5 rounded-full w-4/5" style={{ backgroundColor: accent + '80' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : style === 'tags' ? (
        <div className={`grid gap-y-2 gap-x-4 ${COLS[cols] || 'grid-cols-1'}`}>
          {section.items.map(item => (
            <div key={item.id}>
              {item.category && <span className="font-bold uppercase tracking-wider mr-1 block mb-1" style={{ color: accent }}>{item.category}</span>}
              <div className="flex flex-wrap gap-1.5">
                {(item.skills || '').split(',').map((sk, i) => sk.trim() && (
                  <span key={i} className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#2d2f4a', border: `1px solid ${accent}50`, color: '#a5b4fc' }}>
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
              <span style={{ color: '#cbd5e1' }}>{item.skills}</span>
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
  const spacing = SP[s.spacing] || 'space-y-2.5';
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="font-semibold text-white text-xs">{item.name}</span>
                {item.technologies && <span style={{ color: '#64748b' }}> · {item.technologies}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            {item.url && <div className="mb-1" style={{ color: accent }}>{item.url}</div>}
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function LanguagesSection({ section, accent }) {
  if (!section.items.length) return null;
  const cols = section.settings?.columns || 2;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={`grid gap-x-4 gap-y-1.5 ${COLS[cols] || 'grid-cols-2'}`}>
        {section.items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="font-medium text-white text-xs">{item.language}</span>
            <span style={{ color: '#64748b' }}>{item.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ section, accent }) {
  if (!section.items.length) return null;
  const showDates = section.settings?.showDates !== false;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={SP[section.settings?.spacing] || SP.normal}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-xs">{item.name}</span>
                {item.issuer && <span style={{ color: accent }}> — {item.issuer}</span>}
                {item.url && <span className="ml-1" style={{ color: accent }}> · {item.url}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>{item.date}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AwardsSection({ section, accent }) {
  if (!section.items.length) return null;
  const showDates = section.settings?.showDates !== false;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={SP[section.settings?.spacing] || SP.normal}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-xs">{item.title}</span>
                {item.issuer && <span style={{ color: accent }}> — {item.issuer}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>{item.date}</span>
              )}
            </div>
            {item.description && <p className="mt-0.5" style={{ color: '#9ca3af' }}>{item.description}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function VolunteeringSection({ section, accent }) {
  if (!section.items.length) return null;
  const s = section.settings || {};
  const spacing = SP[s.spacing] || SP.normal;
  const showDates = s.showDates !== false;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={spacing}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="font-semibold text-white text-xs">{item.role}</span>
                {item.org && <span style={{ color: accent }}> @ {item.org}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReferencesSection({ section, accent }) {
  if (!section.items.length) return null;
  const cols = section.settings?.columns || 2;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={`grid gap-3 ${COLS[cols] || 'grid-cols-2'}`}>
        {section.items.map(item => (
          <Card key={item.id}>
            <p className="font-semibold text-white text-xs">{item.name}</p>
            {item.jobTitle && <p style={{ color: '#94a3b8' }}>{item.jobTitle}</p>}
            {item.company && <p style={{ color: '#64748b' }}>{item.company}</p>}
            {item.email && <p className="mt-0.5" style={{ color: accent }}>{item.email}</p>}
            {item.phone && <p style={{ color: '#64748b' }}>{item.phone}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function InterestsSection({ section, accent }) {
  if (!section.items.length) return null;
  return (
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className="flex flex-wrap gap-1.5">
        {section.items.map(item =>
          (item.interests || '').split(',').map((interest, i) => interest.trim() && (
            <span key={`${item.id}-${i}`} className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#2d2f4a', border: `1px solid ${accent}40`, color: '#a5b4fc' }}>
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
    <div className="mb-5">
      <SectionTitle title={section.title} accent={accent} />
      <div className={twoCol ? 'grid grid-cols-2 gap-3' : spacing}>
        {section.items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                {item.title && <span className="font-semibold text-white text-xs">{item.title}</span>}
                {item.subtitle && <span style={{ color: '#94a3b8' }}> — {item.subtitle}</span>}
              </div>
              <div className="text-right whitespace-nowrap ml-3 shrink-0" style={{ color: accent }}>
                {item.location && <div style={{ color: '#64748b' }}>{item.location}</div>}
                {item.date && <div>{item.date}</div>}
              </div>
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} />
          </Card>
        ))}
      </div>
    </div>
  );
}
