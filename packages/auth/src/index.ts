import { db } from "@Eportal/db";
import * as schema from "@Eportal/db/schema/school";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  user: {
    additionalFields: {
      // User Type & Status
      userType: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: true,
      },
      // Personal Information
      firstName: {
        type: "string",
        required: true,
        input: true,
      },
      middleName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: true,
        input: true,
      },
      gender: {
        type: "string",
        required: true,
        input: true,
      },
      dateOfBirth: {
        type: "string",
        required: true,
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: true,
        input: true,
      },
      alternatePhone: {
        type: "string",
        required: false,
        input: true,
      },
      // Address Information
      stateOfOrigin: {
        type: "string",
        required: true,
        input: true,
      },
      lgaOfOrigin: {
        type: "string",
        required: true,
        input: true,
      },
      nationality: {
        type: "string",
        required: false,
        defaultValue: "Nigeria",
        input: true,
      },
      permanentAddress: {
        type: "string",
        required: true,
        input: true,
      },
      contactAddress: {
        type: "string",
        required: true,
        input: true,
      },
      // Emergency Contact
      nextOfKinName: {
        type: "string",
        required: false,
        input: true,
      },
      nextOfKinRelationship: {
        type: "string",
        required: false,
        input: true,
      },
      nextOfKinPhone: {
        type: "string",
        required: false,
        input: true,
      },
      nextOfKinAddress: {
        type: "string",
        required: false,
        input: true,
      },
      // Student Specific Fields
      matricNumber: {
        type: "string",
        required: false,
        input: true,
      },
      jambRegNumber: {
        type: "string",
        required: false,
        input: true,
      },
      modeOfEntry: {
        type: "string",
        required: false,
        input: true,
      },
      admissionYear: {
        type: "number",
        required: false,
        input: true,
      },
      currentLevel: {
        type: "number",
        required: false,
        input: true,
      },
      currentSemester: {
        type: "string",
        required: false,
        input: true,
      },
      studyMode: {
        type: "string",
        required: false,
        input: true,
      },
      // Academic Information
      facultyId: {
        type: "string",
        required: false,
        input: true,
      },
      departmentId: {
        type: "string",
        required: false,
        input: true,
      },
      programmeId: {
        type: "string",
        required: false,
        input: true,
      },
      cgpa: {
        type: "number",
        required: false,
        input: true,
      },
      totalCreditsEarned: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: true,
      },
      // Staff Specific Fields
      staffId: {
        type: "string",
        required: false,
        input: true,
      },
      designation: {
        type: "string",
        required: false,
        input: true,
      },
      employmentDate: {
        type: "string",
        required: false,
        input: true,
      },
      employmentType: {
        type: "string",
        required: false,
        input: true,
      },
      officeLocation: {
        type: "string",
        required: false,
        input: true,
      },

      // Academic Status
      isOnProbation: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      probationReason: {
        type: "string",
        required: false,
        input: true,
      },
      isDeferred: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      defermentStartDate: {
        type: "string",
        required: false,
        input: true,
      },
      defermentEndDate: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: [reactStartCookies()],
});
