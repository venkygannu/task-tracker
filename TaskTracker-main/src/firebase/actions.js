import { db } from "./firebase";
import { setDoc, doc, collection, getDocs, getDoc, where, query, updateDoc, deleteDoc, writeBatch, serverTimestamp, orderBy, addDoc, startAfter, limit, arrayRemove, arrayUnion, runTransaction } from "firebase/firestore";


const BATCH_SIZE = 500;

const fetchBatchedData = async (collectionRef, queryConstraints, dispatch, actionType) => {
    let lastVisible = null;
    let allDocuments = [];
    let snapshot;

    try {

        do {
            const q = lastVisible ? query(collectionRef, ...queryConstraints, startAfter(lastVisible), limit(BATCH_SIZE)) : query(collectionRef, ...queryConstraints, limit(BATCH_SIZE));
            snapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => ({ id: doc.id, key: doc.id, ...doc.data() }));
            allDocuments = [...allDocuments, ...documents];
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
        } while (snapshot.docs.length === BATCH_SIZE);

        dispatch({ type: actionType, payload: allDocuments });
    } catch (error) {
        console.error(`Error fetching ${actionType.toLowerCase()}: `, error);
    }
};


export const fetchUniversities = async (dispatch) => {
    const universitiesCollection = collection(db, 'universities');
    const queryConstraints = [where('status', '==', 'active')];
    await fetchBatchedData(universitiesCollection, queryConstraints, dispatch, 'SET_UNIVERSITIES');
};

export const addUniversity = async (dispatch, university) => {
    const universityRef = doc(db, 'universities', university.id); // Assuming 'name' is unique

    try {
        // Check for duplicate university
        const docSnapshot = await getDoc(universityRef);
        if (docSnapshot.exists()) {
            console.log('found duplicate')
            return 'A university with this name already exists.';
        } else {
            // Add new university document
            await setDoc(universityRef, university);
            // const newUniversity = { id: university.name, ...university };
            dispatch({ type: 'ADD_UNIVERSITY', payload: { ...university, key: university.id } }); return null;
        }
    } catch (error) {
        console.error("Error adding a university: ", error);
        return 'An error occurred while adding the university.';
    }
};



export const deleteUniversity = async (dispatch, university) => {
    const universityRef = doc(db, 'universities', university.id);

    try {
        // Set the status field to 'inactive' instead of deleting the document
        await updateDoc(universityRef, { status: 'inactive' });
        console.log('The document is successfully marked as inactive');

        // Dispatch the action to remove the university from the state
        dispatch({ type: 'DEL_UNIVERSITY', payload: university.id });
        console.log('University marked as inactive successfully:', university.id);
    } catch (error) {
        console.error('Error marking university as inactive:', error);
    }
};

export const editUniversity = async (dispatch, id, updatedData) => {
    console.log('the updating data:', updatedData)
    const universityRef = doc(db, 'universities', id);

    try {
        await updateDoc(universityRef, updatedData);
        console.log('University updated successfully:', id);

        // Dispatch the action to update the state
        dispatch({ type: 'EDIT_UNIVERSITY', payload: { id, updatedData } });
    } catch (error) {
        console.error('Error updating university:', error);
    }
};



//actions for subjets

export const fetchSubjects = async (dispatch) => {
    try {
        const subjectsCollection = collection(db, 'subjects');
        const snapshot = await getDocs(subjectsCollection);
        const subjects = snapshot.docs.map(doc => ({ id: doc.id, key: doc.id, ...doc.data() }));
        dispatch({ type: 'SET_SUBJECTS', payload: subjects });
    } catch (error) {
        console.error("Error fetching universities: ", error);
    }
};

export const addSubject = async (dispatch, subjectData) => {
    console.log('The add subject function is being triggered');
    const { name, universityId, ...rest } = subjectData;
    const nameWithoutSpaces = name.replace(/\s+/g, '');
    const combinedId = `${nameWithoutSpaces}-${universityId}`;
    console.log('This is combinedId:', combinedId);

    // Set the subject reference with the combinedId
    const subjectRef = doc(db, 'subjects', combinedId);
    const updatedSubjectData = { ...rest, name: nameWithoutSpaces, universityId };

    try {
        // Check for duplicate subject
        const docSnapshot = await getDoc(subjectRef);
        if (docSnapshot.exists()) {
            console.log('Found duplicate');
            return false; // Return false if a duplicate is found
        } else {
            // Add new subject document
            await setDoc(subjectRef, updatedSubjectData);
            dispatch({ type: 'ADD_SUBJECTS', payload: { ...updatedSubjectData, key: combinedId } }); return true; // Return true if the subject is successfully added
        }
    } catch (error) {
        console.error("Error adding a subject: ", error);
        return false; // Return false if an error occurs
    }
};

export const deleteSubject = async (dispatch, subject) => {
    const subjectRef = doc(db, 'subjects', subject.id);

    try {
        // Set the status field to 'inactive' instead of deleting the document
        await deleteDoc(subjectRef);
        console.log('The document is successfully deleted');

        // Dispatch the action to remove the university from the state
        dispatch({ type: 'DEL_SUBJECT', payload: subject.id });
        console.log('University marked as inactive successfully:', subject.id);
    } catch (error) {
        console.error('Error marking university as inactive:', error);
    }
};

export const editSubject = async (dispatch, id, updatedData) => {
    console.log('the updating data:', updatedData)
    const subjectRef = doc(db, 'subjects', id);

    try {
        await updateDoc(subjectRef, updatedData);
        console.log('subject updated successfully:', id);

        // Dispatch the action to update the state
        dispatch({ type: 'EDIT_SUBJECT', payload: { id, updatedData } });
    } catch (error) {
        console.error('Error updating university:', error);
    }
};


//Team Members functions
export const fetchTeam = async (dispatch) => {
    const teamCollection = collection(db, 'teamMembers');
    const queryConstraints = [where('suspend', '==', false)];
    await fetchBatchedData(teamCollection, queryConstraints, dispatch, 'SET_TEAMMEMBERS');
};


export const suspendTeam = async (dispatch, id) => {
    try {
        const teamMemberDocRef = doc(db, 'teamMembers', id);
        await updateDoc(teamMemberDocRef, { suspend: true });
        dispatch({ type: 'SUSPEND_TEAM_MEMBER', payload: { id } });
        return { success: true, message: 'Team member suspended successfully.' };
    } catch (error) {
        if (error.code === 'not-found') {
            return { success: false, message: 'Document not found.' };
        } else if (error.code === 'permission-denied') {
            return { success: false, message: 'Permission denied.' };
        }
        return { success: false, message: error.message };
    }
};

export const activateTeam = async (dispatch, id) => {
    try {

        const teamMemberDocRef = doc(db, 'teamMembers', id);
        await updateDoc(teamMemberDocRef, { suspend: false });
        dispatch({ type: 'ACTIVATE_TEAM_MEMBER', payload: { id } });
        return { success: true, message: 'Team member activated successfully.' };
    } catch (error) {
        if (error.code === 'not-found') {
            return { success: false, message: 'Document not found.' };
        } else if (error.code === 'permission-denied') {
            return { success: false, message: 'Permission denied.' };
        }
        return { success: false, message: error.message };
    }
};

export const addTeamMember = async (dispatch, values) => {
    const { firstName, lastName, ...rest } = values;
    const documentId = `${firstName}${lastName}`.toLowerCase();
    const teamMemberRef = doc(db, 'teamMembers', documentId);

    try {
        // Check for duplicate team member
        const docSnapshot = await getDoc(teamMemberRef);
        if (docSnapshot.exists()) {
            console.log('Found duplicate');
            return 'A team member with this name already exists.';
        } else {
            // Add new team member document
            await setDoc(teamMemberRef, { firstName, lastName, ...rest, suspend: false });
            dispatch({ type: 'ADD_TEAM', payload: { id: documentId, key: documentId, firstName, lastName, ...rest, suspend: false } }); return null;
        }
    } catch (error) {
        console.error('Error adding team member: ', error);
        return 'An error occurred while adding the team member.';
    }
};

export const editTeam = async (dispatch, id, updatedFields) => {
    try {

        if (!updatedFields || Object.keys(updatedFields).length === 0) {
            return { success: false, message: 'No fields to update.' };
        }

        const teamMemberDocRef = doc(db, 'teamMembers', id);
        await updateDoc(teamMemberDocRef, updatedFields);
        dispatch({ type: 'EDIT_TEAM_MEMBER', payload: { id, updatedFields } });

        return { success: true, message: 'Team member edited successfully.' };
    } catch (error) {
        // Handle different types of errors
        switch (error.code) {
            case 'not-found':
                return { success: false, message: 'Document not found.' };
            case 'permission-denied':
                return { success: false, message: 'Permission denied.' };
            case 'network-request-failed':
                return { success: false, message: 'Network error. Please try again later.' };
            default:
                return { success: false, message: error.message };
        }
    }
};

export const fetchAttendance = async (teamMemberId) => {
    try {
        const attendanceCollectionRef = collection(db, `teamMembers/${teamMemberId}/attendance`);
        const attendanceQuery = query(attendanceCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(attendanceQuery);

        const attendanceData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            key: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: attendanceData
        };
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        return {
            success: false,
            message: "Failed to fetch attendance data."
        };
    }
};



//client functions 

export const fetchClients = async (dispatch) => {
    const clientsCollection = collection(db, 'clients');
    const queryConstraints = [where('suspend', '==', false)];
    await fetchBatchedData(clientsCollection, queryConstraints, dispatch, 'SET_CLIENTS');
};


export const addClient = async (dispatch, clientData) => {
    console.log('this is the client data', clientData);
    const { universityId, username, ...rest } = clientData;
    const documentId = `${universityId}-${username}`;
    const clientRef = doc(db, 'clients', documentId);

    try {
        // Check for duplicate client
        const docSnapshot = await getDoc(clientRef);
        if (docSnapshot.exists()) {
            console.log('Found duplicate');
            return 'A client with this username and university already exists.';
        } else {
            await setDoc(clientRef, { ...rest, universityId, username, suspend: false });
            dispatch({ type: 'ADD_CLIENT', payload: { id: documentId, key: documentId, universityId, username, ...rest, suspend: false } });
            console.log('client added succesfully and called dispatch')
            return null;
        }
    } catch (error) {
        console.error('Error adding client: ', error);
        return 'An error occurred while adding the client.';
    }
};

export const suspendClient = async (dispatch, id) => {
    try {
        const clientRef = doc(db, 'clients', id);

        // Check if the document exists before updating
        const docSnapshot = await getDoc(clientRef);
        if (!docSnapshot.exists()) {
            return 'Client not found.';
        }

        await updateDoc(clientRef, { suspend: true });
        dispatch({ type: 'SUSPEND_CLIENT', payload: id });
        return null; // Indicating success

    } catch (error) {
        console.error('Error suspending client: ', error);

        // Handle different types of errors
        if (error.code === 'not-found') {
            return 'Client not found.';
        } else if (error.code === 'permission-denied') {
            return 'Permission denied.';
        } else if (error.code === 'network-request-failed') {
            return 'Network error. Please try again later.';
        } else {
            return 'An unexpected error occurred while suspending the client.';
        }
    }
}

export const activateClient = async (dispatch, id) => {
    try {
        const clientRef = doc(db, 'clients', id);

        // Check if the document exists before updating
        const docSnapshot = await getDoc(clientRef);
        if (!docSnapshot.exists()) {
            return 'Client not found.';
        }

        await updateDoc(clientRef, { suspend: false });
        dispatch({ type: 'ACTIVATE_CLIENT', payload: id });
        return null; // Indicating success

    } catch (error) {
        console.error('Error activating client: ', error);

        // Handle different types of errors
        if (error.code === 'not-found') {
            return 'Client not found.';
        } else if (error.code === 'permission-denied') {
            return 'Permission denied.';
        } else if (error.code === 'network-request-failed') {
            return 'Network error. Please try again later.';
        } else {
            return 'An unexpected error occurred while activating the client.';
        }
    }
};


export const transferDocument = async (dispatch, sourceCollection, docId, targetCollection) => {
    try {
        // Step 1: Read the document from the source collection
        const sourceDocRef = doc(db, sourceCollection, docId);
        const targetDocRef = doc(db, targetCollection, docId);

        const docSnapshot = await getDoc(sourceDocRef);

        if (!docSnapshot.exists()) {
            throw new Error('Document not found in the source collection.');
        }

        const documentData = docSnapshot.data();

        const batch = writeBatch(db);

        // Step 2: Write the document to the target collection
        batch.set(targetDocRef, documentData);

        batch.delete(sourceDocRef);

        // Step 4: Commit the batch
        await batch.commit();

        // Step 5: Dispatch actions to update the state
        dispatch({ type: 'REMOVE_CLIENT', payload: docId });
        dispatch({ type: 'ADD_COMPLETED', payload: { ...documentData, id: docId, key: docId } });

        return null;

        // Indicating success
    } catch (error) {
        console.error('Error transferring document:', error);
        return 'An error occurred while transferring the document.'; // Return error message
    }
};



export const editClient = async (dispatch, id, updatedFields) => {
    try {
        if (!updatedFields || Object.keys(updatedFields).length === 0) {
            return { success: false, message: 'No fields to update.' };
        }

        const clientDocRef = doc(db, 'clients', id);
        await updateDoc(clientDocRef, updatedFields);
        dispatch({ type: 'EDIT_CLIENT', payload: { id, updatedFields } });

        return { success: true, message: 'Client updated successfully.' };
    } catch (error) {
        // Handle different types of errors
        switch (error.code) {
            case 'not-found':
                return { success: false, message: 'Document not found.' };
            case 'permission-denied':
                return { success: false, message: 'Permission denied.' };
            case 'network-request-failed':
                return { success: false, message: 'Network error. Please try again later.' };
            default:
                return { success: false, message: error.message };
        }
    }
};

//cliemt payments 

export const addClientPayment = async (dispatch, payment) => {
    const { clientId, ...paymentData } = payment;
    console.log('the data being added', payment);

    try {
        const timestamp = Date.now();
        const paymentDocRef = await addDoc(collection(db, "payments"), {
            ...paymentData,
            clientId,
            timestamp: timestamp, // Store the timestamp as a Firestore timestamp
        });

        dispatch({
            type: 'ADD_CLIENT_PAYMENT',
            payload: { ...paymentData, clientId, timestamp,id:paymentDocRef.id,key: paymentDocRef.id, }
        });

        return null; // Success
    } catch (error) {
        console.error("Error adding payment: ", error);
        return error.message; // Return error message
    }
};

export const fetchClientPayments = async (dispatch) => {
    const paymentsCollection = collection(db, 'payments');
    const queryConstraints = [where('type', '==', 'client'), orderBy('timestamp', 'desc')];
    await fetchBatchedData(paymentsCollection, queryConstraints, dispatch, 'SET_PAYMENTS');
};

export const deleteClientPayment = async (dispatch, payment) => {
    console.log('the received record is this:', payment)
    const paymentRef = doc(db, 'payments', payment.id);

    try {
        // Set the status field to 'inactive' instead of deleting the document
        await deleteDoc(paymentRef);
        console.log('The document is successfully deleted');

        // Dispatch the action to remove the university from the state
        dispatch({ type: 'DEL_CLIENT_PAYMENT', payload: payment.id });
        console.log('payment deleted suscussly with id:', payment.id);
        return null;
    } catch (error) {
        console.error('Error marking university as inactive:', error);
        return error.message;

    }
};

export const addTransactionId = async (dispatch, id, type, transactionId) => {
    console.log('the data received for update is :', id, type, transactionId)
    const paymentRef = doc(db, 'payments', id);

    try {
        await updateDoc(paymentRef, { transactionId: transactionId, status: 'verified' });
        console.log('Payment updated successfully:', id);

        // Dispatch the appropriate action based on the type
        if (type === 'client') {
            dispatch({ type: 'UPDATE_PAYMENT', payload: { id, updatedData: { transactionId, status: 'verified' } } });
        } else if (type === 'project') {
            dispatch({ type: 'UPDATE_PROJECT_PAYMENT', payload: { id, updatedData: { transactionId, status: 'verified' } } });
        }

        return null;
    } catch (error) {
        console.error('Error updating payment:', error);
        return error.message;
    }
};


//coordinators funtions
export const addCoordinator = async (dispatch, data) => {
    try {
        const { clientId, ...coordinatorData } = data;
        console.log('this is the client id:', clientId)

        const coordinatorWithTimestamp = {
            ...coordinatorData,
            timestamp: serverTimestamp()
        };

        // Add the coordinator to the client's subcollection
        const coordinatorRef = await addDoc(collection(db, `clients/${clientId}/coordinators`), coordinatorWithTimestamp);

        dispatch({
            type: 'ADD_COORDINATOR',
            payload: {
                clientId,
                coordinator: {
                    ...coordinatorWithTimestamp,
                    id: coordinatorRef.id,
                    key: coordinatorRef.id
                }
            }
        });

        return null;
    } catch (error) {
        console.error("Error adding coordinator: ", error);
        return error.message;
    }
};

export const fetchClientsAndCoordinators = async (dispatch, clients) => {
    try {
        console.log('these are the clients that i receive:',clients);
        const clientsWithCoordinators = await Promise.all(clients.map(async (client) => {
            const coordinatorsRef = collection(db, `clients/${client.id}/coordinators`);
            const q = query(coordinatorsRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const coordinatorsData = snapshot.docs.map(doc => ({ id: doc.id, key: doc.id, ...doc.data() }));
                return {
                    ...client,
                    coordinators: coordinatorsData,
                    latestCoordinatorTimestamp: coordinatorsData.length > 0 ? coordinatorsData[0].timestamp : null
                };
            } else {
                console.log(`No coordinators found for client: ${client.name}`);
                return {
                    ...client,
                    coordinators: [],
                    latestCoordinatorTimestamp: null
                };
            }
        }));

        // Sort clients by latest coordinator timestamp
        console.log('these are the before sort clients:', clientsWithCoordinators)
        clientsWithCoordinators.forEach(client => console.log(client.latestCoordinatorTimestamp));
        clientsWithCoordinators.sort((a, b) => {
            const dateA = a.latestCoordinatorTimestamp ? new Date(a.latestCoordinatorTimestamp.seconds * 1000) : new Date(0);
            const dateB = b.latestCoordinatorTimestamp ? new Date(b.latestCoordinatorTimestamp.seconds * 1000) : new Date(0);

            return dateB - dateA;
        });
        console.log('these are the final clients:', clientsWithCoordinators)

        // Dispatch the SET_CLIENTS action
        dispatch({ type: 'SET_CLIENTS', payload: clientsWithCoordinators });
    } catch (error) {
        console.error("Error fetching clients and coordinators: ", error);
    }
};

export const editCoordinator = async (dispatch, clientId, data) => {
    try {
        console.log('the data being received is:', data)
        const clientRef = doc(db, 'clients', clientId);
        const coordinatorRef = doc(collection(clientRef, 'coordinators'), data.id);
        await updateDoc(coordinatorRef, { status: 'complete' });
        dispatch({ type: 'EDIT_COORDINATOR', payload: { data, clientId } });
        return null;
    } catch (error) {
        console.error('Error updating coordinator:', error);
        return error.message;
    }
};

export const suspendCoordinator = async (dispatch, clientId, data) => {
    try {
        console.log('The data being received is:', data);
        const clientRef = doc(db, 'clients', clientId);
        const coordinatorRef = doc(collection(clientRef, 'coordinators'), data.id);
        await updateDoc(coordinatorRef, { suspend: true });
        dispatch({ type: 'SUSPEND_COORDINATOR', payload: { data, clientId } });
        return null;
    } catch (error) {
        console.error('Error suspending coordinator:', error);
        return error.message;
    }
};

export const activateCoordinator = async (dispatch, clientId, data) => {
    try {
        console.log('The data being received is:', data);
        const clientRef = doc(db, 'clients', clientId);
        const coordinatorRef = doc(collection(clientRef, 'coordinators'), data.id);
        await updateDoc(coordinatorRef, { suspend: false });
        dispatch({ type: 'ACTIVATE_COORDINATOR', payload: { data, clientId } });
        return null;
    } catch (error) {
        console.error('Error suspending coordinator:', error);
        return error.message;
    }
};


//sheets functions
export const addSheet = async (dispatch, sheetName) => {
    try {
        // Reference to the document inside the 'weeks' collection
        const sheetDocRef = doc(db, 'weeks', sheetName);
        const docSnapshot = await getDoc(sheetDocRef);

        if (docSnapshot.exists()) {
            return 'A sheet with this name already exists.';
        }

        const sheetData = {
            name: sheetName,
            timestamp: serverTimestamp(),
        };

        await setDoc(sheetDocRef, sheetData);
        dispatch({ type: 'ADD_SHEET', payload: { ...sheetData, key: sheetName, id: sheetName } });
        return null;
    } catch (error) {
        console.error('Error adding sheet:', error);
        return error.message;
    }
};

// export const fetchWeeks = async (dispatch) => {
//     try {
//         const weeksCollectionRef = collection(db, 'weeks');
//         const weeksQuery = query(weeksCollectionRef, orderBy('timestamp', 'desc'));
//         const querySnapshot = await getDocs(weeksQuery);

//         const weeks = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             key: doc.id,
//             ...doc.data(),
//         }));
//         dispatch({ type: 'SET_WEEKS', payload: weeks });
//     } catch (error) {
//         console.error('Error fetching weeks:', error);
//     }
// };
export const fetchWeeksAndLatestTasks = async (dispatch) => {
    try {
        const weeksCollectionRef = collection(db, 'weeks');
        const weeksQuery = query(weeksCollectionRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(weeksQuery);

        const weeks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            key: doc.id,
            ...doc.data(),
        }));

        // Set weeks in state
        dispatch({ type: 'SET_WEEKS', payload: weeks });

        // Check if there are any weeks fetched
        if (weeks.length > 0) {
            const latestWeekId = weeks[0].id; // Get the latest week's ID

            // Fetch tasks for the latest week
            const tasksCollectionRef = collection(db, 'weeks', latestWeekId, 'tasks');
            const snapshot = await getDocs(tasksCollectionRef);

            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                key: doc.id,
                ...doc.data()
            }));

            // Dispatch tasks to state
            dispatch({ type: 'SET_TASKS', payload: tasks });
            
        }
    } catch (error) {
        console.error('Error fetching weeks or tasks:', error);
    }
};



//Tasks functions 

export const addTask = async (dispatch, data) => {
    console.log('this is the data i received:', data);

    const { activeSheet, clientId, coordinatorId, ...taskData } = data;

    try {
        await runTransaction(db, async (transaction) => {
            const weekDocRef = doc(db, 'weeks', activeSheet);
            const weekDocSnapshot = await transaction.get(weekDocRef);

            if (!weekDocSnapshot.exists()) {
                throw new Error('Active sheet not found');
            }
            const taskDocRef = doc(weekDocRef, 'tasks', `${clientId}-${coordinatorId}`);

            const taskDocSnapshot = await transaction.get(taskDocRef);

            const task = {
                ...taskData
            };

            if (taskDocSnapshot.exists()) {
                transaction.update(taskDocRef, {
                    tasks: arrayUnion(task)
                });
            } else {
                transaction.set(taskDocRef, {
                    tasks: [task]
                });
            }
            dispatch({
                type: 'ADD_TASK', payload: {
                    id: `${clientId}-${coordinatorId}`,
                    key: `${clientId}-${coordinatorId}`,
                    taskData: {
                        ...taskData
                    }
                }
            });
        });

        return null; // Indicate success
    } catch (error) {
        console.error('Error adding task:', error);
        return error.message;
    }
};

// export const fetchTasks = async (dispatch, activeSheet) => {
//     try {
//         const tasksCollectionRef = collection(db, 'weeks', activeSheet, 'tasks');
//         const snapshot = await getDocs(tasksCollectionRef);

//         const tasks = snapshot.docs.map(doc => ({
//             id: doc.id,
//             key: doc.id,
//             ...doc.data()
//         }));
//         dispatch({ type: 'SET_TASKS', payload: tasks });
//     } catch (error) {
//         console.error('Error fetching tasks:', error);
//     }
// };


export const deleteTask = async (dispatch, task, uniqueKey, activeSheet) => {
    try {
        console.log('data received for deleting:', task, uniqueKey, activeSheet);
        const taskDocRef = doc(db, 'weeks', activeSheet, 'tasks', uniqueKey);

        // Remove the exact task object from the tasks array
        await updateDoc(taskDocRef, {
            tasks: arrayRemove({
                assignedTo: task.assignedTo,
                category: task.category,
                dueDate: task.dueDate,
                file: task.file,
                grades: task.grades,
                status: task.status,
                taskName: task.taskName
            })
        });

        dispatch({
            type: 'DELETE_TASK',
            payload: {
                uniqueKey,
                task
            }
        });

        return null; // Return null to indicate success
    } catch (error) {
        console.error('Error deleting task:', error);
        return error.message; // Return the error message
    }
};


export const fetchTasksForWeekInBatches = async (weekId) => {
    const tasksCollection = collection(db, 'weeks', weekId, 'tasks');
    let tasksSnapshot = await getDocs(query(tasksCollection, limit(BATCH_SIZE)));
    let tasksData = tasksSnapshot.docs.map(taskDoc => ({
        id: taskDoc.id,
        key: taskDoc.id,
        ...taskDoc.data()
    }));

    while (tasksSnapshot.docs.length === BATCH_SIZE) {
        const lastVisible = tasksSnapshot.docs[tasksSnapshot.docs.length - 1];
        tasksSnapshot = await getDocs(query(tasksCollection, startAfter(lastVisible), limit(BATCH_SIZE)));
        const moreTasks = tasksSnapshot.docs.map(taskDoc => ({
            id: taskDoc.id,
            key: taskDoc.id,
            ...taskDoc.data()
        }));
        tasksData = tasksData.concat(moreTasks);
    }
    return { weekId, tasks: tasksData };
};

export const fetchAllTasksExceptLatest = async (dispatch, weeks, latestWeekId) => {
    try {
        const remainingWeeks = weeks.filter(week => week.id !== latestWeekId);

        // Fetch tasks for remaining weeks in parallel
        const tasksPromises = remainingWeeks.map(week => fetchTasksForWeekInBatches(week.id));
        const remainingTasks = await Promise.all(tasksPromises);

        // Convert the fetched tasks into a suitable format for the state
        const tasksByWeek = remainingTasks.reduce((acc, { weekId, tasks }) => {
            acc[weekId] = tasks;
            return acc;
        }, {});

        // Dispatch the action to set all tasks
        dispatch({ type: 'SET_ALL_TASKS', payload: tasksByWeek });
    } catch (error) {
        console.error('Error fetching weeks and tasks:', error);
        throw error;
    }
};

export const updateTasksStatus = async (dispatch, sheet, task, uniqueKey, newStatus,downloadURL) => {
    try {
        console.log('Updating status for task:', task, uniqueKey, newStatus,downloadURL);

        const taskDocRef = doc(db, 'weeks', sheet, 'tasks', uniqueKey);

        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(taskDocRef);

            if (!docSnapshot.exists()) {
                throw new Error("Document does not exist!");
            }

            const tasks = docSnapshot.data().tasks || [];
            const updatedTasks = tasks.map(t =>
                t.taskName === task.taskName ? { ...t, status: newStatus ,imageUrl: newStatus === 'Completed' ? downloadURL : t.imageUrl} : t
            );
            // Update the tasks array with the modified task
            transaction.update(taskDocRef, { tasks: updatedTasks });
        });
        console.log('task status updated sucussfully.')

        dispatch({
            type: 'UPDATE_TASK_STATUS',
            payload: {
                sheet,
                uniqueKey,
                taskName: task.taskName,
                newStatus,
                downloadURL,
            }
        });
        return null; // Indicate success
    } catch (error) {
        console.error('Error updating task status:', error);
        return error.message; // Return the error message
    }
};

export const updateFiles = async (dispatch, sheet, task, uniqueKey, uploadedFiles) => {
    try {
        console.log('Uploading files for task:', task, uniqueKey);
        const taskDocRef = doc(db, 'weeks', sheet, 'tasks', uniqueKey);

        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(taskDocRef);

            if (!docSnapshot.exists()) {
                throw new Error("Document does not exist!");
            }

            const tasks = docSnapshot.data().tasks || [];
            const updatedTasks = tasks.map(t => {
                if (t.taskName === task.taskName) {
                    const existingFiles = t.file || [];
                    const newFiles = [...existingFiles, ...uploadedFiles]; // Concatenate existing files with uploaded files
                    return {
                        ...t,
                        file: newFiles // Update file array directly
                    };
                }
                return t;
            });

            transaction.update(taskDocRef, { tasks: updatedTasks });
        });

        console.log('Files uploaded successfully.');

        dispatch({
            type: 'UPLOAD_FILES',
            payload: {
                sheet,
                uniqueKey,
                taskName: task.taskName,
                uploadedFiles,
            }
        });
        return null; // Indicate success
    } catch (error) {
        console.error('Error uploading files:', error);
        return error.message; // Return the error message
    }
};

export const UpdateReplyDate = async (dispatch, sheet, task, uniqueKey, date) => {
    try {
        const taskDocRef = doc(db, 'weeks', sheet, 'tasks', uniqueKey);

        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(taskDocRef);

            if (!docSnapshot.exists()) {
                throw new Error("Document does not exist!");
            }

            const tasks = docSnapshot.data().tasks || [];
            const updatedTasks = tasks.map(t => {
                if (t.taskName === task.taskName && t.category === 'D') {
                    return {
                        ...t,
                        reply: {
                            ...t.reply,
                            replyDue: date
                        }
                    };
                }
                return t;
            });

            transaction.update(taskDocRef, { tasks: updatedTasks });
        });

        console.log('Reply date updated successfully.');

        dispatch({
            type: 'UPDATE_REPLY_DATE',
            payload: {
                sheet,
                uniqueKey,
                taskName: task.taskName,
                date,
            }
        });

        return null;
    } catch (error) {
        console.error('Error updating reply date:', error);
        return error.message;
    }
};

export const updateReplyCount = async ( dispatch,sheet, task, uniqueKey, count) => {
    console.log('values received:',count);
    try {
        const taskDocRef = doc(db, 'weeks', sheet, 'tasks', uniqueKey);
        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(taskDocRef);

            if (!docSnapshot.exists()) {
                throw new Error("Document does not exist!");
            }

            const tasks = docSnapshot.data().tasks || [];
            const updatedTasks = tasks.map(t => {
                if (t.taskName === task.taskName && t.category === 'D') {
                    return {
                        ...t,
                        reply: {
                            ...t.reply,
                            count: count
                        }
                    };
                }
                return t;
            });

            transaction.update(taskDocRef, { tasks: updatedTasks });
        });

        console.log('Reply count updated successfully.');

        dispatch({
            type: 'UPDATE_REPLY_COUNT',
            payload: {
                sheet,
                uniqueKey,
                taskName: task.taskName,
                count,
            }
        });

        return null;
    } catch (error) {
        console.error('Error updating reply date:', error);
        return error.message;
    }
};

export const updateTask = async (dispatch, sheet, taskKey, uniqueKey, updatedValues) => {
    try {
      const taskDocRef = doc(db, 'weeks', sheet, 'tasks', uniqueKey);
      await runTransaction(db, async (transaction) => {
        const docSnapshot = await transaction.get(taskDocRef);
  
        if (!docSnapshot.exists()) {
          throw new Error("Document does not exist!");
        }
  
        const tasks = docSnapshot.data().tasks || [];
        const updatedTasks = tasks.map(t => {
          if (t.taskName === taskKey) {
            return {
              ...t,
              ...updatedValues, // Spread both the existing task and updated values
            };
          }
          return t;
        });
  
        transaction.update(taskDocRef, { tasks: updatedTasks });
      });
  
      console.log('Task updated successfully.');
  
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          sheet,
          uniqueKey,
          taskName: taskKey,
          updatedValues,
        }
      });
  
      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      return error.message;
    }
  };

//grades actions 
export const updateGrade = async (dispatch, updatedData) => {
    const { taskName, weekName, finalGrade, uniqueKey } = updatedData;
    try {
        await runTransaction(db, async (transaction) => {
            const weekDocRef = doc(db, 'weeks', weekName);
            const taskDocRef = doc(weekDocRef, 'tasks', uniqueKey);

            const taskDocSnapshot = await transaction.get(taskDocRef);

            if (!taskDocSnapshot.exists()) {
                throw new Error('Task document not found');
            }

            const tasks = taskDocSnapshot.data().tasks || [];
            // Find the index of the task to be updated
            const taskIndex = tasks.findIndex(task => task.taskName === taskName);

            if (taskIndex !== -1) {
                // Update the task's finalGrade
                const updatedTask = { ...tasks[taskIndex], finalGrade };

                // Replace the old task with the updated task in the array
                const updatedTasks = [...tasks];
                updatedTasks[taskIndex] = updatedTask;

                // Update the document with the modified tasks array
                transaction.update(taskDocRef, { tasks: updatedTasks });

                console.log('these are the tasks:', updatedTasks);
                // Send the updated tasks array, weekName, and uniqueId in the payload
                dispatch({ type: 'UPDATE_GRADE', payload: { updatedTasks, weekName, uniqueKey } });
            } else {
                throw new Error('Task not found');
            }
        });

        return null; // Indicate success
    } catch (error) {
        console.error('Error updating grade:', error);
        return 'An error occurred while updating the grade.';
    }
};



export const addGrade = async (dispatch, updatedData) => {
    console.log('his is the received data', updatedData)
    const { uniqueKey, id, finalGrade } = updatedData;
    try {
        // Reference to the client's document in the 'clients' collection
        const clientDocRef = doc(db, 'clients', uniqueKey);
        // Reference to the specific coordinator's document in the subcollection 'coordinators'
        const coordinatorDocRef = doc(collection(clientDocRef, 'coordinators'), id);

        // Update the 'finalGrade' field of the coordinator's document
        await updateDoc(coordinatorDocRef, { finalGrade });

        // Dispatch the action to update the state
        dispatch({ type: 'ADD_GRADE', payload: updatedData });

        return null; // Indicate success
    } catch (error) {
        console.error('Error updating grade:', error);
        return error.message; // Return the error message
    }
};

//Extra Project functions 
export const addProject = async (dispatch, data) => {
    console.log('Received data:', data);

    const { projectName, ...rest } = data;
    const projectNameWithoutSpaces = projectName.replace(/\s+/g, '');

    try {
        await runTransaction(db, async (transaction) => {
            const projectRef = doc(db, 'extraProjects', projectNameWithoutSpaces);
            const projectDocSnapshot = await transaction.get(projectRef);

            if (projectDocSnapshot.exists()) {
                return 'A project with this name already exists.';
            }

            const projectData = {
                ...data,
                key: projectNameWithoutSpaces,
                id: projectNameWithoutSpaces,
            };

            transaction.set(projectRef, data);

            dispatch({
                type: 'ADD_PROJECT',
                payload: projectData,
            });
        });

        return null; // Indicate success
    } catch (error) {
        console.error('Error adding project:', error);
        return `An error occurred while adding the project: ${error.message}`;
    }
};

export const fetchExtraProjects = async (dispatch) => {
    const extraProjectsCollection = collection(db, 'extraProjects');
    let lastVisible = null;
    let allDocuments = [];
    let snapshot;

    try {
        do {
            const q = lastVisible
                ? query(extraProjectsCollection, startAfter(lastVisible), limit(BATCH_SIZE))
                : query(extraProjectsCollection, limit(BATCH_SIZE));
            snapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => ({
                id: doc.id,
                key: doc.id,
                ...doc.data(),
            }));
            allDocuments = [...allDocuments, ...documents];
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
        } while (snapshot.docs.length === BATCH_SIZE);
        console.log(allDocuments);

        dispatch({ type: 'SET_EXTRA_PROJECTS', payload: allDocuments });
    } catch (error) {
        console.error('Error fetching extra projects: ', error);
    }
};

export const deleteExtraProject = async (dispatch, id) => {
    try {
        const projectRef = doc(db, 'extraProjects', id);
        await deleteDoc(projectRef);
        dispatch({ type: 'DEL_EXTRA_PROJECT', payload: id });
        return null; // Indicate success
    } catch (error) {
        console.error('Error deleting extra project:', error);
        return error.message; // Return the error message
    }
};

export const editProject = async (dispatch, id, updatedFields) => {
    try {
        const projectDocRef = doc(db, 'extraProjects', id);
        await updateDoc(projectDocRef, updatedFields);
        dispatch({ type: 'EDIT_EXTRA_PROJECT', payload: { id, updatedFields } });
        return null;
    } catch (error) {
        console.error('Error updating project:', error);
        return error.message; // Return the error message
    }
};

export const updateProjectStatus = async (dispatch, id, value) => {
    try {
        const projectRef = doc(db, 'extraProjects', id);
        await updateDoc(projectRef, { status: value });
        dispatch({ type: 'PROJECT_STATUS', payload: { id, status: value } });
        return null;
    } catch (error) {
        console.error('Error updating project status:', error);
        return error.message;
    }
};

//extraProject payments
export const addProjectPayment = async (dispatch, payment) => {
    const { projectName, ...paymentData } = payment;
    console.log('the data being added', payment);

    try {
        const timestamp = Date.now();
        const paymentDocRef = await addDoc(collection(db, "payments"), {
            ...paymentData,
            projectName, // Store the project name
            timestamp: timestamp, // Store the timestamp as a Firestore timestamp
        });

        dispatch({
            type: 'ADD_PROJECT_PAYMENT',
            payload: { ...paymentData, timestamp,projectName,id:paymentDocRef.id, key: paymentDocRef.id }
        });

        return null;
    } catch (error) {
        console.error("Error adding payment: ", error);
        return error.message;
    }
};

export const fetchProjectPayments = async (dispatch) => {
    const paymentsCollection = collection(db, 'payments');
    const queryConstraints = [
        where('type', '==', 'project'),  // Fetch payments where type is 'project'
        orderBy('timestamp', 'desc')     // Order by timestamp in descending order
    ];

    await fetchBatchedData(paymentsCollection, queryConstraints, dispatch, 'SET_PROJECT_PAYMENTS');
};

export const deleteProjectPayment = async (dispatch, payment) => {
    console.log('the received record is this:', payment);
    const paymentRef = doc(db, 'payments', payment.id);

    try {
        // Delete the document from Firestore
        await deleteDoc(paymentRef);
        console.log('The document is successfully deleted');

        // Dispatch the action to remove the payment from the state
        dispatch({ type: 'DEL_PROJECT_PAYMENT', payload: payment.id });
        console.log('Payment deleted successfully with id:', payment.id);
        return null;
    } catch (error) {
        console.error('Error deleting project payment:', error);
        return error.message;
    }
};

// export const fetchDataAndTasks = async (dispatch) => {
//     try {
//       // Fetch all weeks
//       const weeksCollectionRef = collection(db, 'weeks');
//       const weeksQuery = query(weeksCollectionRef, orderBy('timestamp', 'desc'));
//       const weeksSnapshot = await getDocs(weeksQuery);
  
//       const weeks = weeksSnapshot.docs.map(doc => ({
//         id: doc.id,
//         key: doc.id,
//         ...doc.data(),
//       }));
  
//       // Dispatch weeks immediately to set them in state
//       dispatch({ type: 'SET_WEEKS', payload: weeks });
  
//       // Determine the latest and remaining weeks
//       const latestWeekId = weeks.length > 0 ? weeks[0].id : null;
//       const remainingWeeks = weeks.slice(1); // Exclude the latest week
  
//       // Fetch tasks for the latest week if present
//       let latestTasksPromise = Promise.resolve([]);
//       if (latestWeekId) {
//         const tasksCollectionRef = collection(db, 'weeks', latestWeekId, 'tasks');
//         const latestTasksSnapshot = await getDocs(tasksCollectionRef);
//         latestTasksPromise = latestTasksSnapshot.docs.map(doc => ({
//           id: doc.id,
//           key: doc.id,
//           ...doc.data()
//         }));
//       }
  
//       // Fetch tasks for remaining weeks in parallel
//       const tasksPromises = remainingWeeks.map(week => 
//         fetchTasksForWeekInBatches(week.id)
//       );
  
//       // Combine latest week tasks fetch with remaining weeks tasks fetch
//       const allTasksResults = await Promise.all([latestTasksPromise, ...tasksPromises]);
  
//       // Map tasks to their weeks
//       const allTasksByWeek = allTasksResults.reduce((acc, taskData, index) => {
//         const weekId = index === 0 ? latestWeekId : remainingWeeks[index - 1].id;
//         acc[weekId] = taskData;
//         return acc;
//       }, {});
  
//       // Dispatch the action to set all tasks
//       dispatch({ type: 'SET_ALL_TASKS', payload: allTasksByWeek });
  
//     } catch (error) {
//       console.error('Error fetching weeks and tasks:', error);
//       throw error;
//     }
//   };
  