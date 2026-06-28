import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles as pageStyles } from './shared/PdfPage';
import { PdfContactRow } from './shared/PdfContact';
import { SectionRouter, getEffectiveSpacing } from './shared/PdfSections';
import { PdfRichText } from './shared/PdfRichText';

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
  };
}

export function MinimalTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm           = settings.marginV        ?? 14;
  const hMm           = settings.marginH        ?? 18;
  const accent        = settings.accentColor    || '#374151';
  const textColor     = settings.textColor      || '#1a1a1a';
  const nameColor     = settings.nameColor      || textColor;
  const jobTitleColor = settings.jobTitleColor  || '#555555';
  const baseSize      = settings.fontSizeBase   || 11;
  const nameSize      = baseSize + (settings.fontSizeNameDelta  ?? 8);
  const entrySize     = baseSize + (settings.fontSizeEntryDelta ?? 0);
  const lineH         = settings.lineHeightValue || 1.5;
  const hidden        = personal?.hiddenFields  || [];

  const headerAlign  = settings.headerAlign || 'left';
  const headerLayout = settings.headerLayout || 'stack';
  const centered     = headerAlign === 'center';

  const photoTextAlign = settings.photoTextAlign || 'center';
  const alignSelfVal = photoTextAlign === 'bottom' ? 'flex-end' : photoTextAlign === 'center' ? 'center' : 'flex-start';

  function hexAlpha(hex, a) {
    const r = parseInt((hex || '#374151').slice(1, 3), 16);
    const g = parseInt((hex || '#374151').slice(3, 5), 16);
    const b = parseInt((hex || '#374151').slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  return (
    <Document>
      <Page
        size="A4"
        style={[pageStyles.page, {
          fontFamily:    settings._pdfFontFamily || 'NotoSans',
          paddingTop:    `${vMm}mm`,
          paddingBottom: `${vMm}mm`,
          paddingLeft:   `${hMm}mm`,
          paddingRight:  `${hMm}mm`,
          fontSize:      baseSize,
          lineHeight:    lineH,
          color:         textColor,
        }]}
      >
        {/* Header — light name weight (300) */}
        <View style={{ marginBottom: 14 }}>
          <View style={{
            flexDirection: centered ? 'column' : 'row',
            alignItems: centered ? 'center' : alignSelfVal,
            gap: 12,
            marginBottom: 4,
            width: '100%'
          }}>
            {personal?.photo && !hidden.includes('photo') && (
              <Image src={personal.photo} style={getPhotoStyle(settings, accent)} />
            )}
            <View style={{ flex: 1, alignItems: centered ? 'center' : 'stretch', width: '100%' }}>
              {headerLayout === 'inline' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: settings.headerInlineGap ?? 8, justifyContent: centered ? 'center' : 'flex-start' }}>
                  <Text style={{ fontSize: nameSize, fontWeight: 300, color: nameColor, letterSpacing: -0.3 }}>
                    {personal?.name || 'Your Name'}
                  </Text>
                  {personal?.title && (
                    <Text style={{ fontSize: entrySize, color: jobTitleColor, fontWeight: 'medium' }}>
                      {personal.title}
                    </Text>
                  )}
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: nameSize, fontWeight: 300, color: nameColor, letterSpacing: -0.3, marginBottom: 1, textAlign: centered ? 'center' : 'left' }}>
                    {personal?.name || 'Your Name'}
                  </Text>
                  {personal?.title && (
                    <Text style={{ fontSize: entrySize, color: jobTitleColor, marginBottom: 1, textAlign: centered ? 'center' : 'left' }}>
                      {personal.title}
                    </Text>
                  )}
                </>
              )}
              <PdfContactRow personal={personal} settings={settings} />
            </View>
          </View>

          {!hidden.includes('summary') && personal?.summary &&
           personal.summary.replace(/<[^>]*>/g, '').trim() && (
            <View style={{
              marginTop: 8,
              borderLeftWidth: 2,
              borderLeftColor: hexAlpha(accent, 0.4),
              paddingLeft: 8,
              alignItems: centered ? 'center' : 'flex-start',
            }}>
              <PdfRichText
                html={personal.summary}
                style={{ fontSize: baseSize - 0.5, color: '#555555', lineHeight: lineH, fontStyle: 'italic', textAlign: centered ? 'center' : 'left' }}
              />
            </View>
          )}
        </View>

        {/* Body sections */}
        {sections.map((section) => {
          if (section.visible === false) return null;
          const { marginBottom, spaceBefore, itemGap } = getEffectiveSpacing(section, settings);
          return (
            <View key={section.id} style={spaceBefore != null ? { marginTop: spaceBefore } : {}}>
              <SectionRouter section={section} settings={settings} marginBottom={marginBottom} itemGap={itemGap} />
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
