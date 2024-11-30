import './globals.css'

export const metadata = {
  title: 'Woof Timer',
  description: 'A simple beep timer application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  )
}
