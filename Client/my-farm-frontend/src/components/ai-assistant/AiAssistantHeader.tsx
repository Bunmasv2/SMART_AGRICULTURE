import { Activity, CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PlantingBatchOption } from '../../models/AiAnalysis';
import type { StatusCounts } from '../../hooks/useAiAnalysisFeed';

interface AiAssistantHeaderProps {
  title: string;
  subtitle: string;
  batchOptions: PlantingBatchOption[];
  selectedBatchId: string;
  isBatchLoading: boolean;
  statusCounts: StatusCounts;
  onBatchChange: (batchId: string) => void;
}

interface BadgeProps {
  label: string;
  value: number;
  className: string;
  icon: ComponentType<{ className?: string }>;
}

function StatusBadge({ label, value, className, icon: Icon }: BadgeProps) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] leading-none">{value}</span>
    </div>
  );
}

export function AiAssistantHeader({
  title,
  subtitle,
  batchOptions,
  selectedBatchId,
  isBatchLoading,
  statusCounts,
  onBatchChange,
}: AiAssistantHeaderProps) {
  return (
    <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">AI Assistant</p>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="w-full max-w-sm">
          <label htmlFor="ai-batch-select" className="mb-1 block text-xs font-semibold text-slate-500">
            Chọn lô trồng
          </label>
          <select
            id="ai-batch-select"
            value={selectedBatchId}
            disabled={isBatchLoading}
            onChange={(event) => onBatchChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {batchOptions.length === 0 ? (
              <option value="">Không có lô trồng</option>
            ) : null}
            {batchOptions.map((batch) => (
              <option key={batch.pBatchId} value={String(batch.pBatchId)}>
                {batch.pBatchId} - {batch.batchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatusBadge
          label="Pending"
          value={statusCounts.PENDING}
          icon={Clock3}
          className="border-amber-200 bg-amber-50 text-amber-700"
        />
        <StatusBadge
          label="Processing"
          value={statusCounts.PROCESSING}
          icon={Loader2}
          className="border-sky-200 bg-sky-50 text-sky-700"
        />
        <StatusBadge
          label="Completed"
          value={statusCounts.COMPLETED}
          icon={CheckCircle2}
          className="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <StatusBadge
          label="Failed"
          value={statusCounts.FAILED}
          icon={XCircle}
          className="border-rose-200 bg-rose-50 text-rose-700"
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Activity className="h-3.5 w-3.5 text-emerald-500" />
        Dữ liệu cập nhật realtime theo lô đã chọn
      </div>
    </div>
  );
}