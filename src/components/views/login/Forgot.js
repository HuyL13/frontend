import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Row, Col, Alert, Spin } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import chungCu from "./Chung_cu4.jpeg";

const { Title, Text } = Typography;

const Forgot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Hàm xử lý gửi OTP
  const handleSendOtp = async (values) => {
    const { email } = values;
    setError("");
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://backend-6w7s.onrender.com/demo/auth/request-otp?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const data = await response.text();
      
      if (!response.ok) throw new Error(data || "Không thể gửi OTP");

      // Chuyển hướng sang trang OTP và truyền email qua state
      navigate("/otp", { state: { email } });

    } catch (err) {
      setError(err.message.replace(/^Error: /, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={0} className="auth-wrapper" style={{ minHeight: "100vh" }}>
      {/* Cột bên trái cho hình ảnh */}
      <Col xs={0} sm={0} md={12} lg={14} xl={16} className="auth-background-col">
        <div className="auth-background-holder" style={{ height: "100%" }}>
          <img
            src={chungCu}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            alt="Chung cư"
          />
        </div>
      </Col>

      {/* Cột bên phải cho form */}
      <Col xs={24} sm={24} md={12} lg={10} xl={8} className="auth-main-col">
        <div style={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          padding: "2rem" 
        }}>
          <Card 
            bordered={false} 
            className="auth-card"
            style={{ 
              maxWidth: "400px", 
              width: "100%", 
              margin: "0 auto",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <Title level={3}>Quên mật khẩu</Title>
              <Text type="secondary">Nhập email để nhận mã OTP đặt lại mật khẩu</Text>
            </div>

            {error && (
              <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: "1rem" }}
              />
            )}

            <Form
              form={form}
              name="forgot_password"
              onFinish={handleSendOtp}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email đăng ký" 
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  {loading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link to="/login">Quay lại đăng nhập</Link>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default Forgot;