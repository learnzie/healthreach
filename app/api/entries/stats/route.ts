import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { statsQuerySchema } from "@/lib/validations";

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
        const validationResult = statsQuerySchema.safeParse(queryParams);
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
        const where: {
            gender?: string;
            diagnosis?: { contains: string };
            treatment?: { contains: string };
        } = {};

        // Apply filters if provided
        if (validatedQuery.gender) where.gender = validatedQuery.gender;
        if (validatedQuery.diagnosis) {
            where.diagnosis = { contains: validatedQuery.diagnosis };
        }
        if (validatedQuery.treatment) {
            where.treatment = { contains: validatedQuery.treatment };
        }

        const [
            totalEntries,
            genderStats,
            diagnosisStats,
            treatmentStats,
            avgWeight,
            avgTemp,
        ] = await Promise.all([
            prisma.entry.count({ where }),
            prisma.entry.groupBy({
                by: ["gender"],
                where,
                _count: true,
            }),
            prisma.entry.groupBy({
                by: ["diagnosis"],
                where: { ...where, diagnosis: { not: null } },
                _count: true,
            }),
            prisma.entry.groupBy({
                by: ["treatment"],
                where: { ...where, treatment: { not: null } },
                _count: true,
            }),
            prisma.entry.aggregate({
                where: { ...where, weight: { not: null } },
                _avg: { weight: true },
            }),
            prisma.entry.aggregate({
                where: { ...where, temp: { not: null } },
                _avg: { temp: true },
            }),
        ]);

        return NextResponse.json({
            totalEntries,
            genderDistribution: genderStats.map((g) => ({
                gender: g.gender,
                count: g._count,
            })),
            diagnosisDistribution: diagnosisStats.map((d) => ({
                diagnosis: d.diagnosis,
                count: d._count,
            })),
            treatmentDistribution: treatmentStats.map((t) => ({
                treatment: t.treatment,
                count: t._count,
            })),
            averageWeight: avgWeight._avg.weight,
            averageTemp: avgTemp._avg.temp,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

