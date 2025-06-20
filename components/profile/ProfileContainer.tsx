"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import SecurityTab from "./tabs/SecurityTab";
import NotificationsTab from "./tabs/NotificationsTab";
import { ProfileData } from "./types";

interface ProfileContainerProps {
  user: User;
  profile: ProfileData | null;
}

export default function ProfileContainer({ user, profile }: ProfileContainerProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState<ProfileData | null>(profile);

  const handleProfileUpdate = (updatedProfile: ProfileData) => {
    setProfileData(updatedProfile);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "personal":
        return (
          <PersonalInfoTab
            user={user}
            profile={profileData}
            onUpdate={handleProfileUpdate}
          />
        );
      case "security":
        return <SecurityTab user={user} />;
      case "notifications":
        return <NotificationsTab profile={profileData} onUpdate={handleProfileUpdate} />;
      default:
        return <PersonalInfoTab user={user} profile={profileData} onUpdate={handleProfileUpdate} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <ProfileHeader user={user} profile={profileData} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
}