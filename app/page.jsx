"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "@/app/firebase";
import AddPatient from "@/components/AddPatient";
import DelPatient from "@/components/DelPatient";
import Skeleton from "@/components/Skeleton";
import { FaUserMd, FaBed, FaSort, FaArrowRight } from "react-icons/fa";

const PredictionPage = () => {
  const [patientsData, setPatientsData] = useState([]);
  const [predictionsData, setPredictionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  const predictionsPath = "Prediction/Data/Latest";
  const patientsPath = "Patients/Data";

  const comfortLevelMapping = {
    0: { label: "Asymptomatic", color: "#00BF63" },
    1: { label: "Mildly Symptomatic", color: "#7EDA57" },
    2: { label: "Multi-Symptomatic", color: "#94AABF" },
    3: { label: "Significantly Symptomatic", color: "#FF914D" },
    4: { label: "Intolerable and Requiring Medical Help", color: "#FF5757" },
  };

  useEffect(() => {
    setLoading(true);

    const unsubscribePredictions = onValue(query(ref(db, predictionsPath)), (snapshot) => {
      setPredictionsData(snapshot.val() || {});
    });

    const unsubscribePatients = onValue(query(ref(db, patientsPath)), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientDataArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setPatientsData(patientDataArray);
      }
      setLoading(false);
    });

    return () => {
      unsubscribePredictions();
      unsubscribePatients();
    };
  }, []);

  const sortedPatients = [...patientsData].sort((a, b) => {
    const levelA = predictionsData[a.id]?.ComfortLevel || 0;
    const levelB = predictionsData[b.id]?.ComfortLevel || 0;
    return sortBy === "asc" ? levelA - levelB : sortBy === "desc" ? levelB - levelA : 0;
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🏥 Patient Monitoring</h2>
          <AddPatient />
        </div>

        {/* Sorting Options */}
        <div className="mb-4 flex gap-3 items-center justify-end">
          <FaSort className="text-gray-600 text-lg" />
          <label className="font-semibold">Sort by Condition:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 shadow-sm"
          >
            <option value="default">Default</option>
            <option value="asc">Mild → Severe</option>
            <option value="desc">Severe → Mild</option>
          </select>
        </div>

        {/* Patient List */}
        <div className="bg-white shadow-xl rounded-lg p-6 border">
          {loading ? (
            <Skeleton count={5} />
          ) : sortedPatients.length > 0 ? (
            <div className="grid gap-4">
              {sortedPatients.map((patient) => {
                const comfortLevel = predictionsData?.ComfortLevel ?? "N/A";
                const painLevel = comfortLevelMapping[comfortLevel] || { label: "No Data", color: "#A0A0A0" };

                return (
                  <div
                    key={patient.id}
                    className="flex flex-wrap md:flex-nowrap items-center bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Patient Avatar */}
                      <div className="size-16 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md">
                        {patient.fname.charAt(0)}
                      </div>

                      {/* Patient Details */}
                      <div>
                        <p className="text-lg font-semibold text-gray-800">{`${patient.fname} ${patient.lname}`}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FaBed className="text-blue-400" /> Room: {patient.room}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FaUserMd className="text-red-400" /> Doctor: Dr.{patient.dname}
                        </p>
                      </div>
                    </div>

                    {/* Comfort Level Display */}
                    <div className="flex flex-col items-center">
                      <div
                        className="px-5 py-2 rounded-md text-white font-semibold text-center shadow-md"
                        style={{ backgroundColor: painLevel.color }}
                      >
                        {painLevel.label}
                      </div>
                    </div>

                    {/* View Button */}
                    <a
                      href={`/patient/${patient.id}`}
                      className="ml-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 shadow-md hover:bg-blue-600 transition"
                    >
                      View <FaArrowRight />
                    </a>

                    {/* Delete Button */}
                    <DelPatient id={patient.id} className="ml-4" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-red-500 font-semibold">No patient data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
