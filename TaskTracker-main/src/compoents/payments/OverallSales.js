import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
} from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";

const OverallSales = () => {
  const { state, addBankAccount, fetchClients, fetchClientPayments } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [accountSalesData, setAccountSalesData] = useState([]);
  const [bankSalesData, setBankSalesData] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchClientPayments();
  }, []);

  useEffect(() => {
    const { accountSalesData, bankSalesData } =
      calculateAccountSalesAndBankRevenue();
    setAccountSalesData(accountSalesData);
    setBankSalesData(bankSalesData);
  }, [state.clients, state.clientPayments]);

  const calculateAccountSalesAndBankRevenue = () => {
    const universitySales = {};
    const bankRevenue = {};

    state.clients.forEach((client) => {
      const { university, amount } = client;
      const parsedAmount = parseFloat(amount);

      if (!universitySales[university]) {
        universitySales[university] = { totalSales: 0, totalRevenue: 0 };
      }
      universitySales[university].totalSales += parsedAmount;
      console.log("these are the values:", universitySales[university]);
    });

    state.clientPayments.forEach((payment) => {
      const { university, bankAccount, amount } = payment;
      console.log(
        "these are values of each payment:",
        university,
        bankAccount,
        amount
      );
      const parsedAmount = parseFloat(amount);

      if (universitySales[university]) {
        console.log("this is the university", university);
        universitySales[university].totalRevenue += parsedAmount;
      }

      if (!bankRevenue[bankAccount]) {
        const [bankAccountName, accountNumber] = bankAccount.split(" - ");
        bankRevenue[bankAccount] = {
          bankAccountName,
          accountNumber,
          totalRevenue: 0,
        };
      }
      bankRevenue[bankAccount].totalRevenue += parsedAmount;
    });

    const accountSalesData = Object.entries(universitySales).map(
      ([university, sales]) => ({
        university,
        ...sales,
      })
    );

    const bankSalesData = Object.entries(bankRevenue).map(
      ([bankAccount, revenue]) => ({
        bankAccountName: revenue.bankAccountName,
        accountNumber: revenue.accountNumber,
        totalRevenue: revenue.totalRevenue,
      })
    );

    return { accountSalesData, bankSalesData };
  };

  const handleAddBank = async (values) => {
    try {
      const result = await addBankAccount(values);
      if (result === null) {
        message.success("Bank account added successfully");
        setIsModalVisible(false);
      } else {
        message.error(result);
      }
    } catch (error) {
      message.error(
        "An unexpected error occurred while adding the bank account."
      );
      console.error("Unexpected error:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const accountSalesColumns = [
    {
      title: "University",
      dataIndex: "university",
      key: "university",
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      render: (totalSales) => `$${totalSales}`,
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (totalRevenue) => `$${totalRevenue}`,
    },
  ];

  const bankSalesColumns = [
    {
      title: "Bank Account Name",
      dataIndex: "bankAccountName",
      key: "bankAccountName",
    },
    {
      title: "Account Number",
      dataIndex: "accountNumber",
      key: "accountNumber",
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (totalRevenue) => `$${totalRevenue}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this bank account?"
            onConfirm={() => handleDeleteBankAccount(record)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteBankAccount = async (record) => {
    try {
      console.log("Bank account to delete:", record);
      // Assuming you have a function to delete bank accounts
      // const result = await deleteBankAccount(record.key);
      const result = null;
      if (result === null) {
        message.success("Bank account deleted successfully");
        // Refresh bank accounts list
      } else {
        message.error(result);
      }
    } catch (error) {
      message.error("Failed to delete bank account");
      console.error("Error deleting bank account:", error);
    }
  };

  const formStyle = {
    padding: "24px",
    background: "white",
    borderRadius: "8px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
  };

  const requiredLabelStyle = {
    "::before": {
      display: "inline-block",
      marginRight: "4px",
      color: "#ff4d4f",
      fontSize: "14px",
      fontFamily: "SimSun, sans-serif",
      lineHeight: 1,
      content: '"*"',
    },
  };

  const inputStyle = {
    borderRadius: "4px",
  };

  const buttonStyle = {
    borderRadius: "4px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
    borderRadius: "4px",
  };

  const AddBankAccountForm = () => (
    <Form
      layout="vertical"
      name="add_extra_project"
      onFinish={handleAddBank}
      style={formStyle}
    >
      <h2 style={titleStyle}>Add Bank Account</h2>

      <Form.Item
        name="projectName"
        label={<span style={requiredLabelStyle}>Bank Account Name</span>}
        rules={[{ required: true, message: "Please input the project name!" }]}
      >
        <Input placeholder="Type Bank Account Name" style={inputStyle} />
      </Form.Item>

      <Form.Item
        name="projectName"
        label={<span style={requiredLabelStyle}>Account Number</span>}
        rules={[{ required: true, message: "Please input the project name!" }]}
      >
        <Input placeholder="Type Account Number" style={inputStyle} />
      </Form.Item>

      <Form.Item>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <Button style={buttonStyle}>Cancel</Button>
          <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
            Add Bank Account
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between gap-6 ">
        <div className="w-full">
          <h2 className="text-3xl text-left ">Account Sales</h2>
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
            columns={accountSalesColumns}
            dataSource={accountSalesData}
            pagination={false}
            rowKey="university"
          />
        </div>
        <div className=" w-[1px] bg-slate-300 ">
        </div>
        <div className="w-full">
          <div className="flex justify-between">
            <h2 className="text-3xl">Bank Sales</h2>
            <Button
              type="primary"
              onClick={showModal}
              style={primaryButtonStyle}
              icon={<PlusCircleOutlined />}
            >
              Add Bank Account
            </Button>
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
            columns={bankSalesColumns}
            dataSource={bankSalesData}
            pagination={false}
            rowKey="accountNumber"
          />
        </div>
      </div>
      <Modal open={isModalVisible} onCancel={handleCancel} footer={null}>
        <AddBankAccountForm />
      </Modal>
    </div>
  );
};

export default OverallSales;
