import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <div className="profile-info">
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
      <div className="achievements">
        <h2>Achievements</h2>
        <p>Coming soon...</p>
      </div>
      <div className="progress">
        <h2>Learning Progress</h2>
        <p>Coming soon...</p>
      </div>
      <div className="linkedin">
        <h2>LinkedIn Credentials</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Profile;
