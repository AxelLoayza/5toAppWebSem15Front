import './globals.css';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'ProductStore',
  description: 'Gestión de productos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 bg-gray-100">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}