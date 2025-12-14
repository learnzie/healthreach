import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { demographicEntrySchema, healthEntrySchema, medicalEntrySchema } from "@/lib/validations";
import { canEditDemographics, canEditHealth, canEditMedical } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = (await params).id

    const entry = await prisma.entry.findUnique({
      where: { id },
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

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userRole = session.user.role as "admin" | "user" | "doctor" | "nurse";

    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

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
        updateData.demographicCreatedById = session.user.id;
      }
    }

    // Health fields
    if (canEditHealth(userRole)) {
      const healthResult = healthEntrySchema.safeParse(body);
      if (healthResult.success) {
        const data = healthResult.data;
        updateData.bp = data.bp !== undefined ? (data.bp || null) : existingEntry.bp;
        updateData.temp = data.temp !== undefined ? data.temp : existingEntry.temp;
        updateData.weight = data.weight !== undefined ? data.weight : existingEntry.weight;
        updateData.healthCreatedById = session.user.id;
      }
    }

    // Medical fields
    if (canEditMedical(userRole)) {
      const medicalResult = medicalEntrySchema.safeParse(body);
      if (medicalResult.success) {
        const data = medicalResult.data;
        updateData.diagnosis = data.diagnosis !== undefined ? (data.diagnosis || null) : existingEntry.diagnosis;
        updateData.treatment = data.treatment !== undefined ? (data.treatment || null) : existingEntry.treatment;
        updateData.medicalCreatedById = session.user.id;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update for your role" },
        { status: 400 }
      );
    }

    const entry = await prisma.entry.update({
      where: { id },
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

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

