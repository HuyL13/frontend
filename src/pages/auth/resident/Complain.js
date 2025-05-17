import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Spin, Tag, InputNumber, Upload } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../../../css/theme.min.css';
import '../../../plugins/fontawesome-free/css/all.min.css';
import '../../../plugins/icon-kit/dist/css/iconkit.min.css';

const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = 'https://backend-6w7s.onrender.com/demo';

const Complain = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [addUserForm] = Form.useForm();
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch user's complaints with userIds
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`${API_BASE_URL}/complains/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể tải danh sách khiếu nại');
      }

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openDetailsModal = (userIds) => {
    if (userIds && userIds.length > 0) {
      setSelectedUserIds(userIds);
      setDetailsLoading(false); // No API call, so no loading
      setIsDetailsModalVisible(true);
    } else {
      message.info('Không có người dùng nào được thêm vào khiếu nại này');
    }
  };

  // Handle creating a new complaint
  const handleCreate = async (values) => {
    const formData = new FormData();
    formData.append('description', values.description);
    formData.append('type', values.type);
    if (values.attachment && values.attachment.length > 0) {
      formData.append('attachment', values.attachment[0].originFileObj);
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`${API_BASE_URL}/complains`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Không thể tạo khiếu nại (Mã lỗi: ${response.status})`);
      }

      message.success('Tạo khiếu nại thành công');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchComplaints();
    } catch (err) {
      message.error(err.message || 'Lỗi khi tạo khiếu nại');
    }
  };

  // Handle adding a user to a complaint
  const handleAddUser = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(
        `${API_BASE_URL}/complains/${selectedComplaintId}/add-user?userId=${values.userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Không thể thêm người dùng (Mã lỗi: ${response.status})`);
      }

      message.success('Thêm người dùng thành công');
      setIsAddUserModalVisible(false);
      addUserForm.resetFields();
      fetchComplaints();
    } catch (err) {
      message.error(err.message || 'Lỗi khi thêm người dùng');
    }
  };

  const openAddUserModal = (id) => {
    setSelectedComplaintId(id);
    setIsAddUserModalVisible(true);
  };

  // Render status tags
  const getStatusTag = (status) => {
    switch (status) {
      case 'WAITING':
        return <Tag color="blue">Đang Chờ</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="orange">Đang Xử Lý</Tag>;
      case 'RESOLVED':
        return <Tag color="green">Đã Giải Quyết</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Render type tags
  const getTypeTag = (type) => {
    switch (type) {
      case 'FACILITY':
        return <Tag color="purple">Cơ Sở Vật Chất</Tag>;
      case 'FEE':
        return <Tag color="cyan">Phí</Tag>;
      case 'SECURITY':
        return <Tag color="magenta">An Ninh</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Chi Tiết',
      key: 'details',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => openDetailsModal(record.userIds)}
          className="text-blue-500"
          icon={<InfoCircleOutlined />}
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => openAddUserModal(record.id)}
          className="text-blue-500"
        >
          Thêm Người Dùng
        </Button>
      ),
    },
  ];

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100, // Set a fixed width to prevent overflow
    },
  ];

  // Custom file upload props
  const uploadProps = {
    beforeUpload: () => false, // Prevent automatic upload
    maxCount: 1,
    accept: 'image/*,.pdf',
  };

  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="container-fluid">
          <div className="page-header">
            <div className="row align-items-end">
              <div className="col-lg-8">
                <div className="page-header-title">
                  <i className="ik ik-edit bg-blue"></i>
                  <div className="d-inline">
                    <h5>Quản Lý Khiếu Nại</h5>
                    <span>Quản lý và tạo khiếu nại của bạn</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <nav className="breadcrumb-container" aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a href="#"><i className="ik ik-home"></i></a>
                    </li>
                    <li className="breadcrumb-item active">Complaints</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="m-0">Danh Sách Khiếu Nại</h3>
              <Button
                type="primary"
                onClick={() => setIsCreateModalVisible(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <i className="ik ik-plus"></i> Tạo Khiếu Nại
              </Button>
            </div>
            <div className="card-body">
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={complaints}
                  rowKey="id"
                  bordered
                  pagination={{ pageSize: 10 }}
                />
              </Spin>
            </div>
          </div>
        </div>
      </div>

      {/* Create Complaint Modal */}
      <Modal
        title="Tạo Khiếu Nại Mới"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả!' },
              { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' },
            ]}
          >
            <TextArea
              rows={4}
              showCount
              maxLength={500}
              placeholder="Mô tả vấn đề của bạn..."
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại Khiếu Nại"
            rules={[{ required: true, message: 'Vui lòng chọn loại khiếu nại!' }]}
          >
            <Select placeholder="Chọn loại khiếu nại">
              <Option value="FACILITY">Cơ Sở Vật Chất</Option>
              <Option value="FEE">Phí</Option>
              <Option value="SECURITY">An Ninh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="attachment"
            label="Đính Kèm Tệp (Tùy Chọn)"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Chọn Tệp</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600">
                Gửi Khiếu Nại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title={`Thêm Người Dùng vào Khiếu Nại #${selectedComplaintId}`}
        visible={isAddUserModalVisible}
        onCancel={() => setIsAddUserModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={addUserForm}
          onFinish={handleAddUser}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="userId"
            label="ID Người Dùng"
            rules={[{ required: true, message: 'Vui lòng nhập ID người dùng!' }]}
          >
            <InputNumber min={1} placeholder="Nhập ID người dùng" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsAddUserModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600">
                Thêm Người Dùng
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title="Danh Sách ID Người Dùng"
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        destroyOnClose
        width={400} // Increase modal width to fit content
      >
        <Spin spinning={detailsLoading}>
          <Table
            columns={userColumns}
            dataSource={selectedUserIds.map(id => ({ id }))}
            rowKey="id"
            bordered
            pagination={false}
            scroll={{ x: 'max-content' }} // Enable horizontal scrolling if needed
            locale={{ emptyText: 'Không có người dùng nào được thêm' }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default Complain;