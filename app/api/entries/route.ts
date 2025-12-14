import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { entryQuerySchema, demographicEntrySchema, healthEntrySchema, medicalEntrySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { canEditDemographics, canEditHealth, canEditMedical } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userRole = session.user.role as "admin" | "user" | "doctor" | "nurse";

    // Check if this is an update (has id) or create
    const entryId = body.id;

    if (entryId) {
      // Update existing entry
      const existingEntry = await prisma.entry.findUnique({
        where: { id: entryId },
      });

      if (!existingEntry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      // Build update data based on role
      const updateData: Prisma.EntryUpdateInput = {};

      // Demographic fields
      if (canEditDemographics(userRole)) {
        const demographicResult = demographicEntrySchema.safeParse(body);
        if (demographicResult.success) {
          const data = demographicResult.data;
          updateData.firstName = data.firstName;
          updateData.middleName = data.middleName;
          updateData.surname = data.surname;
          updateData.gender = data.gender;
          updateData.maritalStatus = data.maritalStatus;
          updateData.religion = data.religion;
          updateData.dateOfBirth = new Date(data.dateOfBirth);
          updateData.phoneNumber = data.phoneNumber;
          updateData.occupation = data.occupation;
          updateData.demographicCreatedBy = { connect: { id: session.user.id } };
        }
      }

      // Health fields
      if (canEditHealth(userRole)) {
        const healthResult = healthEntrySchema.safeParse(body);
        if (healthResult.success) {
          const data = healthResult.data;
          updateData.bp = data.bp || null;
          updateData.temp = data.temp;
          updateData.weight = data.weight;
          updateData.healthCreatedBy = {connect: {id: session.user.id}};
        }
      }

      // Medical fields
      if (canEditMedical(userRole)) {
        const medicalResult = medicalEntrySchema.safeParse(body);
        if (medicalResult.success) {
          const data = medicalResult.data;
          updateData.diagnosis = data.diagnosis || null;
          updateData.treatment = data.treatment || null;
          updateData.medicalCreatedBy = {connect: {id: session.user.id}};
        }
      }

      const entry = await prisma.entry.update({
        where: { id: entryId },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          demographicCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          healthCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          medicalCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(entry, { status: 200 });
    } else {
      // Create new entry - must have at least demographic data
      if (!canEditDemographics(userRole)) {
        return NextResponse.json(
          { error: "You do not have permission to create entries" },
          { status: 403 }
        );
      }

      const demographicResult = demographicEntrySchema.safeParse(body);
      if (!demographicResult.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: demographicResult.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      const demographicData = demographicResult.data;
      const healthData = canEditHealth(userRole) ? healthEntrySchema.safeParse(body).data : null;
      const medicalData = canEditMedical(userRole) ? medicalEntrySchema.safeParse(body).data : null;

      const entry = await prisma.entry.create({
        data: {
          firstName: demographicData.firstName,
          middleName: demographicData.middleName,
          surname: demographicData.surname,
          gender: demographicData.gender,
          maritalStatus: demographicData.maritalStatus,
          religion: demographicData.religion,
          dateOfBirth: new Date(demographicData.dateOfBirth),
          phoneNumber: demographicData.phoneNumber,
          occupation: demographicData.occupation,
          bp: healthData?.bp || null,
          temp: healthData?.temp || null,
          weight: healthData?.weight || null,
          diagnosis: medicalData?.diagnosis || null,
          treatment: medicalData?.treatment || null,
          createdById: session.user.id,
          demographicCreatedById: session.user.id,
          healthCreatedById: healthData ? session.user.id : null,
          medicalCreatedById: medicalData ? session.user.id : null,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          demographicCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          healthCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          medicalCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(entry, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating entry:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Build query object from search params
    const queryParams: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Validate query parameters with Zod
    const validationResult = entryQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedQuery = validationResult.data;
    const page = validatedQuery.page;
    const limit = validatedQuery.limit;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EntryWhereInput = {};

    if (validatedQuery.gender) where.gender = validatedQuery.gender;
    if (validatedQuery.diagnosis) {
      where.diagnosis = { contains: validatedQuery.diagnosis };
    }
    if (validatedQuery.treatment) {
      where.treatment = { contains: validatedQuery.treatment };
    }
    if (validatedQuery.minWeight !== undefined || validatedQuery.maxWeight !== undefined) {
      where.weight = {};
      if (validatedQuery.minWeight !== undefined) where.weight.gte = validatedQuery.minWeight;
      if (validatedQuery.maxWeight !== undefined) where.weight.lte = validatedQuery.maxWeight;
    }
    if (validatedQuery.minBp || validatedQuery.maxBp) {
      where.bp = {};
      // For BP, we'll need to parse the string format (e.g., "120/80")
      // This is a simplified version - you might want to improve BP parsing
    }

    // Age filtering
    if (validatedQuery.minAge !== undefined || validatedQuery.maxAge !== undefined) {
      const now = new Date();
      const dateFilter: Prisma.DateTimeFilter = {};
      if (validatedQuery.maxAge !== undefined) {
        const maxBirthDate = new Date(
          now.getFullYear() - validatedQuery.maxAge,
          now.getMonth(),
          now.getDate()
        );
        dateFilter.gte = maxBirthDate;
      }
      if (validatedQuery.minAge !== undefined) {
        const minBirthDate = new Date(
          now.getFullYear() - validatedQuery.minAge - 1,
          now.getMonth(),
          now.getDate()
        );
        dateFilter.lte = minBirthDate;
      }
      where.dateOfBirth = dateFilter;
    }

    // Search across multiple fields
    if (validatedQuery.search) {
      where.OR = [
        { firstName: { contains: validatedQuery.search } },
        { middleName: { contains: validatedQuery.search } },
        { surname: { contains: validatedQuery.search } },
        { phoneNumber: { contains: validatedQuery.search } },
        { occupation: { contains: validatedQuery.search } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          demographicCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          healthCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          medicalCreatedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.entry.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

