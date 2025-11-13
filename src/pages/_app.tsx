import type {AppProps} from 'next/app';

import {SpeedInsights} from '@vercel/speed-insights/next';
import {memo} from 'react';

import 'tailwindcss/tailwind.css';
import '../globalStyles.scss';

const MyApp = memo(({Component, pageProps}: AppProps): JSX.Element => {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
});

export default MyApp;
