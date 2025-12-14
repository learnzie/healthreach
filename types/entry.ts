export interface User {
    id: string;
    email: string;
    name?: string | null;
}

export interface Entry {
    id: string;
    firstName: string;
    middleName: string;
    surname: string;
    gender: string;
    maritalStatus: string;
    religion: string;
    dateOfBirth: string;
    phoneNumber: string;
    occupation: string;
    bp?: string | null;
    temp?: number | null;
    weight?: number | null;
    diagnosis?: string | null;
    treatment?: string | null;
    createdBy?: User;
    demographicCreatedBy?: User | null;
    healthCreatedBy?: User | null;
    medicalCreatedBy?: User | null;
    createdAt: string;
    updatedAt: string;
}