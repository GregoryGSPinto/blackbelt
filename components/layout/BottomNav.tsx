'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import MobileDrawer from './MobileDrawer';

export default function BottomNav() {
  const pathname = usePathname();
  const [showDrawer, setShowDrawer] = useState(false);
  
  const mainItems = [
    { icon: Home, label: 'Início', href: '/inicio' },
    { icon: Search, label: 'Buscar', href: '/buscar' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - APENAS MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Início e Buscar */}
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all active:scale-95 ${
                  isActive 
                    ? 'text-white scale-110' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Menu (abre drawer) */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all active:scale-95 text-white/60 hover:text-white"
          >
            <Menu size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />

      {/* Bottom Spacing for Content - APENAS MOBILE */}
      <div className="md:hidden h-20" />
    </>
  );
}
