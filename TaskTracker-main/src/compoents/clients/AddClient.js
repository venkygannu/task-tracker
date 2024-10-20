import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  Card,
  Typography,
  Space,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";

const { Option } = Select;
const { Title } = Typography;

function AddClient({ onResult, onClose }) {
  const { addClient, state } = useApp();
  const [form] = Form.useForm();

  const universityOptions = state.universities.map((university) => ({
    value: `${university.id}-${university.name}`,
    label: university.name,
  }));

  const onFinish = async (values) => {
    const [universityId, universityName] = values.university.split("-");
    const data = {
      ...values,
      suspend: false,
      universityId,
    };
    console.log("Form data:", data);

    try {
      const result = await addClient(data);
      onResult(result);
    } catch (error) {
      onResult("An unexpected error occurred while adding the client.");
      console.error("Unexpected error:", error);
    }
  };

  const primaryButtonStyle = {
    borderRadius: "4px",
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
          Add Client
        </h2>

        <div className="h-[458px] overflow-y-scroll p-4 ">
          <Form.Item
            name="name"
            label={
              <span style={{ color: "black" }}>
                Name <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input the client name!" },
            ]}
          >
            <Input placeholder="Type Client Name" />
          </Form.Item>

          <Form.Item
            name="contact"
            label={
              <span style={{ color: "black" }}>
                Contact <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input contact details!" },
            ]}
          >
            <Input placeholder="Type Contact Details" />
          </Form.Item>

          <Form.Item
            name="university"
            label={
              <span style={{ color: "black" }}>
                University <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a university!" }]}
          >
            <AutoComplete
              options={universityOptions}
              placeholder="Select University"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
              }
            />
          </Form.Item>

          <Form.Item
            name="username"
            label={<span style={{ color: "black" }}>Username</span>}
          >
            <Input placeholder="Type Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: "black" }}>Password</span>}
          >
            <Input.Password placeholder="Type Password" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={
              <span style={{ color: "black" }}>
                Amount <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input the payment amount!" },
            ]}
            style={{
              display: "inline-block",
              width: "calc(50% - 8px)",
              marginRight: "16px",
            }}
          >
            <Input placeholder="Type Payment Amount" />
          </Form.Item>

          <Form.Item
            name="currency"
            label={
              <span style={{ color: "black" }}>
                Currency <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a currency!" }]}
            style={{ display: "inline-block", width: "calc(50% - 8px)" }}
          >
            <Select placeholder="Select Currency">
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="GBP">GBP</Option>
              <Option value="INR">INR</Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item className=" flex justify-end ">
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
              Add Client
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddClient;
