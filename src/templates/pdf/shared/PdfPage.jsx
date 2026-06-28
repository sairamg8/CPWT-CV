import { StyleSheet } from '@react-pdf/renderer';

// Font registration is handled by pdfFontLoader.js (supports all user-selected fonts).
// This file only exports the base page style; the actual fontFamily is injected
// inline per-render based on the resume's font setting.
export const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#111111',
    backgroundColor: 'white',
  },
});
