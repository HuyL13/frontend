import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import { NavbarProvider } from "./context/NavbarContext"; 
import { LayoutProvider } from './context/LayoutContext';
import NavbarSelector from "./components/NavbarSelector";
import ProtectedRoute from "./routes/ProtectedRoute";

import Account from "./pages/account/Account";
import Admin from "./pages/auth/admin/Admin";
import UserManagement from "./pages/auth/admin/UserManagement";
import GuestManagement from "./pages/auth/admin/GuestManagement";
import FeeManagement from "./pages/auth/admin/FeeManagement";
import Notifications from "./pages/auth/admin/Notifications";
import Complain from "./pages/auth/admin/Complain";
import Contribute from "./pages/auth/admin/Contribute";
import Vehicle from "./pages/auth/admin/Vehicle";

import Guest from "./pages/auth/guest/Guest";
import Resident from "./pages/auth/resident/Resident";
import Settings from "./pages/addon/settings/Settings";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";

import Forgot from "./components/views/login/Forgot";
import OTPSent from "./components/views/login/OTPSent";
import Reset from "./components/views/login/Reset";
import Splash from "./pages/addon/splash/Splash";
import Waiting from "./pages/addon/waiting/Waiting";
import NotFoundPage from "./pages/notfound/404";
import Lobby from "./pages/lobby/Lobby";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div>  {/* ✅ Bọc App trong div để tránh lỗi Bootstrap layout */}
    <LayoutProvider>
      <NavbarSelector />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/otp" element={<OTPSent />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/waiting" element={<Waiting />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Bảo vệ các trang yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/admin/rooms" element={<Admin />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/guests" element={<GuestManagement />} />
          <Route path="/admin/fees" element={<FeeManagement />} />
          <Route path="/admin/notis" element={<Notifications />} />
          <Route path="/admin/complain" element={<Complain />} />
          <Route path="/admin/contribute" element={<Contribute />} />
          <Route path="/admin/vehicle" element={<Vehicle />} />

          <Route path="/resident" element={<Resident />} />
        </Route>
      </Routes>
      </LayoutProvider>
    </div>
  );
}

export default App;
