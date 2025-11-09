import type React from "react";
import { useState, type ReactNode } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/hooks/auth";
import { View } from "./view";

// Button Props Interface
interface ButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

function Button({
  children,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  variant = "default",
  size = "default",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-background hover:bg-secondary",
    ghost: "hover:bg-secondary",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Input Props Interface
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// Label Props Interface
interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

function Label({ children, htmlFor, className = "" }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-none", className)}
    >
      {children}
    </label>
  );
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { data: user, isPending: isUserPending } = useUser();
  const navigate = useNavigate();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (error) {
          console.error("Auth error:", error);
          toast.error(error.message || "Sign-in failed. Please try again.");
          return;
        }

        if (data?.user) {
          toast.success(`Welcome back, ${data.user.email}!`);
          navigate({ to: "/dashboard" });
          router.invalidate();
        }
      } catch (error) {
        console.error("Catch error:", error);
        toast.error("Sign-in failed. Please try again.");
      }
    },
  });

  // Show dashboard button if user is already logged in
  if (user?.data?.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl shadow-lg overflow-hidden border border-border bg-card">
            <div className="p-8 md:p-12 bg-linear-to-br from-primary to-secondary">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                  You're Already Logged In
                </h1>
                <p className="text-primary-foreground/80">
                  Welcome back, {user.data?.user.email}!
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="w-full h-12 text-base font-semibold"
              >
                <span className="flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form for non-authenticated users
  return (
    <View
      isLoading={isUserPending}
      className="min-h-screen flex items-center justify-center bg-background px-4 py-8"
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-lg overflow-hidden border border-border bg-card">
          <div className="p-8 md:p-12 bg-linear-to-br from-primary to-secondary">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-primary-foreground/80">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Email is required";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return "Please enter a valid email";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pl-10 h-12"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{field.state.meta.errors[0]}</span>
                      </div>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Password is required";
                    if (value.length < 8) {
                      return "Password must be at least 8 characters";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pl-10 pr-10 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{field.state.meta.errors[0]}</span>
                      </div>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="remember">
                {(field) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-foreground"
                    >
                      Remember me for 30 days
                    </label>
                  </div>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </div>
        </div>
      </div>
    </View>
  );
}
