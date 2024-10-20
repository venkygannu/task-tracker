import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Table,
} from "antd";
import {
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../contexts/AppContext";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

function ExtraProjectLog() {
  const {
    state,
    fetchProjectPayments,
    fetchExtraProjects,
    addProjectPayment,
    deleteProjectPayment,
    addTransactionId,
  } = useApp();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchExtraProjects();
    fetchProjectPayments();
  }, []);

  const buttonStyle = {
    borderRadius: "4px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
  };

  console.log(state.projectPayments);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddPayment = async (values) => {
    let { projectName } = values;
    projectName = projectName.replace(/\s+/g, "");
    const projectExists = state.extraProjects.some(
      (project) => project.id === projectName
    );

    if (!projectExists) {
      message.error(`Project name not found: ${projectName}`);
      return;
    }

    const newPayment = {
      ...values,
      status: "unverified",
      transactionId: values.transactionId || "",
      type: "project",
    };
    console.log("the payment values:", newPayment);

    try {
      const result = await addProjectPayment(newPayment);

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

  const AddPayment = () => (
    <Form
      form={form}
      layout="vertical"
      name="form_in_modal"
      initialValues={{ currency: "USD" }}
      onFinish={handleAddPayment}
    >
      <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
        Add Extra Project Payment
      </h2>
      <Form.Item
        className="text-xs mb-4"
        name="projectName"
        label="Project Name"
        rules={[{ required: true, message: "Please input the project name!" }]}
      >
        <Input className="rounded-sm " placeholder="Type Client Username" />
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
        rules={[{ required: true, message: "Please select the bank account!" }]}
      >
        <Select placeholder="Select Bank Account">
          <Option value="ICICI - 0769">ICICI - 0769</Option>
          <Option value="Citibank - 1234">Citibank - 1234</Option>
          <Option value="Chase - 5678">Chase - 5678</Option>
          <Option value="Bank of America - 9101">Bank of America - 9101</Option>
        </Select>
      </Form.Item>
      <hr />
      <Form.Item className="mt-3 mb-3" name="note" label="Note">
        <TextArea placeholder="Add a Note..." rows={4} />
      </Form.Item>
      <Form.Item className="m-0">
        <div className="flex gap-2 justify-end">
          <Button onClick={handleCancel} style={buttonStyle}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
            Add Payment
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  const handleDelete = async (record) => {
    console.log("the record received is:", record);
    try {
      console.log("These are the record values:", record);
      const result = await deleteProjectPayment(record);
      if (result === null) {
        messageApi.open({
          type: "success",
          content: "Payment deleted successfully",
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
    console.log("the type is:", selectedRecord);
    console.log("these are the values:", values);
    try {
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
            <Button onClick={handleCancel} style={buttonStyle}>
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
  const columns = [
    {
      title: "Date and Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => moment(timestamp).format("DD/MM/YYYY, hh:mm A"), // Formatting timestamp
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Paid",
      dataIndex: "amount",
      key: "amount",
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
            style={{ color: "#13C2C2" }} // Customize color to match the "Verify" button style
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

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium">
              Extra Projects Payment Log
            </span>
            <span className="text-gray-200">|</span>
          </div>

          <div className="flex justify-end">
            <Input
              placeholder="Search"
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
            type="primary"
            onClick={showModal}
            style={primaryButtonStyle}
            icon={<PlusCircleOutlined />}
          >
            Add Payment
          </Button>
        </div>
      </div>
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
      <Table
        columns={columns}
        dataSource={state.projectPayments}
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
      />
    </div>
  );
}

export default ExtraProjectLog;
