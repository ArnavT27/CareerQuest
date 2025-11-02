import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trophy,
  User,
  Users,
  FileText,
  Phone,
  Home,
  LogOut,
  Briefcase,
} from "lucide-react";

interface NavigationSidebarProps {
  className?: string;
}

export const NavigationSidebar = ({ className }: NavigationSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { state } = useSidebar();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
      tooltip: "Home Dashboard",
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
      tooltip: "Trending Jobs & Skills",
    },
    {
      title: "Profile",
      icon: User,
      path: "/profile",
      tooltip: "User Profile",
    },
    {
      title: "Connections",
      icon: Users,
      path: "/connections",
      tooltip: "Network & Connections",
    },
    {
      title: "Test",
      icon: FileText,
      path: "/test",
      tooltip: "Assessment Tests",
    },
    {
      title: "Call",
      icon: Phone,
      path: "/call",
      tooltip: "Schedule Calls",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  };

  const isExpanded = state === "expanded";

  return (
    <Sidebar
      collapsible="icon"
      className={`${className} bg-background border-r border-border`}
    >
      <SidebarHeader className="border-b border-border bg-background">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CareerQuest
              </span>
              <span className="text-xs text-muted-foreground">Career Discovery</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      isActive={active}
                      tooltip={item.tooltip}
                      size="lg"
                      className={`transition-all duration-200 ${
                        active 
                          ? "bg-accent text-accent-foreground border-l-2 border-primary shadow-md" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={active ? "font-semibold" : ""}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate text-foreground">{user?.name || "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              size="lg"
              tooltip="Logout"
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

