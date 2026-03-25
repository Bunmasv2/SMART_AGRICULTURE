const fs = require('fs');
const path = require('path');

const dir = 'e:\\Hutech\\4_mon\\JEE\\Do_An\\SMART_AGRICULTURE\\Server\\farm-manager-api\\src\\main\\java\\com\\smartfarm\\api';

function walk(directory) {
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(function(file) {
        let fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.java')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk(dir);
let changedCount = 0;

files.forEach(file => {
    let originalContent = fs.readFileSync(file, 'utf8');
    let content = originalContent;
    const isAiAnalysis = path.basename(file).includes('AiAnalysis');
    
    if (!isAiAnalysis) {
        content = content.replace(/\bLong\b/g, 'Integer');
    } else {
        // Specifically for AiAnalysis* files, ONLY change variables that are NOT the primary key
        // The PK is `Long analysisId` and `Long id` in the service/repo
        
        // DTO
        content = content.replace(/Long pBatchId/g, 'Integer pBatchId');
        
        // Service
        content = content.replace(/findByBatchId\(Long pBatchId\)/g, 'findByBatchId(Integer pBatchId)');
        
        // Repository
        content = content.replace(/findByPlantingBatchPBatchId\(Long\b/g, 'findByPlantingBatchPBatchId(Integer');
        
        // Controller
        content = content.replace(/findByBatchId\(@PathVariable Long batchId\)/g, 'findByBatchId(@PathVariable Integer batchId)');
        content = content.replace(/findByBatchId\(@PathVariable Long pBatchId\)/g, 'findByBatchId(@PathVariable Integer pBatchId)');
        
        // General lists (if any)
        content = content.replace(/List<Long>/g, 'List<Integer>'); 
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        changedCount++;
    }
});
console.log('Finished refactoring ' + changedCount + ' files.');
