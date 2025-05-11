import React, { useEffect, useState } from 'react';
import { List, Button, Modal, Form, Input, Select, message, Spin, Table, Tag, Avatar, Tooltip } from 'antd';

const { Option, OptGroup } = Select;
const { TextArea } = Input;
const API_BASE_URL = 'https://backend-13-6qob.onrender.com/demo';

const Complain = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isResolveModalVisible, setIsResolveModalVisible] = useState(false);
  const [resolveForm] = Form.useForm();

  // Fetch complaints based on filters
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.type) queryParams.append('type', filters.type);

      const response = await fetch(`${API_BASE_URL}/admin/complains?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      
      const data = await response.json();
      setComplaints(data);
      
      // Fetch user details for all unique userIds
      await fetchAllUserDetails(data);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      message.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all user details for the complaints
  const fetchAllUserDetails = async (complaints) => {
    setUsersLoading(true);
    
    // Extract all unique userIds from complaints
    const allUserIds = new Set();
    complaints.forEach(complaint => {
      if (complaint.userIds && Array.isArray(complaint.userIds)) {
        complaint.userIds.forEach(userId => allUserIds.add(userId));
      }
    });
    
    // Fetch details for each user not already in the cache
    const userIdsToFetch = [...allUserIds].filter(id => !users[id]);
    if (userIdsToFetch.length === 0) {
      setUsersLoading(false);
      return;
    }
    
    try {
      const newUsers = { ...users };
      await Promise.all(
        userIdsToFetch.map(async (userId) => {
          const userData = await fetchUserDetails(userId);
          if (userData) {
            newUsers[userId] = userData;
          }
        })
      );
      
      setUsers(newUsers);
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch user details by ID
  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.message || "Failed to fetch user details");
      }
      
      return data.result;
    } catch (error) {
      console.error(`Failed to fetch user details for ID ${userId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const handleResolve = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
  
      // Create query-string from object
      const params = new URLSearchParams({
        response: values.response,
        priority: values.priority,
        status: values.status,
      }).toString();
  
      const response = await fetch(
        `${API_BASE_URL}/admin/complains/${selectedComplaint.id}/resolve?${params}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
  
      message.success('Complaint updated successfully');
      setIsResolveModalVisible(false);
      fetchComplaints();
    } catch (err) {
      console.error('Error resolving complaint:', err);
      message.error(err.message || 'Failed to update complaint');
    }
  };
  
  // Handle delete complaint
  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this complaint?');
    if (!ok) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/complains/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.status === 204) {
        message.success('Complaint deleted successfully');
        setComplaints(complaints.filter(complaint => complaint.id !== id));
      } else {
        throw new Error('Failed to delete complaint');
      }
    } catch (err) {
      message.error(err.message);
    }
  };

  const openResolveModal = (complaint) => {
    setSelectedComplaint(complaint);
    resolveForm.setFieldsValue({
      response: complaint.response || '',
      priority: complaint.prior,
      status: complaint.status
    });
    setIsResolveModalVisible(true);
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'HIGH': return <Tag color="red">{priority}</Tag>;
      case 'MEDIUM': return <Tag color="orange">{priority}</Tag>;
      case 'LOW': return <Tag color="green">{priority}</Tag>;
      default: return <Tag color="default">{priority}</Tag>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'WAITING': return <Tag color="blue">{status}</Tag>;
      case 'IN_PROGRESS': return <Tag color="orange">{status}</Tag>;
      case 'RESOLVED': return <Tag color="green">{status}</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const getTypeTag = (type) => {
    switch (type) {
      case 'FACILITY': return <Tag color="purple">{type}</Tag>;
      case 'FEE': return <Tag color="cyan">{type}</Tag>;
      case 'SECURITY': return <Tag color="magenta">{type}</Tag>;
      default: return <Tag color="default">{type}</Tag>;
    }
  };

  // Render user tags for each complaint
  const renderUserTags = (userIds) => {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return <span className="text-gray-500">No users</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {userIds.map(userId => {
          const user = users[userId];
          if (!user) {
            return (
              <Tag key={userId} color="default">
                ID: {userId}
              </Tag>
            );
          }
          
          return (
            <Tooltip key={userId} title={`${user.firstName} ${user.lastName} (${user.email})`}>
              <Tag color="blue" className="flex items-center">
                <span className="mr-1">
                  {user.avatarUrl ? (
                    <Avatar src={user.avatarUrl} size="small" />
                  ) : (
                    <Avatar size="small">{user.firstName?.[0]}</Avatar>
                  )}
                </span>
                <span>{user.firstName} {user.lastName}</span>
              </Tag>
            </Tooltip>
          );
        })}
      </div>
    );
  };

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: '6%',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: '15%',
  },
  {
    title: 'Response',
    dataIndex: 'response',
    key: 'response',
    ellipsis: true,
    width: '12%',
    render: (response) => response || 'No response yet',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '10%',
    render: (status) => getStatusTag(status),
  },
  {
    title: 'Priority',
    dataIndex: 'prior',
    key: 'priority',
    width: '12%',
    render: (priority) => getPriorityTag(priority),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: '10%',
    render: (type) => getTypeTag(type),
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: '8%',
    render: (date) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Users',
    dataIndex: 'userIds',
    key: 'userIds',
    width: '13%',
    render: renderUserTags,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '13%',
    render: (_, record) => (
      <span className="space-x-2">
        <Button 
          type="link"
          onClick={() => openResolveModal(record)}
          className="text-blue-500"
        >
          Edit/Resolve
        </Button>
        <Button 
          type="link" 
          danger
          onClick={() => handleDelete(record.id)}
          className="text-red-500"
        >
          Delete
        </Button>
      </span>
    ),
  },
];

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Complaint Management</h1>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Filter Complaints</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Status&nbsp;&nbsp;</label>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              placeholder="All Statuses"
              className="w-40"
              allowClear
            > 
              <Option value="WAITING">Waiting</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Priority</label>
            <Select
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
              placeholder="All Priorities"
              className="w-40"
              allowClear
            > 
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Type&nbsp;&nbsp;&nbsp;&nbsp;</label>

            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              placeholder="All Types"
              className="w-40"
              allowClear
            >
              <Option value="FACILITY">Facility</Option>
              <Option value="FEE">Fee</Option>
              <Option value="SECURITY">Security</Option>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              type="primary" 
              className="bg-blue-500 hover:bg-blue-600" 
              onClick={() => fetchComplaints()}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Complaints Table */}
      <Spin spinning={loading || usersLoading}>
        <Table
          columns={columns}
          dataSource={complaints}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      {/* Resolve/Edit Modal */}
      <Modal
        title={`Update Complaint #${selectedComplaint?.id || ''}`}
        open={isResolveModalVisible}
        onCancel={() => setIsResolveModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={resolveForm}
          onFinish={handleResolve}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="response"
            label="Admin Response"
            rules={[
              { required: true, message: 'Please input your response!' },
              { max: 500, message: 'Response cannot exceed 500 characters!' }
            ]}
          >
            <TextArea 
              rows={4} 
              showCount 
              maxLength={500} 
              placeholder="Enter your response..."
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority!' }]}
          >
            <Select placeholder="Select priority">
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="RESOLVED">Resolved</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="WAITING">Waiting</Option>
            </Select>
          </Form.Item>

          {selectedComplaint && selectedComplaint.userIds && selectedComplaint.userIds.length > 0 && (
            <Form.Item label="Tagged Users">
              {renderUserTags(selectedComplaint.userIds)}
            </Form.Item>
          )}

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsResolveModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Complain;