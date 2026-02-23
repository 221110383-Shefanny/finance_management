import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  MouseEvent,
  ChangeEvent,
} from "react";
import { formatDateToDDMMYYYY, convertYYYYMMDDtoDDMMYYYY, convertDDMMYYYYtoYYYYMMDD } from "../utils/dateFormat";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { InvoiceCollapsible } from "./InvoiceCollapsible";
import { mockLinkedPOs, findLinkedPVRs, mockDivisionPICs, mockpurchaseInvoice } from "../mocks/mockData";
import {
  NotificationButton,
  DocumentFolder,
} from "./NotificationButton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  LayoutDashboard,
  Briefcase,
  Edit,
  Eye,
  FileText,
  Warehouse,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Upload,
  Package,
  Filter,
  Clock,
  MoreVertical,
  History,
  RotateCcw,
  Minus,
  Check,
  X,
  Globe,
  User,
  Settings,
  Calendar,
  TrendingUp,
  Send,
  ArrowDown,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type InvoiceStatus = "VERIFIED" | "NOT_VERIFIED";
type SubmissionStatus =
  | "SUBMITTED"
  | "NOT_SUBMITTED";
type PendingStatus = boolean;
type ReceivedStatus = boolean;
type ValidationStatus = "VALIDATED" | "NOT_VALIDATED";
type WarehouseLocation =
  | "MEDAN"
  | "JAKARTA"
  | "SURABAYA"
  | "BELAWAN"
  | "BALIKPAPAN"
  | "CILACAP"
  | "DUMAI";
type DocumentType =
  | "QPF"
  | "REIMBURSEMENT"
  | "BUNKER / FRESH WATER"
  | "CREDIT"
  | "DOWN PAYMENT";
type Division = "AP" | "COSTING" | "ACCOUNTING";
type PTCompany =
  | "MJS"
  | "AMT"
  | "GMI"
  | "WNS"
  | "WSI"
  | "TTP"
  | "IMI";
type PICPI =
  | "SHEFANNY"
  | "DEWI"
  | "ELLVA"
  | "VANNESA"
  | "ERNI"
  | "NADYA"
  | "STELLA"
  | "JESSICA"
  | "CHINTYA"
  | "HELEN"
  | "KELLY"
  | "JENNIFER";

interface ButtonClickEvent
  extends MouseEvent<HTMLButtonElement> {}
interface InputChangeEvent
  extends ChangeEvent<HTMLInputElement> {}
interface SelectChangeEvent
  extends ChangeEvent<HTMLSelectElement> {}
interface CheckboxChangeEvent {
  checked: boolean;
}
interface DialogChangeEvent {
  open: boolean;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action:
    | "VERIFIED"
    | "PENDING_VERIFICATION"
    | "SUBMITTED"
    | "NOT_SUBMITTED"
    | "PENDING_SUBMISSION"
    | "MARK_AS_PENDING"
    | "UNDO_VERIFICATION"
    | "UNDO_SUBMISSION"
    | "UNDO_PENDING"
    | "REFERENCE_UPDATED"
    | "COMMENT_ADDED"
    | "RECEIVED_DOCUMENT";
  description: string;
  referenceNo?: string;
  referenceDate?: string;
  reason?: string;
}

interface ReceivedDocument {
  id: string;
  warehouse: WarehouseLocation;
  pt: PTCompany;
  poNumber: string;
  supplier: string;
  piNo: string;
  attachment: string;
  attachmentNo: string;
  deliveryDate: string; // document Delivery Date
  receivedDate?: string; // null if not received yet
  isReceived: boolean;
}

interface PurchaseInvoiceData {
  id: string;
  noPO: string;
  purchaseInvoiceNo: string;
  supplierName: string;
  warehouse: WarehouseLocation;
  totalAmount: number;
  otherTotal: number;
  grandTotal: number;
  status: InvoiceStatus;
  internalRemarks: string;
  referenceNo?: string;
  referenceDate?: string;
  downPayment?: number;
  outstanding?: number;
  submissionStatus: SubmissionStatus;
  pendingStatus?: PendingStatus;
  pendingReason?: string;
  history: HistoryEntry[];
  documentType?: DocumentType;
  submittedTo?: string;
  submissionDate?: string;
  picName?: string;
  ptCompany: PTCompany;
  picPI: PICPI;
  docReceivedDate?: string;
  receivedStatus: ReceivedStatus;
  checkStatus?: boolean;
  items?: any[];
  discount?: number;
  ppn?: number;
  otherTax?: number;
  otherCosts?: Array<{ id: string; costAmount: number; description: string }>;
  // validationStatus deprecated - now we only use status field
  validationStatus?: ValidationStatus;
  comments?: {
    id: string;
    text: string;
    timestamp: string;
    author?: string;
  }[];
}

// Helper function to extract all Purchase Invoices from mockData
const extractPurchaseInvoicesFromLinkedStructure = () => {
  const allPurchaseInvoices: PurchaseInvoiceData[] = [];
  const seenIds = new Set<string>();

  mockpurchaseInvoice.forEach((pi: any) => {
    const piId = pi.piId || `pi-${pi.purchaseInvoiceNo}`;
    
    if (!seenIds.has(piId)) {
      const piData: PurchaseInvoiceData = {
        id: piId,
        noPO: pi.noPO,
        purchaseInvoiceNo: pi.purchaseInvoiceNo,
        supplierName: pi.supplierName,
        warehouse: pi.warehouse as WarehouseLocation,
        totalAmount: pi.totalAmount || 0,
        otherTotal: pi.otherTotal || 0,
        grandTotal: pi.grandTotal || pi.totalAmount || 0,
        status: pi.status as InvoiceStatus || "NOT_VERIFIED",
        internalRemarks: pi.internalRemarks || "",
        downPayment: pi.downPayment || 0,
        outstanding: pi.outstanding || 0,
        submissionStatus: (pi.submissionStatus || "NOT_SUBMITTED") as SubmissionStatus,
        ptCompany: pi.ptCompany as PTCompany,
        picPI: (pi.picPI || "SHEFANNY") as PICPI,
        receivedStatus: pi.receivedStatus === true || !!pi.docReceivedDate,
        docReceivedDate: pi.docReceivedDate,
        checkStatus: pi.checkStatus || false,
        items: pi.items || [],
        discount: pi.discount || 0,
        ppn: pi.ppn || 0,
        otherTax: pi.otherTax || 0,
        otherCosts: pi.otherCosts || [],
        history: pi.history || [
          {
            id: `${piId}-1`,
            timestamp: new Date(),
            action: "RECEIVED_DOCUMENT" as const,
            description: "Purchase Invoice received",
          },
        ],
      };
      
      allPurchaseInvoices.push(piData);
      seenIds.add(piId);
    }
  });

  return allPurchaseInvoices;
};

interface PurchaseInvoiceProps {
  currentPICName?: string;
  selectedInvoiceNo?: string | null;
  onNavigateToPurchaseOrder?: (documentNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseReturn?: (prNo: string) => void;
  onNavigateToShipmentRequest?: (srNo: string) => void;
  onNavigateToImportCost?: (importCostNo: string) => void;
  onNavigateToPV?: (pvNo: string) => void;
}

// Received Documents Dummy Data
// Function to fix ID sequence in mockData
const fixMockDataSequence = () => {
  const linkedPurchaseInvoices = extractPurchaseInvoicesFromLinkedStructure();
  return linkedPurchaseInvoices.map((invoice, index) => {
    const newId = String(index + 1);
    return {
      ...invoice,
      id: newId,
      history: invoice.history.map(
        (historyItem, historyIndex) => ({
          ...historyItem,
          id: `${newId}-${historyIndex + 1}`,
        }),
      ),
    };
  });
};

// Use fixed sequence mockData
const fixedMockData = fixMockDataSequence();

// Function to generate received documents data from ALL mockData entries
const generateReceivedDocumentsFromMockData =
  (): ReceivedDocument[] => {
    return fixedMockData.map((invoice, index) => {
      // Determine attachment type alternating between Invoice and Delivery Order
      const attachmentType =
        index % 2 === 0 ? "Invoice" : "Delivery Order";
      const attachmentNo = `${attachmentType === "Invoice" ? "INV" : "DO"}-${String(index + 1).padStart(3, "0")}-${invoice.ptCompany}`;

      // Generate delivery date (1-2 days before current date)
      const deliveryDaysAgo = Math.floor(Math.random() * 2) + 1;
      const deliveryDate = new Date();
      deliveryDate.setDate(
        deliveryDate.getDate() - deliveryDaysAgo,
      );
      const formattedDeliveryDate = `${String(deliveryDate.getDate()).padStart(2, "0")}/${String(deliveryDate.getMonth() + 1).padStart(2, "0")}/${deliveryDate.getFullYear()}`;

      // Determine if received based on mockData's docReceivedDate
      const isReceived = !!invoice.docReceivedDate;
      const receivedDate = invoice.docReceivedDate;

      return {
        id: `rd-${invoice.id}`,
        warehouse: invoice.warehouse,
        pt: invoice.ptCompany,
        poNumber: invoice.noPO,
        supplier: invoice.supplierName,
        piNo: invoice.purchaseInvoiceNo,
        attachment: attachmentType,
        attachmentNo: attachmentNo,
        deliveryDate: formattedDeliveryDate,
        receivedDate: receivedDate,
        isReceived: isReceived,
      };
    });
  };

// Received Documents Data - Dynamically generated from ALL mockData entries
const receivedDocumentsData: ReceivedDocument[] =
  generateReceivedDocumentsFromMockData();

// Generate dummy folder data
const generateDummyFolders = (): DocumentFolder[] => {
  // Use the actual PI mock data for pi_006, pi_007, and pi_008
  const selectedPIs = mockpurchaseInvoice.slice(5, 8); // pi_006, pi_007, pi_008 are at indices 5, 6, 7

  const folders: DocumentFolder[] = [];
  const warehouse = "MEDAN";

  const documents: Document[] = selectedPIs.map((pi, index) => {
    const attachmentType = index % 2 === 0 ? "Invoice" : "Delivery Order";
    const attachmentNo = `${attachmentType === "Invoice" ? "INV" : "DO"}-${String(index + 1).padStart(3, "0")}-${pi.ptCompany}`;

    return {
      id: `rd-${pi.piId}`,
      purchaseInvoiceNo: pi.purchaseInvoiceNo,
      purchaseOrderNo: pi.noPO,
      supplier: pi.supplierName,
      warehouse: pi.warehouse,
      docDeliveryDate: "29/01/2026",
      docReceivedDate: "31/01/2026",
      attachment: attachmentType === "Invoice" ? `invoice_${index}.pdf` : `do_${index}.pdf`,
      type: pi.ptCompany,
      totalAmount: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(pi.grandTotal),
      ptCompany: pi.ptCompany,
      verifiedDate: "28/01/2026",
    };
  });

  const folderDate = new Date();
  const folderName = `${warehouse} Warehouse - ${String(folderDate.getDate()).padStart(2, '0')}/${String(folderDate.getMonth() + 1).padStart(2, '0')}/${folderDate.getFullYear()}`;

  folders.push({
    id: `folder-medan`,
    folderName: folderName,
    warehouse: warehouse,
    documents: documents,
  });

  return folders;
};

const initialPendingFolders = generateDummyFolders();

export default function PurchaseInvoice({
  currentPICName = "SHEFANNY",
  selectedInvoiceNo = null,
  onNavigateToPurchaseOrder,
  onNavigateToPVR,
  onNavigateToAPNote,
  onNavigateToPurchaseReturn,
  onNavigateToShipmentRequest,
  onNavigateToImportCost,
  onNavigateToPV,
}: PurchaseInvoiceProps) {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "workarea"
  >("workarea");

  // Collapsible state for Submitted Docs card
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] =
    useState<string>("all");
  const [ptFilter, setPtFilter] = useState<string>("all");
  const [picPIFilter, setPicPIFilter] = useState<string>("all");
  const [poTypeFilter, setPoTypeFilter] = useState<string>("all");
  const [vendorOriginFilter, setVendorOriginFilter] = useState<string>("all");
  const [activeFilterType, setActiveFilterType] = useState<
    "pt" | "warehouse" | "pic" | "poType" | "vendorOrigin" | null
  >(null);

  // Advanced filtering states for status combinations
  const [receivedDateFilter, setReceivedDateFilter] =
    useState<string>("");
  const [validatedDateFilter, setValidatedDateFilter] =
    useState<string>("");
  const [submittedDateFilter, setSubmittedDateFilter] =
    useState<string>("");
  const [receivedStatusFilter, setReceivedStatusFilter] =
    useState<"all" | "received" | "not_received">("all");
  const [validatedStatusFilter, setValidatedStatusFilter] =
    useState<"all" | "validated" | "not_validated">("all");
  const [submittedStatusFilter, setSubmittedStatusFilter] =
    useState<"all" | "submitted" | "not_submitted">("all");

  // Dropdown states for each tab
  const [showReceivedDropdown, setShowReceivedDropdown] =
    useState(false);
  const [showValidatedDropdown, setShowValidatedDropdown] =
    useState(false);
  const [showSubmittedDropdown, setShowSubmittedDropdown] =
    useState(false);
  const [showPendingDropdown, setShowPendingDropdown] =
    useState(false);

  // Dropdown menu states for each tab (date filter + sort)
  const [showReceivedMenu, setShowReceivedMenu] =
    useState(false);
  const [showValidatedMenu, setShowValidatedMenu] =
    useState(false);
  const [showSubmittedMenu, setShowSubmittedMenu] =
    useState(false);
  const [showPendingMenu, setShowPendingMenu] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);

  // Sorting states
  const [sortBy, setSortBy] = useState<
    "none" | "alpha" | "date"
  >("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    "asc",
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showNotSubmittedOnly, setShowNotSubmittedOnly] =
    useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    new Set(),
  );
  const [showSubmitDialog, setShowSubmitDialog] =
    useState(false);
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [invoicesData, setInvoicesData] =
    useState<PurchaseInvoiceData[]>(fixedMockData);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Dynamically extract pending invoice IDs from mockData based on pendingStatus field
  const getInitialPendingCards = () => {
    return new Set(
      fixedMockData
        .filter((inv) => inv.pendingStatus === true)
        .map((inv) => inv.id)
    );
  };
  
  const [pendingCards, setPendingCards] = useState<Set<string>>(
    getInitialPendingCards(),
  );
  const [showVerificationDialog, setShowVerificationDialog] =
    useState(false);
  const [verificationInvoice, setVerificationInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [referenceNo, setReferenceNo] = useState("");
  const [showHistoryDialog, setShowHistoryDialog] =
    useState(false);
  const [historyInvoice, setHistoryInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [showUndoConfirmDialog, setShowUndoConfirmDialog] =
    useState(false);
  const [undoInvoice, setUndoInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [
    showUndoSubmissionDialog,
    setShowUndoSubmissionDialog,
  ] = useState(false);
  const [undoSubmissionInvoice, setUndoSubmissionInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [showResubmitDialog, setShowResubmitDialog] =
    useState(false);
  const [resubmitInvoice, setResubmitInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [resubmitReason, setResubmitReason] = useState("");

  // View reason dialog states
  const [showViewReasonDialog, setShowViewReasonDialog] =
    useState(false);
  const [viewingReasonInvoice, setViewingReasonInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [showPendingConfirmDialog, setShowPendingConfirmDialog] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<"mark" | "release" | null>(null);

  // Notification folders state
  const [pendingFolders, setPendingFolders] = useState<
    DocumentFolder[]
  >(initialPendingFolders);
  const [receivedDocsList, setReceivedDocsList] = useState<
    any[]
  >([]);

  // Receive documents dialog states
  const [showReceiveDateDialog, setShowReceiveDateDialog] =
    useState(false);
  const [pendingReceiveData, setPendingReceiveData] = useState<{
    folderId: string;
    documentIds: string[];
  } | null>(null);
  const [receiveDateInput, setReceiveDateInput] = useState("");
  const [
    useCurrentDateForReceive,
    setUseCurrentDateForReceive,
  ] = useState(false);

  // Calendar Filter Dialog States
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);
  const [calendarFilterType, setCalendarFilterType] = useState<
    "received" | "verified" | "submitted"
  >("received");

  // Expand/Collapse All Invoices
  const [expandAll, setExpandAll] = useState(false);

  const [activeTab, setActiveTab] = useState<string[]>([]);
  const [documentType, setDocumentType] =
    useState<DocumentType>("");
  const [submittedTo, setSubmittedTo] =
    useState<Division>("");

  // Department filter states for submitted docs
  const [selectedDepartments, setSelectedDepartments] =
    useState<string[]>([]);
  const [departmentFilterMode, setDepartmentFilterMode] =
    useState<"all" | "individual">("all");

  // Date filter states for submitted docs
  const [dateFromFilter, setDateFromFilter] =
    useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [picName, setPicName] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  // Submit dialog filter/search/sort states
  const [submitDialogSearch, setSubmitDialogSearch] =
    useState("");
  const [submitDialogSort, setSubmitDialogSort] =
    useState<string>("newest");
  const [submitDialogSelectAll, setSubmitDialogSelectAll] =
    useState(false);

  // Dashboard filter states
  const [dashboardActiveTab, setDashboardActiveTab] = useState<
    "all" | "validated" | "pending" | "submitted"
  >("all");
  const [dashboardPICFilter, setDashboardPICFilter] =
    useState<string>("all");
  const [dashboardTimeFilter, setDashboardTimeFilter] =
    useState<"day" | "month" | "year">("month");
  const [dashboardDocTypeFilter, setDashboardDocTypeFilter] =
    useState<string>("all");
  const [dashboardStatusFilter, setDashboardStatusFilter] =
    useState<string>("all");
  const [dashboardMonthFilter, setDashboardMonthFilter] =
    useState<string>("    all");
  const [dashboardYearFilter, setDashboardYearFilter] =
    useState<string>("all");
  const [selectedPICForDetail, setSelectedPICForDetail] =
    useState<string | null>(null);
  const [detailDocTypeFilter, setDetailDocTypeFilter] =
    useState<string>("all");
  const [useCurrentDate, setUseCurrentDate] = useState(false);
  const [editingReferenceId, setEditingReferenceId] = useState<
    string | null
  >(null);
  const [editReferenceValue, setEditReferenceValue] =
    useState("");
  const [editReferenceDateValue, setEditReferenceDateValue] =
    useState("");
  const [referenceDate, setReferenceDate] = useState("");

  // Refs for auto-focus on Enter key
  const referenceNoInputRef = useRef<HTMLInputElement>(null);
  const referenceDateInputRef = useRef<HTMLInputElement>(null);
  const resubmitReasonTextareaRef = useRef<HTMLTextAreaElement>(null);
  const receiveDateInputRef = useRef<HTMLInputElement>(null);

  // Function to get current date in dd/mm/yyyy format
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to validate date format dd/mm/yyyy
  const isValidDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 10) return false;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > 2100
    ) {
      return false;
    }

    // Additional check for valid date
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  // Effect for checkbox to auto-fill current date
  useEffect(() => {
    if (useCurrentDate) {
      setSubmissionDate(getCurrentDate());
    }
  }, [useCurrentDate]);

  // Effect to auto-select invoice when selectedInvoiceNo prop is provided
  useEffect(() => {
    if (selectedInvoiceNo) {
      const foundInvoice = invoicesData.find(
        (invoice) =>
          invoice.purchaseInvoiceNo === selectedInvoiceNo,
      );
      if (foundInvoice) {
        setSelectedInvoice(foundInvoice);
      }
    }
  }, [selectedInvoiceNo, invoicesData]);

  // Effect to handle navigation from linked documents
  useEffect(() => {
    const handleNavigateToPI = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { docNo } = customEvent.detail;

      console.log(
        "=== PurchaseInvoice navigateToPurchaseInvoice event ===",
        docNo,
      );

      // Find the invoice with matching number
      const matchingInvoice = invoicesData.find(
        (invoice) => invoice.purchaseInvoiceNo === docNo || invoice.id === docNo,
      );

      if (matchingInvoice) {
        console.log(
          "Found matching PI:",
          matchingInvoice.purchaseInvoiceNo,
          "ID:",
          matchingInvoice.id,
        );
        // Select the matching invoice
        setSelectedInvoice(matchingInvoice);

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(
            `pi-card-${matchingInvoice.purchaseInvoiceNo}`,
          );
          console.log(
            "Looking for element:",
            `pi-card-${matchingInvoice.purchaseInvoiceNo}`,
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
        console.warn("No matching PI found for docNo:", docNo);
      }
    };

    window.addEventListener(
      "navigateToPurchaseInvoice",
      handleNavigateToPI,
    );

    return () => {
      window.removeEventListener(
        "navigateToPurchaseInvoice",
        handleNavigateToPI,
      );
    };
  }, [invoicesData]);

  // Additional UI states for detail dialog actions
  const [showPendingDialog, setShowPendingDialog] =
    useState(false);
  const [showValidationWarning, setShowValidationWarning] =
    useState(false);
  const [warningInvoice, setWarningInvoice] =
    useState<PurchaseInvoiceData | null>(null);
  const [pendingReasonInput, setPendingReasonInput] =
    useState("");
  const [showConfirmPendingSave, setShowConfirmPendingSave] =
    useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] =
    useState(false);
  const [showCommentDialog, setShowCommentDialog] =
    useState(false);
  const [commentText, setCommentText] = useState("");
  const [showConfirmSaveComment, setShowConfirmSaveComment] =
    useState(false);
  const [displayComments, setDisplayComments] = useState<any[]>(
    [],
  );
  const [editingCommentId, setEditingCommentId] = useState<
    string | null
  >(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Debug useEffect to monitor displayComments changes
  useEffect(() => {
    console.log(
      "🔍 displayComments state changed:",
      displayComments,
    );
    console.log(
      "🔍 displayComments length:",
      displayComments?.length || 0,
    );
    console.log(
      "🔍 displayComments type:",
      typeof displayComments,
    );
    console.log(
      "🔍 displayComments isArray:",
      Array.isArray(displayComments),
    );
    if (displayComments && displayComments.length > 0) {
      console.log("🔍 First comment:", displayComments[0]);
    }
  }, [displayComments]);

  // Initialize default department filter (ALL selected)
  useEffect(() => {
    if (selectedDepartments.length === 0) {
      setSelectedDepartments(["AP", "COSTING", "ACCOUNTING"]);
      setDepartmentFilterMode("all");
    }
  }, []);
  const [attachmentList] = useState<string[]>([
    "invoice.pdf",
    "delivery.jpg",
    "specs.docx",
    "image.jpeg",
  ]);

  // Derive the up-to-date invoice object from invoicesData to avoid stale selectedInvoice
  const activeInvoice = useMemo(() => {
    if (!selectedInvoice) return null;
    const updated = invoicesData.find(
      (i) => i.id === selectedInvoice.id,
    );
    console.log("=== USEMEMO ACTIVEINVOICE DEBUG ===");
    console.log(
      "selectedInvoice ID:",
      selectedInvoice.id,
      "type:",
      typeof selectedInvoice.id,
    );
    console.log(
      "selectedInvoice comments:",
      selectedInvoice.comments?.length || 0,
    );
    console.log("invoicesData length:", invoicesData.length);
    console.log("invoicesData array reference:", invoicesData);
    console.log(
      "invoicesData IDs:",
      invoicesData.map((i) => `${i.id}(${typeof i.id})`),
    );
    console.log("found updated invoice:", !!updated);
    if (updated) {
      console.log(
        "updated invoice ID:",
        updated.id,
        "type:",
        typeof updated.id,
      );
      console.log(
        "updated comments:",
        updated?.comments?.length || 0,
      );
      console.log(
        "updated invoice comments array:",
        updated?.comments,
      );
      console.log("updated invoice object:", updated);
    } else {
      console.log(
        "❌ NO MATCHING INVOICE FOUND IN INVOICESDATA",
      );
    }
    console.log("refreshKey:", refreshKey);
    return updated ?? selectedInvoice;
  }, [selectedInvoice, invoicesData, refreshKey]);

  // Local storage helpers for comments persistence (fallback if state sync lags)
  const storageKeyFor = (id: string) =>
    `invoice-comments-${id}`;
  const saveCommentsToStorage = (
    id: string,
    comments: any[],
  ) => {
    try {
      localStorage.setItem(
        storageKeyFor(id),
        JSON.stringify(comments),
      );
    } catch (e) {
      console.warn(
        "Failed to save comments to localStorage",
        e,
      );
    }
  };
  const readCommentsFromStorage = (id: string) => {
    try {
      const raw = localStorage.getItem(storageKeyFor(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(
        "Failed to read comments from localStorage",
        e,
      );
      return null;
    }
  };

  // Date filter helper functions
  const formatDateInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");

    // Format as dd/mm/yyyy
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Try to parse dd/mm/yyyy format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    return null;
  };

  const isDateInRange = (
    dateStr: string,
    fromDate: string,
    toDate: string,
  ): boolean => {
    const date = parseDate(dateStr);
    if (!date) return true; // If can't parse, include it

    const from = parseDate(fromDate);
    const to = parseDate(toDate);

    if (from && date < from) return false;
    if (to && date > to) return false;

    return true;
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for comparison
  const convertToISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const convertToDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Received Documents states
  const [receivedDocsData, setReceivedDocsData] = useState<
    ReceivedDocument[]
  >(receivedDocumentsData);
  const [
    showMarkAsReceivedColumn,
    setShowMarkAsReceivedColumn,
  ] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Set<string>
  >(new Set());
  const [
    showReceiveConfirmDialog,
    setShowReceiveConfirmDialog,
  ] = useState(false);
  const [receiveDate, setReceiveDate] = useState("");
  const [showMarkAsNotifiedDialog, setShowMarkAsNotifiedDialog] = useState(false);
  const [selectedDocsForNotified, setSelectedDocsForNotified] = useState<Set<string>>(new Set());

  // Received Documents Filter states
  const [receivedDocsSearch, setReceivedDocsSearch] =
    useState("");
  const [filterWarehouse, setFilterWarehouse] =
    useState<string>("");
  const [filterPT, setFilterPT] = useState<string>("");
  const [filterDeliveryDate, setFilterDeliveryDate] =
    useState("");
  const [filterReceivedDate, setFilterReceivedDate] =
    useState("");

  // State untuk melacak focus pada date inputs
  const [isDeliveryDateFocused, setIsDeliveryDateFocused] =
    useState(false);
  const [isReceivedDateFocused, setIsReceivedDateFocused] =
    useState(false);

  // Function untuk format tanggal ke dd/mm/yyyy
  const formatDateToDisplay = (dateValue: string) => {
    if (!dateValue) return "";
    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  };

  // Keep selectedInvoice and historyInvoice in sync with invoicesData updates
  useEffect(() => {
    if (selectedInvoice) {
      const updatedSelectedInvoice = invoicesData.find(
        (inv) => inv.id === selectedInvoice.id,
      );
      if (updatedSelectedInvoice) {
        setSelectedInvoice(updatedSelectedInvoice);
      }
    }

    if (historyInvoice) {
      const updatedHistoryInvoice = invoicesData.find(
        (inv) => inv.id === historyInvoice.id,
      );
      if (updatedHistoryInvoice) {
        setHistoryInvoice(updatedHistoryInvoice);
      }
    }
  }, [invoicesData, selectedInvoice?.id, historyInvoice?.id]);

  // Sync receivedDocsData with invoicesData changes for perfect integration
  useEffect(() => {
    const syncedReceivedDocs = receivedDocsData.map((doc) => {
      // Find matching invoice in mockData/invoicesData by PI No or PO No
      const matchingInvoice = invoicesData.find(
        (inv) =>
          inv.purchaseInvoiceNo === doc.piNo ||
          inv.noPO === doc.poNumber,
      );

      if (matchingInvoice) {
        // Sync received status based on docReceivedDate in invoicesData
        const isReceived = !!matchingInvoice.docReceivedDate;
        const receivedDate = matchingInvoice.docReceivedDate;

        return {
          ...doc,
          isReceived,
          receivedDate,
          // Update supplier name if needed to match
          supplier: matchingInvoice.supplierName,
          warehouse: matchingInvoice.warehouse,
          pt: matchingInvoice.ptCompany,
        };
      }
      return doc;
    });

    // Only update if there are actual changes to avoid infinite loops
    const hasChanges = syncedReceivedDocs.some(
      (syncedDoc, index) => {
        const originalDoc = receivedDocsData[index];
        return (
          syncedDoc.isReceived !== originalDoc.isReceived ||
          syncedDoc.receivedDate !== originalDoc.receivedDate ||
          syncedDoc.supplier !== originalDoc.supplier
        );
      },
    );

    if (hasChanges) {
      setReceivedDocsData(syncedReceivedDocs);
    }
  }, [invoicesData]);

  const filteredData = invoicesData.filter((invoice) => {
    const matchesSearch =
      invoice.purchaseInvoiceNo
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.supplierName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.noPO
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    const matchesWarehouse =
      warehouseFilter === "all" ||
      invoice.warehouse === warehouseFilter;
    const matchesPT =
      ptFilter === "all" || invoice.ptCompany === ptFilter;
    const matchesPicPI =
      picPIFilter === "all" || invoice.picPI === picPIFilter;
    const matchesSubmission = showNotSubmittedOnly
      ? invoice.submissionStatus === "NOT_SUBMITTED"
      : true;

    // PO Type filter - Get from linked purchase order
    const linkedPO = mockLinkedPOs.find(
      (po) => po.purchaseOrderNo === invoice.noPO,
    );
    const poTypeValue = (linkedPO as any)?.poType || "all";
    const matchesPoType =
      poTypeFilter === "all" || poTypeValue === poTypeFilter;

    // Vendor Origin filter - Get from linked purchase order
    const vendorOriginValue = (linkedPO as any)?.vendorOrigin || "all";
    const matchesVendorOrigin =
      vendorOriginFilter === "all" || vendorOriginValue === vendorOriginFilter;

    // Advanced filtering: Received Status and Date
    const matchesReceivedStatus =
      receivedStatusFilter === "all"
        ? true
        : receivedStatusFilter === "received"
          ? invoice.receivedStatus === true
          : invoice.receivedStatus !== true;

    const matchesReceivedDate =
      !receivedDateFilter || !invoice.docReceivedDate
        ? true
        : convertToISODate(invoice.docReceivedDate) ===
          receivedDateFilter;

    // Advanced filtering: Validated Status and Date
    const matchesValidatedStatus =
      validatedStatusFilter === "all"
        ? true
        : validatedStatusFilter === "validated"
          ? invoice.status === "VERIFIED"
          : invoice.status !== "VERIFIED";

    const matchesValidatedDate =
      !validatedDateFilter || !invoice.validatedDate
        ? true
        : convertToISODate(invoice.validatedDate) ===
          validatedDateFilter;

    // Advanced filtering: Submitted Status and Date
    const matchesSubmittedStatus =
      submittedStatusFilter === "all"
        ? true
        : submittedStatusFilter === "submitted"
          ? invoice.submissionStatus === "SUBMITTED"
          : invoice.submissionStatus !== "SUBMITTED";

    const matchesSubmittedDate =
      !submittedDateFilter || !invoice.submittedDate
        ? true
        : convertToISODate(invoice.submittedDate) ===
          submittedDateFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesWarehouse &&
      matchesPT &&
      matchesPicPI &&
      matchesSubmission &&
      matchesPoType &&
      matchesVendorOrigin &&
      matchesReceivedStatus &&
      matchesReceivedDate &&
      matchesValidatedStatus &&
      matchesValidatedDate &&
      matchesSubmittedStatus &&
      matchesSubmittedDate
    );
  });

  // Apply sorting to filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "none") return 0;

    if (sortBy === "alpha") {
      // Sort alphabetically by invoice number
      const compareValue = a.purchaseInvoiceNo.localeCompare(
        b.purchaseInvoiceNo,
      );
      return sortOrder === "asc" ? compareValue : -compareValue;
    }

    if (sortBy === "date") {
      // Sort by submission date if available, otherwise by a default date field
      const dateA = a.submittedDate
        ? new Date(a.submittedDate).getTime()
        : 0;
      const dateB = b.submittedDate
        ? new Date(b.submittedDate).getTime()
        : 0;
      return sortOrder === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }

    return 0;
  });

  const submittedDocs = invoicesData.filter(
    (doc) =>
      doc.submissionStatus === "SUBMITTED" &&
      doc.status === "VERIFIED" &&
      doc.receivedStatus === true,
  );

  // Department filter functions
  const handleDepartmentFilter = (department: string) => {
    if (department === "ALL") {
      setDepartmentFilterMode("all");
      setSelectedDepartments(["AP", "COSTING", "ACCOUNTING"]);
    } else {
      setDepartmentFilterMode("individual");
      setSelectedDepartments((prev) =>
        prev.includes(department)
          ? prev.filter((d) => d !== department)
          : [...prev, department],
      );
    }
  };

  // Filter submitted docs by department and date
  const filteredSubmittedDocs = submittedDocs.filter((doc) => {
    // Department filter
    if (selectedDepartments.length > 0) {
      if (
        !selectedDepartments.includes(doc.submittedTo || "AP")
      ) {
        return false;
      }
    }

    // Date filter
    if (dateFromFilter || dateToFilter) {
      if (!doc.submissionDate) return false;
      if (
        !isDateInRange(
          doc.submissionDate,
          dateFromFilter,
          dateToFilter,
        )
      ) {
        return false;
      }
    }

    return true;
  });

  // Filter berdasarkan penyimpanan pending khusus
  const pendingDocs = invoicesData.filter((doc) =>
    pendingCards.has(doc.id),
  );

  // Debug logging
  console.log("=== PENDING DOCS DEBUG ===");
  console.log("Pending Cards:", Array.from(pendingCards));
  console.log(
    "Filtered Pending Docs:",
    pendingDocs.map((doc) => ({
      id: doc.id,
      invoiceNo: doc.purchaseInvoiceNo,
      pendingReason: doc.pendingReason,
    })),
  );

  // Filter, search, and sort for Submit Documents dialog
  const availableDocsForSubmission = useMemo(() => {
    // Base filter: Only VERIFIED and RECEIVED documents that haven't been submitted
    let filtered = invoicesData.filter(
      (doc) =>
        doc.submissionStatus === "NOT_SUBMITTED" &&
        doc.status === "VERIFIED" &&
        doc.receivedStatus === true,
    );

    // Apply search filter
    if (submitDialogSearch.trim()) {
      const searchLower = submitDialogSearch.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.purchaseInvoiceNo
            .toLowerCase()
            .includes(searchLower) ||
          doc.noPO.toLowerCase().includes(searchLower) ||
          doc.supplierName.toLowerCase().includes(searchLower),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (submitDialogSort) {
        case "a-z":
          return a.purchaseInvoiceNo.localeCompare(
            b.purchaseInvoiceNo,
          );
        case "z-a":
          return b.purchaseInvoiceNo.localeCompare(
            a.purchaseInvoiceNo,
          );
        case "oldest":
          return (
            new Date(a.docReceivedDate || 0).getTime() -
            new Date(b.docReceivedDate || 0).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.docReceivedDate || 0).getTime() -
            new Date(a.docReceivedDate || 0).getTime()
          );
      }
    });

    return sorted;
  }, [invoicesData, submitDialogSearch, submitDialogSort]);

  // Sync "Select All" checkbox state with actual selection in Submit Dialog
  useEffect(() => {
    if (availableDocsForSubmission && availableDocsForSubmission.length > 0) {
      const allSelected = availableDocsForSubmission.every(
        (doc) => selectedDocs.has(doc.id),
      );
      setSubmitDialogSelectAll(allSelected);
    } else {
      setSubmitDialogSelectAll(false);
    }
  }, [selectedDocs, availableDocsForSubmission]);

  const handleToggleDoc = (id: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocs(newSelected);
  };

  const handleSubmitDocs = () => {
    // Filter selected docs to only include documents that are VERIFIED and RECEIVED
    const eligibleSelectedDocs = new Set(
      Array.from(selectedDocs).filter((docId) => {
        const doc = invoicesData.find(
          (inv) => inv.id === docId,
        );
        return (
          doc &&
          doc.status === "VERIFIED" &&
          doc.receivedStatus === true
        );
      }),
    );

    // Check for specific issues with selected documents
    const issues = Array.from(selectedDocs)
      .map((docId) => {
        const doc = invoicesData.find(
          (inv) => inv.id === docId,
        );
        if (!doc) return null;

        const problems = [];
        if (doc.status !== "VERIFIED")
          problems.push("not verified");
        if (doc.receivedStatus !== true)
          problems.push("not received");
        if (doc.validationStatus !== "VALIDATED")
          problems.push("not validated");

        if (problems.length > 0) {
          return `PI ${doc.purchaseInvoiceNo}: ${problems.join(", ")}`;
        }
        return null;
      })
      .filter(Boolean);

    // If no eligible documents are selected, show detailed warning
    if (eligibleSelectedDocs.size === 0) {
      const message =
        issues.length > 0
          ? `Cannot submit documents. Issues found:\n${issues.join("\n")}\n\nOnly invoices that are VERIFIED, RECEIVED, and VALIDATED can be submitted.`
          : "Cannot submit documents. Only invoices that are VERIFIED, RECEIVED, and VALIDATED can be submitted.";
      alert(message);
      return;
    }

    // Show info if some documents were filtered out
    if (eligibleSelectedDocs.size < selectedDocs.size) {
      const filtered =
        selectedDocs.size - eligibleSelectedDocs.size;
      const message = `${filtered} document(s) were not submitted due to issues:\n${issues.join("\n")}\n\nOnly VERIFIED, RECEIVED, and VALIDATED invoices can be submitted.`;
      alert(message);
    }

    // First, update the invoices data with submission info
    const updatedData = invoicesData.map((doc) => {
      if (eligibleSelectedDocs.has(doc.id)) {
        // Create history entry for submission
        const newHistoryEntry = {
          id: `${doc.id}-${Date.now()}`,
          timestamp: new Date(),
          action: "SUBMITTED" as const,
          description: `Document submitted to ${submittedTo} as ${documentType}${picName ? ` - PIC: ${picName}` : ""}`,
        };

        return {
          ...doc,
          submissionStatus: "SUBMITTED" as SubmissionStatus,
          documentType: documentType,
          submittedTo: submittedTo,
          submissionDate: submissionDate || getCurrentDate(),
          picName: picName.trim() || undefined,
          history: [...doc.history, newHistoryEntry],
        };
      }
      return doc;
    });

    setInvoicesData(updatedData);
    setSelectedDocs(new Set());
    setShowSubmitDialog(false);

    // Reset form fields
    setDocumentType("QPF");
    setSubmittedTo("AP");
    setPicName("");
    setSubmissionDate("");
    setUseCurrentDate(false);
  };


  // Confirm & perform saving of comment (triggered after user confirms)
  const handleConfirmSaveComment = () => {
    if (!selectedInvoice) {
      setShowConfirmSaveComment(false);
      return;
    }

    const newComment = {
      id: `${selectedInvoice.id}-comment-${Date.now()}`,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      author: currentPICName || undefined,
    };

    console.log("=== CREATING NEW COMMENT ===");
    console.log("New Comment:", newComment);
    console.log("Selected Invoice ID:", selectedInvoice.id);
    console.log(
      "Selected Invoice current comments:",
      selectedInvoice.comments,
    );
    console.log("Comment Text:", commentText.trim());

    const updatedInvoices = invoicesData.map((inv) => {
      if (inv.id === selectedInvoice.id) {
        const updatedInv = {
          ...inv,
          comments: [...(inv.comments || []), newComment],
        };
        console.log("=== UPDATING INVOICE ===");
        console.log("Invoice ID:", inv.id);
        console.log("Original comments:", inv.comments);
        console.log("New comments array:", updatedInv.comments);
        console.log("Updated invoice object:", updatedInv);
        return updatedInv;
      }
      return { ...inv }; // Create new reference for all items to ensure React detects changes
    });

    console.log("=== BEFORE SETINVOICESDATA ===");
    console.log(
      "Current invoicesData for invoice 1:",
      invoicesData.find((i) => i.id === selectedInvoice.id)
        ?.comments,
    );
    console.log(
      "updatedInvoices for invoice 1:",
      updatedInvoices.find((i) => i.id === selectedInvoice.id)
        ?.comments,
    );

    setInvoicesData(updatedInvoices);

    console.log("=== AFTER SETINVOICESDATA ===");
    console.log(
      "New invoicesData for invoice 1:",
      updatedInvoices.find((i) => i.id === selectedInvoice.id)
        ?.comments,
    );

    const updatedThisInvoice =
      updatedInvoices.find(
        (i) => i.id === selectedInvoice.id,
      ) || null;
    if (updatedThisInvoice) {
      console.log("=== COMMENT SAVED ===");
      console.log("Invoice ID:", updatedThisInvoice.id);
      console.log(
        "Comments after save:",
        updatedThisInvoice.comments,
      );
      console.log(
        "invoicesData updated:",
        updatedInvoices.find((i) => i.id === selectedInvoice.id)
          ?.comments,
      );

      // Save to localStorage and update display immediately
      saveCommentsToStorage(
        updatedThisInvoice.id,
        updatedThisInvoice.comments || [],
      );
      setDisplayComments(updatedThisInvoice.comments || []);

      // Update selectedInvoice AFTER setting displayComments to avoid timing issues
      setSelectedInvoice(updatedThisInvoice);
    }

    addHistoryEntry(
      selectedInvoice.id,
      "COMMENT_ADDED",
      "Comment added",
    );

    // Clear comment text after save to prevent bug
    setCommentText("");

    // Force refresh to ensure activeInvoice is updated
    setRefreshKey((prev) => prev + 1);

    setShowConfirmSaveComment(false);
    setShowCommentDialog(false);
  };

  // Handle editing an existing comment
  const handleEditComment = (
    commentId: string,
    currentText: string,
  ) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
    // Clear the new comment text when switching to edit mode
    setCommentText("");
  };

  // Cancel editing comment
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
    // Clear any text in the input box when canceling edit
    setCommentText("");
  };

  // Save edited comment
  const handleSaveEditComment = () => {
    if (
      !selectedInvoice ||
      !editingCommentId ||
      !editCommentText.trim()
    ) {
      return;
    }

    console.log("=== SAVING EDITED COMMENT ===");
    console.log("Selected Invoice ID:", selectedInvoice.id);
    console.log("Editing Comment ID:", editingCommentId);
    console.log("New Comment Text:", editCommentText.trim());

    const updatedInvoices = invoicesData.map((inv) => {
      if (inv.id === selectedInvoice.id) {
        console.log("✅ Updating invoice", inv.id);
        const updatedComments = (inv.comments || []).map(
          (comment) => {
            if (comment.id === editingCommentId) {
              console.log(
                "✅ Found and updating comment",
                comment.id,
              );
              return {
                ...comment,
                text: editCommentText.trim(),
                timestamp: new Date().toISOString(), // Update timestamp to show it was edited
              };
            }
            return comment;
          },
        );
        console.log(
          "Updated comments for invoice",
          inv.id,
          ":",
          updatedComments.length,
        );
        return { ...inv, comments: updatedComments };
      }
      console.log(
        "⏭️ Skipping invoice",
        inv.id,
        "(not selected)",
      );
      return { ...inv };
    });

    setInvoicesData(updatedInvoices);

    const updatedThisInvoice = updatedInvoices.find(
      (i) => i.id === selectedInvoice.id,
    );
    if (updatedThisInvoice) {
      console.log("=== COMMENT EDIT SAVED ===");
      console.log("Updated Invoice ID:", updatedThisInvoice.id);
      console.log(
        "Final Comments:",
        updatedThisInvoice.comments?.length || 0,
      );

      saveCommentsToStorage(
        updatedThisInvoice.id,
        updatedThisInvoice.comments || [],
      );
      // Only update displayComments for THIS specific invoice
      setDisplayComments(updatedThisInvoice.comments || []);
      setSelectedInvoice(updatedThisInvoice);
    }

    addHistoryEntry(
      selectedInvoice.id,
      "COMMENT_ADDED",
      "Comment edited",
    );

    // Clear edit state
    setEditingCommentId(null);
    setEditCommentText("");
    setRefreshKey((prev) => prev + 1);
  };

  // Confirm & perform marking invoice as pending (triggered after user confirms)
  const handlePerformPendingSave = () => {
    if (!selectedInvoice) {
      setShowConfirmPendingSave(false);
      return;
    }

    if (!pendingReasonInput.trim()) {
      setShowConfirmPendingSave(false);
      return;
    }

    // Tambahkan ke penyimpanan pending khusus
    const newPendingCards = new Set(pendingCards);
    newPendingCards.add(selectedInvoice.id);
    setPendingCards(newPendingCards);

    // Update pending reason di invoicesData
    console.log("=== SAVING PENDING REASON ===");
    console.log("Selected Invoice ID:", selectedInvoice.id);
    console.log(
      "Pending Reason Input:",
      pendingReasonInput.trim(),
    );

    const updatedInvoices = invoicesData.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            pendingReason: pendingReasonInput.trim(),
          }
        : inv,
    );

    console.log(
      "Updated Invoice:",
      updatedInvoices.find(
        (inv) => inv.id === selectedInvoice.id,
      ),
    );

    // Find updated invoice
    const updatedInvoice = updatedInvoices.find(
      (inv) => inv.id === selectedInvoice.id,
    );

    // Add history entry to the updated data
    const newHistoryEntry: HistoryEntry = {
      id: `${selectedInvoice.id}-${Date.now()}`,
      timestamp: new Date(),
      action: "MARK_AS_PENDING",
      description: `Invoice marked as pending: ${pendingReasonInput.trim()}`,
      reason: pendingReasonInput.trim(),
    };

    // Add history to the updated invoices
    const invoicesWithHistory = updatedInvoices.map((inv) => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          history: [...(inv.history || []), newHistoryEntry],
        };
      }
      return inv;
    });

    // Update states with forced re-render
    setInvoicesData([...invoicesWithHistory]);
    setRefreshKey((prev) => prev + 1);

    // Force component re-render by updating state
    setTimeout(() => {
      setInvoicesData([...invoicesWithHistory]);
    }, 100);

    const finalUpdatedInvoice = invoicesWithHistory.find(
      (inv) => inv.id === selectedInvoice.id,
    );

    if (finalUpdatedInvoice) {
      setSelectedInvoice({ ...finalUpdatedInvoice });
      console.log(
        "Card marked as PENDING:",
        selectedInvoice.id,
      );
      console.log(
        "Pending cards:",
        Array.from(newPendingCards),
      );
      console.log("History added:", newHistoryEntry);
    }

    // Close dialogs and reset input
    setShowConfirmPendingSave(false);
    setShowPendingDialog(false);
    setPendingReasonInput("");

    // Keep current tab - no need to switch to pending tab
  };

  // Calculate validation distribution by PIC from validated PIs
  const getValidationStatusByPIC = useMemo(() => {
    // Get only validated invoices
    const validatedInvoices = invoicesData.filter(
      (invoice) => invoice.status === "VERIFIED",
    );
    const totalValidated = validatedInvoices.length;

    // Count validations by each PIC
    const picValidations = new Map<PICPI, number>();

    validatedInvoices.forEach((invoice) => {
      if (invoice.picPI) {
        const currentCount =
          picValidations.get(invoice.picPI) || 0;
        picValidations.set(invoice.picPI, currentCount + 1);
      }
    });

    // Convert to chart data format with percentages of total validated
    const chartData = Array.from(picValidations.entries()).map(
      ([pic, count]) => ({
        name: pic,
        value: (count / totalValidated) * 100,
        validated: count,
        totalValidated: totalValidated,
      }),
    );

    // Sort by percentage in descending order (highest to lowest)
    return chartData.sort((a, b) => b.value - a.value);
  }, [invoicesData]);

  const CHART_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c43",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
    "#ff8042",
    "#ff7c43",
    "#ff6b6b",
  ];

  const handleMarkAsNotSubmitted = (id: string) => {
    const updatedData = invoicesData.map((doc) => {
      if (doc.id === id) {
        return {
          ...doc,
          submissionStatus: "NOT_SUBMITTED" as SubmissionStatus,
          pendingReason: undefined,
        };
      }
      return doc;
    });
    setInvoicesData(updatedData);
  };

  const handleVerifyInvoice = () => {
    if (!verificationInvoice) return;

    console.log(
      "Verifying invoice:",
      verificationInvoice.id,
      "with reference data:",
      { referenceNo, referenceDate },
    );

    console.log("from status:", verificationInvoice.status);

    let finalUpdatedInvoice: PurchaseInvoiceData | null = null;

    const updatedData = invoicesData.map((invoice) => {
      if (invoice.id === verificationInvoice.id) {
        const updatedInvoice = {
          ...invoice,
          status: "VERIFIED" as InvoiceStatus,
          picPI: currentPICName as PICPI, // Set the PIC who validated
          referenceNo: referenceNo || invoice.referenceNo, // Store reference number in dedicated field
          referenceDate: referenceDate || invoice.referenceDate, // Store reference date in dedicated field
          internalRemarks: `Verified by ${currentPICName}`,
        };

        console.log(
          "Updated invoice status to:",
          updatedInvoice.status,
        );

        // Add history entry to the updated invoice
        const referenceInfo = [];
        if (referenceNo)
          referenceInfo.push(`Ref No: ${referenceNo}`);
        if (referenceDate)
          referenceInfo.push(`Date: ${referenceDate}`);
        const referenceText =
          referenceInfo.length > 0
            ? ` (${referenceInfo.join(", ")})`
            : "";

        const newHistoryEntry = {
          id: `${invoice.id}-${Date.now()}`,
          timestamp: new Date(),
          action: "VERIFIED" as const,
          description: `Invoice verified by ${currentPICName}${referenceText}`,
          referenceNo: referenceNo || undefined,
          referenceDate: referenceDate || undefined,
        };

        console.log(
          "Audit trail entry created:",
          newHistoryEntry,
        );

        finalUpdatedInvoice = {
          ...updatedInvoice,
          history: [...invoice.history, newHistoryEntry],
        };

        return finalUpdatedInvoice;
      }
      return invoice;
    });

    setInvoicesData(updatedData);

    // Update selectedInvoice in real-time if it matches the verified invoice
    if (
      selectedInvoice &&
      selectedInvoice.id === verificationInvoice.id &&
      finalUpdatedInvoice
    ) {
      setSelectedInvoice(finalUpdatedInvoice);
    }

    // Update historyInvoice in real-time if it matches the verified invoice
    if (
      historyInvoice &&
      historyInvoice.id === verificationInvoice.id &&
      finalUpdatedInvoice
    ) {
      setHistoryInvoice(finalUpdatedInvoice);
    }

    setShowVerificationDialog(false);
    setVerificationInvoice(null);
    setReferenceNo("");
    setReferenceDate("");
  };

  const handleStatusClick = (invoice: PurchaseInvoiceData) => {
    console.log(
      "Status clicked for invoice:",
      invoice.id,
      "current status:",
      invoice.status,
    );

    if (invoice.status === "NOT_VERIFIED") {
      console.log("Showing verification dialog");
      // Show verification dialog for pending invoices
      setVerificationInvoice(invoice);
      setShowVerificationDialog(true);
      setReferenceNo("");
      setReferenceDate("");
    } else if (invoice.status === "VERIFIED") {
      console.log("Showing undo confirmation dialog");
      // Show confirmation dialog for undo verification
      setUndoInvoice(invoice);
      setShowUndoConfirmDialog(true);
    }
  };

  const handleValidateInvoice = (
    invoice: PurchaseInvoiceData,
  ) => {
    console.log("Validate clicked for invoice:", invoice.id);

    // Check if invoice is in pending cards first
    if (pendingCards.has(invoice.id)) {
      // Invoice is pending - show the view reason dialog with release pending option
      handleReasonView(invoice);
      return;
    }

    // Check if document is received
    if (!invoice.receivedStatus) {
      // Document not received - show warning
      setWarningInvoice(invoice);
      setShowValidationWarning(true);
    } else {
      // Document received - proceed directly to validation
      proceedToValidation(invoice);
    }
  };

  const proceedToValidation = (
    invoice: PurchaseInvoiceData,
  ) => {
    // Show verification dialog for validation
    setVerificationInvoice(invoice);
    setShowVerificationDialog(true);
    setReferenceNo("");
    setReferenceDate("");
  };

  // Handle reason view
  const handleReasonView = useCallback(
    (invoice: PurchaseInvoiceData) => {
      console.log("=== VIEWING PENDING REASON ===");
      console.log("Invoice ID:", invoice.id);
      console.log("Invoice Number:", invoice.purchaseInvoiceNo);
      console.log("Pending Reason:", invoice.pendingReason);

      setViewingReasonInvoice(invoice);
      setShowViewReasonDialog(true);
    },
    [],
  );

  // Handle undo pending
  const handleUndoPending = useCallback(
    (invoice: PurchaseInvoiceData) => {
      const confirmUndo = confirm(
        `Are you sure you want to mark "${invoice.purchaseInvoiceNo}" as NOT PENDING?\n\nThis will remove the document from pending list.`,
      );

      if (confirmUndo) {
        // Remove from pending cards
        const updatedPendingCards = new Set(pendingCards);
        updatedPendingCards.delete(invoice.id);
        setPendingCards(updatedPendingCards);

        // Clear pending reason from invoice data
        const updatedInvoices = invoicesData.map((inv) =>
          inv.id === invoice.id
            ? {
                ...inv,
                pendingReason: undefined,
              }
            : inv,
        );

        setInvoicesData([...updatedInvoices]);
        setRefreshKey((prev) => prev + 1);

        // Add to history
        addHistoryEntry(
          invoice.id,
          "UNDO_PENDING",
          `Undo pending status - Invoice "${invoice.purchaseInvoiceNo}" removed from pending list`,
          undefined,
          invoice.pendingReason,
        );

        console.log(
          `Invoice ${invoice.purchaseInvoiceNo} removed from pending`,
        );
      }
    },
    [pendingCards, invoicesData],
  );

  const addHistoryEntry = (
    invoiceId: string,
    action: HistoryEntry["action"],
    description: string,
    referenceNo?: string,
    reason?: string,
  ) => {
    const newEntry: HistoryEntry = {
      id: `${invoiceId}-${Date.now()}`,
      timestamp: new Date(),
      action,
      description,
      referenceNo,
      reason,
    };

    const updatedData = invoicesData.map((invoice) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          history: [...invoice.history, newEntry],
        };
      }
      return invoice;
    });

    setInvoicesData(updatedData);
  };

  const handleShowHistory = (invoice: PurchaseInvoiceData) => {
    setHistoryInvoice(invoice);
    setShowHistoryDialog(true);
  };

  const handleEditReference = (
    invoice: PurchaseInvoiceData,
  ) => {
    console.log("Starting edit for invoice:", {
      id: invoice.id,
      currentReferenceNo: invoice.referenceNo,
      currentReferenceDate: invoice.referenceDate,
    });
    setEditingReferenceId(invoice.id);
    setEditReferenceValue(invoice.referenceNo || "");
    setEditReferenceDateValue(invoice.referenceDate || "");
  };

  const handleSaveReference = () => {
    if (!editingReferenceId) return;

    console.log("Saving reference:", {
      referenceNo: editReferenceValue,
      referenceDate: editReferenceDateValue,
    });

    let updatedInvoice: PurchaseInvoiceData | null = null;

    const updatedData = invoicesData.map((inv) => {
      if (inv.id === editingReferenceId) {
        const oldReferenceNo = inv.referenceNo;
        const oldReferenceDate = inv.referenceDate;
        const newHistoryEntry: HistoryEntry = {
          id: `${inv.id}-ref-${Date.now()}`,
          timestamp: new Date(),
          action: "REFERENCE_UPDATED",
          description: `Reference updated from "${oldReferenceNo || "Not set"}" (${oldReferenceDate || "No date"}) to "${editReferenceValue}" (${editReferenceDateValue || "No date"})`,
          referenceNo: editReferenceValue,
          referenceDate: editReferenceDateValue,
        };

        updatedInvoice = {
          ...inv,
          referenceNo: editReferenceValue,
          referenceDate: editReferenceDateValue,
          history: [...inv.history, newHistoryEntry],
        };

        return updatedInvoice;
      }
      return inv;
    });

    setInvoicesData(updatedData);

    // Update selectedInvoice in real-time if it matches the edited invoice
    if (
      selectedInvoice &&
      selectedInvoice.id === editingReferenceId &&
      updatedInvoice
    ) {
      setSelectedInvoice(updatedInvoice);
    }

    // Update historyInvoice in real-time if it matches the edited invoice
    if (
      historyInvoice &&
      historyInvoice.id === editingReferenceId &&
      updatedInvoice
    ) {
      setHistoryInvoice(updatedInvoice);
    }

    setEditingReferenceId(null);
    setEditReferenceValue("");
    setEditReferenceDateValue("");
  };

  const handleCancelEditReference = () => {
    setEditingReferenceId(null);
    setEditReferenceValue("");
    setEditReferenceDateValue("");
  };

  // Received Documents Functions
  const handleToggleMarkAsReceivedColumn = () => {
    setShowMarkAsReceivedColumn(!showMarkAsReceivedColumn);
    setSelectedDocuments(new Set()); // Clear selection when toggling
  };

  const handleDocumentSelect = (docId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleMarkAsReceivedClick = () => {
    if (selectedDocuments.size > 0) {
      setShowReceiveConfirmDialog(true);
      setReceiveDate(""); // Reset receive date
    }
  };

  const handleConfirmReceive = () => {
    if (!receiveDate) return;

    // Convert from YYYY-MM-DD to DD/MM/YYYY format
    const dateParts = receiveDate.split("-");
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    const updatedDocs = receivedDocsData.map((doc) => {
      if (selectedDocuments.has(doc.id)) {
        return {
          ...doc,
          receivedDate: formattedDate,
          isReceived: true,
        };
      }
      return doc;
    });

    setReceivedDocsData(updatedDocs);

    // Sync received date to invoicesData based on PO Number and PI Number matching
    const updatedInvoices = invoicesData.map((invoice) => {
      const matchingDoc = updatedDocs.find(
        (doc) =>
          selectedDocuments.has(doc.id) &&
          (doc.poNumber === invoice.noPO ||
            doc.piNo === invoice.purchaseInvoiceNo),
      );

      if (matchingDoc) {
        // Create new history entry for document received
        const newHistoryEntry: HistoryEntry = {
          id: `${invoice.id}-received-${Date.now()}`,
          timestamp: new Date(),
          action: "RECEIVED_DOCUMENT",
          description: `Document Received on ${formattedDate}. Attachment: ${matchingDoc.attachment} (${matchingDoc.attachmentNo})`,
          referenceNo: `DOC-RECEIVED-${matchingDoc.attachmentNo}`,
          referenceDate: formattedDate,
          reason: `Document marked as received in RECEIVED DOCS tab`,
        };

        return {
          ...invoice,
          docReceivedDate: formattedDate,
          history: [...invoice.history, newHistoryEntry],
        };
      }
      return invoice;
    });

    setInvoicesData(updatedInvoices);
    setSelectedDocuments(new Set());
    setShowReceiveConfirmDialog(false);
    setReceiveDate("");
    setShowMarkAsReceivedColumn(false);
  };

  const handleCancelReceive = () => {
    setShowReceiveConfirmDialog(false);
    setReceiveDate("");
  };

  const handleMarkAsNotifiedClick = () => {
    if (selectedDocuments.size > 0) {
      setSelectedDocsForNotified(new Set(selectedDocuments));
      setShowMarkAsNotifiedDialog(true);
    }
  };

  const handleConfirmMarkAsNotified = () => {
    if (selectedDocsForNotified.size === 0) return;

    const docsToMark = Array.from(receivedDocsData).filter((doc) =>
      selectedDocsForNotified.has(doc.id),
    );

    try {
      const storedNotifiedDocs = JSON.parse(
        localStorage.getItem("notifiedDocuments") || "[]",
      );

      docsToMark.forEach((doc) => {
        // Check if document already exists in notified list
        const docExists = storedNotifiedDocs.some(
          (existingDoc: any) => existingDoc.piNo === doc.piNo,
        );

        if (!docExists) {
          const newNotifiedDoc = {
            id: doc.id,
            poNo: doc.poNumber,
            piNo: doc.piNo,
            traceCode: doc.warehouse,
            checkStatus: false,
            receivedStatus: false, // Not received yet
            isNotified: true, // Marked as notified urgent
            status: "Pending",
            piData: doc,
            source: "markedAsNotified",
            storedAt: getCurrentDate(),
            statusType: "Document Receipt",
            notificationTimestamp: Date.now(),
            notifiedBadge: true, // Flag for displaying badge
          };

          storedNotifiedDocs.push(newNotifiedDoc);
          console.log(
            "✅ Document marked as notified urgent:",
            doc.piNo,
          );
        }
      });

      localStorage.setItem(
        "notifiedDocuments",
        JSON.stringify(storedNotifiedDocs),
      );

      // Close dialog and reset
      setShowMarkAsNotifiedDialog(false);
      setSelectedDocsForNotified(new Set());
      setSelectedDocuments(new Set());
      setShowMarkAsReceivedColumn(false);

      // Show success message
      alert(
        `✅ ${docsToMark.length} document(s) marked as notified urgent priority`,
      );
    } catch (error) {
      console.error("Failed to mark documents as notified:", error);
      alert("Failed to mark documents as notified");
    }
  };

  const handleCancelMarkAsNotified = () => {
    setShowMarkAsNotifiedDialog(false);
    setSelectedDocsForNotified(new Set());
  };


  const handleClearFilters = () => {
    setReceivedDocsSearch("");
    setFilterWarehouse("");
    setFilterPT("");
    setFilterDeliveryDate("");
    setFilterReceivedDate("");
  };

  const handleUndoVerification = (
    invoice: PurchaseInvoiceData,
  ) => {
    console.log(
      "Undoing verification for invoice:",
      invoice.id,
      "from status:",
      invoice.status,
    );

    const updatedData = invoicesData.map((inv) => {
      if (inv.id === invoice.id) {
        const updatedInvoice = {
          ...inv,
          status: "NOT_VERIFIED" as InvoiceStatus,
          internalRemarks:
            "Verification undone - awaiting re-verification",
        };

        console.log(
          "Updated invoice status to:",
          updatedInvoice.status,
        );

        // Add history entry to the updated invoice
        const newHistoryEntry = {
          id: `${inv.id}-${Date.now()}`,
          timestamp: new Date(),
          action: "UNDO_VERIFICATION" as const,
          description: "Verification status undone",
        };

        return {
          ...updatedInvoice,
          history: [...inv.history, newHistoryEntry],
        };
      }
      return inv;
    });
    setInvoicesData(updatedData);
  };

  const handleConfirmUndoVerification = () => {
    if (!undoInvoice) return;

    handleUndoVerification(undoInvoice);
    setShowUndoConfirmDialog(false);
    setUndoInvoice(null);
  };

  const handleUndoSubmission = (
    invoice: PurchaseInvoiceData,
  ) => {
    setUndoSubmissionInvoice(invoice);
    setShowUndoSubmissionDialog(true);
  };

  const handleConfirmUndoSubmission = () => {
    if (!undoSubmissionInvoice) return;

    const updatedData = invoicesData.map((inv) => {
      if (inv.id === undoSubmissionInvoice.id) {
        // Create history entry for cancelled submission
        const newHistoryEntry = {
          id: `${inv.id}-${Date.now()}`,
          timestamp: new Date(),
          action: "UNDO_SUBMISSION" as const,
          description: `Document submission cancelled - returned to Not Submitted status`,
        };

        return {
          ...inv,
          submissionStatus: "NOT_SUBMITTED" as SubmissionStatus,
          pendingReason: undefined,
          documentType: undefined,
          submittedTo: undefined,
          picName: undefined,
          history: [...inv.history, newHistoryEntry],
        };
      }
      return inv;
    });
    setInvoicesData(updatedData);
    setShowUndoSubmissionDialog(false);
    setUndoSubmissionInvoice(null);
  };

  const handleResubmit = (invoice: PurchaseInvoiceData) => {
    setResubmitInvoice(invoice);
    setShowResubmitDialog(true);
    setResubmitReason("");
  };

  const handleConfirmResubmit = () => {
    if (!resubmitInvoice || !resubmitReason.trim()) return;

    // Add history entry for resubmission
    const updatedData = invoicesData.map((inv) => {
      if (inv.id === resubmitInvoice.id) {
        const newHistoryEntry = {
          id: `${inv.id}-${Date.now()}`,
          timestamp: new Date(),
          action: "SUBMITTED" as const,
          description: `Document resubmitted`,
          reason: resubmitReason.trim(),
        };

        return {
          ...inv,
          history: [...inv.history, newHistoryEntry],
        };
      }
      return inv;
    });

    setInvoicesData(updatedData);
    setShowResubmitDialog(false);
    setResubmitInvoice(null);
    setResubmitReason("");
  };

  // Handle receive documents from notification
  const handleReceiveDocuments = (
    folderId: string,
    documentIds: string[],
  ) => {
    // Store the data and show dialog to select receive date
    setPendingReceiveData({ folderId, documentIds });
    setReceiveDateInput("");
    setUseCurrentDateForReceive(false);
    setShowReceiveDateDialog(true);
  };

  const confirmReceiveDocuments = () => {
    if (!pendingReceiveData) return;

    const { folderId, documentIds } = pendingReceiveData;
    const folder = pendingFolders.find(
      (f) => f.id === folderId,
    );
    if (!folder) return;

    // Determine receive date
    let receiveDate = receiveDateInput;
    if (useCurrentDateForReceive) {
      receiveDate = getCurrentDate();
    }

    // Validate date
    if (!receiveDate || !isValidDate(receiveDate)) {
      alert("Please enter a valid date in DD/MM/YYYY format");
      return;
    }

    // Get received documents
    const receivedDocs = folder.documents.filter((doc) =>
      documentIds.includes(doc.id),
    );

    // Add to received documents list
    setReceivedDocsList((prev) => [...prev, ...receivedDocs]);

    // Update existing invoices that match the received documents
    setInvoicesData((prev) =>
      prev.map((invoice) => {
        const matchingDoc = receivedDocs.find(
          (doc) => doc.purchaseInvoiceNo === invoice.purchaseInvoiceNo
        );
        if (matchingDoc) {
          // Store to localStorage if not checked and received
          if (invoice.checkStatus === false && matchingDoc.purchaseInvoiceNo) {
            try {
              const storedNotifiedDocs = JSON.parse(localStorage.getItem("notifiedDocuments") || "[]");
              
              // Check if document already exists
              const docExists = storedNotifiedDocs.some((doc: any) => doc.piNo === invoice.purchaseInvoiceNo);
              
              if (!docExists) {
                const newReceivedDoc = {
                  id: invoice.piId,
                  poNo: invoice.noPO || "-",
                  piNo: invoice.purchaseInvoiceNo || "-",
                  traceCode: invoice.warehouse || "-",
                  checkStatus: invoice.checkStatus,
                  receivedStatus: true,
                  isNotified: invoice.checkStatus === false && true,
                  status: "Pending",
                  piData: invoice,
                  source: "receivedFromUI",
                  storedAt: receiveDate,
                  notificationTimestamp: Date.now(),
                };
                
                storedNotifiedDocs.push(newReceivedDoc);
                localStorage.setItem("notifiedDocuments", JSON.stringify(storedNotifiedDocs));
                console.log("✅ Received document stored to notified list:", invoice.purchaseInvoiceNo);
              }
            } catch (error) {
              console.error("Failed to store received document:", error);
            }
          }

          return {
            ...invoice,
            receivedStatus: true,
            docReceivedDate: receiveDate,
            history: [
              ...(invoice.history || []),
              {
                id: `${invoice.id}-received`,
                timestamp: new Date(),
                action: "RECEIVED_DOCUMENT",
                description: `Document received on ${receiveDate}`,
              },
            ],
          };
        }
        return invoice;
      })
    );

    // Update pending folders - remove received documents from folder
    setPendingFolders((prev) => {
      return prev
        .map((f) => {
          if (f.id === folderId) {
            const remainingDocs = f.documents.filter(
              (doc) => !documentIds.includes(doc.id),
            );
            return {
              ...f,
              documents: remainingDocs,
            };
          }
          return f;
        })
        .filter((f) => f.documents.length > 0); // Remove empty folders
    });

    // Close dialog and reset
    setShowReceiveDateDialog(false);
    setPendingReceiveData(null);
    setReceiveDateInput("");
    setUseCurrentDateForReceive(false);
  };

  const getStatusBadge = (
    status: InvoiceStatus,
    invoice?: PurchaseInvoiceData,
  ) => {
    if (!invoice) {
      // Fallback for cases without invoice data
      const config = {
        VERIFIED: {
          color: "bg-green-100 text-green-700 border-green-300",
          icon: Check,
          displayText: "VERIFIED",
        },
        "NOT_VERIFIED": {
          color: "bg-gray-100 text-gray-700 border-gray-300",
          icon: Minus,
          displayText: "PENDING",
        },
      };
      const { color, icon: Icon, displayText } = config[status];

      return (
        <Badge
          className={`${color} border flex items-center gap-1`}
        >
          <Icon className="h-3 w-3" />
          {displayText}
        </Badge>
      );
    }

    // Comprehensive status check for submission eligibility
    const isReceived = invoice.receivedStatus === true;
    const isVerified = invoice.status === "VERIFIED";
    const isEligible = isReceived && isVerified;

    let color, icon, displayText, tooltip;

    if (isEligible) {
      color = "bg-green-100 text-green-700 border-green-300";
      icon = Check;
      displayText = "READY";
      tooltip = "Ready for submission: Received & Verified";
    } else if (isVerified && !isReceived) {
      color = "bg-orange-100 text-orange-700 border-orange-300";
      icon = AlertCircle;
      displayText = "NOT RECEIVED";
      tooltip = "Verified but documents not received yet";
    } else if (!isVerified && isReceived) {
      color = "bg-yellow-100 text-yellow-700 border-yellow-300";
      icon = AlertCircle;
      displayText = "NOT VERIFIED";
      tooltip = "Documents received but not verified yet";
    } else if (!isReceived && !isVerified) {
      color = "bg-red-100 text-red-700 border-red-300";
      icon = X;
      displayText = "NOT READY";
      tooltip = "Documents not received and not verified";
    } else {
      color = "bg-gray-100 text-gray-700 border-gray-300";
      icon = Minus;
      displayText = "PENDING";
      tooltip = "Verification pending";
    }

    const Icon = icon;
    const badgeContent = (
      <Badge
        className={`${color} border flex items-center gap-1 cursor-pointer hover:shadow-md transition-all hover:scale-105`}
        title={tooltip}
      >
        <Icon className="h-3 w-3" />
        {displayText}
      </Badge>
    );

    return (
      <div onClick={() => handleStatusClick(invoice)}>
        {badgeContent}
      </div>
    );
  };

  const getSubmissionStatusBadge = (
    submissionStatus: SubmissionStatus,
  ) => {
    const config = {
      SUBMITTED: {
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Upload,
        text: "Submitted",
      },
      NOT_SUBMITTED: {
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: AlertCircle,
        text: "Not Submitted",
      },
      PENDING: {
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: CheckCircle2,
        text: "Pending",
      },
    };
    const {
      color,
      icon: Icon,
      text,
    } = config[submissionStatus];
    return (
      <Badge
        className={`${color} border flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPICInitial = (picName: string) => {
    return picName.charAt(0).toUpperCase();
  };

  const getPICBadge = (picName: string) => {
    const initial = getPICInitial(picName);
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
          {initial}
        </div>
        <span className="text-green-700 text-sm font-medium">
          {picName}
        </span>
      </div>
    );
  };

  // Dashboard data filtering and processing
  const getDashboardFilteredData = useMemo(() => {
    let filtered = [...invoicesData];

    // Filter by PIC
    if (dashboardPICFilter !== "all") {
      filtered = filtered.filter(
        (inv) => inv.picPI === dashboardPICFilter,
      );
    }

    // Filter by validation status (for pie chart click)
    if (dashboardStatusFilter !== "all") {
      filtered = filtered.filter((inv) => {
        if (dashboardStatusFilter === "VALIDATED")
          return inv.status === "VERIFIED";
        if (dashboardStatusFilter === "PENDING")
          return inv.status === "NOT_VERIFIED";
        if (dashboardStatusFilter === "SUBMITTED")
          return inv.submissionStatus === "SUBMITTED";
        return true;
      });
    }

    // Filter by document type (only for submitted)
    if (
      dashboardDocTypeFilter !== "all" &&
      dashboardStatusFilter === "SUBMITTED"
    ) {
      filtered = filtered.filter(
        (inv) => inv.documentType === dashboardDocTypeFilter,
      );
    }

    // Filter by month and year
    filtered = filtered.filter((inv) => {
      if (!inv.docReceivedDate) return true;
      const [day, month, year] = inv.docReceivedDate
        .split("/")
        .map(Number);

      const matchesMonth =
        dashboardMonthFilter === "all" ||
        month === parseInt(dashboardMonthFilter);
      const matchesYear =
        dashboardYearFilter === "all" ||
        year === parseInt(dashboardYearFilter);

      return matchesMonth && matchesYear;
    });

    // Filter by time period
    const now = new Date();
    filtered = filtered.filter((inv) => {
      if (!inv.docReceivedDate) return true;
      const [day, month, year] = inv.docReceivedDate
        .split("/")
        .map(Number);
      const docDate = new Date(year, month - 1, day);

      if (dashboardTimeFilter === "day") {
        return docDate.toDateString() === now.toDateString();
      } else if (dashboardTimeFilter === "month") {
        return (
          docDate.getMonth() === now.getMonth() &&
          docDate.getFullYear() === now.getFullYear()
        );
      } else if (dashboardTimeFilter === "year") {
        return docDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    return filtered;
  }, [
    invoicesData,
    dashboardPICFilter,
    dashboardTimeFilter,
    dashboardDocTypeFilter,
    dashboardStatusFilter,
    dashboardMonthFilter,
    dashboardYearFilter,
  ]);

  const stats = {
    total: invoicesData.length,
    verified: invoicesData.filter(
      (inv) => inv.status === "VERIFIED",
    ).length,
    pendingVerification: invoicesData.filter(
      (inv) => inv.status === "NOT_VERIFIED",
    ).length,
    totalValue: invoicesData.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    ),
    submitted: submittedDocs.length,
    pending: pendingDocs.length,
    notSubmitted: availableDocsForSubmission.length,
  };

  // Dashboard stats based on filtered data
  const dashboardStats = useMemo(() => {
    const filtered = filteredData; // Use filteredData from work area
    return {
      total: filtered.length,
      validated: filtered.filter(
        (inv) => inv.status === "VERIFIED",
      ).length,
      pending: filtered.filter(
        (inv) => inv.status !== "VERIFIED",
      ).length,
      pendingCase: filtered.filter((inv) =>
        pendingCards.has(inv.id),
      ).length,
      submitted: filtered.filter(
        (inv) => inv.submissionStatus === "SUBMITTED",
      ).length,
    };
  }, [filteredData, pendingCards]);

  // Pie chart data for validation status
  const validationPieData = useMemo(() => {
    const filtered = getDashboardFilteredData;
    const validated = filtered.filter(
      (inv) => inv.status === "VERIFIED",
    ).length;
    const pending = filtered.filter(
      (inv) => inv.status === "NOT_VERIFIED",
    ).length;
    const submitted = filtered.filter(
      (inv) => inv.submissionStatus === "SUBMITTED",
    ).length;

    return [
      { name: "Verified", value: validated, color: "#10b981" },
      { name: "Pending", value: pending, color: "#f59e0b" },
      { name: "Submitted", value: submitted, color: "#3b82f6" },
    ].filter((item) => item.value > 0);
  }, [getDashboardFilteredData]);

  // Monthly recap data
  const monthlyRecapData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1,
      );
      const monthName = date.toLocaleString("id-ID", {
        month: "short",
      });

      const monthData = invoicesData.filter((inv) => {
        if (!inv.docReceivedDate) return false;
        const [day, month, year] = inv.docReceivedDate
          .split("/")
          .map(Number);
        const docDate = new Date(year, month - 1, day);
        return (
          docDate.getMonth() === date.getMonth() &&
          docDate.getFullYear() === date.getFullYear()
        );
      });

      months.push({
        month: monthName,
        validated: monthData.filter(
          (inv) => inv.status === "VERIFIED",
        ).length,
        pending: monthData.filter(
          (inv) => inv.status === "NOT_VERIFIED",
        ).length,
        submitted: monthData.filter(
          (inv) => inv.submissionStatus === "SUBMITTED",
        ).length,
      });
    }

    return months;
  }, [invoicesData]);

  // PIC Activity data
  const picActivityData = useMemo(() => {
    const picMap = new Map<string, number>();

    getDashboardFilteredData.forEach((inv) => {
      const count = picMap.get(inv.picPI) || 0;
      picMap.set(inv.picPI, count + 1);
    });

    return Array.from(picMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [getDashboardFilteredData]);

  // Filter received documents based on search and filters
  const filteredReceivedDocs = receivedDocsData.filter(
    (doc) => {
      const matchesSearch =
        receivedDocsSearch === "" ||
        doc.supplier
          .toLowerCase()
          .includes(receivedDocsSearch.toLowerCase()) ||
        doc.piNo
          .toLowerCase()
          .includes(receivedDocsSearch.toLowerCase()) ||
        doc.poNumber
          .toLowerCase()
          .includes(receivedDocsSearch.toLowerCase()) ||
        doc.attachmentNo
          .toLowerCase()
          .includes(receivedDocsSearch.toLowerCase());

      const matchesWarehouse =
        filterWarehouse === "" ||
        doc.warehouse === filterWarehouse;
      const matchesPT = filterPT === "" || doc.pt === filterPT;

      // Convert dates to YYYY-MM-DD format for comparison with date input
      const docDeliveryDate = doc.deliveryDate
        .split("/")
        .reverse()
        .join("-"); // DD/MM/YYYY -> YYYY-MM-DD
      const docReceivedDate = doc.receivedDate
        ? doc.receivedDate.split("/").reverse().join("-")
        : null;

      const matchesDeliveryDate =
        filterDeliveryDate === "" ||
        docDeliveryDate === filterDeliveryDate;
      const matchesReceivedDate =
        filterReceivedDate === "" ||
        (docReceivedDate &&
          docReceivedDate === filterReceivedDate);

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesPT &&
        matchesDeliveryDate &&
        matchesReceivedDate
      );
    },
  );

  // Static filter options
  const uniqueWarehouses = [
    "CILACAP",
    "DUMAI",
    "MEDAN",
    "BELAWAN",
    "JAKARTA",
    "SURABAYA",
    "BALIKPAPAN",
  ];
  const uniquePTs = [
    "MJS",
    "WNS",
    "AMT",
    "GMI",
    "TTP",
    "WSI",
    "IMI",
  ];

  if (viewMode === "dashboard") {
    return (
      <div className="space-y-6">
        {/* Main Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("dashboard")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => setViewMode("workarea")}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Work Area
          </Button>
        </div>

        {/* Tab Cards */}
        <div className="flex gap-4">
          <Card
            className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-purple-200 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] ${
              dashboardActiveTab === "all"
                ? "ring-2 ring-purple-400 shadow-purple-200/50"
                : ""
            }`}
            onClick={() => setDashboardActiveTab("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">
                    Total Invoices
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardStats.total}
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-purple-200 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] ${
              dashboardActiveTab === "validated"
                ? "ring-2 ring-purple-400 shadow-purple-200/50"
                : ""
            }`}
            onClick={() => setDashboardActiveTab("validated")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">
                    Validated
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardStats.validated}
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-purple-200 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] ${
              dashboardActiveTab === "pending"
                ? "ring-2 ring-purple-400 shadow-purple-200/50"
                : ""
            }`}
            onClick={() => setDashboardActiveTab("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">
                    Pending Validation
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardStats.pending}
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-purple-200 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] ${
              dashboardActiveTab === "pendingCase"
                ? "ring-2 ring-purple-400 shadow-purple-200/50"
                : ""
            }`}
            onClick={() => setDashboardActiveTab("pendingCase")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">
                    Pending Case
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardStats.pendingCase}
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-purple-200 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] ${
              dashboardActiveTab === "submitted"
                ? "ring-2 ring-purple-400 shadow-purple-200/50"
                : ""
            }`}
            onClick={() => setDashboardActiveTab("submitted")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Upload className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">
                    Submitted
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardStats.submitted}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard Filters - Month and Year */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={dashboardMonthFilter}
              onValueChange={setDashboardMonthFilter}
            >
              <SelectTrigger className="border-purple-200">
                <SelectValue placeholder="Filter by Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dashboardYearFilter}
              onValueChange={setDashboardYearFilter}
            >
              <SelectTrigger className="border-purple-200">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Validation Distribution - Radial Bar Chart (Semi Circle) */}
          <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50">
            {/* Title */}
            <div className="mb-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                VALIDATION DISTRIBUTION BY PIC
              </h3>
            </div>

            <div className="flex items-center gap-6">
              {/* Left: Radial Bar Chart (Semi Circle) - VERTICAL (Top to Bottom) */}
              <div
                className="relative"
                style={{ width: "350px", height: "700px" }}
              >
                <svg
                  width="350"
                  height="700"
                  viewBox="0 0 350 700"
                >
                  {getValidationStatusByPIC.map(
                    (item, index) => {
                      // Different radius for each segment (scaled up ~25%)
                      const radiusSizes = [
                        250, 225, 200, 175, 150, 125,
                      ];
                      const radius = radiusSizes[index] || 125;

                      const purpleShades = [
                        "#2d1b69",
                        "#4c2a85",
                        "#5b3a9a",
                        "#6b4ba8",
                        "#7c5cb6",
                        "#9a7fd6",
                      ];

                      // Calculate angles for this segment
                      const total =
                        getValidationStatusByPIC.reduce(
                          (sum, d) => sum + d.value,
                          0,
                        );
                      let startAngle = 90;

                      // Calculate start angle by summing previous segments
                      for (let i = 0; i < index; i++) {
                        startAngle -=
                          (getValidationStatusByPIC[i].value /
                            total) *
                          180;
                      }

                      const angle = (item.value / total) * 180;
                      const endAngle = startAngle - angle;

                      // Convert to radians
                      const startRad =
                        (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;

                      // Calculate path for the segment (semi-circle from left)
                      const cx = 0;
                      const cy = 325; // Adjusted for smaller viewBox

                      const x1 =
                        cx + radius * Math.cos(startRad);
                      const y1 =
                        cy - radius * Math.sin(startRad);
                      const x2 = cx + radius * Math.cos(endRad);
                      const y2 = cy - radius * Math.sin(endRad);

                      const largeArcFlag = angle > 180 ? 1 : 0;

                      const pathData = [
                        `M ${cx} ${cy}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                        `Z`,
                      ].join(" ");

                      // Calculate label position
                      const midAngle =
                        (startAngle + endAngle) / 2;
                      const midRad = (midAngle * Math.PI) / 180;

                      // For small segments (< 15%), show label outside with line
                      const isSmallSegment =
                        item.value < 15 || radius < 140;

                      let labelX,
                        labelY,
                        showLine = false,
                        lineEndX,
                        lineEndY,
                        elbowX,
                        elbowY;

                      if (isSmallSegment) {
                        // Line starts at segment edge
                        const lineStartRadius = radius - 3;
                        lineEndX =
                          cx +
                          lineStartRadius * Math.cos(midRad);
                        lineEndY =
                          cy -
                          lineStartRadius * Math.sin(midRad);

                        // Elbow point - extend outward then horizontal
                        const elbowRadius = radius + 35;
                        elbowX =
                          cx + elbowRadius * Math.cos(midRad);
                        elbowY =
                          cy - elbowRadius * Math.sin(midRad);

                        // Count position among small segments only
                        let smallSegmentIndex = 0;
                        for (let i = 0; i < index; i++) {
                          const checkRadius =
                            radiusSizes[i] || 100;
                          if (
                            getValidationStatusByPIC[i].value <
                              15 ||
                            checkRadius < 140
                          ) {
                            smallSegmentIndex++;
                          }
                        }

                        // Total count of small segments
                        const totalSmallSegments =
                          getValidationStatusByPIC.filter(
                            (item, i) => {
                              const checkRadius =
                                radiusSizes[i] || 100;
                              return (
                                item.value < 15 ||
                                checkRadius < 140
                              );
                            },
                          ).length;

                        // Aggressive vertical spacing for bottom segments
                        const segmentAngle = Math.abs(midAngle);
                        let verticalOffset = 0;

                        // Check if this is one of the last 3 small segments (Jessica, Kelly, Jennifer)
                        const isBottomThree =
                          smallSegmentIndex >=
                          totalSmallSegments - 3;

                        // Stack labels progressively downward for bottom segments (scaled up ~25%)
                        if (
                          isBottomThree ||
                          segmentAngle < 10
                        ) {
                          // Last 3 segments (Jessica, Kelly, Jennifer) - reduced spacing to match Helen-Chintya gap
                          const bottomPosition =
                            smallSegmentIndex -
                            (totalSmallSegments - 3);
                          verticalOffset =
                            (totalSmallSegments - 3) * 24 +
                            bottomPosition * 24;
                        } else if (segmentAngle < 20) {
                          // Extremely bottom segments - large spacing
                          verticalOffset =
                            smallSegmentIndex * 24;
                        } else if (segmentAngle < 35) {
                          // Very bottom segments - medium-large spacing
                          verticalOffset =
                            smallSegmentIndex * 19;
                        } else if (segmentAngle < 55) {
                          // Middle-bottom segments - medium spacing
                          verticalOffset =
                            smallSegmentIndex * 14;
                        } else if (segmentAngle < 75) {
                          // Upper-bottom segments - small spacing
                          verticalOffset =
                            smallSegmentIndex * 10;
                        }

                        // Fixed X position for all labels (right-aligned, scaled up)
                        const fixedLabelX = 260; // Scaled up from 210
                        labelX = fixedLabelX;
                        labelY = elbowY + verticalOffset;

                        // Horizontal line endpoint at fixed position (5px gap before label)
                        elbowX = fixedLabelX - 5;

                        showLine = true;
                      } else {
                        // Position label inside
                        const labelRadius = radius * 0.65;
                        labelX =
                          cx + labelRadius * Math.cos(midRad);
                        labelY =
                          cy - labelRadius * Math.sin(midRad);
                      }

                      return (
                        <g
                          key={index}
                          style={{
                            cursor: "pointer",
                            transition:
                              "transform 0.3s ease, filter 0.3s ease",
                            transformOrigin: `${cx}px ${cy}px`,
                          }}
                          onClick={() =>
                            setSelectedPICForDetail(item.name)
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1.05)";
                            e.currentTarget.style.filter =
                              "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1)";
                            e.currentTarget.style.filter =
                              "none";
                          }}
                        >
                          <path
                            d={pathData}
                            fill={
                              purpleShades[
                                index % purpleShades.length
                              ]
                            }
                            stroke="#ffffff"
                            strokeWidth="3"
                          >
                            <title>{`${item.name}: ${item.value}%`}</title>
                          </path>

                          {showLine && (
                            <>
                              {/* Vertical line down from segment */}
                              <line
                                x1={lineEndX}
                                y1={lineEndY}
                                x2={lineEndX}
                                y2={labelY}
                                stroke={
                                  purpleShades[
                                    index % purpleShades.length
                                  ]
                                }
                                strokeWidth="2"
                                opacity="0.8"
                              />
                              {/* Horizontal line from vertical to label */}
                              <line
                                x1={lineEndX}
                                y1={labelY}
                                x2={elbowX}
                                y2={labelY}
                                stroke={
                                  purpleShades[
                                    index % purpleShades.length
                                  ]
                                }
                                strokeWidth="2"
                                opacity="0.8"
                              />
                              <circle
                                cx={lineEndX}
                                cy={lineEndY}
                                r="2.5"
                                fill={
                                  purpleShades[
                                    index % purpleShades.length
                                  ]
                                }
                              />
                            </>
                          )}

                          <text
                            x={labelX}
                            y={labelY}
                            fill={
                              isSmallSegment
                                ? purpleShades[
                                    index % purpleShades.length
                                  ]
                                : "white"
                            }
                            textAnchor={
                              isSmallSegment
                                ? "start"
                                : "middle"
                            }
                            dominantBaseline="central"
                            fontWeight="bold"
                            fontSize={
                              isSmallSegment ? "15" : "20"
                            }
                            style={{
                              textShadow: isSmallSegment
                                ? "none"
                                : "1px 1px 2px rgba(0,0,0,0.3)",
                            }}
                          >
                            {`${item.value.toFixed(0)}%`}
                          </text>
                        </g>
                      );
                    },
                  )}

                  {/* Central white circle */}
                  <circle
                    cx="0"
                    cy="325"
                    r="30"
                    fill="white"
                    stroke="#e9d5ff"
                    strokeWidth="5"
                  />
                </svg>
              </div>

              {/* Right: Labels with horizontal bars */}
              <div className="flex-1 space-y-3">
                {getValidationStatusByPIC.map((item, index) => {
                  const purpleShades = [
                    "#2d1b69",
                    "#4c2a85",
                    "#5b3a9a",
                    "#6b4ba8",
                    "#7c5cb6",
                    "#9a7fd6",
                  ];

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      {/* Horizontal connecting line */}
                      <div
                        className="w-8 h-0.5"
                        style={{
                          backgroundColor:
                            purpleShades[index % 6],
                        }}
                      />

                      {/* Label and percentage bar */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-700 font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Progress bar container with ship */}
                          <div
                            className="flex-1 relative overflow-visible"
                            style={{
                              height:
                                index === 0
                                  ? "48px"
                                  : index === 1
                                    ? "40px"
                                    : index === 2
                                      ? "34px"
                                      : index === 3
                                        ? "28px"
                                        : index === 4
                                          ? "24px"
                                          : "20px",
                            }}
                          >
                            {/* Background track */}
                            <div className="absolute inset-0 bg-gray-200 rounded-sm" />

                            {/* Progress bar fill with liquid wave effect */}
                            <div
                              className="h-full transition-all duration-700 ease-out relative overflow-visible rounded-sm"
                              style={{
                                width: `${item.value}%`,
                                background: `linear-gradient(90deg, ${purpleShades[index % 6]}, ${purpleShades[index % 6]}dd)`,
                                boxShadow: `0 0 10px ${purpleShades[index % 6]}80`,
                              }}
                            >
                              {/* Liquid wave effect on top */}
                              <div
                                className="absolute top-0 left-0 w-full opacity-30"
                                style={{
                                  height: "100%",
                                  background:
                                    "rgba(255, 255, 255, 0.3)",
                                  animation:
                                    "liquidWave 3s ease-in-out infinite",
                                  clipPath:
                                    "polygon(0% 60%, 10% 55%, 20% 50%, 30% 48%, 40% 50%, 50% 55%, 60% 58%, 70% 55%, 80% 50%, 90% 48%, 100% 50%, 100% 100%, 0% 100%)",
                                }}
                              />

                              {/* Second wave layer for more depth */}
                              <div
                                className="absolute top-0 left-0 w-full opacity-20"
                                style={{
                                  height: "100%",
                                  background:
                                    "rgba(255, 255, 255, 0.4)",
                                  animation:
                                    "liquidWave2 4s ease-in-out infinite",
                                  animationDelay: "-1s",
                                  clipPath:
                                    "polygon(0% 70%, 10% 65%, 20% 62%, 30% 60%, 40% 62%, 50% 68%, 60% 72%, 70% 68%, 80% 62%, 90% 60%, 100% 65%, 100% 100%, 0% 100%)",
                                }}
                              />
                            </div>
                          </div>

                          {/* Percentage text */}
                          <span className="text-sm font-bold text-gray-800 min-w-[45px] text-right">
                            {item.value.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-purple-100">
              <p className="text-[10px] text-gray-400 text-right">
                Source: Purchase Invoice Validation System 2025
              </p>
            </div>
          </Card>

          {/* Detail Statistics */}
          <Card className="p-6 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-purple-900">DETAIL</h3>
              </div>
              {selectedPICForDetail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPICForDetail(null)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {selectedPICForDetail ? (
              <div className="space-y-4">
                {/* Doc Type Filter Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-purple-900">
                    Doc Type:
                  </span>
                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "all"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("all")
                    }
                    className={
                      detailDocTypeFilter === "all"
                        ? "bg-purple-600 hover:bgs-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    ALL
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "REIMBURSEMENT"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("REIMBURSEMENT")
                    }
                    className={
                      detailDocTypeFilter === "REIMBURSEMENT"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    REIMBURSEMENT
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "BUNKER / FRESH WATER"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("BUNKER / FRESH WATER")
                    }
                    className={
                      detailDocTypeFilter === "BUNKER / FRESH WATER"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    BUNKER / FRESH WATER
                  </Button>

                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "QPF"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("QPF")
                    }
                    className={
                      detailDocTypeFilter === "QPF"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    QPF
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "CREDIT"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("CREDIT")
                    }
                    className={
                      detailDocTypeFilter === "CREDIT"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    CREDIT
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      detailDocTypeFilter === "DOWN PAYMENT"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDetailDocTypeFilter("DOWN PAYMENT")
                    }
                    className={
                      detailDocTypeFilter === "DOWN PAYMENT"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    DOWN PAYMENT
                  </Button>
                </div>

                {/* PIC Name Header */}
                <div className="flex items-center gap-2 p-3 bg-purple-100 rounded-lg">
                  <User className="h-5 w-5 text-purple-700" />
                  <span className="font-bold text-purple-900 text-lg">
                    {selectedPICForDetail}
                  </span>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Total PI */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total PI
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>

                  {/* Received */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Received
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            inv.docReceivedDate &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>

                  {/* Validated */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Validated
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-green-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            inv.status === "VERIFIED" &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>

                  {/* Pending Validation */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Pending Validation
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-orange-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            inv.status !== "VERIFIED" &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>

                  {/* Pending Case */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Pending Case
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            pendingCards.has(inv.id) &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>

                  {/* Submitted */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Submitted
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-900">
                      {
                        filteredData.filter(
                          (inv) =>
                            inv.picName ===
                              selectedPICForDetail &&
                            inv.submissionStatus ===
                              "SUBMITTED" &&
                            (detailDocTypeFilter === "all" ||
                              inv.documentType ===
                                detailDocTypeFilter),
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click on a PIC segment to view details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Work Area Mode
  return (
    <div className="space-y-6">
      {/* Tab Cards - Row 1: Document Status */}
      <div className="flex items-center gap-1.5">
        {[
          {
            key: "all",
            label: "ALL DOCUMENTS",
          },
          {
            key: "received",
            label: "RECEIVED",
          },
          {
            key: "verified",
            label: "VERIFIED",
          },
          {
            key: "pending",
            label: "PENDING",
          },
          {
            key: "submitted",
            label: "SUBMITTED",
          },
        ].map((tab) => {
          // Auto-activate 'all' if no filter tabs are active
          const filterTabs = [
            "received",
            "verified",
            "pending",
            "submitted",
          ];
          const hasActiveFilters =
            Array.isArray(activeTab) &&
            activeTab.some((k) => filterTabs.includes(k));
          const shouldShowAllActive =
            tab.key === "all" && !hasActiveFilters;
          const isSelected =
            shouldShowAllActive ||
            (Array.isArray(activeTab) &&
              activeTab.includes(tab.key));

          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === "all") {
                  setActiveTab(["all"]);
                  return;
                }

                if (Array.isArray(activeTab)) {
                  const tabsWithoutAll = activeTab.filter(
                    (k) => k !== "all",
                  );

                  if (
                    isSelected &&
                    activeTab.includes(tab.key)
                  ) {
                    const newTabs = tabsWithoutAll.filter(
                      (k) => k !== tab.key,
                    );
                    setActiveTab(
                      newTabs.length === 0 ? ["all"] : newTabs,
                    );
                  } else {
                    setActiveTab([...tabsWithoutAll, tab.key]);
                  }
                } else {
                  setActiveTab([tab.key]);
                }
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Row - 3 Columns */}
      <div className="flex items-center gap-1.5">
        {/* PT Filter Button */}
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "pt" ? null : "pt",
            )
          }
          className={`
      flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
      ${
        activeFilterType === "pt" || ptFilter !== "all"
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
      }
    `}
        >
          {ptFilter === "all" ? "ALL PT" : ptFilter}
        </button>

        {/* Warehouse Filter Button */}
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "warehouse"
                ? null
                : "warehouse",
            )
          }
          className={`
      flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
      ${
        activeFilterType === "warehouse" ||
        warehouseFilter !== "all"
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
      }
    `}
        >
          {warehouseFilter === "all"
            ? "ALL WAREHOUSE"
            : warehouseFilter}
        </button>

        {/* PIC Filter Button */}
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "pic" ? null : "pic",
            )
          }
          className={`
      flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
      ${
        activeFilterType === "pic" || picPIFilter !== "all"
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
      }
    `}
        >
          {picPIFilter === "all" ? "ALL PIC" : picPIFilter}
        </button>

        {/* PO Type Filter Button */}
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "poType" ? null : "poType",
            )
          }
          className={`
      flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
      ${
        activeFilterType === "poType" || poTypeFilter !== "all"
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
      }
    `}
        >
          {poTypeFilter === "all" ? "ALL PO TYPE" : poTypeFilter.toUpperCase()}
        </button>

        {/* Vendor Origin Filter Button */}
        <button
          onClick={() =>
            setActiveFilterType(
              activeFilterType === "vendorOrigin" ? null : "vendorOrigin",
            )
          }
          className={`
      flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
      ${
        activeFilterType === "vendorOrigin" || vendorOriginFilter !== "all"
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
      }
    `}
        >
          {vendorOriginFilter === "all" ? "ALL VENDOR ORIGIN" : vendorOriginFilter.toUpperCase()}
        </button>
      </div>

      {/* Dynamic Filter Details Row - Fixed height to prevent layout shift */}
      <div className="h-[44px] flex items-center overflow-hidden">
        <div className="flex flex-1 items-center gap-1.5">
          {" "}
          {activeFilterType === "pt" &&
            [
              "all",
              "AMT",
              "GMI",
              "MJS",
              "TTP",
              "WNS",
              "WSI",
              "IMI",
            ].map((key) => {
              const isSelected = ptFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setPtFilter(key);
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
                  {key === "all" ? "ALL PT" : key}
                </button>
              );
            })}
          {activeFilterType === "warehouse" &&
            [
              "all",
              "MEDAN",
              "JAKARTA",
              "SURABAYA",
              "BELAWAN",
              "BALIKPAPAN",
              "CILACAP",
              "DUMAI",
            ].map((key) => {
              const isSelected = warehouseFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setWarehouseFilter(key);
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
                  {key === "all" ? "ALL WAREHOUSE" : key}
                </button>
              );
            })}
          {activeFilterType === "pic" &&
            [
              "all",
              "CHINTYA",
              "DEWI",
              "ELLVA",
              "ERNI",
              "HELEN",
              "JENNIFER",
              "JESSICA",
              "KELLY",
              "NADYA",
              "SHEFANNY",
              "STELLA",
              "VANNESA",
            ].map((key) => {
              const isSelected = picPIFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setPicPIFilter(key);
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
                  {key === "all" ? "ALL PIC" : key}
                </button>
              );
            })}
          {activeFilterType === "poType" &&
            ["all", "Urgent", "Credit"].map((key) => {
              const isSelected = poTypeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setPoTypeFilter(key);
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
                  {key === "all" ? "ALL PO TYPE" : key.toUpperCase()}
                </button>
              );
            })}
          {activeFilterType === "vendorOrigin" &&
            ["all", "Overseas", "Local"].map((key) => {
              const isSelected = vendorOriginFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setVendorOriginFilter(key);
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
                  {key === "all" ? "ALL VENDOR ORIGIN" : key.toUpperCase()}
                </button>
              );
            })}
        </div>
      </div>

      {/* Submit Button and Notification */}
      <div className="flex justify-end items-center gap-3">
        {/* Clear Filter Button - Only show when filters are active */}
        {(statusFilter !== "all" || ptFilter !== "all" || warehouseFilter !== "all" || picPIFilter !== "all" || poTypeFilter !== "all" || vendorOriginFilter !== "all" || (Array.isArray(activeTab) && activeTab.length > 0 && !activeTab.includes("all"))) && (
          <Button
            onClick={() => {
              statusFilter !== "all" && setStatusFilter("all");
              ptFilter !== "all" && setPtFilter("all");
              warehouseFilter !== "all" && setWarehouseFilter("all");
              picPIFilter !== "all" && setPicPIFilter("all");
              poTypeFilter !== "all" && setPoTypeFilter("all");
              vendorOriginFilter !== "all" && setVendorOriginFilter("all");
              setActiveFilterType(null);
              setActiveTab(["all"]);
            }}
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
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
        {/* button expand all collapse all */}
        <Button
          onClick={() => setExpandAll(!expandAll)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          size="lg"
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
        <NotificationButton
          pendingFolders={pendingFolders}
          onReceiveDocuments={handleReceiveDocuments}
        />
        <Button
          onClick={() => {
            setShowSubmitDialog(true);
            // Auto-set submission date to today
            setSubmissionDate(getCurrentDate());
            if (!isSubmitMode) {
              // Reset selections when entering submit mode
              setSelectedDocs(new Set());
              setSubmitDialogSelectAll(false);
            }
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Submit Documents
        </Button>
      </div>

      {/* Always show default InvoiceCollapsible list regardless of tab selection */}
      <div className="space-y-4">
        {/* Document Counter */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-purple-700">
            {filteredData.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-purple-700">
          </span>{" "}
          documents
        </div>

        {/* Search Input Only or Submit Mode Filters */}
        {!isSubmitMode ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <Input
                placeholder="🔍 Search Invoice, PO, or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-purple-200 focus:border-purple-400"
              />
            </div>
          </Card>
        ) : null}

        {/* Document Count Display */}
        {!isSubmitMode ? (
          (() => {
            const isAllActive =
              Array.isArray(activeTab) &&
              activeTab.includes("all");
            const isReceivedActive =
              Array.isArray(activeTab) &&
              activeTab.includes("received");
            const isVerifiedActive =
              Array.isArray(activeTab) &&
              activeTab.includes("verified");
            const isPendingActive =
              Array.isArray(activeTab) &&
              activeTab.includes("pending");
            const isSubmittedActive =
              Array.isArray(activeTab) &&
              activeTab.includes("submitted");

            let data = sortedData;

            if (
              !isAllActive &&
              Array.isArray(activeTab) &&
              activeTab.length > 0
            ) {
              if (isReceivedActive) {
                data = data.filter(
                  (inv) => inv.receivedStatus === true,
                );
              }
              if (isVerifiedActive) {
                data = data.filter(
                  (inv) => inv.status === "VERIFIED",
                );
              }
              if (isPendingActive) {
                data = data.filter((inv) =>
                  inv.pendingStatus === true,
                );
              }
              if (isSubmittedActive) {
                data = data.filter(
                  (inv) => inv.submissionStatus === "SUBMITTED",
                );
              }
            }

            const activeFilters = [];
            if (isReceivedActive)
              activeFilters.push("Received");
            if (isVerifiedActive)
              activeFilters.push("Verified");
            if (isPendingActive) activeFilters.push("Pending");
            if (isSubmittedActive)
              activeFilters.push("Submitted");

            return null;
          })()
        ) : null}

        {/* Invoice List */}
        <div>
          {!isSubmitMode ? (
            // Normal Mode - Show filtered invoices
            (() => {
              // --- Normalize active tabs
              const isAllActive =
                Array.isArray(activeTab) && activeTab.includes("all");
              const isReceivedActive =
                Array.isArray(activeTab) && activeTab.includes("received");
              const isVerifiedActive =
                Array.isArray(activeTab) && activeTab.includes("verified");
              const isPendingActive =
                Array.isArray(activeTab) && activeTab.includes("pending");
              const isSubmittedActive =
                Array.isArray(activeTab) && activeTab.includes("submitted");

              // --- Helper: normalize invoice status into booleans (handles string enums or boolean flags)
              const normalizeStatus = (inv) => {
                const received = inv.receivedStatus === true || inv.status === "RECEIVED";
                const verified = inv.verifiedStatus === true || inv.status === "VERIFIED";
                const pending =
                  inv.pendingStatus === true;
                const submitted =
                  inv.submissionStatus === true || inv.submissionStatus === "SUBMITTED" || inv.status === "SUBMITTED";
                return { received, verified, pending, submitted };
              };

              // --- Early return: show all when "All" or no tabs selected
              if (isAllActive || !Array.isArray(activeTab) || activeTab.length === 0) {
                return sortedData.map((invoice) => (
                  <div key={`${invoice.id}-${refreshKey}`} id={`pi-card-${invoice.purchaseInvoiceNo}`}>
                    <InvoiceCollapsible
                      invoice={invoice}
                      pendingStatus={pendingCards.has(invoice.id)}
                      onValidate={() => handleValidateInvoice(invoice)}
                      onStatusClick={() => handleStatusClick(invoice)}
                      onViewReason={() => handleReasonView(invoice)}
                      refreshKey={refreshKey}
                      onShowHistory={handleShowHistory}
                      onEditReference={handleEditReference}
                      expandAll={expandAll}
                      selectedInvoiceNo={selectedInvoiceNo}
                      onNavigateToPO={(poNumber) => {
                        const poId = mockLinkedPOs.find((po) => po.purchaseOrderNo === poNumber)?.poId;
                        if (poId) onNavigateToPurchaseOrder?.(poId);
                      }}
                      onNavigateToPurchaseOrder={(poNumber) => {
                        const poId = mockLinkedPOs.find((po) => po.purchaseOrderNo === poNumber)?.poId;
                        if (poId) onNavigateToPurchaseOrder?.(poId);
                      }}
                      onNavigateToPVR={onNavigateToPVR}
                      onNavigateToAPNote={onNavigateToAPNote}
                      onNavigateToPurchaseReturn={onNavigateToPurchaseReturn}
                      onNavigateToShipmentRequest={onNavigateToShipmentRequest}
                      onNavigateToImportCost={onNavigateToImportCost}
                      onNavigateToPV={onNavigateToPV}
                      onShowAttachmentDialog={() => {
                        console.log("[DEBUG] Attachment button clicked, opening dialog");
                        setShowAttachmentsDialog(true);
                      }}
                    />
                  </div>
                ));
              }

              // --- Build filtered data
              let data = sortedData;

              if (!isAllActive && Array.isArray(activeTab) && activeTab.length > 0) {
                data = data.filter((invoice) => {
                  const { received, verified, pending, submitted } = normalizeStatus(invoice);
                  const isInPendingCards = pendingCards.has(invoice.id);

                  // 1) ONLY RECEIVED active → show received true AND hide if verified/pending/submitted true
                  if (isReceivedActive && !isVerifiedActive && !isPendingActive && !isSubmittedActive) {
                    return received && !verified && !isInPendingCards && !submitted;
                  }

                  // 2) RECEIVED + VERIFIED (no PENDING, no SUBMITTED)
                  if (isReceivedActive && isVerifiedActive && !isPendingActive && !isSubmittedActive) {
                    return received && verified && !submitted;
                  }

                  // 3) RECEIVED + VERIFIED + SUBMITTED (no PENDING)
                  if (isReceivedActive && isVerifiedActive && isSubmittedActive && !isPendingActive) {
                    return received && verified && submitted;
                  }

                  // 4) RECEIVED + PENDING (no VERIFIED, no SUBMITTED)
                  if (isReceivedActive && isPendingActive && !isVerifiedActive && !isSubmittedActive) {
                    return received && isInPendingCards;
                  }

                  // 5) ONLY PENDING active → show invoices in pendingCards
                  if (isPendingActive && !isReceivedActive && !isVerifiedActive && !isSubmittedActive) {
                    return isInPendingCards;
                  }

                  // Add other combinations as needed; default hide
                  return false;
                });
              }

              // --- Render filtered list
              return (
                <>
                  {data.map((invoice) => (
                    <div key={`${invoice.id}-${refreshKey}`} id={`pi-card-${invoice.purchaseInvoiceNo}`}>
                      <InvoiceCollapsible
                        invoice={invoice}
                        pendingStatus={pendingCards.has(invoice.id)}
                        onValidate={() => handleValidateInvoice(invoice)}
                        onStatusClick={() => handleStatusClick(invoice)}
                        onViewReason={() => handleReasonView(invoice)}
                        refreshKey={refreshKey}
                        onShowHistory={handleShowHistory}
                        onEditReference={handleEditReference}
                        expandAll={expandAll}
                        selectedInvoiceNo={selectedInvoiceNo}
                        onNavigateToPO={(poNumber) => {
                          const poId = mockLinkedPOs.find((po) => po.purchaseOrderNo === poNumber)?.poId;
                          if (poId) onNavigateToPurchaseOrder?.(poId);
                        }}
                        onNavigateToPurchaseOrder={(poNumber) => {
                          const poId = mockLinkedPOs.find((po) => po.purchaseOrderNo === poNumber)?.poId;
                          if (poId) onNavigateToPurchaseOrder?.(poId);
                        }}
                        onNavigateToPVR={onNavigateToPVR}
                        onNavigateToAPNote={onNavigateToAPNote}
                        onNavigateToPurchaseReturn={onNavigateToPurchaseReturn}
                        onNavigateToShipmentRequest={onNavigateToShipmentRequest}
                        onNavigateToImportCost={onNavigateToImportCost}
                        onNavigateToPV={onNavigateToPV}
                        onShowAttachmentDialog={() => {
                          console.log("[DEBUG] Attachment button clicked, opening dialog");
                          setShowAttachmentsDialog(true);
                        }}
                      />
                    </div>
                  ))}
                </>
              );
            })()
          ) : null}
        </div>
      </div>

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
                    const today = getCurrentDate();
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
                Use today's date ({getCurrentDate()})
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
                              convertToISODate(
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
                              formatted !== getCurrentDate()
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
                              convertToISODate(calendarDateTo),
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
                              formatted !== getCurrentDate()
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

      {/* Receive Date Selection Dialog */}
      <Dialog
        open={showReceiveDateDialog}
        onOpenChange={setShowReceiveDateDialog}
      >
        <DialogContent className="w-auto max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Select Receive Date
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Please select the date when the documents were
              received.
            </p>

            {/* Checkbox for current date */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCurrentDate"
                checked={useCurrentDateForReceive}
                onCheckedChange={(checked) => {
                  setUseCurrentDateForReceive(
                    checked as boolean,
                  );
                  if (checked) {
                    setReceiveDateInput(getCurrentDate());
                  } else {
                    setReceiveDateInput("");
                  }
                }}
              />
              <label
                htmlFor="useCurrentDate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use today's date ({getCurrentDate()})
              </label>
            </div>

            {/* Date input with calendar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Receive Date
              </label>
              <div className="relative w-48">
                <Input
                  ref={receiveDateInputRef}
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={receiveDateInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Auto-format as user types
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
                      setReceiveDateInput(formatted);
                      if (
                        useCurrentDateForReceive &&
                        formatted !== getCurrentDate()
                      ) {
                        setUseCurrentDateForReceive(false);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Move focus to Confirm button
                      const confirmButton = document.querySelector(
                        '[aria-label="ConfirmReceiveButton"]'
                      ) as HTMLButtonElement;
                      confirmButton?.focus();
                    }
                  }}
                  disabled={useCurrentDateForReceive}
                  className={`border-purple-200 ${receiveDateInput && !isValidDate(receiveDateInput) ? "border-red-300 bg-red-50" : ""}`}
                />
                <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        const day = String(
                          date.getDate(),
                        ).padStart(2, "0");
                        const month = String(
                          date.getMonth() + 1,
                        ).padStart(2, "0");
                        const year = date.getFullYear();
                        setReceiveDateInput(
                          `${day}/${month}/${year}`,
                        );
                        setUseCurrentDateForReceive(false);
                      }
                    }}
                    disabled={useCurrentDateForReceive}
                    className="absolute w-8 h-8 opacity-0 cursor-pointer"
                    style={{ right: 0 }}
                  />
                  <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {receiveDateInput &&
                !isValidDate(receiveDateInput) && (
                  <p className="text-xs text-red-500">
                    Please enter a valid date in DD/MM/YYYY
                    format
                  </p>
                )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReceiveDateDialog(false);
                  setPendingReceiveData(null);
                  setReceiveDateInput("");
                  setUseCurrentDateForReceive(false);
                }}
              >
                Cancel
              </Button>
              <Button
                aria-label="ConfirmReceiveButton"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={confirmReceiveDocuments}
                disabled={
                  !receiveDateInput ||
                  !isValidDate(receiveDateInput)
                }
              >
                Confirm Receive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Received Confirmation Dialog */}
      <Dialog
        open={showReceiveConfirmDialog}
        onOpenChange={setShowReceiveConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mark Documents as Received
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to mark {selectedDocuments.size}{" "}
              document(s) as received.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Receive Date
              </label>
              <Input
                type="date"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="border-purple-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setShowReceiveConfirmDialog(false)
                }
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleConfirmReceive}
                disabled={!receiveDate}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Documents Dialog */}
      <Dialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
      >
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0 pointer-events-auto z-50" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 pointer-events-auto">
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Documents
            </DialogTitle>
            <DialogDescription>
              Select and submit verified documents for processing
            </DialogDescription>
          </DialogHeader>

         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pointer-events-auto">
              {/* Search Input */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by PI No, PO No, Supplier..."
                  value={submitDialogSearch}
                  onChange={(e) =>
                    setSubmitDialogSearch(e.target.value)
                  }
                  className="pl-10 border-purple-200"
                />
              </div>
              {/* Submission Details */}
               <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200 flex-shrink-0">
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-800 mb-3">
                  Submission Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Document Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Document Type{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={documentType}
                      onValueChange={(value: DocumentType) =>
                        setDocumentType(value)
                      }
                    >
                      <SelectTrigger className="border-blue-200">
                        <SelectValue placeholder="Select Document Type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QPF">QPF</SelectItem>
                        <SelectItem value="REIMBURSEMENT">
                          REIMBURSEMENT
                        </SelectItem>
                        <SelectItem value="BUNKER / FRESH WATER">
                          BUNKER / FRESH WATER
                        </SelectItem>
                        <SelectItem value="CREDIT">
                          CREDIT
                        </SelectItem>
                        <SelectItem value="DOWN PAYMENT">DOWN PAYMENT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submitted To */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Submitted To{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={submittedTo}
                      onValueChange={(value: Division) =>
                        setSubmittedTo(value)
                      }
                    >
                      <SelectTrigger className="border-blue-200">
                        <SelectValue placeholder="Select Division..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="COSTING">
                          COSTING
                        </SelectItem>
                        <SelectItem value="ACCOUNTING">
                          ACCOUNTING
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PIC Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      PIC Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={picName}
                      onValueChange={(value) =>
                        setPicName(value)
                      }
                      disabled={!submittedTo}
                    >
                      <SelectTrigger 
                        className={`border-blue-200 ${!submittedTo ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <SelectValue placeholder={submittedTo ? "Select PIC..." : "Select Division first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {submittedTo && mockDivisionPICs
                          .filter(
                            (pic) => pic.division === submittedTo,
                          )
                          .map((pic) => (
                            <SelectItem
                              key={pic.id}
                              value={pic.name}
                            >
                              {pic.name} ({pic.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submission Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Submission Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !submissionDate &&
                              "text-muted-foreground"
                            } ${submissionDate && !isValidDate(submissionDate) ? "border-red-300 bg-red-50" : "border-blue-200"}`}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {submissionDate &&
                            isValidDate(submissionDate)
                              ? submissionDate
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
                          <div className="p-3 border-b">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="useSubmissionDateToday"
                                checked={submissionDate === getCurrentDate()}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSubmissionDate(getCurrentDate());
                                  } else {
                                    setSubmissionDate("");
                                  }
                                }}
                              />
                              <label
                                htmlFor="useSubmissionDateToday"
                                className="text-xs font-medium leading-none cursor-pointer text-gray-600"
                              >
                                Today ({getCurrentDate()})
                              </label>
                            </div>
                          </div>
                          <CalendarComponent
                            mode="single"
                            selected={
                              submissionDate &&
                              isValidDate(submissionDate)
                                ? new Date(
                                    convertToISODate(
                                      submissionDate,
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
                                setSubmissionDate(
                                  `${day}/${month}/${year}`,
                                );
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Input
                              type="text"
                              placeholder="Or type: DD/MM/YYYY"
                              value={submissionDate}
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
                                  const parts =
                                    cleaned.split("/");
                                  formatted =
                                    parts[0] +
                                    "/" +
                                    parts[1].slice(0, 2) +
                                    "/" +
                                    parts[1].slice(2);
                                }

                                if (formatted.length <= 10) {
                                  setSubmissionDate(
                                    formatted,
                                  );
                                }
                              }}
                              className="text-sm"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      {submissionDate &&
                        !isValidDate(submissionDate) && (
                          <p className="text-xs text-red-500">
                            Invalid date format
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
               {/* Submission Details Card */}
            </Card>
            </Card>
           
           

           

            {/* Info Card with Select All */}
            <Card className="p-3 bg-purple-50 border-purple-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Filter className="h-4 w-4" />
                  <span>
                    {selectedDocs.size} of{" "}
                    {availableDocsForSubmission.length}{" "}
                    documents selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* SELECT ALL CHECKBOX */}
                  <Checkbox
                    id="selectAll"
                    checked={submitDialogSelectAll}
                    onCheckedChange={(checked) => {
                      setSubmitDialogSelectAll(
                        checked === true,
                      );
                      if (checked === true) {
                        // Select all available documents
                        const allIds = new Set(
                          availableDocsForSubmission.map(
                            (doc) => doc.id,
                          ),
                        );
                        setSelectedDocs(allIds);
                      } else {
                        // Deselect all
                        setSelectedDocs(new Set());
                      }
                    }}
                  />
                  <label
                    htmlFor="selectAll"
                    className="text-sm font-medium text-purple-700 cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                ⚠️ Only verified documents can be submitted
              </div>
            </Card>
            {/* Documents List */}
            <div className="border border-purple-200 rounded-lg max-h-[300px] overflow-y-auto">
              {availableDocsForSubmission.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg mb-2">
                    No Documents Available for Submission
                  </div>
                  <div className="text-sm">
                    All purchase returns have been submitted or no
                    documents are available. Please select documents
                    to submit.
                  </div>
                </div>
              ) : (
                availableDocsForSubmission.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-2 border-b border-purple-100 last:border-b-0 hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() =>
                        handleToggleDoc(doc.id)
                      }
                    />
                    <div className="flex-1 grid grid-cols-5 gap-3 items-center text-sm">
                      <div className="min-w-0">
                        <div className="text-purple-900 font-medium truncate">
                          {doc.purchaseInvoiceNo}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          PI No
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-purple-900 font-medium truncate">
                          {doc.noPO}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          PO No
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-purple-900 truncate">
                          {doc.supplierName}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          Supplier
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-purple-900 font-medium">
                          {formatCurrency(
                            doc.otherTotal + doc.grandTotal,
                          )}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          Total Amount
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Badge
                          variant="outline"
                          className="border-purple-300 text-purple-700 text-[10px] px-2 py-0.5"
                        >
                          {doc.warehouse}
                        </Badge>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

           
            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
                className="border-purple-300 text-purple-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDocs}
                disabled={
                  selectedDocs.size === 0 ||
                  !documentType ||
                  !submittedTo ||
                  !submissionDate ||
                  !isValidDate(submissionDate)
                }
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit {selectedDocs.size} Document
                {selectedDocs.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Verify Purchase Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Logistic Design Message */}
            

            {/* Invoice Details */}
            {verificationInvoice && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-xs text-gray-600 mb-2">
                  Invoice Details:
                </div>
                <div className="text-sm">
                  <div>
                    <strong>PI No:</strong>{" "}
                    {verificationInvoice.purchaseInvoiceNo}
                  </div>
                  <div>
                    <strong>Supplier:</strong>{" "}
                    {verificationInvoice.supplierName}
                  </div>
                  <div>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(
                      verificationInvoice.totalAmount,
                    )}
                  </div>
                  <div>
                    <strong>Doc Received Date:</strong>{" "}
                    {formatDateToDDMMYYYY(verificationInvoice.docReceivedDate)}
                  </div>
                </div>
              </div>
            )}

            {/* Reference Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">
                Reference No <span className="text-red-500">*</span>
              </label>
              <Input
                ref={referenceNoInputRef}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    referenceDateInputRef.current?.focus();
                  }
                }}
                placeholder="Enter verification reference number..."
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            {/* Reference Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">
                Reference Date <span className="text-red-500">*</span>
              </label>
              <input
                ref={referenceDateInputRef}
                type="date"
                value={referenceDate}
                onChange={(e) =>
                  setReferenceDate(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Move focus to Verify button
                    const verifyButton = document.querySelector(
                      '[aria-label="Verify"]'
                    ) as HTMLButtonElement;
                    verifyButton?.focus();
                  }
                }}
                className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>

            {/* Verify Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-purple-200">

              <Button
                aria-label="Verify"
                onClick={handleVerifyInvoice}
                disabled={verificationInvoice && (pendingCards.has(verificationInvoice.id) || !referenceNo.trim() || !referenceDate)}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowVerificationDialog(false)}
                className="flex-1 border-purple-300 text-purple-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Trail - {historyInvoice?.purchaseInvoiceNo}
            </DialogTitle>
          </DialogHeader>

          {historyInvoice && (
            <div className="space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Current Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-purple-600 text-sm font-medium">
                    Current Verification Status
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(historyInvoice.status)}
                  </div>
                </div>
                <div>
                  <div className="text-purple-600 text-sm font-medium">
                    Current Submission Status
                  </div>
                  <div className="mt-1">
                    {getSubmissionStatusBadge(
                      historyInvoice.submissionStatus,
                    )}
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline (
                  {historyInvoice.history.length} entries)
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {historyInvoice.history.length > 0 ? (
                    historyInvoice.history
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime(),
                      )
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs ${
                                entry.action === "VERIFIED"
                                  ? "bg-green-500"
                                  : entry.action === "SUBMITTED"
                                    ? "bg-blue-500"
                                    : entry.action ===
                                        "PENDING_VERIFICATION"
                                      ? "bg-orange-500"
                                      : entry.action ===
                                          "PENDING_SUBMISSION"
                                        ? "bg-yellow-500"
                                        : entry.action ===
                                            "MARK_AS_PENDING"
                                          ? "bg-yellow-600"
                                          : entry.action.includes(
                                                "UNDO",
                                              )
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                              }`}
                            >
                              {entry.action === "VERIFIED"
                                ? "✓"
                                : entry.action === "SUBMITTED"
                                  ? "↑"
                                  : entry.action ===
                                      "MARK_AS_PENDING"
                                    ? "⏸"
                                    : entry.action.includes(
                                          "PENDING",
                                        )
                                      ? "⏳"
                                      : entry.action.includes(
                                            "UNDO",
                                          )
                                        ? "↶"
                                        : "•"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {entry.action
                                  .replace(/_/g, " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) =>
                                    l.toUpperCase(),
                                  )}
                              </div>
                              <div className="text-xs text-gray-500 flex-shrink-0">
                                {new Date(
                                  entry.timestamp,
                                ).toLocaleString("id-ID", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {entry.description}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {entry.referenceNo && (
                                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                                  Ref: {entry.referenceNo}
                                </div>
                              )}
                              {entry.referenceDate && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                  Date: {entry.referenceDate}
                                </div>
                              )}
                            </div>
                            {entry.reason && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block mt-1">
                                Reason: {entry.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <div>No history entries found</div>
                      <div className="text-sm">
                        Actions on this invoice will appear here
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-purple-200">
                <Button
                  onClick={() => setShowHistoryDialog(false)}
                  variant="outline"
                  className="border-purple-300 text-purple-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Undo Verification Confirmation Dialog */}
      <Dialog
        open={showUndoConfirmDialog}
        onOpenChange={setShowUndoConfirmDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Undo Verification
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">
                Are you sure you want to undo the verification
                for this invoice? This action will change the
                status back to "NOT_VERIFIED".
              </p>
            </div>

            {/* Invoice Details */}
            {undoInvoice && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-xs text-gray-600 mb-2">
                  Invoice Details:
                </div>
                <div className="text-sm">
                  <div>
                    <strong>PI No:</strong>{" "}
                    {undoInvoice.purchaseInvoiceNo}
                  </div>
                  <div>
                    <strong>Supplier:</strong>{" "}
                    {undoInvoice.supplierName}
                  </div>
                  <div>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(undoInvoice.totalAmount)}
                  </div>
                  <div>
                    <strong>Doc Received Date:</strong>{" "}
                    {undoInvoice.docReceivedDate ||
                      "Not received yet"}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              
              <Button
                onClick={handleConfirmUndoVerification}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Yes, Undo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUndoConfirmDialog(false)}
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resubmit Dialog */}
      <Dialog
        open={showResubmitDialog}
        onOpenChange={setShowResubmitDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Resubmit Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-gray-600 text-sm">
              You are about to resubmit this document. Please
              provide a reason for resubmission:
            </div>

            {/* Invoice Details */}
            {resubmitInvoice && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>PI No:</strong>{" "}
                    {resubmitInvoice.purchaseInvoiceNo}
                  </div>
                  <div>
                    <strong>Supplier:</strong>{" "}
                    {resubmitInvoice.supplierName}
                  </div>
                  <div>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(resubmitInvoice.totalAmount)}
                  </div>
                  <div>
                    <strong>Doc Received Date:</strong>{" "}
                    {resubmitInvoice.docReceivedDate ||
                      "Not received yet"}
                  </div>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for Resubmission{" "}
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                ref={resubmitReasonTextareaRef}
                value={resubmitReason}
                onChange={(e) =>
                  setResubmitReason(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    // Move focus to Resubmit button
                    const resubmitButton = document.querySelector(
                      '[aria-label="ResubmitButton"]'
                    ) as HTMLButtonElement;
                    resubmitButton?.click();
                  }
                }}
                placeholder="Please explain why you are resubmitting this document..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowResubmitDialog(false)}
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                aria-label="ResubmitButton"
                onClick={handleConfirmResubmit}
                disabled={!resubmitReason.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resubmit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Undo Submission Confirmation Dialog */}
      <Dialog
        open={showUndoSubmissionDialog}
        onOpenChange={setShowUndoSubmissionDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Undo Submission
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">
                Are you sure you want to undo the submission for
                this document? This action will remove the
                document from submitted status and return it to
                "Not Submitted" status. All submission data will
                be cleared.
              </p>
            </div>

            {/* Invoice Details */}
            {undoSubmissionInvoice && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-xs text-gray-600 mb-2">
                  Document Details:
                </div>
                <div className="text-sm">
                  <div>
                    <strong>PI No:</strong>{" "}
                    {undoSubmissionInvoice.purchaseInvoiceNo}
                  </div>
                  <div>
                    <strong>Supplier:</strong>{" "}
                    {undoSubmissionInvoice.supplierName}
                  </div>
                  <div>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(
                      undoSubmissionInvoice.totalAmount,
                    )}
                  </div>
                  {undoSubmissionInvoice.documentType && (
                    <div>
                      <strong>Document Type:</strong>{" "}
                      {undoSubmissionInvoice.documentType}
                    </div>
                  )}
                  {undoSubmissionInvoice.submittedTo && (
                    <div>
                      <strong>Submitted To:</strong>{" "}
                      {undoSubmissionInvoice.submittedTo}
                    </div>
                  )}
                  <div>
                    <strong>Doc Received Date:</strong>{" "}
                    {undoSubmissionInvoice.docReceivedDate ||
                      "Not received yet"}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() =>
                  setShowUndoSubmissionDialog(false)
                }
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUndoSubmission}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Yes, Undo Submission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Received Confirmation Dialog */}
      <Dialog
        open={showReceiveConfirmDialog}
        onOpenChange={setShowReceiveConfirmDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-800">
              Confirm Mark as Received
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Are you sure you want to mark{" "}
              {selectedDocuments.size} document(s) as received?
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">
                Received Date
              </label>
              <input
                type="date"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancelReceive}
                className="flex-1 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReceive}
                disabled={!receiveDate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                Confirm Receive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Notified Urgent Priority Dialog */}
      <Dialog
        open={showMarkAsNotifiedDialog}
        onOpenChange={setShowMarkAsNotifiedDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-800">
              Mark as Notified - Urgent Priority
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              You are about to mark{" "}
              <span className="font-semibold">
                {selectedDocsForNotified.size}
              </span>{" "}
              document(s) as <strong>notified urgent priority</strong>.
              These documents will be flagged as pending receipt but
              already notified as critical.
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-xs text-orange-700">
                ⚠️ <strong>Priority Marked:</strong> These documents
                will appear with an "Urgent - Awaiting Receipt" badge
                in the tracker system. Warehouse teams will receive
                notifications for priority handling.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancelMarkAsNotified}
                className="flex-1 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmMarkAsNotified}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Mark as Urgent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Warning Dialog - Global Level */}
      <Dialog
        open={showValidationWarning}
        onOpenChange={setShowValidationWarning}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-yellow-600">
              Document Not Received
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              The document for invoice{" "}
              <span className="font-medium">
                {warningInvoice?.purchaseInvoiceNo}
              </span>{" "}
              hasn't been received yet. Are you sure you want to
              proceed with validation?
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowValidationWarning(false);
                  setWarningInvoice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-yellow-600 text-white"
                onClick={() => {
                  if (warningInvoice) {
                    proceedToValidation(warningInvoice);
                  }
                  setShowValidationWarning(false);
                  setWarningInvoice(null);
                }}
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reason Dialog */}
      <Dialog
        open={showViewReasonDialog}
        onOpenChange={setShowViewReasonDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>NOTE</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Invoice: {viewingReasonInvoice?.purchaseInvoiceNo}
            </div>
            <div className="p-3 bg-gray-50 border rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Reason:
              </div>
              <div className="text-sm text-gray-800">
                {viewingReasonInvoice?.pendingReason ||
                  "No reason provided"}
              </div>
              {/* Debug info */}
              <div className="text-xs text-red-500 mt-1">
                Debug:{" "}
                {JSON.stringify({
                  id: viewingReasonInvoice?.id,
                  reason: viewingReasonInvoice?.pendingReason,
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  // TODO: Implement edit functionality
                  console.log(
                    "Edit note for:",
                    viewingReasonInvoice?.id,
                  );
                }}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => {
                  const isPending = pendingCards.has(viewingReasonInvoice?.id);
                  setPendingAction(isPending ? "release" : "mark");
                  setShowPendingConfirmDialog(true);
                }}
                disabled={viewingReasonInvoice?.status === "VERIFIED"}
                className={pendingCards.has(viewingReasonInvoice?.id) ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"}
              >
                {pendingCards.has(viewingReasonInvoice?.id) ? "Release Pending" : "Mark As Pending"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark/Release Pending Confirmation Dialog */}
      <Dialog
        open={showPendingConfirmDialog}
        onOpenChange={setShowPendingConfirmDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {pendingAction === "mark" ? "Mark as Pending" : "Release Pending"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                {pendingAction === "mark"
                  ? "Are you sure you want to mark this Purchase Invoice as pending?"
                  : "Are you sure you want to release this Purchase Invoice from pending status?"}
              </p>
            </div>

       

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowPendingConfirmDialog(false)}
                className="flex-1 border-gray-300 text-gray-700"
              >
                No
              </Button>
              <Button
                onClick={() => {
                  const newPendingCards = new Set(pendingCards);
                  
                  if (pendingAction === "mark") {
                    // Add to pending cards
                    newPendingCards.add(viewingReasonInvoice?.id);
                  } else if (pendingAction === "release") {
                    // Remove from pending cards
                    newPendingCards.delete(viewingReasonInvoice?.id);
                  }
                  
                  setPendingCards(newPendingCards);
                  setShowPendingConfirmDialog(false);
                  setShowViewReasonDialog(false);
                  setViewingReasonInvoice(null);
                  setPendingAction(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Yes, {pendingAction === "mark" ? "Mark as Pending" : "Release Pending"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}