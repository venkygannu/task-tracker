// import React, { useState, useEffect } from 'react'
// import axios from 'axios';
// import { Table, Popconfirm, Button, Space, Form, Input, Badge, Tag } from 'antd';

// import { render } from '@testing-library/react';
// import { filter, set, values } from 'lodash';
// import { RetweetOutlined, SearchOutlined } from '@ant-design/icons';
// import Highlighter from 'react-highlight-words';

// function DataTable() {
//   const [gridData, setGridData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editRowKey, setEditRowKey] = useState("");
//   const [sortedInfo, setSortedInfo] = useState({});
//   const [form] = Form.useForm();
//   const [searchText, setSearchText] = useState("");
//   const [searchColText, setSearchColText] = useState("");//what text we are searching in that particular col
//   const [searchedCol, setSearchedCol] = useState("");//what col we are searching 
//   const [filteredInfo, setFilteredInfo] = useState({});
//   const [expandedData, setExpandedData] = useState({
//     1: [
//       {
//         key: 1,
//         category: 'quiz',
//         name: 'Task 1',
//         date: new Date().toISOString().split('T')[0],
//         status: 'In Progress',
//       },
//       {
//         key: 2,
//         category: 'lab',
//         name: 'Task 2',
//         date: new Date().toISOString().split('T')[0],
//         status: 'Pending',
//       },
//       {
//         key: 3,
//         category: 'assignment',
//         name: 'Task 3',
//         date: new Date().toISOString().split('T')[0],
//         status: 'Pending',
//       },
//     ],
//   });
//   // let [filteredData]= useState();

//   useEffect(() => {
//     loadData();
//   }, [])


//   const loadData = async () => {
//     setLoading(true);
//     const response = await axios.get("https://jsonplaceholder.typicode.com/comments");
//     setGridData(response.data.slice(0, 50)); // Set only the first 50 elements
//     setLoading(false);
//   };

//   console.log("this is grid data:", gridData);



//   const dataWithAge = gridData.map((item) => ({
//     ...item,
//     age: Math.floor(Math.random() * 6) + 20,
//   }));

//   const modifiedData = dataWithAge.map((item) => ({
//     ...item,
//     key: item.id,
//     message: item.body,
//   }));

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Completed':
//         return <Badge status="success" text="Completed" />;
//       case 'In Progress':
//         return <Badge status="warning" text="In Progress" />;
//       case 'Pending':
//         return <Badge status="error" text="Pending" />;
//       default:
//         return <Badge status="default" text="Unknown" />;
//     }
//   };

//   const getCategoryTag = (category) => {
//     let color;
//     let text;
//     switch (category) {
//       case 'quiz':
//         color = 'green';
//         text = 'Q';
//         break;
//       case 'assignment':
//         color = 'blue';
//         text = 'A';
//         break;
//       case 'discussion':
//         color = 'volcano';
//         text = 'D';
//         break;
//       case 'lab':
//         color = 'yellow';
//         text = 'L';
//         break;
//       default:
//         color = 'default';
//         text = category;
//     }
//     return <Tag color={color}>{text}</Tag>;
//   };

//   const handleAddRow = (id) => {
//     setExpandedData((prevData) => {
//       const newData = [...prevData[id]];
//       newData.push({
//         key: newData.length + 1,
//         category: 'quiz',
//         name: `Task ${newData.length + 1}`,
//         date: new Date().toISOString().split('T')[0],
//         status: 'Pending',
//       });
//       return { ...prevData, [id]: newData };
//     });
//   };
  

//   const expandedRowRender = () => {
//     const columns = [
//       { title: 'Date', dataIndex: 'date', key: 'date' },
//       { title: 'Name', dataIndex: 'name', key: 'name' },
//       {
//         title: 'Status',
//         dataIndex: 'status',
//         key: 'status',
//         render: (text, record) => getStatusBadge(record.status),
//       },
//       {
//         title: 'Category',
//         dataIndex: 'category',
//         key: 'category',
//         render: (_, record) => getCategoryTag(record.category),
//       },
//       {
//         title: 'Actions',
//         dataIndex: 'actions',
//         key: 'actions',
//         render: (text, record) => (
//           <>
//             <a href="#">Edit</a> | <a href="#">Delete</a>
//           </>
//         ),
//       },
//     ];

//     const data = [];
//     for (let i = 0; i < 3; ++i) {
//       data.push({
//         key: i + 1,
//         category: ['quiz', 'lab', 'assignment', 'discussion'][Math.floor(Math.random() * 4)],
//         name: `Task ${i + 1}`,
//         date: new Date().toISOString().split('T')[0],
//         status: ['Completed', 'In Progress', 'Pending'][Math.floor(Math.random() * 3)],
//         actions: '',
//       });
//     }

//     return (
//       <>
//         <Table columns={columns} dataSource={data} pagination={false} />
//         <Button type="primary" onClick={() => handleAddRow()}>
//           Add Row
//         </Button>
//       </>
//     );
//   };

//   const handleDelete = (record) => {
//     const datasource = [...modifiedData];
//     const filteredData = datasource.filter((item) => item.id !== record.id)
//     setGridData(filteredData);
//   }


//   const isEditing = (record) => record.key === editRowKey;//used for editing 

//   const handleEdit = (record) => {//used for editing "main function in the table"
//     form.setFieldsValue({
//       name: '',
//       age: '',
//       address: '',
//       ...record,
//     });
//     setEditRowKey(record.key);
//   };

//   const handleSave = async (key) => {//used for editing 
//     try {
//       const row = await form.validateFields();//to validate the fields 
//       const newData = [...modifiedData];
//       const index = newData.findIndex((item) => key === item.key);//get the index of which row we want to 
//       if (index > -1) {
//         console.log("the row is identified", index);
//         const item = newData[index];
//         newData.splice(index, 1, { ...item, ...row });//replacing the existing item with the updated item
//         setGridData(newData);//updating the state with the modified data 
//         setEditRowKey("");
//       } else {
//         console.log("the row is not indetified", index);
//         newData.push(row);
//         setGridData(newData);
//         setEditRowKey("");
//       }
//     } catch (error) {
//       console.log('Validate Failed:', error)
//     }
//   }


//   const handleCancel = () => {//used for editing 
//     setEditRowKey("");
//   }

//   const handleChange = (_, filter, sorter) => {
//     console.log("sorter:", sorter);
//     const { order, field } = sorter;
//     setFilteredInfo(filter);
//     setSortedInfo({ columnkey: field, order });
//   }

//   const reset = () => {
//     setSortedInfo({});
//     setFilteredInfo({});
//     setSearchText("")
//     loadData();
//   }

//   const handleSearch = (value) => {
//     console.log("this is input search value :", value)
//     setSearchText(value);
//     if (value === "") {
//       loadData();
//     }
//   }


//   const filteredData = modifiedData.filter((value) => {
//     return (
//       value.name.toLowerCase().includes(searchText.toLowerCase()) || value.email.toLowerCase().includes(searchText.toLowerCase())
//     )
//   })

//   console.log("this data is after filter:", filteredData)

//   const getColumnSearchPrps = (dataIndex) => ({//used for column wise searching
//     filterDropDown: ({
//       setSelectedKeys,
//       selectedKeys,
//       confirm,
//       clearFilters
//     }) => (
//       <div style={{ padding: 8 }}>
//         <Input
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
//           style={{ width: 188, marginBottom: 0, display: "block" }}
//         />
//         <Space>
//           <Button type="primary" onClick={() => handleSearchCol(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>Search</Button>
//           <Button onClick={() => handleResetCol(clearFilters)} size='small' style={{ width: 90 }}>Reset</Button>
//         </Space>
//       </div>
//     ),
//     filteredIcon: (filtered) => (
//       <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
//     ),
//     onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
//     render: (text) =>
//       searchedCol === dataIndex ? (
//         <Highlighter highlightStyle={{ background: "#ffc069", padding: 0 }}
//           searchWords={{ searchColText }} autoEscape textToHighlight={text ? text.toString() : ""} />
//       ) : (text)

//   })

//   const handleSearchCol = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchColText(selectedKeys[0]);
//     setSearchedCol(dataIndex);
//   }

//   const handleResetCol = (clearFilters) => {
//     clearFilters();
//     setSearchColText("");
//   }

//   const columns = [
//     {
//       title: 'ID',
//       dataIndex: "id",
//     },
//     {
//       title: "Name",
//       dataIndex: "name",
//       align: 'center',
//       editTable: true,
//       sorter: (a, b) => a.name.length - b.name.length,
//       sortOrder: sortedInfo.columnkey === "name" && sortedInfo.order,
//       ...getColumnSearchPrps("name")
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       align: 'center',
//       editTable: true,
//       sorter: (a, b) => a.email.length - b.email.length,//give the dataIndex after a and b.
//       sortOrder: sortedInfo.columnkey === "email" && sortedInfo.order,
//       ...getColumnSearchPrps("email")
//     },
//     {
//       title: "Age",
//       dataIndex: "age",
//       align: 'center',
//       editTable: false,
//       sorter: (a, b) => a.age.length - b.age.length,
//       sortOrder: sortedInfo.columnkey === "age" && sortedInfo.order,
//       filters: [
//         { text: "20", value: "20" },
//         { text: "21", value: "21" },
//         { text: "22", value: "22" },
//         { text: "23", value: "23" },
//         { text: "24", value: "24" }
//       ],
//       filteredValue: filteredInfo.age || null,
//       onFilter: (value, record) => String(record.age).includes(value),

//     },
//     {
//       title: "Messsage",
//       dataIndex: "message",
//       align: 'center',
//       editTable: true
//     },
//     {
//       title: "Action",
//       dataIndex: "action",
//       align: 'center',
//       render: (_, record) => {
//         const editable = isEditing(record);
//         return modifiedData.length >= 1 ? (
//           <Space>
//             <Popconfirm title="Are you sure you want to delete?" onConfirm={() => handleDelete(record)}>
//               <Button danger type="primary" disabled={editable}>
//                 Delete
//               </Button>
//             </Popconfirm>
//             {editable ? (
//               <span>
//                 <Space size="middle">
//                   <Button onClick={(e) => handleSave(record.key)} type="primary" style={{ marginRight: 8 }}>save</Button>
//                   <Popconfirm title="Are you sure you want to cancel?" onConfirm={handleCancel}>
//                     <Button>cancel</Button>
//                   </Popconfirm>
//                 </Space>
//               </span>
//             ) : (
//               <Button onClick={() => handleEdit(record)} type="primary">
//                 Edit
//               </Button>
//             )}

//           </Space>
//         ) : null;
//       }
//     }
//   ]

//   const mergedColumns = columns.map((col) => {
//     if (!col.editTable) {
//       return col;
//     }

//     return {
//       ...col,
//       onCell: (record) => ({
//         record,
//         dataIndex: col.dataIndex,
//         title: col.title,
//         editing: isEditing(record),
//       })
//     }
//   })

//   const EditableCell = ({ editing, dataIndex, title, record, children, ...restProps }) => {
//     const inputNode = <Input />;
//     return (
//       <td {...restProps}>
//         {editing ? (
//           <Form.Item name={dataIndex} style={{ margin: 0 }} rules={[{ required: true, message: `Please Input ${title}!`, },]}>
//             {inputNode}
//           </Form.Item>
//         ) : (
//           children
//         )}
//       </td>
//     );
//   }
//   return (
//     <div>
//       <Space style={{ marginBottom: 16 }}>
//         <Input placeholder="Enter the text to search" onChange={(e) => handleSearch(e.target.value)} type='text' allowClear value={searchText} />
//         <Button onClick={reset}>Reset</Button>
//       </Space>
//       <Form form={form} component={false}>
//         <Table
//           columns={mergedColumns}
//           components={{
//             body: {
//               cell: EditableCell,
//             },
//           }}
//           dataSource={searchText ? filteredData : modifiedData}
//           expandable={{
//             expandedRowRender,
//             defaultExpandedRowKeys: ['0'],
//           }}
//           boarded
//           loading={loading}
//           onChange={handleChange}//later we will have reset option hence we need to store the sorted data 
//         />
//       </Form>
//     </div>
//   )
// }

// export default DataTable