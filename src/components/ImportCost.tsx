import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  formatDateToDDMMYYYY as formatDate,
  getTodayDDMMYYYY,
  getTodayYYYYMMDD,
  formatDateTimeForHistory as formatDateTime,
  convertDDMMYYYYtoYYYYMMDD,
  isValidDate,
} from "../utils/dateFormat";
import { formatNumber, formatCurrency } from "../utils/numberFormat";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  mockLinkedPOs,
  mockImportCosts,
  mockpurchaseInvoice,
  mockExpenseNote,
  mockShipmentRequest,
  mockPurchaseOrder,
  mockpurchaseReturns,
  mockPVR,
  extractShipmentRequestsFromLinkedStructure,
  findLinkedPVRs,
  getSyncedPaymentAmountsByPO,
  findLinkedPIsByPONo,
} from "../mocks/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  FileText,
  User,
  DollarSign,
  Calendar,
  Building2,
  Plane,
  Ship,
  Package,
  ChevronDown,
  ChevronUp,
  Check,
  Edit,
  X,
  Clock,
  Send,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Hash,
  Receipt,
  Trash2,
  Filter,
  Pencil,
  FilePlus,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { PVRDialogs } from "./PVRDialogs";

// Alias for the imported function to match existing usage
const formatDateToDDMMYYYY = formatDate;
const formatDateTimeForHistory = formatDateTime;

type ICType = "Sea" | "Air" | "Courier";
type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Verified"
  | "Complete";
type PTType =
  | "ALL PT"
  | "AMT"
  | "GMI"
  | "IMI"
  | "MJS"
  | "TTP"
  | "WNS"
  | "WSI";

type DocType = "AP NOTE" | "AP DISC NOTE";
type TermType = "URGENT" | "CREDIT" | "ONLINE SHOPPING";
type SupplierCategory = "OVERSEAS" | "LOCAL";

interface AccountItem {
  id: string;
  category: string;
  description: string;
  accountCode: string;
  accountName: string;
  department: string;
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

interface SupplierMasterData {
  name: string;
  category: SupplierCategory;
}

interface AccountOption {
  code: string;
  name: string;
}

interface DepartmentOption {
  code: string;
  name: string;
}

interface APNoteCreated {
  id: string;
  apNoteNo: string;
  docType: DocType;
  icId: string;
}

interface HistoryRecord {
  id: string;
  action:
    | "Create"
    | "Approve"
    | "Verify"
    | "Undo Verify"
    | "Undo Approve"
    | "Void"
    | "Expense Note Create";
  picName: string;
  date: string;
  time: string;
  remarks?: string;
  expenseNoteNo?: string;
}

export interface APNoteDataFromIC {
  id: string;
  apNoteNo: string;
  invoiceNumber: string;
  supplierName: string;
  supplierCategory: SupplierCategory;
  totalInvoice: number;
  docReceiptDate: string;
  apNoteCreateDate: string;
  invoiceDate: string;
  createdBy: string;
  term: TermType;
  currency: string;
  remarks: string;
  pt: PTType;
  docType: DocType;
  linkedICId?: string;
  items?: any[];
  linkedDocs?: any[];
}

interface ImportCostProps {
  onAPNoteCreated?: (apNoteData: APNoteDataFromIC) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseOrder?: (docNo: string) => void;
  onNavigateToPurchaseInvoice?: (docNo: string) => void;
  onNavigateToImportCost?: (docNo: string) => void;
  onNavigateToShipmentRequest?: (docNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  selectedICNo?: string | null;
}

interface RelatedIC {
  id: number;
  icNo: string;
  createDate: string;
  invoiceNo: string;
  invoiceDate: string;
  status: string;
  expenses: { id: number; poNo: string; amount: number }[];
  remarks: string;
  history: { action: string; user: string; date: string }[];
  apNoteCreated: boolean;
}

interface ImportCostData {
  id: string;
  icNum: string;
  type: ICType;
  icDate: string;
  supplierName: string;
  totalImportCost: number;
  currency: string;
  createdBy: string;
  company: PTType;
  approvalStatus: ApprovalStatus;
  approvalDate?: string;
  settleDate?: string;
  rejectionReason?: string;
  poNo?: string;
  invoiceNo?: string;
  linkedExpenseNoteId?: string;
  isVoided?: boolean;
  isUnverified?: boolean; // Flag to track if verified status was undone
  verifiedStatus?: boolean;
  status?: string;
  remarks?: string;
  discount?: number;
  tax?: number;
  pph?: number;
  apNotes?: APNoteCreated[];
  history?: HistoryRecord[];
  relatedIC?: RelatedIC[];
  linkedDocs?: any[];
  items?: any[];
}

// const initialMockData: ImportCostData[] = initialImportCostMockData as ImportCostData[];

// Helper function to extract all Import Costs from mock data
const extractImportCostsFromLinkedStructure = () => {
  // Primary source: Use mockImportCosts directly from mockData
  if (
    mockImportCosts &&
    Array.isArray(mockImportCosts) &&
    mockImportCosts.length > 0
  ) {
    return mockImportCosts.map((ic: any) => ({
      id: ic.icId,
      ...ic,
    })) as ImportCostData[];
  }

  // Fallback: Extract from linked document structure if mockImportCosts is not available
  const allImportCosts: ImportCostData[] = [];
  const seenIds = new Set<string>();

  mockLinkedPOs.forEach((po: any) => {
    po.importCosts?.forEach((ic: any) => {
      const icId = ic.icId || `ic-${ic.icNo}`;
      if (!seenIds.has(icId)) {
        allImportCosts.push(ic);
        seenIds.add(icId);
      }
    });
  });

  return allImportCosts;
};

export default function ImportCost({
  onAPNoteCreated,
  onNavigateToAPNote,
  onNavigateToPurchaseOrder,
  onNavigateToPurchaseInvoice,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToPVR,
  selectedICNo,
}: ImportCostProps = {}) {
  // Load import cost data from localStorage on mount
  // Initialize with empty array - will load data in useEffect
  const [view, setView] = useState<"dashboard" | "work">(
    "work",
  );
  const [importCostData, setImportCostData] = useState<
    ImportCostData[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] =
    useState<PTType>("ALL PT");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [activeFilterType, setActiveFilterType] = useState<
    "status" | "pt" | null
  >(null);
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] =
    useState("");
  const [calendarDateTo, setCalendarDateTo] =
    useState("");
  const [calendarFilterType, setCalendarFilterType] =
    useState<"approval" | "ic" | "invoice">("approval");
  const [selectedDetail, setSelectedDetail] =
    useState<ImportCostData | null>(null);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showApprovalDialog, setShowApprovalDialog] =
    useState(false);
  const [selectedForApproval, setSelectedForApproval] =
    useState<ImportCostData | null>(null);
  const [approvalAction, setApprovalAction] = useState<
    "approve" | "reject"
  >("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedForLink, setSelectedForLink] =
    useState<ImportCostData | null>(null);
  const [showUndoVerifyDialog, setShowUndoVerifyDialog] =
    useState(false);
  const [selectedForUndo, setSelectedForUndo] =
    useState<ImportCostData | null>(null);
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [showCreateAPNoteDialog, setShowCreateAPNoteDialog] =
    useState(false);
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [selectedForVoid, setSelectedForVoid] =
    useState<ImportCostData | null>(null);
  const [showWarningDialog, setShowWarningDialog] =
    useState(false);
  const [showSuccessDialog, setShowSuccessDialog] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [savedDocType, setSavedDocType] = useState<DocType>("AP NOTE");
  const [savedApNoteNo, setSavedApNoteNo] = useState("");
  const [savedLinkedDocs, setSavedLinkedDocs] = useState<LinkedDocument[]>([]);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
    useState(false);
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [selectedForLinkedDocs, setSelectedForLinkedDocs] =
    useState<ImportCostData | null>(null);
  const [expandedDetailItems, setExpandedDetailItems] =
    useState<Set<string>>(new Set());
  const [activeDetailTab, setActiveDetailTab] = useState<
    "items" | "details" | "remarks" | "history"
  >("items");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [editDiscount, setEditDiscount] = useState(0);
  const [showOtherCostDialog, setShowOtherCostDialog] = useState(false);
  const [otherCosts, setOtherCosts] = useState<any[]>([]);
  const [apNoteMapping, setApNoteMapping] = useState<{
    [key: string]: string;
  }>({});

  const onUpdateInvoice = (updatedIC: any) => {
    setImportCostData((prev) =>
      prev.map((ic) => (ic.id === updatedIC.id ? updatedIC : ic)),
    );
    setSelectedDetail(updatedIC);
  };

  // AP Note states
  const [showDocTypeSelection, setShowDocTypeSelection] =
    useState(false);
  const [showAPNoteDialog, setShowAPNoteDialog] =
    useState(false);
  const [showAPNoteListDialog, setShowAPNoteListDialog] =
    useState(false);
  const [selectedForAPNote, setSelectedForAPNote] =
    useState<ImportCostData | null>(null);
  const [selectedDocType, setSelectedDocType] =
    useState<DocType>("AP NOTE");
  const [apNoteForm, setApNoteForm] = useState({
    apNoteNo:
      "AP/" +
      "WNS" + ".MDN/" +
      new Date().toISOString().slice(2, 4) +
      String(new Date().getMonth() + 1).padStart(2, "0") + "/" +
      String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
    apNoteDate: getTodayYYYYMMDD(),
    currency: "IDR",
    invoiceNumber: "",
    term: "CREDIT" as TermType,
    documentReceivedDate: getTodayYYYYMMDD(),
    remarks: "",
    supplierName: "",
    pt: "MJS" as PTType,
    discount: 0,
    tax: 0,
    pph: 0,
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    icNum:
      "IC-2025-" +
      String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
    type: "Sea" as ICType,
    icDate: getTodayYYYYMMDD(),
    supplierName: "",
    totalImportCost: 0,
    createdBy: "ANDI WIJAYA",
    company: "WNS" as PTType,
    poNo: "",
    invoiceNo: "",
  });

  // New AP Note Dialog States and Refs
  const mainDialogContentRef = useRef<HTMLDivElement>(null);
  const mainDialogScrollRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const lastAccountItemRef = useRef<HTMLTableRowElement>(null);

  const [accountItems, setAccountItems] = useState<AccountItem[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<LinkedDocument[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [activeCreateTabItems, setActiveCreateTabItems] = useState<"items" | "links">("items");
  const [isSupplierSelected, setIsSupplierSelected] = useState(false);
  const [availableDocsForSupplier, setAvailableDocsForSupplier] = useState<any[]>([]);
  const [accountCodeSearchTerms, setAccountCodeSearchTerms] = useState<{ [key: number]: string }>({});
  const [departmentCodeSearchTerms, setDepartmentCodeSearchTerms] = useState<{ [key: number]: string }>({});
  const [openDeptCodeDropdown, setOpenDeptCodeDropdown] = useState<{ [key: number]: boolean }>({});
  const [openLinkedDocDropdown, setOpenLinkedDocDropdown] = useState<{ [key: string | number]: boolean }>({});
  const [linkedDocNoSearchTerms, setLinkedDocNoSearchTerms] = useState<{ [key: string | number]: string }>({});
  const [documentNoSearchTerms, setDocumentNoSearchTerms] = useState<{ [key: string | number]: string }>({});
  const [openDocumentNoDropdown, setOpenDocumentNoDropdown] = useState<{ [key: string | number]: boolean }>({});
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrail, setAuditTrail] = useState<Array<{ action: string; user: string; timestamp: string }>>([]);

  // PVR Dialog States
  const [showCreatePVRDialog, setShowCreatePVRDialog] = useState(false);
  const [showPVRSuccessDialog, setShowPVRSuccessDialog] = useState(false);
    const [showFullyPaidWarning, setShowFullyPaidWarning] = useState(false);
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [pvrForm, setPvrForm] = useState({
    supplierName: "",
    term: "Credit" as "Credit" | "Urgent",
    currency: "IDR",
    rate: 0,
    pt: "AMT" as "AMT" | "GMI" | "IMI" | "MJS" | "TTP" | "WNS" | "WSI",
    pvrDate: "",
    pvrNo: "",
    bankAccount: "",
    paymentMethod: "Transfer" as "Transfer" | "Cash",
    reference: "",
    remarks: "",
  });
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showSupplierPVRDropdown, setShowSupplierPVRDropdown] = useState(false);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState("");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState("");
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [savedPvrNo, setSavedPvrNo] = useState("");
  const [savedPvrLinkedDocs, setSavedPvrLinkedDocs] = useState<any[]>([]);
  const [addLinksSearchTerm, setAddLinksSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [pvrData, setPvrData] = useState<any[]>([]);
  const [linkedDocsRefresh, setLinkedDocsRefresh] = useState(0);
  const [supplierSearchTermPVR, setSupplierSearchTermPVR] = useState("");

  // Load PVR data from localStorage on mount and when changed
  useEffect(() => {
    const loadPVRData = () => {
      try {
        const stored = localStorage.getItem("pvrData");
        if (stored) {
          setPvrData(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading PVR data:", error);
      }
    };
    loadPVRData();

    // Also reload when localStorage changes
    const handleStorageChange = (e: any) => {
      if (e.key === "pvrData" || e.type === "storage_pvrData") {
        loadPVRData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage_pvrData", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_pvrData", handleStorageChange);
    };
  }, [showCreatePVRDialog, showLinkedDocsDialog]); // Refresh when dialogs open/close

  // PVR Helper Functions
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

  const generatePVRNumber = (pt: string, date: string): string => {
    if (!date) return "";
    const parts = date.split("/");
    if (parts.length !== 3) return "";
    
    const day = parts[0];
    const month = parts[1];
    const yearFull = parts[2];
    const yearLast2 = yearFull.slice(-2); // Get last 2 digits of year (e.g., "25" for 2025)
    
    // Get existing PVRs from localStorage and mock data
    let existingPVRs: any[] = [];
    try {
      const savedPVRs = localStorage.getItem("pvrData");
      if (savedPVRs) {
        existingPVRs = JSON.parse(savedPVRs);
      }
    } catch (error) {
      console.error("Failed to load PVR data:", error);
    }
    
    // Also add mock PVRs
    existingPVRs = [...existingPVRs, ...mockPVR];
    
    // Find the highest sequence number for this PT and YYzz combination
    const pvrPattern = `PVR/${pt}.MDN/${yearLast2}${month}/`;
    const matchingPVRs = existingPVRs.filter((pvr: any) => 
      pvr.pvrNo && pvr.pvrNo.startsWith(pvrPattern)
    );
    
    let nextSeqNum = 1;
    if (matchingPVRs.length > 0) {
      // Extract sequence numbers and find the highest
      const seqNumbers = matchingPVRs
        .map((pvr: any) => {
          const lastPart = pvr.pvrNo.split("/").pop();
          return parseInt(lastPart, 10);
        })
        .filter((num: number) => !isNaN(num))
        .sort((a: number, b: number) => b - a);
      
      if (seqNumbers.length > 0) {
        nextSeqNum = seqNumbers[0] + 1;
      }
    }
    
    const seqNumStr = String(nextSeqNum).padStart(4, "0");
    return `PVR/${pt}.MDN/${yearLast2}${month}/${seqNumStr}`;
  };

  const getDocumentNumber = (doc: any): string => {
    return doc.piNo || doc.invoiceNo || doc.icNum || "";
  };

  const resetPVRForm = () => {
    setPvrForm({
      supplierName: "",
      term: "Credit",
      currency: "IDR",
      rate: 0,
      pt: "AMT",
      pvrDate: "",
      pvrNo: "",
      bankAccount: "",
      paymentMethod: "Transfer",
      reference: "",
      remarks: "",
    });
  };

  const handleSupplierPVRChange = (supplierName: string) => {
    setPvrForm({
      ...pvrForm,
      supplierName: supplierName,
    });
    setShowSupplierPVRDropdown(false);
  };

  const handleCreatePVR = () => {
    // Validate supplier
    if (!pvrForm.supplierName) {
      alert("Please select a supplier");
      return;
    }

    // Check if there are payable items
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
        .reduce((sum: number, doc: any) => sum + (doc.totalAmount || 0), 0);

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
          poNo: doc.poNo || "",
        })),
      };

      // Save to localStorage
      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      existingPVRs.push(newPVR);
      localStorage.setItem("pvrData", JSON.stringify(existingPVRs));

      // Trigger state update
      window.dispatchEvent(new Event("storage_pvrData"));

      console.log("[SAVE PVR] PVR saved:", newPVR.pvrNo);
      console.log("[SAVE PVR] Linked Documents:", newPVR.linkedDocs);

      // Show success
      setSavedPvrNo(newPVR.pvrNo);
      setSavedPvrLinkedDocs(newPVR.linkedDocs);
      setShowCreatePVRDialog(false);
      setShowPVRSuccessDialog(true);

      // Reset form
      resetPVRForm();
      setLinkedPIs([]);
    } catch (error) {
      console.error("[SAVE PVR] Error saving PVR:", error);
      alert("Error saving PVR. Please try again.");
    }
  };
  // Master data
  const supplierMasterData: SupplierMasterData[] = [
    { name: "PT. Supplier A", category: "OVERSEAS" },
    { name: "PT. Supplier B", category: "LOCAL" },
    { name: "PT. Supplier C", category: "OVERSEAS" },
    { name: "PT. Supplier D", category: "LOCAL" },
    { name: "PT. Supplier E", category: "OVERSEAS" },
  ];

  const filteredSuppliers = supplierMasterData.filter((supplier) =>
    supplier.name.toLowerCase().includes(pvrForm.supplierName.toLowerCase())
  );

  const accountOptions: AccountOption[] = [
    { code: "5101", name: "Material Cost" },
    { code: "5102", name: "Labor Cost" },
    { code: "5103", name: "Overhead" },
    { code: "5104", name: "Freight" },
    { code: "5105", name: "Insurance" },
  ];

  const departmentOptions: DepartmentOption[] = [
    { code: "PROD", name: "Production" },
    { code: "SALES", name: "Sales" },
    { code: "ADMIN", name: "Administration" },
    { code: "HR", name: "Human Resources" },
    { code: "FIN", name: "Finance" },
  ];

  const mockImportCostData = mockImportCosts || [];
  const mockShipmentRequestData = extractShipmentRequestsFromLinkedStructure() || [];
  const apNoteData: APNoteDataFromIC[] = [];

  // Helper functions
  const shouldShowSupplierDropdown = (value: string): boolean => {
    return value.length > 0 && value.length < 3;
  };

  const handleSupplierSelect = (supplier: SupplierMasterData) => {
    setApNoteForm({
      ...apNoteForm,
      supplierName: supplier.name,
    });
    setShowSupplierDropdown(false);
    setIsSupplierSelected(true);
  };

  const isAccountItemsValid = (): boolean => {
    return accountItems.every(
      (item) =>
        item.accountCode &&
        item.accountName &&
        item.qty > 0 &&
        item.unitPrice > 0,
    );
  };

  // ✅ LOAD DATA ON MOUNT - Primary effect untuk inisialisasi data
  useEffect(() => {
    const loadImportCostData = () => {
      // Primary: Try to get from localStorage (user modifications)
      // ⚠️ IMPORTANT: Only use localStorage if it contains VALID data (length > 0)
      const stored = localStorage.getItem("importCost_data");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Verify that parsed data is not empty
          if (
            parsed &&
            Array.isArray(parsed) &&
            parsed.length > 0
          ) {
            console.log(
              "ImportCost data loaded from localStorage:",
              parsed.length,
              "records",
            );
            return parsed;
          } else {
            console.warn(
              "localStorage data is empty or invalid, falling back to mock data",
            );
          }
        } catch (e) {
          console.error("Failed to parse importCost_data:", e);
        }
      }

      // Secondary: Get from centralized mock data structure
      const icsFromStructure =
        extractImportCostsFromLinkedStructure();
      if (icsFromStructure && icsFromStructure.length > 0) {
        console.log(
          "ImportCost data loaded from mock structure:",
          icsFromStructure.length,
          "records",
        );
        return icsFromStructure;
      }

      // Final fallback: Empty array (no mock data available)
      console.warn(
        "⚠️ No import cost data found in localStorage or centralized structure",
      );
      return [];
    };

    // Load data when component mounts
    const initialData = loadImportCostData();
    setImportCostData(initialData);
  }, []); // Empty dependency - only run once on mount

  // ✅ DEBUG: Function to clear localStorage and reload
  // Call this from console: window.clearICData()
  useEffect(() => {
    (window as any).clearICData = () => {
      console.log("🧹 Clearing ImportCost localStorage...");
      localStorage.removeItem("importCost_data");
      console.log("✅ localStorage cleared - reloading...");
      window.location.reload();
    };
  }, []);

  // Save entire importCostData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "importCost_data",
      JSON.stringify(importCostData),
    );
  }, [importCostData]);

  // Reload importCostData from localStorage when tab becomes active
  useEffect(() => {
    const reloadData = () => {
      const stored = localStorage.getItem("importCost_data");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setImportCostData(parsedData);
          console.log(
            "ImportCost data reloaded from localStorage",
          );
        } catch (e) {
          console.error("Failed to reload importCost_data:", e);
        }
      }
    };

    // Reload on focus (when user switches back to this tab)
    const handleFocus = () => {
      console.log("ImportCost tab focused - reloading data");
      reloadData();
    };

    window.addEventListener("focus", handleFocus);

    // Also listen to custom event from tab switch
    const handleTabSwitch = () => {
      console.log(
        "Tab switched to Import Cost - reloading data",
      );
      reloadData();
    };
    window.addEventListener(
      "importCostTabActive",
      handleTabSwitch,
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "importCostTabActive",
        handleTabSwitch,
      );
    };
  }, []);

  // Initialize AP Note mappings from existing apNotes on mount
  useEffect(() => {
    const initializeAPNoteMappings = () => {
      const apNoteMapping = JSON.parse(
        localStorage.getItem("apNote_mapping") || "{}",
      );
      const apNoteToICMapping = JSON.parse(
        localStorage.getItem("apNoteToIC_mapping") || "{}",
      );

      let hasChanges = false;

      // Iterate through all import cost items and populate mappings
      importCostData.forEach((ic) => {
        if (ic.apNotes && ic.apNotes.length > 0) {
          ic.apNotes.forEach((apNote) => {
            // Only add if not already in mapping
            if (!apNoteMapping[apNote.apNoteNo]) {
              apNoteMapping[apNote.apNoteNo] = apNote.id;
              hasChanges = true;

              console.log(
                "Added apNoteMapping:",
                apNote.apNoteNo,
                "→",
                apNote.id,
              );
            }

            // Add to apNoteToIC mapping
            if (!apNoteToICMapping[apNote.apNoteNo]) {
              apNoteToICMapping[apNote.apNoteNo] = {
                icNum: ic.icNum,
                icId: ic.id,
                apNoteNo: apNote.apNoteNo,
                apNoteId: apNote.id,
              };
              hasChanges = true;

              console.log(
                "Added apNoteToICMapping:",
                apNote.apNoteNo,
                "→",
                ic.icNum,
              );
            }
          });
        }
      });

      // Save if there were changes
      if (hasChanges) {
        localStorage.setItem(
          "apNote_mapping",
          JSON.stringify(apNoteMapping),
        );
        localStorage.setItem(
          "apNoteToIC_mapping",
          JSON.stringify(apNoteToICMapping),
        );

        // Also update state so it's available immediately
        setApNoteMapping(apNoteMapping);

        console.log(
          "=== AP Note Mappings Initialized ===",
          "apNoteMapping:",
          apNoteMapping,
          "apNoteToICMapping:",
          apNoteToICMapping,
        );
      } else if (Object.keys(apNoteMapping).length > 0) {
        // Even if no changes, set state if mapping exists from localStorage
        setApNoteMapping(apNoteMapping);
      }
    };

    initializeAPNoteMappings();
  }, [importCostData]);

  // Auto-expand selected IC when selectedICNo is provided
  useEffect(() => {
    if (selectedICNo) {
      const foundIC = importCostData.find(
        (ic) => ic.icNum === selectedICNo,
      );
      if (foundIC) {
        setExpandedItems(new Set([foundIC.id]));
        // Scroll to the element
        setTimeout(() => {
          const element = document.getElementById(
            `ic-collapsible-${foundIC.id}`,
          );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  }, [selectedICNo, importCostData]);

  // Auto-populate linked documents with selected Import Cost when dialog opens
  useEffect(() => {
    if (showCreateAPNoteDialog && selectedForAPNote) {
      // Create an auto-linked IC entry
      const autoLinkedIC: LinkedDocument = {
        id: `ic-${selectedForAPNote.id}`,
        documentType: "IC",
        documentTypeLabel: "Import Cost",
        documentNo: selectedForAPNote.icNum,
        documentNoPO: "",
        totalAmount: selectedForAPNote.totalImportCost,
      };

      // Extract PO and PI from linkedDocs if available
      const linkedDocsArray: LinkedDocument[] = [autoLinkedIC];
      let piDoc: any = null;
      let poDoc: any = null;
      let linkedPVRsForPO: any[] = [];
      let linkedPVRsForPI: any[] = [];
      
      if (selectedForAPNote.linkedDocs && Array.isArray(selectedForAPNote.linkedDocs)) {
        selectedForAPNote.linkedDocs.forEach((doc: any) => {
          if (doc.type === "Purchase Order") {
            poDoc = doc.docNo;
          } else if (doc.type === "Purchase Invoice") {
            piDoc = doc.docNo;
          }
        });

        // If both PI and PO exist, create a single PI/PO row
        if (piDoc && poDoc) {
          const linkedDoc: LinkedDocument = {
            id: `piPO-${piDoc}-${poDoc}`,
            documentType: "PI/PO",
            documentTypeLabel: "Purchase Invoice | Purchase Order",
            documentNo: piDoc,
            documentNoPO: poDoc,
            totalAmount: 0,
          };
          linkedDocsArray.push(linkedDoc);

          // Find PVRs linked to the PO
          linkedPVRsForPO = findLinkedPVRs("PO", poDoc);
          // Find PVRs linked to the PI
          linkedPVRsForPI = findLinkedPVRs("PI", piDoc);
        } else if (piDoc) {
          // Only PI
          const linkedDoc: LinkedDocument = {
            id: `pi-${piDoc}`,
            documentType: "PI",
            documentTypeLabel: "Purchase Invoice",
            documentNo: piDoc,
            documentNoPO: "",
            totalAmount: 0,
          };
          linkedDocsArray.push(linkedDoc);

          // Find PVRs linked to the PI
          linkedPVRsForPI = findLinkedPVRs("PI", piDoc);
        } else if (poDoc) {
          // Only PO
          const linkedDoc: LinkedDocument = {
            id: `po-${poDoc}`,
            documentType: "PO",
            documentTypeLabel: "Purchase Order",
            documentNo: poDoc,
            documentNoPO: "",
            totalAmount: 0,
          };
          linkedDocsArray.push(linkedDoc);

          // Find PVRs linked to the PO
          linkedPVRsForPO = findLinkedPVRs("PO", poDoc);
        }
      }

      // Add PVRs linked to PO/PI to the linkedDocs array
      const allLinkedPVRs = [...new Set([...linkedPVRsForPO, ...linkedPVRsForPI].map(p => p.pvrNo))];
      
      // Debug logging
      console.log("=== PVR Extraction Debug ===");
      console.log("PO Doc:", poDoc);
      console.log("PI Doc:", piDoc);
      console.log("Linked PVRs for PO:", linkedPVRsForPO);
      console.log("Linked PVRs for PI:", linkedPVRsForPI);
      console.log("All unique PVRs:", allLinkedPVRs);
      
      allLinkedPVRs.forEach((pvrNo: string) => {
        // Find the full PVR object
        const pvrObj = [...linkedPVRsForPO, ...linkedPVRsForPI].find(p => p.pvrNo === pvrNo);
        if (pvrObj && !linkedDocsArray.some(doc => doc.documentNo === pvrNo)) {
          const pvrLinkedDoc: LinkedDocument = {
            id: `pvr-${pvrNo}`,
            documentType: "PVR",
            documentTypeLabel: "Purchase Voucher Request",
            documentNo: pvrNo,
            documentNoPO: "",
            totalAmount: 0,
          };
          linkedDocsArray.push(pvrLinkedDoc);
          console.log("PVR Added:", pvrLinkedDoc);
        }
      });
      
      console.log("Final linkedDocsArray:", linkedDocsArray);

      // Set linkedDocs with the auto-linked IC and extracted PO/PI
      // But only if NO expense notes already exist
      if (!selectedForAPNote.apNotes || selectedForAPNote.apNotes.length === 0) {
        setLinkedDocs(linkedDocsArray);
      } else {
        // If expense notes already exist, clear linkedDocs for fresh creation
        setLinkedDocs([]);
      }
    } else if (!showCreateAPNoteDialog) {
      // Clear linkedDocs when dialog closes
      setLinkedDocs([]);
    }
  }, [showCreateAPNoteDialog, selectedForAPNote]);

  // Auto-populate account items from Import Cost expenses
  useEffect(() => {
    if (showCreateAPNoteDialog && selectedForAPNote) {
      // Import Cost expenses data with generated account codes
      const expenses = [
        {
          costVendor: "Freight Forwarder A",
          accountCode: "5201",
          poNumber: "PO-2025-001",
          amount: 45000000,
          payTo: "PT Logistik Prima",
        },
        {
          costVendor: "Customs Broker",
          accountCode: "5202",
          poNumber: "PO-2025-002",
          amount: 35000000,
          payTo: "PT Bea Cukai Services",
        },
      ];

      // Convert expenses to account items without department requirement
      const items: AccountItem[] = expenses.map((expense, index) => ({
        id: `expense-${index}`,
        accountCode: expense.accountCode,
        accountName: expense.costVendor,
        department: "",
        deptDescription: "",
        description: "",
        category: "",
        qty: 1,
        unitPrice: expense.amount,
        totalAmount: expense.amount,
      }));

      // Only auto-fill items if NO expense notes already exist
      if (!selectedForAPNote.apNotes || selectedForAPNote.apNotes.length === 0) {
        setAccountItems(items);
      } else {
        // If expense notes already exist, clear items for fresh creation
        setAccountItems([]);
      }
    } else if (!showCreateAPNoteDialog) {
      // Clear account items when dialog closes
      setAccountItems([]);
    }
  }, [showCreateAPNoteDialog, selectedForAPNote]);

  // Auto-populate form fields from selected Import Cost
  useEffect(() => {
    if (showCreateAPNoteDialog && selectedForAPNote) {
      // Only auto-fill if NO expense notes already exist
      // If expense notes already saved, leave dialog empty for new expense note
      if (!selectedForAPNote.apNotes || selectedForAPNote.apNotes.length === 0) {
        setApNoteForm((prevForm) => ({
          ...prevForm,
          supplierName: selectedForAPNote.supplierName || "",
          pt: selectedForAPNote.company as PTType,
          currency: selectedForAPNote.currency || "IDR",
          invoiceNumber: selectedForAPNote.invoiceNo || "",
          documentReceivedDate: selectedForAPNote.icDate || getTodayYYYYMMDD(),
        }));
      }
    }
  }, [showCreateAPNoteDialog, selectedForAPNote]);

  // Effect to handle navigation from linked documents
  useEffect(() => {
    const handleNavigateToIC = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { docNo } = customEvent.detail;

      console.log(
        "=== ImportCost navigateToImportCost event ===",
        docNo,
      );

      // Find the IC with matching number
      const matchingIC = importCostData.find(
        (ic) => ic.icNum === docNo || ic.id === docNo,
      );

      if (matchingIC) {
        console.log(
          "Found matching IC:",
          matchingIC.icNum,
          "ID:",
          matchingIC.id,
        );
        // Expand the matching IC card
        setExpandedItems(new Set([matchingIC.id]));

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(
            `ic-collapsible-${matchingIC.id}`,
          );
          console.log(
            "Looking for element:",
            `ic-collapsible-${matchingIC.id}`,
            "Found:",
            !!element,
          );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      } else {
        console.warn("No matching IC found for docNo:", docNo);
      }
    };

    window.addEventListener(
      "navigateToImportCost",
      handleNavigateToIC,
    );

    return () => {
      window.removeEventListener(
        "navigateToImportCost",
        handleNavigateToIC,
      );
    };
  }, [importCostData]);

  const filteredData = importCostData.filter((item) => {
    const matchesSearch =
      item.icNum
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.invoiceNo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      "";
    const matchesCompany =
      companyFilter === "ALL PT" ||
      item.company === companyFilter;
    const matchesStatus =
      statusFilter === "all" ||
      item.approvalStatus === statusFilter;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const pendingCount = importCostData.filter(
    (d) => d.approvalStatus === "Pending",
  ).length;
  const approvedCount = importCostData.filter(
    (d) => d.approvalStatus === "Approved",
  ).length;
  const verifiedCount = importCostData.filter(
    (d) => d.approvalStatus === "Verified",
  ).length;
  const completeCount = importCostData.filter(
    (d) => d.approvalStatus === "Complete",
  ).length;

  const formatCurrency = (
    amount: number,
    currency: string = "IDR",
  ) => {
    const formatted = amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${currency} ${formatted}`;
  };

  function formatNumber(value) {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const formatDateTimeForHistory = () => {
    const now = new Date();
    const date = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return { date, time };
  };

  const addHistoryRecord = (
    item: ImportCostData,
    action: HistoryRecord["action"],
    picName: string,
    expenseNoteNo?: string,
  ) => {
    const { date, time } = formatDateTimeForHistory();
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      action,
      picName,
      date,
      time,
      expenseNoteNo,
    };

    const updatedData = importCostData.map((ic) => {
      if (ic.id === item.id) {
        return {
          ...ic,
          history: [...(ic.history || []), newRecord],
        };
      }
      return ic;
    });

    setImportCostData(updatedData);
  };

  const getTypeIcon = (type: ICType) => {
    switch (type) {
      case "Sea":
        return <Ship className="h-4 w-4" />;
      case "Air":
        return <Plane className="h-4 w-4" />;
      case "Courier":
        return <Package className="h-4 w-4" />;
    }
  };

  // Helper function to find PI linked to a PO
  const findLinkedPIForPO = (poNo: string) => {
    console.log("=== findLinkedPIForPO Debug ===");
    console.log("Looking for PI linked to PO:", poNo);
    
    if (!mockpurchaseInvoice || !Array.isArray(mockpurchaseInvoice)) {
      console.log("mockpurchaseInvoice is not available");
      return null;
    }

    // Search using the correct field names from mock data
    const matchingPI = mockpurchaseInvoice.find((pi: any) => {
      // The field is "noPO" in the mock data
      return pi.noPO === poNo || pi.poNo === poNo || pi.purchaseOrderNumber === poNo;
    });
    
    if (matchingPI) {
      console.log(`✓ Found paired PI: ${matchingPI.purchaseInvoiceNo}`);
    } else {
      console.log(`✗ No paired PI found for PO: ${poNo}`);
    }
    
    return matchingPI;
  };

  // Check if document is auto-populated (PI/PO pair or auto-linked IC)
  const isAutoPopulatedPIPO = (index: number, doc: LinkedDocument): boolean => {
    // For Create AP Note Dialog: check if it's the auto-linked IC, PO, PI, or PI/PO from selectedForAPNote
    if (doc.id.startsWith("ic-") && doc.documentType === "IC") {
      return true;
    }
    if (doc.id.startsWith("po-") && doc.documentType === "PO") {
      return true;
    }
    if (doc.id.startsWith("pi-") && doc.documentType === "PI") {
      return true;
    }
    if (doc.id.startsWith("piPO-") && doc.documentType === "PI/PO") {
      return true;
    }
    return false;
  };

  const isAutoPopulatedExpense = (item: AccountItem): boolean => {
    // Check if this is an auto-linked expense from Import Cost
    return item.id.startsWith("expense-");
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedItems(new Set());
    } else {
      const allIds = filteredData.map((item) => item.id);
      setExpandedItems(new Set(allIds));
    }
    setExpandAll(!expandAll);
  };

  const handleApproval = () => {
    if (!selectedForApproval) return;

    const { date, time } = formatDateTimeForHistory();
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      action: "Approve",
      picName: "Shipment Team",
      date,
      time,
    };

    const updatedData = importCostData.map((item) => {
      if (item.id === selectedForApproval.id) {
        return {
          ...item,
          approvalStatus: "Approved" as ApprovalStatus,
          approvalDate: getTodayYYYYMMDD(),
          history: [...(item.history || []), newRecord],
        };
      }
      return item;
    });

    setImportCostData(updatedData);
    setShowApprovalDialog(false);
    setSelectedForApproval(null);
  };

  const handleVerify = () => {
    if (!selectedForLink) return;

    const { date, time } = formatDateTimeForHistory();
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      action: "Verify",
      picName: "PI Team",
      date,
      time,
    };

    const updatedData = importCostData.map((item) => {
      if (item.id === selectedForLink.id) {
        // If item has expense notes, set to Complete, otherwise Verified
        const newStatus =
          item.apNotes && item.apNotes.length > 0
            ? "Complete"
            : "Verified";
        return {
          ...item,
          approvalStatus: newStatus as ApprovalStatus,
          isUnverified: false, // Clear unverified flag when verifying
          verifiedStatus: true, // Set flag untuk akses cepat status verified
          history: [...(item.history || []), newRecord],
        };
      }
      return item;
    });

    setImportCostData(updatedData);
    setShowLinkDialog(false);
    setSelectedForLink(null);
  };

  const handleUndoVerify = () => {
    if (!selectedForUndo) return;

    const { date, time } = formatDateTimeForHistory();
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      action: "Undo Verify",
      picName: "PI Team",
      date,
      time,
    };

    const updatedData = importCostData.map((item) => {
      if (item.id === selectedForUndo.id) {
        // If item has expense notes, keep it as Verified with unverified flag
        // otherwise back to Approved
        const hasExpenseNotes =
          item.apNotes && item.apNotes.length > 0;
        const newStatus = hasExpenseNotes
          ? "Verified"
          : "Approved";
        return {
          ...item,
          approvalStatus: newStatus as ApprovalStatus,
          isUnverified: hasExpenseNotes, // Set flag if has expense notes
          verifiedStatus: false, // Clear verified flag when undoing verification
          history: [...(item.history || []), newRecord],
        };
      }
      return item;
    });

    setImportCostData(updatedData);
    setShowUndoVerifyDialog(false);
    setSelectedForUndo(null);
  };

  const handleVoid = () => {
    if (!selectedForVoid) return;

    const { date, time } = formatDateTimeForHistory();
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      action: "Void",
      picName: "Shipment Team",
      date,
      time,
    };

    const updatedData = importCostData.map((item) => {
      if (item.id === selectedForVoid.id) {
        return {
          ...item,
          isVoided: true,
          history: [...(item.history || []), newRecord],
        };
      }
      return item;
    });

    setImportCostData(updatedData);
    setShowVoidDialog(false);
    setSelectedForVoid(null);
  };

  const handleAPNoteClick = (item: ImportCostData) => {
    // Check if verified and not unverified
    if (
      item.approvalStatus !== "Verified" &&
      item.approvalStatus !== "Complete"
    ) {
      setShowWarningDialog(true);
      return;
    }

    // Check if in unverified state - show warning but allow to proceed
    if (item.isUnverified) {
      setSelectedForAPNote(item);
      setShowWarningDialog(true);
      return;
    }

    // Show doc type selection for creating new
    setSelectedForAPNote(item);
    setShowDocTypeSelection(true);
  };

  const handleCreateAPNote = () => {
    if (!selectedForAPNote) return;

    const newAPNoteId = Date.now().toString();

    // Calculate total - apply negative for AP DISC NOTE
    let totalInvoice = selectedForAPNote.totalImportCost;
    if (selectedDocType === "AP DISC NOTE") {
      totalInvoice = -Math.abs(totalInvoice);
    }

    // Determine supplier category based on supplier name patterns
    const supplierCategory: SupplierCategory =
      selectedForAPNote.supplierName.match(/^(PT|CV)\s/i)
        ? "LOCAL"
        : "OVERSEAS";

    // Create full AP Note data to pass to APNote.tsx
    const fullAPNoteData: APNoteDataFromIC = {
      id: newAPNoteId,
      apNoteNo: apNoteForm.apNoteNo,
      invoiceNumber:
        apNoteForm.invoiceNumber ||
        selectedForAPNote.invoiceNo ||
        "",
      supplierName: selectedForAPNote.supplierName,
      supplierCategory: supplierCategory,
      totalInvoice: totalInvoice,
      docReceiptDate: apNoteForm.documentReceivedDate,
      apNoteCreateDate: apNoteForm.apNoteDate,
      invoiceDate: apNoteForm.apNoteDate,
      createdBy: "ANDI WIJAYA",
      term: apNoteForm.term,
      currency: apNoteForm.currency,
      remarks: apNoteForm.remarks,
      pt: selectedForAPNote.company,
      docType: selectedDocType,
      linkedICId: selectedForAPNote.id,
      items: [],
      linkedDocs: [],
    };

    const newAPNote: APNoteCreated = {
      id: newAPNoteId,
      apNoteNo: apNoteForm.apNoteNo,
      docType: selectedDocType,
      icId: selectedForAPNote.id,
    };

    const { date, time } = formatDateTimeForHistory();
    const historyRecord: HistoryRecord = {
      id: Date.now().toString(),
      action: "Expense Note Create",
      picName: "PI Team",
      date,
      time,
      expenseNoteNo: apNoteForm.apNoteNo,
    };

    // Update import cost data with new AP Note
    const updatedData = importCostData.map((item) => {
      if (item.id === selectedForAPNote.id) {
        return {
          ...item,
          apNotes: [...(item.apNotes || []), newAPNote],
          // Automatically change status to Complete when first AP Note is created
          approvalStatus:
            item.approvalStatus === "Verified"
              ? ("Complete" as ApprovalStatus)
              : item.approvalStatus,
          expenseNoteCreated: true, // Set flag untuk akses cepat status expense note created
          history: [...(item.history || []), historyRecord],
        };
      }
      return item;
    });

    setImportCostData(updatedData);
    console.log("=== ImportCost Data Updated ===");
    console.log(
      "AP Note added to IC ID:",
      selectedForAPNote.id,
    );
    console.log("Updated importCostData:", updatedData);

    // Store mapping for navigation BEFORE calling callback
    const apNoteMapping = JSON.parse(
      localStorage.getItem("apNote_mapping") || "{}",
    );
    apNoteMapping[apNoteForm.apNoteNo] = newAPNoteId;
    localStorage.setItem(
      "apNote_mapping",
      JSON.stringify(apNoteMapping),
    );
    console.log("=== Mapping saved ===");
    console.log("AP Note No:", apNoteForm.apNoteNo);
    console.log("AP Note ID:", newAPNoteId);
    console.log("Full mapping after save:", apNoteMapping);
    console.log(
      "LocalStorage apNote_mapping:",
      localStorage.getItem("apNote_mapping"),
    );

    // Call callback to pass data to APNote.tsx
    if (onAPNoteCreated) {
      console.log("=== Calling onAPNoteCreated callback ===");
      onAPNoteCreated(fullAPNoteData);
    } else {
      console.warn(
        "=== onAPNoteCreated callback NOT provided ===",
      );
    }

    // Save data for success dialog
    setSavedDocType(selectedDocType);
    setSavedApNoteNo(apNoteForm.apNoteNo);
    setSavedLinkedDocs(linkedDocs);

    // Show success dialog instead of alert
    setSuccessMessage(
      `${selectedDocType} ${apNoteForm.apNoteNo} created successfully`,
    );
    setShowSuccessDialog(true);

    setShowCreateAPNoteDialog(false);
    setSelectedForAPNote(null);

    // Reset form
    setApNoteForm({
      apNoteNo:
        "AP/" +
        "WNS" + ".MDN/" +
        new Date().toISOString().slice(2, 4) +
        String(new Date().getMonth() + 1).padStart(2, "0") + "/" +
        String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
      apNoteDate: getTodayYYYYMMDD(),
      currency: "IDR",
      invoiceNumber: "",
      term: "CREDIT",
      documentReceivedDate: getTodayYYYYMMDD(),
      remarks: "",
      supplierName: "",
      pt: "MJS",
      discount: 0,
      tax: 0,
      pph: 0,
    });
    setSelectedDocType("AP NOTE");
  };

  const handleAPNoteNavigation = (apNoteNo: string) => {
    // Close dialog
    setShowAPNoteListDialog(false);
    setSelectedForAPNote(null);

    // Find the IC that created this AP Note
    const sourceIC = importCostData.find((ic) =>
      ic.apNotes?.some((note) => note.apNoteNo === apNoteNo),
    );

    // Get the actual AP Note ID from state mapping (already populated on mount)
    const apNoteId = apNoteMapping[apNoteNo];

    console.log(
      "=== handleAPNoteNavigation Debug ===",
      "apNoteNo:",
      apNoteNo,
      "apNoteId from state mapping:",
      apNoteId,
      "apNoteMapping state:",
      apNoteMapping,
    );

    // Store comprehensive mapping for reverse navigation (APNote → ImportCost)
    const apNoteToICMapping = JSON.parse(
      localStorage.getItem("apNoteToIC_mapping") || "{}",
    );
    if (sourceIC) {
      apNoteToICMapping[apNoteNo] = {
        icNum: sourceIC.icNum,
        icId: sourceIC.id,
        apNoteNo: apNoteNo,
        apNoteId: apNoteId,
      };
      localStorage.setItem(
        "apNoteToIC_mapping",
        JSON.stringify(apNoteToICMapping),
      );
      console.log(
        "=== APNote to IC Mapping Stored ===",
        apNoteToICMapping,
      );
    }

    if (onNavigateToAPNote && apNoteId) {
      // Pass IC number so APNote can show "View in Import Cost" button
      // Store in sessionStorage for APNote to access
      sessionStorage.setItem(
        "linkedICNumber",
        sourceIC?.icNum || "",
      );
      sessionStorage.setItem("linkedICId", sourceIC?.id || "");
      sessionStorage.setItem("linkedAPNoteNo", apNoteNo);
      // Store AP Note ID to auto-expand the card in APNote component
      sessionStorage.setItem("selectedAPNoteId", apNoteId);
      console.log(
        "=== Navigating to APNote ===",
        "APNoteNo:",
        apNoteNo,
        "APNoteId:",
        apNoteId,
        "SourceIC:",
        sourceIC?.icNum,
      );
      onNavigateToAPNote(apNoteId);
    } else {
      if (!onNavigateToAPNote) {
        console.warn(
          "=== onNavigateToAPNote callback NOT provided ===",
        );
      }
      if (!apNoteId) {
        console.warn(
          "=== apNoteId NOT found in mapping for:",
          apNoteNo,
        );
      }
    }
  };

  // Handle navigation back from APNote to ImportCost
  const handleNavigateFromAPNote = (icNum: string) => {
    console.log(
      "=== Navigating from APNote back to ImportCost ===",
      icNum,
    );
    // This will trigger the useEffect below to auto-expand and scroll
    // The selectedICNo prop will be updated from App.tsx through parent
  };

  const handleCreateImportCost = () => {
    const newImportCost: ImportCostData = {
      id: Date.now().toString(),
      icNum: createForm.icNum,
      type: createForm.type,
      icDate: createForm.icDate,
      supplierName: createForm.supplierName,
      totalImportCost: createForm.totalImportCost,
      createdBy: createForm.createdBy,
      company: createForm.company,
      approvalStatus: "Pending",
      poNo: createForm.poNo,
      invoiceNo: createForm.invoiceNo,
    };

    setImportCostData([newImportCost, ...importCostData]);
    setShowCreateDialog(false);

    // Reset form
    setCreateForm({
      icNum:
        "IC-2025-" +
        String(Math.floor(Math.random() * 1000)).padStart(
          3,
          "0",
        ),
      type: "Sea",
      icDate: getTodayYYYYMMDD(),
      supplierName: "",
      totalImportCost: 0,
      createdBy: "ANDI WIJAYA",
      company: "WNS",
      poNo: "",
      invoiceNo: "",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filter Tabs - Row 1: Status and PT */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "status" ? null : "status",
            )
          }
          className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${
              activeFilterType === "status" ||
              statusFilter !== "all"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
        >
          {statusFilter === "all"
            ? "ALL STATUS"
            : statusFilter.toUpperCase()}
        </button>

        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "pt" ? null : "pt",
            )
          }
          className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${
              activeFilterType === "pt" ||
              companyFilter !== "ALL PT"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
        >
          {companyFilter}
        </button>
      </div>

      {/* Dynamic Filter Details Row - Fixed height to prevent layout shift */}
      <div className="h-[44px] flex items-center overflow-hidden">
        <div className="flex flex-1 items-center gap-1.5">
          {activeFilterType === "status" &&
            [
              "all",
              "Pending",
              "Approved",
              "Verified",
              "Complete",
            ].map((key) => {
              const isSelected = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(key);
                    setActiveFilterType(null);
                  }}
                  className={`
                    flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                    }
                  `}
                >
                  {key === "all"
                    ? "ALL STATUS"
                    : key.toUpperCase()}
                </button>
              );
            })}

          {activeFilterType === "pt" &&
            [
              "ALL PT",
              "AMT",
              "GMI",
              "MJS",
              "TTP",
              "WNS",
              "WSI",
              "IMI",
            ].map((key) => {
              const isSelected = companyFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setCompanyFilter(key as PTType);
                    setActiveFilterType(null);
                  }}
                  className={`
                    flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                    }
                  `}
                >
                  {key}
                </button>
              );
            })}
        </div>
      </div>

      {/* Header with buttons */}
      <div className="flex items-center justify-end gap-3">
        {/* Clear Filter Button - Only show when filters are active */}
        {(statusFilter !== "all" || companyFilter !== "ALL PT") && (
          <Button
            onClick={() => {
              statusFilter !== "all" && setStatusFilter("all");
              companyFilter !== "ALL PT" && setCompanyFilter("ALL PT");
              setActiveFilterType(null);
            }}
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                    title="Clear all filters"
          >
            ✕ Clear Filters
          </Button>
        )}
        
        <Button
          onClick={() => setShowCalendarDialog(true)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          size="lg"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Filter Date
        </Button>
      
        <Button
          onClick={handleExpandAll}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {expandAll ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expand All
            </>
          )}
        </Button>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      {/* Document Counter */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-purple-700">
          {filteredData.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-purple-700">
          {importCostData.length}
        </span>{" "}
        documents
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="🔍 Search by IC Number or Invoice Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-purple-200 focus:border-purple-400"
        />
      </div>

      {/* Import Cost List */}
      <div className="space-y-3">
        {filteredData.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          return (
            <motion.div
              id={`ic-collapsible-${item.id}`}
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100"
              style={{
                background:
                  "linear-gradient(135deg, #DCCCEC 0%, #E8DDEF 15%, #F0E6F3 30%, #F4EDFA 45%, #F8F5FC 60%, #FAFAFF 75%, #FCFCFF 85%, #FFFFFF 100%)",
              }}
            >
              {/* Collapsed View */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                  {/* Left Section */}
                  <div className="flex items-center gap-3 col-span-2 md:col-span-2 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 font-mono min-w-[180px]">
                          {item.icNum}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {item.company}
                        </Badge>
                        <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm truncate">
                          {item.supplierName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge + Total Import Cost (Desktop Only) */}
                  <div className="hidden md:flex items-center gap-4 col-span-3 justify-end">
                    {/* Badge: Approved */}
                    {(item.approvalStatus === "Approved" ||
                      item.approvalStatus === "Verified" ||
                      item.approvalStatus === "Complete") && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    )}

                    {/* Badge: Verified */}
                    {(item.approvalStatus === "Verified" ||
                      item.approvalStatus === "Complete") &&
                      item.verifiedStatus && (
                        <Badge
                          variant="outline"
                          className={
                            !item.isUnverified
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {!item.isUnverified && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {!item.isUnverified
                            ? "Verified"
                            : "- Verified"}
                        </Badge>
                      )}

                    {/* Badge: Complete */}
                    {item.approvalStatus === "Complete" && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    )}

                    {/* Badge: Pending */}
                    {item.approvalStatus === "Pending" && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-700 border-yellow-200"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}

                    {/* Badge: Void */}
                    {item.isVoided && (
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-700 border-red-200"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Void
                      </Badge>
                    )}

                    {/* Total Import Cost + Expand Icon */}
                    <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center w-36">
                        <span className="text-green-900 font-medium text-sm">
                          {item.currency || "IDR"}
                        </span>
                        <span className="text-green-900 font-medium text-sm text-right">
                          {formatNumber(item.totalImportCost)}
                        </span>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                {/* Mobile Status Badge */}
                <div className="flex md:hidden items-center gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className={getStatusColor(
                      item.approvalStatus,
                    )}
                  >
                    {item.approvalStatus}
                  </Badge>
                  {(item.approvalStatus === "Verified" ||
                    item.approvalStatus === "Complete") &&
                    item.verifiedStatus && (
                      <Badge
                        variant="outline"
                        className={
                          !item.isUnverified
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {!item.isUnverified
                          ? "Verified"
                          : "- Verified"}
                      </Badge>
                    )}
                  {item.approvalStatus === "Complete" && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      Complete
                    </Badge>
                  )}
                  {item.isVoided && (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-200"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Void
                    </Badge>
                  )}
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
                            {item.supplierName}
                          </span>
                        </div>
                      </div>
                      {/* Combined Info Row */}
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <div className="grid grid-cols-5 gap-4">
                          {/* Type */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {getTypeIcon("Sea")}
                              <span className="text-gray-500 text-xs">
                                Type
                              </span>
                            </div>
                            <div className="text-gray-900 text-sm">
                              Sea
                            </div>
                          </div>

                          {/* IC Date */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-gray-500 text-xs">
                                IC Date
                              </span>
                            </div>
                            <div className="text-gray-900 text-sm">
                              {formatDateToDDMMYYYY(
                                item.icDate,
                              )}
                            </div>
                          </div>

                          {/* Pay To */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-gray-500 text-xs">
                                Pay To
                              </span>
                            </div>
                            <div className="text-gray-900 text-sm">
                              {item.supplierName}
                            </div>
                          </div>

                          {/* Created By */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <User className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-gray-500 text-xs">
                                Created By
                              </span>
                            </div>
                            <div className="text-gray-900 text-sm">
                              {item.createdBy}
                            </div>
                          </div>

                          {/* Approval Date */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-gray-500 text-xs">
                                Approval Date
                              </span>
                            </div>
                            <div className="text-gray-900 text-sm">
                              {item.approvalDate
                                ? formatDateToDDMMYYYY(
                                    item.approvalDate,
                                  )
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {item.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-red-700 mb-1">
                                Rejection Reason
                              </div>
                              <div className="text-red-600">
                                {item.rejectionReason}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex items-center gap-3 flex-wrap">
                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetail(item);
                            setActiveDetailTab("items");
                            setShowDetailDialog(true);
                          }}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {/* Verify button - show for all statuses */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              item.approvalStatus ===
                                "Approved" ||
                              item.isUnverified
                            ) {
                              setSelectedForLink(item);
                              setShowLinkDialog(true);
                            } else if (
                              item.approvalStatus ===
                                "Verified" ||
                              item.approvalStatus === "Complete"
                            ) {
                              setSelectedForUndo(item);
                              setShowUndoVerifyDialog(true);
                            }
                          }}
                          disabled={
                            item.approvalStatus === "Pending" ||
                            item.isVoided
                          }
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {(item.approvalStatus ===
                            "Verified" ||
                            item.approvalStatus ===
                              "Complete") &&
                          !item.isUnverified
                            ? "Verified"
                            : "Verify"}
                        </Button>

                        {/* Link Documents Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForLinkedDocs(item);
                            setShowLinkedDocsDialog(true);
                          }}
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 relative pr-8"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link
                          {(() => {
                            let count = 0;
                            // Count linked documents, exclude any PVR entries as we count them specifically
                            if (item.linkedDocs?.length) {
                              const nonPVRDocs = item.linkedDocs.filter((doc: any) => 
                                doc.type !== "PVR" && doc.documentType !== "PVR"
                              );
                              count += nonPVRDocs.length;
                            }

                            // Find linked AP Notes (Expense Notes)
                            try {
                              const savedAPNotes = localStorage.getItem("createdAPNotes");
                              if (savedAPNotes) {
                                const allAPNotes = JSON.parse(savedAPNotes);
                                const apNotesCount = allAPNotes.filter((note: any) => 
                                  note.linkedICId === item.id || 
                                  (note.poNumber && item.poNo && note.poNumber === item.poNo)
                                ).length;
                                count += apNotesCount;
                              }
                            } catch (e) {}

                            // Note: PVRs are NOT counted in the badge
                        
                          })()}
                        </Button>

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
                                This Purchase Order has already been fully paid.
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

                        {/* PVR button*/}
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            const today = getTodayDate();

                            // Check if this Import Cost is already linked to any PVR in local storage
                            const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
                            const isLinkedToPVR = existingPVRs.some((pvr: any) => 
                              pvr.linkedDocs?.some((doc: any) => 
                                doc.icNum === item.icNum || 
                                doc.invoiceNo === item.icNum || 
                                doc.piNo === item.icNum
                              )
                            );

                            const ptMatch = (item.poNo || "").match(/\/([A-Z]+)\./);
                            const ptCode = ptMatch
                              ? ptMatch[1]
                              : (item.company as string) || "GMI";

                            if (isLinkedToPVR) {
                              // If linked, setup empty form and show warning first
                              setPvrForm({
                                pvrNo: generatePVRNumber(ptCode, today),
                                pvrDate: today,
                                supplierName: "",
                                term: "Credit",
                                currency: "IDR",
                                rate: 1,
                                pt: ptCode as any,
                                bankAccount: "",
                                paymentMethod: "Transfer",
                                reference: "",
                                remarks: "",
                              });
                              setLinkedPIs([]);
                              setShowFullyPaidWarning(true);
                              return;
                            }

                            // If not linked, proceed with IC-only PVR logic (Separated from PO and PI)
                            // Create document entry for the selected Import Cost
                            const icDocument = {
                              id: item.icId || `ic-${Date.now()}`,
                              piNo: item.icNum,
                              icNum: item.icNum,
                              poNo: item.poNo || "",
                              invoiceNo: item.icNum,
                              invoiceDate: item.icDate || "",
                              currency: item.currency || "IDR",
                              documentType: "IC",
                              totalAmount: item.totalImportCost || 0,
                              status: item.approvalStatus || "Complete",
                            };

                            // Initialize PVR form ONLY with the Import Cost details
                            setPvrForm({
                              pvrNo: generatePVRNumber(
                                ptCode,
                                today,
                              ),
                              pvrDate: today,
                              supplierName: item.supplierName || "",
                              term: "Credit",
                              currency: item.currency || "IDR",
                              rate: 1,
                              pt: ptCode as any,
                              bankAccount: "",
                              paymentMethod: "Transfer",
                              reference: item.icNum || "",
                              remarks: `PVR for Import Cost: ${item.icNum}`,
                            });

                            // ONLY include the Import Cost in linked items for this PVR
                            setLinkedPIs([icDocument]);

                            setShowCreatePVRDialog(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          PVR
                        </Button>


                        {/* Void Button - Always show for all status */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForVoid(item);
                            setShowVoidDialog(true);
                          }}
                          disabled={item.isVoided}
                          variant="outline"
                          className={
                            item.isVoided
                              ? "border-gray-300 text-gray-400 cursor-not-allowed hover:bg-transparent"
                              : "border-red-200 text-red-700 hover:bg-red-50"
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {item.isVoided ? "Voided" : "Void"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredData.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No import costs found
            </p>
          </Card>
        )}
      </div>

      {/* Create Import Cost Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Import Cost</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new import cost
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IC Number</Label>
                <Input
                  value={createForm.icNum}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      icNum: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      type: value as ICType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sea">Sea</SelectItem>
                    <SelectItem value="Air">Air</SelectItem>
                    <SelectItem value="Courier">
                      Courier
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>IC Date</Label>
                <Input
                  type="date"
                  value={createForm.icDate}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      icDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Company</Label>
                <Select
                  value={createForm.company}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      company: value as PTType,
                    })
                  }
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
              <div className="col-span-2">
                <Label>Supplier Name</Label>
                <Input
                  value={createForm.supplierName}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      supplierName: e.target.value,
                    })
                  }
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <Label>Total Import Cost</Label>
                <Input
                  type="number"
                  value={createForm.totalImportCost}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      totalImportCost: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Created By</Label>
                <Select
                  value={createForm.createdBy}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      createdBy: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bryson">
                      Bryson
                    </SelectItem>
                    <SelectItem value="Andi">Andi</SelectItem>
                    <SelectItem value="Siti">Siti</SelectItem>
                    <SelectItem value="Bambang">
                      Bambang
                    </SelectItem>
                    <SelectItem value="Dewi">Dewi</SelectItem>
                    <SelectItem value="Rudi">Rudi</SelectItem>
                    <SelectItem value="Lisa">Lisa</SelectItem>
                    <SelectItem value="Tommy">Tommy</SelectItem>
                    <SelectItem value="Maya">Maya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>PO No</Label>
                <Input
                  value={createForm.poNo}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      poNo: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Invoice No</Label>
                <Input
                  value={createForm.invoiceNo}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      invoiceNo: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateImportCost}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Import Cost</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this import cost?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproval}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <Dialog
        open={showVoidDialog}
        onOpenChange={setShowVoidDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Void Import Cost</DialogTitle>
            <DialogDescription>
              Are you sure you want to void this import cost?
              This action will mark the document as voided.
            </DialogDescription>
          </DialogHeader>
          {selectedForVoid && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div
                className="space-y-2"
                style={{ width: "500px" }}
              >
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    IC Number:
                  </span>
                  <span className="font-medium">
                    {selectedForVoid.icNum}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Supplier:
                  </span>
                  <span className="font-medium">
                    {selectedForVoid.supplierName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total Cost:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedForVoid.totalImportCost,
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVoidDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVoid}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Void
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog - Must Verify First */}
      <Dialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Verification Required
            </DialogTitle>
            <DialogDescription>
              Import Cost must be Verified first before creating
              Expense Note.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => setShowWarningDialog(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Verify Import Cost</DialogTitle>
            <DialogDescription>
              This will mark the import cost as Verified.
            </DialogDescription>
          </DialogHeader>
          <div style={{ width: "500px" }}>
            {selectedForLink && (
              <div className="p-4 bg-purple-50 rounded-lg w-full">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      IC Number:
                    </span>
                    <span>{selectedForLink.icNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Supplier:
                    </span>
                    <span>{selectedForLink.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total Cost:
                    </span>
                    <span>
                      {formatCurrency(
                        selectedForLink.totalImportCost,
                        selectedForLink.currency || "IDR",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Verify Dialog */}
      <Dialog
        open={showUndoVerifyDialog}
        onOpenChange={setShowUndoVerifyDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Undo Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo the verification?
              This will change the status back to Approved.
            </DialogDescription>
          </DialogHeader>
          <div>
            {selectedForUndo && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 w-full">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      IC Number:
                    </span>
                    <span>{selectedForUndo.icNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Supplier:
                    </span>
                    <span>{selectedForUndo.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total Cost:
                    </span>
                    <span>
                      {formatCurrency(
                        selectedForUndo.totalImportCost,
                        selectedForUndo.currency || "IDR", // ambil dari mock data, fallback IDR
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUndoVerifyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleUndoVerify}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Undo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      >
        <DialogContent
          className="w-[1600px] h-[800px]  flex flex-col overflow-hidden"
          hideCloseButton
        >
          <DialogHeader className="mb-0">
            <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
              <Receipt className="w-fit" />
              Import Cost Detail
            </DialogTitle>
          </DialogHeader>

          {selectedDetail && (
            <div className="pt-2 h-[900px]  flex flex-col overflow-hidden">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 mb-3">
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <div className="text-xs text-purple-600 mb-1">
                      IC Number
                    </div>
                    <div className="font-semibold text-purple-900 text-sm">
                      {selectedDetail.icNum}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-purple-600 mb-1">
                      IC Date
                    </div>
                    <div className="font-semibold text-purple-900 text-sm">
                      {selectedDetail?.icDate
                        ? formatDateToDDMMYYYY(
                            selectedDetail.icDate,
                          )
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-purple-600 mb-1">
                      Supplier Name
                    </div>
                    <div className="font-semibold text-purple-900 text-sm truncate">
                      {selectedDetail.supplierName}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-purple-600 mb-1">
                      Invoice Date
                    </div>
                    <div className="font-semibold text-purple-900 text-sm">
                      {selectedDetail?.icDate
                        ? formatDateToDDMMYYYY(
                            selectedDetail.icDate,
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* 👇 Invoice Number di div terpisah, full width dengan garis pemisah */}
                <div className="mt-4 border-t border-purple-200 pt-3">
                  <div className="text-xs text-purple-600 mb-1">
                    Invoice Number
                  </div>
                  <div
                    className="font-semibold text-purple-900 text-sm w-full truncate"
                    title={selectedDetail?.invoiceNo || "N/A"}
                  >
                    {selectedDetail?.invoiceNo || "N/A"}
                  </div>
                </div>
              </div>

              {/* Tabs above Items Table */}
              <div className="flex items-center justify-between border-b border-gray-200 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDetailTab("items")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeDetailTab === "items"
                        ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Items
                  </button>
                  <button
                    onClick={() =>
                      setActiveDetailTab("details")
                    }
                    className={`px-4 py-2 text-sm font-medium ${
                      activeDetailTab === "details"
                        ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() =>
                      setActiveDetailTab("remarks")
                    }
                    className={`px-4 py-2 text-sm font-medium ${
                      activeDetailTab === "remarks"
                        ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Remarks
                  </button>
                  <button
                    onClick={() =>
                      setActiveDetailTab("history")
                    }
                    className={`px-4 py-2 text-sm font-medium ${
                      activeDetailTab === "history"
                        ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Activity Log
                  </button>
                </div>
                {activeDetailTab === "items" && (
                  <div className="flex items-center gap-2 pr-4">
                    <button
                      onClick={() => {
                        const allPoKeys = new Set([
                          "po-1",
                          "po-2",
                          "po-3",
                          "po-4",
                          "po-5",
                        ]);
                        if (expandedDetailItems.size === 5) {
                          setExpandedDetailItems(new Set());
                        } else {
                          setExpandedDetailItems(allPoKeys);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 border border-purple-600 rounded transition-colors"
                    >
                      {expandedDetailItems.size === 5
                        ? "Collapse All"
                        : "Expand All"}
                    </button>
                  </div>
                )}
              </div>

              {/* Tables Container */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 h-[800px]">
                {/* Items Tab */}
                {activeDetailTab === "items" && (
                  <div className="overflow-y-auto border-b border-gray-200 h-full">
                    <table className="w-full  h-full table-fixed">
                      {/* Table Header - Always Visible */}
                      <thead className="bg-purple-50 sticky top-0 z-10">
                        <tr className="h-12">
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                            style={{ width: "20%" }}
                          >
                            PO No
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "15%" }}
                          >
                            Item Code
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "25%" }}
                          >
                            Item Name
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "15%" }}
                          >
                            PO Date
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "15%" }}
                          >
                            CBM
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "10%" }}
                          >
                            Weight
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "8%" }}
                          >
                            Box
                          </th>
                          <th
                            className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b"
                            style={{ width: "7%" }}
                          >
                            Charges
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* 5 PO Rows */}
                        {[
                          {
                            poKey: "po-1",
                            poNo: "PO-2025-001",
                            itemCode: "ITM-001",
                            itemName: "Electronic Components",
                            poDate: "2025-01-15",
                          },
                          {
                            poKey: "po-2",
                            poNo: "PO-2025-002",
                            itemCode: "ITM-002",
                            itemName: "Mechanical Parts",
                            poDate: "2025-01-18",
                          },
                          {
                            poKey: "po-3",
                            poNo: "PO-2025-003",
                            itemCode: "ITM-003",
                            itemName: "Raw Materials",
                            poDate: "2025-01-20",
                          },
                          {
                            poKey: "po-4",
                            poNo: "PO-2025-004",
                            itemCode: "ITM-004",
                            itemName: "Packaging Materials",
                            poDate: "2025-01-22",
                          },
                          {
                            poKey: "po-5",
                            poNo: "PO-2025-005",
                            itemCode: "ITM-005",
                            itemName: "Testing Equipment",
                            poDate: "2025-01-25",
                          },
                        ].map((po) => (
                          <AnimatePresence key={po.poKey}>
                            {/* Main PO Row */}
                            <tr
                              key={`${po.poKey}-main`}
                              onClick={() => {
                                const newExpanded = new Set(
                                  expandedDetailItems,
                                );
                                if (newExpanded.has(po.poKey)) {
                                  newExpanded.delete(po.poKey);
                                } else {
                                  newExpanded.add(po.poKey);
                                }
                                setExpandedDetailItems(
                                  newExpanded,
                                );
                              }}
                              className="hover:bg-purple-50/50 border-b cursor-pointer transition-colors h-12"
                            >
                              <td className="px-4 py-2 flex items-center gap-2">
                                <motion.div
                                  animate={{
                                    rotate:
                                      expandedDetailItems.has(
                                        po.poKey,
                                      )
                                        ? 180
                                        : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.div>
                                <span className="text-sm font-semibold text-purple-700">
                                  {po.poNo}
                                </span>
                              </td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                              <td className="text-xs px-4 py-2"></td>
                            </tr>

                            {/* Expanded Detail Row */}
                            {expandedDetailItems.has(
                              po.poKey,
                            ) && (
                              <motion.tr
                                key={`${po.poKey}-detail`}
                                initial={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-purple-50/30 border-b h-12"
                              >
                                <td className="px-4 py-2"></td>
                                <td className="text-xs px-4 py-2 font-medium">
                                  {po.itemCode}
                                </td>
                                <td className="text-xs px-4 py-2 font-medium">
                                  {po.itemName}
                                </td>
                                <td className="text-xs px-4 py-2">
                                  {po.poDate}
                                </td>
                                <td className="text-xs px-4 py-2">
                                  {(Math.random() * 10).toFixed(
                                    2,
                                  )}{" "}
                                  m³
                                </td>
                                <td className="text-xs px-4 py-2">
                                  {(
                                    Math.random() * 1000
                                  ).toFixed(0)}{" "}
                                  kg
                                </td>
                                <td className="text-xs px-4 py-2">
                                  {Math.floor(
                                    Math.random() * 100,
                                  ) + 1}
                                </td>
                                <td className="text-xs px-4 py-2">
                                  {formatCurrency(
                                    Math.random() * 10000,
                                  )}
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Details Tab */}
                {activeDetailTab === "details" && (
                  <div className="p-6 space-y-4 overflow-y-auto h-full">
                    {/* Expense Table */}
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Expense
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-purple-50">
                            <tr>
                              <th className="p-3 text-left text-sm font-semibold text-purple-900 border-b border-purple-200">
                                Cost Vendor
                              </th>
                              <th className="p-3 text-left text-sm font-semibold text-purple-900 border-b border-purple-200">
                                PO Number
                              </th>
                              <th className="p-3 text-right text-sm font-semibold text-purple-900 border-b border-purple-200">
                                Amount
                              </th>
                              <th className="p-3 text-left text-sm font-semibold text-purple-900 border-b border-purple-200">
                                Pay To
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                costVendor:
                                  "Freight Forwarder A",
                                poNumber: "PO-2025-001",
                                amount: 45000000,
                                payTo: "PT Logistik Prima",
                              },
                              {
                                costVendor: "Customs Broker",
                                poNumber: "PO-2025-002",
                                amount: 35000000,
                                payTo: "PT Bea Cukai Services",
                              },
                           
                            ].map((expense, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                              >
                                <td className="p-3 text-sm text-gray-900 font-medium">
                                  {expense.costVendor}
                                </td>
                                <td className="p-3 text-sm text-gray-700">
                                  {expense.poNumber}
                                </td>
                                <td className="p-3 text-sm text-right text-purple-900 font-semibold">
                                  {formatCurrency(
                                    expense.amount,
                                  )}
                                </td>
                                <td className="p-3 text-sm text-gray-700">
                                  {expense.payTo}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remarks Tab */}
                {activeDetailTab === "remarks" && (
                  <div className="p-6 overflow-y-auto h-full flex flex-col">
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="bg-white rounded-lg border border-gray-300 p-4 flex-1 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedDetail?.remarks ||
                            "Remarks By Shipment"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeDetailTab === "history" && (
                  <div className="p-6 overflow-y-auto h-full">
                    {selectedDetail?.history &&
                    selectedDetail.history.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
                          <Clock className="w-5 h-5" />
                          Activity Timeline
                        </h3>
                        <div className="relative">
                          {/* Timeline */}
                          <div className="space-y-6">
                            {selectedDetail.history
                              .filter((record) => {
                                // If status is PENDING APPROVAL, only show Create action
                                if (
                                  selectedDetail.status ===
                                  "PENDING APPROVAL"
                                ) {
                                  return (
                                    record.action === "Create"
                                  );
                                }
                                // For other statuses, show all records
                                return true;
                              })
                              .map(
                                (
                                  record,
                                  index,
                                  filteredArray,
                                ) => {
                                  const getActionColor = (action: string) =>
                                    "bg-purple-50 text-purple-700 border-purple-200";

                                  return (
                                    <div
                                      key={record.id}
                                      className="flex gap-4"
                                    >
                                      {/* Timeline dot */}
                                      <div className="flex flex-col items-center">
                                        <div className="w-4 h-4 bg-purple-600 rounded-full mt-1.5" />
                                        {index <
                                          filteredArray.length -
                                            1 && (
                                          <div className="w-0.5 h-12 bg-purple-200 my-2" />
                                        )}
                                      </div>

                                      {/* History card */}
                                      <div className="flex-1 pb-2">
                                        <div
                                          className={`p-4 rounded-lg border-2 ${getActionColor(
                                            record.action,
                                          )}`}
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="font-semibold text-sm">
                                              {record.action ===
                                              "Expense Note Create"
                                                ? `${record.action} - ${record.expenseNoteNo}`
                                                : record.action}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              {record.date} •{" "}
                                              {record.time}
                                            </div>
                                          </div>
                                          <div className="text-sm">
                                            PIC:{" "}
                                            <span className="font-medium">
                                              {record.picName}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No history records yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-4 space-y-4 bg-white">
                {(() => {
                  const totalAmount =
                    selectedDetail?.items &&
                    selectedDetail.items.length > 0
                      ? selectedDetail.items.reduce(
                          (sum, item) =>
                            sum + (item.totalAmount || 0),
                          0,
                        )
                      : selectedDetail?.linkedDocs &&
                          selectedDetail.linkedDocs.length > 0
                        ? selectedDetail.linkedDocs.reduce(
                            (sum, doc) =>
                              sum + (doc.totalAmount || 0),
                            0,
                          )
                        : 0;

                  const totalOtherCost = otherCosts.reduce(
                    (sum, cost) => sum + (cost.costAmount || 0),
                    0,
                  );
                  const grandTotalValue =
                    totalAmount -
                    (editDiscount || 0) +
                    (selectedDetail?.tax || 0) -
                    (selectedDetail?.pph || 0) +
                    totalOtherCost;

                  return (
                    (activeDetailTab === "items" ||
                      activeDetailTab === "details") && (
                      <div className="flex justify-end">
    
                        {/* financial summary import cost detail */}
                        <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                          <div className="flex-1 flex align-end flex-col justify-between">
                            {/* Total Amount */}
                            <div className="flex items-center">
                              <span className="text-gray-700 text-sm flex-1 font-bold">
                                Total Amount
                              </span>
                              <span className="text-gray-700 text-sm w-12 text-center font-bold">
                                {selectedDetail.currency || "IDR"}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right"></span>
                              <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                {formatNumber(totalAmount)}
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
                                    setIsEditingDiscount(
                                      !isEditingDiscount,
                                    );
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
                                {selectedDetail.currency || "IDR"}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right font-bold">
                                (
                              </span>
                              {isEditingDiscount ? (
                                <input
                                  type="number"
                                  value={editDiscount}
                                  onChange={(e) =>
                                    setEditDiscount(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="text-gray-900 text-sm border rounded px-2 py-1 font-bold w-[114px] text-right"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                  {formatNumber(
                                    Math.abs(editDiscount || 0),
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
                                {selectedDetail.currency || "IDR"}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right"></span>
                              <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                {formatNumber(selectedDetail.tax || 0)}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-left"></span>
                            </div>

                            {/* PPH */}
                            <div className="flex items-center">
                              <span className="text-gray-700 text-sm flex-1 font-bold">
                                PPH
                              </span>
                              <span className="text-gray-700 text-sm w-12 text-center font-bold">
                                {selectedDetail.currency || "IDR"}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right font-bold">
                                (
                              </span>
                              <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                {formatNumber(
                                  Math.abs(selectedDetail.pph || 0),
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
                                  onClick={() =>
                                    setShowOtherCostDialog(true)
                                  }
                                  className="text-purple-600 hover:text-purple-700 transition-colors"
                                  title="View Other Cost Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </span>
                              <span className="text-gray-700 text-sm w-12 text-center font-bold">
                                {selectedDetail.currency || "IDR"}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right"></span>
                              <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                {formatCurrency(totalOtherCost)}
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
                                  {selectedDetail.currency || "IDR"}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-right"></span>
                                <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                  {formatNumber(grandTotalValue)}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-left"></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                     
                    )
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Close
                </Button>

                <Button
                  onClick={() => {
                    alert("Print functionality");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
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
                setSelectedDocType("AP NOTE");
                setShowDocTypeSelection(false);
                setTimeout(
                  () => setShowCreateAPNoteDialog(true),
                  100,
                );
              }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">
                    AP NOTE
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
                  () => setShowCreateAPNoteDialog(true),
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

      {/* Create AP Note Dialog */}
      <Dialog
        open={showCreateAPNoteDialog}
        onOpenChange={setShowCreateAPNoteDialog}
      >
        <DialogContent
          ref={mainDialogContentRef}
          className="w-[2700px] h-[800px] flex flex-col"
        >
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setApNoteForm({
                          ...apNoteForm,
                          supplierName: value,
                        });
                        if (value.length === 0) {
                          setShowSupplierDropdown(true);
                        } else if (
                          shouldShowSupplierDropdown(value)
                        ) {
                          setShowSupplierDropdown(true);
                        }
                      }}
                      onClick={() =>
                        setShowSupplierDropdown(true)
                      }
                      placeholder="Click to see suppliers or type"
                    />
                    {showSupplierDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-purple-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {supplierMasterData
                          .filter(
                            (s) =>
                              apNoteForm.supplierName
                                .length === 0 ||
                              s.name
                                .toLowerCase()
                                .includes(
                                  apNoteForm.supplierName.toLowerCase(),
                                ),
                          )
                          .sort((a, b) =>
                            a.name.localeCompare(b.name),
                          )
                          .map((supplier, idx) => (
                            <div
                              key={`supplier-create-${supplier.name}-${idx}`}
                              onClick={() =>
                                handleSupplierSelect(
                                  supplier,
                                )
                              }
                              className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                            >
                              <span>{supplier.name}</span>
                              <Badge
                                variant="outline"
                                className={
                                  supplier.category ===
                                  "OVERSEAS"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {supplier.category}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    )}
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
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>
                            Account Code
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>
                            Account Name
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>
                            Dept Code
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>
                            Dept Name
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>
                            Qty
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>
                            Unit Price
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountItems.length > 0 && (
                          <>
                            {accountItems.map((item, index) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Input
                                    disabled={isAutoPopulatedExpense(item)}
                                    value={item.category || ""}
                                    onChange={(e) => {
                                      const newItems = [...accountItems];
                                      newItems[index] = {
                                        ...newItems[index],
                                        category: e.target.value,
                                      };
                                      setAccountItems(newItems);
                                    }}
                                    placeholder="Category"
                                    className="min-w-[120px]"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Input
                                    disabled={isAutoPopulatedExpense(item)}
                                    value={item.description}
                                    onChange={(e) => {
                                      const newItems = [...accountItems];
                                      newItems[index] = {
                                        ...newItems[index],
                                        description: e.target.value,
                                      };
                                      setAccountItems(newItems);
                                    }}
                                    placeholder="Description"
                                    className="min-w-[150px]"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Select
                                    disabled={isAutoPopulatedExpense(item)}
                                    value={item.accountCode}
                                    onValueChange={(value) => {
                                      const selected = accountOptions.find(
                                        (opt) => opt.code === value,
                                      );
                                      if (!selected) return;

                                      const newItems = [...accountItems];
                                      newItems[index] = {
                                        ...newItems[index],
                                        accountCode: selected.code,
                                        accountName: selected.name,
                                      };
                                      setAccountItems(newItems);
                                      setAccountCodeSearchTerms({
                                        ...accountCodeSearchTerms,
                                        [index]: "",
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="min-w-[140px] px-3 py-2">
                                      <input
                                        type="text"
                                        value={
                                          accountCodeSearchTerms[index] ||
                                          item.accountCode ||
                                          ""
                                        }
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setAccountCodeSearchTerms({
                                            ...accountCodeSearchTerms,
                                            [index]: e.target.value,
                                          });
                                        }}
                                        onKeyDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        placeholder="Search account code"
                                        className="w-full bg-transparent border-none outline-none text-sm"
                                      />
                                    </SelectTrigger>

                                    <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                      <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                        <input
                                          type="text"
                                          placeholder="Search account code or name..."
                                          value={
                                            accountCodeSearchTerms[index]
                                          }
                                          onChange={(e) =>
                                            setAccountCodeSearchTerms({
                                              ...accountCodeSearchTerms,
                                              [index]: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                                        />
                                      </div>

                                      <div className="grid grid-cols-[100px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                        <div>Account Code</div>
                                        <div>Account Name</div>
                                      </div>

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
                                  <Input
                                    value={item.accountName}
                                    readOnly
                                    placeholder="Account Name"
                                    className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Select
                                    value={item.department || ""}
                                    onValueChange={(value) => {
                                      const selected = departmentOptions.find(
                                        (opt) => opt.code === value,
                                      );
                                      if (!selected) return;

                                      const newItems = [...accountItems];
                                      newItems[index] = {
                                        ...newItems[index],
                                        department: selected.code,
                                        deptDescription: selected.name,
                                      };
                                      setAccountItems(newItems);
                                      setDepartmentCodeSearchTerms({
                                        ...departmentCodeSearchTerms,
                                        [index]: "",
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="min-w-[140px]">
                                      <div className="flex items-center w-full">
                                        <input
                                          type="text"
                                          value={item.department || ""}
                                          placeholder="Select or search..."
                                          readOnly
                                          className="flex-1 bg-transparent border-none outline-none text-sm cursor-pointer"
                                        />
                                      </div>
                                    </SelectTrigger>

                                    <SelectContent className="w-[1000px] p-0 border border-gray-300 rounded-md overflow-hidden">
                                      <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                        <input
                                          type="text"
                                          placeholder="Search department code or name..."
                                          value={
                                            departmentCodeSearchTerms[index] ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setDepartmentCodeSearchTerms({
                                              ...departmentCodeSearchTerms,
                                              [index]: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                          autoFocus={true}
                                        />
                                      </div>

                                      <div className="grid grid-cols-[120px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                        <div>Dept Code</div>
                                        <div>Dept Name</div>
                                      </div>

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
                                  <Input
                                    value={item.deptDescription || ""}
                                    readOnly
                                    placeholder="Dept Name"
                                    className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Input
                                    type="number"
                                    disabled={isAutoPopulatedExpense(item)}
                                    value={item.qty}
                                    onChange={(e) => {
                                      const newItems = [...accountItems];
                                      newItems[index].qty = Number(
                                        e.target.value,
                                      );
                                      newItems[index].totalAmount =
                                        newItems[index].qty *
                                        newItems[index].unitPrice;
                                      setAccountItems(newItems);
                                    }}
                                    placeholder="QTY"
                                    className="min-w-[80px]"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Input
                                    type="text"
                                    disabled={isAutoPopulatedExpense(item)}
                                    value={formatNumber(item.unitPrice)}
                                    onChange={(e) => {
                                      const parsed = parseFloat(
                                        e.target.value
                                          .replace(/\./g, "")
                                          .replace(/,/g, "."),
                                      );
                                      const newItems = [...accountItems];
                                      newItems[index].unitPrice = isNaN(
                                        parsed,
                                      )
                                        ? 0
                                        : parsed;
                                      newItems[index].totalAmount =
                                        newItems[index].qty *
                                        newItems[index].unitPrice;
                                      setAccountItems(newItems);
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
                                    placeholder="Price"
                                    className="min-w-[100px]"
                                  />
                                </TableCell>

                                <TableCell>
                                  <Input
                                    type="text"
                                    value={
                                      item.totalAmount
                                        ? item.totalAmount.toLocaleString(
                                            "id-ID",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            },
                                          )
                                        : "0,00"
                                    }
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
                                        accountItems.filter((_, i) => i !== index),
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        )}
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
                          documentTypeLabel: "",
                          documentNo: "",
                          documentNoPO: "",
                          totalAmount: 0,
                        };
                        setLinkedDocs([...linkedDocs, newDoc]);

                        // Scroll to bottom after state updates
                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo({
                              top:
                                mainDialogScrollRef.current.scrollHeight +
                                500,
                              behavior: "smooth",
                            });
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
                                    disabled={isAutoPopulatedPIPO(index, doc)}
                                    open={
                                      isAutoPopulatedPIPO(index, doc) ? false : (openLinkedDocDropdown[
                                      index
                                      ] || false)
                                    }
                                    onOpenChange={(open) => {
                                      if (!isAutoPopulatedPIPO(index, doc)) {
                                        setOpenLinkedDocDropdown(
                                          {
                                            ...openLinkedDocDropdown,
                                            [index]: open,
                                          },
                                        );
                                      }
                                    }}
                                    value={doc.documentNo}
                                    onValueChange={(
                                      value,
                                    ) => {
                                      if (isAutoPopulatedPIPO(index, doc)) return;
                                      let selected: any;

                                      // Find selected based on documentType
                                      if (
                                        doc.documentType ===
                                        "IC"
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
                                    <SelectTrigger className={`min-w-[200px] px-3 py-2 border ${isAutoPopulatedPIPO(index, doc) ? 'border-gray-300 bg-gray-100 cursor-not-allowed pointer-events-none' : 'border-gray-300'}`}>
                                      <input
                                        type="text"
                                        placeholder="Select or search..."
                                        value={
                                          doc.documentNo || ""
                                        }
                                        readOnly
                                        disabled={isAutoPopulatedPIPO(index, doc)}
                                        className={`w-full bg-transparent border-none outline-none text-sm ${isAutoPopulatedPIPO(index, doc) ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
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
                    Discount ({apNoteForm.currency || "IDR"})
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
                      setApNoteForm({
                        ...apNoteForm,
                        discount: isNaN(parsed) ? 0 : parsed,
                      });
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
                      setApNoteForm({
                        ...apNoteForm,
                        tax: isNaN(parsed) ? 0 : parsed,
                      });
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
                      setApNoteForm({
                        ...apNoteForm,
                        pph: isNaN(parsed) ? 0 : parsed,
                      });
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>
              </div>

              {/*Financial Summary */}
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
                      className="flex-1 resize-none min-h-[152px]"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px]">
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
                          Math.abs(apNoteForm.discount || 0),
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
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateAPNoteDialog(false);
                    setAccountItems([]);
                    setLinkedDocs([]);
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
                    (accountItems.length === 0 &&
                      linkedDocs.length === 0) ||
                    (accountItems.length > 0 &&
                      !isAccountItemsValid())
                  }
                >
                  {selectedDocType === "AP DISC NOTE"
                    ? "Save AP DISC NOTE"
                    : "Save AP NOTE"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>


     {/* Calendar Filter Dialog */}
      <Dialog
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
      >
        <DialogContent className="w-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Filter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Filter documents by date and status
            </p>

     

            {/* Checkbox for today's date */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="calendarUseToday"
                checked={calendarUseTodayDate}
                onCheckedChange={(checked) => {
                  setCalendarUseTodayDate(checked as boolean);
                  if (checked) {
                    const today = getTodayDDMMYYYY();
                    setCalendarDateFrom(today);
                    setCalendarDateTo(today);
                  } else {
                    setCalendarDateFrom("");
                    setCalendarDateTo("");
                  }
                }}
              />
              <label
                htmlFor="calendarUseToday"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Use today's date ({getTodayDDMMYYYY()})
              </label>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Date From
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !calendarDateFrom &&
                        "text-muted-foreground"
                      } ${calendarDateFrom && !isValidDate(calendarDateFrom) ? "border-red-300 bg-red-50" : "border-purple-200"}`}
                      disabled={calendarUseTodayDate}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {calendarDateFrom &&
                      isValidDate(calendarDateFrom)
                        ? calendarDateFrom
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={
                        calendarDateFrom &&
                        isValidDate(calendarDateFrom)
                          ? new Date(
                              convertDDMMYYYYtoYYYYMMDD(
                                calendarDateFrom,
                              ),
                            )
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const day = String(
                            date.getDate(),
                          ).padStart(2, "0");
                          const month = String(
                            date.getMonth() + 1,
                          ).padStart(2, "0");
                          const year = date.getFullYear();
                          setCalendarDateFrom(
                            `${day}/${month}/${year}`,
                          );
                          setCalendarUseTodayDate(false);
                        }
                      }}
                      disabled={calendarUseTodayDate}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="text"
                        placeholder="Or type: DD/MM/YYYY"
                        value={calendarDateFrom}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleaned = value.replace(
                            /[^\d/]/g,
                            "",
                          );
                          let formatted = cleaned;

                          if (
                            cleaned.length >= 2 &&
                            !cleaned.includes("/")
                          ) {
                            formatted =
                              cleaned.slice(0, 2) +
                              "/" +
                              cleaned.slice(2);
                          }
                          if (
                            cleaned.length >= 5 &&
                            cleaned.split("/").length === 2
                          ) {
                            const parts = cleaned.split("/");
                            formatted =
                              parts[0] +
                              "/" +
                              parts[1].slice(0, 2) +
                              "/" +
                              parts[1].slice(2);
                          }

                          if (formatted.length <= 10) {
                            setCalendarDateFrom(formatted);
                            if (
                              calendarUseTodayDate &&
                              formatted !== getTodayDDMMYYYY()
                            ) {
                              setCalendarUseTodayDate(false);
                            }
                          }
                        }}
                        disabled={calendarUseTodayDate}
                        className="text-sm"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {calendarDateFrom &&
                  !isValidDate(calendarDateFrom) && (
                    <p className="text-xs text-red-500">
                      Invalid date format
                    </p>
                  )}
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Date To
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !calendarDateTo &&
                        "text-muted-foreground"
                      } ${calendarDateTo && !isValidDate(calendarDateTo) ? "border-red-300 bg-red-50" : "border-purple-200"}`}
                      disabled={calendarUseTodayDate}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {calendarDateTo &&
                      isValidDate(calendarDateTo)
                        ? calendarDateTo
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={
                        calendarDateTo &&
                        isValidDate(calendarDateTo)
                          ? new Date(
                              convertDDMMYYYYtoYYYYMMDD(calendarDateTo),
                            )
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const day = String(
                            date.getDate(),
                          ).padStart(2, "0");
                          const month = String(
                            date.getMonth() + 1,
                          ).padStart(2, "0");
                          const year = date.getFullYear();
                          setCalendarDateTo(
                            `${day}/${month}/${year}`,
                          );
                          setCalendarUseTodayDate(false);
                        }
                      }}
                      disabled={calendarUseTodayDate}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="text"
                        placeholder="Or type: DD/MM/YYYY"
                        value={calendarDateTo}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleaned = value.replace(
                            /[^\d/]/g,
                            "",
                          );
                          let formatted = cleaned;

                          if (
                            cleaned.length >= 2 &&
                            !cleaned.includes("/")
                          ) {
                            formatted =
                              cleaned.slice(0, 2) +
                              "/" +
                              cleaned.slice(2);
                          }
                          if (
                            cleaned.length >= 5 &&
                            cleaned.split("/").length === 2
                          ) {
                            const parts = cleaned.split("/");
                            formatted =
                              parts[0] +
                              "/" +
                              parts[1].slice(0, 2) +
                              "/" +
                              parts[1].slice(2);
                          }

                          if (formatted.length <= 10) {
                            setCalendarDateTo(formatted);
                            if (
                              calendarUseTodayDate &&
                              formatted !== getTodayDDMMYYYY()
                            ) {
                              setCalendarUseTodayDate(false);
                            }
                          }
                        }}
                        disabled={calendarUseTodayDate}
                        className="text-sm"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {calendarDateTo &&
                  !isValidDate(calendarDateTo) && (
                    <p className="text-xs text-red-500">
                      Invalid date format
                    </p>
                  )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-purple-200">
              <Button
                variant="outline"
                onClick={() => {
                  setCalendarDateFrom("");
                  setCalendarDateTo("");
                  setCalendarUseTodayDate(false);
                  setShowCalendarDialog(false);
                }}
              >
                Clear & Close
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  // Validate dates
                  const fromValid =
                    !calendarDateFrom ||
                    isValidDate(calendarDateFrom);
                  const toValid =
                    !calendarDateTo ||
                    isValidDate(calendarDateTo);

                  if (
                    fromValid &&
                    toValid &&
                    (calendarDateFrom || calendarDateTo)
                  ) {
                    // Apply the calendar filter based on the selected type
                    // Note: This is a placeholder - you'll need to implement date range filtering logic
                    console.log(
                      "Filtering from:",
                      calendarDateFrom,
                      "to:",
                      calendarDateTo,
                    );
                    console.log(
                      "Filter type:",
                      calendarFilterType,
                    );

                    // For now, just close the dialog
                    // TODO: Implement actual date range filtering in filteredData
                    setShowCalendarDialog(false);
                  }
                }}
                disabled={
                  (!calendarDateFrom && !calendarDateTo) ||
                  (calendarDateFrom &&
                    !isValidDate(calendarDateFrom)) ||
                  (calendarDateTo &&
                    !isValidDate(calendarDateTo))
                }
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AP Note List Dialog */}
      <Dialog
        open={showAPNoteListDialog}
        onOpenChange={setShowAPNoteListDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              Expense Note
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700 border-purple-200"
              >
                {selectedForAPNote?.apNotes?.length || 0}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Expense Note created for{" "}
              {selectedForAPNote?.icNum}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "500px" }}>
            {selectedForAPNote?.apNotes?.map((apNote) => {
              // Generate consistent ID from apNoteNo for matching navigation
              const apNoteId = `apn-${apNote.apNoteNo.replace(/\//g, "-")}`;
              return (
                <div
                  key={apNote.id}
                  id={apNoteId}
                  className="p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md hover:border-purple-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Receipt className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            console.log(
                              "Clicking AP Note:",
                              apNote.apNoteNo,
                            );
                            handleAPNoteNavigation(
                              apNote.apNoteNo,
                            );
                          }}
                          className="text-purple-700 hover:text-purple-900 font-medium underline text-left"
                        >
                          {apNote.apNoteNo}
                        </button>
                        <p className="text-sm text-gray-500">
                          {apNote.docType}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        apNote.docType === "AP DISC NOTE"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-purple-100 text-purple-700 border-purple-200"
                      }
                    >
                      {apNote.docType}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button
              onClick={() => {
                // Check if unverified - show warning
                if (selectedForAPNote?.isUnverified) {
                  setShowAPNoteListDialog(false);
                  setShowWarningDialog(true);
                  return;
                }
                setShowAPNoteListDialog(false);
                setTimeout(
                  () => setShowDocTypeSelection(true),
                  100,
                );
              }}
              disabled={selectedForAPNote?.isVoided}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Expense Note
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

      {/* Success Dialog - AP Note Created */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
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
              {savedDocType === "AP DISC NOTE"
                ? "AP Disc Note Saved"
                : "AP Note Saved"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">
                AP Note No
              </div>
              <div className="text-lg font-semibold text-purple-900">
                {savedApNoteNo}
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
                  {savedLinkedDocs.length === 0
                    ? 0
                    : savedLinkedDocs.reduce(
                        (total, doc) => {
                          // Skip Import Cost - it's the main document
                          if (doc.documentType === "IC") {
                            return total;
                          }
                          // Only count documents with actual content
                          if (
                            !doc.documentNo &&
                            !doc.documentNoPO
                          ) {
                            return total;
                          }
                          // Count PI/PO pairs as 2 separate units
                          if (
                            doc.documentType === "PI/PO"
                          ) {
                            return (
                              total +
                              (doc.documentNo ? 1 : 0) +
                              (doc.documentNoPO ? 1 : 0)
                            );
                          }
                          // Count other types as 1 unit each
                          return total + 1;
                        },
                        0,
                      )}
                </Badge>
              </div>
              {savedLinkedDocs.length > 0 && (
                <div
                  className="space-y-3"
                  style={{ width: "500px" }}
                >
                  {savedLinkedDocs.map((doc) => {
                    const docType = doc.documentType || "";

                    // Skip Import Cost - it's the main document
                    if (docType === "IC") {
                      return null;
                    }

                    if (docType === "PI/PO") {
                      return (
                        <div key={`pi-${doc.id}`}>
                          <div className="w-full p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="text-blue-700 font-medium">
                                    {doc.documentNo}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Purchase Invoice
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-700 border-blue-200"
                              >
                                PI
                              </Badge>
                            </div>
                          </div>

                          {doc.documentNoPO && (
                            <div className="w-full mt-2 p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                  <div>
                                    <p className="text-indigo-700 font-medium">
                                      {doc.documentNoPO}
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
                        </div>
                      );
                    }

                    if (docType === "PO") {
                      return (
                        <div
                          key={`po-${doc.id}`}
                          className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <div>
                                <p className="text-indigo-700 font-medium">
                                  {doc.documentNo}
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
                      );
                    }

                    if (docType === "IC") {
                      return (
                        <div
                          key={`ic-${doc.id}`}
                          className="p-4 bg-white border border-amber-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-amber-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="text-amber-700 font-medium">
                                  {doc.documentNo}
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
                        </div>
                      );
                    }

                    if (docType === "SR") {
                      return (
                        <div
                          key={`sr-${doc.id}`}
                          className="p-4 bg-white border border-green-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-green-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-green-700 font-medium">
                                  {doc.documentNo}
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
                        </div>
                      );
                    }

                    if (docType === "PVR") {
                      return (
                        <div
                          key={`pvr-${doc.id}`}
                          className="p-4 bg-white border border-orange-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-orange-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="text-orange-700 font-medium">
                                  {doc.documentNo}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Purchase Voucher Request
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-orange-100 text-orange-700 border-orange-200"
                            >
                              PVR
                            </Badge>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  // Close dialogs and reset form
                  setShowSuccessDialog(false);
                  setShowCreateAPNoteDialog(false);
                  setAccountItems([]);
                  setLinkedDocs([]);
                  setSavedLinkedDocs([]);
                  setAvailableDocsForSupplier([]);
                  setActiveCreateTabItems("items");
                }}
                className="bg-purple-600 hover:bg-purple-700"
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

                  // Count linked documents (Exclude PVRs here as we count them specifically below)
                  if (selectedForLinkedDocs?.linkedDocs && selectedForLinkedDocs.linkedDocs.length > 0) {
                    const nonPVRDocs = selectedForLinkedDocs.linkedDocs.filter((doc: any) => 
                      doc.type !== "PVR" && doc.documentType !== "PVR"
                    );
                    docCount += nonPVRDocs.length;
                  }

                  // Count linked PVRs - Include all PVRs for this IC
                  const linkedPVRs = selectedForLinkedDocs 
                    ? findLinkedPVRs("IC", selectedForLinkedDocs.icNum)
                    : [];
                  docCount += linkedPVRs.length;

                  // Count created expense notes from localStorage
                  let apNotes: any[] = [];
                  try {
                    const savedAPNotes = localStorage.getItem("createdAPNotes");
                    if (savedAPNotes) {
                      const allAPNotes = JSON.parse(savedAPNotes);
                      // Filter to only those linked to this IC by linkedICId OR by poNumber
                      apNotes = allAPNotes.filter((note: any) => 
                        note.linkedICId === selectedForLinkedDocs?.id || 
                        (note.poNumber && selectedForLinkedDocs?.poNo && note.poNumber === selectedForLinkedDocs.poNo)
                      );
                      docCount += apNotes.length;
                    }
                  } catch (error) {
                    console.error("Failed to load AP notes:", error);
                  }

                  return docCount;
                })()}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Documents linked with this Import Cost
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "500px" }}>
            {selectedForLinkedDocs?.linkedDocs &&
            selectedForLinkedDocs.linkedDocs.length > 0 ? (
              (() => {
                // First pass: find PO/PI pairs and display them
                const processedIndices = new Set<number>();
                const docElements: JSX.Element[] = [];

                // Debug logging
                console.log("=== Linked Documents Debug ===");
                console.log("selectedForLinkedDocs.linkedDocs:", selectedForLinkedDocs?.linkedDocs);
                console.log("Total docs:", selectedForLinkedDocs?.linkedDocs?.length);
                selectedForLinkedDocs?.linkedDocs?.forEach((doc: any, idx: number) => {
                  console.log(`Doc ${idx}: type="${doc.type}" docNo="${doc.docNo}" documentType="${doc.documentType}" documentNoPO="${doc.documentNoPO}"`);
                });

                // Helper function to create document element
                const createDocElement = (
                  linkedDoc: any,
                  idx: number,
                  docType: string,
                  badgeColor: string,
                  badgeText: string,
                  onClickHandler: () => void
                ) => (
                  <div
                    key={`linked-${idx}-${docType}`}
                    className={`p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                      docType === "PO" ? "border-indigo-200 hover:bg-indigo-50" :
                      docType === "PI" ? "border-blue-200 hover:bg-blue-50" :
                      docType === "SR" ? "border-green-200 hover:bg-green-50" :
                      "border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={onClickHandler}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${
                          docType === "PO" ? "text-indigo-600" :
                          docType === "PI" ? "text-blue-600" :
                          docType === "SR" ? "text-green-600" :
                          "text-purple-600"
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            docType === "PO" ? "text-indigo-700" :
                            docType === "PI" ? "text-blue-700" :
                            docType === "SR" ? "text-green-700" :
                            "text-purple-700"
                          }`}>
                            {linkedDoc.docNo || linkedDoc.purchaseInvoiceNo || linkedDoc.purchaseOrderNo || linkedDoc.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {linkedDoc.type || "Document"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={badgeColor}>
                        {badgeText}
                      </Badge>
                    </div>
                  </div>
                );

                // Process each document
                selectedForLinkedDocs.linkedDocs.forEach(
                  (linkedDoc: any, idx: number) => {
                    if (processedIndices.has(idx)) return;

                    console.log(`Processing doc ${idx}: documentType="${linkedDoc.documentType}" type="${linkedDoc.type}"`);

                    // Handle combined PI/PO type
                    if (linkedDoc.documentType === "PI/PO") {
                      console.log(`Found PI/PO combined: PI=${linkedDoc.docNo} PO=${linkedDoc.documentNoPO}`);
                      
                      // Create PO element
                      const poElement = createDocElement(
                        { ...linkedDoc, docNo: linkedDoc.documentNoPO },
                        idx,
                        "PO",
                        "bg-indigo-100 text-indigo-700 border-indigo-200",
                        "PO",
                        () => {
                          const foundDoc = mockLinkedPOs.find(
                            (po: any) =>
                              po.purchaseOrderNo === linkedDoc.documentNoPO ||
                              po.poId === linkedDoc.documentNoPO,
                          );
                          if (!foundDoc) {
                            alert(`Purchase Order ${linkedDoc.documentNoPO} not found in system.`);
                            return;
                          }
                          setShowLinkedDocsDialog(false);
                          if (onNavigateToPurchaseOrder) {
                            onNavigateToPurchaseOrder(linkedDoc.documentNoPO);
                          }
                        }
                      );
                      docElements.push(poElement);

                      // Create PI element
                      const piElement = createDocElement(
                        { ...linkedDoc, docNo: linkedDoc.docNo },
                        idx,
                        "PI",
                        "bg-blue-100 text-blue-700 border-blue-200",
                        "PI",
                        () => {
                          const foundDoc = mockpurchaseInvoice.find(
                            (pi: any) =>
                              pi.purchaseInvoiceNo === linkedDoc.docNo ||
                              pi.piId === linkedDoc.docNo,
                          );
                          if (!foundDoc) {
                            alert(`Purchase Invoice ${linkedDoc.docNo} not found in system.`);
                            return;
                          }
                          setShowLinkedDocsDialog(false);
                          if (onNavigateToPurchaseInvoice) {
                            onNavigateToPurchaseInvoice(linkedDoc.docNo);
                          }
                        }
                      );
                      docElements.push(piElement);
                      processedIndices.add(idx);
                    } else if (linkedDoc.type === "Purchase Order" || linkedDoc.documentType === "PO") {
                      const poNo = linkedDoc.docNo;
                      console.log(`Found PO: ${poNo}, searching for paired PI...`);

                      // Create PO element
                      const poElement = createDocElement(
                        linkedDoc,
                        idx,
                        "PO",
                        "bg-indigo-100 text-indigo-700 border-indigo-200",
                        "PO",
                        () => {
                          const foundDoc = mockLinkedPOs.find(
                            (po: any) =>
                              po.purchaseOrderNo === linkedDoc.docNo ||
                              po.poId === linkedDoc.docNo,
                          );
                          if (!foundDoc) {
                            alert(`Purchase Order ${linkedDoc.docNo} not found in system.`);
                            return;
                          }
                          setShowLinkedDocsDialog(false);
                          if (onNavigateToPurchaseOrder) {
                            onNavigateToPurchaseOrder(linkedDoc.docNo);
                          }
                        }
                      );
                      docElements.push(poElement);
                      processedIndices.add(idx);

                      // Look for paired PI in mock data using helper function
                      const pairedPI = findLinkedPIForPO(poNo);
                      if (pairedPI) {
                        // Check if PI is already in linkedDocs to avoid duplicate
                        const piAlreadyInLinkedDocs = selectedForLinkedDocs.linkedDocs.some(
                          (doc: any) => 
                            doc.docNo === pairedPI.purchaseInvoiceNo ||
                            doc.purchaseInvoiceNo === pairedPI.purchaseInvoiceNo
                        );
                        
                        if (!piAlreadyInLinkedDocs) {
                          console.log(`Found paired PI: ${pairedPI.purchaseInvoiceNo}`);
                          
                          // Add type field for display
                          const piWithType = {
                            ...pairedPI,
                            docNo: pairedPI.purchaseInvoiceNo,
                            type: "Purchase Invoice"
                          };
                          
                          const piElement = createDocElement(
                            piWithType,
                            idx,
                            "PI",
                            "bg-blue-100 text-blue-700 border-blue-200",
                            "PI",
                            () => {
                              setShowLinkedDocsDialog(false);
                              if (onNavigateToPurchaseInvoice) {
                                onNavigateToPurchaseInvoice(pairedPI.purchaseInvoiceNo);
                              }
                            }
                          );
                          docElements.push(piElement);
                        } else {
                          console.log(`PI ${pairedPI.purchaseInvoiceNo} already in linkedDocs, skipping`);
                        }
                      } else {
                        console.log(`No paired PI found for PO: ${poNo}`);
                      }
                    } else if (linkedDoc.type === "Purchase Invoice" || linkedDoc.documentType === "PI") {
                      // Skip if already processed as part of PO/PI pair
                      if (processedIndices.has(idx)) return;

                      const piElement = createDocElement(
                        linkedDoc,
                        idx,
                        "PI",
                        "bg-blue-100 text-blue-700 border-blue-200",
                        "PI",
                        () => {
                          const foundDoc = mockpurchaseInvoice.find(
                            (pi: any) =>
                              pi.purchaseInvoiceNo === linkedDoc.docNo ||
                              pi.piId === linkedDoc.docNo,
                          );
                          if (!foundDoc) {
                            alert(`Purchase Invoice ${linkedDoc.docNo} not found in system.`);
                            return;
                          }
                          setShowLinkedDocsDialog(false);
                          if (onNavigateToPurchaseInvoice) {
                            onNavigateToPurchaseInvoice(linkedDoc.docNo);
                          }
                        }
                      );
                      docElements.push(piElement);
                      processedIndices.add(idx);
                    } else if (linkedDoc.type === "Shipment Request" || linkedDoc.documentType === "SR") {
                      const srElement = createDocElement(
                        linkedDoc,
                        idx,
                        "SR",
                        "bg-green-100 text-green-700 border-green-200",
                        "SR",
                        () => {
                          const srList = extractShipmentRequestsFromLinkedStructure();
                          const foundDoc = srList.find(
                            (sr: any) =>
                              sr.shipmentNo === linkedDoc.docNo ||
                              sr.srId === linkedDoc.docNo,
                          );
                          if (!foundDoc) {
                            alert(`Shipment Request ${linkedDoc.docNo} not found in system.`);
                            return;
                          }
                          setShowLinkedDocsDialog(false);
                          if (onNavigateToShipmentRequest) {
                            onNavigateToShipmentRequest(linkedDoc.docNo);
                          }
                        }
                      );
                      docElements.push(srElement);
                      processedIndices.add(idx);
                    }
                  },
                );

                console.log("Final docElements count:", docElements.length);
                return docElements;
              })()
            ) : null}

            {/* LINKED PVRs SECTION */}
            {selectedForLinkedDocs &&
              (() => {
                // Search for PVRs linked ONLY to IC (Exclude PO and PI PVRs as per requirement)
                const linkedPVRsFromIC = findLinkedPVRs(
                  "IC",
                  selectedForLinkedDocs.icNum,
                ).filter(pvr => 
                   !pvr.linkedDocs?.some((doc: any) => (doc.documentType || doc.type) === "PI")
                );
                
                // Only show PVRs linked to the IC itself
                const uniquePVRs = Array.from(new Map(linkedPVRsFromIC.map(pvr => [pvr.pvrNo, pvr])).values());

                console.log("=== Linked PVRs Debug ===");
                console.log("PVRs from IC (Filtered):", linkedPVRsFromIC);
                console.log("All unique PVRs (IC Only):", uniquePVRs);

                return uniquePVRs.length > 0 ? (
                  <>
                    {uniquePVRs.map((pvr) => (
                      <div
                        key={pvr.pvrNo}
                        className="p-4 bg-white border border-orange-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-orange-50"
                        onClick={() => {
                          onNavigateToPVR?.(pvr.pvrNo);
                          setShowLinkedDocsDialog(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-orange-700 font-medium">
                                {pvr.pvrNo}
                              </p>
                              <p className="text-sm text-gray-400">
                                Payment Voucher Request
                              </p>
                            </div>
                          </div>
                         <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        PVR
                      </Badge>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null;
              })()}

            {/* EXPENSE NOTES SECTION */}
            {selectedForLinkedDocs && (() => {
                let apNotes: any[] = [];
                try {
                  const savedAPNotes = localStorage.getItem("createdAPNotes");
                  if (savedAPNotes) {
                    const allAPNotes = JSON.parse(savedAPNotes);
                    apNotes = allAPNotes.filter((note: any) => 
                      note.linkedICId === selectedForLinkedDocs?.id || 
                      (note.poNumber && selectedForLinkedDocs?.poNo && note.poNumber === selectedForLinkedDocs.poNo)
                    );
                  }
                } catch (error) {
                  console.error("Failed to load AP notes:", error);
                }

          
              })()}

           

            {/* Empty state message */}
            {(() => {
              const linkedDocs = (selectedForLinkedDocs?.linkedDocs || []).filter((doc: any) => 
                doc.type !== "PVR" && doc.documentType !== "PVR"
              );
              const linkedPVRs = selectedForLinkedDocs ? findLinkedPVRs("IC", selectedForLinkedDocs.icNum).filter(pvr => 
                !pvr.linkedDocs?.some((doc: any) => (doc.documentType || doc.type) === "PI")
              ) : [];
              let apNotes: any[] = [];
              try {
                const savedAPNotes = localStorage.getItem("createdAPNotes");
                if (savedAPNotes) {
                  const allAPNotes = JSON.parse(savedAPNotes);
                  apNotes = allAPNotes.filter((note: any) => 
                    note.linkedICId === selectedForLinkedDocs?.id || 
                    (note.poNumber && selectedForLinkedDocs?.poNo && note.poNumber === selectedForLinkedDocs.poNo)
                  );
                }
              } catch (error) {
                console.error("Failed to load AP notes:", error);
              }

              if (linkedDocs.length === 0 && linkedPVRs.length === 0 && apNotes.length === 0) {
                return (
                  <p className="text-gray-500 text-sm">
                    No linked documents
                  </p>
                );
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

      
    </div>

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
                              case "PR":
                                return "Purchase Return";
                              default:
                                return type;
                            }
                          };

                          const itemTotal = pi.totalAmount || 0;
                          const amountPaidValue = pi.amountPaid !== undefined ? pi.amountPaid : itemTotal;
                          const discountValue = pi.discount || 0;
                          const outstandingValue = itemTotal - amountPaidValue - discountValue;

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
                                {formatNumber(itemTotal)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {editingAmountPaidId === pi.id ? (
                                  <div className="flex gap-1 items-center min-w-0">
                                    <input
                                      type="text"
                                      placeholder="0,00"
                                      value={editingAmountPaidValue}
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
                                          const numericValue = parseFloat(editingAmountPaidValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
                                          setLinkedPIs(prev => prev.map(item => item.id === pi.id ? { ...item, amountPaid: numericValue } : item));
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
                                        const numericValue = parseFloat(editingAmountPaidValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
                                        setLinkedPIs(prev => prev.map(item => item.id === pi.id ? { ...item, amountPaid: numericValue } : item));
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
                                      let currentValue = formatNumber(amountPaidValue);
                                      setEditingAmountPaidId(pi.id);
                                      setEditingAmountPaidValue(currentValue);
                                    }}
                                    className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                    title="Click to edit"
                                  >
                                    {formatNumber(amountPaidValue)}
                                    <Pencil className="w-3 h-3 flex-shrink-0" />
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {editingDiscountId === pi.id ? (
                                  <div className="flex gap-1 items-center min-w-0">
                                    <input
                                      type="text"
                                      placeholder="0,00"
                                      value={editingDiscountValue}
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
                                          const numericValue = parseFloat(editingDiscountValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
                                          setLinkedPIs(prev => prev.map(item => item.id === pi.id ? { ...item, discount: numericValue } : item));
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
                                        const numericValue = parseFloat(editingDiscountValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
                                        setLinkedPIs(prev => prev.map(item => item.id === pi.id ? { ...item, discount: numericValue } : item));
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
                                      let currentValue = formatNumber(discountValue);
                                      setEditingDiscountId(pi.id);
                                      setEditingDiscountValue(currentValue);
                                    }}
                                    className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                    title="Click to edit"
                                  >
                                    {formatNumber(discountValue)}
                                    <Pencil className="w-3 h-3 flex-shrink-0" />
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatNumber(outstandingValue > 0 ? outstandingValue : 0)}
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
                      className="flex-1 resize-none" style={{ minHeight: '190px' }}
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
                              totalAmountPaid += (pi.amountPaid !== undefined ? pi.amountPaid : (pi.totalAmount || 0));
                            }
                          });
                          void tableRefreshTrigger;
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
                        {(() => {
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalDiscount += (pi.discount || 0);
                            }
                          });
                          return formatNumber(totalDiscount);
                        })()}
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
                          let totalAmountPaidFinal = 0;
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalAmountPaidFinal += (pi.amountPaid !== undefined ? pi.amountPaid : (pi.totalAmount || 0));
                              totalDiscount += (pi.discount || 0);
                            }
                          });
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaidFinal - totalDiscount;
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
                          let totalAmountPaidFinal = 0;
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            if (pi.documentType !== "PO") {
                              totalAmountPaidFinal += (pi.amountPaid !== undefined ? pi.amountPaid : (pi.totalAmount || 0));
                              totalDiscount += (pi.discount || 0);
                            }
                          });
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaidFinal - totalDiscount;

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

                // Find related purchase returns
                const relatedReturns = mockpurchaseReturns.filter(
                  (ret) => {
                    if (docType === "PI") return ret.piNo === docNo;
                    if (docType === "PO") return ret.poNo === docNo;
                    return false;
                  }
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
                            // Auto-select linked Purchase Returns
                            relatedReturns.forEach((ret) => {
                              newSelected.add(`PR-${ret.prNo}`);
                            });
                          } else {
                            newSelected.delete(docId);
                            // Auto-deselect linked AP Notes
                            relatedENs.forEach((en) => {
                              newSelected.delete(`EN-${en.apNoteNo}`);
                            });
                            // Auto-deselect linked Purchase Returns
                            relatedReturns.forEach((ret) => {
                              newSelected.delete(`PR-${ret.prNo}`);
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
                    <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full">
                      {relatedReturns.length > 0 ? (
                        <div className="flex flex-col gap-0.5 text-xs min-w-0">
                          {relatedReturns.slice(0, 1).map((ret) => (
                            <div key={`RET-${ret.prNo}`} className="flex flex-col">
                              <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                                {ret.prNo}
                              </span>
                              <span className="text-gray-500 truncate whitespace-nowrap">
                                Total: {formatNumber(ret.totalReturnAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No Linked Purchase Return</span>
                      )}
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
                  } else if (type === "PR") {
                    const ret = mockpurchaseReturns.find(
                      (r) => r.prNo === no,
                    );
                    return ret
                      ? {
                        id: `${type}-${ret.returId}`,
                        piNo: ret.prNo,
                        poNo: ret.poNo || "",
                        invoiceNo: ret.referenceNo || "",
                        invoiceDate: ret.returnDate,
                        currency: "IDR", // Default or extract
                        totalAmount: -ret.totalReturnAmount, // Deduct from PVR
                        documentType: "PR" as const,
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
    </>
  );
}

// ============================================================
// UTILITY FUNCTIONS FOR APNote COMPONENT
// ============================================================

/**
 * Get linked IC information for an AP Note
 * Used by APNote component to show "View in Import Cost" button
 * @param apNoteNo - AP Note number
 * @returns Object with IC details or null if not found
 */
export function getLinkedICForAPNote(apNoteNo: string) {
  try {
    const mapping = JSON.parse(
      localStorage.getItem("apNoteToIC_mapping") || "{}",
    );
    return mapping[apNoteNo] || null;
  } catch (error) {
    console.error("Error reading apNoteToIC_mapping:", error);
    return null;
  }
}

/**
 * Get IC info from sessionStorage (set during navigation)
 * @returns Object with IC number and ID from session
 */
export function getSessionLinkedIC() {
  return {
    icNum: sessionStorage.getItem("linkedICNumber"),
    icId: sessionStorage.getItem("linkedICId"),
    apNoteNo: sessionStorage.getItem("linkedAPNoteNo"),
    selectedAPNoteId: sessionStorage.getItem(
      "selectedAPNoteId",
    ),
  };
}

/**
 * Clear session IC data after navigation
 */
export function clearSessionLinkedIC() {
  sessionStorage.removeItem("linkedICNumber");
  sessionStorage.removeItem("linkedICId");
  sessionStorage.removeItem("linkedAPNoteNo");
  sessionStorage.removeItem("selectedAPNoteId");
}