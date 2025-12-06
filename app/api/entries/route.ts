import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { entrySchema, entryQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const validationResult = entrySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const entry = await prisma.entry.create({
      data: {
        firstName: validatedData.firstName,
        middleName: validatedData.middleName,
        surname: validatedData.surname,
        gender: validatedData.gender,
        maritalStatus: validatedData.maritalStatus,
        religion: validatedData.religion,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        phoneNumber: validatedData.phoneNumber,
        occupation: validatedData.occupation,
        bp: validatedData.bp || null,
        temp: validatedData.temp,
        weight: validatedData.weight,
        diagnosis: validatedData.diagnosis || null,
        treatment: validatedData.treatment || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating entry:", error);
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

