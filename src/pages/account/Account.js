import React, { useEffect, useState } from 'react';

const Account = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:22986/demo/users/my-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log("1");
        
        console.log("1");
        const data = await response.json();
        console.log(data);
        if (data.code !== 0) {
          throw new Error('Lỗi trong response API');
        }

        setUserInfo(data.result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const getValueOrNull = (value) => (value ? value : "null");

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">Lỗi: {error}</div>;
  }

  if (!userInfo) {
    return <div>Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="account-container">
      <h1>Thông tin tài khoản</h1>
      
      <div className="user-info-section">
        <h2>Thông tin cá nhân</h2>
        <div className="info-row">
          <span className="info-label">Họ và tên:</span>
          <span className="info-value">{getValueOrNull(userInfo.lastName)} {getValueOrNull(userInfo.firstName)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{getValueOrNull(userInfo.email)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Ngày sinh:</span>
          <span className="info-value">
            {userInfo.dob ? new Date(userInfo.dob).toLocaleDateString('vi-VN') : "null"}
          </span>
        </div>
      </div>

      <div className="account-info-section">
        <h2>Thông tin tài khoản</h2>
        <div className="info-row">
          <span className="info-label">Tên đăng nhập:</span>
          <span className="info-value">{getValueOrNull(userInfo.username)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Vai trò:</span>
          <span className="info-value">
            {userInfo.roles && userInfo.roles.length > 0
              ? userInfo.roles.map(role => role.name).join(', ')
              : "null"}
          </span>
        </div>
      </div>

      <style jsx>{`
        .account-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.5rem;
        }

        .user-info-section, .account-info-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        h2 {
          color: #34495e;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
        }

        .info-label {
          flex: 0 0 200px;
          font-weight: 600;
          color: #7f8c8d;
        }

        .info-value {
          flex: 1;
          color: #2c3e50;
        }

        .loading-spinner {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
          color: #3498db;
        }

        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Account;
