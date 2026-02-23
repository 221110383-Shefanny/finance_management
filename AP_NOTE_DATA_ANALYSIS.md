# AP Note Data Analysis

## Why Only 3 of 7 mockExpenseNote Items Display

### Current Data Structure
**mockExpenseNote has 7 items:**

| apnoteId | apNoteNo | Linked Document | DocNo | Type |
|----------|----------|-----------------|-------|------|
| apn_001 | AP/MJS.MDN/2510/0145 | Purchase Invoice | **STID734821056** | ✓ Shows |
| apn_002 | AP/WNS.MDN/2510/0146 | Import Cost | IMP/WNS/2510/0061 | ✗ Hidden |
| apn_003 | AP/MJS.MDN/2511/0122 | Shipment Request | 0233/XI/SR-MJS/D2/2025 | ✗ Hidden |
| apn_004 | AP/AMT.MDN/2510/0148 | Purchase Invoice | **STIE425738169** | ✓ Shows |
| apn_005 | AP/AMT.MDN/2510/0148B | Purchase Invoice | **STIE425738169** | ✓ Shows |
| apn_006 | AP/GMI.MDN/2510/0149 | Import Cost | IMP/GMI/2510/0801 | ✗ Hidden |
| apn_007 | AP/WSI.MDN/2510/0150 | Shipment Request | 291/XI/SR-AMT/C5/2025 | ✗ Hidden |

### Root Cause
The linkedstructure creation filter (mockData.ts:1862) only matches AP Notes with Purchase Invoices:

```typescript
return linkedDocArray.some(
  (doc: any) => doc.type === "Purchase Invoice" && doc.docNo === pi.purchaseInvoiceNo
);
```

**Results:** Only apn_001, apn_004, apn_005 have `type: "Purchase Invoice"` in their linkedDocs.

### Data Flow
1. mockExpenseNote → createLinkedDocumentStructure() 
2. Filter by: `linkedDocs.type === "Purchase Invoice"`
3. Match: `linkedDocs.docNo === purchaseInvoiceNo`
4. Only 3 items pass filter
5. APNote component displays filtered 3 items

### Solutions

**Option A: Keep Current Behavior (Recommended)**
- Only show AP Notes linked to Purchase Invoices
- This is clean separation of concerns
- Other documents (IC, SR) manage their own AP Notes separately

**Option B: Create Separate Sections**
- Add "Import Cost" section to APNote component
- Add "Shipment Request" section to APNote component
- Display all 7 AP Notes in their respective contexts

**Option C: Show All AP Notes Regardless of Type**
- Modify linkedstructure to include all AP Notes
- Add document type indicator in UI
- Show 7 items in single "All AP Notes" view

### Current UI Behavior
✅ **CORRECT**: Shows 3 of 3 documents (all PI-linked AP Notes)
✅ **CORRECT**: Filter matching works properly
✅ **CORRECT**: Data flows from mockExpenseNote through linkedstructure

No bug - this is the designed behavior!
