import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Kalina AI - Crystal-clear AI calls, anywhere',
  description: 'Experience ultra-low latency voice calls with AI-enhanced quality, end-to-end encryption, and global coverage for seamless communication.',
  keywords: 'AI calls, voice communication, low latency, encryption, global coverage',
  authors: [{ name: 'Kalina AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#333446',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
