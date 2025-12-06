import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

// Create a singleton pool that's reused across requests
const pool =
    globalForPrisma.pool ??
    new Pool({
        connectionString,
        // Render.com requires SSL
        ssl: connectionString.includes("render.com") ? { rejectUnauthorized: false } : false,
        // Connection pool settings optimized for serverless/server environments
        max: 1, // Limit to 1 connection for serverless environments like Render
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
        // Prevent the pool from keeping connections open indefinitely
        allowExitOnIdle: true,
    });

if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        adapter: adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

