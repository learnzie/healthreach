import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { analyticsQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
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
    const validationResult = analyticsQuerySchema.safeParse(queryParams);
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
    const where: Prisma.EntryWhereInput = {};

    // Apply filters if provided
    if (validatedQuery.gender) where.gender = validatedQuery.gender;
    if (validatedQuery.diagnosis) {
      where.diagnosis = { contains: validatedQuery.diagnosis };
    }
    if (validatedQuery.treatment) {
      where.treatment = { contains: validatedQuery.treatment };
    }

    const entries = await prisma.entry.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        surname: true,
        gender: true,
        maritalStatus: true,
        religion: true,
        dateOfBirth: true,
        bp: true,
        temp: true,
        weight: true,
        diagnosis: true,
        treatment: true,
      },
    });

    // Calculate ages
    const entriesWithAge = entries.map((entry) => ({
      ...entry,
      age: calculateAge(entry.dateOfBirth),
    }));

    // Age distribution (by age groups)
    const ageGroups = {
      "0-18": 0,
      "19-30": 0,
      "31-45": 0,
      "46-60": 0,
      "61+": 0,
    };

    entriesWithAge.forEach((entry) => {
      const age = entry.age;
      if (age <= 18) ageGroups["0-18"]++;
      else if (age <= 30) ageGroups["19-30"]++;
      else if (age <= 45) ageGroups["31-45"]++;
      else if (age <= 60) ageGroups["46-60"]++;
      else ageGroups["61+"]++;
    });

    // Gender distribution
    const genderDistribution = entries.reduce((acc, entry) => {
      acc[entry.gender] = (acc[entry.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Marital status distribution
    const maritalStatusDistribution = entries.reduce((acc, entry) => {
      acc[entry.maritalStatus] = (acc[entry.maritalStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Religion distribution
    const religionDistribution = entries.reduce((acc, entry) => {
      acc[entry.religion] = (acc[entry.religion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Diagnosis distribution
    const diagnosisDistribution = entries
      .filter((e) => e.diagnosis)
      .reduce((acc, entry) => {
        const diag = entry.diagnosis!;
        acc[diag] = (acc[diag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Treatment distribution
    const treatmentDistribution = entries
      .filter((e) => e.treatment)
      .reduce((acc, entry) => {
        const treat = entry.treatment!;
        acc[treat] = (acc[treat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // BP vs Age data (for scatter plot)
    const bpVsAge = entriesWithAge
      .filter((e) => e.bp && e.age)
      .map((entry) => {
        // Parse BP (format: "120/80")
        const bpParts = entry.bp!.split("/");
        const systolic = bpParts[0] ? parseFloat(bpParts[0]) : null;
        return {
          age: entry.age,
          systolic,
          bp: entry.bp,
        };
      })
      .filter((e) => e.systolic !== null);

    // Weight vs Age data
    const weightVsAge = entriesWithAge
      .filter((e) => e.weight && e.age)
      .map((entry) => ({
        age: entry.age,
        weight: entry.weight,
      }));

    // Weight distribution by age groups
    const weightByAgeGroup = {
      "0-18": [] as number[],
      "19-30": [] as number[],
      "31-45": [] as number[],
      "46-60": [] as number[],
      "61+": [] as number[],
    };

    entriesWithAge.forEach((entry) => {
      if (entry.weight) {
        const age = entry.age;
        if (age <= 18) weightByAgeGroup["0-18"].push(entry.weight);
        else if (age <= 30) weightByAgeGroup["19-30"].push(entry.weight);
        else if (age <= 45) weightByAgeGroup["31-45"].push(entry.weight);
        else if (age <= 60) weightByAgeGroup["46-60"].push(entry.weight);
        else weightByAgeGroup["61+"].push(entry.weight);
      }
    });

    // Cross-tabulations
    // Diagnosis by Gender
    const diagnosisByGender: Record<string, Record<string, number>> = {};
    entries.forEach((entry) => {
      if (entry.diagnosis) {
        if (!diagnosisByGender[entry.diagnosis]) {
          diagnosisByGender[entry.diagnosis] = {};
        }
        diagnosisByGender[entry.diagnosis][entry.gender] =
          (diagnosisByGender[entry.diagnosis][entry.gender] || 0) + 1;
      }
    });

    // Treatment by Age Group
    const treatmentByAgeGroup: Record<string, Record<string, number>> = {};
    entriesWithAge.forEach((entry) => {
      if (entry.treatment) {
        const age = entry.age;
        let ageGroup = "";
        if (age <= 18) ageGroup = "0-18";
        else if (age <= 30) ageGroup = "19-30";
        else if (age <= 45) ageGroup = "31-45";
        else if (age <= 60) ageGroup = "46-60";
        else ageGroup = "61+";

        if (!treatmentByAgeGroup[entry.treatment]) {
          treatmentByAgeGroup[entry.treatment] = {};
        }
        treatmentByAgeGroup[entry.treatment][ageGroup] =
          (treatmentByAgeGroup[entry.treatment][ageGroup] || 0) + 1;
      }
    });

    return NextResponse.json({
      ageDistribution: Object.entries(ageGroups).map(([group, count]) => ({
        ageGroup: group,
        count,
      })),
      genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({
        gender,
        count,
      })),
      maritalStatusDistribution: Object.entries(maritalStatusDistribution).map(
        ([status, count]) => ({
          status,
          count,
        })
      ),
      religionDistribution: Object.entries(religionDistribution).map(
        ([religion, count]) => ({
          religion,
          count,
        })
      ),
      diagnosisDistribution: Object.entries(diagnosisDistribution).map(
        ([diagnosis, count]) => ({
          diagnosis,
          count,
        })
      ),
      treatmentDistribution: Object.entries(treatmentDistribution).map(
        ([treatment, count]) => ({
          treatment,
          count,
        })
      ),
      bpVsAge,
      weightVsAge,
      weightByAgeGroup: Object.entries(weightByAgeGroup).map(([group, weights]) => ({
        ageGroup: group,
        weights,
        average: weights.length > 0
          ? weights.reduce((a, b) => a + b, 0) / weights.length
          : 0,
      })),
      crossTabulations: {
        diagnosisByGender,
        treatmentByAgeGroup,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

