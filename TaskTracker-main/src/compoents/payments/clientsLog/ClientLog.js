import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  AutoComplete,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  SelectOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import moment from "moment";
import { useApp } from "../../../contexts/AppContext";

const { Option } = Select;
const { TextArea } = Input;
function ClientLog() {
  const {
    state,
    addClientPayment,
    fetchClientPayments,
    deleteClientPayment,
    addTransactionId,
  } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const universityOptions = state.universities.map((university) => ({
    value: `${university.id}-${university.name}`,
    label: university.name,
  }));

  useEffect(() => {
    fetchClientPayments();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddPayment = async (values) => {
    const [universityId, universityName] = values.university.split("-");
    const clientUsernameId = `${universityId}-${values.username}`;

    if (!state.clients.some((client) => client.id === clientUsernameId)) {
      message.error(`No client exists with username: ${values.username}`);
      return;
    }
    const newPayment = {
      ...values,
      clientId: clientUsernameId,
      transactionId: values.transactionId || "",
      status: "unverified",
      type: "client",
    };
    console.log("the data being added :", newPayment);

    try {
      const result = await addClientPayment(newPayment);
      if (result === null) {
        message.success("Payment added successfully");
        setIsModalVisible(false);
      } else {
        message.error(result);
      }
    } catch (error) {
      message.error("An unexpected error occurred while adding the payment.");
      console.error("Unexpected error:", error);
    }
  };
  const [form] = Form.useForm();
  const AddPayment = () => (
    <Form
      form={form}
      layout="vertical"
      name="form_in_modal"
      initialValues={{ currency: "USD" }}
      onFinish={handleAddPayment}
    >
      <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
        Add Payment
      </h2>
      <div className="overflow-y-scroll h-[458px] px-4">
        <Form.Item
          className="text-xs mb-4"
          name="projectName"
          label="Username"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
        >
          <Input className="rounded-sm " placeholder="Type Client Username" />
        </Form.Item>
        <Form.Item
          className="text-xs mb-4"
          name="university"
          label="University"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
        >
          <Input className="rounded-sm " placeholder="Type University Name" />
        </Form.Item>
        <hr />
        <div className="flex justify-between gap-3 mt-4">
          <Form.Item
            className="mb-0 w-full"
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please input the payment amount!" },
            ]}
          >
            <Input
              className="w-full"
              placeholder="Type Payment Amount"
              type="number"
            />
          </Form.Item>
          <Form.Item
            className="mb-0"
            name="currency"
            label="Currency"
            rules={[{ required: true, message: "Please select the currency!" }]}
          >
            <Select>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="INR">INR</Option>
              {/* Add more currency options as needed */}
            </Select>
          </Form.Item>
        </div>
        <Form.Item
          className="mt-3 mb-0"
          name="transactionId"
          label="Transaction ID"
        >
          <Input placeholder="Type Transaction ID" />
        </Form.Item>
        <Form.Item
          className="mt-3 mb-3"
          name="bankAccount"
          label="Bank Account"
          rules={[
            { required: true, message: "Please select the bank account!" },
          ]}
        >
          <Select placeholder="Select Bank Account">
            <Option value="ICICI - 0769">ICICI - 0769</Option>
            <Option value="Citibank - 1234">Citibank - 1234</Option>
            <Option value="Chase - 5678">Chase - 5678</Option>
            <Option value="Bank of America - 9101">
              Bank of America - 9101
            </Option>
          </Select>
        </Form.Item>
        <hr />
        <Form.Item className="mt-3 mb-3" name="note" label="Note">
          <TextArea placeholder="Add a Note..." rows={4} />
        </Form.Item>
        <Form.Item className="m-0">
          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} className="rounded-sm">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
              Add Payment
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  );

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

  const showVerifyModal = (record) => {
    setSelectedRecord(record);
    setIsVerifyModalVisible(true);
  };

  const handleVerifyCancel = () => {
    setIsVerifyModalVisible(false);
  };

  const handleVerify = async (values) => {
    try {
      console.log("this is the transactionId:", values);
      const result = await addTransactionId(
        selectedRecord.id,
        selectedRecord.type,
        values.transactionId
      );
      if (result === null) {
        message.success("Payment verified successfully");
        setIsVerifyModalVisible(false);
      } else {
        message.error(result);
      }
    } catch (error) {
      message.error("Failed to verify payment");
      console.error("Error verifying payment:", error);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => moment(timestamp).format("DD/MM/YYYY, hh:mm A"), // Formatting timestamp for display
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "University",
      dataIndex: "university",
      key: "university",
    },
    {
      title: "Bank Account",
      dataIndex: "bankAccount",
      key: "bankAccount",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    {
      title: "Paid",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this payment?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
          <Button
            style={{ color: "#13C2C2" }}
            disabled={record.status === "verified"}
            onClick={() => showVerifyModal(record)}
            size="small"
          >
            {record.status === "verified" ? "Verified" : "Verify"}
          </Button>
        </Space>
      ),
    },
  ];

  const VerifyPayment = () => (
    <Form
      layout="vertical"
      onFinish={handleVerify}
      style={{ maxWidth: "600px", margin: "auto" }}
    >
      <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
        Verify Payment
      </h2>
      <Form.Item
        name="transactionId"
        label="Transaction ID"
        rules={[
          { required: true, message: "Please input the transaction ID!" },
        ]}
      >
        <Input placeholder="Type Transaction ID" />
      </Form.Item>
      <Form.Item>
        <Form.Item className="m-0">
          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} className="rounded-sm">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
              Verify
            </Button>
          </div>
        </Form.Item>
      </Form.Item>
    </Form>
  );

  const primaryButtonStyle = {
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
    borderRadius: "4px",
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPayments = state.clientPayments.filter((payment) =>
    payment.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {contextHolder}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium">Client Payment Log</span>
            <span className="text-gray-200">|</span>
          </div>

          <div className="flex justify-end">
            <Input.Search
              placeholder="Search by username"
              style={{ width: 200 }}
              value={searchQuery}
              onChange={handleSearch}
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
            type="primary"
            onClick={showModal}
            style={primaryButtonStyle}
            icon={<PlusCircleOutlined />}
          >
            Add Payment
          </Button>
        </div>
      </div>

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
        dataSource={searchQuery ? filteredPayments : state.clientPayments}
        columns={columns}
        style={{ marginTop: 20 }}
      />
      <Modal open={isModalVisible} onCancel={handleCancel} footer={null}>
        <AddPayment />
      </Modal>
      <Modal
        open={isVerifyModalVisible}
        onCancel={handleVerifyCancel}
        footer={null}
      >
        <VerifyPayment />
      </Modal>
    </div>
  );
}

export default ClientLog;
