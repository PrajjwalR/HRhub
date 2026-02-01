"use client";

import { Mail, Phone, MapPin, Building, Hash, Calendar } from "lucide-react";

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    role: "Administrator",
    email: "john.doe@hrhub.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    department: "Human Resources",
    employeeId: "EMP-2023-001",
    joinDate: "Jan 15, 2020",
    avatarColor: "bg-[#4A72FF]",
    avatarText: "JD"
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-100 to-[#E5EDFF]"></div>
        
        <div className="px-8 pt-20 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-8">
            <div className={`w-24 h-24 rounded-2xl ${user.avatarColor} border-4 border-white flex items-center justify-center text-white text-3xl font-bold font-serif shadow-sm`}>
              {user.avatarText}
            </div>
          </div>

          {/* Header Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C] font-serif">{user.name}</h2>
            <p className="text-gray-500 font-medium">{user.role}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact Information</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4A72FF]">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Employment Details</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Employee ID</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date Joined</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{user.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
