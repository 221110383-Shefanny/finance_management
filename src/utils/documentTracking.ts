import { mockPurchaseOrder, mockpurchaseInvoice, mockImportCosts, mockpurchaseReturns, mockShipmentRequest } from '../mocks/mockData';

export interface DocumentTrackingStep {
  label: string;
  date: string | null;
  isCompleted: boolean;
  description?: string;
}

export interface DocumentTrackingMainStep {
  id: string;
  label: string;
  isCompleted: boolean;
  subSteps: DocumentTrackingStep[];
}

export interface DocumentTracking {
  documentType: string;
  documentNo: string;
  supplierName: string;
  steps: DocumentTrackingStep[];
  mainSteps?: DocumentTrackingMainStep[];
}

/**
 * Converts date string from DD/MM/YYYY or YYYY-MM-DD format to readable format
 */
export function formatDateForDisplay(date: string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    // Handle YYYY-MM-DD format
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    // Already in DD/MM/YYYY format
    return date;
  } catch {
    return date || 'N/A';
  }
}

/**
 * Find parent documents (e.g., PO for a selected PI)
 */
function findParentDocuments(docType: string, docData: any): { type: string; data: any }[] {
  const parents: { type: string; data: any }[] = [];

  // If this is a PI, try to find its linked PO
  if (docType === 'PI' && docData?.purchaseInvoiceNo) {
    const linkedPO = mockPurchaseOrder.find(
      po => po.linkedDocs?.docNo === docData.purchaseInvoiceNo || 
             po.purchaseInvoiceNo === docData.purchaseInvoiceNo
    );
    if (linkedPO) {
      parents.push({ type: 'PO', data: linkedPO });
    }
  }
  // If this is an IC, try to find its linked PO or PI
  else if (docType === 'IC' && docData?.icNum) {
    const linkedPO = mockPurchaseOrder.find(
      po => po.linkedDocs?.docNo === docData.icNum
    );
    if (linkedPO) {
      parents.push({ type: 'PO', data: linkedPO });
    }
    const linkedPI = mockpurchaseInvoice.find(
      pi => pi.linkedDocs?.docNo === docData.icNum
    );
    if (linkedPI) {
      parents.push({ type: 'PI', data: linkedPI });
    }
  }
  // If this is a PR, try to find its linked PO or PI
  else if (docType === 'PR' && docData?.prNo) {
    const linkedPO = mockPurchaseOrder.find(
      po => po.linkedDocs?.docNo === docData.prNo
    );
    if (linkedPO) {
      parents.push({ type: 'PO', data: linkedPO });
    }
    const linkedPI = mockpurchaseInvoice.find(
      pi => pi.linkedDocs?.docNo === docData.prNo
    );
    if (linkedPI) {
      parents.push({ type: 'PI', data: linkedPI });
    }
  }
  // If this is a SR, try to find its linked PO or PI
  else if (docType === 'SR' && docData?.srNum) {
    const linkedPO = mockPurchaseOrder.find(
      po => po.linkedDocs?.docNo === docData.srNum
    );
    if (linkedPO) {
      parents.push({ type: 'PO', data: linkedPO });
    }
    const linkedPI = mockpurchaseInvoice.find(
      pi => pi.linkedDocs?.docNo === docData.srNum
    );
    if (linkedPI) {
      parents.push({ type: 'PI', data: linkedPI });
    }
  }

  return parents;
}

/**
 * Build document chain by following linked documents
 */
function buildDocumentChain(docType: string, docData: any, visited: Set<string> = new Set()): DocumentTrackingMainStep[] {
  const mainSteps: DocumentTrackingMainStep[] = [];
  const key = `${docType}-${docData?.purchaseOrderNo || docData?.purchaseInvoiceNo || docData?.icNum || docData?.srNum}`;
  
  if (visited.has(key)) return mainSteps;
  visited.add(key);

  // First, check if there are parent documents we should show first
  const parentDocs = findParentDocuments(docType, docData);
  for (const parent of parentDocs) {
    mainSteps.push(...buildDocumentChain(parent.type, parent.data, visited));
  }

  // Get current document's steps
  let currentSteps: DocumentTrackingStep[] = [];
  let label = docType;
  let isCompleted = false;

  if (docType === 'PO' && docData?.purchaseOrderNo) {
    const createdDate = docData.createDate;
    const approvedDate = docData.approvalDate;
    const suppliedDate = docData.suppliedDate;
    
    currentSteps = [
      { label: 'Created', date: formatDateForDisplay(createdDate), isCompleted: !!createdDate },
      { label: 'Approved', date: formatDateForDisplay(approvedDate), isCompleted: !!approvedDate },
      { label: 'Supplied', date: formatDateForDisplay(suppliedDate), isCompleted: !!suppliedDate }
    ];
    label = 'Purchase Order';
    isCompleted = !!createdDate;
  } else if (docType === 'PI' && docData?.purchaseInvoiceNo) {
    const createdDate = docData.referenceDate;
    const sentDate = docData.referenceDate;
    const receivedDate = docData.docReceivedDate;
    
    currentSteps = [
      { label: 'Created', date: formatDateForDisplay(createdDate), isCompleted: !!createdDate },
      { label: 'Sent', date: formatDateForDisplay(sentDate), isCompleted: !!sentDate },
      { label: 'Received', date: formatDateForDisplay(receivedDate), isCompleted: !!receivedDate }
    ];
    label = 'Purchase Invoice';
    isCompleted = !!createdDate;
  } else if (docType === 'IC' && docData?.icNum) {
    const createdDate = docData.icDate;
    const sentDate = docData.icDate;
    const approvedDate = docData.approvalDate;
    
    currentSteps = [
      { label: 'Created', date: formatDateForDisplay(createdDate), isCompleted: !!createdDate },
      { label: 'Sent', date: formatDateForDisplay(sentDate), isCompleted: !!sentDate },
      { label: 'Approved', date: formatDateForDisplay(approvedDate), isCompleted: !!approvedDate }
    ];
    label = 'Import Cost';
    isCompleted = !!createdDate;
  } else if (docType === 'PR' && docData?.prNo) {
    const createdDate = docData.returnCreatedDate;
    const sentDate = docData.returnDate;
    const receivedDate = docData.receivedDate;
    
    currentSteps = [
      { label: 'Created', date: formatDateForDisplay(createdDate), isCompleted: !!createdDate },
      { label: 'Sent', date: formatDateForDisplay(sentDate), isCompleted: !!sentDate },
      { label: 'Received', date: formatDateForDisplay(receivedDate), isCompleted: !!receivedDate }
    ];
    label = 'Purchase Return';
    isCompleted = !!createdDate;
  } else if (docType === 'SR' && docData?.srNum) {
    const createdDate = docData.submittedDate;
    const sentDate = docData.submittedDate;
    const approvedDate = docData.approvalDate;
    
    currentSteps = [
      { label: 'Created', date: formatDateForDisplay(createdDate), isCompleted: !!createdDate },
      { label: 'Sent', date: formatDateForDisplay(sentDate), isCompleted: !!sentDate },
      { label: 'Approved', date: formatDateForDisplay(approvedDate), isCompleted: !!approvedDate }
    ];
    label = 'Shipment Request';
    isCompleted = !!createdDate;
  }

  mainSteps.push({
    id: key,
    label,
    isCompleted,
    subSteps: currentSteps
  });

  // Then, check for child documents and continue the chain forward
  if (Array.isArray(docData?.linkedDocs)) {
    for (const linkedDoc of docData.linkedDocs) {
      const linkedType = linkedDoc.type?.substring(0, 2).toUpperCase();
      let linkedData: any = null;

      if (linkedType === 'PI') {
        linkedData = mockpurchaseInvoice.find(pi => pi.purchaseInvoiceNo === linkedDoc.docNo);
      } else if (linkedType === 'IC') {
        linkedData = mockImportCosts.find(ic => ic.icNum === linkedDoc.docNo);
      } else if (linkedType === 'PR') {
        linkedData = mockpurchaseReturns.find(pr => pr.prNo === linkedDoc.docNo);
      } else if (linkedType === 'SR') {
        linkedData = mockShipmentRequest.find(sr => sr.srNum === linkedDoc.docNo);
      }

      if (linkedData) {
        mainSteps.push(...buildDocumentChain(linkedType, linkedData, visited));
      }
    }
  }

  return mainSteps;
}

/**
 * Get document tracking information based on document type and data
 */
export function getDocumentTracking(docType: string, docNo: string, docData?: any): DocumentTracking {
  // For Purchase Orders: created date -> approved date -> supplied date
  if (docType === 'PO' && docData?.purchaseOrderNo) {
    const linkedPINo = docData?.linkedDocs?.docNo;
    const linkedPI = linkedPINo ? mockpurchaseInvoice.find(pi => pi.purchaseInvoiceNo === linkedPINo) : null;
    const createdDate = docData.createDate;
    const approvedDate = linkedPI?.referenceDate || docData.approvalDate;
    const suppliedDate = linkedPI?.docReceivedDate;
    
    return {
      documentType: 'Purchase Order',
      documentNo: docData.purchaseOrderNo,
      supplierName: docData.supplierName || 'Unknown',
      steps: [
        {
          label: 'Created',
          date: formatDateForDisplay(createdDate),
          isCompleted: true,
          description: 'PO created in the system'
        },
        {
          label: 'Approved',
          date: formatDateForDisplay(approvedDate),
          isCompleted: true,
          description: 'PO approved by management'
        },
        {
          label: 'Supplied',
          date: formatDateForDisplay(suppliedDate),
          isCompleted: !!suppliedDate,
          description: 'Goods received (PI receipt date)'
        }
      ],
      mainSteps: buildDocumentChain(docType, docData)
    };
  }
  
  // For Purchase Invoices: created date -> sent date -> received date
  if (docType === 'PI' && docData?.purchaseInvoiceNo) {
    const createdDate = docData.referenceDate;
    const sentDate = docData.referenceDate;
    const receivedDate = docData.docReceivedDate;
    
    return {
      documentType: 'Purchase Invoice',
      documentNo: docData.purchaseInvoiceNo,
      supplierName: docData.supplierName || 'Unknown',
      steps: [
        {
          label: 'Created',
          date: formatDateForDisplay(createdDate),
          isCompleted: true,
          description: 'Invoice created by supplier'
        },
        {
          label: 'Sent',
          date: formatDateForDisplay(sentDate),
          isCompleted: true,
          description: 'Invoice sent to company'
        },
        {
          label: 'Received',
          date: formatDateForDisplay(receivedDate),
          isCompleted: !!receivedDate,
          description: 'Invoice received in the system'
        }
      ],
      mainSteps: buildDocumentChain(docType, docData)
    };
  }

  // For Import Costs: created date -> sent date -> received date
  if (docType === 'IC' && docData?.icNum) {
    const createdDate = docData.icDate;
    const sentDate = docData.icDate;
    const approvedDate = docData.approvalDate;
    
    return {
      documentType: 'Import Cost',
      documentNo: docData.icNum,
      supplierName: docData.supplierName || 'Unknown',
      steps: [
        {
          label: 'Created',
          date: formatDateForDisplay(createdDate),
          isCompleted: true,
          description: 'Import cost created'
        },
        {
          label: 'Sent',
          date: formatDateForDisplay(sentDate),
          isCompleted: true,
          description: 'Sent for processing'
        },
        {
          label: 'Approved',
          date: formatDateForDisplay(approvedDate),
          isCompleted: !!approvedDate,
          description: 'Approved by manager'
        }
      ],
      mainSteps: buildDocumentChain(docType, docData)
    };
  }

  // For Purchase Returns: created date -> sent date -> received date
  if (docType === 'PR' && docData?.prNo) {
    const createdDate = docData.returnCreatedDate;
    const sentDate = docData.returnDate;
    const receivedDate = docData.receivedDate;
    
    return {
      documentType: 'Purchase Return',
      documentNo: docData.prNo,
      supplierName: docData.supplierName || 'Unknown',
      steps: [
        {
          label: 'Created',
          date: formatDateForDisplay(createdDate),
          isCompleted: true,
          description: 'Return created'
        },
        {
          label: 'Sent',
          date: formatDateForDisplay(sentDate),
          isCompleted: true,
          description: 'Return sent to supplier'
        },
        {
          label: 'Received',
          date: formatDateForDisplay(receivedDate),
          isCompleted: !!receivedDate,
          description: 'Goods received back from supplier'
        }
      ],
      mainSteps: buildDocumentChain(docType, docData)
    };
  }

  // For Shipment Requests: created date -> sent date -> received date
  if (docType === 'SR' && docData?.srNum) {
    const createdDate = docData.submittedDate;
    const sentDate = docData.submittedDate;
    const receivedDate = docData.approvalDate;
    
    return {
      documentType: 'Shipment Request',
      documentNo: docData.srNum,
      supplierName: docData.supplierName || 'Unknown',
      steps: [
        {
          label: 'Created',
          date: formatDateForDisplay(createdDate),
          isCompleted: true,
          description: 'Shipment request created'
        },
        {
          label: 'Sent',
          date: formatDateForDisplay(sentDate),
          isCompleted: true,
          description: 'Request sent to logistics'
        },
        {
          label: 'Received',
          date: formatDateForDisplay(receivedDate),
          isCompleted: !!receivedDate,
          description: 'Approved by logistics team'
        }
      ],
      mainSteps: buildDocumentChain(docType, docData)
    };
  }

  // Default fallback
  return {
    documentType: docType,
    documentNo: docNo,
    supplierName: 'Unknown',
    steps: [
      {
        label: 'Created',
        date: 'N/A',
        isCompleted: true
      },
      {
        label: 'Processed',
        date: 'N/A',
        isCompleted: false
      },
      {
        label: 'Completed',
        date: 'N/A',
        isCompleted: false
      }
    ],
    mainSteps: [
      {
        id: 'default-1',
        label: docType,
        isCompleted: true,
        subSteps: [
          {
            label: 'Created',
            date: 'N/A',
            isCompleted: true
          }
        ]
      }
    ]
  };
}
