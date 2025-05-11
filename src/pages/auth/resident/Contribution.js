import React, { useEffect, useState } from "react";
import { Button, Card, Form, Alert, Row, Col } from "react-bootstrap";
import "../../../styles/Contribution.css";

const Contribution = () => {
  const [activeContributions, setActiveContributions] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchActiveContributions();
    fetchMyRecords();
  }, []);

  const fetchActiveContributions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://backend-13-6qob.onrender.com/demo/contribute/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setActiveContributions(data);
    } catch (err) {
      console.error("Failed to fetch active contributions", err);
    }
  };

  const fetchMyRecords = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://backend-13-6qob.onrender.com/demo/contribute/my-records", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMyRecords(data);
    } catch (err) {
      console.error("Failed to fetch contribution records", err);
    }
  };

  const handleContribution = async (id) => {
    const amount = parseFloat(amounts[id]);
    if (!amount || amount <= 1000) {
      setMessage("Số tiền phải lớn hơn 1000.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/contribute/${id}/contribute?amount=${amount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Đóng góp thất bại");

      setMessage("Đóng góp thành công!");
      fetchMyRecords();
    } catch (err) {
      setMessage("Lỗi khi đóng góp.");
      console.error(err);
    }
  };

return (
      <div className="contribution-page">
        {/* QR cố định bên phải */}
        <div className="qr-fixed-box">
          <Card className="qr-card">
            <Card.Header className="bg-primary text-white text-center">
              Thanh toán bằng QR
            </Card.Header>
            <Card.Body className="text-center">
              {!showQR ? (
                <Button variant="outline-primary" onClick={() => setShowQR(true)}>
                  Hiển thị QR Code
                </Button>
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/500px-Superqr.svg.png"
                  alt="QR Code"
                  className="img-fluid"
                  style={{ maxWidth: "100%" }}
                />
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Phần nội dung chính */}
        <div className="contribution-container">
          <h2>Danh sách các khoản đóng góp đang diễn ra</h2>
          {message && <Alert variant="info">{message}</Alert>}
          <div className="contribution-list">
            {activeContributions.map((item) => (
              <Card key={item.id} className="contribution-card">
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <p>
                    <strong>Từ:</strong> {item.startDate} — <strong>Đến:</strong> {item.endDate}
                  </p>
                  <Form.Group>
                    <Form.Control
                      type="number"
                      placeholder="Nhập số tiền muốn đóng"
                      value={amounts[item.id] || ""}
                      onChange={(e) =>
                        setAmounts({ ...amounts, [item.id]: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={() => handleContribution(item.id)}
                  >
                    Đóng góp
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>

          <h2 className="mt-5">Lịch sử đóng góp của bạn</h2>
          <div className="record-list">
            {myRecords.map((rec) => (
              <Card key={rec.id} className="record-card">
                <Card.Body>
                  <Card.Title>{rec.contribution.title}</Card.Title>
                  <p><strong>Số tiền:</strong> {rec.amount} VND</p>
                  <p><strong>Ngày góp:</strong> {new Date(rec.contributedAt).toLocaleString()}</p>
                  <p><strong>Trạng thái:</strong> {rec.approved ? "Đã duyệt" : "Chờ duyệt"}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
   };

export default Contribution;
