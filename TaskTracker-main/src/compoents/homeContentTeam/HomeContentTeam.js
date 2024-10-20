import React, { useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { notification, Progress } from "antd";
import Loader from "../loader/Loader";
import Avatar from "../../assets/Avatar.png";
import { useAuth } from "../../contexts/AuthContext";

function HomeContent() {
  const { currentUser } = useAuth();
  const {
    fetchClientPayments,
    fetchUniversities,
    fetchClients,
    fetchTeam,
    state,
    setLoading,
    fetchWeeks,
    fetchTasks,
    fetchAllTasksExceptLatest,
  } = useApp();

  const statusOptions = [
    { value: "Completed", color: "green" },
    { value: "Pending", color: "yellow" },
    { value: "Urgent", color: "red" },
    { value: "Overdue", color: "purple" },
  ];

  const announcements = [
    {
      id: 1,
      user: "Danny George",
      date: "20/07/2024, 08:19 PM",
      message: "Happy Birthday Rohit!",
    },
    {
      id: 2,
      user: "Emily Johnson",
      date: "23/07/2024, 09:45 AM",
      message: "Congratulations on your promotion!",
    },
    {
      id: 3,
      user: "Michelle Davis",
      date: "25/07/2024, 02:30 PM",
      message: "Best wishes on your anniversary!",
    },
    {
      id: 4,
      user: "Alex Thompson",
      date: "27/07/2024, 05:15 PM",
      message: "Good luck on your new venture!",
    },
  ];

  const statusCounts = {
    Total: 0,
    Completed: 0,
    Pending: 0,
    Urgent: 0,
    Overdue: 0,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUniversities(),
          fetchTeam(),
          fetchClients(),
          fetchWeeks(),
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
          await fetchTasks(state.activeSheet);
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

  const progressData = statusOptions.map((option) => ({
    ...option,
    percent: (statusCounts[option.value] / statusCounts.Total) * 100,
  }));

  return (
    <div>
      {state.loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="font-medium text-3xl text-start">
            Welcome, {currentUser.displayName}
          </div>
          <div className="flex flex-col gap-3">
            <div className="font-medium text-xl text-slate-500 text-start ">
              Task Status
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="flex bg-white items-center">
                <div className="flex flex-col gap-2 p-6">
                  <div className="font-normal text-xs">Total</div>
                  <div className="font-medium text-4xl">30</div>
                </div>
                <div className="w-full pr-4">
                  <Progress
                    percent={100}
                    showInfo={false}
                    strokeColor={{
                      "0%": progressData[0]?.color,
                      "25%": progressData[1]?.color,
                      "50%": progressData[2]?.color,
                      "75%": progressData[3]?.color,
                    }}
                    success={{ percent: progressData[0]?.percent }}
                    format={() => `${statusCounts.Total}`}
                  />
                </div>
              </div>
              <div className="flex gap-[10px]">
                <div className="flex flex-col gap-2 p-6 w-full bg-white">
                  <div className="flex items-center gap-[7px]">
                    <span className="h-[10px] w-[10px] rounded-full bg-green-500"></span>
                    <div className="font-normal text-[16px] text-slate-500">
                      Completed
                    </div>
                  </div>
                  <div className="font-medium text-4xl text-start">12</div>
                </div>
                <div className="flex flex-col gap-2 p-6 w-full bg-white">
                  <div className="flex items-center gap-[7px]">
                    <span className="h-[10px] w-[10px] rounded-full bg-[#FADB14]"></span>
                    <div className="font-normal text-[16px] text-slate-500">
                      Pending
                    </div>
                  </div>
                  <div className="font-medium text-4xl text-start">12</div>
                </div>
                <div className="flex flex-col gap-2 p-6 w-full bg-white">
                  <div className="flex items-center gap-[7px]">
                    <span className="h-[10px] w-[10px] rounded-full bg-[#FF4D4F]"></span>
                    <div className="font-normal text-[16px] text-slate-500">
                      Urgent
                    </div>
                  </div>
                  <div className="font-medium text-4xl text-start">12</div>
                </div>
                <div className="flex flex-col gap-2 p-6 w-full bg-white">
                  <div className="flex items-center gap-[7px]">
                    <span className="h-[10px] w-[10px] rounded-full bg-[#722ED1]"></span>
                    <div className="font-normal text-[16px] text-slate-500">
                      Overdue
                    </div>
                  </div>
                  <div className="font-medium text-4xl text-start">12</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="font-medium text-xl text-slate-500 text-start ">
              Announcements
            </div>
            <div className="flex flex-col gap-[10px]">
              {announcements.map((announcement) => (
                <div className="flex flex-col gap-2 p-3 bg-white justify-start">
                  <div className="flex gap-[10px]">
                    <img src={Avatar}></img>
                    <div className="font-medium text-[16px] flex gap-[10px]">
                      <span className="font-normal text-[14px] text-slate-500">
                        {announcement.user}
                      </span>
                      <span className="font-normal text-[14px] text-slate-500">
                        {announcement.date}, 08:19 PM
                      </span>
                    </div>
                  </div>
                  <div className="font-normal text-[16px] text-start">
                    {announcement.message}
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-2 p-3 bg-white justify-start">
                <div className="flex gap-[10px]">
                  <img src={Avatar}></img>
                  <div className="font-medium text-[16px] flex gap-[10px]">
                    <span className="font-normal text-[14px] text-slate-500">
                      Danny George
                    </span>
                    <span className="font-normal text-[14px] text-slate-500">
                      20/07/2024, 08:19 PM
                    </span>
                  </div>
                </div>
                <div className="font-normal text-[16px] text-start">
                  Happy Birthday Rohith !
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-white justify-start">
                <div className="flex gap-[10px]">
                  <img src={Avatar}></img>
                  <div className="font-medium text-[16px] flex gap-[10px]">
                    <span className="font-normal text-[14px] text-slate-500">
                      Danny George
                    </span>
                    <span className="font-normal text-[14px] text-slate-500">
                      20/07/2024, 08:19 PM
                    </span>
                  </div>
                </div>
                <div className="font-normal text-[16px] text-start">
                  Happy Birthday Rohith !
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-white justify-start">
                <div className="flex gap-[10px]">
                  <img src={Avatar}></img>
                  <div className="font-medium text-[16px] flex gap-[10px]">
                    <span className="font-normal text-[14px] text-slate-500">
                      Danny George
                    </span>
                    <span className="font-normal text-[14px] text-slate-500">
                      20/07/2024, 08:19 PM
                    </span>
                  </div>
                </div>
                <div className="font-normal text-[16px] text-start">
                  Happy Birthday Rohith !
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeContent;

// import React, { useEffect } from "react";
// import {
//   Row,
//   Col,
//   Statistic,
//   notification,
//   Progress,
//   Badge,
//   Card,
//   Divider,
// } from "antd";
// import { useAuth } from "../../contexts/AuthContext";
// import { useApp } from "../../contexts/AppContext";

// const statusOptions = [
//   { value: "Completed", color: "green" },
//   { value: "Pending", color: "yellow" },
//   { value: "Urgent", color: "red" },
//   { value: "Overdue", color: "purple" },
// ];

// function HomeContentTeam() {
//   const { currentUser } = useAuth();
//   const {
//     fetchWeeks,
//     fetchAllTasksExceptLatest,
//     fetchTasks,
//     setLoading,
//     state,
//   } = useApp();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         await fetchWeeks();
//         setLoading(false);
//       } catch (error) {
//         setLoading(false);
//         notification.error({
//           message: "Error fetching data",
//           description: error.message,
//         });
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     const fetchTaskData = async () => {
//       if (state.weeks.length > 0 && state.activeSheet) {
//         try {
//           setLoading(true);
//           await fetchTasks(state.activeSheet);
//           await fetchAllTasksExceptLatest(state.weeks, state.activeSheet);
//           setLoading(false);
//         } catch (error) {
//           setLoading(false);
//           notification.error({
//             message: "Error fetching tasks",
//             description: error.message,
//           });
//         }
//       }
//     };

//     fetchTaskData();
//   }, [state.activeSheet]);

//   // Optimized task counting logic
//   const statusCounts = {
//     Total: 0,
//     Completed: 0,
//     Pending: 0,
//     Urgent: 0,
//     Overdue: 0,
//   };
//   const currentDate = new Date();
//   if (state.tasks && state.tasks.length > 0) {
//     state.tasks.forEach((item) => {
//       item.tasks.forEach((task) => {
//         const dueDate =
//           task.dueDate && task.dueDate.toDate
//             ? task.dueDate.toDate()
//             : new Date(task.dueDate);
//         let derivedStatus = task.status; // Default to the original status

//         if (dueDate) {
//           if (dueDate < currentDate) {
//             derivedStatus = "Overdue";
//           } else if (dueDate - currentDate <= 24 * 60 * 60 * 1000) {
//             // 24 hours in milliseconds
//             derivedStatus = "Urgent";
//           }
//         }

//         statusCounts.Total++;

//         if (derivedStatus in statusCounts) {
//           statusCounts[derivedStatus]++;
//         }
//       });
//     });
//   }

//   const progressData = statusOptions.map((option) => ({
//     ...option,
//     percent: (statusCounts[option.value] / statusCounts.Total) * 100,
//   }));

//   return (
//     <div>
//       <h1>Welcome, {currentUser.displayName}</h1>
//       <Card>
//         <h3>Task Status</h3>
//         <Row gutter={16}>
//           <Col span={4}>
//             <Statistic title="Total" value={statusCounts.Total} />
//           </Col>
//           <Col span={24}>
//             <Progress
//               percent={100}
//               showInfo={false}
//               strokeColor={{
//                 "0%": progressData[0]?.color,
//                 "25%": progressData[1]?.color,
//                 "50%": progressData[2]?.color,
//                 "75%": progressData[3]?.color,
//               }}
//               success={{ percent: progressData[0]?.percent }}
//               format={() => `${statusCounts.Total}`}
//               style={{ marginBottom: "16px" }}
//             />
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           {statusOptions.map((option) => (
//             <Col key={option.value} span={6}>
//               <Statistic
//                 title={<Badge color={option.color} text={option.value} />}
//                 value={statusCounts[option.value]}
//               />
//             </Col>
//           ))}
//         </Row>
//       </Card>
//       <Divider />
//       <Card style={{ marginTop: "24px" }}>
//         <h3>Announcements</h3>
//         {announcements.map((announcement) => (
//           <div key={announcement.id} style={{ marginBottom: "16px" }}>
//             <p>
//               <strong>{announcement.user}</strong>{" "}
//               <span>{announcement.date}</span>
//             </p>
//             <p>{announcement.message}</p>
//           </div>
//         ))}
//       </Card>
//     </div>
//   );
// }

// export default HomeContentTeam;
