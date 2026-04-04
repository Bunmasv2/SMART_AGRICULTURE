import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck,
  Crop as CropIcon,
  Eye,
  Loader2,
  RefreshCcw,
  ScanLine,
  Sparkles,
  Stars,
} from 'lucide-react';
import type { AiAnalysisDto } from '../../models/AiAnalysis';
import aiAnalysisService from '../../services/aiAnalysisService';
import { ImageCropModal } from '../../components/modals/ImageCropModal';
import { AiAssistantHeader } from '../../components/ai-assistant/AiAssistantHeader';
import { StatusFilterBar } from '../../components/ai-assistant/StatusFilterBar';
import {
  confidencePercent,
  formatDateTime,
  statusClassName,
  statusLabel,
  toShortText,
  toWorkflowStatus,
  type WorkflowStatusFilter,
} from '../../utils/aiAssistantUtils';
import { useAiAnalysisFeed } from '../../hooks/useAiAnalysisFeed';

const DiseaseDetailDrawerLazy = lazy(async () => {
  const module = await import('../../components/slide-overs/DiseaseDetailDrawer');
  return { default: module.DiseaseDetailDrawer };
});

interface CropTargetState {
  analysisId: number;
  imageUrl: string;
  sourceFileName: string;
}

function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function extractFileNameFromUrl(url: string | undefined, fallbackName: string): string {
  if (!url) {
    return fallbackName;
  }

  const parts = url.split('/');
  const last = parts[parts.length - 1] ?? '';
  return last.trim() || fallbackName;
}

export default function AnalyzeSymptomsPage() {
  const {
    batchOptions,
    selectedBatchId,
    setSelectedBatchId,
    statusCounts,
    items,
    hasMore,
    isBatchLoading,
    isLoadingInitial,
    isLoadingMore,
    error,
    setError,
    loadMore,
    upsertItem,
    upsertItems,
  } = useAiAnalysisFeed();

  const [bulkAdminNote, setBulkAdminNote] = useState('');
  const [adminNotesByAnalysis, setAdminNotesByAnalysis] = useState<Record<number, string>>({});
  const [isAnalyzeAllLoading, setIsAnalyzeAllLoading] = useState(false);
  const [workingAnalysisIds, setWorkingAnalysisIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<WorkflowStatusFilter>('ALL');

  const [cropTarget, setCropTarget] = useState<CropTargetState | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const [drawerDiseaseId, setDrawerDiseaseId] = useState<string | null>(null);
  const [drawerHistoryId, setDrawerHistoryId] = useState<string | null>(null);
  const [drawerImageOverride, setDrawerImageOverride] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    setStatusFilter('ALL');
  }, [selectedBatchId]);

  const visibleItems = useMemo(() => {
    if (statusFilter === 'ALL') {
      return items;
    }

    return items.filter((item) => {
      const status = toWorkflowStatus(typeof item.workflowStatus === 'string' ? item.workflowStatus : undefined);
      return status === statusFilter;
    });
  }, [items, statusFilter]);

  const setWorking = (analysisId: number, value: boolean) => {
    setWorkingAnalysisIds((current) => {
      if (value) {
        if (current.includes(analysisId)) {
          return current;
        }
        return [...current, analysisId];
      }

      return current.filter((id) => id !== analysisId);
    });
  };

  const getAdminNote = (analysisId: number): string => {
    return adminNotesByAnalysis[analysisId] ?? '';
  };

  const setAdminNote = (analysisId: number, note: string) => {
    setAdminNotesByAnalysis((current) => ({
      ...current,
      [analysisId]: note,
    }));
  };

  const runAnalyze = async (item: AiAnalysisDto, mode: 'analyze' | 'retry') => {
    setError('');
    setWorking(item.analysisId, true);

    const adminNote = getAdminNote(item.analysisId).trim();

    try {
      const next = mode === 'analyze'
        ? await aiAnalysisService.analyzeById(item.analysisId, adminNote)
        : await aiAnalysisService.retryById(item.analysisId, adminNote);

      upsertItem(next);
    } catch (analyzeError) {
      const message = analyzeError instanceof Error ? analyzeError.message : 'Không thể xử lý phân tích';
      setError(message);
    } finally {
      setWorking(item.analysisId, false);
    }
  };

  const runAnalyzeAll = async () => {
    if (!selectedBatchId) {
      setError('Vui lòng chọn lô trồng trước khi Analyze All.');
      return;
    }

    setIsAnalyzeAllLoading(true);
    setError('');

    try {
      const result = await aiAnalysisService.analyzeAll(selectedBatchId, bulkAdminNote.trim());
      upsertItems(result);
    } catch (analyzeError) {
      const message = analyzeError instanceof Error ? analyzeError.message : 'Không thể analyze toàn bộ ảnh';
      setError(message);
    } finally {
      setIsAnalyzeAllLoading(false);
    }
  };

  const runSelectFinal = async (analysisId: number) => {
    setWorking(analysisId, true);
    setError('');

    try {
      const selected = await aiAnalysisService.selectFinalResult(analysisId);
      upsertItem(selected);
    } catch (selectError) {
      const message = selectError instanceof Error ? selectError.message : 'Không thể chọn kết quả final';
      setError(message);
    } finally {
      setWorking(analysisId, false);
    }
  };

  const openCrop = (item: AiAnalysisDto) => {
    setCropTarget({
      analysisId: item.analysisId,
      imageUrl: item.imagePath,
      sourceFileName: extractFileNameFromUrl(item.imagePath, `analysis-${item.analysisId}.jpg`),
    });
    setIsCropOpen(true);
  };

  const handleConfirmCrop = async (blob: Blob) => {
    if (!cropTarget) {
      return;
    }

    const croppedFile = blobToFile(blob, `crop-${cropTarget.sourceFileName}`);
    const note = getAdminNote(cropTarget.analysisId).trim();

    setWorking(cropTarget.analysisId, true);
    setError('');

    try {
      const replaced = await aiAnalysisService.replaceImage(cropTarget.analysisId, croppedFile, note);
      upsertItem(replaced);
    } catch (cropError) {
      const message = cropError instanceof Error ? cropError.message : 'Không thể crop ảnh';
      setError(message);
    } finally {
      setWorking(cropTarget.analysisId, false);
      setCropTarget(null);
    }
  };

  const openDetails = (item: AiAnalysisDto) => {
    if (!item.diseaseClass) {
      return;
    }

    setDrawerDiseaseId(item.diseaseClass);
    setDrawerHistoryId(String(item.analysisId));
    setDrawerImageOverride(item.imagePath ?? null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <AiAssistantHeader
        title="Analyze Symptoms"
        subtitle="Admin phân tích ảnh theo lô, retry/crop/chọn final cho worker"
        batchOptions={batchOptions}
        selectedBatchId={selectedBatchId}
        isBatchLoading={isBatchLoading}
        statusCounts={statusCounts}
        onBatchChange={setSelectedBatchId}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label htmlFor="analyze-all-note" className="mb-1 block text-xs font-semibold text-slate-500">
              Admin note cho Analyze All (tùy chọn)
            </label>
            <textarea
              id="analyze-all-note"
              value={bulkAdminNote}
              onChange={(event) => setBulkAdminNote(event.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ví dụ: ưu tiên ảnh rõ gân lá, đủ ánh sáng, chụp cận cảnh"
            />
          </div>

          <button
            type="button"
            onClick={() => void runAnalyzeAll()}
            disabled={isAnalyzeAllLoading || !selectedBatchId}
            className={`inline-flex h-fit items-center justify-center gap-2 self-end rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              isAnalyzeAllLoading || !selectedBatchId
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAnalyzeAllLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze All
          </button>
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Danh sách ảnh cần phân tích (mới đến cũ)</h2>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{visibleItems.length} ảnh</span>
          </div>

          <StatusFilterBar value={statusFilter} counts={statusCounts} onChange={setStatusFilter} />
        </div>

        <div className="min-h-0 h-full space-y-3 overflow-y-auto pr-1">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải danh sách ảnh...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-10 text-center text-sm text-slate-400">
              Chưa có ảnh nào trong lô đã chọn.
            </div>
          ) : (
            visibleItems.map((item) => {
              const status = toWorkflowStatus(typeof item.workflowStatus === 'string' ? item.workflowStatus : undefined);
              const isWorking = workingAnalysisIds.includes(item.analysisId);
              const isSubmitted = Boolean(item.finalResult);
              const isCardLocked = isSubmitted || isWorking || isAnalyzeAllLoading;
              const canAnalyze = status === 'PENDING';
              const canRetry = status === 'FAILED';
              const canSelectFinal = status === 'COMPLETED';
              const canViewDetails = status === 'COMPLETED' && !isWorking;

              return (
                <article key={item.analysisId} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                    <img
                      src={item.thumbnailPath ?? item.imagePath}
                      alt={`Leaf ${item.analysisId}`}
                      className="h-32 w-full rounded-lg object-cover"
                      loading="lazy"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">Ảnh #{item.analysisId}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClassName(status)}`}>
                          {statusLabel(status)}
                        </span>
                        {item.finalResult ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Final cho Worker
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(item.createdAt)} • Upload bởi: {item.uploadedBy ?? 'Worker'}
                      </p>

                      {status === 'PROCESSING' ? (
                        <div className="mt-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-sky-100">
                            <div className="h-full w-1/3 animate-[ai-progress_1.2s_ease-in-out_infinite] rounded-full bg-sky-500" />
                          </div>
                          <p className="mt-1 text-[11px] text-sky-700">Đang phân tích, vui lòng chờ...</p>
                        </div>
                      ) : null}

                      {status === 'COMPLETED' ? (
                        <div className="mt-2 grid gap-1 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-slate-700 md:grid-cols-2">
                          <p>
                            <span className="font-semibold">Tình trạng:</span> {item.diseaseClass ?? 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">Độ tin cậy:</span> {confidencePercent(item.confidence)}
                          </p>
                          <p>
                            <span className="font-semibold">Đất trồng:</span> {toShortText(item.soilCondition, 44)}
                          </p>
                          <p>
                            <span className="font-semibold">Khuyến nghị:</span> {toShortText(item.careRecommendation, 44)}
                          </p>
                        </div>
                      ) : null}

                      {status === 'FAILED' ? (
                        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-700">
                          {toShortText(item.errorMessage || 'Phân tích thất bại. Cần worker chụp lại ảnh rõ hơn.')}
                        </p>
                      ) : null}

                      <label htmlFor={`admin-note-${item.analysisId}`} className="mt-3 block text-[11px] font-semibold text-slate-500">
                        Admin note
                      </label>
                      <textarea
                        id={`admin-note-${item.analysisId}`}
                        rows={2}
                        value={getAdminNote(item.analysisId)}
                        onChange={(event) => setAdminNote(item.analysisId, event.target.value)}
                        disabled={isCardLocked}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Gợi ý worker chụp ảnh rõ hơn, đúng góc hoặc crop lại"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void runAnalyze(item, 'analyze')}
                          disabled={!canAnalyze || isCardLocked}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isWorking && canAnalyze ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanLine className="h-3.5 w-3.5" />}
                          Analyze
                        </button>

                        <button
                          type="button"
                          onClick={() => void runAnalyze(item, 'retry')}
                          disabled={!canRetry || isCardLocked}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" /> Retry
                        </button>

                        <button
                          type="button"
                          onClick={() => openCrop(item)}
                          disabled={status === 'PROCESSING' || isCardLocked}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CropIcon className="h-3.5 w-3.5" /> Crop Image
                        </button>

                        <button
                          type="button"
                          onClick={() => void runSelectFinal(item.analysisId)}
                          disabled={!canSelectFinal || isCardLocked}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            isSubmitted
                              ? 'border border-emerald-300 bg-emerald-100 text-emerald-700'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCheck className="h-3.5 w-3.5" /> {isSubmitted ? 'Submitted' : 'Submit'}
                        </button>

                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          disabled={!canViewDetails}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            canViewDetails
                              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          <div ref={loadMoreRef} className="h-10" />

          {isLoadingMore ? (
            <div className="flex items-center justify-center py-2 text-xs text-slate-400">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Đang tải thêm...
            </div>
          ) : null}

          {!hasMore && visibleItems.length > 0 ? (
            <p className="pb-2 text-center text-xs text-slate-400">
              <Stars className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
              Đã hiển thị toàn bộ ảnh của lô.
            </p>
          ) : null}
        </div>
      </section>

      <ImageCropModal
        isOpen={isCropOpen}
        imageUrl={cropTarget?.imageUrl ?? null}
        title="Crop image trước khi phân tích"
        onClose={() => {
          setIsCropOpen(false);
          setCropTarget(null);
        }}
        onConfirm={handleConfirmCrop}
      />

      <Suspense fallback={null}>
        <DiseaseDetailDrawerLazy
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          diseaseId={drawerDiseaseId}
          historyId={drawerHistoryId}
          imageUrlOverride={drawerImageOverride}
        />
      </Suspense>

      <style>{`
        @keyframes ai-progress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </div>
  );
}
