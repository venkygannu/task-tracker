import React, { useEffect, useState } from "react";
import AddClient from "./AddClient";
import {
  Button,
  Modal,
  message,
  Table,
  Popconfirm,
  Form,
  Input,
  Tooltip,
  Space,
  AutoComplete,
  Select,
  Card,
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  StopOutlined,
  PlaySquareOutlined,
  PlusSquareOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import Loader from "../loader/Loader";
import _ from "lodash";
import moment from "moment";
import ExpandIcon from "../../assets/expandIcon.svg";
import CollapseIcon from "../../assets/collapseIcon.svg";

function Clients() {
  const {
    fetchClientsAndCoordinators,
    state,
    suspendClient,
    activateClient,
    transferDocument,
    editClient,
    fetchSubjects,
    addCoordinator,
    setLoading,
    editCoordinator,
    suspendCoordinator,
    activateCoordinator,
  } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [editingKey, setEditingKey] = useState("");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [subjectForm] = Form.useForm();
  const [expandedRows, setExpandedRows] = useState([]);
  // const [subjects, setSubjects] = useState({});
  const [subjectFormVisible, setSubjectFormVisible] = useState({});
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [subjectCodeOptions, setSubjectCodeOptions] = useState([]);
  const [professorOptions, setProfessorOptions] = useState([]);
  const [coordinatorOptions, setCoordinatorOptions] = useState([]);
  const [subjectMap, setSubjectMap] = useState({});

  const { Option } = Select;

  const processSubjects = (subjects) => {
    const subjectOptions = [];
    const subjectCodeOptions = [];
    const professorOptions = [];
    const subjectMap = {};

    subjects.forEach((subject) => {
      const { name, code, professor, universityId } = subject;
      const key = `${name} ${code}`;

      subjectOptions.push({ value: name });
      subjectCodeOptions.push({ value: code });
      professorOptions.push({ value: professor });
      subjectMap[key] = universityId;
    });

    setSubjectOptions(subjectOptions);
    setSubjectCodeOptions(subjectCodeOptions);
    setProfessorOptions(professorOptions);
    setSubjectMap(subjectMap);
  };

  const processTeamMembers = (teamMembers) => {
    const filteredCoordinators = teamMembers.filter(
      (member) => member.role !== "admin" && member.role !== "manager"
    );
    setCoordinatorOptions(
      filteredCoordinators.map((member) => ({
        value: `${member.firstName} ${member.lastName}`,
      }))
    );
  };

  const ensureCoordinators = async (clients) => {
    if (
      clients.length > 0 &&
      (!clients[0].coordinators || clients[0].coordinators.length === 0)
    ) {
      console.log(
        "Fetching coordinators for all clients using ensureCoordinators"
      );
      await fetchClientsAndCoordinators(clients);
    }
  };

  useEffect(() => {
    const getClientsAndSubjects = async () => {
      try {
        // Ensure state.clients is defined and an array

        if (Array.isArray(state.clients)) {
          await ensureCoordinators(state.clients); // Make sure dispatch is available
        }

        await fetchSubjects(); // Ensure fetchSubjects updates state properly

        if (state.subjects) {
          processSubjects(state.subjects);
        }

        if (state.teamMembers) {
          processTeamMembers(state.teamMembers);
        }
      } catch (error) {
        console.error(
          "Error fetching clients, subjects, or team members:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getClientsAndSubjects();
  }, []);

  const handleCompleted = async (record) => {
    const result = await transferDocument("clients", record.id, "completed");
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client completed successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleSuspend = async (record) => {
    const result = await suspendClient(record.id);
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client suspended successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleActivate = async (record) => {
    const result = await activateClient(record.id);
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client activated successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const onEditFinish = async (values) => {
    try {
      const updatedFields = _.omitBy(
        values,
        (value, key) => value === currentRecord[key]
      );

      if (!_.isEmpty(updatedFields)) {
        const result = await editClient(currentRecord.id, updatedFields);
        if (result === null) {
          messageApi.open({
            type: "success",
            content: "Client edited successfully",
          });
          setIsEditModalVisible(false);
        } else {
          messageApi.open({
            type: "error",
            content: result,
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
        content: "An unexpected error occurred while editing the client.",
      });
      console.error("Unexpected error:", error);
    }
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
    editForm.resetFields();
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredClients(state.clients);
    } else {
      const filtered = state.clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.username.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  };

  const handleAddSubject = (clientId) => {
    setExpandedRows([...expandedRows, clientId]);
    setSubjectFormVisible({ ...subjectFormVisible, [clientId]: true });
  };

  const handleSaveSubject = async (record) => {
    try {
      const values = await subjectForm.validateFields();
      const { subjectName, subjectCode } = values;
      const combinedNameCode = `${subjectName} ${subjectCode}`;
      const universityId = subjectMap[combinedNameCode];

      if (universityId === record.universityId) {
        const newSubject = {
          ...values, // Assuming you want to add the current timestamp
          clientId: record.id,
          status: "incomplete",
          suspend: false,
        };

        console.log("the values being added are:", newSubject);
        const result = await addCoordinator(newSubject);

        if (result === null) {
          subjectForm.resetFields();
          setSubjectFormVisible({ ...subjectFormVisible, [record.id]: false });
          messageApi.open({
            type: "success",
            content: "Subject added successfully",
          });
        } else {
          messageApi.open({
            type: "error",
            content: "Failed to add subject",
          });
        }
      } else {
        messageApi.open({
          type: "error",
          content: "Selected subject is not under the specified university",
        });
      }
    } catch (errorInfo) {
      console.error("Failed to add subject:", errorInfo);
      messageApi.open({
        type: "error",
        content: "Validation failed",
      });
    }
  };

  const handleCancelSubjectForm = (clientId) => {
    subjectForm.resetFields();
    setSubjectFormVisible({ ...subjectFormVisible, [clientId]: false });
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      editable: true,
    },
    {
      title: "University",
      dataIndex: "university",
      key: "university",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      editable: true,
    },
    {
      title: "Referral",
      dataIndex: "referral",
      key: "referral",
      editable: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => {
        return (
          <span>
            <Popconfirm
              title="Are you sure you want to mark this client as completed?"
              onConfirm={() => handleCompleted(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<CheckCircleOutlined style={{ color: "green" }} />}
                style={{ marginRight: 8 }}
                size="small"
              />
            </Popconfirm>
            <Button
              icon={<EditOutlined style={{ color: "blue" }} />}
              style={{ marginRight: 8 }}
              size="small"
              onClick={() => handleEdit(record)}
            />
            {record.suspend ? (
              <Popconfirm
                title="Are you sure you want to activate this client?"
                onConfirm={() => handleActivate(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  icon={<PlaySquareOutlined style={{ color: "green" }} />}
                  size="small"
                />
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Are you sure you want to suspend this client?"
                onConfirm={() => handleSuspend(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  icon={<StopOutlined style={{ color: "red" }} />}
                  size="small"
                />
              </Popconfirm>
            )}
            <Tooltip
              title="add subject"
              color="white"
              overlayInnerStyle={{ color: "orange" }}
            >
              <Button
                icon={<PlusSquareOutlined style={{ color: "orange" }} />}
                style={{ marginRight: 8 }}
                disabled={editingKey !== ""}
                size="small"
                onClick={() => handleAddSubject(record.id)}
              />
            </Tooltip>
          </span>
        );
      },
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleResultMessage = (result) => {
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client added successfully",
      });
      setIsModalVisible(false);
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const EditClientForm = () => (
    <Form form={form} layout="vertical" onFinish={onEditFinish}>
      <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
        Edit Client
      </h2>
      <div className="h-[458px] overflow-y-scroll p-4">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input the name!" }]}
        >
          <Input placeholder="Ira Sharma" />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Contact"
          rules={[{ required: true, message: "Please input the contact!" }]}
        >
          <Input placeholder="(603) 555-0123" />
        </Form.Item>

        <Form.Item name="university" label="University">
          <Select defaultValue="UCLA">
            <Option value="UCLA">UCLA</Option>
            {/* Add more universities as needed */}
          </Select>
        </Form.Item>

        <Form.Item name="username" label="Username">
          <Input placeholder="ira_sharma" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input the password!" }]}
        >
          <Input.Password placeholder="irashrma010" />
        </Form.Item>

        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please input the amount!" }]}
          >
            <Input placeholder="Type Payment Amount" />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: "Please select the currency!" }]}
          >
            <Select defaultValue="USD" style={{ width: 120 }}>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="GBP">GBP</Option>
            </Select>
          </Form.Item>
        </Space>
      </div>
      <Form.Item className="flex justify-end mt-2 mr-4">
        <Space>
          <Button>Cancel</Button>
          <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
            Save Changes
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const handleSubjectCompleted = async (record, id) => {
    const result = await editCoordinator(id, record);
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client completed successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleSubjectSuspend = async (record, id) => {
    const result = await suspendCoordinator(id, record);

    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client completed successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleSubjectActivate = async (record, id) => {
    console.log("this is the subject and this is the id:", record, id);
    const result = await activateCoordinator(id, record);
    if (result === null) {
      messageApi.open({
        type: "success",
        content: "Client completed successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: result,
      });
    }
  };

  const handleDeleteSubject = () => {};
  const primaryButtonStyle = {
    borderRadius: "4px",
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
  };
  const expandedRowRender = (client) => {
    return (
      <div>
        {subjectFormVisible[client.id] && (
          <Form
            form={subjectForm}
            layout="inline"
            onFinish={() => handleSaveSubject(client)}
          >
            <Form.Item
              name="subjectName"
              rules={[
                {
                  required: true,
                  message: "Please input the subject name!",
                },
              ]}
            >
              <AutoComplete
                placeholder="Subject Name"
                options={subjectOptions}
                style={{ minWidth: 200 }}
              />
            </Form.Item>
            <Form.Item
              name="subjectCode"
              rules={[
                {
                  required: true,
                  message: "Please input the subject code!",
                },
              ]}
            >
              <AutoComplete
                placeholder="Subject Code"
                options={subjectCodeOptions}
                style={{ minWidth: 200 }}
              />
            </Form.Item>
            <Form.Item
              name="professor"
              rules={[
                { required: true, message: "Please input the professor!" },
              ]}
            >
              <AutoComplete
                placeholder="Professor"
                options={professorOptions}
                style={{ minWidth: 200 }}
              />
            </Form.Item>
            <Form.Item
              name="coordinator"
              rules={[
                {
                  required: true,
                  message: "Please input the coordinator!",
                },
              ]}
            >
              <AutoComplete
                placeholder="Coordinator"
                style={{ minWidth: 200 }}
                options={coordinatorOptions}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                <Button
                  type="default"
                  onClick={() => handleCancelSubjectForm(client.id)}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
        <Table
          dataSource={client.coordinators || []}
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
          columns={[
            {
              title: "Subject Name",
              dataIndex: "subjectName",
              key: "subjectName",
            },
            {
              title: "Subject Code",
              dataIndex: "subjectCode",
              key: "subjectCode",
            },
            {
              title: "Professor",
              dataIndex: "professor",
              key: "professor",
            },
            {
              title: "Coordinator",
              dataIndex: "coordinator",
              key: "coordinator",
            },
            {
              title: "Actions",
              key: "actions",
              render: (text, record) => (
                <span>
                  <Popconfirm
                    title="Are you sure you want to mark this client as completed?"
                    onConfirm={() => handleSubjectCompleted(record, client.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<CheckCircleOutlined style={{ color: "green" }} />}
                      style={{ marginRight: 8 }}
                      size="small"
                    />
                  </Popconfirm>
                  {record.suspend ? (
                    <Popconfirm
                      title="Are you sure you want to activate this client?"
                      onConfirm={() => handleSubjectActivate(record, client.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        icon={<PlaySquareOutlined style={{ color: "green" }} />}
                        size="small"
                      />
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="Are you sure you want to suspend this client?"
                      onConfirm={() => handleSubjectSuspend(record, client.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        icon={<StopOutlined style={{ color: "red" }} />}
                        size="small"
                      />
                    </Popconfirm>
                  )}
                  <Button
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    style={{ marginRight: 8 }}
                    size="small"
                    onClick={() => handleDeleteSubject(record)}
                  />{" "}
                </span>
              ),
            },
          ]}
          pagination={false}
          small
        />
      </div>
    );
  };

  return (
    <div>
      {state.loading ? (
        <Loader />
      ) : (
        <div>
          {contextHolder}
          {/* <div>
            <h1>Clients</h1>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search by Client Name or Username"
              value={searchQuery}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
            />
          </div> */}

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-medium">Client Database</span>
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
                <Button className="border-gray-300">Assignees</Button>
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
                className="border-gray-300 text-white"
                onClick={showModal}
                style={primaryButtonStyle}
              >
                Add Client
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
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <img
                    src={CollapseIcon}
                    onClick={(e) => onExpand(record, e)}
                  />
                ) : (
                  <img src={ExpandIcon} onClick={(e) => onExpand(record, e)} />
                ),
            }}
            dataSource={searchQuery ? filteredClients : state.clients}
            columns={columns}
            pagination={{
              onChange: cancel,
            }}
            rowKey="id"
            expandedRowRender={expandedRowRender}
            expandedRowKeys={expandedRows}
            onExpand={(expanded, record) => {
              setExpandedRows(expanded ? [record.id] : []);
            }}
          />

          <Modal open={isModalVisible} onCancel={handleCancel} footer={null}>
            <AddClient onResult={handleResultMessage} />
          </Modal>
          <Modal
            open={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
          >
            <EditClientForm />
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Clients;
