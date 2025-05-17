import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Spin, Tag, message, Divider, Tooltip } from 'antd';
import { CarOutlined, PlusOutlined, ReloadOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../../../styles/Parking.css';

const { Option } = Select;

const Parking = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registerAssignModalOpen, setRegisterAssignModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedLotInfo, setSelectedLotInfo] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [registerAssignLoading, setRegisterAssignLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [registerAssignForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const token = localStorage.getItem('authToken');
  const baseURL = 'https://backend-6w7s.onrender.com/demo';

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
      const response = await fetch(`${baseURL}/users/room`, {
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
      console.log('Room IDs:', data); // Debug log
      const ids = data.map(room => room.id);
      setRoomIds(ids);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách roomId');
    }
  };

  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/vehicles`, {
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
      setCreateLoading(true);
      const selectedRoomId = values.roomId;
      if (!selectedRoomId || isNaN(Number(selectedRoomId))) {
        message.error('roomId không hợp lệ. Vui lòng chọn roomId.');
        return;
      }

      const cleanedValues = {
        licensePlate: values.licensePlate.replace(/\s+/g, '').toUpperCase(),
        type: values.type,
      };

      console.log('Creating vehicle with:', cleanedValues, 'Room ID:', selectedRoomId); // Debug log

      const response = await fetch(`${baseURL}/api/vehicles/room/${selectedRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData); // Debug log
        throw new Error(errorData.error || 'Không thể tạo xe. Vui lòng kiểm tra biển số.');
      }

      message.success('Tạo xe thành công');
      form.resetFields();
      setCreateModalOpen(false);
      fetchMyVehicles();
    } catch (e) {
      console.error('Create Vehicle Error:', e); // Debug log
      message.error(e.message.includes('already exists') ? 'Biển số đã tồn tại!' : e.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssign = async (lotId, vehicleId) => {
    try {
      setAssignLoading(true);
      const response = await fetch(`${baseURL}/api/vehicles/${lotId}/assign-vehicle/${vehicleId}`, {
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
      setAssignModalOpen(false);
      assignForm.resetFields();
      setSelectedVehicle(null);
      await Promise.all([fetchLots(), fetchMyVehicles()]);
    } catch (error) {
      message.error(error.message || 'Không thể đăng ký lot. Kiểm tra loại xe hoặc trạng thái lot.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!vehicleId) {
      message.error('ID phương tiện không hợp lệ');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${baseURL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Không thể xóa phương tiện');
      }

      message.success('Xóa phương tiện thành công');
      fetchMyVehicles();
    } catch (error) {
      console.error('Delete Vehicle Error:', error);
      message.error(error.message || 'Đã xảy ra lỗi khi xóa phương tiện');
    } finally {
      setDeleteLoading(false);
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

      const registerRes = await fetch(`${baseURL}/api/vehicles/room/${values.roomId}`, {
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

      const assignRes = await fetch(
        `${baseURL}/api/vehicles/${selectedLot.id}/assign-vehicle/${vehicle.id}`,
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
      const response = await fetch(`${baseURL}/api/vehicles/${vehicleId}/unassign`, {
        oligonucle: 'DELETE',
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

  const myVehicleIds = myVehicles.map(v => v.id);

  const renderLotsByType = (typeLabel, typeKey) => {
    const filteredLots = parkingLots.filter(lot => lot.type === typeKey);
    return (
      <div style={{ marginBottom: '2rem' }}>
        <Divider orientation="left">Khu vực {typeLabel}</Divider>
        <Row gutter={[16, 16]}>
          {filteredLots.map(lot => {
            const isMine = lot.vehicleIds?.some(id => myVehicleIds.includes(id));
            const lotVehicle = myVehicles.find(v =>
              v.lotNumber === lot.lotNumber &&
              v.type === typeKey
            );

            return (
              <Col span={6} key={lot.id} className="parking-grid">
                <Card bordered className={`parking-card ${isMine ? 'border-blue-500' : ''}`} style={{ height: '100%' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span>
                      <span className={`parking-icon ${lot.type === 'CAR' ? 'car' : 'motorbike'}`}></span>
                      <strong>Lot {lot.lotNumber}</strong>
                    </span>
                    <div className="flex items-center">
                      <Tag className={lot.occupied ? 'tag-red' : 'tag-green'}>
                        {lot.occupied ? 'Đã có xe' : 'Còn trống'}
                      </Tag>
                      {isMine && (
                        <Tooltip title="Xem thông tin xe">
                          <Button
                            type="text"
                            icon={<InfoCircleOutlined />}
                            onClick={() => {
                              setSelectedLotInfo({
                                lotNumber: lot.lotNumber,
                                licensePlate: lotVehicle?.licensePlate,
                                roomId: lotVehicle?.id,
                              });
                              setInfoModalOpen(true);
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div>Type: <Tag>{lot.type}</Tag></div>
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
              <Col span={6} key={vehicle.id}>
                <Card bordered className="vehicle-card">
                  <div className="flex justify-between items-center mb-2">
                    <span>
                      <span className={`vehicle-icon ${vehicle.type === 'CAR' ? 'car' : 'motorbike'}`}></span>
                      <strong>{vehicle.licensePlate}</strong>
                    </span>
                    <Button
                      danger
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle.id);
                      }}
                      loading={deleteLoading}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      Loại: <Tag>{vehicle.type === 'CAR' ? 'Ô tô' : 'Xe máy'}</Tag>
                    </div>
                    <div className="flex items-center">
                      <span>Vị trí:</span>
                      {vehicle.lotNumber ? (
                        <>
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            {vehicle.lotNumber}
                          </Tag>
                          <Button
                            danger
                            size="small"
                            className="ml-2"
                            onClick={() => handleUnassign(vehicle.id)}
                            loading={unassignLoading}
                          >
                            Hủy đăng ký
                          </Button>
                        </>
                      ) : (
                        <>
                          <Tag color="orange" style={{ marginLeft: 8 }}>
                            Chưa đăng ký
                          </Tag>
                          <Button
                            type="primary"
                            size="small"
                            className="ml-2"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setAssignModalOpen(true);
                            }}
                          >
                            Đăng ký
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ marginRight: 8 }}
          >
            Tạo phương tiện mới
          </Button>
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
            <Button type="primary" htmlType="submit" block loading={createLoading}>
              Tạo xe
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Đăng ký và gán xe vào lô ${selectedLot?.lotNumber}`}
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

      <Modal
        title={`Đăng ký lô cho xe ${selectedVehicle?.licensePlate}`}
        open={assignModalOpen}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedVehicle(null);
          assignForm.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={assignForm} onFinish={(values) => {
          if (!selectedVehicle?.id || !values.lotId) {
            message.error('Thông tin không hợp lệ. Vui lòng thử lại.');
            return;
          }
          handleAssign(values.lotId, selectedVehicle.id);
        }}>
          <Form.Item
            name="lotId"
            label="Chọn lô đỗ xe"
            rules={[{ required: true, message: 'Vui lòng chọn lô đỗ xe!' }]}
          >
            <Select placeholder="Chọn lô đỗ xe">
              {parkingLots
                .filter(lot => !lot.occupied && lot.type === selectedVehicle?.type)
                .map(lot => (
                  <Option key={lot.id} value={lot.id}>
                    {lot.lotNumber}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={assignLoading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Thông tin xe tại lô ${selectedLotInfo?.lotNumber}`}
        open={infoModalOpen}
        onCancel={() => {
          setInfoModalOpen(false);
          setSelectedLotInfo(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setInfoModalOpen(false);
            setSelectedLotInfo(null);
          }}>
            Đóng
          </Button>,
        ]}
      >
        <p><strong>Vehicle ID:</strong> {selectedLotInfo?.roomId || 'N/A'}</p>
        <p><strong>Biển số:</strong> {selectedLotInfo?.licensePlate || 'N/A'}</p>
      </Modal>
    </div>
  );
};

export default Parking;