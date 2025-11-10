import React from "react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

export default function ActivitySparkline({ data, days = 7, color = "#10b981" }) {
  const chartData = data.map((value, index) => ({ day: index + 1, value }));

  return (
    <div className="w-full h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                return (
                  <div className="bg-gray-900/95 border border-white/10 text-white px-2 py-1 rounded text-xs">
                    Day {payload[0].payload.day}: {payload[0].value} touches
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}