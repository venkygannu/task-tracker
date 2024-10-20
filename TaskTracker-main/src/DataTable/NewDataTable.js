// import React, { useState } from 'react'
// import { Table, Popconfirm, Button, Space, Form, Input, Badge, Tag } from 'antd';
// import { DownOutlined, UpOutlined } from '@ant-design/icons';

// function NewDataTable() {
//     const rawData = [
//         {
//             "c1": {
//                 "clientName": "John Doe",
//                 "username": "johndoe123",
//                 "university": "UCLA",
//                 "password": "password123",
//                 "subjects": [
//                     {
//                         "subjectCode": "OED3011",
//                         "subjectName": "Introduction to Programming",
//                         "professor": "Prof. Jacob Smith",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "OED2015",
//                         "subjectName": "Entrepreneurial Essentials",
//                         "professor": "Dr. Wade Warren",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1000,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c2": {
//                 "clientName": "Jane Smith",
//                 "username": "janesmith456",
//                 "university": "Harvard",
//                 "password": "password456",
//                 "subjects": [
//                     {
//                         "subjectCode": "CS101",
//                         "subjectName": "Computer Science Basics",
//                         "professor": "Prof. Alan Turing",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "MATH202",
//                         "subjectName": "Advanced Mathematics",
//                         "professor": "Dr. Ada Lovelace",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1200,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c3": {
//                 "clientName": "Alice Johnson",
//                 "username": "alicejohnson789",
//                 "university": "MIT",
//                 "password": "password789",
//                 "subjects": [
//                     {
//                         "subjectCode": "PHY101",
//                         "subjectName": "Physics I",
//                         "professor": "Prof. Richard Feynman",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "CHEM101",
//                         "subjectName": "Chemistry Basics",
//                         "professor": "Dr. Marie Curie",
//                         "status": "inactive"
//                     }
//                 ],
//                 "priceCommitted": 1500,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c4": {
//                 "clientName": "Bob Brown",
//                 "username": "bobbrown012",
//                 "university": "Stanford",
//                 "password": "password012",
//                 "subjects": [
//                     {
//                         "subjectCode": "BIO201",
//                         "subjectName": "Biology II",
//                         "professor": "Prof. Charles Darwin",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "HIST101",
//                         "subjectName": "World History",
//                         "professor": "Dr. Howard Zinn",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1300,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c5": {
//                 "clientName": "Charlie Davis",
//                 "username": "charliedavis345",
//                 "university": "Yale",
//                 "password": "password345",
//                 "subjects": [
//                     {
//                         "subjectCode": "ENG101",
//                         "subjectName": "English Literature",
//                         "professor": "Prof. William Shakespeare",
//                         "status": "inactive"
//                     },
//                     {
//                         "subjectCode": "PHIL202",
//                         "subjectName": "Philosophy II",
//                         "professor": "Dr. Socrates",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1100,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c6": {
//                 "clientName": "Daisy Evans",
//                 "username": "daisyevans678",
//                 "university": "Princeton",
//                 "password": "password678",
//                 "subjects": [
//                     {
//                         "subjectCode": "ECON101",
//                         "subjectName": "Economics Basics",
//                         "professor": "Prof. Adam Smith",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "PSY101",
//                         "subjectName": "Psychology I",
//                         "professor": "Dr. Sigmund Freud",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1400,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c7": {
//                 "clientName": "Eve Fisher",
//                 "username": "evefisher901",
//                 "university": "Columbia",
//                 "password": "password901",
//                 "subjects": [
//                     {
//                         "subjectCode": "LAW101",
//                         "subjectName": "Introduction to Law",
//                         "professor": "Prof. Ruth Bader Ginsburg",
//                         "status": "inactive"
//                     },
//                     {
//                         "subjectCode": "POL101",
//                         "subjectName": "Political Science Basics",
//                         "professor": "Dr. Aristotle",
//                         "status": "inactive"
//                     }
//                 ],
//                 "priceCommitted": 1600,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c8": {
//                 "clientName": "Frank Green",
//                 "username": "frankgreen234",
//                 "university": "NYU",
//                 "password": "password234",
//                 "subjects": [
//                     {
//                         "subjectCode": "ART101",
//                         "subjectName": "Art History",
//                         "professor": "Prof. Leonardo da Vinci",
//                         "status": "inactive"
//                     },
//                     {
//                         "subjectCode": "MUS101",
//                         "subjectName": "Music Theory",
//                         "professor": "Dr. Ludwig van Beethoven",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1700,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c9": {
//                 "clientName": "George Harris",
//                 "username": "georgeharris567",
//                 "university": "UC Berkeley",
//                 "password": "password567",
//                 "subjects": [
//                     {
//                         "subjectCode": "SOC101",
//                         "subjectName": "Sociology I",
//                         "professor": "Prof. Max Weber",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "ANTH101",
//                         "subjectName": "Cultural Anthropology",
//                         "professor": "Dr. Margaret Mead",
//                         "status": "inactive"
//                     }
//                 ],
//                 "priceCommitted": 1800,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c10": {
//                 "clientName": "Hannah Jones",
//                 "username": "hannahjones890",
//                 "university": "Duke",
//                 "password": "password890",
//                 "subjects": [
//                     {
//                         "subjectCode": "LING101",
//                         "subjectName": "Linguistics Basics",
//                         "professor": "Prof. Noam Chomsky",
//                         "status": "active"
//                     },
//                     {
//                         "subjectCode": "GEO101",
//                         "subjectName": "Geography I",
//                         "professor": "Dr. Carl Ritter",
//                         "status": "active"
//                     }
//                 ],
//                 "priceCommitted": 1900,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         },
//         {
//             "c11": {
//                 "clientName": "Ian King",
//                 "username": "ianking123",
//                 "university": "University of Chicago",
//                 "password": "password123",
//                 "subjects": [
//                     {
//                         "subjectCode": "MATH101",
//                         "subjectName": "Calculus I",
//                         "professor": "Prof. Isaac Newton",
//                         "status": "inactive"
//                     },
//                     {
//                         "subjectCode": "ASTRO101",
//                         "subjectName": "Astronomy Basics",
//                         "professor": "Dr. Carl Sagan",
//                         "status": "inactive"
//                     }
//                 ],
//                 "priceCommitted": 2000,
//                 "referral": "Referral Name",
//                 "contact": "Contact Information"
//             }
//         }
//     ]
//     const [loading, setLoading] = useState(false);

//     const formattedData = rawData.map(item => {
//         const key = Object.keys(item)[0];
//         return { key, ...item[key] };
//     });

//     console.log(formattedData);
//     const columns = [
//         {
//             title: "Client Name",
//             dataIndex: "clientName",
//             key: "clientName",
//         },
//         {
//             title: "University",
//             dataIndex: "university",
//             key: "university",
//         },
//         {
//             title: "User Name",
//             dataIndex: "username",
//             key: "username",
//         },
//         {
//             title: "Password",
//             dataIndex: "password",
//             key: "password",
//         },
//         {
//             title: "Referral",
//             dataIndex: "referral",
//             key: "referral",
//         },
//         {
//             title: 'Action',
//             dataIndex: '',
//             key: 'x',
//             render: () => <a>Delete</a>,
//         },

//     ]

//     const expandIcon = ({ expanded, onExpand, record }) =>
//         expanded ? (
//             <UpOutlined onClick={e => onExpand(record, e)} />
//         ) : (
//             <DownOutlined onClick={e => onExpand(record, e)} />
//         );


//     const expandedRowRender = (record) => {
//         // Filter subjects based on status "active"
//         // const activeSubjects = record.subjects.filter(subject => subject.status === 'active');
//         const columns = [
//             { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
//             { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode' },
//             { title: 'Professor', dataIndex: 'professor', key: 'professor' },
//             {
//                 title: 'Action',
//                 key: 'operation',
//                 render: () => (
//                     <Space size="middle">
//                         <a>Delete</a>
//                     </Space>
//                 ),
//             },
//         ];

//         return <Table columns={columns} dataSource={record.subjects} pagination={false} />;//give the data source as activeSubjects
//     };


//     return (
//         <Table
//             columns={columns}
//             expandable={{
//                 expandedRowRender,
//                 rowExpandable: (record) => record.subjects && record.subjects.length > 0,
//                 expandIcon
//             }}
//             dataSource={formattedData}
//             bordered
//             loading={loading}
//             size="small"
//         />
//     )
// }

// export default NewDataTable