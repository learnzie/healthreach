"use client";
import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, Users, LogOut } from "lucide-react";

// Types
interface User {
  id: string;
  firstName: string;
  middleName: string;
  surname: string;
  nin: string;
  email: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  dateOfBirth: string;
  homeTown: string;
  tribe: string;
  ethnicGroup: string;
  nationality: string;
  stateOfOrigin: string;
  address: string;
  phoneNumber: string;
  occupation: string;
  employerName: string;
  nextOfKinName: string;
  nokPhoneNumber: string;
  nokAddress: string;
}

interface AuthUser {
  email: string;
  password: string;
}

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<
    "login" | "addUser" | "viewUsers"
  >("login");
  const [users, setUsers] = useState<User[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Auth form state
  const [authForm, setAuthForm] = useState<AuthUser>({
    email: "",
    password: "",
  });

  // User form state
  const [userForm, setUserForm] = useState<Partial<User>>({
    firstName: "",
    middleName: "",
    surname: "",
    nin: "",
    email: "",
    gender: "male",
    maritalStatus: "",
    religion: "",
    dateOfBirth: "",
    homeTown: "",
    tribe: "",
    ethnicGroup: "",
    nationality: "",
    stateOfOrigin: "",
    address: "",
    phoneNumber: "",
    occupation: "",
    employerName: "",
    nextOfKinName: "",
    nokPhoneNumber: "",
    nokAddress: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation (in production, validate against backend)
    if (authForm.email && authForm.password) {
      setIsAuthenticated(true);
      setCurrentView("addUser");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("login");
    setAuthForm({ email: "", password: "" });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      ...(userForm as User),
    };
    setUsers([...users, newUser]);
    // Reset form
    setUserForm({
      firstName: "",
      middleName: "",
      surname: "",
      nin: "",
      email: "",
      gender: "male",
      maritalStatus: "",
      religion: "",
      dateOfBirth: "",
      homeTown: "",
      tribe: "",
      ethnicGroup: "",
      nationality: "",
      stateOfOrigin: "",
      address: "",
      phoneNumber: "",
      occupation: "",
      employerName: "",
      nextOfKinName: "",
      nokPhoneNumber: "",
      nokAddress: "",
    });
    alert("User added successfully!");
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to access the user management system
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">
                User Management
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView("addUser")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === "addUser"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Add User
              </button>
              <button
                onClick={() => setCurrentView("viewUsers")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === "viewUsers"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                View Users ({users.length})
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
              >
                <LogOut className="w-5 h-5 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Add User Form */}
      {currentView === "addUser" && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.firstName}
                      onChange={(e) =>
                        setUserForm({ ...userForm, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.middleName}
                      onChange={(e) =>
                        setUserForm({ ...userForm, middleName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.surname}
                      onChange={(e) =>
                        setUserForm({ ...userForm, surname: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Identification & Contact */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Identification & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIN
                    </label>
                    <input
                      type="text"
                      value={userForm.nin}
                      onChange={(e) =>
                        setUserForm({ ...userForm, nin: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={userForm.phoneNumber}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={userForm.dateOfBirth}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={userForm.gender}
                      onChange={(e) =>
                        setUserForm({ ...userForm, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={userForm.maritalStatus}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          maritalStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.religion}
                      onChange={(e) =>
                        setUserForm({ ...userForm, religion: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Home Town
                    </label>
                    <input
                      type="text"
                      value={userForm.homeTown}
                      onChange={(e) =>
                        setUserForm({ ...userForm, homeTown: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tribe
                    </label>
                    <input
                      type="text"
                      value={userForm.tribe}
                      onChange={(e) =>
                        setUserForm({ ...userForm, tribe: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ethnic Group
                    </label>
                    <input
                      type="text"
                      value={userForm.ethnicGroup}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          ethnicGroup: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={userForm.nationality}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          nationality: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State of Origin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.stateOfOrigin}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          stateOfOrigin: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address & Employment */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Address & Employment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={userForm.address}
                      onChange={(e) =>
                        setUserForm({ ...userForm, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.occupation}
                      onChange={(e) =>
                        setUserForm({ ...userForm, occupation: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employer Name
                    </label>
                    <input
                      type="text"
                      value={userForm.employerName}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          employerName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Next of Kin Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next of Kin Name
                    </label>
                    <input
                      type="text"
                      value={userForm.nextOfKinName}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          nextOfKinName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NOK Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userForm.nokPhoneNumber}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          nokPhoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NOK Address
                    </label>
                    <textarea
                      value={userForm.nokAddress}
                      onChange={(e) =>
                        setUserForm({ ...userForm, nokAddress: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setUserForm({
                      firstName: "",
                      middleName: "",
                      surname: "",
                      nin: "",
                      email: "",
                      gender: "male",
                      maritalStatus: "",
                      religion: "",
                      dateOfBirth: "",
                      homeTown: "",
                      tribe: "",
                      ethnicGroup: "",
                      nationality: "",
                      stateOfOrigin: "",
                      address: "",
                      phoneNumber: "",
                      occupation: "",
                      employerName: "",
                      nextOfKinName: "",
                      nokPhoneNumber: "",
                      nokAddress: "",
                    })
                  }
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Users */}
      {currentView === "viewUsers" && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Registered Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No users registered yet</p>
                <button
                  onClick={() => setCurrentView("addUser")}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Add First User
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition cursor-pointer"
                    onClick={() => handleViewUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {user.firstName} {user.middleName} {user.surname}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.email || "No email"} • {user.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.occupation} • {user.stateOfOrigin}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUser(user);
                        }}
                        className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {/* {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">First Name:</span> {selectedUser.firstName}</div>
                  <div><span className="font-medium">Middle Name:</span> {selectedUser.middleName}</div>
                  <div><span className="font-medium">Surname:</span> {selectedUser.surname}</div>
                  <div><span className="font-medium">NIN:</span> {selectedUser.nin || 'N/A'}</div>
                  <div><span className="font-medium">Email:</span> {selectedUser.email || 'N/A'}</div>
                  <div><span className="font-medium">Phone:</span> {selectedUser.phoneNumber}</div>
                  <div><span className="font-medium">Date of Birth:</span> {selectedUser.dateOfBirth}</div>
                  <div><span className="font-medium">Gender:</span> {selectedUser.gender}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Demographics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Marital Status:</span> {selectedUser.maritalStatus}</div>
                  <div><span className="font-medium">Religion:</span> {selectedUser.religion}</div>
                  <div><span className="font-medium">Home Town:</span> {selectedUser.homeTown || 'N/A'}</div>
                  <div><span className="font-medium">Tribe:</span> {selectedUser.tribe || 'N/A'}</div>
                  <div><span className="font-medium">Ethnic Group:</span> {selectedUser.ethnicGroup || 'N/A'}</div>
                  <div><span className="font-medium">Nationality:</span> {selectedUser.nationality || 'N/A'}</div>
                  <div><span className="font-medium">State of Origin:</span> {selectedUser.stateOfOrigin}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Address & Employment</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Address:</span> {selectedUser.address}</div>
                  <div><span className="font-medium"></span> */}
    </div>
  );
};
