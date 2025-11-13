import 'tailwindcss/tailwind.css';
import '../globalStyles.scss';

import type {AppProps} from 'next/app';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {memo} from 'react';

const MyApp = memo(({Component, pageProps}: AppProps): JSX.Element => {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
});

export default MyApp;
