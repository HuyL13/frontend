import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Row, Col, Alert, Space, Divider } from "antd";
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import chungCu from "./Chung_cu4.jpeg";

const { Title, Text, Paragraph } = Typography;

const Reset = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy thông tin từ location state
  const { email, otp } = location.state || {};

  // Kiểm tra thông tin cần thiết khi component được tải
  useEffect(() => {
    if (!email || !otp) {
      setMessage({ 
        type: "error", 
        content: "Thông tin xác thực không hợp lệ hoặc đã hết hạn, vui lòng thực hiện lại quá trình quên mật khẩu." 
      });
    }
  }, [email, otp]);

  const handlePasswordUpdate = async (values) => {
    const { newPassword, confirmPassword } = values;
    
    if (!email || !otp) {
      setMessage({ type: "error", content: "Thiếu thông tin xác thực" });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch(
        `https://backend-6w7s.onrender.com/demo/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      const data = await response.text();
      
      if (!response.ok) {
        throw new Error(data || "Đặt lại mật khẩu thất bại");
      }

      setMessage({
        type: "success",
        content: "Cập nhật mật khẩu thành công! Đang chuyển hướng..."
      });

      // Tự động chuyển hướng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setMessage({
        type: "error",
        content: err.message.replace(/^Error: /, "")
      });
    } finally {
      setIsProcessing(false);
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)" 
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <Title level={3}>Đặt lại mật khẩu</Title>
              <Text type="secondary">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</Text>
            </div>

            {message.content && (
              <Alert
                message={message.type === "success" ? "Thành công" : "Lỗi"}
                description={message.content}
                type={message.type}
                showIcon
                icon={message.type === "success" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                style={{ marginBottom: "1.5rem" }}
              />
            )}

            {(!email || !otp) ? (
              <div style={{ textAlign: "center" }}>
                <Button type="primary" onClick={() => navigate("/forgot-password")}>
                  Quay lại trang quên mật khẩu
                </Button>
              </div>
            ) : (
              <Form
                form={form}
                name="reset_password"
                onFinish={handlePasswordUpdate}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                  hasFeedback
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Nhập mật khẩu mới" 
                    size="large"
                    disabled={isProcessing}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['newPassword']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Nhập lại mật khẩu" 
                    size="large"
                    disabled={isProcessing}
                  />
                </Form.Item>

                <Form.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isProcessing}
                      block
                      size="large"
                    >
                      Đổi mật khẩu
                    </Button>
                    
                    <Button
                      type="default"
                      block
                      size="large"
                      onClick={() => navigate("/login")}
                    >
                      Hủy bỏ
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            <Divider plain><Text type="secondary">hoặc</Text></Divider>
            
            <div style={{ textAlign: "center" }}>
              <Link to="/login">Quay lại đăng nhập</Link>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default Reset;