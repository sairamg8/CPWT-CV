import { Font, StyleSheet } from '@react-pdf/renderer';

// Static woff2 files from @fontsource/noto-sans, copied to public/fonts/.
// Using local files avoids CDN 404s and variable-font parse errors in fontkit.
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/noto-sans-latin-400-normal.woff2', fontWeight: 400 },
    { src: '/fonts/noto-sans-latin-700-normal.woff2', fontWeight: 700 },
    { src: '/fonts/noto-sans-latin-400-italic.woff2', fontStyle: 'italic', fontWeight: 400 },
  ],
});

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#111111',
    backgroundColor: 'white',
  },
});
