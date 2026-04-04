package com.smartfarm.api.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisWorkflowEventDto;

@Service
public class AiAnalysisSseService {

    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L; // 30 minutes

    private final Map<Integer, List<SseEmitter>> emittersByBatch = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Integer pBatchId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emittersByBatch.computeIfAbsent(pBatchId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(pBatchId, emitter));
        emitter.onTimeout(() -> removeEmitter(pBatchId, emitter));
        emitter.onError(error -> removeEmitter(pBatchId, emitter));

        sendEvent(pBatchId, emitter, "connected", AiAnalysisWorkflowEventDto.builder()
                .eventType("connected")
                .message("SSE connected")
                .pBatchId(pBatchId)
                .build());

        return emitter;
    }

    public void publish(Integer pBatchId, String eventType, String message, Integer analysisId, AiAnalysisDto item) {
        AiAnalysisWorkflowEventDto eventPayload = AiAnalysisWorkflowEventDto.builder()
                .eventType(eventType)
                .message(message)
                .pBatchId(pBatchId)
                .analysisId(analysisId)
                .item(item)
                .build();

        List<SseEmitter> emitters = emittersByBatch.getOrDefault(pBatchId, List.of());
        for (SseEmitter emitter : emitters) {
            sendEvent(pBatchId, emitter, eventType, eventPayload);
        }
    }

    public void publishHeartbeat(Integer pBatchId) {
        List<SseEmitter> emitters = emittersByBatch.getOrDefault(pBatchId, List.of());
        for (SseEmitter emitter : emitters) {
            sendEvent(pBatchId, emitter, "heartbeat", AiAnalysisWorkflowEventDto.builder()
                    .eventType("heartbeat")
                    .message("heartbeat")
                    .pBatchId(pBatchId)
                    .build());
        }
    }

    private void sendEvent(Integer pBatchId, SseEmitter emitter, String name, AiAnalysisWorkflowEventDto payload) {
        try {
            emitter.send(SseEmitter.event()
                    .name(name)
                    .data(payload));
        } catch (IOException | RuntimeException exception) {
            removeEmitter(pBatchId, emitter);
            try {
                emitter.complete();
            } catch (RuntimeException ignored) {
                // Ignore completion failures for closed or broken emitters.
            }
        }
    }

    private void removeEmitter(Integer pBatchId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByBatch.get(pBatchId);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByBatch.remove(pBatchId);
        }
    }
}
