import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Upload, 
  notification 
} from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../../../styles/FeeManagement.css';

const { Column } = Table;
const { Option } = Select;

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();

  // Fetch all fees
  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:22986/demo/admin/fees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch fees');
      const data = await response.json();
      setFees(data);
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  // Add new fee
  const handleAddFee = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        roomNumber: values.roomNumber,
        description: values.description,
        amount: Number(values.amount).toFixed(1),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      });

      const response = await fetch(`http://localhost:22986/demo/admin/fees/add?${params}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to add fee');
      notification.success({ message: 'Success', description: 'Fee added successfully' });
      setIsAddModalVisible(false);
      fetchFees();
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    }
  };

  // Upload fees from Excel
  const handleUploadFees = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('description', values.description);
      formData.append('dueDate', values.dueDate.format('YYYY-MM-DD'));
      formData.append('status', 'UNPAID');
      formData.append('feeType', values.feeType);
      formData.append('file', values.file.file);

      const response = await fetch('http://localhost:22986/demo/admin/fees/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload fees');
      notification.success({ message: 'Success', description: 'Fees uploaded successfully' });
      setIsUploadModalVisible(false);
      fetchFees();
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    }
  };

  // Update fee status
  const handleStatusChange = async (feeId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ feeId, status });
      
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/update-status?${params}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to update status');
      setFees(fees.map(fee => fee.id === feeId ? { ...fee, status } : fee));
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    }
  };

  // Delete fee
  const handleDeleteFee = async (feeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/${feeId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete fee');
      notification.success({ message: 'Success', description: 'Fee deleted successfully' });
      setFees(fees.filter(fee => fee.id !== feeId));
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    }
  };

  return (
    <div className="fee-management">
      <div className="header-buttons">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setIsUploadModalVisible(true)}
          style={{ marginRight: 16 }}
        >
          Upload Excel
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add Fee
        </Button>
      </div>

      <Table
        dataSource={fees}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      >
        <Column title="Room Number" dataIndex="roomNumber" key="roomNumber" />
        <Column title="Description" dataIndex="description" key="description" />
        <Column
          title="Amount"
          dataIndex="amount"
          key="amount"
          render={(amount) => `${Number(amount).toLocaleString()} VND`}
        />
        <Column
          title="Due Date"
          dataIndex="dueDate"
          key="dueDate"
          render={(date) => moment(date).format('DD/MM/YYYY')}
        />
        <Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status, record) => (
            <Select
              defaultValue={status}
              onChange={(value) => handleStatusChange(record.id, value)}
              className={`status-select ${status.toLowerCase()}`}
            >
              <Option value="UNPAID">Unpaid</Option>
              <Option value="PAID">Paid</Option>
            </Select>
          )}
        />
        <Column
          title="Actions"
          key="actions"
          render={(_, record) => (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedFee(record);
                  setIsEditModalVisible(true);
                }}
                style={{ marginRight: 8 }}
              />
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteFee(record.id)}
                danger
              />
            </>
          )}
        />
      </Table>

      {/* Add Fee Modal */}
      <Modal
        title="Add New Fee"
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddFee} layout="vertical">
          <Form.Item
            label="Room Number"
            name="roomNumber"
            rules={[{ required: true, message: 'Please input room number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date!' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Fee
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Excel Modal */}
      <Modal
        title="Upload Fees from Excel"
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
      >
        <Form form={uploadForm} onFinish={handleUploadFees} layout="vertical">
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date!' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="Fee Type"
            name="feeType"
            rules={[{ required: true, message: 'Please select fee type!' }]}
          >
            <Select>
              <Option value="ELSE">Else</Option>
              <Option value="ELECTRICITY">Electricity</Option>
              <Option value="WATER">Water</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Excel File"
            name="file"
            rules={[{ required: true, message: 'Please upload file!' }]}
          >
            <Upload
              accept=".xlsx"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeManagement;