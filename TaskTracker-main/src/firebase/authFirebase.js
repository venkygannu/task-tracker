import Password from 'antd/es/input/Password'
import { db } from "./firebase";
import { auth } from './firebase'
import { doc, getDoc, collection, serverTimestamp, addDoc ,updateDoc} from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth/web-extension'

// export const login = async (dispatch, email, password) => {
//     try {
//         const result = await signInWithEmailAndPassword(auth, email, password);
//         dispatch({ type: 'LOGIN', payload: result.user });
//         localStorage.setItem('user', JSON.stringify(result.user));
//     } catch (error) {
//         console.error('Login error', error);
//     }
// };


export const login = async (dispatch, email, password) => {
    try {
        // Sign in the user
        const { user } = await signInWithEmailAndPassword(auth, email, password);

        const teamMemberRef = doc(db, "teamMembers", user.uid);
        const teamMemberSnapshot = await getDoc(teamMemberRef);

        if (!teamMemberSnapshot.exists()) {
            console.error("No such document!");
            return; // Exit early if document doesn't exist
        }

        const teamMemberData = teamMemberSnapshot.data();

        if (teamMemberData.suspend) {
            console.error("User is suspended");
            return; // Exit early if user is suspended
        }

        // Update the displayName and role in the user object
        const updatedUser = {
            ...user,
            displayName: `${teamMemberData.firstName} ${teamMemberData.lastName}`,
            role: teamMemberData.role,
        };

        // Dispatch the updated user object
        dispatch({ type: 'LOGIN', payload: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error) {
        console.error('Login error', error);
        // Handle the login error (e.g., show an error message)
    }
};

export const loginWithGoogle = async (dispatch) => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        dispatch({ type: 'LOGIN', payload: result.user });
        localStorage.setItem('user', JSON.stringify(result.user));
    } catch (error) {
        console.error('Login with Google error', error);
    }
};

// export const logout = async (dispatch) => {
//     try {
//         console.log('logout being triggered backend')
//         await auth.signOut();
//         localStorage.removeItem('user');
//         dispatch({ type: 'LOGOUT' });
//     } catch (error) {
//         console.error('Logout error', error);
//     }
// };

export const addAttendance = async (attendanceData) => {
    try {
        console.log('the attendance data received is:', attendanceData)
        const { user } = attendanceData;
        if (!user) {
            throw new Error("User ID is missing in attendance data.");
        }
        const teamMemberDocRef = doc(db, 'teamMembers', user);
        const attendanceSubcollectionRef = collection(teamMemberDocRef, 'attendance');
        const attendanceRecord = {
            ...attendanceData,
            logoutTime: '',       // Initialize with an empty string or null
            logoutDate: '',       // Initialize with an empty string or null
            logoutLocation: '',   // Initialize with an empty string or null
            timer: 0,             // Initialize timer with 0
            createdAt: serverTimestamp()  // Timestamp when the document is created
        };
        const docRef = await addDoc(attendanceSubcollectionRef, attendanceRecord);
        localStorage.setItem('latestLoginId', docRef.id);
        console.log('Attendance successfully added:', attendanceRecord);
    } catch (error) {
        console.error('Error adding attendance:', error);
    }
};

export const logout = async (dispatch,timer) => {
    try {
        console.log('Logout being triggered backend');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.uid) {
            throw new Error('User not found in localStorage');
        }

        const uid = user.uid;
        const latestLoginId = localStorage.getItem('latestLoginId');
        if (!latestLoginId) {
            throw new Error('Latest login ID not found in localStorage');
        }
        const teamMemberDocRef = doc(db, 'teamMembers', uid);
        const attendanceDocRef = doc(teamMemberDocRef, 'attendance', latestLoginId);

        const attendanceDoc = await getDoc(attendanceDocRef);
        if (!attendanceDoc.exists()) {
            throw new Error('Attendance record not found');
        }
        const logoutTime = new Date().toLocaleTimeString();
        const logoutDate = new Date().toLocaleDateString();
        const logoutLocation = await getCurrentLocation(); // Assume this function gets the current location

        // Update the attendance record with logout details
        await updateDoc(attendanceDocRef, {
            logoutTime,
            logoutDate,
            logoutLocation,
            timer // Update with the timer value passed from the HeaderBar component
        });

        // Sign out the user
        await signOut(auth);
        localStorage.removeItem('user');
        localStorage.removeItem('latestLoginId'); // Remove the latest login ID from localStorage
        dispatch({ type: 'LOGOUT' });
        console.log('User logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                        .then(response => response.json())
                        .then(data => {
                            resolve(`${data.city}, ${data.principalSubdivision}, ${data.countryName}`);
                        })
                        .catch(error => {
                            console.error('Error fetching location:', error);
                            resolve('Unknown Location');
                        });
                },
                error => {
                    console.error('Error getting geolocation:', error);
                    resolve('Unknown Location');
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            resolve('Unknown Location');
        }
    });
};