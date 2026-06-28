import { Font, StyleSheet } from '@react-pdf/renderer';

// Noto Sans v42 (variable font — 400 and 700 share the same woff2 file, latin subset)
Font.register({
  family: 'NotoSans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a7duw.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a7duw.woff2',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0kIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevHtVtX57DGjDU1QDce2VDSyA.woff2',
      fontStyle: 'italic',
      fontWeight: 400,
    },
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
