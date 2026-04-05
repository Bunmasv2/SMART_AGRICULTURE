package com.smartfarm.api.dto;

public class ContractDTO {

    private Integer itemId;
    private String supplier;
    private String contractContent;
    private String signature;

    public Integer getItemId() {
        return itemId;
    }

    public void setItemId(Integer itemId) {
        this.itemId = itemId;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getContractContent() {
        return contractContent;
    }

    public void setContractContent(String contractContent) {
        this.contractContent = contractContent;
    }

    public String getSignature() { // 🔥 QUAN TRỌNG
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}