import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/hooks/auth";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  Home,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import * as React from "react";
import { useMemo } from "react";
import { toast } from "sonner";

export default function FUAZHeader() {
  const { data: authenticatedUser } = useUser();
  const queryClient = useQueryClient();

  const location = useLocation();

  const router = useRouter();

  const { data: notifications = [] } = useQuery({
    ...orpc.notifications.getByUserId.queryOptions({
      input: {
        userId: authenticatedUser?.data?.user?.id!,
      },
    }),
    enabled: !!authenticatedUser?.data?.user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => orpc.notifications.markAsRead.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.getByUserId.queryKey({
          input: { userId: `${authenticatedUser?.data?.user?.id}` },
        }),
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      orpc.notifications.markAllAsRead.call({
        userId: authenticatedUser?.data?.user?.id!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", authenticatedUser?.data?.user?.id],
      });
    },
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items = [{ name: "Home", href: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ name, href: currentPath });
    });

    return items;
  }, [location.pathname]);

  const navigationLinks = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Courses", icon: BookOpen, href: "#" },
    { name: "Results", icon: GraduationCap, href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto px-4">
        {/* Top Bar - University Branding */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-3">
            {/* University Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/demo.titan-bridge.com.png"
                alt="logo"
                className="w-28 h-10"
              />
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {authenticatedUser?.data?.session ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-accent"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary hover:bg-primary/90 border-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between px-3 py-2">
                      <DropdownMenuLabel className="p-0">
                        Notifications
                      </DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAllAsReadMutation.mutate()}
                          disabled={markAllAsReadMutation.isPending}
                          className="h-auto p-1 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start py-3 focus:bg-accent cursor-pointer ${
                            !notification.isRead ? "bg-accent/50" : ""
                          }`}
                          onClick={() =>
                            markAsReadMutation.mutate(notification.id)
                          }
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="font-medium text-sm">
                              {notification.title}
                            </div>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-primary rounded-full mt-1 ml-2 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center justify-center text-sm font-medium focus:bg-accent">
                      View All Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2 hover:bg-accent"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage
                          src={authenticatedUser.data.user.image ?? ""}
                          alt={authenticatedUser.data.user.name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {authenticatedUser.data.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {authenticatedUser.data.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {authenticatedUser.data.user.matricNumber ?? ""}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {authenticatedUser.data.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {authenticatedUser.data.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="focus:bg-accent">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-accent">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        const { error } = await authClient.signOut();
                        if (error) toast.error(error.message);
                        router.navigate({ to: "/", replace: true });
                        router.invalidate();
                      }}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu - Authenticated */}
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 flex flex-col gap-4">
                      {/* Mobile User Info */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage
                            src={authenticatedUser.data.user.image ?? ""}
                            alt={authenticatedUser.data.user.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {authenticatedUser.data.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {authenticatedUser.data.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {authenticatedUser.data.user.matricNumber}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Navigation */}
                      <div className="flex flex-col gap-2">
                        {navigationLinks.map((link) => (
                          <Button
                            key={link.name}
                            variant="ghost"
                            className="justify-start hover:bg-accent"
                          >
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.name}
                          </Button>
                        ))}
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          className="justify-start hover:bg-accent"
                        >
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start hover:bg-accent"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                {/* Unauthenticated Actions - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild variant="ghost" className="hover:bg-accent">
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/apply">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Apply Now
                    </Link>
                  </Button>
                </div>

                {/* Mobile Menu - Unauthenticated */}
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-4">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 flex flex-col gap-4">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start hover:bg-accent"
                      >
                        <Link to="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Link to="/apply">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Apply Now
                        </Link>
                      </Button>
                      <DropdownMenuSeparator />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Quick Links</p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            className="justify-start hover:bg-accent"
                          >
                            About Us
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start hover:bg-accent"
                          >
                            Programmes
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start hover:bg-accent"
                          >
                            Admissions
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start hover:bg-accent"
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {authenticatedUser?.data?.session && breadcrumbItems.length > 1 && (
          <div className="py-2">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.href}>{item.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </div>
    </header>
  );
}
