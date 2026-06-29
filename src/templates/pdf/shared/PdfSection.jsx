import { View, Text } from '@react-pdf/renderer';

export function PdfSectionTitle({
  title,
  headingStyle = 'line',
  accent = '#2563eb',
  sectionTitleCase = 'upper',
  sectionSize = 11,
  borderColor = '',
  sectionBorderWidth = 1,
  centered = false,
  template = '',
}) {
  const label = sectionTitleCase === 'upper' ? title.toUpperCase() : title;
  const bc = borderColor || accent;
  const textAlignment = centered ? { textAlign: 'center' } : {};
  const accentText  = { fontSize: sectionSize, fontWeight: 'bold', color: accent, letterSpacing: 0.7, lineHeight: 1.2, ...textAlignment };
  const neutralText = { fontSize: sectionSize, fontWeight: 'bold', color: '#374151', letterSpacing: 0.7, lineHeight: 1.2, ...textAlignment };

  // Resolve whether the heading text color should be accent or neutral dark gray
  let useAccentText = true;
  if (template === 'minimal') {
    if (headingStyle === 'underline' || headingStyle === 'ruled' || headingStyle === 'leftbar') {
      useAccentText = false;
    }
  } else if (template === 'classic' || template === 'sidebar') {
    if (headingStyle === 'ruled' || headingStyle === 'leftbar') {
      useAccentText = false;
    }
  }

  const titleText = useAccentText ? accentText : neutralText;

  if (headingStyle === 'ruled') {
    return (
      <View style={{ marginBottom: 6 }}>
        <Text style={titleText}>{label}</Text>
        <View style={{ height: sectionBorderWidth, backgroundColor: borderColor || '#e5e7eb', marginTop: 2 }} />
      </View>
    );
  }
  if (headingStyle === 'underline') {
    const underlineColor = template === 'minimal' ? (borderColor || '#e5e7eb') : bc;
    return (
      <View style={{ marginBottom: 6, borderBottomWidth: sectionBorderWidth, borderBottomColor: underlineColor, paddingBottom: 2 }}>
        <Text style={titleText}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'leftbar') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: centered ? 'center' : 'flex-start', marginBottom: 6 }}>
        <View style={{ width: sectionBorderWidth + 2, backgroundColor: bc, alignSelf: 'stretch', marginRight: 6 }} />
        <Text style={titleText}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'box') {
    return (
      <View style={{ backgroundColor: bc + '14', paddingVertical: 3, paddingHorizontal: 6, marginBottom: 6, borderRadius: 2 }}>
        <Text style={titleText}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'line') {
    const lineColor = borderColor || (accent + '40');
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {centered && <View style={{ flex: 1, height: sectionBorderWidth, backgroundColor: lineColor, marginRight: 8 }} />}
        <Text style={{ ...titleText, marginRight: centered ? 0 : 8 }}>{label}</Text>
        <View style={{ flex: 1, height: sectionBorderWidth, backgroundColor: lineColor, marginLeft: centered ? 8 : 0 }} />
      </View>
    );
  }
  // plain
  return <Text style={{ ...titleText, marginBottom: 6 }}>{label}</Text>;
}


