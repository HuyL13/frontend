import { createContext, useContext, useState, useEffect } from "react";

export const NavbarContext = createContext(null);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    console.error("NavbarContext is null. Ensure NavbarProvider wraps AuthProvider.");
    return { navbarType: "default", setNavbarType: () => {} };
  }
  return context;
};

export const NavbarProvider = ({ children }) => {
  const [navbarType, setNavbarType] = useState(() => {
    return localStorage.getItem("navbarType") || "default";
  });

  useEffect(() => {
    localStorage.setItem("navbarType", navbarType);
  }, [navbarType]);

  return (
    <NavbarContext.Provider value={{ navbarType, setNavbarType }}>
      {children}
    </NavbarContext.Provider>
  );
};
