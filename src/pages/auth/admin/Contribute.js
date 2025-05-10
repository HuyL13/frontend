import React, { useState, useEffect, useCallback } from 'react';
import { Select, Table, Button, Modal, Form, Input, DatePicker, Tag, message, Spin, Tabs, Typography, Row, Col, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = 'http://localhost:22986/demo';

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
  const [searchCriteria, setSearchCriteria] = useState({
    id: null,
    userId: null,
    contributionId: null,
    amount: null,
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

  // Xử lý thay đổi phân trang cho tab tìm kiếm
  const handleSearchTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: `${sorter.field || 'id'},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
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
    handleSearchRecords(params);
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
      const contribData = await contribResponse.json();
      setContributions(contribData);

      // Fetch pending records
      const pendingResponse = await fetch(`${API_BASE_URL}/admin/contribute/records/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingData = await pendingResponse.json();
      setPendingRecords(pendingData);
    } catch (error) {
      message.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      const url = selectedContribution 
        ? `${API_BASE_URL}/admin/contribute/${selectedContribution.id}`
        : `${API_BASE_URL}/admin/contribute`;

      const response = await fetch(url, {
        method: selectedContribution ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          startDate: values.dates[0].format('YYYY-MM-DD'),
          endDate: values.dates[1].format('YYYY-MM-DD')
        })
      });

      if (!response.ok) throw new Error('Operation failed');
      
      message.success(`Contribution ${selectedContribution ? 'updated' : 'created'} successfully`);
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/contribute/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 204) {
        message.success('Contribution deleted successfully');
        fetchData();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleApproveRecord = async (recordId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/contribute/records/${recordId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('Record approved successfully');
        fetchData();
      }
    } catch (error) {
      message.error('Approval failed');
    }
  };

  const fetchContributionRecords = async (contributionId) => {
    try {
      setRecordsLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/contribute/${contributionId}/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setContributionRecords(data);
    } catch (error) {
      message.error('Error fetching contribution records');
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
    },
    {
      title: 'Dates',
      render: (_, record) => (
        `${moment(record.startDate).format('DD/MM/YYYY')} - ${moment(record.endDate).format('DD/MM/YYYY')}`
      )
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
          <Button type="link" onClick={() => {
            setSelectedContribution(record);
            form.setFieldsValue({
              ...record,
              dates: [moment(record.startDate), moment(record.endDate)]
            });
            setModalVisible(true);
          }}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
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
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleApproveRecord(record.id)}>
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
      render: (_, record) => record.contribution.id,
      sorter: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: amount => `$${amount.toFixed(2)}`
    },
    {
      title: 'Contributed At',
      dataIndex: 'contributedAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      render: approved => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? 'Approved' : 'Pending'}
        </Tag>
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

      const response = await fetch(
        `${API_BASE_URL}/search/contributionRecords?${queryParams}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(searchCriteria)
        }
      );

      const data = await response.json();
      setSearchResults(data.content);
      setSearchPagination({
        current: (params.page || 0) + 1,
        pageSize: params.size || 10,
        total: data.totalElements
      });
    } catch (error) {
      message.error('Error searching records');
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
      contributedAt: null,
      approved: null
    });
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
              <DatePicker.RangePicker showTime />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );

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
        onCancel={() => setModalVisible(false)}
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

          <Form.Item
            name="dates"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range!' }]}
          >
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
          >
            <Input type="checkbox" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
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