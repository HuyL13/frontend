import React, { useEffect, useState } from 'react';
import '../../../styles/GuestManagement.css';

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activationStatus, setActivationStatus] = useState({});

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:22986/demo/users/admin/guest', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        const guestsData = Array.isArray(data) ? data : [];
        setGuests(guestsData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  const handleActivate = async (email) => {
    try {
      setActivationStatus(prev => ({
        ...prev,
        [email]: { loading: true, message: '' }
      }));

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:22986/demo/users/admin/activate?email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Activation failed');
      }

      setActivationStatus(prev => ({
        ...prev,
        [email]: { loading: false, message: 'Kích hoạt thành công!', success: true }
      }));

      // Refresh danh sách sau 2 giây
      setTimeout(() => {
        setGuests(prev => prev.filter(guest => guest.email !== email));
      }, 2000);

    } catch (err) {
      setActivationStatus(prev => ({
        ...prev,
        [email]: { loading: false, message: err.message, success: false }
      }));
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách này?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:22986/demo/users/admin/guest/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Xóa không thành công');
      }

      setGuests(prev => prev.filter(guest => guest.id !== guestId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="guest-management">
      <h2>Danh sách Khách</h2>
      
      {guests.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tài khoản</th>
              <th>Họ</th>
              <th>Email</th>
              <th>Ngày sinh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => {
              const status = activationStatus[guest.email] || {};
              return (
                <tr key={guest.id}>
                  <td>{guest.id}</td>
                  <td>{guest.username}</td>
                  <td>{guest.lastName || 'N/A'}</td>
                  <td>{guest.email}</td>
                  <td>{new Date(guest.dob).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="activate-btn"
                        onClick={() => handleActivate(guest.email)}
                        disabled={status.loading}
                      >
                        {status.loading ? 'Đang xử lý...' : 'Kích hoạt'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(guest.id)}
                      >
                        Xóa
                      </button>
                    </div>
                    {status.message && (
                      <div className={`status-message ${status.success ? 'success' : 'error'}`}>
                        {status.message}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-data">Không có khách nào</p>
      )}
    </div>
  );
};

export default GuestManagement;