import { React, createContext, useContext, useEffect, useReducer } from "react";
import { auth } from '../../src/firebase/firebase'
import { onAuthStateChanged } from "firebase/auth";

export function useAuth() {
    return useContext(AuthContext);
}

const initialState = {
    currentUser: null,
    userLoggedIn: false,
    loading: true,
    attendanceMarked: false,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                currentUser: action.payload,
                userLoggedIn: true,
                loading: false,
                attendanceMarked: JSON.parse(localStorage.getItem('attendance')) || false,

            };
        case 'LOGOUT':
            return {
                ...state,
                currentUser: null,
                userLoggedIn: false,
                loading: false,
                attendanceMarked: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ATTENDANCE':
            return {
                ...state,
                attendanceMarked: action.payload,
            };
        default:
            return state;
    }
}


const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch({ type: 'LOGIN', payload: { ...user } });
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                dispatch({ type: 'LOGOUT' });
                localStorage.removeItem('user');
                localStorage.removeItem('attendance'); // Clear attendance on logout
            }
        });
        return unsubscribe;
    }, []);

    const setAttendanceMarked = (value) => {
        dispatch({ type: 'SET_ATTENDANCE', payload: value });
        localStorage.setItem('attendance', JSON.stringify(value));
    };


    const value = {
        currentUser: state.currentUser,
        userLoggedIn: state.userLoggedIn,
        loading: state.loading,
        attendanceMarked: state.attendanceMarked,
        setAttendanceMarked,
        dispatch, // Pass dispatch to context for actions
    };

    return (
        <AuthContext.Provider value={value}>
            {!state.loading && children}
        </AuthContext.Provider>
    )
}