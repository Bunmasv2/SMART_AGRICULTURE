import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AiAnalysisDto, PlantingBatchOption } from '../models/AiAnalysis';
import aiAnalysisService, {
  enrichAnalysisDto,
  normalizeWorkflowStatus,
  type AiWorkflowEvent,
} from '../services/aiAnalysisService';

const PAGE_SIZE = 20;
const BATCH_STORAGE_KEY = 'smart-agriculture:ai-selected-batch';

export interface StatusCounts {
  PENDING: number;
  PROCESSING: number;
  COMPLETED: number;
  FAILED: number;
}

const EMPTY_STATUS_COUNTS: StatusCounts = {
  PENDING: 0,
  PROCESSING: 0,
  COMPLETED: 0,
  FAILED: 0,
};

function normalizeStatus(status: string | undefined): keyof StatusCounts {
  const normalized = normalizeWorkflowStatus(status);
  if (normalized === 'PROCESSING' || normalized === 'COMPLETED' || normalized === 'FAILED') {
    return normalized;
  }
  return 'PENDING';
}

function toTimestamp(value: string | undefined): number {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function sortByNewestFirst(items: AiAnalysisDto[]): AiAnalysisDto[] {
  return [...items].sort((left, right) => {
    const createdDiff = toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    if (createdDiff !== 0) {
      return createdDiff;
    }

    return (right.analysisId ?? 0) - (left.analysisId ?? 0);
  });
}

function applyBatchFilter(items: AiAnalysisDto[], selectedBatchId: string): AiAnalysisDto[] {
  if (!selectedBatchId) {
    return [];
  }

  return items.filter((item) => String(item.pBatchId) === selectedBatchId);
}

function mergeItems(current: AiAnalysisDto[], incoming: AiAnalysisDto[], selectedBatchId: string): AiAnalysisDto[] {
  const map = new Map<number, AiAnalysisDto>();

  current.forEach((item) => {
    if (Number.isInteger(item.analysisId) && String(item.pBatchId) === selectedBatchId) {
      map.set(item.analysisId, item);
    }
  });

  incoming.forEach((item) => {
    const normalized = enrichAnalysisDto(item);
    if (Number.isInteger(normalized.analysisId) && String(normalized.pBatchId) === selectedBatchId) {
      map.set(normalized.analysisId, normalized);
    }
  });

  return sortByNewestFirst(Array.from(map.values()));
}

function getStoredBatchId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = window.localStorage.getItem(BATCH_STORAGE_KEY);
  return typeof stored === 'string' ? stored : '';
}

function persistBatchId(batchId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (batchId) {
    window.localStorage.setItem(BATCH_STORAGE_KEY, batchId);
    return;
  }

  window.localStorage.removeItem(BATCH_STORAGE_KEY);
}

export function useAiAnalysisFeed() {
  const [batchOptions, setBatchOptions] = useState<PlantingBatchOption[]>([]);
  const [selectedBatchId, setSelectedBatchIdState] = useState<string>(getStoredBatchId);
  const [items, setItems] = useState<AiAnalysisDto[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>(EMPTY_STATUS_COUNTS);

  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState('');

  const selectedBatch = useMemo(
    () => batchOptions.find((item) => String(item.pBatchId) === selectedBatchId) ?? null,
    [batchOptions, selectedBatchId]
  );

  const setSelectedBatchId = useCallback((batchId: string) => {
    setIsStreamReady(false);
    // Keep data scoped to the active batch only.
    setItems([]);
    setHasMore(false);
    setNextPage(1);
    setSelectedBatchIdState(batchId);
    persistBatchId(batchId);
  }, []);

  const upsertItems = useCallback((incoming: AiAnalysisDto[]) => {
    if (!incoming.length || !selectedBatchId) {
      return;
    }

    setItems((current) => mergeItems(current, incoming, selectedBatchId));
  }, [selectedBatchId]);

  const upsertItem = useCallback((incoming: AiAnalysisDto) => {
    upsertItems([incoming]);
  }, [upsertItems]);

  const removeItem = useCallback((analysisId: number) => {
    setItems((current) => current.filter((item) => item.analysisId !== analysisId));
  }, []);

  const loadBatchOptions = useCallback(async () => {
    setIsBatchLoading(true);
    setError('');
    try {
      const options = await aiAnalysisService.getPlantingBatchOptions();
      setBatchOptions(options);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Không thể tải danh sách lô trồng';
      setError(message);
      setBatchOptions([]);
    } finally {
      setIsBatchLoading(false);
    }
  }, []);

  const loadInitial = useCallback(async () => {
    if (!selectedBatchId) {
      setItems([]);
      setHasMore(false);
      setNextPage(1);
      setIsStreamReady(false);
      return;
    }

    setIsLoadingInitial(true);
    setError('');

    try {
      const firstPage = await aiAnalysisService.getLeafItemsByBatch(selectedBatchId, {
        order: 'desc',
        page: 0,
        size: PAGE_SIZE,
      });

      const filtered = applyBatchFilter(firstPage, selectedBatchId);
      setItems(sortByNewestFirst(filtered));
      setHasMore(filtered.length === PAGE_SIZE);
      setNextPage(1);
      setIsStreamReady(true);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Không thể tải danh sách ảnh';
      setError(message);
      setItems([]);
      setHasMore(false);
      setNextPage(1);
      setIsStreamReady(false);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [selectedBatchId]);

  const loadMore = useCallback(async () => {
    if (!selectedBatchId || !hasMore || isLoadingInitial || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError('');

    try {
      const pageItems = await aiAnalysisService.getLeafItemsByBatch(selectedBatchId, {
        order: 'desc',
        page: nextPage,
        size: PAGE_SIZE,
      });

      const filtered = applyBatchFilter(pageItems, selectedBatchId);
      setItems((current) => mergeItems(current, filtered, selectedBatchId));
      setHasMore(filtered.length === PAGE_SIZE);
      setNextPage((value) => value + 1);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Không thể tải thêm dữ liệu';
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingInitial, isLoadingMore, nextPage, selectedBatchId]);

  const handleSseEvent = useCallback((event: AiWorkflowEvent) => {
    const deletedAnalysisId = typeof event.analysisId === 'number' ? event.analysisId : null;

    if (event.eventType === 'analysis_deleted' && deletedAnalysisId !== null) {
      removeItem(deletedAnalysisId);
      return;
    }

    if (!event.item) {
      return;
    }

    if (String(event.item.pBatchId) !== selectedBatchId) {
      return;
    }

    upsertItem(event.item);
  }, [removeItem, selectedBatchId, upsertItem]);

  useEffect(() => {
    void loadBatchOptions();
  }, [loadBatchOptions]);

  useEffect(() => {
    if (batchOptions.length === 0) {
      return;
    }

    const exists = batchOptions.some((batch) => String(batch.pBatchId) === selectedBatchId);
    // When no batch is selected (or stored batch is invalid), default to the first option.
    if (!selectedBatchId || !exists) {
      setSelectedBatchId(String(batchOptions[0].pBatchId));
    }
  }, [batchOptions, selectedBatchId, setSelectedBatchId]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!selectedBatchId || !isStreamReady) {
      return undefined;
    }

    return aiAnalysisService.subscribeToBatchStream(selectedBatchId, handleSseEvent, () => {
      // Keep stream resilient and avoid showing noisy network errors.
    });
  }, [handleSseEvent, isStreamReady, selectedBatchId]);

  useEffect(() => {
    const nextCounts = items.reduce<StatusCounts>((counts, item) => {
      const status = normalizeStatus(typeof item.workflowStatus === 'string' ? item.workflowStatus : undefined);
      counts[status] += 1;
      return counts;
    }, {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    });

    setStatusCounts(nextCounts);
  }, [items]);

  return {
    batchOptions,
    selectedBatch,
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
    loadInitial,
    loadMore,
    upsertItem,
    upsertItems,
    removeItem,
  };
}