import React, { useState } from "react";
import { Layout, Modal } from "antd";
import SideBar from "./compoents/sideBar/SideBar";
import HeaderBar from "./compoents/header/HeaderBar";
import AttendanceOverlay from "./compoents/authComponents/attendance/Attendance";
import HomeContent from "./compoents/homeContent/HomeContent";
import AddClient from "./compoents/clients/AddClient";
import Univeristy from "./compoents/universities/Univeristy";
import TeamMembers from "./compoents/teamMembers/TeamMembers";
import Clients from "./compoents/clients/Clients";

import ClientSales from "./compoents/payments/clientsSales/ClientSales";
import ClientLog from "./compoents/payments/clientsLog/ClientLog";
import OverallSales from "./compoents/payments/OverallSales";
import OverallTasks from "./compoents/overallTasks/OverallTasks";
import WeekGrades from "./compoents/grades/weekgrades/WeekGrades";
import FinalGrade from "./compoents/grades/finalGrades/FinalGrade";
import ExtraProject from "./compoents/extraProjects/ExtraProject";
import ExtraProjectLog from "./compoents/payments/extraProjectlogs/ExtraProjectLog";
import { useApp } from "./contexts/AppContext";
import { useAuth } from "./contexts/AuthContext";
import ExtraProjectSales from "./compoents/payments/extraProjectSales/ExtraProjectSales";
import HomeContentTeam from "./compoents/homeContentTeam/HomeContentTeam";
import { calc, getLineHeight } from "antd/es/theme/internal";

const { Header, Sider, Content } = Layout;

const layoutStyle = {
  minHeight: "100vh",
};

const headerStyle = {
  textAlign: "center",
  padding: "6px 10px 0px 6px",
  lineHeight: "28px",
  height: "75px",
  backgroundColor: "white",
};

const siderStyle = {
  textAlign: "center",
  lineHeight: "100px",
  // color: '#fff',
  backgroundColor: "white",
};

const contentStyle = {
  // margin: '10px 10px',
  padding: 24,
  backgroundColor: "#f4f4f4",
  minHeight: 280,
};

function Home() {
  const { attendanceMarked, setAttendanceMarked, loading, currentUser } =
    useAuth();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [isAddClientModalVisible, setIsAddClientModalVisible] = useState(false);

  const handlePunchIn = () => {
    setAttendanceMarked(true);
  };

  const handleMenuClick = (key) => {
    setSelectedMenu(key);
    if (key === "addClient") {
      setIsAddClientModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setIsAddClientModalVisible(false);
  };

  const renderContent = () => {
    const role = currentUser.role;
    switch (selectedMenu) {
      case "home":
        if (role === "admin" || role === "manager") {
          return <HomeContent />;
        } else {
          return <HomeContentTeam />;
        }
      case "universities":
        return <Univeristy />;
      case "team":
        return <TeamMembers />;
      case "clients":
        return <Clients />;
      case "clientPaymentLog":
        return <ClientLog />;
      case "clientSales":
        return <ClientSales />;
      case "overallSales":
        return <OverallSales />;
      case "overallTasks":
        return <OverallTasks />;
      case "weekGrades":
        return <WeekGrades />;
      case "finalGrades":
        return <FinalGrade />;
      case "extraProjects":
        return <ExtraProject />;
      case "extraProjectLog":
        return <ExtraProjectLog />;
      case "extraProjectSales":
        return <ExtraProjectSales />;
      // Add more cases for other menu items
      default:
        if (role === "admin" || role === "manager") {
          return <HomeContent />;
        } else {
          return <HomeContentTeam />;
        }
    }
  };
  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while the authentication state is being resolved
  }

  return (
    <>
      <Layout style={layoutStyle}>
        <Sider width="fit-content" style={siderStyle}>
          <SideBar onMenuClick={handleMenuClick} />
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            <HeaderBar attendanceMarked={attendanceMarked} />
          </Header>
          <Content
            className="content-height overflow-y-scroll"
            style={contentStyle}
          >
            {attendanceMarked ? (
              renderContent()
            ) : (
              <AttendanceOverlay
                visible={!attendanceMarked}
                onPunchIn={handlePunchIn}
              />
            )}
          </Content>
        </Layout>
        <Modal
          title="Add Client"
          open={isAddClientModalVisible}
          onCancel={handleModalClose}
          footer={null}
          centered
        >
          <AddClient />
        </Modal>
      </Layout>
    </>
  );
}

export default Home;
