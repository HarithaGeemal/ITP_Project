import React from "react";

const AdminDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Total Projects</h3>
          <p className="text-2xl mt-2">12</p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Active Users</h3>
          <p className="text-2xl mt-2">8</p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-5">
          <h3 className="text-lg font-semibold">High Risk Projects</h3>
          <p className="text-2xl mt-2 text-red-500">3</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;