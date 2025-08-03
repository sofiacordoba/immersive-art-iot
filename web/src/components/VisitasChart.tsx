"use client";
import { useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import type { Chart as ChartJSInstance } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function VisitasChart() {
    const chartRef = useRef<any>(null);
    const [gradient, setGradient] = useState<string | CanvasGradient | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const chart = chartRef.current as ChartJSInstance;
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            if (!chartArea) return;
            const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            grad.addColorStop(0, "rgba(161,140,209,0.4)");
            grad.addColorStop(1, "rgba(161,140,209,0.05)");
            setGradient(grad);
        }
    }, [chartRef.current]);

    const data = {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [
            {
                label: "Visitas",
                data: [12, 19, 8, 15, 22, 30, 18],
                fill: true,
                borderColor: "#a18cd1",
                backgroundColor: gradient || "rgba(161,140,209,0.1)",
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Visitas semanales",
                color: "#fff",
                font: { size: 18, weight: "bold" as const },
            },
        },
        scales: {
            x: {
                ticks: { color: "#bdbdfc", font: { weight: "bold" as const } },
                grid: { color: "rgba(161,140,209,0.1)" },
            },
            y: {
                ticks: { color: "#bdbdfc", font: { weight: "bold" as const } },
                grid: { color: "rgba(161,140,209,0.1)" },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div style={{ height: 220, width: "100%" }}>
            <Line
                ref={chartRef}
                data={data}
                options={options}
                redraw
            />
        </div>
    );
} 