import { Session } from "next-auth";

export type UserRole = "admin" | "user" | "doctor" | "nurse";

export function getUserRole(session: Session | null): UserRole | null {
    if (!session?.user?.role) return null;
    return session.user.role as UserRole;
}

export function canEditDemographics(role?: UserRole): boolean {
    return role === "user" || role === "admin";
}

export function canEditHealth(role?: UserRole): boolean {
    return role === "nurse" || role === "admin";
}

export function canEditMedical(role?: UserRole): boolean {
    return role === "doctor" || role === "admin";
}

export function isAdmin(role?: UserRole): boolean {
    return role === "admin";
}

