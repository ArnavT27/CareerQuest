import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlumniExpertConnect } from "@/components/AlumniExpertConnect";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

interface ExpertConnectProps {
  onBack?: () => void;
}

const ExpertConnect = ({ onBack }: ExpertConnectProps) => {
  const { user } = useAuth();
  const [selectedField, setSelectedField] = useState<string>("");

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Header */}
        {onBack && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-6 py-3 rounded-xl backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}

        {/* Main Content */}
        <AlumniExpertConnect fieldOfInterest={selectedField} userName={user?.name} />
      </div>
    </div>
  );
};

export default ExpertConnect;

