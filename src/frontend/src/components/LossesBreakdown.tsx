import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { calculateSystemLosses } from "../solarEngine";
import type { SystemConfig } from "../types";

interface LossesBreakdownProps {
  config: SystemConfig;
  currentTemp: number;
}

const COLORS = [
  "#d4aa30",
  "#40c0d0",
  "#50c878",
  "#e07030",
  "#9060d0",
  "#c04060",
  "#408060",
];

export function LossesBreakdown({ config, currentTemp }: LossesBreakdownProps) {
  const losses = calculateSystemLosses(config, currentTemp);

  const data = [
    {
      name: "Temperature",
      value: Number.parseFloat((losses.temperatureLoss * 100).toFixed(2)),
      color: COLORS[0],
    },
    {
      name: "Shading",
      value: Number.parseFloat((losses.shadingLoss * 100).toFixed(2)),
      color: COLORS[3],
    },
    {
      name: "Wiring",
      value: Number.parseFloat((losses.wiringLoss * 100).toFixed(2)),
      color: COLORS[2],
    },
    {
      name: "Inverter",
      value: Number.parseFloat(
        ((1 - losses.inverterEfficiency) * 100).toFixed(2),
      ),
      color: COLORS[1],
    },
    {
      name: "Soiling",
      value: Number.parseFloat((losses.soilingLoss * 100).toFixed(2)),
      color: COLORS[4],
    },
    {
      name: "Mismatch",
      value: Number.parseFloat((losses.mismatchLoss * 100).toFixed(2)),
      color: COLORS[5],
    },
    {
      name: "IAM / Reflection",
      value: Number.parseFloat((losses.iamLoss * 100).toFixed(2)),
      color: COLORS[6],
    },
  ].filter((d) => d.value > 0);

  const rows = [
    {
      label: "Temperature Losses",
      value: losses.temperatureLoss,
      format: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    {
      label: "Shading Losses",
      value: losses.shadingLoss,
      format: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    {
      label: "Wiring Losses",
      value: losses.wiringLoss,
      format: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    {
      label: "Inverter Efficiency",
      value: 1 - losses.inverterEfficiency,
      format: (v: number) => `${((1 - v) * 100).toFixed(0)}% eff.`,
    },
    {
      label: "Soiling Factor",
      value: losses.soilingLoss,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
    },
    {
      label: "Module Mismatch",
      value: losses.mismatchLoss,
      format: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    {
      label: "IAM / Reflection",
      value: losses.iamLoss,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
    },
  ];

  return (
    <Card className="card-solar">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          System Losses Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="lg:w-64 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a2035",
                    border: "1px solid #3a4a6a",
                    borderRadius: "8px",
                    color: "#f0f4ff",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#a0b4d0", fontWeight: 600 }}
                  itemStyle={{ color: "#f0f4ff" }}
                  formatter={(value: number, name: string) => [
                    `${Number(value).toFixed(2)}%`,
                    name,
                  ]}
                  labelFormatter={(label) => `Loss Type: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Loss table */}
          <div className="flex-1 space-y-2">
            {rows.map(({ label, value, format }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-foreground flex-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted/30 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, value * 400)}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-solar-gold w-14 text-right">
                    {format(value)}
                  </span>
                </div>
              </div>
            ))}

            <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Total System Efficiency
              </span>
              <span className="text-lg font-bold font-display text-solar-green">
                {(losses.totalEfficiency * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
