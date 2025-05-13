import React, { useState, useEffect, useCallback } from 'react';
import { Select, Table, Button, Modal, Form, Input, DatePicker, Tag, message, Spin, Tabs, Typography, Row, Col, Card } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

// Configure the DatePicker to show all days
DatePicker.defaultProps = {
  ...DatePicker.defaultProps,
  dropdownClassName: 'full-week-calendar'
};
const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = 'https://backend-13-6qob.onrender.com/demo';

// Custom date format
const DATE_FORMAT = 'YYYY-MM-DD';

const Contribute = () => {
  const [contributions, setContributions] = useState([]);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [contributionRecords, setContributionRecords] = useState([]);
  const [selectedContributionId, setSelectedContributionId] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchCriteria, setSearchCriteria] = useState({
    id: null,
    userId: null,
    contributionId: null,
    minAmount: null,
    maxAmount: null,
    contributedAt: null,
    approved: null
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });


  // Sửa hàm handleSearchRecords
const handleSearchRecords = useCallback(async (params = {}, searchValues) => {
  try {
    setSearchLoading(true);
    const token = localStorage.getItem("authToken");
    const queryParams = new URLSearchParams({
      page: params.page || searchPagination.current - 1,
      size: params.size || searchPagination.pageSize,
      sort: params.sort || 'id,desc'
    });

    // Sử dụng searchValues từ tham số đầu vào
    let approvedValue = null;
    if (searchValues?.approved === "true") {
      approvedValue = true;
    } else if (searchValues?.approved === "false") {
      approvedValue = false;
    }

    const contributedAt = searchValues?.contributedAt 
      ? moment(searchValues.contributedAt).format(DATE_FORMAT) 
      : null;

    const searchData = {
      id: searchValues?.id || null,
      userId: searchValues?.userId || null,
      contributionId: searchValues?.contributionId || null,
      minAmount: searchValues?.minAmount || null,
      maxAmount: searchValues?.maxAmount || null,
      contributedAt: contributedAt,
      approved: approvedValue
    };

    const response = await fetch(
      `${API_BASE_URL}/search/contributionRecords?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(searchData)
      }
    );

    if (!response.ok) throw new Error(`Search error: ${response.status}`);

    const data = await response.json();
    setSearchResults(data.content || []);
    setSearchPagination({
      current: (params.page || 0) + 1,
      pageSize: params.size || 10,
      total: data.totalElements || 0
    });
  } catch (error) {
    message.error(`Error searching records: ${error.message}`);
  } finally {
    setSearchLoading(false);
  }
}, [searchPagination.current, searchPagination.pageSize]); // Chỉ phụ thuộc vào pagination

// Sửa hàm handleSearchFormFinish
const handleSearchFormFinish = (values) => {
  if (values.minAmount && values.maxAmount && Number(values.minAmount) > Number(values.maxAmount)) {
    message.error('Minimum amount cannot be greater than maximum amount');
    return;
  }

  const formattedValues = {
    id: values.id || null,
    userId: values.userId || null,
    contributionId: values.contributionId || null,
    minAmount: values.minAmount || null,
    maxAmount: values.maxAmount || null,
    contributedAt: values.contributedAt || null,
    approved: values.approved
  };

  // Cập nhật state và gọi API với giá trị mới
  setSearchCriteria(formattedValues);
  handleSearchRecords({}, formattedValues); // Truyền trực tiếp giá trị vào
  setIsSearchModalVisible(false);
};

// Sửa phần handleSearchTableChange
const handleSearchTableChange = (pagination, filters, sorter) => {
  const params = {
    page: pagination.current - 1,
    size: pagination.pageSize,
    sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : 'id,desc'
  };
  
  setSearchPagination(pagination);
  handleSearchRecords(params, searchForm.getFieldsValue()); // Lấy giá trị hiện tại từ form
};


  
  
  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize
    };
    
    if (sorter.field) {
      params.sort = `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`;
    }
    
    setPagination(pagination);
    fetchContributionRecords(selectedContributionId, params);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      // Fetch contributions
      const contribResponse = await fetch(`${API_BASE_URL}/admin/contribute/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!contribResponse.ok) {
        throw new Error(`Contributions Error: ${contribResponse.status}`);
      }
      
      const contribData = await contribResponse.json();
      setContributions(contribData);

      // Fetch pending records
      const pendingResponse = await fetch(`${API_BASE_URL}/admin/contribute/records/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!pendingResponse.ok) {
        throw new Error(`Pending Records Error: ${pendingResponse.status}`);
      }
      
      const pendingData = await pendingResponse.json();
      setPendingRecords(pendingData);
    } catch (error) {
      message.error(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateDates = (startDate, endDate, isEdit = false) => {
  if (!startDate || !endDate) {
    return false;
  }
  
  const today = moment().startOf('day');
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  
  
  if (end.isBefore(start)) {
    message.error('End date cannot be before start date');
    return false;
  }
  
  return true;
};


  const handleCreateUpdate = async (values) => {
   const isEdit = !!selectedContribution;
  const startDate = values.startDate ? moment(values.startDate) : null;
  const endDate = values.endDate ? moment(values.endDate) : null;
  
  // Validate dates
  if (!validateDates(startDate, endDate)) {
    return;
  }
  
  try {
    setSubmitLoading(true);
    const token = localStorage.getItem("authToken");
    const url = selectedContribution 
      ? `${API_BASE_URL}/admin/contribute/${selectedContribution.id}`
      : `${API_BASE_URL}/admin/contribute`;

    // Format dates properly for API
    const payload = {
      ...values,
      startDate: startDate.format(DATE_FORMAT),
      endDate: endDate.format(DATE_FORMAT)
    };

    const response = await fetch(url, {
      method: selectedContribution ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Operation failed: ${response.status}`);
    }
    
    message.success(`Contribution ${selectedContribution ? 'updated' : 'created'} successfully`);
    setModalVisible(false);
    fetchData();
    form.resetFields();
  } catch (error) {
    message.error(`Error: ${error.message}`);
  } finally {
    setSubmitLoading(false);
  }
};

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this contribute?');
  if (!ok) return;
    try {
      setDeleteLoading(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/contribute/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 204) {
        message.success('Contribution deleted successfully');
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed: ${response.status}`);
      }
    } catch (error) {
      message.error(`Delete failed: ${error.message}`);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const confirmDelete = (id) => {
    handleDelete(id);
  };

  const handleApproveRecord = async (recordId) => {
    try {
      setApproveLoading(prev => ({ ...prev, [recordId]: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/contribute/records/${recordId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('Record approved successfully');
        fetchData();
        // If we're viewing records for a contribution, refresh those too
        if (selectedContributionId) {
          fetchContributionRecords(selectedContributionId);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Approval failed: ${response.status}`);
      }
    } catch (error) {
      message.error(`Approval failed: ${error.message}`);
    } finally {
      setApproveLoading(prev => ({ ...prev, [recordId]: false }));
    }
  };

  const fetchContributionRecords = async (contributionId, params = {}) => {
    if (!contributionId) return;
    
    try {
      setRecordsLoading(true);
      const token = localStorage.getItem("authToken");
      
      const queryParams = new URLSearchParams({
        page: params.page || pagination.current - 1,
        size: params.size || pagination.pageSize,
        sort: params.sort || 'id,desc'
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/contribute/${contributionId}/records?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching records: ${response.status}`);
      }
      
      const data = await response.json();
      setContributionRecords(data.content || data);
      
      // Update pagination if we have page data
      if (data.totalElements !== undefined) {
        setPagination({
          current: (params.page || 0) + 1,
          pageSize: params.size || 10,
          total: data.totalElements
        });
      }
    } catch (error) {
      message.error(`Error fetching contribution records: ${error.message}`);
    } finally {
      setRecordsLoading(false);
    }
  };

  const contributionColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Ngày',
      render: (_, record) => 
        `${moment(record.startDate).format(DATE_FORMAT)} - 
        ${moment(record.endDate).format(DATE_FORMAT)}`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      render: active => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedContribution(record);
              form.setFieldsValue({
                ...record,
                // Don't need to format dates for form, just pass the raw values
                startDate: record.startDate,
                endDate: record.endDate
              });
              setModalVisible(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Button 
            type="link" 
            danger 
            loading={deleteLoading[record.id]} 
            onClick={() => confirmDelete(record.id)}
          >
            Xóa
          </Button>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedContributionId(record.id);
              fetchContributionRecords(record.id);
            }}
          >
            Xem bản ghi
          </Button>
        </>
      )
    }
  ];

  const pendingRecordsColumns = [
    {
      title: 'ID người dùng',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Khoản đóng góp',
      render: (_, record) => record.contribution.title,
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      render: amount => `${amount.toFixed(2)}VNĐ`
    },
    {
      title: 'Ngày',
      dataIndex: 'contributedAt',
      render: date => moment(date).format(DATE_FORMAT)
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button 
          type="primary" 
          loading={approveLoading[record.id]} 
          onClick={() => handleApproveRecord(record.id)}
        >
          Chấp thuận
        </Button>
      )
    }
  ];

  const contributionRecordsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true
    },
    {
      title: 'ID người dùng',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true
    },
    {
      title: 'ID khoản đóng góp',
      key: 'contributionId',
      render: (_, record) => record.contribution?.id || 'N/A',
      sorter: true
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      render: amount => `${amount?.toFixed(2) || '0'}VNĐ`
    },
    {
      title: 'Đóng góp lúc',
      dataIndex: 'contributedAt',
      render: date => date ? moment(date).format(DATE_FORMAT) : 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'approved',
      render: approved => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? 'Approved' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        !record.approved && (
          <Button 
            type="primary" 
            size="small"
            loading={approveLoading[record.id]} 
            onClick={() => handleApproveRecord(record.id)}
          >
            Chấp thuận
          </Button>
        )
      )
    }
  ];


  const resetSearchForm = () => {
    searchForm.resetFields();
    setSearchCriteria({
      id: null,
      userId: null,
      contributionId: null,
      minAmount: null,
      maxAmount: null,
      contributedAt: null,
      approved: null
    });
    handleSearchRecords();
  };

  const validateContributedAtDate = (_, value) => {
    if (!value) return Promise.resolve();
    
    // Validate date is not in the future
    if (moment(value).isAfter(moment())) {
      return Promise.reject('Khoản đóng góp không thể đến từ tương lai');
    }
    
    return Promise.resolve();
  };

  const validateAmountRange = (_, value) => {
    if (!value) return Promise.resolve();
    
    // Ensure value is a valid number
    if (isNaN(Number(value)) || Number(value) < 0) {
      return Promise.reject('Giá trị phải dương');
    }
    
    const minAmount = searchForm.getFieldValue('minAmount');
    const maxAmount = searchForm.getFieldValue('maxAmount');
    
    if (minAmount && maxAmount && Number(minAmount) > Number(maxAmount)) {
      return Promise.reject('Giá trị nhỏ nhất không được vượt qua giá trị lớn nhất');
    }
    
    return Promise.resolve();
  };

  const SearchModal = () => (
    <Modal
      title="Tìm kiếm nâng cao"
      visible={isSearchModalVisible}
      onCancel={() => setIsSearchModalVisible(false)}
      footer={[
        <Button key="reset" onClick={resetSearchForm}>
          Làm mới
        </Button>,
        <Button key="cancel" onClick={() => setIsSearchModalVisible(false)}>
          Hủy
        </Button>,
        <Button
          key="search"
          type="primary"
          onClick={() => searchForm.submit()}
        >
          Tìm 
        </Button>
      ]}
      width={800}
    >
      <Form 
        form={searchForm}
        layout="vertical"
        onFinish={handleSearchFormFinish}
        initialValues={{
          id: searchCriteria.id,
          userId: searchCriteria.userId,
          contributionId: searchCriteria.contributionId,
          minAmount: searchCriteria.minAmount,
          maxAmount: searchCriteria.maxAmount,
          contributedAt: searchCriteria.contributedAt,
          approved: searchCriteria.approved
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="ID bản ghi" name="id">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="ID người dùng" name="userId">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ID khoản đóng góp" name="contributionId">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Trạng thái chấp thuận" name="approved">
              <Select allowClear>
                <Option value="true">Chấp thuận</Option>
                <Option value="false">Chờ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá trị nhỏ nhất (VNĐ)"
              name="minAmount"
              rules={[
                { validator: validateAmountRange }
              ]}
            >
              <Input type="number" min="0" placeholder="Gí trị nhỏ nhất" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Giá trị lớn nhất (VNĐ)"
              name="maxAmount"
              dependencies={['minAmount']}
              rules={[
                { validator: validateAmountRange }
              ]}
            >
              <Input type="number" min="0" placeholder="Giá trị lớn nhất" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày đóng góp"
              name="contributedAt"
              rules={[
                { validator: validateContributedAtDate }
              ]}
            >
              <Input 
                type="date"
                max={moment().format('YYYY-MM-DD')}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );

  // Add custom CSS to ensure the DatePicker shows all 7 days
  useEffect(() => {
    // Add a custom CSS class to ensure the calendar shows all days
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = `
      .full-week-calendar .ant-picker-content th,
      .full-week-calendar .ant-picker-content td {
        min-width: 24px !important;
        padding: 0 !important;
      }
      .full-week-calendar .ant-picker-cell-inner {
        min-width: 22px !important;
        height: 22px !important;
        line-height: 22px !important;
        font-size: 12px !important;
      }
      .full-week-calendar .ant-picker-header-view {
        font-size: 12px !important;
      }
      .full-week-calendar .ant-picker-content {
        width: 100% !important;
        table-layout: fixed !important;
      }
    `;
    
    return () => {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Function to get today's date in YYYY-MM-DD format
 
  useEffect(() => {
    // Listen for changes to startDate and update endDate constraint
    form.getFieldValue('startDate') && form.validateFields(['endDate']);
  }, [form.getFieldValue('startDate')]);

  const getTodayDateString = () => {
    return moment().format(DATE_FORMAT);
  };

  return (
    <div className="p-4">
      <SearchModal />
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Đóng góp</h1>
        <Button type="primary" onClick={() => {
          setSelectedContribution(null);
          form.resetFields();
          setModalVisible(true);
        }}>
          Tạo mới khoản đóng góp
        </Button>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Các khoản đóng góp" key="1">
          <Spin spinning={loading}>
            <Table
              columns={contributionColumns}
              dataSource={contributions}
              rowKey="id"
              bordered
            />
          </Spin>
        </TabPane>
        <TabPane tab="Bản ghi chờ chấp thuận" key="2">
          <Spin spinning={loading}>
            <Table
              columns={pendingRecordsColumns}
              dataSource={pendingRecords}
              rowKey="id"
              bordered
            />
          </Spin>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <SearchOutlined className="mr-1" />
              Tìm bản ghi
            </span>
          } 
          key="4"
        >
          <Card
            className="search-results-card"
            extra={
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setIsSearchModalVisible(true)}
              >
                Tìm kiếm nâng cao
              </Button>
            }
          >
            <Table
              columns={contributionRecordsColumns}
              dataSource={searchResults}
              rowKey="id"
              loading={searchLoading}
              pagination={{
                ...searchPagination,
                showSizeChanger: true,
                showTotal: total => `Tổng ${total} mục`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleSearchTableChange}
              bordered
              scroll={{ x: 1300 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Bản ghi các khoản đóng góp" key="3">
          <Spin spinning={recordsLoading}>
            {selectedContributionId && (
              <>
                <div className="mb-4">
                  <Button 
                    type="link" 
                    onClick={() => {
                      setSelectedContributionId(null);
                      setContributionRecords([]);
                    }}
                  >
                    ← Quy lại trang các khoản đóng góp
                  </Button>
                  <Title level={4} className="mt-2">
                    Bản ghi cho khoản đóng góp #{selectedContributionId}
                  </Title>
                </div>
                <Table
                  columns={contributionRecordsColumns}
                  dataSource={contributionRecords}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: total => `Tổng số ${total} mục`,
                    pageSizeOptions: ['10', '20', '50']
                  }}
                  onChange={handleTableChange}
                  bordered
                />
              </>
            )}
            {!selectedContributionId && (
              <div className="text-gray-500">
                Chọn 1 khoản đóng góp trong danh sách,nhấn "Xem bản ghi "rồi quay lại đây để xem các bản ghi của khoản đóng góp
              </div>
            )}
          </Spin>
        </TabPane>
      </Tabs>

      <Modal
        title={`${selectedContribution ? 'Chỉnh sửa' : 'Tạo'} Khoản đóng góp`}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleCreateUpdate}
          layout="vertical"
          initialValues={{ active: true }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Điền tiêu đề!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Điền mô tả!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ 
                  required: true, 
                  message: 'Chọn ngày bắt đầu!'
                }, {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const startDate = form.getFieldValue('startDate');
                    
                    if (!startDate) {
                      return Promise.reject('Chọn ngày bắt đầu trước!');
                    }
                    
                    const start = moment(startDate).startOf('day');
                    const end = moment(value).startOf('day');
                    
                    if (end.isBefore(start)) {
                      return Promise.reject('Ngày kết thúc phải muộn hơn ngày bắt đầu!');
                    }
                    return Promise.resolve();
                  }
                }]}
              >
                <Input 
                  type="date"
                  className="ant-input"
                  min={form.getFieldValue('startDate') || getTodayDateString()}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                dependencies={['startDate']}
                rules={[{ 
                  required: true, 
                  message: 'Chọn ngày kết thúc!'
                }, {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const startDate = form.getFieldValue('startDate');
                    
                    if (!startDate) {
                      return Promise.reject('Chọn ngày bắt đầu!');
                    }
                    
                    const start = moment(startDate).startOf('day');
                    const end = moment(value).startOf('day');
                    
                    if (end.isBefore(start)) {
                      return Promise.reject('Ngày kết thúc phải muộn hơn ngày bắt đầu!');
                    }
                    return Promise.resolve();
                  }
                }]}
              >
                <Input 
                  type="date"
                  className="ant-input"
                  min={form.getFieldValue('startDate') || getTodayDateString()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Select defaultValue={true}>
              <Option value={true}>Hiện hành</Option>
              <Option value={false}>Không hiện hành</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {selectedContribution ? 'Chỉnh sửa' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Contribute;