import { createContext, useContext, useState, useCallback } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const updateMobile = useCallback((mobile) => {
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(true);
  }, []);

  return (
    <LayoutContext.Provider value={{ 
      sidebarOpen, 
      isMobile, 
      toggleSidebar, 
      updateMobile 
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);