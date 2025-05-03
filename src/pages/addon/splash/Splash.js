import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/Splash.css";


const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/lobby");
    }, 2000); // Chuyển hướng sau 2 giây
  }, [navigate]);

  return (
    <div className="splash-container">
      <h1>Chào mừng đến với ứng dụng</h1>
    </div>
  );
};

export default Splash;
