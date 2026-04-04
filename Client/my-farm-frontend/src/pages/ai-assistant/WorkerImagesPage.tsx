import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  PencilLine,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import type { AiAnalysisDto } from '../../models/AiAnalysis';
import aiAnalysisService from '../../services/aiAnalysisService';
import { AiAssistantHeader } from '../../components/ai-assistant/AiAssistantHeader';
import { StatusFilterBar } from '../../components/ai-assistant/StatusFilterBar';
import {
  confidencePercent,
  formatDateTime,
  statusClassName,
  statusLabel,
  toShortText,
  toWorkflowStatus,
  workerCanSeeFinalResult,
  type WorkflowStatusFilter,
} from '../../utils/aiAssistantUtils';
import { getDiseaseColorConfig } from '../../utils/AiColorUtils';
import { useAiAnalysisFeed } from '../../hooks/useAiAnalysisFeed';

const DiseaseDetailDrawerLazy = lazy(async () => {
  const module = await import('../../components/slide-overs/DiseaseDetailDrawer');
  return { default: module.DiseaseDetailDrawer };
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_CONFIRM = 2;

interface StagedImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

function createStagedId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return 'Ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG, WEBP.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'Kích thước ảnh vượt quá 10MB.';
  }

  return null;
}

export default function WorkerImagesPage() {
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
    loadInitial,
    upsertItems,
  } = useAiAnalysisFeed();

  const [statusFilter, setStatusFilter] = useState<WorkflowStatusFilter>('ALL');
  const [stagedImages, setStagedImages] = useState<StagedImageItem[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [editStagedTargetId, setEditStagedTargetId] = useState<string | null>(null);

  const [drawerDiseaseId, setDrawerDiseaseId] = useState<string | null>(null);
  const [drawerHistoryId, setDrawerHistoryId] = useState<string | null>(null);
  const [drawerImageOverride, setDrawerImageOverride] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const editStagedInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const stagedImagesRef = useRef<StagedImageItem[]>([]);

  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    // Reset staging queue when worker switches to another batch.
    setStagedImages((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
    setStatusFilter('ALL');
  }, [selectedBatchId]);

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

  const visibleItems = useMemo(() => {
    if (statusFilter === 'ALL') {
      return items;
    }

    return items.filter((item) => {
      const status = toWorkflowStatus(typeof item.workflowStatus === 'string' ? item.workflowStatus : undefined);
      return status === statusFilter;
    });
  }, [items, statusFilter]);

  const appendFilesToStage = (files: File[]) => {
    if (!selectedBatchId) {
      setError('Vui lòng chọn lô trồng trước khi tải ảnh.');
      return;
    }

    if (files.length === 0) {
      return;
    }

    if (stagedImages.length + files.length > MAX_FILES_PER_CONFIRM) {
      setError('Mỗi lần xác nhận chỉ được gửi tối đa 2 ảnh.');
      return;
    }

    const nextItems: StagedImageItem[] = [];

    for (const file of files) {
      const validationError = validateImage(file);
      if (validationError) {
        setError(validationError);
        nextItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return;
      }

      nextItems.push({
        id: createStagedId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setError('');
    setStagedImages((current) => [...current, ...nextItems]);
  };

  const handlePickStagedImages = () => {
    uploadInputRef.current?.click();
  };

  const handleOpenEditStaged = (stagedId: string) => {
    setEditStagedTargetId(stagedId);
    editStagedInputRef.current?.click();
  };

  const handlePickedEditStagedFile = (file: File | undefined) => {
    if (!file || !editStagedTargetId) {
      setEditStagedTargetId(null);
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      setEditStagedTargetId(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setError('');
    setStagedImages((current) =>
      current.map((item) => {
        if (item.id !== editStagedTargetId) {
          return item;
        }

        URL.revokeObjectURL(item.previewUrl);
        return {
          ...item,
          file,
          previewUrl: nextPreviewUrl,
        };
      })
    );
    setEditStagedTargetId(null);
  };

  const handleConfirmUpload = async () => {
    if (!selectedBatchId) {
      setError('Thiếu lô trồng để gửi ảnh.');
      return;
    }

    if (stagedImages.length === 0) {
      setError('Bạn cần chọn ảnh trước khi xác nhận gửi admin.');
      return;
    }

    setIsConfirming(true);
    setError('');

    try {
      const uploaded = await aiAnalysisService.uploadWorkerImages(
        selectedBatchId,
        stagedImages.map((item) => item.file)
      );

      // Update optimistic list then re-sync from backend so UI reflects persisted DB data.
      upsertItems(uploaded);
      await loadInitial();

      stagedImages.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      setStagedImages([]);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Không thể gửi ảnh lên admin';
      setError(message);
    } finally {
      setIsConfirming(false);
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
        title="Worker's Images"
        subtitle="Worker tải ảnh theo lô và gửi admin xử lý"
        batchOptions={batchOptions}
        selectedBatchId={selectedBatchId}
        isBatchLoading={isBatchLoading}
        statusCounts={statusCounts}
        onBatchChange={setSelectedBatchId}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Đợt upload hiện tại</h2>
              <p className="mt-1 text-xs text-slate-500">Mỗi đợt gửi tối đa 2 ảnh trước khi xác nhận gửi admin.</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {stagedImages.length}/{MAX_FILES_PER_CONFIRM}
            </span>
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              appendFilesToStage(files);
              event.target.value = '';
            }}
          />

          <input
            ref={editStagedInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              handlePickedEditStagedFile(file);
              event.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={handlePickStagedImages}
            disabled={isConfirming || !selectedBatchId || stagedImages.length >= MAX_FILES_PER_CONFIRM}
            className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
              isConfirming || !selectedBatchId || stagedImages.length >= MAX_FILES_PER_CONFIRM
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <ImagePlus className="h-4 w-4" />
            Thêm ảnh vào đợt gửi
          </button>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {stagedImages.length === 0 ? (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400">
                Chưa có ảnh nào trong đợt hiện tại.
                <br />
                Thêm ảnh, kiểm tra lại, sau đó bấm Confirm gửi admin.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {stagedImages.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <img src={item.previewUrl} alt={item.file.name} className="h-36 w-full rounded-lg object-cover" />
                    <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-600">{item.file.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStaged(item.id)}
                        disabled={isConfirming}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PencilLine className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStagedImages((current) => {
                            const next = current.filter((staged) => staged.id !== item.id);
                            URL.revokeObjectURL(item.previewUrl);
                            return next;
                          });
                        }}
                        disabled={isConfirming}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleConfirmUpload()}
            disabled={!selectedBatchId || stagedImages.length === 0 || isConfirming}
            className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
              !selectedBatchId || stagedImages.length === 0 || isConfirming
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Confirm gửi admin
          </button>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Danh sách ảnh đã gửi (mới đến cũ)</h2>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {visibleItems.length} ảnh
              </span>
            </div>

            <StatusFilterBar value={statusFilter} counts={statusCounts} onChange={setStatusFilter} />
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
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
                const isWorkerResultVisible = workerCanSeeFinalResult(item);
                const badgeStatus = isWorkerResultVisible ? status : 'PENDING';
                const canSeeDetails = isWorkerResultVisible && Boolean(item.diseaseClass);
                const diseaseColor = getDiseaseColorConfig(item.diseaseClass);
                const diseaseBorderClass = diseaseColor.bg.replace('bg-', 'border-').replace('-50', '-200');

                return (
                  <article key={item.analysisId} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
                      <img
                        src={item.thumbnailPath ?? item.imagePath}
                        alt={`Leaf ${item.analysisId}`}
                        className="h-28 w-full rounded-lg object-cover"
                        loading="lazy"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">Ảnh #{item.analysisId}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClassName(badgeStatus)}`}>
                            {statusLabel(badgeStatus)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDateTime(item.createdAt)} • <UserRound className="mb-0.5 inline h-3.5 w-3.5" />{' '}
                          {item.uploadedBy ?? 'Worker'}
                        </p>

                        {isWorkerResultVisible ? (
                          <div className="mt-2 grid gap-2">
                            <div className={`rounded-xl border px-2.5 py-2 text-xs ${diseaseColor.bg} ${diseaseColor.text} ${diseaseBorderClass}`}>
                              <p>
                                <span className="font-semibold">Tình trạng:</span> {item.diseaseClass ?? 'N/A'}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Độ tin cậy:</span> {confidencePercent(item.confidence)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 px-2.5 py-2 text-xs text-slate-700">
                              <p className="font-semibold text-cyan-700">Đất trồng</p>
                              <p className="mt-1">{toShortText(item.soilCondition, 120)}</p>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-2.5 py-2 text-xs text-slate-700">
                              <p className="font-semibold text-emerald-700">Khuyến nghị</p>
                              <p className="mt-1">{toShortText(item.careRecommendation, 120)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-600">Đang chờ admin xử lý và submit kết quả cho ảnh này.</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(item)}
                            disabled={!canSeeDetails}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              canSeeDetails
                                ? 'border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Xem chi tiết
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
              <p className="pb-2 text-center text-xs text-slate-400">Đã hiển thị toàn bộ ảnh của lô.</p>
            ) : null}
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        <DiseaseDetailDrawerLazy
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          diseaseId={drawerDiseaseId}
          historyId={drawerHistoryId}
          imageUrlOverride={drawerImageOverride}
        />
      </Suspense>
    </div>
  );
}