import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Landing } from "./Landing";
import { PathSelection } from "./PathSelection";
import { TalentsPath } from "./TalentsPath";
import ScenariosPath from "./ScenariosPath";

type Screen = "landing" | "path-selection" | "talents" | "scenarios";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const { user, logout } = useAuth();

  // Auto-navigate to path selection when user becomes authenticated
  useEffect(() => {
    if (user && currentScreen === "landing") {
      setCurrentScreen("path-selection");
    }
  }, [user, currentScreen]);

  const handleStart = () => {
    setCurrentScreen("path-selection");
  };

  const handleSelectPath = (path: "talents" | "scenarios") => {
    setCurrentScreen(path);
  };

  const handleBackToLanding = () => {
    setCurrentScreen("landing");
    logout(); // Log out the user when going back to landing
  };

  const handleBackToPathSelection = () => {
    setCurrentScreen("path-selection");
  };

  // Show landing page if user is not authenticated
  if (!user) {
    return (
      <main className="min-h-screen">
        <Landing onStart={handleStart} />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {currentScreen === "path-selection" && (
        <PathSelection
          userName={user.name}
          onSelectPath={handleSelectPath}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentScreen === "talents" && (
        <TalentsPath
          userName={user.name}
          onBack={handleBackToPathSelection}
        />
      )}
      
      {currentScreen === "scenarios" && (
        <ScenariosPath
          userName={user.name}
          onBack={handleBackToPathSelection}
        />
      )}
    </main>
  );
};

export default Index;
