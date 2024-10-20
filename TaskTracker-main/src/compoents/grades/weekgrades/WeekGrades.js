import React, { useEffect, useState, useRef, useContext } from 'react'
import { Button, Table, Tag, Input, Modal, Form, message } from 'antd';
import { PlusCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useApp } from '../../../contexts/AppContext';
import './weekgrades.scss'
import _ from 'lodash';


const categoryOptions = [
  { value: 'Q', color: 'green' },
  { value: 'L', color: 'blue' },
  { value: 'A', color: 'orange' },
  { value: 'D', color: 'red' }
];

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  uniqueKey,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        uniqueKey,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingInlineEnd: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};


function WeekGrades() {
  const { fetchAllTasksExceptLatest, state, setLoading, fetchClientsAndCoordinators, updateGrade } = useApp();
  const [updatedAllTasks, setUpdatedAllTasks] = useState(state.allTasks);
  const [tasksMap, setTasksMap] = useState({});
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


  const ensureCoordinators = async (clients) => {
    if (clients.length > 0 && (!clients[0].coordinators || clients[0].coordinators.length === 0)) {
      console.log('Fetching coordinators for all clients using ensureCoordinators');
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
        
      } catch (error) {
        console.error("Error fetching clients, subjects, or team members:", error);
      } finally {
        setLoading(false);
      }
    };

    getClientsAndTasks();
    functionRun();
  }, [state.tasks,state.allTasks]);


 

  const dataSource = state.clients
    .filter(client => client.coordinators && client.coordinators.length > 0)
    .flatMap(client =>
      client.coordinators.map(coordinator => ({
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
    );

    const functionRun = ()=>{
      if (state.weeks.length > 0 && state.tasks.length > 0) {
        const weekName = state.weeks[0].name;
        const newAllTasks = {
          ...updatedAllTasks,
          [weekName]: state.tasks
        };

        const newTasksMap = {};
        Object.keys(newAllTasks).forEach(week => {
          newAllTasks[week].forEach(task => {
            const uniqueKey = task.id;
            if (!newTasksMap[uniqueKey]) {
              newTasksMap[uniqueKey] = [];
            }
            newTasksMap[uniqueKey].push({
              ...task,
              weekName: week,
              key: `${task.id}-${week}`
            });
          });
        });

        setUpdatedAllTasks(newAllTasks); // Update the local component state
        setTasksMap(newTasksMap); // Update the task map
      }
    }

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'University',
      dataIndex: 'university',
      key: 'university',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Sub. Code',
      dataIndex: 'subCode',
      key: 'subCode',
    },
    {
      title: 'Professor',
      dataIndex: 'professor',
      key: 'professor',
    },
    {
      title: 'Coordinator',
      dataIndex: 'coordinator',
      key: 'coordinator',
    },

  ];

  const showNoteModal = () => {
    setIsNoteModalVisible(true);
  };

  const flattenTasks = (data) => {
    const flatArray = [];

    Object.keys(data).forEach(clientKey => {
      data[clientKey].forEach(clientTask => {
        const { weekName, tasks } = clientTask;
        tasks.forEach(task => {
          flatArray.push({
            ...task,
            weekName,
            key: task.taskName
          });
        });
      });
    });

    return flatArray;
  };

  const handleSave = async (row) => {
    const { taskName, weekName, finalGrade, uniqueKey } = row;
    console.log('this is uniqueKey:', row);
    // Use lodash to pick the necessary fields
    const updatedData = _.pick({ taskName, weekName, finalGrade, uniqueKey }, ['taskName', 'weekName', 'finalGrade', 'uniqueKey']);

    try {
      const response = await updateGrade(updatedData); // Call the updateGrade function with only the updated data

      if (response === null) {
        message.success('Updated successfully');
      } else {
        message.error(response);
      }
    } catch (error) {
      console.error('Update failed:', error);
      message.error('An error occurred while updating the grade.');
    }
  };


  const expandedRowRender = (record) => {
    const uniqueKey = `${record.clientId}-${record.key}`;
    const tasksForClient = tasksMap[uniqueKey] || [];

    const flatTasks = flattenTasks({ [uniqueKey]: tasksForClient });

    const components = {
      body: {
        row: EditableRow,
        cell: (props) => <EditableCell {...props} uniqueKey={uniqueKey} />,
      },
    };

    const taskColumns = [
      { title: 'Category', dataIndex: 'category', key: 'category', render: value => <Tag color={categoryOptions.find(opt => opt.value === value)?.color}>{value}</Tag> },
      { title: 'Task Name', dataIndex: 'taskName', key: 'taskName' },
      { title: 'Week Sheet', dataIndex: 'weekName', key: 'weekName' },
      { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
      { title: 'Grades', dataIndex: 'grades', key: 'grades' },
      { title: 'Obtained', dataIndex: 'finalGrade', key: 'finalGrade', editable: true },
      { title: 'Note', dataIndex: 'note', key: 'note', render: () => <Button icon={<FileTextOutlined />} onClick={showNoteModal} /> },
    ];

    const columnsWithEdit = taskColumns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        }),
      };
    });

    return (
      <Table
        columns={columnsWithEdit}
        components={components}
        rowClassName={() => 'editable-row'}
        dataSource={flatTasks}
        pagination={false}
        size="small"
      />
    );
  };




  return (
    <div>
      {contextHolder}
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
        }}
        dataSource={dataSource}
        loading={state.loading}
        size="small"
      />
      <Modal title="Notes" open={isNoteModalVisible} >
        <Input.TextArea rows={4} />
      </Modal>
    </div>
  )
}

export default WeekGrades