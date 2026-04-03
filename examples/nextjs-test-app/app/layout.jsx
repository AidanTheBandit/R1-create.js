import './globals.css';

export const metadata = {
  title: 'R1 Create Full Test App',
  description: 'Comprehensive Next.js test harness for the R1 Create SDK'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
