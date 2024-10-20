import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { firestore } from "../../../firebase/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { addAttendance } from "../../../firebase/authFirebase";
import "./Attendance.scss";

const AttendanceOverlay = ({ visible, onPunchIn }) => {
  const { currentUser, attendanceMarked } = useAuth();
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // if (attendanceMarked) {
    //     onPunchIn(); // Call the onPunchIn to set the state and hide the overlay
    //     return;
    // }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
            .then((response) => response.json())
            .then((data) => {
              setLocation(
                `${data.city}, ${data.principalSubdivision}, ${data.countryName}`
              );
            })
            .catch((error) => {
              console.error("Error fetching location:", error);
              setError("Unable to fetch location.");
            });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setError("Geolocation access denied. Using default location.");
          setLocation("Unknown Location"); // Fallback location
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setError("Geolocation is not supported by this browser.");
      setLocation("Unknown Location"); // Fallback location
    }
  }, []);

  const handlePunchIn = async () => {
    const attendanceData = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      location,
      user: currentUser.uid,
      userName: currentUser.email, // or any other user identifier
    };

    try {
      // await firestore.collection('attendance').add(attendanceData);
      await addAttendance(attendanceData);
      console.log("this is attendacce data", attendanceData);
      onPunchIn();
    } catch (error) {
      console.error("Error marking attendance: ", error);
    }
  };

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={400}
      className="attendance-modal"
    >
      <div className="attendance-overlay">
        <h2>Mark Attendance</h2>
        <div className="attendance-content">
          <div className="user-info">
            <img
              src="/api/placeholder/40/40"
              alt="User"
              className="user-avatar"
            />
            <div>
              <p className="label">Name</p>
              <p className="value">{currentUser.email}</p>
            </div>
          </div>
          <div className="info-row">
            <div>
              <p className="label">Date</p>
              <p className="value">
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
            <div>
              <p className="label">Time</p>
              <p className="value">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div>
            <p className="label">Location</p>
            <p className="value">{location || "Fetching location..."}</p>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
        <Button type="primary" onClick={handlePunchIn} disabled={!location}>
          Punch In
        </Button>
      </div>
    </Modal>
  );
};

export default AttendanceOverlay;
