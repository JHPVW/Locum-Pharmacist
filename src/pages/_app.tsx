import 'tailwindcss/tailwind.css';
import '../globalStyles.scss';

import {SpeedInsights} from '@vercel/speed-insights/next';
import type {AppProps} from 'next/app';
import Script from 'next/script';
import {memo} from 'react';

const MyApp = memo(({Component, pageProps}: AppProps): JSX.Element => {
  return (
    <>
      {/* Google Ads */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17736898219"
        strategy="afterInteractive"
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17736898219');
        `}
      </Script>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
});

export default MyApp;
