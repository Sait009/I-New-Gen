"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { query, ref, onValue } from "firebase/database";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { db } from "@/app/firebase";
import 'chartjs-adapter-date-fns';
import { format } from "date-fns";

export default function VitalSign({ title, dataPath, sdPath, unit, yMin, yMax, bdColor, bgColor }) {
    const [value, setValue] = useState(null);
    const [sdValue, setSdValue] = useState(null);
    const [displayedValue, setDisplayedValue] = useState(null);
    const [dataPoints, setDataPoints] = useState([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        const unsubscribeData = onValue(query(ref(db, dataPath)), (snapshot) => {
            const rawData = snapshot.val();
            const data = parseFloat(rawData ?? 0); // ป้องกัน NaN
            if (!isNaN(data)) {
                const roundedValue = parseFloat(data.toFixed(2));
                setValue(roundedValue);
                setDisplayedValue(roundedValue);

                setDataPoints((prev) => [
                    ...prev.slice(-29),
                    { time: new Date().toISOString(), value: roundedValue },
                ]);
            }
        });

        const unsubscribeSD = onValue(query(ref(db, sdPath)), (snapshot) => {
            const rawSD = snapshot.val();
            const sdData = parseFloat(rawSD ?? 0);
            if (!isNaN(sdData) && sdData >= 0) {
                setSdValue(sdData);
            }
        });

        return () => {
            unsubscribeData();
            unsubscribeSD();
        };
    }, [dataPath, sdPath]);

    useEffect(() => {
        if (value !== null && sdValue !== null) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                const min = value - sdValue;
                const max = value + sdValue;
                const randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(2));

                setDataPoints((prev) => [
                    ...prev.slice(-29),
                    { time: new Date().toISOString(), value: randomValue },
                ]);

                setDisplayedValue(randomValue);
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [value, sdValue]);

    const chartData = useMemo(() => ({
        labels: dataPoints.map((point) => format(new Date(point.time), "HH:mm:ss")),
        datasets: [
            {
                label: title,
                data: dataPoints.map((point) => point.value),
                borderColor: bdColor,
                backgroundColor: bgColor,
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
            },
        ],
    }), [dataPoints, bdColor, bgColor, title]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "TIME (HH:mm:ss)",
                    font: { size: 14, weight: "bold" },
                },
                ticks: { autoSkip: true, maxTicksLimit: 6 },
                grid: { drawTicks: false, drawBorder: false },
            },
            y: {
                min: yMin,
                max: yMax,
                ticks: { stepSize: (yMax - yMin) / 4 },
                grid: { color: "rgba(0, 0, 0, 0.1)" },
            },
        },
        plugins: {
            legend: { display: false },
        },
    }), [yMin, yMax]);

    return (
        <div className="h-auto px-10">
            <div className="p-6 bg-white border-4 border-gray-500 rounded-lg w-80 shadow-md">
                <h2 className="text-black text-center text-lg font-semibold py-2 rounded" style={{ backgroundColor: bgColor }}>
                    {title}
                </h2>
                <h1 className="text-center text-4xl font-bold my-4">
                    {displayedValue !== null ? `${displayedValue} ${unit}` : "Loading..."}
                </h1>
                <div className="h-48">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
