import React, { useEffect, useState } from "react";
import "../../../styles/Admin.css";
import "../../../styles/UserManagement.css";
import { X } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Khởi tạo state users là mảng rỗng
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState({
    initial: true,
    page: false,
    form: false
  });
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    id:"",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    roles: ""
  });
  const [editUser, setEditUser] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });


  // Effect cho loading ban đầu
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(prev => ({ ...prev, initial: false }));
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(prev => ({ ...prev, page: true }));
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://backend-13-6qob.onrender.com/demo/users/admin", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
  
        // Xử lý response theo cấu trúc {code, result}
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        // Kiểm tra cấu trúc response
        if (data.code !== 0) {
          throw new Error(data.message || "Server returned error code");
        }
  
        // Lấy danh sách users từ trường result
        const receivedUsers = data.result || [];
        
        if (!Array.isArray(receivedUsers)) {
          throw new Error("Invalid users data format from server");
        }
  
        // Format lại dữ liệu để xử lý các trường null
        const formattedUsers = receivedUsers.map(user => ({
          ...user,
          firstName: user.firstName || "N/A",
          lastName: user.lastName || "N/A",
          dob: user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"
        }));
  
        setUsers(formattedUsers);
        setError("");
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setUsers([]); // Đảm bảo luôn là array
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };
  
    if (!loading.initial) {
      fetchUsers();
      const intervalId = setInterval(fetchUsers, 100000);
      return () => clearInterval(intervalId);
    }
  }, [loading.initial]);


  // Tạo user mới
  const createUser = async (userData) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://backend-13-6qob.onrender.com/demo/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName
          }
          )
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Create user failed");
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Xử lý thêm user
  const handleCreateUser = async () => {
    const requiredFields = ['username', 'password', 'email', 'firstName', 'lastName'];
    if (requiredFields.some(field => !newUser[field])) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(prev => ({ ...prev, form: true }));
    try {
      const createdUser = await createUser(newUser);
      setUsers([...users, createdUser]);
      setShowCreateModal(false);
      setNewUser({ username: "", password: "", email: "", firstName: "", lastName: "" });
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Xóa user
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/admin/${userId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Delete failed");
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  // Cập nhật user
  const updateUser = async (userId, updateData) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            email: updateData.email,
            firstName: updateData.firstName,
            lastName: updateData.lastName
          }
          )
      });

      if (!response.ok) throw new Error("Update failed");
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Xử lý cập nhật
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setLoading(prev => ({ ...prev, form: true }));
    try {
      const updatedUser = await updateUser(selectedUser.id, editUser);
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...updatedUser } : user
      ));
      setShowEditModal(false);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  
  const fetchUserDetail = async (userId) => {
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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(data.message || "Server returned error code");
      }
  
      return data.result;
    } catch (error) {
      throw new Error(`Failed to fetch user details: ${error.message}`);
    }
  };
  return (
    <div className="admin-overlay">
      {loading.initial && (
        <div className="initial-loading">
          <div className="spinner"></div>
        </div>
      )}

      {loading.page && (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      )}

      <div className="admin-layout">
        <h2 className="name">User Management</h2>
        <button 
          className="btn btn-add"
          onClick={() => setShowCreateModal(true)}
        >
          Add New User
        </button>

        <div className="user-list">
          {Array.isArray(users) && users.length > 0 ? users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <h4>{user.username}</h4>
                <p>{user.firstName} {user.lastName}</p>
                <p>{user.email}</p>
              </div>
              <div className="user-actions">
                <button 
                  className="btn btn-info"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDetailModal(true);
                  }}
                >
                  Detail
                </button>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setSelectedUser(user);
                    setEditUser({
                      email: user.email,
                      firstName: user.firstName,
                      lastName: user.lastName
                    });
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <p>No users found</p>
          )}
        </div>

        {/* Modal tạo user */}
        {showCreateModal && (
          <div className="modal-overlay-admin" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
              <h3>Create New User</h3>
              {error && <div className="error-message">{error}</div>}
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={handleCreateUser}
                  disabled={loading.form}
                >
                  {loading.form ? "Creating..." : "Create"}
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chỉnh sửa */}
        {showEditModal && selectedUser && (
          <div className="modal-overlay-admin" onClick={() => setShowEditModal(false)}>
            <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
              <h3>Edit User</h3>
              {error && <div className="error-message">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="First Name"
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
              />
              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={handleUpdateUser}
                  disabled={loading.form}
                >
                  {loading.form ? "Updating..." : "Update"}
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

{showDetailModal && selectedUser && (
  <div className="modal-overlay-admin" onClick={() => setShowDetailModal(false)}>
    <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
      <h3>User Details</h3>
      <div className="user-detail-content">
        {loading.page ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedUser.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{selectedUser.username}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Password:</span>
              <span className="detail-value">{selectedUser.password}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{selectedUser.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">
                {selectedUser.dob || "N/A"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roles:</span>
              <div className="role-tags">
                {selectedUser.roles?.map((role) => (
                  <span key={role.name} className="role-tag">
                    {role.name}
                  </span>
                )) || "No roles"}
              </div>
            </div>
          </>
        )}
      </div>
      <button
  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all"
  onClick={() => setShowDetailModal(false)}
>
  <X className="w-5 h-5" />
  Close
</button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default UserManagement;
