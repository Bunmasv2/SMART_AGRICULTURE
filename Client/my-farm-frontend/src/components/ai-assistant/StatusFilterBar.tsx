import type { StatusCounts } from '../../hooks/useAiAnalysisFeed';
import type { WorkflowStatusFilter } from '../../utils/aiAssistantUtils';

interface StatusFilterBarProps {
  value: WorkflowStatusFilter;
  counts: StatusCounts;
  onChange: (value: WorkflowStatusFilter) => void;
}

const FILTER_OPTIONS: Array<{
  value: WorkflowStatusFilter;
  label: string;
  className: string;
}> = [
  {
    value: 'ALL',
    label: 'Tất cả',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  {
    value: 'PENDING',
    label: 'Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'PROCESSING',
    label: 'Processing',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'FAILED',
    label: 'Failed',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

function getCount(option: WorkflowStatusFilter, counts: StatusCounts): number {
  if (option === 'ALL') {
    return counts.PENDING + counts.PROCESSING + counts.COMPLETED + counts.FAILED;
  }
  return counts[option];
}

export function StatusFilterBar({ value, counts, onChange }: StatusFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${option.className} ${
              isActive ? 'ring-2 ring-emerald-200' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <span>{option.label}</span>
            <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[11px] leading-none">
              {getCount(option.value, counts)}
            </span>
          </button>
        );
      })}
    </div>
  );
}