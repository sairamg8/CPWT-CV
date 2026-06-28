import { MainTitle, ItemDesc } from '@/templates/SidebarTemplateHelpers';

export function MainExperience({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const titleOrder = s.titleOrder || 'role';
  const visibleItems = section.items.filter(i => i.visible !== false);
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
            <div key={item.id} className="relative pl-3" style={{ borderLeft: '2px solid #e5e7eb' }}>
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
              <div className="flex justify-between items-start">
                <div>
                  {primaryTitle && <div className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{primaryTitle}</div>}
                  {secondaryTitle && (
                    <div style={{ color: accent, opacity: 0.8, fontSize: '10px' }}>
                      {secondaryTitle}{loc ? ` · ${loc}` : ''}
                    </div>
                  )}
                </div>
                {dateStr && <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>{dateStr}</span>}
              </div>
              {desc && <ItemDesc description={desc} bullets={item.bullets} accent={accent} textColor={textColor} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MainProjects({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const showDates = s.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id} className="relative pl-3" style={{ borderLeft: '2px solid #e5e7eb' }}>
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.name}</span>
                {item.technologies && <span style={{ color: accent, opacity: 0.7, fontSize: '10px' }}> · {item.technologies}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            {item.url && <div style={{ color: accent, fontSize: '10px' }}>{item.url}</div>}
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} textColor={textColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MainAwards({ section, accent, borderColor, textColor }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.title}</span>
                {item.issuer && <span style={{ color: accent, opacity: 0.7, fontSize: '10px' }}> — {item.issuer}</span>}
              </div>
              {showDates && item.date && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>{item.date}</span>
              )}
            </div>
            {item.description && <p className="mt-0.5" style={{ opacity: 0.75, fontSize: '10.5px' }}>{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MainVolunteering({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const showDates = s.showDates !== false;
  const showLoc = s.showLocation !== false;
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className="flex flex-col" style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.role}</span>
                {item.org && <span style={{ color: accent, opacity: 0.85 }}> — {item.org}</span>}
                {showLoc && item.location && <span style={{ opacity: 0.5 }}>, {item.location}</span>}
              </div>
              {showDates && (item.startDate || item.endDate) && (
                <span className="whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
                </span>
              )}
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} textColor={textColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MainCustom({ section, accent, borderColor, textColor }) {
  const s = section.settings || {};
  const twoCol = s.columns > 1;
  const visibleItems = section.items.filter(i => i.visible !== false);
  return (
    <div style={{ marginBottom: 'var(--section-gap)' }}>
      <MainTitle title={section.title} accent={accent} borderColor={borderColor} />
      <div className={twoCol ? 'grid grid-cols-2' : 'flex flex-col'} style={{ gap: 'var(--item-gap)' }}>
        {visibleItems.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div>
                {item.title && <span className="font-semibold" style={{ color: textColor, fontSize: 'var(--fs-entry, 11pt)' }}>{item.title}</span>}
                {item.subtitle && <span style={{ color: accent, opacity: 0.85 }}> — {item.subtitle}</span>}
              </div>
              <div className="text-right whitespace-nowrap ml-2 shrink-0" style={{ color: '#9ca3af', fontSize: '10px' }}>
                {item.location && <div>{item.location}</div>}
                {item.date && <div>{item.date}</div>}
              </div>
            </div>
            <ItemDesc description={item.description} bullets={item.bullets} accent={accent} textColor={textColor} />
          </div>
        ))}
      </div>
    </div>
  );
}
