import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import '../../../styles/FeeManagement.css';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [newFee, setNewFee] = useState({
    roomNumber: '',
    description: '',
    amount: '',
    dueDate: ''
  });

  // Fetch all fees
  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:22986/demo/admin/fees', {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch fees');

      const data = await response.json();
      console.log(data);
      setFees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Xử lý thêm phí mới
  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      
      // Tạo URL với query parameters
      const apiUrl = new URL('http://localhost:22986/demo/admin/fees/add');
      const params = {
        roomNumber: newFee.roomNumber,
        description: newFee.description,
        amount: Number(newFee.amount).toFixed(1),
        dueDate: newFee.dueDate
      };

      // Thêm các tham số vào URL
      Object.entries(params).forEach(([key, value]) => {
        apiUrl.searchParams.append(key, value);
      });

      const response = await fetch(apiUrl.toString(), {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add fee');
      }

      // Cập nhật UI
      setShowAddModal(false);
      setNewFee({ roomNumber: '', description: '', amount: '', dueDate: '' });
      await fetchFees();

    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Cập nhật trạng thái phí
  const handleStatusChange = async (feeId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ 
        feeId: feeId.toString(),
        status: newStatus 
      });
      
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/update-status?${params}`,
        {
          mode: 'cors',
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      setFees(fees.map(fee => 
        fee.id === feeId ? { ...fee, status: newStatus } : fee
      ));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Cập nhật thông tin phí
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const updatedFee = {
        ...selectedFee,
        amount: Number(selectedFee.amount),
        dueDate: new Date(selectedFee.dueDate).toISOString()
      };
      
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/${selectedFee.id}`,
        {
          mode: 'cors',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFee)
        }
      );

      if (!response.ok) throw new Error('Failed to update fee');

      setShowEditModal(false);
      await fetchFees();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Xóa phí
  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:22986/demo/admin/fees/${feeId}`,
        {
          mode: 'cors',
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete fee');
      }

      setFees(prevFees => prevFees.filter(fee => fee.id !== feeId));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) return <div className="loading">Loading fees...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="fee-management">


      <div className="d-flex justify-content-end mb-3">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="ik ik-plus mr-1"></i> Thêm khoản thu
        </button>
      </div>
      
      <div className="card table-card">
        <div className="card-header">
          <h3>Danh sách khoản thu</h3>
          <div className="card-header-right">
            <ul className="list-unstyled card-option">
              <li><i className="ik ik-chevron-left action-toggle"></i></li>
              <li><i className="ik ik-minus minimize-card"></i></li>
              <li>
                <div 
                  className="add-fee" 
                  onClick={() => setShowAddModal(true)}
                  title="Thêm khoản thu mới"
                >
                  <i className="ik ik-plus text-primary"></i>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="card-block">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Tên phòng</th>
                  <th>Tên khoản phí</th>
                  <th>Số tiền cần thu</th>
                  <th>Hạn thu</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td>Phòng {fee.roomNumber}</td>
                    <td>{fee.description}</td>
                    <td>{Number(fee.amount).toLocaleString()}vnd</td>
                    <td>{format(new Date(fee.dueDate), 'dd/MM/yyyy')}</td>
                    <td>
                      <select 
                        value={fee.status} 
                        onChange={(e) => handleStatusChange(fee.id, e.target.value)}
                        className={`status-select ${fee.status.toLowerCase()}`}
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-icon"
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowEditModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <i className="ik ik-edit-2 f-16 text-primary"></i>
                        </button>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleDeleteFee(fee.id)}
                          title="Xóa khoản thu"
                        >
                          <i className="ik ik-trash-2 f-16 text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add Fee Modal */}
      {showAddModal && (
        <div className="modal" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close" 
              onClick={() => setShowAddModal(false)}
              role="button" 
              tabIndex={0}
            >
              &times;
            </span>
            <h3>Add New Fee</h3>
            <form onSubmit={handleAddFee}>
              <input
                type="text"
                placeholder="Room Number"
                value={newFee.roomNumber}
                onChange={(e) => setNewFee({ ...newFee, roomNumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newFee.description}
                onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                step="0.01"
                required
              />
              <input
                type="date"
                value={newFee.dueDate}
                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Add Fee
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {showEditModal && selectedFee && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close" 
              onClick={() => setShowEditModal(false)}
              role="button" 
              tabIndex={0}
            >
              &times;
            </span>
            <h3>Edit Fee</h3>
            <form onSubmit={handleUpdateFee}>
              <input
                type="text"
                value={selectedFee.roomNumber}
                onChange={(e) => setSelectedFee({ ...selectedFee, roomNumber: e.target.value })}
                required
              />
              <input
                type="text"
                value={selectedFee.description}
                onChange={(e) => setSelectedFee({ ...selectedFee, description: e.target.value })}
                required
              />
              <input
                type="number"
                value={selectedFee.amount}
                onChange={(e) => setSelectedFee({ ...selectedFee, amount: e.target.value })}
                step="0.01"
                required
              />
              <input
                type="date"
                value={format(new Date(selectedFee.dueDate), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedFee({ ...selectedFee, dueDate: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Update
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
