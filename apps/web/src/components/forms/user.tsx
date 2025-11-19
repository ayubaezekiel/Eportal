import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { orpc, queryClient } from "@/utils/orpc";

// Zod schema for form validation
const userFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    userType: z.enum([
      "student",
      "lecturer",
      "admin",
      "hod",
      "dean",
      "registrar",
      "bursar",
    ]),
    firstName: z.string().min(2, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required"),
    gender: z.string(),
    dateOfBirth: z.string(),
    phoneNumber: z.string().min(10, "Phone number is required"),
    stateOfOrigin: z.string().min(2, "State of origin is required"),
    lgaOfOrigin: z.string().min(2, "LGA of origin is required"),
    permanentAddress: z.string().min(10, "Permanent address is required"),
    contactAddress: z.string().min(10, "Contact address is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Helper functions for date formatting
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};
const formatDateDisplay = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const getDefaultDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return formatDate(date);
};

export const UserForm = () => {
  const createUserMutation = useMutation(
    orpc.users.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("User created successfully!", {
          description: `${data.name} has been added to the system.`,
        });
        queryClient.invalidateQueries({
          queryKey: orpc.users.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (error) => {
        toast.error("Failed to create user", {
          description: error.message,
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      userType: "student" as const,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "male",
      dateOfBirth: getDefaultDate(),
      phoneNumber: "",
      stateOfOrigin: "",
      lgaOfOrigin: "",
      permanentAddress: "",
      contactAddress: "",
    },
    onSubmit: async ({ value }) => {
      const name = `${value.firstName} ${
        value.middleName ? value.middleName + " " : ""
      }${value.lastName}`.trim();
      await createUserMutation.mutateAsync({ ...value, name });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Login Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="email"
            validators={{ onChange: userFormSchema.shape.email }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="user@example.com"
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
          <form.Field
            name="userType"
            validators={{ onChange: userFormSchema.shape.userType }}
            children={(field) => (
              <div className="space-y-1">
                <Label>User Type *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "student",
                      "lecturer",
                      "admin",
                      "hod",
                      "dean",
                      "registrar",
                      "bursar",
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <form.Field
            name="password"
            validators={{ onChange: userFormSchema.shape.password }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
          <form.Field
            name="confirmPassword"
            validators={{ onChange: userFormSchema.shape.confirmPassword }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Confirm Password *</Label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Re-enter password"
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field
            name="firstName"
            validators={{ onChange: userFormSchema.shape.firstName }}
            children={(field) => (
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="middleName"
            children={(field) => (
              <div className="space-y-1">
                <Label>Middle Name</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="lastName"
            validators={{ onChange: userFormSchema.shape.lastName }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="gender"
            children={(field) => (
              <div className="space-y-1">
                <Label>Gender *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <form.Field
            name="dateOfBirth"
            children={(field) => (
              <div className="space-y-1">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      {field.state.value
                        ? formatDateDisplay(field.state.value)
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(field.state.value)}
                      onSelect={(date) =>
                        field.handleChange(date ? formatDate(date) : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />
          <form.Field
            name="phoneNumber"
            validators={{ onChange: userFormSchema.shape.phoneNumber }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Phone Number *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="stateOfOrigin"
            validators={{ onChange: userFormSchema.shape.stateOfOrigin }}
            children={(field) => (
              <div className="space-y-1">
                <Label>State of Origin *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="lgaOfOrigin"
            validators={{ onChange: userFormSchema.shape.lgaOfOrigin }}
            children={(field) => (
              <div className="space-y-1">
                <Label>LGA of Origin *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="permanentAddress"
            validators={{ onChange: userFormSchema.shape.permanentAddress }}
            children={(field) => (
              <div className="space-y-1 col-span-2">
                <Label>Permanent Address *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="contactAddress"
            validators={{ onChange: userFormSchema.shape.contactAddress }}
            children={(field) => (
              <div className="space-y-1 col-span-2">
                <Label>Contact Address *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={createUserMutation.isPending}
        >
          Reset
        </Button>
        <Button type="submit" disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
};
