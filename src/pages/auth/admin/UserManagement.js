
import React, { useEffect, useState, useRef } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Tag, Spin, message,
  Tooltip, Card, Divider, Row, Col, Typography, Descriptions, Statistic,Tabs
} from 'antd';
import {
  ExclamationCircleOutlined, ReloadOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, InfoCircleOutlined, CrownOutlined,
  SearchOutlined, UserOutlined, HomeOutlined, TeamOutlined, GlobalOutlined
} from '@ant-design/icons';
import "../../../styles/Admin.css";
import "../../../styles/UserManagement.css";



const { TabPane } = Tabs;

// Thêm state cho active tab

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  // States
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResidency, setSelectedResidency] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [statistics, setStatistics] = useState({
    THUONG_TRU: 0,
    TAM_TRU: 0,
    TAM_VANG: 0,
    total: 0
  });
  const [loading, setLoading] = useState({
    initial: true,
    page: false,
    form: false
  });

  // Use ref to track selected residency to avoid stale closure issues
  const selectedResidencyRef = useRef(selectedResidency);
  selectedResidencyRef.current = selectedResidency;

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Residency status options
  const residencyOptions = [
    { value: "THUONG_TRU", label: "Thường trú" },
    { value: "TAM_TRU", label: "Tạm trú" },
    { value: "TAM_VANG", label: "Tạm vắng" }
  ];

  const [searchCriteria, setSearchCriteria] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);


  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(prev => ({ ...prev, initial: false }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field || 'username';
    const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: `${sortField},${sortOrder}`
    };
    
    setPagination(pagination);
    handleSearchUsers(params);
  };
  
  const handleTabTableChange = (pagination, filters, sorter, isSearch) => {
    const sortField = sorter.field || 'username';
    const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: `${sortField},${sortOrder}`
    };
    
    if (isSearch) {
      setSearchPagination(pagination);
      handleSearchUsers(params);
    } else {
      setPagination(pagination);
      fetchUsers(params);
    }
  };

  // Calculate statistics
  const calculateStatistics = (userData) => {
    const stats = {
      THUONG_TRU: 0,
      TAM_TRU: 0, 
      TAM_VANG: 0,
      total: userData.length
    };
    
    userData.forEach(user => {
      if (user.residencyStatus && stats[user.residencyStatus] !== undefined) {
        stats[user.residencyStatus]++;
      }
    });
    
    setStatistics(stats);
  };

  const handleSearchUsers = async (params = {}) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const queryParams = new URLSearchParams({
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'username,asc'
      });
  
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/search/users?${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(searchCriteria),
        }
      );
  
      const data = await response.json();
      setSearchResults(data.content);
      setPagination({
        current: (params.page || 0) + 1,
        pageSize: params.size || 10,
        total: data.totalElements,
      });
      setActiveTabKey('2'); // Chuyển sang tab kết quả tìm kiếm
    } catch (error) {
      message.error(error.message);
    } finally {
      setSearchLoading(false);
    }
  };
  const SearchModal = () => (
    <Modal
    title="Tìm kiếm nâng cao"
    visible={isSearchModalVisible}
    onCancel={() => setIsSearchModalVisible(false)}
    onOk={() => {
      handleSearchUsers();
      setIsSearchModalVisible(false);
    }}
    footer={[
      <Button key="back" onClick={() => setIsSearchModalVisible(false)}>
        Hủy
      </Button>,
      <Button
        key="submit"
        type="primary"
        onClick={() => {
          handleSearchUsers();
          setIsSearchModalVisible(false);
        }}
      >
        Tìm kiếm
      </Button>,
    ]}
  >
      <Form layout="vertical">
        <Form.Item label="Username">
          <Input
            value={searchCriteria.username}
            onChange={(e) =>
              setSearchCriteria({ ...searchCriteria, username: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Họ">
          <Input
            value={searchCriteria.firstName}
            onChange={(e) =>
              setSearchCriteria({ ...searchCriteria, firstName: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Tên">
          <Input
            value={searchCriteria.lastName}
            onChange={(e) =>
              setSearchCriteria({ ...searchCriteria, lastName: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            value={searchCriteria.email}
            onChange={(e) =>
              setSearchCriteria({ ...searchCriteria, email: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
  // Fetch users data
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, page: true }));
    try {
      const token = localStorage.getItem("authToken");
      // Use different endpoint if filtering by residency status
      let url = "https://backend-13-6qob.onrender.com/demo/users/admin";
      if (selectedResidencyRef.current) {
        url = `https://backend-13-6qob.onrender.com/demo/users/admin/user/${selectedResidencyRef.current}`;
      }
      const response = await fetch(url, {
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
        dob: user.dob ? new Date(user.dob).toLocaleDateString() : "N/A",
        residencyStatus: user.residencyStatus || "N/A",
        key: user.id // Adding key for Ant Design Table
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      calculateStatistics(formattedUsers);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  // Effect to fetch users on initial load and periodically
  useEffect(() => {
    if (!loading.initial) {
      fetchUsers();
      const intervalId = setInterval(fetchUsers, 100000);
      return () => clearInterval(intervalId);
    }
  }, [loading.initial]);

  // Effect to refetch when residency filter changes
  useEffect(() => {
    if (!loading.initial) {
      fetchUsers();
    }
  }, [selectedResidency]);

  // Search functionality
  const handleSearch = (value) => {
    const lowerCaseValue = value.toLowerCase();
    const filtered = users.filter(user =>
      Object.values(user).some(
        val => val && val.toString().toLowerCase().includes(lowerCaseValue)
      ) ||
      user.roles?.some(role =>
        role.name.toLowerCase().includes(lowerCaseValue)
      )
    );
    setFilteredUsers(filtered);
  };

  // Create new user
  const createUser = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://backend-13-6qob.onrender.com/demo/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          dob: values.dob,
          residencyStatus: values.residencyStatus
        })
      });
      const data = await response.json();
      console.log(data);
      if (data.code !== 0) {
        throw new Error(data.message || "Create user failed");
      }
      
      message.success("User created successfully");
      return data.result;
    } catch (error) {
      throw error;
    }
  };

  // Handle create user form submission
  const handleCreateUser = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const values = await createForm.validateFields();
      const createdUser = await createUser(values);
      setUsers([...users, createdUser]);
      setFilteredUsers([...filteredUsers, createdUser]);
      setShowCreateModal(false);
      createForm.resetFields();
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(`Failed to create user: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    const ok = window.confirm('Are you sure you want to delete this useruser?');
  if (!ok) return;
    try {
      console.log("xóa");
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/admin/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Delete failed");
      }
      
      setUsers(users.filter(user => user.id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
      message.success("User deleted successfully");
    } catch (error) {
      message.error(`Failed to delete user: ${error.message}`);
    }
  };

  // Fetch user details by ID
  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/admin/${userId}`, {
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
      message.error(`Failed to fetch user details: ${error.message}`);
      return null;
    }
  };

  // Update user
  const updateUser = async (userId, values) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          dob: values.dob,
          email: values.email,
          residencyStatus: values.residencyStatus
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }
      
      const data = await response.json();
      message.success("User updated successfully");
      return data.result;
    } catch (error) {
      throw error;
    }
  };

  // Handle update user form submission
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const values = await editForm.validateFields();
      const updatedUser = await updateUser(selectedUser.id, values);
      
      // Update both users and filteredUsers arrays
      const updateUserInArray = (array) => array.map(user => 
        user.id === selectedUser.id ? { ...user, ...updatedUser } : user
      );
      
      setUsers(updateUserInArray(users));
      setFilteredUsers(updateUserInArray(filteredUsers));
      
      setShowEditModal(false);
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(`Failed to update user: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Make user admin
  const makeAdmin = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/users/admin/${userId}/make-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to make admin");
      }
      // Update both users and filteredUsers arrays
      const updateRolesInArray = (array) => array.map(user => 
        user.id === userId 
          ? { ...user, roles: [...(user.roles || []), { name: "ADMIN" }] }
          : user
      );
      
      setUsers(updateRolesInArray(users));
      setFilteredUsers(updateRolesInArray(filteredUsers));
      
      setShowMakeAdminModal(false);
      message.success("User promoted to admin successfully");
    } catch (error) {
      message.error(`Failed to make admin: ${error.message}`);
    }
  };

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://backend-13-6qob.onrender.com/demo/users/my-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.code !== 0) {
          throw new Error('Lỗi trong response API');
        }
        setUserInfo(data.result);
      } catch (err) {
        message.error(`Failed to fetch user info: ${err.message}`);
      }
    };
    fetchUserInfo();
  }, []);

  // Helper function to get residency status display name
  const getResidencyStatusLabel = (value) => {
    const option = residencyOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username)
    },
    {
      title: 'Họ & Tên',
      key: 'fullName',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Tình trạng cư trú',
      dataIndex: 'residencyStatus',
      key: 'residencyStatus',
      render: (status) => getResidencyStatusLabel(status)
    },
    {
      title: 'Vai trò',
      key: 'roles',
      render: (_, record) => (
        <>
          {record.roles?.map(role => (
            <Tag color={role.name === "ADMIN" ? "red" : "green"} key={role.name}>
              {role.name}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Chi tiết">
            <Button
              type="primary"
              icon={<InfoCircleOutlined />}
              size="small"
              onClick={() => {
                setSelectedUser(record);
                setShowDetailModal(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              style={{ marginLeft: 8 }}
              onClick={async () => {
                setSelectedUser(record);
                console.log("a");
                console.log(record);
                // Fetch detailed user data for editing
                console.log(record.id);
                const userDetails = await fetchUserDetails(record.id);
                console.log(userDetails);
                if (userDetails) {
                  // Format date properly for input type="date"
                  let formattedDate = '';
                  if (userDetails.dob && userDetails.dob !== "N/A") {
                    const date = new Date(userDetails.dob);
                    formattedDate = date.toISOString().split('T')[0];
                  }
                  
                  editForm.setFieldsValue({
                    email: userDetails.email || record.email,
                    firstName: userDetails.firstName || record.firstName,
                    lastName: userDetails.lastName || record.lastName,
                    password: '',
                    dob: formattedDate,
                    residencyStatus: userDetails.residencyStatus || record.residencyStatus || 'THUONG_TRU'
                  });
                }
                setShowEditModal(true);
              }}
            />
          </Tooltip>
          
          {userInfo && userInfo.roles &&
          Array.isArray(userInfo.roles) &&
          userInfo.roles.some(role => role.name === "ADMIN") && (
            <Tooltip title="Xóa">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => deleteUser(record.id)}
              />
            </Tooltip>
          )}
          
          {userInfo && userInfo.roles &&
          Array.isArray(userInfo.roles) &&
          userInfo.roles.some(role => role.name === "ADMIN") &&
          !record.roles?.some(role => role.name === "ADMIN") && (
            <Tooltip title="Đặt làm admin">
              <Button
                type="default"
                icon={<CrownOutlined />}
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setSelectedUser(record);
                  setShowMakeAdminModal(true);
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  // Render the component
  return (
    <div className="user-management-container">
      {loading.initial ? (
        <div className="loading-spinner">
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={16} className="stats-row">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={statistics.total}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Thường trú"
                  value={statistics.THUONG_TRU}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tạm trú"
                  value={statistics.TAM_TRU}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tạm vắng"
                  value={statistics.TAM_VANG}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>


          <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        tabBarExtraContent={
          activeTabKey === '1' && (
            <div className="tab-extra-actions">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  createForm.resetFields();
                  setShowCreateModal(true);
                }}
              >
                Thêm người dùng
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchUsers()}
                style={{ marginLeft: 8 }}
              >
                Làm mới
              </Button>
            </div>
          )
        }
      >
        {/* Tab Danh sách người dùng */}
        <TabPane tab="Danh sách người dùng" key="1">
          <Card
            className="user-table-card"
            actions={[
              <div className="card-filter-bar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm nhanh..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  allowClear
                  style={{ width: 250, marginRight: 8 }}
                />
                <Select
                  placeholder="Lọc theo tình trạng"
                  allowClear
                  style={{ width: 200 }}
                  onChange={(value) => setSelectedResidency(value)}
                >
                  {residencyOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            ]}
          >
            <Table
              dataSource={filteredUsers}
              columns={columns}
              loading={loading.page}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} người dùng`
              }}
              onChange={(pagination, filters, sorter) => 
                handleTabTableChange(pagination, filters, sorter, false)
              }
              bordered
              scroll={{ x: 1300 }}
            />
          </Card>
        </TabPane>

        {/* Tab Kết quả tìm kiếm */}
        <TabPane tab="Kết quả tìm kiếm" key="2">
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
              columns={columns}
              dataSource={searchResults}
              rowKey="id"
              loading={searchLoading}
              pagination={{
                ...searchPagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} kết quả`
              }}
              onChange={(pagination, filters, sorter) => 
                handleTabTableChange(pagination, filters, sorter, true)
              }
              bordered
              scroll={{ x: 1300 }}
            />
          </Card>
        </TabPane>
      </Tabs>



        </>
      )}

       {/* Search Modal */}
       <Modal
        title="Tìm kiếm nâng cao"
        visible={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        footer={[
          <Button key="reset" onClick={() => setSearchCriteria({})}>
            Đặt lại
          </Button>,
          <Button key="cancel" onClick={() => setIsSearchModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="search"
            type="primary"
            onClick={() => {
              handleSearchUsers();
              setIsSearchModalVisible(false);
            }}
          >
            Tìm kiếm
          </Button>
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Username">
                <Input
                  value={searchCriteria.username}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, username: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input
                  value={searchCriteria.email}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, email: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Họ">
                <Input
                  value={searchCriteria.firstName}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, firstName: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên">
                <Input
                  value={searchCriteria.lastName}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, lastName: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        title="Thêm người dùng mới"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading.form} 
            onClick={handleCreateUser}
          >
            Tạo
          </Button>
        ]}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          name="createUserForm"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              {type: 'password', message: 'Mật khẩu dài trên 8 kí tự,1 chữ số,1 chữ viết hoa và 1 kí tự đặc biệt' },
              { 
      pattern: /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
      message: 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ số, 1 chữ hoa và 1 ký tự đặc biệt!' 
    }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="dob"
            label="Ngày sinh(Yêu cầu trên 18 tuổi)"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="residencyStatus"
            label="Tình trạng cư trú"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng cư trú!' }]}
            initialValue="THUONG_TRU"
          >
            <Select>
              {residencyOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading.form} 
            onClick={handleUpdateUser}
          >
            Cập nhật
          </Button>
        ]}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          name="editUserForm"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu mới(Chỉ điền nếu cần đổi) "
          >
            <Input.Password />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="residencyStatus"
            label="Tình trạng cư trú"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng cư trú!' }]}
          >
            <Select>
              {residencyOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Detail Modal */}
{/* User Detail Modal */}
<Modal
  title={
    <div style={{
      fontSize: "1.2rem",
      fontWeight: 600,
      textAlign: "center",
    }}>
      Chi tiết người dùng
    </div>
  }
  open={showDetailModal}
  onCancel={() => setShowDetailModal(false)}
  footer={[
    <Button key="close" onClick={() => setShowDetailModal(false)}>
      Đóng
    </Button>
  ]}
>
  {selectedUser && (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 300,
        }}
      >
        <tbody>
          {[
            ["ID", selectedUser.id],
            ["Username", selectedUser.username],
            ["Email", selectedUser.email],
            ["Họ", selectedUser.firstName],
            ["Tên", selectedUser.lastName],
            ["Ngày sinh", selectedUser.dob],
            ["Tình trạng cư trú", getResidencyStatusLabel(selectedUser.residencyStatus)],
          ].map(([label, value]) => (
            <tr key={label}>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  fontWeight: 500,
                  backgroundColor: "#f5f5f5",
                  width: "30%",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </th>
              <td
                style={{
                  padding: "8px",
                  wordBreak: "break-word",
                }}
              >
                {value}
              </td>
            </tr>
          ))}

          {/* Vai trò */}
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: 500,
                backgroundColor: "#f5f5f5",
                whiteSpace: "nowrap",
              }}
            >
              Vai trò
            </th>
            <td style={{ padding: "8px" }}>
              {selectedUser.roles?.map(role => (
                <Tag
                  key={role.name}
                  color={role.name === "ADMIN" ? "red" : "green"}
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 8,
                    marginRight: 4,
                  }}
                >
                  {role.name}
                </Tag>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )}
</Modal>


      {/* Make Admin Modal */}
      <Modal
        title="Xác nhận đặt làm admin"
        open={showMakeAdminModal}
        onCancel={() => setShowMakeAdminModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowMakeAdminModal(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => makeAdmin(selectedUser?.id)}
          >
            Xác nhận
          </Button>
        ]}
      >
        {selectedUser && (
          <p>
            Bạn có chắc chắn muốn đặt {selectedUser.username} ({selectedUser.email}) làm admin?
          </p>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;