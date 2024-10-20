import React, { useEffect, useState } from "react";
import './overallTasks.scss'
import ExpandIcon from "../../assets/expandIcon.svg";
import CollapseIcon from "../../assets/collapseIcon.svg";
import {
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Badge,
  Tag,
  AutoComplete,
  Modal,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  PlusCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import {
  SearchOutlined,
  UserOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Search } = Input;

const categoryOptions = [
  { value: "Q", color: "green" },
  { value: "L", color: "blue" },
  { value: "A", color: "orange" },
  { value: "D", color: "red" },
];

const statusOptions = [
  { value: "Completed", color: "green" },
  { value: "Pending", color: "yellow" },
  { value: "Urgent", color: "red" },
  { value: "Overdue", color: "purple" },
];

function OverallTasks() {
  const { currentUser } = useAuth();
  const {
    setLoading,
    fetchClientsAndCoordinators,
    state,
    addTask,
    deleteTask,
    updateTasksStatus,
  } = useApp();
  const [form] = Form.useForm();
  const [visibleForms, setVisibleForms] = useState({});
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [coordinatorOptions, setCoordinatorOptions] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedView, setSelectedView] = useState("overallTasks"); // State to manage dropdown value
  const [searchQuery, setSearchQuery] = useState(""); // State to manage search query
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const { RangePicker } = DatePicker;

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
    const getClientsAndTasks = async () => {
      try {
        setLoading(true);
        if (Array.isArray(state.clients)) {
          await ensureCoordinators(state.clients); // Make sure dispatch is available
        }
        processTeamMembers(state.teamMembers);
      } catch (error) {
        console.error(
          "Error fetching clients, subjects, or team members:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getClientsAndTasks();
  }, []);

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

  // const dataSource = state.clients
  //   .filter(client => client.coordinators && client.coordinators.length > 0)
  //   .flatMap(client =>
  //     client.coordinators.map(coordinator => ({
  //       clientId: client.id,
  //       key: coordinator.id,
  //       clientName: client.name,
  //       university: client.universityId,
  //       username: client.username,
  //       password: client.password,
  //       subject: coordinator.subjectName,
  //       subCode: coordinator.subjectCode,
  //       professor: coordinator.professor,
  //       coordinator: coordinator.coordinator,
  //     }))
  //   );

  const dataSource = state.clients
    .filter((client) => client.coordinators && client.coordinators.length > 0)
    .flatMap((client) =>
      client.coordinators.map((coordinator) => ({
        clientId: client.id,
        key: coordinator.id,
        clientName: client.name,
        university: client.universityId,
        username: client.username,
        password: client.password,
        subject: coordinator.subjectName,
        subCode: coordinator.subjectCode,
        professor: coordinator.professor,
        coordinator: coordinator.coordinator,
      }))
    )
    .filter((item) => {
      // Apply this filter only if "myTasks" is selected
      if (selectedView === "myTasks") {
        return item.coordinator === currentUser.displayName; // Assuming currentUser.displayName matches coordinator name
      }
      return true; // Otherwise, keep all items
    })
    .filter((item) => {
      // Apply this filter based on the searchQuery for the username
      if (searchQuery) {
        return item.username.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true; // If no search query is provided, include all items
    });

  const handleAddTask = (record) => {
    const newVisibleForms = { ...visibleForms };
    newVisibleForms[record.key] = !newVisibleForms[record.key];
    setVisibleForms(newVisibleForms);
  };

  const showNoteModal = () => {
    setIsNoteModalVisible(true);
  };

  const handleNoteModalOk = () => {
    setIsNoteModalVisible(false);
  };

  const handleNoteModalCancel = () => {
    setIsNoteModalVisible(false);
  };

  const handleCancel = (recordKey) => {
    const newVisibleForms = { ...visibleForms };
    newVisibleForms[recordKey] = false;
    setVisibleForms(newVisibleForms);
  };

  const onFinish = async (values, record) => {
    console.log("these are the values:", values);

    const formattedValues = {
      ...values,
      dueDate: values.dueDate
        ? Timestamp.fromDate(values.dueDate.toDate())
        : null,
      file: "", // Set the file value to empty
      activeSheet: state.activeSheet,
      clientId: record.clientId,
      coordinatorId: record.key,
    };

    try {
      await form.validateFields(); // validate the form fields first
      const result = await addTask(formattedValues);
      console.log("this is after adding the data:", state.tasks);
      if (result === null) {
        messageApi.success("Task added successfully");
        form.resetFields(); // Reset the form values
        handleCancel(record.key);
      } else {
        messageApi.error(result);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      messageApi.error("An unexpected error occurred");
    }
  };

  const Addtask = ({ record }) => (
    <Form
      form={form}
      layout="inline"
      onFinish={(values) => onFinish(values, record)}
      initialValues={{ assignedTo: record.coordinator }}
      style={{ gap: "8px" }}
    >
      <Form.Item
        name="category"
        rules={[{ required: true, message: "Please select a category!" }]}
      >
        <Select placeholder="Category" style={{ width: 60 }}>
          {categoryOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <Tag color={option.color}>{option.value}</Tag>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="taskName"
        rules={[{ required: true, message: "Please input the task name!" }]}
      >
        <Input placeholder="Enter Task Name" />
      </Form.Item>
      <Form.Item
        name="dueDate"
        rules={[{ required: true, message: "Please select the due date!" }]}
      >
        <DatePicker placeholder="Select date" style={{ width: 120 }} />
      </Form.Item>
      <Form.Item name="grades">
        <Input placeholder="Grades" style={{ width: 60 }} />
      </Form.Item>
      <Form.Item
        name="status"
        rules={[{ required: true, message: "Please select a status!" }]}
      >
        <Select placeholder="Status" style={{ width: 120 }}>
          {statusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <Badge color={option.color} text={option.value} />
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="file">
        <Upload>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button icon={<FileTextOutlined />} onClick={showNoteModal} />
        <Modal
          title="Notes"
          open={isNoteModalVisible}
          onOk={handleNoteModalOk}
          onCancel={handleNoteModalCancel}
        >
          <Input.TextArea rows={4} />
        </Modal>
      </Form.Item>
      <Form.Item
        name="assignedTo"
        rules={[{ required: true, message: "Please assign to someone!" }]}
      >
        <AutoComplete
          options={coordinatorOptions}
          placeholder="Assign to"
          style={{ width: 200 }}
        />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Done
          </Button>
          <Button type="default" onClick={() => handleCancel(record.key)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const columns = [
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
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
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Sub. Code",
      dataIndex: "subCode",
      key: "subCode",
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
      key: "actions",
      render: (text, record) => (
        <Button
          size="small"
          icon={<PlusCircleOutlined />}
          onClick={() => handleAddTask(record)}
        />
      ),
    },
  ];

  const handleDelete = async (task, uniqueKey) => {
    console.log("Deleting task:", task, uniqueKey, state.activeSheet);
    try {
      const response = await deleteTask(task, uniqueKey, state.activeSheet);
      if (response === null) {
        messageApi.success("Task successfully deleted");
      } else {
        messageApi.error(response);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      messageApi.error("An unexpected error occurred");
    }
  };

  const renderActions = (task, uniqueKey) => (
    <span>
      <Button icon={<EditOutlined />} style={{ marginRight: 8 }} size="small" />
      <Popconfirm
        title="Are you sure you want to delete the task?"
        onConfirm={() => handleDelete(task, uniqueKey)}
        okText="Yes"
        cancelText="No"
      >
        <Button
          icon={<DeleteOutlined />}
          style={{ marginRight: 8 }}
          size="small"
        />
      </Popconfirm>
    </span>
  );

  const handleStatusChange = async (newStatus, task, uniqueKey) => {
    try {
      console.log(
        `Updating status to: ${newStatus} for task: ${task.taskName} in ${uniqueKey}`
      );
      const result = await updateTasksStatus(
        state.activeSheet,
        task,
        uniqueKey,
        newStatus
      );

      if (result === null) {
        message.success("Status updated successfully");
      } else {
        message.error(result);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(
        "An error occurred while updating the status. Please try again."
      );
    }
  };

  const expandedRowRender = (record) => {
    const uniqueKey = `${record.clientId}-${record.key}`;
    const sourceTasks =
      state.selectedWeekTasks.length > 0
        ? state.selectedWeekTasks
        : state.tasks;
    const taskObject = sourceTasks.find((task) => task.id === uniqueKey) || {};
    const tasks =
      taskObject.tasks
        ?.filter((task) =>
          selectedView === "myTasks"
            ? task.assignedTo === currentUser.displayName
            : true
        ) // Filter only when 'myTasks' is selected
        .map((task) => ({ ...task, key: task.taskName })) || [];
    console.log("these are tasks:", tasks);
    return (
      <div>
        {visibleForms[record.key] && <Addtask record={record} />}
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
          columns={[
            {
              title: "Category",
              dataIndex: "category",
              key: "category",
              render: (value) => (
                <Tag
                  color={
                    categoryOptions.find((opt) => opt.value === value)?.color
                  }
                >
                  {value}
                </Tag>
              ),
            },
            { title: "Task Name", dataIndex: "taskName", key: "taskName" },
            {
              title: "Due Date",
              dataIndex: "dueDate",
              key: "dueDate",
              render: (date) => date && date.toDate().toLocaleDateString(),
            },
            { title: "Grades", dataIndex: "grades", key: "grades" },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status, task) => {
                // Format the due date and compare it with the current date
                const currentDate = new Date();
                const dueDate =
                  task.dueDate && task.dueDate.toDate
                    ? task.dueDate.toDate()
                    : new Date(task.dueDate);
                let derivedStatus = status; // Default to the original status

                if (dueDate) {
                  if (dueDate < currentDate) {
                    derivedStatus = "Overdue";
                  } else if (dueDate - currentDate <= 24 * 60 * 60 * 1000) {
                    // 24 hours in milliseconds
                    derivedStatus = "Urgent";
                  }
                }

                return (
                  <Select
                    value={derivedStatus}
                    onChange={(newStatus) =>
                      handleStatusChange(newStatus, task, uniqueKey)
                    }
                    style={{ width: 120 }}
                  >
                    {statusOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <Badge color={option.color} text={option.value} />
                      </Option>
                    ))}
                  </Select>
                );
              },
            },
            {
              title: "File",
              dataIndex: "file",
              key: "file",
              render: () => <Button icon={<UploadOutlined />}>Upload</Button>,
            },
            {
              title: "Note",
              dataIndex: "note",
              key: "note",
              render: () => (
                <Button icon={<FileTextOutlined />} onClick={showNoteModal} />
              ),
            },
            {
              title: "Assigned To",
              dataIndex: "assignedTo",
              key: "assignedTo",
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, task) => renderActions(task, uniqueKey),
            },
          ]}
          dataSource={tasks}
          pagination={false}
        />
      </div>
    );
  };
  const handleDropdownChange = (value) => {
    setSelectedView(value);
    console.log("this is current user:", currentUser);
    // Add logic here if you want to filter the data based on the dropdown selection
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCoordinatorChange = (value) => {
    setSelectedCoordinator(value);
  };

  const filteredClients = selectedCoordinator
    ? state.clients.filter((client) =>
      client.coordinators.some(
        (coordinator) => coordinator.name === selectedCoordinator
      )
    )
    : state.clients;

  return (
    <div>
      {contextHolder}
      {/* <Select
        defaultValue="overallTasks"
        style={{ width: 200, marginBottom: 16 }}
        onChange={handleDropdownChange}
      >
        <Option value="overallTasks">Overall Tasks</Option>
        <Option value="myTasks">My Tasks</Option>
      </Select>
      <Search
        placeholder="Search by Client Name or Username"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300 }}
      /> */}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium">Overall Tasks</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <div className="bg-green-500 w-3 h-3 rounded-full"></div>
              <RangePicker className="border-gray-300" />
              <Button type="text" style={{ padding: '2px' }} className="text-blue-500">
                <EditOutlined />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Input
              placeholder="Search by Assignee or Client Name"
              suffix={<div className="border-l-2 p-1"><SearchOutlined /></div>}
              className="w-[270px] p-0 rounded-none px-2 border-gray-300"
            />
          </div>
        </div>

        <hr />

        <div className="flex justify-between items-center mb-4">
          <div className="start-item  flex items-center space-x-2">
            <Button icon={<UserOutlined />} suffix={<UserOutlined />} className="border-gray-300">
              Assignees
            </Button>
            <Select
              defaultValue="none"
              style={{ width: 120 }}
              className="border-gray-300"
            >
              <Option value="none">Filter By: None</Option>
            </Select>
            <Button icon={<FilterOutlined />} className="border-gray-300" />
          </div>
          <Select
            defaultValue="allTasks"
            style={{ width: 120 }}
            className="border-gray-300 end-item"
          >
            <Option value="allTasks">All Tasks</Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <img src={CollapseIcon} onClick={e => onExpand(record, e)} />
            ) : (
              <img src={ExpandIcon} onClick={e => onExpand(record, e)} />

            )
        }}

        dataSource={dataSource}
        loading={state.loading}
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
            row: (props) => (
              <tr
                {...props}
                className="hover:bg-gray-50"
              />
            ),
            cell: (props) => (
              <td
                {...props}
                className="border-b border-gray-200"
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

export default OverallTasks;
