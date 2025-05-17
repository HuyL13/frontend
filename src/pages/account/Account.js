import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const Account = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [passwordError, setPasswordError] = useState(''); // New state for password error
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Không tìm thấy token xác thực');
        const response = await fetch('https://backend-6w7s.onrender.com/demo/users/my-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code !== 0) {
          throw new Error(data.message || 'Lỗi trong response API');
        }

        const dob = data.result.dob ? moment(data.result.dob).format('YYYY-MM-DD') : '';
        setUserInfo(data.result);
        form.setFieldsValue({
          ...data.result,
          dob,
          residencyStatus: data.result.residencyStatus || 'THUONG_TRU',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [form]);

  const getValueOrDash = (value) => (value ? value : '-');

  const handleVerifyPassword = async (values) => {
    try {
      if (!userInfo?.username) {
        message.error('Không thể xác thực: Thiếu thông tin tên đăng nhập');
        return;
      }

      setPasswordError(''); // Clear previous error
      const response = await fetch('https://backend-6w7s.onrender.com/demo/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userInfo.username,
          password: values.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.code !== 0) {
        // Set error for incorrect password
        if (data.message && data.message.toLowerCase().includes('invalid') || response.status === 401) {
          setPasswordError('Mật khẩu bạn nhập không đúng');
        } else {
          message.error(data.message || 'Lỗi khi xác thực mật khẩu');
        }
        return;
      }

      setVerifiedPassword(values.password);
      setIsPasswordModalVisible(false);
      setIsEditModalVisible(true);
      form.setFieldsValue({ password: values.password });
    } catch (err) {
      console.error('Password verification error:', err);
      message.error('Lỗi khi xác thực mật khẩu: ' + err.message);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = userInfo?.id;
      if (!token || !userId) {
        message.error('Không thể cập nhật: Thiếu thông tin xác thực hoặc ID người dùng');
        return;
      }

      const updatedValues = {
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        email: values.email || null,
        dob: values.dob ? moment(values.dob).format('YYYY-MM-DD') : null,
        residencyStatus: values.residencyStatus || null,
        password: values.password || null,
      };

      const response = await fetch(`https://backend-6w7s.onrender.com/demo/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedValues),
      });

      const data = await response.json();
      if (!response.ok || data.code !== 0) {
        throw new Error(data.message || `Cập nhật thất bại (Mã lỗi: ${response.status})`);
      }

      setUserInfo((prev) => ({ ...prev, ...updatedValues }));
      setIsEditModalVisible(false);
      setVerifiedPassword('');
      message.success('Cập nhật thông tin thành công');
    } catch (err) {
      console.error('Update error:', err);
      message.error(err.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    }
    if (value.length < 9) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 9 ký tự!'));
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất một chữ hoa!'));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất một ký tự đặc biệt!'));
    }
    return Promise.resolve();
  };

  if (loading) {
    return <div className="text-center py-5 text-primary">Đang tải...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center my-5">Lỗi: {error}</div>;
  }

  if (!userInfo) {
    return <div className="alert alert-warning text-center my-5">Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0" style={{ fontSize: '24px' }}>Thông tin tài khoản</h4>
          <Button type="primary" onClick={() => setIsPasswordModalVisible(true)}>
            Sửa thông tin
          </Button>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Họ và tên
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {getValueOrDash(userInfo.lastName)} {getValueOrDash(userInfo.firstName)}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Email
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {getValueOrDash(userInfo.email)}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Ngày sinh
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {userInfo.dob ? new Date(userInfo.dob).toLocaleDateString('vi-VN') : '-'}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Tên đăng nhập
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {getValueOrDash(userInfo.username)}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Trạng thái cư trú
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {getValueOrDash(userInfo.residencyStatus)}
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 font-weight-bold text-muted" style={{ fontSize: '18px' }}>
              Vai trò
            </div>
            <div className="col-md-8" style={{ fontSize: '18px' }}>
              {userInfo.roles?.length
                ? userInfo.roles.map((role) => role.name).join(', ')
                : '-'}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Xác thực mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          setPasswordError(''); // Clear error when closing modal
        }}
        footer={null}
        destroyOnClose
        width={400}
        style={{ top: 20 }}
      >
        <Form form={passwordForm} onFinish={handleVerifyPassword} layout="vertical" autoComplete="off">
          <Form.Item
            name="password"
            label="Mật khẩu hiện tại"
            validateStatus={passwordError ? 'error' : ''}
            help={passwordError || ''}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Xác nhận
            </Button>
            <Button
              onClick={() => {
                setIsPasswordModalVisible(false);
                setPasswordError(''); // Clear error when canceling
              }}
              className="ms-2"
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sửa thông tin"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setVerifiedPassword('');
        }}
        footer={null}
        destroyOnClose
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={form} onFinish={handleUpdateUser} layout="vertical" autoComplete="off">
          <Form.Item
            name="lastName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="firstName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh!' },
              {
                validator: (_, value) => {
                  if (value && moment().diff(moment(value), 'years') < 18) {
                    return Promise.reject(new Error('Bạn phải đủ 18 tuổi!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <input
              type="date"
              className="form-control"
              value={form.getFieldValue('dob') || ''}
              onChange={(e) => form.setFieldsValue({ dob: e.target.value })}
              max={moment().format('YYYY-MM-DD')}
            />
          </Form.Item>
          <Form.Item
            name="residencyStatus"
            label="Trạng thái cư trú"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái cư trú!' }]}
          >
            <Select>
              <Option value="THUONG_TRU">Thường trú</Option>
              <Option value="TAM_TRU">Tạm trú</Option>
              <Option value="TAM_VANG">Tạm vắng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ validator: validatePassword }]}
            help="Mật khẩu phải có ít nhất 9 ký tự, ít nhất một chữ hoa, ít nhất một ký tự đặc biệt (ví dụ: !@#$%^&*(),.?)."
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
            <Button
              onClick={() => {
                setIsEditModalVisible(false);
                setVerifiedPassword('');
              }}
              className="ms-2"
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Account;