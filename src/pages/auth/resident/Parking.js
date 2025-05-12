import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Spin, Tag, Tooltip, message, Divider } from 'antd';
import { CarOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import '../../../styles/Parking.css';

const { Option } = Select;

const Parking = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registerAssignModalOpen, setRegisterAssignModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [registerAssignLoading, setRegisterAssignLoading] = useState(false);
  const [form] = Form.useForm();
  const [registerAssignForm] = Form.useForm();
  const token = localStorage.getItem('authToken');
  const baseURL = 'https://backend-13-6qob.onrender.com/demo';

  useEffect(() => {
    fetchLots();
    fetchMyVehicles();
    fetchRoomIds();
  }, []);

  const validateLicensePlate = (type, licensePlate) => {
    const carPattern = /^\d{2}[A-Z]-\d{3}\.\d{2}$/;
    const motorbikePattern = /^\d{2}[A-Z]\d-\d{3}\.\d{2}$/;

    if (type === 'CAR' && !carPattern.test(licensePlate)) {
      return { valid: false, message: 'Biển số ô tô phải có dạng 51H-123.45' };
    }
    if (type === 'MOTORBIKE' && !motorbikePattern.test(licensePlate)) {
      return { valid: false, message: 'Biển số xe máy phải có dạng 51H1-123.45' };
    }
    return { valid: true, message: '' };
  };

  const fetchRoomIds = async () => {
    try {
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/room`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách roomId');
      }
      const data = await response.json();
      const ids = data.map(room => room.id);
      setRoomIds(ids);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách roomId');
    }
  };

  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách lot');
      }
      const data = await response.json();
      setParkingLots(data);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách lot');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVehicles = async () => {
  try {
    // First, fetch all room IDs associated with the user
    const roomsResponse = await fetch(`${baseURL}/users/room`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!roomsResponse.ok) {
      throw new Error('Không thể tải danh sách roomId');
    }
    
    const roomsData = await roomsResponse.json();
    
    if (!roomsData || roomsData.length === 0) {
      message.warning('Không tìm thấy phòng nào cho tài khoản này.');
      setMyVehicles([]);
      return;
    }
    
    // Fetch vehicles for each room and combine the results
    const allVehicles = [];
    
    for (const room of roomsData) {
      const roomId = room.id;
      
      const vehiclesResponse = await fetch(`${baseURL}/api/vehicles/${roomId}/vehicles-with-lots`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        allVehicles.push(...vehiclesData);
      }
    }
    
    setMyVehicles(allVehicles);
  } catch (error) {
    message.error('Không thể tải danh sách xe của bạn: ' + (error.message || 'Lỗi không xác định'));
  }
};
  const handleCreateVehicle = async (values) => {
    try {
      const selectedRoomId = values.roomId;
      if (!selectedRoomId || isNaN(Number(selectedRoomId))) {
        message.error('roomId không hợp lệ. Vui lòng chọn roomId.');
        return;
      }

      const cleanedValues = {
        licensePlate: values.licensePlate.replace(/\s+/g, '').toUpperCase(),
        type: values.type,
      };

      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/room/${selectedRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo xe. Vui lòng kiểm tra biển số.');
      }

      message.success('Tạo xe thành công');
      form.resetFields();
      setCreateModalOpen(false);
      fetchMyVehicles();
    } catch (e) {
      message.error(e.message.includes('already exists') ? 'Biển số đã tồn tại!' : e.message);
    }
  };

  const handleAssign = async (lotId, vehicleId) => {
    try {
      setAssignLoading(true);
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/${lotId}/assign-vehicle/${vehicleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể đăng ký lot');
      }

      await response.json();
      message.success('Đăng ký lot thành công');
      await Promise.all([fetchLots(), fetchMyVehicles()]);
    } catch (error) {
      message.error(error.message || 'Không thể đăng ký lot. Kiểm tra loại xe hoặc trạng thái lot.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRegisterAndAssign = async (values) => {
    if (!token) {
      message.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      return;
    }

    if (!values?.roomId || !values?.licensePlate || !values?.type) {
      message.error('Thiếu thông tin đăng ký xe.');
      return;
    }

    if (!selectedLot?.id) {
      message.error('Chưa chọn lot để gán.');
      return;
    }

    const validationResult = validateLicensePlate(values.type, values.licensePlate);
    if (!validationResult.valid) {
      message.error(validationResult.message);
      return;
    }

    try {
      setRegisterAssignLoading(true);

      // Step 1: Register vehicle
      const registerRes = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/room/${values.roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          licensePlate: values.licensePlate.replace(/\s+/g, '').toUpperCase(),
          type: values.type,
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json().catch(() => ({}));
        throw new Error(err.error || 'Đăng ký xe thất bại');
      }

      const vehicle = await registerRes.json();
      if (!vehicle?.id) throw new Error('Dữ liệu xe không hợp lệ.');

      // Step 2: Assign vehicle to lot
      const assignRes = await fetch(
        `https://backend-13-6qob.onrender.com/demo/api/vehicles/${selectedLot.id}/assign-vehicle/${vehicle.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!assignRes.ok) {
        const err = await assignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Gán lot thất bại');
      }

      await assignRes.json();
      message.success('Đăng ký và gán lot thành công');
      setRegisterAssignModalOpen(false);
      registerAssignForm.resetFields();
      setSelectedLot(null);
      await Promise.all([fetchLots(), fetchMyVehicles()]);
    } catch (error) {
      message.error(error.message || 'Đã xảy ra lỗi không xác định');
    } finally {
      setRegisterAssignLoading(false);
    }
  };

  const handleUnassign = async (vehicleId) => {
    setUnassignLoading(true);
    try {
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/vehicles/${vehicleId}/unassign`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Không thể hủy đăng ký');
      }
      message.success('Hủy đăng ký lot thành công');
      fetchLots();
      fetchMyVehicles();
    } catch {
      message.error('Không thể hủy đăng ký');
    } finally {
      setUnassignLoading(false);
    }
  };

  const myVehicleIds = myVehicles.map(v => v.vehicleId);

  const renderLotsByType = (typeLabel, typeKey) => {
  const filteredLots = parkingLots.filter(lot => lot.type === typeKey);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Divider orientation="left">Khu vực {typeLabel}</Divider>
      <Row gutter={[16, 16]}>
        {filteredLots.map(lot => {
          const isMine = lot.vehicleIds?.some(id => myVehicleIds.includes(id));
          // Sửa ở đây: thêm điều kiện lọc theo type
          const lotVehicle = myVehicles.find(v => 
            v.parkingLot?.lotNumber === lot.lotNumber && 
            v.type === typeKey // Thêm kiểm tra loại phương tiện
          );
          
          return (
            <Col span={6} key={lot.id} className="parking-grid">
              <Card bordered className={`parking-card ${isMine ? 'border-blue-500' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <span>
                    <span className={`parking-icon ${lot.type === 'CAR' ? 'car' : 'motorbike'}`}></span>
                    <strong>Lot {lot.lotNumber}</strong>
                  </span>
                  <Tag className={lot.occupied ? 'tag-red' : 'tag-green'}>
                    {lot.occupied ? 'Đã có xe' : 'Còn trống'}
                  </Tag>
                </div>
                <div>Type: <Tag>{lot.type}</Tag></div>
                {lotVehicle && (
                  <div className="vehicle-info">
                    Xe của bạn: {lotVehicle.licensePlate}
                    {/* Thêm hiển thị loại xe */}
                    <Tag color={lotVehicle.type === 'CAR' ? 'blue' : 'purple'} style={{ marginLeft: 8 }}>
                      {lotVehicle.type === 'CAR' ? 'Ô tô' : 'Xe máy'}
                    </Tag>
                    <Button
                      danger
                      size="small"
                      className="ml-2"
                      onClick={() => handleUnassign(lotVehicle.vehicleId)}
                      loading={unassignLoading}
                    >
                      Hủy đăng ký
                    </Button>
                  </div>
                )}
                {!lot.occupied && (
                  <Tooltip title="Nhấn để đăng ký xe của bạn">
                    <Button
                      type="primary"
                      block
                      className="mt-3"
                      loading={assignLoading}
                      onClick={() => {
                        // Thêm kiểm tra type khi filter
                        const available = myVehicles.filter(
                          v => !v.parkingLot && v.type === typeKey
                        );
                        
                          setSelectedLot(lot);
                          setRegisterAssignModalOpen(true);
                        
                      }}
                    >
                      Đăng ký lot này
                    </Button>
                  </Tooltip>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

  const renderVehicleList = () => {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <Divider orientation="left">Danh sách phương tiện của bạn</Divider>
        {myVehicles.length === 0 ? (
          <p>Chưa có phương tiện nào. Vui lòng tạo phương tiện mới.</p>
        ) : (
          <Row gutter={[16, 16]}>
            {myVehicles.map(vehicle => (
              <Col span={6} key={vehicle.vehicleId}>
                <Card bordered className="vehicle-card">
                  <div className="flex justify-between items-center mb-2">
                    <span>
                      <span className={`vehicle-icon ${vehicle.type === 'CAR' ? 'car' : 'motorbike'}`}></span>
                      <strong>{vehicle.licensePlate}</strong>
                    </span>
                    
                  </div>
                  <div>Type: <Tag>{vehicle.type}</Tag></div>
                  {vehicle.parkingLot && (
                    <Button
                      danger
                      size="small"
                      className="mt-2"
                      onClick={() => handleUnassign(vehicle.vehicleId)}
                      loading={unassignLoading}
                    >
                      Hủy đăng ký
                    </Button>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 parking-container">
      <Row justify="space-between" className="mb-4">
        <h2>Quản lý bãi đỗ xe</h2>
        <div>
          
          <Button icon={<ReloadOutlined />} onClick={() => { fetchLots(); fetchMyVehicles(); }}>
            Làm mới
          </Button>
        </div>
      </Row>
      <Spin spinning={loading}>
        {renderVehicleList()}
        {renderLotsByType('Ô tô', 'CAR')}
        {renderLotsByType('Xe máy', 'MOTORBIKE')}
      </Spin>

      <Modal
        title="Tạo phương tiện mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateVehicle}>
          <Form.Item
            name="roomId"
            label="Room ID"
            rules={[{ required: true, message: 'Vui lòng chọn Room ID!' }]}
          >
            <Select placeholder="Chọn Room ID">
              {roomIds.map(id => (
                <Option key={id} value={id}>
                  {id}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="Biển số"
            dependencies={['type']}
            rules={[
              { required: true, message: 'Vui lòng nhập biển số!' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const type = form.getFieldValue('type');
                  return validateLicensePlate(type, value).valid
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateLicensePlate(type, value).message));
                },
              },
            ]}
          >
            <Input placeholder="VD: 51H-123.45 (ô tô) hoặc 51H1-123.45 (xe máy)" className="license-input" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại phương tiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại xe!' }]}
          >
            <Select placeholder="Chọn loại xe">
              <Option value="CAR">Ô tô</Option>
              <Option value="MOTORBIKE">Xe máy</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo xe
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Đăng ký và gán xe vào lot ${selectedLot?.lotNumber}`}
        open={registerAssignModalOpen}
        onCancel={() => {
          setRegisterAssignModalOpen(false);
          setSelectedLot(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={registerAssignForm} onFinish={handleRegisterAndAssign}>
          <Form.Item
            name="roomId"
            label="Room ID"
            rules={[{ required: true, message: 'Vui lòng chọn Room ID!' }]}
          >
            <Select placeholder="Chọn Room ID">
              {roomIds.map(id => (
                <Option key={id} value={id}>
                  {id}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="Biển số"
            dependencies={['type']}
            rules={[
              { required: true, message: 'Vui lòng nhập biển số!' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const type = registerAssignForm.getFieldValue('type');
                  return validateLicensePlate(type, value).valid
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateLicensePlate(type, value).message));
                },
              },
            ]}
          >
            <Input
              placeholder="VD: 51H-123.45 (ô tô) hoặc 51H1-123.45 (xe máy)"
              className="license-input"
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại phương tiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại xe!' }]}
            initialValue={selectedLot?.type}
          >
            <Select placeholder="Chọn loại xe" disabled>
              <Option value="CAR">Ô tô</Option>
              <Option value="MOTORBIKE">Xe máy</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={registerAssignLoading}>
              Đăng ký và gán
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Parking;