import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles as pageStyles } from './shared/PdfPage';
import { SectionRouter, getEffectiveSpacing } from './shared/PdfSections';
import { PdfRichText } from './shared/PdfRichText';
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon, LinkedinPdfIcon, GithubPdfIcon } from './shared/PdfIcons';

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
    borderColor: br === 'none' ? 'transparent' : br === 'thin' ? '#e2e8f0' : accent,
    objectFit: 'cover',
  };
}

// Modern: colored accent header band with inline contact icons, then regular sections below
function HeaderContact({ personal, settings, textColor }) {
  const hidden   = personal?.hiddenFields || [];
  const baseSize = settings?.fontSizeBase || 11;
  const iconPt   = Math.max(7, Math.round((settings?.iconSize ?? 9) * 0.9));
  const textSize = baseSize - 1.5;
  const items = [
    { key: 'email',    Icon: MailIcon,        val: personal?.email,    display: personal?.email },
    { key: 'phone',    Icon: PhoneIcon,       val: personal?.phone,    display: personal?.phone },
    { key: 'location', Icon: MapPinIcon,      val: personal?.location, display: personal?.location },
    { key: 'website',  Icon: GlobeIcon,       val: personal?.website,  display: personal?.websiteLabel || personal?.website },
    { key: 'linkedin', Icon: LinkedinPdfIcon, val: personal?.linkedin, display: personal?.linkedinLabel || personal?.linkedin },
    { key: 'github',   Icon: GithubPdfIcon,   val: personal?.github,   display: personal?.githubLabel  || personal?.github },
  ].filter(({ key, val }) => !hidden.includes(key) && val);

  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {items.map(({ key, Icon, display }) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Icon size={iconPt} color={textColor} />
          <Text style={{ fontSize: textSize, color: textColor }}>{display}</Text>
        </View>
      ))}
    </View>
  );
}

export function ModernTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm           = settings.marginV        ?? 14;
  const hMm           = settings.marginH        ?? 18;
  const accent        = settings.accentColor    || '#1d4ed8';
  const textColor     = settings.textColor      || '#1f2937';
  const headerText    = settings.headerTextColor || '#ffffff';
  const nameColor     = settings.nameColor      || headerText;
  const jobTitleColor = settings.jobTitleColor  || headerText;
  const baseSize      = settings.fontSizeBase   || 11;
  const nameSize      = baseSize + (settings.fontSizeNameDelta  ?? 8);
  const entrySize     = baseSize + (settings.fontSizeEntryDelta ?? 0);
  const lineH         = settings.lineHeightValue || 1.5;
  const sectionGap    = settings.sectionGap     ?? 16;
  const hidden        = personal?.hiddenFields  || [];

  return (
    <Document>
      <Page
        size="A4"
        style={[pageStyles.page, {
          fontFamily:    settings._pdfFontFamily || 'NotoSans',
          paddingTop:    0,
          paddingBottom: `${vMm}mm`,
          paddingLeft:   0,
          paddingRight:  0,
          fontSize:      baseSize,
          lineHeight:    lineH,
          color:         textColor,
        }]}
      >
        {/* Colored header band */}
        <View style={{
          backgroundColor: accent,
          paddingTop:      `${vMm}mm`,
          paddingBottom:   14,
          paddingLeft:     `${hMm}mm`,
          paddingRight:    `${hMm}mm`,
          marginBottom:    sectionGap,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            {personal?.photo && !hidden.includes('photo') && (
              <Image src={personal.photo} style={getPhotoStyle(settings, '#ffffff')} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: nameSize, fontWeight: 'bold', color: nameColor, marginBottom: 1 }}>
                {personal?.name}
              </Text>
              {personal?.title && (
                <Text style={{ fontSize: entrySize, color: jobTitleColor, marginBottom: 2 }}>
                  {personal.title}
                </Text>
              )}
              <HeaderContact personal={personal} settings={settings} textColor={headerText} />
            </View>
          </View>
          {!hidden.includes('summary') && personal?.summary &&
           personal.summary.replace(/<[^>]*>/g, '').trim() && (
            <View style={{ marginTop: 8 }}>
              <PdfRichText html={personal.summary} style={{ fontSize: baseSize - 0.5, color: headerText, lineHeight: lineH }} />
            </View>
          )}
        </View>

        {/* Body sections */}
        <View style={{ paddingLeft: `${hMm}mm`, paddingRight: `${hMm}mm` }}>
          {sections.map((section) => {
            if (section.visible === false) return null;
            const { marginBottom, spaceBefore, itemGap } = getEffectiveSpacing(section, settings);
            return (
              <View key={section.id} style={spaceBefore != null ? { marginTop: spaceBefore } : {}}>
                <SectionRouter section={section} settings={settings} marginBottom={marginBottom} itemGap={itemGap} />
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
