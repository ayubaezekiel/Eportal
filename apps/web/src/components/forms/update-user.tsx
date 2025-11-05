import type { User } from "@/types/types";
import { orpc } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
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

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateDisplay = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const UpdateUserForm = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      // ---- required by the mutation ----
      id: user.id,

      // ---- core ----
      email: user.email ?? "",
      userType: user.userType ?? "student",
      status: user.status ?? "active",

      // ---- personal ----
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      gender: user.gender ?? "male",
      dateOfBirth: user.dateOfBirth ?? formatDate(new Date()),
      phoneNumber: user.phoneNumber ?? "",
      alternatePhone: user.alternatePhone ?? "",
      image: user.image ?? "",

      // ---- address ----
      stateOfOrigin: user.stateOfOrigin ?? "",
      lgaOfOrigin: user.lgaOfOrigin ?? "",
      nationality: user.nationality ?? "Nigeria",
      permanentAddress: user.permanentAddress ?? "",
      contactAddress: user.contactAddress ?? "",

      // ---- emergency ----
      nextOfKinName: user.nextOfKinName ?? "",
      nextOfKinRelationship: user.nextOfKinRelationship ?? "",
      nextOfKinPhone: user.nextOfKinPhone ?? "",
      nextOfKinAddress: user.nextOfKinAddress ?? "",

      // ---- student ----
      matricNumber: user.matricNumber ?? "",
      jambRegNumber: user.jambRegNumber ?? "",
      modeOfEntry: user.modeOfEntry ?? "",
      admissionYear: user.admissionYear ?? new Date().getFullYear(),
      currentLevel: user.currentLevel ?? 100,
      currentSemester: user.currentSemester ?? "",
      studyMode: user.studyMode ?? "",
      facultyId: user.facultyId ?? undefined,
      departmentId: user.departmentId ?? undefined,
      programmeId: user.programmeId ?? undefined,
      cgpa: Number(user.cgpa) ?? 0,
      totalCreditsEarned: user.totalCreditsEarned ?? 0,

      // ---- staff ----
      staffId: user.staffId ?? "",
      designation: user.designation ?? "",
      employmentDate: user.employmentDate ?? "",
      employmentType: user.employmentType ?? "",
      officeLocation: user.officeLocation ?? "",
      permissions: user.permissions ?? {},

      // ---- academic status ----
      isOnProbation: user.isOnProbation ?? false,
      probationReason: user.probationReason ?? "",
      isDeferred: user.isDeferred ?? false,
      defermentStartDate: user.defermentStartDate ?? "",
      defermentEndDate: user.defermentEndDate ?? "",
    },
    onSubmit: async ({ value }) => {
      // Build payload – only send fields that exist in the table
      const payload = {
        id: value.id,
        email: value.email,
        userType: value.userType,
        status: value.status,

        firstName: value.firstName,
        middleName: value.middleName,
        lastName: value.lastName,
        gender: value.gender,
        dateOfBirth: value.dateOfBirth,
        phoneNumber: value.phoneNumber,
        alternatePhone: value.alternatePhone,
        image: value.image,

        stateOfOrigin: value.stateOfOrigin,
        lgaOfOrigin: value.lgaOfOrigin,
        nationality: value.nationality,
        permanentAddress: value.permanentAddress,
        contactAddress: value.contactAddress,

        nextOfKinName: value.nextOfKinName,
        nextOfKinRelationship: value.nextOfKinRelationship,
        nextOfKinPhone: value.nextOfKinPhone,
        nextOfKinAddress: value.nextOfKinAddress,

        // ---- student ----
        ...(value.userType === "student" && {
          matricNumber: value.matricNumber,
          jambRegNumber: value.jambRegNumber,
          modeOfEntry: value.modeOfEntry,
          admissionYear: value.admissionYear,
          currentLevel: value.currentLevel,
          currentSemester: value.currentSemester,
          studyMode: value.studyMode,
          facultyId: value.facultyId,
          departmentId: value.departmentId,
          programmeId: value.programmeId,
          cgpa: Number(value.cgpa),
          totalCreditsEarned: value.totalCreditsEarned,
          isOnProbation: value.isOnProbation,
          probationReason: value.probationReason,
          isDeferred: value.isDeferred,
          defermentStartDate: value.defermentStartDate,
          defermentEndDate: value.defermentEndDate,
        }),

        // ---- staff ----
        ...(value.userType !== "student" && {
          staffId: value.staffId,
          designation: value.designation,
          employmentDate: value.employmentDate,
          employmentType: value.employmentType,
          officeLocation: value.officeLocation,
          permissions: value.permissions,
        }),
      };

      await mutateAsync(payload);
    },
  });

  const { mutateAsync, isPending } = useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: () => {
        toast.success("User updated successfully");
        form.reset();
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: orpc.users.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const FormField = ({
    name,
    label,
    required = false,
    children,
  }: {
    name: keyof typeof form.store.state.values;
    label: string;
    required?: boolean;
    children: (field: any) => React.ReactNode;
  }) => (
    <form.Field name={name}>
      {(field) => (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {children(field)}
        </div>
      )}
    </form.Field>
  );

  /* ---------------------------------------------------------------------- */
  /*                                 UI                                      */
  /* ---------------------------------------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-sm" variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 w-full overflow-auto h-240">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Update User</CardTitle>
            <CardDescription>
              Edit the user’s profile. Password is **not** changed here.
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
              {/* ------------------- Basic ------------------- */}
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="email" label="Email" required>
                    {(f) => (
                      <Input
                        type="email"
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="userType" label="User Type" required>
                    {(f) => (
                      <Select
                        value={f.state.value}
                        onValueChange={f.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>

                  <FormField name="status" label="Status">
                    {(f) => (
                      <Select
                        value={f.state.value}
                        onValueChange={f.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "active",
                            "suspended",
                            "graduated",
                            "withdrawn",
                            "deferred",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                </div>
              </section>

              {/* ------------------- Personal ------------------- */}
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="firstName" label="First Name" required>
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="middleName" label="Middle Name">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="lastName" label="Last Name" required>
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="gender" label="Gender" required>
                    {(f) => (
                      <Select
                        value={f.state.value}
                        onValueChange={f.handleChange}
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
                    {(f) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            {f.state.value
                              ? formatDateDisplay(f.state.value)
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              f.state.value
                                ? new Date(f.state.value)
                                : undefined
                            }
                            onSelect={(d) =>
                              f.handleChange(d ? formatDate(d) : "")
                            }
                            disabled={(d) =>
                              d > new Date() || d < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </FormField>

                  <FormField name="nationality" label="Nationality" required>
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="phoneNumber" label="Phone Number" required>
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                        placeholder="08012345678"
                      />
                    )}
                  </FormField>

                  <FormField name="alternatePhone" label="Alternate Phone">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>
                </div>
              </section>

              {/* ------------------- Address ------------------- */}
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="stateOfOrigin"
                    label="State of Origin"
                    required
                  >
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="lgaOfOrigin" label="LGA of Origin" required>
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField
                    name="permanentAddress"
                    label="Permanent Address"
                    required
                  >
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField
                    name="contactAddress"
                    label="Contact Address"
                    required
                  >
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>
                </div>
              </section>

              {/* ------------------- Next of Kin ------------------- */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="nextOfKinName" label="Name">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="nextOfKinRelationship" label="Relationship">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="nextOfKinPhone" label="Phone">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>

                  <FormField name="nextOfKinAddress" label="Address">
                    {(f) => (
                      <Input
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>
                </div>
              </section>

              {/* ------------------- Conditional Student ------------------- */}
              <form.Subscribe
                selector={(s) => [s.values.userType]}
                children={([type]) =>
                  type === "student" && (
                    <section>
                      <h3 className="text-lg font-semibold mb-3">
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="matricNumber" label="Matric Number">
                          {(f) => (
                            <Input
                              value={f.state.value}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </FormField>

                        <FormField name="jambRegNumber" label="JAMB Reg Number">
                          {(f) => (
                            <Input
                              value={f.state.value}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </FormField>

                        <FormField name="modeOfEntry" label="Mode of Entry">
                          {(f) => (
                            <Select
                              value={f.state.value}
                              onValueChange={f.handleChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utme">UTME</SelectItem>
                                <SelectItem value="de">Direct Entry</SelectItem>
                                <SelectItem value="transfer">
                                  Transfer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormField>

                        <FormField name="admissionYear" label="Admission Year">
                          {(f) => (
                            <Input
                              type="number"
                              value={f.state.value}
                              onChange={(e) =>
                                f.handleChange(Number(e.target.value))
                              }
                            />
                          )}
                        </FormField>

                        <FormField name="currentLevel" label="Current Level">
                          {(f) => (
                            <Select
                              value={String(f.state.value)}
                              onValueChange={(v) => f.handleChange(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {[100, 200, 300, 400, 500, 600].map((lvl) => (
                                  <SelectItem key={lvl} value={String(lvl)}>
                                    {lvl} Level
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormField>

                        <FormField name="studyMode" label="Study Mode">
                          {(f) => (
                            <Select
                              value={f.state.value}
                              onValueChange={f.handleChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  Full Time
                                </SelectItem>
                                <SelectItem value="part-time">
                                  Part Time
                                </SelectItem>
                                <SelectItem value="distance">
                                  Distance
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormField>
                      </div>
                    </section>
                  )
                }
              />

              {/* ------------------- Conditional Staff ------------------- */}
              <form.Subscribe
                selector={(s) => [s.values.userType]}
                children={([type]) =>
                  type !== "student" && (
                    <section>
                      <h3 className="text-lg font-semibold mb-3">
                        Staff Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="staffId" label="Staff ID">
                          {(f) => (
                            <Input
                              value={f.state.value}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </FormField>

                        <FormField name="designation" label="Designation">
                          {(f) => (
                            <Input
                              value={f.state.value}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </FormField>

                        <FormField
                          name="employmentType"
                          label="Employment Type"
                        >
                          {(f) => (
                            <Select
                              value={f.state.value}
                              onValueChange={f.handleChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  Full Time
                                </SelectItem>
                                <SelectItem value="part-time">
                                  Part Time
                                </SelectItem>
                                <SelectItem value="contract">
                                  Contract
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormField>

                        <FormField
                          name="officeLocation"
                          label="Office Location"
                        >
                          {(f) => (
                            <Input
                              value={f.state.value}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </FormField>
                      </div>
                    </section>
                  )
                }
              />

              {/* ------------------- Actions ------------------- */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={form.state.isSubmitting || isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={form.state.isSubmitting || isPending}
                >
                  {form.state.isSubmitting || isPending
                    ? "Updating..."
                    : "Update User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
