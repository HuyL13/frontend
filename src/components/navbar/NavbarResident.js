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
    }
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
            <a className="header-brand" href="#!">
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
              <div className="nav-lavel" style={!sidebarOpen ? { display: 'none' } : { }}>Menu Cư Dân</div>

              <div className="nav-item">
                <NavLink to="/resident" className="nav-link">
                  <FaHome style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Trang chủ</span>
                </NavLink>
              </div>

              <div className="nav-item">
                <NavLink to="/account" className="nav-link">
                  <FaUser style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Tài khoản</span>
                </NavLink>
              </div>

              <div className="nav-item">
                <NavLink to="/resident/complain" className="nav-link">
                  <FaFileAlt style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Khiếu nại</span>
                </NavLink>
              </div>

              <div className="nav-item">
                <NavLink to="/resident/announcement" className="nav-link">
                  <FaBell style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Thông báo</span>
                </NavLink>
              </div>

              <div className="nav-item">
                <NavLink to="/resident/parking" className="nav-link">
                  <FaCar style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Gửi xe</span>
                </NavLink>
              </div>

              <div className="nav-item">
                <NavLink to="/resident/contribution" className="nav-link">
                  <FaHandHoldingHeart style={{ marginRight: '10px' }} />
                  <span style={!sidebarOpen ? { display: 'none' } : { }}>Đóng góp</span>
                </NavLink>
              </div>

            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarResident;