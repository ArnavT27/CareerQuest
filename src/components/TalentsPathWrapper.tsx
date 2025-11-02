import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TalentsPath } from "@/pages/TalentsPath";

export const TalentsPathWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <DashboardLayout>
      <TalentsPath 
        userName={user.name} 
        onBack={() => navigate("/dashboard")} 
      />
    </DashboardLayout>
  );
};

