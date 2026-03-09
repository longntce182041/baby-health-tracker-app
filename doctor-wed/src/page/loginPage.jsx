import React from "react";
import { Form, Input, Button, Checkbox, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../api/authApi";
import "../style/loginPage.css";

const { Title, Text } = Typography;

export default function LoginPage({ onLoginSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log("Login values:", values);

      // Call login API
      const response = await login({
        email: values.email,
        password: values.password,
      });

      console.log("Login response:", response);

      const userRaw = localStorage.getItem("user");
      const role = userRaw ? JSON.parse(userRaw)?.role : "";
      if (String(role || "").toLowerCase() !== "doctor") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        message.error("Tài khoản này không thuộc vai trò bác sĩ.");
        return;
      }

      message.success("Đăng nhập thành công!");
      onLoginSuccess?.();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Vui lòng điền đầy đủ thông tin!");
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <UserOutlined style={{ fontSize: 50, color: "#F4ABB4" }} />
            </div>
          </div>
          <Title level={2} className="login-title">
            Đăng nhập
          </Title>
          <Text type="secondary" className="login-subtitle">
            Hệ thống quản lý cho bác sĩ - Nền tảng chăm sóc sức khỏe toàn diện
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
              {
                type: "email",
                message: "Email không hợp lệ!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div className="form-extras">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a className="login-form-forgot" href="#forgot">
                Quên mật khẩu?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="login-footer">
            <Text type="secondary">
              Chưa có tài khoản?{" "}
              <a href="#register" className="register-link">
                Đăng ký ngay
              </a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
