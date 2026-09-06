import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://andresvalencia.vercel.app',
  ),
  icons: { icon: '/favicon.svg' },
  title: 'Andrés Valencia · Sitios web para negocios',
  alternates: { canonical: '/' },
  description:
    'Diseño y desarrollo de sitios web para emprendedores, pequeños y medianos negocios. Sitios comerciales, catálogos y páginas de servicios. Andrés Valencia, Colombia.',
  openGraph: {
    title:
      'Andrés Valencia · Sitios web para negocios',
    description:
      'Sitios web para presentar tu negocio y facilitar el contacto con tus clientes.',
    type: 'website',
    locale: 'es_CO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

