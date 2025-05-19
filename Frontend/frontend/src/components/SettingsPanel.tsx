
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, RefreshCw, BarChart, Moon, Sun, Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const SettingsPanel = () => {
  const [refreshInterval, setRefreshInterval] = useState<string>("5000");
  const [apiEndpoint, setApiEndpoint] = useState<string>("https://api.sentimentanalysis.com");
  const [chartType, setChartType] = useState<string>("pie");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const handleSaveSettings = () => {
    // In a real application, these settings would be saved to localStorage or a backend
    toast({
      title: "Settings Saved",
      description: "Your dashboard preferences have been updated",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>API Settings</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Visualization</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div variants={itemVariants}>
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your dashboard preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Appearance
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <Switch 
                      checked={theme === "dark"} 
                      onCheckedChange={() => toggleTheme()}
                    />
                    <Moon className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Refresh Interval (ms)</label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Set how frequently the dashboard should refresh data
                  </p>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1 second</SelectItem>
                      <SelectItem value="5000">5 seconds</SelectItem>
                      <SelectItem value="10000">10 seconds</SelectItem>
                      <SelectItem value="30000">30 seconds</SelectItem>
                      <SelectItem value="60000">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="api">
          <motion.div variants={itemVariants}>
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Configure API endpoints and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="font-medium">API Endpoint</label>
                  <Input 
                    value={apiEndpoint} 
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="Enter API endpoint URL" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">API Key</label>
                  <Input type="password" placeholder="Enter API key" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="visualization">
          <motion.div variants={itemVariants}>
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Visualization Settings</CardTitle>
                <CardDescription>Configure how data is visualized</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="font-medium">Default Chart Type</label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPanel;
