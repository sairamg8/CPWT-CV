import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles as pageStyles } from './shared/PdfPage';
import { PdfSidebarContact } from './shared/PdfContact';
import { PdfSectionTitle } from './shared/PdfSection';
import { SectionRouter, getEffectiveSpacing } from './shared/PdfSections';
import { PdfRichText } from './shared/PdfRichText';

// Sections that live in the dark sidebar column
const SIDEBAR_TYPES = new Set(['skills', 'education', 'languages', 'certifications', 'interests', 'references']);

// ──────────────── Sidebar-specific section renderers ────────────────

function SideSectionTitle({ title }) {
  return (
    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>
      {title.toUpperCase()}
    </Text>
  );
}

function SideSkills({ section, sectionGap, itemGap, accent }) {
  const s     = section.settings || {};
  const style = s.skillsStyle || 'tags';
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      {style === 'tags' ? (
        <View style={{ gap: itemGap }}>
          {visibleItems.map((item, i) => {
            const iH = item.hiddenFields || [];
            const tags = item.skills && !iH.includes('skills')
              ? (item.skills || '').split(',').map(s => s.trim()).filter(Boolean)
              : [];
            return (
              <View key={i}>
                {item.category && !iH.includes('category') && (
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, marginBottom: 2 }}>
                    {item.category.toUpperCase()}
                  </Text>
                )}
                {tags.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                    {tags.map((tag, ti) => (
                      <View key={ti} style={{ backgroundColor: '#334155', borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 8, color: '#cbd5e1' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : style === 'bars' ? (
        <View style={{ gap: itemGap }}>
          {visibleItems.map((item, i) => {
            const iH = item.hiddenFields || [];
            return (
              <View key={i}>
                {item.category && !iH.includes('category') && (
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b', marginBottom: 2 }}>{item.category.toUpperCase()}</Text>
                )}
                {item.skills && !iH.includes('skills') && item.skills.split(',').map((sk, index) => sk.trim() && (
                  <View key={index} style={{ marginBottom: 3 }}>
                    <Text style={{ fontSize: 8, color: '#cbd5e1', marginBottom: 1 }}>{sk.trim()}</Text>
                    <View style={{ height: 3, backgroundColor: '#334155', borderRadius: 1.5, position: 'relative' }}>
                      <View style={{ height: 3, backgroundColor: accent || '#60a5fa', borderRadius: 1.5, width: '80%' }} />
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 2 }}>
          {visibleItems.map((item, i) => {
            const iH = item.hiddenFields || [];
            return (
              <View key={i}>
                {item.category && !iH.includes('category') && (
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b' }}>{item.category}: </Text>
                )}
                {item.skills && !iH.includes('skills') && (
                  <Text style={{ fontSize: 9, color: '#cbd5e1' }}>{item.skills}</Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SideEducation({ section, sectionGap, itemGap }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      <View style={{ gap: itemGap }}>
        {visibleItems.map((item, i) => (
          <View key={i}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#e2e8f0' }}>{item.degree}</Text>
            {item.institution && <Text style={{ fontSize: 9, color: '#94a3b8' }}>{item.institution}</Text>}
            {item.fieldOfStudy && <Text style={{ fontSize: 9, color: '#94a3b8' }}>{item.fieldOfStudy}</Text>}
            {item.gpa && <Text style={{ fontSize: 9, color: '#64748b' }}>GPA: {item.gpa}</Text>}
            {showDates && (item.startDate || item.endDate) && (
              <Text style={{ fontSize: 9, color: '#64748b' }}>
                {item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function SideLanguages({ section, sectionGap, itemGap }) {
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      <View style={{ gap: 3 }}>
        {visibleItems.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 9, color: '#e2e8f0' }}>{item.language}</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>{item.proficiency}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SideCertifications({ section, sectionGap, itemGap }) {
  const showDates = section.settings?.showDates !== false;
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      <View style={{ gap: itemGap }}>
        {visibleItems.map((item, i) => (
          <View key={i}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#e2e8f0' }}>{item.name}</Text>
            {item.issuer && <Text style={{ fontSize: 9, color: '#94a3b8' }}>{item.issuer}</Text>}
            {showDates && item.date && <Text style={{ fontSize: 9, color: '#64748b' }}>{item.date}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function SideInterests({ section, sectionGap }) {
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  const allInterests = visibleItems.flatMap(item =>
    (item.interests || '').split(',').map(s => s.trim()).filter(Boolean)
  );
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
        {allInterests.map((interest, i) => (
          <View key={i} style={{ backgroundColor: '#334155', borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 }}>
            <Text style={{ fontSize: 8, color: '#cbd5e1' }}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SideReferences({ section, sectionGap, itemGap }) {
  const visibleItems = (section.items || []).filter(i => i.visible !== false);
  return (
    <View style={{ marginBottom: sectionGap }}>
      <SideSectionTitle title={section.title} />
      <View style={{ gap: itemGap }}>
        {visibleItems.map((item, i) => (
          <View key={i}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#e2e8f0' }}>{item.name}</Text>
            {item.jobTitle && <Text style={{ fontSize: 9, color: '#94a3b8' }}>{item.jobTitle}</Text>}
            {item.email && <Text style={{ fontSize: 9, color: '#64748b' }}>{item.email}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function renderSideSection(section, sectionGap, itemGap, accent) {
  const props = { section, sectionGap, itemGap, accent };
  switch (section.type) {
    case 'skills':         return <SideSkills         key={section.id} {...props} />;
    case 'education':      return <SideEducation      key={section.id} {...props} />;
    case 'languages':      return <SideLanguages      key={section.id} {...props} />;
    case 'certifications': return <SideCertifications key={section.id} {...props} />;
    case 'interests':      return <SideInterests      key={section.id} {...props} sectionGap={sectionGap} />;
    case 'references':     return <SideReferences     key={section.id} {...props} />;
    default:               return null;
  }
}

// Helper to compute photo styles in PDF points
function getPhotoStyle(settings, accent) {
  const sh = settings?.photoShape || 'circle';
  const sz = settings?.photoSize || 'md';
  const br = settings?.photoBorder || 'accent';
  const ph = settings?.photoHeight || 'match';

  const w = sz === 'sm' ? 40 : sz === 'lg' ? 65 : 50;
  const h = sh === 'circle' ? w : ph === 'tall' ? Math.round(w * 1.4) : ph === 'taller' ? Math.round(w * 1.8) : w;

  return {
    width: w,
    height: h,
    borderRadius: sh === 'rounded' ? 6 : sh === 'square' ? 1 : w / 2,
    borderWidth: br === 'none' ? 0 : 1,
    borderColor: br === 'none' ? 'transparent' : br === 'thin' ? '#e5e7eb' : accent,
    objectFit: 'cover',
    marginBottom: 6,
  };
}

// ──────────────────────────────────────────────────────────────────

export function SidebarTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm           = settings.marginV        ?? 14;
  const hMm           = settings.marginH        ?? 18;
  const accent        = settings.accentColor    || '#1e40af';
  const textColor     = settings.textColor      || '#1e293b';
  const sidebarBg     = settings.sidebarBg      || '#1e293b';
  const headerText    = settings.headerTextColor || '#ffffff';
  const nameColor     = settings.nameColor      || headerText;
  const jobTitleColor = settings.jobTitleColor  || accent;
  const baseSize      = settings.fontSizeBase   || 11;
  const nameSize      = baseSize + (settings.fontSizeNameDelta  ?? 8);
  const entrySize     = baseSize + (settings.fontSizeEntryDelta ?? 0);
  const lineH         = settings.lineHeightValue || 1.5;
  const sectionGap    = settings.sectionGap     ?? 16;
  const itemGap       = settings.itemGap        ?? 12;
  const hidden        = personal?.hiddenFields  || [];

  const visibleSections = sections.filter(s => s.visible !== false);
  const sidebarSections = visibleSections.filter(s =>  SIDEBAR_TYPES.has(s.type));
  const mainSections    = visibleSections.filter(s => !SIDEBAR_TYPES.has(s.type));

  // Main content settings override: sidebar template sections use 'plain' heading style
  const mainSettings = { ...settings, headingStyle: settings.headingStyle || 'plain' };

  const sideIconPt = Math.max(6, Math.round((settings?.iconSize ?? 8) * 0.8));
  const sideSectionGap = Math.round(sectionGap * 0.75);
  const sideItemGap    = Math.round(itemGap    * 0.6);

  return (
    <Document>
      <Page
        size="A4"
        style={[pageStyles.page, {
          fontFamily: settings._pdfFontFamily || 'NotoSans',
          padding:    0,
          flexDirection: 'row',
          fontSize:   baseSize,
          lineHeight: lineH,
        }]}
      >
        {/* ── Sidebar column (dark) ── */}
        <View style={{
          width:         '38%',
          backgroundColor: sidebarBg,
          paddingTop:    `${vMm}mm`,
          paddingBottom: `${vMm}mm`,
          paddingLeft:   12,
          paddingRight:  12,
          color:         '#e2e8f0',
        }}>
          {/* Name + title */}
          <View style={{ marginBottom: sideSectionGap, alignItems: 'center' }}>
            {personal?.photo && !hidden.includes('photo') && (
              <Image src={personal.photo} style={getPhotoStyle(settings, accent)} />
            )}
            <Text style={{ fontSize: nameSize, fontWeight: 'bold', color: nameColor, textAlign: 'center', marginBottom: 2 }}>
              {personal?.name}
            </Text>
            {personal?.title && (
              <Text style={{ fontSize: entrySize, color: jobTitleColor, textAlign: 'center', marginBottom: 6 }}>
                {personal.title}
              </Text>
            )}
          </View>

          {/* Contact section */}
          <View style={{ marginBottom: sideSectionGap }}>
            <SideSectionTitle title="Contact" />
            <PdfSidebarContact personal={personal} accent={accent} iconPt={sideIconPt} />
          </View>

          {/* Sidebar sections */}
          {sidebarSections.map(section => {
            const ss = section.settings || {};
            const effGap = ss.spaceAfter ?? sideSectionGap;
            const effItemGap = ss.itemGap ?? sideItemGap;
            return (
              <View key={section.id} style={ss.spaceBefore != null ? { marginTop: ss.spaceBefore } : {}}>
                {renderSideSection(section, effGap, effItemGap, accent)}
              </View>
            );
          })}
        </View>

        {/* ── Main column ── */}
        <View style={{
          flex:          1,
          paddingTop:    `${vMm}mm`,
          paddingBottom: `${vMm}mm`,
          paddingLeft:   14,
          paddingRight:  `${hMm}mm`,
          color:         textColor,
        }}>
          {/* Summary */}
          {!hidden.includes('summary') && personal?.summary &&
           personal.summary.replace(/<[^>]*>/g, '').trim() && (
            <View style={{ marginBottom: sectionGap }}>
              <PdfSectionTitle
                title="About Me"
                headingStyle={mainSettings.headingStyle}
                accent={accent}
                sectionTitleCase={mainSettings.sectionTitleCase || 'upper'}
                sectionSize={baseSize + (settings.fontSizeSectionDelta ?? 1)}
                borderColor={settings.sectionBorderColor || ''}
                sectionBorderWidth={settings.sectionBorderWidth ?? 1}
              />
              <PdfRichText html={personal.summary} style={{ fontSize: baseSize - 0.5, color: textColor, lineHeight: lineH }} />
            </View>
          )}

          {/* Main sections */}
          {mainSections.map((section) => {
            const { marginBottom, spaceBefore, itemGap: ig } = getEffectiveSpacing(section, settings);
            return (
              <View key={section.id} style={spaceBefore != null ? { marginTop: spaceBefore } : {}}>
                <SectionRouter section={section} settings={mainSettings} marginBottom={marginBottom} itemGap={ig} />
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
