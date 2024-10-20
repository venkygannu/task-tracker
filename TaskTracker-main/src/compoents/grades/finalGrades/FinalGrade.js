import React, { useEffect, useState, useRef, useContext } from "react";
import { useApp } from "../../../contexts/AppContext";
import { Table, Form, Input, Button, message } from "antd";
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
      console.log("Save failed:", errInfo);
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

function FinalGrade() {
  const { state, fetchClientsAndCoordinators, setLoading, addGrade } = useApp();

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

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "University",
      dataIndex: "universityId",
      key: "universityId",
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
  ];

  const handleSave = async (row) => {
    console.log("this is the final grade data:", row);
    const { uniqueKey, id, finalGrade } = row;
    const updatedData = {
      uniqueKey,
      id,
      finalGrade,
    };

    try {
      await addGrade(updatedData);
      message.success("Grade updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("An error occurred while updating the grade.");
    }
  };

  const expandedRowRender = (record) => {
    const uniqueKey = `${record.id}`;
    const expandedColumns = [
      { title: "Subject Name", dataIndex: "subjectName", key: "subjectName" },
      { title: "Subject Code", dataIndex: "subjectCode", key: "subjectCode" },
      { title: "Coordinator", dataIndex: "coordinator", key: "coordinator" },
      {
        title: "Final Grade",
        dataIndex: "finalGrade",
        key: "finalGrade",
        editable: true,
      },
    ];

    const components = {
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
          <EditableRow
            {...props}
            className="hover:bg-gray-50"
            style={{
              paddingTop: 6,
              paddingBottom: 6,
            }}
          />
        ),
        cell: (props) => (
          <EditableCell
            {...props}
            uniqueKey={uniqueKey}
            handleSave={handleSave}
            className="border-b border-gray-200"
            style={{
              paddingTop: 6,
              paddingBottom: 6,
            }}
          />
        ),
      },
    };
    const columnsWithEdit = expandedColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
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
        dataSource={record.coordinators}
        pagination={false}
        size="small"
      />
    );
  };

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
      columns={columns}
      dataSource={state.clients}
      expandable={{ expandedRowRender }}
      size="small"
    />
  );
}

export default FinalGrade;
