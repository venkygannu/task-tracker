import React, { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Space,
  Popconfirm,
  message,
  Button,
  Tooltip,
  Modal,
  Input,
} from "antd";
import { DeleteOutlined, FileOutlined } from "@ant-design/icons";
import { useApp } from "../../../contexts/AppContext";
import moment from "moment";
const calculateClientPayments = (clients, clientPayments) => {
  return clients.map((client) => {
    const clientPaymentData = clientPayments.filter(
      (payment) =>
        payment.clientId === client.id && payment.status === "verified"
    );
    const totalPaid = clientPaymentData.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const pendingAmount = client.amount - totalPaid;
    let status = "Pending";
    if (pendingAmount === 0) {
      status = "Completed";
    } else if (totalPaid > client.amount) {
      status = "Exceeded";
    } else if (totalPaid > 0) {
      status = "pending";
    }
    return {
      ...client,
      totalPaid,
      pendingAmount,
      status,
      payments: clientPaymentData,
    };
  });
};

const ClientSales = () => {
  const { state, deleteClientPayment } = useApp();
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState("");

  useEffect(() => {
    const aggregatedData = calculateClientPayments(
      state.clients,
      state.clientPayments
    );
    setData(aggregatedData);
  }, [state.clientPayments, state.clients]);

  const handleDelete = async (record) => {
    try {
      console.log("these are the record values:", record);
      const result = await deleteClientPayment(record);
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
  const showNote = (note) => {
    setCurrentNote(note);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "University",
      dataIndex: "university",
      key: "university",
    },
    {
      title: "Price",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
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
          default:
            badgeStatus = "default";
            break;
        }
        return <Badge status={badgeStatus} text={status} />;
      },
    },
  ];

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
        render: (timestamp) => moment(timestamp).format("DD/MM/YYYY, dddd"),
      },
      {
        title: "Time",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp) => moment(timestamp).format("hh:mm A"),
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
            row: (props) => (
              <tr
                {...props}
                className="hover:bg-gray-50"
                style={{
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              />
            ),
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
    <div className="bg-gray-100 ">
      {contextHolder}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Client Sales</h1>
        <div className="relative w-64">
          <Input.Search
            placeholder="Search"
            className="rounded-full"
            style={{ width: 200 }}
          />
        </div>
      </div>

      <hr />
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
            row: (props) => (
              <tr
                {...props}
                className="hover:bg-gray-50"
                style={{
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              />
            ),
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
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={data}
        rowKey="id"
        size="small"
      />
      <Modal
        title="Note:"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <p>{currentNote}</p>
      </Modal>
    </div>
  );
};

export default ClientSales;
