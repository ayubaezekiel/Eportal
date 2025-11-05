import { orpc } from "@/utils/orpc";
import {
  createFormHook,
  createFormHookContexts,
  type AnyFieldApi,
} from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    StudentField,
    FacultyField,
    DepartmentField,
    ProgrammeField,
    CourseField,
    AcademicSessionField,
    LecturerField,
    HostelField,
    HostelRoomField,
    SemesterField,
  },
  formComponents: {},
});

export function FieldError({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-sm text-red-500">
          {field.state.meta.errors[0].message}
        </p>
      ) : null}
    </>
  );
}

export function StudentField() {
  const { data: students, isPending: isStudentsPending } = useQuery(
    orpc.users.getByUserType.queryOptions({ input: { userType: "student" } })
  );
  const field = useFieldContext<string>();
  return (
    <div>
      <Label className="mb-2">
        Matric/ADM No. <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isStudentsPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isStudentsPending ? "Loading..." : "Select student"}
          />
        </SelectTrigger>
        <SelectContent>
          {students?.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {`${s.matricNumber} - ${s.firstName} ${s.lastName}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 2. FacultyField — direct copy
// ================================================================
export function FacultyField() {
  const { data: faculties, isPending } = useQuery(
    orpc.faculties.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Faculty <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select faculty"}
          />
        </SelectTrigger>
        <SelectContent>
          {faculties?.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {`${f.code} - ${f.name}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 3. DepartmentField
// ================================================================
export function DepartmentField() {
  const { data: departments, isPending } = useQuery(
    orpc.departments.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Department <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select department"}
          />
        </SelectTrigger>
        <SelectContent>
          {departments?.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {`${d.code} - ${d.name}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 4. ProgrammeField
// ================================================================
export function ProgrammeField() {
  const { data: programmes, isPending } = useQuery(
    orpc.programmes.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Programme <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select programme"}
          />
        </SelectTrigger>
        <SelectContent>
          {programmes?.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {`${p.code} - ${p.name}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 5. CourseField
// ================================================================
export function CourseField() {
  const { data: courses, isPending } = useQuery(
    orpc.courses.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Course <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select course"}
          />
        </SelectTrigger>
        <SelectContent>
          {courses?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {`${c.courseCode} - ${c.courseTitle}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 6. AcademicSessionField
// ================================================================
export function AcademicSessionField() {
  const { data: sessions, isPending } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Academic Session <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select session"}
          />
        </SelectTrigger>
        <SelectContent>
          {sessions?.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.sessionName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 7. LecturerField (userType = lecturer)
// ================================================================
export function LecturerField() {
  const { data: lecturers, isPending } = useQuery(
    orpc.users.getByUserType.queryOptions({ input: { userType: "lecturer" } })
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Lecturer <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select lecturer"}
          />
        </SelectTrigger>
        <SelectContent>
          {lecturers?.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {`${l.staffId ?? ""} - ${l.firstName} ${l.lastName}`.trim()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 8. HostelField
// ================================================================
export function HostelField() {
  const { data: hostels, isPending } = useQuery(
    orpc.hostels.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Hostel <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isPending ? "Loading..." : "Select hostel"}
          />
        </SelectTrigger>
        <SelectContent>
          {hostels?.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {`${h.name} (${h.hostelType})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

// ================================================================
// 9. HostelRoomField
// ================================================================
export function HostelRoomField() {
  const { data: rooms, isPending } = useQuery(
    orpc.hostelRooms.getAll.queryOptions()
  );

  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Room <span className="text-red-500">*</span>
      </Label>
      <Select
        disabled={isPending}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isPending ? "Loading..." : "Select room"} />
        </SelectTrigger>
        <SelectContent>
          {rooms?.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {`${r.roomNumber} – ${r.capacity} bed(s)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}

export function SemesterField() {
  const field = useFieldContext<string>();

  return (
    <div>
      <Label className="mb-2">
        Semester <span className="text-red-500">*</span>
      </Label>
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select semester" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"First"}>First</SelectItem>
          <SelectItem value={"Second"}>Second</SelectItem>
        </SelectContent>
      </Select>
      <FieldError field={field} />
    </div>
  );
}
