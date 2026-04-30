import React, { useEffect, useState } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Replace with your backend API
    setUsers([
      { _id: 1, name: "John Doe", role: "Admin" },
      { _id: 2, name: "Jane Smith", role: "Manager" }
    ]);
  }, []);

  const deleteUser = (id) => {
    setUsers(users.filter(user => user._id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">User Management</h2>

      <table className="w-full bg-white shadow rounded-xl">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center border-t">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">
                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;