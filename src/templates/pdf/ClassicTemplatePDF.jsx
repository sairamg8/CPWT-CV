import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfSectionTitle } from './shared/PdfSection';
import { PdfRichText } from './shared/PdfRichText';
import { styles as pageStyles } from './shared/PdfPage';

const s = StyleSheet.create({
  name:        { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  jobTitle:    { fontSize: 12, marginBottom: 6, color: '#374151' },
  contactRow:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  contactItem: { fontSize: 9, color: '#4b5563', marginRight: 14 },
  section:     { marginBottom: 14 },
  entryWrap:   { marginBottom: 8 },
  entryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  entryTitle:  { fontSize: 10, fontWeight: 'bold', color: '#111111' },
  entryMeta:   { fontSize: 9, color: '#4b5563' },
  entryDate:   { fontSize: 9, color: '#4b5563' },
  body:        { fontSize: 9.5, color: '#333333', lineHeight: 1.5 },
  skillRow:    { flexDirection: 'row', marginBottom: 3 },
  skillCat:    { fontSize: 9.5, fontWeight: 'bold', color: '#111111', width: 100 },
  skillVal:    { fontSize: 9.5, color: '#333333', flex: 1 },
});

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

  return (
    <View style={s.contactRow}>
      {items.map((item, i) => <Text key={i} style={s.contactItem}>{item}</Text>)}
    </View>
  );
}

function ExperienceItem({ item, settings }) {
  const accent = settings?.accentColor || '#111111';
  return (
    <View style={s.entryWrap} wrap={false}>
      <View style={s.entryRow}>
        <View style={{ flex: 1 }}>
          <Text style={[s.entryTitle, { color: accent }]}>{item.role || item.title}</Text>
          {item.company && (
            <Text style={s.entryMeta}>
              {item.company}{item.location ? ` · ${item.location}` : ''}
            </Text>
          )}
        </View>
        <Text style={s.entryDate}>
          {item.start}{item.end ? ` – ${item.end}` : ' – Present'}
        </Text>
      </View>
      {item.description && <PdfRichText html={item.description} style={s.body} />}
    </View>
  );
}

function SectionRouter({ section, settings }) {
  if (!section.visible) return null;
  const titleProps = {
    title: section.title,
    headingStyle: settings?.headingStyle,
    accent: settings?.accentColor,
    sectionTitleCase: settings?.sectionTitleCase,
  };

  if (section.type === 'experience') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <ExperienceItem key={i} item={item} settings={settings} />
        ))}
      </View>
    );
  }

  if (section.type === 'skills') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={s.skillRow}>
            {item.category && <Text style={s.skillCat}>{item.category}:</Text>}
            <Text style={s.skillVal}>
              {Array.isArray(item.skills) ? item.skills.join(', ') : item.skills}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (section.type === 'education') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={{ marginBottom: 6 }} wrap={false}>
            <View style={s.entryRow}>
              <Text style={s.entryTitle}>{item.institution || item.school}</Text>
              {(item.start || item.end) && (
                <Text style={s.entryDate}>
                  {item.start}{item.end ? ` – ${item.end}` : ''}
                </Text>
              )}
            </View>
            {item.degree && (
              <Text style={s.entryMeta}>
                {item.degree}{item.field ? `, ${item.field}` : ''}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  if (section.type === 'certifications') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={{ marginBottom: 4 }} wrap={false}>
            <View style={s.entryRow}>
              <Text style={s.entryTitle}>{item.name || item.title}</Text>
              {item.date && <Text style={s.entryDate}>{item.date}</Text>}
            </View>
            {item.issuer && <Text style={s.entryMeta}>{item.issuer}</Text>}
          </View>
        ))}
      </View>
    );
  }

  // projects / custom / any unknown type
  return (
    <View style={s.section}>
      <PdfSectionTitle {...titleProps} />
      {section.items?.map((item, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          {item.title && <Text style={s.entryTitle}>{item.title}</Text>}
          {item.description && <PdfRichText html={item.description} style={s.body} />}
        </View>
      ))}
    </View>
  );
}

export function ClassicTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm = settings.marginV ?? 14;
  const hMm = settings.marginH ?? 18;
  const accent = settings.accentColor || '#374151';
  const baseFontSize = settings.fontSizeBase || 11;

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
            fontSize: baseFontSize,
            lineHeight: settings.lineHeightValue || 1.5,
          },
        ]}
      >
        <View style={{ marginBottom: 10 }}>
          <Text style={[s.name, { color: accent, fontSize: baseFontSize + (settings.fontSizeNameDelta || 8) }]}>
            {personal?.name}
          </Text>
          {personal?.title && (
            <Text style={[s.jobTitle, { fontSize: baseFontSize + 1 }]}>
              {personal.title}
            </Text>
          )}
          {personal?.summary && (
            <PdfRichText html={personal.summary} style={{ ...s.body, marginBottom: 6 }} />
          )}
          <ContactItems personal={personal} />
        </View>

        {sections.map((section) => (
          <SectionRouter key={section.id} section={section} settings={settings} />
        ))}
      </Page>
    </Document>
  );
}
