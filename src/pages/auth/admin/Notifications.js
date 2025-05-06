import React, { useEffect, useState } from 'react';
import { List, Button, Modal, Form, Input, Select, message, Spin, Table, Tag } from 'antd';

const { Option } = Select;
const API_BASE_URL = 'http://localhost:22986/demo';

const Notifications = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSendSpecificModalVisible, setIsSendSpecificModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [createForm] = Form.useForm();
  const [sendSpecificForm] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      message.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:22986/demo/users/admin", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(data.message || "Server returned error code");
      }
  
      const receivedUsers = data.result || [];
      
      if (!Array.isArray(receivedUsers)) {
        throw new Error("Invalid users data format from server");
      }
  
      const formattedUsers = receivedUsers.map(user => ({
        ...user,
        firstName: user.firstName || "N/A",
        lastName: user.lastName || "N/A",
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        dob: user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"
      }));
  
      setUsers(formattedUsers);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error('Failed to fetch users: ' + err.message);
      setUsers([]); 
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateAnnouncement = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/announcements/create`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      message.success('Announcement created successfully');
      await fetchAnnouncements();
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (err) {
      console.error('Error creating announcement:', err);
      message.error(err.message || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/announcements/delete/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      message.success('Announcement deleted successfully');
      await fetchAnnouncements();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSendToAll = async (announcement) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/announcements/sendToAll`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: announcement.description,
          type: announcement.type
        }),
      });

      if (!response.ok) throw new Error('Failed to send announcement');
      
      message.success('Announcement sent to all users successfully');
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSendToSpecific = async (values) => {
    try {
      if (selectedUserIds.length === 0) {
        message.error('Please select at least one user');
        return;
      }
      
      const token = localStorage.getItem("authToken");
      // Create the payload exactly as specified in the API documentation
      const payload = {
        description: values.description,
        type: values.type,
        users: selectedUserIds.map(id => Number(id))
      };
      
      const response = await fetch(`${API_BASE_URL}/admin/announcements/sendToSpecific`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      message.success('Announcement sent to selected users successfully');
      setIsSendSpecificModalVisible(false);
      sendSpecificForm.resetFields();
      setSelectedUserIds([]);
    } catch (err) {
      console.error('Error sending to specific users:', err);
      message.error(err.message || 'Failed to send specific announcement');
    }
  };

  const openSendSpecificModal = () => {
    fetchUsers();
    setIsSendSpecificModalVisible(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'INFORMATION': return 'text-blue-500';
      case 'WARNING': return 'text-yellow-500';
      case 'URGENT': return 'text-red-500';
      case 'MAINTENANCE': return 'text-orange-500';
      case 'EVENT': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeTag = (type) => {
    switch (type) {
      case 'INFORMATION': return <Tag color="blue">{type}</Tag>;
      case 'WARNING': return <Tag color="yellow">{type}</Tag>;
      case 'URGENT': return <Tag color="red">{type}</Tag>;
      case 'MAINTENANCE': return <Tag color="orange">{type}</Tag>;
      case 'EVENT': return <Tag color="green">{type}</Tag>;
      default: return <Tag color="default">{type}</Tag>;
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const numericIds = selectedRows.map(user => Number(user.id));
      setSelectedUserIds(numericIds);
    },
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
  ];

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        
        <div className="space-x-2">
          <Button 
            type="primary" 
            onClick={() => setIsCreateModalVisible(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create New Announcement
          </Button>
          <Button 
            onClick={openSendSpecificModal}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Send to Specific Users
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <List
          itemLayout="horizontal"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => handleSendToAll(item)}
                  className="text-blue-500"
                >
                  Send to All
                </Button>,
                <Button 
                  type="link" 
                  danger 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500"
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center">
                    {getTypeTag(item.type)}
                    <span className={`ml-2 font-semibold ${getTypeColor(item.type)}`}>
                      Announcement #{item.id}
                    </span>
                  </div>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Spin>

      {/* Create Announcement Modal */}
      <Modal
        title="Create New Announcement"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          onFinish={handleCreateAnnouncement}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please input description!' },
              { max: 500, message: 'Description cannot exceed 500 characters!' }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              showCount 
              maxLength={500} 
              placeholder="Enter announcement content..."
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select
              placeholder="Select announcement type"
              className="w-full"
            >
              <Option value="INFORMATION">Information</Option>
              <Option value="WARNING">Warning</Option>
              <Option value="URGENT">Urgent</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="EVENT">Event</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Send to Specific Users Modal */}
      <Modal
        title="Send Announcement to Specific Users"
        visible={isSendSpecificModalVisible}
        onCancel={() => setIsSendSpecificModalVisible(false)}
        footer={null}
        destroyOnClose
        width={800}
      >
        <Form
          form={sendSpecificForm}
          onFinish={handleSendToSpecific}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please input description!' },
              { max: 500, message: 'Description cannot exceed 500 characters!' }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              showCount 
              maxLength={500} 
              placeholder="Enter announcement content..."
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select
              placeholder="Select announcement type"
              className="w-full"
            >
              <Option value="INFORMATION">Information</Option>
              <Option value="WARNING">Warning</Option>
              <Option value="URGENT">Urgent</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="EVENT">Event</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Select Users"
            help={`Selected ${selectedUserIds.length} users`}
            required
          >
            <Spin spinning={loadingUsers}>
              <Table
                rowSelection={{
                  type: 'checkbox',
                  ...rowSelection,
                }}
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 240 }}
              />
            </Spin>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsSendSpecificModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600"
                disabled={selectedUserIds.length === 0}
              >
                Send to {selectedUserIds.length} users
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;