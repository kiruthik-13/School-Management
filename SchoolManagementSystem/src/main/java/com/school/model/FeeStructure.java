package com.school.model;

import java.sql.Date;

public class FeeStructure {

    private int feeStructureId;
    private String className;
    private String feeType;
    private double amount;
    private Date dueDate;

    public int getFeeStructureId() {
        return feeStructureId;
    }

    public void setFeeStructureId(int feeStructureId) {
        this.feeStructureId = feeStructureId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }
}