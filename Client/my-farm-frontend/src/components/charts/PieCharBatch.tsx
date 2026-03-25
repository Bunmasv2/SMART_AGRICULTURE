import { ChartPieIcon } from "lucide-react";
import EmptyState from "../EmptyState";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";
import type { Batch, BatchStatus } from "../../models/Batch";
import CustomLabel from "../CustomLabel";

type PieCharBatchProps = {
    batches: Batch[]
}

const STATUS_CONFIG: Record<BatchStatus, { label: string; color: string }> = {
    ACTIVE: { label: 'Active', color: '#10b981' },
    WARNING: { label: 'Warning', color: '#f59e0b' },
    HARVESTING: { label: 'Harvesting', color: '#3b82f6' },
    COMPLETED: { label: 'Completed', color: '#94a3b8' }
};

export default function PieCharBatch({ batches }: PieCharBatchProps) {
    const statusData = useMemo(() => {
        if (!batches) return [];

        const counts = batches.reduce((acc: Record<string, number>, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts).map(k => ({
            name: k,
            value: counts[k]
        }));
    }, [batches]);

    return (
        <div className="p-6 h-64 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <ChartPieIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-500 uppercase text-[10px] tracking-widest">Trạng thái vận hành</h3>
            </div>
            <div className="flex-1 h-full relative z-10 p-2">
                <div className="flex-1 h-full">
                    {statusData.length === 0 ? (
                        <EmptyState message="Không có dữ liệu trạng thái" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={8}
                                    dataKey="value"
                                    labelLine={false}
                                    label={(props) => CustomLabel(props)}
                                >
                                    {statusData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={STATUS_CONFIG[entry.name as BatchStatus].color}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-5">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const value = statusData.find(s => s.name === key)?.value ?? 0;

                        return (
                            <div key={key} className="flex items-center gap-2 opacity-80">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-xs text-gray-700">
                                    {config.label}
                                </span>
                                <span className="text-xs font-semibold text-gray-900 ml-auto">
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
