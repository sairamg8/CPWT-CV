import { View, Text } from '@react-pdf/renderer';
import { PdfSectionTitle } from './PdfSection';
import { PdfRichText } from './PdfRichText';

// Helper to determine the item width in grid layout based on column setting
function getColumnWidth(cols) {
  if (cols === 2) return '48%';
  if (cols === 3) return '31%';
  if (cols === 4) return '23%';
  return '100%';
}

// Reusable column-wrapping container for multi-column layouts in React-PDF
function RenderColGrid({ items, cols, gap, renderItem }) {
  if (cols > 1) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: gap }}>
        {items.map((item, i) => (
          <View key={i} style={{ width: getColumnWidth(cols) }} wrap={false}>
            {renderItem(item, i)}
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ gap }}>
      {items.map((item, i) => (
        <View key={i}>
          {renderItem(item, i)}
        </View>
      ))}
    </View>
  );
}

// Reusable item header: bold primary + optional sub-line + date. Supports centering.
function ItemHeader({ primary, sub, dateStr, settings, titleStyle = 'stacked', italicSub = false, centered = false }) {
  const textColor  = settings?.textColor  || '#1a1a1a';
  const accent     = settings?.accentColor || '#111111';
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const baseSize   = settings?.fontSizeBase || 11;
  const subStyle   = { fontSize: baseSize, color: '#4b5563', fontStyle: italicSub ? 'italic' : 'normal', textAlign: centered ? 'center' : 'left' };

  if (centered) {
    if (titleStyle === 'sidebyside' || titleStyle === 'inline') {
      return (
        <View style={{ alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontSize: entrySize, color: textColor, textAlign: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>{primary}</Text>
            {sub ? <Text style={subStyle}>{italicSub ? `, ` : ' — '}{sub}</Text> : null}
          </Text>
          {dateStr ? <Text style={{ fontSize: baseSize, color: accent, marginTop: 1, textAlign: 'center' }}>{dateStr}</Text> : null}
        </View>
      );
    }
    // stacked
    return (
      <View style={{ alignItems: 'center', marginBottom: 2 }}>
        <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, textAlign: 'center' }}>{primary}</Text>
        {sub ? <Text style={subStyle}>{sub}</Text> : null}
        {dateStr ? <Text style={{ fontSize: baseSize, color: accent, marginTop: 1, textAlign: 'center' }}>{dateStr}</Text> : null}
      </View>
    );
  }

  if (titleStyle === 'sidebyside') {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor }}>{primary}</Text>
          {sub ? <Text style={subStyle}>{sub}</Text> : null}
        </View>
        {dateStr ? <Text style={{ fontSize: baseSize, color: accent, flexShrink: 0 }}>{dateStr}</Text> : null}
      </View>
    );
  }

  if (titleStyle === 'inline') {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: entrySize, color: textColor }}>
            <Text style={{ fontWeight: 'bold' }}>{primary}</Text>
            {sub ? <Text style={subStyle}>{italicSub ? `, ` : ' — '}{sub}</Text> : null}
          </Text>
        </View>
        {dateStr ? <Text style={{ fontSize: baseSize, color: accent, flexShrink: 0, marginLeft: 8 }}>{dateStr}</Text> : null}
      </View>
    );
  }

  // stacked (default)
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor }}>{primary}</Text>
        {sub ? <Text style={subStyle}>{sub}</Text> : null}
      </View>
      {dateStr ? <Text style={{ fontSize: baseSize, color: accent, flexShrink: 0, marginLeft: 8 }}>{dateStr}</Text> : null}
    </View>
  );
}

// Builds PdfSectionTitle props from section + settings
function SectionTitleOf({ section, settings, centered }) {
  return (
    <PdfSectionTitle
      title={section.title}
      headingStyle={settings?.headingStyle || 'ruled'}
      accent={settings?.accentColor || '#111111'}
      sectionTitleCase={settings?.sectionTitleCase || 'upper'}
      sectionSize={(settings?.fontSizeBase || 11) + (settings?.fontSizeSectionDelta ?? 1)}
      borderColor={settings?.sectionBorderColor || ''}
      sectionBorderWidth={settings?.sectionBorderWidth ?? 1}
      centered={centered}
    />
  );
}

function ExperienceSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s = section.settings || {};
  const titleOrder = s.titleOrder || 'company';
  const showDates  = s.showDates  !== false;
  const showLoc    = s.showLocation !== false;
  const titleStyle = s.titleStyle || 'stacked';
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH      = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const iH  = item.hiddenFields || [];
          const company = iH.includes('company') ? '' : (item.company || '');
          const role    = iH.includes('role')    ? '' : (item.role    || '');
          const loc  = !iH.includes('location') && showLoc ? (item.location || '') : '';
          const sd   = iH.includes('startDate') ? '' : (item.startDate || '');
          const ed   = iH.includes('endDate')   ? '' : (item.current   ? 'Present' : (item.endDate || ''));
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          const mainTitle  = titleOrder === 'role' ? role    : company;
          const subTitle   = titleOrder === 'role' ? company : role;
          const subLine    = [subTitle, loc].filter(Boolean).join(' · ');
          const desc = iH.includes('description') ? '' : item.description;
          return (
            <View>
              <ItemHeader
                primary={mainTitle}
                sub={subLine || undefined}
                dateStr={dateStr}
                settings={settings}
                titleStyle={titleStyle}
                italicSub={italicSubs}
                centered={centered}
              />
              {desc && desc.replace(/<[^>]*>/g, '').trim() && (
                <PdfRichText html={desc} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2, textAlign: centered ? 'center' : 'left' }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function SkillsSection({ section, settings, marginBottom, itemGap, centered }) {
  const s        = section.settings || {};
  const style    = s.skillsStyle || 'inline';
  const sep      = s.separator === 'dash' ? ' – ' : ': ';
  const isBullet = style === 'bullet';
  const textColor = settings?.textColor  || '#1a1a1a';
  const accent    = settings?.accentColor || '#111111';
  const entrySize = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH     = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      {style === 'stacked' ? (
        <RenderColGrid
          items={visibleItems}
          cols={cols}
          gap={itemGap}
          renderItem={(item, i) => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk  = item.skills   && !iH.includes('skills');
            return (
              <View>
                {showCat && (
                  <View style={{ marginBottom: 2 }}>
                    <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, textAlign: centered ? 'center' : 'left' }}>{item.category}</Text>
                    <View style={{ height: 0.5, backgroundColor: '#e5e7eb', marginTop: 1, marginBottom: 1 }} />
                  </View>
                )}
                {showSk && <Text style={{ fontSize: entrySize, color: '#4b5563', lineHeight: lineH, textAlign: centered ? 'center' : 'left' }}>{item.skills}</Text>}
              </View>
            );
          }}
        />
      ) : style === 'tags' ? (
        <RenderColGrid
          items={visibleItems}
          cols={cols}
          gap={itemGap}
          renderItem={(item, i) => {
            const iH   = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk  = item.skills   && !iH.includes('skills');
            const tags = showSk ? (item.skills || '').split(',').map(sk => sk.trim()).filter(Boolean) : [];
            return (
              <View style={{ alignItems: centered ? 'center' : 'flex-start' }}>
                {showCat && (
                  <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: accent, marginBottom: 4, letterSpacing: 0.5, textAlign: centered ? 'center' : 'left' }}>
                    {item.category.toUpperCase()}
                  </Text>
                )}
                {tags.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, justifyContent: centered ? 'center' : 'flex-start' }}>
                    {tags.map((tag, ti) => (
                      <View key={ti} style={{
                        backgroundColor: accent + '15',
                        borderRadius: 3,
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                        borderWidth: 0.5,
                        borderColor: accent + '40',
                      }}>
                        <Text style={{ fontSize: entrySize - 0.5, color: accent }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        // inline or bullet
        <View style={{ gap: 4 }}>
          {visibleItems.map((item, i) => {
            const iH = item.hiddenFields || [];
            const showCat = item.category && !iH.includes('category');
            const showSk  = item.skills   && !iH.includes('skills');
            const skillStr = Array.isArray(item.skills) ? item.skills.join(', ') : (item.skills || '');
            return (
              <View key={i} style={{ flexDirection: 'row', justifyContent: centered ? 'center' : 'flex-start' }} wrap={false}>
                {isBullet && <Text style={{ color: '#6b7280', fontSize: entrySize, marginRight: 4 }}>•</Text>}
                <Text style={{ fontSize: entrySize, lineHeight: lineH, textAlign: centered ? 'center' : 'left' }}>
                  {showCat && item.category
                    ? <Text style={{ fontWeight: 'bold', color: textColor }}>{item.category}{showSk ? sep : ''}</Text>
                    : null}
                  {showSk ? <Text style={{ color: '#4b5563' }}>{skillStr}</Text> : null}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function EducationSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s        = section.settings || {};
  const showDates = s.showDates    !== false;
  const showLoc   = s.showLocation !== false;
  const titleStyle = s.titleStyle || 'stacked';
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH      = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const sd = item.startDate || '';
          const ed = item.endDate   || '';
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          const degree  = [item.degree, item.fieldOfStudy ? item.fieldOfStudy : ''].filter(Boolean).join(', ');
          const locPart = showLoc && item.location ? ` · ${item.location}` : '';
          const gpaPart = item.gpa ? ` · GPA: ${item.gpa}` : '';
          const subLine = degree + locPart + gpaPart;
          return (
            <View>
              <ItemHeader
                primary={item.institution}
                sub={subLine || undefined}
                dateStr={dateStr}
                settings={settings}
                titleStyle={titleStyle}
                italicSub={italicSubs}
                centered={centered}
              />
              {item.description && item.description.replace(/<[^>]*>/g, '').trim() && (
                <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2, textAlign: centered ? 'center' : 'left' }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function CertificationsSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s        = section.settings || {};
  const showDates = s.showDates !== false;
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const baseSize   = settings?.fontSizeBase || 11;
  const textColor  = settings?.textColor  || '#1a1a1a';
  const accent     = settings?.accentColor || '#111111';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;
  const flexAlign  = centered ? 'center' : 'flex-start';
  const textAlign  = centered ? 'center' : 'left';

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const dateStr = showDates ? [item.date, item.expiry ? ` – ${item.expiry}` : ''].filter(Boolean).join('') : '';
          const credStr = item.credentialId ? ` · ID: ${item.credentialId}` : '';
          return (
            <View style={{ alignItems: flexAlign }}>
              <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, textAlign }}>{item.name || item.title}</Text>
              {item.issuer && (
                <Text style={{ fontSize: baseSize, color: '#4b5563', fontStyle: italicSubs ? 'italic' : 'normal', textAlign }}>
                  {item.issuer}{credStr}
                </Text>
              )}
              {dateStr ? <Text style={{ fontSize: baseSize, color: accent, marginTop: 1, textAlign }}>{dateStr}</Text> : null}
            </View>
          );
        }}
      />
    </View>
  );
}

function ProjectsSection({ section, settings, marginBottom, itemGap, centered }) {
  const s        = section.settings || {};
  const showDates = s.showDates !== false;
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const baseSize   = settings?.fontSizeBase || 11;
  const textColor  = settings?.textColor   || '#1a1a1a';
  const accent     = settings?.accentColor || '#111111';
  const lineH      = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;
  const flexAlign  = centered ? 'center' : 'flex-start';
  const textAlign  = centered ? 'center' : 'left';

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const sd = item.startDate || '';
          const ed = item.endDate   || '';
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          return (
            <View>
              <View style={{ alignItems: flexAlign, marginBottom: 2 }}>
                <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, textAlign }}>
                  {item.name}
                  {item.technologies ? <Text style={{ fontSize: baseSize, color: '#6b7280', fontWeight: 'normal' }}>{` · ${item.technologies}`}</Text> : null}
                  {item.url          ? <Text style={{ fontSize: baseSize, color: accent,    fontWeight: 'normal' }}>{` · ${item.url}`}</Text>          : null}
                </Text>
                {dateStr ? <Text style={{ fontSize: baseSize, color: accent, marginTop: 1, textAlign }}>{dateStr}</Text> : null}
              </View>
              {item.description && item.description.replace(/<[^>]*>/g, '').trim() && (
                <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2, textAlign }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function LanguagesSection({ section, settings, marginBottom, itemGap, centered }) {
  const s        = section.settings || {};
  const cols     = s.columns || 2;
  const baseSize = settings?.fontSizeBase || 11;
  const textColor = settings?.textColor   || '#1a1a1a';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 3 }}>
        {visibleItems.map((item, i) => (
          <View key={i} style={{ width: getColumnWidth(cols), flexDirection: 'row', justifyContent: 'space-between', paddingRight: 12, marginBottom: 3 }}>
            <Text style={{ fontSize: baseSize, fontWeight: 'bold', color: textColor }}>{item.language}</Text>
            {item.proficiency && <Text style={{ fontSize: baseSize, color: '#4b5563' }}>{item.proficiency}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function AwardsSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s        = section.settings || {};
  const showDates = s.showDates !== false;
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const baseSize   = settings?.fontSizeBase || 11;
  const textColor  = settings?.textColor   || '#1a1a1a';
  const accent     = settings?.accentColor || '#111111';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;
  const flexAlign  = centered ? 'center' : 'flex-start';
  const textAlign  = centered ? 'center' : 'left';

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => (
          <View style={{ alignItems: flexAlign }}>
            <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, textAlign }}>{item.title}</Text>
            {item.issuer && (
              <Text style={{ fontSize: baseSize, color: '#4b5563', fontStyle: italicSubs ? 'italic' : 'normal', textAlign }}>{item.issuer}</Text>
            )}
            {showDates && item.date ? <Text style={{ fontSize: baseSize, color: accent, marginTop: 1, textAlign }}>{item.date}</Text> : null}
            {item.description && <Text style={{ fontSize: baseSize, color: '#4b5563', marginTop: 1, textAlign }}>{item.description}</Text>}
          </View>
        )}
      />
    </View>
  );
}

function VolunteeringSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s        = section.settings || {};
  const showDates = s.showDates    !== false;
  const showLoc   = s.showLocation !== false;
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH      = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const sd = item.startDate || '';
          const ed = item.endDate   || '';
          const dateStr = showDates && (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
          const locPart = showLoc && item.location ? `, ${item.location}` : '';
          const sub     = item.org ? `${item.org}${locPart}` : '';
          return (
            <View>
              <ItemHeader
                primary={item.role}
                sub={sub || undefined}
                dateStr={dateStr}
                settings={settings}
                italicSub={italicSubs}
                centered={centered}
              />
              {item.description && item.description.replace(/<[^>]*>/g, '').trim() && (
                <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2, textAlign: centered ? 'center' : 'left' }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function ReferencesSection({ section, settings, marginBottom, itemGap, centered }) {
  const s = section.settings || {};
  const cols = s.columns || 2;
  const baseSize  = settings?.fontSizeBase || 11;
  const textColor = settings?.textColor   || '#1a1a1a';
  const accent    = settings?.accentColor || '#111111';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const alignStyle = centered ? { textAlign: 'center' } : {};

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: itemGap }}>
        {visibleItems.map((item, i) => (
          <View key={i} style={{ width: getColumnWidth(cols), padding: 5, borderWidth: 0.5, borderColor: '#e5e7eb', borderRadius: 3, alignItems: centered ? 'center' : 'flex-start' }} wrap={false}>
            <Text style={{ fontSize: baseSize, fontWeight: 'bold', color: textColor, ...alignStyle }}>{item.name}</Text>
            {item.jobTitle      && <Text style={{ fontSize: baseSize, color: '#4b5563', ...alignStyle }}>{item.jobTitle}</Text>}
            {item.company       && <Text style={{ fontSize: baseSize, color: '#4b5563', ...alignStyle }}>{item.company}</Text>}
            {item.relationship  && <Text style={{ fontSize: baseSize, color: '#6b7280', fontStyle: 'italic', ...alignStyle }}>{item.relationship}</Text>}
            {item.email         && <Text style={{ fontSize: baseSize, color: accent, marginTop: 2, ...alignStyle }}>{item.email}</Text>}
            {item.phone         && <Text style={{ fontSize: baseSize, color: '#6b7280', ...alignStyle }}>{item.phone}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function InterestsSection({ section, settings, marginBottom, itemGap, centered }) {
  const baseSize = settings?.fontSizeBase || 11;
  const accent   = settings?.accentColor || '#111111';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const allInterests = visibleItems.flatMap(item =>
    (item.interests || '').split(',').map(s => s.trim()).filter(Boolean)
  );

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: centered ? 'center' : 'flex-start' }}>
        {allInterests.map((interest, i) => (
          <View key={i} style={{ backgroundColor: accent + '12', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 1 }}>
            <Text style={{ fontSize: baseSize, color: accent }}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CustomSection({ section, settings, marginBottom, itemGap, italicSubs, centered }) {
  const s        = section.settings || {};
  const titleStyle = s.titleStyle || 'stacked';
  const entrySize  = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH      = settings?.lineHeightValue || 1.5;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const cols       = s.columns || 1;

  return (
    <View style={{ marginBottom }}>
      <SectionTitleOf section={section} settings={settings} centered={centered} />
      <RenderColGrid
        items={visibleItems}
        cols={cols}
        gap={itemGap}
        renderItem={(item, i) => {
          const locPart = item.location ? ` · ${item.location}` : '';
          const sub = item.subtitle ? `${item.subtitle}${locPart}` : (item.location || undefined);
          return (
            <View>
              <ItemHeader
                primary={item.title || ''}
                sub={sub}
                dateStr={item.date || ''}
                settings={settings}
                titleStyle={titleStyle}
                italicSub={italicSubs}
                centered={centered}
              />
              {item.description && item.description.replace(/<[^>]*>/g, '').trim() && (
                <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2, textAlign: centered ? 'center' : 'left' }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

// Main router — dispatches section type to the correct renderer.
// marginBottom: overrides sectionGap for this section (from spaceAfter)
// itemGap: overrides global itemGap for this section (from section.settings.itemGap)
// italicSubs: true for Executive-style italic secondary text
export function SectionRouter({ section, settings, marginBottom, itemGap, italicSubs = false }) {
  if (section.visible === false) return null;
  const mbVal = marginBottom ?? (settings?.sectionGap ?? 16);
  const igVal = itemGap     ?? (settings?.itemGap     ?? 12);
  const centered = section.settings?.alignment === 'center';
  const props = { section, settings, marginBottom: mbVal, itemGap: igVal, italicSubs, centered };

  switch (section.type) {
    case 'experience':     return <ExperienceSection     {...props} />;
    case 'skills':         return <SkillsSection         {...props} />;
    case 'education':      return <EducationSection      {...props} />;
    case 'certifications': return <CertificationsSection {...props} />;
    case 'projects':       return <ProjectsSection       {...props} />;
    case 'languages':      return <LanguagesSection      {...props} />;
    case 'awards':         return <AwardsSection         {...props} />;
    case 'volunteering':   return <VolunteeringSection   {...props} />;
    case 'references':     return <ReferencesSection     {...props} />;
    case 'interests':      return <InterestsSection      {...props} />;
    default:               return <CustomSection         {...props} />;
  }
}

// Helper to compute per-section spacing overrides (used by all template PDFs)
export const SECTION_SPACING_MAP = { compact: 4, normal: 8, relaxed: 14 };

export function getEffectiveSpacing(section, settings) {
  const ss = section.settings || {};
  return {
    marginBottom:  ss.spaceAfter  ?? (settings?.sectionGap ?? 16),
    spaceBefore:   ss.spaceBefore,
    itemGap:       ss.itemGap     ?? SECTION_SPACING_MAP[ss.spacing] ?? (settings?.itemGap ?? 12),
  };
}
