# linkedDocs Structure in mockExpenseNote

## Current Items in mockExpenseNote

### 1. apn_001 - AP/MJS.MDN/2510/0145
```typescript
linkedDocs: {
  type: "Purchase Invoice",
  docNo: "STID734821056",
  pairedPO: "PO/MJS.MDN/2510/8472",
}
```
- **Type**: Purchase Invoice
- **Document No**: STID734821056
- **Paired PO**: PO/MJS.MDN/2510/8472

---

### 2. apn_002 - AP/IMI.MDN/2512/0004
```typescript
linkedDocs: [
  {
    type: "Purchase Order",
    docNo: "I.PO/IMI.MDN/2511/0052"
  },
  {
    type: "Import Cost",
    docNo: "IMP/IMI/2511/0071"
  }
]
```
- **Link 1**: Purchase Order → I.PO/IMI.MDN/2511/0052
- **Link 2**: Import Cost → IMP/IMI/2511/0071

---

## Structure Format

**Option A: Single Object (apn_001)**
```typescript
linkedDocs: {
  type: string,
  docNo: string,
  pairedPO?: string
}
```

**Option B: Array of Objects (apn_002)**
```typescript
linkedDocs: [
  { type: string, docNo: string },
  { type: string, docNo: string },
  ...
]
```

## Supported Document Types
- Purchase Invoice
- Purchase Order
- Import Cost
- Shipment Request
