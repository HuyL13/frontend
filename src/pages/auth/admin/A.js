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
  Empty,Tabs
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  UserAddOutlined,
  HomeOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined
} from "@ant-design/icons";

import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;

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
  

// Thêm vào component Admin
const { TabPane } = Tabs;
const [activeTabKey, setActiveTabKey] = useState('1');
const [searchResults, setSearchResults] = useState([]);
const [searchPagination, setSearchPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0
});
const [searchLoading, setSearchLoading] = useState(false);
const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

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
        `http://localhost:22986/demo/admin/room?page=${pagination.current - 1}&size=${pagination.pageSize}`,
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
      const url = new URL(`http://localhost:22986/demo/search/rooms`);
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
      const response = await fetch(`http://localhost:22986/demo/admin/room/${roomId}`, {
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
        `http://localhost:22986/demo/admin/room/users?roomNumber=${roomNumber}`,
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
        `http://localhost:22986/demo/admin/room/${roomId}/residents`,
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
        `http://localhost:22986/demo/admin/room/${selectedRoom.roomNumber}/users/${newUsername}`,
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
        `http://localhost:22986/demo/admin/room/${roomId}/users/${userId}`,
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
        `http://localhost:22986/demo/admin/room/${selectedRoom.id}/residents`,
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
        `http://localhost:22986/demo/admin/room/${selectedRoom.id}/residents`,
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
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:22986/demo/admin/room/${selectedRoom.id}/residents`,
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

  const SearchModal = () => (
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
            handleSearchRooms();
            setIsSearchModalVisible(false);
          }}
        >
          Tìm kiếm
        </Button>
      ]}
      width={800}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Số phòng">
              <Input
                value={searchCriteria.roomNumber}
                onChange={e => setSearchCriteria({...searchCriteria, roomNumber: e.target.value})}
              />
            </Form.Item>
            <Form.Item label="Tầng">
              <InputNumber
                style={{ width: '100%' }}
                value={searchCriteria.floor}
                onChange={value => setSearchCriteria({...searchCriteria, floor: value})}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Loại phòng">
              <Select
                value={searchCriteria.roomType}
                onChange={value => setSearchCriteria({...searchCriteria, roomType: value})}
              >
                <Option value="">Tất cả</Option>
                <Option value="KIOT">Kiot</Option>
                <Option value="STANDARD">Tiêu chuẩn</Option>
                <Option value="PENHOUSE">Penthouse</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Trạng thái">
              <Select
                value={searchCriteria.status}
                onChange={value => setSearchCriteria({...searchCriteria, status: value})}
              >
                <Option value="">Tất cả</Option>
                <Option value="VACANT">Trống</Option>
                <Option value="OCCUPIED">Đã thuê</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Số người dùng tối thiểu">
              <InputNumber
                style={{ width: '100%' }}
                value={searchCriteria.minPeople}
                onChange={value => setSearchCriteria({...searchCriteria, minPeople: value})}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số cư dân tối thiểu">
              <InputNumber
                style={{ width: '100%' }}
                value={searchCriteria.minResidents}
                onChange={value => setSearchCriteria({...searchCriteria, minResidents: value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
  const handleSearchRooms = async (params = {}) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const queryParams = new URLSearchParams({
        page: params.page || searchPagination.current - 1,
        size: params.size || searchPagination.pageSize,
        sort: 'roomNumber,asc'
      });
  
      const response = await fetch(
        `http://localhost:22986/demo/search/rooms?${queryParams}`,
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
      setSearchPagination({
        current: (params.page || 0) + 1,
        pageSize: params.size || 10,
        total: data.totalElements
      });
      setActiveTabKey('2');
    } catch (error) {
      message.error('Lỗi tìm kiếm: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <SearchModal/>
      {loading.initial ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Filter Card */}
          <Card title="Lọc phòng" style={{ marginBottom: 20 }}>
            <Form
              form={filterForm}
              layout="vertical"
              onFinish={searchRooms}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="roomNumber" label="Số phòng">
                    <Input placeholder="Nhập số phòng" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="floor" label="Tầng">
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập tầng" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="peopleCount" label="Số người dùng">
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập số người dùng" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="residentCount" label="Số cư dân">
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập số cư dân" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="area" label="Diện tích">
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập diện tích" step={0.1} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="roomType" label="Loại phòng">
                    <Select placeholder="Chọn loại phòng">
                      <Option value="">Tất cả</Option>
                      <Option value="KIOT">Kiot</Option>
                      <Option value="STANDARD">Tiêu chuẩn</Option>
                      <Option value="PENHOUSE">Penthouse</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select placeholder="Chọn trạng thái">
                      <Option value="">Tất cả</Option>
                      <Option value="VACANT">Trống</Option>
                      <Option value="OCCUPIED">Đã thuê</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={16} style={{ textAlign: 'right', marginTop: 30 }}>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Lọc
                    </Button>
                    <Button onClick={resetFilters}>
                      Đặt lại
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Room Table */}
          <Card title="Danh sách phòng">
            <Table 
              columns={columns} 
              dataSource={rooms} 
              rowKey="id"
              loading={loading.page}
              pagination={false}
              size="middle"
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination 
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize
                  });
                }}
                showSizeChanger
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phòng`}
              />
            </div>
          </Card>

          {/* Room Detail Modal */}
          <Modal
            title={`Chi tiết phòng ${selectedRoom?.roomNumber || ''}`}
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={600}
          >
            {loading.form ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : selectedRoom ? (
              <Card bordered={false}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Số phòng:</Text> {selectedRoom.roomNumber || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Tầng:</Text> {selectedRoom.floor || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Diện tích:</Text> {selectedRoom.area ? `${selectedRoom.area} m²` : 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Loại phòng:</Text> {selectedRoom.roomType || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Trạng thái:</Text> {getRoomStatusBadge(selectedRoom.status)}
                  </Col>
                  <Col span={12}>
                    <Text strong>Số người dùng:</Text> {selectedRoom.peopleCount || 0}
                  </Col>
                  <Col span={12}>
                    <Text strong>Số cư dân:</Text> {selectedRoom.residentCount || 0}
                  </Col>
                </Row>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    type="primary" 
                    onClick={() => showRoomUsers(selectedRoom)}
                  >
                    Xem người dùng
                  </Button>
                  <Button 
                    onClick={() => showRoomResidents(selectedRoom)}
                  >
                    Xem cư dân
                  </Button>
                </div>
              </Card>
            ) : (
              <div>Không có dữ liệu phòng</div>
            )}
          </Modal>

          {/* Room Users Modal */}
          <Modal
            title={`Người dùng phòng ${selectedRoom?.roomNumber || ''}`}
            visible={userModalVisible}
            onCancel={() => setUserModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setUserModalVisible(false)}>
                Đóng
              </Button>,
              <Button 
                key="add" 
                type="primary" 
                onClick={() => {
                  setUserModalVisible(false);
                  setAddUserModalVisible(true);
                }}
              >
                Thêm người dùng
              </Button>,
            ]}
            width={600}
          >
            {loading.form ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : roomUsers.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={roomUsers}
                renderItem={(user, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveUser(selectedRoom.id, selectedRoom.userIds[index])}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<UserOutlined style={{ fontSize: '24px' }} />}
                      title={user}
                      description={`ID người dùng: ${selectedRoom.userIds[index]}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có người dùng trong phòng này" />
            )}
          </Modal>

          {/* Add User Modal */}
          <Modal
            title={`Thêm người dùng vào phòng ${selectedRoom?.roomNumber || ''}`}
            visible={addUserModalVisible}
            onOk={addUserToRoom}
            onCancel={() => setAddUserModalVisible(false)}
            confirmLoading={loading.form}
          >
            <Form layout="vertical">
              <Form.Item
                label="Tên người dùng"
                required
                validateStatus={error && !newUsername ? 'error' : ''}
                help={error && !newUsername ? 'Vui lòng nhập tên người dùng' : ''}
              >
                <Input 
                  placeholder="Nhập tên người dùng" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Room Residents Modal */}
          <Modal
            title={`Cư dân phòng ${selectedRoom?.roomNumber || ''}`}
            visible={residentModalVisible}
            onCancel={() => setResidentModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setResidentModalVisible(false)}>
                Đóng
              </Button>,
              <Button 
                key="add" 
                type="primary" 
                onClick={() => {
                  setResidentModalVisible(false);
                  setAddResidentModalVisible(true);
                }}
              >
                Thêm cư dân
              </Button>,
              <Button 
                key="update"
                onClick={() => {
                  setResidentModalVisible(false);
                  setUpdateResidentModalVisible(true);
                }}
              >
                Cập nhật cư dân
              </Button>
            ]}
            width={600}
          >
            {loading.form ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : roomResidents.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={roomResidents}
                renderItem={(resident) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => deleteResident(resident.name, resident.age)}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<UserOutlined style={{ fontSize: '24px' }} />}
                      title={resident.name}
                      description={`Tuổi: ${resident.age}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có cư dân trong phòng này" />
            )}
          </Modal>

          {/* Add Resident Modal */}
          <Modal
            title={`Thêm cư dân vào phòng ${selectedRoom?.roomNumber || ''}`}
            visible={addResidentModalVisible}
            onOk={addResidentToRoom}
            onCancel={() => setAddResidentModalVisible(false)}
            confirmLoading={loading.form}
          >
            <Form layout="vertical">
              <Form.Item
                label="Tên cư dân"
                required
                validateStatus={error && !newResident.name ? 'error' : ''}
                help={error && !newResident.name ? 'Vui lòng nhập tên cư dân' : ''}
              >
                <Input 
                  placeholder="Nhập tên cư dân" 
                  value={newResident.name}
                  onChange={(e) => setNewResident({...newResident, name: e.target.value})}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
              <Form.Item
                label="Tuổi"
                required
                validateStatus={error && !newResident.age ? 'error' : ''}
                help={error && !newResident.age ? 'Vui lòng nhập tuổi' : ''}
              >
                <InputNumber 
                  placeholder="Nhập tuổi" 
                  style={{ width: '100%' }}
                  min={0}
                  value={newResident.age}
                  onChange={(value) => setNewResident({...newResident, age: value})}
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Update Resident Modal */}
          <Modal
            title={`Cập nhật cư dân trong phòng ${selectedRoom?.roomNumber || ''}`}
            visible={updateResidentModalVisible}
            onOk={updateResidentInRoom}
            onCancel={() => setUpdateResidentModalVisible(false)}
            confirmLoading={loading.form}
          >
            <Form layout="vertical">
              <Title level={5}>Thông tin cư dân hiện tại</Title>
              <Form.Item
                label="Tên hiện tại"
                required
                validateStatus={error && !updateResident.oldName ? 'error' : ''}
                help={error && !updateResident.oldName ? 'Vui lòng nhập tên cư dân hiện tại' : ''}
              >
                <Input 
                  placeholder="Nhập tên cư dân hiện tại" 
                  value={updateResident.oldName}
                  onChange={(e) => setUpdateResident({...updateResident, oldName: e.target.value})}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
              <Form.Item
                label="Tuổi hiện tại"
                required
                validateStatus={error && !updateResident.oldAge ? 'error' : ''}
                help={error && !updateResident.oldAge ? 'Vui lòng nhập tuổi hiện tại' : ''}
              >
                <InputNumber 
                  placeholder="Nhập tuổi hiện tại" 
                  style={{ width: '100%' }}
                  min={0}
                  value={updateResident.oldAge}
                  onChange={(value) => setUpdateResident({...updateResident, oldAge: value})}
                />
              </Form.Item>

              <Divider />
              <Title level={5}>Thông tin cư dân mới</Title>
              <Form.Item
                label="Tên mới"
                required
                validateStatus={error && !updateResident.newName ? 'error' : ''}
                help={error && !updateResident.newName ? 'Vui lòng nhập tên cư dân mới' : ''}
              >
                <Input 
                  placeholder="Nhập tên cư dân mới" 
                  value={updateResident.newName}
                  onChange={(e) => setUpdateResident({...updateResident, newName: e.target.value})}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
              <Form.Item
                label="Tuổi mới"
                required
                validateStatus={error && !updateResident.newAge ? 'error' : ''}
                help={error && !updateResident.newAge ? 'Vui lòng nhập tuổi mới' : ''}
              >
                <InputNumber 
                  placeholder="Nhập tuổi mới" 
                  style={{ width: '100%' }}
                  min={0}
                  value={updateResident.newAge}
                  onChange={(value) => setUpdateResident({...updateResident, newAge: value})}
                />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Admin;