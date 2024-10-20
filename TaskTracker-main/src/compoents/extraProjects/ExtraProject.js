import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  AutoComplete,
  DatePicker,
  Select,
  Form,
  message,
  Upload,
  Table,
  Popconfirm,
  Badge,
  Tag,
  Typography,
  Space,
} from "antd";
import { useApp } from "../../contexts/AppContext";

import ExpandIcon from "../../assets/expandIcon.svg";
import CollapseIcon from "../../assets/collapseIcon.svg";
import { Timestamp } from "firebase/firestore";
import {
  UserOutlined,
  FileTextOutlined,
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  CloseOutlined,
  TagOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import _ from "lodash";

const { TextArea } = Input;
const { Option } = Select;
const statusOptions = {
  Completed: { color: "green" },
  Pending: { color: "yellow" },
  Urgent: { color: "red" },
  Overdue: { color: "purple" },
};
const { Title } = Typography;
const { RangePicker } = DatePicker;
function ExtraProject() {
  const {
    state,
    addProject,
    fetchExtraProjects,
    deleteExtraProject,
    editProject,
    updateProjectStatus,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [coordinatorOptions, setCoordinatorOptions] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null); // State to hold the current record

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchExtraProjects();
    processTeamMembers(state.teamMembers);
  }, []);

  useEffect(() => {
    console.log(state.extraProjects);
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

  const handleSave = async (values) => {
    const formattedValues = {
      ...values,
      dueDate: values.dueDate
        ? Timestamp.fromDate(values.dueDate.toDate())
        : null,
      status: "Pending",
    };

    const response = await addProject(formattedValues);
    if (response === null) {
      messageApi.success("Task added successfully");
      form.resetFields(); // Reset the form values
      handleClose();
    } else {
      messageApi.error(response);
    }

    handleClose();
  };

  const AddExtraProjectForm = () => (
    <div className="">
      <h2 className="text-2xl border-b border-slate-200 pb-3 font-bold">
        Add Extra Project
      </h2>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="projectName"
          label={
            <span className="font-medium">
              Project Name <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter the project name" }]}
        >
          <Input placeholder="Type project name here" />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label={
            <span className="font-medium">
              Due Date <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select the due date" }]}
        >
          <DatePicker className="w-full" placeholder="Select date" />
        </Form.Item>

        <Form.Item
          name="assignee"
          label={
            <span className="font-medium">
              Assign to <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select an assignee" }]}
        >
          <Select placeholder="Select team member">
            <Option value="member1">Team Member 1</Option>
            <Option value="member2">Team Member 2</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className="font-medium">Notify changes to</span>}
        >
          <div className="p-1 border border-gray-300 rounded-md">
            <Tag closable onClose={() => {}} className="m-1">
              Danny George <CloseOutlined />
            </Tag>
            <Tag closable onClose={() => {}} className="m-1">
              Shreya Naidu <CloseOutlined />
            </Tag>
          </div>
        </Form.Item>

        <Form.Item
          name="note"
          label={<span className="font-medium">Note</span>}
        >
          <TextArea
            placeholder="Write your note here"
            rows={2}
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item className="flex justify-end space-x-2">
          <Space>
            <Button type="primary" htmlType="submit" style={primaryButtonStyle}>
              Create Task
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const handleNoteIconClick = (note, id) => {
    setCurrentNote(note);
    setCurrentNoteId(id);
    setNoteModalOpen(true);
  };

  const handleNoteSave = () => {
    // Here you can dispatch an action to update the note in your state
    // For now, we'll just log the new note
    console.log("New note:", currentNote, "for ID:", currentNoteId);
    setNoteModalOpen(false);
  };

  const handleDelete = async (id) => {
    const response = await deleteExtraProject(id);
    if (response === null) {
      messageApi.success("Project deleted successfully");
    } else {
      messageApi.error(response);
    }
  };

  const EditForm = ({ record, coordinatorOptions }) => (
    <Form
      form={editForm} // Use the new form instance
      layout="vertical"
    >
      <Form.Item
        name="phoneNumber"
        label="Phone Number"
        rules={[{ required: true, message: "Please enter the phone number" }]}
      >
        <Input placeholder="Phone Number" />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label="Due Date"
        rules={[{ required: true, message: "Please select the due date" }]}
      >
        <DatePicker placeholder="Select Due Date" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="assignee"
        label="Assign to"
        rules={[{ required: true, message: "Please select an assignee" }]}
      >
        <AutoComplete
          options={coordinatorOptions}
          placeholder="Assign to"
          filterOption={(inputValue, option) =>
            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        name="payment"
        label="Payment"
        rules={[{ required: true, message: "Please enter the payment amount" }]}
      >
        <Input placeholder="Payment" type="number" />
      </Form.Item>

      <Form.Item name="note" label="Note">
        <TextArea placeholder="Write your note here" rows={4} maxLength={100} />
      </Form.Item>
    </Form>
  );

  const showEditModal = (record) => {
    setCurrentRecord(record);
    console.log("this the current record:", record);

    const dueDate = record.dueDate ? dayjs(record.dueDate.toDate()) : null;
    console.log("the date format:", dueDate);
    editForm.setFieldsValue({
      phoneNumber: record.phoneNumber,
      dueDate: dueDate, // Directly using the converted Date object from Timestamp
      assignee: record.assignee,
      payment: record.payment,
      note: record.note,
    });

    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();

      // Convert the dueDate to Firestore Timestamp if it exists
      if (values.dueDate) {
        values.dueDate = Timestamp.fromDate(values.dueDate.toDate());
      }

      // Find the fields that have changed
      const updatedFields = _.pickBy(
        values,
        (value, key) => !_.isEqual(value, currentRecord[key])
      );

      if (_.isEmpty(updatedFields)) {
        messageApi.info("No changes made.");
        return;
      }

      const response = await editProject(currentRecord.id, updatedFields);
      if (response === null) {
        messageApi.success("Project updated successfully");
        setCurrentRecord(null);
        editForm.resetFields(); // Clear the form values
        setIsEditModalOpen(false); // Close the modal
      } else {
        messageApi.error(response);
      }
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  const handleStatusChange = async (value, record) => {
    try {
      console.log("Updating status to:", value);
      const result = await updateProjectStatus(record.id, value);

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

  const primaryButtonStyle = {
    borderRadius: "4px",
    backgroundColor: "#5BCACA",
    borderColor: "#5BCACA",
  };

  const columns = [
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
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) =>
        dueDate ? dueDate.toDate().toLocaleDateString() : "",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(value, record)}
          style={{ width: 120 }}
        >
          {Object.keys(statusOptions).map((statusOption) => (
            <Option key={statusOption} value={statusOption}>
              <Badge
                color={statusOptions[statusOption].color}
                text={statusOption}
              />
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Assignee",
      dataIndex: "assignee",
      key: "assignee",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleNoteIconClick(note, record.id)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button
            type="link"
            icon={<BellOutlined />}
            onClick={() => console.log("Notify", record.id)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Are you sure to delete this project?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      {/* <div className="flex justify-start">
        <h1 className="text-md"> Extra Projects</h1>
      </div>
      <hr />
      <Button size="small" onClick={handleOpen}>
        Add Extra Project
      </Button> */}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium">Extra Projects</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <div className="bg-green-500 w-3 h-3 rounded-full"></div>
              <RangePicker className="border-gray-300" />
              <Button
                type="text"
                style={{ padding: "2px" }}
                className="text-blue-500"
              >
                <EditOutlined />
              </Button>
            </div>
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
          <div>
            <Select
              defaultValue="allTasks"
              style={{ width: 120 }}
              className="pr-2 border-gray-300 end-item"
            >
              <Option value="allTasks">All Tasks</Option>
            </Select>
            <Button
              type="primary"
              icon={<TagOutlined />}
              className="border-gray-300"
              onClick={handleOpen}
              style={primaryButtonStyle}
            >
              Add Extra project
            </Button>
          </div>
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
        columns={columns}
        dataSource={state.extraProjects}
        rowKey="id"
        style={{ marginTop: 20 }}
        size="small"
      />
      <div className="add-project-model">
        <Modal open={isModalOpen} onCancel={handleClose} footer={null}>
          <div className="add-project-model">
            <AddExtraProjectForm />
          </div>
        </Modal>
      </div>
      <Modal
        title="Edit Note"
        open={noteModalOpen}
        onCancel={() => setNoteModalOpen(false)}
        onOk={handleNoteSave}
      >
        <TextArea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          rows={4}
        />
      </Modal>
      <Modal
        title={currentRecord?.projectName || "Edit Project"}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleEditSave}
      >
        {currentRecord && (
          <EditForm
            record={currentRecord}
            coordinatorOptions={coordinatorOptions}
          />
        )}
      </Modal>
    </div>
  );
}

export default ExtraProject;
