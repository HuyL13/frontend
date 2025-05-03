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

  // Dùng 2 biến ref riêng biệt để đảm bảo fetch chỉ chạy 1 lần cho mỗi API
  const feesFetched = useRef(false);
  const roomFetched = useRef(false);

  const fetchFees = async () => {
    if (feesFetched.current) return;
    feesFetched.current = true;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found!");

      const response = await fetch(`http://localhost:22986/demo/users/unpaid`, {
        mode: "cors",
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });

      const data = await response.json();
      console.log("Fees API Response:", data);

      if (!Array.isArray(data)) {
        throw new Error("API response for fees is not an array");
      }

      setFees(data);
    } catch (err) {
      console.error("Fees Fetch error:", err);
      setError(err.message);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async () => {
    if (roomFetched.current) return;
    roomFetched.current = true;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found!");

      // Giả sử endpoint trả về thông tin phòng là /demo/rooms
      const response = await fetch(`http://localhost:22986/demo/users/room`, {
        mode: "cors",
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });

      const data = await response.json();
      console.log("Room API Response:", data);

      if (!Array.isArray(data)) {
        throw new Error("API response for rooms is not an array");
      }

      setRoom(data);
    } catch (err) {
      console.error("Room Fetch error:", err);
      setError(err.message);
      setRoom([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    fetchRoom();
  }, []);

  const handleShowModal = (fee) => {
    setSelectedFee(fee);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="resident-overlay">
      <div className="resident-layout">
        <div className="qr-code">
          {!showQR && (
            <button className="btn btn-primary" onClick={() => setShowQR(!showQR)}>
              Hiển thị QR Code
            </button>
          )}
          {showQR && (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/500px-Superqr.svg.png"
              alt="QR Code"
              className="qr-image"
            />
          )}
        </div>

        {/* Hiển thị thông tin phòng */}
        <div className="room-info">
          <h2 className ="text">Thông tin phòng</h2>
          {room.length === 0 ? (
            <p>Không có thông tin phòng.</p>
          ) : (
            room.map((r) => (
              <div key={r.id} className="room-card">
                <h3>Phòng: {r.roomNumber}</h3>
                <p>Tầng: {r.floor}</p>
                <p>Số người hiện tại: {r.peopleCount}</p>
              </div>
            ))
          )}
        </div>

        {/* Hiển thị danh sách phí chưa thanh toán */}
        <div className="resident-fees">
          <h2>Danh sách các khoản phí chưa thanh toán</h2>
          <div className="fee-list">
            {fees.length === 0 ? (
              <p>Không có khoản phí nào chưa thanh toán.</p>
            ) : (
              fees.map((fee) => (
                <div key={fee.id} className="fee-card">
                  <div className="fee-detail">
                    <h4>{fee.description}</h4>
                    <p>Phòng: {fee.roomNumber}</p>
                    <p>
                      Số tiền:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(fee.amount)}
                    </p>
                    <p>
                      Hạn thanh toán: {format(new Date(fee.dueDate), "dd/MM/yyyy")}
                    </p>
                    <p>Trạng thái: {fee.status}</p>
                  </div>
                  <button className="btn btn-light" onClick={() => handleShowModal(fee)}>
                    &#x22EE;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal hiển thị chi tiết khoản phí */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Chi tiết khoản phí</h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedFee && (
                <div>
                  <h4>{selectedFee.description}</h4>
                  <p>
                    <strong>Phòng:</strong> {selectedFee.roomNumber}
                  </p>
                  <p>
                    <strong>Số tiền:</strong>{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedFee.amount)}
                  </p>
                  <p>
                    <strong>Hạn thanh toán:</strong>{" "}
                    {format(new Date(selectedFee.dueDate), "dd/MM/yyyy")}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {selectedFee.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>QR Code Thanh Toán</h4>
              <button className="close-btn" onClick={() => setShowQR(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/500px-Superqr.svg.png"
                alt="QR Code"
                className="qr-image"
              />
              <div className="payment-instruction">
                <p>Quét QR code để thanh toán qua ứng dụng ngân hàng</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resident;
