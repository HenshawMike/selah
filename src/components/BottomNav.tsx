'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Icons = {
  Home: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Orders: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  ),
  Customers: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Debts: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21V3L17 21V3" />
      <path d="M5 10h14" />
      <path d="M5 14h14" />
    </svg>
  )
};

// Better Naira SVG without the text tag for cleaner lines
const NairaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 21V3L17 21V3" />
    <path d="M5 10h14" />
    <path d="M5 14h14" />
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/', Icon: Icons.Home },
    { name: 'Orders', href: '/orders', Icon: Icons.Orders },
    { name: 'Customers', href: '/customers', Icon: Icons.Customers },
    { name: 'Debts', href: '/debts', Icon: NairaIcon },
  ];

  return (
    <nav className="mobile-only bottom-nav-wrapper">
      <div className="bottom-nav-content">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`bottom-nav-link ${isActive ? 'active' : ''}`}>
              <div className="nav-indicator" />
              <span className="nav-icon">
                <link.Icon />
              </span>
              <span className="nav-label">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .bottom-nav-wrapper {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0 1rem 1.5rem 1rem;
          padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
          pointer-events: none;
        }
        .bottom-nav-content {
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          justify-content: space-around;
          padding: 0.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          pointer-events: auto;
          max-width: 500px;
          margin: 0 auto;
        }
        .bottom-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--color-text-secondary);
          text-decoration: none;
          padding: 0.75rem 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          flex: 1;
        }
        .nav-indicator {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--color-danger);
          border-radius: 10px;
          box-shadow: 0 0 15px var(--color-danger);
          transition: width 0.3s ease;
        }
        .active .nav-indicator {
          width: 20px;
        }
        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        .nav-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .bottom-nav-link.active {
          color: white;
        }
        .bottom-nav-link.active .nav-icon {
          color: var(--color-danger);
          transform: translateY(-2px);
        }
        .bottom-nav-link.active .nav-label {
          color: var(--color-danger);
          font-weight: bold;
        }
      `}</style>
    </nav>
  );
}
