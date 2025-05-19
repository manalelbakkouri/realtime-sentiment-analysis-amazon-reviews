
import { useState, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import RealtimeDashboard from "@/components/RealtimeDashboard";
import OfflineDashboard from "@/components/OfflineDashboard";
import SettingsPanel from "@/components/SettingsPanel";
import { useSentimentData } from "@/hooks/useSentimentData";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("realtime");
  
  const { refreshData } = useSentimentData();
  const { toast } = useToast();
  
  const handleRefresh = useCallback(() => {
    refreshData();
    toast({
      title: "Data Refreshed",
      description: "Dashboard has been updated with the latest data",
    });
  }, [refreshData, toast]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "realtime":
        return <RealtimeDashboard />;
      case "offline":
        return <OfflineDashboard />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <RealtimeDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onRefresh={handleRefresh}
        />
        
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {activeTab === "realtime" 
                    ? "Real-Time Sentiment Monitoring" 
                    : activeTab === "offline"
                    ? "Offline Sentiment Analysis"
                    : "Dashboard Settings"
                  }
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === "realtime" 
                    ? "Monitor customer reviews and sentiment in real time"
                    : activeTab === "offline" 
                    ? "Advanced analysis of historical sentiment data"
                    : "Configure dashboard preferences and appearance"
                  }
                </p>
              </motion.div>
              
              <ThemeToggle />
            </header>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
