// Styled version of Resident.js using ThemeKit-inspired layout
// Divides QR button, Room Info, and Fee List into separate cards

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import "../../../styles/Resident.css";

const Resident = () => {
  const [fees, setFees] = useState([]);
  const [room, setRoom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const feesFetched = useRef(false);
  const roomFetched = useRef(false);

  useEffect(() => {
    if (!feesFetched.current) {
      feesFetched.current = true;
      fetchFees();
    }
    if (!roomFetched.current) {
      roomFetched.current = true;
      fetchRoom();
    }
  }, []);

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found!");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/unpaid`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid fee data format");
      setFees(data);
    } catch (err) {
      setError(err.message);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found!");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/users/room`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid room data format");
      setRoom(data);
    } catch (err) {
      setError(err.message);
      setRoom([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (fee) => {
    setSelectedFee(fee);
    setShowModal(true);
  };

  const generateInvoice = async (feeId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found!");

      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/api/bills/generate?feeId=${feeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể tạo hóa đơn");
      }

      // Get the binary data as a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice.docx"; // Set the filename as per API specification
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center py-5 text-primary">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger text-center">Lỗi: {error}</div>;

  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      <div className="row w-100 justify-content-center">
        {/* QR Code Section */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white text-center">Thanh toán bằng QR</div>
            <div className="card-body text-center">
              {!showQR ? (
                <button className="btn btn-outline-primary" onClick={() => setShowQR(true)}>
                  Hiển thị QR Code
                </button>
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/500px-Superqr.svg.png"
                  alt="QR Code"
                  className="img-fluid"
                />
              )}
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header bg-dark text-white text-center">Thông tin phòng</div>
            <div className="card-body">
              {room.length === 0 ? (
                <p>Không có thông tin phòng.</p>
              ) : (
                room.map((r) => (
                  <div key={r.id} className="mb-3">
                    <h5>Phòng: {r.roomNumber}</h5>
                    <p>Tầng: {r.floor}</p>
                    <p>Số người hiện tại: {r.peopleCount}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Unpaid Fees Table */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white text-center">Danh sách khoản phí</div>
            <div className="card-body table-responsive">
              {fees.length === 0 ? (
                <p>Không có khoản phí nào chưa thanh toán.</p>
              ) : (
                <table className="table table-hover text-center">
                  <thead>
                    <tr>
                      <th className="text-left">Diễn giải</th>
                      <th className="text-center">Phòng</th>
                      <th className="text-center">Số tiền</th>
                      <th className="text-center">Hạn thanh toán</th>
                      <th className="text-center">Trạng thái</th>
                      <th className="text-center"></th>
                      <th className="text-center">In Hóa Đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="text-left">{fee.description}</td>
                        <td className="text-center">{fee.roomNumber}</td>
                        <td className="text-center">{fee.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                        <td className="text-center">{format(new Date(fee.dueDate), "dd/MM/yyyy")}</td>
                        <td className="text-center">{fee.status}</td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleShowModal(fee)}>
                            Chi tiết
                          </button>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => generateInvoice(fee.id)}>
                            In Hóa Đơn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết khoản phí */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết khoản phí</h5>
                <button type="button" className="close close-btn" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                {selectedFee && (
                  <>
                    <p><strong>Diễn giải:</strong> {selectedFee.description}</p>
                    <p><strong>Phòng:</strong> {selectedFee.roomNumber}</p>
                    <p><strong>Số tiền:</strong> {selectedFee.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                    <p><strong>Hạn thanh toán:</strong> {format(new Date(selectedFee.dueDate), 'dd/MM/yyyy')}</p>
                    <p><strong>Trạng thái:</strong> {selectedFee.status}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resident;