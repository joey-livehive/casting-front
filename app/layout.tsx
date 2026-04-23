import type { Metadata } from 'next';
import Script from 'next/script';
import { Gaegu, Hahmlet, Gowun_Dodum } from 'next/font/google';
import './globals.css';

const META_PIXEL_ID = '573919161734831';

const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gaegu',
  display: 'swap',
});

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-hahmlet',
  display: 'swap',
});

const gowunDodum = Gowun_Dodum({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gowun',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'someonetheone — 네 사람, 내가 찾아줄게',
  description: '원하는 사람이 어디있든 다 찾아주는 AI',
  openGraph: {
    title: 'someonetheone — 네 사람, 내가 찾아줄게',
    description: '원하는 사람이 어디있든 다 찾아주는 AI',
    siteName: 'someonetheone',
    url: 'https://someonetheone.publicvoid.im',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'someonetheone — 네 사람, 내가 찾아줄게',
    description: '원하는 사람이 어디있든 다 찾아주는 AI',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${hahmlet.variable} ${gowunDodum.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-sto-bg text-sto-text">
        <Script id="facebook-pixel" strategy="beforeInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
