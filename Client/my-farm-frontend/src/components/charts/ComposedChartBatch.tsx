import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { Bar, CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from "recharts";
import type { Batch } from "../../models/Batch";

type ComposedChartBatchhProps = {
    batches: Batch[]
}

export default function ComposedChartBatch({ batches }: ComposedChartBatchhProps) {
    return (
        <div className="p-6 h-80 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <PresentationChartBarIcon className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-500 uppercase text-[10px] tracking-widest">
                        Tương quan & Mật độ canh tác
                    </h3>
                </div>
            </div>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={batches} margin={{ top: 20, right: -10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="batchName"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />

                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    const density = (data.cropCount / data.areaM2).toFixed(2);

                                    return (
                                        <div className="bg-white p-3 shadow-xl rounded-xl border border-slate-100 min-w-[140px]">
                                            <p className="text-[11px] font-black text-slate-800 mb-2 border-b border-slate-50 pb-1 uppercase">
                                                {data.batchName}
                                            </p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center gap-4">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Số cây:</span>
                                                    <span className="text-xs font-black text-emerald-600">{data.cropCount}</span>
                                                </div>

                                                <div className="flex justify-between items-center gap-4">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Diện tích:</span>
                                                    <span className="text-xs font-black text-blue-500">{data.areaM2}m²</span>
                                                </div>

                                                <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-slate-50">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase">Mật độ:</span>
                                                    <span className="text-xs font-black text-slate-700">{density} cây/m²</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Bar
                            yAxisId="left"
                            dataKey="cropCount"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        >
                            <LabelList
                                dataKey="cropCount"
                                content={(props: LabelProps) => {
                                    const { x, y, width, index } = props;

                                    if (x == null || y == null || width == null || index == null) return null;

                                    const data = batches[index];
                                    if (!data || !data.areaM2) return null;

                                    const density = (data.cropCount / data.areaM2).toFixed(1);

                                    const xPos = Number(x);
                                    const yPos = Number(y);
                                    const w = Number(width);

                                    return (
                                        <text
                                            x={xPos + w / 2}
                                            y={yPos - 8}
                                            fill="#94a3b8"
                                            textAnchor="middle"
                                            fontSize="9"
                                            fontWeight="bold"
                                        >
                                            {density} c/m²
                                        </text>
                                    );
                                }}
                            />
                        </Bar>

                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="areaM2"
                            stroke="#60a5fa"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
