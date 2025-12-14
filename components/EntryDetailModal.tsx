"use client";

import React from "react";
import { X } from "lucide-react";
import { Entry, User } from "@/types/entry";

interface EntryDetailModalProps {
  entry: Entry | null;
  onClose: () => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  onClose,
}) => {
  if (!entry) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserDisplay = (user: User | null | undefined) => {
    if (!user) return "Not entered";
    return user.name || user.email;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Entry Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Personal Information
              </h3>
              <span className="text-xs text-gray-500">
                Entered by: {getUserDisplay(entry.demographicCreatedBy)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  First Name
                </label>
                <p className="text-gray-800">{entry.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Middle Name
                </label>
                <p className="text-gray-800">{entry.middleName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Surname
                </label>
                <p className="text-gray-800">{entry.surname}</p>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Demographics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gender
                </label>
                <p className="text-gray-800 capitalize">{entry.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Marital Status
                </label>
                <p className="text-gray-800 capitalize">
                  {entry.maritalStatus}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Religion
                </label>
                <p className="text-gray-800">{entry.religion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-800">{formatDate(entry.dateOfBirth)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-800">{entry.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Occupation
                </label>
                <p className="text-gray-800">{entry.occupation}</p>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Health Metrics
              </h3>
              <span className="text-xs text-gray-500">
                Entered by: {getUserDisplay(entry.healthCreatedBy)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Blood Pressure
                </label>
                <p className="text-gray-800">{entry.bp || "Not entered"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Temperature (°C)
                </label>
                <p className="text-gray-800">
                  {entry.temp !== null && entry.temp !== undefined
                    ? `${entry.temp}°C`
                    : "Not entered"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Weight (kg)
                </label>
                <p className="text-gray-800">
                  {entry.weight !== null && entry.weight !== undefined
                    ? `${entry.weight} kg`
                    : "Not entered"}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Medical Information
              </h3>
              <span className="text-xs text-gray-500">
                Entered by: {getUserDisplay(entry.medicalCreatedBy)}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Diagnosis
                </label>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {entry.diagnosis || "Not entered"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Treatment
                </label>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {entry.treatment || "Not entered"}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(entry.createdAt)} by{" "}
                {getUserDisplay(entry.createdBy)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {formatDate(entry.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
