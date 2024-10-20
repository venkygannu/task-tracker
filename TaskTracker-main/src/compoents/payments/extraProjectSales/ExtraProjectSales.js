import React, { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Space,
  Popconfirm,
  message,
  Button,
  Modal,
  Tooltip,
  Input,
  Select,
} from "antd";
import {
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../contexts/AppContext";
import moment from "moment";
import { hasFormSubmit } from "@testing-library/user-event/dist/utils";
import ExpandIcon from "../../../assets/expandIcon.svg";
import CollapseIcon from "../../../assets/collapseIcon.svg";

const calculateProjectPayments = (extraProjects, projectPayments) => {
  return extraProjects.map((project) => {
    const projectId = project.id.toLowerCase();
    const projectPaymentData = projectPayments.filter(
      (payment) =>
        payment.projectName.replace(/\s/g, "").toLowerCase() === projectId &&
        payment.status === "verified"
    );

    const { Option } = Select;

    const totalPaid = projectPaymentData.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const pendingAmount = Number(project.payment) - totalPaid;

    let status = "Pending";
    if (pendingAmount === 0) {
      status = "Completed";
    } else if (totalPaid > Number(project.payment)) {
      status = "Exceeded";
    } else if (totalPaid > 0) {
      status = "Pending";
    }

    return {
      ...project,
      totalPaid,
      pendingAmount,
      status,
      payments: projectPaymentData,
    };
  });
};
function ExtraProjectSales() {
  const { state, deleteProjectPayment } = useApp();
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState("");

  useEffect(() => {
    const aggregatedData = calculateProjectPayments(
      state.extraProjects,
      state.projectPayments
    );
    setData(aggregatedData);
  }, [state.projectPayments, state.extraProjects]);

  const showNote = (note) => {
    setCurrentNote(note);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
    },
    {
      title: "Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Price",
      dataIndex: "payment",
      key: "payment",
      render: (payment) => `$${payment}`,
    },
    {
      title: "Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (totalPaid) => `$${totalPaid}`,
    },
    {
      title: "Pending",
      dataIndex: "pendingAmount",
      key: "pendingAmount",
      render: (pendingAmount) => `$${pendingAmount}`,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        let badgeStatus;
        switch (status) {
          case "Completed":
            badgeStatus = "success";
            break;
          case "Exceeded":
            badgeStatus = "error";
            break;
          case "Pending":
            badgeStatus = "warning";
            break;
          case "Partial":
            badgeStatus = "default";
            break;
          default:
            badgeStatus = "default";
            break;
        }
        return <Badge status={badgeStatus} text={status} />;
      },
    },
  ];

  const handleDelete = async (record) => {
    try {
      console.log("these are the record values:", record);
      const result = await deleteProjectPayment(record);
      if (result === null) {
        messageApi.open({
          type: "success",
          content: "Subject deleted successfully",
        });
      } else {
        message.error(result);
      }
    } catch (error) {
      message.error("Failed to delete payment");
      console.error("Error deleting payment:", error);
    }
  };

  const expandedRowRender = (record) => {
    const paymentColumns = [
      {
        title: "Transaction ID",
        dataIndex: "transactionId",
        key: "transactionId",
      },
      {
        title: "Bank Account",
        dataIndex: "bankAccount",
        key: "bankAccount",
      },
      {
        title: "Date",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp) => {
          const date = new Date(
            timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
          );
          return moment(date).format("DD/MM/YYYY, dddd");
        },
      },
      {
        title: "Time",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp) => {
          const date = new Date(
            timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
          );
          return moment(date).format("hh:mm A");
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => `$${amount}`,
      },
      {
        title: "Note",
        dataIndex: "note",
        key: "note",
        render: (note) => (
          <Tooltip title="Click to view note">
            <Button
              type="link"
              icon={<FileOutlined />}
              onClick={() => showNote(note)}
            />
          </Tooltip>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, paymentRecord) => (
          <Space size="middle">
            <Popconfirm
              title="Are you sure you want to delete this payment?"
              onConfirm={() => handleDelete(paymentRecord)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                className="font-semibold px-4 text-left"
                style={{
                  backgroundColor: "#5DDBD3",
                  color: "white",
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              />
            ),
          },
          body: {
            row: (props) => <tr {...props} className="hover:bg-gray-50" />,
            cell: (props) => (
              <td
                {...props}
                className=" border-b border-gray-200"
                style={{
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              />
            ),
          },
        }}
        columns={paymentColumns}
        dataSource={record.payments}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div>
      <div>
        {contextHolder}

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-medium">ExtraProjectSales</span>
              <span className="text-gray-200">|</span>
            </div>

            <div className="flex justify-end">
              <Input
                placeholder="Search by Assignee or Client Name"
                suffix={
                  <div className="border-l-2 p-1">
                    <SearchOutlined />
                  </div>
                }
                className="w-[270px] p-0 rounded-none px-2 border-gray-300"
              />
            </div>
          </div>

          <hr />

          <div className="flex justify-between items-center mb-4">
            <div className="start-item  flex items-center space-x-2">
              <Select
                defaultValue="none"
                style={{ width: 120 }}
                className="border-gray-300"
              >
                <Option value="none">Filter By: None</Option>
              </Select>
              <Button icon={<FilterOutlined />} className="border-gray-300" />
            </div>
            <Button
              icon={<UserOutlined />}
              suffix={<UserOutlined />}
              className="border-gray-300"
              onClick={handleOk}
            >
              Add Payment
            </Button>
          </div>
        </div>

        <Table
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <img src={CollapseIcon} onClick={(e) => onExpand(record, e)} />
              ) : (
                <img src={ExpandIcon} onClick={(e) => onExpand(record, e)} />
              ),
          }}
          columns={columns}
          dataSource={data}
          rowKey="id"
          size="small"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  className="font-semibold px-4 text-left"
                  style={{
                    backgroundColor: "#5DDBD3",
                    color: "white",
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                />
              ),
            },
            body: {
              row: (props) => <tr {...props} className="hover:bg-gray-50" />,
              cell: (props) => (
                <td
                  {...props}
                  className=" border-b border-gray-200"
                  style={{
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                />
              ),
            },
          }}
        />
        <Modal
          title="Note"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <p>{currentNote}</p>
        </Modal>
      </div>
    </div>
  );
}
export default ExtraProjectSales;
