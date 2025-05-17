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
        const response = await fetch('https://backend-6w7s.onrender.com/demo/users/admin/guest', {
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
        `https://backend-6w7s.onrender.com/demo/users/admin/activate?email=${encodeURIComponent(email)}`,
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
      const response = await fetch(`https://backend-6w7s.onrender.com/demo/users/admin/guest/${guestId}`, {
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
    return <div className="loading">.</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="guest-management">
      
      
      <div>
  

  <div className="card table-card">
    <div className="card-header">
      <h3>Danh sách khách</h3>
      <div className="card-header-right">
        <ul className="list-unstyled card-option">
          <li><i className="ik ik-chevron-left action-toggle" /></li>
          <li><i className="ik ik-minus minimize-card" /></li>
          <li><i className="ik ik-x close-card" /></li>
        </ul>
      </div>
    </div>
    <div className="card-block">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
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
            {guests.length > 0 ? (
              guests.map(guest => {
                const status = activationStatus[guest.email] || {};
                return (
                  <tr key={guest.id}>
                    <td>{guest.id}</td>
                    <td>{guest.username}</td>
                    <td>{guest.lastName || 'N/A'}</td>
                    <td>{guest.email}</td>
                    <td>{new Date(guest.dob).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-icon"
                          onClick={() => handleActivate(guest.email)}
                          disabled={status.loading}
                          title="Kích hoạt"
                        >
                          {status.loading 
                            ? <i className="ik ik-loader f-16 text-primary" /> 
                            : <i className="ik ik-check f-16 text-success" />
                          }
                        </button>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleDelete(guest.id)}
                          title="Xóa khách"
                        >
                          <i className="ik ik-trash-2 f-16 text-danger" />
                        </button>
                      </div>
                      {status.message && (
                        <div
                          className={`status-message mt-2 ${
                            status.success ? 'success' : 'error'
                          }`}
                        >
                          {status.message}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Không có khách nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</div>
  );
};

export default GuestManagement;