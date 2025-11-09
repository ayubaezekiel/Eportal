import { db } from "@Eportal/db";
import * as schema from "@Eportal/db/schema/school";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";

// Users Router
export const usersRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.user).orderBy(schema.user.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [record] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, input.id));
      return record;
    }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        userType: z.enum([
          "student",
          "lecturer",
          "admin",
          "hod",
          "dean",
          "registrar",
          "bursar",
        ]),
        firstName: z.string(),
        lastName: z.string(),
        gender: z.string(),
        dateOfBirth: z.string(),
        phoneNumber: z.string(),
        stateOfOrigin: z.string(),
        lgaOfOrigin: z.string(),
        permanentAddress: z.string(),
        contactAddress: z.string(),
        roleIds: z.array(z.string().uuid()).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { roleIds, ...userData } = input;
      const [newUser] = await db
        .insert(schema.user)
        .values(userData)
        .returning();

      if (roleIds?.length) {
        await db
          .insert(schema.userRoles)
          .values(
            roleIds.map((roleId) => ({ userId: `${newUser?.id}`, roleId }))
          );
      }

      return newUser;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        userType: z
          .enum([
            "student",
            "lecturer",
            "admin",
            "hod",
            "dean",
            "registrar",
            "bursar",
          ])
          .optional(),
        roleIds: z.array(z.string().uuid()).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, roleIds, ...updateData } = input;

      await db
        .update(schema.user)
        .set(updateData)
        .where(eq(schema.user.id, id));

      if (roleIds !== undefined) {
        await db
          .delete(schema.userRoles)
          .where(eq(schema.userRoles.userId, id));
        if (roleIds.length > 0) {
          await db
            .insert(schema.userRoles)
            .values(roleIds.map((roleId) => ({ userId: id, roleId })));
        }
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      await db.delete(schema.user).where(eq(schema.user.id, input.id));
      return { success: true };
    }),

  getRoles: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select({ role: schema.roles })
        .from(schema.userRoles)
        .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
        .where(eq(schema.userRoles.userId, input.userId));
    }),
};

// Faculties Router
export const facultiesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.faculties);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [faculty] = await db
        .select()
        .from(schema.faculties)
        .where(eq(schema.faculties.id, input.id));
      return faculty;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(200),
        code: z.string().max(20),
        description: z.string().optional(),
        deanId: z.string().uuid().optional(),
        establishedYear: z.number().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.faculties).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().max(200).optional(),
        code: z.string().max(20).optional(),
        description: z.string().optional(),
        deanId: z.string().uuid().optional(),
        establishedYear: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.faculties)
        .set(updateData)
        .where(eq(schema.faculties.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.faculties)
        .where(eq(schema.faculties.id, input.id));
    }),
};

// Departments Router
export const departmentsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.departments);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [department] = await db
        .select()
        .from(schema.departments)
        .where(eq(schema.departments.id, input.id));
      return department;
    }),
  create: protectedProcedure
    .input(
      z.object({
        facultyId: z.string().uuid(),
        name: z.string().max(200),
        code: z.string().max(20),
        description: z.string().optional(),
        hodId: z.string().uuid().optional(),
        establishedYear: z.number().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.departments).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        facultyId: z.string().uuid().optional(),
        name: z.string().max(200).optional(),
        code: z.string().max(20).optional(),
        description: z.string().optional(),
        hodId: z.string().uuid().optional(),
        establishedYear: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.departments)
        .set(updateData)
        .where(eq(schema.departments.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.departments)
        .where(eq(schema.departments.id, input.id));
    }),
};

// Programmes Router
export const programmesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.programmes);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [programme] = await db
        .select()
        .from(schema.programmes)
        .where(eq(schema.programmes.id, input.id));
      return programme;
    }),
  create: protectedProcedure
    .input(
      z.object({
        departmentId: z.string().uuid(),
        name: z.string().max(200),
        code: z.string().max(20),
        degreeType: z.string().max(50),
        durationYears: z.number(),
        minimumCredits: z.number(),
        description: z.string().optional(),
        coordinatorId: z.string().uuid().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.programmes).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        departmentId: z.string().uuid().optional(),
        name: z.string().max(200).optional(),
        code: z.string().max(20).optional(),
        degreeType: z.string().max(50).optional(),
        durationYears: z.number().optional(),
        minimumCredits: z.number().optional(),
        description: z.string().optional(),
        coordinatorId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.programmes)
        .set(updateData)
        .where(eq(schema.programmes.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.programmes)
        .where(eq(schema.programmes.id, input.id));
    }),
};

// Courses Router
export const coursesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.courses);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, input.id));
      return course;
    }),
  create: protectedProcedure
    .input(
      z.object({
        courseCode: z.string().max(20),
        courseTitle: z.string().max(255),
        creditUnits: z.number(),
        courseType: z.string().max(50),
        level: z.number(),
        semester: z.string().max(20),
        departmentId: z.string().uuid(),
        description: z.string().optional(),
        prerequisiteCourses: z.any().default([]),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.courses).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        courseCode: z.string().max(20).optional(),
        courseTitle: z.string().max(255).optional(),
        creditUnits: z.number().optional(),
        courseType: z.string().max(50).optional(),
        level: z.number().optional(),
        semester: z.string().max(20).optional(),
        departmentId: z.string().uuid().optional(),
        description: z.string().optional(),
        prerequisiteCourses: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.courses)
        .set(updateData)
        .where(eq(schema.courses.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.courses)
        .where(eq(schema.courses.id, input.id));
    }),
};

// Course Allocation Router
export const courseAllocationRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.courseAllocation);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [allocation] = await db
        .select()
        .from(schema.courseAllocation)
        .where(eq(schema.courseAllocation.id, input.id));
      return allocation;
    }),
  create: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        lecturerId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        role: z.string().max(50).default("Lecturer"),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.courseAllocation).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        courseId: z.string().uuid().optional(),
        lecturerId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        semester: z.string().max(20).optional(),
        role: z.string().max(50).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.courseAllocation)
        .set(updateData)
        .where(eq(schema.courseAllocation.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.courseAllocation)
        .where(eq(schema.courseAllocation.id, input.id));
    }),
};

// Course Registrations Router
export const courseRegistrationsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.courseRegistrations)
      .innerJoin(
        schema.courses,
        eq(schema.courseRegistrations.courseId, schema.courses.id)
      )
      .innerJoin(
        schema.user,
        eq(schema.courseRegistrations.studentId, schema.user.id)
      )
      .innerJoin(
        schema.academicSessions,
        eq(schema.courseRegistrations.sessionId, schema.academicSessions.id)
      )
      .orderBy(desc(schema.courseRegistrations.registrationDate));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [registration] = await db
        .select()
        .from(schema.courseRegistrations)
        .where(eq(schema.courseRegistrations.id, input.id))
        .innerJoin(
          schema.courses,
          eq(schema.courseRegistrations.courseId, schema.courses.id)
        )
        .innerJoin(
          schema.user,
          eq(schema.courseRegistrations.studentId, schema.user.id)
        )
        .innerJoin(
          schema.academicSessions,
          eq(schema.courseRegistrations.sessionId, schema.academicSessions.id)
        )
        .orderBy(desc(schema.courseRegistrations.registrationDate));

      return registration;
    }),

  getByStudent: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.courseRegistrations)
        .where(eq(schema.courseRegistrations.studentId, input.studentId))
        .innerJoin(
          schema.courses,
          eq(schema.courseRegistrations.courseId, schema.courses.id)
        )
        .innerJoin(
          schema.user,
          eq(schema.courseRegistrations.studentId, schema.user.id)
        )
        .innerJoin(
          schema.academicSessions,
          eq(schema.courseRegistrations.sessionId, schema.academicSessions.id)
        )
        .orderBy(desc(schema.courseRegistrations.registrationDate));
    }),

  getByStudentAndSession: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [
        eq(schema.courseRegistrations.studentId, input.studentId),
        eq(schema.courseRegistrations.sessionId, input.sessionId),
      ];

      if (input.semester) {
        conditions.push(
          eq(schema.courseRegistrations.semester, input.semester)
        );
      }

      return await db
        .select()
        .from(schema.courseRegistrations)
        .where(and(...conditions))
        .orderBy(desc(schema.courseRegistrations.registrationDate));
    }),

  getPendingApprovals: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.courseRegistrations)
      .where(eq(schema.courseRegistrations.status, "Pending"))
      .orderBy(desc(schema.courseRegistrations.registrationDate));
  }),

  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        courseId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        registrationType: z.string().max(50).default("Normal"),
        status: z.string().max(50).default("Pending"),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.courseRegistrations).values(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.string().max(50).optional(),
        adviserApproved: z.boolean().optional(),
        adviserApprovedBy: z.string().uuid().optional(),
        hodApproved: z.boolean().optional(),
        hodApprovedBy: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.courseRegistrations)
        .set(updateData)
        .where(eq(schema.courseRegistrations.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.courseRegistrations)
        .where(eq(schema.courseRegistrations.id, input.id));
    }),
};

// Results Router
export const resultsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.results)
      .leftJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .leftJoin(schema.user, eq(schema.results.studentId, schema.user.id))
      .leftJoin(
        schema.academicSessions,
        eq(schema.results.sessionId, schema.academicSessions.id)
      )
      .orderBy(desc(schema.results.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [result] = await db
        .select()
        .from(schema.results)
        .leftJoin(
          schema.courses,
          eq(schema.results.courseId, schema.courses.id)
        )
        .leftJoin(schema.user, eq(schema.results.studentId, schema.user.id))
        .leftJoin(
          schema.academicSessions,
          eq(schema.results.sessionId, schema.academicSessions.id)
        )
        .where(eq(schema.results.id, input.id));
      return result;
    }),

  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        courseId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        attendance: z.string().optional(),
        assignment: z.string().optional(),
        test1: z.string().optional(),
        test2: z.string().optional(),
        practical: z.string().optional(),
        caTotal: z.string().optional(),
        examScore: z.string().optional(),
        totalScore: z.string().optional(),
        grade: z.string().max(5).optional(),
        gradePoint: z.string().optional(),
        remark: z.string().max(50).optional(),
        status: z.string().max(50).default("Draft"),
        isCarryOver: z.boolean().default(false),
        attemptNumber: z.number().default(1),
      })
    )
    .handler(async ({ context, input }) => {
      return await db.insert(schema.results).values({
        ...input,
        uploadedBy: context.userId,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        attendance: z.string().optional(),
        assignment: z.string().optional(),
        test1: z.string().optional(),
        test2: z.string().optional(),
        practical: z.string().optional(),
        caTotal: z.string().optional(),
        examScore: z.string().optional(),
        totalScore: z.string().optional(),
        grade: z.string().max(5).optional(),
        gradePoint: z.string().optional(),
        remark: z.string().max(50).optional(),
        status: z.string().max(50).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.results)
        .set(updateData)
        .where(eq(schema.results.id, id));
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      return await db
        .update(schema.results)
        .set({
          status: "Approved",
          approvedBy: context.userId,
          approvedAt: new Date(),
        })
        .where(eq(schema.results.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.results)
        .where(eq(schema.results.id, input.id));
    }),

  getByStudent: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.results)
        .leftJoin(
          schema.courses,
          eq(schema.results.courseId, schema.courses.id)
        )
        .leftJoin(schema.user, eq(schema.results.studentId, schema.user.id))
        .leftJoin(
          schema.academicSessions,
          eq(schema.results.sessionId, schema.academicSessions.id)
        )
        .where(eq(schema.results.studentId, input.studentId))
        .orderBy(desc(schema.results.createdAt));
    }),
};

// Academic Sessions Router
export const academicSessionsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.academicSessions)
      .orderBy(desc(schema.academicSessions.startDate));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [session] = await db
        .select()
        .from(schema.academicSessions)
        .where(eq(schema.academicSessions.id, input.id));
      return session;
    }),

  getCurrent: protectedProcedure.handler(async () => {
    const [currentSession] = await db
      .select()
      .from(schema.academicSessions)
      .where(eq(schema.academicSessions.isCurrent, true));
    return currentSession;
  }),

  getActive: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.academicSessions)
      .where(eq(schema.academicSessions.isActive, true))
      .orderBy(desc(schema.academicSessions.startDate));
  }),

  create: protectedProcedure
    .input(
      z.object({
        sessionName: z.string().max(50),
        startDate: z.string(),
        endDate: z.string(),
        isCurrent: z.boolean().default(false),
        isActive: z.boolean().default(true),
        firstSemesterStart: z.string().optional(),
        firstSemesterEnd: z.string().optional(),
        secondSemesterStart: z.string().optional(),
        secondSemesterEnd: z.string().optional(),
        courseRegStartFirst: z.string().optional(),
        courseRegEndFirst: z.string().optional(),
        courseRegStartSecond: z.string().optional(),
        courseRegEndSecond: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.academicSessions).values(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sessionName: z.string().max(50).optional(),
        isCurrent: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.academicSessions)
        .set(updateData)
        .where(eq(schema.academicSessions.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.academicSessions)
        .where(eq(schema.academicSessions.id, input.id));
    }),
};
// Fee Structures Router
export const feeStructuresRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.feeStructures);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [feeStructure] = await db
        .select()
        .from(schema.feeStructures)
        .where(eq(schema.feeStructures.id, input.id));
      return feeStructure;
    }),
  create: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        programmeId: z.string().uuid(),
        level: z.number(),
        studyMode: z.string().max(50),
        tuitionFee: z.string(),
        developmentLevy: z.string().optional(),
        libraryFee: z.string().optional(),
        sportsFee: z.string().optional(),
        medicalFee: z.string().optional(),
        examFee: z.string().optional(),
        technologyFee: z.string().optional(),
        departmentalDues: z.string().optional(),
        facultyDues: z.string().optional(),
        otherCharges: z.any().default({}),
        totalAmount: z.string(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.feeStructures).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sessionId: z.string().uuid().optional(),
        programmeId: z.string().uuid().optional(),
        level: z.number().optional(),
        studyMode: z.string().max(50).optional(),
        tuitionFee: z.string().optional(),
        developmentLevy: z.string().optional(),
        libraryFee: z.string().optional(),
        sportsFee: z.string().optional(),
        medicalFee: z.string().optional(),
        examFee: z.string().optional(),
        technologyFee: z.string().optional(),
        departmentalDues: z.string().optional(),
        facultyDues: z.string().optional(),
        otherCharges: z.any().optional(),
        totalAmount: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.feeStructures)
        .set(updateData)
        .where(eq(schema.feeStructures.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.feeStructures)
        .where(eq(schema.feeStructures.id, input.id));
    }),
};

// Payments Router
export const paymentsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.payments)
      .orderBy(desc(schema.payments.paymentDate));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [payment] = await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.id, input.id));
      return payment;
    }),

  getByStudent: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.studentId, input.studentId))
        .orderBy(desc(schema.payments.paymentDate));
    }),

  getBySession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.sessionId, input.sessionId))
        .orderBy(desc(schema.payments.paymentDate));
    }),

  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.status, input.status))
        .orderBy(desc(schema.payments.paymentDate));
    }),

  getRecentPayments: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.payments)
        .orderBy(desc(schema.payments.paymentDate))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        sessionId: z.string(),
        referenceNumber: z.string().max(100),
        amount: z.string(),
        paymentType: z.string().max(50),
        paymentMethod: z.string().max(50),
        paymentChannel: z.string().max(100).optional(),
        transactionReference: z.string().max(255).optional(),
        rrr: z.string().max(50).optional(),
        bankName: z.string().max(100).optional(),
        tellerNumber: z.string().max(50).optional(),
        status: z.string().max(50).default("Pending"),
        paymentDate: z.string().transform((val) => new Date(val)),
        confirmedAt: z
          .string()
          .transform((val) => new Date(val))
          .optional(),
        confirmedBy: z.string().uuid().optional(),
        receiptNumber: z.string().max(100).optional(),
        receiptUrl: z.string().optional(),
        description: z.string().optional(),
        metadata: z.any().default({}),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.payments).values(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.string().max(50).optional(),
        confirmedAt: z
          .string()
          .transform((val) => new Date(val))
          .optional(),
        confirmedBy: z.string().uuid().optional(),
        receiptNumber: z.string().max(100).optional(),
        receiptUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.payments)
        .set(updateData)
        .where(eq(schema.payments.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.payments)
        .where(eq(schema.payments.id, input.id));
    }),
};

// Attendance Router
export const attendanceRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.attendance);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [att] = await db
        .select()
        .from(schema.attendance)
        .where(eq(schema.attendance.id, input.id));
      return att;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        courseId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        attendanceDate: z.string(),
        status: z.string().max(20),
        markedBy: z.string().uuid(),
        remarks: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.attendance).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        courseId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        semester: z.string().max(20).optional(),
        attendanceDate: z.string().optional(),
        status: z.string().max(20).optional(),
        markedBy: z.string().uuid().optional(),
        remarks: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.attendance)
        .set(updateData)
        .where(eq(schema.attendance.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.attendance)
        .where(eq(schema.attendance.id, input.id));
    }),
};

// Hostels Router
export const hostelsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.hostels);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [hostel] = await db
        .select()
        .from(schema.hostels)
        .where(eq(schema.hostels.id, input.id));
      return hostel;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(200),
        hostelType: z.string().max(50),
        location: z.string().max(255).optional(),
        totalRooms: z.number(),
        totalBeds: z.number(),
        availableBeds: z.number(),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.hostels).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().max(200).optional(),
        hostelType: z.string().max(50).optional(),
        location: z.string().max(255).optional(),
        totalRooms: z.number().optional(),
        totalBeds: z.number().optional(),
        availableBeds: z.number().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.hostels)
        .set(updateData)
        .where(eq(schema.hostels.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.hostels)
        .where(eq(schema.hostels.id, input.id));
    }),
};

// Hostel Rooms Router
export const hostelRoomsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.hostelRooms);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [room] = await db
        .select()
        .from(schema.hostelRooms)
        .where(eq(schema.hostelRooms.id, input.id));
      return room;
    }),
  create: protectedProcedure
    .input(
      z.object({
        hostelId: z.string().uuid(),
        roomNumber: z.string().max(50),
        capacity: z.number(),
        occupiedBeds: z.number().default(0),
        roomType: z.string().max(50).optional(),
        facilities: z.any().default([]),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.hostelRooms).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        hostelId: z.string().uuid().optional(),
        roomNumber: z.string().max(50).optional(),
        capacity: z.number().optional(),
        occupiedBeds: z.number().optional(),
        roomType: z.string().max(50).optional(),
        facilities: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.hostelRooms)
        .set(updateData)
        .where(eq(schema.hostelRooms.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.hostelRooms)
        .where(eq(schema.hostelRooms.id, input.id));
    }),
};

// Hostel Allocations Router
export const hostelAllocationsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.hostelAllocations);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [allocation] = await db
        .select()
        .from(schema.hostelAllocations)
        .where(eq(schema.hostelAllocations.id, input.id));
      return allocation;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        hostelId: z.string().uuid(),
        roomId: z.string().uuid(),
        sessionId: z.string().uuid(),
        allocationDate: z.string(),
        expiryDate: z.string().optional(),
        bedSpace: z.string().max(20).optional(),
        status: z.string().max(50).default("Active"),
        approvedBy: z.string().uuid().optional(),
        approvedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.hostelAllocations).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        hostelId: z.string().uuid().optional(),
        roomId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        allocationDate: z.string().optional(),
        expiryDate: z.string().optional(),
        bedSpace: z.string().max(20).optional(),
        status: z.string().max(50).optional(),
        approvedBy: z.string().uuid().optional(),
        approvedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.hostelAllocations)
        .set(updateData)
        .where(eq(schema.hostelAllocations.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.hostelAllocations)
        .where(eq(schema.hostelAllocations.id, input.id));
    }),
};

// Announcements Router
export const announcementsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.announcements);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [announcement] = await db
        .select()
        .from(schema.announcements)
        .where(eq(schema.announcements.id, input.id));
      return announcement;
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().max(255),
        content: z.string(),
        category: z.string().max(50),
        priority: z.string().max(50).default("Normal"),
        targetAudience: z.any().default([]),
        targetFaculties: z.any().default([]),
        targetDepartments: z.any().default([]),
        targetLevels: z.any().default([]),
        attachments: z.any().default([]),
        publishDate: z.date(),
        expiryDate: z.date().optional(),
        isPinned: z.boolean().default(false),
        isActive: z.boolean().default(true),
        publishedBy: z.string().uuid(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.announcements).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(255).optional(),
        content: z.string().optional(),
        category: z.string().max(50).optional(),
        priority: z.string().max(50).optional(),
        targetAudience: z.any().optional(),
        targetFaculties: z.any().optional(),
        targetDepartments: z.any().optional(),
        targetLevels: z.any().optional(),
        attachments: z.any().optional(),
        publishDate: z.date().optional(),
        expiryDate: z.date().optional(),
        isPinned: z.boolean().optional(),
        isActive: z.boolean().optional(),
        publishedBy: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.announcements)
        .set(updateData)
        .where(eq(schema.announcements.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.announcements)
        .where(eq(schema.announcements.id, input.id));
    }),
};

// Clearances Router
export const clearancesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.clearances);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [clearance] = await db
        .select()
        .from(schema.clearances)
        .where(eq(schema.clearances.id, input.id));
      return clearance;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        sessionId: z.string().uuid(),
        clearanceType: z.string().max(50),
        bursaryCleared: z.boolean().default(false),
        bursaryClearedBy: z.string().uuid().optional(),
        bursaryClearedAt: z.date().optional(),
        bursaryRemarks: z.string().optional(),
        libraryCleared: z.boolean().default(false),
        libraryClearedBy: z.string().uuid().optional(),
        libraryClearedAt: z.date().optional(),
        libraryRemarks: z.string().optional(),
        hostelCleared: z.boolean().default(false),
        hostelClearedBy: z.string().uuid().optional(),
        hostelClearedAt: z.date().optional(),
        hostelRemarks: z.string().optional(),
        departmentCleared: z.boolean().default(false),
        departmentClearedBy: z.string().uuid().optional(),
        departmentClearedAt: z.date().optional(),
        departmentRemarks: z.string().optional(),
        facultyCleared: z.boolean().default(false),
        facultyClearedBy: z.string().uuid().optional(),
        facultyClearedAt: z.date().optional(),
        facultyRemarks: z.string().optional(),
        status: z.string().max(50).default("Pending"),
        completedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.clearances).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        clearanceType: z.string().max(50).optional(),
        bursaryCleared: z.boolean().optional(),
        bursaryClearedBy: z.string().uuid().optional(),
        bursaryClearedAt: z.date().optional(),
        bursaryRemarks: z.string().optional(),
        libraryCleared: z.boolean().optional(),
        libraryClearedBy: z.string().uuid().optional(),
        libraryClearedAt: z.date().optional(),
        libraryRemarks: z.string().optional(),
        hostelCleared: z.boolean().optional(),
        hostelClearedBy: z.string().uuid().optional(),
        hostelClearedAt: z.date().optional(),
        hostelRemarks: z.string().optional(),
        departmentCleared: z.boolean().optional(),
        departmentClearedBy: z.string().uuid().optional(),
        departmentClearedAt: z.date().optional(),
        departmentRemarks: z.string().optional(),
        facultyCleared: z.boolean().optional(),
        facultyClearedBy: z.string().uuid().optional(),
        facultyClearedAt: z.date().optional(),
        facultyRemarks: z.string().optional(),
        status: z.string().max(50).optional(),
        completedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.clearances)
        .set(updateData)
        .where(eq(schema.clearances.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.clearances)
        .where(eq(schema.clearances.id, input.id));
    }),
};

// Documents Router
export const documentsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.documents);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [document] = await db
        .select()
        .from(schema.documents)
        .where(eq(schema.documents.id, input.id));
      return document;
    }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        documentType: z.string().max(100),
        documentName: z.string().max(255),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().max(100).optional(),
        isVerified: z.boolean().default(false),
        verifiedBy: z.string().uuid().optional(),
        verifiedAt: z.date().optional(),
        verificationStatus: z.string().max(50).default("Pending"),
        rejectionReason: z.string().optional(),
        expiryDate: z.string().optional(),
        metadata: z.any().default({}),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.documents).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        userId: z.string().uuid().optional(),
        documentType: z.string().max(100).optional(),
        documentName: z.string().max(255).optional(),
        fileUrl: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().max(100).optional(),
        isVerified: z.boolean().optional(),
        verifiedBy: z.string().uuid().optional(),
        verifiedAt: z.date().optional(),
        verificationStatus: z.string().max(50).optional(),
        rejectionReason: z.string().optional(),
        expiryDate: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.documents)
        .set(updateData)
        .where(eq(schema.documents.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.documents)
        .where(eq(schema.documents.id, input.id));
    }),
};

// Examinations Router
export const examinationsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.examinations);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [exam] = await db
        .select()
        .from(schema.examinations)
        .where(eq(schema.examinations.id, input.id));
      return exam;
    }),
  create: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        examDate: z.string(),
        startTime: z.string().max(10),
        endTime: z.string().max(10),
        duration: z.number(),
        venue: z.string().max(200),
        examType: z.string().max(50),
        maxScore: z.string(),
        instructions: z.string().optional(),
        invigilators: z.any().default([]),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.examinations).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        courseId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        semester: z.string().max(20).optional(),
        examDate: z.string().optional(),
        startTime: z.string().max(10).optional(),
        endTime: z.string().max(10).optional(),
        duration: z.number().optional(),
        venue: z.string().max(200).optional(),
        examType: z.string().max(50).optional(),
        maxScore: z.string().optional(),
        instructions: z.string().optional(),
        invigilators: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.examinations)
        .set(updateData)
        .where(eq(schema.examinations.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.examinations)
        .where(eq(schema.examinations.id, input.id));
    }),
};

// Exam Cards Router
export const examCardsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.examCards);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [card] = await db
        .select()
        .from(schema.examCards)
        .where(eq(schema.examCards.id, input.id));
      return card;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        sessionId: z.string().uuid(),
        semester: z.string().max(20),
        cardNumber: z.string().max(50),
        issuedDate: z.string(),
        expiryDate: z.string(),
        status: z.string().max(50).default("Active"),
        issuedBy: z.string().uuid(),
        qrCode: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.examCards).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        semester: z.string().max(20).optional(),
        cardNumber: z.string().max(50).optional(),
        issuedDate: z.string().optional(),
        expiryDate: z.string().optional(),
        status: z.string().max(50).optional(),
        issuedBy: z.string().uuid().optional(),
        qrCode: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.examCards)
        .set(updateData)
        .where(eq(schema.examCards.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.examCards)
        .where(eq(schema.examCards.id, input.id));
    }),
};

// Transcripts Router
export const transcriptsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.transcripts);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [transcript] = await db
        .select()
        .from(schema.transcripts)
        .where(eq(schema.transcripts.id, input.id));
      return transcript;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        transcriptNumber: z.string().max(100),
        requestDate: z.string(),
        purpose: z.string().optional(),
        destinationAddress: z.string().optional(),
        status: z.string().max(50).default("Pending"),
        processedBy: z.string().uuid().optional(),
        processedAt: z.date().optional(),
        verifiedBy: z.string().uuid().optional(),
        verifiedAt: z.date().optional(),
        collectedBy: z.string().max(255).optional(),
        collectionDate: z.string().optional(),
        collectorIdType: z.string().max(50).optional(),
        collectorIdNumber: z.string().max(100).optional(),
        feeAmount: z.string().optional(),
        feePaid: z.boolean().default(false),
        paymentId: z.string().uuid().optional(),
        remarks: z.string().optional(),
        fileUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.transcripts).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        transcriptNumber: z.string().max(100).optional(),
        requestDate: z.string().optional(),
        purpose: z.string().optional(),
        destinationAddress: z.string().optional(),
        status: z.string().max(50).optional(),
        processedBy: z.string().uuid().optional(),
        processedAt: z.date().optional(),
        verifiedBy: z.string().uuid().optional(),
        verifiedAt: z.date().optional(),
        collectedBy: z.string().max(255).optional(),
        collectionDate: z.string().optional(),
        collectorIdType: z.string().max(50).optional(),
        collectorIdNumber: z.string().max(100).optional(),
        feeAmount: z.string().optional(),
        feePaid: z.boolean().optional(),
        paymentId: z.string().uuid().optional(),
        remarks: z.string().optional(),
        fileUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.transcripts)
        .set(updateData)
        .where(eq(schema.transcripts.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.transcripts)
        .where(eq(schema.transcripts.id, input.id));
    }),
};

// Certificates Router
export const certificatesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.certificates);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [certificate] = await db
        .select()
        .from(schema.certificates)
        .where(eq(schema.certificates.id, input.id));
      return certificate;
    }),
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        certificateType: z.string().max(100),
        certificateNumber: z.string().max(100),
        programmeId: z.string().uuid(),
        degreeClass: z.string().max(50).optional(),
        cgpa: z.string(),
        graduationDate: z.string().optional(),
        issuedDate: z.string().optional(),
        issuedBy: z.string().uuid().optional(),
        status: z.string().max(50).default("Pending"),
        verificationCode: z.string().max(100).optional(),
        fileUrl: z.string().optional(),
        remarks: z.string().optional(),
        metadata: z.any().default({}),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.certificates).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid().optional(),
        certificateType: z.string().max(100).optional(),
        certificateNumber: z.string().max(100).optional(),
        programmeId: z.string().uuid().optional(),
        degreeClass: z.string().max(50).optional(),
        cgpa: z.string().optional(),
        graduationDate: z.string().optional(),
        issuedDate: z.string().optional(),
        issuedBy: z.string().uuid().optional(),
        status: z.string().max(50).optional(),
        verificationCode: z.string().max(100).optional(),
        fileUrl: z.string().optional(),
        remarks: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.certificates)
        .set(updateData)
        .where(eq(schema.certificates.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.certificates)
        .where(eq(schema.certificates.id, input.id));
    }),
};

// Petitions Router
export const petitionsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.petitions)
      .orderBy(desc(schema.petitions.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [petition] = await db
        .select()
        .from(schema.petitions)
        .where(eq(schema.petitions.id, input.id));
      return petition;
    }),

  getByStudent: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.petitions)
        .where(eq(schema.petitions.studentId, input.studentId))
        .orderBy(desc(schema.petitions.createdAt));
    }),

  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.petitions)
        .where(eq(schema.petitions.status, input.status))
        .orderBy(desc(schema.petitions.createdAt));
    }),

  getPending: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.petitions)
      .where(eq(schema.petitions.status, "Pending"))
      .orderBy(desc(schema.petitions.createdAt));
  }),

  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        petitionType: z.string().max(100),
        subject: z.string().max(255),
        description: z.string(),
        courseId: z.string().uuid().optional(),
        sessionId: z.string().uuid().optional(),
        attachments: z.any().default([]),
        status: z.string().max(50).default("Pending"),
        priority: z.string().max(50).default("Normal"),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.petitions).values(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.string().max(50).optional(),
        assignedTo: z.string().uuid().optional(),
        resolution: z.string().optional(),
        resolvedBy: z.string().uuid().optional(),
        remarks: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.petitions)
        .set(updateData)
        .where(eq(schema.petitions.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.petitions)
        .where(eq(schema.petitions.id, input.id));
    }),
};

// Senate Decisions Router
export const senateDecisionsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.senateDecisions);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [decision] = await db
        .select()
        .from(schema.senateDecisions)
        .where(eq(schema.senateDecisions.id, input.id));
      return decision;
    }),
  create: protectedProcedure
    .input(
      z.object({
        meetingDate: z.string(),
        decisionNumber: z.string().max(100),
        title: z.string().max(255),
        description: z.string(),
        decisionType: z.string().max(100).optional(),
        affectedStudents: z.any().default([]),
        affectedDepartments: z.any().default([]),
        status: z.string().max(50).default("Active"),
        effectiveDate: z.string().optional(),
        documentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.senateDecisions).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        meetingDate: z.string().optional(),
        decisionNumber: z.string().max(100).optional(),
        title: z.string().max(255).optional(),
        description: z.string().optional(),
        decisionType: z.string().max(100).optional(),
        affectedStudents: z.any().optional(),
        affectedDepartments: z.any().optional(),
        status: z.string().max(50).optional(),
        effectiveDate: z.string().optional(),
        documentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.senateDecisions)
        .set(updateData)
        .where(eq(schema.senateDecisions.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.senateDecisions)
        .where(eq(schema.senateDecisions.id, input.id));
    }),
};

// Scholarships Router
export const scholarshipsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.scholarships);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [scholarship] = await db
        .select()
        .from(schema.scholarships)
        .where(eq(schema.scholarships.id, input.id));
      return scholarship;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(255),
        description: z.string().optional(),
        sponsor: z.string().max(255).optional(),
        amount: z.string(),
        scholarshipType: z.string().max(100).optional(),
        minCgpa: z.string().optional(),
        eligibleLevels: z.any().default([]),
        eligibleDepartments: z.any().default([]),
        sessionId: z.string().uuid(),
        numberOfSlots: z.number().optional(),
        availableSlots: z.number().optional(),
        applicationStartDate: z.string().optional(),
        applicationEndDate: z.string().optional(),
        status: z.string().max(50).default("Active"),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.scholarships).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().max(255).optional(),
        description: z.string().optional(),
        sponsor: z.string().max(255).optional(),
        amount: z.string().optional(),
        scholarshipType: z.string().max(100).optional(),
        minCgpa: z.string().optional(),
        eligibleLevels: z.any().optional(),
        eligibleDepartments: z.any().optional(),
        sessionId: z.string().uuid().optional(),
        numberOfSlots: z.number().optional(),
        availableSlots: z.number().optional(),
        applicationStartDate: z.string().optional(),
        applicationEndDate: z.string().optional(),
        status: z.string().max(50).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.scholarships)
        .set(updateData)
        .where(eq(schema.scholarships.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.scholarships)
        .where(eq(schema.scholarships.id, input.id));
    }),
};

// Scholarship Applications Router
export const scholarshipApplicationsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.scholarshipApplications);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [application] = await db
        .select()
        .from(schema.scholarshipApplications)
        .where(eq(schema.scholarshipApplications.id, input.id));
      return application;
    }),
  create: protectedProcedure
    .input(
      z.object({
        scholarshipId: z.string().uuid(),
        studentId: z.string().uuid(),
        applicationDate: z.string(),
        statement: z.string().optional(),
        supportingDocuments: z.any().default([]),
        status: z.string().max(50).default("Pending"),
        reviewedBy: z.string().uuid().optional(),
        reviewedAt: z.date().optional(),
        reviewComments: z.string().optional(),
        approvedBy: z.string().uuid().optional(),
        approvedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.scholarshipApplications).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        scholarshipId: z.string().uuid().optional(),
        studentId: z.string().uuid().optional(),
        applicationDate: z.string().optional(),
        statement: z.string().optional(),
        supportingDocuments: z.any().optional(),
        status: z.string().max(50).optional(),
        reviewedBy: z.string().uuid().optional(),
        reviewedAt: z.date().optional(),
        reviewComments: z.string().optional(),
        approvedBy: z.string().uuid().optional(),
        approvedAt: z.date().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.scholarshipApplications)
        .set(updateData)
        .where(eq(schema.scholarshipApplications.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.scholarshipApplications)
        .where(eq(schema.scholarshipApplications.id, input.id));
    }),
};

// Alumni Router
export const alumniRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.alumni);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [alum] = await db
        .select()
        .from(schema.alumni)
        .where(eq(schema.alumni.id, input.id));
      return alum;
    }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        graduationYear: z.number(),
        degreeObtained: z.string().max(100),
        degreeClass: z.string().max(50).optional(),
        finalCgpa: z.string().optional(),
        currentEmployer: z.string().max(255).optional(),
        currentPosition: z.string().max(255).optional(),
        industry: z.string().max(100).optional(),
        workEmail: z.string().max(255).optional(),
        willingToMentor: z.boolean().default(false),
        interestedInRecruitment: z.boolean().default(false),
        linkedinUrl: z.string().max(255).optional(),
        achievements: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.alumni).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        userId: z.string().uuid().optional(),
        graduationYear: z.number().optional(),
        degreeObtained: z.string().max(100).optional(),
        degreeClass: z.string().max(50).optional(),
        finalCgpa: z.string().optional(),
        currentEmployer: z.string().max(255).optional(),
        currentPosition: z.string().max(255).optional(),
        industry: z.string().max(100).optional(),
        workEmail: z.string().max(255).optional(),
        willingToMentor: z.boolean().optional(),
        interestedInRecruitment: z.boolean().optional(),
        linkedinUrl: z.string().max(255).optional(),
        achievements: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.alumni)
        .set(updateData)
        .where(eq(schema.alumni.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.alumni)
        .where(eq(schema.alumni.id, input.id));
    }),
};

// Audit Logs Router (read-only)
export const auditLogsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.auditLogs);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [log] = await db
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.id, input.id));
      return log;
    }),
};

// System Settings Router
export const systemSettingsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.systemSettings);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [setting] = await db
        .select()
        .from(schema.systemSettings)
        .where(eq(schema.systemSettings.id, input.id));
      return setting;
    }),
  create: protectedProcedure
    .input(
      z.object({
        settingKey: z.string().max(100),
        settingValue: z.string(),
        settingType: z.string().max(50),
        description: z.string().optional(),
        category: z.string().max(50).optional(),
        isPublic: z.boolean().default(false),
        updatedBy: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.systemSettings).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        settingKey: z.string().max(100).optional(),
        settingValue: z.string().optional(),
        settingType: z.string().max(50).optional(),
        description: z.string().optional(),
        category: z.string().max(50).optional(),
        isPublic: z.boolean().optional(),
        updatedBy: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.systemSettings)
        .set(updateData)
        .where(eq(schema.systemSettings.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.systemSettings)
        .where(eq(schema.systemSettings.id, input.id));
    }),
};

// Notifications Router
export const notificationsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db
      .select()
      .from(schema.notifications)
      .orderBy(desc(schema.notifications.createdAt));
  }),
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, input.userId))
        .orderBy(desc(schema.notifications.createdAt));
    }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        title: z.string().max(255),
        message: z.string(),
        type: z.string().max(50),
        category: z.string().max(50).optional(),
        actionUrl: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await db.insert(schema.notifications).values(input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(255).optional(),
        message: z.string().optional(),
        type: z.string().max(50).optional(),
        category: z.string().max(50).optional(),
        actionUrl: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(schema.notifications)
        .set(updateData)
        .where(eq(schema.notifications.id, id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .delete(schema.notifications)
        .where(eq(schema.notifications.id, input.id));
    }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .update(schema.notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(schema.notifications.id, input.id));
    }),
  markAllAsRead: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .handler(async ({ input }) => {
      return await db
        .update(schema.notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(schema.notifications.userId, input.userId),
            eq(schema.notifications.isRead, false)
          )
        );
    }),
};

export const rolesRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.roles);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        permissionIds: z.array(z.string().uuid()),
      })
    )
    .handler(async ({ input }) => {
      const { permissionIds, ...roleData } = input;
      const [role] = await db.insert(schema.roles).values(roleData).returning();

      if (permissionIds.length > 0) {
        await db.insert(schema.rolePermissions).values(
          permissionIds.map((pid) => ({
            roleId: role.id,
            permissionId: pid,
          }))
        );
      }

      return role;
    }),

  updatePermissions: protectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        permissionIds: z.array(z.string().uuid()),
      })
    )
    .handler(async ({ input }) => {
      const { roleId, permissionIds } = input;

      await db
        .delete(schema.rolePermissions)
        .where(eq(schema.rolePermissions.roleId, roleId));
      if (permissionIds.length > 0) {
        await db
          .insert(schema.rolePermissions)
          .values(permissionIds.map((pid) => ({ roleId, permissionId: pid })));
      }

      return { success: true };
    }),
};

export const permissionsRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(schema.permissions);
  }),
};
