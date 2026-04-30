import React, { useState } from "react";

const RiskAssessmentForm = () => {
  const [formData, setFormData] = useState({
    equipmentUnits: "",
    materialCost: "",
    startConstraint: "",
    dependencies: "",
    resourceScore: "",
    siteScore: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);

    // Connect to backend
    /*
    const res = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log(data);
    */
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Risk Assessment</h2>

      {/* Auto-filled data cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-xl">
          Project Timeline: 37 days
        </div>
        <div className="bg-green-100 p-4 rounded-xl">
          Labour Count: 1
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl">
          Weather Score: 0.5
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow"
      >
        <input
          name="equipmentUnits"
          onChange={handleChange}
          placeholder="Equipment Units"
          className="border p-2"
        />

        <input
          name="materialCost"
          onChange={handleChange}
          placeholder="Material Cost"
          className="border p-2"
        />

        <input
          name="startConstraint"
          onChange={handleChange}
          placeholder="Start Constraint"
          className="border p-2"
        />

        <input
          name="dependencies"
          onChange={handleChange}
          placeholder="Dependencies"
          className="border p-2"
        />

        <input
          name="resourceScore"
          onChange={handleChange}
          placeholder="Resource Score"
          className="border p-2"
        />

        <input
          name="siteScore"
          onChange={handleChange}
          placeholder="Site Score"
          className="border p-2"
        />

        <button className="col-span-2 bg-blue-600 text-white p-2 rounded">
          Submit Risk Analysis
        </button>
      </form>
    </div>
  );
};

export default RiskAssessmentForm;