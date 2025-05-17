import React, { useEffect, useState } from 'react';
import { Card, Spin, message, Tag } from 'antd';
import '../../../styles/Announcement.css';

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gán màu cho từng loại thông báo
  const getTagColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'information':
        return 'blue';
      case 'warning':
        return 'red';
      case 'urgent':
        return 'orange';
      case 'maintainance':
        return 'gold';
      case 'event':
        return 'green';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Không tìm thấy token xác thực');

        const response = await fetch('https://backend-6w7s.onrender.com/demo/announcements', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Phản hồi từ API không phải JSON hợp lệ: ' + text);
        }

        if (!response.ok) {
          throw new Error(data.message || `Lỗi khi tải thông báo (Mã lỗi: ${response.status})`);
        }

        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu trả về không phải là danh sách thông báo');
        }

        // Sắp xếp từ mới đến cũ theo createdAt nếu có
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(sortedData);
      } catch (err) {
        setError(err.message);
        message.error(err.message || 'Lỗi khi tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="announcement-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcement-container">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="announcement-container">
        <h2 className="announcement-title">Thông Báo Chung Cư</h2>
        <div className="alert alert-info text-center">Hiện tại không có thông báo nào.</div>
      </div>
    );
  }

  return (
    <div className="announcement-container">
      <h2 className="announcement-title">Thông Báo Chung Cư</h2>
      <div className="announcement-list">
        {announcements.map((a) => (
          <Card
            key={a.id}
            className="announcement-card"
            title={<Tag color={getTagColor(a.type)}>{a.type || 'Thông báo'}</Tag>}
          >
            <p className="announcement-content">
              {a.description || 'Không có nội dung'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcement;