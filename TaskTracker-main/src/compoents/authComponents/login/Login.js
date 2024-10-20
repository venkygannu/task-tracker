import React, { useEffect } from "react";
import { Card, Divider, Form, Input, Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import companyLogo from "../../../assets/companyLogo.jpg";
import "./login.scss";
import { login, loginWithGoogle } from "../../../firebase/authFirebase";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form] = Form.useForm();
  const { dispatch, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  const handleSubmit = async (values) => {
    console.log("Email:", values.email);
    console.log("Password:", values.password);
    await login(dispatch, values.email, values.password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle(dispatch);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo">
          <img className="company-logo" src={companyLogo} alt="Company Logo" />
          <div className="company-name">
            <div className="company-subtext">Tutorsquest</div>
            <div className="company-maintext">TaskTracker</div>
          </div>
        </div>
        <Card className="login-card">
          <div className="card-title">Login</div>
          <Button className="google-button" onClick={handleGoogleLogin} block>
            <GoogleOutlined className="google-icon" />
            Sign in with Google
          </Button>
          <Divider plain>or</Divider>
          <Form
            form={form}
            name="login_form"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              label="E-Mail"
              rules={[{ required: true, message: "Please input your E-Mail!" }]}
            >
              <Input placeholder="Enter your email address" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password placeholder="Type your Password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                block
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default Login;
