import { View, Text } from '@react-pdf/renderer';

export function PdfSectionTitle({ title, headingStyle = 'ruled', accent = '#374151', sectionTitleCase = 'upper' }) {
  const label = sectionTitleCase === 'upper' ? title.toUpperCase() : title;
  const base = { fontSize: 10, fontWeight: 'bold', color: accent };

  if (headingStyle === 'ruled') {
    return (
      <View style={{ marginBottom: 6 }}>
        <Text style={base}>{label}</Text>
        <View style={{ height: 1, backgroundColor: accent }} />
      </View>
    );
  }
  if (headingStyle === 'underline') {
    return (
      <View style={{ marginBottom: 6, borderBottomWidth: 1, borderBottomColor: accent, borderBottomStyle: 'solid', paddingBottom: 1 }}>
        <Text style={base}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'leftbar') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ width: 3, backgroundColor: accent, alignSelf: 'stretch', marginRight: 6 }} />
        <Text style={base}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'box') {
    return (
      <View style={{ backgroundColor: accent, paddingVertical: 3, paddingHorizontal: 6, marginBottom: 6 }}>
        <Text style={{ ...base, color: 'white' }}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'line') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ ...base, marginRight: 8 }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: accent }} />
      </View>
    );
  }
  // plain
  return <Text style={{ ...base, marginBottom: 6 }}>{label}</Text>;
}
