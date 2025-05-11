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
  notification,
  Row,
  Col,
  Tag,
  Tabs,
  Card,
  Space,
  Divider,
  Typography
} from 'antd';
import { 
  SearchOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [uploadForm] = Form.useForm();

  const [searchCriteria, setSearchCriteria] = useState({
    roomNumber: '',
    description: '',
    minAmount: null,
    maxAmount: null,
    dueDate: null,
    status: 'PAID'
  });
  
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50']
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // Fetch all fees
  const fetchFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:22986/demo/admin/fees', {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch fees');

      const data = await response.json();
      setFees(data);
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'Failed to fetch fees'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field || 'dueDate';
    const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: `${sortField},${sortOrder}`
    };
    
    setPagination(pagination);
    handleSearchFees(params);
  };

  const handleSearchSubmit = () => {
    const formValues = searchForm.getFieldsValue();
    
    // Update search criteria and perform search immediately
    setSearchCriteria(prev => {
      const newCriteria = {
        roomNumber: formValues.roomNumber || '',
        description: formValues.description || '',
        minAmount: formValues.minAmount ? Number(formValues.minAmount) : null,
        maxAmount: formValues.maxAmount ? Number(formValues.maxAmount) : null,
        dueDate: formValues.dueDate || null,
        status: formValues.status || 'PAID'
      };
      
      // Call API search right after updating state
      handleSearchFees({ page: 0 }, newCriteria);
      return newCriteria;
    });
  
    setPagination(prev => ({ ...prev, current: 1 }));
    setIsSearchModalVisible(false);
  };
  
  const handleSearchFees = async (params = {}, criteria = searchCriteria) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: params.page || pagination.current - 1,
        size: params.size || pagination.pageSize,
        sort: params.sort || 'dueDate,desc'
      });
  
      // Use criteria from parameters instead of state
      const formattedCriteria = {
        ...criteria,
        dueDate: criteria.dueDate || null,
        minAmount: criteria.minAmount ? Number(criteria.minAmount) : null,
        maxAmount: criteria.maxAmount ? Number(criteria.maxAmount) : null
      };
  
      const response = await fetch(`http://localhost:22986/demo/search/fees?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedCriteria)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search fees');
      }
  
      const data = await response.json();
      setSearchResults(data.content);
      setPagination({
        ...pagination,
        total: data.totalElements
      });
    } catch (error) {
      notification.error({ 
        message: 'Lỗi tìm kiếm', 
        description: error.message 
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Format date string to YYYY-MM-DD for the API
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    return dateString;
  };

  // Handle adding new fee
  const handleAddFee = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Create URL with query parameters
      const apiUrl = new URL('http://localhost:22986/demo/admin/fees/add');
      const params = {
        roomNumber: values.roomNumber,
        description: values.description,
        amount: Number(values.amount).toFixed(1),
        dueDate: formatDateForApi(values.dueDate)
      };

      // Add parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        apiUrl.searchParams.append(key, value);
      });

      const response = await fetch(apiUrl.toString(), {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add fee');
      }

      notification.success({
        message: 'Success',
        description: 'Fee added successfully'
      });

      // Update UI
      setShowAddModal(false);
      addForm.resetFields();
      fetchFees();

    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'Failed to add fee'
      });
    }
  };

  // Update fee status
  const handleStatusChange = async (feeId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ 
        feeId: feeId.toString(),
        status: newStatus 
      });
      
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/update-status?${params}`,
        {
          mode: 'cors',
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      setFees(fees.map(fee => 
        fee.id === feeId ? { ...fee, status: newStatus } : fee
      ));
      
      notification.success({
        message: 'Success',
        description: 'Fee status updated successfully'
      });
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'Failed to update status'
      });
    }
  };

  // Update fee information
  const handleUpdateFee = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const updatedFee = {
        ...selectedFee,
        roomNumber: values.roomNumber,
        description: values.description,
        amount: Number(values.amount),
        dueDate: formatDateForApi(values.dueDate)
      };
      
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/${selectedFee.id}`,
        {
          mode: 'cors',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFee)
        }
      );

      if (!response.ok) throw new Error('Failed to update fee');

      notification.success({
        message: 'Success',
        description: 'Fee updated successfully'
      });
      
      setShowEditModal(false);
      fetchFees();
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'Failed to update fee'
      });
    }
  };

  // Delete fee with browser confirm
  const handleDeleteFee = async (feeId) => {
    // Hỏi lại người dùng
    const ok = window.confirm('Are you sure you want to delete this fee?');
    if (!ok) return;  // nếu nhấn Cancel thì dừng

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/${feeId}`,
        {
          mode: 'cors',
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete fee');
      }

      // Cập nhật lại state fees
      setFees(prevFees => prevFees.filter(fee => fee.id !== feeId));
      
      // Thông báo thành công
      alert('Fee deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to delete fee'}`);
    }
  };

  // Upload fees from Excel
  const handleUploadFees = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('description', values.description);
      formData.append('dueDate', formatDateForApi(values.dueDate));
      formData.append('status', 'UNPAID');
      formData.append('feeType', values.feeType);
      formData.append('file', values.file.file);

      const response = await fetch('http://localhost:22986/demo/admin/fees/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload fees');
      
      notification.success({ 
        message: 'Success', 
        description: 'Fees uploaded successfully' 
      });
      
      setShowUploadModal(false);
      uploadForm.resetFields();
      fetchFees();
    } catch (error) {
      notification.error({ 
        message: 'Error', 
        description: error.message || 'Failed to upload fees' 
      });
    }
  };

  const columns = [
    {
      title: 'Số phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      sorter: true,
      render: value => `Phòng ${value}`
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      sorter: true
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      render: value => `${Number(value).toLocaleString('vi-VN')} VND`
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: true,
      render: value => moment(value).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          dropdownMatchSelectWidth={false}
        >
          <Option value="PAID">
            <Tag color="green">Đã thanh toán</Tag>
          </Option>
          <Option value="UNPAID">
            <Tag color="red">Chưa thanh toán</Tag>
          </Option>
        </Select>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedFee(record);
              editForm.setFieldsValue({
                roomNumber: record.roomNumber,
                description: record.description,
                amount: record.amount,
                dueDate: record.dueDate
              });
              setShowEditModal(true);
            }}
            title="Chỉnh sửa"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFee(record.id)}
            danger
            title="Xóa khoản thu"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="fee-management">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16, float: 'right' }}>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddModal(true)}
              >
                Thêm khoản thu
              </Button>
              
              <Button 
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setShowUploadModal(true)}
              >
                Upload Excel
              </Button>
            </Space>
            
            <Tabs defaultActiveKey="1">
              <TabPane tab="Danh sách khoản thu" key="1">
                <Card
                  title={<Title level={4}>Danh sách khoản thu</Title>}
                  bordered={false}
                >
                  <Table
                    dataSource={fees}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50']
                    }}
                  />
                </Card>
              </TabPane>
              
              <TabPane tab="Kết quả tìm kiếm" key="2">
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      searchForm.setFieldsValue({
                        roomNumber: searchCriteria.roomNumber,
                        description: searchCriteria.description,
                        minAmount: searchCriteria.minAmount,
                        maxAmount: searchCriteria.maxAmount,
                        dueDate: searchCriteria.dueDate,
                        status: searchCriteria.status
                      });
                      setIsSearchModalVisible(true);
                    }}
                    icon={<SearchOutlined />}
                  >
                    Tìm kiếm nâng cao
                  </Button>
                </div>
                
                <Table
                  columns={columns}
                  dataSource={searchResults}
                  rowKey="id"
                  loading={searchLoading}
                  pagination={pagination}
                  onChange={handleTableChange}
                  bordered
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Search Modal */}
      <Modal
        title="Tìm kiếm nâng cao"
        visible={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsSearchModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSearchSubmit}>
            Tìm kiếm
          </Button>,
        ]}
        centered
        destroyOnClose={false}
      >
        <Form 
          form={searchForm} 
          layout="vertical" 
          initialValues={{ status: 'PAID' }}
          preserve={true}
        >
          <Form.Item label="Số phòng" name="roomNumber">
            <Input placeholder="Nhập số phòng" />
          </Form.Item>
          
          <Form.Item label="Mô tả" name="description">
            <Input placeholder="Nhập mô tả" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số tiền tối thiểu" name="minAmount">
                <Input
                  type="number"
                  min={1001}
                  placeholder="Nhập số tiền tối thiểu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số tiền tối đa" name="maxAmount">
                <Input
                  type="number"
                  min={0}
                  placeholder="Nhập số tiền tối đa"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ngày hết hạn"
            name="dueDate"
          >
            <Input
              type="date"
              className="ant-input"
              min={getTodayDateString()}
              onChange={(e) => {
                form.setFieldsValue({ dueDate: e.target.value });
              }}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select placeholder="Chọn trạng thái" allowClear>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="UNPAID">Chưa thanh toán</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Fee Modal */}
      <Modal
        title="Thêm mới khoản thu"
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={addForm} 
          layout="vertical" 
          onFinish={handleAddFee}
        >
          <Form.Item 
            name="roomNumber" 
            label="Số phòng" 
            rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
          >
            <Input placeholder="Nhập số phòng" />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Mô tả" 
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input placeholder="Nhập mô tả khoản thu" />
          </Form.Item>
          
          <Form.Item 
            name="amount" 
            label="Số tiền" 
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
          >
            <Input 
              type="number" 
              min={1001} 
              step="1000" 
              placeholder="Nhập số tiền" 
              suffix="VND" 
            />
          </Form.Item>
          
          <Form.Item 
            name="dueDate" 
            label="Hạn thanh toán" 
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <Input 
              type="date"
              min={getTodayDateString()}
              className="ant-input"
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm mới
              </Button>
              <Button onClick={() => setShowAddModal(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Fee Modal */}
      <Modal
        title="Chỉnh sửa khoản thu"
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        destroyOnClose
      >
        {selectedFee && (
          <Form 
            form={editForm}
            layout="vertical" 
            onFinish={handleUpdateFee}
          >
            <Form.Item 
              name="roomNumber" 
              label="Số phòng" 
              rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
            >
              <Input placeholder="Nhập số phòng" />
            </Form.Item>
            
            <Form.Item 
              name="description" 
              label="Mô tả" 
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <Input placeholder="Nhập mô tả khoản thu" />
            </Form.Item>
            
            <Form.Item 
              name="amount" 
              label="Số tiền" 
              rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
            >
              <Input 
                type="number" 
                min={0} 
                step="0.01" 
                placeholder="Nhập số tiền" 
                suffix="VND" 
              />
            </Form.Item>
            
            <Form.Item 
              name="dueDate" 
              label="Hạn thanh toán" 
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
            >
              <Input 
                type="date"
                min={getTodayDateString()}
                className="ant-input"
              />
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
                <Button onClick={() => setShowEditModal(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Fees from Excel"
        visible={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={uploadForm} onFinish={handleUploadFees} layout="vertical">
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>
          
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date!' }]}
          >
            <Input 
              type="date"
              min={getTodayDateString()}
              className="ant-input"
            />
          </Form.Item>
          
          <Form.Item
            label="Fee Type"
            name="feeType"
            rules={[{ required: true, message: 'Please select fee type!' }]}
          >
            <Select placeholder="Select fee type">
              <Option value="ELECTRICITY">Electricity</Option>
              <Option value="WATER">Water</Option>
              <Option value="ELSE">Other</Option>
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
            <Space>
              <Button type="primary" htmlType="submit">
                Upload
              </Button>
              <Button onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeManagement;