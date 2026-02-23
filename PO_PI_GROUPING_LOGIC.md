# PO & PI Grouping Logic Documentation

## Location
File: `src/components/PVR.tsx`
Lines: 8515-8544 (groupRelatedDocuments function)
Dialog: Linked Documents Dialog (lines 8455-8780)

## Overview
The grouping system organizes related documents (PO, PI, EN, IC, SR) into logical containers based on their **Purchase Order Number (poNo)**.

---

## How It Works

### 1. **Filtering Stage** (Lines 8478-8499)
```typescript
const filteredDocs = linkedDocs.filter((doc) => {
  const isValidType = doc.documentType === "PI" || doc.documentType === "SR" || 
                      doc.documentType === "IC" || doc.documentType === "EN" || 
                      doc.documentType === "PO";
  
  const hasValidNumber = 
    doc.documentType === "PO"
      ? (doc.poNo && doc.poNo.trim() !== "") || (doc.invoiceNo && doc.invoiceNo.trim() !== "")
      : doc.piNo && doc.piNo.trim() !== "";
  
  return isValidType && hasValidNumber;
});
```
**Purpose**: Remove invalid documents before grouping
**Valid Types**: PI, SR, IC, EN, PO
**Valid Numbers**: 
- PO: needs `poNo` OR `invoiceNo`
- Others: needs `piNo`

---

### 2. **Core Grouping Logic** (Lines 8515-8544)
```typescript
const groupRelatedDocuments = (docs: typeof linkedDocs) => {
  const groups: { poNumber: string; documents: typeof linkedDocs }[] = [];
  const processedIds = new Set<string>();

  docs.forEach((doc) => {
    if (!processedIds.has(doc.id)) {
      // STEP 1: Get the PO number from current document
      const poNumber = doc.poNo || "";
      
      // STEP 2: Find ALL documents with the SAME poNumber
      const relatedGroup = docs.filter((d) => {
        const hasSamePO = d.poNo === poNumber;
        const isRelatedType = d.documentType === "PI" || d.documentType === "PO" || 
                             d.documentType === "EN" || d.documentType === "SR" || 
                             d.documentType === "IC";
        return hasSamePO && isRelatedType;
      });

      // STEP 3: Mark all related docs as processed
      relatedGroup.forEach((d) => processedIds.add(d.id));
      
      // STEP 4: Add group to results
      groups.push({
        poNumber: poNumber,
        documents: relatedGroup,
      });
    }
  });

  return groups;
};
```

### **Algorithm Flow**
1. Initialize empty groups array and processedIds Set
2. **For each document**:
   - If not already processed:
     - Extract its `poNo` value
     - Find ALL documents with the SAME `poNo` (related group)
     - Mark all related docs as processed (to avoid duplicates)
     - Add the group to results
3. Return all groups

### **Key Principle**
> **Documents are grouped by their `poNo` field. All documents with the SAME `poNo` are displayed together.**

---

## 3. **Rendering Stage** (Lines 8545-8677)

### Group Container (Lines 8564-8581)
```typescript
{documentGroups.map((group, groupIndex) => {
  // Get PO display name from mockPurchaseOrder
  const poDisplayName = (() => {
    const relatedPO = mockPurchaseOrder.find(
      (po) => po.poId === group.poNumber,
    );
    return relatedPO?.purchaseOrderNo || group.poNumber || "N/A";
  })();

  // Render group container with purple border
  return (
    <div
      key={`group-${groupIndex}`}
      className="border-2 border-purple-300 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white"
    >
      {/* Documents inside group */}
      <div className="space-y-2">
        {group.documents.map((doc, docIndex) => {
          // Render each document with type-specific styling
        })}
      </div>
    </div>
  );
})}
```

### Document Styling
Each document type has unique colors:
- **PI** (Purchase Invoice): Blue (#blue-200, #blue-600)
- **PO** (Purchase Order): Indigo (#indigo-200, #indigo-600)
- **IC** (Import Cost): Amber (#amber-200, #amber-600)
- **SR** (Shipment Request): Green (#green-200, #green-600)
- **EN** (Expense Note): Rose (#rose-200, #rose-600)

---

## 4. **Data Structure**

### Input: linkedDocs Array
```typescript
[
  {
    id: "pi-001",
    piNo: "PI/2025/001",
    poNo: "PO/2025/001",        // ← Grouping Key
    documentType: "PI",
    totalAmount: 10000,
    ...
  },
  {
    id: "po-001",
    poNo: "PO/2025/001",         // ← SAME poNo = Same Group
    invoiceNo: "PO/2025/001",
    documentType: "PO",
    totalAmount: 10000,
    ...
  },
  {
    id: "en-001",
    poNo: "PO/2025/002",         // ← DIFFERENT poNo = Different Group
    piNo: "EN/2025/001",
    documentType: "EN",
    ...
  }
]
```

### Output: Groups
```typescript
[
  {
    poNumber: "PO/2025/001",
    documents: [
      { ...PI document },
      { ...PO document }
    ]
  },
  {
    poNumber: "PO/2025/002",
    documents: [
      { ...EN document }
    ]
  }
]
```

---

## 5. **Critical Requirements for Proper Grouping**

### ✅ For PI and PO to Group Together:
```typescript
// Both must have the SAME poNo value
const pi = {
  poNo: "PO/2025/001",  // ← MUST MATCH
  documentType: "PI"
};

const po = {
  poNo: "PO/2025/001",  // ← MUST MATCH
  documentType: "PO"
};
```

### ✅ Example: Creating PVR from PO Page
```typescript
// In POCollapsible.tsx, when creating PVR:

// PI gets PO's purchaseOrderNo
const piDocument = {
  poNo: po.purchaseOrderNo,  // ← e.g., "PO/MJS.MDN/2510/8472"
  documentType: "PI"
};

// PO also gets same purchaseOrderNo
const poDocument = {
  poNo: po.purchaseOrderNo,  // ← SAME VALUE
  documentType: "PO"
};
```

---

## 6. **De-duplication Mechanism**

The `processedIds` Set ensures no document appears in multiple groups:

```typescript
const processedIds = new Set<string>();

docs.forEach((doc) => {
  if (!processedIds.has(doc.id)) {  // Skip if already processed
    const relatedGroup = docs.filter(...);
    relatedGroup.forEach((d) => processedIds.add(d.id));  // Mark as processed
    groups.push({ poNumber, documents: relatedGroup });
  }
});
```

**Why it matters:** If you iterate through all docs and each finds its related group, you could end up with duplicate entries. The Set prevents this.

---

## 7. **Navigation Logic** (Lines 8632-8647)

Each document is clickable and dispatches events:
```typescript
onClick={() => {
  setShowLinkedDocsDialog(false);
  if (docType === "PI") {
    onNavigateToPurchaseInvoice?.(doc.piNo);
  } else if (docType === "PO") {
    onNavigateToPurchaseOrder?.(doc.poNo);
  } else if (docType === "EN") {
    onNavigateToAPNote?.(doc.piNo);
  } else if (docType === "IC") {
    onNavigateToImportCost?.(doc.piNo);
  } else if (docType === "SR") {
    onNavigateToShipmentRequest?.(doc.piNo);
  }
}}
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Grouping Key** | `doc.poNo` field |
| **Group Identifier** | poNumber string |
| **De-duplication** | processedIds Set |
| **Valid Doc Types** | PI, PO, EN, IC, SR |
| **Rendering** | Color-coded containers by document type |
| **Navigation** | Click to navigate to specific document |
| **Critical Requirement** | PI and PO MUST have same `poNo` to group together |

