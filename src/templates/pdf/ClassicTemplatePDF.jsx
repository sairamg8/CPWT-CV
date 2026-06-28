import { Document, Page, View, Text } from '@react-pdf/renderer';
import { PdfSectionTitle } from './shared/PdfSection';
import { PdfRichText } from './shared/PdfRichText';
import { styles as pageStyles } from './shared/PdfPage';

function ContactItems({ personal }) {
  const hidden = personal?.hiddenFields || [];
  const items = [
    !hidden.includes('email')    && personal?.email,
    !hidden.includes('phone')    && personal?.phone,
    !hidden.includes('location') && personal?.location,
    !hidden.includes('website')  && (personal?.websiteLabel || personal?.website),
    !hidden.includes('linkedin') && (personal?.linkedinLabel || personal?.linkedin),
    !hidden.includes('github')   && (personal?.githubLabel   || personal?.github),
  ].filter(Boolean);

  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 }}>
      {items.map((item, i) => (
        <Text key={i} style={{ fontSize: 9, color: '#555555', marginRight: 14, marginBottom: 1 }}>{item}</Text>
      ))}
    </View>
  );
}

function ExperienceItem({ item, settings, titleOrder }) {
  const accent = settings?.accentColor || '#111111';
  const textColor = settings?.textColor || '#1a1a1a';
  const entrySize = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);
  const lineH = settings?.lineHeightValue || 1.5;

  const startD = item.startDate || item.start || '';
  const endD   = item.current ? 'Present' : (item.endDate || item.end || '');
  const dateStr = (startD || endD) ? `${startD}${endD ? ` – ${endD}` : ''}` : '';

  const ord = titleOrder || 'company';
  const mainTitle = ord === 'role' ? (item.role || '') : (item.company || '');
  const subTitle  = ord === 'role' ? (item.company || '') : (item.role || '');
  const loc = item.location || '';
  const subLine = [subTitle, loc].filter(Boolean).join(' · ');

  return (
    <View wrap={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, flex: 1 }}>{mainTitle}</Text>
        {dateStr ? <Text style={{ fontSize: 9, color: accent, flexShrink: 0, marginLeft: 8 }}>{dateStr}</Text> : null}
      </View>
      {subLine ? <Text style={{ fontSize: 9, color: '#4b5563', marginBottom: 2 }}>{subLine}</Text> : null}
      {item.description && (
        <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH, marginTop: 2 }} />
      )}
    </View>
  );
}

function EducationItem({ item, settings }) {
  const accent = settings?.accentColor || '#111111';
  const textColor = settings?.textColor || '#1a1a1a';
  const entrySize = (settings?.fontSizeBase || 11) + (settings?.fontSizeEntryDelta ?? 0);

  const sd = item.startDate || item.start || '';
  const ed = item.endDate   || item.end   || '';
  const dateStr = (sd || ed) ? `${sd}${ed ? ` – ${ed}` : ''}` : '';
  const fieldOfStudy = item.fieldOfStudy || item.field || '';

  return (
    <View wrap={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor, flex: 1 }}>
          {item.institution || item.school}
        </Text>
        {dateStr ? <Text style={{ fontSize: 9, color: accent, flexShrink: 0, marginLeft: 8 }}>{dateStr}</Text> : null}
      </View>
      {item.degree && (
        <Text style={{ fontSize: 9, color: '#4b5563' }}>
          {item.degree}{fieldOfStudy ? `, ${fieldOfStudy}` : ''}
        </Text>
      )}
    </View>
  );
}

function SectionRouter({ section, settings }) {
  if (section.visible === false) return null;

  const accent = settings?.accentColor || '#111111';
  const textColor = settings?.textColor || '#1a1a1a';
  const baseSize = settings?.fontSizeBase || 11;
  const sectionSize = baseSize + (settings?.fontSizeSectionDelta ?? 1);
  const entrySize = baseSize + (settings?.fontSizeEntryDelta ?? 0);
  const sectionGap = settings?.sectionGap ?? 16;
  const itemGap = settings?.itemGap ?? 12;
  const borderColor = settings?.sectionBorderColor || '';
  const sectionBorderWidth = settings?.sectionBorderWidth ?? 1;
  const lineH = settings?.lineHeightValue || 1.5;

  const titleProps = {
    title: section.title,
    headingStyle: settings?.headingStyle || 'ruled',
    accent,
    sectionTitleCase: settings?.sectionTitleCase || 'upper',
    sectionSize,
    borderColor,
    sectionBorderWidth,
  };

  const ss = section.settings || {};
  const visibleItems = section.items?.filter(i => i.visible !== false) || [];

  if (section.type === 'experience') {
    return (
      <View style={{ marginBottom: sectionGap }}>
        <PdfSectionTitle {...titleProps} />
        <View style={{ gap: itemGap }}>
          {visibleItems.map((item, i) => (
            <ExperienceItem key={i} item={item} settings={settings} titleOrder={ss.titleOrder || 'company'} />
          ))}
        </View>
      </View>
    );
  }

  if (section.type === 'skills') {
    const sep = ss.separator === 'dash' ? ' – ' : ': ';
    return (
      <View style={{ marginBottom: sectionGap }}>
        <PdfSectionTitle {...titleProps} />
        <View style={{ gap: 4 }}>
          {visibleItems.map((item, i) => {
            const skillStr = Array.isArray(item.skills) ? item.skills.join(', ') : (item.skills || '');
            return (
              <Text key={i} style={{ fontSize: entrySize, lineHeight: lineH, color: '#4b5563' }}>
                {item.category
                  ? <Text style={{ fontWeight: 'bold', color: textColor }}>{item.category}{sep}</Text>
                  : null}
                {skillStr}
              </Text>
            );
          })}
        </View>
      </View>
    );
  }

  if (section.type === 'education') {
    return (
      <View style={{ marginBottom: sectionGap }}>
        <PdfSectionTitle {...titleProps} />
        <View style={{ gap: itemGap }}>
          {visibleItems.map((item, i) => (
            <EducationItem key={i} item={item} settings={settings} />
          ))}
        </View>
      </View>
    );
  }

  if (section.type === 'certifications') {
    return (
      <View style={{ marginBottom: sectionGap }}>
        <PdfSectionTitle {...titleProps} />
        <View style={{ gap: itemGap }}>
          {visibleItems.map((item, i) => (
            <View key={i} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor }}>{item.name || item.title}</Text>
                  {item.issuer && <Text style={{ fontSize: 9, color: '#4b5563' }}>{item.issuer}</Text>}
                </View>
                {item.date && <Text style={{ fontSize: 9, color: accent, flexShrink: 0, marginLeft: 8 }}>{item.date}</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // projects / custom / any unknown type
  return (
    <View style={{ marginBottom: sectionGap }}>
      <PdfSectionTitle {...titleProps} />
      <View style={{ gap: itemGap }}>
        {visibleItems.map((item, i) => (
          <View key={i}>
            {item.title && (
              <Text style={{ fontSize: entrySize, fontWeight: 'bold', color: textColor }}>{item.title}</Text>
            )}
            {item.description && (
              <PdfRichText html={item.description} style={{ fontSize: entrySize - 0.5, color: '#333333', lineHeight: lineH }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export function ClassicTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm = settings.marginV ?? 14;
  const hMm = settings.marginH ?? 18;
  const accent = settings.accentColor || '#111111';
  const textColor = settings.textColor || '#1a1a1a';
  const baseSize = settings.fontSizeBase || 11;
  const nameSize = baseSize + (settings.fontSizeNameDelta ?? 8);
  const entrySize = baseSize + (settings.fontSizeEntryDelta ?? 0);
  const nameColor = settings.nameColor || textColor;
  const jobTitleColor = settings.jobTitleColor || accent;
  const lineH = settings.lineHeightValue || 1.5;

  return (
    <Document>
      <Page
        size="A4"
        style={[
          pageStyles.page,
          {
            fontFamily: settings._pdfFontFamily || 'NotoSans',
            paddingTop: `${vMm}mm`,
            paddingBottom: `${vMm}mm`,
            paddingLeft: `${hMm}mm`,
            paddingRight: `${hMm}mm`,
            fontSize: baseSize,
            lineHeight: lineH,
            color: textColor,
          },
        ]}
      >
        {/* Header: name → title → contacts → summary */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: nameSize, fontWeight: 'bold', color: nameColor, marginBottom: 2 }}>
            {personal?.name}
          </Text>
          {personal?.title && (
            <Text style={{ fontSize: entrySize, color: jobTitleColor, marginBottom: 1 }}>
              {personal.title}
            </Text>
          )}
          <ContactItems personal={personal} />
          {personal?.summary && (
            <View style={{ marginTop: 8 }}>
              <PdfRichText html={personal.summary} style={{ fontSize: baseSize - 0.5, color: '#333333', lineHeight: lineH }} />
            </View>
          )}
        </View>

        {sections.map((section) => (
          <SectionRouter key={section.id} section={section} settings={settings} />
        ))}
      </Page>
    </Document>
  );
}
