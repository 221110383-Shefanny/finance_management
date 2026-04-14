import { Currency } from "lucide-react";
import {
  calculateNetTotal,
  calculateItemTotal,
} from "../utils/apNoteCalculations";

// PURCHASE ORDER
export const mockPurchaseOrder = [
  {
    poId: "po_001",
    purchaseOrderNo: "PO/MJS.MDN/2510/8472",
    supplierName: "PT Maju Jaya",
    traceCode: "Medan",
    ptCompany: "MJS",
    poStatus: "Complete",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Import",
    totalAmount: 3035000,
    otherTotal: 30000,
    currency: "IDR",
    otherCosts: [
      { id: "oc-1", costAmount: 15000, description: "Shipping Fee" },
       { id: "oc-2", costAmount: 15000, description: "Handling Fee" }
    ],
    grandTotal: 3065000,
    internalRemarks: "",
    history: [],
    items: [
      {
        id: "item-1",
        itemCode: "SVC-001",
        itemName: "Service Liferaft",
        description: "Service Liferaft",
        quantity: 1,
        pricePerQty: 3000000,
        totalAmount: 3000000,
        uom: "Unit",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-001",
        purpose: "Manufacturing",
        pphApplicable: true,
      },
      {
        id: "item-2",
        itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "Production",
        reqBy: "Buyer B",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STID734821056",
    },
  },

  {
    poId: "po_002",
    purchaseOrderNo: "PO/AMT.MDN/2510/6892",
    supplierName: "CV Berkah Sentosa",
    ptCompany: "AMT",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Import",
    totalAmount: 1000000,
    otherTotal: 0,
    currency: "IDR",
    grandTotal: 1000000,

    internalRemarks: "",
    history: [],
    items: [
      {
        id: "item-1",
        itemCode: "FAS-001",
        itemName: "Fasteners Mixed",
        description: "Fasteners Mixed",
        quantity: 1,
        pricePerQty: 1000000,
        totalAmount: 1000000,
        uom: "BOX",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-003",
        purpose: "Assembly",
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STIE425738169",
    },
  },

  {
    poId: "po_003",
    purchaseOrderNo: "PO/GMI.MDN/2510/3457",
    supplierName: "PT Indo Supplies",
    ptCompany: "GMI",
    poStatus: "Complete",
    createdBy: "Buyer C",
    createDate: "18/10/2025",
    approvalDate: "20/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Import",
    category: "Logistic",
    totalAmount: 300000,  
    otherTotal: 5000,
    grandTotal: 305000,
    currency: "IDR",

    internalRemarks: "",
    history: [],
    items: [
      {
        id: "item-1",
        itemCode: "CT-001",
        itemName: "Copper Tubing",
        description: "Copper Tubing",
        quantity: 15,
        pricePerQty: 20000,
        totalAmount: 300000,
        uom: "ROLL",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-004",
        purpose: "Fabrication",
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STIG738492051",
    },
  },

  {
    poId: "po_004",
    purchaseOrderNo: "PO/WNS.MDN/2510/7258",
    supplierName: "PT Karya Abadi",
    ptCompany: "WNS",
    poStatus: "Complete",
    createdBy: "Buyer D",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Loading",
    category: "Logistic",
    totalAmount: 95000000,
    otherTotal: 0,
    grandTotal: 95000000,
    currency: "IDR",

    internalRemarks: "",
    history: [],
    items: [
      {
        id: "item-1",
        itemCode: "IND-001",
        itemName: "Industrial Materials",
        description: "Industrial Materials",
        quantity: 200,
        pricePerQty: 475000,
        totalAmount: 95000000,
        uom: "TON",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-005",
        purpose: "Manufacturing",
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STIC639417582",
    },
  },
  {
    poId: "po_005",
    purchaseOrderNo: "PO/MJS.MDN/2511/0122",
    supplierName: "PT Karya Abadi",
    ptCompany: "MJS",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Loading",
    category: "Logistic",
    totalAmount: 95000000,
    otherTotal: 0,
    grandTotal: 95000000,
    currency: "IDR",
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 200,
        pricePerQty: 475000,
        totalAmount: 95000000,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID638419982",
      },
      {
        type: "Shipment Request",
        docNo: "0233/XI/SR-MJS/D2/2025",
      },
    ],
  },
  {
    poId: "po_006",
    purchaseOrderNo: "PO/MJS.MDN/2510/0644",
    supplierName: "PT Karya Abadi",
    ptCompany: "MJS",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Direct Loading",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    internalRemarks: "",
    history: [],
    items: [],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID638410022",
      },
      {
        type: "Shipment Request",
        docNo: "0487/XI/SR-MJS/D2/2025",
      },
    ],
  },
  {
    poId: "po_007",
    purchaseOrderNo: "I.PO/IMI.MDN/2511/0052",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Overseas",
    poType: "Credit",
    deliveryType: "Direct Loading",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",  
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID638410233",
      },
      {
        type: "Import Cost",
        docNo: "IMP/IMI/2511/0071",
      },
    ],
  },
  {
    poId: "po_008",
    purchaseOrderNo: "I.PO/IMI.MDN/2511/0032",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    poStatus: "Outstanding",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Overseas",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",  
    internalRemarks: "",
    history: [],
    items: [],
    linkedDocs: [

    ],
  },
  {
    poId: "po_009",
    purchaseOrderNo: "I.PO/IMI.MDN/2511/0009",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Overseas",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    internalRemarks: "",
    history: [],
    items: [
         {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID638410266",
      },
      {
        type: "Import Cost",
        docNo: "IMP/IMI/2511/0044",
      },
    ],
  },
  {
    poId: "po_010",
    purchaseOrderNo: "I.PO/IMI.MDN/2511/0046",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    poStatus: "Complete",
    createdBy: "Buyer A",
    createDate: "01/01/2026",
    vendorOrigin: "Overseas",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    internalRemarks: "",
    history: [],
    items: [
        {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID638410277",
      },
      {
        type: "Import Cost",
        docNo: "IMP/IMI/2511/0044",
      },
    ],
  },
  {
    poId: "po_011",
    purchaseOrderNo: "PO/MJS.MDN/2510/0472",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    poStatus: "Complete",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Urgent",
    deliveryType: "Borongan",
    totalAmount: 65000,
    otherTotal: 20000,
    currency: "IDR",
    otherCosts: [
      { id: "oc-1", costAmount: 10000, description: "Shipping Fee" },
       { id: "oc-2", costAmount: 10000, description: "Handling Fee" }
    ],
    grandTotal: 85000,
    internalRemarks: "",
    history: [],
    items: [
      {
        id: "item-1",
        itemCode: "SC-001",
        itemName: "Steel Coils - Grade A",
        description: "Steel Coils - Grade A",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-001",
        purpose: "Manufacturing",
      },
      {
        id: "item-2",
        itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STID734821555",
    },
  },
    {
    poId: "po_012",
    purchaseOrderNo: "PO/MJS.MDN/2510/0444",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    poStatus: "Complete",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Urgent",
    deliveryType: "Borongan",
    totalAmount: 65000,
    otherTotal: 20000,
    currency: "IDR",
    otherCosts: [
      { id: "oc-1", costAmount: 10000, description: "Shipping Fee" },
       { id: "oc-2", costAmount: 10000, description: "Handling Fee" }
    ],
    grandTotal: 85000,
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
       itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 50000,
        totalAmount: 50000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 1,
      },
       {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },
    ],
    linkedDocs: {
      type: "Purchase Invoice",
      docNo: "STID734826000",
    },
  },
      {
    poId: "po_013",
    purchaseOrderNo: "PO/IMI.MDN/2601/0001",
    supplierName: "PT Maju Jaya",
    ptCompany: "IMI",
    poStatus: "Complete",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 65000,
    currency: "EUR",
    otherTotal: 0,
    otherCosts: [
     
    ],
    grandTotal: 65000,
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
       itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        
      },
       {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID123456781",
      },
      {
        type: "Purchase Invoice",
        docNo: "STID789191112"
      }
    ],
    
  },
   {
    poId: "po_014",
    purchaseOrderNo: "PO/IMI.MDN/2601/0221",
    supplierName: "PT Maju Jaya",
    ptCompany: "IMI",
    poStatus: "Partial",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 65000,
    otherTotal: 0,
    currency: "IDR",
    otherCosts: [
     
    ],
    grandTotal: 65000,
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
       itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        
      },
       {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID123456222",
      },
      
    ],
    
  },
   {
    poId: "po_015",
    purchaseOrderNo: "PO/GMI.MDN/2601/0314",
    supplierName: "PT Winner Technology",
    ptCompany: "GMI",
    poStatus: "Outstanding",
    createdBy: "Buyer B",
    createDate: "18/10/2025",
    vendorOrigin: "Local",
    poType: "Credit",
    deliveryType: "Borongan",
    totalAmount: 30000,
    otherTotal: 0,
    currency: "IDR",
    otherCosts: [
     
    ],
    grandTotal: 30000,
    internalRemarks: "",
    history: [],
    items: [
       {
        id: "item-1",
       itemCode: "AL-002",
        itemName: "Annual Calibration",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        
      },
      
    ],
    linkedDocs: [
      {
        id: "reim_001",
        documentNo: "REIM/GMI.MDN/2602/0314",
        documentType: "Reimburse Without PO",
        date: "20/02/2026",
        status: "COMPLETE",
        amount: 3445900,
      },
    ],
    
  },
];

// {
//     poId: "po_005",
//     purchaseOrderNo: "",
//     supplierName: "",
//     ptCompany: "",
//     createdBy: "",
//     createDate: "",
//     totalAmount: 0,
//     otherTotal: 0,
//     grandTotal: 0,
//     status: "",
//     internalRemarks: "",
//     history: [],
// }

// PURCHASE INVOICE
export const mockpurchaseInvoice = [
  // sudah submit
  {
    piId: "pi_001",
    purchaseInvoiceNo: "STID734821056",
    noPO: "PO/MJS.MDN/2510/8472",
    poId: "po_001",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    totalAmount: 3035000,
    otherTotal: 30000,
    currency: "IDR",
    otherCosts: [
    {id: "oc-1", costAmount: 15000, description: "Shipping Fee" },
      {id: "oc-2", costAmount: 15000, description: "Handling Fee" }
    ],
    grandTotal: 3065000,
    downPayment: 3065000,
    outstanding: 0,
    
    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
         id: "item-1",
        itemCode: "SVC-001",
        itemName: "Service Liferaft",
        description: "Service Liferaft",
        quantity: 1,
        pricePerQty: 3000000,
        totalAmount: 3000000,
        uom: "Unit",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-001",
        purpose: "Manufacturing",
        pphApplicable: true,
        returned:0,
      },
      {
         id: "item-2",
        itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned:0,
      },
    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: "28/10/2025",
    
        linkedDocs: [
      {
        type: "Shipment Request",
        docNo: "SR/MJS.MDN/2510/0012",
      },
      {
        type: "Import Cost",
        docNo: "IMP/MJS/2510/0008",
      },
      {
        type: "AP Note",
        docNo: "AP/MJS.MDN/2510/0145",
      },
      {
        type: "Purchase Return",
        docNo: "PR/MJS.D0/2601/0001",
      },
      {
        type: "Payment Voucher",
        docNo: "PV/MJS.MDN/2510/0110",
      },
    ],
    history: [
      {
        id: "1-1",
        timestamp: new Date("2025-10-28T09:30:00"),
        action: "VERIFIED",
        description: "Invoice verified by system administrator",
        referenceNo: "REF-001-2025",
      },
      {
        id: "1-2",
        timestamp: new Date("2025-10-28T14:15:00"),
        action: "SUBMITTED",
        description: "Invoice submitted for processing",
      },
    ],
  },

  {
    piId: "pi_002",
    purchaseInvoiceNo: "STIE425738169",
    noPO: "PO/AMT.MDN/2510/6892",
    poId: "po_002",
    supplierName: "CV Berkah Sentosa",
    ptCompany: "AMT",
    warehouse: "MEDAN",
    totalAmount: 1000000,
    otherTotal: 0,
    grandTotal: 1000000,
    downPayment: 0,
    outstanding: 0,
    currency: "IDR",
    internalRemarks: "",
    items: [
        {
        id: "item-1",
        itemCode: "FAS-001",
        itemName: "Fasteners Mixed",
        description: "Fasteners Mixed",
        quantity: 1,
        pricePerQty: 1000000,
        totalAmount: 1000000,
        uom: "BOX",
          toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-003",
        purpose: "Assembly",
        returned: 0,
      },
    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: null,
    docReceivedDate: "31/10/2025",
    

    linkedDocs: [],
    history: [],
  },
  {
    piId: "pi_003",
    purchaseInvoiceNo: "STIG738492051",
    noPO: "PO/GMI.MDN/2510/3457",
    poId: "po_003",
    supplierName: "PT Indo Supplies",
    ptCompany: "GMI",
    warehouse: "MEDAN",
    totalAmount: 300000,
    otherTotal: 5000,
    currency: "IDR",
    otherCosts: [
      { id: "oc-1", costAmount: 2500, description: "Shipping Fee" },
       { id: "oc-2", costAmount: 2500, description: "Handling Fee" }
    ],
    grandTotal: 305000,
    downPayment: 0,
    outstanding: 0,
    
    internalRemarks: "Express processing",
    referenceNo: "EXP-003-2025",
    referenceDate: "2025-10-27",
    items: [
       {
        id: "item-1",
        itemCode: "CT-001",
        itemName: "Copper Tubing",
        description: "Copper Tubing",
        quantity: 15,
        pricePerQty: 20000,
        totalAmount: 300000,
        uom: "ROLL",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-004",
        purpose: "Fabrication",
        returned:0,
      },
    ],
    checkStatus: false,
    receivedStatus: true,
    pendingStatus: true,
    pendingReason: "Awaiting supplier confirmation on delivery date",
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "",
    submissionDate: null,
    documentType: "Bunker",
    picPI: "ELLVA",
    docReceivedDate: "29/10/2025",


    history: [
      {
        id: "3-1",
        timestamp: new Date("2025-10-27T11:00:00"),
        action: "RECEIVED_DOCUMENT",
        description: "Document received, NOT_VERIFIED",
        referenceNo: "EXP-003-2025",
      },
    ],
    linkedDocs: [],
  },
  {
    piId: "pi_004",
    purchaseInvoiceNo: "STIC639417582",
    noPO: "PO/WNS.MDN/2510/7258",
    poId: "po_004",
    supplierName: "PT Karya Abadi",
    ptCompany: "WNS",
    warehouse: "MEDAN",
    totalAmount: 95000000,
    otherTotal: 0,
    grandTotal: 95000000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,

    internalRemarks:
      "Documents received but validation pending",
    items: [
     {
        id: "item-1",
        itemCode: "IND-001",
        itemName: "Industrial Materials",
        description: "Industrial Materials",
        quantity: 200,
        pricePerQty: 475000,
        totalAmount: 95000000,
        uom: "TON",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-005",
        purpose: "Manufacturing",
        returned:0,
      },
    ],
    checkStatus: false,
    receivedStatus: true,
    pendingStatus: true,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",

    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: "VANNESA",
    docReceivedDate: "29/10/2025",

   
    history: [
      {
        id: "4-1",
        timestamp: new Date("2025-10-29T08:00:00"),
        action: "VERIFIED",
        description: "Document verified, awaiting submission",
      },
    ],
    linkedDocs: [],
  },
  {
    piId: "pi_005",
    purchaseInvoiceNo: "STID638419982",
    noPO: "PO/MJS.MDN/2511/0122",
    poId: "po_005",
    supplierName: "PT Karya Abadi",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    totalAmount: 95000000,
    otherTotal: 0,
    grandTotal: 95000000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,

    internalRemarks:
      "Documents received but validation pending",
    items: [
      {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 200,
        pricePerQty: 475000,
        totalAmount: 95000000,
        returned: 0,
      },
    ],
    checkStatus: false,
    receivedStatus: false,
    pendingStatus: true,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
 
    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: "VANNESA",
    docReceivedDate: null,
  
    history: [],
    linkedDocs: [],
  },
  {
    piId: "pi_006",
    purchaseInvoiceNo: "STID638410022",
    noPO: "PO/MJS.MDN/2510/0644",
    poId: "po_006",
    supplierName: "PT Karya Abadi",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,
   
    internalRemarks:
      "Documents received but validation pending",
    items: [
      {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 200,
        pricePerQty: 475000,
        totalAmount: 95000000,
        returned: 0,
      },
    ],
    checkStatus: false,
    receivedStatus: false,
    pendingStatus: false,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",

    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: "VANNESA",
    docReceivedDate: null,
 
    history: [],
    linkedDocs: [],
  },
  {
    piId: "pi_007",
    purchaseInvoiceNo: "STID638410233",
    noPO: "I.PO/IMI.MDN/2511/0052",
    poId: "po_007",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,
   
    internalRemarks:
      "Documents received but validation pending",
    items: [
      {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
        returned: 0,
      },
    ],
    checkStatus: false,
       receivedStatus: false,
    pendingStatus: false,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    picPI: "VANNESA",
    docReceivedDate: null,
    
    history: [],
    linkedDocs: [],
  },

  {
    piId: "pi_009",
    purchaseInvoiceNo: "STID638410266",
    noPO: "I.PO/IMI.MDN/2511/0009",
    poId: "po_008",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,
 

    internalRemarks:
      "Documents received but validation pending",
    items: [
      {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
        returned: 0,
      },
    ],
    checkStatus: false,
    receivedStatus: false,
    pendingStatus: false,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",

    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: "VANNESA",
    docReceivedDate: null,

    history: [],
    linkedDocs: [],
  },
  {
    piId: "pi_010",
    purchaseInvoiceNo: "STID638410277",
    noPO: "I.PO/IMI.MDN/2511/0046",
    poId: "po_009",
    supplierName: "PT Karya Abadi",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 100000,
    otherTotal: 0,
    grandTotal: 100000,
    currency: "IDR",
    downPayment: 0,
    outstanding: 0,
 
    internalRemarks:
      "Documents received but validation pending",
    items: [
      {
        id: "item-1",
        description: "Industrial Materials",
        quantity: 1,
        pricePerQty: 100000,
        totalAmount: 100000,
        returned: 0,
      },
    ],
    checkStatus: false,
    receivedStatus: false,
    pendingStatus: false,
    status: "NOT_VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "",
    submissionDate: null,
    documentType: "",
    picPI: "VANNESA",
    docReceivedDate: null,

    history: [],
    linkedDocs: [],
  },
  {
    piId: "pi_010",
    purchaseInvoiceNo: "STID734821555",
    noPO: "PO/MJS.MDN/2510/0472",
    poId: "po_001",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    totalAmount: 65000,
    otherTotal: 20000,
    currency: "IDR",
    otherCosts: [
    {id: "oc-1", costAmount: 10000, description: "Shipping Fee" },
      {id: "oc-2", costAmount: 10000, description: "Handling Fee" }
    ],
    grandTotal: 85000,
    downPayment: 85000,
    outstanding: 0,
    
    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
        id: "item-1",
        description: "Steel Coils - Grade A",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        returned: 0,
      },
      {
        id: "item-2",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 35000 ,
        totalAmount: 35000,
        returned: 0,
      },
    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: null
    ,
    
        linkedDocs: [
      {
        type: "Shipment Request",
        docNo: "SR/MJS.MDN/2510/0012",
      },
      {
        type: "Import Cost",
        docNo: "IMP/MJS/2510/0008",
      },
    ],
    history: [
      {
        id: "1-1",
        timestamp: new Date("2025-10-28T09:30:00"),
        action: "VERIFIED",
        description: "Invoice verified by system administrator",
        referenceNo: "REF-001-2025",
      },
      {
        id: "1-2",
        timestamp: new Date("2025-10-28T14:15:00"),
        action: "SUBMITTED",
        description: "Invoice submitted for processing",
      },
    ],
  },
   {
    piId: "pi_011",
    purchaseInvoiceNo: "STID734826000",
    noPO: "PO/MJS.MDN/2510/0444",
    poId: "po_011",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    totalAmount: 65000,
    otherTotal: 20000,
    currency: "IDR",
    otherCosts: [
    {id: "oc-1", costAmount: 10000, description: "Shipping Fee" },
      {id: "oc-2", costAmount: 10000, description: "Handling Fee" }
    ],
    grandTotal: 85000,
    downPayment: 85000,
    outstanding: 0,
    
    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
        id: "item-1",
       itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 50000,
        totalAmount: 50000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 1,
      },
      {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },
    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: null,
    
        linkedDocs: [
      {
        type: "Shipment Request",
        docNo: "SR/MJS.MDN/2510/0012",
      },
      {
        type: "Import Cost",
        docNo: "IMP/MJS/2510/0008",
      },
      {
        type: "Purchase Return",
        docNo: "PR/MJS.D0/6501/0001",
      },
    ],
    history: [
      {
        id: "1-1",
        timestamp: new Date("2025-10-28T09:30:00"),
        action: "VERIFIED",
        description: "Invoice verified by system administrator",
        referenceNo: "REF-001-2025",
      },
      {
        id: "1-2",
        timestamp: new Date("2025-10-28T14:15:00"),
        action: "SUBMITTED",
        description: "Invoice submitted for processing",
      },
    ],
  },
  {
    piId: "pi_012",
    purchaseInvoiceNo: "STID123456781",
    noPO: "PO/IMI.MDN/2601/0001",
    poId: "po_013",
    supplierName: "PT Maju Jaya",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 30000,
    otherTotal: 0,
    currency: "IDR",
    otherCosts: [
    ],
    grandTotal: 30000,
    downPayment: 0,
    outstanding: 30000,

    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
        id: "item-1",
        itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        pricePerQty: 30000,
        totalAmount: 30000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",

      },

    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: null,

    linkedDocs: [

    ],
    history: [

    ],
  },
    {
    piId: "pi_013",
    purchaseInvoiceNo: "STID789191112",
    noPO: "PO/IMI.MDN/2601/0001", 
    poId: "po_013",
    supplierName: "PT Maju Jaya",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 35000,
    otherTotal: 0,
    currency: "EUR",
    otherCosts: [
    ],
    grandTotal: 35000,
    downPayment: 0,
    outstanding: 35000,

    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },

    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: "28/10/2025",

    linkedDocs: [

    ],
    history: [

    ],
  },
   {
    piId: "pi_014",
    purchaseInvoiceNo: "STID123456222",
    noPO: "PO/IMI.MDN/2601/0221", 
    poId: "po_014",
    supplierName: "PT Maju Jaya",
    ptCompany: "IMI",
    warehouse: "MEDAN",
    totalAmount: 35000,
    otherTotal: 0,
    currency: "IDR",
    otherCosts: [
    ],
    grandTotal: 35000,
    downPayment: 0,
    outstanding: 35000,

    internalRemarks: "All documents verified",
    referenceNo: "REF-001-2025",
    referenceDate: "2025-10-28",
    items: [
      {
        id: "item-2",
        itemCode: "AL-005",
        itemName: "Aluminum Ingots Premium Grade A",
        description: "Aluminum Ingots Premium Grade A",
        quantity: 1,
        pricePerQty: 35000,
        totalAmount: 35000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
        returned: 0,
      },

    ],
    checkStatus: true,
    receivedStatus: true,
    pendingStatus: false,
    status: "VERIFIED",
    submissionStatus: "NOT_SUBMITTED",
    submittedTo: "AP",
    submissionDate: "28/10/2025",
    documentType: "QPF",
    picPI: "SHEFANNY",
    docReceivedDate: "28/10/2025",

    linkedDocs: [

    ],
    history: [

    ],
  },
];

// IMPORT COSTS

export const mockImportCosts = [
  {
    icId: "ic_001",
    icNum: "IMP/WNS/2510/0061",
    type: "Sea",
    icDate: "2025-11-01",
    supplierName: "ABC International Ltd",
    totalImportCost: 12.5,
    currency: "USD",
    createdBy: "RINI KUSUMA",
    company: "WNS",
    approvalStatus: "Complete",
    approvalDate: "2025-11-03",
    poNo: "PO/MJS.MDN/2510/8472",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: true,
    expenseNoteCreated: false,
    apNotes: [],
    history: [
      {
        id: "h1-1",
        action: "Create",
        picName: "RINI KUSUMA",
        date: "01/11/2025",
        time: "09:00:00",
      },
      {
        id: "h1-2",
        action: "Approve",
        picName: "Manager",
        date: "03/11/2025",
        time: "10:00:00",
      },
      {
        id: "h1-3",
        action: "Verify",
        picName: "System",
        date: "03/11/2025",
        time: "11:00:00",
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID734821056",
      },
      {
        type: "Purchase Order",
        docNo: "PO/MJS.MDN/2510/8472",
      },
    ],
  },

  {
    icId: "ic_002",
    icNum: "IMP/IMI/2511/0071",
    type: "Air",
    icDate: "2025-11-02",
    supplierName: "Global Supplies Inc",
    totalImportCost: 8.9,
    currency: "EUR",
    createdBy: "ANDI WIJAYA",
    company: "IMI",
    approvalStatus: "Complete",
    poNo: "I.PO/IMI.MDN/2511/0052",
    invoiceNo: "INV-2025-0146",
    verifiedStatus: true,
    expenseNoteCreated: true,
    apNotes: [
      {
        id: "apn-002",
        apNoteNo: "AP/IMI.MDN/2512/0004",
        docType: "AP NOTE",
        icId: "ic_002",
      },
    ],
    history: [
      {
        id: "h2-1",
        action: "Create",
        picName: "ANDI WIJAYA",
        date: "02/11/2025",
        time: "10:15:00",
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0052",
      },
    ],
  },

  {
    icId: "ic_003",
    icNum: "IMP/IMI/2511/0051",
    type: "Courier",
    icDate: "2025-11-03",
    supplierName: "Tech Asia Limited",
    totalImportCost: 4.51,
    currency: "SGD",
    createdBy: "SITI NURHALIZA",
    company: "IMI",
    approvalStatus: "Complete",
    poNo: "I.PO/IMI.MDN/2511/0032",
    invoiceNo: "INV-2025-0147 - INV-2025-0203",
    verifiedStatus: true,
    expenseNoteCreated: true,
    apNotes: [
      {
        id: "apn-3-1",
        apNoteNo: "AP/IMI.MDN/2511/0121",
        docType: "AP NOTE",
        icId: "ic_003",
      },
    ],
    history: [
      {
        id: "h3-1",
        action: "Create",
        picName: "SITI NURHALIZA",
        date: "03/11/2025",
        time: "11:22:33",
      },
      {
        id: "h3-2",
        action: "Approve",
        picName: "Manager",
        date: "03/11/2025",
        time: "12:00:00",
      },
      {
        id: "h3-3",
        action: "Verify",
        picName: "System",
        date: "03/11/2025",
        time: "13:00:00",
      },
      {
        id: "h3-4",
        action: "Expense Note Create",
        picName: "System",
        date: "03/11/2025",
        time: "13:05:00",
        expenseNoteNo: "AP/GMI.MDN/2510/0149",
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0032",
      },
    ],
  },
  {
    icId: "ic_004",
    icNum: "IMP/IMI/2511/0044",
    type: "Sea",
    icDate: "2025-11-05",
    supplierName: "Euro Trading GmbH",
    totalImportCost: 15.6,
    currency: "EUR",
    createdBy: "BAMBANG SUSANTO",
    company: "IMI",
    approvalStatus: "Approved",
    approvalDate: "2025-11-06",
    settleDate: "2025-11-08",
    linkedExpenseNoteId: "EN-2025-001",
    poNo: ["I.PO/IMI.MDN/2511/0009", "I.PO/IMI.MDN/2511/0046"],
    invoiceNo: "INV-2025-0148 - INV-2025-0204 - INV-2025-0205",
    verifiedStatus: false,
    expenseNoteCreated: true,
    apNotes: [
      {
        id: "apn-4-1",
        apNoteNo: "AP/IMI.MDN/2512/0018",
        docType: "AP NOTE",
        icId: "ic_004",
      },
    ],
    history: [
      {
        id: "h4-1",
        action: "Create",
        picName: "BAMBANG SUSANTO",
        date: "05/11/2025",
        time: "08:50:10",
      },
    ],
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0009",
      },
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0046",
      },
    ],
  },
  {
    icId: "ic_005",
    icNum: "IMP/MJS/2510/0152",
    type: "Air",
    icDate: "2025-11-07",
    supplierName: "Pacific Traders Co",
    totalImportCost: 670,
    currency: "JPY",
    createdBy: "DEWI LESTARI",
    company: "MJS",
    approvalStatus: "Pending",
    poNo: "PO-2025-005",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h5-1",
        action: "Create",
        picName: "DEWI LESTARI",
        date: "07/11/2025",
        time: "13:25:55",
      },
    ],
    linkedDocs: [],
  },

  {
    icId: "ic_006",
    icNum: "IMP/TTP/2510/0291",
    type: "Sea",
    icDate: "2025-11-09",
    supplierName: "Asia Logistics Ltd",
    totalImportCost: 98000,
    currency: "IDR",
    createdBy: "RUDI HARTONO",
    company: "TTP",
    approvalStatus: "Approved",
    approvalDate: "2025-11-10",
    poNo: "PO-2025-006",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h6-1",
        action: "Create",
        picName: "RUDI HARTONO",
        date: "09/11/2025",
        time: "10:05:20",
      },
      {
        id: "h6-2",
        action: "Approve",
        picName: "Shipment Team",
        date: "10/11/2025",
        time: "15:30:48",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "ic_007",
    icNum: "IMP/WNS/2510/0481",
    type: "Courier",
    icDate: "2025-11-11",
    supplierName: "Express Freight Inc",
    totalImportCost: 5.2,
    currency: "GBP",
    createdBy: "AGUS PRATAMA",
    company: "WNS",
    approvalStatus: "Pending",
    poNo: "PO-2025-007",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h7-1",
        action: "Create",
        picName: "AGUS PRATAMA",
        date: "11/11/2025",
        time: "09:40:12",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "ic_008",
    icNum: "IMP/AMT/2510/0793",
    type: "Sea",
    icDate: "2025-11-12",
    supplierName: "Marine Cargo Ltd",
    totalImportCost: 17.8,
    currency: "USD",
    createdBy: "LISA AMANDA",
    company: "AMT",
    approvalStatus: "Approved",
    approvalDate: "2025-11-13",
    poNo: "PO-2025-008",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h8-1",
        action: "Create",
        picName: "LISA AMANDA",
        date: "12/11/2025",
        time: "11:15:35",
      },
      {
        id: "h8-2",
        action: "Approve",
        picName: "Shipment Team",
        date: "13/11/2025",
        time: "16:20:17",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "ic_009",
    icNum: "IMP/GMI/2510/0692",
    type: "Air",
    icDate: "2025-11-14",
    supplierName: "Sky Shipping Co",
    totalImportCost: 93000,
    currency: "IDR",
    createdBy: "TOMMY GUNAWAN",
    company: "GMI",
    approvalStatus: "Pending",
    poNo: "PO-2025-009",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h9-1",
        action: "Create",
        picName: "TOMMY GUNAWAN",
        date: "14/11/2025",
        time: "12:45:28",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "10",
    icNum: "IMP/IMI/2510/0595",
    type: "Sea",
    icDate: "2025-11-15",
    supplierName: "Ocean Transport Ltd",
    totalImportCost: 14.2,
    currency: "EUR",
    createdBy: "MAYA SARI",
    company: "IMI",
    approvalStatus: "Approved",
    approvalDate: "2025-11-16",
    poNo: "PO-2025-010",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h10-1",
        action: "Create",
        picName: "MAYA SARI",
        date: "15/11/2025",
        time: "08:30:05",
      },
      {
        id: "h10-2",
        action: "Approve",
        picName: "Shipment Team",
        date: "16/11/2025",
        time: "13:55:42",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "11",
    icNum: "IMP/MJS/2510/0094",
    type: "Courier",
    icDate: "2025-11-17",
    supplierName: "Quick Delivery Services",
    totalImportCost: 3.8,
    currency: "SGD",
    createdBy: "ANDI WIJAYA",
    company: "MJS",
    approvalStatus: "Pending",
    poNo: "PO-2025-011",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h11-1",
        action: "Create",
        picName: "ANDI WIJAYA",
        date: "17/11/2025",
        time: "14:10:25",
      },
    ],
    linkedDocs: [],
  },
  {
    icId: "12",
    icNum: "IMP/TTP/2510/0921",
    type: "Air",
    icDate: "2025-11-18",
    supplierName: "Air Cargo Solutions",
    totalImportCost: 11.5,
    currency: "USD",
    createdBy: "PUTRI ANGGRAINI",
    company: "TTP",
    approvalStatus: "Approved",
    approvalDate: "2025-11-19",
    poNo: "PO-2025-012",
    invoiceNo:
      "INV-2025-0145 - INV-2025-0146 - INV-2025-0147 - INV-2025-0148 - INV-2025-0149 - INV-2025-0150",
    verifiedStatus: false,
    expenseNoteCreated: false,
    history: [
      {
        id: "h12-1",
        action: "Create",
        picName: "PUTRI ANGGRAINI",
        date: "18/11/2025",
        time: "09:35:18",
      },
      {
        id: "h12-2",
        action: "Approve",
        picName: "Shipment Team",
        date: "19/11/2025",
        time: "17:45:32",
      },
    ],
    linkedDocs: [],
  },
];

export const mockShipmentRequest = [
  {
    srId: "sr_001",
    srNum: "0233/XI/SR-MJS/D2/2025",
    shipName: "TB. Martha Fortune",
    origin: "Logistik Balikpapan",
    destination: "Outter Buoy",
    expenseType: "5101 - Freight Charges",
    supplierName: "UKAL BOAT BALIKPAPAN",
    totalShipmentRequest: 40064,
    currency: "IDR",
    payTo: "Forwarder",
    company: "MJS",
    approvalStatus: "Approved",
    submittedDate: "2025-11-01",
    approvalDate: "2025-11-27",
    docReceivedDate: "2025-11-02",
    poNo: "PO-2025-001",
    invoiceNo: "INV-2025-0145",
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "PO/MJS.MDN/2511/0122",
      },
    ],
  },
  {
    srId: "sr_002",
    srNum: "0487/XI/SR-MJS/D2/2025",
    shipName: "MV. Sea Dragon",
    origin: "Pelabuhan Tanjung Priok",
    destination: "Pelabuhan Makassar",
    expenseType: "5102 - Transportation Cost",
    supplierName: "PT Express Cargo",
    totalShipmentRequest: 187500,
    currency: "IDR",
    payTo: "Supplier",
    company: "MJS",
    approvalStatus: "Pending",
    submittedDate: "2025-11-05",
    docReceivedDate: "2025-11-06",
    poNo: "PO-2025-002",
    invoiceNo: "INV-2025-0146",
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "PO/MJS.MDN/2511/0122",
      },
    ],
  },
  // {

  //   srId: "sr_003",
  //   srNum: "190/XI/SR-TTP/C5/2025",
  //   shipName: "KM. Bintang Laut",
  //   origin: "Dermaga Surabaya",
  //   destination: "Kepulauan Seribu",
  //   expenseType: "5103 - Warehouse Handling",
  //   supplierName: "Global Warehouse Inc",
  //   totalShipmentRequest: 20,
  //   currency: "EUR",
  //   payTo: "Service Provider",
  //   company: "TTP",
  //   approvalStatus: "Approved",
  //   submittedDate: "2025-11-06",
  //   approvalDate: "2025-11-08",
  //   docReceivedDate: "2025-11-07",
  //   poNo: "PO-2025-003",
  //   invoiceNo: "INV-2025-0147",
  //   linkedDocs: [
  //     {
  //       type: "Purchase Order",
  //       docNo: "PO/WNS.MDN/2510/7258",
  //     },
  //   ],
  // },
  // {

  //   srId: "sr_004",
  //   srNum: "189/XI/SR-GMI/C5/2025",
  //   shipName: "TB. Ocean King",
  //   origin: "Pelabuhan Belawan",
  //   destination: "Anchorage Point",
  //   expenseType: "5101 - Freight Charges",
  //   supplierName: "CV Maju Jaya Transport",
  //   totalShipmentRequest: 16.2,
  //   currency: "USD",
  //   payTo: "Supplier",
  //   company: "GMI",
  //   approvalStatus: "Pending",
  //   submittedDate: "2025-11-07",
  //   docReceivedDate: "2025-11-08",
  //   poNo: "PO-2025-004",
  //   invoiceNo: "INV-2025-0148",
  //   linkedDocs: [
  //     {
  //       type: "Purchase Order",
  //       docNo: "PO/GMI.MDN/2510/3457",
  //     },
  //   ],
  // },
  // {

  //   srId: "sr_005",
  //   srNum: "291/XI/SR-AMT/C5/2025",
  //   shipName: "MV. Pacific Star",
  //   origin: "Singapore Port",
  //   destination: "Jakarta Anchorage",
  //   expenseType: "5104 - Customs Clearance",
  //   supplierName: "Asia Customs Services",
  //   totalShipmentRequest: 2.55,
  //   currency: "SGD",
  //   payTo: "Agent",
  //   company: "AMT",
  //   approvalStatus: "Approved",
  //   submittedDate: "2025-11-10",
  //   approvalDate: "2025-11-12",
  //   docReceivedDate: "2025-11-11",
  //   poNo: "PO-2025-005",
  //   invoiceNo: "INV-2025-0149",
  //   apNotes: [
  //     {
  //       id: "apn-sr-5-1",
  //       apNoteNo: "AP/AMT.MDN/2510/0150",
  //       docType: "AP NOTE",
  //       srId: "5",
  //     },
  //   ],
  //   linkedDocs: [
  //     {
  //       type: "Purchase Order",
  //       docNo: "PO/AMT.MDN/2510/6892",
  //     },
  //   ],
  // },
  // {

  //   srId: "sr_006",
  //   srNum: "172/XI/SR-WSI/2025",
  //   shipName: "TB. Samudra Jaya",
  //   origin: "Pelabuhan Semarang",
  //   destination: "Outer Anchorage",
  //   expenseType: "5102 - Transportation Cost",
  //   supplierName: "PT Sejahtera Logistik",
  //   totalShipmentRequest: 148000,
  //   currency: "IDR",
  //   payTo: "Supplier",
  //   company: "WSI",
  //   approvalStatus: "Pending",
  //   submittedDate: "2025-11-11",
  //   docReceivedDate: "2025-11-12",
  //   poNo: "PO-2025-006",
  //   invoiceNo: "INV-2025-0150",
  //   linkedDocs: [
  //     {
  //       type: "Purchase Order",
  //       docNo: "PO/MJS.MDN/2511/0122",
  //     },
  //   ],
  // },
];

// EXPENSE NOTE
export const mockExpenseNote = [
  {
    apnoteId: "apn-001",
    apNoteNo: "AP/MJS.MDN/2510/0145",
    apNoteType: "MDN",
    docType: "AP NOTE",
    invoiceNumber: "INV-2025-0145",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    docReceiptDate: "15/10/2025",
    apNoteCreateDate: "16/10/2025",
    invoiceDate: "10/10/2025",
    createdBy: "SHEFANNY",
    term: "CREDIT",
    pt: "MJS",
    currency: "IDR",
    remarks: "Good condition, complete documentation provided",
    items: [
      {
        id: "item-1-1",
        accountCode: "1020-001",
        accountName: "Raw Material - Steel",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 50,
        unitPrice: 15000,
        totalAmount: calculateItemTotal(50, 15000),
        description: "Steel materials for production",
        bankCode: "",
      },
      {
        id: "item-1-2",
        category: "Raw Materials",
        description: "Aluminum Ingots Premium Grade",
        accountCode: "1020-002",
        accountName: "Raw Material - Aluminum",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 30,
        unitPrice: 1667,
        totalAmount: calculateItemTotal(30, 1667),
        bankCode: "BCA-001",
      },
    ],
    tax: 5000,
    discount: 25000,
    pph: 0,
    totalInvoice: 780010,
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID734821056",
      },
      {
        type: "Purchase Order",
        docNo: "PO/MJS.MDN/2510/8472",
      },
    ],
  },
  {
    id: "apn-002",
    apnoteId: "apn-002",
    apNoteNo: "AP/IMI.MDN/2512/0004",
    apNoteType: "MDN",
    docType: "AP NOTE",
    invoiceNumber: "INV-2025-0146",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    docReceiptDate: "15/10/2025",
    apNoteCreateDate: "16/10/2025",
    invoiceDate: "10/10/2025",
    createdBy: "SHEFANNY",
    term: "CREDIT",
    pt: "IMI",
    currency: "IDR",
    remarks: "Good condition, complete documentation provided",
    items: [
      {
        id: "item-1-1",
        accountCode: "1020-001",
        accountName: "Raw Material - Steel",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 50,
        unitPrice: 15000,
        totalAmount: calculateItemTotal(50, 15000),
        description: "Steel materials for production",
        bankCode: "",
      },
      {
        id: "item-1-2",
        category: "Raw Materials",
        description: "Aluminum Ingots Premium Grade",
        accountCode: "1020-002",
        accountName: "Raw Material - Aluminum",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 30,
        unitPrice: 1667,
        totalAmount: calculateItemTotal(30, 1667),
        bankCode: "BCA-001",
      },
    ],
    tax: 5000,
    discount: 25000,
    pph: 0,
    totalInvoice: 780010,
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0052",
      },
      { type: "Import Cost", docNo: "IMP/IMI/2511/0071" },
    ],
  },
  {
    id: "apn-003",
    apnoteId: "apn-003",
    apNoteNo: "AP/IMI.MDN/2511/0121",
    apNoteType: "MDN",
    docType: "AP NOTE",
    invoiceNumber: "INV-2025-0147",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    docReceiptDate: "15/10/2025",
    apNoteCreateDate: "16/10/2025",
    invoiceDate: "10/10/2025",
    createdBy: "SHEFANNY",
    term: "CREDIT",
    pt: "IMI",
    currency: "IDR",
    remarks: "Good condition, complete documentation provided",
    items: [
      {
        id: "item-1-1",
        accountCode: "1020-001",
        accountName: "Raw Material - Steel",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 50,
        unitPrice: 15000,
        totalAmount: calculateItemTotal(50, 15000),
        description: "Steel materials for production",
        bankCode: "",
      },
      {
        id: "item-1-2",
        category: "Raw Materials",
        description: "Aluminum Ingots Premium Grade",
        accountCode: "1020-002",
        accountName: "Raw Material - Aluminum",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 30,
        unitPrice: 1667,
        totalAmount: calculateItemTotal(30, 1667),
        bankCode: "BCA-001",
      },
    ],
    tax: 5000,
    discount: 25000,
    pph: 0,
    totalInvoice: 780010,
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0032",
      },
      { type: "Import Cost", docNo: "IMP/IMI/2511/0051" },
    ],
  },

  {
    id: "apn-004",
    apnoteId: "apn-004",
    apNoteNo: "AP/IMI.MDN/2512/0018",
    apNoteType: "MDN",
    docType: "AP NOTE",
    invoiceNumber: "INV-2025-0148",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    docReceiptDate: "15/10/2025",
    apNoteCreateDate: "16/10/2025",
    invoiceDate: "10/10/2025",
    createdBy: "SHEFANNY",
    term: "CREDIT",
    pt: "IMI",
    currency: "IDR",
    remarks: "Good condition, complete documentation provided",
    items: [
      {
        id: "item-1-1",
        accountCode: "1020-001",
        accountName: "Raw Material - Steel",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 50,
        unitPrice: 15000,
        totalAmount: calculateItemTotal(50, 15000),
        description: "Steel materials for production",
        bankCode: "",
      },
      {
        id: "item-1-2",
        category: "Raw Materials",
        description: "Aluminum Ingots Premium Grade",
        accountCode: "1020-002",
        accountName: "Raw Material - Aluminum",
        deptDescription: "Production Department",
        department: "PROD",
        qty: 30,
        unitPrice: 1667,
        totalAmount: calculateItemTotal(30, 1667),
        bankCode: "BCA-001",
      },
    ],
    tax: 5000,
    discount: 25000,
    pph: 0,
    totalInvoice: 780010,
    linkedDocs: [
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0009",
      },
      {
        type: "Purchase Order",
        docNo: "I.PO/IMI.MDN/2511/0046",
      },
      { type: "Import Cost", docNo: "IMP/IMI/2511/0044" },
    ],
  },
];

// REIMBURSE WITHOUT PO
export const mockReimburseWithoutPO = [
  {
    reimId: "reim_001",
    reimburseNo: "REIM/GMI.MDN/2602/0314",
    supplier: "PT Winner Technology",
    supplierName: "Ardian Aprianto",
    ptCompany: "GMI",
    status: "OUTSTANDING",
    createdBy: "Admin A",
    createDate: "20/02/2026",
    vendorOrigin: "Local",
    reimburseType: "Credit",
    grandTotal: 3445900,
    approvedBy: "Manager A",
    linkedDocs: [
      {
        id: "po_015",
        documentNo: "PO/GMI.MDN/2601/0314",
        documentType: "Purchase Order",
        date: "18/10/2025",
        status: "Outstanding",
        amount: 30000,
      },
    ],
    items: [
      {
        airlineTicketPayment: "Ardian Aprianto",
        departureDate: "20/02/2026",
        destination: "Balikpapan (BPN)",
        purpose: "Annual Calibration On Board MT. Tanker Victory",
        spkPoWoNo: "PO/GMI.MDN/2602/0314",
        amount: 1585500,
      },
      {
        airlineTicketPayment: "Ardian Aprianto",
        departureDate: "25/02/2026",
        destination: "Jakarta (CGK)",
        purpose: "Annual Calibration On Board MT. Tanker Victory",
        spkPoWoNo: "PO/GMI.MDN/2602/0314",
        amount: 1860400,
      }
    ]
  },

];

// PO COLLAPSIBLE ITEMS - from mockPurchaseOrder[0]
export const mockItemsForCollapsible =
  mockPurchaseOrder[0].items;

// INVOICE ADDITIONAL COSTS
export const mockInvoiceAdditionalCosts = {
  otherCost: 2000000,
  discount: 0,
  ppn: 0,
  otherTax: 0,
};

// EXPENSE NOTE
// AP DISCOUNT NOTE
// export const mockapDiscNote = [
//   {
//     id: "1",
//     apNoteNo: "AP/MJS.MDN/2510/0145",
//     apNoteType: "MDN",
//     invoiceNumber: "INV-2025-0145",
//     supplierName: "PT Maju Jaya",
//     supplierCategory: "LOCAL",
//     // totalInvoice: calculategrandTotal(
//     //   [
//     //     { totalAmount: calculateItemTotal(50, 15000) },
//     //     { totalAmount: calculateItemTotal(30, 1667) },
//     //   ],
//     //   5000,
//     //   25000,
//     //   0,
//     // ),
//     docReceiptDate: "15/10/2025",
//     apNoteCreateDate: "16/10/2025",
//     invoiceDate: "10/10/2025",
//     createdBy: "SHEFANNY",
//     term: "CREDIT",
//     pt: "MJS",
//     currency: "IDR",
//     remarks: "Good condition, complete documentation provided",
//     items: [
//       {
//         id: "item-1-1",
//         accountCode: "1020-001",
//         accountName: "Raw Material - Steel",
//         deptDescription: "Production Department",
//         department: "PROD",
//         qty: 50,
//         unitPrice: 15000,
//         // totalAmount: calculateItemTotal(50, 15000),
//         description: "Steel materials for production",
//         bankCode: "",
//       },
//       {
//         id: "item-1-2",
//         category: "Raw Materials",
//         description: "Aluminum Ingots Premium Grade",
//         accountCode: "1020-002",
//         accountName: "Raw Material - Aluminum",
//         deptDescription: "Production Department",
//         department: "PROD",
//         qty: 30,
//         unitPrice: 1667,
//         // totalAmount: calculateItemTotal(30, 1667),
//         bankCode: "BCA-001",
//       },
//     ],
//     linkedDocs: {
//       type: "Purchase Invoice",
//       docNo: "STID734821056",
//       pairedPO: "PO/MJS.MDN/2510/8472",
//     },
//   },
// ];

// PURCHASE RETURN
export const mockpurchaseReturns = [
    {
    returId: "ret_001",
    prNo: "PR/MJS.D0/2601/0001",
    piNo: "STID734826000",
    poNo: "PO/MJS.MDN/2510/0444",
    currency: "IDR",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    returnDate: "2025-10-28",
    returnReason: "Quality issue",
    returnCreatedDate: "2025-10-27",
    returnCreatedBy: "Azmi",
    status: "Not Receive",
    submissionStatus: "NOT SUBMITTED",
    receivedStatus: null,
    receivedDate: null,
    submitStatus: null,
    checkStatus: true,
    internalRemarks: "Quality inspection failed",
    referenceNo: "",
    referenceDate: "",
    picPI: "SHEFANNY",
    docReceivedDate: null,
    returnedItems: [
      {
        id: "item-1",
        itemCode: "AL-002",
        itemName: "Aluminum Ingots Premium Grade",
        description: "Aluminum Ingots Premium Grade",
        quantity: 1,
        returnedQty: 1,
        pricePerQty: 50000,
        totalAmount: 50000,
        uom: "KG",
        toBeUsedBy: "TB.Medelin Dini",
        reqBy: "TB. Medelin Dini",
        prNumber: "PR-2025-002",
        purpose: "Manufacturing",
      },
    ],
    totalReturnAmount: 50000,
    linkedDocs: [
      {
        type: "Purchase Invoice",
        docNo: "STID734826000",
      },
      {
        type: "Purchase Order",
        docNo: "PO/MJS.MDN/2510/0444",
      },
    ],
    history: [
      {
        id: "pr-2-1",
        timestamp: new Date("2025-10-28T10:00:00"),
        action: "RECEIVED",
        description: "Purchase return received",
      },
    ],
  },

];

// SUPPLIER MASTER DATA
export const mockSupplierMasterData = [
  {
    name: "PT Maju Jaya",
    category: "LOCAL",
    
    availablePIs: [],
  },
  {
    name: "CV Berkah Sentosa",
    category: "LOCAL",
    
    availablePIs: [],
  },
  {
    name: "PT Indo Supplies",
    category: "OVERSEAS",
    
    availablePIs: [],
  },
  {
    name: "PT Karya Abadi",
    category: "LOCAL",
    
    availablePIs: [],
  },
];

// PVR PAYMENT VOUCHER REQUEST
export const mockPVR = [
  {
    id: "pvr-001",
    pvrid: "pvr-001",
    pvrNo: "PVR/MJS.MDN/2510/0100",
    pvrDate: "2025-10-16",
    docReceiptDate: "2025-10-15",
    term: "CREDIT",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks:
      "Payment for raw materials - steel and aluminum ingots",
    poNumber: "PO/MJS.MDN/2510/8472",
    totalPVR: 0,
    createdBy: "SHEFANNY",
    pt: "MJS",
    bankAccount: "BCA-MJS-001",
    method: "Transfer",
    reference: "PV25-0001",
    rate: 1,  
    linkedDocs: [
      {
        id: "ld-001",
        documentType: "PI",
        piNo: "STID734821056",
        poNo: "PO/MJS.MDN/2510/8472",
        invoiceNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      },
      {
        id: "ld-002",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/8472",
        piNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      }, 
        {
        id: "ld-003",
        documentType: "PI",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
      {
        id: "ld-004",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
    
     
    ],
  },
  {
    id: "pvr-002",
    pvrid: "pvr-002",
    pvrNo: "PVR/IMI.MDN/2511/0001",
    pvrDate: "2026-01-10",
    docReceiptDate: "2026-01-09",
    term: "URGENT",
    supplierName: "PT Karya Abadi",
    supplierCategory: "LOCAL",
    currency: "EUR",
    paymentMethod: "Transfer",
    remarks: "Import cost payment - Air shipment",
    poNumber: "I.PO/IMI.MDN/2511/0052",
    totalPVR: 0,
    createdBy: "ANDI WIJAYA",
    pt: "IMI",
    bankAccount: "BCA-IMI-001",
    method: "Transfer",
    reference: "PV26-0001",
    rate: 1,
    linkedDocs: [
    
      {
        id: "ld-004",
        documentType: "IC",
        piNo: "IMP/IMI/2511/0071",
        poNo: "I.PO/IMI.MDN/2511/0052",
        invoiceNo: "IMP/IMI/2511/0071",
        invoiceDate: "2026-01-02",
        currency: "EUR",
        totalAmount: 8.9,
      },
    ],
  },
  {
    id: "pvr-003",
    pvrid: "pvr-003",
    pvrNo: "PVR/MJS.MDN/2511/0005",
    pvrDate: "2026-01-15",
    docReceiptDate: "2026-01-14",
    term: "CREDIT",
    supplierName: "PT Karya Abadi",
    supplierCategory: "LOCAL",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks: "Shipment request payment",
    poNumber: "PO/MJS.MDN/2511/0122",
    totalPVR: 0,
    createdBy: "SHEFANNY",
    pt: "MJS",
    bankAccount: "BCA-MJS-001",
    method: "Transfer",
    reference: "PV26-0002",
    rate: 1,
    linkedDocs: [
   
      {
        id: "ld-006",
        documentType: "SR",
        piNo: "0233/XI/SR-MJS/D2/2025",
        poNo: "PO/MJS.MDN/2511/0122",
        invoiceNo: "STID638419982",
        invoiceDate: "2025-11-01",
        currency: "IDR",
        totalAmount: 40064,
      },
    ],
  },
];

// PAYMENT VOUCHER VER 2
export const mockPV2 = [
  {
    id: "pv2-001",
    pvrid: "pv2-001",
    pvrNo: "PV/MJS.MDN/2510/0100",
    pvrDate: "2025-10-16",
    docReceiptDate: "2025-10-15",
    term: "CREDIT",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks:
      "Payment for raw materials - steel and aluminum ingots",
    poNumber: "PO/MJS.MDN/2510/8472",
    totalPVR: 0,
    createdBy: "SHEFANNY",
    pt: "MJS",
    bankAccount: "BCA-MJS-001",
    method: "Transfer",
    reference: "PV25-0001",
    rate: 1,  
    linkedDocs: [
      {
        id: "ld-001",
        documentType: "PI",
        piNo: "STID734821056",
        poNo: "PO/MJS.MDN/2510/8472",
        invoiceNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      },
      {
        id: "ld-002",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/8472",
        piNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      }, 
        {
        id: "ld-003",
        documentType: "PI",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
      {
        id: "ld-004",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
    
     
    ],
  },
  {
    id: "pv2-002",
    pvrid: "pv2-002",
    pvrNo: "PV/IMI.MDN/2511/0001",
    pvrDate: "2026-01-10",
    docReceiptDate: "2026-01-09",
    term: "URGENT",
    supplierName: "PT Karya Abadi",
    supplierCategory: "LOCAL",
    currency: "EUR",
    paymentMethod: "Transfer",
    remarks: "Import cost payment - Air shipment",
    poNumber: "I.PO/IMI.MDN/2511/0052",
    totalPVR: 0,
    createdBy: "ANDI WIJAYA",
    pt: "IMI",
    bankAccount: "BCA-IMI-001",
    method: "Transfer",
    reference: "PV26-0001",
    rate: 1,
    linkedDocs: [
    
      {
        id: "ld-004",
        documentType: "IC",
        piNo: "IMP/IMI/2511/0071",
        poNo: "I.PO/IMI.MDN/2511/0052",
        invoiceNo: "IMP/IMI/2511/0071",
        invoiceDate: "2026-01-02",
        currency: "EUR",
        totalAmount: 8.9,
      },
    ],
  },
  {
    id: "pv2-003",
    pvrid: "pv2-003",
    pvrNo: "PV/MJS.MDN/2511/0005",
    pvrDate: "2026-01-15",
    docReceiptDate: "2026-01-14",
    term: "CREDIT",
    supplierName: "PT Karya Abadi",
    supplierCategory: "LOCAL",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks: "Shipment request payment",
    poNumber: "PO/MJS.MDN/2511/0122",
    totalPVR: 0,
    createdBy: "SHEFANNY",
    pt: "MJS",
    bankAccount: "BCA-MJS-001",
    method: "Transfer",
    reference: "PV26-0002",
    rate: 1,
    linkedDocs: [
   
      {
        id: "ld-006",
        documentType: "SR",
        piNo: "0233/XI/SR-MJS/D2/2025",
        poNo: "PO/MJS.MDN/2511/0122",
        invoiceNo: "STID638419982",
        invoiceDate: "2025-11-01",
        currency: "IDR",
        totalAmount: 40064,
      },
    ],
  },
];
// {
//   id: "pvr-002",
//   pvrid: "pvr-002",
//   pvrNo: "PVR/IMI.MDN/2511/0001",
//   pvrDate: "2026-01-10",
//   docReceiptDate: "2026-01-09",
//   term: "URGENT",
//   supplierName: "PT Karya Abadi",
//   supplierCategory: "LOCAL",
//   currency: "IDR",
//   paymentMethod: "Transfer",
//   remarks: "Import cost payment - Air shipment",
//   poNumber: "I.PO/IMI.MDN/2511/0052",
//   totalPVR: 0,
//   createdBy: "ANDI WIJAYA",
//   pt: "IMI",
//   bankAccount: "BCA-IMI-001",
//   method: "Transfer",
//   reference: "PV26-0001",
//   rate: 1,
//   linkedDocs: [
//     {
//       id: "ld-002",
//       documentType: "PI",
//       piNo: "STID638410233",
//       poNo: "I.PO/IMI.MDN/2511/0052",
//       invoiceNo: "STID638410233",
//       invoiceDate: "2026-01-08",
//       currency: "IDR",
//       totalAmount: 95000000,
//       documentTypeLabel: "Purchase Invoice"
//     },
//     {
//       id: "ld-003",
//       documentType: "IC",
//       piNo: "IMP/IMI/2511/0071",
//       poNo: "I.PO/IMI.MDN/2511/0052",
//       invoiceNo: "IMP/IMI/2511/0071",
//       invoiceDate: "2026-01-02",
//       currency: "EUR",
//       totalAmount: 8.9,
//       documentTypeLabel: "Import Cost"
//     }
//   ],
// },
// {
//   id: "pvr-003",
//   pvrid: "pvr-003",
//   pvrNo: "PVR/MJS.MDN/2511/0005",
//   pvrDate: "2026-01-15",
//   docReceiptDate: "2026-01-14",
//   term: "CREDIT",
//   supplierName: "PT Karya Abadi",
//   supplierCategory: "LOCAL",
//   currency: "IDR",
//   paymentMethod: "Transfer",
//   remarks: "Shipment request payment",
//   poNumber: "PO/MJS.MDN/2511/0122",
//   totalPVR: 0,
//   createdBy: "SHEFANNY",
//   pt: "MJS",
//   bankAccount: "BCA-MJS-001",
//   method: "Transfer",
//   reference: "PV26-0002",
//   rate: 1,
//   linkedDocs: [
//     {
//       id: "ld-004",
//       documentType: "PI",
//       piNo: "STID638419982",
//       poNo: "PO/MJS.MDN/2511/0122",
//       invoiceNo: "STID638419982",
//       invoiceDate: "2026-01-05",
//       currency: "IDR",
//       totalAmount: 95000000,
//       documentTypeLabel: "Purchase Invoice"
//     },
//     {
//       id: "ld-005",
//       documentType: "SR",
//       piNo: "0233/XI/SR-MJS/D2/2025",
//       poNo: "PO/MJS.MDN/2511/0122",
//       invoiceNo: "0233/XI/SR-MJS/D2/2025",
//       invoiceDate: "2025-11-01",
//       currency: "IDR",
//       totalAmount: 40064,
//       documentTypeLabel: "Shipment Request"
//     }
//   ],
// }

// PV PAYMENT VOUCHER
export const mockPV = [
  {
    pvid: "pv-001",
    pvNo: "PV/MJS.MDN/2510/0110",
    pvrNo: "PVR/MJS.MDN/2510/0100",
    pvDate: "2025-10-16",
    docReceiptDate: "2025-10-15",
    term: "CREDIT",
    supplierName: "PT Maju Jaya",
    supplierCategory: "LOCAL",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks:
      "Payment for raw materials - steel and aluminum ingots",
    poNumber: "PO/MJS.MDN/2510/8472",
    totalPVR: 0,
    createdBy: "SHEFANNY",
    pt: "MJS",
    bankAccount: "BCA-MJS-001",
    method: "Transfer",
    reference: "PV25-0001",
    rate: 1,
    linkedDocs: [
      {
        id: "ld-001",
        documentType: "PI",
        piNo: "STID734821056",
        poNo: "PO/MJS.MDN/2510/8472",
        invoiceNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      },
      {
        id: "ld-002",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/8472",
        piNo: "STID734821056",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 3065000,
      },
      {
        id: "ld-003",
        documentType: "PI",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
      {
        id: "ld-004",
        documentType: "PO",
        poNo: "PO/MJS.MDN/2510/0472",
        piNo: "STID734821555",
        invoiceDate: "2025-10-15",
        currency: "IDR",
        totalAmount: 85000,
      },
    ],
  },
  {
    pvid: "pv-002",
    pvNo: "PV/IMI.MDN/2511/0001",
    pvrNo: "PVR/IMI.MDN/2511/0001",
    pvDate: "2026-01-10",
    docReceiptDate: "2026-01-09",
    term: "URGENT",
    supplierName: "PT Karya Abadi",
    supplierCategory: "LOCAL",
    currency: "EUR",
    paymentMethod: "Transfer",
    remarks: "Import cost payment - Air shipment",
    poNumber: "I.PO/IMI.MDN/2511/0052",
    totalPVR: 0,
    createdBy: "ANDI WIJAYA",
    pt: "IMI",
    bankAccount: "BCA-IMI-001",
    method: "Transfer",
    reference: "PV26-0001",
    rate: 1,
    linkedDocs: [
      {
        id: "ld-004",
        documentType: "IC",
        piNo: "IMP/IMI/2511/0071",
        poNo: "I.PO/IMI.MDN/2511/0052",
        invoiceNo: "IMP/IMI/2511/0071",
        invoiceDate: "2026-01-02",
        currency: "EUR",
        totalAmount: 8.9,
      },
    ],
  },

];

// ============ AUTOMATED LINKED DOCUMENT STRUCTURE ============

// Helper function to create complete linked document hierarchy
const createLinkedDocumentStructure = () => {
  return mockPurchaseOrder.map((po) => {
    // Get all PIs linked to this PO
    const linkedPIs = mockpurchaseInvoice.filter(
      (pi) => pi.poId === po.poId,
    );

    // Get all Import Costs linked to this PO
    const linkedImportCosts = mockImportCosts.filter(
      (ic) => ic.poNo === po.purchaseOrderNo,
    );

    // Get all Shipment Requests linked to this PO
    const linkedSRs = mockShipmentRequest.filter((sr) => {
      if (!sr.linkedDocs) return false;
      const docArray = Array.isArray(sr.linkedDocs)
        ? sr.linkedDocs
        : [sr.linkedDocs];
      return docArray.some(
        (doc: any) =>
          doc.type === "Purchase Order" &&
          doc.docNo === po.purchaseOrderNo,
      );
    });

    return {
      ...po,
      // Direct linking
      importCosts: linkedImportCosts,
      shipmentRequests: linkedSRs,
      // ALL EXPENSE NOTES (semi-independent: can be linked OR standalone)
      allExpenseNotes: mockExpenseNote,
      purchaseInvoices: linkedPIs.map((pi) => {
        // Get expense notes for this PI by matching linkedDocs.docNo with purchaseInvoiceNo
        const piExpenseNotes = mockExpenseNote.filter((ap) => {
          // Check if AP Note's linked doc matches this PI's invoice number
          if (!ap.linkedDocs) return false;
          const linkedDocArray = Array.isArray(ap.linkedDocs)
            ? ap.linkedDocs
            : [ap.linkedDocs];
          return linkedDocArray.some(
            (doc: any) =>
              doc.type === "Purchase Invoice" &&
              doc.docNo === pi.purchaseInvoiceNo,
          );
        });

        // Get returns for this PI (gunakan piId sebagai foreign key)
        const piReturns = mockpurchaseReturns.filter(
          (ret) => ret.piId === pi.piId,
        );

        // Get PVR & PV for this PI
        const piPVR = mockPVR
          .filter((pvr) => pvr.piId === pi.piId)
          .map((pvr) => ({
            ...pvr,
            pv: mockPV.filter((pv) => pv.pvrId === pvr.pvrId), // relasi PV ↔ PVR
          }));

        return {
          ...pi,
          expenseNotes: piExpenseNotes,
          returns: piReturns,
          pvr: piPVR,
          importCosts: linkedImportCosts, // PI juga bisa akses import costs via PO
        };
      }),
    };
  });
};

// Generate linked structure (CORRECT VERSION)
export const mockLinkedPOs = createLinkedDocumentStructure();

// Helper function to extract full linked documents data from mockPVR → linkedDocs
export const extractLinkedDocsFromPVR = (pvr: any) => {
  if (!pvr.linkedDocs || !Array.isArray(pvr.linkedDocs)) {
    return [];
  }

  return pvr.linkedDocs.map((linkedDoc: any) => {
    let fullDocData: any = null;

    // Based on document type, fetch the full data from respective mock arrays
    if (
      linkedDoc.type === "Purchase Invoice" ||
      linkedDoc.documentType === "PI"
    ) {
      fullDocData = mockpurchaseInvoice.find(
        (pi) =>
          pi.purchaseInvoiceNo ===
          (linkedDoc.piNo || linkedDoc.invoiceNo),
      );
    } else if (linkedDoc.documentType === "IC") {
      fullDocData = mockImportCosts.find(
        (ic) => ic.icNum === linkedDoc.piNo,
      );
    } else if (linkedDoc.documentType === "SR") {
      fullDocData = mockShipmentRequest.find(
        (sr) => sr.srNum === linkedDoc.piNo,
      );
    } else if (linkedDoc.documentType === "EN") {
      fullDocData = mockExpenseNote.find(
        (en) => en.enNo === linkedDoc.piNo,
      );
    }

    return {
      ...linkedDoc,
      fullData: fullDocData,
    };
  });
};

// Helper function to extract all Shipment Requests from centralized structure
export const extractShipmentRequestsFromLinkedStructure =
  () => {
    const allShipmentRequests: any[] = [];

    // Collect all SRs from each PO's shipmentRequests array
    mockLinkedPOs.forEach((po) => {
      if (
        po.shipmentRequests &&
        Array.isArray(po.shipmentRequests)
      ) {
        allShipmentRequests.push(...po.shipmentRequests);
      }
    });

    // Remove duplicates based on srId
    const uniqueSRs = Array.from(
      new Map(
        allShipmentRequests.map((sr) => [sr.srId, sr]),
      ).values(),
    );

    return uniqueSRs;
  };

// Function to enrich linked documents with nominal amounts from respective sources
export const enrichLinkedDocsWithNominal = (pvr: any) => {
  if (
    !pvr ||
    !pvr.linkedDocs ||
    !Array.isArray(pvr.linkedDocs)
  ) {
    return pvr;
  }

  const enrichedLinkedDocs = pvr.linkedDocs.map((doc: any) => {
    let totalAmount = 0;
    const docType = doc.documentType || doc.type;
    const docNo = doc.piNo || doc.invoiceNo || doc.docNo;

    // Match based on document type
    if (docType === "PI" || docType === "Purchase Invoice") {
      const match = mockpurchaseInvoice.find(
        (inv) =>
          inv.purchaseInvoiceNo === docNo || inv.piNo === docNo,
      );
      totalAmount = match
        ? match.netTotal || match.grandTotal || 0
        : 0;
    } else if (docType === "IC" || docType === "Import Cost") {
      const match = mockImportCosts.find(
        (ic) => ic.importCostNo === docNo || ic.icNo === docNo,
      );
      totalAmount = match
        ? match.totalCost || match.grandTotal || 0
        : 0;
    } else if (
      docType === "SR" ||
      docType === "Shipment Request"
    ) {
      const match = mockShipmentRequest.find(
        (sr) =>
          sr.shipmentRequestNo === docNo || sr.srNo === docNo,
      );
      totalAmount = match
        ? match.totalAmount || match.grandTotal || 0
        : 0;
    } else if (docType === "EN" || docType === "Expense Note") {
      const match = mockExpenseNote.find(
        (en) => en.expenseNoteNo === docNo || en.enNo === docNo,
      );
      totalAmount = match
        ? match.totalAmount || match.grandTotal || 0
        : 0;
    }

    return {
      ...doc,
      totalAmount,
    };
  });

  return {
    ...pvr,
    linkedDocs: enrichedLinkedDocs,
  };
};

// SUPPLIER MASTER DATA
export const mockSuppliers = [
  { supplierName: "PT Maju Jaya" },
  { supplierName: "CV Berkah Sentosa" },
  { supplierName: "PT Indo Supplies" },
  { supplierName: "PT Karya Abadi" },
  { supplierName: "CV Mitra Jasa" },
  { supplierName: "PT Sinar Makmur" },
  { supplierName: "CV Teknisi Profesional" },
  { supplierName: "PT Global Trading" },
  { supplierName: "CV Handal Jaya" },
  { supplierName: "PT Perkasa Sentosa" },
  { supplierName: "CV Bina Usaha" },
  { supplierName: "PT Mitra Bisnis" },
  { supplierName: "CV Solusi Tepat" },
  { supplierName: "PT Gemilang Abadi" },
  { supplierName: "CV Kerja Keras" },
  { supplierName: "PT Sejahtera Jaya" },
  { supplierName: "CV Andal Makmur" },
  { supplierName: "PT Terpercaya Sentosa" },
  { supplierName: "CV Inovasi Bisnis" },
  { supplierName: "PT Eksis Prima" },
];

// Helper function to find PVRs linked to a specific document
export const findLinkedPVRs = (
  documentType: string,
  documentNo: string,
): any[] => {
  // Try to get PVRs from localStorage first (live data), fallback to mockPVR
  let pvrSource = mockPVR;
  try {
    const savedPVRs = localStorage.getItem("pvrData");
    if (savedPVRs) {
      pvrSource = JSON.parse(savedPVRs);
    }
  } catch (error) {
    console.error("Failed to load PVR data from localStorage:", error);
    pvrSource = mockPVR;
  }

  // Combine localStorage data with mock data (avoid duplicates by pvrNo)
  const allPVRsMap = new Map();
  mockPVR.forEach(p => allPVRsMap.set(p.pvrNo, p));
  pvrSource.forEach(p => allPVRsMap.set(p.pvrNo, p));
  const combinedPVRs = Array.from(allPVRsMap.values());

  return combinedPVRs.filter((pvr) => {
    if (!pvr.linkedDocs || !Array.isArray(pvr.linkedDocs)) {
      return false;
    }

    return pvr.linkedDocs.some((doc) => {
      const docType = doc.documentType || doc.type;
      // Handle different document number field names
      const docNo =
        doc.piNo ||
        doc.invoiceNo ||
        doc.poNo ||
        (doc as any).icNum;

      // Normalize document types for comparison
      let normalizedType = documentType;
      let normalizedDocType = docType;

      if (
        documentType === "IC" ||
        documentType === "Import Cost"
      ) {
        normalizedType = "IC";
      }
      if (docType === "IC" || docType === "Import Cost") {
        normalizedDocType = "IC";
      }

      return (
        normalizedDocType === normalizedType &&
        docNo === documentNo
      );
    });
  });
};

// Helper function to find linked PVR for a specific PO number
export const findLinkedPVRsByPONo = (poNo: string): any[] => {
  // Try to get PVRs from localStorage first (live data), fallback to mockPVR
  let pvrSource = mockPVR;
  try {
    const savedPVRs = localStorage.getItem("pvrData");
    if (savedPVRs) {
      pvrSource = JSON.parse(savedPVRs);
      console.log(`[findLinkedPVRsByPONo] Loaded ${pvrSource.length} PVRs from localStorage`);
    }
  } catch (error) {
    console.error("Failed to load PVR data from localStorage:", error);
    pvrSource = mockPVR;
  }

  // First, find the actual PO object to get its poId
  const targetPO = mockPurchaseOrder.find((po) => po.purchaseOrderNo === poNo);
  console.log(`[findLinkedPVRsByPONo] Target PO found for ${poNo}:`, targetPO?.poId);

  const result = pvrSource.filter((pvr) => {
    if (!pvr.linkedDocs || !Array.isArray(pvr.linkedDocs)) {
      return false;
    }

    return pvr.linkedDocs.some((doc) => {
      const docPO = doc.poNo || doc.poNumber;
      
      // Match by:
      // 1. Exact purchaseOrderNo match
      // 2. poId match (since linkedDocs.poNo often contains poId)
      // 3. poNumber field
      const matches = docPO === poNo || (targetPO && docPO === targetPO.poId);
      
      if (matches) {
        console.log(`[findLinkedPVRsByPONo] ✅ Found PVR ${pvr.pvrNo} with doc.poNo=${docPO} matching ${poNo} (targetPoId: ${targetPO?.poId})`);
      }
      return matches;
    });
  });
  
  console.log(`[findLinkedPVRsByPONo] Searching for poNo: ${poNo}, Found ${result.length} PVRs`);
  if (result.length === 0) {
    console.log(`[findLinkedPVRsByPONo] ⚠️ No PVRs found! Checked against:`, {
      targetPoNo: poNo,
      targetPoId: targetPO?.poId,
      totalPVRsChecked: pvrSource.length,
      sampleLinkedDocs: pvrSource.slice(0, 2).map(p => ({
        pvrNo: p.pvrNo,
        linkedDocsPoNo: p.linkedDocs?.map((d: any) => d.poNo)
      }))
    });
  }
  return result;
};

// Helper function to find linked PVR for a specific PI number
export const findLinkedPVRsByPINo = (piNo: string): any[] => {
  // Try to get PVRs from localStorage first (live data), fallback to mockPVR
  let pvrSource = mockPVR;
  try {
    const savedPVRs = localStorage.getItem("pvrData");
    if (savedPVRs) {
      pvrSource = JSON.parse(savedPVRs);
    }
  } catch (error) {
    console.error("Failed to load PVR data from localStorage:", error);
    pvrSource = mockPVR;
  }

  return pvrSource.filter((pvr) => {
    if (!pvr.linkedDocs || !Array.isArray(pvr.linkedDocs)) {
      return false;
    }

    return pvr.linkedDocs.some((doc) => {
      return doc.piNo === piNo;
    });
  });
};

// Helper function to find linked PV for a specific PI number
export const findLinkedPVsByPINo = (piNo: string): any[] => {
  // Try to get PVs from localStorage first (live data), fallback to mockPV
  let pvSource = mockPV;
  try {
    const savedPVs = localStorage.getItem("pvData");
    if (savedPVs) {
      pvSource = JSON.parse(savedPVs);
    }
  } catch (error) {
    console.error("Failed to load PV data from localStorage:", error);
    pvSource = mockPV;
  }

  return pvSource.filter((pv: any) => {
    // Exclude voided PVs
    if (pv.status === 'voided') return false;

    if (!pv.linkedDocs || !Array.isArray(pv.linkedDocs)) {
      return false;
    }

    return pv.linkedDocs.some((doc: any) => {
      return doc.piNo === piNo;
    });
  });
};

// Helper function to find linked PV for a specific PO number
export const findLinkedPVsByPONo = (poNo: string): any[] => {
  // Try to get PVs from localStorage first (live data), fallback to mockPV
  let pvSource = mockPV;
  try {
    const savedPVs = localStorage.getItem("pvData");
    if (savedPVs) {
      pvSource = JSON.parse(savedPVs);
    }
  } catch (error) {
    console.error("Failed to load PV data from localStorage:", error);
    pvSource = mockPV;
  }

  return pvSource.filter((pv: any) => {
    // Exclude voided PVs
    if (pv.status === 'voided') return false;

    // Check poNumber field
    if (pv.poNumber === poNo || pv.pvrNo === poNo) return true;

    if (!pv.linkedDocs || !Array.isArray(pv.linkedDocs)) {
      return false;
    }

    return pv.linkedDocs.some((doc: any) => {
      return doc.poNo === poNo;
    });
  });
};

// Helper function to initialize mock PV data to localStorage
export const initializeMockPVData = () => {
  if (!localStorage.getItem("pvData")) {
    localStorage.setItem("pvData", JSON.stringify(mockPV));
  }
};

// Helper function to calculate synced down payment and outstanding from linked PVs
export const getSyncedPaymentAmounts = (piNo: string): { downPayment: number; outstanding: number } => {
  // Get PVs linked to this PI (was PVRs, now PVs per requirement)
  const linkedPVs = findLinkedPVsByPINo(piNo);
  
  let totalAmountPaid = 0;
  let totalOutstanding = 0;
  let piTotalAmount = 0;

  linkedPVs.forEach((pv) => {
    // For each PV, check if it has amount paid saved
    if (pv.linkedDocs && Array.isArray(pv.linkedDocs)) {
      pv.linkedDocs.forEach((doc: any) => {
        // Only process if this document is the PI we're looking for
        if (doc.piNo === piNo) {
          piTotalAmount = doc.totalAmount || 0;
          let amountPaidNum = doc.amountPaid || piTotalAmount;
          
          // Fallback check for PV context
          const docStorageKey = `pvr_edit_doc_${doc.id}`;
          const savedData = localStorage.getItem(docStorageKey);
          
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                const amountStr = parsed.amountPaid[0].amount;
                const amountNum = typeof amountStr === 'string' 
                  ? parseFloat(amountStr.replace(/\./g, '').replace(/,/g, '.'))
                  : amountStr;
                
                if (!isNaN(amountNum)) {
                  amountPaidNum = amountNum;
                }
              }
            } catch (error) {}
          }
          
          totalAmountPaid += amountPaidNum;
          const outstanding = piTotalAmount - amountPaidNum;
          totalOutstanding += outstanding > 0 ? outstanding : 0;
        }
      });
    }
  });

  // If no PVs found, fallback to PI's downPayment property
  if (totalAmountPaid === 0) {
    const pi = mockpurchaseInvoice.find((p) => p.purchaseInvoiceNo === piNo);
    if (pi) {
      totalAmountPaid = pi.downPayment || 0;
      totalOutstanding = pi.outstanding || 0;
    }
  }

  return {
    downPayment: totalAmountPaid,
    outstanding: totalOutstanding
  };
};

// Helper function to calculate synced payment amounts for a PO (only from PVs linked to this PO)
export const getSyncedPaymentAmountsByPO = (poNo: string): { downPayment: number; outstanding: number } => {
  // Get all PIs linked to this PO
  const linkedPIs = mockpurchaseInvoice.filter((pi) => pi.noPO === poNo);
  
  // Get PVs linked to this PO (was PVRs, now PVs per requirement)
  const pvsLinkedToPO = findLinkedPVsByPONo(poNo);
  
  let totalDownPayment = 0;
  let totalOutstanding = 0;

  // For each PI linked to this PO
  linkedPIs.forEach((pi) => {
    // Only check PVs that are linked to THIS PO
    pvsLinkedToPO.forEach((pv) => {
      if (pv.linkedDocs && Array.isArray(pv.linkedDocs)) {
        pv.linkedDocs.forEach((doc: any) => {
          // Only process if this is a PI document matching our current PI
          if (doc.piNo === pi.purchaseInvoiceNo && (doc.documentType === "PI" || !doc.documentType)) {
            let amountPaidNum = doc.amountPaid || doc.totalAmount || 0;
            
            const docStorageKey = `pvr_edit_doc_${doc.id}`;
            const savedData = localStorage.getItem(docStorageKey);
            
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                  const amountStr = parsed.amountPaid[0].amount;
                  const amountNum = typeof amountStr === 'string' 
                    ? parseFloat(amountStr.replace(/\./g, '').replace(/,/g, '.'))
                    : amountStr;
                  if (!isNaN(amountNum)) amountPaidNum = amountNum;
                }
              } catch (e) {}
            }
            
            totalDownPayment += amountPaidNum;
            const outstanding = (doc.totalAmount || 0) - amountPaidNum;
            totalOutstanding += outstanding > 0 ? outstanding : 0;
          }
        });
      }
    });
  });

  // If no PVs found, use the sum of downPayments from linked PIs
  if (totalDownPayment === 0) {
    linkedPIs.forEach(pi => {
      totalDownPayment += pi.downPayment || 0;
      totalOutstanding += pi.outstanding || 0;
    });
  }

  return {
    downPayment: totalDownPayment,
    outstanding: totalOutstanding
  };
};

// PIC DATA BY DIVISION
export const mockDivisionPICs = [
  // AP Division
  {
    id: "pic-ap-001",
    name: "AP1",
    division: "AP",
    email: "ap1@company.com",
  },
  {
    id: "pic-ap-002",
    name: "AP2",
    division: "AP",
    email: "ap2@company.com",
  },
  {
    id: "pic-ap-003",
    name: "AP3",
    division: "AP",
    email: "ap3@company.com",
  },
  // COSTING Division
  {
    id: "pic-costing-001",
    name: "COSTING1",
    division: "COSTING",
    email: "costing1@company.com",
  },
  {
    id: "pic-costing-002",
    name: "COSTING2",
    division: "COSTING",
    email: "costing2@company.com",
  },
  {
    id: "pic-costing-003",
    name: "COSTING3",
    division: "COSTING",
    email: "costing3@company.com",
  },
  // ACCOUNTING Division
  {
    id: "pic-accounting-001",
    name: "ACCOUNTING1",
    division: "ACCOUNTING",
    email: "accounting1@company.com",
  },
  {
    id: "pic-accounting-002",
    name: "ACCOUNTING2",
    division: "ACCOUNTING",
    email: "accounting2@company.com",
  },
  {
    id: "pic-accounting-003",
    name: "ACCOUNTING3",
    division: "ACCOUNTING",
    email: "accounting3@company.com",
  },
];

// Helper function to get linked PIs by PO number
export const findLinkedPIsByPONo = (poNo: string) => {
  return mockpurchaseInvoice.filter((pi) => pi.noPO === poNo);
};

// Export alias for compatibility
export const mockPurchaseOrdersData = mockPurchaseOrder;
export const mockPurchaseInvoiceDataForPI = mockpurchaseInvoice;
export const mockImportCostsDataForIC = mockImportCosts;
export const mockShipmentRequestDataForSR = mockShipmentRequest;

// Helper function to initialize PVR data in localStorage
// Ensures mock PVR data is always available, merged with any saved PVRs
export const initializeMockPVRData = () => {
  try {
    // Transform mockPVR to the format expected by the app
    const initialMockData = mockPVR.map((pvr, index) => ({
      id: pvr.id || `pvr-${index + 1}`,
      pvrNo: pvr.pvrNo,
      pvrDate: pvr.pvrDate,
      docReceiptDate: pvr.docReceiptDate,
      term: (pvr.term === "CREDIT" || pvr.term === "URGENT" || pvr.term === "COD" 
        ? pvr.term.charAt(0) + pvr.term.slice(1).toLowerCase() 
        : "Credit") as any,
      supplierName: pvr.supplierName,
      supplierCategory: pvr.supplierCategory,
      currency: pvr.currency,
      paymentMethod: pvr.paymentMethod,
      remarks: pvr.remarks,
      poNumber: pvr.poNumber,
      totalInvoice: (pvr.linkedDocs || []).reduce((sum: number, doc: any) => {
        if (doc.documentType && doc.documentType !== "PO") {
          return sum + (doc.totalAmount || 0);
        }
        return sum;
      }, 0),
      createdBy: pvr.createdBy,
      pt: pvr.pt,
      bankAccount: pvr.bankAccount,
      isSubmitted: false,
      isApproved: false,
      status: "active",
      linkedDocs: pvr.linkedDocs || [],
    }));

    // Get current data from localStorage
    const currentPVRData = JSON.parse(localStorage.getItem("pvrData") || "[]");
    
    // Merge: keep all mock data + any saved PVRs that aren't in mock data
    const mockPVRNumbers = new Set(initialMockData.map(p => p.pvrNo));
    const newSavedPVRs = currentPVRData.filter((pvr: any) => !mockPVRNumbers.has(pvr.pvrNo));
    const mergedData = [...initialMockData, ...newSavedPVRs];
    
    // Save merged data to localStorage
    localStorage.setItem("pvrData", JSON.stringify(mergedData));
    
    console.log("[INIT] Initialized PVR localStorage:");
    console.log(`  ✅ Mock PVRs: ${initialMockData.length}`);
    console.log(`  ✅ Newly created PVRs: ${newSavedPVRs.length}`);
    console.log(`  ✅ Total: ${mergedData.length}`);
    
    return mergedData;
  } catch (error) {
    console.error("Failed to initialize mock PVR data:", error);
    return [];
  }
};

// INVOICE RECEIPT
export const mockInvoiceReceipts = [
  {
    id: "IR-001",
    invoiceReceiptNo: "IR/MJS.MDN/2601/0042",
    linkedPurchaseInvoiceNo: "STID734821056",
    linkedPONo: "PO/MJS.MDN/2510/8472",
    supplierName: "PT Maju Jaya",
    ptCompany: "MJS",
    warehouse: "MEDAN",
    createDate: "15/01/2026",
    totalAmount: 3035000,
    discount: 0,
    ppn: 0,
    pph: 0,
    otherCost: 0,
    grandTotal: 3065000,
    downPayment: 3065000,
    outstanding: 0,
    currency: "IDR",
    remarks: "All documents verified",
    status: "COMPLETE",
    linkedDocs: [
      { type: "Purchase Invoice", docNo: "STID734821056", badgeLabel: "PI", badgeColor: "blue" },
    ],
    items: [
      { itemCode: "SVC-001", itemName: "Service Liferaft", description: "Service Liferaft", pph: true, qty: 1, uom: "Unit", discount: 0, pricePerQty: 3000000, total: 3000000, itemReturned: "-" },
      { itemCode: "AL-002", itemName: "Aluminum Ingots Premium Grade", description: "Aluminum Ingots Premium Grade", pph: false, qty: 1, uom: "KG", discount: 0, pricePerQty: 35000, total: 35000, itemReturned: "-" },
    ],
  },
  {
    id: "IR-002",
    invoiceReceiptNo: "IR/AMT.MDN/2601/0067",
    linkedPurchaseInvoiceNo: "STIE425738169",
    linkedPONo: "PO/AMT.MDN/2510/6892",
    supplierName: "CV Berkah Sentosa",
    ptCompany: "AMT",
    warehouse: "MEDAN",
    createDate: "18/01/2026",
    totalAmount: 1000000,
    discount: 0,
    ppn: 0,
    pph: 0,
    otherCost: 0,
    grandTotal: 1000000,
    downPayment: 0,
    outstanding: 1000000,
    currency: "IDR",
    remarks: "",
    status: "COMPLETE",
    linkedDocs: [
      { type: "Purchase Invoice", docNo: "STIE425738169", badgeLabel: "PI", badgeColor: "blue" },
    ],
    items: [
      { itemCode: "FAS-001", itemName: "Fasteners Mixed", description: "Fasteners Mixed", pph: false, qty: 1, uom: "BOX", discount: 0, pricePerQty: 1000000, total: 1000000, itemReturned: "-" },
    ],
  },
  {
    id: "IR-003",
    invoiceReceiptNo: "IR/WNS.MDN/2602/0015",
    linkedPurchaseInvoiceNo: "STIC639417582",
    linkedPONo: "PO/WNS.MDN/2510/7258",
    supplierName: "PT Karya Abadi",
    ptCompany: "WNS",
    warehouse: "MEDAN",
    createDate: "03/02/2026",
    totalAmount: 95000000,
    discount: 0,
    ppn: 0,
    pph: 0,
    otherCost: 0,
    grandTotal: 95000000,
    downPayment: 47500000,
    outstanding: 47500000,
    currency: "IDR",
    remarks: "Documents received but validation pending",
    status: "COMPLETE",
    linkedDocs: [
      { type: "Purchase Invoice", docNo: "STIC639417582", badgeLabel: "PI", badgeColor: "blue" },
      { type: "Payment Voucher", docNo: "PV/WNS.MDN/2510/0055", badgeLabel: "PV", badgeColor: "green" },
    ],
    items: [
      { itemCode: "IND-001", itemName: "Industrial Materials", description: "Industrial Materials", pph: false, qty: 200, uom: "TON", discount: 0, pricePerQty: 475000, total: 95000000, itemReturned: "-" },
    ],
  },
];

