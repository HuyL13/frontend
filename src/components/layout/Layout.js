// components/Layout.jsx
import React, { useEffect } from 'react';
import { useLayout } from '../contexts/LayoutContext';

const Layout = ({ navbar: Navbar, children }) => {
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

  const layoutStyles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      position: 'relative',
    },
    sidebar: {
      width: isMobile ? (sidebarOpen ? '250px' : '0') : (sidebarOpen ? '250px' : '70px'),
      transition: 'all 0.3s ease',
      overflowX: 'hidden',
      zIndex: 1000,
    },
    main: {
      flexGrow: 1,
      marginLeft: isMobile ? '0' : (sidebarOpen ? '250px' : '70px'),
      transition: 'margin-left 0.3s ease',
      padding: '20px',
      position: 'relative',
    }
  };

  return (
    <div style={layoutStyles.container}>
      {/* Sidebar Area */}
      <aside style={layoutStyles.sidebar}>
        {Navbar && <Navbar />}
      </aside>

      {/* Main Content */}
      <main style={layoutStyles.main}>
        {/* Mobile Toggle Button */}
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            style={{
              position: 'fixed',
              top: '10px',
              left: '10px',
              zIndex: 1100,
              padding: '8px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default Layout;