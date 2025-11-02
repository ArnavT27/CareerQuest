import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import ScenariosPath from "@/pages/ScenariosPath";

export const ScenariosPathWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <DashboardLayout>
      <ScenariosPath 
        userName={user.name} 
        onBack={() => navigate("/dashboard")} 
      />
    </DashboardLayout>
  );
};

