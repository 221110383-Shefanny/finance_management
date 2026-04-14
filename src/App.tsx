import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Receipt,
  FileCheck,
  CreditCard,
  Wallet,
  ClipboardList,
  DollarSign,
  Pin,
  PinOff,
  Edit,
  Check,
  X,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible";
import { Search, LinkIcon, MessageCircle, Send, ChevronDown } from "lucide-react";
import Dashboard from "./components/Dashboard";
import PurchaseOrder from "./components/PurchaseOrder";
import PurchaseInvoice from "./components/PurchaseInvoice";
import PurchaseReturn from "./components/PurchaseReturn";
import ImportCost from "./components/ImportCost";
import APNote from "./components/APNote";
import ShipmentRequest from "./components/ShipmentRequest";
import PVR from "./components/PVR";
import PV from "./components/PV";
import PaymentVoucherV2 from "./components/PaymentVoucherV2";
import ReimburseWithoutPO from "./components/ReimburseWithoutPO";
import InvoiceReceipt from "./components/InvoiceReceipt";
import EmptyTab from "./components/EmptyTab";
import { DocumentMonitoringDialog } from "./components/DocumentMonitoringDialog";
import { DocumentTrackingDisplay } from "./components/DocumentTrackingDisplay";
import { Toaster } from "./components/ui/sonner";
import { getDocumentTracking, DocumentTracking } from "./utils/documentTracking";
import { mockPurchaseOrder, mockExpenseNote, mockImportCosts, mockpurchaseInvoice, mockShipmentRequest, mockpurchaseReturns, mockPV2, mockPVR, mockPV, mockReimburseWithoutPO, initializeMockPVRData, initializeMockPVData } from "./mocks/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("PAYMENT VOUCHER (VER 2)");
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [currentPICName, setCurrentPICName] =
    useState("SHEFANNY");
  const [isEditingPIC, setIsEditingPIC] = useState(false);
  const [
    selectedPurchaseInvoiceNo,
    setSelectedPurchaseInvoiceNo,
  ] = useState<string | null>(null);
  const [selectedPurchaseOrderNo, setSelectedPurchaseOrderNo] =
    useState<string | null>(null);
  const [selectedImportCostNo, setSelectedImportCostNo] =
    useState<string | null>(null);
  const [selectedAPNoteNo, setSelectedAPNoteNo] = useState<
    string | null
  >(null);
  const [selectedReimburseNo, setSelectedReimburseNo] = useState<
    string | null
  >(null);
  const [selectedInvoiceReceiptNo, setSelectedInvoiceReceiptNo] = useState<string | null>(null);
  const [pvrData, setPvrData] = useState<any[]>([]);
  const [showFloatingDialog, setShowFloatingDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Pending" | "Done" | "Pending > 2 Days">("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =   useState<"All" | "Purchasing" | "Logistic">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessagesByWarehouse, setChatMessagesByWarehouse] = useState<{[key: string]: any[]}>({});
  const [chatInput, setChatInput] = useState("");
  const [selectedDocForChat, setSelectedDocForChat] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [documentsByWarehouse, setDocumentsByWarehouse] = useState<{[key: string]: any[]}>({});
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [countdownTimers, setCountdownTimers] = useState<{[key: string]: number}>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [floatingDialogTab, setFloatingDialogTab] = useState<"tracker" | "notification">("tracker");
  const [showTrackerMonitoringDialog, setShowTrackerMonitoringDialog] = useState(false);
  const [trackerSearchInput, setTrackerSearchInput] = useState("");
  const [selectedTrackerDocument, setSelectedTrackerDocument] = useState<any>(null);
  const [documentTracking, setDocumentTracking] = useState<DocumentTracking | null>(null);

  // Initialize mock PVR data to localStorage on app load (MUST run before any component tries to create PVR)
  useEffect(() => {
    try {
      initializeMockPVRData();
      initializeMockPVData();
    } catch (error) {
      console.error("Failed to initialize mock data:", error);
    }
  }, []); // Run once on app load

  // Initialize mock AP Notes to localStorage on app load
  useEffect(() => {
    try {
      const existingAPNotes = JSON.parse(localStorage.getItem("createdAPNotes") || "[]");
      
      // Check if the mock AP note alrea
      // dy exists by apNoteNo
      const mockAPNoteNumbers = mockExpenseNote.map(note => note.apNoteNo);
      const missingMockNotes = mockExpenseNote.filter(
        mockNote => !existingAPNotes.some((existing: any) => existing.apNoteNo === mockNote.apNoteNo)
      ).map((note: any) => {
        // Extract PO number from linkedDocs
        let poNumber = "";
        if (note.linkedDocs && Array.isArray(note.linkedDocs)) {
          const poDoc = note.linkedDocs.find((doc: any) => doc.type === "Purchase Order" || doc.type === "PO");
          if (poDoc) {
            poNumber = poDoc.docNo || poDoc.documentNo;
          }
        }
        
        return {
          ...note,
          poNumber: poNumber, // Add poNumber for filtering in POCollapsible
        };
      });
      
      // If any mock notes are missing, add them
      if (missingMockNotes.length > 0) {
        const updatedAPNotes = [...existingAPNotes, ...missingMockNotes];
        localStorage.setItem("createdAPNotes", JSON.stringify(updatedAPNotes));
        console.log(`✅ Added ${missingMockNotes.length} mock AP Notes to localStorage`);
        console.log("📋 Mock AP Notes with PO numbers:", missingMockNotes.map((n: any) => ({
          apNoteNo: n.apNoteNo,
          poNumber: n.poNumber,
        })));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'createdAPNotes',
          newValue: JSON.stringify(updatedAPNotes),
          storageArea: localStorage
        }));
      } else {
        console.log("✅ All mock AP Notes already exist in localStorage");
      }
    } catch (error) {
      console.error("Failed to initialize mock AP Notes:", error);
    }
  }, []);

  // Initialize mock PVR data to localStorage on app load
  useEffect(() => {
    try {
      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      
      // Check if the mock PVRs already exist by pvrNo
      const mockPVRNumbers = mockPurchaseOrder.reduce((acc: string[], po) => {
        if (po.linkedDocs?.type === "Purchase Invoice") {
          acc.push(po.linkedDocs.docNo);
        }
        return acc;
      }, []);

      // For now, ensure mock PVR data is initialized
      if (existingPVRs.length === 0) {
        // If localStorage is empty, we'll let PVR.tsx handle the initialization
        // because it has the proper mockPVR with linkedDocs structure
        console.log("[APP] localStorage pvrData is empty - PVR component will initialize with mock data");
      } else {
        console.log(`✅ Found ${existingPVRs.length} PVRs in localStorage`);
        setPvrData(existingPVRs);
      }
    } catch (error) {
      console.error("Failed to initialize PVR data:", error);
    }
  }, []);

  // Load pvrData from localStorage to sync with PVR component
  useEffect(() => {
    try {
      const savedPVRs = localStorage.getItem("pvrData");
      if (savedPVRs) {
        setPvrData(JSON.parse(savedPVRs));
      }
    } catch (error) {
      console.error("Failed to load PVR data:", error);
    }
  }, []);

  // Listen for pvrData and pvData changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedPVRs = localStorage.getItem("pvrData");
        if (savedPVRs) {
          setPvrData(JSON.parse(savedPVRs));
        }
        
        // Also trigger a general refresh key
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error("Failed to sync storage data:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] -= 1;
          if (updated[key] < 0) {
            delete updated[key];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close DocumentTrackingDisplay when switching tabs (not in notification or floating dialog closes)
  useEffect(() => {
    if (floatingDialogTab === "tracker" || !showFloatingDialog) {
      setDocumentTracking(null);
      setSelectedTrackerDocument(null);
    }
  }, [floatingDialogTab, showFloatingDialog]);

  // Set up global navigation event listeners
  useEffect(() => {
    const handleReimburseEvent = (event: any) => {
      // Just set state directly — don't call handleNavigateToReimburse to avoid re-dispatching
      setSelectedReimburseNo(event.detail.reimburseNo);
      setActiveTab("REIMBURSE WITHOUT PO");
    };

    const handlePOEvent = (event: any) => {
      handleNavigateToPurchaseOrder(event.detail.poNo);
    };

    const handleChangeTabEvent = (event: any) => {
      setActiveTab(event.detail.tab);
    };

    const handleIREvent = (event: any) => {
      setSelectedInvoiceReceiptNo(event.detail.irNo);
      setActiveTab("INVOICE RECEIPT");
    };

    const handlePIEvent = (event: any) => {
      setSelectedPurchaseInvoiceNo(event.detail.piNo);
      setActiveTab("PURCHASE INVOICE");
    };

    window.addEventListener("navigateToReimburse" as any, handleReimburseEvent);
    window.addEventListener("navigateToPurchaseOrder" as any, handlePOEvent);
    window.addEventListener("changeTab" as any, handleChangeTabEvent);
    window.addEventListener("navigateToInvoiceReceipt" as any, handleIREvent);
    window.addEventListener("navigateToPurchaseInvoice" as any, handlePIEvent);

    return () => {
      window.removeEventListener("navigateToReimburse" as any, handleReimburseEvent);
      window.removeEventListener("navigateToPurchaseOrder" as any, handlePOEvent);
      window.removeEventListener("changeTab" as any, handleChangeTabEvent);
      window.removeEventListener("navigateToInvoiceReceipt" as any, handleIREvent);
      window.removeEventListener("navigateToPurchaseInvoice" as any, handlePIEvent);
    };
  }, []);

  /**
   * Detect document type based on document number format or data structure
   */
  const detectDocumentType = (doc: any): string => {
    if (!doc) return 'Unknown';
    
    // Check by document number prefix
    if (doc.poNo || doc.piNo) {
      // It's a PI if it has piNo
      if (doc.piNo) {
        // Check if there's a linked PO to determine if we should show PO tracking instead
        if (doc.noPO) {
          const linkedPO = mockPurchaseOrder.find(po => po.purchaseOrderNo === doc.noPO || po.poId === doc.poId);
          // If it's from a search result or raw mock data, check docType field
          if (doc.docType === 'PO') return 'PO';
          // Otherwise treat as PI for tracking purposes (PI is supplied date perspective)
          return 'PI';
        }
        return 'PI';
      }
      if (doc.poNo) return 'PO';
      if (doc.poId) return 'PO';
    }
    
    // Check by document number prefix pattern
    const docNo = doc.docNo || doc.piNo || doc.poNo || '';
    if (docNo.startsWith('PO/')) return 'PO';
    if (docNo.match(/^STI[A-Z]\d+/)) return 'PI'; // STID..., STIE..., STIC...
    if (docNo.startsWith('IMP/')) return 'IC'; // Import Cost
    if (docNo.startsWith('PR/')) return 'PR'; // Purchase Return
    if (docNo.match(/^SR\/|^\d+\/XI\/SR/)) return 'SR'; // Shipment Request
    if (docNo.startsWith('AP/')) return 'EN'; // Expense Note (AP Note)
    if (docNo.startsWith('PVR/')) return 'PVR'; // Payment Voucher Request
    if (docNo.startsWith('PV/')) return 'PV'; // Payment Voucher
    
    // Fallback based on data structure
    if (doc.piId || doc.purchaseInvoiceNo) return 'PI';
    if (doc.poId || doc.purchaseOrderNo) return 'PO';
    if (doc.icId || doc.icNum) return 'IC';
    if (doc.returId || doc.prNo) return 'PR';
    if (doc.srId || doc.srNum) return 'SR';
    
    return 'PI'; // Default to PI
  };

  const picNames = [
    "SHEFANNY",
    "DEWI",
    "ELLVA",
    "VANNESA",
    "ERNI",
    "NADYA",
    "STELLA",
    "JESSICA",
    "CHINTYA",
    "HELEN",
    "KELLY",
    "JENNIFER",
  ];

  const menuItems = [
    { name: "DASHBOARD", icon: LayoutDashboard },
    { name: "REIMBURSE WITHOUT PO", icon: Receipt },
    { name: "INVOICE RECEIPT", icon: Receipt },
    { name: "PURCHASE ORDER", icon: FileText },
    { name: "PURCHASE INVOICE", icon: Receipt },
    { name: "PURCHASE RETURN", icon: Receipt },
    { name: "IMPORT COST", icon: DollarSign },
    { name: "SHIPMENT REQUEST", icon: ClipboardList },
    { name: "EXPENSES NOTE", icon: FileCheck },
    { name: "PAYMENT VOUCHER REQUEST", icon: CreditCard },
    { name: "PAYMENT VOUCHER", icon: Wallet },
    { name: "PAYMENT VOUCHER (VER 2)", icon: Wallet },
  ];

  const handleNavigateToPurchaseInvoice = (
    documentNo: string,
  ) => {
    setSelectedPurchaseInvoiceNo(documentNo);
    setActiveTab("PURCHASE INVOICE");
  };

  const handleNavigateToPurchaseOrder = (
    documentNo: string,
  ) => {
    // If it's a PO number (like "PO/MJS.MDN/2510/8472"), find the poId
    // If it's already a poId (like "po_001"), use it directly
    let poId = documentNo;

    if (documentNo.startsWith("PO/")) {
      // It's a PO number, need to find the poId
      const foundPO = mockPurchaseOrder.find(
        (po) => po.purchaseOrderNo === documentNo,
      );
      poId = foundPO?.poId || documentNo;
    }

    setSelectedPurchaseOrderNo(poId);
    setActiveTab("PURCHASE ORDER");

    // Don't dispatch event again here - the PurchaseOrder component has its own listener
    // that handles navigation based on the selectedPurchaseOrderNo prop change
    console.log(
      "✅ Navigating to Purchase Order:",
      documentNo,
    );
  };

const handleNavigateToReimburse = (reimburseNo: string) => {
  console.log("🎯 [APP] Navigation to Reimburse:", reimburseNo);
  
  // Set the selected reimburse document
  setSelectedReimburseNo(reimburseNo);
  // Set the tab
  setActiveTab("REIMBURSE WITHOUT PO");

  // Dispatch event after delay so ReimburseWithoutPO component can auto-expand
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("navigateToReimburse", {
        detail: { reimburseNo },
      }),
    );
  }, 300);
};

  const handleNavigateToImportCost = (documentNo: string) => {
    setSelectedImportCostNo(documentNo);
    setActiveTab("IMPORT COST");

    // Dispatch event to trigger auto-expand in ImportCost component
    // Use longer delay (300ms) to ensure component is rendered with data
    setTimeout(() => {
      const event = new CustomEvent("navigateToImportCost", {
        detail: { docNo: documentNo },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToImportCost event dispatched for:",
        documentNo,
      );
    }, 300);
  };

  const handleNavigateToAPNote = (apNoteId: string) => {
    setSelectedAPNoteNo(apNoteId);
    setActiveTab("EXPENSES NOTE");

    // Dispatch event to trigger auto-expand in APNote component
    // Use longer delay (300ms) to ensure component is rendered with data
    setTimeout(() => {
      const event = new CustomEvent("navigateToAPNote", {
        detail: { apNoteId },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToAPNote event dispatched for:",
        apNoteId,
      );
    }, 300);
  };

  const handleNavigateToShipmentRequest = (
    documentNo: string,
  ) => {
    console.log(
      "🎯 handleNavigateToShipmentRequest called with:",
      documentNo,
    );
    setActiveTab("SHIPMENT REQUEST");
    setTimeout(() => {
      const event = new CustomEvent(
        "navigateToShipmentRequest",
        { detail: { documentNo } },
      );
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToShipmentRequest event dispatched for:",
        documentNo,
      );
    }, 300);
  };

  const handleNavigateToPVR = (pvrNo: string) => {
    console.log("🎯 handleNavigateToPVR called with:", pvrNo);
    setActiveTab("PAYMENT VOUCHER REQUEST");
    setTimeout(() => {
      const event = new CustomEvent("navigateToPVR", {
        detail: { pvrNo },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToPVR event dispatched for:",
        pvrNo,
      );
    }, 300);
  };

  const handleNavigateToPaymentVoucher = (pvrNo: string, pvrId: string, pvrData?: any) => {
    console.log("🎯 handleNavigateToPaymentVoucher called with:", { pvrNo, pvrId, pvrData });
    setActiveTab("PAYMENT VOUCHER REQUEST");
    setTimeout(() => {
      const event = new CustomEvent("navigateToPaymentVoucher", {
        detail: { pvrNo, pvrId, pvrData },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToPaymentVoucher event dispatched for:",
        { pvrNo, pvrId, pvrData },
      );
    }, 300);
  };

  const handleNavigateToPV = (pvNo: string) => {
    console.log("🎯 handleNavigateToPV called with:", pvNo);
    setActiveTab("PAYMENT VOUCHER");
    setTimeout(() => {
      const event = new CustomEvent("navigateToPaymentVoucher", {
        detail: { pvNo },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToPaymentVoucher event dispatched for:",
        pvNo,
      );
    }, 300);
  };

  const handleNavigateToPurchaseReturn = (prNo: string) => {
    console.log("🎯 handleNavigateToPurchaseReturn called with:", prNo);
    setActiveTab("PURCHASE RETURN");
    setTimeout(() => {
      const event = new CustomEvent("navigateToPurchaseReturn", {
        detail: { prNo },
      });
      window.dispatchEvent(event);
      console.log(
        "✅ navigateToPurchaseReturn event dispatched for:",
        prNo,
      );
    }, 300);
  };

  const handleAPNoteCreated = (apNoteData: any) => {
    console.log("✅ handleAPNoteCreated called with data:", apNoteData);
    
    // Save to localStorage
    try {
      const existingAPNotes = JSON.parse(localStorage.getItem("createdAPNotes") || "[]");
      const updatedAPNotes = [...existingAPNotes, apNoteData];
      localStorage.setItem("createdAPNotes", JSON.stringify(updatedAPNotes));
      console.log("💾 AP Note saved to localStorage:", apNoteData.apNoteNo);
    } catch (error) {
      console.error("Failed to save AP Note to localStorage:", error);
    }
  };

  // Get filtered documents for tracker - from localStorage + mockData
const getFilteredDocuments = () => {
  try {
    // Get stored notified documents from localStorage
    const storedNotifiedDocs = JSON.parse(localStorage.getItem("notifiedDocuments") || "[]");
    
    // Ensure all localStorage documents have source field
    const storedNotifiedDocsWithCategory = storedNotifiedDocs.map((doc: any) => ({
      ...doc,
      source: "localStorage",
      category: doc.category || "Logistic"
    }));

    // Check section: dokumen sudah diterima (receivedStatus=true) tapi belum dicek (checkStatus=false)
    const notifiedCheckDocs = storedNotifiedDocsWithCategory.filter(
      (doc: any) => doc.isNotified === true && doc.checkStatus === false && doc.receivedStatus === true
    );

    // Document Receipt section: dokumen belum diterima (receivedStatus=false) tapi sudah dinotifikasi (isNotified=true)
    const storedDocReceiptDocs = storedNotifiedDocsWithCategory.filter(
      (doc: any) => doc.isNotified === true && doc.receivedStatus === false
    );

    // Filter dari mock data (fallback untuk Check section)
    const mockCheckFiltered = mockpurchaseInvoice
      .filter((pi) => pi.checkStatus === false && pi.receivedStatus === true)
      .map((pi) => ({
        id: pi.piId,
        poNo: pi.noPO || "-",
        piNo: pi.purchaseInvoiceNo || "-",
        traceCode: pi.warehouse || "-",
        checkStatus: pi.checkStatus,
        receivedStatus: pi.receivedStatus,
        isNotified: false, // mock data tidak punya notified
        status: pi.checkStatus ? "Done" : "Pending",
        piData: pi,
        source: "mockData",
        statusType: "Check",
        category: "Logistic",
        dataSource: "mockData"
      }));

    // Gabungkan hasil mock + localStorage untuk Check section
    // Prioritaskan localStorage jika ada piId yang sama
    const mergedCheckDocs = [
      ...mockCheckFiltered.filter(
        (mockDoc) => !notifiedCheckDocs.some((storedDoc: any) => storedDoc.id === mockDoc.id)
      ),
      ...notifiedCheckDocs,
    ];

    // Document Receipt section: hanya dari localStorage
    const mergedDocReceiptDocs = storedDocReceiptDocs;

    // Combine all sources
    const combined = [...mergedCheckDocs, ...mergedDocReceiptDocs];

    // Tambahkan statusType, category, dan dataSource jika belum ada
    const enriched = combined.map((doc: any) => {
      if (!doc.statusType) {
        if (doc.isNotified === true && doc.receivedStatus === false) {
          doc.statusType = "Document Receipt";
        } else if (doc.receivedStatus === true) {
          doc.statusType = "Check";
        }
      }
      // Ensure category is set - all documents are Logistic
      if (!doc.category) {
        doc.category = "Logistic";
      }
      // Track data source
      if (!doc.dataSource) {
        doc.dataSource = "localStorage";
      }
      return doc;
    });

    // Remove duplicates by piNo
    const uniqueMap = new Map();
    enriched.forEach((doc) => {
      if (!uniqueMap.has(doc.piNo)) {
        uniqueMap.set(doc.piNo, doc);
      }
    });

    let filtered = Array.from(uniqueMap.values());

    // Apply All/Pending/Done filter
    if (selectedFilter === "Pending") {
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((doc) => {
        if (doc.status !== "Pending") return false;
        // Exclude documents pending > 2 days (only show documents NOT older than 2 days)
        if (doc.notificationTimestamp) {
          return doc.notificationTimestamp >= twoDaysAgo;
        }
        return true; // Show documents without timestamp
      });
    } else if (selectedFilter === "Done") {
      filtered = filtered.filter((doc) => doc.status === "Done");
    } else if (selectedFilter === "Pending > 2 Days") {
      // Filter documents that are pending AND were first notified more than 2 days ago
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((doc) => {
        if (doc.status !== "Pending") return false;
        if (doc.notificationTimestamp) {
          return doc.notificationTimestamp < twoDaysAgo;
        }
        return false;
      });
    }
    // "All" shows everything

    // Apply category filter (Purchasing/Logistic)
    if (selectedCategoryFilter === "Purchasing") {
      filtered = filtered.filter((doc) => doc.category === "Purchasing");
    } else if (selectedCategoryFilter === "Logistic") {
      filtered = filtered.filter((doc) => doc.category === "Logistic");
    }
    // "All" shows everything

    // Apply status type filter if selected
    if (selectedStatusFilter && selectedStatusFilter !== "All") {
      filtered = filtered.filter((doc) => doc.statusType === selectedStatusFilter);
    }

    return filtered;
  } catch (error) {
    console.error("Error getting filtered documents:", error);
    return [];
  }
};

// Search function for tracker documents
const getTrackerSearchResults = (searchTerm: string) => {
  if (!searchTerm.trim()) return [];
  
  const term = searchTerm.toLowerCase();
  const results: any[] = [];
  
  // Search through Purchase Orders
  mockPurchaseOrder.forEach((po: any) => {
    if (po.purchaseOrderNo?.toLowerCase().includes(term) || 
        po.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `po_${po.poId}`,
        type: "Purchase Order",
        docNo: po.purchaseOrderNo,
        displayName: po.purchaseOrderNo,
        supplier: po.supplierName,
        date: po.createDate,
        amount: po.grandTotal,
        currency: po.currency,
        data: po,
        docType: "PO"
      });
    }
  });
  
  // Search through Purchase Invoices
  mockpurchaseInvoice.forEach((pi: any) => {
    if (pi.purchaseInvoiceNo?.toLowerCase().includes(term) || 
        pi.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `pi_${pi.piId}`,
        type: "Purchase Invoice",
        docNo: pi.purchaseInvoiceNo,
        displayName: pi.purchaseInvoiceNo,
        supplier: pi.supplierName,
        date: pi.referenceDate,
        amount: pi.grandTotal,
        currency: pi.currency,
        data: pi,
        docType: "PI"
      });
    }
  });
  
  // Search through Purchase Returns
  mockpurchaseReturns.forEach((pr: any) => {
    if (pr.prNo?.toLowerCase().includes(term) || 
        pr.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `pr_${pr.returId}`,
        type: "Purchase Return",
        docNo: pr.prNo,
        displayName: pr.prNo,
        supplier: pr.supplierName,
        date: pr.returnCreatedDate,
        amount: pr.totalReturnAmount,
        currency: pr.currency,
        data: pr,
        docType: "PR"
      });
    }
  });
  
  // Search through Import Costs
  mockImportCosts.forEach((ic: any) => {
    if (ic.icNum?.toLowerCase().includes(term) || 
        ic.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `ic_${ic.icId}`,
        type: "Import Cost",
        docNo: ic.icNum,
        displayName: ic.icNum,
        supplier: ic.supplierName,
        date: ic.icDate,
        amount: ic.totalImportCost,
        currency: ic.currency,
        data: ic,
        docType: "IC"
      });
    }
  });
  
  // Search through Shipment Requests
  mockShipmentRequest.forEach((sr: any) => {
    if (sr.srNum?.toLowerCase().includes(term) || 
        sr.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `sr_${sr.srId}`,
        type: "Shipment Request",
        docNo: sr.srNum,
        displayName: sr.srNum,
        supplier: sr.supplierName,
        date: sr.submittedDate,
        amount: sr.totalShipmentRequest,
        currency: sr.currency,
        data: sr,
        docType: "SR"
      });
    }
  });
  
  // Search through Expense Notes
  mockExpenseNote.forEach((en: any) => {
    if (en.apNoteNo?.toLowerCase().includes(term) || 
        en.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `en_${en.apnoteId}`,
        type: "Expense Note",
        docNo: en.apNoteNo,
        displayName: en.apNoteNo,
        supplier: en.supplierName,
        date: en.apNoteCreateDate,
        amount: en.totalInvoice,
        currency: en.currency,
        data: en,
        docType: "EN"
      });
    }
  });
  
  // Search through Payment Voucher Returns
  mockPVR.forEach((pvr: any) => {
    if (pvr.pvrNo?.toLowerCase().includes(term) || 
        pvr.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `pvr_${pvr.pvrid}`,
        type: "Payment Voucher Return",
        docNo: pvr.pvrNo,
        displayName: pvr.pvrNo,
        supplier: pvr.supplierName,
        date: pvr.pvrDate,
        amount: pvr.totalPVR,
        currency: pvr.currency,
        data: pvr,
        docType: "PVR"
      });
    }
  });
  
  // Search through Payment Vouchers
  mockPV.forEach((pv: any) => {
    if (pv.pvNo?.toLowerCase().includes(term) || 
        pv.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `pv_${pv.pvid}`,
        type: "Payment Voucher",
        docNo: pv.pvNo,
        displayName: pv.pvNo,
        supplier: pv.supplierName,
        date: pv.pvDate,
        amount: pv.totalPVR,
        currency: pv.currency,
        data: pv,
        docType: "PV"
      });
    }
  });
  
  // Search through Payment Vouchers V2
  mockPV2.forEach((pv: any) => {
    if (pv.pvNo?.toLowerCase().includes(term) || 
        pv.pvCode?.toLowerCase().includes(term)) {
      results.push({
        id: `pv2_${pv.pvId}`,
        type: "Payment Voucher V2",
        docNo: pv.pvNo,
        displayName: pv.pvNo,
        supplier: pv.pvCode,
        date: pv.createdDate,
        amount: pv.totalAmount,
        currency: pv.currency,
        data: pv,
        docType: "PV2"
      });
    }
  });
  
  // Search through Reimburse Without PO
  mockReimburseWithoutPO.forEach((reim: any) => {
    if (reim.reimburseNo?.toLowerCase().includes(term) || 
        reim.supplierName?.toLowerCase().includes(term)) {
      results.push({
        id: `reim_${reim.reimId}`,
        type: "Reimburse Without PO",
        docNo: reim.reimburseNo,
        displayName: reim.reimburseNo,
        supplier: reim.supplierName,
        date: reim.createDate,
        amount: reim.grandTotal,
        currency: "IDR",
        data: reim,
        docType: "REIM"
      });
    }
  });
  
  return results.slice(0, 10); // Return max 10 results
};

  const renderContent = () => {
    switch (activeTab) {
      case "DASHBOARD":
        return <Dashboard />;
      case "REIMBURSE WITHOUT PO":
        return (
          <ReimburseWithoutPO
            selectedReimburseNo={selectedReimburseNo}
            onNavigateToPurchaseOrder={handleNavigateToPurchaseOrder}
            onNavigateToPaymentVoucher={(pvNo: string) => {
              console.log("🎯 handleNavigateToPV (from Reimburse) called with:", pvNo);
              setActiveTab("PAYMENT VOUCHER (VER 2)");
              setTimeout(() => {
                const event = new CustomEvent("navigateToPaymentVoucher", {
                  detail: { pvNo },
                });
                window.dispatchEvent(event);
              }, 300);
            }}
          />
        );
      case "PURCHASE ORDER":
        return (
          <PurchaseOrder
            selectedPONo={selectedPurchaseOrderNo}
            pvrData={pvrData}
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToShipmentRequest={
              handleNavigateToShipmentRequest
            }
            onNavigateToPVR={handleNavigateToPVR}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPurchaseReturn={handleNavigateToPurchaseReturn}
            onNavigateToPV={handleNavigateToPV}
            onNavigateToReimburse={handleNavigateToReimburse}
            refreshKey={refreshKey}
          />
        );
      case "PURCHASE INVOICE":
        return (
          <PurchaseInvoice
            currentPICName={currentPICName}
            selectedInvoiceNo={selectedPurchaseInvoiceNo}
            onNavigateToPurchaseOrder={handleNavigateToPurchaseOrder}
            onNavigateToPVR={handleNavigateToPVR}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPurchaseReturn={handleNavigateToPurchaseReturn}
            onNavigateToShipmentRequest={handleNavigateToShipmentRequest}
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToPV={handleNavigateToPV}
            refreshKey={refreshKey}
          />
        );
      case "INVOICE RECEIPT":
        return <InvoiceReceipt selectedInvoiceReceiptNo={selectedInvoiceReceiptNo} />;
      case "PURCHASE RETURN":
        return (
          <PurchaseReturn
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPVR={handleNavigateToPVR}
          />
        );
      case "IMPORT COST":
        return (
          <ImportCost
            selectedICNo={selectedImportCostNo}
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPVR={handleNavigateToPVR}
            onAPNoteCreated={handleAPNoteCreated}
          />
        );
      case "SHIPMENT REQUEST":
        return (
          <ShipmentRequest
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToShipmentRequest={
              handleNavigateToShipmentRequest
            }
            onNavigateToPVR={handleNavigateToPVR}
          />
        );
      case "EXPENSES NOTE":
        return (
          <APNote
            selectedICNo={selectedImportCostNo}
            selectedAPNoteNo={selectedAPNoteNo}
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToPVR={handleNavigateToPVR}
          />
        );
      case "PAYMENT VOUCHER REQUEST":
        return (
          <PVR
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToShipmentRequest={
              handleNavigateToShipmentRequest
            }
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPV={handleNavigateToPV}
          />
        );
      case "PAYMENT VOUCHER":
        return (
          <PV
            onNavigateToPurchaseInvoice={
              handleNavigateToPurchaseInvoice
            }
            onNavigateToPurchaseOrder={
              handleNavigateToPurchaseOrder
            }
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToShipmentRequest={
              handleNavigateToShipmentRequest
            }
            onNavigateToPVR={handleNavigateToPVR}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToPurchaseReturn={handleNavigateToPurchaseReturn}
          />
        );
      case "PAYMENT VOUCHER (VER 2)":
        return (
          <PaymentVoucherV2
            onNavigateToPurchaseInvoice={handleNavigateToPurchaseInvoice}
            onNavigateToPurchaseOrder={handleNavigateToPurchaseOrder}
            onNavigateToImportCost={handleNavigateToImportCost}
            onNavigateToShipmentRequest={handleNavigateToShipmentRequest}
            onNavigateToAPNote={handleNavigateToAPNote}
            onNavigateToReimburse={handleNavigateToReimburse}
          />
        );
      default:
        return <EmptyTab tabName={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex">
      {/* Sidebar Drawer */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-0"
        } fixed left-0 top-0 bottom-0 h-full z-50 transition-all duration-300 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 shadow-2xl flex flex-col`}
      >
        {isOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-purple-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold">
                      Finance
                    </h1>
                    <p className="text-purple-300 text-xs">
                      System
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-colors ${
                    isPinned
                      ? "text-white bg-purple-700/70 hover:bg-purple-700"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPinned(!isPinned);
                  }}
                  title={
                    isPinned
                      ? "Unpin sidebar (sidebar will close after click)"
                      : "Pin sidebar (keep sidebar open)"
                  }
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* User Info */}
              <div className="bg-purple-800/50 rounded-lg p-3 border border-purple-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-purple-400">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                      {currentPICName?.charAt(0) || "SF"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-white min-w-0">
                    {isEditingPIC ? (
                      <div className="flex items-center gap-1">
                        <Select
                          value={currentPICName}
                          onValueChange={setCurrentPICName}
                        >
                          <SelectTrigger className="h-7 bg-purple-700/50 border-purple-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {picNames.map((name) => (
                              <SelectItem
                                key={name}
                                value={name}
                              >
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-purple-300 hover:text-white hover:bg-purple-700/50"
                          onClick={() => setIsEditingPIC(false)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {currentPICName}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-purple-300 hover:text-white hover:bg-purple-700/50 flex-shrink-0"
                          onClick={() => setIsEditingPIC(true)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-purple-300 pl-13">
                  NIK: 2024-FIN-001
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      // Clear all selected document numbers so pages load normally
                      setSelectedPurchaseOrderNo(null);
                      setSelectedPurchaseInvoiceNo(null);
                      setSelectedImportCostNo(null);
                      setSelectedAPNoteNo(null);
                      setSelectedReimburseNo(null);
                      setSelectedInvoiceReceiptNo(null);
                      if (!isPinned) {
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center justify-start gap-3 px-4 py-3 rounded-lg w-full transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg font-medium"
                        : "text-purple-200 hover:bg-purple-700/30 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm text-left">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-purple-700/50">
              <div className="text-xs text-purple-300 text-center">
                © 2025 Finance System
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Spacer for fixed sidebar */}
      <div
        className={`${isOpen ? "w-64" : "w-0"} transition-all duration-300 flex-shrink-0`}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-600 hover:bg-purple-50"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-purple-900 text-xl font-semibold">
                {activeTab}
              </h2>
            </div>

            {/* User info when sidebar is closed */}
            {!isOpen && (
              <div className="flex items-center gap-3">
                <div className="text-right text-purple-900">
                  <div className="text-xs opacity-70">
                    Current User
                  </div>
                  <div className="font-semibold text-sm">
                    {currentPICName}
                  </div>
                </div>
                <Avatar className="h-9 w-9 border-2 border-purple-200">
                  <AvatarFallback className="bg-purple-400 text-white">
                    {currentPICName?.charAt(0) || "SF"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Chat Dialog - Opens when main content clicked */}
      <Dialog open={showChatDialog} onOpenChange={(open) => {
        setShowChatDialog(open);
        if (!open) {
          setSelectedDocForChat(null);
          setSelectedWarehouse(null);
          setChatInput("");
        }
      }}>
        <DialogContent className="p-0 flex flex-col !gap-0 overflow-hidden" style={{ height: '900px', width: '600px', maxHeight: '90vh', maxWidth: '90vw' }}>
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Chat with Logistic Team
            </DialogTitle>
            <DialogDescription className="text-xs mt-2">
              <div className="flex flex-col gap-1">
                <span>Warehouse: <strong>{selectedWarehouse || "N/A"}</strong></span>
              
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Chat Messages Area - Fixed Height with Scroll */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-h-0">
            {/* Sticky Warehouse Header */}
            {documentsByWarehouse[selectedWarehouse || ""] && documentsByWarehouse[selectedWarehouse || ""].length > 0 && (
              <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-b-lg p-4 border border-purple-200 border-t-0 shadow-sm">
                {/* Documents in this warehouse - Expandable Card */}
                <Collapsible open={isDocumentsExpanded} onOpenChange={setIsDocumentsExpanded} className="bg-white rounded-lg border border-purple-200">
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-50 transition-colors">
                    <p className="text-xs font-semibold text-purple-800 flex items-center gap-2">
                      <span>📋</span>
                      <span>Pending documents in this conversation ({documentsByWarehouse[selectedWarehouse || ""].length})</span>
                    </p>
                    <ChevronDown className={`h-4 w-4 text-purple-600 transition-transform ${
                      isDocumentsExpanded ? "transform rotate-180" : ""
                    }`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 py-3 border-t border-purple-200 bg-purple-50 space-y-1">
                    {documentsByWarehouse[selectedWarehouse || ""].map((doc) => (
                      <div key={doc.id} className="text-xs bg-white rounded px-2 py-1.5 flex items-center gap-2 border border-purple-100">
                        <span className="text-purple-600 font-semibold flex-shrink-0">•</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.piNo}</p>
                          <p className="text-gray-600">PO: {doc.poNo}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Badge className={`text-xs ${
                            doc.statusType === "Check" 
                              ? "bg-blue-100 text-blue-800" 
                              : doc.statusType === "Document Receipt"
                              ? "bg-blue-100 text-blue-800" 
                              : doc.statusType === "Item Confirmation"
                              ? "bg-blue-100 text-blue-800" 
                              : doc.statusType === "Image Uploading"
                              ? "bg-blue-100 text-blue-800" 
                              : doc.statusType === "Unclear Image"
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {doc.statusType}
                          </Badge>
                          <Badge className={`text-xs ${
                            doc.status === "Done" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3">
              {/* Template Information - Warehouse Greeting */}
              {(!chatMessagesByWarehouse[selectedWarehouse || ""] || chatMessagesByWarehouse[selectedWarehouse || ""].length === 0) && (
                <div className="space-y-3">
                  {/* System Message */}
                  <div className="flex justify-center">
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-xs text-blue-600 border border-blue-200">
                      💬 Chat started - Ready to assist
                    </div>
                  </div>
                </div>
              )}

{/* Messages */}
              {(chatMessagesByWarehouse[selectedWarehouse || ""] || []).map((msg) => {
                  if (msg.isActivityLog) {
                    // Render activity log with selectable documents
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-3 max-w-lg w-full">
                          <p className="text-sm font-medium mb-3 text-purple-800">📋 Activity Log - Pending Documents</p>
                          <div className="space-y-2">
                            {documentsByWarehouse[selectedWarehouse || ""]?.map((doc) => (
                              <div
                                key={doc.id}
                                onClick={() => {
                                  // Add activity log response for selected document
                                  const selectedTime = new Date().toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  );

                                  // Get activity log entries based on document type
                                  let activityEntries: any[] = [];
                                  const sharedTimestamp = new Date(Date.now() - 3600000).toLocaleString();
                                  
                                  if (doc.statusType === "Check") {
                                    activityEntries = [
                                      {
                                        timestamp: sharedTimestamp,
                                        action: "Document Received"
                                      },
                                      {
                                        timestamp: sharedTimestamp,
                                        action: "Notification Sent"
                                      },
                                   
                                    ];
                                  } else if (doc.statusType === "Document Receipt") {
                                    activityEntries = [
                                  
                                     {
                                        timestamp: sharedTimestamp,
                                        action: "Notification Sent"
                                      },
                                     
                                    ];
                                  } else {
                                    // Default for other types
                                    activityEntries = [
                                      {
                                        timestamp: sharedTimestamp,
                                        action: "Document Received"
                                      },
                                      {
                                        timestamp: sharedTimestamp,
                                        action: "Notification Sent"
                                      },
                                      {
                                        timestamp: new Date(Date.now() - 600000).toLocaleString(),
                                        action: "Assigned"
                                      }
                                    ];
                                  }

                                  const activityLogResponse = {
                                    id: `activity-detail-${Date.now()}`,
                                    text: `Activity Log for ${doc.piNo}`,
                                    timestamp: selectedTime,
                                    isActivityDetail: true,
                                    activities: activityEntries,
                                    docInfo: doc,
                                    docType: doc.statusType,
                                    timerId: `timer-${Date.now()}`
                                  };

                                  // Start countdown timer automatically (15 minutes)
                                  setCountdownTimers(prev => ({
                                    ...prev,
                                    [activityLogResponse.timerId]: 900
                                  }));

                                  setChatMessagesByWarehouse(prev => {
                                    const warehouse = selectedWarehouse || "";
                                    return {
                                      ...prev,
                                      [warehouse]: [...(prev[warehouse] || []), activityLogResponse]
                                    };
                                  });
                                }}
                                className="p-2.5 rounded-lg border border-purple-100 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-900">{doc.piNo}</p>
                                    <p className="text-xs text-gray-500">PO: {doc.poNo}</p>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Badge className={`text-xs ${
                                      doc.statusType === "Check" 
                                        ? "bg-blue-100 text-blue-800" 
                                        : "bg-blue-100 text-blue-800"
                                    }`}>
                                      {doc.statusType}
                                    </Badge>
                                   
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (msg.isActivityDetail) {
                    // Render detailed activity log for selected document
                    const isTimerActive = msg.timerId && countdownTimers[msg.timerId] !== undefined && countdownTimers[msg.timerId] > 0;
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-3 max-w-lg w-full">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-purple-800">{msg.text}</p>
                            <Badge className={`text-xs ${
                              msg.docType === "Check" 
                                ? "bg-blue-100 text-blue-800" 
                                : msg.docType === "Document Receipt"
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {msg.docType}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {msg.activities?.map((activity: any, idx: number) => (
                              <div key={idx} className="border-l-2 border-purple-200 pl-3 py-2">
                                <p className="text-xs font-medium text-gray-900">{activity.action}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                              </div>
                            ))}
                          </div>
                          {/* Show countdown timer */}
                          {msg.timerId && countdownTimers[msg.timerId] !== undefined && (
                            <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-700 mb-1">Next notification available in:</p>
                              <p className="text-xl font-bold text-purple-600">
                                {String(Math.floor(countdownTimers[msg.timerId] / 60)).padStart(2, '0')}:{String(countdownTimers[msg.timerId] % 60).padStart(2, '0')}
                              </p>
                            </div>
                          )}
                          {/* re-notify button */}
                          <Button
                            variant="outline"
                            disabled={isTimerActive}
                            className={`justify-start text-xs h-8 border-purple-200 mt-3 w-full text-purple-700 ${
                              isTimerActive
                                ? "opacity-50 cursor-not-allowed bg-gray-100"
                                : "hover:bg-purple-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isTimerActive) {
                                // Add re-notify response
                                const responseTime = new Date().toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                );
                                const newTimerId = `timer-${Date.now()}`;
                                
                                // Add new activity entry for re-notification
                                const newActivityEntry = {
                                  timestamp: new Date().toLocaleString(),
                                  action: "Re-notification Sent"
                                };
                                
                                // Update the activity detail message to include new activity
                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: (prev[warehouse] || []).map(m => 
                                      m.id === msg.id 
                                        ? { ...m, activities: [...(m.activities || []), newActivityEntry] }
                                        : m
                                    )
                                  };
                                });

                                const responseMessage = {
                                  id: `logistic-${Date.now()}`,
                                  text: `✓ Re-notification sent for ${msg.docInfo.piNo}`,
                                  isReNotifyResponse: true,
                                  timerId: newTimerId,
                                  timestamp: responseTime,
                                };

                                // Set countdown to 15 minutes (900 seconds)
                                setCountdownTimers(prev => ({
                                  ...prev,
                                  [newTimerId]: 900
                                }));

                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: [...(prev[warehouse] || []), responseMessage]
                                  };
                                });
                              }
                            }}
                          >
                            🔔 Re-Notify
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  if (msg.isOptions) {
                    // Render options card instead of regular message
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-3 max-w-sm">
                          <p className="text-sm font-medium mb-3">Pick the information you need</p>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              className="justify-start text-xs h-8 border-purple-200 hover:bg-purple-50 text-purple-700"
                              onClick={() => {
                                // Remove options message
                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: prev[warehouse].filter(m => !m.isOptions)
                                  };
                                });

                                // Add response message
                                const responseTime = new Date().toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                );
                                const responseMessage = {
                                  id: `logistic-${Date.now()}`,
                                  text: "Here's the activity log for your documents. Click on a document to view its detailed activity:",
                                  timestamp: responseTime,
                                };

                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: [...(prev[warehouse] || []), responseMessage]
                                  };
                                });

                                // Add activity log message with selectable documents
                                setTimeout(() => {
                                  const activityLogTime = new Date().toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  );
                                  const activityLogMessage = {
                                    id: `activity-log-${Date.now()}`,
                                    text: "activity-log",
                                    timestamp: activityLogTime,
                                    isActivityLog: true
                                  };

                                  setChatMessagesByWarehouse(prev => {
                                    const warehouse = selectedWarehouse || "";
                                    return {
                                      ...prev,
                                      [warehouse]: [...(prev[warehouse] || []), activityLogMessage]
                                    };
                                  });
                                }, 800);
                              }}
                            >
                              📋 Activity Log
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start text-xs h-8 border-purple-200 hover:bg-purple-50 text-purple-700"
                              onClick={() => {
                                // Remove options message
                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: prev[warehouse].filter(m => !m.isOptions)
                                  };
                                });

                                // Add response message
                                const responseTime = new Date().toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                );
                                const responseMessage = {
                                  id: `logistic-${Date.now()}`,
                                  text: "Re-notification has been sent to all warehouse teams for the pending documents in this conversation. They will review and respond shortly.",
                                  timestamp: responseTime,
                                };

                                setChatMessagesByWarehouse(prev => {
                                  const warehouse = selectedWarehouse || "";
                                  return {
                                    ...prev,
                                    [warehouse]: [...(prev[warehouse] || []), responseMessage]
                                  };
                                });
                              }}
                            >
                              🔔 Re-Notify
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start text-xs h-8 border-purple-200 hover:bg-purple-50 text-purple-700"
                              onClick={() => {}}
                            >
                              💬 Custom Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.id.startsWith("user-") ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                          msg.id.startsWith("user-")
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.timerId && countdownTimers[msg.timerId] !== undefined && (
                          <p className="text-lg font-bold text-purple-600 mt-2">
                            {String(Math.floor(countdownTimers[msg.timerId] / 60)).padStart(2, '0')}:{String(countdownTimers[msg.timerId] % 60).padStart(2, '0')}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${msg.id.startsWith("user-") ? "text-purple-100" : "text-gray-500"}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && chatInput.trim()) {
                    const now = new Date();
                    const timestamp = now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
                    const newMessage = {
                      id: `user-${Date.now()}`,
                      text: chatInput,
                      timestamp,
                    };
                    
                    // Add to warehouse-specific messages
                    setChatMessagesByWarehouse(prev => {
                      const warehouse = selectedWarehouse || "";
                      return {
                        ...prev,
                        [warehouse]: [...(prev[warehouse] || []), newMessage]
                      };
                    });
                    setChatInput("");

                    // Check if message triggers specific commands
                    const userMessage = chatInput.toLowerCase();
                    const isActivityLogTrigger = userMessage.includes("activity") || userMessage.includes("log");
                    const isReNotifyTrigger = userMessage.includes("re-notify") || userMessage.includes("notify");
                    const isCustomChatTrigger = userMessage.includes("custom") || userMessage.includes("chat");

                    // Simulate logistic team response
                    setTimeout(() => {
                      const responseTime = new Date().toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );

                      if (isActivityLogTrigger || isReNotifyTrigger || isCustomChatTrigger) {
                        // Command matched - show relevant response
                        let responseText = "";
                        if (isActivityLogTrigger) {
                          responseText = "Here's the activity log for your documents...";
                        } else if (isReNotifyTrigger) {
                          responseText = "Re-notification sent to all warehouse teams.";
                        } else if (isCustomChatTrigger) {
                          responseText = "How can I assist you with additional information?";
                        }

                        const responseMessage = {
                          id: `logistic-${Date.now()}`,
                          text: responseText,
                          timestamp: responseTime,
                        };
                        
                        setChatMessagesByWarehouse(prev => {
                          const warehouse = selectedWarehouse || "";
                          return {
                            ...prev,
                            [warehouse]: [...(prev[warehouse] || []), responseMessage]
                          };
                        });
                      } else {
                        // No command matched - show options card
                        const optionsMessage = {
                          id: `logistic-${Date.now()}`,
                          text: "options",
                          timestamp: responseTime,
                          isOptions: true
                        };
                        
                        setChatMessagesByWarehouse(prev => {
                          const warehouse = selectedWarehouse || "";
                          return {
                            ...prev,
                            [warehouse]: [...(prev[warehouse] || []), optionsMessage]
                          };
                        });
                      }
                    }, 1000);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={() => {
                  if (chatInput.trim()) {
                    const now = new Date();
                    const timestamp = now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
                    const newMessage = {
                      id: `user-${Date.now()}`,
                      text: chatInput,
                      timestamp,
                    };
                    
                    // Add to warehouse-specific messages
                    setChatMessagesByWarehouse(prev => {
                      const warehouse = selectedWarehouse || "";
                      return {
                        ...prev,
                        [warehouse]: [...(prev[warehouse] || []), newMessage]
                      };
                    });
                    setChatInput("");

                    // Check if message triggers specific commands
                    const userMessage = chatInput.toLowerCase();
                    const isActivityLogTrigger = userMessage.includes("activity") || userMessage.includes("log");
                    const isReNotifyTrigger = userMessage.includes("re-notify") || userMessage.includes("notify");
                    const isCustomChatTrigger = userMessage.includes("custom") || userMessage.includes("chat");

                    // Simulate logistic team response
                    setTimeout(() => {
                      const responseTime = new Date().toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );

                      if (isActivityLogTrigger || isReNotifyTrigger || isCustomChatTrigger) {
                        // Command matched - show relevant response
                        let responseText = "";
                        if (isActivityLogTrigger) {
                          responseText = "Here's the activity log for your documents...";
                        } else if (isReNotifyTrigger) {
                          responseText = "Re-notification sent to all warehouse teams.";
                        } else if (isCustomChatTrigger) {
                          responseText = "How can I assist you with additional information?";
                        }

                        const responseMessage = {
                          id: `logistic-${Date.now()}`,
                          text: responseText,
                          timestamp: responseTime,
                        };
                        
                        setChatMessagesByWarehouse(prev => {
                          const warehouse = selectedWarehouse || "";
                          return {
                            ...prev,
                            [warehouse]: [...(prev[warehouse] || []), responseMessage]
                          };
                        });
                      } else {
                        // No command matched - show options card
                        const optionsMessage = {
                          id: `logistic-${Date.now()}`,
                          text: "options",
                          timestamp: responseTime,
                          isOptions: true
                        };
                        
                        setChatMessagesByWarehouse(prev => {
                          const warehouse = selectedWarehouse || "";
                          return {
                            ...prev,
                            [warehouse]: [...(prev[warehouse] || []), optionsMessage]
                          };
                        });
                      }
                    }, 1000);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowChatDialog(false);
                setChatInput("");
              }}
              className="border-gray-300 text-gray-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Dialog - Document Tracker */}
      <Dialog open={showFloatingDialog} onOpenChange={(open) => {
        setShowFloatingDialog(open);
        if (!open) {
          setFloatingDialogTab("tracker");
        }
      }}>
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0">
          {/* Header with Button Menu Tabs */}
          <div className="border-b border-gray-200 px-4 py-3 rounded-t-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  // Reset view when switching to tracker tab
                  setFloatingDialogTab("tracker");
                  setShowTrackerMonitoringDialog(false);
                  setSelectedTrackerDocument(null);
                  setDocumentTracking(null);
                  setTrackerSearchInput("");
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  floatingDialogTab === "tracker"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Document Tracker
              </button>
              <button
                onClick={() => {
                  // Reset view when switching to notification tab
                  setFloatingDialogTab("notification");
                  setShowTrackerMonitoringDialog(false);
                  setSelectedTrackerDocument(null);
                  setDocumentTracking(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  floatingDialogTab === "notification"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Notification
              </button>
            </div>
            <DialogTitle className="text-purple-900">
              {floatingDialogTab === "tracker" && "Document Tracker"}
              {floatingDialogTab === "notification" && "Notifications"}
            </DialogTitle>
            <DialogDescription>
              {floatingDialogTab === "tracker" && "Track and manage your documents"}
              {floatingDialogTab === "notification" && "View all your notifications"}
            </DialogDescription>
          </div>

          {/* Main Content */}
          {floatingDialogTab === "tracker" && (
       <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
             
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={trackerSearchInput}
                onChange={(e) => setTrackerSearchInput(e.target.value)}
                placeholder="Search by document number or supplier name..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            
            {/* Search Results or Empty State */}
            {showTrackerMonitoringDialog && selectedTrackerDocument && documentTracking ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4 flex justify-start">
                  <button
                    onClick={() => {
                      setDocumentTracking(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DocumentTrackingDisplay tracking={documentTracking} />
                </div>
              </div>
            ) : showTrackerMonitoringDialog ? (
              <DocumentMonitoringDialog
                open={showTrackerMonitoringDialog}
                onOpenChange={(open: boolean) => {
                  setShowTrackerMonitoringDialog(open);
                  if (!open) {
                    setSelectedTrackerDocument(null);
                  }
                }}
                po={selectedTrackerDocument?.docType === 'PO' ? selectedTrackerDocument.data : mockPurchaseOrder[0]}
                mockItems={[]}
                isPOCreated={(poNumber) => true}
                getEffectivePOStatus={(po) => "Completed"}
                formatDateToDDMMYYYY={(date) => {
                  if (!date) return "";
                  const d = new Date(date);
                  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                }}
                piNumber={selectedTrackerDocument?.docType === 'PI' ? selectedTrackerDocument.docNo : "PI-2025-001"}
                linkedPI={selectedTrackerDocument?.docType === 'PI' ? selectedTrackerDocument.data : mockpurchaseInvoice[0]}
                formatCurrency={(amount, currency) => `${currency} ${amount.toLocaleString()}`}
                isDemoMode={true}
              />
            ) : trackerSearchInput.trim() ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 border border-gray-200 rounded-lg bg-white">
                  <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                    {getTrackerSearchResults(trackerSearchInput).length > 0 ? (
                      getTrackerSearchResults(trackerSearchInput).map((result) => (
                        <div
                          key={result.id}
                          onClick={() => {
                            // For tracker tab (demo mode), show DocumentMonitoringDialog
                            // Not setting documentTracking here keeps it in demo mode
                            setSelectedTrackerDocument(result);
                            setShowTrackerMonitoringDialog(true);
                          }}
                          className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{result.displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{result.supplier}</p>
                              <p className="text-xs text-gray-400 mt-1">{result.date}</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0">{result.docType}</Badge>
                            {result.amount && (
                              <div className="text-right text-xs flex-shrink-0">
                                <p className="font-semibold text-gray-900">{result.currency} {result.amount.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        <p className="text-sm">No documents found matching "{trackerSearchInput}"</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-slate-900 mb-2">Document Tracking</p>
                <p className="text-gray-600 mb-6">Search for documents to track and view details</p>
              </div>
            )}
          </div>
          )}

          {/* Notification Tab Content */}
          {floatingDialogTab === "notification" && (
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
            {showTrackerMonitoringDialog && selectedTrackerDocument && documentTracking ? (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4 flex justify-start">
                  <button
                      onClick={() => {
                        setDocumentTracking(null);
                        setShowTrackerMonitoringDialog(false);
                        setSelectedTrackerDocument(null);
                      }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
                <DocumentTrackingDisplay tracking={documentTracking} />
              </div>
            ) : showTrackerMonitoringDialog && selectedTrackerDocument ? (
              <DocumentMonitoringDialog
                open={showTrackerMonitoringDialog}
                onOpenChange={(open: boolean) => {
                  setShowTrackerMonitoringDialog(open);
                  if (!open) {
                    setSelectedTrackerDocument(null);
                  }
                }}
                po={selectedTrackerDocument?.docType === 'PO' ? selectedTrackerDocument.data : mockPurchaseOrder[0]}
                mockItems={[]}
                isPOCreated={(poNumber) => true}
                getEffectivePOStatus={(po) => "Completed"}
                formatDateToDDMMYYYY={(date) => {
                  if (!date) return "";
                  const d = new Date(date);
                  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                }}
                piNumber={selectedTrackerDocument?.docType === 'PI' ? selectedTrackerDocument.docNo : mockpurchaseInvoice[0]?.purchaseInvoiceNo || "PI-2025-001"}
                linkedPI={selectedTrackerDocument?.docType === 'PI' ? selectedTrackerDocument.data : mockpurchaseInvoice[0]}
                formatCurrency={(amount, currency) => `${currency} ${amount.toLocaleString()}`}
                isDemoMode={true}
              />
            ) : (
              <>
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by document number or supplier name..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

                {/* Category Filter Section */}
            <div className="flex gap-2 items-center">
                <button 
                  onClick={() => setSelectedCategoryFilter("All")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedCategoryFilter === "All" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    All
                </button>
                <button 
                  onClick={() => setSelectedCategoryFilter("Purchasing")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedCategoryFilter === "Purchasing" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Purchasing
                </button>
                <button 
                  onClick={() => setSelectedCategoryFilter("Logistic")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedCategoryFilter === "Logistic" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Logistic
                </button>
                <div className="flex-1" />
                {(selectedFilter !== "All" || selectedCategoryFilter !== "All" || selectedStatusFilter !== null) && (
                  <button 
                    onClick={() => {
                      setSelectedFilter("All");
                      setSelectedCategoryFilter("All");
                      setSelectedStatusFilter(null);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                    title="Clear all filters"
                  >
                      ✕ Clear Filters
                  </button>
                )}
            </div>

            {/* Filter Section */}
            <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedFilter("All")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedFilter === "All" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    All
                </button>
                <button 
                  onClick={() => setSelectedFilter("Pending")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedFilter === "Pending" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Pending
                </button>
                <button 
                  onClick={() => setSelectedFilter("Pending > 2 Days")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedFilter === "Pending > 2 Days" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Pending &gt; 2 Days
                </button>
                <button 
                  onClick={() => setSelectedFilter("Done")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedFilter === "Done" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Done
                </button>
            </div>

        

            {/* Status Filter Section */}
            <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setSelectedStatusFilter(null)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === null 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    All
                </button>
                <button 
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Check" ? null : "Check")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === "Check" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Check
                </button>
                <button 
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Document Receipt" ? null : "Document Receipt")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === "Document Receipt" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Document Receipt
                </button>
                <button 
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Item Confirmation" ? null : "Item Confirmation")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === "Item Confirmation" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Item Confirmation
                </button>
                <button 
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Image Uploading" ? null : "Image Uploading")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === "Image Uploading" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Image Uploading
                </button>
                <button 
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Unclear Image" ? null : "Unclear Image")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedStatusFilter === "Unclear Image" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                    Unclear Image
                </button>
            </div>

            {/* Document List */}
            <ScrollArea className="flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="p-3 space-y-2">
                {[
                  {
                    id: "1",
                    piNo: "STIG731222777",
                    poNo: "PO/GMI.MDN/2510/0777",
                    traceCode: "MEDAN",
                    status: "Pending",
                    statusType: "Document Receipt",
                    pendingDays: 3,
                    category: "Logistic",
                    dataSource: "staticMockData",
                    
                  },
                ].filter((doc) => {
                  // Apply filter logic to mock data
                  if (selectedFilter === "Pending") {
                    // Show only documents NOT pending > 2 days
                    if (doc.pendingDays > 2) return false;
                  } else if (selectedFilter === "Done") {
                    if (doc.status !== "Done") return false;
                  } else if (selectedFilter === "Pending > 2 Days") {
                    if (doc.status !== "Pending" || doc.pendingDays <= 2) return false;
                  }
                  // "All" shows everything

                  // Apply category filter (Purchasing/Logistic)
                  if (selectedCategoryFilter === "Purchasing") {
                    if (doc.category !== "Purchasing") return false;
                  } else if (selectedCategoryFilter === "Logistic") {
                    if (doc.category !== "Logistic") return false;
                  }
                  // "All" shows everything

                  // Apply status type filter if selected
                  if (selectedStatusFilter && selectedStatusFilter !== "All") {
                    if (doc.statusType !== selectedStatusFilter) return false;
                  }

                  return true;
                }).map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg border border-gray-200 relative opacity-75 cursor-not-allowed pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-gray-600 text-sm font-semibold opacity-70 transform -rotate-45 select-none">
                        MOCK DATA (CAN'T BE CLICKED)
                      </div>
                    </div>
                    <div className="absolute top-0 left-0">
                      {/* Exclamation Badge for Pending > 2 Days */}
                      {doc.pendingDays > 2 && (
                        <div className="absolute -top-2 -left-4 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                          !
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">
                                      {doc.piNo}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                      {doc.poNo}
                                  </p>
                              </div>
                              
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Logistic
                        </Badge>
                               <Badge className={`text-xs ${
                          doc.status === "Done" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {doc.status}
                        </Badge>
                        <Badge className={`text-xs ${
                          doc.statusType === "Check" 
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Document Receipt"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Item Confirmation"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Image Uploading"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Unclear Image"
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {doc.statusType}
                        </Badge>
                        
                        
                      </div>
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-purple-600 transition-colors">
                          <LinkIcon className="h-3 w-3" />
                          <span>Trace Code: {doc.traceCode}</span>
                        </div>
                        <button onClick={(e) => {
                          e.stopPropagation();
                        }} className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-purple-600 flex-shrink-0 cursor-not-allowed opacity-50 flex items-center gap-1">
                          <MessageCircle className="h-6 w-6" />
                          <span className="text-xs font-medium">Message</span>
                        </button>
                      </div>
                    
                  </div>
                ))
                }
                {getFilteredDocuments().length > 0 ? (
                  getFilteredDocuments().map((doc) => (
                    <div key={doc.id} onClick={() => {
                      // Detect document type
                      const docType = detectDocumentType(doc);
                      
                      // Find the full document data from mock arrays
                      let fullDocData = doc.data || doc;
                      
                      if (docType === 'PO') {
                        // Look up PO from mock data
                        fullDocData = mockPurchaseOrder.find(
                          po => po.purchaseOrderNo === (doc.poNo || doc.docNo) || po.poId === doc.poId || po.poId === doc.id
                        ) || fullDocData;
                      } else if (docType === 'PI') {
                        // Look up PI from mock data
                        fullDocData = mockpurchaseInvoice.find(
                          pi => pi.purchaseInvoiceNo === (doc.piNo || doc.docNo) || pi.piId === doc.id
                        ) || fullDocData;
                      } else if (docType === 'IC') {
                        // Look up Import Cost from mock data
                        fullDocData = mockImportCosts.find(
                          ic => ic.icNum === (doc.docNo) || ic.icId === doc.id
                        ) || fullDocData;
                      } else if (docType === 'PR') {
                        // Look up Purchase Return from mock data
                        fullDocData = mockpurchaseReturns.find(
                          pr => pr.prNo === (doc.docNo) || pr.returId === doc.id
                        ) || fullDocData;
                      } else if (docType === 'SR') {
                        // Look up Shipment Request from mock data
                        fullDocData = mockShipmentRequest.find(
                          sr => sr.srNum === (doc.docNo) || sr.srId === doc.id
                        ) || fullDocData;
                      }
                      
                      setSelectedTrackerDocument({ ...doc, docType, data: fullDocData });
                      setDocumentTracking(null);
                      setShowTrackerMonitoringDialog(true);
                    }} className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">
                                      {doc.piNo}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                      {doc.poNo}
                                  </p>
                              </div>
                              
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                          {doc.category}
                        </Badge>
                               <Badge className={`text-xs ${
                          doc.status === "Done" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {doc.status}
                        </Badge>
                        <Badge className={`text-xs ${
                          doc.statusType === "Check" 
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Document Receipt"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Item Confirmation"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Image Uploading"
                            ? "bg-blue-100 text-blue-800" 
                            : doc.statusType === "Unclear Image"
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {doc.statusType}
                        </Badge>
                        
                        
                      </div>
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-purple-600 transition-colors">
                          <LinkIcon className="h-3 w-3" />
                          <span>Trace Code: {doc.traceCode}</span>
                        </div>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          const warehouse = doc.traceCode;
                          setSelectedDocForChat(doc);
                          
                          const warehouseDocuments = getFilteredDocuments().filter(d => d.traceCode === warehouse);
                          setDocumentsByWarehouse(prev => ({
                            ...prev,
                            [warehouse]: warehouseDocuments
                          }));
                          
                          setSelectedWarehouse(warehouse);
                          
                          setChatMessagesByWarehouse(prev => {
                            if (!prev[warehouse]) {
                              const responseTime = new Date().toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              );
                              const optionsMessage = {
                                id: `logistic-${Date.now()}`,
                                text: "options",
                                timestamp: responseTime,
                                isOptions: true
                              };
                              return { ...prev, [warehouse]: [optionsMessage] };
                            }
                            return prev;
                          });
                          
                          setShowChatDialog(true);
                        }} className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-purple-600 flex-shrink-0 flex items-center gap-1">
                          <MessageCircle className="h-6 w-6" />
                          <span className="text-xs font-medium">Message</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : getFilteredDocuments().length === 0 && [{ id: "1", piNo: "STIG731222777", poNo: "PO/GMI.MDN/2510/0777", traceCode: "MEDAN", status: "Pending", statusType: "Document Receipt", pendingDays: 3 }].length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <p>No documents found</p>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
              </>
            )}
          </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Button - Positioned outside main layout - Hide when any dialog is open */}
      <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, display: showFloatingDialog ? 'none' : 'block' }}>
        <button
          onClick={() => setShowFloatingDialog(true)}
          className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 border-2 border-purple-400 cursor-pointer"
          type="button"
          title="Open menu"
        >
          <Bell className="w-10 h-10" />
        </button>
      </div>
      <Toaster />
    </div>
  );
}