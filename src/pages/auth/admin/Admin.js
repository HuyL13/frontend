import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Input,
  Select,
  Card,
  Form,
  Spin,
  Row,
  Col,
  Pagination,
  Badge,
  Divider,
  List,
  Typography,
  notification,
  InputNumber,
  Tooltip,
  Empty,
  Tabs,
  message
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  UserAddOutlined,
  HomeOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  SearchOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

const Admin = () => {
  // State for managing rooms and UI
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomResidents, setRoomResidents] = useState([]);
  
  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newResident, setNewResident] = useState({ name: "", age: "" });
  const [updateResident, setUpdateResident] = useState({ 
    oldName: "", oldAge: "", newName: "", newAge: "" 
  });
  
  // Modals visibility
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [residentModalVisible, setResidentModalVisible] = useState(false);
  const [addResidentModalVisible, setAddResidentModalVisible] = useState(false);
  const [updateResidentModalVisible, setUpdateResidentModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState({
    page: true,
    form: false,
    initial: true,
  });
  
  // Error state
  const [error, setError] = useState("");
  
  // Filter form
  const [filterForm] = Form.useForm();
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Search state
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({});

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((prev) => ({ ...prev, initial: false }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch rooms data when loading is complete
  useEffect(() => {
    if (!loading.initial) {
      fetchRooms();
      const intervalId = setInterval(fetchRooms, 10000000);
      return () => clearInterval(intervalId);
    }
  }, [loading.initial, pagination.current, pagination.pageSize]);

  // Reset selected room when modals close
  useEffect(() => {
    if (!detailModalVisible && !userModalVisible && !residentModalVisible && 
        !addUserModalVisible && !addResidentModalVisible && !updateResidentModalVisible) {
      resetSelected();
    }
  }, [detailModalVisible, userModalVisible, residentModalVisible, 
      addUserModalVisible, addResidentModalVisible, updateResidentModalVisible]);

  // Fetch rooms data
  const fetchRooms = async () => {
    setLoading((prev) => ({ ...prev, page: true }));
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room?page=${pagination.current - 1}&size=${pagination.pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách phòng");
      
      const data = await response.json();
      console.log("Room data:", data);
      
      const formattedRooms = data.content.map((room) => ({
        ...room,
        floor: room.floor ?? "Chưa cập nhật",
        peopleCount: room.peopleCount ?? 0,
        residentCount: room.residentCount ?? 0,
        key: room.id,
      }));
      
      setRooms(formattedRooms);
      setPagination({
        ...pagination,
        total: data.totalElements
      });
    } catch (error) {
      setError(error.message);
      notification.error({
        message: "Lỗi",
        description: error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, page: false }));
    }
  };

  // Search rooms with criteria
  const searchRooms = async (values) => {
    setLoading((prev) => ({ ...prev, page: true }));
    try {
      const token = localStorage.getItem("authToken");
      
      // Prepare criteria
      const criteria = {
        roomNumber: values.roomNumber || undefined,
        floor: values.floor !== undefined ? parseInt(values.floor) : undefined,
        peopleCount: values.peopleCount !== undefined ? parseInt(values.peopleCount) : undefined,
        residentCount: values.residentCount !== undefined ? parseInt(values.residentCount) : undefined,
        area: values.area !== undefined ? parseFloat(values.area) : undefined,
        roomType: values.roomType || undefined,
        status: values.status || undefined,
      };
      
      // Clean criteria
      Object.keys(criteria).forEach(key => {
        if (criteria[key] === undefined || (typeof criteria[key] === 'number' && isNaN(criteria[key]))) {
          delete criteria[key];
        }
      });

      // Create URL with pagination
      const url = new URL(`https://backend-13-6qob.onrender.com/demo/search/rooms`);
      url.searchParams.append('page', pagination.current - 1);
      url.searchParams.append('size', pagination.pageSize);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) throw new Error("Lỗi khi tìm kiếm phòng");
      
      const data = await response.json();
      const formattedRooms = data.content.map((room) => ({
        ...room,
        floor: room.floor ?? "Chưa cập nhật",
        peopleCount: room.peopleCount ?? 0,
        residentCount: room.residentCount ?? 0,
        key: room.id,
      }));
      
      setRooms(formattedRooms);
      setPagination({
        ...pagination,
        total: data.totalElements
      });
    } catch (error) {
      setError(error.message);
      notification.error({
        message: "Lỗi",
        description: error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, page: false }));
    }
  };

  // Fetch room details
  const fetchRoomDetails = async (roomId) => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/admin/room/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) throw new Error("Không thể lấy thông tin phòng");
      
      const roomData = await response.json();
      setSelectedRoom(roomData);
      setDetailModalVisible(true);
    } catch (error) {
      setError("Lỗi khi lấy thông tin phòng: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi lấy thông tin phòng: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Fetch room users
  const fetchRoomUsers = async (roomNumber) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/users?roomNumber=${roomNumber}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Không thể lấy danh sách người dùng");
      
      const data = await response.json();
      console.log("Room users:", data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Show room users
  const showRoomUsers = async (room) => {
    try {
      setSelectedRoom(room);
      setLoading((prev) => ({ ...prev, form: true }));
      const users = await fetchRoomUsers(room.roomNumber);
      setRoomUsers(users);
      setUserModalVisible(true);
    } catch (error) {
      setError("Lỗi khi lấy danh sách người dùng: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi lấy danh sách người dùng: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Fetch room residents
  const fetchRoomResidents = async (roomId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${roomId}/residents`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Không thể lấy danh sách cư dân");
      
      const data = await response.json();
      console.log("Room residents:", data);
      return data.result || [];
    } catch (error) {
      throw error;
    }
  };

  // Show room residents
  const showRoomResidents = async (room) => {
    try {
      console.log(room);
      setSelectedRoom(room);
      setLoading((prev) => ({ ...prev, form: true }));
      const residents = await fetchRoomResidents(room.id);
      setRoomResidents(residents);
      setResidentModalVisible(true);
    } catch (error) {
      setError("Lỗi khi lấy danh sách cư dân: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi lấy danh sách cư dân: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Add user to room
  const addUserToRoom = async () => {
    try {
      if (!newUsername.trim()) {
        setError("Vui lòng nhập tên người dùng");
        notification.warning({
          message: "Thiếu thông tin",
          description: "Vui lòng nhập tên người dùng",
        });
        return;
      }
      
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${selectedRoom.roomNumber}/users/${newUsername}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thêm người dùng thất bại");
      }
      
      // Refresh room data
      const updatedRoom = await response.json();
      setRooms(rooms.map(room => 
        room.id === updatedRoom.id ? {...updatedRoom, key: updatedRoom.id} : room
      ));
      
      // Update users list if user modal is open
      if (userModalVisible) {
        const users = await fetchRoomUsers(selectedRoom.roomNumber);
        setRoomUsers(users);
      }
      
      setNewUsername("");
      setAddUserModalVisible(false);
      setError("");
      notification.success({
        message: "Thành công",
        description: "Đã thêm người dùng vào phòng",
      });
    } catch (error) {
      setError("Lỗi khi thêm người dùng: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi thêm người dùng: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Remove user from room
  const handleRemoveUser = async (roomId, userId) => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${roomId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xóa người dùng khỏi phòng");
      }
      
      // Update rooms state
      setRooms(prevRooms => 
        prevRooms.map(room => {
          if (room.id === roomId) {
            const updatedUserIds = room.userIds.filter(id => id !== userId);
            return { 
              ...room, 
              userIds: updatedUserIds,
              peopleCount: room.peopleCount > 0 ? room.peopleCount - 1 : 0,
              key: room.id
            };
          }
          return room;
        })
      );
      
      // Update users list
      const updatedUsers = roomUsers.filter((_, index) => 
        selectedRoom.userIds[index] !== userId
      );
      setRoomUsers(updatedUsers);
      
      notification.success({
        message: "Thành công",
        description: "Đã xóa người dùng khỏi phòng",
      });
    } catch (err) {
      setError("Lỗi: " + err.message);
      notification.error({
        message: "Lỗi",
        description: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Add resident to room
  const addResidentToRoom = async () => {
    try {
      if (!newResident.name.trim() || !newResident.age) {
        setError("Vui lòng nhập đầy đủ thông tin cư dân");
        notification.warning({
          message: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ thông tin cư dân",
        });
        return;
      }
      
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${selectedRoom.id}/residents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newResident.name,
            age: parseInt(newResident.age)
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thêm cư dân thất bại");
      }
      
      // Refresh resident list if residents modal is open
      if (residentModalVisible) {
        const residents = await fetchRoomResidents(selectedRoom.id);
        setRoomResidents(residents);
      }
      
      // Update room in list
      setRooms(prevRooms => 
        prevRooms.map(room => {
          if (room.id === selectedRoom.id) {
            return { 
              ...room, 
              residentCount: (room.residentCount || 0) + 1,
              status: "OCCUPIED", // Update status if a resident is added
              key: room.id
            };
          }
          return room;
        })
      );
      
      setNewResident({ name: "", age: "" });
      setAddResidentModalVisible(false);
      setError("");
      notification.success({
        message: "Thành công",
        description: "Thêm cư dân thành công",
      });
    } catch (error) {
      setError("Lỗi khi thêm cư dân: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi thêm cư dân: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Update resident in room
  const updateResidentInRoom = async () => {
    try {
      if (!updateResident.oldName.trim() || !updateResident.oldAge || 
          !updateResident.newName.trim() || !updateResident.newAge) {
        setError("Vui lòng nhập đầy đủ thông tin cư dân");
        notification.warning({
          message: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ thông tin cư dân",
        });
        return;
      }
      
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${selectedRoom.id}/residents`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldName: updateResident.oldName,
            oldAge: parseInt(updateResident.oldAge),
            newName: updateResident.newName,
            newAge: parseInt(updateResident.newAge)
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật cư dân thất bại");
      }
      
      // Refresh resident list
      const residents = await fetchRoomResidents(selectedRoom.id);
      setRoomResidents(residents);
      
      setUpdateResident({ oldName: "", oldAge: "", newName: "", newAge: "" });
      setUpdateResidentModalVisible(false);
      setError("");
      notification.success({
        message: "Thành công",
        description: "Cập nhật cư dân thành công",
      });
    } catch (error) {
      setError("Lỗi khi cập nhật cư dân: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi cập nhật cư dân: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Delete resident from room
  const deleteResident = async (residentName, residentAge) => {
    const ok = window.confirm('Are you sure you want to delete this resident?');
  if (!ok) return;
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/room/${selectedRoom.id}/residents`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: residentName,
            age: residentAge
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xóa cư dân thất bại");
      }
      
      // Update resident list
      const updatedResidents = roomResidents.filter(
        resident => !(resident.name === residentName && resident.age === residentAge)
      );
      setRoomResidents(updatedResidents);
      
      // Update room in list
      setRooms(prevRooms => 
        prevRooms.map(room => {
          if (room.id === selectedRoom.id) {
            const newResidentCount = Math.max(0, (room.residentCount || 0) - 1);
            return { 
              ...room, 
              residentCount: newResidentCount,
              status: newResidentCount <= 0 ? "VACANT" : "OCCUPIED",
              key: room.id
            };
          }
          return room;
        })
      );
      
      notification.success({
        message: "Thành công",
        description: "Xóa cư dân thành công",
      });
    } catch (error) {
      setError("Lỗi khi xóa cư dân: " + error.message);
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi xóa cư dân: " + error.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Reset selected room
  const resetSelected = () => {
    setSelectedRoom(null);
    setRoomUsers([]);
    setRoomResidents([]);
  };

  // Get room status badge
  const getRoomStatusBadge = (status) => {
    if (!status) return <Badge status="default" text="Không xác định" />;
    switch (status) {
      case "OCCUPIED": return <Badge status="success" text="Đã thuê" />;
      case "VACANT": return <Badge status="processing" text="Trống" />;
      default: return <Badge status="default" text={status} />;
    }
  };

  // Reset filter form
  const resetFilters = () => {
    filterForm.resetFields();
    fetchRooms();
  };

  const handleSearchRooms = async (criteria, params = {}) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const queryParams = new URLSearchParams({
        page: params.page || searchPagination.current - 1,
        size: params.size || searchPagination.pageSize,
        sort: 'roomNumber,asc'
      });
  
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/search/rooms?${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(criteria),
        }
      );
  
      if (!response.ok) throw new Error("Lỗi khi tìm kiếm phòng");
      
      const data = await response.json();
      const formattedResults = data.content.map((room) => ({
        ...room,
        floor: room.floor ?? "Chưa cập nhật",
        peopleCount: room.peopleCount ?? 0,
        residentCount: room.residentCount ?? 0,
        key: room.id,
      }));
      
      setSearchResults(formattedResults);
      setSearchPagination({
        current: (params.page || 0) + 1,
        pageSize: params.size || 10,
        total: data.totalElements
      });
      setSearchCriteria(criteria); // Cập nhật searchCriteria sau khi tìm kiếm
      setActiveTabKey('2');
    } catch (error) {
      message.error('Lỗi tìm kiếm: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };
  // Handle tab change
  const handleTabChange = (activeKey) => {
    setActiveTabKey(activeKey);
    // Gọi lại search với criteria hiện tại khi chuyển tab
    if (activeKey === '2' && Object.keys(searchCriteria).length > 0) {
      handleSearchRooms(searchCriteria);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Tầng',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      render: (text) => text ? `${text} m²` : 'N/A',
    },
    {
      title: 'Người dùng',
      dataIndex: 'peopleCount',
      key: 'peopleCount',
      render: (text) => `${text} người`,
    },
    {
      title: 'Cư dân',
      dataIndex: 'residentCount',
      key: 'residentCount',
      render: (text) => `${text} người`,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'roomType',
      key: 'roomType',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getRoomStatusBadge(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button 
              type="primary" 
              icon={<InfoCircleOutlined />} 
              onClick={() => fetchRoomDetails(record.id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Danh sách người dùng">
            <Button 
              type="default" 
              icon={<TeamOutlined />} 
              onClick={() => showRoomUsers(record)}
              size="small"
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Thêm người dùng">
            <Button 
              type="default" 
              icon={<UserAddOutlined />} 
              onClick={() => {
                setSelectedRoom(record);
                setAddUserModalVisible(true);
              }}
              size="small"
              style={{ color: '#1890ff', borderColor: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Danh sách cư dân">
            <Button 
              type="default" 
              icon={<HomeOutlined />} 
              onClick={() => showRoomResidents(record)}
              size="small"
              style={{ color: '#faad14', borderColor: '#faad14' }}
            />
          </Tooltip>
          <Tooltip title="Thêm cư dân">
            <Button 
              type="default" 
              icon={<UserAddOutlined />} 
              onClick={() => {
                setSelectedRoom(record);
                setAddResidentModalVisible(true);
              }}
              size="small"
              style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Search Modal Component
  const SearchModal = () => {
    const [form] = Form.useForm();
  
    // Khởi tạo form values từ searchCriteria hiện tại
    useEffect(() => {
      form.setFieldsValue(searchCriteria);
    }, [isSearchModalVisible]);
  
    const handleReset = () => {
      form.resetFields();
      setSearchCriteria({});
    };
  
    const handleSearch = async () => {
      try {
        const values = await form.validateFields();
        // Gọi trực tiếp handleSearchRooms với values từ form
        handleSearchRooms(values);
        setIsSearchModalVisible(false);
      } catch (error) {
        console.log('Validation Failed:', error);
      }
    };
  
    return (
      <Modal
        title="Tìm kiếm nâng cao"
        visible={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        footer={[
          <Button key="reset" onClick={handleReset}>
            Đặt lại
          </Button>,
          <Button key="cancel" onClick={() => setIsSearchModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="search"
            type="primary"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        ]}
        centered
        destroyOnClose={false}
        maskClosable={false}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={searchCriteria}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số phòng" name="roomNumber">
                <Input />
              </Form.Item>
              
              <Form.Item label="Tầng" name="floor">
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1}
                  max={50}
                />
              </Form.Item>
  
              <Form.Item label="Số lượng người" name="peopleCount">
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
  
            <Col span={12}>
              <Form.Item label="Diện tích" name="area">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>
  
              <Form.Item label="Loại phòng" name="roomType">
                <Select allowClear>
                  <Option value="STANDARD">Tiêu chuẩn</Option>
                  <Option value="KIOT">Kiot</Option>
                  <Option value="PENHOUSE">Penhouse</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
  
          <Form.Item label="Trạng thái" name="status">
            <Select allowClear>
              <Option value="VACANT">Trống</Option>
              <Option value="OCCUPIED">Đã thuê</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

// Main component render
return (
  <div style={{ padding: 24 }}>
    <Card
      title={
        <Space>
          <HomeOutlined />
          <Text strong>Quản lý Phòng</Text>
        </Space>
      }
      
    >
      <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
        <TabPane tab="Danh sách phòng" key="1">
          <Spin spinning={loading.page}>
            <Table
              columns={columns}
              dataSource={rooms}
              pagination={false}
              scroll={{ x: 1300 }}
              locale={{
                emptyText: error ? (
                  <Empty
                    description={<Text type="danger">{error}</Text>}
                  />
                ) : (
                  <Empty description="Không có dữ liệu" />
                )
              }}
            />
            <Divider />
            <Row justify="end" style={{ marginTop: 16 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(page, pageSize) => setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize
                }))}
                showSizeChanger
                showQuickJumper
              />
            </Row>
          </Spin>
        </TabPane>

        <TabPane tab="Kết quả tìm kiếm" key="2" forceRender>
          <Spin spinning={searchLoading}>
          
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={() => setIsSearchModalVisible(true)}
        >
          Tìm kiếm nâng cao
        </Button>
      
            <Table
              columns={columns}
              dataSource={searchResults}
              pagination={false}
              scroll={{ x: 1300 }}
              locale={{
                emptyText: searchLoading ? (
                  <Empty description="Đang tải..." />
                ) : (
                  <Empty description="Không có kết quả phù hợp" />
                )
              }}
            />
            <Divider />
            <Row justify="end" style={{ marginTop: 16 }}>
  <Pagination
    current={searchPagination.current}
    pageSize={searchPagination.pageSize}
    total={searchPagination.total}
    onChange={(page, pageSize) => handleSearchRooms(searchCriteria, {
      page: page - 1,
      size: pageSize
    })}
    showSizeChanger
    showQuickJumper
  />
</Row>
          </Spin>
        </TabPane>
      </Tabs>
    </Card>

    {/* Room Details Modal */}
    <Modal
      title={`Chi tiết phòng ${selectedRoom?.roomNumber}`}
      visible={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={null}
      width={600}
    >
      <Spin spinning={loading.form}>
        {selectedRoom && (
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: 'Số phòng', value: selectedRoom.roomNumber },
              { label: 'Tầng', value: selectedRoom.floor },
              { label: 'Diện tích', value: `${selectedRoom.area} m²` },
              { label: 'Loại phòng', value: selectedRoom.roomType },
              { label: 'Trạng thái', value: getRoomStatusBadge(selectedRoom.status) },
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{item.label}</Text>}
                  description={item.value}
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Modal>

    {/* User Management Modals */}
    <Modal
      title={`Quản lý người dùng - Phòng ${selectedRoom?.roomNumber}`}
      visible={userModalVisible}
      onCancel={() => setUserModalVisible(false)}
      footer={null}
      width={800}
    >
      <Spin spinning={loading.form}>
        <List
          header={<Text strong>Danh sách người dùng</Text>}
          bordered
          dataSource={roomUsers}
          renderItem={(user, index) => (
            <List.Item
              actions={[
                <Tooltip title="Xóa khỏi phòng">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveUser(selectedRoom.id, selectedRoom.userIds[index])}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={<UserOutlined />}
                title={user.username}
                description={user.email}
              />
            </List.Item>
          )}
        />
      </Spin>
    </Modal>

    <Modal
      title="Thêm người dùng vào phòng"
      visible={addUserModalVisible}
      onCancel={() => setAddUserModalVisible(false)}
      onOk={addUserToRoom}
      confirmLoading={loading.form}
    >
      <Input
        placeholder="Nhập tên người dùng"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        prefix={<UserOutlined />}
      />
    </Modal>

    {/* Resident Management Modals */}
    <Modal
      title={`Quản lý cư dân - Phòng ${selectedRoom?.roomNumber}`}
      visible={residentModalVisible}
      onCancel={() => setResidentModalVisible(false)}
      footer={null}
      width={800}
    >
      <Spin spinning={loading.form}>
        <List
          header={
            <Space>
              <Text strong>Danh sách cư dân</Text>
              <Button
                type="dashed"
                icon={<EditOutlined />}
                onClick={() => setUpdateResidentModalVisible(true)}
              >
                Cập nhật thông tin
              </Button>
            </Space>
          }
          bordered
          dataSource={roomResidents}
          renderItem={(resident) => (
            <List.Item
              actions={[
                <Tooltip title="Xóa cư dân">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteResident(resident.name, resident.age)}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                title={resident.name}
                description={`Tuổi: ${resident.age}`}
              />
            </List.Item>
          )}
        />
      </Spin>
    </Modal>

    <Modal
      title="Thêm cư dân vào phòng"
      visible={addResidentModalVisible}
      onCancel={() => setAddResidentModalVisible(false)}
      onOk={addResidentToRoom}
      confirmLoading={loading.form}
    >
      <Input
        placeholder="Tên cư dân"
        value={newResident.name}
        onChange={(e) => setNewResident({...newResident, name: e.target.value})}
        style={{ marginBottom: 16 }}
      />
      <InputNumber
        placeholder="Tuổi"
        value={newResident.age}
        onChange={(value) => setNewResident({...newResident, age: value})}
        style={{ width: '100%' }}
      />
    </Modal>

    <Modal
      title="Cập nhật thông tin cư dân"
      visible={updateResidentModalVisible}
      onCancel={() => setUpdateResidentModalVisible(false)}
      onOk={updateResidentInRoom}
      confirmLoading={loading.form}
    >
      <Input
        placeholder="Tên cũ"
        value={updateResident.oldName}
        onChange={(e) => setUpdateResident({...updateResident, oldName: e.target.value})}
        style={{ marginBottom: 16 }}
      />
      <InputNumber
        placeholder="Tuổi cũ"
        value={updateResident.oldAge}
        onChange={(value) => setUpdateResident({...updateResident, oldAge: value})}
        style={{ width: '100%', marginBottom: 16 }}
      />
      <Input
        placeholder="Tên mới"
        value={updateResident.newName}
        onChange={(e) => setUpdateResident({...updateResident, newName: e.target.value})}
        style={{ marginBottom: 16 }}
      />
      <InputNumber
        placeholder="Tuổi mới"
        value={updateResident.newAge}
        onChange={(value) => setUpdateResident({...updateResident, newAge: value})}
        style={{ width: '100%' }}
      />
    </Modal>

    <SearchModal />
  </div>
);
};

export default Admin;