"use client";

import React, { useState, useEffect } from "react";
import { Search, X, User } from "lucide-react";

interface Entry {
  id: string;
  firstName: string;
  middleName: string;
  surname: string;
  phoneNumber: string;
  occupation?: string;
}

interface EntrySearchSidebarProps {
  onSelectEntry: (entryId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EntrySearchSidebar: React.FC<EntrySearchSidebarProps> = ({
  onSelectEntry,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchEntries();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setEntries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const searchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/entries?search=${encodeURIComponent(searchTerm)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Error searching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (entryId: string) => {
    onSelectEntry(entryId);
    setSearchTerm("");
    setEntries([]);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 h-full bg-white border-r border-gray-200 shadow-lg z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          left-0 w-full
          lg:left-64 lg:w-80
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Search Entries
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Searching...</div>
            ) : entries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm.length >= 2
                  ? "No entries found"
                  : "Start typing to search"}
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelect(entry.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {entry.firstName} {entry.middleName} {entry.surname}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {entry.phoneNumber}
                        </p>
                        {entry.occupation && (
                          <p className="text-xs text-gray-500 truncate">
                            {entry.occupation}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for desktop - only when open */}
      {isOpen && <div className="hidden lg:block w-80" />}
    </>
  );
};
