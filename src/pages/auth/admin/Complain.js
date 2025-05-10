import React, { useEffect, useState } from 'react';
import { List, Button, Modal, Form, Input, Select, message, Spin, Table, Tag } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = 'http://localhost:22986/demo';

const Complain = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setError(null);
    } catch (err) {
      setError(err.message);
      message.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const handleResolve = async (values) => {
    console.log(values);
    try {
      const token = localStorage.getItem("authToken");
  
      // Tạo query-string từ object
      const params = new URLSearchParams({
        response: values.response,
        priority: values.priority,
        status: values.status,
      }).toString();
  
      const response = await fetch(
        `http://localhost:22986/demo/admin/complains/${selectedComplaint.id}/resolve?${params}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Một số API PUT qua query ko cần body, nên bỏ body đi
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
      priority: complaint.priority,
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Response',
      dataIndex: 'response',
      key: 'response',
      ellipsis: true,
      render: (response) => response || 'No response yet',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: 'Actions',
      key: 'actions',
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
      <div className="mb-4 flex space-x-4">
        <Select
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          placeholder="Filter by Status"
          className="w-40"
          allowClear
        >
          <Option value="WAITING">Waiting</Option>
          <Option value="IN_PROGRESS">In Progress</Option>
          <Option value="RESOLVED">Resolved</Option>
        </Select>

        <Select
          value={filters.priority}
          onChange={(value) => setFilters({ ...filters, priority: value })}
          placeholder="Filter by Priority"
          className="w-40"
          allowClear
        >
          <Option value="HIGH">High</Option>
          <Option value="MEDIUM">Medium</Option>
          <Option value="LOW">Low</Option>
        </Select>

        <Select
          value={filters.type}
          onChange={(value) => setFilters({ ...filters, type: value })}
          placeholder="Filter by Type"
          className="w-40"
          allowClear
        >
          <Option value="FACILITY">Facility</Option>
          <Option value="FEE">Fee</Option>
          <Option value="SECURITY">Security</Option>
        </Select>
      </div>

      {/* Complaints Table */}
      <Spin spinning={loading}>
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
        visible={isResolveModalVisible}
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