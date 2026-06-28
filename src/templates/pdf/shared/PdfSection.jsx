import { View, Text } from '@react-pdf/renderer';

export function PdfSectionTitle({
  title,
  headingStyle = 'ruled',
  accent = '#374151',
  sectionTitleCase = 'upper',
  sectionSize = 11,
  borderColor = '',
  sectionBorderWidth = 1,
}) {
  const label = sectionTitleCase === 'upper' ? title.toUpperCase() : title;
  const bc = borderColor || accent;
  const accentText  = { fontSize: sectionSize, fontWeight: 'bold', color: accent, letterSpacing: 0.7 };
  const neutralText = { fontSize: sectionSize, fontWeight: 'bold', color: '#374151', letterSpacing: 0.7 };

  if (headingStyle === 'ruled') {
    return (
      <View style={{ marginBottom: 6 }}>
        <Text style={neutralText}>{label}</Text>
        <View style={{ height: sectionBorderWidth, backgroundColor: borderColor || '#e5e7eb', marginTop: 2 }} />
      </View>
    );
  }
  if (headingStyle === 'underline') {
    return (
      <View style={{ marginBottom: 6, borderBottomWidth: sectionBorderWidth, borderBottomColor: bc, paddingBottom: 2 }}>
        <Text style={accentText}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'leftbar') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ width: sectionBorderWidth + 2, backgroundColor: bc, alignSelf: 'stretch', marginRight: 6 }} />
        <Text style={neutralText}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'box') {
    return (
      <View style={{ backgroundColor: bc, paddingVertical: 3, paddingHorizontal: 6, marginBottom: 6 }}>
        <Text style={{ ...accentText, color: 'white' }}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'line') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ ...accentText, marginRight: 8 }}>{label}</Text>
        <View style={{ flex: 1, height: sectionBorderWidth, backgroundColor: borderColor || (accent + '40') }} />
      </View>
    );
  }
  // plain
  return <Text style={{ ...accentText, marginBottom: 6 }}>{label}</Text>;
}
