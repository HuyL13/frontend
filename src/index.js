import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import { NavbarProvider } from "./context/NavbarContext"; 
import App from "./App";
import reportWebVitals from "./reportWebVitals";


// Import thư viện và CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./scss/auth.scss";
import "./scss/theme.scss";
import "./css/theme.min.css"; // Chỉ cần một phiên bản CSS (min hoặc không)

// Import jQuery nếu cần (chỉ khi sử dụng các thư viện yêu cầu jQuery như bootstrap-tagsinput)
import $ from "jquery";
window.$ = window.jQuery = $;

// Import tất cả các file JS và CSS trong thư mục plugin
const importAll = (requireContext) => requireContext.keys().forEach(requireContext);
importAll(require.context("./plugins", true, /\.(js|css)$/)); // Đảm bảo chỉ các file JS và CSS được import

// Tạo root và render ứng dụng
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <NavbarProvider>
          <App />
        </NavbarProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

// Đo lường hiệu suất của ứng dụng (tuỳ chọn)
reportWebVitals();
