import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import {
  FileText,
  ChevronDown,
  Building2,
  Hash,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Warehouse,
  Building,
  Receipt,
  FileCheck,
  TrendingUp,
  Minus,
  Plus,
  Eye,
  RotateCcw,
  Edit,
  Check,
  Package,
  User,
  ClipboardList,
  X,
  Link,
  ClockIcon,
  Upload,
  MessageCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  mockLinkedPOs,
  mockpurchaseInvoice,
  mockPurchaseInvoiceDataForPI,
  mockItemsForCollapsible,
  mockInvoiceAdditionalCosts,
  mockSuppliers,
  mockpurchaseReturns,
  mockShipmentRequest,
  mockImportCosts,
  mockExpenseNote,
  mockPurchaseOrder,
  findLinkedPVRs,
  findLinkedPVRsByPONo,
  findLinkedPVRsByPINo,
  getSyncedPaymentAmounts,
  getSyncedPaymentAmountsByPO,
  findLinkedPVsByPINo,
} from "../mocks/mockData";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Tabs, TabsContent } from "./ui/tabs";
import { LinkIcon, Trash2 } from "lucide-react";

// Type definitions
type TermType = "URGENT" | "CREDIT" | "ONLINE SHOPPING";
type PTType = "MJS" | "AMT" | "GMI" | "WNS" | "WSI" | "TTP" | "IMI";

interface AccountItem {
  id: string;
  category?: string;
  description: string;
  accountCode: string;
  accountName: string;
  department?: string;
  deptDescription: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
}

interface LinkedDocument {
  id: string;
  documentType: string;
  documentTypeLabel?: string;
  documentNo: string;
  documentNoPO?: string;
  totalAmount?: number;
}

interface AuditTrailEntry {
  timestamp: string;
  action: string;
  user: string;
}

// Mock data for dropdowns
const accountOptions = [
  { code: "5101", name: "Material Cost" },
  { code: "5102", name: "Labor Cost" },
  { code: "5103", name: "Overhead Cost" },
  { code: "6101", name: "Office Supplies" },
  { code: "6102", name: "Equipment" },
];

const departmentOptions = [
  { code: "PROD", name: "Production" },
  { code: "MKT", name: "Marketing" },
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "IT", name: "Information Technology" },
];

// Mock data for import costs and shipment requests
const mockImportCostData = [
  { id: "ic-1", icNo: "IC-2025-001", supplierName: "Supplier A" },
  { id: "ic-2", icNo: "IC-2025-002", supplierName: "Supplier B" },
];

const mockShipmentRequestData = [
  { id: "sr-1", srNum: "SR-2025-001", supplierName: "Supplier A" },
  { id: "sr-2", srNum: "SR-2025-002", supplierName: "Supplier B" },
];

// Sample documents data with images
const documents = [
  {
    id: 1,
    name: "Business License",
    image:
      "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
    type: "License",
  },
  {
    id: 2,
    name: "Tax Certificate",
    image:
      "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
    type: "Certificate",
  },
  {
    id: 3,
    name: "Company Registration",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f70504646?w=300&h=200&fit=crop",
    type: "Registration",
  },
  {
    id: 4,
    name: "Bank Statement",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf35f?w=300&h=200&fit=crop",
    type: "Bank",
  },
  {
    id: 5,
    name: "ISO Certificate",
    image:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&h=200&fit=crop",
    type: "Certificate",
  },
];

// Helper functions
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getTodayYYYYMMDD = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generatePVRNumber = (pt: string, pvrDate: string): string => {
  const dateParts = pvrDate.split("/");
  const month = dateParts[1];
  const year = dateParts[2];
  const yy = year.slice(-2);
  const zz = month;
  const aa = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `PVR/${pt}.MDN/${yy}${zz}/00${aa}`;
};

const convertToStorageDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.replace(/\//g, "-").split("-");
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD-MM-YYYY format
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      // Already YYYY-MM-DD format
      return dateStr;
    }
  }
  return dateStr;
};

const getTodayDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

interface InvoiceCollapsibleProps {
  invoice: {
    checkStatus: boolean;
    id?: string;
    piId?: string;
    purchaseInvoiceNo: string;
    ptCompany: string;
    status: string;
    pendingStatus?: boolean;
    docReceivedDate?: string;
    submissionStatus: string;
    supplierName: string;
    noPO: string;
    documentType?: string;
    submissionDate?: string;
    totalAmount: number;
    otherTotal: number;
    grandTotal: number;
    warehouse: string;
    downPayment?: number;
    outstanding?: number;
    referenceNo?: string;
    referenceDate?: string;
    picPI?: string;
    internalRemarks: string;
    receivedStatus: string;
    validationStatus: string;
    submittedTo?: string;
    items?: any[];
    linkedDocs?: any[];
    discount?: number;
    ppn?: number;
    otherTax?: number;
    otherCosts?: Array<{ id: string; costAmount: number; description: string }>;
  };
 
  onValidate: () => void;
  onStatusClick: () => void;
  onViewReason: () => void;
  pendingStatus?: boolean;
  refreshKey: number;
  onShowActivityLog?: (invoice: any) => void;
  onEditReference?: (invoice: any) => void;
  onShowAttachmentDialog?: () => void;
  onUpdateInvoice?: (id: string, updates: Partial<any>) => void;
  onNavigateToPO?: (poNumber: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseReturn?: (prNo: string) => void;
  onNavigateToShipmentRequest?: (srNum: string) => void;
  onNavigateToPurchaseInvoice?: (piNo: string) => void;
  onNavigateToImportCost?: (icNo: string) => void;
  onNavigateToPurchaseOrder?: (poNo: string) => void;
  onNavigateToPV?: (pvNo: string) => void;
  expandAll?: boolean;
  selectedInvoiceNo?: string | null;
}

export function InvoiceCollapsible({
  invoice,
  pendingStatus,
  onValidate,
  onStatusClick,
  onViewReason,
  onShowActivityLog,
  onEditReference,
  onShowAttachmentDialog,
  onUpdateInvoice,
  onNavigateToPO,
  onNavigateToPVR,
  onNavigateToAPNote,
  onNavigateToPurchaseReturn,
  onNavigateToShipmentRequest,
  onNavigateToPurchaseInvoice,
  onNavigateToImportCost,
  onNavigateToPurchaseOrder,
  onNavigateToPV,
  refreshKey,
  expandAll,
  selectedInvoiceNo,
}: InvoiceCollapsibleProps) {
  // State for inline editing of reference fields
  const [isEditingRefNo, setIsEditingRefNo] = useState(false);
  const [isEditingRefDate, setIsEditingRefDate] =
    useState(false);
  const [editReferenceNo, setEditReferenceNo] = useState(
    invoice.referenceNo || "",
  );
  const [editReferenceDate, setEditReferenceDate] = useState(
    invoice.referenceDate || "",
  );

  // Listen for PVR data changes to refresh Down Payment
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Refresh when pvrData changes OR when specific PVR amount changes
      if (e.key === "pvrData" || e.key?.startsWith("pvr_edit_doc_")) {
        console.log(`[DOWN PAYMENT] Storage changed: ${e.key}, refreshing Down Payment...`);
        setDownPaymentRefresh(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [editDiscount, setEditDiscount] = useState(
    invoice.discount || 0,
  );

  const [downPaymentRefresh, setDownPaymentRefresh] = useState(0);
  const [checkStatus, setCheckStatus] = useState(invoice.checkStatus || false);
  const [isNotified, setIsNotified] = useState(false);
  const [notificationTimestamps, setNotificationTimestamps] = useState<string[]>([]);
  const [receivedNotificationTimestamps, setReceivedNotificationTimestamps] = useState<string[]>([]);
  const [invoiceActivityLog, setInvoiceActivityLog] = useState<Array<{ action: string; timestamp: string; user: string }>>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [canReNotify, setCanReNotify] = useState<boolean>(false);

  // PVR Dialog and Form State
  const [showCreatePVRDialog, setShowCreatePVRDialog] = useState(false);
  const [showPVRSuccessDialog, setShowPVRSuccessDialog] = useState(false);
    const [showFullyPaidWarning, setShowFullyPaidWarning] = useState(false);
    const [showPVRLinkedWarning, setShowPVRLinkedWarning] = useState(false);
  const [savedPvrNo, setSavedPvrNo] = useState("");
  const [savedPvrLinkedDocs, setSavedPvrLinkedDocs] = useState<any[]>([]);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [showSupplierPVRDropdown, setShowSupplierPVRDropdown] = useState(false);
  const [supplierSearchTermPVR, setSupplierSearchTermPVR] = useState("");
  const [addLinksSearchTerm, setAddLinksSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);

  const [pvrForm, setPvrForm] = useState({
    pvrNo: "",
    pvrDate: "",
    supplierName: "",
    term: "Credit" as "Credit" | "Urgent",
    currency: "IDR",
    rate: 1,
    pt: "MJS" as "AMT" | "GMI" | "IMI" | "MJS" | "TTP" | "WNS" | "WSI",
    bankAccount: "",
    paymentMethod: "Transfer" as "Transfer" | "Cash",
    reference: "",
    remarks: "",
  });

  // Table editing state for PVR Payable Items
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState('');
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState('');

  // Sync checkStatus with invoice data
  useEffect(() => {
    setCheckStatus(invoice.checkStatus || false);
  }, [invoice.checkStatus]);

  // Sync otherCosts with invoice data from mockData
  useEffect(() => {
    const costs = (invoice as any).otherCosts || [];
    setOtherCosts(costs);
  }, [(invoice as any).otherCosts]);

  // Auto-set isNotified when document is marked as received
  useEffect(() => {
    if (invoice.receivedStatus === "true" && !checkStatus) {
      setIsNotified(true);
      
      // Add activity log entry for document received
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
      });
      
      setInvoiceActivityLog(prev => {
        const hasPreviousEntry = prev.some(entry => entry.action === "Document Received");
        if (!hasPreviousEntry) {
          return [...prev, { action: "Document Received", timestamp, user: "System" }];
        }
        return prev;
      });
    }
  }, [invoice.receivedStatus, checkStatus]);

  // Countdown timer for Re-Notify button
  useEffect(() => {
    if (!lastNotificationTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - lastNotificationTime.getTime()) / 1000);
      const totalCooldownSeconds = 10 * 60; // 10 minutes
      const remaining = totalCooldownSeconds - elapsedSeconds;

      if (remaining <= 0) {
        setCanReNotify(true);
        setRemainingSeconds(0);
        clearInterval(timer);
      } else {
        setCanReNotify(false);
        setRemainingSeconds(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastNotificationTime]);

  // Initialize countdown when activity log is present
  useEffect(() => {
    if (invoiceActivityLog.length > 0 && !lastNotificationTime) {
      // Parse timestamp from activity log
      if (invoiceActivityLog[0]?.timestamp) {
        try {
          const logTime = new Date(invoiceActivityLog[0].timestamp);
          setLastNotificationTime(logTime);
        } catch (e) {
          console.error("Failed to parse activity log timestamp:", e);
        }
      }
    }
  }, [invoiceActivityLog, lastNotificationTime]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
    useState(false);
  const [showCheckNotifyDialog, setShowCheckNotifyDialog] =
    useState(false);
  const [showNotificationSentDialog, setShowNotificationSentDialog] =
    useState(false);
  const [showAlreadyNotifiedDialog, setShowAlreadyNotifiedDialog] =
    useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showReceivedNotifyDialog, setShowReceivedNotifyDialog] =
    useState(false);
  const [showReceivedNotificationSentDialog, setShowReceivedNotificationSentDialog] =
    useState(false);
  const [isVoided, setIsVoided] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"items" | "remarks">("items");
  const [showOtherCostDialog, setShowOtherCostDialog] = useState(false);
  const [showImageGalleryDialog, setShowImageGalleryDialog] = useState(false);
  const [selectedItemForImage, setSelectedItemForImage] = useState<any>(null);
  const [showItemDetailDialog, setShowItemDetailDialog] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [selectedNotificationReason, setSelectedNotificationReason] = useState<string>("");
  const [showNotifiedDialog, setShowNotifiedDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<{id:string, text:string, timestamp:string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [notifiedItems, setNotifiedItems] = useState<Set<string>>(new Set());
  const [showAttachmentUploadDialog, setShowAttachmentUploadDialog] = useState(false);
  const [showUploadAttachmentDialog, setShowUploadAttachmentDialog] = useState(false);
  const [expandOtherCostsSection, setExpandOtherCostsSection] = useState(true);
  const [otherCosts, setOtherCosts] = useState<Array<{ id: string; costAmount: number; description: string }>>(
    invoice.otherCosts || []
  );
  const [newOtherCost, setNewOtherCost] = useState({ costAmount: 0, description: "" });

  // AP Note creation states
  const [showDocTypeSelection, setShowDocTypeSelection] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAPNoteListDialog, setShowAPNoteListDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<"AP Note" | "AP DISC NOTE" | "">("" as any);
  const [savedAPNoteNo, setSavedAPNoteNo] = useState("");
  const [apNotes, setApNotes] = useState<any[]>([]);
  const [accountItems, setAccountItems] = useState<any[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<any[]>([]);
  const [apNoteForm, setApNoteForm] = useState({
    apNoteNo: "AP-NOTE-001",
    apNoteDate: new Date().toISOString().split("T")[0],
    currency: "IDR",
    invoiceNumber: "",
    term: "CREDIT",
    documentReceivedDate: new Date().toISOString().split("T")[0],
    remarks: "",
    supplierName: invoice.supplierName || "",
    pt: "MJS",
    discount: 0,
    tax: 0,
    pph: 0,
    companyName: "",
    docReceiptDate: invoice.docReceivedDate || "",
    apNoteCreateDate: new Date().toISOString().split("T")[0],
  });

  // Additional state for complex dialog features
  const [accountCodeSearchTerms, setAccountCodeSearchTerms] = useState<{ [key: number]: string }>({});
  const [departmentCodeSearchTerms, setDepartmentCodeSearchTerms] = useState<{ [key: number]: string }>({});
  const [linkedDocNoSearchTerms, setLinkedDocNoSearchTerms] = useState<{ [key: string]: string }>({});
  const [openDeptCodeDropdown, setOpenDeptCodeDropdown] = useState<{ [key: number]: boolean }>({});
  const [openLinkedDocDropdown, setOpenLinkedDocDropdown] = useState<{ [key: string]: boolean }>({});
  const [activeCreateTabItems, setActiveCreateTabItems] = useState<"items" | "links">("items");
  const [isSupplierSelected, setIsSupplierSelected] = useState(false);
  const [availableDocsForSupplier, setAvailableDocsForSupplier] = useState<any[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);

  // Audit trail data for invoice items and activities
  const apNoteAuditTrails: { [key: string]: Array<{ action: string; timestamp: string; user: string }> } = {
    "INV-001": [
      { action: "Item Notified", timestamp: "2024-01-25 10:30 AM", user: "John Doe" },
      { action: "Image Verified", timestamp: "2024-01-25 10:45 AM", user: "Jane Smith" },
      { action: "Payment Confirmed", timestamp: "2024-01-25 11:00 AM", user: "Admin User" },
    ],
    "INV-002": [
      { action: "Item Flagged for Review", timestamp: "2024-01-24 02:15 PM", user: "Mike Johnson" },
      { action: "Notification Sent", timestamp: "2024-01-24 02:30 PM", user: "System" },
    ],
  };

  // Refs for dialog
  const mainDialogContentRef = useRef<HTMLDivElement>(null);
  const mainDialogScrollRef = useRef<HTMLDivElement>(null);
  const lastAccountItemRef = useRef<HTMLTableRowElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Get items from invoice data
  const mockItems = invoice.items || [];

  // Helper function to validate account items
  const isAccountItemsValid = (): boolean => {
    return accountItems.every(
      (item) =>
        item.accountCode &&
        item.accountName &&
        item.department &&
        item.deptDescription &&
        item.qty > 0 &&
        item.unitPrice > 0,
    );
  };

  // Helper function to check if a linked document is auto-populated (PI/PO pair)
  const isAutoPopulatedPIPO = (index: number, doc: LinkedDocument): boolean => {
    return doc.documentType === "PI/PO";
  };

  // Compute PO data and linked docs for the dialog
  const po = mockLinkedPOs.find((p) => p.purchaseOrderNo === invoice.noPO) || {
    purchaseOrderNo: invoice.noPO,
    poId: "",
    supplierName: invoice.supplierName,
    linkedDocs: [],
  };

  // Get mock PO data
  const mockPOData = po || { linkedDocs: [] };

  // Load PVR data from localStorage
  const [pvrData, setPvrData] = useState<any[]>([]);
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

  // State for linked docs refresh
  const [linkedDocsRefresh, setLinkedDocsRefresh] = useState(0);

  // Helper function to handle close success dialog
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setSelectedDocType("" as any);
    setAccountItems([]);
    setLinkedDocs([]);
    setAvailableDocsForSupplier([]);
    setIsSupplierSelected(false);
    setActiveCreateTabItems("items");
  };

  // Mock AP Note data storage (in real app, this would be from backend)
  const apNoteData: any[] = [];

  const calculateAmount = () => {
    return mockItems.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 0) * (item.pricePerQty || 0),
      0,
    );
  };

  // Use actual invoice financial data
  const amount = calculateAmount();
  const otherCost = invoice.otherTotal || 0;
  const discount = invoice.discount || 0;
  const ppn = invoice.ppn || 0;
  const otherTax = invoice.otherTax || 0;
  const totalAmount = invoice.totalAmount || 0;
  const grandTotal = invoice.grandTotal || 0;
  // Sync with parent expandAll state and selectedInvoiceNo
  useEffect(() => {
    if (selectedInvoiceNo) {
      // If a specific invoice is selected, only expand that one
      setIsExpanded(
        invoice.purchaseInvoiceNo === selectedInvoiceNo,
      );
    } else if (expandAll !== undefined) {
      // Otherwise, use expandAll prop
      setIsExpanded(expandAll);
    }
  }, [expandAll, selectedInvoiceNo, invoice.purchaseInvoiceNo]);

  // Auto-scroll to selected invoice when it gets expanded
  useEffect(() => {
    if (
      selectedInvoiceNo === invoice.purchaseInvoiceNo &&
      selectedInvoiceNo
    ) {
      // Use a small timeout to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(
          `invoice-collapsible-${invoice.id}`,
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [
    selectedInvoiceNo,
    invoice.purchaseInvoiceNo,
    invoice.id,
  ]);

  // Load AP Notes from localStorage with storage listener
  useEffect(() => {
    // Function to load AP Notes
    const loadApNotes = () => {
      const savedAPNotes = JSON.parse(
        localStorage.getItem("createdAPNotes") || "[]",
      );
      console.log("[DEBUG] All saved APNotes:", savedAPNotes);
      console.log("[DEBUG] Looking for notes linked to PI:", invoice.purchaseInvoiceNo);
      console.log("[DEBUG] Invoice object:", { purchaseInvoiceNo: invoice.purchaseInvoiceNo, noPO: invoice.noPO });
      
      const linkedNotes = savedAPNotes.filter((note: any, noteIdx: number) => {
        console.log(`[DEBUG] Checking note ${noteIdx}:`, {
          apNoteNo: note.apNoteNo,
          linkedDocsCount: note.linkedDocs?.length || 0,
          linkedDocs: note.linkedDocs,
        });
        
        const isLinked = note.linkedDocs?.some(
          (doc: any) => {
            const matches = 
              doc.documentNo === invoice.purchaseInvoiceNo ||
              doc.docNo === invoice.purchaseInvoiceNo ||
              (doc.documentType === "PI" && doc.documentNo === invoice.purchaseInvoiceNo) ||
              (doc.type === "Purchase Invoice" && doc.docNo === invoice.purchaseInvoiceNo) ||
              (doc.documentType === "PI/PO" && doc.documentNo === invoice.purchaseInvoiceNo);
            
            if (matches) {
              console.log(`[DEBUG] ✅ Document matched:`, { docNo: doc.docNo, documentNo: doc.documentNo, type: doc.type, documentType: doc.documentType });
            }
            return matches;
          }
        );
        
        if (isLinked) {
          console.log("[DEBUG] ✅ Found linked note:", note.apNoteNo, "with linkedDocs:", note.linkedDocs);
        } else {
          console.log("[DEBUG] ❌ Note did not match:", note.apNoteNo);
        }
        return isLinked;
      });
      
      console.log("[DEBUG] Filtered linked notes:", linkedNotes);
      console.log("[DEBUG] Setting apNotes state with", linkedNotes.length, "notes");
      setApNotes(linkedNotes);
    };

    // Load on mount
    loadApNotes();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "createdAPNotes") {
        console.log("[DEBUG] Storage event received from another tab");
        loadApNotes();
      }
    };

    // Listen for expense note creation events from same-tab components
    const handleExpenseNoteCreated = (e: Event) => {
      const event = e as CustomEvent;
      const { linkedDocs: createdLinkedDocs } = event.detail;
      console.log("[DEBUG] Received expenseNoteCreated event:", event.detail);
      console.log("[DEBUG] Current invoice PI number:", invoice.purchaseInvoiceNo);
      
      // Check if any of the linked documents match this invoice
      if (createdLinkedDocs && createdLinkedDocs.length > 0) {
        const matchesCurrentInvoice = createdLinkedDocs.some(
          (doc: any) =>
            doc.documentNo === invoice.purchaseInvoiceNo ||
            doc.documentNoPO === invoice.noPO ||
            (doc.documentType === "PI" && doc.documentNo === invoice.purchaseInvoiceNo)
        );
        console.log("[DEBUG] Matches current invoice:", matchesCurrentInvoice);
        
        if (matchesCurrentInvoice) {
          // Reload AP notes to show the newly created one
          console.log("[DEBUG] Reloading AP notes due to expenseNoteCreated event");
          loadApNotes();
        }
      }
    };

    // Listen for custom storage update events (from same tab)
    const handleStorageUpdated = () => {
      console.log("[DEBUG] Storage updated event received");
      loadApNotes();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("expenseNoteCreated", handleExpenseNoteCreated);
    window.addEventListener("storageUpdated", handleStorageUpdated);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("expenseNoteCreated", handleExpenseNoteCreated);
      window.removeEventListener("storageUpdated", handleStorageUpdated);
    };
  }, [invoice.purchaseInvoiceNo]);

  // Auto-populate linked documents when Create AP Note dialog opens from Invoice
  useEffect(() => {
    if (showCreateDialog && linkedDocs.length === 0) {
      // Auto-populate PI/PO pair from current invoice
      const newLinkedDoc: LinkedDocument = {
        id: Date.now().toString(),
        documentType: "PI/PO",
        documentTypeLabel: "Purchase Invoice | Purchase Order",
        documentNo: invoice.purchaseInvoiceNo, // Purchase Invoice number
        documentNoPO: invoice.noPO, // Purchase Order number
        totalAmount: invoice.grandTotal,
      };
      setLinkedDocs([newLinkedDoc]);
    }
  }, [showCreateDialog, invoice.purchaseInvoiceNo, invoice.noPO]);

  // Mock supplier data for PVR
  const supplierMasterData = [
    { name: "PT. Supplier A", category: "LOCAL" },
    { name: "PT. Supplier B", category: "OVERSEAS" },
    { name: "PT. Supplier C", category: "LOCAL" },
  ];

  // Mock supplier data filtered based on search term
  const filteredSuppliers = supplierMasterData.filter(s =>
    s.name.toLowerCase().includes(supplierSearchTermPVR.toLowerCase())
  );

  const handleSupplierPVRChange = (supplierName: string) => {
    setPvrForm({
      ...pvrForm,
      supplierName: supplierName,
    });
    setShowSupplierPVRDropdown(false);
  };

  const resetPVRForm = () => {
    const today = getTodayDate();
    setPvrForm({
      pvrNo: generatePVRNumber(pvrForm.pt, today),
      pvrDate: today,
      supplierName: "", // Keep empty - will be filled by detection logic
      term: "Credit",
      currency: "IDR",
      rate: 1,
      pt: "MJS",
      bankAccount: "",
      paymentMethod: "Transfer",
      reference: "",
      remarks: "",
    });
    setLinkedPIs([]);
    setShowSupplierPVRDropdown(false);
    setSupplierSearchTermPVR("");
  };

  // Handler for ActivityLog button
  const handleActivityLogClick = () => {
    if (typeof onShowActivityLog === "function") {
      onShowActivityLog(invoice);
    } else {
      alert("Show ActivityLog for this invoice");
    }
  };

  // Handler for Attachment button
  const handleAttachmentClick = () => {
    setShowAttachmentUploadDialog(true);
  };

  // Handler for AP Note button
  const handleAPNoteClick = () => {
    // Check if Invoice is linked to PVR
    if (isInvoiceLinkedToPVR(invoice.purchaseInvoiceNo)) {
      setShowPVRLinkedWarning(true);
      return;
    }

    // Skip document type selection - always create Expense Note
    // Pre-populate the form with current invoice
    setApNoteForm({
      apNoteNo: "AP-NOTE-001",
      apNoteDate: new Date().toISOString().split("T")[0],
      currency: "IDR",
      invoiceNumber: invoice.purchaseInvoiceNo,
      term: "CREDIT",
      documentReceivedDate: new Date().toISOString().split("T")[0],
      remarks: "",
      supplierName: invoice.supplierName || "",
      pt: apNoteForm.pt || "MJS",
      discount: 0,
      tax: 0,
      pph: 0,
      companyName: "",
      docReceiptDate: invoice.docReceivedDate || "",
      apNoteCreateDate: new Date().toISOString().split("T")[0],
    });
    setSelectedDocType("AP Note");
    setShowCreateDialog(true);
  };

  // Helper function to check if invoice is already linked to any PVR
  const isInvoiceLinkedToPVR = (invoiceNo: string): boolean => {
    try {
      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      console.log("[DETECT LINK] ========== DETECTION STARTING ==========");
      console.log("[DETECT LINK] Total PVRs in storage:", existingPVRs.length);
      console.log("[DETECT LINK] Looking for invoice:", invoiceNo);
      
      if (existingPVRs.length === 0) {
        console.log("[DETECT LINK] No PVRs in storage - invoice NOT linked");
        return false;
      }

      // Check each PVR
      for (let i = 0; i < existingPVRs.length; i++) {
        const pvr = existingPVRs[i];
        console.log(`[DETECT LINK] PVR ${i + 1}/${existingPVRs.length}: ${pvr.pvrNo}`);
        
        if (!pvr.linkedDocs || !Array.isArray(pvr.linkedDocs)) {
          console.log(`[DETECT LINK]   No linkedDocs array`);
          continue;
        }
        
        console.log(`[DETECT LINK]   Has ${pvr.linkedDocs.length} linked documents`);
        
        // Check each linked document
        for (let j = 0; j < pvr.linkedDocs.length; j++) {
          const doc = pvr.linkedDocs[j];
          console.log(`[DETECT LINK]   Checking Doc ${j + 1}:`, {
            documentType: doc.documentType,
            piNo: doc.piNo,
            invoiceNo: doc.invoiceNo,
            documentNo: doc.documentNo,
            poNo: doc.poNo,
          });
          
          // Check all possible field names with explicit logging
          const piNoMatches = doc.piNo === invoiceNo;
          const invoiceNoMatches = doc.invoiceNo === invoiceNo;
          const documentNoMatches = doc.documentNo === invoiceNo;
          
          console.log(`[DETECT LINK]     piNo comparison:`);
          console.log(`[DETECT LINK]       stored: "${doc.piNo}" (length: ${(doc.piNo || "").length})`);
          console.log(`[DETECT LINK]       looking: "${invoiceNo}" (length: ${invoiceNo.length})`);
          console.log(`[DETECT LINK]       match: ${piNoMatches}`);
          
          console.log(`[DETECT LINK]     invoiceNo comparison:`);
          console.log(`[DETECT LINK]       stored: "${doc.invoiceNo}" (length: ${(doc.invoiceNo || "").length})`);
          console.log(`[DETECT LINK]       looking: "${invoiceNo}" (length: ${invoiceNo.length})`);
          console.log(`[DETECT LINK]       match: ${invoiceNoMatches}`);
          
          console.log(`[DETECT LINK]     documentNo comparison:`);
          console.log(`[DETECT LINK]       stored: "${doc.documentNo}" (length: ${(doc.documentNo || "").length})`);
          console.log(`[DETECT LINK]       looking: "${invoiceNo}" (length: ${invoiceNo.length})`);
          console.log(`[DETECT LINK]       match: ${documentNoMatches}`);
          
          if (piNoMatches) {
            console.log(`[DETECT LINK] ✅ MATCH FOUND! Invoice ${invoiceNo} is linked to PVR: ${pvr.pvrNo} (via piNo)`);
            return true;
          }
          if (invoiceNoMatches) {
            console.log(`[DETECT LINK] ✅ MATCH FOUND! Invoice ${invoiceNo} is linked to PVR: ${pvr.pvrNo} (via invoiceNo)`);
            return true;
          }
          if (documentNoMatches) {
            console.log(`[DETECT LINK] ✅ MATCH FOUND! Invoice ${invoiceNo} is linked to PVR: ${pvr.pvrNo} (via documentNo)`);
            return true;
          }
        }
      }
      
      console.log("[DETECT LINK] ❌ No match found - invoice NOT linked to any PVR");
      console.log("[DETECT LINK] ========== DETECTION COMPLETED ==========");
      return false;
    } catch (error) {
      console.error("[DETECT LINK] Error checking invoice link:", error);
      return false;
    }
  };

  // Handle Create PVR button click
  const handleCreatePVRClick = () => {
    const today = getTodayDate();
    const poNumber = invoice.noPO || "";
    
    console.log("[PVR DIALOG] Opening Create PVR dialog for invoice:", invoice.purchaseInvoiceNo);
    
    // DEBUG: Log all stored PVRs BEFORE checking
    const storedPVRsBeforeCheck = JSON.parse(localStorage.getItem("pvrData") || "[]");
    console.log("[PVR DIALOG] BEFORE DETECTION - All stored PVRs:", storedPVRsBeforeCheck);
    console.log("[PVR DIALOG] BEFORE DETECTION - Current invoice to check:", invoice.purchaseInvoiceNo);
    
    // Check if this invoice is already linked to any PVR
    const invoiceAlreadyLinked = isInvoiceLinkedToPVR(invoice.purchaseInvoiceNo);
    
    console.log(`[PVR DIALOG] Invoice link status: ${invoiceAlreadyLinked ? "LINKED ✓" : "NOT LINKED"}`);

    // Reset form to completely empty state
    const emptyForm = {
      pvrNo: generatePVRNumber("MJS", today),
      pvrDate: today,
      supplierName: "",
      term: "Credit" as "Credit" | "Urgent",
      currency: "IDR",
      rate: 1,
      pt: "MJS" as PTType,
      bankAccount: "",
      paymentMethod: "Transfer" as "Transfer" | "Cash",
      reference: "",
      remarks: "",
    };
    console.log("[PVR DIALOG] Setting form to EMPTY state:", emptyForm);
    setPvrForm(emptyForm);
    console.log("[PVR DIALOG] Setting linkedPIs to EMPTY array");
    setLinkedPIs([]);

    // Only auto-fill if invoice is NOT already linked
    if (!invoiceAlreadyLinked) {
      console.log("[PVR DIALOG] ✓ CONDITION TRUE: Invoice NOT linked → AUTO-FILLING form");
      console.log("[PVR DIALOG] Auto-filling supplier with:", invoice.supplierName);
      
      // Auto-fill supplier name
      setPvrForm(prev => ({
        ...prev,
        supplierName: invoice.supplierName || "",
      }));

      // Pre-populate with PI document
      const piDocument = {
        documentType: "PI",
        piNo: invoice.purchaseInvoiceNo,
        poNo: poNumber || "",
        invoiceNo: invoice.purchaseInvoiceNo,
        totalAmount: invoice.grandTotal || invoice.totalAmount || 0,
      };
      console.log("[PVR DIALOG] Adding PI document to linkedPIs:", piDocument);
      
      // Also auto-link the paired PO
      const linkedDocuments = [piDocument];
      
      // Find the related PO from mockLinkedPOs or mockPurchaseOrder
      // Try multiple strategies: mockLinkedPOs first, then mockPurchaseOrder by poId, then by noPO
      let relatedPO = null;
      
      console.log("[PVR DIALOG] Looking for PO - invoice.noPO:", (invoice as any).noPO, "invoice.poId:", (invoice as any).poId, "poNumber:", poNumber);
      
      // First try mockLinkedPOs using noPO
      if ((invoice as any).noPO) {
        relatedPO = mockLinkedPOs.find(po => po.purchaseOrderNo === (invoice as any).noPO);
        if (relatedPO) {
          console.log("[PVR DIALOG] ✓ Found PO in mockLinkedPOs by noPO:", relatedPO.purchaseOrderNo);
        }
      }
      
      // Fallback to mockPurchaseOrder if not found
      if (!relatedPO && (invoice as any).poId) {
        relatedPO = mockPurchaseOrder.find(po => po.poId === (invoice as any).poId);
        if (relatedPO) {
          console.log("[PVR DIALOG] ✓ Found PO in mockPurchaseOrder by poId:", relatedPO.purchaseOrderNo);
        }
      }
      
      if (!relatedPO && poNumber) {
        relatedPO = mockPurchaseOrder.find(po => po.purchaseOrderNo === poNumber);
        if (relatedPO) {
          console.log("[PVR DIALOG] ✓ Found PO in mockPurchaseOrder by poNumber:", poNumber);
        }
      }
      
      if (!relatedPO && (invoice as any).noPO) {
        relatedPO = mockPurchaseOrder.find(po => po.purchaseOrderNo === (invoice as any).noPO);
        if (relatedPO) {
          console.log("[PVR DIALOG] ✓ Found PO in mockPurchaseOrder by noPO:", (invoice as any).noPO);
        }
      }
      
      if (relatedPO) {
        const poDocument = {
          documentType: "PO",
          piNo: relatedPO.purchaseOrderNo,
          poNo: relatedPO.purchaseOrderNo,
          invoiceNo: relatedPO.purchaseOrderNo,
          totalAmount: relatedPO.totalAmount || 0,
        };
        console.log("[PVR DIALOG] ✓ Successfully adding PO document to linkedPIs:", poDocument);
        linkedDocuments.push(poDocument);
      } else {
        console.log("[PVR DIALOG] ✗ PO not found in either mockLinkedPOs or mockPurchaseOrder - searched with noPO:", (invoice as any).noPO, "poId:", (invoice as any).poId);
      }
      
      console.log("[PVR DIALOG] Final linkedDocuments array before setLinkedPIs:", linkedDocuments);
      setLinkedPIs(linkedDocuments);
    } else {
      console.log("[PVR DIALOG] ✗ CONDITION FALSE: Invoice ALREADY linked → KEEPING FORM EMPTY");
      console.log("[PVR DIALOG] Form stays empty, linkedPIs stays empty array");
      // Leave form empty
      setLinkedPIs([]);
    }

console.log("[PVR DIALOG] About to open dialog with final states:");
    console.log("[PVR DIALOG] → pvrForm.supplierName:", emptyForm.supplierName);
    console.log("[PVR DIALOG] → linkedPIs array length: 0 (empty)");
    console.log("[PVR DIALOG] Opening dialog...");
    
    if (invoiceAlreadyLinked) {
      setShowFullyPaidWarning(true);
    } else {
      setShowCreatePVRDialog(true);
    }
  };

  // Handle Create PVR form submission
  const handleCreatePVR = () => { 1
    // Validate supplier
    if (!pvrForm.supplierName) {
      alert("Please select a supplier");
      return;
    }

    // Check if there are payable items (PI and/or PO)
    const hasPayableItems = linkedPIs.some(doc => doc.documentType !== "PO");
    if (!hasPayableItems) {
      alert("Please add at least one payable item (PI, IC, SR, or EN)");
      return;
    }

    try {
      // Get supplier category from master data
      const supplier = supplierMasterData.find(s => s.name === pvrForm.supplierName);
      const supplierCategory = supplier?.category || "LOCAL";

      // Calculate total invoice amount (excluding PO documents)
      const totalInvoice = linkedPIs
        .filter(doc => doc.documentType !== "PO")
        .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

      const today = getTodayDate();
      const newPVR = {
        pvrNo: generatePVRNumber(pvrForm.pt, today),
        pvrDate: convertToStorageDate(pvrForm.pvrDate),
        docReceiptDate: convertToStorageDate(pvrForm.pvrDate),
        supplierName: pvrForm.supplierName,
        supplierCategory: supplierCategory,
        term: pvrForm.term,
        currency: pvrForm.currency,
        rate: pvrForm.rate,
        bankAccount: pvrForm.bankAccount || "",
        paymentMethod: pvrForm.paymentMethod,
        reference: pvrForm.reference || "",
        remarks: pvrForm.remarks || "",
        pt: pvrForm.pt,
        totalInvoice: totalInvoice,
        status: "Draft",
        linkedDocs: linkedPIs.map(doc => ({
          ...doc,
          poNo: doc.poNo || (invoice.noPO || ""),
        })),
      };

      // Save to localStorage
      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      existingPVRs.push(newPVR);
      localStorage.setItem("pvrData", JSON.stringify(existingPVRs));

      console.log("[SAVE PVR] ========== PVR SAVED TO LOCALSTORAGE ==========");
      console.log("[SAVE PVR] PVR Number:", newPVR.pvrNo);
      console.log("[SAVE PVR] Supplier:", newPVR.supplierName);
      console.log("[SAVE PVR] Linked Documents:", newPVR.linkedDocs);
      console.log("[SAVE PVR] Full PVR Object:", newPVR);
      
      // Verify it was actually saved
      const savedPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      console.log("[SAVE PVR] Verified - Total PVRs in localStorage after save:", savedPVRs.length);
      console.log("[SAVE PVR] All PVRs in storage:", savedPVRs.map((p: any) => ({
        pvrNo: p.pvrNo,
        linkedDocsCount: p.linkedDocs?.length || 0,
        linkedDocNos: p.linkedDocs?.map((d: any) => ({
          documentType: d.documentType,
          piNo: d.piNo,
          invoiceNo: d.invoiceNo,
          documentNo: d.documentNo,
        })),
      })));

      // Show success dialog
      setSavedPvrNo(newPVR.pvrNo);
      setSavedPvrLinkedDocs(newPVR.linkedDocs);
      setShowCreatePVRDialog(false);
      setShowPVRSuccessDialog(true);

      // Reset form
      resetPVRForm();
    } catch (error) {
      console.error("Error creating PVR:", error);
      alert("Failed to create PVR. Please try again.");
    }
  };

  // Navigate to existing PVR
  const handleViewPVR = () => {
    if (savedPvrNo && onNavigateToPVR) {
      const expandId = `pvr-${savedPvrNo.replace(/\//g, "-")}`;
      setShowPVRSuccessDialog(false);
      onNavigateToPVR(expandId);

      // Dispatch navigation event
      window.dispatchEvent(
        new CustomEvent("navigateToPVR", {
          detail: {
            pvrId: expandId,
            pvrNo: savedPvrNo,
          },
        })
      );
    }
  };

  // Get document number based on type
  const getDocumentNumber = (doc: any): string => {
    if (!doc) return "";
    switch (doc.documentType) {
      case "PO":
        return doc.invoiceNo || doc.poNo || doc.piNo || "";
      case "IC":
        return doc.icNum || doc.piNo || "";
      case "SR":
        return doc.srNo || doc.piNo || "";
      case "EN":
        return doc.apNoteNo || doc.piNo || "";
      default:
        return doc.piNo || "";
    }
  };

  // Navigate to existing AP Note
  const handleViewAPNote = () => {
    if (savedAPNoteNo && onNavigateToAPNote) {
      const expandId = `apn-${savedAPNoteNo.replace(/\//g, "-")}`;
      setShowSuccessDialog(false);
      onNavigateToAPNote(expandId);
      
      // Dispatch navigation event
      window.dispatchEvent(
        new CustomEvent("navigateToAPNote", {
          detail: {
            apNoteId: expandId,
            apNoteNo: savedAPNoteNo,
          },
        })
      );
    }
  };

  // Create new AP Note
  const handleCreateAPNote = () => {
    console.log("[DEBUG] handleCreateAPNote called");
    const company = apNoteForm.pt || "MJS";
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const sequentialNum = String(Math.floor(Math.random() * 101)).padStart(4, "0");
    
    const apNoteNo = `AP/${company}.MDN/${year}${month}/${sequentialNum}`;
    setSavedAPNoteNo(apNoteNo);
    
    // Calculate total amount
    const totalAmount = accountItems.length > 0
      ? accountItems.reduce((sum, item) => sum + item.totalAmount, 0) -
        (apNoteForm.discount || 0) +
        (apNoteForm.tax || 0) -
        (apNoteForm.pph || 0)
      : (apNoteForm.discount || 0) +
        (apNoteForm.tax || 0) -
        (apNoteForm.pph || 0);
    
    // Process linkedDocs to split PI/PO pairs
    const processedLinkedDocs = linkedDocs.length > 0 
      ? linkedDocs 
      : [{
          id: Date.now().toString(),
          documentType: "PI",
          documentNo: invoice.purchaseInvoiceNo,
          totalAmount: invoice.grandTotal,
        }];
    
    console.log("[DEBUG] Processed linked docs:", processedLinkedDocs);
    
    const newAPNote = {
      id: Date.now().toString(),
      apNoteNo: apNoteNo,
      apNoteCreateDate: apNoteForm.apNoteCreateDate,
      createdBy: "SHEFANNY",
      apNoteType: "NOTE",
      docType: "Expense Note",
      supplierName: apNoteForm.supplierName,
      supplierCategory: "LOCAL",
      totalInvoice: totalAmount,
      docReceiptDate: apNoteForm.docReceiptDate,
      invoiceDate: apNoteForm.apNoteDate,
      term: apNoteForm.term,
      pt: apNoteForm.pt,
      discount: apNoteForm.discount || 0,
      tax: apNoteForm.tax || 0,
      pph: apNoteForm.pph || 0,
      items: accountItems,
      linkedDocs: processedLinkedDocs,
      remarks: apNoteForm.remarks,
    };
    
    console.log("[DEBUG] New AP Note created:", newAPNote);
    
    // Save to localStorage
    const savedAPNotes = JSON.parse(
      localStorage.getItem("createdAPNotes") || "[]",
    );
    savedAPNotes.push(newAPNote);
    localStorage.setItem("createdAPNotes", JSON.stringify(savedAPNotes));
    console.log("[DEBUG] Saved to localStorage, total notes:", savedAPNotes.length);
    
    // Close create dialog and show success
    setShowCreateDialog(false);
    
    // Reset form and items
    setApNoteForm({
      apNoteNo: "AP-NOTE-001",
      apNoteDate: new Date().toISOString().split("T")[0],
      currency: "IDR",
      invoiceNumber: "",
      term: "CREDIT",
      documentReceivedDate: new Date().toISOString().split("T")[0],
      remarks: "",
      supplierName: invoice.supplierName || "",
      pt: "MJS",
      discount: 0,
      tax: 0,
      pph: 0,
      companyName: "",
      docReceiptDate: invoice.docReceivedDate || "",
      apNoteCreateDate: new Date().toISOString().split("T")[0],
    });
    setAccountItems([]);
    setLinkedDocs([]);
    setSelectedDocType("" as any);
    
    // Dispatch event to notify other components
    window.dispatchEvent(
      new CustomEvent("expenseNoteCreated", {
        detail: {
          apNoteNo: apNoteNo,
          linkedDocs: processedLinkedDocs,
          totalAmount: totalAmount,
        },
      })
    );
    console.log("[DEBUG] Dispatched expenseNoteCreated event");
    
    // Dispatch custom event for same-tab storage updates
    window.dispatchEvent(new CustomEvent("storageUpdated"));
    console.log("[DEBUG] Dispatched storageUpdated event");
    
    // Add directly to state AND reload from localStorage to ensure consistency
    setApNotes(prev => [...prev, newAPNote]);
    
    // Reload from localStorage to ensure state matches persisted data
    setTimeout(() => {
      console.log("[DEBUG] Reloading AP notes after creation");
      const savedAPNotes = JSON.parse(
        localStorage.getItem("createdAPNotes") || "[]",
      );
      const linkedNotes = savedAPNotes.filter((note: any) => {
        const isLinked = note.linkedDocs?.some(
          (doc: any) =>
            doc.documentNo === invoice.purchaseInvoiceNo ||
            doc.docNo === invoice.purchaseInvoiceNo,
        );
        return isLinked;
      });
      console.log("[DEBUG] After reload - filtered notes:", linkedNotes);
      setApNotes(linkedNotes);
      
      // Show success dialog after state is updated
      setShowSuccessDialog(true);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "received":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "submit":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "verified":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return `${currency} ${formatNumber(amount)}`;
  };

  return (
    <motion.div
      id={`invoice-collapsible-${invoice.id}`}
      key={`${invoice.id}-${refreshKey}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100"
      style={{
        background:
          "linear-gradient(135deg, #DCCCEC 0%, #E8DDEF 15%, #F0E6F3 30%, #F4EDFA 45%, #F8F5FC 60%, #FAFAFF 75%, #FCFCFF 85%, #FFFFFF 100%)",
      }}
    >
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors relative group"
      >
        
        
        <div className="flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon & ID */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-start gap-2 mb-1">
                                   
                  <div className="flex flex-col gap-1">

                    <span className="text-gray-900 font-mono min-w-[180px] flex items-center gap-1">
                      <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {invoice.purchaseInvoiceNo}
                    </span>
                    
                    <div className="flex items-start gap-2 mb-1"> 
                    {/* Vendor Origin Badge */}
                    {(po as any)?.vendorOrigin && (
                      <Badge className={`text-xs font-medium ${(po as any).vendorOrigin === "Local"
                        ? "bg-blue-100 text-blue-800"
                        : (po as any).vendorOrigin === "Overseas"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                        {(po as any).vendorOrigin}
                      </Badge>
                    )}

                    {/* PO Type Badge */}
                    {(po as any)?.poType && (
                      <Badge className={`text-xs font-medium ${(po as any).poType === "Urgent"
                        ? "bg-red-600 text-white"
                        : (po as any).poType === "Credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                        {(po as any).poType}
                      </Badge>
                    )}</div>
                    

                  </div>
               

                  
                  <span className="text-gray-400 mx-1">|</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-700 font-semibold font-mono">
                      {invoice.noPO}
                    </span>
                    <Badge className={`text-xs w-fit ${
                      (po as any)?.poStatus === "Complete" 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : (po as any)?.poStatus === "Partial"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : (po as any)?.poStatus === "Outstanding"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {(po as any)?.poStatus || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {invoice.ptCompany}
                  </Badge>
                  <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="ltext-gray-700 text-sm truncate">
                    {invoice.supplierName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Pending Icon Overlay - Show ONLY if pendingStatus is true */}
            {pendingStatus && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <AlertCircle className="w-10 h-10 text-red-500 drop-shadow-lg" />
              </div>
            )}
            
            {/* Status Badges */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* Check Status */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!checkStatus) {
                    if (isNotified) {
                      setShowCheckNotifyDialog(true);
                    }
                  }
                }}
                className={checkStatus ? "cursor-not-allowed opacity-60" : "hover:opacity-80 transition-opacity"}
                disabled={checkStatus}
              >
                <div className="relative inline-block">
                  {checkStatus === true? (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Checked
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 cursor-pointer">
                      <Clock className="w-3 h-3 mr-1" />
                      Check
                    </Badge>
                  )}
                  {(isNotified || (!checkStatus && invoice.receivedStatus)) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center" title="Notification sent to logistic">
                      <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Received Status */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!invoice.receivedStatus) {
                    setShowReceivedNotifyDialog(true);
                  }
                }}
                className={!invoice.receivedStatus ? "hover:opacity-80 transition-opacity" : "cursor-not-allowed opacity-60"}
                disabled={invoice.receivedStatus === true}
              >
                <div className="relative inline-block">
                  {invoice.receivedStatus === true ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Received
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 cursor-pointer">
                      <Clock className="w-3 h-3 mr-1" />
                      Receive
                    </Badge>
                  )}
                  {receivedNotificationTimestamps.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center" title="Priority notification sent to logistic">
                      <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Verified Status */}
              {!isVoided &&
                (invoice.status === "VERIFIED" ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ))}


              {/* Submitted Status */}
              {invoice.submissionStatus === "SUBMITTED" ? (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Submit
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                  <Clock className="w-3 h-3 mr-1" />
                  Submit
                </Badge>
              )}

              {/* Document Type Badge - Show when submitted */}
              {invoice.submissionStatus === "SUBMITTED" && invoice.documentType && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {invoice.documentType}
                </Badge>
              )}

             
              {/* Void Badge */}
              {isVoided && (
                <Badge className="bg-red-100 text-red-700 border-red-300">
                  <X className="w-3 h-3 mr-1" />
                  Void
                </Badge>
              )}
            </div>

            {/* Total Amount */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <span className="text-green-700">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Expand Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>


      </button>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-purple-50/30">
              {/* Supplier Info - Mobile */}
              <div className="lg:hidden mb-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">
                    {invoice.supplierName}
                  </span>
                </div>
              </div>

              {/* Details List - 4 columns, 2 rows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {/* Doc Received */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-gray-500 text-xs">
                      Doc Received
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.docReceivedDate
                      ? invoice.docReceivedDate
                      : "N/A"}
                  </div>
                </div>

                {/* Warehouse */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-gray-500 text-xs">
                      Warehouse
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.warehouse}
                  </div>
                </div>

                {/* Payment Term */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-gray-500 text-xs">
                      Payment Term
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.term || "N/A"}
                  </div>
                </div>

                {/* Submission Date */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-gray-500 text-xs">
                      Submission Date
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.submissionDate
                      ? formatDateToDDMMYYYY(
                          invoice.submissionDate,
                        )
                      : "N/A"}
                  </div>
                </div>

                {/* Submit To */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Send className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="text-gray-500 text-xs">
                      Submitted To
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.submittedTo || "N/A"}
                  </div>
                </div>

                {/* PIC */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-pink-600" />
                    <span className="text-gray-500 text-xs">
                      PIC
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {invoice.picPI || "N/A"}
                  </div>
                </div>

                {/* Reference No */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-500 text-xs">
                      Reference No
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEditingRefNo) {
                          onEditReference?.({
                            ...invoice,
                            referenceNo: editReferenceNo,
                          });
                        }
                        setIsEditingRefNo(!isEditingRefNo);
                      }}
                      className="ml-1 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {isEditingRefNo ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Edit className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {isEditingRefNo ? (
                    <input
                      type="text"
                      value={editReferenceNo}
                      onChange={(e) =>
                        setEditReferenceNo(e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-900 text-sm border rounded px-2 py-1 w-full"
                      placeholder="REF-001-2025"
                      autoFocus
                    />
                  ) : (
                    <div className="text-gray-900 text-base">
                      {invoice.referenceNo || "N/A"}
                    </div>
                  )}
                </div>

                {/* Reference Date */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-500 text-xs">
                      Reference Date
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEditingRefDate) {
                          onEditReference?.({
                            ...invoice,
                            referenceDate: editReferenceDate,
                          });
                        }
                        setIsEditingRefDate(!isEditingRefDate);
                      }}
                      className="ml-1 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {isEditingRefDate ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Edit className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {isEditingRefDate ? (
                    <input
                      type="date"
                      value={editReferenceDate}
                      onChange={(e) =>
                        setEditReferenceDate(e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-900 text-sm border rounded px-2 py-1 w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="text-gray-900 text-base">
                      {invoice.referenceDate
                        ? formatDateToDDMMYYYY(
                            invoice.referenceDate,
                          )
                        : "N/A"}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3"
              >
                {/* Total Amount */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 border border-green-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-green-700 font-medium">
                        Total Amount
                      </div>
                      <div className="text-sm font-bold text-green-900">
                        {formatCurrency(grandTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium">
                        Down Payment
                      </div>
                      <div className="text-sm font-bold text-blue-900">
                        {(() => {
                          void downPaymentRefresh; // Trigger dependency
                          return formatCurrency(
                            getSyncedPaymentAmountsByPO(invoice.noPO).downPayment || invoice.downPayment || 0,
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outstanding */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-orange-700 font-medium">
                        Outstanding
                      </div>
                      <div className="text-sm font-bold text-orange-900">
                        {formatCurrency(
                          getSyncedPaymentAmounts(invoice.purchaseInvoiceNo).outstanding || invoice.outstanding || 0,
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-purple-700 font-medium">
                        Payment Progress
                      </div>
                      <div className="text-sm font-bold text-purple-900">
                        {(() => {
                          const syncedAmounts = getSyncedPaymentAmounts(invoice.purchaseInvoiceNo);
                          const downPayment = syncedAmounts.downPayment || invoice.downPayment;
                          const outstanding = syncedAmounts.outstanding || invoice.outstanding;
                          return downPayment && outstanding
                            ? `${((downPayment / (downPayment + outstanding)) * 100).toFixed(1)}%`
                            : "0%";
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center gap-3 flex-wrap"
              >
                {/* View Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedDetail(invoice);
                    setShowDetailDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">
                    View Details
                  </span>
                </Button>

                {/* Linked Documents Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowLinkedDocsDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                >
                  <Link className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">
                    Link
                  </span>
                </Button>

                {/* Expense Note Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAPNoteClick();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">
                    Expense Note
                  </span>
                </Button>

                {/* Attachment Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAttachmentClick();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">
                    Attachment
                  </span>
                </Button>

                {/* Create PVR Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleCreatePVRClick();
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">
                    PVR
                  </span>
                </Button>

            

                

    



                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowVoidDialog(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[120px] justify-start"
                >
                  <X className="w-4 h-4 mr-2 text-white" />
                  <span className="flex-1 text-center">
                    Void
                  </span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      >
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Purchase Invoice Detail
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex flex-row gap-6">

                {/* Left Side: Invoice & PO Details */}
                <div className="flex flex-row items-center gap-6 overflow-x-auto pb-1 w-full">
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Purchase Invoice No</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {invoice.purchaseInvoiceNo}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Purchase Order No</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {invoice.noPO}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Date</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {invoice.docReceivedDate
                        ? formatDateToDDMMYYYY(invoice.docReceivedDate)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Supplier Name</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {invoice.supplierName}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Warehouse</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {invoice.warehouse}
                    </div>
                  </div>
                </div>

                {/* Right Side: Payment Cards */}
                <div className="flex flex-row items-center gap-4 overflow-x-auto pb-1 w-full">
                  {/* Down Payment Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-blue-700 font-medium leading-tight">Down Payment</div>
                      <div className="text-sm font-bold text-blue-900 truncate">
                        {(() => {
                          void downPaymentRefresh;
                          return formatCurrency(
                            getSyncedPaymentAmountsByPO(invoice.noPO).downPayment || invoice.downPayment || 0
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Outstanding Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-orange-700 font-medium leading-tight">Outstanding</div>
                      <div className="text-sm font-bold text-orange-900 truncate">
                        {formatCurrency(
                          getSyncedPaymentAmounts(invoice.purchaseInvoiceNo).outstanding || invoice.outstanding || 0
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Progress Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-purple-700 font-medium leading-tight">Payment Progress</div>
                      <div className="text-sm font-bold text-purple-900 truncate">
                        {(() => {
                          const syncedAmounts = getSyncedPaymentAmounts(invoice.purchaseInvoiceNo);
                          const downPayment = syncedAmounts.downPayment || invoice.downPayment;
                          const outstanding = syncedAmounts.outstanding || invoice.outstanding;
                          return downPayment && outstanding
                            ? `${((downPayment / (downPayment + outstanding)) * 100).toFixed(1)}%`
                            : "0%";
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex items-center justify-between border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveDetailTab("items")
                  }
                  className={`px-4 py-2 text-sm font-medium ${activeDetailTab === "items"
                      ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                >
                  Items
                </button>

                <button
                  onClick={() =>
                    setActiveDetailTab("ActivityLog")
                  }
                  className={`px-4 py-2 text-sm font-medium ${activeDetailTab === "ActivityLog"
                    ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                >
                  Activity Log
                </button>
              </div>
            </div>

            {/* Items Table - Only show when Items tab is active */}
            {activeDetailTab === "items" && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="overflow-auto"
                style={{ maxHeight: "200px" }}
              >
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-purple-50">
                    <tr>
                      <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                      </th>
                      <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                        Item Code
                      </th>
                      <th className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b" style={{ minWidth: '200px' }}>
                        Item Name
                      </th>
                      <th className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b" style={{ minWidth: '200px' }}>
                        Item Description
                      </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          PPH
                        </th>
                      <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                        Qty
                      </th>
                      <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                        UOM
                      </th>
                  
                        <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                        Discount
                      </th>
                      <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                        Price/Qty
                      </th>
                      
                      <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                        Total
                      </th>

                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Item Returned
                        </th>
                       
                     
                    </tr>
                  </thead>
                  <tbody>
                    {mockItems.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-50/50 border-b last:border-b-0"
                      >
                        <td className="text-center text-xs whitespace-nowrap px-4 py-3">
                          {item.pricePerQty >= 1000000 && !item.pphApplicable && (
                            <button
                              onClick={() => {
                                setSelectedItemForImage(item);
                                setShowImageGalleryDialog(true);
                              }}
                              className="cursor-pointer hover:opacity-80 transition-opacity relative inline-block overflow-visible"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-red-600 text-xl leading-none">●</span>
                                <Eye className="w-4 h-4 text-purple-600" style={{marginTop: '5px'}}/>
                              </div>

                              {notifiedItems.has(item.itemCode) && (
                                <div
                                  className="absolute top-0 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"
                                  title="Notification sent to logistic"
                                >
                                  <svg
                                    className="w-1.5 h-1.5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </button>


                          )}
                        </td>
                        <td className="font-medium text-xs whitespace-nowrap px-4 py-3">
                          {item.itemCode}
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          {item.itemName}
                        </td>
                         <td className="text-xs whitespace-nowrap px-4 py-3">
                          {item.itemDescription}
                        </td>
                         <td className="text-center text-xs whitespace-nowrap px-4 py-3">
                             <input type="checkbox" disabled checked={item.pphApplicable} className="cursor-not-allowed bg-white accent-blue-500" />
                          </td>
                        <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          {item.uom}
                        </td>
                        
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          {/* untuk nominal discount diskon */}
                        </td>

                        <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                          {formatCurrency(item.pricePerQty)}
                        </td>
                        <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                          {formatCurrency(
                            item.quantity * item.pricePerQty,
                          )}
                        </td>
                          <td className="text-x whitespace-nowrap px-4 py-3">
                            {!item.returned || item.returned === 0 ? "-" : item.returned}
                          </td>
                     

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* ActivityLog Tab Content */}
            {activeDetailTab === "ActivityLog" && (
              <div className="p-6 overflow-hidden">
                {invoiceActivityLog && invoiceActivityLog.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
                      <ClockIcon className="w-5 h-5" />
                      Activity Timeline
                    </h3>
                    <div className="space-y-6">
                      {invoiceActivityLog.map((entry, idx) => (
                        <div
                          key={`${entry.timestamp}-${entry.user}-${idx}`}
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-full mt-1.5" />
                            {idx < invoiceActivityLog.length - 1 && (
                              <div className="w-0.5 h-12 bg-purple-200 my-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="p-4 rounded-lg border-2 bg-purple-100 text-blue-700 border-purple-300">
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-semibold text-sm">
                                  {entry.action}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {entry.timestamp}
                                </div>
                              </div>
                              <div className="text-sm">
                                PIC:{" "}
                                <span className="font-medium">
                                  {entry.user}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>
                      No Activity Log records yet
                    </p>
                  </div>
                )}
              </div>
            )}

          
          
          </div>
 
          {/* Sticky Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-6 space-y-4">
            {/* Financial Summary with Remarks */}
             {selectedDetail && activeDetailTab === "items" && (
              <div className="flex gap-4 items-stretch">
                {/* Remarks Section */}
                <div className="w-1/2 flex flex-col  h-full">
                  <Label>Remarks</Label>
                  <div className="flex-1">
                    <Textarea
                      value={
                        selectedDetail.remarks || ""
                      }
                      readOnly
                      placeholder="No remarks"
                      className="flex-1 resize-none" style={{ minHeight: "170px" }}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Total Amount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Total Amount
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {formatNumber(
                          selectedDetail?.items &&
                            selectedDetail.items
                              .length > 0
                            ? selectedDetail.items.reduce(
                                (sum, item) =>
                                  sum +
                                  (item.totalAmount ||
                                    0),
                                0,
                              )
                            : selectedDetail?.linkedDocuments &&
                                selectedDetail
                                  .linkedDocuments
                                  .length > 0
                              ? selectedDetail.linkedDocuments.reduce(
                                  (sum, doc) =>
                                    sum +
                                    (doc.totalAmount ||
                                      0),
                                  0,
                                )
                              : 0,
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold flex items-center gap-2">
                        Discount
                        <button
                          onClick={() => {
                            if (isEditingDiscount) {
                              onUpdateInvoice?.({
                                ...selectedDetail,
                                discount: editDiscount,
                              });
                            }
                            setIsEditingDiscount(!isEditingDiscount);
                          }}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          {isEditingDiscount ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Edit className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">
                        (
                      </span>
                      {isEditingDiscount ? (
                        <input
                          type="number"
                          value={editDiscount}
                          onChange={(e) =>
                            setEditDiscount(parseFloat(e.target.value) || 0)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              onUpdateInvoice?.({
                                ...selectedDetail,
                                discount: editDiscount,
                              });
                              setIsEditingDiscount(false);
                            }
                          }}
                          className="text-gray-900 text-sm border rounded px-2 py-1 font-bold w-[114px] text-right"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                          {formatNumber(
                            Math.abs(
                              editDiscount || 0,
                            ),
                            selectedDetail.currency ||
                              "IDR",
                          )}
                        </span>
                      )}
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">
                        )
                      </span>
                    </div>

                    {/* Tax */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPN
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(
                          selectedDetail.tax || 0,
                          selectedDetail.currency ||
                            "IDR",
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* PPH */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPH
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">
                        (
                      </span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(
                          Math.abs(
                            selectedDetail.pph || 0,
                          ),
                          selectedDetail.currency ||
                            "IDR",
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">
                        )
                      </span>
                    </div>

                      {/* OTHER COST */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold flex items-center gap-2">
                        Other Cost
                        <button
                          onClick={() => setShowOtherCostDialog(true)}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                          title="View Other Cost Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(
                          otherCosts.reduce((sum, cost) => sum + cost.costAmount, 0)
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>



                    {/* Grand Total */}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-gray-700 text-sm flex-1 font-bold">
                          Grand Total
                        </span>
                    
                       <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {selectedDetail.currency ||
                          "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                        <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                          {formatNumber(
                            grandTotal,
                            selectedDetail.currency ||
                              "IDR",
                          )}
                        </span>
                        <span className="text-gray-700 text-sm w-4 text-left"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              
              <Button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onViewReason();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
              >
                <Eye className="w-4 h-4 mr-2" />
                Note
              </Button>
              {invoice.status === "VERIFIED" ? (
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onStatusClick();
                  }}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  disabled={isVoided}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verified
                </Button>
              ) : (
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onValidate();
                  }}
                  variant="outline"
                  className="border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={isVoided || invoice.receivedStatus !== true || !checkStatus}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              )}
              <Button
                onClick={() => {
                  alert("Print functionality");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Linked Documents Dialog */}
      <Dialog
        open={showLinkedDocsDialog}
        onOpenChange={setShowLinkedDocsDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              Linked Documents
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700 border-purple-200"
              >
                {(() => {
                  let docCount = 0;

                  // Count main PO
                  if (po && po.purchaseOrderNo) {
                    docCount += 1;
                  }

                  // Count linked PRs
                  const linkedPRs = mockpurchaseReturns.filter(
                    (pr: any) => pr.poNo === po?.purchaseOrderNo,
                  );
                  docCount += linkedPRs.length;

                  // Count linked PVRs
                  let currentPVRData: any[] = [];
                  try {
                    const savedPVRs = localStorage.getItem("pvrData");
                    if (savedPVRs) {
                      currentPVRData = JSON.parse(savedPVRs);
                    }
                  } catch (error) {
                    currentPVRData = pvrData || [];
                  }

                  let allLinkedPVRs: any[] = [];
                  if (currentPVRData && Array.isArray(currentPVRData) && currentPVRData.length > 0) {
                    const piLinkedToThisPO = mockpurchaseInvoice.filter(
                      (pi) => pi.noPO === po?.purchaseOrderNo,
                    );

                    const pvrsMap = new Map<string, any>();
                    currentPVRData.forEach((pvr) => {
                      if (pvr.poNumber === po?.purchaseOrderNo || pvr.poNumber === po?.poId) {
                        pvrsMap.set(pvr.pvrNo, pvr);
                      } else if (pvr.linkedDocs && Array.isArray(pvr.linkedDocs)) {
                        const matchingPODocs = pvr.linkedDocs.filter((doc: any) => doc.poNo === po?.purchaseOrderNo);
                        if (matchingPODocs.length > 0) {
                          pvrsMap.set(pvr.pvrNo, pvr);
                        } else {
                          const matchingPIDocs = pvr.linkedDocs.filter((doc: any) => {
                            return piLinkedToThisPO.find((pi) => pi.purchaseInvoiceNo === doc.piNo);
                          });
                          if (matchingPIDocs.length > 0) {
                            pvrsMap.set(pvr.pvrNo, pvr);
                          }
                        }
                      }
                    });
                    allLinkedPVRs = Array.from(pvrsMap.values());
                  }

                  docCount += allLinkedPVRs.length;

                  // Count expense notes - linked to this invoice
                  let apNotesCount = 0;
                  if (apNotes && apNotes.length > 0) {
                    apNotesCount = apNotes.length;
                    docCount += apNotesCount;
                  }

                  // Count PVs
                  const linkedPVs = findLinkedPVsByPINo(invoice.purchaseInvoiceNo);
                  docCount += linkedPVs.length;

                  console.log("📊 [BADGE COUNT] PO:", po?.purchaseOrderNo ? 1 : 0, "PRs:", linkedPRs.length, "PVRs:", allLinkedPVRs.length, "AP Notes:", apNotesCount, "PVs:", linkedPVs.length, "Total:", docCount);

                  return docCount;
                })()}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Documents linked with this purchase invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "500px" }}>
            {/* Display the main PO that this invoice is linked to */}
            {po && po.purchaseOrderNo && (
              <div
                className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                onClick={() => {
                  const event = new CustomEvent(
                    "navigateToPurchaseOrder",
                    { detail: { docNo: po.purchaseOrderNo } },
                  );
                  window.dispatchEvent(event);
                  setShowLinkedDocsDialog(false);
                  onNavigateToPurchaseOrder?.(po.purchaseOrderNo);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-indigo-700 font-medium">
                        {po.purchaseOrderNo}
                      </p>
                      <p className="text-sm text-gray-500">
                        Purchase Order
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-700 border-indigo-200"
                  >
                    PO
                  </Badge>
                </div>
              </div>
            )}

            {(() => {
              const linkedDocs = mockPOData?.linkedDocs;
              if (!linkedDocs || (Array.isArray(linkedDocs) && linkedDocs.length === 0) || (!Array.isArray(linkedDocs) && !linkedDocs))
                return null;

              const docComponents = [];
              const docsToProcess = Array.isArray(linkedDocs)
                ? linkedDocs
                : [linkedDocs];

              docsToProcess.forEach((linkedDoc, idx) => {
                if (!linkedDoc || !linkedDoc.docNo) return;

                const { type, docNo, pairedPO } = linkedDoc;

                // Display main document based on type
                if (type === "Purchase Order") {
                  docComponents.push(
                    <div
                      key={`po-${docNo}`}
                      className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseOrder",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);

                        setShowLinkedDocsDialog(false);
                        onNavigateToPurchaseOrder?.(docNo);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-indigo-700 font-medium">
                              {docNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              Purchase Order
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          PO
                        </Badge>
                      </div>
                    </div>,
                  );
                } else if (type === "Import Cost") {
                  docComponents.push(
                    <div
                      key={`ic-${docNo}`}
                      className="p-4 bg-white border border-amber-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-amber-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToImportCost",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);

                        setShowLinkedDocsDialog(false);
                        onNavigateToImportCost?.(docNo);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="text-amber-700 font-medium">
                              {docNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              Import Cost
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                          IC
                        </Badge>
                      </div>
                    </div>,
                  );
                } else if (type === "Shipment Request") {
                  docComponents.push(
                    <div
                      key={`sr-${docNo}`}
                      className="p-4 bg-white border border-green-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-green-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToShipmentRequest",
                          { detail: { documentNo: docNo } },
                        );
                        window.dispatchEvent(event);

                        setShowLinkedDocsDialog(false);
                        onNavigateToShipmentRequest?.(docNo);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-green-700 font-medium">
                              {docNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              Shipment Request
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          SR
                        </Badge>
                      </div>
                    </div>,
                  );
                } else if (type === "Purchase Order") {
                  docComponents.push(
                    <div
                      key={`po-${docNo}`}
                      className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseOrder",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);

                        setShowLinkedDocsDialog(false);
                        onNavigateToPurchaseOrder?.(docNo);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-indigo-700 font-medium">
                              {docNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              Purchase Order
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          PO
                        </Badge>
                      </div>
                    </div>,
                  );
                }
              });

              return docComponents.length > 0 ? docComponents : null;
            })()}

            {/* LINKED PURCHASE RETURNS SECTION */}
            {(() => {
              // Import mockpurchaseReturns and filter by current PO number
              const linkedPRs = mockpurchaseReturns.filter(
                (pr: any) => pr.poNo === po.purchaseOrderNo,
              );

              if (!linkedPRs || linkedPRs.length === 0)
                return null;

              return (
                <>
                  {linkedPRs.map((pr: any) => (
                    <div
                      key={pr.returId}
                      className="p-4 bg-white border border-orange-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-orange-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseReturn",
                          { detail: { prNo: pr.prNo } },
                        );
                        window.dispatchEvent(event);

                        setShowLinkedDocsDialog(false);
                        // Use callback if available - we might need to add it to props
                        if (onNavigateToPurchaseReturn) {
                          onNavigateToPurchaseReturn(pr.prNo);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-orange-700 font-medium">
                              {pr.prNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pr.supplierName}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-orange-600 text-white">
                          PR
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* LINKED PVRs SECTION */}
            {(() => {
              // Use linkedDocsRefresh as dependency to force re-evaluation
              void linkedDocsRefresh;

              // Load pvrData from localStorage directly to ensure we get the latest
              let currentPVRData: any[] = [];
              try {
                const savedPVRs =
                  localStorage.getItem("pvrData");
                if (savedPVRs) {
                  currentPVRData = JSON.parse(savedPVRs);
                }
              } catch (error) {
                console.error(
                  "Failed to load PVR data from localStorage:",
                  error,
                );
                currentPVRData = pvrData || [];
              }

              console.log(
                "🔍 [LINKED PVRS] Looking for PVRs for PO:",
                po.purchaseOrderNo,
              );
              console.log(
                "📊 [LINKED PVRS] Total PVRs in localStorage:",
                currentPVRData.length,
              );
              console.log(
                "📋 [LINKED PVRS] All PVRs in storage:",
                currentPVRData.map((p) => ({
                  pvrNo: p.pvrNo,
                  poNumber: p.poNumber,
                  linkedDocsCount: p.linkedDocs?.length || 0,
                  linkedDocsPOs:
                    p.linkedDocs?.map((d: any) => ({
                      piNo: d.piNo,
                      poNo: d.poNo,
                    })) || [],
                })),
              );

              let allLinkedPVRs: any[] = [];

              if (
                currentPVRData &&
                Array.isArray(currentPVRData) &&
                currentPVRData.length > 0
              ) {
                // Get all PIs linked to this PO
                const piLinkedToThisPO =
                  mockpurchaseInvoice.filter(
                    (pi) => pi.noPO === po.purchaseOrderNo,
                  );

                console.log(
                  "📋 [LINKED PVRS] PIs linked to this PO:",
                  piLinkedToThisPO,
                );

                // Find PVRs from currentPVRData that are linked to this PO or its PIs
                const pvrsMap = new Map<string, any>();

                currentPVRData.forEach((pvr) => {
                  console.log(
                    `📌 [LINKED PVRS] Checking PVR ${pvr.pvrNo}:`,
                    {
                      poNumber: pvr.poNumber,
                      targetPO: po.purchaseOrderNo,
                      targetPoId: po.poId,
                      matches:
                        pvr.poNumber === po.purchaseOrderNo ||
                        pvr.poNumber === po.poId,
                    },
                  );

                  // Check if PVR is linked to this PO by poNumber (could be poId or purchaseOrderNo)
                  if (
                    pvr.poNumber === po.purchaseOrderNo ||
                    pvr.poNumber === po.poId
                  ) {
                    console.log(
                      "✅ [LINKED PVRS] Found PVR linked by PO number/poId:",
                      pvr.pvrNo,
                      "with poNumber:",
                      pvr.poNumber,
                    );
                    pvrsMap.set(pvr.pvrNo, pvr);
                  } else if (
                    pvr.linkedDocs &&
                    Array.isArray(pvr.linkedDocs)
                  ) {
                    // Check if PVR is linked to this PO directly via linkedDocs.poNo
                    const matchingPODocs =
                      pvr.linkedDocs.filter((doc: any) => {
                        const matches =
                          doc.poNo === po.purchaseOrderNo;
                        console.log(
                          `  📄 [LINKED PVRS] Checking doc: piNo=${doc.piNo}, poNo=${doc.poNo}, matches=${matches}`,
                        );
                        return matches;
                      });

                    if (matchingPODocs.length > 0) {
                      console.log(
                        "✅ [LINKED PVRS] Found PVR linked by PO (via linkedDocs.poNo):",
                        pvr.pvrNo,
                      );
                      pvrsMap.set(pvr.pvrNo, pvr);
                    } else {
                      // Also check if linked to any PI that's linked to this PO
                      const matchingPIDocs =
                        pvr.linkedDocs.filter((doc: any) => {
                          const piInThisPO =
                            piLinkedToThisPO.find(
                              (pi) =>
                                pi.purchaseInvoiceNo ===
                                doc.piNo,
                            );
                          if (piInThisPO) {
                            console.log(
                              "✅ [LINKED PVRS] Found PVR linked by PI:",
                              pvr.pvrNo,
                              "with PI:",
                              doc.piNo,
                            );
                            return true;
                          }
                          return false;
                        });

                      if (matchingPIDocs.length > 0) {
                        pvrsMap.set(pvr.pvrNo, pvr);
                      }
                    }
                  }
                });

                allLinkedPVRs = Array.from(pvrsMap.values());
              }

              console.log(
                "🎯 [LINKED PVRS] Total linked PVRs found:",
                allLinkedPVRs.length,
                allLinkedPVRs,
              );

              // If nothing found from localStorage, fallback to mock functions
              if (allLinkedPVRs.length === 0) {
                console.log(
                  "⚠️ [LINKED PVRS] No PVRs found in localStorage, trying mock data...",
                );
                const pvrsLinkedByPO = findLinkedPVRsByPONo(
                  po.purchaseOrderNo,
                );
                const piLinkedToThisPO =
                  mockpurchaseInvoice.filter(
                    (pi) => pi.noPO === po.purchaseOrderNo,
                  );

                let pvrsLinkedByPI: any[] = [];
                piLinkedToThisPO.forEach((pi) => {
                  const pvrs = findLinkedPVRsByPINo(
                    pi.purchaseInvoiceNo,
                  );
                  pvrsLinkedByPI = [...pvrsLinkedByPI, ...pvrs];
                });

                const pvrsMap = new Map<string, any>();
                pvrsLinkedByPO.forEach((pvr) =>
                  pvrsMap.set(pvr.pvrNo, pvr),
                );
                pvrsLinkedByPI.forEach((pvr) =>
                  pvrsMap.set(pvr.pvrNo, pvr),
                );
                allLinkedPVRs = Array.from(pvrsMap.values());

                console.log(
                  "📦 [LINKED PVRS] Found from mock data:",
                  allLinkedPVRs.length,
                );
              }

              // Don't render anything if no PVRs
              if (allLinkedPVRs.length === 0) {
                return null;
              }

              return (
                <>
                  {allLinkedPVRs.map((pvr: any) => (
                    <div
                      key={pvr.pvrNo}
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        onNavigateToPVR?.(pvr.pvrNo);
                        setShowLinkedDocsDialog(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-blue-700 font-medium">
                              {pvr.pvrNo}
                            </p>
                            <p className="text-sm text-gray-500">
                              Payment Voucher Request
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          PVR
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* LINKED EXPENSE NOTES - Embedded in main list */}
            {(() => {
              console.log("[RENDER CHECK] apNotes state:", apNotes);
              console.log("[RENDER CHECK] apNotes length:", apNotes?.length);
              console.log("[RENDER CHECK] apNotes items:", apNotes?.map(n => ({ apNoteNo: n?.apNoteNo, docType: n?.docType, id: n?.id })));
              
              if (!apNotes || apNotes.length === 0) {
                console.log("[RENDER CHECK] apNotes is empty, returning null");
                return null;
              }

              console.log("[RENDER CHECK] apNotes has", apNotes.length, 'items, will render them');
              
              return (
                <>
           
                  
                  {apNotes.map((note: any, idx: number) => {
                    console.log("[RENDER CHECK] Rendering note at index", idx);
                    console.log("[RENDER CHECK] note object:", note);
                    console.log("[RENDER CHECK] note.apNoteNo:", note?.apNoteNo);
                    
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-purple-50"
                        onClick={() => {
                          setSavedAPNoteNo(note.apNoteNo);
                          handleViewAPNote();
                          setShowLinkedDocsDialog(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-purple-700 font-medium">
                                {note.apNoteNo || note.apNoteNumber || `[No apNoteNo - docType: ${note.docType}]`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expense Note
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-purple-600 text-white">
                            Expense Note
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}

            {/* LINKED PVs SECTION */}
            {(() => {
              const linkedPVs = findLinkedPVsByPINo(invoice.purchaseInvoiceNo);
              if (linkedPVs.length === 0) return null;

              return (
                <>
                  {linkedPVs.map((pv: any) => (
                    <div
                      key={pv.id}
                      className="p-4 bg-white border border-emerald-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-emerald-50"
                      onClick={() => {
                        const event = new CustomEvent(
                          "navigateToPaymentVoucher",
                          { detail: { pvNo: pv.pvNo } },
                        );
                        window.dispatchEvent(event);
                        
                        setShowLinkedDocsDialog(false);
                        if (onNavigateToPV) {
                          onNavigateToPV(pv.pvNo);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-emerald-700 font-medium">{pv.pvNo}</p>
                            <p className="text-sm text-gray-500">Payment Voucher</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white">PV</Badge>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* Show message only if NO documents exist at all */}
            {(!po || !po.purchaseOrderNo) &&
              (!apNotes || apNotes.length === 0) &&
              (() => {
                const linkedPRs = mockpurchaseReturns.filter(
                  (pr: any) => pr.poNo === po?.purchaseOrderNo,
                );
                const mockPOData = po || { linkedDocs: [] };
                const linkedDocs = mockPOData?.linkedDocs || [];
                
                let currentPVRData: any[] = [];
                try {
                  const savedPVRs = localStorage.getItem("pvrData");
                  if (savedPVRs) {
                    currentPVRData = JSON.parse(savedPVRs);
                  }
                } catch (error) {
                  currentPVRData = pvrData || [];
                }

                const hasPVRs = currentPVRData.some((pvr: any) =>
                  pvr.poNumber === po?.purchaseOrderNo ||
                  pvr.poNumber === po?.poId ||
                  (pvr.linkedDocs?.some((doc: any) => doc.poNo === po?.purchaseOrderNo))
                );

                if (!linkedDocs || (Array.isArray(linkedDocs) && linkedDocs.length === 0) || (!Array.isArray(linkedDocs) && !linkedDocs)) {
                  if (linkedPRs.length === 0 && !hasPVRs) {
                    return (
                      <p className="text-sm text-gray-500 italic">
                        No linked documents selected
                      </p>
                    );
                  }
                }
                return null;
              })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkedDocsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Type Selection Dialog */}
      <Dialog
        open={showDocTypeSelection}
        onOpenChange={setShowDocTypeSelection}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Select Document Type
            </DialogTitle>
            <DialogDescription>
              Choose the type of document you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Card
              className="p-6 cursor-pointer hover:bg-purple-50 border-purple-200 transition-all hover:shadow-lg"
              onClick={() => {
                setSelectedDocType("AP Note");
                setShowDocTypeSelection(false);
                setTimeout(
                  () => setShowCreateDialog(true),
                  100,
                );
              }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">
                    AP Note
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create standard AP Note document
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className="p-6 cursor-pointer hover:bg-red-50 border-red-200 transition-all hover:shadow-lg"
              onClick={() => {
                setSelectedDocType("AP DISC NOTE");
                setShowDocTypeSelection(false);
                setTimeout(
                  () => setShowCreateDialog(true),
                  100,
                );
              }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    AP DISC NOTE
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create discount/deduction note (negative
                    amount)
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* AP Note List Dialog */}
      <Dialog
        open={showAPNoteListDialog}
        onOpenChange={setShowAPNoteListDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Linked Expense Notes
            </DialogTitle>
            <DialogDescription>
              {apNotes.length} expense note(s) linked to this invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {apNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSavedAPNoteNo(note.apNoteNo);
                  handleViewAPNote();
                  setShowAPNoteListDialog(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">
                      {note.apNoteNo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expense Note
                    </p>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    View
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
           
            <Button
              onClick={() => {
                setShowAPNoteListDialog(false);
                setShowDocTypeSelection(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create New
            </Button>
             <Button
              variant="outline"
              onClick={() => setShowAPNoteListDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create AP Note Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent className="w-[2700px] h-[800px] flex flex-col">
          <DialogHeader className="space-y-1 flex-shrink-0">
            <DialogTitle
              className={
                selectedDocType === "AP DISC NOTE"
                  ? "text-red-900"
                  : "text-purple-900"
              }
            >
              Create {selectedDocType}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new{" "}
              {selectedDocType}
              {selectedDocType === "AP DISC NOTE" &&
                " (Amount will be negative)"}
            </DialogDescription>
          </DialogHeader>

          {/* Main container with flex layout */}
          <div className="flex flex-col flex-1 overflow-hidden gap-0">
            {/* Scrollable content area */}
            <div
              ref={mainDialogScrollRef}
              className="flex-1 overflow-y-auto px-4 py-2"
            >
              <div className="space-y-4">
                {/* Baris Atas: 1x4 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Supplier Name */}
                  <div
                    className="relative"
                    ref={supplierDropdownRef}
                  >
                    <Label>
                      Supplier Name
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Input
                      value={apNoteForm.supplierName}
                      disabled
                      readOnly
                      placeholder="Auto-populated from PO"
                      className="bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                  </div>

                  {/* Term */}
                  <div>
                    <Label>
                      Term
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Select
                      value={apNoteForm.term}
                      onValueChange={(value: TermType) =>
                        setApNoteForm({
                          ...apNoteForm,
                          term: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="URGENT">
                          Urgent
                        </SelectItem>
                        <SelectItem value="CREDIT">
                          Credit
                        </SelectItem>
                        <SelectItem value="ONLINE SHOPPING">
                          Online Shopping
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div>
                    <Label>
                      Currency
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Select
                      value={apNoteForm.currency}
                      onValueChange={(value) =>
                        setApNoteForm({
                          ...apNoteForm,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">
                          IDR
                        </SelectItem>
                        <SelectItem value="USD">
                          USD
                        </SelectItem>
                        <SelectItem value="EUR">
                          EUR
                        </SelectItem>
                        <SelectItem value="SGD">
                          SGD
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company */}
                  <div>
                    <Label>
                      Company
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Select
                      value={apNoteForm.pt}
                      onValueChange={(value: PTType) =>
                        setApNoteForm({
                          ...apNoteForm,
                          pt: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MJS">
                          MJS
                        </SelectItem>
                        <SelectItem value="AMT">
                          AMT
                        </SelectItem>
                        <SelectItem value="GMI">
                          GMI
                        </SelectItem>
                        <SelectItem value="WNS">
                          WNS
                        </SelectItem>
                        <SelectItem value="WSI">
                          WSI
                        </SelectItem>
                        <SelectItem value="TTP">
                          TTP
                        </SelectItem>
                        <SelectItem value="IMI">
                          IMI
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Baris Bawah: 1x3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Document Received Date */}
                  <div>
                    <Label>
                      Document Received Date
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Input
                      type="text"
                      value={formatDateToDDMMYYYY(
                        apNoteForm.documentReceivedDate,
                      )}
                      onChange={(e) => {
                        const [day, month, year] =
                          e.target.value.split("/");
                        if (day && month && year) {
                          const isoDate = `${year}-${month}-${day}`;
                          setApNoteForm({
                            ...apNoteForm,
                            documentReceivedDate: isoDate,
                          });
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  {/* AP Note Date */}
                  <div>
                    <Label>
                      AP Note Date
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Input
                      type="text"
                      value={formatDateToDDMMYYYY(
                        apNoteForm.apNoteDate,
                      )}
                      onChange={(e) => {
                        const [day, month, year] =
                          e.target.value.split("/");
                        if (day && month && year) {
                          const isoDate = `${year}-${month}-${day}`;
                          setApNoteForm({
                            ...apNoteForm,
                            apNoteDate: isoDate,
                          });
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  {/* Invoice Number */}
                  <div>
                    <Label>
                      Invoice Number
                      <span className="text-red-500">
                        *
                      </span>
                    </Label>
                    <Input
                      value={apNoteForm.invoiceNumber}
                      onChange={(e) =>
                        setApNoteForm({
                          ...apNoteForm,
                          invoiceNumber: e.target.value,
                        })
                      }
                      placeholder="Enter invoice number"
                    />
                  </div>
                </div>
              </div>

              {/* Tabs for Items and Links */}
              <Tabs
                value={activeCreateTabItems}
                onValueChange={(val) =>
                  setActiveCreateTabItems(
                    val as "items" | "links",
                  )
                }
                className="w-full mt-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200 mb-3">
                  <div className="flex items-center gap-0">
                    <button
                      onClick={() => {
                        setActiveCreateTabItems("items");
                        // Auto-scroll to bottom of dialog
                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo(
                              {
                                top:
                                  mainDialogScrollRef
                                    .current.scrollHeight +
                                  500,
                                behavior: "smooth",
                              },
                            );
                          }
                        }, 100);
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeCreateTabItems === "items"
                          ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                          : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Items
                    </button>

                    <button
                      onClick={() => {
                        setActiveCreateTabItems("links");
                        // Auto-scroll to bottom of dialog
                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo(
                              {
                                top:
                                  mainDialogScrollRef
                                    .current.scrollHeight +
                                  500,
                                behavior: "smooth",
                              },
                            );
                          }
                        }, 100);
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeCreateTabItems === "links"
                          ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                          : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Linked Documents
                    </button>
                  </div>
                </div>

                {/* Items Tab */}
                <TabsContent
                  value="items"
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const newItem: AccountItem = {
                          id: Date.now().toString(),
                          accountCode: "",
                          accountName: "",
                          deptDescription: "",
                          qty: 0,
                          unitPrice: 0,
                          totalAmount: 0,
                          description: "",
                          category: "",
                          department: "",
                        };
                        setAccountItems([
                          ...accountItems,
                          newItem,
                        ]);

                        // Auto-scroll to bottom of dialog
                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo(
                              {
                                top:
                                  mainDialogScrollRef
                                    .current.scrollHeight +
                                  500,
                                behavior: "smooth",
                              },
                            );
                          }
                        }, 100);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {/* Account Items Table */}
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>
                            Account Code
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>
                            Account Name
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>
                            Dept Code
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>
                            Dept Name
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>
                            Qty
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>
                            Unit Price
                            <span className="text-red-500">
                              *
                            </span>
                          </TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountItems.map((item, index) => (
                          <TableRow
                            key={item.id}
                            ref={
                              index ===
                              accountItems.length - 1
                                ? lastAccountItemRef
                                : null
                            }
                          >
                            <TableCell>
                              {/* Category Input */}
                              <Input
                                value={item.category || ""}
                                onChange={(e) => {
                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    category:
                                      e.target.value,
                                  };
                                  setAccountItems(newItems);
                                }}
                                placeholder="Category"
                                className="min-w-[120px]"
                              />
                            </TableCell>

                            <TableCell>
                              {/* Description Input */}
                              <Input
                                value={item.description}
                                onChange={(e) => {
                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    description:
                                      e.target.value,
                                  };
                                  setAccountItems(newItems);
                                }}
                                placeholder="Description"
                                className="min-w-[150px]"
                              />
                            </TableCell>

                            <TableCell>
                              {/* Account Code Dropdown */}
                              <Select
                                value={item.accountCode}
                                onValueChange={(value) => {
                                  const selected =
                                    accountOptions.find(
                                      (opt) =>
                                        opt.code === value,
                                    );
                                  if (!selected) return;

                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    accountCode:
                                      selected.code,
                                    accountName:
                                      selected.name,
                                  };
                                  setAccountItems(newItems);
                                  setAccountCodeSearchTerms(
                                    {
                                      ...accountCodeSearchTerms,
                                      [index]: "",
                                    },
                                  );
                                }}
                              >
                                {/* Trigger hanya menampilkan Account Code */}
                                <SelectTrigger
                                  className="min-w-[140px] px-3 py-2"
                                  onMouseDown={(e) =>
                                    e.preventDefault()
                                  }
                                >
                                  <input
                                    type="text"
                                    value={
                                      accountCodeSearchTerms[
                                        index
                                      ] ||
                                      item.accountCode ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setAccountCodeSearchTerms(
                                        {
                                          ...accountCodeSearchTerms,
                                          [index]:
                                            e.target.value,
                                        },
                                      );
                                    }}
                                    onKeyDown={(e) =>
                                      e.stopPropagation()
                                    }
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onClick={(e) =>
                                      e.stopPropagation()
                                    }
                                    onFocus={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.select();
                                    }}
                                    placeholder="Search account code"
                                    className="w-full bg-transparent border-none outline-none text-sm"
                                    autoFocus={false}
                                  />
                                </SelectTrigger>

                                {/* Dropdown list dengan kolom search */}
                                <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                  {/* Search box di dalam dropdown */}
                                  <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                    <input
                                      type="text"
                                      placeholder="Search account code or name..."
                                      value={
                                        accountCodeSearchTerms[
                                          index
                                        ]
                                      }
                                      onChange={(e) =>
                                        setAccountCodeSearchTerms(
                                          {
                                            ...accountCodeSearchTerms,
                                            [index]:
                                              e.target
                                                .value,
                                          },
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                                    />
                                  </div>

                                  {/* Header */}
                                  <div className="grid grid-cols-[100px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                    <div>Account Code</div>
                                    <div>Account Name</div>
                                  </div>

                                  {/* Items (filtered) */}
                                  {accountOptions
                                    .filter(
                                      (opt) =>
                                        opt.code
                                          .toLowerCase()
                                          .includes(
                                            (
                                              accountCodeSearchTerms[
                                                index
                                              ] || ""
                                            ).toLowerCase(),
                                          ) ||
                                        opt.name
                                          .toLowerCase()
                                          .includes(
                                            (
                                              accountCodeSearchTerms[
                                                index
                                              ] || ""
                                            ).toLowerCase(),
                                          ),
                                    )
                                    .map((opt) => (
                                      <SelectItem
                                        key={opt.code}
                                        value={opt.code}
                                        className="!p-0"
                                      >
                                        <div className="grid grid-cols-[100px_auto] px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                          <div className="w-[100px]">
                                            {opt.code}
                                          </div>
                                          <div className="w-full whitespace-pre-wrap">
                                            {opt.name}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell>
                              {/* Account Name (auto-filled, read-only) */}
                              <Input
                                value={item.accountName}
                                readOnly
                                placeholder="Account Name"
                                className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                              />
                            </TableCell>

                            <TableCell>
                              {/* Dept Code Dropdown dengan search */}
                              <Select
                                open={
                                  openDeptCodeDropdown[
                                    index
                                  ] || false
                                }
                                onOpenChange={(open) =>
                                  setOpenDeptCodeDropdown({
                                    ...openDeptCodeDropdown,
                                    [index]: open,
                                  })
                                }
                                value={
                                  item.department || ""
                                }
                                onValueChange={(value) => {
                                  const selected =
                                    departmentOptions.find(
                                      (opt) =>
                                        opt.code === value,
                                    );
                                  if (!selected) return;

                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    department:
                                      selected.code,
                                    deptDescription:
                                      selected.name,
                                  };
                                  setAccountItems(newItems);
                                  setDepartmentCodeSearchTerms(
                                    {
                                      ...departmentCodeSearchTerms,
                                      [index]: "",
                                    },
                                  );
                                  setOpenDeptCodeDropdown({
                                    ...openDeptCodeDropdown,
                                    [index]: false,
                                  });
                                }}
                              >
                                {/* Trigger jadi kotak input */}
                                <SelectTrigger
                                  className="min-w-[140px]"
                                  onMouseDown={(e) =>
                                    e.preventDefault()
                                  }
                                >
                                  <div className="flex items-center w-full">
                                    <input
                                      type="text"
                                      value={
                                        item.department ||
                                        ""
                                      }
                                      placeholder="Select or search..."
                                      readOnly
                                      className="flex-1 bg-transparent border-none outline-none text-sm cursor-pointer"
                                    />
                                  </div>
                                </SelectTrigger>

                                <SelectContent
                                  className="w-[1000px] p-0 border border-gray-300 rounded-md overflow-hidden"
                                  onMouseDown={(e) =>
                                    e.preventDefault()
                                  }
                                >
                                  {/* Search box */}
                                  <div
                                    className="px-3 py-2 border-b border-gray-300 bg-white"
                                    onMouseDown={(e) =>
                                      e.preventDefault()
                                    }
                                  >
                                    <input
                                      type="text"
                                      placeholder="Search department code or name..."
                                      value={
                                        departmentCodeSearchTerms[
                                          index
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        setDepartmentCodeSearchTerms(
                                          {
                                            ...departmentCodeSearchTerms,
                                            [index]:
                                              e.target
                                                .value,
                                          },
                                        )
                                      }
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) =>
                                        e.stopPropagation()
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      autoFocus={true}
                                    />
                                  </div>

                                  {/* Header */}
                                  <div className="grid grid-cols-[120px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                    <div>Dept Code</div>
                                    <div>Dept Name</div>
                                  </div>

                                  {/* Filtered Items */}
                                  {departmentOptions
                                    .filter(
                                      (opt) =>
                                        opt.code
                                          .toLowerCase()
                                          .includes(
                                            (
                                              departmentCodeSearchTerms[
                                                index
                                              ] || ""
                                            ).toLowerCase(),
                                          ) ||
                                        opt.name
                                          .toLowerCase()
                                          .includes(
                                            (
                                              departmentCodeSearchTerms[
                                                index
                                              ] || ""
                                            ).toLowerCase(),
                                          ),
                                    )
                                    .map((opt) => (
                                      <SelectItem
                                        key={opt.code}
                                        value={opt.code}
                                        className="!p-0"
                                      >
                                        <div className="grid grid-cols-[120px_auto] px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                          <div className="w-[120px]">
                                            {opt.code}
                                          </div>
                                          <div className="w-full whitespace-pre-wrap">
                                            {opt.name}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell>
                              {/* Dept Name (read-only) */}
                              <Input
                                value={
                                  item.deptDescription || ""
                                }
                                readOnly
                                placeholder="Dept Name"
                                className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                              />
                            </TableCell>

                            <TableCell>
                              <Input
                                type="number"
                                value={item.qty}
                                onChange={(e) => {
                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[index].qty =
                                    Number(e.target.value);
                                  newItems[
                                    index
                                  ].totalAmount =
                                    newItems[index].qty *
                                    newItems[index]
                                      .unitPrice;
                                  setAccountItems(newItems);
                                }}
                                onFocus={(e) =>
                                  e.target.select()
                                }
                                placeholder="QTY"
                                className="min-w-[80px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={formatNumber(
                                  item.unitPrice,
                                )}
                                onChange={(e) => {
                                  const parsed = parseFloat(
                                    e.target.value
                                      .replace(/\./g, "")
                                      .replace(/,/g, "."),
                                  );
                                  const newItems = [
                                    ...accountItems,
                                  ];
                                  newItems[
                                    index
                                  ].unitPrice = isNaN(
                                    parsed,
                                  )
                                    ? 0
                                    : parsed;
                                  newItems[
                                    index
                                  ].totalAmount =
                                    newItems[index].qty *
                                    newItems[index]
                                      .unitPrice;
                                  setAccountItems(newItems);

                                  const formatted =
                                    formatNumber(
                                      newItems[index]
                                        .unitPrice,
                                    );
                                  const commaIndex =
                                    formatted.indexOf(",");
                                  if (commaIndex > -1) {
                                    requestAnimationFrame(
                                      () => {
                                        e.target.setSelectionRange(
                                          commaIndex,
                                          commaIndex,
                                        );
                                      },
                                    );
                                  }
                                }}
                                onFocus={(e) => {
                                  const val =
                                    e.target.value;
                                  const commaIndex =
                                    val.indexOf(",");
                                  if (commaIndex > -1) {
                                    e.target.setSelectionRange(
                                      0,
                                      commaIndex,
                                    );
                                  } else {
                                    e.target.select();
                                  }
                                }}
                                placeholder="Price"
                                className="min-w-[100px]"
                              />
                            </TableCell>

                            <TableCell>
                              <Input
                                type="text"
                                value={formatNumber(
                                  item.totalAmount,
                                )}
                                disabled
                                className="bg-gray-50 min-w-[120px]"
                              />
                            </TableCell>

                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAccountItems(
                                    accountItems.filter(
                                      (_, i) => i !== index,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Links Tab */}
                <TabsContent
                  value="links"
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const newDoc: LinkedDocument = {
                          id: Date.now().toString(),
                          documentType: "",
                          documentNo: "",
                          documentNoPO: "",
                          totalAmount: 0,
                        };
                        setLinkedDocs([
                          ...linkedDocs,
                          newDoc,
                        ]);

                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo(
                              {
                                top:
                                  mainDialogScrollRef
                                    .current.scrollHeight +
                                  500,
                                behavior: "smooth",
                              },
                            );
                          }
                        }, 100);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="flex w-full ">
                          <TableHead className="flex flex-1 items-center justify-start">
                            Document Type
                          </TableHead>
                          <TableHead className="flex flex-1 items-center justify-start">
                            Document No.
                          </TableHead>
                          <TableHead className="flex w-16 items-center justify-start"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {linkedDocs.map((doc, index) => (
                          <TableRow
                            key={doc.id}
                            className="flex w-full"
                          >
                            <TableCell className="flex-1">
                              <Select
                                disabled={isAutoPopulatedPIPO(index, doc)}
                                value={
                                  doc.documentType || ""
                                }
                                onValueChange={(value) => {
                                  if (!isAutoPopulatedPIPO(index, doc)) {
                                    const newDocs = [
                                      ...linkedDocs,
                                    ];

                                    // Map document type to label
                                    const typeToLabel: {
                                      [key: string]: string;
                                    } = {
                                      "PI/PO":
                                        "Purchase Invoice | Purchase Order",
                                      IC: "Import Cost",
                                      SR: "Shipment Request",
                                    };

                                    newDocs[
                                      index
                                    ].documentType = value;
                                    newDocs[
                                      index
                                    ].documentTypeLabel =
                                      typeToLabel[value];

                                    // Reset document numbers when type changes
                                    newDocs[
                                      index
                                    ].documentNo = "";
                                    newDocs[
                                      index
                                    ].documentNoPO = "";

                                    setLinkedDocs(newDocs);
                                  }
                                }}
                              >
                                <SelectTrigger className={`min-w-[200px] ${isAutoPopulatedPIPO(index, doc) ? 'bg-gray-100 cursor-not-allowed pointer-events-none' : ''}`}>
                                  <SelectValue placeholder="Select document type">
                                    {isAutoPopulatedPIPO(index, doc) ? (
                                      <span className="text-gray-500">{doc.documentTypeLabel || "Select document type"}</span>
                                    ) : (
                                      doc.documentTypeLabel || "Select document type"
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PI/PO">
                                    Purchase Invoice |
                                    Purchase Order
                                  </SelectItem>
                                  <SelectItem value="IC">
                                    Import Cost
                                  </SelectItem>
                                  <SelectItem value="SR">
                                    Shipment Request
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="flex-1">
                              {/* Show 2 boxes for PI/PO pair, 1 box for IC/SR */}
                              {doc.documentType ===
                                "PI/PO" && (
                                <>
                                  <div className="flex gap-2">
                                    {/* Purchase Invoice box */}
                                    <Select
                                      disabled={isAutoPopulatedPIPO(index, doc)}
                                      open={
                                        isAutoPopulatedPIPO(index, doc) ? false : (openLinkedDocDropdown[
                                          `${index}-PI`
                                        ] || false)
                                      }
                                      onOpenChange={(
                                        open,
                                      ) => {
                                        if (!isAutoPopulatedPIPO(index, doc)) {
                                          setOpenLinkedDocDropdown(
                                            {
                                              ...openLinkedDocDropdown,
                                              [`${index}-PI`]:
                                                open,
                                            },
                                          );
                                        }
                                      }
                                      }
                                      value={
                                        linkedDocs.find(
                                          (d) =>
                                            d.documentType ===
                                            "PI",
                                        )?.documentNo || ""
                                      }
                                      onValueChange={(
                                        value,
                                      ) => {
                                        const newDocs = [
                                          ...linkedDocs,
                                        ];

                                        // Look up the PI data to get matching PO
                                        const piData =
                                          mockpurchaseInvoice.find(
                                            (pi) =>
                                              pi.purchaseInvoiceNo ===
                                              value,
                                          );

                                        // Update the current PI/PO row with both PI and PO numbers
                                        newDocs[
                                          index
                                        ].documentNo =
                                          value;
                                        if (
                                          piData &&
                                          piData.noPO
                                        ) {
                                          newDocs[
                                            index
                                          ].documentNoPO =
                                            piData.noPO;
                                        }

                                        setLinkedDocs(
                                          newDocs,
                                        );
                                        setLinkedDocNoSearchTerms(
                                          {
                                            ...linkedDocNoSearchTerms,
                                            [`${index}-PI`]:
                                              "",
                                          },
                                        );
                                        setOpenLinkedDocDropdown(
                                          {
                                            ...openLinkedDocDropdown,
                                            [`${index}-PI`]: false,
                                          },
                                        );
                                      }}
                                    >
                                      <SelectTrigger className={`flex-1 px-3 py-2 border ${isAutoPopulatedPIPO(index, doc) ? 'border-gray-300 bg-gray-100 cursor-not-allowed pointer-events-none' : 'border-gray-300'}`}>
                                        <input
                                          type="text"
                                          placeholder="Purchase Invoice"
                                          value={
                                            doc.documentNo ||
                                            ""
                                          }
                                          readOnly
                                          disabled={isAutoPopulatedPIPO(index, doc)}
                                          className={`w-full bg-transparent border-none outline-none text-sm ${isAutoPopulatedPIPO(index, doc) ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                                        />
                                      </SelectTrigger>

                                      <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                        <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                          <input
                                            type="text"
                                            placeholder="Search..."
                                            value={
                                              linkedDocNoSearchTerms[
                                                `${index}-PI`
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              setLinkedDocNoSearchTerms(
                                                {
                                                  ...linkedDocNoSearchTerms,
                                                  [`${index}-PI`]:
                                                    e.target
                                                      .value,
                                                },
                                              )
                                            }
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        {mockpurchaseInvoice
                                          .filter((pi) => {
                                            // Check if already linked in current dialog
                                            const inCurrentDialog =
                                              linkedDocs.some(
                                                (d) =>
                                                  (d.documentNo ===
                                                    pi.purchaseInvoiceNo ||
                                                    d.documentNo ===
                                                      pi.noPO) &&
                                                  (d.documentType ===
                                                    "PI/PO" ||
                                                    !d.documentType),
                                              );

                                            // Check if already linked in saved AP Notes
                                            const inSavedAPNotes =
                                              apNoteData.some(
                                                (apNote) =>
                                                  apNote.linkedDocs &&
                                                  apNote.linkedDocs.some(
                                                    (doc) =>
                                                      doc.documentNo ===
                                                        pi.purchaseInvoiceNo ||
                                                      doc.documentNo ===
                                                        pi.noPO,
                                                  ),
                                              );

                                            const matchesSearch =
                                              (
                                                pi.purchaseInvoiceNo ||
                                                ""
                                              )
                                                .toLowerCase()
                                                .includes(
                                                  (
                                                    linkedDocNoSearchTerms[
                                                      `${index}-PI`
                                                    ] || ""
                                                  ).toLowerCase(),
                                                );

                                            return (
                                              !inCurrentDialog &&
                                              !inSavedAPNotes &&
                                              matchesSearch
                                            );
                                          })
                                          .map((pi) => (
                                            <SelectItem
                                              key={
                                                "pi-" +
                                                pi.id
                                              }
                                              value={
                                                pi.purchaseInvoiceNo
                                              }
                                              className="!p-0"
                                            >
                                              <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                {
                                                  pi.purchaseInvoiceNo
                                                }
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>

                                    {/* Purchase Order box */}
                                    <Select
                                      disabled={isAutoPopulatedPIPO(index, doc)}
                                      open={
                                        isAutoPopulatedPIPO(index, doc) ? false : (openLinkedDocDropdown[
                                          `${index}-PO`
                                        ] || false)
                                      }
                                      onOpenChange={(
                                        open,
                                      ) => {
                                        if (!isAutoPopulatedPIPO(index, doc)) {
                                          setOpenLinkedDocDropdown(
                                            {
                                              ...openLinkedDocDropdown,
                                              [`${index}-PO`]:
                                                open,
                                            },
                                          );
                                        }
                                      }
                                      }
                                      value={
                                        doc.documentNoPO ||
                                        ""
                                      }
                                      onValueChange={(
                                        value,
                                      ) => {
                                        const newDocs = [
                                          ...linkedDocs,
                                        ];

                                        // Look up which PI has this PO
                                        const relatedPI =
                                          mockpurchaseInvoice.find(
                                            (pi) =>
                                              pi.noPO ===
                                              value,
                                          );

                                        // Update the current PI/PO row with both PI and PO numbers
                                        newDocs[
                                          index
                                        ].documentNoPO =
                                          value;
                                        if (relatedPI) {
                                          newDocs[
                                            index
                                          ].documentNo =
                                            relatedPI.purchaseInvoiceNo;
                                        }

                                        setLinkedDocNoSearchTerms(
                                          {
                                            ...linkedDocNoSearchTerms,
                                            [`${index}-PO`]:
                                              "",
                                          },
                                        );
                                        setOpenLinkedDocDropdown(
                                          {
                                            ...openLinkedDocDropdown,
                                            [`${index}-PO`]: false,
                                          },
                                        );

                                        setLinkedDocs(
                                          newDocs,
                                        );
                                      }}
                                    >
                                      <SelectTrigger className={`flex-1 px-3 py-2 border ${isAutoPopulatedPIPO(index, doc) ? 'border-gray-300 bg-gray-100 cursor-not-allowed pointer-events-none' : 'border-gray-300'}`}>
                                        <input
                                          type="text"
                                          placeholder="Purchase Order"
                                          value={
                                            doc.documentNoPO ||
                                            ""
                                          }
                                          readOnly
                                          disabled={isAutoPopulatedPIPO(index, doc)}
                                          className={`w-full bg-transparent border-none outline-none text-sm ${isAutoPopulatedPIPO(index, doc) ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                                        />
                                      </SelectTrigger>

                                      <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                        <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                          <input
                                            type="text"
                                            placeholder="Search..."
                                            value={
                                              linkedDocNoSearchTerms[
                                                `${index}-PO`
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              setLinkedDocNoSearchTerms(
                                                {
                                                  ...linkedDocNoSearchTerms,
                                                  [`${index}-PO`]:
                                                    e.target
                                                      .value,
                                                },
                                              )
                                            }
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        {mockpurchaseInvoice
                                          .filter((pi) => {
                                            // Check if already linked in current dialog
                                            const isLinked =
                                              linkedDocs.some(
                                                (d) =>
                                                  (d.documentNoPO ===
                                                    pi.noPO ||
                                                    d.documentNo ===
                                                      pi.noPO) &&
                                                  (d.documentType ===
                                                    "PI/PO" ||
                                                    !d.documentType),
                                              );

                                            // Check if already linked in saved AP Notes
                                            const inSavedAPNotes =
                                              apNoteData.some(
                                                (apNote) =>
                                                  apNote.linkedDocs &&
                                                  apNote.linkedDocs.some(
                                                    (doc) =>
                                                      doc.documentNoPO ===
                                                        pi.noPO ||
                                                      doc.documentNo ===
                                                        pi.noPO,
                                                  ),
                                              );

                                            const matchesSearch =
                                              (
                                                pi.noPO ||
                                                ""
                                              )
                                                .toLowerCase()
                                                .includes(
                                                  (
                                                    linkedDocNoSearchTerms[
                                                      `${index}-PO`
                                                    ] || ""
                                                  ).toLowerCase(),
                                                );
                                            return (
                                              !isLinked &&
                                              !inSavedAPNotes &&
                                              matchesSearch
                                            );
                                          })
                                          .reduce(
                                            (acc, pi) => {
                                              if (
                                                !acc.find(
                                                  (p) =>
                                                    p.noPO ===
                                                    pi.noPO,
                                                )
                                              ) {
                                                acc.push(
                                                  pi,
                                                );
                                              }
                                              return acc;
                                            },
                                            [] as typeof mockpurchaseInvoice,
                                          )
                                          .map((pi) => (
                                            <SelectItem
                                              key={
                                                "po-" +
                                                pi.id
                                              }
                                              value={
                                                pi.noPO
                                              }
                                              className="!p-0"
                                            >
                                              <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                {pi.noPO}
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </>
                              )}

                              {(doc.documentType === "IC" ||
                                doc.documentType ===
                                  "SR") && (
                                <Select
                                  open={
                                    openLinkedDocDropdown[
                                      index
                                    ] || false
                                  }
                                  onOpenChange={(open) =>
                                    setOpenLinkedDocDropdown(
                                      {
                                        ...openLinkedDocDropdown,
                                        [index]: open,
                                      },
                                    )
                                  }
                                  value={doc.documentNo}
                                  onValueChange={(
                                    value,
                                  ) => {
                                    let selected: any;

                                    // Find selected based on documentType
                                    if (
                                      doc.documentType ===
                                      "IC"
                                    ) {
                                      selected =
                                        mockImportCostData.find(
                                          (ic) =>
                                            ic.icNo ===
                                            value,
                                        );
                                    } else if (
                                      doc.documentType ===
                                      "SR"
                                    ) {
                                      selected =
                                        mockShipmentRequestData.find(
                                          (sr) =>
                                            sr.srNum ===
                                            value,
                                        );
                                    }

                                    if (!selected) return;

                                    const newDocs = [
                                      ...linkedDocs,
                                    ];

                                    // Determine correct documentNo based on documentType
                                    let finalDocumentNo =
                                      "";
                                    if (
                                      doc.documentType ===
                                      "IC"
                                    ) {
                                      finalDocumentNo =
                                        selected.icNo;
                                    } else if (
                                      doc.documentType ===
                                      "SR"
                                    ) {
                                      finalDocumentNo =
                                        selected.srNum;
                                    }

                                    newDocs[index] = {
                                      ...newDocs[index],
                                      documentNo:
                                        finalDocumentNo,
                                      documentType:
                                        doc.documentType,
                                    };

                                    setLinkedDocs(newDocs);
                                    setLinkedDocNoSearchTerms(
                                      {
                                        ...linkedDocNoSearchTerms,
                                        [index]: "",
                                      },
                                    );
                                    setOpenLinkedDocDropdown(
                                      {
                                        ...openLinkedDocDropdown,
                                        [index]: false,
                                      },
                                    );
                                  }}
                                >
                                  {/* Trigger menampilkan Document Number */}
                                  <SelectTrigger className="min-w-[200px] px-3 py-2">
                                    <input
                                      type="text"
                                      placeholder="Select or search..."
                                      value={
                                        doc.documentNo || ""
                                      }
                                      readOnly
                                      className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
                                    />
                                  </SelectTrigger>

                                  {/* Dropdown list dengan kolom search */}
                                  <SelectContent
                                    className="p-0 border border-gray-300 rounded-md overflow-hidden"
                                    onMouseDown={(e) =>
                                      e.preventDefault()
                                    }
                                  >
                                    {/* Search box di dalam dropdown */}
                                    <div
                                      className="px-3 py-2 border-b border-gray-300 bg-white"
                                      onMouseDown={(e) =>
                                        e.preventDefault()
                                      }
                                    >
                                      <input
                                        type="text"
                                        placeholder="Search document no or type..."
                                        value={
                                          linkedDocNoSearchTerms[
                                            index
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          setLinkedDocNoSearchTerms(
                                            {
                                              ...linkedDocNoSearchTerms,
                                              [index]:
                                                e.target
                                                  .value,
                                            },
                                          )
                                        }
                                        onMouseDownCapture={(
                                          e,
                                        ) =>
                                          e.stopPropagation()
                                        }
                                        onKeyDownCapture={(
                                          e,
                                        ) =>
                                          e.stopPropagation()
                                        }
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        autoFocus={true}
                                      />
                                    </div>

                                    {/* Header */}
                                    <div className="px-3 py-2 border-b border-gray-300 bg-gray-100 text-xs font-semibold">
                                      Document No
                                    </div>

                                    {/* Items (filtered) - Display based on documentType */}
                                    {doc.documentType ===
                                      "IC" &&
                                      mockImportCostData
                                        .filter((ic) => {
                                          // Check if already linked in current dialog
                                          const inCurrentDialog =
                                            linkedDocs.some(
                                              (d) =>
                                                (d.documentNo ===
                                                  ic.icNo ||
                                                  d.documentNo ===
                                                    ic.id) &&
                                                (d.documentType ===
                                                  "IC" ||
                                                  !d.documentType),
                                            );

                                          // Check if already linked in saved AP Notes
                                          const inSavedAPNotes =
                                            apNoteData.some(
                                              (apNote) =>
                                                apNote.linkedDocs &&
                                                apNote.linkedDocs.some(
                                                  (
                                                    linkedDoc,
                                                  ) =>
                                                    linkedDoc.documentNo ===
                                                      ic.icNo ||
                                                    linkedDoc.documentNo ===
                                                      ic.id,
                                                ),
                                            );

                                          const matchesSearch =
                                            (ic.icNo || "")
                                              .toLowerCase()
                                              .includes(
                                                (
                                                  linkedDocNoSearchTerms[
                                                    index
                                                  ] || ""
                                                ).toLowerCase(),
                                              );

                                          return (
                                            !inCurrentDialog &&
                                            !inSavedAPNotes &&
                                            matchesSearch
                                          );
                                        })
                                        .map((ic) => (
                                          <SelectItem
                                            key={
                                              "ic-" + ic.id
                                            }
                                            value={ic.icNo}
                                            className="!p-0"
                                          >
                                            <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                              {ic.icNo}
                                            </div>
                                          </SelectItem>
                                        ))}
                                    {doc.documentType ===
                                      "SR" &&
                                      mockShipmentRequestData
                                        .filter((sr) => {
                                          // Check if already linked in current dialog
                                          const inCurrentDialog =
                                            linkedDocs.some(
                                              (d) =>
                                                (d.documentNo ===
                                                  sr.srNum ||
                                                  d.documentNo ===
                                                    sr.id) &&
                                                (d.documentType ===
                                                  "SR" ||
                                                  !d.documentType),
                                            );

                                          // Check if already linked in saved AP Notes
                                          const inSavedAPNotes =
                                            apNoteData.some(
                                              (apNote) =>
                                                apNote.linkedDocs &&
                                                apNote.linkedDocs.some(
                                                  (
                                                    linkedDoc,
                                                  ) =>
                                                    linkedDoc.documentNo ===
                                                      sr.srNum ||
                                                    linkedDoc.documentNo ===
                                                      sr.id,
                                                ),
                                            );

                                          const matchesSearch =
                                            (sr.srNum || "")
                                              .toLowerCase()
                                              .includes(
                                                (
                                                  linkedDocNoSearchTerms[
                                                    index
                                                  ] || ""
                                                ).toLowerCase(),
                                              );

                                          return (
                                            !inCurrentDialog &&
                                            !inSavedAPNotes &&
                                            matchesSearch
                                          );
                                        })
                                        .map((sr) => (
                                          <SelectItem
                                            key={
                                              "sr-" + sr.id
                                            }
                                            value={sr.srNum}
                                            className="!p-0"
                                          >
                                            <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                              {sr.srNum}
                                            </div>
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="w-16 text-center">
                              <div className="flex items-center justify-center h-full">
                                {!isAutoPopulatedPIPO(index, doc) && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setLinkedDocs(
                                        linkedDocs.filter(
                                          (_, i) => i !== index,
                                        ),
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                                {isAutoPopulatedPIPO(index, doc) && (
                                  <span className="text-xs text-gray-400 px-2 py-1">Auto-linked</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Total Display - Always Show */}
            <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-4 pb-4 space-y-4">
              {/* Input Grid for Discount, Tax, PPH */}
              <div className="grid grid-cols-3 gap-4">
                {/* Discount Input */}
                <div>
                  <Label className="text-sm font-bold">
                    Discount ({apNoteForm.currency || "IDR"}
                    )
                  </Label>
                  <Input
                    type="text"
                    value={formatNumber(
                      apNoteForm.discount || 0,
                    )}
                    onChange={(e) => {
                      const parsed = parseFloat(
                        e.target.value
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      );
                      let newDiscount = isNaN(parsed)
                        ? 0
                        : parsed;

                      const formatted =
                        formatNumber(newDiscount);
                      const integerPart =
                        formatted.split(",")[0];
                      if (integerPart.length > 13) {
                        return;
                      }

                      setApNoteForm({
                        ...apNoteForm,
                        discount: newDiscount,
                      });

                      const commaIndex =
                        formatted.indexOf(",");
                      if (commaIndex > -1) {
                        requestAnimationFrame(() => {
                          e.target.setSelectionRange(
                            commaIndex,
                            commaIndex,
                          );
                        });
                      }
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      const commaIndex = val.indexOf(",");
                      if (commaIndex > -1) {
                        e.target.setSelectionRange(
                          0,
                          commaIndex,
                        );
                      } else {
                        e.target.select();
                      }
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                {/* Tax Input */}
                <div>
                  <Label className="text-sm font-bold">
                    PPN ({apNoteForm.currency || "IDR"})
                  </Label>
                  <Input
                    type="text"
                    value={formatNumber(
                      apNoteForm.tax || 0,
                    )}
                    onChange={(e) => {
                      const parsed = parseFloat(
                        e.target.value
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      );
                      let newTax = isNaN(parsed)
                        ? 0
                        : parsed;

                      const formatted =
                        formatNumber(newTax);
                      const integerPart =
                        formatted.split(",")[0];
                      if (integerPart.length > 13) {
                        return;
                      }

                      setApNoteForm({
                        ...apNoteForm,
                        tax: newTax,
                      });

                      const commaIndex =
                        formatted.indexOf(",");
                      if (commaIndex > -1) {
                        requestAnimationFrame(() => {
                          e.target.setSelectionRange(
                            commaIndex,
                            commaIndex,
                          );
                        });
                      }
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      const commaIndex = val.indexOf(",");
                      if (commaIndex > -1) {
                        e.target.setSelectionRange(
                          0,
                          commaIndex,
                        );
                      } else {
                        e.target.select();
                      }
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                {/* PPH Input */}
                <div>
                  <Label className="text-sm font-bold">
                    PPH ({apNoteForm.currency || "IDR"})
                  </Label>
                  <Input
                    type="text"
                    value={formatNumber(
                      apNoteForm.pph || 0,
                    )}
                    onChange={(e) => {
                      const parsed = parseFloat(
                        e.target.value
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      );
                      let newPph = isNaN(parsed)
                        ? 0
                        : parsed;

                      const formatted =
                        formatNumber(newPph);
                      const integerPart =
                        formatted.split(",")[0];
                      if (integerPart.length > 13) {
                        return;
                      }

                      setApNoteForm({
                        ...apNoteForm,
                        pph: newPph,
                      });

                      const commaIndex =
                        formatted.indexOf(",");
                      if (commaIndex > -1) {
                        requestAnimationFrame(() => {
                          e.target.setSelectionRange(
                            commaIndex,
                            commaIndex,
                          );
                        });
                      }
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      const commaIndex = val.indexOf(",");
                      if (commaIndex > -1) {
                        e.target.setSelectionRange(
                          0,
                          commaIndex,
                        );
                      } else {
                        e.target.select();
                      }
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-stretch">
                {/* Remarks Section */}
                <div className="w-1/2 flex flex-col">
                  <Label>Remarks</Label>
                  <div className="flex-1">
                    <Textarea
                      value={apNoteForm.remarks}
                      onChange={(e) =>
                        setApNoteForm({
                          ...apNoteForm,
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Enter remarks"
                      className="flex-1 resize-none min-h-[152px] w-full"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Total Amount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Total Amount
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {apNoteForm.currency || "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {formatNumber(
                          accountItems.length > 0
                            ? accountItems.reduce(
                                (sum, item) =>
                                  sum + item.totalAmount,
                                0,
                              )
                            : linkedDocs.reduce(
                                (sum, doc) =>
                                  sum +
                                  (doc.totalAmount || 0),
                                0,
                              ),
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Discount
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {apNoteForm.currency || "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">
                        (
                      </span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(
                          Math.abs(
                            apNoteForm.discount || 0,
                          ),
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">
                        )
                      </span>
                    </div>

                    {/* Tax */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPN
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {apNoteForm.currency || "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(apNoteForm.tax || 0)}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* PPH */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPH
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {apNoteForm.currency || "IDR"}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">
                        (
                      </span>
                      <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                        {formatNumber(
                          Math.abs(apNoteForm.pph || 0),
                        )}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">
                        )
                      </span>
                    </div>

                    {/* Grand Total */}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-gray-700 text-sm flex-1 font-bold">
                          Grand Total
                        </span>
                        <span className="text-gray-700 text-sm w-12 text-center font-bold">
                          {apNoteForm.currency || "IDR"}
                        </span>
                        <span className="text-gray-700 text-sm w-4 text-right"></span>
                        <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                          {formatNumber(
                            (accountItems.length > 0
                              ? accountItems.reduce(
                                  (sum, item) =>
                                    sum + item.totalAmount,
                                  0,
                                )
                              : linkedDocs.reduce(
                                  (sum, doc) =>
                                    sum +
                                    (doc.totalAmount || 0),
                                  0,
                                )) -
                              (apNoteForm.discount || 0) +
                              (apNoteForm.tax || 0) -
                              (apNoteForm.pph || 0),
                          )}
                        </span>
                        <span className="text-gray-700 text-sm w-4 text-left"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {showAuditTrail && (
                  <Card className="p-4 border-purple-100">
                    <h4 className="text-purple-900 mb-3">
                      Audit Trail
                    </h4>
                    {auditTrail.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No audit trail entries yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {auditTrail.map((entry, idx) => (
                          <div
                            key={`audittrail-create-${entry.timestamp}-${idx}`}
                            className="flex items-center gap-3 text-sm border-l-2 border-purple-300 pl-3 py-1"
                          >
                            <Clock className="h-4 w-4 text-purple-600" />
                            <div className="flex-1">
                              <span className="text-gray-700">
                                {entry.action}
                              </span>
                              <span className="text-gray-500">
                                {" "}
                                by {entry.user}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {entry.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Submit Button - Always at bottom */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = getTodayYYYYMMDD()
                      .split("-")
                      .reverse()
                      .join("/");

                    const firstItem = accountItems[0];

                    setApNoteForm({
                      ...apNoteForm,
                      supplierName:
                        apNoteForm.supplierName ||
                        "PT. Supplier Test",
                      currency:
                        apNoteForm.currency || "IDR",
                      term: apNoteForm.term || "CREDIT",
                      companyName:
                        apNoteForm.companyName ||
                        "PT. Company",
                      documentReceivedDate:
                        apNoteForm.documentReceivedDate || today,
                      apNoteCreateDate:
                        apNoteForm.apNoteCreateDate ||
                        today,
                      invoiceNumber:
                        apNoteForm.invoiceNumber ||
                        `INV-${Date.now()}`,
                    });

                    if (accountItems.length === 0) {
                      setAccountItems([
                        {
                          id: "item-1",
                          category: "Material",
                          description: "Sample Material",
                          accountCode: "5101",
                          accountName: "Material Cost",
                          department: "PROD",
                          deptDescription: "Production",
                          qty: 10,
                          unitPrice: 100000,
                          totalAmount: 1000000,
                        },
                      ]);
                    } else {
                      const updatedItems = accountItems.map(
                        (item, idx) => ({
                          ...item,
                          category:
                            item.category || "Material",
                          accountCode:
                            item.accountCode || "5101",
                          accountName:
                            item.accountName ||
                            "Material Cost",
                          department:
                            item.department || "PROD",
                          deptDescription:
                            item.deptDescription ||
                            "Production",
                          qty: item.qty || 10,
                          unitPrice:
                            item.unitPrice || 100000,
                          totalAmount:
                            item.totalAmount ||
                            (item.qty || 10) *
                              (item.unitPrice || 100000),
                        }),
                      );
                      setAccountItems(updatedItems);
                    }

                    setIsSupplierSelected(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Auto Fill Items - temporary
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setAccountItems([]);
                      setLinkedDocs([]);
                      setAvailableDocsForSupplier([]);
                      setIsSupplierSelected(false);
                      setActiveCreateTabItems("items");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAPNote}
                    className={
                      selectedDocType === "AP DISC NOTE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }
                    disabled={
                      !apNoteForm.supplierName ||
                      !apNoteForm.invoiceNumber ||
                      !isSupplierSelected ||
                      (accountItems.length === 0 &&
                        linkedDocs.length === 0) ||
                      !isAccountItemsValid()
                    }
                  >
                    {selectedDocType === "AP DISC NOTE"
                      ? "Save AP DISC NOTE"
                      : "Save AP Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - AP Note Saved */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      >
        <DialogContent style={{ maxWidth: "500px", height: "650px" }} className="flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedDocType === "AP NOTE" ? "AP Note" : selectedDocType === "AP DISC NOTE" ? "AP Disc Note" : selectedDocType} Saved
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col items-center gap-4">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDocType === "AP NOTE" ? "AP Note" : selectedDocType === "AP DISC NOTE" ? "AP Disc Note" : selectedDocType} Saved
                </h2>
                <p className="text-gray-600">
                  Your {selectedDocType === "AP DISC NOTE" ? "AP Discount Note" : "AP Note"} has been created successfully
                </p>
              </div>

              {/* AP Note Number */}
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {selectedDocType === "AP DISC NOTE" ? "AP Discount Note" : "AP Note"} Number
                </p>
                <p className="text-lg font-mono font-bold text-blue-900">
                  {savedAPNoteNo}
                </p>
              </div>

              {/* Linked Documents Summary */}
              <div className="w-full space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Linked Documents:
                </h3>
                <div className="space-y-2">
                  {linkedDocs && linkedDocs.length > 0 ? (
                    linkedDocs.map((doc, idx) => {
                      // Handle PI/PO documents - show as two separate cards
                      if (doc.documentType === "PI/PO") {
                        return (
                          <div key={doc.id} className="space-y-2">
                            {/* Purchase Invoice Card */}
                            <div className="p-3 bg-white border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-blue-600 font-medium">
                                      Purchase Invoice
                                    </p>
                                    <p className="text-sm font-mono text-blue-900 truncate">
                                      {doc.documentNo || "-"}
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
                                  PI
                                </Badge>
                              </div>
                            </div>

                            {/* Purchase Order Card */}
                            {doc.documentNoPO && (
                              <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs text-indigo-600 font-medium">
                                        Purchase Order
                                      </p>
                                      <p className="text-sm font-mono text-indigo-900 truncate">
                                        {doc.documentNoPO}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 flex-shrink-0">
                                    PO
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Handle other document types (IC, SR)
                      let borderColor = "border-amber-200";
                      let textColor = "text-amber-600";
                      let docTypeColor = "text-amber-600";
                      let badgeClass = "bg-amber-100 text-amber-700 border-amber-200";
                      let badgeLabel = "IC";
                      let docTitle = "Import Cost";

                      if (doc.documentType === "SR") {
                        borderColor = "border-green-200";
                        textColor = "text-green-600";
                        docTypeColor = "text-green-600";
                        badgeClass = "bg-green-100 text-green-700 border-green-200";
                        badgeLabel = "SR";
                        docTitle = "Shipment Request";
                      }

                      return (
                        <div
                          key={doc.id}
                          className={`p-3 bg-white border ${borderColor} rounded-lg`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className={`w-4 h-4 ${textColor} flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-medium ${docTypeColor}`}>
                                  {docTitle}
                                </p>
                                <p className={`text-sm font-mono ${textColor} truncate`}>
                                  {doc.documentNo || "-"}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${badgeClass} border flex-shrink-0`}>
                              {badgeLabel}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No linked documents selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex gap-3">
           
            <Button
              onClick={handleViewAPNote}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              View {selectedDocType === "AP NOTE" ? "AP Note" : selectedDocType === "AP DISC NOTE" ? "AP Disc Note" : selectedDocType}
            </Button>
             <Button
              variant="outline"
              onClick={handleCloseSuccessDialog}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <Dialog
        open={showVoidDialog}
        onOpenChange={setShowVoidDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirm Void Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to void this invoice? This
              action will mark the invoice as voided.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowVoidDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsVoided(true);
                  setShowVoidDialog(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Yes, Void Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Cost Detail Dialog */}
      <Dialog
        open={showOtherCostDialog}
        onOpenChange={setShowOtherCostDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              Other Cost Detail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Supplier Name */}
            <div>
              <Label className="text-sm font-medium">Supplier Name</Label>
              <div className="text-gray-700 text-sm bg-gray-50 rounded px-3 py-2 mt-1">
                {invoice.supplierName}
              </div>
            </div>

            {/* Total Other Cost Summary - Always Visible */}
            {otherCosts.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-purple-900">Total Other Cost</span>
                  <span className="text-base font-bold text-purple-900">
                    {formatCurrency(
                      otherCosts.reduce((sum, cost) => sum + cost.costAmount, 0)
                    )}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {otherCosts.map((cost) => (
                    <div key={cost.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{cost.description}</span>
                      <span className="text-gray-700 font-semibold">{formatCurrency(cost.costAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Costs - Collapsible Card */}
            <div className="border border-purple-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandOtherCostsSection(!expandOtherCostsSection)}
                className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <span className="text-sm font-semibold text-purple-900">Other Costs (for Logistic View, pny kita gk bsa nampak ini nanti, supplier jg kita gk bole edit, mengikuti PO)</span>
                <motion.div
                  animate={{ rotate: expandOtherCostsSection ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                </motion.div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {expandOtherCostsSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-purple-200"
                  >
                    <div className="px-4 py-3 space-y-4">
                      {/* Other Costs Breakdown List */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Breakdown</Label>
                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                          {otherCosts.length === 0 ? (
                            <p className="text-gray-500 text-xs">No other costs added yet</p>
                          ) : (
                            otherCosts.map((cost, idx) => (
                              <div
                                key={cost.id}
                                className="bg-purple-50 border border-purple-200 rounded p-2.5"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1">
                                    <div className="text-xs font-semibold text-purple-900">
                                      {formatCurrency(cost.costAmount)}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {cost.description}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setOtherCosts(
                                        otherCosts.filter((c) => c.id !== cost.id)
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                    title="Delete"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Add New Other Cost */}
                      <div className="border-t pt-3 space-y-2.5">
                        <Label className="text-xs font-medium">Add New Other Cost</Label>
                        <div>
                          <Label className="text-xs text-gray-600">Cost Amount</Label>
                          <Input
                            type="number"
                            value={newOtherCost.costAmount}
                            onChange={(e) =>
                              setNewOtherCost({
                                ...newOtherCost,
                                costAmount: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="mt-1 text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Description</Label>
                          <Textarea
                            value={newOtherCost.description}
                            onChange={(e) =>
                              setNewOtherCost({
                                ...newOtherCost,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter description"
                            className="mt-1 resize-none min-h-[60px] text-sm"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (newOtherCost.costAmount > 0 || newOtherCost.description) {
                              setOtherCosts([
                                ...otherCosts,
                                {
                                  id: Date.now().toString(),
                                  costAmount: newOtherCost.costAmount,
                                  description: newOtherCost.description,
                                },
                              ]);
                              setNewOtherCost({ costAmount: 0, description: "" });
                            }
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-sm"
                        >
                          Add Other Cost
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOtherCostDialog(false)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Notification Dialog - Shows Activity Log with Countdown */}
      <Dialog
        open={showCheckNotifyDialog}
        onOpenChange={setShowCheckNotifyDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Notification Status
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm font-medium">
                Invoice Already Notified
              </p>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Invoice:</strong> {invoice.purchaseInvoiceNo}
              </p>
              <p className="text-xs text-blue-600">
                <strong>Supplier:</strong> {invoice.supplierName}
              </p>
            </div>

            {/* Activity Log Display */}
            {invoiceActivityLog && invoiceActivityLog.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-3">Notified Activity Log:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {invoiceActivityLog.map((log, idx) => (
                    <div key={idx} className="text-xs text-amber-800 pb-2 border-b border-amber-200 last:border-0">
                      
                      <p className="text-amber-700">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {remainingSeconds > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-yellow-700 font-medium mb-2">Re-Notify Available In:</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-700 font-mono">
                    {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:
                    {(remainingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
             
              <Button
                onClick={() => {
                  const now = new Date();
                  const timeString = now.toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: true
                  });
                  
                  setInvoiceActivityLog([
                    {
                      action: "Re-Notify Logistic - Check Purchase Invoice",
                      timestamp: timeString,
                      user: "System"
                    },
                    ...invoiceActivityLog
                  ]);
                  
                  setLastNotificationTime(now);
                  setCanReNotify(false);
                  setRemainingSeconds(600);
                  setShowCheckNotifyDialog(false);
                  console.log("[RE-NOTIFICATION] Logistic re-notified for invoice check:", invoice.purchaseInvoiceNo);
                }}
                disabled={remainingSeconds > 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {remainingSeconds > 0 ? "Re-Notify" : "Re-Notify"}
              </Button>
               <Button
                variant="outline"
                onClick={() => setShowCheckNotifyDialog(false)}
                className="flex-1 border-gray-300 text-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Sent Success Dialog */}
      <Dialog
        open={showNotificationSentDialog}
        onOpenChange={setShowNotificationSentDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Notification Sent
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm font-medium">
                Logistic has been notified
              </p>
              <p className="text-xs text-green-600 mt-2">
                <strong>Purchase Invoice:</strong> {invoice.purchaseInvoiceNo}
              </p>
              <p className="text-xs text-green-600">
                <strong>Purchase Order:</strong> {invoice.supplierName}
              </p>
              <p className="text-xs text-green-600 mt-2">
                The logistic team will check this purchase invoice.
              </p>
            </div>

            <Button
              onClick={() => setShowNotificationSentDialog(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
      >
        <DialogContent className="p-0 flex flex-col !gap-0 overflow-hidden" style={{ height: '900px', width: '600px', maxHeight: '90vh', maxWidth: '90vw' }}>
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Chat with Logistic Team
            </DialogTitle>
            <DialogDescription className="text-xs mt-2">
              {invoice.purchaseInvoiceNo} | {invoice.noPO}
            </DialogDescription>
          </DialogHeader>

          {/* Chat Messages Area - Fixed Height with Scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-3 bg-gray-50 min-h-0">
            {/* System Message - Notification Sent */}
            <div className="flex justify-center mb-2">
              <div className="bg-blue-50 px-3 py-1 rounded-full text-xs text-blue-600 border border-blue-200">
                📬 Notification sent on {invoiceActivityLog[0]?.timestamp || 'N/A'}
              </div>
            </div>

            {/* Chat Messages */}
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
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
                    <p className={`text-xs mt-1 ${msg.id.startsWith("user-") ? "text-purple-100" : "text-gray-500"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm text-center">
                  Start a conversation with the logistic team
                </p>
              </div>
            )}
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
                    setChatMessages([
                      ...chatMessages,
                      {
                        id: `user-${Date.now()}`,
                        text: chatInput,
                        timestamp,
                      },
                    ]);
                    setChatInput("");

                    // Simulate logistic team response
                    setTimeout(() => {
                      const responses = [
                        "Message received. We're processing this.",
                        "Thank you for the update. We'll check the invoice status.",
                        "Noted. We'll contact you shortly.",
                        "Got it. I'll follow up on this.",
                      ];
                      const randomResponse =
                        responses[Math.floor(Math.random() * responses.length)];
                      const responseTime = new Date().toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );
                      setChatMessages((prev) => [
                        ...prev,
                        {
                          id: `logistic-${Date.now()}`,
                          text: randomResponse,
                          timestamp: responseTime,
                        },
                      ]);
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
                    setChatMessages([
                      ...chatMessages,
                      {
                        id: `user-${Date.now()}`,
                        text: chatInput,
                        timestamp,
                      },
                    ]);
                    setChatInput("");

                    // Simulate logistic team response
                    setTimeout(() => {
                      const responses = [
                        "Message received. We're processing this.",
                        "Thank you for the update. We'll check the invoice status.",
                        "Noted. We'll contact you shortly.",
                        "Got it. I'll follow up on this.",
                      ];
                      const randomResponse =
                        responses[Math.floor(Math.random() * responses.length)];
                      const responseTime = new Date().toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );
                      setChatMessages((prev) => [
                        ...prev,
                        {
                          id: `logistic-${Date.now()}`,
                          text: randomResponse,
                          timestamp: responseTime,
                        },
                      ]);
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
                setChatMessages([]);
                setChatInput("");
              }}
              className="border-gray-300 text-gray-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Received Priority Notification Dialog */}
      <Dialog
        open={showReceivedNotifyDialog}
        onOpenChange={setShowReceivedNotifyDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Priority Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-orange-700 text-sm font-medium mb-2">
                Mark as Priority Submission
              </p>
              <p className="text-xs text-orange-600">
                Notify logistic that this purchase invoice is urgent and should be marked as priority for submission
              </p>
              <p className="text-xs text-orange-600 mt-2">
                <strong>Invoice:</strong> {invoice.purchaseInvoiceNo}
              </p>
              <p className="text-xs text-orange-600">
                <strong>Supplier:</strong> {invoice.supplierName}
              </p>
            </div>

            {/* Activity Log Display */}
            {invoiceActivityLog && invoiceActivityLog.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-3">Notified Activity Log:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {invoiceActivityLog.map((log, idx) => (
                    <div key={idx} className="text-xs text-amber-800 pb-2 border-b border-amber-200 last:border-0">
                      
                      <p className="text-amber-700">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {remainingSeconds > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-yellow-700 font-medium mb-2">Re-Notify Available In:</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-700 font-mono">
                    {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:
                    {(remainingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              
              <Button
                onClick={() => {
                  const now = new Date();
                  const timeString = now.toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: true
                  });
                  
                  setInvoiceActivityLog([
                    {
                      action: "Priority Notification - Urgent Submission Request",
                      timestamp: timeString,
                      user: "System"
                    },
                    ...invoiceActivityLog
                  ]);
                  
                  // Also update receivedNotificationTimestamps to show the notification icon
                  setReceivedNotificationTimestamps([...receivedNotificationTimestamps, timeString]);
                  
                  // Store document to notified list if receivedStatus is false (not yet received but being notified)
                  if (invoice.receivedStatus === false) {
                    try {
                      const storedNotifiedDocs = JSON.parse(localStorage.getItem("notifiedDocuments") || "[]");
                      
                      // Check if document already exists
                      const docExists = storedNotifiedDocs.some((doc: any) => doc.piNo === invoice.purchaseInvoiceNo);
                      
                      if (!docExists) {
                        const newNotifiedDoc = {
                          id: invoice.piId,
                          poNo: invoice.noPO || "-",
                          piNo: invoice.purchaseInvoiceNo || "-",
                          traceCode: invoice.warehouse || "-",
                          checkStatus: invoice.checkStatus,
                          receivedStatus: false, // Document Receipt: not yet received
                          isNotified: true, // But has been notified
                          status: "Pending",
                          piData: invoice,
                          source: "userStored",
                          storedAt: timeString,
                          statusType: "Document Receipt",
                          notificationTimestamp: Date.now(),
                        };
                        
                        storedNotifiedDocs.push(newNotifiedDoc);
                        localStorage.setItem("notifiedDocuments", JSON.stringify(storedNotifiedDocs));
                        console.log("✅ Document stored to Document Receipt list:", invoice.purchaseInvoiceNo);
                      }
                    } catch (error) {
                      console.error("Failed to store notified document:", error);
                    }
                  }
                  
                  setLastNotificationTime(now);
                  setCanReNotify(false);
                  setRemainingSeconds(600);
                  setShowReceivedNotifyDialog(false);
                  setShowReceivedNotificationSentDialog(true);
                  console.log("[NOTIFICATION] Logistic notified for priority submission:", invoice.purchaseInvoiceNo);
                }}
                disabled={remainingSeconds > 0}
                style={{ backgroundColor: '#EA580C', color: 'white' }}
                className="flex-1 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {remainingSeconds > 0 ? "Re-Notify" : "Notify"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReceivedNotifyDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Received Priority Notification Sent Dialog */}
      <Dialog
        open={showReceivedNotificationSentDialog}
        onOpenChange={setShowReceivedNotificationSentDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
              Priority Notification Sent
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-orange-700 text-sm font-medium mb-2">
                Logistic has been notified
              </p>
              <p className="text-xs text-orange-600">
                This invoice has been marked as urgent priority for submission
              </p>
              <p className="text-xs text-orange-600 mt-2">
                <strong>Invoice:</strong> {invoice.purchaseInvoiceNo}
              </p>
              <p className="text-xs text-orange-600 mb-4">
                <strong>Supplier:</strong> {invoice.supplierName}
              </p>

            {/* Activity Log Display */}
            {invoiceActivityLog && invoiceActivityLog.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-3">Notified Activity Log:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {invoiceActivityLog.map((log, idx) => (
                    <div key={idx} className="text-xs text-amber-800 pb-2 border-b border-amber-200 last:border-0">
                      
                      <p className="text-amber-700">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            <Button
              onClick={() => setShowReceivedNotificationSentDialog(false)}
              style={{ backgroundColor: '#EA580C', color: 'white' }}
              className="w-full hover:bg-orange-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog
        open={showImageGalleryDialog}
        onOpenChange={setShowImageGalleryDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Item Image Gallery - {selectedItemForImage?.itemCode}
            </DialogTitle>
          </DialogHeader>
   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Document Image */}
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <Eye className="w-8 h-8 text-white mb-2" />
                    <p className="text-white text-sm font-semibold text-center px-2">
                      View
                    </p>
                  </div>

                  {/* Document Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-semibold truncate">
                      {doc.name}
                    </p>
                    <p className="text-gray-200 text-xs">
                      {doc.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => {
                setShowNotifyDialog(true);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Notify
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImageGalleryDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
               <AlertCircle className="w-5 h-5" />
              Notify About Item
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Select a reason for notification
            </p>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <button
              onClick={() => setSelectedNotificationReason("re-confirm-item")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                selectedNotificationReason === "re-confirm-item"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className="font-semibold text-gray-900">Re-confirm Item</div>
             
            </button>

            <button
              onClick={() =>
                setSelectedNotificationReason("image-not-attached")
              }
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                selectedNotificationReason === "image-not-attached"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className="font-semibold text-gray-900">
                Item Image Has Not Been Attached
              </div>
             
            </button>

            <button
              onClick={() => setSelectedNotificationReason("image-not-clear")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                selectedNotificationReason === "image-not-clear"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className="font-semibold text-gray-900">Image Is Not Clear</div>
             
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNotifyDialog(false);
                setSelectedNotificationReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const now = new Date();
                const timeString = now.toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: true
                });
                
                // Store activity log entry
                const reasonText = selectedNotificationReason === "re-confirm-item" 
                  ? "Re-confirm Item" 
                  : selectedNotificationReason === "image-not-attached" 
                  ? "Image Not Attached" 
                  : "Image Not Clear";
                
                setInvoiceActivityLog([
                  {
                    action: `Notified to Logistic - ${reasonText} (Item: ${selectedItemForImage?.itemCode})`,
                    timestamp: timeString,
                    user: "System"
                  },
                  ...invoiceActivityLog
                ]);
                
                console.log("Notification sent:", {
                  item: selectedItemForImage,
                  reason: selectedNotificationReason,
                });
                setShowNotifyDialog(false);
                
                // Only show chat dialog if "re-confirm-item" is selected
                if (selectedNotificationReason === "re-confirm-item") {
                  setShowChatDialog(true);
                } else {
                  setShowNotifiedDialog(true);
                }
              }}
              disabled={!selectedNotificationReason}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notified Dialog */}
      <Dialog open={showNotifiedDialog} onOpenChange={setShowNotifiedDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
           
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Notified to Logistic
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Notification has been sent successfully
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Item Details:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-medium">Code:</span>
                  <span className="text-sm text-gray-800 font-semibold">{selectedItemForImage?.itemCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-medium">Name:</span>
                  <span className="text-sm text-gray-800 font-semibold">{selectedItemForImage?.itemName}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <span className="text-sm text-gray-600 font-medium">Reason:</span>
                  <p className="text-sm text-gray-800 font-semibold mt-1">
                    {selectedNotificationReason === "re-confirm-item" 
                      ? "Re-confirm Item" 
                      : selectedNotificationReason === "image-not-attached" 
                      ? "Image Not Attached" 
                      : "Image Not Clear"}
                  </p>
                </div>
              </div>
            </div>

            {(() => {
              const itemCode = selectedItemForImage?.itemCode;
              const relatedLogs = invoiceActivityLog.filter(log => 
                log.action.includes(`Item: ${itemCode}`)
              );
              
              return relatedLogs.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-3">Notified Activity Log:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {relatedLogs.map((log, idx) => (
                      <div key={idx} className="text-xs text-amber-800 pb-2 border-b border-amber-200 last:border-0">
                        
                        <p className="text-amber-700">{log.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Countdown Timer */}
            {remainingSeconds > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-yellow-700 font-medium mb-2">Re-Notify Available In:</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-700 font-mono">
                    {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:
                    {(remainingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {(() => {
              const itemCode = selectedItemForImage?.itemCode;
              const relatedLogs = invoiceActivityLog.filter(log => 
                log.action.includes(`Item: ${itemCode}`)
              );
              
              return (
                <>
                 
                  <Button
                    onClick={() => {
                      // Mark item as notified
                      if (selectedItemForImage?.itemCode) {
                        setNotifiedItems(prev => new Set([...prev, selectedItemForImage.itemCode]));
                      }
                      setShowNotifiedDialog(false);
                      setShowImageGalleryDialog(false);
                      setSelectedNotificationReason("");
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {relatedLogs.length > 0 ? "Re-Notify" : "Done"}
                  </Button>
                   <Button
                    variant="outline"
                    onClick={() => {
                      setShowNotifiedDialog(false);
                      setShowImageGalleryDialog(false);
                      setSelectedNotificationReason("");
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Attachment Dialog */}
      <Dialog open={showAttachmentUploadDialog} onOpenChange={setShowAttachmentUploadDialog}>
               <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Attachment
            </DialogTitle>
          </DialogHeader>
   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Document Image */}
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <Eye className="w-8 h-8 text-white mb-2" />
                    <p className="text-white text-sm font-semibold text-center px-2">
                      View
                    </p>
                  </div>

                  {/* Document Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-semibold truncate">
                      {doc.name}
                    </p>
                    <p className="text-gray-200 text-xs">
                      {doc.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => {
                setShowUploadAttachmentDialog(true);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Upload Attachment
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAttachmentUploadDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Attachment Dialog */}
      <Dialog open={showUploadAttachmentDialog} onOpenChange={setShowUploadAttachmentDialog}>
         <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <FileCheck className="w-6 h-6" />
              Upload Documents
            </DialogTitle>
            <DialogDescription>
              Upload soft copy documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50">
              <FileText className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ini nanti buat logistik upload dokumen seperti softcopy dokumen dll
              </p>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>

            {/* Supported Formats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Supported formats:</p>
              <p className="text-sm text-blue-800">
                PDF, PNG, JPG, JPEG, DOC, DOCX
              </p>
            </div>
          </div>

          <DialogFooter>
           
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
             <Button
              variant="outline"
              onClick={() => setShowUploadAttachmentDialog(false)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>

            {/* Warning Dialog for Fully Paid PO */}
            <Dialog
              open={showFullyPaidWarning}
              onOpenChange={setShowFullyPaidWarning}
            >
              <DialogContent style={{ maxWidth: "500px" }}>
                <DialogHeader>
                  <DialogTitle className="text-purple-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Information
                  </DialogTitle>
                  <DialogDescription className="py-2 text-gray-700">
                     This Purchase Invoice has already been fully paid.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowFullyPaidWarning(false);
                      setShowCreatePVRDialog(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                  >
                    OK
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Warning Dialog for PVR Linked */}
            <Dialog
              open={showPVRLinkedWarning}
              onOpenChange={setShowPVRLinkedWarning}
            >
              <DialogContent style={{ maxWidth: "500px" }}>
                <DialogHeader>
                  <DialogTitle className="text-purple-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Information
                  </DialogTitle>
                  <DialogDescription className="py-2 text-gray-700">
                    Expense note cannot be created because this Purchase Invoice is linked to a PVR.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowPVRLinkedWarning(false);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                  >
                    OK
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

      {/* Create New PVR Dialog */}
      <Dialog
        open={showCreatePVRDialog}
        onOpenChange={(open) => {
          setShowCreatePVRDialog(open);
          if (!open) {
            resetPVRForm();
            setLinkedPIs([]);
            setShowSupplierPVRDropdown(false);
            setSupplierSearchTermPVR("");
          }
        }}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Create New PVR
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new Payment
              Voucher Request
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              {/* Header Information Grid - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Supplier Name */}
                <div className="space-y-2 relative">
                  <div className="text-xs text-purple-600 mb-1">
                    Supplier Name{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Input
                    value={pvrForm.supplierName}
                    onChange={(e) => {
                      setPvrForm({
                        ...pvrForm,
                        supplierName: e.target.value,
                      });
                      setSupplierSearchTermPVR(e.target.value);
                    }}
                    onClick={() =>
                      setShowSupplierPVRDropdown(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSupplierPVRDropdown(false), 200)
                    }
                    placeholder="Type to search..."
                  />
                  {showSupplierPVRDropdown &&
                    filteredSuppliers.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredSuppliers.map((supplier) => (
                          <button
                            key={supplier.name}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSupplierPVRChange(
                                supplier.name,
                              );
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{supplier.name}</span>
                              <Badge
                                variant="outline"
                                className={
                                  supplier.category ===
                                  "OVERSEAS"
                                    ? "border-purple-200 text-purple-700"
                                    : "border-blue-200 text-blue-700"
                                }
                              >
                                {supplier.category}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </Card>
                    )}
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <div className="text-xs text-purple-600 mb-1">
                    Term <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={pvrForm.term}
                    onValueChange={(value: "Credit" | "Urgent") =>
                      setPvrForm({ ...pvrForm, term: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit">
                        Credit
                      </SelectItem>
                      <SelectItem value="Urgent">
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <div className="text-xs text-purple-600 mb-1">
                    Currency{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={pvrForm.currency}
                    onValueChange={(value: string) =>
                      setPvrForm({
                        ...pvrForm,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rate */}
                <div className="space-y-2">
                  <div className="text-xs text-purple-600 mb-1">
                    Rate
                  </div>
                  <Input
                    type="text"
                    value={formatNumber(pvrForm?.rate || 0)}
                    onChange={(e) => {
                      const parsed = parseFloat(
                        e.target.value
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      );
                      let newRate = isNaN(parsed) ? 0 : parsed;

                      const formatted = formatNumber(newRate);
                      const integerPart =
                        formatted.split(",")[0];
                      if (integerPart.length > 6) {
                        return;
                      }

                      setPvrForm({
                        ...pvrForm,
                        rate: newRate,
                      });

                      const commaIndex = formatted.indexOf(",");
                      if (commaIndex > -1) {
                        requestAnimationFrame(() => {
                          (
                            e.target as HTMLInputElement
                          ).setSelectionRange(
                            commaIndex,
                            commaIndex,
                          );
                        });
                      }
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      const commaIndex = val.indexOf(",");
                      if (commaIndex > -1) {
                        e.target.setSelectionRange(
                          0,
                          commaIndex,
                        );
                      } else {
                        e.target.select();
                      }
                    }}
                    placeholder="1,00"
                    className="mt-1"
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <div className="text-xs text-purple-600 mb-1">
                    Company{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={pvrForm.pt}
                    onValueChange={(value: "AMT" | "GMI" | "IMI" | "MJS" | "TTP" | "WNS" | "WSI") => {
                      const today = getTodayDate();
                      setPvrForm({
                        ...pvrForm,
                        pt: value,
                        pvrNo: generatePVRNumber(
                          value,
                          pvrForm.pvrDate || today,
                        ),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AMT">AMT</SelectItem>
                      <SelectItem value="GMI">GMI</SelectItem>
                      <SelectItem value="IMI">IMI</SelectItem>
                      <SelectItem value="MJS">MJS</SelectItem>
                      <SelectItem value="TTP">TTP</SelectItem>
                      <SelectItem value="WNS">WNS</SelectItem>
                      <SelectItem value="WSI">WSI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Header Information Grid - Row 2 */}
              <div
                className="grid gap-4 w-full"
                style={{
                  gridTemplateColumns: "10% 20% 10% 60%",
                }}
              >
                {/* PVR Date */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    PVR Date{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Popover
                    open={showCreateDatePicker}
                    onOpenChange={setShowCreateDatePicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {pvrForm.pvrDate || "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto p-4 space-y-3"
                    >
                      {/* Manual Date Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">
                          Ketik Tanggal (DD/MM/YYYY)
                        </label>
                        <Input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={pvrForm.pvrDate || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const filtered = value.replace(
                              /[^0-9/]/g,
                              "",
                            );
                            let formatted = filtered;
                            if (
                              filtered.length >= 2 &&
                              !filtered.includes("/")
                            ) {
                              formatted =
                                filtered.slice(0, 2) +
                                "/" +
                                filtered.slice(2);
                            }
                            if (
                              filtered.length >= 4 &&
                              filtered.split("/").length === 2
                            ) {
                              const parts =
                                formatted.split("/");
                              formatted =
                                parts[0] +
                                "/" +
                                parts[1].slice(0, 2) +
                                "/" +
                                parts[1].slice(2);
                            }
                            const newDate = formatted.slice(
                              0,
                              10,
                            );
                            setPvrForm({
                              ...pvrForm,
                              pvrDate: newDate,
                              pvrNo: generatePVRNumber(
                                pvrForm.pt,
                                newDate,
                              ),
                            });
                          }}
                          className="text-sm"
                        />
                      </div>

                      {/* Today Button */}
                      <Button
                        onClick={() => {
                          const today = getTodayDate();
                          setPvrForm({
                            ...pvrForm,
                            pvrDate: today,
                            pvrNo: generatePVRNumber(
                              pvrForm.pt,
                              today,
                            ),
                          });
                          setShowCreateDatePicker(false);
                        }}
                        variant="outline"
                        className="w-full text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      >
                        Today's Date
                      </Button>

                      {/* Calendar */}
                      <div className="border-t pt-3">
                        <CalendarComponent
                          mode="single"
                          selected={
                            pvrForm.pvrDate
                              ? (() => {
                                  const parts =
                                    pvrForm.pvrDate.split("/");
                                  if (
                                    parts.length === 3 &&
                                    parts[0].length === 2 &&
                                    parts[1].length === 2 &&
                                    parts[2].length === 4
                                  ) {
                                    return new Date(
                                      parseInt(parts[2]),
                                      parseInt(parts[1]) - 1,
                                      parseInt(parts[0]),
                                    );
                                  }
                                  return undefined;
                                })()
                              : undefined
                          }
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              const day = String(
                                date.getDate(),
                              ).padStart(2, "0");
                              const month = String(
                                date.getMonth() + 1,
                              ).padStart(2, "0");
                              const year = date.getFullYear();
                              const newDate = `${day}/${month}/${year}`;
                              setPvrForm({
                                ...pvrForm,
                                pvrDate: newDate,
                                pvrNo: generatePVRNumber(
                                  pvrForm.pt,
                                  newDate,
                                ),
                              });
                              setShowCreateDatePicker(false);
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Bank Account */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    Bank Account{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={pvrForm.bankAccount || ""}
                    onValueChange={(value: string) =>
                      setPvrForm({
                        ...pvrForm,
                        bankAccount: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KAS SEMENTARA">
                        KAS SEMENTARA
                      </SelectItem>
                      <SelectItem value="BCA-MJS-001">
                        BCA-MJS-001
                      </SelectItem>
                      <SelectItem value="MANDIRI-WNS-001">
                        MANDIRI-WNS-001
                      </SelectItem>
                      <SelectItem value="CIMB-WNS-001">
                        CIMB-WNS-001
                      </SelectItem>
                      <SelectItem value="BNI-AMT-001">
                        BNI-AMT-001
                      </SelectItem>
                      <SelectItem value="CIMB-GMI-001">
                        CIMB-GMI-001
                      </SelectItem>
                      <SelectItem value="BCA-WSI-001">
                        BCA-WSI-001
                      </SelectItem>
                      <SelectItem value="MANDIRI-TTP-001">
                        MANDIRI-TTP-001
                      </SelectItem>
                      <SelectItem value="BNI-IMI-001">
                        BNI-IMI-001
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    Payment Method{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={pvrForm.paymentMethod}
                    onValueChange={(value: "Transfer" | "Cash") =>
                      setPvrForm({
                        ...pvrForm,
                        paymentMethod: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transfer">
                        Transfer
                      </SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    Reference
                  </div>
                  <Input
                    value={pvrForm.reference || ""}
                    onChange={(e) =>
                      setPvrForm({
                        ...pvrForm,
                        reference: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Payable Items Table */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-purple-900">
                    Payable Items
                  </h3>
                  <Button
                    onClick={() => setShowAddLinksDialog(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3 flex items-center gap-1"
                    disabled={!pvrForm.supplierName}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Documents

                  </Button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-purple-50 sticky top-0 z-10">
                      <tr className="h-12">
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Doc Type
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "25%" }}
                        >
                          Doc No
                        </th>
                   
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Item Total
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Amount Paid
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Discount
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Outstanding
                        </th>
                        <th
                          className="text-purple-900 text-xs text-center px-4 py-2 font-medium border-b"
                          style={{ width: "15%" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedPIs
                        .filter((pi) => pi.documentType !== "PO")
                        .map((pi, idx) => {
                        const docType = pi.documentType || "PI";
                        const getDocTypeLabel = (type: string) => {
                          switch (type) {
                            case "PI":
                              return "Purchase Invoice";
                            case "IC":
                              return "Import Cost";
                            case "SR":
                              return "Shipment Request";
                            case "EN":
                              return "AP Note";
                            default:
                              return type;
                          }
                        };

                        return (
                          <tr
                            key={`${pi.id}-${tableRefreshTrigger}`}
                            className="border-b hover:bg-purple-50"
                          >
                            <td className="px-4 py-3 text-sm">
                              {getDocTypeLabel(docType)}
                            </td>
                            <td className="px-4 py-3 text-sm truncate">
                              {getDocumentNumber(pi)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatNumber(pi.totalAmount)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editingAmountPaidId === pi.id ? (
                                <div className="flex gap-1 items-center min-w-0">
                                  <input
                                    type="text"
                                    placeholder="0,00"
                                    value={formatNumber(
                                      parseFloat(
                                        editingAmountPaidValue
                                          .replace(/\./g, "")
                                          .replace(/,/g, "."),
                                      ) || 0,
                                    )}
                                    onChange={(e) => {
                                      const parsed = parseFloat(
                                        e.target.value
                                          .replace(/\./g, "")
                                          .replace(/,/g, "."  ),
                                      );
                                      let newValue = isNaN(parsed)
                                        ? 0
                                        : parsed;

                                      const formatted =
                                        formatNumber(newValue);
                                      const integerPart =
                                        formatted.split(",")[0];
                                      if (integerPart.length > 13) {
                                        return;
                                      }

                                      setEditingAmountPaidValue(formatted);

                                      const commaIndex =
                                        formatted.indexOf(",");
                                      if (commaIndex > -1) {
                                        requestAnimationFrame(() => {
                                          (e.target as HTMLInputElement).setSelectionRange(
                                            commaIndex,
                                            commaIndex,
                                          );
                                        });
                                      }
                                    }}
                                    onFocus={(e) => {
                                      const val = e.target.value;
                                      const commaIndex = val.indexOf(",");
                                      if (commaIndex > -1) {
                                        e.target.setSelectionRange(
                                          0,
                                          commaIndex,
                                        );
                                      } else {
                                        e.target.select();
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingAmountPaidId(null);
                                        setEditingAmountPaidValue('');
                                        setTableRefreshTrigger(prev => prev + 1);
                                      } else if (e.key === 'Escape') {
                                        setEditingAmountPaidId(null);
                                        setEditingAmountPaidValue('');
                                      }
                                    }}
                                    className="flex-1 min-w-0 h-8 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    autoFocus
                                  />
                                  <Button
                                    onClick={() => {
                                      setEditingAmountPaidId(null);
                                      setEditingAmountPaidValue('');
                                      setTableRefreshTrigger(prev => prev + 1);
                                    }}
                                    size="sm"
                                    className="flex-shrink-0 bg-green-600 hover:bg-green-700 h-8 px-2"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    let currentValue = formatNumber(pi.totalAmount);
                                    setEditingAmountPaidId(pi.id);
                                    setEditingAmountPaidValue(currentValue);
                                  }}
                                  className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                  title="Click to edit"
                                >
                                  {formatNumber(pi.totalAmount)}
                                  <Edit className="w-3 h-3 flex-shrink-0" />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editingDiscountId === pi.id ? (
                                <div className="flex gap-1 items-center min-w-0">
                                  <input
                                    type="text"
                                    placeholder="0,00"
                                    value={formatNumber(
                                      parseFloat(
                                        editingDiscountValue
                                          .replace(/\./g, "")
                                          .replace(/,/g, "."),
                                      ) || 0,
                                    )}
                                    onChange={(e) => {
                                      const parsed = parseFloat(
                                        e.target.value
                                          .replace(/\./g, "")
                                          .replace(/,/g, "."),
                                      );
                                      let newValue = isNaN(parsed)
                                        ? 0
                                        : parsed;

                                      const formatted =
                                        formatNumber(newValue);
                                      const integerPart =
                                        formatted.split(",")[0];
                                      if (integerPart.length > 13) {
                                        return;
                                      }

                                      setEditingDiscountValue(formatted);

                                      const commaIndex =
                                        formatted.indexOf(",");
                                      if (commaIndex > -1) {
                                        requestAnimationFrame(() => {
                                          (e.target as HTMLInputElement).setSelectionRange(
                                            commaIndex,
                                            commaIndex,
                                          );
                                        });
                                      }
                                    }}
                                    onFocus={(e) => {
                                      const val = e.target.value;
                                      const commaIndex = val.indexOf(",");
                                      if (commaIndex > -1) {
                                        e.target.setSelectionRange(
                                          0,
                                          commaIndex,
                                        );
                                      } else {
                                        e.target.select();
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingDiscountId(null);
                                        setEditingDiscountValue('');
                                        setTableRefreshTrigger(prev => prev + 1);
                                      } else if (e.key === 'Escape') {
                                        setEditingDiscountId(null);
                                        setEditingDiscountValue('');
                                      }
                                    }}
                                    className="flex-1 min-w-0 h-8 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    autoFocus
                                  />
                                  <Button
                                    onClick={() => {
                                      setEditingDiscountId(null);
                                      setEditingDiscountValue('');
                                      setTableRefreshTrigger(prev => prev + 1);
                                    }}
                                    size="sm"
                                    className="flex-shrink-0 bg-green-600 hover:bg-green-700 h-8 px-2"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    let currentValue = '0';
                                    setEditingDiscountId(pi.id);
                                    setEditingDiscountValue(currentValue);
                                  }}
                                  className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                  title="Click to edit"
                                >
                                  {formatNumber(0)}
                                  <Edit className="w-3 h-3 flex-shrink-0" />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {(() => {
                                let itemTotal = pi.totalAmount;
                                let amountPaid = itemTotal;
                                const outstanding = itemTotal - amountPaid;
                                if (outstanding > 0) {
                                  return formatNumber(outstanding);
                                } else {
                                  return formatNumber(0);
                                }
                              })()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  setLinkedPIs(
                                    linkedPIs.filter(
                                      (item) =>
                                        item.id !== pi.id,
                                    ),
                                  );
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors inline-flex"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {linkedPIs.filter((pi) => pi.documentType !== "PO").length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No payable items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-4 pb-4 space-y-4">
              {/* Remarks and Financial Summary */}
              <div className="flex gap-4 items-stretch">
                {/* Remarks Section */}
                <div className="w-1/2 flex flex-col">
                  <Label>Remarks</Label>
                  <div className="flex-1">
                    <Textarea
                      value={pvrForm.remarks || ""}
                      onChange={(e) =>
                        setPvrForm({
                          ...pvrForm,
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Enter remarks..."
                      className="flex-1 resize-none" style={{minHeight:'190px'}}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Total Amount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Total Amount
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {pvrForm.currency}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(() => {
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalAmountPaid += pi.totalAmount;
                            }
                          });
                          return formatNumber(totalAmountPaid);
                        })()}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Discount
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {pvrForm.currency}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {formatNumber(0)}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                   

                    {/* PPN (VAT) */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPN 
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {pvrForm.currency}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {formatNumber(0)}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* PPH (Income Tax) */}
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        PPH
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        {pvrForm.currency}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {formatNumber(0)}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>

                    {/* Grand Total */}
                    <div className="flex items-center border-t border-purple-200 pt-2">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Grand Total
                      </span>
                      <span className="text-gray-900 text-sm w-12 text-center font-bold">
                        {pvrForm.currency}
                      </span>
                      <span className="text-gray-900 text-sm w-4 text-right"></span>
                      <span className="text-gray-900 text-sm w-[114px] text-right font-bold">
                        {(() => {
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalAmountPaid += pi.totalAmount;
                            }
                          });
                          const grandTotal = totalAmountPaid;
                          return formatNumber(grandTotal);
                        })()}
                      </span>
                      <span className="text-gray-900 text-sm w-4 text-left"></span>
                    </div>

                    {/* Total in IDR */}
                    <div className="flex items-center border-t border-purple-200 pt-2">
                      <span className="text-gray-700 text-sm flex-1 font-bold">
                        Grand Total (IDR)
                      </span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">
                        IDR
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(() => {
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalAmountPaid += pi.totalAmount;
                            }
                          });
                          const grandTotal = totalAmountPaid;

                          const rate = pvrForm.rate;
                          const finalTotal =
                            rate && rate > 0
                              ? grandTotal *
                                parseFloat(
                                  String(rate).replace(
                                    /,/g,
                                    ".",
                                  ),
                                )
                              : grandTotal;

                          return formatNumber(finalTotal);
                        })()}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-3 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreatePVRDialog(false);
                    resetPVRForm();
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePVR}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                  disabled={!pvrForm.supplierName || linkedPIs.length === 0}
                >
                  Save PVR
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - PVR Created */}
      <Dialog
        open={showPVRSuccessDialog}
        onOpenChange={setShowPVRSuccessDialog}
      >
        <DialogContent className="w-[550px] max-w-full mx-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              PVR Saved
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">
                PVR No
              </div>
              <div className="text-lg font-semibold text-purple-900">
                {savedPvrNo}
              </div>
            </div>

            {/* Linked Documents Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Linked Documents
                </span>
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-700 border-purple-200"
                >
                  {savedPvrLinkedDocs.length}
                </Badge>
              </div>
              {savedPvrLinkedDocs.length > 0 && (
                <div
                  className="space-y-3"
                  style={{ width: "500px", maxHeight: "300px", overflowY: "auto" }}
                >
                  {savedPvrLinkedDocs.map((doc) => {
                    const docType = doc.documentType || "";
                    let borderColor = "border-blue-200";
                    let textColor = "text-blue-700";
                    let badgeColor = "bg-blue-100 text-blue-700 border-blue-200";
                    let badgeLabel = "PI";

                    if (docType === "PO") {
                      borderColor = "border-indigo-200";
                      textColor = "text-indigo-700";
                      badgeColor = "bg-indigo-100 text-indigo-700 border-indigo-200";
                      badgeLabel = "PO";
                    } else if (docType === "IC") {
                      borderColor = "border-amber-200";
                      textColor = "text-amber-700";
                      badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
                      badgeLabel = "IC";
                    } else if (docType === "SR") {
                      borderColor = "border-green-200";
                      textColor = "text-green-700";
                      badgeColor = "bg-green-100 text-green-700 border-green-200";
                      badgeLabel = "SR";
                    } else if (docType === "EN") {
                      borderColor = "border-pink-200";
                      textColor = "text-pink-700";
                      badgeColor = "bg-pink-100 text-pink-700 border-pink-200";
                      badgeLabel = "EN";
                    }

                    return (
                      <div
                        key={`${docType}-${doc.piNo}-${doc.id}`}
                        className={`p-4 bg-white border ${borderColor} rounded-lg hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5" />
                            <div>
                              <p className={`${textColor} font-medium`}>
                                {doc.piNo || doc.invoiceNo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {doc.documentType === "PI" && "Purchase Invoice"}
                                {doc.documentType === "PO" && "Purchase Order"}
                                {doc.documentType === "IC" && "Import Cost"}
                                {doc.documentType === "SR" && "Shipment Request"}
                                {doc.documentType === "EN" && "Expense Note"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={badgeColor}
                          >
                            {badgeLabel}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowPVRSuccessDialog(false);
                  // Trigger down payment refresh by touching localStorage
                  const pvrDataStr = localStorage.getItem("pvrData");
                  window.dispatchEvent(new StorageEvent("storage", { 
                    key: "pvrData",
                    newValue: pvrDataStr
                  }));
                  // Show the newly created PVR in linked documents dialog
                  setTimeout(() => {
                    setLinkedDocsRefresh((prev: number) => prev + 1);
                    setShowLinkedDocsDialog(true);
                  }, 100);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Document in create new Dialog */}
      <Dialog
        open={showAddLinksDialog}
        onOpenChange={setShowAddLinksDialog}
      >
        <DialogContent className="w-full max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Add Document
            </DialogTitle>
            <DialogDescription>
              Select documents to add to the payable items.
            </DialogDescription>
          </DialogHeader>
          {/* Search Box */}
          <div className="px-4 pb-3 border-b border-gray-200 flex-shrink-0">
            <Input
              type="text"
              placeholder="🔍 Search by document number..."
              value={addLinksSearchTerm}
              onChange={(e) => setAddLinksSearchTerm(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          {/* Sticky Header */}
          <div className="flex-shrink-0 bg-gray-50 border-b border-gray-300 px-4 py-0 flex items-center sticky top-0 z-10 h-16">
            <div className="px-2 py-0 flex items-center border-r border-gray-200 min-w-[60px] h-full">
              <span className="text-xs font-semibold text-gray-600">Select</span>
            </div>
            <div className="flex-1 px-3 py-0 border-r border-gray-200 min-w-[300px] flex items-center h-full">
              <span className="text-xs font-semibold text-gray-600">Purchase Order</span>
            </div>
            <div className="flex-1 px-3 py-0 border-r border-gray-200 min-w-[300px] flex items-center h-full">
              <span className="text-xs font-semibold text-gray-600">Purchase Invoice</span>
            </div>
            <div className="flex-1 px-3 py-0 border-r border-gray-200 min-w-[300px] flex items-center h-full">
              <span className="text-xs font-semibold text-gray-600">Expense Note</span>
            </div>
            <div className="flex-1 px-3 py-0 min-w-[300px] flex items-center h-full">
              <span className="text-xs font-semibold text-gray-600">Purchase Return</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-3">
            {(() => {
              // Collect all linked document IDs from existing PVRs
              const linkedDocIds = new Set<string>();
              pvrData.forEach((pvr) => {
                pvr.linkedDocs?.forEach((doc) => {
                  linkedDocIds.add(`${doc.documentType}-${doc.piNo}`);
                });
              });

              // Also add documents already in linkedPIs (for create mode)
              linkedPIs.forEach((doc) => {
                linkedDocIds.add(`${doc.documentType}-${doc.piNo}`);
              });

              // Filter unlinked documents and search by document number
              const searchLower = addLinksSearchTerm.toLowerCase();
              
              // First, find ENs matching search
              const searchedENs = mockExpenseNote.filter(
                (en) => en.apNoteNo.toLowerCase().includes(searchLower),
              );
              
              // Find main documents (PI/IC/SR) that are linked to searched ENs
              const mainDocsLinkedToSearchedENs = new Set<string>();
              searchedENs.forEach((en) => {
                if (en.linkedDocs) {
                  const linkedDocArray = Array.isArray(en.linkedDocs)
                    ? en.linkedDocs
                    : [en.linkedDocs];
                  linkedDocArray.forEach((linkedDoc: any) => {
                    if (linkedDoc.type === "Purchase Invoice") {
                      mockpurchaseInvoice.forEach((pi) => {
                        if (pi.purchaseInvoiceNo === linkedDoc.docNo) {
                          mainDocsLinkedToSearchedENs.add(`PI-${pi.purchaseInvoiceNo}`);
                        }
                      });
                    } else if (linkedDoc.type === "Import Cost") {
                      mockImportCosts.forEach((ic) => {
                        if (ic.icNum === linkedDoc.docNo) {
                          mainDocsLinkedToSearchedENs.add(`IC-${ic.icNum}`);
                        }
                      });
                    } else if (linkedDoc.type === "Shipment Request") {
                      mockShipmentRequest.forEach((sr) => {
                        if (sr.srNum === linkedDoc.docNo) {
                          mainDocsLinkedToSearchedENs.add(`SR-${sr.srNum}`);
                        }
                      });
                    }
                  });
                }
              });
              
              const unlinkedPIs = mockpurchaseInvoice.filter(
                (pi) =>
                  !linkedDocIds.has(
                    `PI-${pi.purchaseInvoiceNo}`,
                  ) && (pi.purchaseInvoiceNo.toLowerCase().includes(searchLower) || mainDocsLinkedToSearchedENs.has(`PI-${pi.purchaseInvoiceNo}`)),
              );
              const unlinkedICs = mockImportCosts.filter(
                (ic) =>
                  !linkedDocIds.has(
                    `IC-${ic.icNum}`,
                  ) && (ic.icNum.toLowerCase().includes(searchLower) || mainDocsLinkedToSearchedENs.has(`IC-${ic.icNum}`)),
              );
              const unlinkedSRs = mockShipmentRequest.filter(
                (sr) =>
                  !linkedDocIds.has(
                    `SR-${sr.srNum}`,
                  ) && (sr.srNum.toLowerCase().includes(searchLower) || mainDocsLinkedToSearchedENs.has(`SR-${sr.srNum}`)),
              );
              const unlinkedENs = mockExpenseNote.filter(
                (en) =>
                  !linkedDocIds.has(`EN-${en.apNoteNo}`) && en.apNoteNo.toLowerCase().includes(searchLower),
              );

              // Helper to render document card with grouped linked expense notes
              const renderDocumentCard = (
                doc: any,
                docType: string,
              ) => {
                const docNo =
                  docType === "PI"
                    ? doc.purchaseInvoiceNo
                    : docType === "IC"
                      ? doc.icNum
                      : docType === "SR"
                        ? doc.srNum
                        : doc.apNoteNo;

                const amount =
                  docType === "PI"
                    ? doc.totalAmount
                    : docType === "IC"
                      ? doc.totalImportCost
                      : docType === "SR"
                        ? doc.totalShipmentRequest
                        : doc.totalInvoice;

                // Find related purchase orders for PI, IC, and SR documents
                const poIdToMatch = docType === "PI"
                  ? doc.poId
                  : docType === "IC"
                    ? doc.poNo || (mockImportCosts.find(ic => ic.icNum === doc.icNum)?.poNo)
                    : docType === "SR"
                      ? doc.poNo || (mockShipmentRequest.find(sr => sr.srNum === doc.srNum)?.poNo)
                      : null;
                
                const relatedPOs = poIdToMatch
                  ? mockPurchaseOrder.filter(
                      (po) => docType === "PI"
                        ? po.poId === poIdToMatch
                        : po.purchaseOrderNo === poIdToMatch,
                    )
                  : [];

                // Find related expense notes based on linkedDocs matching
                const relatedENs = mockExpenseNote.filter(
                  (en) => {
                    if (!en.linkedDocs) return false;
                    const linkedDocArray = Array.isArray(
                      en.linkedDocs,
                    )
                      ? en.linkedDocs
                      : [en.linkedDocs];

                    const docTypeMap: {
                      [key: string]: string;
                    } = {
                      PI: "Purchase Invoice",
                      IC: "Import Cost",
                      SR: "Shipment Request",
                    };

                    return linkedDocArray.some(
                      (linkedDoc: any) =>
                        linkedDoc.type ===
                          docTypeMap[docType] &&
                        linkedDoc.docNo === docNo,
                    );
                  },
                );

                return (
                   <div
                    key={`${docType}-${docNo}`}
                    className="rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex h-16"
                  >
                    <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full">
                      <input
                        type="checkbox"
                        className="cursor-pointer w-4 h-4 flex-shrink-0"
                        onChange={(e) => {
                          const docId = `${docType}-${docNo}`;
                          const newSelected = new Set(selectedDocuments);

                          if (e.target.checked) {
                            newSelected.add(docId);
                            // Auto-select linked AP Notes
                            relatedENs.forEach((en) => {
                              newSelected.add(`EN-${en.apNoteNo}`);
                            });
                          } else {
                            newSelected.delete(docId);
                            // Auto-deselect linked AP Notes
                            relatedENs.forEach((en) => {
                              newSelected.delete(`EN-${en.apNoteNo}`);
                            });
                          }
                          setSelectedDocuments(newSelected);
                        }}
                      />
                    </div>
                    
                    {/* Related Purchase Order - Far Left Side */}
                    {relatedPOs.length > 0 && (
                      <div className="flex-1 px-3 overflow-hidden min-w-[300px] border-r border-gray-200 flex items-center gap-2 h-full">
                        {relatedPOs.map((po) => (
                          <div
                            key={`PO-${po.purchaseOrderNo}`}
                            className="flex flex-col gap-0.5 text-xs min-w-0 flex-1"
                          >
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {po.purchaseOrderNo}
                            </span>
                            <span className="text-gray-500 truncate whitespace-nowrap">
                              Total: {formatNumber(po.totalAmount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex-shrink-0">
                          {relatedPOs[0]?.deliveryType && (
                            <Badge className="bg-blue-100 text-blue-700 border border-blue-300 text-[10px] whitespace-nowrap">
                              {relatedPOs[0].deliveryType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty state if no POs */}
                    {relatedPOs.length === 0 && (docType === "PI" || docType === "IC" || docType === "SR") && (
                      <div className="flex-1 px-3 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200 min-w-[300px] h-full">
                        No linked PO
                      </div>
                    )}

                    {/* Main Document - Left-Middle Side */}
                    <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5 text-xs min-w-0">
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {docNo}
                            </span>
                            
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 truncate whitespace-nowrap">
                            Total: {formatNumber(amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Expense Notes - Middle-Right Side */}
                    {relatedENs.length > 0 && (
                      <div className="flex-1 px-3 overflow-hidden min-w-[300px] border-r border-gray-200 flex items-center h-full">
                        {relatedENs.slice(0, 1).map((en) => (
                          <div
                            key={`EN-${en.apNoteNo}`}
                            className="flex flex-col gap-0.5 text-xs min-w-0"
                          >
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {en.apNoteNo}
                            </span>
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              Total: {formatNumber(en.totalInvoice)}
                            </span>
                           
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Empty state if no AP Notes */}
                    {relatedENs.length === 0 && (
                      <div className="flex-1 px-3 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200 min-w-[300px] h-full">
                        No linked AP Notes
                      </div>
                    )}

                    {/* Related Purchase Return - Far Right Side */}
                    <div className="flex-1 px-3 flex items-center justify-center text-gray-400 text-xs min-w-[300px] h-full">
                      No Linked Purchase Return
                    </div>
                  </div>
                );
              };

              return unlinkedPIs.length > 0 ||
                unlinkedICs.length > 0 ||
                unlinkedSRs.length > 0 ? (
                <>
                  {(() => {
                    // Group all documents by PO
                    const allDocs = [
                      ...unlinkedPIs.map(d => ({ ...d, docType: "PI" as const })),
                      ...unlinkedICs.map(d => ({ ...d, docType: "IC" as const })),
                      ...unlinkedSRs.map(d => ({ ...d, docType: "SR" as const }))
                    ];
                    
                    // Expand documents with multiple POs into separate entries
                    const expandedDocs = allDocs.flatMap((doc: any) => {
                      if ((doc.docType === "IC" || doc.docType === "SR") && Array.isArray(doc.poNo) && doc.poNo.length > 1) {
                        // Create separate entry for each PO
                        return doc.poNo.map((po: string) => ({
                          ...doc,
                          poNo: po,
                        }));
                      }
                      return [doc];
                    });
                    
                    const grouped = new Map<string, typeof expandedDocs>();
                    
                    // First pass: identify which ICs/SRs have multiple POs
                    const docsByIcSr = new Map<string, (typeof expandedDocs)[number][]>();
                    expandedDocs.forEach((doc) => {
                      if (doc.docType === "IC" && doc.icNum) {
                        const key = `IC-${doc.icNum}`;
                        if (!docsByIcSr.has(key)) docsByIcSr.set(key, []);
                        docsByIcSr.get(key)!.push(doc);
                      } else if (doc.docType === "SR" && doc.srNum) {
                        const key = `SR-${doc.srNum}`;
                        if (!docsByIcSr.has(key)) docsByIcSr.set(key, []);
                        docsByIcSr.get(key)!.push(doc);
                      }
                    });
                    
                    // Check which ICs/SRs have multiple unique POs
                    const icSrWithMultiplePOs = new Set<string>();
                    docsByIcSr.forEach((docs, key) => {
                      const uniquePOs = new Set(docs.map(d => d.poNo).filter(Boolean));
                      if (uniquePOs.size > 1) {
                        icSrWithMultiplePOs.add(key);
                      }
                    });
                    
                    expandedDocs.forEach((doc) => {
                      let groupKey = "NO_KEY";

                      // Prioritas: Kalau IC/SR punya multiple POs, group by IC/SR dulu
                      if (doc.docType === "IC" && doc.icNum && icSrWithMultiplePOs.has(`IC-${doc.icNum}`)) {
                        groupKey = `IC-${doc.icNum}`;
                      } else if (doc.docType === "SR" && doc.srNum && icSrWithMultiplePOs.has(`SR-${doc.srNum}`)) {
                        groupKey = `SR-${doc.srNum}`;
                      } else if (doc.docType === "PI" && doc.poId) {
                        // Prioritas: PO dari PI
                        groupKey = doc.poId;
                      } else if ((doc.docType === "IC" || doc.docType === "SR") && doc.poNo) {
                        // Prioritas: PO dari IC/SR (kalau tidak punya multiple POs)
                        groupKey = doc.poNo;
                      } else if (doc.docType === "PI" && doc.piNo) {
                        // Kalau PI tidak punya PO, pakai piNo sebagai key
                        groupKey = `PI-${doc.piNo}`;
                      } else if ((doc.docType === "IC" || doc.docType === "SR") && doc.piNo) {
                        // Kalau IC/SR tidak punya PO tapi ada piNo, pakai piNo sebagai key
                        groupKey = `PI-${doc.piNo}`;
                      } else if (doc.docType === "IC" && doc.icNum) {
                        // Kalau IC tidak punya PO/PI, pakai import cost number
                        groupKey = `IC-${doc.icNum}`;
                      } else if (doc.docType === "SR" && doc.srNum) {
                        // Kalau SR tidak punya PO/PI, pakai shipment request number
                        groupKey = `SR-${doc.srNum}`;
                      } else {
                        // Fallback terakhir
                        groupKey = "NO_PO";
                      }

                      if (!grouped.has(groupKey)) {
                        grouped.set(groupKey, []);
                      }
                      grouped.get(groupKey)!.push(doc);
                    });

                    return Array.from(grouped.entries()).map(([groupKey, docsInGroup]) => {
                      // Get document type counts for the badge label
                      const docTypeCounts = {
                        PI: docsInGroup.filter(d => d.docType === "PI").length,
                        IC: docsInGroup.filter(d => d.docType === "IC").length,
                        SR: docsInGroup.filter(d => d.docType === "SR").length,
                      };

                      // Generate badge label based on document types
                      const getBadgeLabel = () => {
                        const labels = [];
                        if (docTypeCounts.PI > 0) labels.push(`${docTypeCounts.PI} PI`);
                        if (docTypeCounts.IC > 0) labels.push(`${docTypeCounts.IC} IC`);
                        if (docTypeCounts.SR > 0) labels.push(`${docTypeCounts.SR} SR`);
                        return labels.join(", ") || "Mixed Documents";
                      };

                      return (
                        <div key={`group-${groupKey}`} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden">
                          {/* Group Header */}
                          {docsInGroup.length > 1 && (
                            <div className="flex h-16 items-center border-b-2 border-gray-300">
                              {groupKey.startsWith("IC-") ? (
                                // Grouping berdasarkan Import Cost
                                <>
                                  <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center bg-green-50 h-full">
                                    <span className="text-xs font-bold text-green-900">Import Cost:</span>
                                    <span className="text-xs font-semibold text-green-700 ml-2">
                                      {(() => {
                                        const icNum = groupKey.replace("IC-", "");
                                        const relatedIC = mockImportCosts.find(ic => ic.icNum === icNum);
                                        return relatedIC ? relatedIC.icNum : icNum;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full flex items-center justify-center">
                                    <Badge className="bg-blue-100 text-blue-700 border border-blue-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 px-3 min-w-[300px] h-full"></div>
                                </>
                              ) : groupKey.startsWith("SR-") ? (
                                // Grouping berdasarkan Shipment Request
                                <>
                                  <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center bg-amber-50 h-full">
                                    <span className="text-xs font-bold text-amber-900">Shipment Request:</span>
                                    <span className="text-xs font-semibold text-amber-700 ml-2">
                                      {(() => {
                                        const srNum = groupKey.replace("SR-", "");
                                        const relatedSR = mockShipmentRequest.find(sr => sr.srNum === srNum);
                                        return relatedSR ? relatedSR.srNum : srNum;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full flex items-center justify-center">
                                    <Badge className="bg-orange-100 text-orange-700 border border-orange-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 px-3 min-w-[300px] h-full"></div>
                                </>
                              ) : groupKey.startsWith("PI-") ? (
                                // Grouping berdasarkan PI
                                <>
                                  <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center bg-blue-50 h-full">
                                    <span className="text-xs font-bold text-blue-900">Purchase Invoice:</span>
                                    <span className="text-xs font-semibold text-blue-700 ml-2">
                                      {(() => {
                                        const piNum = groupKey.replace("PI-", "");
                                        const relatedPI = mockpurchaseInvoice.find(pi => pi.purchaseInvoiceNo === piNum);
                                        return relatedPI ? relatedPI.purchaseInvoiceNo : piNum;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full flex items-center justify-center">
                                    <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 px-3 min-w-[300px] h-full"></div>
                                </>
                              ) : groupKey !== "NO_PO" ? (
                                // Grouping berdasarkan PO
                                <>
                                  <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center bg-purple-50 h-full">
                                    <span className="text-xs font-bold text-purple-900">Purchase Order:</span>
                                    <span className="text-xs font-semibold text-purple-700 ml-2">
                                      {(() => {
                                        const relatedPO = mockPurchaseOrder.find(po => po.poId === groupKey);
                                        return relatedPO ? relatedPO.purchaseOrderNo : groupKey;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full flex items-center justify-center">
                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 px-3 min-w-[300px] h-full"></div>
                                </>
                              ) : (
                                // Fallback: No Grouping Key
                                <>
                                  <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center bg-gray-50 h-full">
                                    <span className="text-xs font-bold text-gray-900">No Grouping Key:</span>
                                  </div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full"></div>
                                  <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] h-full flex items-center justify-center">
                                    <Badge className="bg-gray-200 text-gray-700 border border-gray-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 px-3 min-w-[300px] h-full"></div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Documents in group */}
                          <div className="space-y-2 p-4">
                            {docsInGroup.map((doc) =>
                              renderDocumentCard(doc, doc.docType),
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No documents available
                </div>
              );
            })()}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              onClick={() => setShowAddLinksDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Add selected documents to the PVR
                const selectedDocsList = Array.from(
                  selectedDocuments,
                ).map((docId) => {
                  const [type, ...noParts] =
                    docId.split("-");
                  const no = noParts.join("-");

                  if (type === "PI") {
                    const pi = mockpurchaseInvoice.find(
                      (p) =>
                        p.purchaseInvoiceNo === no,
                    );
                    return pi
                      ? {
                          id: `${type}-${pi.piId}`,
                          piNo: pi.purchaseInvoiceNo,
                          poNo: pi.poId,
                          invoiceNo:
                            pi.purchaseInvoiceNo,
                          invoiceDate:
                            pi.referenceDate || "",
                          currency: "IDR",
                          totalAmount: pi.totalAmount,
                          documentType: "PI" as const,
                        }
                      : null;
                  } else if (type === "IC") {
                    const ic = mockImportCosts.find(
                      (i) => i.icNum === no,
                    );
                    return ic
                      ? {
                          id: `${type}-${ic.icId}`,
                          piNo: ic.icNum,
                          poNo: ic.poNo || "",
                          invoiceNo: ic.invoiceNo || "",
                          invoiceDate: ic.icDate || "",
                          currency: ic.currency,
                          totalAmount: ic.totalImportCost,
                          documentType: "IC" as const,
                        }
                      : null;
                  } else if (type === "SR") {
                    const sr = mockShipmentRequest.find(
                      (s) => s.srNum === no,
                    );
                    return sr
                      ? {
                          id: `${type}-${sr.srId}`,
                          piNo: sr.srNum,
                          poNo: sr.poNo || "",
                          invoiceNo: sr.invoiceNo || "",
                          invoiceDate: sr.docReceivedDate,
                          currency: sr.currency,
                          totalAmount:
                            sr.totalShipmentRequest,
                          documentType: "SR" as const,
                        }
                      : null;
                  } else if (type === "EN") {
                    const en = mockExpenseNote.find(
                      (e) => e.apNoteNo === no,
                    );
                    return en
                      ? {
                          id: `${type}-${en.apnoteId}`,
                          piNo: en.apNoteNo,
                          poNo: "",
                          invoiceNo: en.invoiceNumber,
                          invoiceDate:
                            en.apNoteCreateDate || "",
                          currency: en.currency,
                          totalAmount: en.totalInvoice,
                          documentType: "EN" as const,
                        }
                      : null;
                  }
                  return null;
                });

                setLinkedPIs([
                  ...linkedPIs,
                  ...(selectedDocsList.filter(doc => doc !== null) as any[]),
                ]);

                setShowAddLinksDialog(false);
                setSelectedDocuments(new Set());
                setSelectAllDocuments(false);
              }}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={selectedDocuments.size === 0}
            >
              Add ({selectedDocuments.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}