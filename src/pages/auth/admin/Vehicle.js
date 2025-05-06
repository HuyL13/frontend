import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Spin, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;
const API_BASE_URL = 'http://localhost:22986/demo';

const Vehicle = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lotLoading, setLotLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchParkingLots();
  }, []);
//6
  const fetchParkingLots = async () => {
    try {
        const token = localStorage.getItem("authToken");
      setLotLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vehicles`,{
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setParkingLots(data);
    } catch (error) {
      message.error('Failed to load parking lots');
    } finally {
      setLotLoading(false);
    }
  };
//2
  const fetchLotVehicles = async (lotId) => {
    try {
        const token = localStorage.getItem("authToken");
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/api/parking-lots/${lotId}/vehicles`,{
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      message.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };
//1
  const handleUnassign = (vehicleId) => {
    confirm({
      title: 'Confirm Unassignment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to unassign this vehicle?',
      async onOk() {
        try {
            const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${API_BASE_URL}/admin/api/parking-lots/unassign-vehicle/${vehicleId}`,{
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
        },
            }
          );
          
          if (response.ok) {
            message.success('Vehicle unassigned successfully');
            if (selectedLot) fetchLotVehicles(selectedLot.id);
            fetchParkingLots();
          }
        } catch (error) {
          message.error('Unassignment failed');
        }
      }
    });
  };

  const handleCreateVehicle = async (values) => {
    try {
        const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/vehicles/room/${values.roomId}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,},
        body: JSON.stringify({
          licensePlate: values.licensePlate,
          type: values.type
        })
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Vehicle created successfully');
        setCreateVisible(false);
        form.resetFields();
      } else {
        message.error(data.error || 'Failed to create vehicle');
      }
    } catch (error) {
      message.error('Failed to create vehicle');
    }
  };
//?
  const handleAssignVehicle = async (values) => {
    try {
        const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/${values.lotId}/assign-vehicle/${values.vehicleId}`,{
            method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        }
      );
      
      const data = await response.json();
      if (response.ok) {
        message.success('Vehicle assigned successfully');
        setAssignVisible(false);
        fetchParkingLots();
        if (selectedLot) fetchLotVehicles(selectedLot.id);
      } else {
        message.error(data.error || 'Assignment failed');
      }
    } catch (error) {
      message.error('Assignment failed');
    }
  };

  const parkingLotColumns = [
    {
      title: 'Lot Number',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      sorter: (a, b) => a.lotNumber.localeCompare(b.lotNumber),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={type === 'CAR' ? 'blue' : 'orange'}>{type}</Tag>,
      filters: [
        { text: 'Car', value: 'CAR' },
        { text: 'Motorbike', value: 'MOTORBIKE' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Status',
      dataIndex: 'occupied',
      render: occupied => (
        <Tag color={occupied ? 'red' : 'green'}>
          {occupied ? 'Occupied' : 'Available'}
        </Tag>
      ),
      filters: [
        { text: 'Occupied', value: true },
        { text: 'Available', value: false },
      ],
      onFilter: (value, record) => record.occupied === value,
    },
    {
      title: 'Vehicles',
      dataIndex: 'vehicleIds',
      render: ids => ids?.length || 0
    }
  ];

  const vehicleColumns = [
    {
      title: 'License Plate',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={type === 'CAR' ? 'blue' : 'orange'}>{type}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => handleUnassign(record.id)}>
          Unassign
        </Button>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Parking Management System</h1>
        <div className="space-x-2">
          <Button type="primary" onClick={() => setCreateVisible(true)}>
            Register New Vehicle
          </Button>
          <Button type="primary" onClick={() => setAssignVisible(true)}>
            Assign Vehicle to Lot
          </Button>
        </div>
      </div>

      <Spin spinning={lotLoading}>
        <Table
          columns={parkingLotColumns}
          dataSource={parkingLots}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => {
              setSelectedLot(record);
              fetchLotVehicles(record.id);
            }
          })}
          rowClassName="cursor-pointer hover:bg-gray-50"
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Spin>

      {selectedLot && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Vehicles in {selectedLot.type} Lot {selectedLot.lotNumber}
            </h2>
            <Button onClick={() => setSelectedLot(null)}>Clear Selection</Button>
          </div>
          <Spin spinning={loading}>
            <Table
              columns={vehicleColumns}
              dataSource={vehicles}
              rowKey="id"
              bordered
              pagination={{ pageSize: 5 }}
            />
          </Spin>
        </div>
      )}

      {/* Create Vehicle Modal */}
      <Modal
        title="Register New Vehicle"
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCreateVehicle} layout="vertical">
          <Form.Item
            name="roomId"
            label="Room ID"
            rules={[{ required: true, message: 'Please input room ID!' }]}
          >
            <Input type="number" placeholder="Enter room number" />
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="License Plate"
            rules={[{ required: true, message: 'Please input license plate!' }]}
          >
            <Input placeholder="e.g. 59A-123.45" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Vehicle Type"
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select placeholder="Select vehicle type">
              <Option value="CAR">Car</Option>
              <Option value="MOTORBIKE">Motorbike</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Register Vehicle
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        title="Assign Vehicle to Parking Lot"
        visible={assignVisible}
        onCancel={() => setAssignVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form onFinish={handleAssignVehicle} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="Vehicle ID"
            rules={[{ required: true, message: 'Please input vehicle ID!' }]}
          >
            <Input type="number" placeholder="Enter vehicle ID" />
          </Form.Item>
          <Form.Item
            name="lotId"
            label="Parking Lot ID"
            rules={[{ required: true, message: 'Please input lot ID!' }]}
          >
            <Input type="number" placeholder="Enter parking lot ID" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Assign Vehicle
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vehicle;