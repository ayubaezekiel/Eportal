import { protectedProcedure, publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import * as routers from "./routers";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  users: routers.usersRouter,
  faculties: routers.facultiesRouter,
  departments: routers.departmentsRouter,
  programmes: routers.programmesRouter,
  courses: routers.coursesRouter,
  courseAllocation: routers.courseAllocationRouter,
  courseRegistrations: routers.courseRegistrationsRouter,
  results: routers.resultsRouter,
  academicSessions: routers.academicSessionsRouter,
  feeStructures: routers.feeStructuresRouter,
  payments: routers.paymentsRouter,
  attendance: routers.attendanceRouter,
  hostels: routers.hostelsRouter,
  hostelRooms: routers.hostelRoomsRouter,
  hostelAllocations: routers.hostelAllocationsRouter,
  announcements: routers.announcementsRouter,
  notifications: routers.notificationsRouter,
  clearances: routers.clearancesRouter,
  documents: routers.documentsRouter,
  examinations: routers.examinationsRouter,
  examCards: routers.examCardsRouter,
  transcripts: routers.transcriptsRouter,
  certificates: routers.certificatesRouter,
  petitions: routers.petitionsRouter,
  senateDecisions: routers.senateDecisionsRouter,
  scholarships: routers.scholarshipsRouter,
  scholarshipApplications: routers.scholarshipApplicationsRouter,
  alumni: routers.alumniRouter,
  auditLogs: routers.auditLogsRouter,
  systemSettings: routers.systemSettingsRouter,
  roles: routers.rolesRouter,
  permissions: routers.permissionsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
