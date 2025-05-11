import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useLayout } from '../../context/LayoutContext';
const NavbarAdmin = ({ username, handleLogout }) => {
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // Added state for search visibility

  // Thêm CSS styles để quản lý layout
  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '5vh',
    },
    
    headerTop: {
      position: 'fixed',
      left: sidebarOpen ? '250px' : '70px',
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
      top: 0,
      left: 0,
      height: '100vh',
      width: '250px',
      background: '#1a237e',
      color: '#fff',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      overflowY: 'auto',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    },
    sidebarCollapse: {
      width: '70px',
    },
    mainContent: {
      flexGrow: 1,
      marginLeft: '250px', // Phải bằng với chiều rộng sidebar
      paddingTop: '0px',
      paddingLeft: '20px',
      paddingRight: '20px',
      transition: 'all 0.3s ease',
      width: 'calc(100% - 250px)', // Phải đảm bảo tổng width và margin-left là 100%
    },
    expandedContent: {
      marginLeft: '70px', // Phải bằng với chiều rộng sidebar khi collapse
      width: 'calc(100% - 70px)', // Phải đảm bảo tổng width và margin-left là 100%
    },
    searchButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: '#555',
      marginRight: '10px',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
    },
    searchInput: {
      transition: 'all 0.3s ease',
      width: searchOpen ? '200px' : '0px',
      opacity: searchOpen ? 1 : 0,
      padding: searchOpen ? '8px 12px' : '0',
      overflow: 'hidden',
    },
  };
  

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 992;
      setIsMobile(mobileCheck);
      if (!mobileCheck) setSidebarOpen(true);  // Nếu không phải di động, mở sidebar
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);  // Đảo ngược trạng thái mở/đóng sidebar
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen); // Toggle search visibility
  };
  
  return (
    <div className="wrapper" style={styles.wrapper}>
      {/* Header cố định ở trên cùng */}
      <header className="header-top" style={styles.headerTop}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            {/* Left Section - Search & Toggle */}
            <div className="top-menu d-flex align-items-center">
              {/* Mobile Toggle Button */}
              <button 
                type="button" 
                className="btn-icon mobile-nav-toggle d-lg-none" 
                onClick={toggleSidebar}
                aria-label="Toggle navigation"
              >
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>

              {/* Search Box - Updated with toggle functionality */}
              <div className="d-flex" style={styles.searchContainer}>
                <button 
                  type="button" 
                  className="search-toggle" 
                  style={styles.searchButton}
                  onClick={toggleSearch}
                  aria-label="Toggle search"
                >
                  <i className="ik ik-search"></i>
                </button>
                <div className="header-search d-flex">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search..."
                      aria-label="Search"
                      style={styles.searchInput}
                    />
                    {searchOpen && (
                      <span className="input-group-addon search-btn">
                        <i className="ik ik-arrow-right"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <button 
                type="button" 
                id="navbar-fullscreen" 
                className="nav-link ml-2" 
                aria-label="Toggle fullscreen"
              >
                <i className="ik ik-maximize"></i>
              </button>
            </div>

      {/* Right Section - Icons */}
      <div className="top-menu d-flex align-items-center">
        {/* Notification Dropdown */}
        <div className="dropdown mx-2">
          <a
            className="nav-link dropdown-toggle"
            href="#!"
            role="button"
            id="notiDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="ik ik-bell"></i>
            <span className="badge bg-danger notification-badge">3</span>
          </a>
          <div className="dropdown-menu dropdown-menu-right notification-dropdown" aria-labelledby="notiDropdown">
            <div className="dropdown-header">
              <h4 className="mb-0">Notifications</h4>
            </div>
            <div className="notifications-wrap">
              {/* Notification Items */}
              <a href="#!" className="media">
                <span className="d-flex text-success">
                  <i className="ik ik-check"></i>
                </span>
                <span className="media-body">
                  <span className="heading-font-family">Invitation accepted</span>
                  <span className="media-content">Your have been invited to meeting</span>
                </span>
              </a>
              {/* Add more notifications */}
            </div>
            <div className="dropdown-footer">
              <a href="#!" className="text-primary">View all notifications</a>
            </div>
          </div>
        </div>

        {/* Messages Dropdown */}
        <button 
          type="button" 
          className="nav-link mx-2 position-relative" 
          aria-label="Messages"
        >
          <i className="ik ik-message-square"></i>
          <span className="badge bg-success message-badge">3</span>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="dropdown mx-2">
          <a
            className="nav-link dropdown-toggle"
            href="#!"
            role="button"
            id="quickActions"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="ik ik-plus"></i>
          </a>
          <div className="dropdown-menu dropdown-menu-right p-2">
            <div className="d-flex flex-wrap" style={{minWidth: '200px'}}>
              <a href="#!" className="dropdown-item">
                <i className="ik ik-bar-chart-2"></i>
                <span>Analytics</span>
              </a>
              {/* Add more quick actions */}
            </div>
          </div>
        </div>

        {/* Apps Modal Trigger */}
        <button 
          type="button" 
          className="nav-link mx-2" 
          aria-label="Apps"
          data-toggle="modal" 
          data-target="#appsModal"
        >
          <i className="ik ik-grid"></i>
        </button>

        {/* User Dropdown */}
        <div className="dropdown mx-2">
          <a
            className="dropdown-toggle user-toggle"
            href="#!"
            role="button"
            id="userDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img 
              className="avatar" 
              src="../img/user.jpg" 
              alt="User profile" 
              width="35" 
              height="35"
            />
          </a>
          <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
            <NavLink to="/account" className="dropdown-item">
              <i className="ik ik-user"></i>
              <span>Profile</span>
            </NavLink>
            <NavLink to="/settings" className="dropdown-item">
              <i className="ik ik-settings"></i>
              <span>Settings</span>
            </NavLink>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={handleLogout}>
              <i className="ik ik-power"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
          </div>
        </div>
      </header>

      {/* Container cho sidebar và nội dung chính */}
      <div className="page-wrap" >
        {/* Sidebar cố định bên trái */}
        <div 
          className="app-sidebar colored"
          style={{
            ...styles.appSidebar,
            ...((!sidebarOpen) ? styles.sidebarCollapse : {})
          }}
        >
          <div className="sidebar-header">
            <a className="header-brand" href="index.html">
              <span className="text" style={!sidebarOpen ? {display: 'none'} : {}}>BlueMoon</span>
            </a>
            {/* Nút toggle sidebar */}
            <button 
              type="button" 
              className="nav-toggle"
              onClick={toggleSidebar}
              style={{cursor: 'pointer', background: 'transparent', border: 'none'}}
            >
              <i 
                data-toggle="expanded" 
                className={`ik toggle-icon ${sidebarOpen ? 'ik-toggle-right' : 'ik-toggle-left'}`}
                style={{color: '#fff'}}
              ></i>
            </button>
            <button 
              id="sidebarClose" 
              className="nav-close" 
              onClick={toggleSidebar}
              style={{cursor: 'pointer', background: 'transparent', border: 'none', color: '#fff'}}
            >
              <i className="ik ik-x"></i>
            </button>
          </div>

          <div className="sidebar-content ps ps--active-y">
            <div className="nav-container">
              <nav id="main-menu-navigation" className="navigation-main">
                <div className="nav-lavel" style={!sidebarOpen ? {display: 'none'} : {}}>Quản lý chính</div>
                

                <div className="nav-item active">
                  <NavLink to="admin/notis" className="nav-link">
                    <i className="ik ik-bell" ></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Thông báo</span>
                  </NavLink>
                </div>

                <div className="nav-item active">
                  <NavLink to="admin/contribute" className="nav-link">
                    <i className="ik ik-heart" ></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Đóng góp</span>
                  </NavLink>
                </div>

                <div className="nav-item active">
                  <NavLink to="admin/vehicle" className="nav-link">
                    <i className="ik ik-star" ></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Bãi đỗ xe</span>
                  </NavLink>
                </div>

                <div className={`nav-item has-sub ${showAdminDropdown ? 'open' : ''}`}
                  onMouseEnter={() => !isMobile && setShowAdminDropdown(true)}
                  onMouseLeave={() => !isMobile && setShowAdminDropdown(false)}>
                  <a href="#!" className="nav-link">
                    <i className="ik ik-layers" style={{marginRight: '10px'}}></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Quản trị hệ thống</span>
                  </a>
                  <div 
                    className="submenu-content" 
                    style={!sidebarOpen ? {maxHeight: '0', overflow: 'hidden'} : {}}
                  >
                    <NavLink to="/admin/rooms" className="menu-item">Quản lý Phòng</NavLink>
                    <NavLink to="/admin/users" className="menu-item">Quản lý Người dùng</NavLink>
                    <NavLink to="/admin/fees" className="menu-item">Quản lí phí</NavLink>
                    <NavLink to="/admin/guests" className="menu-item">Phê duyệt</NavLink>
                    <NavLink to="/admin/reports" className="menu-item">Báo cáo</NavLink>
                  </div>
                </div>


                <div className="nav-item active">
                  <NavLink to="admin/complain" className="nav-link">
                    <i className="ik ik-headphones" ></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Khiếu nại</span>
                  </NavLink>
                </div>

                <div className="nav-lavel" style={!sidebarOpen ? {display: 'none'} : {}}>Cài đặt</div>
                <div className="nav-item">
                  <NavLink to="/settings" className="nav-link">
                    <i className="ik ik-settings" style={{marginRight: '10px'}}></i>
                    <span style={!sidebarOpen ? {display: 'none'} : {}}>Cấu hình hệ thống</span>
                  </NavLink>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content area would go here */}
      </div>
    </div>
  );
      
};

export default NavbarAdmin;