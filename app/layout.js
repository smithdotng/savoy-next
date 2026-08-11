import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Savoy Summerset Menu',
  description: 'Browse the Savoy Summerset restaurant menu and make a reservation.',
  applicationName: 'Savoy Summerset Menu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Savoy Menu'
  },
  formatDetection: {
    telephone: true
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B0000'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
        <link rel="icon" href="/images/icons/icon-192.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600;700&family=Hind:wght@300;400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css" />
      </head>
      <body>
        {children}
        {/* Registers the service worker so the site meets PWA installability
            criteria (manifest + service worker + HTTPS + icons). Uses
            next/script so React actually executes it on the client. */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function (err) {
                  console.error('Service worker registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
