import React, { useState, useEffect } from "react";
import { Menu, Input, Button, List, Badge, Modal, Form, message } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  FileOutlined,
  DollarOutlined,
  SettingOutlined,
  OrderedListOutlined,
  PercentageOutlined,
  SearchOutlined,
  PlusOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import companyLogo from "../../assets/HeaderLogo.jpg";
import { useApp } from "../../contexts/AppContext";
import { GraduationCap, MonitorSmartphone } from "lucide-react";
import "./sideBar.scss";

function SideBar({ onMenuClick }) {
  const [selectedKey, setSelectedKey] = useState("home");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addSheet, state, setActiveSheet } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    console.log(state.weeks);
    console.log(state.activeSheet);
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const items = [
    {
      key: "home",
      icon: <HomeOutlined className={`${isCollapsed && "increase-icon"}`} />,
      label: isCollapsed ? null : "Home",
    },
    {
      key: "addClient",
      icon: <UserOutlined className={`${isCollapsed && "increase-icon"}`} />,
      label: isCollapsed ? null : "Add Client",
      icon2: <PlusOutlined />,
    },
    {
      key: "tasks",
      label: isCollapsed ? null : "Tasks",
      icon: <OrderedListOutlined className={`${isCollapsed && "increase-icon"}`} />,
      children: isCollapsed
        ? null
        : [
            {
              key: "overallTasks",
              label: "Overall Tasks",
            },
            {
              key: "extraProjects",
              label: "Extra Projects",
            },
          ],
    },
    {
      key: "grades",
      label: isCollapsed ? null : "Grades",
      icon: <PercentageOutlined className={`${isCollapsed && "increase-icon"}`} />,
      children: isCollapsed
        ? null
        : [
            {
              key: "finalGrades",
              label: "Final Grades",
            },
            {
              key: "weekGrades",
              label: "Week Grades",
            },
          ],
    },
    {
      key: "payments",
      label: isCollapsed ? null : "Payments",
      icon: <DollarOutlined className={`${isCollapsed && "increase-icon"}`} />,
      children: isCollapsed
        ? null
        : [
            {
              key: "clientSales",
              label: "Client Sales",
            },
            {
              key: "clientPaymentLog",
              label: "Client Payment Log",
            },
            {
              key: "extraProjectSales",
              label: "Extra Project Sales",
            },
            {
              key: "extraProjectLog",
              label: "Extra Project Log",
            },
            {
              key: "overallSales",
              label: "Overall Sales",
            },
          ],
    },
    {
      key: "manage",
      label: isCollapsed ? null : "Manage",
      icon: <SettingOutlined className={`${isCollapsed && "increase-icon"}`} />,
      children: isCollapsed
        ? null
        : [
            {
              key: "team",
              label: "Team",
            },
            {
              key: "clients",
              label: "Clients",
            },
            {
              key: "universities",
              label: "Universities",
            },
          ],
    },
  ];

  const handleWeekClick = async (id) => {
    await setActiveSheet(id);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const sheetName = values.name;
      console.log("this is the subject name:", sheetName);
      const result = await addSheet(sheetName);
      if (result === null) {
        messageApi.success(`Sheet added and sheet set to '${sheetName}'`);
        setIsModalVisible(false);
        form.resetFields();
      } else {
        messageApi.error(result);
      }
    } catch (errorInfo) {
      console.error("Failed to save sheet:", errorInfo);
    }
  };

  const ADDSHEET = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Sheet Name"
        rules={[{ required: true, message: "Please input the sheet name!" }]}
      >
        <Input placeholder="Enter sheet name" />
      </Form.Item>
    </Form>
  );

  const handleMenuClick = (e) => {
    onMenuClick(e.key);
    setSelectedKey(e.key);
  };

  return (
    <>
      <div
        className={`sidebar h-svh ${isCollapsed ? "collapsed" : ""}`}
        style={{
          width: isCollapsed ? "80px" : "250px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          rowGap: "10px",
          transition: "width 0.5s ease",
        }}
      >
        <div className="flex flex-col gap-[10px]">
          <div
            className="logo"
            style={{ padding: isCollapsed ? "10px" : "16px" }}
          >
            <img
              className={`company-logo ${
                isCollapsed ? "text-[20px]" : "text-[15px]"
              }`}
              src={companyLogo}
              alt="Company Logo"
              style={{ transition: "scale 0.5s ease" }}
            />
            {!isCollapsed && (
              <div className="company-name">
                <div className="company-subtext">Tutorsquest</div>
                <div className="company-maintext">TaskTracker</div>
              </div>
            )}
          </div>
          {contextHolder}

          <Menu
            theme="light"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={items.map((item) => ({
              ...item,
              className:
                item.key === selectedKey ? "" : `ant-menu-item-not-selected`,
            }))}
            onClick={handleMenuClick}
            style={{ border: "none", transition: "padding 0.5s ease" }}
          />

          {!isCollapsed && (
            <div
              className="sheet-list"
              style={{ marginTop: "auto", padding: "16px" }}
            >
              <List
                className={`${isCollapsed ? "text-[20px]" : "text-[15px]"}`}
                dataSource={state.weeks}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => handleWeekClick(item.id)}
                    style={{ padding: "8px 0", cursor: "pointer" }}
                    className={`${isCollapsed ? "text-[20px]" : "text-[15px]"}`}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={
                        <Badge
                          className={`${
                            isCollapsed ? "text-[20px]" : "text-[15px]"
                          }`}
                          status={
                            item.id === state.activeSheet
                              ? "success"
                              : "default"
                          }
                          style={{ marginRight: "8px" }}
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          <Modal
            title="ADD SHEET NAME"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button key="save" type="primary" onClick={handleSave}>
                Save
              </Button>,
            ]}
          >
            <ADDSHEET />
          </Modal>
        </div>
        <MenuFoldOutlined
          className={`text-start p-4 h-10 cursor-pointer border-t-2 ml-2 ${ isCollapsed ? 'text-[20px]' : 'text-[15px]'}`}
          onClick={handleCollapse}
        />
      </div>
    </>
  );
}

export default SideBar;
