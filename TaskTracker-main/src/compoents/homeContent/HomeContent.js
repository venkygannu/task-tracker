import React, { useEffect, useMemo } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  notification,
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Avatar,
  Flex,
  Divider,
} from "antd";
import Loader from "../loader/Loader";
import "./homeContent.scss";
import { useAuth } from "../../contexts/AuthContext";

function HomeContent() {
  const {
    fetchClientPayments,
    fetchClients,
    state,
    setLoading,
    fetchWeeksAndLatestTasks,
    fetchAllTasksExceptLatest,
  } = useApp();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          // fetchUniversities(),
          // fetchTeam(),
          fetchClients(),
          fetchWeeksAndLatestTasks(),
          fetchClientPayments(),
        ]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notification.error({
          message: "Error fetching data",
          description: error.message,
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTaskData = async () => {
      if (state.weeks.length > 0 && state.activeSheet) {
        try {
          setLoading(true);
          await fetchAllTasksExceptLatest(state.weeks, state.activeSheet);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          notification.error({
            message: "Error fetching tasks",
            description: error.message,
          });
        }
      }
    };

    fetchTaskData();
  }, [state.activeSheet]);

  function calculateMetrics(clients, payments) {
    const counts = {};
    let totalAmount = 0;

    clients.forEach((client) => {
      counts[client.universityId] = (counts[client.universityId] || 0) + 1;
      totalAmount += parseFloat(client.amount || 0);
    });
    console.log("these are payments:", totalAmount);
    const totalPayments = payments.reduce(
      (total, payment) => total + parseFloat(payment.amount || 0),
      0
    );

    return {
      universityClientCounts: counts,
      totalAmount: totalAmount,
      totalPayments: totalPayments,
      remainingBalance: totalAmount - totalPayments,
    };
  }

  function calculateTeamStatus(tasks) {
    const currentDate = new Date();
    const teamData = {};

    const incrementStatusCount = (memberData, status) => {
      memberData.Total++;
      if (status in memberData) {
        memberData[status]++;
      }
    };

    tasks.forEach(({ tasks }) => {
      tasks.forEach(({ assignedTo, dueDate, status }) => {
        const memberData = teamData[assignedTo] || {
          Total: 0,
          Completed: 0,
          Pending: 0,
          Overdue: 0,
        };

        let derivedStatus = status;

        if (status !== "Completed") {
          const dueDateObj = new Date(dueDate.seconds * 1000); // Convert Firestore timestamp
          if (dueDateObj < currentDate) {
            derivedStatus = "Overdue";
          } else if (dueDateObj - currentDate <= 24 * 60 * 60 * 1000) {
            derivedStatus = "Pending";
          }
        }

        incrementStatusCount(memberData, derivedStatus);

        teamData[assignedTo] = memberData;
      });
    });

    return Object.entries(teamData).map(([name, data]) => ({
      name,
      ...data,
    }));
  }

  const {
    universityClientCounts,
    totalAmount,
    totalPayments,
    remainingBalance,
  } = useMemo(() => {
    return calculateMetrics(state.clients, state.clientPayments);
  }, [state.clients, state.clientPayments]);

  const teamStatus = useMemo(() => {
    return calculateTeamStatus(state.tasks);
  }, [state.tasks]);

  return (
    <div>
      {state.loading && <Loader />}
      <h1 className="text-3xl font-medium text-start">
        Welcome, {currentUser.displayName}
      </h1>
      <Divider />
      <h3 className="text-xl text-gray-400 text-start">Team Status</h3>
      <Row>
        <Col span={20}>
          <Row gutter={16}>
            {teamStatus.map(({ name, Total, Completed, Pending, Overdue }) => (
              <Col span={12} key={name} style={{ marginBottom: 20 }}>
                <Row align="middle">
                  <Col span={4}>
                    <Avatar>{name.charAt(0)}</Avatar>
                  </Col>
                  <Col span={20}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{name}</h4>
                        <p style={{ margin: 0 }}>Total: {Total}</p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <Progress
                          type="circle"
                          format={() => `${Completed}`}
                          strokeColor="#52c41a"
                          size={80}
                        />
                        <Progress
                          type="circle"
                          format={() => `${Pending}`}
                          strokeColor="#faad14"
                          size={80}
                        />
                        <Progress
                          type="circle"
                          format={() => `${Overdue}`}
                          strokeColor="#f5222d"
                          size={80}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Divider />
      <h3 className="text-xl text-gray-400 text-start">Client / University</h3>
      <Row gutter={8} className="scrollbar scroll">
        {Object.keys(universityClientCounts).map((universityId) => (
          <Col key={universityId}>
            <Card className="w-60">
              {/* <Statistic
                title={universityId}
                value={universityClientCounts[universityId]}
                prefix="Clients:"
              /> */}
              <div className="text-start">
                <p className="font-normal text-[16px] text-black p-0 m-0 leading-7">
                  {universityId}
                </p>
                <p className="font-normal text-[14px] text-gray-400 leading-7 m-0 p-0">
                  Clients : {universityClientCounts[universityId]}
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <h3 className="text-xl text-gray-400 text-start mt-6">Payment Status</h3>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              className="text-start"
              title={<h4 className="font-normal text-[16px] m-0">Total Payments</h4>}
              value={totalPayments}
              precision={2}
              prefix="$"
              valueStyle={{fontSize: '38px', fontWeight: '500'}}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              className="text-start"
              title={<h4 className="font-normal text-[16px] m-0">Pending Payments</h4>}
              value={remainingBalance}
              precision={2}
              prefix="$"
              valueStyle={{fontSize: '38px', fontWeight: '500'}}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomeContent;
