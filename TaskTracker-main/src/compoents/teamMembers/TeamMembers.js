import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useApp } from "../../contexts/AppContext";
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Popconfirm,
  message,
  Form,
  Avatar,
  AutoComplete,
  Modal,
  Select,
  Switch,
  Card,
} from "antd";
import {
  EditOutlined,
  ScheduleOutlined,
  UserAddOutlined,
  StopOutlined,
  PlaySquareOutlined,
  UserOutlined,
  SearchOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CloseOutlined,
} from "@ant-design/icons";
import "./teamMembers.scss";

const { Text } = Typography;
const { Option } = Select;

function TeamMembers() {
  const {
    fetchTeam,
    state,
    activateTeam,
    suspendTeam,
    addTeamMember,
    editTeam,
  } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTeam, setFilteredTeam] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  useEffect(() => {
    const getTeam = async () => {
      await fetchTeam();
    };

    getTeam();
  }, []);

  const Title = Typography;

  const handleSuspend = async (record) => {
    let result;
    if (record.suspend) {
      result = await activateTeam(record.id);
    } else {
      result = await suspendTeam(record.id);
    }

    if (result.success) {
      messageApi.open({
        type: "success",
        content: result.message,
      });
    } else {
      messageApi.open({
        type: "error",
        content: result.message,
      });
    }
  };
  const primaryButtonStyle = {
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
    borderRadius: "4px",
  };
  const handleAddTeam = () => {
    setIsModalVisible(true);
  };

  const onFinish = async (values, form) => {
    try {
      const newValues = { ...values, suspend: false };
      console.log("the values of adding team:", newValues);

      const result = await addTeamMember(newValues);
      if (result === null) {
        messageApi.open({
          type: "success",
          content: "Team member added successfully",
        });
        setIsModalVisible(false);
      } else {
        messageApi.open({
          type: "error",
          content: result,
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An unexpected error occurred while adding the team member.",
      });
      console.error("Unexpected error:", error);
    }
  };

  const AddTeamMember = () => (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
          Add Team Member
        </h2>
        <div className="h-[458px] overflow-y-scroll p-4">
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
          >
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ marginRight: 16 }}
            />
            <Space size={8}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please input the first name!" },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Type First Name" />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Type Last Name" />
              </Form.Item>
            </Space>
          </div>

          <Form.Item className="m-0" name="contact" label="Contact">
            <Input placeholder="Type Contact" />
          </Form.Item>
          <hr className="my-3" />
          <Form.Item
            name="email"
            label="E-mail"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input placeholder="Type E-Mail" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input the password!" }]}
          >
            <Input.Password placeholder="Input Password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select placeholder="Select Role">
              <Option value="Manager">Manager</Option>
              <Option value="Sr. Team Lead">Sr. Team Lead</Option>
              <Option value="Jr. Team Lead">Jr. Team Lead</Option>
              <Option value="Coordinator">Coordinator</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="team"
            label="Team"
            rules={[{ required: true, message: "Please select the team!" }]}
          >
            <Select placeholder="Select Team">
              <Option value="Alpha">Alpha</Option>
              <Option value="Beta">Beta</Option>
              <Option value="Gamma">Gamma</Option>
              <Option value="Delta">Delta</Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item className="flex justify-end mt-2 mr-4">
          <Space>
            <Button onClick={() => form.resetFields()}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
              Add Team Member
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredTeam(state.teamMembers);
    } else {
      const filtered = state.teamMembers.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query) ||
          member.lastName.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      );
      setFilteredTeam(filtered);
    }
  };

  const onEditFinish = async (values) => {
    try {
      // Get the changed fields using lodash
      const updatedFields = _.omitBy(
        values,
        (value, key) => value === currentRecord[key]
      );

      // Only call the update function if there are changes
      if (!_.isEmpty(updatedFields)) {
        const result = await editTeam(currentRecord.id, updatedFields);
        if (result.success) {
          messageApi.open({
            type: "success",
            content: "Team member edited successfully",
          });
          setIsEditModalVisible(false);
        } else {
          messageApi.open({
            type: "error",
            content: result.message,
          });
        }
      } else {
        messageApi.open({
          type: "info",
          content: "No changes detected.",
        });
        setIsEditModalVisible(false);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An unexpected error occurred while editing the team member.",
      });
      console.error("Unexpected error:", error);
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const EditTeamMember = () => (
    <div>
      <Form form={form} layout="vertical" onFinish={onEditFinish}>
        <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
          Edit Team Member
        </h2>
        <div className="h-[458px] overflow-y-scroll p-4">
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <Form.Item
              name="firstName"
              label={<span>First Name</span>}
              rules={[
                { required: true, message: "Please input the first name!" },
              ]}
            >
              <Input placeholder="Type First Name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name">
              <Input placeholder="Type Last Name" />
            </Form.Item>
          </div>

          <Form.Item name="contact" label="Contact">
            <Input placeholder="Type Contact" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-mail"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input placeholder="Type E-Mail" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span>Password</span>}
            rules={[{ required: true, message: "Please input the password!" }]}
          >
            <Input.Password
              placeholder="Input Password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={<span>Role</span>}
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select placeholder="Select Role">
              <Option value="Manager">Manager</Option>
              <Option value="Sr. Team Lead">Sr. Team Lead</Option>
              <Option value="Jr. Team Lead">Jr. Team Lead</Option>
              <Option value="Coordinator">Coordinator</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="team"
            label={<span>Team</span>}
            rules={[{ required: true, message: "Please select the team!" }]}
          >
            <Select placeholder="Select Team">
              <Option value="Alpha">Alpha</Option>
              <Option value="Beta">Beta</Option>
              <Option value="Gamma">Gamma</Option>
              <Option value="Delta">Delta</Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item>
          <Space>
            <Button>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Add Team Member
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
    },
    {
      title: "Contact",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.suspend ? (
            <Button
              icon={<PlaySquareOutlined />}
              onClick={() => handleSuspend(record)}
            />
          ) : (
            <Popconfirm
              title="Are you sure you want to suspend this team member?"
              onConfirm={() => handleSuspend(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: "Log",
      key: "log",
      render: (text, record) => <Button icon={<ScheduleOutlined />} />,
    },
  ];

  return (
    <div>
      {contextHolder}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium">Team Database</span>
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
              onChange={handleSearch}
              value={searchQuery}
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
            <Button className="border-gray-300" />
          </div>
          <Button
            icon={<UserOutlined />}
            suffix={<UserOutlined />}
            onClick={handleAddTeam}
            className="text-white "
            style={primaryButtonStyle}
          >
            Add Team Member
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
        columns={columns}
        dataSource={searchQuery ? filteredTeam : state.teamMembers}
        rowKey="id"
      />
      <Modal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <AddTeamMember />
      </Modal>

      <Modal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
      >
        <EditTeamMember />
      </Modal>
    </div>
  );
}

export default TeamMembers;
