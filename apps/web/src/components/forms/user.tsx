import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import type React from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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

const baseUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    userType: z.string(),
    status: z.string().default("active"),
    firstName: z.string().min(2),
    middleName: z.string().optional(),
    lastName: z.string().min(2),
    gender: z.string(),
    dateOfBirth: z.string(),
    phoneNumber: z.string().min(11),
    alternatePhone: z.string().optional(),
    image: z.string().optional(),
    stateOfOrigin: z.string(),
    lgaOfOrigin: z.string(),
    nationality: z.string().default("Nigeria"),
    permanentAddress: z.string().min(10),
    contactAddress: z.string().min(10),
    nextOfKinName: z.string().optional(),
    nextOfKinRelationship: z.string().optional(),
    nextOfKinPhone: z.string().optional(),
    nextOfKinAddress: z.string().optional(),
    matricNumber: z.string().optional(),
    jambRegNumber: z.string().optional(),
    modeOfEntry: z.string().optional(),
    admissionYear: z.number().optional(),
    currentLevel: z.number().min(100).max(900).optional(),
    currentSemester: z.string().optional(),
    studyMode: z.string().optional(),
    facultyId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    cgpa: z.number().min(0).max(5).optional(),
    totalCreditsEarned: z.number().default(0),
    staffId: z.string().optional(),
    designation: z.string().optional(),
    employmentDate: z.string().optional(),
    employmentType: z.string().optional(),
    officeLocation: z.string().optional(),
    permissions: z.any().default({}),
    isOnProbation: z.boolean().default(false),
    probationReason: z.string().optional(),
    isDeferred: z.boolean().default(false),
    defermentStartDate: z.string().optional(),
    defermentEndDate: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Helper function to format date
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
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
  const schema = baseUserSchema;

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      userType: "student",
      status: "active",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "male",
      dateOfBirth: getDefaultDate(),
      phoneNumber: "",
      alternatePhone: "",
      image: "",
      stateOfOrigin: "",
      lgaOfOrigin: "",
      nationality: "Nigeria",
      permanentAddress: "",
      contactAddress: "",
      nextOfKinName: "",
      nextOfKinRelationship: "",
      nextOfKinPhone: "",
      nextOfKinAddress: "",
      matricNumber: "",
      jambRegNumber: "",
      modeOfEntry: "",
      admissionYear: new Date().getFullYear(),
      currentLevel: 100,
      currentSemester: "",
      studyMode: "",
      cgpa: 0.0,
      totalCreditsEarned: 0,
      staffId: "",
      designation: "",
      employmentDate: "",
      employmentType: "",
      officeLocation: "",
      permissions: {},
      isOnProbation: false,
      probationReason: "",
      isDeferred: false,
      defermentStartDate: "",
      defermentEndDate: "",
    },
    onSubmit: async ({ value }) => {
      try {
        // Generate full name
        const fullName = `${value.firstName} ${
          value.middleName ? value.middleName + " " : ""
        }${value.lastName}`.trim();

        // Prepare the signup data with ALL fields
        const signupData: any = {
          email: value.email,
          name: fullName,
          password: value.password,
          // Basic fields
          firstName: value.firstName,
          middleName: value.middleName || null,
          lastName: value.lastName,
          userType: value.userType,
          status: value.status,
          // Personal Information
          gender: value.gender,
          dateOfBirth: value.dateOfBirth,
          phoneNumber: value.phoneNumber,
          alternatePhone: value.alternatePhone || null,
          // Address Information
          stateOfOrigin: value.stateOfOrigin,
          lgaOfOrigin: value.lgaOfOrigin,
          nationality: value.nationality,
          permanentAddress: value.permanentAddress,
          contactAddress: value.contactAddress,
          // Emergency Contact
          nextOfKinName: value.nextOfKinName || null,
          nextOfKinRelationship: value.nextOfKinRelationship || null,
          nextOfKinPhone: value.nextOfKinPhone || null,
          nextOfKinAddress: value.nextOfKinAddress || null,
        };

        // Add student-specific fields
        if (value.userType === "student") {
          Object.assign(signupData, {
            matricNumber: value.matricNumber || null,
            jambRegNumber: value.jambRegNumber || null,
            modeOfEntry: value.modeOfEntry || null,
            admissionYear: value.admissionYear,
            currentLevel: value.currentLevel,
            currentSemester: value.currentSemester || null,
            studyMode: value.studyMode || null,
            cgpa: value.cgpa,
            totalCreditsEarned: value.totalCreditsEarned,
            isOnProbation: value.isOnProbation,
            probationReason: value.probationReason || null,
            isDeferred: value.isDeferred,
            defermentStartDate: value.defermentStartDate || null,
            defermentEndDate: value.defermentEndDate || null,
          });
        }

        // Add staff-specific fields
        if (value.userType !== "student") {
          Object.assign(signupData, {
            staffId: value.staffId || null,
            designation: value.designation || null,
            employmentDate: value.employmentDate || null,
            employmentType: value.employmentType || null,
            officeLocation: value.officeLocation || null,
            permissions: JSON.stringify(value.permissions || {}),
          });
        }

        // Create the user with ALL fields at once
        const { data: authData, error: authError } =
          await authClient.signUp.email(signupData);

        if (authError) {
          toast.error(`Error: ${authError.message}`);
          return;
        }

        if (!authData?.user?.id) {
          toast.error("User created but ID not returned");
          return;
        }

        toast.success(`${fullName} created successfully!`, {
          description: `User account has been created with the provided password.`,
          duration: 5000,
        });
        queryClient.invalidateQueries({
          queryKey: orpc.users.getAll.queryKey(),
        });
        form.reset();
      } catch (error: any) {
        console.error("Form submission error:", error);
        toast.error(`Error creating user: ${error.message || "Unknown error"}`);
      }
    },
  });

  const FormField = ({
    name,
    label,
    required = false,
    children,
  }: {
    name: string;
    label: string;
    required?: boolean;
    children: (field: any) => React.ReactNode;
  }) => (
    <form.Field
      name={name as any}
      validators={{
        onChange: schema.shape[name as keyof typeof schema.shape],
      }}
    >
      {(field) => (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {children(field)}
          {field.state.meta.errors && field.state.meta.errors.length > 0 && (
            <p className="text-sm text-red-500">
              {field.state.meta.errors[0]?.message}
            </p>
          )}
        </div>
      )}
    </form.Field>
  );

  return (
    <Card className="mt-10 w-full mx-auto">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Add a new user to the system with their login credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="email" label="Email" required>
                {(field) => (
                  <Input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="user@example.com"
                  />
                )}
              </FormField>

              <FormField name="userType" label="User Type" required>
                {(field) => (
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
                )}
              </FormField>

              <FormField name="password" label="Password" required>
                {(field) => (
                  <Input
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                )}
              </FormField>

              <FormField
                name="confirmPassword"
                label="Confirm Password"
                required
              >
                {(field) => (
                  <Input
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Re-enter password"
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="firstName" label="First Name" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="John"
                  />
                )}
              </FormField>

              <FormField name="middleName" label="Middle Name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Optional"
                  />
                )}
              </FormField>

              <FormField name="lastName" label="Last Name" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Doe"
                  />
                )}
              </FormField>

              <FormField name="gender" label="Gender" required>
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField name="dateOfBirth" label="Date of Birth" required>
                {(field) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        {field.state.value
                          ? formatDateDisplay(field.state.value)
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.state.value
                            ? new Date(field.state.value)
                            : undefined
                        }
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
                )}
              </FormField>

              <FormField name="nationality" label="Nationality" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>

              <FormField name="phoneNumber" label="Phone Number" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="08012345678"
                  />
                )}
              </FormField>

              <FormField name="alternatePhone" label="Alternate Phone">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Optional"
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="stateOfOrigin" label="State of Origin" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>

              <FormField name="lgaOfOrigin" label="LGA of Origin" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>

              <FormField
                name="permanentAddress"
                label="Permanent Address"
                required
              >
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Full permanent address"
                  />
                )}
              </FormField>

              <FormField name="contactAddress" label="Contact Address" required>
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Current contact address"
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Next of Kin Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Next of Kin Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="nextOfKinName" label="Name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>

              <FormField name="nextOfKinRelationship" label="Relationship">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Father, Mother, Spouse"
                  />
                )}
              </FormField>

              <FormField name="nextOfKinPhone" label="Phone Number">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>

              <FormField name="nextOfKinAddress" label="Address">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Conditional Student Fields */}
          <form.Subscribe
            selector={(state) => [state.values.userType]}
            children={([userType]) =>
              userType === "student" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="matricNumber" label="Matric Number">
                      {(field) => (
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </FormField>

                    <FormField name="jambRegNumber" label="JAMB Reg Number">
                      {(field) => (
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </FormField>

                    <FormField name="modeOfEntry" label="Mode of Entry">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utme">UTME</SelectItem>
                            <SelectItem value="de">Direct Entry</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>

                    <FormField name="admissionYear" label="Admission Year">
                      {(field) => (
                        <Input
                          type="number"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                        />
                      )}
                    </FormField>

                    <FormField name="currentLevel" label="Current Level">
                      {(field) => (
                        <Select
                          value={String(field.state.value)}
                          onValueChange={(value) =>
                            field.handleChange(Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {[100, 200, 300, 400, 500, 600].map((level) => (
                              <SelectItem key={level} value={String(level)}>
                                {level} Level
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>

                    <FormField name="studyMode" label="Study Mode">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="distance">Distance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                  </div>
                </div>
              )
            }
          />

          {/* Conditional Staff Fields */}
          <form.Subscribe
            selector={(state) => [state.values.userType]}
            children={([userType]) =>
              userType !== "student" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Staff Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="staffId" label="Staff ID">
                      {(field) => (
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </FormField>

                    <FormField name="designation" label="Designation">
                      {(field) => (
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </FormField>

                    <FormField name="employmentType" label="Employment Type">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>

                    <FormField name="officeLocation" label="Office Location">
                      {(field) => (
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </FormField>
                  </div>
                </div>
              )
            }
          />

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.state.isSubmitting}
            >
              Clear Form
            </Button>
            <Button disabled={form.state.isSubmitting} type="submit">
              {form.state.isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
