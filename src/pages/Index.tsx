import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Landing } from "./Landing";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Show landing page if user is not authenticated
  return (
    <main className="min-h-screen">
      <Landing onStart={() => {}} />
    </main>
  );
};

export default Index;
