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
    amount: null,
    contributedAt: null,
    approved: null,
    startDate: null,
    endDate: null
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

  // Handle pagination change for search tab
  const handleSearchTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : 'id,desc'
    };
    
    setSearchPagination(pagination);
    handleSearchRecords(params);
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Dates',
      render: (_, record) => 
        `${moment(record.startDate).format(DATE_FORMAT)} - 
        ${moment(record.endDate).format(DATE_FORMAT)}`
    },
    {
      title: 'Status',
      dataIndex: 'active',
      render: active => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
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
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            loading={deleteLoading[record.id]} 
            onClick={() => confirmDelete(record.id)}
          >
            Delete
          </Button>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedContributionId(record.id);
              fetchContributionRecords(record.id);
            }}
          >
            View Records
          </Button>
        </>
      )
    }
  ];

  const pendingRecordsColumns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Contribution',
      render: (_, record) => record.contribution.title,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: amount => `$${amount.toFixed(2)}`
    },
    {
      title: 'Date',
      dataIndex: 'contributedAt',
      render: date => moment(date).format(DATE_FORMAT)
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button 
          type="primary" 
          loading={approveLoading[record.id]} 
          onClick={() => handleApproveRecord(record.id)}
        >
          Approve
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
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true
    },
    {
      title: 'Contribution ID',
      key: 'contributionId',
      render: (_, record) => record.contribution?.id || 'N/A',
      sorter: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: amount => `$${amount?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Contributed At',
      dataIndex: 'contributedAt',
      render: date => date ? moment(date).format(DATE_FORMAT) : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      render: approved => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? 'Approved' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      render: (_, record) => (
        !record.approved && (
          <Button 
            type="primary" 
            size="small"
            loading={approveLoading[record.id]} 
            onClick={() => handleApproveRecord(record.id)}
          >
            Approve
          </Button>
        )
      )
    }
  ];

  const handleSearchRecords = useCallback(async (params = {}) => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("authToken");
      const queryParams = new URLSearchParams({
        page: params.page || searchPagination.current - 1,
        size: params.size || searchPagination.pageSize,
        sort: params.sort || 'id,desc'
      });

      const searchData = {
        id: searchCriteria.id,
        userId: searchCriteria.userId,
        contributionId: searchCriteria.contributionId,
        amount: searchCriteria.amount,
        approved: searchCriteria.approved,
        startDate: searchCriteria.startDate,
        endDate: searchCriteria.endDate
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

      if (!response.ok) {
        throw new Error(`Search error: ${response.status}`);
      }

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
  }, [searchCriteria, searchPagination.current, searchPagination.pageSize]);

  const handleSearchFormFinish = (values) => {
    const formattedValues = {
      id: values.id || null,
      userId: values.userId || null,
      contributionId: values.contributionId || null,
      amount: values.amount || null,
      approved: values.approved,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD') || null,
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') || null
    };
    
    setSearchCriteria(formattedValues);
    handleSearchRecords();
    setIsSearchModalVisible(false);
  };

  const resetSearchForm = () => {
    searchForm.resetFields();
    setSearchCriteria({
      id: null,
      userId: null,
      contributionId: null,
      amount: null,
      startDate: null,
      endDate: null,
      approved: null
    });
    handleSearchRecords();
  };

  const SearchModal = () => (
    <Modal
      title="Advanced Search"
      visible={isSearchModalVisible}
      onCancel={() => setIsSearchModalVisible(false)}
      footer={[
        <Button key="reset" onClick={resetSearchForm}>
          Reset
        </Button>,
        <Button key="cancel" onClick={() => setIsSearchModalVisible(false)}>
          Cancel
        </Button>,
        <Button
          key="search"
          type="primary"
          onClick={() => searchForm.submit()}
        >
          Search
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
          amount: searchCriteria.amount,
          approved: searchCriteria.approved,
          dateRange: searchCriteria.startDate && searchCriteria.endDate ? 
            [moment(searchCriteria.startDate), moment(searchCriteria.endDate)] : undefined
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Record ID" name="id">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="User ID" name="userId">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contribution ID" name="contributionId">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Amount" name="amount">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Approval Status" name="approved">
              <Select allowClear>
                <Option value="true">Approved</Option>
                <Option value="false">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contribution Date" name="dateRange">
              <RangePicker 
                format={DATE_FORMAT} 
                style={{ width: '100%' }}
                size="small"
                fullscreen={false}
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
        <h1 className="text-2xl font-bold">Contribution Management</h1>
        <Button type="primary" onClick={() => {
          setSelectedContribution(null);
          form.resetFields();
          setModalVisible(true);
        }}>
          Create New Contribution
        </Button>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Contributions" key="1">
          <Spin spinning={loading}>
            <Table
              columns={contributionColumns}
              dataSource={contributions}
              rowKey="id"
              bordered
            />
          </Spin>
        </TabPane>
        <TabPane tab="Pending Records" key="2">
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
              Search Records
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
                Advanced Search
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
                showTotal: total => `Total ${total} items`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleSearchTableChange}
              bordered
              scroll={{ x: 1300 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Contribution Records" key="3">
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
                    ← Back to all contributions
                  </Button>
                  <Title level={4} className="mt-2">
                    Records for Contribution #{selectedContributionId}
                  </Title>
                </div>
                <Table
                  columns={contributionRecordsColumns}
                  dataSource={contributionRecords}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: total => `Total ${total} items`,
                    pageSizeOptions: ['10', '20', '50']
                  }}
                  onChange={handleTableChange}
                  bordered
                />
              </>
            )}
            {!selectedContributionId && (
              <div className="text-gray-500">
                Select a contribution from the list to view its records
              </div>
            )}
          </Spin>
        </TabPane>
      </Tabs>

      <Modal
        title={`${selectedContribution ? 'Edit' : 'Create'} Contribution`}
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
            label="Title"
            rules={[{ required: true, message: 'Please input title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
  <Col span={12}>
    <Form.Item
      name="startDate"
      label="Start Date"
      rules={[{ 
        required: true, 
        message: 'Please select start date!'
      }, {
        validator: (_, value) => {
          if (!value) return Promise.resolve();
          const startDate = form.getFieldValue('startDate');
          
          if (!startDate) {
            return Promise.reject('Please select start date first!');
          }
          
          const start = moment(startDate).startOf('day');
          const end = moment(value).startOf('day');
          
          if (end.isBefore(start)) {
            return Promise.reject('End date must be after start date!');
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
      label="End Date"
      dependencies={['startDate']}
      rules={[{ 
        required: true, 
        message: 'Please select end date!'
      }, {
        validator: (_, value) => {
          if (!value) return Promise.resolve();
          const startDate = form.getFieldValue('startDate');
          
          if (!startDate) {
            return Promise.reject('Please select start date first!');
          }
          
          const start = moment(startDate).startOf('day');
          const end = moment(value).startOf('day');
          
          if (end.isBefore(start)) {
            return Promise.reject('End date must be after start date!');
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
            label="Status"
            valuePropName="checked"
          >
            <Select defaultValue={true}>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {selectedContribution ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Contribute;