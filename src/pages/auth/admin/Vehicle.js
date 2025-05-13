import React, { useState, useEffect } from 'react';

import { 
  Table, Button, Modal, Form, Input, Select, Tag, Spin, 
  message as antMessage, Tooltip, Card, Divider, Row, Col, Typography 
} from 'antd';
import { 
  CarOutlined, ReloadOutlined, PlusOutlined, 
  SwapOutlined, NumberOutlined, IdcardOutlined 
} from '@ant-design/icons';
import carImage from './vehicle/car_top_view.jpg';
import motorbikeImage from './vehicle/motor_top_view.png';
import "../../../styles/Vehicle.css";

const { Option } = Select;
const { Title, Text } = Typography;

const Vehicle = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [lotVehicles, setLotVehicles] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lotLoading, setLotLoading] = useState(false);
  const [visualView, setVisualView] = useState(true);
  const [registerAssignModal, setRegisterAssignModal] = useState(false);
  const [selectedEmptyLot, setSelectedEmptyLot] = useState(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [registerAssignForm] = Form.useForm();
  
  const [selectedOccupiedLot, setSelectedOccupiedLot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Define standard parking lot layout dimensions
  const carRowCount = 4;
  const carColCount = 4;
  const motorbikeRowCount = 14;
  const motorbikeColCount = 5;

  const [createLoading, setCreateLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [registerAssignLoading, setRegisterAssignLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState({});

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const token = localStorage.getItem("authToken");
      setLotLoading(true);
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }
      const data = await response.json();
      setParkingLots(data);
      console.log("success");
    } catch (error) {
      antMessage.error('Failed to load parking lots: ' + error.message);
    } finally {
      setLotLoading(false);
    }
  };

  const fetchLotVehicles = async (lotId) => {
    try {
      const token = localStorage.getItem("authToken");
      setLoading(true);
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/admin/api/parking-lots/${lotId}/vehicles`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lot vehicles');
      }
      const data = await response.json();
      setLotVehicles(data);
      console.log("success");
    } catch (error) {
      antMessage.error('Failed to load vehicles: ' + error.message);
      setLotVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (vehicleId, lotId) => {
    try {
      setUnassignLoading(prev => ({ ...prev, [vehicleId]: true }));

      // Thông báo xác nhận bằng alert (ko có Cancel)
      alert('Bạn sắp huỷ gán xe khỏi bãi. Tiếp tục?');

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/admin/api/parking-lots/unassign-vehicle/${vehicleId}`,
        {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );

      if (response.status === 204 || response.ok) {
        antMessage.success('Vehicle unassigned successfully');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Unassignment failed');
      }

      // Cập nhật lại UI
      await fetchLotVehicles(lotId);
      fetchParkingLots();
    } catch (error) {
      antMessage.error(error.message);
    } finally {
      setUnassignLoading(prev => ({ ...prev, [vehicleId]: false }));
    }
  };

  // Helper function to validate license plate format
  const validateLicensePlate = (type, value) => {
    if (!value) return { valid: false, message: 'Vui lòng nhập biển số' };
    
    const carPattern = /^\d{2}[A-Z]-\d{3}\.\d{2}$/; // Ví dụ: 37A-123.24
    const motorbikePattern = /^\d{2}[A-Z]\d-\d{3}\.\d{2}$/; // Ví dụ: 37A2-123.42
    
    let isValid = false;
    switch(type) {
      case 'CAR':
        isValid = carPattern.test(value.toUpperCase());
        break;
      case 'MOTORBIKE':
        isValid = motorbikePattern.test(value.toUpperCase());
        break;
      default:
        return { valid: false, message: 'Vui lòng chọn loại phương tiện trước' };
    }

    return {
      valid: isValid,
      message: isValid ? '' : `Biển số không hợp lệ cho ${type === 'CAR' ? 'Ô tô' : 'Xe máy'}. Ví dụ: ${type === 'CAR' ? '37A-123.24' : '37A2-123.42'}`
    };
  };

  const handleCreateVehicle = async (values) => {
    const validationResult = validateLicensePlate(values.type, values.licensePlate);
    if (!validationResult.valid) {
      antMessage.error(validationResult.message);
      return;
    }
    
    try {
      setCreateLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/room/${values.roomId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          licensePlate: values.licensePlate,
          type: values.type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle');
      }

      await response.json();
      antMessage.success('Vehicle created successfully');
      console.log("success");
      setCreateVisible(false);
      form.resetFields();
      fetchParkingLots();
    } catch (error) {
      antMessage.error(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignVehicle = async (values) => {
    try {
      setAssignLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/api/vehicles/${values.lotId}/assign-vehicle/${values.vehicleId}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Assignment failed');
      }

      await response.json();
      antMessage.success('Vehicle assigned successfully');
      console.log("success");
      setAssignVisible(false);
      assignForm.resetFields();
      fetchParkingLots();
      if (selectedLot) fetchLotVehicles(selectedLot.id);
    } catch (error) {
      antMessage.error(error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRegisterAndAssign = async (values) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      antMessage.error("Authentication token not found. Please log in again.");
      return;
    }
  
    if (!values?.roomId || !values?.licensePlate || !values?.type) {
      antMessage.error("Missing vehicle registration information.");
      return;
    }
  
    if (!selectedEmptyLot?.id) {
      antMessage.error("No parking lot selected for assignment.");
      return;
    }
  
    const validationResult = validateLicensePlate(values.type, values.licensePlate);
    if (!validationResult.valid) {
      antMessage.error(validationResult.message);
      return;
    }
  
    try {
      setRegisterAssignLoading(true);
      // Step 1: Register vehicle
      console.log("🚗 Registering vehicle:", values);
  
      const registerRes = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/room/${values.roomId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          licensePlate: values.licensePlate,
          type: values.type,
        }),
      });
      
      console.log(registerRes);
      if (!registerRes.ok) {
        const err = await registerRes.json().catch(() => ({}));
        console.log("wrong");
        throw new Error(err.error || `Vehicle registration failed (Status: ${registerRes.status})`);
      }
  
      const vehicle = await registerRes.json();
      console.log("hâha", vehicle);
      if (!vehicle?.id) throw new Error("Invalid vehicle data returned.");
  
      console.log("✅ Vehicle registered:", vehicle);
  
      // Step 2: Assign vehicle to lot
      console.log(`📦 Assigning vehicle ${vehicle.id} to lot ${selectedEmptyLot.id}`);
  
      const assignRes = await fetch(
        `https://backend-13-6qob.onrender.com/demo/api/vehicles/${selectedEmptyLot.id}/assign-vehicle/${vehicle.id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      if (!assignRes.ok) {
        const err = await assignRes.json().catch(() => ({}));
        throw new Error(err.error || `Assignment failed (Status: ${assignRes.status})`);
      }
  
      const lot = await assignRes.json();
      console.log("✅ Vehicle assigned to lot:", lot);
  
      antMessage.success("Vehicle registered and assigned to lot successfully");
      setRegisterAssignModal(false);
      registerAssignForm.resetFields();
  
      // Refresh UI data
      await Promise.all([fetchParkingLots()]);
  
      if (selectedLot?.id === selectedEmptyLot.id) {
        await fetchLotVehicles(selectedLot.id);
      }
  
    } catch (error) {
      console.error("❌ Register and assign error:", error);
      antMessage.error(error.message || "An unknown error occurred");
    } finally {
      setRegisterAssignLoading(false);
    }
  };

  // Helper function to determine if a lot has a specific vehicle type
  const getLotVehicleDetails = (lot) => {
    if (!lot.occupied || !lot.vehicleIds || lot.vehicleIds.length === 0) {
      return null;
    }
    
    // Find vehicle information if available
    return allVehicles.find(v => lot.vehicleIds.includes(v.id)) || { type: lot.type };
  };

  const parkingLotColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Số hiệu lot',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      sorter: (a, b) => a.lotNumber.localeCompare(b.lotNumber),
      width: '20%',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={type === 'CAR' ? 'blue' : 'orange'}>{type}</Tag>,
      filters: [
        { text: 'Ô tô', value: 'CAR' },
        { text: 'Xe máy', value: 'MOTORBIKE' },
      ],
      onFilter: (value, record) => record.type === value,
      width: '15%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'occupied',
      render: occupied => (
        <Tag color={occupied ? 'red' : 'green'}>
          {occupied ? 'Occupied' : 'Available'}
        </Tag>
      ),
      filters: [
        { text: 'Đã có phương tiện', value: true },
        { text: 'Trống', value: false },
      ],
      onFilter: (value, record) => record.occupied === value,
      width: '15%',
    },
    {
      title: 'Phương tiện',
      dataIndex: 'vehicleIds',
      render: (ids, record) => {
        if (!ids || ids.length === 0) return 'None';
        return (
          <span>
            {ids.length} vehicle{ids.length > 1 ? 's' : ''}
          </span>
        );
      },
      width: '15%',
    },
    {
    title: 'Thao tác',
    key: 'actions',
    render: (_, record) => {
      // Chỉ hiển thị nút Unassign nếu có xe
      if (!record.occupied || !record.vehicleIds || record.vehicleIds.length === 0) {
        return null;
      }
      return (
        <Button 
          danger 
          onClick={() => handleUnassign(record.id, selectedOccupiedLot?.id)}
          loading={unassignLoading[record.id]}
        >
          Rời chỗ
        </Button>
      );
    },
    width: '25%',
  }
  ];

  const vehicleColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'Biển số',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: '20%',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={type === 'CAR' ? 'blue' : 'orange'}>{type}</Tag>,
      width: '15%',
    },
    {
    title: 'Thao tác',
    key: 'actions',
    render: (_, record) => {
      // Chỉ hiển thị nút Unassign nếu có xe
      if (!record.id) return null;
      return (
        <Button 
          danger 
          onClick={() => handleUnassign(record.id, selectedOccupiedLot?.id)}
          loading={unassignLoading[record.id]}
        >
          Rời chỗ
        </Button>
      );
    },
    width: '25%',
  }
  ];

  // Render visual parking lot representation
  const renderParkingLot = (type) => {
    // Filter and sort lots by type and lot number
    const filteredLots = parkingLots
      .filter(lot => lot.type === type)
      .sort((a, b) => a.lotNumber.localeCompare(b.lotNumber, undefined, { numeric: true }));
    
    // Define dimensions based on type
    const rowCount = type === 'CAR' ? carRowCount : motorbikeRowCount;
    const colCount = type === 'CAR' ? carColCount : motorbikeColCount;
    const totalCells = rowCount * colCount;
    const cells = [];
    
    for (let i = 0; i < totalCells; i++) {
      if (i < filteredLots.length) {
        const lot = filteredLots[i];
        const vehicleInfo = getLotVehicleDetails(lot);
        
        cells.push(
          <Tooltip 
            title={
              <>
                <div><strong>Lot {lot.lotNumber}</strong> (ID: {lot.id})</div>
                <div>Trạng thái: {lot.occupied ? 'Đã có phương tiện' : 'Trống'}</div>
                {lot.occupied && lot.vehicleIds?.length > 0 && (
                  <div>ID phương tiện: {lot.vehicleIds.join(', ')}</div>
                )}
                {lot.occupied && vehicleInfo?.licensePlate?.length > 0 && (
                  <div>Biển số: {vehicleInfo.licensePlate.join(', ')}</div>
                )}
                {!lot.occupied && <div>Nhấn vào để đăng kí phwong tiện và đặt chỗ</div>}
              </>
            }
            key={lot.id}
          >
            <div 
              className={`parking-cell ${lot.occupied ? 'occupied' : 'available'}`}
              onClick={() => {
                if (lot.occupied) {
                  setSelectedOccupiedLot(lot);
                  fetchLotVehicles(lot.id);
                  setModalVisible(true);
                } else {
                  setSelectedEmptyLot(lot);
                  registerAssignForm.setFieldsValue({
                    type: lot.type
                  });
                  setRegisterAssignModal(true);
                }
              }}
            >
              <div className="lot-number">{lot.lotNumber}</div>
              <div className="lot-id">ID: {lot.id}</div>
              {lot.occupied && (
                <div className="vehicle-image">
                  <img 
                    src={type === 'CAR' ? carImage : motorbikeImage} 
                    alt={type}
                    width="100%"
                  />
                  {vehicleInfo && (
                    <div className="license-plate">
                      {vehicleInfo.licensePlate || ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tooltip>
        );
      } else {
        // Empty cell placeholder
        cells.push(<div className="parking-cell empty" key={`empty-${type}-${i}`}></div>);
      }
    }

    return (
      <div className="parking-section">
        <h3 className="text-lg font-semibold mb-2">
          Bãi đỗ {type === 'CAR' ? 'Ô tô' : 'Xe máy'} 
        </h3>
        <div 
          className="parking-grid"
          style={{ 
            gridTemplateColumns: `repeat(${type === 'CAR' ? carColCount : motorbikeColCount}, 1fr)`,
            gridTemplateRows: `repeat(${type === 'CAR' ? carRowCount : motorbikeRowCount}, 1fr)`
          }}
        >
          {cells}
        </div>
      </div>
    );
  };

  // Statistics Display
  const renderStatistics = () => {
    if (lotLoading) return <Spin />;
    
    const carLots = parkingLots.filter(lot => lot.type === 'CAR');
    const motorbikeLots = parkingLots.filter(lot => lot.type === 'MOTORBIKE');
    
    const occupiedCarLots = carLots.filter(lot => lot.occupied).length;
    const occupiedMotorbikeLots = motorbikeLots.filter(lot => lot.occupied).length;
    
    return (
      <div className="statistics-container">
        <Row gutter={16}>
          <Col span={12}>
            <Card bordered={false} className="stat-card">
              <Statistic 
                title="Bãi đỗ ô tô"
                value={`${occupiedCarLots} / ${carLots.length}`}
                description={`${((occupiedCarLots / carLots.length) * 100).toFixed(1)}% occupied`}
                icon={<CarOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false} className="stat-card">
              <Statistic 
                title="Bãi đỗ xe máy"
                value={`${occupiedMotorbikeLots} / ${motorbikeLots.length}`}
                description={`${((occupiedMotorbikeLots / motorbikeLots.length) * 100).toFixed(1)}% occupied`}
                icon={<CarOutlined style={{ color: '#fa8c16' }} />}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Custom Statistic component
  const Statistic = ({ title, value, description, icon }) => {
    return (
      <div className="custom-statistic">
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
          <div className="stat-description">{description}</div>
        </div>
      </div>
    );
  };

  // Unassigned Vehicles List
  const renderUnassignedVehicles = () => {
    if (!allVehicles || allVehicles.length === 0) return null;
    
    // Find vehicles not assigned to any lot
    const assignedVehicleIds = parkingLots.flatMap(lot => lot.vehicleIds || []);
    const unassignedVehicles = allVehicles.filter(vehicle => !assignedVehicleIds.includes(vehicle.id));
    
    if (unassignedVehicles.length === 0) return null;
    
    return (
      <Card title="Rời chỗ" className="mt-4">
        <Table
          dataSource={unassignedVehicles}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: 'Biển số',
              dataIndex: 'licensePlate',
              key: 'licensePlate',
            },
            {
              title: 'Loại',
              dataIndex: 'type',
              key: 'type',
              render: type => <Tag color={type === 'CAR' ? 'blue' : 'orange'}>{type}</Tag>
            },
            {
              title: 'Thao tác',
              key: 'actions',
              render: (_, record) => (
                <Button 
                  type="primary"
                  onClick={() => {
                    setAssignVisible(true);
                    assignForm.setFieldsValue({
                      vehicleId: record.id
                    });
                  }}
                >
                  Đặt chỗ 
                </Button>
              )
            }
          ]}
          pagination={{ pageSize: 5 }}
          rowKey="id"
        />
      </Card>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Title level={2}>Quản lý bãi đỗ xe </Title>
        <div className="space-x-2">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
            loading={createLoading}
          >
            Đăng kí phương tiện
          </Button>
          <Button 
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => setAssignVisible(true)}
            loading={assignLoading}
          >
            Đặt chỗ phương tiện
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchParkingLots();
              
              if (selectedLot) fetchLotVehicles(selectedLot.id);
            }}
            title="Refresh data"
          >
            Làm mới
          </Button>
          <Button 
            type={visualView ? "primary" : "default"} 
            onClick={() => setVisualView(!visualView)}
          >
            {visualView ? "Table View" : "Visual View"}
          </Button>
        </div>
      </div>

      {renderStatistics()}
      
      <Divider />

      <Spin spinning={lotLoading}>
        {visualView ? (
          <div className="visual-parking-container">
            <div className="visual-parking-lots">
              {renderParkingLot('CAR')}
              {renderParkingLot('MOTORBIKE')}
            </div>
            <div className="parking-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Trống (Nhấn vào để đăng kí &đặt chỗ)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Có phương tiện</span>
              </div>
            </div>
          </div>
        ) : (
          <Table
            columns={parkingLotColumns}
            dataSource={parkingLots}
            rowKey="id"
            rowClassName={(record) => record.id === selectedLot?.id ? 'selected-row' : 'cursor-pointer hover:bg-gray-50'}
            bordered
            pagination={{ pageSize: 8 }}
          />
        )}
      </Spin>

      {renderUnassignedVehicles()}

      {selectedLot && (
        <div className="mt-6">
          <Card 
            title={
              <div className="flex justify-between items-center">
                <span>
                  Phương tiện trong {selectedLot.type} Lot {selectedLot.lotNumber} (ID: {selectedLot.id})
                </span>
                <Button onClick={() => setSelectedLot(null)}>Xóa các lựa chọn</Button>
              </div>
            }
            className="selected-lot-details"
          >
            <Spin spinning={loading}>
              {lotVehicles.length > 0 ? (
                <Table
                  columns={vehicleColumns}
                  dataSource={lotVehicles}
                  rowKey="id"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              ) : (
                <div className="empty-message">
                  <Text type="secondary">No vehicles assigned to this lot</Text>
                </div>
              )}
            </Spin>
          </Card>
        </div>
      )}

      {/* Create Vehicle Modal */}
      <Modal
        title="Đăng kí mới phương tiện"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCreateVehicle} layout="vertical">
          <Form.Item
            name="roomId"
            label="ID phòng"
            rules={[{ required: true, message: 'Điền số phòng!' }]}
          >
            <Input type="number" placeholder="Điền số phòng" prefix={<NumberOutlined />} />
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="Biển số "
            dependencies={['type']}
            rules={[
              { required: true, message: 'Điền biển số!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue('type');
                  const { valid, message } = validateLicensePlate(type, value);
                  return valid ? Promise.resolve() : Promise.reject(new Error(message));
                }
              })
            ]}
            normalize={value => value ? value.toUpperCase() : ''}
          >
            <Input 
              placeholder="VD: 37A-123.24 (Ô tô) hoặc 37A2-123.42 (Xe máy)" 
              prefix={<IdcardOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại phương tiện"
            rules={[{ required: true, message: 'Chọn loại phương tiện!' }]}
          >
            <Select placeholder="Select vehicle type">
              <Option value="CAR">Ô tô</Option>
              <Option value="MOTORBIKE">Xe máy</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createLoading}>
              Đăng kí phương tiện
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        title="Đặt chỗ phwong tiện"
        open={assignVisible}
        onCancel={() => setAssignVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={assignForm} onFinish={handleAssignVehicle} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="ID phương tiện"
            rules={[{ required: true, message: 'Điền ID phương tiện!' }]}
          >
            <Input type="number" placeholder="Điền ID phương tiện" prefix={<CarOutlined />} />
          </Form.Item>
          <Form.Item
            name="lotId"
            label="ID vị trí đỗ"
            rules={[{ required: true, message: 'Điền lot ID!' }]}
          >
            <Input type="number" placeholder="Điền ID lot phương tiện đỗ" prefix={<NumberOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={assignLoading}>
              Đăng ksi phwong tiện
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Register and Assign Vehicle Modal */}
      <Modal
        title={`Đăng kí và đặt chỗ phương tiện: ${selectedEmptyLot?.type} Lot ${selectedEmptyLot?.lotNumber}`}
        open={registerAssignModal}
        onCancel={() => setRegisterAssignModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={registerAssignForm} onFinish={handleRegisterAndAssign} layout="vertical">
          <Form.Item
            name="roomId"
            label="ID phòng"
            rules={[{ required: true, message: 'Please input room ID!' }]}
          >
            <Input type="number" placeholder="Điền số phòng" prefix={<NumberOutlined />} />
          </Form.Item>
          <Form.Item
  name="licensePlate"
  label="Biển số"
  rules={[
    { required: true, message: 'Chọn biển số!' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const type = selectedEmptyLot?.type; // Lấy type từ parking lot đã chọn
        const { valid, message } = validateLicensePlate(type, value);
        return valid ? Promise.resolve() : Promise.reject(new Error(message));
      }
    })
  ]}
  normalize={value => value ? value.toUpperCase() : ''}
>
  <Input
    placeholder={selectedEmptyLot?.type === 'CAR' 
      ? "VD: 37A-123.24" 
      : "VD: 37A2-123.42"}
    prefix={<IdcardOutlined />}
  />
</Form.Item>
          <Form.Item
            name="type"
            label="Loại phương tiện"
            rules={[{ required: true, message: 'Chọn loại phương tiện!' }]}
          >
            <Select placeholder="Chọn loại phương tiện" disabled>
              <Option value="CAR">Ô tô</Option>
              <Option value="MOTORBIKE">Xe máy</Option>
            </Select>
          </Form.Item>
          <div className="p-2 mb-4 bg-blue-50 rounded border border-blue-200">
            <Text type="secondary">
              Phương tiện này sẽ được đăng ksi và đặt chỗ tại lot có ID: {selectedEmptyLot?.id}
            </Text>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={registerAssignLoading}>
              Đăng kí và đặt chỗ
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      
<Modal
  title={`Phương tiện trong ${selectedOccupiedLot?.type} Lot ${selectedOccupiedLot?.lotNumber}`}
  open={modalVisible}
  onCancel={() => {
    setModalVisible(false);
    setSelectedOccupiedLot(null);
  }}
  footer={null}
  width={800}
>
  <Spin spinning={loading}>
    {lotVehicles.length > 0 ? (
      <Table
        columns={vehicleColumns}
        dataSource={lotVehicles}
        rowKey="id"
        bordered
        pagination={{ pageSize: 5 }}
      />
    ) : (
      <div className="empty-message">
        <Text type="secondary">Không có phương tiện nào trong lot này</Text>
      </div>
    )}
  </Spin>
</Modal>

      <style jsx>{`
        .visual-parking-container {
          margin-bottom: 20px;
        }
        
        .visual-parking-lots {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .parking-grid {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .parking-cell {
          position: relative;
          border: 2px solid #ddd;
          border-radius: 4px;
          aspect-ratio: 1.5/1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          padding: 5px;
        }
        
        .parking-cell:hover {
          transform: scale(1.05);
          z-index: 1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .parking-cell.available {
          background-color: #f6ffed;
          border-color: #b7eb8f;
        }
        
        .parking-cell.occupied {
          background-color: #fff2e8;
          border-color: #ffbb96;
        }
        
        .parking-cell.empty {
          background-color: #f0f0f0;
          border-style: dashed;
          cursor: default;
        }
        
        .lot-number {
          position: absolute;
          top: 5px;
          left: 5px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .lot-id {
          position: absolute;
          top: 5px;
          right: 5px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        
        .vehicle-image {
          width: 80%;
          height: 80%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .license-plate {
          position: absolute;
          bottom: -5px;
          background-color: #ffffff;
          border: 1px solid #d9d9d9;
          padding: 2px 8px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: bold;
          max-width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .parking-legend {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        
        .legend-color.available {
          background-color: #f6ffed;
          border: 2px solid #b7eb8f;
        }
        
        .legend-color.occupied {
          background-color: #fff2e8;
          border: 2px solid #ffbb96;
        }
        
        .selected-row {
          background-color: #e6f7ff;
          cursor: pointer;
        }
        
        .statistics-container {
          margin-bottom: 20px;
        }
        
        .stat-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.09);
        }
        
        .custom-statistic {
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          font-size: 24px;
          margin-right: 16px;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-title {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          margin: 5px 0;
        }
        
        .stat-description {
          color: rgba(0, 0, 0, 0.65);
          font-size: 12px;
        }
        
        .empty-message {
          text-align: center;
          padding: 20px;
        }
          .ant-form-item-explain-error {
    white-space: pre-wrap;
    font-size: 12px;
    color: #ff4d4f;
    margin-top: 4px;
  }
  
  .license-example {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
      `}</style>
    </div>
  );
};

export default Vehicle;