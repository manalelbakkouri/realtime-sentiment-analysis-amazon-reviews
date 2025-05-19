import { useState, useEffect } from "react";
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ChartBar, RefreshCw, Settings, PieChart, BarChart, Home, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip } from "@/components/ui/tooltip";

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
};

const Sidebar = ({ activeTab, onTabChange, onRefresh }: SidebarProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { theme } = useTheme();
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animation after component mounts
    setAnimateIn(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const menuItems = [
    { id: 'realtime', label: 'Real-time Monitoring', icon: RefreshCw },
    { id: 'offline', label: 'Offline Analysis', icon: ChartBar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
  // Add shimmer animation effect for selected items
  const shimmerAnimation = `
    @keyframes shimmer {
      0% {
        background-position: -468px 0;
      }
      100% {
        background-position: 468px 0;
      }
    }
  `;

  const analysisTools = [
    { id: 'sentiment', label: 'Sentiment Charts', icon: PieChart },
    { id: 'analytics', label: 'Product Analytics', icon: BarChart }
  ];

  return (
    <ShadcnSidebar className={cn(
      "border-r transition-all duration-500 ease-in-out shadow-lg",
      theme === "dark" 
        ? "bg-slate-950 border-slate-800" 
        : "bg-white border-slate-200"
    )}>
      <SidebarContent className="py-8 px-2 relative">
        {/* Optional decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mt-16 -mr-16 blur-xl z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -mb-12 -ml-12 blur-xl z-0"></div>
        
        {/* Sentiment Analysis and Real-time review insights text directly in sidebar */}
        <div className={cn(
          "text-center mb-8 relative z-10",
          "transition-all duration-700 transform",
          animateIn ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-1 tracking-tight",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            Sentiment Analysis
          </h2>
          <p className={cn(
            "text-sm font-medium",
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          )}>
            Real-time review insights
          </p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold uppercase tracking-wider px-3 py-2 text-center",
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          )}>
            Dashboards
          </SidebarGroupLabel>
          
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <div 
                    className="relative w-full group"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full flex items-center justify-start rounded-lg py-3 px-3 transition-all duration-300 relative overflow-hidden",
                        activeTab === item.id 
                          ? theme === "dark" 
                            ? "bg-primary/20 text-primary border-l-4 border-primary pl-2" 
                            : "bg-primary/10 text-primary-foreground border-l-4 border-primary pl-2"
                          : "hover:bg-primary/5 border-l-4 border-transparent pl-2",
                        "backdrop-blur-sm"
                      )} 
                      onClick={() => onTabChange(item.id)}
                    >
                      <div className={cn(
                        "mr-3 p-1.5 rounded-md transition-all duration-300 flex items-center justify-center",
                        activeTab === item.id 
                          ? "bg-primary text-primary-foreground"
                          : theme === "dark" ? "bg-slate-800/70 text-slate-300" : "bg-slate-200/70 text-slate-600"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "font-medium",
                        activeTab === item.id 
                          ? "text-primary"
                          : theme === "dark" ? "text-slate-300" : "text-slate-700"
                      )}>
                        {item.label}
                      </span>
                      
                      {hoveredItem === item.id && (
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 absolute right-3 transition-all duration-300",
                            theme === "dark" ? "text-slate-400" : "text-slate-500"
                          )}
                        />
                      )}

                      {/* Subtle hover effect */}
                      <div 
                        className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                          theme === "dark" ? "bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" : "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                        )}
                      ></div>
                    </Button>
                    
                    {activeTab === item.id && (
                      <div className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-full"></div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold uppercase tracking-wider px-3 py-2 text-center",
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          )}>
            Analysis Tools
          </SidebarGroupLabel>
          
          <SidebarMenu>
            {analysisTools.map((tool) => (
              <SidebarMenuItem key={tool.id}>
                <SidebarMenuButton asChild>
                  <div 
                    className="relative w-full group"
                    onMouseEnter={() => setHoveredItem(tool.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full flex items-center justify-start rounded-lg py-3 px-3 transition-all duration-300",
                        "hover:bg-primary/5 border-l-4 border-transparent pl-2 backdrop-blur-sm",
                      )}
                    >
                      <div className={cn(
                        "mr-3 p-1.5 rounded-md transition-all duration-300 flex items-center justify-center",
                        theme === "dark" ? "bg-slate-800/70 text-slate-300" : "bg-slate-200/70 text-slate-600"
                      )}>
                        <tool.icon className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "font-medium",
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      )}>
                        {tool.label}
                      </span>
                      
                      {hoveredItem === tool.id && (
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 absolute right-3 transition-all duration-300",
                            theme === "dark" ? "text-slate-400" : "text-slate-500"
                          )}
                        />
                      )}

                      {/* Subtle hover effect */}
                      <div 
                        className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                          theme === "dark" ? "bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" : "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                        )}
                      ></div>
                    </Button>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <div className={cn(
          "mt-auto px-3 pt-8 transition-all duration-700",
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <button 
            onClick={handleRefresh} 
            className={cn(
              "flex items-center justify-center w-full gap-2 py-3 px-4 rounded-lg transition-all duration-300",
              theme === "dark" 
                ? "bg-white hover:bg-gray-100 border border-slate-200" 
                : "bg-white hover:bg-gray-50 border border-slate-200",
              "shadow-md hover:shadow-lg transform hover:-translate-y-1"
            )}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} transition-all text-purple-600`} />
            <span className="font-medium text-purple-600">Refresh Data</span>
          </button>
          
          <div className={cn(
            "mt-6 flex items-center gap-3 px-3 py-4 rounded-lg backdrop-blur-sm",
            theme === "dark" ? "bg-slate-800/50 border border-slate-700/50" : "bg-slate-100/80 border border-slate-200"
          )}>
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              theme === "dark" ? "bg-slate-700 border border-slate-600" : "bg-white border border-slate-200 shadow-sm"
            )}>
              <Home className={cn(
                "h-5 w-5",
                theme === "dark" ? "text-slate-300" : "text-slate-600"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              )}>
                Dashboard
              </p>
              <p className={cn(
                "text-xs truncate",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )}>
                v1.2.0
              </p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;