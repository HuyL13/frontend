// File: src/components/layout/MainLayout.js
import React, { useEffect } from 'react';
import { useLayout } from './LayoutContext';

const MainLayout = ({ navbar: Navbar, header: Header, children }) => {
  const { sidebarOpen, isMobile, updateMobile } = useLayout();

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 992;
      updateMobile(mobileCheck);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateMobile]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: isMobile ? (sidebarOpen ? 250 : 0) : (sidebarOpen ? 250 : 70),
        height: '100vh',
        transition: 'width 0.3s ease',
        overflowX: 'hidden',
        zIndex: 1001,
        position: 'fixed',
        left: 0,
        top: 0
      }}>
        {Navbar && <Navbar />}
      </aside>

      {/* Main Content Area */}
      <div style={{
        marginLeft: isMobile ? 0 : (sidebarOpen ? 250 : 70),
        width: `calc(100% - ${isMobile ? 0 : (sidebarOpen ? 250 : 70)}px)`,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: isMobile ? 0 : (sidebarOpen ? 250 : 70),
          height: '70px',
          background: '#fff',
          boxShadow: '0 1px 15px rgba(0,0,0,0.04)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          transition: 'left 0.3s ease'
        }}>
          {Header && <Header />}
        </header>

        {/* Content */}
        <main style={{
          padding: '90px 20px 20px',
          minHeight: 'calc(100vh - 70px)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;