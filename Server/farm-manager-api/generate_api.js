const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'main', 'java', 'com', 'smartfarm', 'api');
const pkg = 'com.smartfarm.api';

// Create directories structure
const dirs = ['entity', 'dto', 'mapper', 'repository', 'service', 'controller'];
dirs.forEach(d => fs.mkdirSync(path.join(basePath, d), { recursive: true }));

// Generate ApiResponse
const apiResponseCode = `package ${pkg}.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(200, message, data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "Success", data);
    }

    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, message, null);
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return new ApiResponse<>(status, message, null);
    }
}
`;
fs.writeFileSync(path.join(basePath, 'dto', 'ApiResponse.java'), apiResponseCode);

// Schema definitions
const models = [
    {
        name: 'Role',
        table: 'Roles',
        idName: 'roleId',
        idType: 'Long',
        fields: [
            { name: 'roleId', type: 'Long', isId: true },
            { name: 'roleName', type: 'String' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "role_name", nullable = false, length = 50, unique = true)
    private String roleName;`
    },
    {
        name: 'User',
        table: 'Users',
        idName: 'userId',
        idType: 'Long',
        fields: [
            { name: 'userId', type: 'Long', isId: true },
            { name: 'fullName', type: 'String' },
            { name: 'email', type: 'String' },
            { name: 'passwordHash', type: 'String' },
            { name: 'roleId', type: 'Long', isRel: true, entityRef: 'Role', entityVar: 'role' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;`
    },
    {
        name: 'Crop',
        table: 'Crops',
        idName: 'cropId',
        idType: 'Long',
        fields: [
            { name: 'cropId', type: 'Long', isId: true },
            { name: 'cropName', type: 'String' },
            { name: 'variety', type: 'String' },
            { name: 'description', type: 'String' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crop_id")
    private Long cropId;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(name = "variety", length = 100)
    private String variety;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;`
    },
    {
        name: 'GrowthProcess',
        table: 'Growth_Processes',
        idName: 'processId',
        idType: 'Long',
        fields: [
            { name: 'processId', type: 'Long', isId: true },
            { name: 'cropId', type: 'Long', isRel: true, entityRef: 'Crop', entityVar: 'crop' },
            { name: 'processName', type: 'String' },
            { name: 'totalDays', type: 'Integer' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "process_id")
    private Long processId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id")
    private Crop crop;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;`
    },
    {
        name: 'Stage',
        table: 'Stages',
        idName: 'stageId',
        idType: 'Long',
        fields: [
            { name: 'stageId', type: 'Long', isId: true },
            { name: 'processId', type: 'Long', isRel: true, entityRef: 'GrowthProcess', entityVar: 'process' },
            { name: 'stageName', type: 'String' },
            { name: 'startDay', type: 'Integer' },
            { name: 'endDay', type: 'Integer' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stage_id")
    private Long stageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private GrowthProcess process;

    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @Column(name = "start_day", nullable = false)
    private Integer startDay;

    @Column(name = "end_day", nullable = false)
    private Integer endDay;`
    },
    {
        name: 'InventoryItem',
        table: 'Inventory_Items',
        idName: 'itemId',
        idType: 'Long',
        fields: [
            { name: 'itemId', type: 'Long', isId: true },
            { name: 'itemName', type: 'String' },
            { name: 'category', type: 'String' },
            { name: 'unit', type: 'String' },
            { name: 'minThreshold', type: 'Double' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "min_threshold")
    private Double minThreshold;`
    },
    {
        name: 'InventoryBatch',
        table: 'Inventory_Batches',
        idName: 'batchInvId',
        idType: 'Long',
        fields: [
            { name: 'batchInvId', type: 'Long', isId: true },
            { name: 'itemId', type: 'Long', isRel: true, entityRef: 'InventoryItem', entityVar: 'item' },
            { name: 'supplier', type: 'String' },
            { name: 'quantity', type: 'Double' },
            { name: 'expiryDate', type: 'LocalDate' },
            { name: 'receivedDate', type: 'LocalDateTime' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_inv_id")
    private Long batchInvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private InventoryItem item;

    @Column(name = "supplier", length = 100)
    private String supplier;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;`
    },
    {
        name: 'TaskTemplate',
        table: 'Task_Templates',
        idName: 'taskTmpId',
        idType: 'Long',
        fields: [
            { name: 'taskTmpId', type: 'Long', isId: true },
            { name: 'stageId', type: 'Long', isRel: true, entityRef: 'Stage', entityVar: 'stage' },
            { name: 'taskName', type: 'String' },
            { name: 'itemId', type: 'Long', isRel: true, entityRef: 'InventoryItem', entityVar: 'item' },
            { name: 'quantityRequired', type: 'Double' },
            { name: 'offsetDay', type: 'Integer' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_tmp_id")
    private Long taskTmpId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    @Column(name = "task_name", nullable = false, length = 100)
    private String taskName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private InventoryItem item;

    @Column(name = "quantity_required")
    private Double quantityRequired;

    @Column(name = "offset_day")
    private Integer offsetDay;`
    },
    {
        name: 'PlantingBatch',
        table: 'Planting_Batches',
        idName: 'pBatchId',
        idType: 'Long',
        fields: [
            { name: 'pBatchId', type: 'Long', isId: true },
            { name: 'batchName', type: 'String' },
            { name: 'cropId', type: 'Long', isRel: true, entityRef: 'Crop', entityVar: 'crop' },
            { name: 'processId', type: 'Long', isRel: true, entityRef: 'GrowthProcess', entityVar: 'process' },
            { name: 'areaM2', type: 'Double' },
            { name: 'locationCoords', type: 'String' },
            { name: 'startDate', type: 'LocalDate' },
            { name: 'status', type: 'String' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_batch_id")
    private Long pBatchId;

    @Column(name = "batch_name", nullable = false, length = 100)
    private String batchName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id")
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private GrowthProcess process;

    @Column(name = "area_m2")
    private Double areaM2;

    @Column(name = "location_coords")
    private String locationCoords;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "status")
    private String status;`
    },
    {
        name: 'Task',
        table: 'Tasks',
        idName: 'taskId',
        idType: 'Long',
        fields: [
            { name: 'taskId', type: 'Long', isId: true },
            { name: 'pBatchId', type: 'Long', isRel: true, entityRef: 'PlantingBatch', entityVar: 'plantingBatch' },
            { name: 'taskTmpId', type: 'Long', isRel: true, entityRef: 'TaskTemplate', entityVar: 'taskTemplate' },
            { name: 'title', type: 'String' },
            { name: 'plannedDate', type: 'LocalDate' },
            { name: 'actualDate', type: 'LocalDate' },
            { name: 'assignedTo', type: 'Long', isRel: true, entityRef: 'User', entityVar: 'assignedTo' },
            { name: 'status', type: 'String' },
            { name: 'notes', type: 'String' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_batch_id")
    private PlantingBatch plantingBatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_tmp_id")
    private TaskTemplate taskTemplate;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "planned_date", nullable = false)
    private LocalDate plannedDate;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "status")
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;`
    },
    {
        name: 'AiAnalysis',
        table: 'AI_Analysis',
        idName: 'analysisId',
        idType: 'Long',
        fields: [
            { name: 'analysisId', type: 'Long', isId: true },
            { name: 'pBatchId', type: 'Long', isRel: true, entityRef: 'PlantingBatch', entityVar: 'plantingBatch' },
            { name: 'imagePath', type: 'String' },
            { name: 'resultJson', type: 'String' },
            { name: 'createdAt', type: 'LocalDateTime' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_batch_id")
    private PlantingBatch plantingBatch;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "result_json", columnDefinition = "JSON")
    private String resultJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;`
    },
    {
        name: 'WeatherAlert',
        table: 'Weather_Alerts',
        idName: 'alertId',
        idType: 'Long',
        fields: [
            { name: 'alertId', type: 'Long', isId: true },
            { name: 'pBatchId', type: 'Long', isRel: true, entityRef: 'PlantingBatch', entityVar: 'plantingBatch' },
            { name: 'alertType', type: 'String' },
            { name: 'description', type: 'String' },
            { name: 'createdAt', type: 'LocalDateTime' }
        ],
        entityAnnotations: `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_batch_id")
    private PlantingBatch plantingBatch;

    @Column(name = "alert_type", length = 50)
    private String alertType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;`
    }
];


// Capitalize function
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

models.forEach(m => {
    const lowerName = m.name.charAt(0).toLowerCase() + m.name.slice(1);

    // 1. Entity
    const entityCode = `package ${pkg}.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "${m.table}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ${m.name} {
${m.entityAnnotations}
}
`;
    fs.writeFileSync(path.join(basePath, 'entity', `${m.name}.java`), entityCode);

    // 2. DTO
    let dtoFields = m.fields.map(f => `    private ${f.type} ${f.name};`).join('\\n');
    const dtoCode = `package ${pkg}.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ${m.name}Dto {
${dtoFields}
}
`;
    fs.writeFileSync(path.join(basePath, 'dto', `${m.name}Dto.java`), dtoCode);

    // 3. Mapper
    let toDtoMappings = m.fields.map(f => {
        if (f.isRel) {
            return `        if (entity.get${capitalize(f.entityVar)}() != null) {
            dto.set${capitalize(f.name)}(entity.get${capitalize(f.entityVar)}().get${capitalize(f.name.replace('Id', ''))}Id());
        }`;
        } else {
            return `        dto.set${capitalize(f.name)}(entity.get${capitalize(f.name)}());`;
        }
    }).join('\\n');

    let toEntityMappings = m.fields.map(f => {
        if (f.isRel) {
            return `        if (dto.get${capitalize(f.name)}() != null) {
            ${f.entityRef} ${f.entityVar} = new ${f.entityRef}();
            ${f.entityVar}.set${capitalize(f.name.replace('Id', ''))}Id(dto.get${capitalize(f.name)}());
            entity.set${capitalize(f.entityVar)}(${f.entityVar});
        }`;
        } else {
            return `        entity.set${capitalize(f.name)}(dto.get${capitalize(f.name)}());`;
        }
    }).join('\\n');

    let entityImports = [...new Set(m.fields.filter(f => f.isRel).map(f => f.entityRef))].map(e => `import ${pkg}.entity.${e};`).join('\\n');

    const mapperCode = `package ${pkg}.mapper;

import ${pkg}.dto.${m.name}Dto;
import ${pkg}.entity.${m.name};
${entityImports}
import org.springframework.stereotype.Component;

@Component
public class ${m.name}Mapper {

    public ${m.name}Dto toDto(${m.name} entity) {
        if (entity == null) {
            return null;
        }
        ${m.name}Dto dto = new ${m.name}Dto();
${toDtoMappings}
        return dto;
    }

    public ${m.name} toEntity(${m.name}Dto dto) {
        if (dto == null) {
            return null;
        }
        ${m.name} entity = new ${m.name}();
${toEntityMappings}
        return entity;
    }
}
`;
    fs.writeFileSync(path.join(basePath, 'mapper', `${m.name}Mapper.java`), mapperCode);

    // 4. Repository
    const repoCode = `package ${pkg}.repository;

import ${pkg}.entity.${m.name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${m.name}Repository extends JpaRepository<${m.name}, ${m.idType}> {
}
`;
    fs.writeFileSync(path.join(basePath, 'repository', `${m.name}Repository.java`), repoCode);

    // 5. Service
    const serviceCode = `package ${pkg}.service;

import ${pkg}.dto.${m.name}Dto;
import ${pkg}.entity.${m.name};
import ${pkg}.mapper.${m.name}Mapper;
import ${pkg}.repository.${m.name}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ${m.name}Service {

    private final ${m.name}Repository ${lowerName}Repository;
    private final ${m.name}Mapper ${lowerName}Mapper;

    @Autowired
    public ${m.name}Service(${m.name}Repository ${lowerName}Repository, ${m.name}Mapper ${lowerName}Mapper) {
        this.${lowerName}Repository = ${lowerName}Repository;
        this.${lowerName}Mapper = ${lowerName}Mapper;
    }

    public List<${m.name}Dto> findAll() {
        return ${lowerName}Repository.findAll().stream()
                .map(${lowerName}Mapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<${m.name}Dto> findById(${m.idType} id) {
        return ${lowerName}Repository.findById(id).map(${lowerName}Mapper::toDto);
    }

    public ${m.name}Dto create(${m.name}Dto dto) {
        ${m.name} entity = ${lowerName}Mapper.toEntity(dto);
        ${m.name} saved = ${lowerName}Repository.save(entity);
        return ${lowerName}Mapper.toDto(saved);
    }

    public Optional<${m.name}Dto> update(${m.idType} id, ${m.name}Dto dto) {
        if (!${lowerName}Repository.existsById(id)) {
            return Optional.empty();
        }
        ${m.name} entity = ${lowerName}Mapper.toEntity(dto);
        entity.set${capitalize(m.idName)}(id); // Ensure the ID is not changed
        ${m.name} updated = ${lowerName}Repository.save(entity);
        return Optional.of(${lowerName}Mapper.toDto(updated));
    }

    public boolean deleteById(${m.idType} id) {
        if (${lowerName}Repository.existsById(id)) {
            ${lowerName}Repository.deleteById(id);
            return true;
        }
        return false;
    }
}
`;
    fs.writeFileSync(path.join(basePath, 'service', `${m.name}Service.java`), serviceCode);

    // 6. Controller
    const controllerPath = m.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + 's';
    const controllerCode = `package ${pkg}.controller;

import ${pkg}.dto.ApiResponse;
import ${pkg}.dto.${m.name}Dto;
import ${pkg}.service.${m.name}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${controllerPath}")
@CrossOrigin(origins = "*")
public class ${m.name}Controller {

    private final ${m.name}Service ${lowerName}Service;

    @Autowired
    public ${m.name}Controller(${m.name}Service ${lowerName}Service) {
        this.${lowerName}Service = ${lowerName}Service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<${m.name}Dto>>> getAll() {
        try {
            List<${m.name}Dto> data = ${lowerName}Service.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Error retrieving data: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<${m.name}Dto>> getById(@PathVariable ${m.idType} id) {
        return ${lowerName}Service.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("Resource not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<${m.name}Dto>> create(@RequestBody ${m.name}Dto dto) {
        try {
            ${m.name}Dto created = ${lowerName}Service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(created, "Created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Error creating resource: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<${m.name}Dto>> update(@PathVariable ${m.idType} id, @RequestBody ${m.name}Dto dto) {
        try {
            return ${lowerName}Service.update(id, dto)
                    .map(updated -> ResponseEntity.ok(ApiResponse.success(updated, "Updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("Resource not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Error updating resource: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable ${m.idType} id) {
        try {
            boolean deleted = ${lowerName}Service.deleteById(id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success(null, "Deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("Resource not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Error deleting resource: " + e.getMessage()));
        }
    }
}
`;
    fs.writeFileSync(path.join(basePath, 'controller', `${m.name}Controller.java`), controllerCode);
});
console.log("Generation completed.");
