package com.smartfarm.api.service;

import com.smartfarm.api.dto.PlantingBatchDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.entity.TaskTemplate;
import com.smartfarm.api.mapper.PlantingBatchMapper;
import com.smartfarm.api.repository.PlantingBatchRepository;
import com.smartfarm.api.repository.TaskRepository;
import com.smartfarm.api.repository.TaskTemplateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlantingBatchService {

    private final TaskRepository taskRepository;
    private final PlantingBatchRepository plantingBatchRepository;
    private final PlantingBatchMapper plantingBatchMapper;
    private final TaskTemplateRepository taskTemplateRepository;

    @Autowired
    public PlantingBatchService(PlantingBatchRepository plantingBatchRepository,
            PlantingBatchMapper plantingBatchMapper, TaskRepository taskRepository,
            TaskTemplateRepository taskTemplateRepository) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.plantingBatchMapper = plantingBatchMapper;
        this.taskRepository = taskRepository;
        this.taskTemplateRepository = taskTemplateRepository;
    }

    public List<PlantingBatchDto> findAll() {
        return plantingBatchRepository.findAll().stream().map(plantingBatchMapper::toDto).collect(Collectors.toList());
    }

    public List<PlantingBatchDto> findByStatus(String status) {
        return plantingBatchRepository.findByStatus(status).stream().map(plantingBatchMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<PlantingBatchDto> findById(Integer id) {
        return plantingBatchRepository.findById(id).map(plantingBatchMapper::toDto);
    }

    public PlantingBatchDto create(PlantingBatchDto dto) {
        // 1. Chuyển DTO sang Entity và lưu PlantingBatch
        PlantingBatch entity = plantingBatchMapper.toEntity(dto);

        // Gán trạng thái mặc định nếu chưa có
        if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
            entity.setStatus("ACTIVE");
        }

        PlantingBatch savedBatch = plantingBatchRepository.save(entity);

        // 2. Tự động sinh danh sách Task nếu lô canh tác có chọn Process
        if (dto.getProcessId() != null) {
            // Lấy tất cả TaskTemplate thuộc quy trình này
            List<TaskTemplate> templates = taskTemplateRepository.findByProcessId(dto.getProcessId());

            if (!templates.isEmpty()) {
                List<Task> tasksToCreate = new ArrayList<>();
                LocalDate batchStartDate = savedBatch.getStartDate();

                for (TaskTemplate template : templates) {
                    // Tính toán ngày dự kiến: Ngày bắt đầu lô + Số ngày bù
                    int offsetDays = (template.getOffsetDay() != null) ? template.getOffsetDay() : 0;
                    LocalDate plannedDate = batchStartDate.plusDays(offsetDays);

                    // Tạo Task mới từ Template
                    Task newTask = Task.builder()
                            .plantingBatch(savedBatch)
                            .taskTemplate(template)
                            .title(template.getTaskName())
                            .plannedDate(plannedDate)
                            .status("PENDING") // Trạng thái ban đầu của Task
                            .build();

                    tasksToCreate.add(newTask);
                }

                // Lưu toàn bộ Task vào database bằng batch insert
                taskRepository.saveAll(tasksToCreate);
            }
        }

        // 3. Trả về DTO của lô canh tác vừa tạo
        return plantingBatchMapper.toDto(savedBatch);
    }

    public Optional<PlantingBatchDto> update(Integer id, PlantingBatchDto dto) {
        if (!plantingBatchRepository.existsById(id))
            return Optional.empty();
        PlantingBatch entity = plantingBatchMapper.toEntity(dto);
        entity.setPBatchId(id);
        return Optional.of(plantingBatchMapper.toDto(plantingBatchRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!plantingBatchRepository.existsById(id))
            return false;
        plantingBatchRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void deleteMultipleByIds(List<Integer> ids) {
        plantingBatchRepository.deleteAllByIdInBatch(ids);
    }
}
