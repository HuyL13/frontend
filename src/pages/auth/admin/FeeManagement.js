import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import '../../../styles/FeeManagement.css';
import { 
  SearchOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined 
} from '@ant-design/icons';
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
  Tabs
} from 'antd';
import moment from 'moment';

const { Column } = Table;
const { Option } = Select;
const { TabPane } = Tabs;

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [newFee, setNewFee] = useState({
    roomNumber: '',
    description: '',
    amount: '',
    dueDate: ''
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [form] = Form.useForm();
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
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
    
    // Cập nhật search criteria và thực hiện tìm kiếm ngay lập tức
    setSearchCriteria(prev => {
      const newCriteria = {
        roomNumber: formValues.roomNumber || '',
        description: formValues.description || '',
        minAmount: formValues.minAmount ? Number(formValues.minAmount) : null,
        maxAmount: formValues.maxAmount ? Number(formValues.maxAmount) : null,
        dueDate: formValues.dueDate,
        status: formValues.status || 'PAID'
      };
      
      // Gọi API search ngay sau khi cập nhật state
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
  
      // Sử dụng criteria từ tham số thay vì state
      const formattedCriteria = {
        ...criteria,
        dueDate: criteria.dueDate 
          ? moment(criteria.dueDate).format('YYYY-MM-DD') 
          : null,
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
  // Fetch all fees
  const fetchFees = async () => {
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
      console.log(data);
      setFees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Handle adding new fee
  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      
      // Create URL with query parameters
      const apiUrl = new URL('http://localhost:22986/demo/admin/fees/add');
      const params = {
        roomNumber: newFee.roomNumber,
        description: newFee.description,
        amount: Number(newFee.amount).toFixed(1),
        dueDate: newFee.dueDate
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

      // Update UI
      setShowAddModal(false);
      setNewFee({ roomNumber: '', description: '', amount: '', dueDate: '' });
      await fetchFees();

    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
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
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Update fee information
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const updatedFee = {
        ...selectedFee,
        amount: Number(selectedFee.amount),
        dueDate: new Date(selectedFee.dueDate).toISOString()
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

      setShowEditModal(false);
      await fetchFees();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Delete fee
  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;
    
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

      setFees(prevFees => prevFees.filter(fee => fee.id !== feeId));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
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
      setShowUploadModal(false);
      fetchFees();
    } catch (error) {
      notification.error({ message: 'Error', description: error.message });
    }
  };

  if (loading) return <div className="loading">.</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
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
      render: status => (
        <Tag color={status === 'PAID' ? 'green' : 'red'}>
          {status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="btn-group">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedFee(record);
              setShowEditModal(true);
            }}
            title="Chỉnh sửa"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFee(record.id)}
            title="Xóa khoản thu"
            danger
          />
        </div>
      )
    }
  ];

  return (
    <div className="fee-management">
      <div className="d-flex justify-content-end mb-3">
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
          className="mr-2"
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
      </div>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Danh sách khoản thu" key="1">
          <div className="card table-card">
            <div className="card-header">
              <h3>Danh sách khoản thu</h3>
              <div className="card-header-right">
                <ul className="list-unstyled card-option">
                  <li><i className="ik ik-chevron-left action-toggle"></i></li>
                  <li><i className="ik ik-minus minimize-card"></i></li>
                  <li>
                    <div 
                      className="add-fee" 
                      onClick={() => setShowAddModal(true)}
                      title="Thêm khoản thu mới"
                    >
                      <i className="ik ik-plus text-primary"></i>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-block">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Tên phòng</th>
                      <th>Tên khoản phí</th>
                      <th>Số tiền cần thu</th>
                      <th>Hạn thu</th>
                      <th>Trạng thái</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map(fee => (
                      <tr key={fee.id}>
                        <td>Phòng {fee.roomNumber}</td>
                        <td>{fee.description}</td>
                        <td>{Number(fee.amount).toLocaleString()}vnd</td>
                        <td>{format(new Date(fee.dueDate), 'dd/MM/yyyy')}</td>
                        <td>
                          <select 
                            value={fee.status} 
                            onChange={(e) => handleStatusChange(fee.id, e.target.value)}
                            className={`status-select ${fee.status.toLowerCase()}`}
                          >
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                          </select>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-icon"
                              onClick={() => {
                                setSelectedFee(fee);
                                setShowEditModal(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              <i className="ik ik-edit-2 f-16 text-primary"></i>
                            </button>
                            <button
                              className="btn btn-icon"
                              onClick={() => handleDeleteFee(fee.id)}
                              title="Xóa khoản thu"
                            >
                              <i className="ik ik-trash-2 f-16 text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabPane>
        
        <TabPane tab="Kết quả tìm kiếm" key="2">
          <div className="mb-4">
          <Button 
  type="primary" 
  onClick={() => {
    // Reset form với giá trị hiện tại trước khi mở modal
    searchForm.setFieldsValue({
      roomNumber: searchCriteria.roomNumber,
      description: searchCriteria.description,
      minAmount: searchCriteria.minAmount,
      maxAmount: searchCriteria.maxAmount,
      dueDate: searchCriteria.dueDate ? moment(searchCriteria.dueDate) : null,
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
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50']
            }}
            onChange={handleTableChange}
            bordered
          />
        </TabPane>
      </Tabs>

      {/* Search Modal - Use preserve to keep form state between renders */}
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
        forceRender
        destroyOnClose={false} // Preserve modal state
        maskClosable={false} // Prevent closing when clicking outside
      >
        <Form 
          form={searchForm} 
          layout="vertical" 
          initialValues={{ status: 'PAID' }}
          preserve={true} // Important to preserve form state
        >
          <Form.Item label="Số phòng" name="roomNumber">
            <Input />
          </Form.Item>
          
          <Form.Item label="Mô tả" name="description">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số tiền tối thiểu" name="minAmount">
                <Input
                  type="number"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số tiền tối đa" name="maxAmount">
                <Input
                  type="number"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ngày hết hạn" name="dueDate">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select allowClear>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="UNPAID">Chưa thanh toán</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Fee Modal */}
      {showAddModal && (
        <div className="modal" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close" 
              onClick={() => setShowAddModal(false)}
              role="button" 
              tabIndex={0}
            >
              &times;
            </span>
            <h3>Add New Fee</h3>
            <form onSubmit={handleAddFee}>
              <input
                type="text"
                placeholder="Room Number"
                value={newFee.roomNumber}
                onChange={(e) => setNewFee({ ...newFee, roomNumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newFee.description}
                onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                step="0.01"
                required
              />
              <input
                type="date"
                value={newFee.dueDate}
                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Add Fee
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        title="Upload Fees from Excel"
        visible={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
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

      {/* Edit Fee Modal */}
      {showEditModal && selectedFee && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close" 
              onClick={() => setShowEditModal(false)}
              role="button" 
              tabIndex={0}
            >
              &times;
            </span>
            <h3>Edit Fee</h3>
            <form onSubmit={handleUpdateFee}>
              <input
                type="text"
                value={selectedFee.roomNumber}
                onChange={(e) => setSelectedFee({ ...selectedFee, roomNumber: e.target.value })}
                required
              />
              <input
                type="text"
                value={selectedFee.description}
                onChange={(e) => setSelectedFee({ ...selectedFee, description: e.target.value })}
                required
              />
              <input
                type="number"
                value={selectedFee.amount}
                onChange={(e) => setSelectedFee({ ...selectedFee, amount: e.target.value })}
                step="0.01"
                required
              />
              <input
                type="date"
                value={format(new Date(selectedFee.dueDate), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedFee({ ...selectedFee, dueDate: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Update
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;