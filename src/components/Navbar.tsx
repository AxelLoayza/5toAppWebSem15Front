'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

function NavbarContent() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
          Admin
        </Link>
      )}
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {user.nombre} <span className="text-xs text-gray-500">({user.rol})</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      )}
    </>
  );
}

const DynamicNavbarContent = dynamic(() => Promise.resolve(NavbarContent), {
  ssr: false,
});

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            ProductStore
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Productos
            </Link>
            <DynamicNavbarContent />
          </div>
        </div>
      </div>
    </nav>
  );
}