import { ClerkProvider } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ backgroundColor: '#050505', color: 'white' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
