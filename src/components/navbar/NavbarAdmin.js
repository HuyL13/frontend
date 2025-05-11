import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useLayout } from '../../context/LayoutContext';
import userImg from './ronaldoo.jpg';
const NavbarAdmin = ({ username, handleLogout }) => {
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // Added state for search visibility




 
  // ... các state khác giữ nguyên
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Custom dropdown styles
  const dropdownStyles = {
    userDropdown: {
      position: 'absolute',
      right: 0,
      top: '100%',
      backgroundColor: '#fff',
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      borderRadius: '4px',
      minWidth: '200px',
      zIndex: 1001,
      opacity: showUserDropdown ? 1 : 0,
      visibility: showUserDropdown ? 'visible' : 'hidden',
      transition: 'all 0.3s ease',
    },
    dropdownItem: {
      padding: '12px 20px',
      color: '#333',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      '&:hover': {
        backgroundColor: '#f8f9fa',
      }
    },
    notificationDropdown: {
      position: 'absolute',
      right: 0,
      top: '100%',
      width: '350px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      borderRadius: '6px',
      zIndex: 1001,
      opacity: showNotiDropdown ? 1 : 0,
      visibility: showNotiDropdown ? 'visible' : 'hidden',
      transition: 'all 0.3s ease',
    },
    // ... thêm các style khác khi cần
  };
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
            
            {/* Notification Dropdown Custom */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  position: 'relative',
                  padding: '8px',
                  cursor: 'pointer',
                }}
              >
                <i ></i>
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                }}></span>
              </button>
              
              
            </div>

            {/* User Dropdown Custom */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <img
                  src={userImg}
                  alt="User profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    
                    border: '2px solid #1a237e',
                  }}
                />
              </button>
              
              {showUserDropdown && (
                <div style={dropdownStyles.userDropdown}>
                  <NavLink 
                    to="/account" 
                    style={dropdownStyles.dropdownItem}
                    activeStyle={{ backgroundColor: '#f8f9fa' }}
                  >
                    <i className="ik ik-user" style={{ width: '20px' }}></i>
                    <span>Profile</span>
                  </NavLink>
                  
                  <div style={{ 
                    height: '1px', 
                    backgroundColor: '#eee', 
                    margin: '8px 0' 
                  }}></div>
                  <button
                    onClick={handleLogout}
                    style={{
                      ...dropdownStyles.dropdownItem,
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ik ik-power" style={{ width: '20px' }}></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
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