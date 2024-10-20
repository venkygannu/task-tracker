import React, { useEffect, useState } from "react";
import {
  Progress,
  Button,
  Avatar,
  Menu,
  Dropdown,
  Layout,
  Card,
  Badge,
  Flex,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  DownOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
  BellOutlined,
} from "@ant-design/icons";
import "./headerBar.scss";
import { logout } from "../../firebase/authFirebase";
import { useAuth } from "../../contexts/AuthContext";
import companyLogo from "../../assets/HeaderLogo.jpg";

function HeaderBar() {
  const { dispatch, attendanceMarked } = useAuth();
  const [timer, setTimer] = useState(0); // Timer state in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (attendanceMarked) {
      setIsRunning(true); // Start the timer when attendance is marked
    }
  }, [attendanceMarked]);

  useEffect(() => {
    let intervalId;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId); // Clean up the interval on component unmount or when isRunning changes
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleBreak = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning); // Toggle the timer
  };

  const menu = (
    <Menu>
      <Menu.Item key="0">Profile</Menu.Item>
      <Menu.Item key="1">Settings</Menu.Item>
      <Menu.Item key="2">Logout</Menu.Item>
    </Menu>
  );

  const handleLogout = async () => {
    console.log("handle logout being triggered in ffrontend");
    await logout(dispatch, timer);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
        className="header-bar"
      >
        <div className="header-middle" style={{ flex: 1 }}>
          <div>
            <span>Task Status</span>{" "}
            <span style={{ color: "#000" }}>Total : 20</span>
          </div>
          <div style={{display:'flex', width:'100%', gap:'10px', alignItems : 'end'}}>
            <Tooltip style={{width : '100%'}} title="3 done / 3 in progress / 4 to do">
              <Progress
                percent={60}
                success={{
                  percent: 30,
                }}
                showInfo={false}
              />
            </Tooltip>
            <span></span>
          </div>

          {/* <Progress
            className="header-progress-bar"
            percent={50}
            status="active"
          /> */}
        </div>
        <div className="header-left-group">
          <div className="button-group">
            <Button
              className="custom-break-button" // Apply the custom class name
              icon={isRunning ? <PauseOutlined /> : <PlayCircleOutlined />} // Conditionally render icon
              onClick={handleBreak}
            >
              {isRunning ? "Break" : "Continue"}
            </Button>
            <span className="timer">{formatTime(timer)}</span>
            <Button
              type="default"
              danger
              className="punch-out-button"
              icon={<PoweroffOutlined />}
              onClick={handleLogout}
            >
              Punch Out
            </Button>
            {/* <Button
              className="punch-in-button"
              icon={<PoweroffOutlined />}
              style={{ marginLeft: 8 }}
              onClick={handleLogout}
            >
              Punch In <span> </span>
            </Button> */}
          </div>
          <div className="notification">
            <Badge count={99} offset={[11, 0]}>
              <BellOutlined />
            </Badge>
          </div>
          <div className="profile-dropdown">
            <Dropdown overlay={menu} trigger={["click"]}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                <Avatar
                  style={{ backgroundColor: "#f56a00", marginRight: 8 }}
                  icon={<UserOutlined />}
                />
                <div>
                  <span className="username">Danny Georgesdfwergwqedf</span>
                  <span className="userrole">Admin</span>
                </div>
                <DownOutlined />
              </a>
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderBar;
