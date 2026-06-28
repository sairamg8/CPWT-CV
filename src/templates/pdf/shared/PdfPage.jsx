import { Font, StyleSheet } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNjXhFVZNyB1Wk.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjThZVZNyB1Wk.woff2', fontWeight: 700 },
    {
      src: 'https://fonts.gstatic.com/s/notosans/v36/o-0OIpQlx3QUlC5A4PNj_j5-UUk.woff2',
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
