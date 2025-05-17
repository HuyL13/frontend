import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaFileAlt, FaBell, FaCar, FaHandHoldingHeart } from "react-icons/fa";

const NavbarResident = ({ handleLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '5vh',
    },
    headerTop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      zIndex: 999,
      background: '#fff',
      boxShadow: '0 1px 15px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.04)',
    },
    appSidebar: {
      position: 'fixed',
      top: '70px',
      left: 0,
      height: 'calc(100vh - 70px)',
      width: '250px',
      background: '#1a237e',
      color: '#fff',
      zIndex: 100,
      transition: 'all 0.3s ease',
      overflowY: 'auto',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    },
    sidebarCollapse: {
      width: '70px',
    },
    searchButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: '#555',
      marginRight: '10px',
    },
    searchInput: {
      transition: 'all 0.3s ease',
      width: searchOpen ? '200px' : '0px',
      opacity: searchOpen ? 1 : 0,
      padding: searchOpen ? '8px 12px' : '0',
      overflow: 'hidden',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', // Dimming effect
      zIndex: 99, // Below sidebar but above content
    },
    navItem: {
      margin: '5px 0',
      padding: '0', // Remove default padding
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      color: '#fff',
      textDecoration: 'none',
      transition: 'background 0.3s ease',
    },
    navLinkActive: {
      background: '#3f51b5', // Highlight color for active item
      color: '#fff',
    },
    navLinkExpanded: {
      fontSize: '16px', // Keep larger font size
      // Removed fontWeight: 'bold'
    },
    navLinkCollapsed: {
      justifyContent: 'center', // Center icon in collapsed mode
      padding: '12px',
    },
    icon: {
      fontSize: '20px', // Larger icon in collapsed mode
    },
    text: {
      marginLeft: '10px',
    },
    navLabel: {
      padding: '15px 20px',
      fontSize: '18px',
      fontWeight: 'bold', // Bold for "Menu Cư Dân"
      color: '#b0bec5', // Slightly lighter color for label
    },
    headerBrand: {
      fontSize: '20px',
      fontWeight: 'bold', // Bold for "BlueMoon"
      color: '#fff',
      textDecoration: 'none',
    },
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <div className="wrapper" style={styles.wrapper}>
      <header className="header-top" style={styles.headerTop}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="top-menu d-flex align-items-center">
            <button
              type="button"
              className="btn-icon mobile-nav-toggle d-lg-none"
              onClick={toggleSidebar}
            >
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>

            <div className="d-flex align-items-center">
              <button
                type="button"
                className="search-toggle"
                style={styles.searchButton}
                onClick={toggleSearch}
              >
                <i className="ik ik-search"></i>
              </button>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={styles.searchInput}
              />
            </div>

            <button type="button" className="nav-link ml-2">
              <i className="ik ik-maximize"></i>
            </button>
          </div>

          <div className="top-menu d-flex align-items-center">
            <button className="btn btn-light ms-3" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </header>

      <div className="page-wrap">
        <div
          className="app-sidebar colored"
          style={{
            ...styles.appSidebar,
            ...(!sidebarOpen ? styles.sidebarCollapse : {})
          }}
        >
          <div className="sidebar-header">
            <a className="header-brand" href="#!" style={styles.headerBrand}>
              <span className="text" style={!sidebarOpen ? { display: 'none' } : { }}>BlueMoon</span>
            </a>
            <button
              type="button"
              className="nav-toggle"
              onClick={toggleSidebar}
              style={{ background: 'transparent', border: 'none', color: '#fff' }}
            >
              <i className={`ik toggle-icon ${sidebarOpen ? 'ik-toggle-right' : 'ik-toggle-left'}`}></i>
            </button>
            <button
              className="nav-close"
              onClick={toggleSidebar}
              style={{ background: 'transparent', border: 'none', color: '#fff' }}
            >
              <i className="ik ik-x"></i>
            </button>
          </div>

          <div className="sidebar-content ps ps--active-y">
            <nav id="main-menu-navigation" className="navigation-main">
              <div
                className="nav-lavel"
                style={{
                  ...styles.navLabel,
                  ...(!sidebarOpen ? { display: 'none' } : {})
                }}
              >
                Menu Cư Dân
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/resident"
                  end // Ensure exact match for "/resident"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Trang chủ'}
                >
                  <FaHome style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Trang chủ
                  </span>
                </NavLink>
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Tài khoản'}
                >
                  <FaUser style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Tài khoản
                  </span>
                </NavLink>
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/resident/complain"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Khiếu nại'}
                >
                  <FaFileAlt style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Khiếu nại
                  </span>
                </NavLink>
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/resident/announcement"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Thông báo'}
                >
                  <FaBell style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Thông báo
                  </span>
                </NavLink>
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/resident/parking"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Gửi xe'}
                >
                  <FaCar style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Gửi xe
                  </span>
                </NavLink>
              </div>

              <div className="nav-item" style={styles.navItem}>
                <NavLink
                  to="/resident/contribution"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(sidebarOpen ? styles.navLinkExpanded : styles.navLinkCollapsed),
                  })}
                  title={sidebarOpen ? '' : 'Đóng góp'}
                >
                  <FaHandHoldingHeart style={styles.icon} />
                  <span
                    style={{
                      ...styles.text,
                      ...(!sidebarOpen ? { display: 'none' } : {})
                    }}
                  >
                    Đóng góp
                  </span>
                </NavLink>
              </div>
            </nav>
          </div>
        </div>

        {/* Overlay for dimming effect when sidebar is expanded and not on mobile */}
        {sidebarOpen && !isMobile && (
          <div style={styles.overlay} onClick={toggleSidebar}></div>
        )}
      </div>
    </div>
  );
};

export default NavbarResident;