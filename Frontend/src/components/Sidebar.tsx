
import { useState } from "react";
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ChartBar, RefreshCw, Settings, PieChart, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
};

const Sidebar = ({ activeTab, onTabChange, onRefresh }: SidebarProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const menuItemVariants = {
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <ShadcnSidebar>
      <SidebarContent className="py-6">
        <motion.div 
          className="px-3 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-primary mb-2">Sentiment Analysis</h2>
          <p className="text-sm text-muted-foreground">Real-time review insights</p>
        </motion.div>

        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
              >
                <motion.div
                  whileHover="hover"
                  variants={menuItemVariants}
                  className="w-full"
                >
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full flex items-center justify-start transition-all duration-300", 
                      activeTab === 'realtime' && "bg-primary/20 text-primary-foreground",
                      theme === "dark" ? "hover:bg-primary/20" : "hover:bg-primary/10"
                    )} 
                    onClick={() => onTabChange('realtime')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Real-time Monitoring</span>
                  </Button>
                </motion.div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
              >
                <motion.div
                  whileHover="hover"
                  variants={menuItemVariants}
                  className="w-full"
                >
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full flex items-center justify-start transition-all duration-300", 
                      activeTab === 'offline' && "bg-primary/20 text-primary-foreground",
                      theme === "dark" ? "hover:bg-primary/20" : "hover:bg-primary/10"
                    )}
                    onClick={() => onTabChange('offline')}
                  >
                    <ChartBar className="mr-2 h-4 w-4" />
                    <span>Offline Analysis</span>
                  </Button>
                </motion.div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
              >
                <motion.div
                  whileHover="hover"
                  variants={menuItemVariants}
                  className="w-full"
                >
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full flex items-center justify-start transition-all duration-300", 
                      activeTab === 'settings' && "bg-primary/20 text-primary-foreground",
                      theme === "dark" ? "hover:bg-primary/20" : "hover:bg-primary/10"
                    )}
                    onClick={() => onTabChange('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </motion.div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Analysis Tools</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <motion.div
                  whileHover="hover"
                  variants={menuItemVariants}
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full flex items-center justify-start transition-all duration-300">
                    <PieChart className="mr-2 h-4 w-4" />
                    <span>Sentiment Charts</span>
                  </Button>
                </motion.div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <motion.div
                  whileHover="hover"
                  variants={menuItemVariants}
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full flex items-center justify-start transition-all duration-300">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Product Analytics</span>
                  </Button>
                </motion.div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-auto px-3 pt-6">
          <motion.button 
            onClick={handleRefresh} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center w-full gap-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground py-2 px-4 rounded-md transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </motion.button>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;
