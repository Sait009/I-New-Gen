"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "@/app/firebase";

export default function PredictionDetails() {
    const [latestData, setLatestData] = useState(null);
    const [comfortLevel, setComfortLevel] = useState("");
    const [comfortLevelClass, setComfortLevelClass] = useState("");
    const [loading, setLoading] = useState(true);

    const comfortLevelMapping = {
        4: { text: "Asymptomatic", color: "#00BF63" }, // Asymptomatic
        3: { text: "Mildly Symptomatic", color: "#7EDA57" }, // Mildly Symptomatic
        0: { text: "Multi-Symptomatic", color: "#94AABF" }, // Multi-Symptomatic
        2: { text: "Significantly Symptomatic", color: "#FF914D" }, // Significantly Symptomatic
        1: { text: "Intolerable and Requiring Medical Help", color: "#FF5757" }, // Intolerable and Requiring Medical Help
    };

    useEffect(() => {
        setLoading(true);

        const predictionsPath = "Prediction/Data/Latest";
        const firebaseQuery = query(ref(db, predictionsPath));

        const unsubscribe = onValue(
            firebaseQuery,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setLatestData(data);
                    const level = parseInt(data.ComfortLevel, 10);
                    const levelInfo = comfortLevelMapping[level] || { text: "Unknown", color: "#A0A0A0" }; // Default color for unknown level
                    setComfortLevel(levelInfo.text);
                    setComfortLevelClass(levelInfo.color);
                } else {
                    console.error("No data available");
                    setComfortLevel("No data available");
                    setComfortLevelClass("#A0A0A0"); // Default color for no data
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching data:", error);
                setComfortLevel("Error fetching data");
                setComfortLevelClass("#A0A0A0"); // Default color for error
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-32">Loading...</div>;
    }

    if (!latestData) {
        return <div className="text-center text-gray-700">No data available</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            {/* Comfort Level Section */}
            <div className="mb-8 text-center">
                <div
                    className={`relative p-8 rounded-lg text-white shadow-lg`}
                    style={{ backgroundColor: comfortLevelClass }} // Dynamically apply background color
                >
                    <span className="text-4xl font-extrabold">{comfortLevel}</span>
                </div>
            </div>

            {/* Additional Data Section */}
            <div className="grid gap-4 text-lg text-black">
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>EDA:</strong> {latestData.EDA} µS
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>HR:</strong> {latestData.HR} bpm
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>Skin Temp:</strong> {latestData.ST} °C
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>Timestamp:</strong>{" "}
                    {new Date(latestData.Timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
