import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavbar } from "./NavbarContext";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setNavbarType } = useNavbar();

  const roleRoutes = {
    admin: ["/admin", "/dashboard"],
    user: ["/resident"],
    guest: ["/guest", "/join-resident"],
    user_admin: ["/admin/dashboard", "/resident"]
  };

  const commonAuthRoutes = ["/settings", "/account"];

  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || {
      isAuthenticated: false,
      roles: ["GUEST"],
      info: null
    };
    return savedUser;
  });

  // Hàm chuẩn hóa danh sách vai trò: nếu role là object, lấy role.name; nếu là chuỗi, giữ nguyên.
  const normalizeRoles = (roles) => {
    console.log("Raw roles from storage:", roles);
    if (!Array.isArray(roles)) {
      return [String(roles).toUpperCase()];
    }
    return roles
      .map(role =>
        typeof role === "object" && role.name
          ? role.name.toUpperCase()
          : String(role).toUpperCase()
      )
      .filter(role => ["ADMIN", "USER", "GUEST"].includes(role));
  };

  useEffect(() => {
    const savedRoles = JSON.parse(localStorage.getItem("roles")) || ["GUEST"];
    console.log("Saved roles from localStorage:", savedRoles);
    const normalizedRoles = normalizeRoles(savedRoles);
    setUser(prev => ({
      ...prev,
      roles: normalizedRoles,
      isAuthenticated: normalizedRoles.length > 0 && !normalizedRoles.includes("GUEST")
    }));
  }, []);

  // Trả về danh sách vai trò chính dưới dạng mảng (ví dụ: ["admin", "user"])
  const determineMainRole = (roles) => {
    console.log("All roles:", roles);
    if (!Array.isArray(roles)) return ["guest"];

    let mainRoles = [];
    if (roles.includes("ADMIN")) mainRoles.push("admin");
    if (roles.includes("USER")) mainRoles.push("user");
    if (mainRoles.length === 0) mainRoles.push("guest");

    return mainRoles;
  };

  const getAllowedRoutes = (roles) => {
    const mainRoles = determineMainRole(roles);
    console.log("Determined main roles:", mainRoles);
    const combinedRoutes = mainRoles.flatMap(role => roleRoutes[role] || []);
    return [...new Set([...combinedRoutes, ...commonAuthRoutes])];
  };

  useEffect(() => {
    console.log("Current user roles:", user.roles);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.isAuthenticated) {
      let navbarRoles = determineMainRole(user.roles);
      console.log("Navbar type set to:", navbarRoles);
      setNavbarType(navbarRoles);
    } else {
      setNavbarType("default");
    }
  }, [user, setNavbarType]);

  useEffect(() => {
    const currentPath = location.pathname;
    const publicRoutes = ["/login", "/signup","/forgot","/otp","/reset", "/lobby", "/"];

    if (user.isAuthenticated) {
      if (["/login", "/signup","/forgot","/otp","/reset"].includes(currentPath)) {
        navigate(getAllowedRoutes(user.roles)[0] || "/", { replace: true });
        return;
      }

      const allowedRoutes = getAllowedRoutes(user.roles);
      const isAllowed = allowedRoutes.some(route => currentPath.startsWith(route));

      if (!isAllowed) {
        navigate("/404", { replace: true });
      }
    } else {
      if (!publicRoutes.includes(currentPath)) {
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  const login = (roles, redirectUrl) => {
    const normalizedRoles = normalizeRoles(roles);
    const targetPath = redirectUrl || getAllowedRoutes(normalizedRoles)[0] || "/";

    localStorage.setItem("roles", JSON.stringify(normalizedRoles));

    setUser({
      isAuthenticated: true,
      roles: normalizedRoles,
      info: null
    });

    navigate(targetPath, { replace: true });
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      roles: ["GUEST"],
      info: null
    });
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ ...user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
