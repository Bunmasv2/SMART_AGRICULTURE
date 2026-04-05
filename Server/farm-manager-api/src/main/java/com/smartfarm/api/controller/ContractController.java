package com.smartfarm.api.controller;

import com.smartfarm.api.dto.*;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.repository.UserRepository;
import com.smartfarm.api.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Random;
import com.smartfarm.api.entity.Contract;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.repository.ContractRepository;
import com.smartfarm.api.repository.InventoryItemRepository;

@RestController
@RequestMapping("api/contracts")
@CrossOrigin
public class ContractController {

    @Autowired
    private ContractRepository contractRepo;

    @Autowired
    private InventoryItemRepository itemRepo;

    @PostMapping
    public ResponseEntity<?> createContract(@RequestBody ContractDTO req) {

        InventoryItem item = itemRepo.findById(req.getItemId())
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));

        if (req.getSignature() == null || req.getSignature().isEmpty()) {
            return ResponseEntity.badRequest().body("Chưa ký hợp đồng!");
        }

        Contract contract = new Contract();
        contract.setItem(item);
        contract.setSupplier(req.getSupplier());
        contract.setContractContent(req.getContractContent());
        contract.setSignatureImage(req.getSignature());

        contractRepo.save(contract);

        return ResponseEntity.ok("Tạo hợp đồng thành công");
    }
}
