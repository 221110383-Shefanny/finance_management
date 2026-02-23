import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  formatDateToDDMMYYYY,
  getTodayYYYYMMDD,
  convertYYYYMMDDtoDDMMYYYY,
  convertDDMMYYYYtoYYYYMMDD,
  isValidDate,
} from "../utils/dateFormat";
import { formatNumber, parseFormattedNumber } from "../utils/numberFormat";
import {
  mockLinkedPOs,
  mockpurchaseInvoice,
  mockPVR,
  mockSuppliers,
  mockDivisionPICs,
  mockExpenseNote,
  mockImportCosts,
  mockShipmentRequest,
  mockPurchaseOrder,
} from "../mocks/mockData";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, 
} from "./ui/table";  
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
  Globe2,
  Zap,
  CreditCard,
  ShoppingBag,
  Plus,
  XCircle,
  Link as LinkIcon,
  ClockIcon,
  Clock,
  Trash2,
  Receipt,
  BarChart3,
  Edit,
  Send,
  Users,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Banknote,
  MessageSquare,
  MapPin,
  Wallet,
  Check,
  Hash,
  CheckCircle2,
  AlertCircle,
  Circle,
  X,
  Upload,
  Search,
  Filter,
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
import { Checkbox } from "./ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";

type SupplierCategory = "OVERSEAS" | "LOCAL";
type TermType = "URGENT" | "CREDIT" | "ONLINE SHOPPING";
type PaymentMethod = "Transfer" | "Cash";
type PTType =
  | "WNS"
  | "MJS"
  | "TTP"
  | "GMI"
  | "AMT"
  | "WSI"
  | "IMI";

interface PVRData {
  id: string;
  pvrNo: string;
  pvrDate: string;
  docReceiptDate: string;
  term: TermType;
  supplierName: string;
  supplierCategory: SupplierCategory;
  currency: string;
  paymentMethod: PaymentMethod;
  remarks: string;
  poNumber: string;
  totalInvoice: number;
  createdBy: string;
  pt: PTType;
  rate?: number;
  bankAccount?: string;
  method?: string;
  reference?: string;
  items?: PVRItem[];
  linkedDocs?: LinkedPIDocument[];
  linkedPIs?: LinkedPIDocument[];
  linkedDocumentType?:
    | "PURCHASE_INVOICE"
    | "IMPORT_COST"
    | "SHIPMENT_REQUEST";
  isSubmitted?: boolean;
  isApproved?: boolean;
  status?: "voided" | "active";
}

interface PVRItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
}

interface LinkedPIDocument {
  id: string;
  piNo: string;
  poNo: string;
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  totalAmount: number;
  amountPaid?: number;
  documentType?: "PI" | "PO" | "IC" | "SR" | "EN";
  documentTypeLabel?: string;
}

interface AuditTrailEntry {
  timestamp: string;
  user: string;
  action: string;
  changes?: string[];
}

interface SupplierData {
  name: string;
  category: SupplierCategory;
  isApproved: boolean;
  availablePIs: LinkedPIDocument[];
}

interface PVRProps {
  onNavigateToPurchaseInvoice?: (documentNo: string) => void;
  onNavigateToPurchaseOrder?: (documentNo: string) => void;
  onNavigateToImportCost?: (documentNo: string) => void;
  onNavigateToShipmentRequest?: (documentNo: string) => void;
  onNavigateToAPNote?: (apNoteNo: string) => void;
  onNavigateToPV?: (pvNo: string) => void;
}

// Mock data for suppliers - using mockSuppliers from mockData
const supplierMasterData: SupplierData[] =
  mockSuppliers.map((supplier) => {
    // Get available PIs for this supplier
    const availablePIs = mockpurchaseInvoice
      .filter((pi) => pi.supplierName === supplier.supplierName)
      .map((pi) => ({
        id: pi.piId || "",
        piNo: pi.purchaseInvoiceNo || "",
        poNo: pi.poId || "",
        invoiceNo: pi.purchaseInvoiceNo || "",
        invoiceDate: pi.referenceDate || "",
        currency: "IDR",
        totalAmount: pi.totalAmount || 0,
        documentType: "PI" as const,
        documentTypeLabel: "Purchase Invoice",
      }));

    return {
      name: supplier.supplierName,
      category: "LOCAL" as SupplierCategory, // Default category
      isApproved: true,
      availablePIs,
    };
  }) || [];

// Utility functions for date handling
const getCurrentDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const convertToISODate = (dateString: string): string => {
  if (!dateString || !isValidDate(dateString)) return "";
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};

// Initial mock data for PVR
const initialMockData: PVRData[] = mockPVR.map(
  (pvr, index) => ({
    id: pvr.id || `pvr-${index + 1}`,
    pvrNo: pvr.pvrNo,
    pvrDate: pvr.pvrDate,
    docReceiptDate: pvr.docReceiptDate,
    term: (pvr.term && (pvr.term === "CREDIT" ||
    pvr.term === "URGENT" ||
    pvr.term === "COD" ||
    pvr.term === "LAINNYA")
      ? pvr.term.charAt(0) + pvr.term.slice(1).toLowerCase()
      : "CREDIT") as TermType,
    supplierName: pvr.supplierName,
    supplierCategory: (pvr.supplierCategory === "OVERSEAS" ||
    pvr.supplierCategory === "LOCAL"
      ? pvr.supplierCategory
      : "LOCAL") as SupplierCategory,
    currency: pvr.currency,
    paymentMethod: pvr.paymentMethod as PaymentMethod,
    remarks: pvr.remarks,
    poNumber: pvr.poNumber,
    totalInvoice: (() => {
      // Calculate total from linkedDocs if available, excluding PO
      if (pvr.linkedDocs && pvr.linkedDocs.length > 0) {
        return pvr.linkedDocs.reduce((sum, doc) => {
          // Only include PI, IC, SR, EN - exclude PO
          if (doc.documentType && doc.documentType !== "PO") {
            return sum + (doc.totalAmount || 0);
          }
          return sum;
        }, 0);
      }
      return 0;
    })(),
    createdBy: pvr.createdBy,
    pt: pvr.pt as PTType,
    isSubmitted: false,
    isApproved: false,
    status: "active",
    linkedDocs: (pvr.linkedDocs as LinkedPIDocument[]) || [],
  }),
);

// Account options data
const accountOptions = [
  { code: "100.001.01", name: "KAS MEDAN (IDR)" },
  { code: "100.001.02", name: "KAS MEDAN (USD)" },
  { code: "100.001.03", name: "KAS CADANGAN" },
  { code: "61112", name: "DECK STORE" },
  { code: "61113", name: "ENGINE STORE" },
  { code: "61114", name: "SHIP STORE" },
  { code: "61115", name: "GASSES" },
  { code: "61111", name: "PAINTS" },
  { code: "61100", name: "NAVIGATION CHARTS /PUBLICATIONS" },
  { code: "61090", name: "COMMUNICATION COST" },
];

// Department options data
const departmentOptions = [
  {
    code: "2.2.04.060.01",
    name: "MULTI JAYA SAMUDERA : KAPAL: TUG BOAT: TB.WARUNA PIONEER :  DECK",
  },
  {
    code: "2.2.04.057.01",
    name: "MULTI JAYA SAMUDERA : KAPAL: TUG BOAT: TB.WARUNA II :  DECK",
  },
  {
    code: "2.2.04.058",
    name: "MULTI JAYA SAMUDERA: KAPAL: TUG BOAT: TB.WARUNA JAYA",
  },
];

export default function PVR({
  onNavigateToPurchaseInvoice,
  onNavigateToPurchaseOrder,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToAPNote,
  onNavigateToPV,
}: PVRProps) {
  // Helper function to get document type label from code
  const getDocumentTypeLabel = (docType: string): string => {
    const typeMap: Record<string, string> = {
      PI: "Purchase Invoice",
      PO: "Purchase Order",
      IC: "Import Cost",
      SR: "Shipment Request",
      EN: "Expense Note",
    };
    return typeMap[docType] || docType;
  };

  // Helper function to get the correct document number based on document type
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

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY
  const convertToDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // Already DD-MM-YYYY format
        return dateStr;
      } else {
        // YYYY-MM-DD format
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Format date to DD/MM/YYYY
  const formatDateToDDMMYYYY_v2 = (dateStr: string): string => {
    if (!dateStr) return "";
    // Handle YYYY-MM-DD format
    if (
      dateStr.includes("-") &&
      dateStr.split("-").length === 3
    ) {
      const parts = dateStr.split("-");
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
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

  // Initialize PVR data from localStorage or use mock data
  const initializePVRData = (): PVRData[] => {
    try {
      const savedPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      
      // Always merge saved PVRs with initialMockData to ensure mock data is always available
      // but don't duplicate if a PVR already exists
      const existingPVRNumbers = new Set(savedPVRs.map((pvr: any) => pvr.pvrNo));
      const mockDataToAdd = initialMockData.filter(
        (mockPVR) => !existingPVRNumbers.has(mockPVR.pvrNo)
      );
      
      const mergedPVRs = [...initialMockData, ...savedPVRs.filter((pvr: any) => 
        !initialMockData.some((mock: any) => mock.pvrNo === pvr.pvrNo)
      )];
      
      console.log("[PVR] Initialized with merged data:");
      console.log(`  - Mock PVRs: ${initialMockData.length}`);
      console.log(`  - Saved PVRs: ${savedPVRs.length}`);
      console.log(`  - Total: ${mergedPVRs.length}`);
      
      return mergedPVRs;
    } catch (error) {
      console.error("Failed to load PVR data from localStorage:", error);
      return initialMockData;
    }
  };

  const [pvrData, setPvrData] =
    useState<PVRData[]>(initializePVRData());
  
  // Initialize localStorage with merged mock + saved data on first load
  useEffect(() => {
    try {
      const currentPVRData = JSON.parse(localStorage.getItem("pvrData") || "[]");
      const mergedData = [...initialMockData];
      
      // Add any saved PVRs that aren't in mock data
      currentPVRData.forEach((savedPVR: any) => {
        if (!initialMockData.some(mock => mock.pvrNo === savedPVR.pvrNo)) {
          mergedData.push(savedPVR);
        }
      });
      
      // Save merged data back to localStorage
      if (JSON.stringify(currentPVRData) !== JSON.stringify(mergedData)) {
        console.log("[PVR] Initializing localStorage with merged mock + saved PVRs...");
        localStorage.setItem("pvrData", JSON.stringify(mergedData));
      }
    } catch (error) {
      console.error("Failed to initialize localStorage with merged data:", error);
    }
  }, []); // Only run once on mount
  
  // Persist PVR data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("pvrData", JSON.stringify(pvrData));
    } catch (error) {
      console.error("Failed to save PVR data to localStorage:", error);
    }
  }, [pvrData]);

  // Listen for storage changes from other components (e.g., PVR created from POCollapsible)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pvrData" || e.key === null) {
        try {
          // Reload PVR data from localStorage to get the latest updates
          const savedPVRs = localStorage.getItem("pvrData");
          if (savedPVRs) {
            const updatedPVRs = JSON.parse(savedPVRs);
            setPvrData(updatedPVRs);
            console.log("[PVR] Storage updated with PVRs from localStorage:", updatedPVRs);
          }
        } catch (error) {
          console.error("Failed to reload PVR data from localStorage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [ptFilter, setPtFilter] = useState<string>("ALL PT");
  const [picPIFilter, setPicPIFilter] = useState<string>("all");
  const [submittedFilter, setSubmittedFilter] =
    useState<string>("unsubmitted");
  const [activeFilterType, setActiveFilterType] = useState<
    string | null
  >(null);
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<PVRData | null>(null);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [showCreatePVDialog, setShowCreatePVDialog] = useState(false);
    const [showPVExistsDialog, setShowPVExistsDialog] = useState(false);
  const [existingPvrNo, setExistingPvrNo] = useState("");
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [selectedForVoid, setSelectedForVoid] =
    useState<PVRData | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidDate, setVoidDate] = useState(
    convertToDisplayDate(getTodayYYYYMMDD()),
  );
  const [showAddLinksDialog, setShowAddLinksDialog] =
    useState(false);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
    useState(false);
  const [selectedForLinkedDocs, setSelectedForLinkedDocs] =
    useState<PVRData | null>(null);
  const [availablePIsForSupplier, setAvailablePIsForSupplier] =
    useState<LinkedPIDocument[]>([]);
  const [linkedPIs, setLinkedPIs] = useState<
    LinkedPIDocument[]
  >([]);
  const [pvrItems, setPvrItems] = useState<PVRItem[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] =
    useState<PVRData | null>(null);
  const [editLinkedPIs, setEditLinkedPIs] = useState<
    LinkedPIDocument[]
  >([]);
  const [editPvrItems, setEditPvrItems] = useState<PVRItem[]>(
    [],
  );
  const [showAddDocumentDialog, setShowAddDocumentDialog] =
    useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Set<string>
  >(new Set());
  const [selectAllDocuments, setSelectAllDocuments] =
    useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] =
    useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] =
    useState("");
  const [showSubmitDialog, setShowSubmitDialog] =
    useState(false);
  const [selectedPVRsForSubmit, setSelectedPVRsForSubmit] =
    useState<string[]>([]);
  const [submitDocType, setSubmitDocType] =
    useState<TermType>("URGENT");
  const [submitDate, setSubmitDate] = useState("");
  const [submitTo, setSubmitTo] = useState("AP");
  const [picName, setPicName] = useState("");
  
  // Calendar Filter Dialog States
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);
  const [calendarFilterType, setCalendarFilterType] = useState<
    "pvrDate" | "docReceiptDate"
  >("pvrDate");

  const [showApproveDialog, setShowApproveDialog] =
    useState(false);
  const [selectedForApprove, setSelectedForApprove] =
    useState<PVRData | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] =
    useState(false);
  const [showPVSuccessDialog, setShowPVSuccessDialog] =
    useState(false);  
  const [savedPVNo, setSavedPVNo] = useState("");
  const [savedPVLinkedDocs, setSavedPVLinkedDocs] = useState<any[]>([]);
  const [savedPvrNo, setSavedPvrNo] = useState("");
  const [savedLinkedDocs, setSavedLinkedDocs] = useState<
    LinkedPIDocument[]
  >([]);
  const [activeDetailTab, setActiveDetailTab] =
    useState<string>("info");
  const [showEditDocumentDialog, setShowEditDocumentDialog] =
    useState(false);
  const [showCreateDatePicker, setShowCreateDatePicker] =
    useState(false);
  const [showEditDatePicker, setShowEditDatePicker] =
    useState(false);
  const [showSubmitDatePicker, setShowSubmitDatePicker] =
    useState(false);
  const [editingDocument, setEditingDocument] =
    useState<any>(null);
  const [activeNoteType, setActiveNoteType] = useState<
    "debit" | "credit" | null
  >(null);
  const [noteValue, setNoteValue] = useState("");
  const [noteDetailsPerDoc, setNoteDetailsPerDoc] = useState<{
    [docId: string]: Array<{
      id: string;
      noteType: "debit" | "credit";
      noteValue: string;
      accountCode: string;
      departmentCode: string;
      description: string;
    }>;
  }>({});
  const [amountPaid, setAmountPaid] = useState<
    Array<{ id: string; amount: string }>
  >([
    {
      id: Date.now().toString(),
      amount: formatNumber(mockpurchaseInvoice[0]?.totalAmount || 0),
    },
  ]);
  const [accountCodeSearchTerms, setAccountCodeSearchTerms] =
    useState<{
      [key: number]: string;
    }>({});
  const [accountCodeFocused, setAccountCodeFocused] =
    useState(false);
  const [
    departmentCodeSearchTerms,
    setDepartmentCodeSearchTerms,
  ] = useState<{
    [key: number]: string;
  }>({});
  const [
    showBalanceWarningDialog,
    setShowBalanceWarningDialog,
  ] = useState(false);
  const [calculatedBalance, setCalculatedBalance] = useState(0);
  const [savedChanges, setSavedChanges] = useState<
    string | null
  >(null);
  const [showSavedNotification, setShowSavedNotification] =
    useState(false);
  const [savedDocumentAmountPaid, setSavedDocumentAmountPaid] =
    useState<string>("");
  const [savedDocumentNoteType, setSavedDocumentNoteType] =
    useState<"debit" | "credit" | null>(null);
  const [lastEditedDocumentId, setLastEditedDocumentId] =
    useState<string | null>(null);
  const [tableRefreshTrigger, setTableRefreshTrigger] =
    useState(0);
  const [showSubmitSummaryDialog, setShowSubmitSummaryDialog] =
    useState(false);
  const [addDocumentSearchTerm, setAddDocumentSearchTerm] =
    useState("");
  const [addLinksSearchTerm, setAddLinksSearchTerm] =
    useState("");
  const [editingAmountPaidId, setEditingAmountPaidId] =
    useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] =
    useState<string>("");
  const [editingDiscountId, setEditingDiscountId] =
    useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] =
    useState<string>("");

  // Helper function to generate PVR number format: PVR/XXX.MDN/YYZZ/00AA
  const generatePVRNumber = (
    pt: PTType,
    pvrDate: string,
  ): string => {
    // Extract year (last 2 digits) and month from DD/MM/YYYY format
    const dateParts = pvrDate.split("/");
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    // Get last 2 digits of year
    const yy = year.slice(-2);
    const zz = month;

    // Generate random 00-99
    const aa = String(Math.floor(Math.random() * 100)).padStart(
      2,
      "0",
    );

    return `PVR/${pt}.MDN/${yy}${zz}/00${aa}`;
  };

  const [pvrForm, setPvrForm] = useState({
    pvrNo: generatePVRNumber(
      "WNS",
      convertToDisplayDate(getTodayYYYYMMDD()),
    ),
    pvrDate: convertToDisplayDate(getTodayYYYYMMDD()),
    docReceiptDate: convertToDisplayDate(getTodayYYYYMMDD()),
    term: "CREDIT" as TermType,
    supplierName: "",
    currency: "IDR",
    paymentMethod: "Transfer" as PaymentMethod,
    remarks: "",
    pt: "WNS" as PTType,
    rate: 0,
    bankAccount: "",
    reference: "",
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Load/Clear edit form state when a new document is opened for editing
  useEffect(() => {
    if (showEditDocumentDialog && editingDocument) {
      const docStorageKey = `pvr_edit_doc_${editingDocument.id}`;
      const savedData = localStorage.getItem(docStorageKey);

      if (savedData) {
        // Load saved data from localStorage
        try {
          const parsedData = JSON.parse(savedData);
          setAmountPaid(parsedData.amountPaid || [{ id: Date.now().toString(), amount: formatNumber(editingDocument.totalAmount || 0) }]);
          setActiveNoteType(parsedData.activeNoteType || null);
          setNoteValue(parsedData.noteValue || "");
          setAccountCodeSearchTerms(
            parsedData.accountCodeSearchTerms || {},
          );
          setDepartmentCodeSearchTerms(
            parsedData.departmentCodeSearchTerms || {},
          );
          // Load additional note details
          if (
            parsedData.noteDetailsPerDoc &&
            parsedData.noteDetailsPerDoc.length > 0
          ) {
            setNoteDetailsPerDoc((prevState) => ({
              ...prevState,
              [editingDocument.id]:
                parsedData.noteDetailsPerDoc,
            }));
          }
        } catch (error) {
          console.error("Failed to parse saved data:", error);
          // If parse error, reset to defaults
          setAmountPaid([
            {
              id: Date.now().toString(),
              amount: formatNumber(editingDocument.totalAmount || 0),
            },
          ]);
          setActiveNoteType(null);
          setNoteValue("");
          setAccountCodeSearchTerms({});
          setDepartmentCodeSearchTerms({});
        }
      } else {
        // No saved data, show defaults for this document
        setAmountPaid([
          {
            id: Date.now().toString(),
            amount: formatNumber(editingDocument.totalAmount || 0),
          },
        ]);
        setActiveNoteType(null);
        setNoteValue("");
        setAccountCodeSearchTerms({});
        setDepartmentCodeSearchTerms({});
      }
    }
  }, [showEditDocumentDialog, editingDocument?.id]);

  // Load discount value and details from localStorage when discount dialog opens
  useEffect(() => {
    if (editingDiscountId) {
      const docStorageKey = `pvr_edit_doc_${editingDiscountId}`;
      const savedData = localStorage.getItem(docStorageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const savedDiscount = parsedData.discount || "";
          setEditingDiscountValue(savedDiscount);
          
          // Also load the discount details (noteValue and noteDetailsPerDoc)
          // If noteValue is not saved, use the savedDiscount as the main discount amount
          const mainDiscountValue = parsedData.noteValue || parsedData.discount || "";
          setNoteValue(mainDiscountValue);
          
          if (parsedData.noteDetailsPerDoc && parsedData.noteDetailsPerDoc.length > 0) {
            setNoteDetailsPerDoc((prevState) => ({
              ...prevState,
              [editingDiscountId]: parsedData.noteDetailsPerDoc,
            }));
          } else {
            // Clear previous discount details if this row has none
            setNoteDetailsPerDoc((prevState) => ({
              ...prevState,
              [editingDiscountId]: [],
            }));
          }
        } catch (error) {
          console.error("Failed to parse discount data from localStorage:", error);
          setEditingDiscountValue("");
          setNoteValue("");
          setNoteDetailsPerDoc((prevState) => ({
            ...prevState,
            [editingDiscountId]: [],
          }));
        }
      } else {
        // No saved data for this row - reset to defaults
        setEditingDiscountValue("");
        setNoteValue("");
        setNoteDetailsPerDoc((prevState) => ({
          ...prevState,
          [editingDiscountId]: [],
        }));
      }
    }
  }, [editingDiscountId]);

  // Listen for navigateToPVR event to auto-expand card
  useEffect(() => {
    const handleNavigateToPVR = (event: any) => {
      const { pvrNo } = event.detail;
      console.log(
        "🎯 PVR received navigateToPVR event for:",
        pvrNo,
      );

      // Find the PVR card by pvrNo and expand it
      const pvrToExpand = pvrData.find(
        (pvr) => pvr.pvrNo === pvrNo,
      );
      if (pvrToExpand) {
        // Expand the card
        setExpandedItems(new Set([pvrToExpand.id]));
        console.log(
          "✅ Expanding PVR card with id:",
          pvrToExpand.id,
        );
      }
    };

    window.addEventListener(
      "navigateToPVR",
      handleNavigateToPVR,
    );
    return () => {
      window.removeEventListener(
        "navigateToPVR",
        handleNavigateToPVR,
      );
    };
  }, [pvrData]);

  const handleViewDetail = (pvr: PVRData) => {
    setSelectedDetail(pvr);
    setShowDetailDialog(true);
  };

  const handleVoidClick = (pvr: PVRData) => {
    setSelectedForVoid(pvr);
    setShowVoidDialog(true);
  };

  const handleVoid = () => {
    if (selectedForVoid) {
      // Update the PVR status to voided
      setPvrData((prevData) =>
        prevData.map((pvr) =>
          pvr.id === selectedForVoid.id
            ? { ...pvr, status: "voided" }
            : pvr,
        ),
      );
      setShowVoidDialog(false);
      setVoidReason("");
      setVoidDate(getTodayYYYYMMDD());
      setSelectedForVoid(null);
    }
  };

  const handleApproveClick = (pvr: PVRData) => {
    setSelectedForApprove(pvr);
    setShowApproveDialog(true);
  };

  const handleApprove = () => {
    if (selectedForApprove) {
      setPvrData((prevData) =>
        prevData.map((pvr) =>
          pvr.id === selectedForApprove.id
            ? { ...pvr, isApproved: true }
            : pvr,
        ),
      );
      setShowApproveDialog(false);
      setSelectedForApprove(null);
    }
  };

  const handleSupplierChange = (supplierName: string) => {
    setPvrForm({ ...pvrForm, supplierName });

    // Load available PIs for this supplier
    const supplier = supplierMasterData.find(
      (s) => s.name === supplierName,
    );
    if (supplier) {
      setAvailablePIsForSupplier(supplier.availablePIs);
      // Auto set currency based on supplier category
      const defaultCurrency =
        supplier.category === "OVERSEAS" ? "USD" : "IDR";
      setPvrForm((prev) => ({
        ...prev,
        currency: defaultCurrency,
      }));
    } else {
      setAvailablePIsForSupplier([]);
    }
    setShowSupplierDropdown(false);
    setSupplierSearchTerm("");
  };

  const handleAddLinks = () => {
    setShowAddLinksDialog(true);
  };

  const handleSelectPI = (pi: LinkedPIDocument) => {
    // Validate that the document has required fields
    if (!pi.piNo || pi.piNo.trim() === "") {
      console.warn("Cannot add document with empty piNo");
      return;
    }
    setLinkedPIs([
      ...linkedPIs,
      { ...pi, id: Date.now().toString() + Math.random() },
    ]);
  };

  const handleCreatePVR = () => {
    // Get supplier info
    const supplier = supplierMasterData.find(
      (s) => s.name === pvrForm.supplierName,
    );
    const supplierCategory: SupplierCategory =
      supplier?.category || "LOCAL";

    // Build linkedDocs with all selected documents (PI, PO, EN, IC, SR)
    let allLinkedDocs: LinkedPIDocument[] = [];
    const processedPOs = new Set<string>();
    
    if (linkedPIs.length > 0) {
      // Add all selected documents first
      linkedPIs.forEach((doc) => {
        allLinkedDocs.push(doc);
        if (doc.documentType === "PO") {
          processedPOs.add(doc.poNo);
        }
      });
      
      // Then find and add related POs for main documents that don't already have a PO selected
      linkedPIs.forEach((pi) => {
        if ((pi.documentType === "PI" || pi.documentType === "IC" || pi.documentType === "SR") && pi.poNo && !processedPOs.has(pi.poNo)) {
          const relatedPO = mockPurchaseOrder.find(
            (po) => po.poId === pi.poNo
          );
          if (relatedPO) {
            allLinkedDocs.push({
              id: `PO-${relatedPO.purchaseOrderNo}`,
              piNo: "",
              poNo: pi.poNo,
              invoiceNo: relatedPO.purchaseOrderNo,
              invoiceDate: relatedPO.createDate || "",
              currency: "IDR",
              totalAmount: relatedPO.totalAmount || 0,
              documentType: "PO" as const,
              documentTypeLabel: "Purchase Order",
            });
            processedPOs.add(pi.poNo);
          }
        }
      });
    }

    // Calculate total (excluding PO)
    let totalInvoice = 0;
    if (linkedPIs.length > 0) {
      const filteredDocs = linkedPIs.filter(
        (doc) =>
          (doc.documentType === "PI" ||
            doc.documentType === "SR" ||
            doc.documentType === "IC" ||
            doc.documentType === "EN") &&
          doc.piNo &&
          doc.piNo.trim() !== "",
      );
      const totalAmount = filteredDocs.reduce(
        (sum, pi) => sum + pi.totalAmount,
        0,
      );
      
      // Calculate total discount from localStorage
      let totalDiscount = 0;
      filteredDocs.forEach((doc) => {
        const docStorageKey = `pvr_create_doc_${doc.id}`;
        const savedData = localStorage.getItem(docStorageKey);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.discount) {
              totalDiscount += parseFormattedNumber(parsed.discount);
            }
          } catch {}
        }
      });
      
      totalInvoice = totalAmount - totalDiscount;
    }

    // Get PO number from linked PIs
    const poNumber =
      linkedPIs.length > 0 ? linkedPIs[0].poNo : "";

    const newPVR: PVRData = {
      id: Date.now().toString(),
      pvrNo: pvrForm.pvrNo,
      pvrDate: convertToStorageDate(pvrForm.pvrDate),
      docReceiptDate: convertToStorageDate(
        pvrForm.docReceiptDate,
      ),
      term: pvrForm.term,
      supplierName: pvrForm.supplierName,
      supplierCategory: supplierCategory,
      currency: pvrForm.currency,
      paymentMethod: pvrForm.paymentMethod,
      remarks: pvrForm.remarks,
      poNumber: poNumber,
      totalInvoice: totalInvoice,
      createdBy: "SHEFANNY",
      pt: pvrForm.pt,
      linkedDocs: allLinkedDocs,
    };

    setPvrData([newPVR, ...pvrData]);

    // Show success dialog
    setSavedPvrNo(newPVR.pvrNo);
    setSavedLinkedDocs(allLinkedDocs);
    setShowSuccessDialog(true);

    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    const todayDate = convertToDisplayDate(getTodayYYYYMMDD());
    setPvrForm({
      pvrNo: generatePVRNumber("WNS", todayDate),
      pvrDate: todayDate,
      docReceiptDate: todayDate,
      term: "CREDIT",
      supplierName: "",
      currency: "IDR",
      paymentMethod: "Transfer",
      remarks: "",
      pt: "WNS",
      rate: 0,
      bankAccount: "",
      reference: "",
    });
    setPvrItems([]);
    setLinkedPIs([]);
    setAvailablePIsForSupplier([]);
  };

  const addPvrItem = () => {
    const newItem: PVRItem = {
      id: Date.now().toString(),
      description: "",
      qty: 0,
      unitPrice: 0,
      totalAmount: 0,
    };
    setPvrItems([...pvrItems, newItem]);
  };

  const handleEdit = () => {
    if (!selectedDetail) return;

    const editData = {
      ...selectedDetail,
      pvrDate: convertToDisplayDate(selectedDetail.pvrDate),
      docReceiptDate: convertToDisplayDate(
        selectedDetail.docReceiptDate,
      ),
    };
    setEditFormData(editData);
    setEditLinkedPIs(selectedDetail.linkedDocs || []);
    setEditPvrItems(selectedDetail.items || []);

    // Load available PIs for the supplier
    const supplier = supplierMasterData.find(
      (s) => s.name === selectedDetail.supplierName,
    );
    if (supplier) {
      setAvailablePIsForSupplier(supplier.availablePIs);
    }

    setShowDetailDialog(false);
    setShowEditDialog(true);
  };

  const handleEditSupplierChange = (supplierName: string) => {
    if (!editFormData) return;

    setEditFormData({ ...editFormData, supplierName });

    // Load available PIs for this supplier
    const supplier = supplierMasterData.find(
      (s) => s.name === supplierName,
    );
    if (supplier) {
      setAvailablePIsForSupplier(supplier.availablePIs);
      const defaultCurrency =
        supplier.category === "OVERSEAS" ? "USD" : "IDR";
      setEditFormData((prev) =>
        prev
          ? {
              ...prev,
              currency: defaultCurrency,
              supplierCategory: supplier.category,
            }
          : null,
      );
    } else {
      setAvailablePIsForSupplier([]);
    }
  };

  const handleEditSelectPI = (pi: LinkedPIDocument) => {
    // Validate that the document has required fields
    if (!pi.piNo || pi.piNo.trim() === "") {
      console.warn("Cannot add document with empty piNo");
      return;
    }
    setEditLinkedPIs([
      ...editLinkedPIs,
      { ...pi, id: Date.now().toString() + Math.random() },
    ]);
  };

  const addEditPvrItem = () => {
    const newItem: PVRItem = {
      id: Date.now().toString(),
      description: "",
      qty: 0,
      unitPrice: 0,
      totalAmount: 0,
    };
    setEditPvrItems([...editPvrItems, newItem]);
  };

  const handleSaveEdit = () => {
    if (!selectedDetail || !editFormData) return;

    // Track changes for audit trail
    const changes: string[] = [];

    if (selectedDetail.pvrDate !== editFormData.pvrDate) {
      changes.push(
        `PVR Date: "${selectedDetail.pvrDate}" → "${editFormData.pvrDate}"`,
      );
    }
    if (
      selectedDetail.docReceiptDate !==
      editFormData.docReceiptDate
    ) {
      changes.push(
        `Doc Receipt Date: "${selectedDetail.docReceiptDate}" → "${editFormData.docReceiptDate}"`,
      );
    }
    if (selectedDetail.term !== editFormData.term) {
      changes.push(
        `Term: "${selectedDetail.term}" → "${editFormData.term}"`,
      );
    }
    if (
      selectedDetail.supplierName !== editFormData.supplierName
    ) {
      changes.push(
        `Supplier Name: "${selectedDetail.supplierName}" → "${editFormData.supplierName}"`,
      );
    }
    if (selectedDetail.currency !== editFormData.currency) {
      changes.push(
        `Currency: "${selectedDetail.currency}" → "${editFormData.currency}"`,
      );
    }
    if (
      selectedDetail.paymentMethod !==
      editFormData.paymentMethod
    ) {
      changes.push(
        `Payment Method: "${selectedDetail.paymentMethod}" → "${editFormData.paymentMethod}"`,
      );
    }
    if (selectedDetail.remarks !== editFormData.remarks) {
      changes.push(
        `Remarks: "${selectedDetail.remarks}" → "${editFormData.remarks}"`,
      );
    }
    if (selectedDetail.pt !== editFormData.pt) {
      changes.push(
        `PT: "${selectedDetail.pt}" → "${editFormData.pt}"`,
      );
    }

    // Calculate new total with same filtering as Financial Summary - exclude PO
    let totalInvoice = 0;
    let allLinkedDocs: LinkedPIDocument[] = [];
    const processedPOs = new Set<string>();
    
    if (editLinkedPIs.length > 0) {
      // Add all selected documents first - with amountPaid from localStorage
      editLinkedPIs.forEach((doc) => {
        // Check localStorage for amountPaid value
        const docStorageKey = `pvr_edit_doc_${doc.id}`;
        const savedData = localStorage.getItem(docStorageKey);
        let amountPaid = doc.totalAmount; // default to full amount
        
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
              amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
              console.log(`[handleSaveEdit] Saving doc ${doc.id} with amountPaid: ${amountPaid} (from localStorage)`);
            }
          } catch {}
        }
        
        // Ensure poNo contains the actual PO number, not just the poId
        let actualPoNo = doc.poNo;
        if (doc.poNo && doc.poNo.startsWith("po_")) {
          // It's a poId, look up the actual PO number
          const targetPO = mockPurchaseOrder.find((po) => po.poId === doc.poNo);
          actualPoNo = targetPO ? targetPO.purchaseOrderNo : doc.poNo;
          console.log(`[handleSaveEdit] Converting poId ${doc.poNo} to purchaseOrderNo ${actualPoNo}`);
        }
        
        // Add amountPaid to the doc being saved and ensure correct poNo
        const docWithAmount = {
          ...doc,
          amountPaid: amountPaid,
          poNo: actualPoNo
        };
        allLinkedDocs.push(docWithAmount);
        console.log(`[handleSaveEdit] Added to allLinkedDocs: doc.id=${doc.id}, amountPaid=${docWithAmount.amountPaid}, poNo=${docWithAmount.poNo}`);
        
        if (doc.documentType === "PO") {
          processedPOs.add(actualPoNo);
        }
      });
      
      // Calculate totals from main documents only
      const filteredDocs = editLinkedPIs.filter(
        (doc) =>
          (doc.documentType === "PI" ||
            doc.documentType === "SR" ||
            doc.documentType === "IC" ||
            doc.documentType === "EN") &&
          doc.piNo &&
          doc.piNo.trim() !== "",
      );
      
      // Calculate total amount paid from localStorage
      let totalAmountPaid = 0;
      filteredDocs.forEach((doc) => {
        const docStorageKey = `pvr_edit_doc_${doc.id}`;
        const savedData = localStorage.getItem(docStorageKey);
        let amountPaid = doc.totalAmount;
        
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
              amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
            }
          } catch {}
        }
        totalAmountPaid += amountPaid;
      });
      
      // Calculate total discount from localStorage
      let totalDiscount = 0;
      filteredDocs.forEach((doc) => {
        const docStorageKey = `pvr_edit_doc_${doc.id}`;
        const savedData = localStorage.getItem(docStorageKey);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.discount) {
              totalDiscount += parseFormattedNumber(parsed.discount);
            }
          } catch {}
        }
      });
      
      totalInvoice = totalAmountPaid - totalDiscount;
      
      // Then find and add related POs for main documents that don't already have a PO selected
      editLinkedPIs.forEach((doc) => {
        if ((doc.documentType === "PI" || doc.documentType === "IC" || doc.documentType === "SR") && doc.poNo && !processedPOs.has(doc.poNo)) {
          const relatedPO = mockPurchaseOrder.find(
            (po) => po.poId === doc.poNo
          );
          if (relatedPO) {
            allLinkedDocs.push({
              id: `PO-${relatedPO.purchaseOrderNo}`,
              piNo: "",
              poNo: doc.poNo,
              invoiceNo: relatedPO.purchaseOrderNo,
              invoiceDate: relatedPO.createDate || "",
              currency: "IDR",
              totalAmount: relatedPO.totalAmount || 0,
              documentType: "PO" as const,
              documentTypeLabel: "Purchase Order",
            });
            processedPOs.add(doc.poNo);
          }
        }
      });
    }

    if (selectedDetail.totalInvoice !== totalInvoice) {
      changes.push(
        `Total Invoice: "${selectedDetail.totalInvoice}" → "${totalInvoice}"`,
      );
    }

    // Get PO number - need to look up the actual PO number from poId
    let poNumber = editFormData.poNumber;
    if (editLinkedPIs.length > 0) {
      const poId = editLinkedPIs[0].poNo;
      const targetPO = mockPurchaseOrder.find((po) => po.poId === poId);
      poNumber = targetPO ? targetPO.purchaseOrderNo : poId;
      console.log(`[handleSaveEdit] Found PO for poId ${poId}: ${poNumber}`);
    }

    // Update the PVR with dates converted back to storage format
    const updatedPVR = {
      ...editFormData,
      pvrDate: convertToStorageDate(editFormData.pvrDate),
      docReceiptDate: convertToStorageDate(
        editFormData.docReceiptDate,
      ),
      linkedDocs: allLinkedDocs,
      totalInvoice: totalInvoice,
      poNumber: poNumber,
    };

    console.log(`[handleSaveEdit] Saving PVR with ${allLinkedDocs.length} documents. poNumber: ${poNumber}`);
    allLinkedDocs.forEach((doc) => {
      console.log(`[handleSaveEdit] linkedDocs - id=${doc.id}, amountPaid=${doc.amountPaid}, poNo=${doc.poNo}`);
    });

    const updatedData = pvrData.map((pvr) =>
      pvr.id === selectedDetail.id ? updatedPVR : pvr,
    );
    setPvrData(updatedData);

    // Note: Do NOT clear localStorage cache for documents - discount data needs to persist
    // The discount details saved in discount dialog should remain in localStorage

    // Increment trigger to force Financial Summary re-calculation
    setTableRefreshTrigger(prev => prev + 1);

    // Set saved changes message and show notification
    setSavedChanges(
      `Changes saved successfully at ${new Date().toLocaleTimeString()}`,
    );
    setShowSavedNotification(true);

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);

    setShowEditDialog(false);
    setEditFormData(null);
    setEditLinkedPIs([]);
    setEditPvrItems([]);

    // Update selectedDetail with the saved data and show detail dialog
    setSelectedDetail({
      ...updatedPVR,
      pvrDate: convertToDisplayDate(updatedPVR.pvrDate),
      docReceiptDate: convertToDisplayDate(
        updatedPVR.docReceiptDate,
      ),
    });

    // Auto-activate info tab and show detail dialog
    setActiveDetailTab("info");
    setShowDetailDialog(true);
  };

  // Filter data
  const filteredData = pvrData.filter((pvr) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      pvr.pvrNo.toLowerCase().includes(searchLower) ||
      pvr.poNumber.toLowerCase().includes(searchLower) ||
      pvr.linkedDocs?.some((doc) =>
        doc.invoiceNo.toLowerCase().includes(searchLower),
      );

    const matchesPT =
      ptFilter === "ALL PT" || pvr.pt === ptFilter;
    const matchesPIC =
      picPIFilter === "all" || pvr.createdBy === picPIFilter;
    const matchesSubmitted =
      submittedFilter === "submitted" ? pvr.isSubmitted : true;

    return (
      matchesSearch &&
      matchesPT &&
      matchesPIC &&
      matchesSubmitted
    );
  });

  // Calculate stats
  const overseasCount = pvrData.filter(
    (p) => p.supplierCategory === "OVERSEAS",
  ).length;
  const localCount = pvrData.filter(
    (p) => p.supplierCategory === "LOCAL",
  ).length;
  const urgentCount = pvrData.filter(
    (p) => p.term === "URGENT",
  ).length;
  const creditCount = pvrData.filter(
    (p) => p.term === "CREDIT",
  ).length;
  const submittedCount = pvrData.filter(
    (p) => p.isSubmitted === true,
  ).length;

  // Filter suppliers based on search
  const filteredSuppliers = supplierMasterData.filter((s) =>
    s.name
      .toLowerCase()
      .includes(supplierSearchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Work Area View */}
      <div className="space-y-4">
        {/* Additional Filters - PT, PIC */}
        <div className="flex items-center gap-1.5 mb-4">
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
              activeFilterType === "pt" || ptFilter !== "ALL PT"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
          >
            {ptFilter === "ALL PT" ? "ALL PT" : ptFilter}
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
              activeFilterType === "pic" ||
              picPIFilter !== "all"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
          >
            {picPIFilter === "all" ? "ALL PIC" : picPIFilter}
          </button>
        </div>

        {/* Filter Options Dropdown */}
        <div className="flex flex-1 items-center gap-1.5 mb-4 min-h-[38px]">
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
        </div>

        {/* Header with buttons */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-purple-900"></h2>
          <div className="flex justify-end items-center gap-3">
            {/* Clear Filter Button - Only show when filters are active */}
            {(ptFilter !== "ALL PT" || picPIFilter !== "all" || submittedFilter !== "unsubmitted") && (
              <Button
                onClick={() => {
                  ptFilter !== "ALL PT" && setPtFilter("ALL PT");
                  picPIFilter !== "all" && setPicPIFilter("all");
                  submittedFilter !== "unsubmitted" && setSubmittedFilter("unsubmitted");
                  setActiveFilterType(null);
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
            <Button
              onClick={() => {
                setExpandAll(!expandAll);
                if (!expandAll) {
                  // Expand all items
                  const allIds = new Set(
                    filteredData.flatMap((item) => [
                      item.id,
                      ...(item.linkedPIs?.map(
                        (pi) => `pi-${item.id}-${pi.invoiceNo}`,
                      ) || []),
                    ]),
                  );
                  setExpandedItems(allIds);
                } else {
                  // Collapse all items
                  setExpandedItems(new Set());
                }
              }}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 gap-3"
            >
              {expandAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {expandAll ? "Collapse All" : "Expand All"}
              </Button>
      
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
                  
            <Button
              onClick={() => {
                setShowSubmitDialog(true);
                setSelectedPVRsForSubmit([]);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" /> Submit
              Documents
            </Button>
            <Button
              onClick={() =>
                setSubmittedFilter(
                  submittedFilter === "unsubmitted"
                    ? "submitted"
                    : "unsubmitted",
                )
              }
              className={`${
                submittedFilter === "submitted"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {submittedFilter === "submitted" ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              Submitted
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search by PVR No or Invoice No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Content Area - Toggle between Normal View and Submit View */}
        <div className="space-y-3">
            {/* Document Counter */}
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-purple-700">
                {filteredData.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-purple-700">
                {pvrData.length}
              </span>{" "}
              documents
            </div>

            {/* PVR Cards Grid */}
            <div className="space-y-3">
              {filteredData.map((pvr) => {
                const isExpanded = expandedItems.has(pvr.id);

                return (
                  <motion.div
                    key={pvr.id}
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
                      onClick={() => toggleExpand(pvr.id)}
                      className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Icon & ID */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                              <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-900 font-mono min-w-[150px]">
                                  {pvr.pvrNo}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    (pvr.supplierCategory ||
                                      "LOCAL") === "OVERSEAS"
                                      ? "border-blue-300 text-blue-700 bg-blue-50"
                                      : "border-green-300 text-green-700 bg-green-50"
                                  }
                                >
                                  {(pvr.supplierCategory || "LOCAL") ===
                                  "OVERSEAS" ? (
                                    <Globe2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <MapPin className="h-3 w-3 mr-1" />
                                  )}
                                  {(pvr.supplierCategory || "LOCAL")
                                    .charAt(0)
                                    .toUpperCase() +
                                    (pvr.supplierCategory || "LOCAL")
                                      .slice(1)
                                      .toLowerCase()}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    (pvr.term || "CREDIT") === "URGENT"
                                      ? "border-blue-300 text-blue-700 bg-blue-50"
                                      : "border-green-300 text-green-700 bg-green-50"
                                  }
                                >
                                  {(pvr.term || "CREDIT")
                                    .charAt(0)
                                    .toUpperCase() +
                                    (pvr.term || "CREDIT")
                                      .slice(1)
                                      .toLowerCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {pvr.pt || "N/A"}
                                </Badge>
                                <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                <span className="text-gray-700 text-sm truncate">
                                  {pvr.supplierName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                          {/* Approved Badge - Desktop */}
                          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                            {(() => {
                              const supplier =
                                supplierMasterData.find(
                                  (s) =>
                                    s.name === pvr.supplierName,
                                );
                              return supplier?.isApproved ? (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-100 text-emerald-700 border-emerald-200"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Approved
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-700 border-yellow-200"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              );
                            })()}
                          </div>

                          {/* Voided Badge - Desktop */}
                          {pvr.status === "voided" && (
                            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className="border-red-300 text-red-700 bg-red-50"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Voided
                              </Badge>
                            </div>
                          )}

                          {/* Submitted Badge - Desktop */}
                          {pvr.status !== "voided" && (
                            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className={`cursor-pointer transition-colors ${
                                  pvr.isSubmitted
                                    ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                    : "border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100"
                                }`}
                              >
                                {pvr.isSubmitted ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Submit
                                  </>
                                ) : (
                                  <>
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    Submit
                                  </>
                                )}
                              </Badge>
                            </div>
                          )}

                          {/* Total Invoice tandai*/}
                          <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center w-36">
                              <span className="text-green-900 font-medium text-sm">
                                {pvr.currency || "IDR"}
                              </span>
                              <span className="text-green-900 font-medium text-sm text-right">
                                {(() => {
                                  // Calculate grand total from localStorage data
                                  let grandTotal = 0;
                                  if (pvr.linkedDocs && pvr.linkedDocs.length > 0) {
                                    const filteredDocs = pvr.linkedDocs.filter(
                                      (doc) =>
                                        (doc.documentType === "PI" ||
                                          doc.documentType === "SR" ||
                                          doc.documentType === "IC" ||
                                          doc.documentType === "EN") &&
                                        doc.piNo &&
                                        doc.piNo.trim() !== "",
                                    );
                                    
                                    let totalAmountPaid = 0;
                                    let totalDiscount = 0;
                                    
                                    filteredDocs.forEach((doc) => {
                                      const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                      const savedData = localStorage.getItem(docStorageKey);
                                      
                                      let amountPaid = doc.totalAmount;
                                      let discount = 0;
                                      
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                            amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                          }
                                          if (parsed.discount) {
                                            discount = parseFormattedNumber(parsed.discount);
                                          }
                                        } catch {}
                                      }
                                      
                                      totalAmountPaid += amountPaid;
                                      totalDiscount += discount;
                                    });
                                    
                                    grandTotal = totalAmountPaid - totalDiscount;
                                  } else {
                                    grandTotal = pvr.totalInvoice || 0;
                                  }
                                  
                                  return formatNumber(grandTotal);
                                })()}
                              </span>
                            </div>
                          </div>

                          {/* Expand Icon */}
                          <motion.div
                            animate={{
                              rotate: isExpanded ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded View */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? "max-h-screen opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 space-y-4 border-t border-purple-200">
                        {/* Details Grid */}
                        <div className="w-full p-6 bg-white rounded-xl border border-gray-200 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Doc Receipt Date */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-600 text-sm">
                                  Doc Receipt Date
                                </span>
                              </div>
                              <div className="text-gray-900">
                                {formatDateToDDMMYYYY(
                                  pvr.docReceiptDate,
                                )}
                              </div>
                            </div>

                            {/* PVR Create Date */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-600 text-sm">
                                  PVR Create Date
                                </span>
                              </div>
                              <div className="text-gray-900 ">
                                {formatDateToDDMMYYYY(
                                  pvr.pvrDate,
                                )}
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-600 text-sm">
                                  Payment Method
                                </span>
                              </div>
                              <div className="text-gray-900 ">
                                {pvr.paymentMethod}
                              </div>
                            </div>

                            {/* Created By */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-600 text-sm">
                                  Created By
                                </span>
                              </div>
                              <div className="text-gray-900 ">
                                {pvr.createdBy}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center gap-3 flex-wrap">
                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.stopPropagation();
                              handleViewDetail(pvr);
                              setActiveDetailTab("info");
                            }}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>

                          {/* Link Button */}
                          <Button
                            variant="outline"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.stopPropagation();
                              setSelectedForLinkedDocs(pvr);
                              setShowLinkedDocsDialog(true);
                            }}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link
                          </Button>

                           {/* Create Payment Voucher  */}
                          <Button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                           // 1. Check if PV already exists for this PVR
                              let pvData: any[] = [];
                              try {
                                const saved = localStorage.getItem("pvData");
                                pvData = saved ? JSON.parse(saved) : [];
                              } catch (err) {
                                pvData = [];
                              }
                              
                              const hasExistingPV = pvData.some((pvItem: any) => pvItem.pvrNo === pvr.pvrNo);
                              
                              if (hasExistingPV) {
                                // Show warning dialog
                                setExistingPvrNo(pvr.pvrNo);
                                setShowPVExistsDialog(true);
                              } else {
                                // Auto-fill form and open Create PV dialog
                                const today = new Date();
                                const day = String(today.getDate()).padStart(2, "0");
                                const month = String(today.getMonth() + 1).padStart(2, "0");
                                const year = today.getFullYear();
                                const todayFormatted = `${day}/${month}/${year}`;

                                setPvrForm((prev: any) => ({
                                  ...prev,
                                  pvrNo: pvr.pvrNo,
                                  pvrDate: todayFormatted,
                                  supplierName: pvr.supplierName || "",
                                  currency: pvr.currency || "IDR",
                                  rate: pvr.rate || 1,
                                  term: pvr.term || "Credit",
                                  pt: pvr.pt || "",
                                  bankAccount: pvr.bankAccount || "",
                                  paymentMethod: pvr.paymentMethod || "Transfer",
                                  remarks: pvr.remarks || ""
                                }));
                                
                                // Auto-fill payable items and tag them with the PVR No
                                if (pvr.linkedDocs && pvr.linkedDocs.length > 0) {
                                  const docsWithPvrNo = pvr.linkedDocs.map((doc: any) => ({
                                    ...doc,
                                    id: doc.id || `${doc.documentType}-${doc.piNo}-${Math.random().toString(36).substr(2, 4)}`,
                                    pvrNo: pvr.pvrNo,
                                    amountPaid: doc.amountPaid || doc.totalAmount || 0
                                  }));
                                  setLinkedPIs(docsWithPvrNo);
                                } else {
                                  setLinkedPIs([]);
                                }
                                
                                setShowCreatePVDialog(true);
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            <span className="flex-1 text-center">
                              Create New PV
                            </span>
                          </Button>

                          {/* Void Button */}
                          <Button
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              e.stopPropagation();
                              handleVoidClick(pvr);
                            }}
                            disabled={pvr.status === "voided"}
                            variant="outline"
                            className={`${
                              pvr.status === "voided"
                                ? "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed"
                                : "border-red-200 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {pvr.status === "voided"
                              ? "Voided"
                              : "Void"}
                          </Button>

                         
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No PVRs found</p>
              </div>
            )}
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
                onCheckedChange={(checked: any) => {
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
                      onSelect={(date: any) => {
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
                      onSelect={(date: any) => {
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

      {/* Submit Documents Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0 pointer-events-auto z-50" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 pointer-events-auto">
             <DialogTitle className="text-purple-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit PVR Documents</DialogTitle>
          </DialogHeader>

           <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pointer-events-auto">
            {/* Search Input */}
            <Card className="p-4">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="🔍 Search by PVR No or Supplier Name..."
                  className="flex-1 border-purple-200 focus:border-purple-400"
                />
              </div>
            </Card>

            {/* Info Card with Select All */}
            <Card className="p-3 bg-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Receipt className="h-4 w-4" />
                  <span>
                    {selectedPVRsForSubmit.length} of{" "}
                    {
                      pvrData.filter(
                        (item) => !item.isSubmitted,
                      ).length
                    }{" "}
                    documents selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={
                      selectedPVRsForSubmit.length ===
                        pvrData.filter(
                          (item) => !item.isSubmitted,
                        ).length &&
                      pvrData.filter(
                        (item) => !item.isSubmitted,
                      ).length > 0
                    }
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedPVRsForSubmit(
                          pvrData
                            .filter((item) => !item.isSubmitted)
                            .map((item) => item.id),
                        );
                      } else {
                        setSelectedPVRsForSubmit([]);
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
            </Card>

            {/* Submission Details */}
            <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-800 mb-3">
                  Submission Details
                </div>

                <div className="flex flex-wrap gap-4 items-end">
                  {/* Submit To */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Submit To
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={submitTo}
                      onValueChange={setSubmitTo}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="COSTING">
                          Costing
                        </SelectItem>
                        <SelectItem value="ACCOUNTING">
                          Accounting
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PIC Name */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      PIC Name
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={picName}
                      onValueChange={setPicName}
                    >
                      <SelectTrigger className="border-blue-200">
                        <SelectValue placeholder="Select PIC..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDivisionPICs
                          .filter(
                            (pic) =>
                              pic.division === submitTo,
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

                  {/* Submit Date */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Submit Date
                      <span className="text-red-500">*</span>
                    </label>
                    <Popover
                      open={showSubmitDatePicker}
                      onOpenChange={setShowSubmitDatePicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-blue-200"
                        >
                          {submitDate || "Pick a date"}
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
                            value={submitDate || ""}
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
                              setSubmitDate(
                                formatted.slice(0, 10),
                              );
                            }}
                            className="text-sm"
                          />
                        </div>

                        {/* Today Button */}
                        <Button
                          onClick={() => {
                            const today = new Date();
                            const day = String(
                              today.getDate(),
                            ).padStart(2, "0");
                            const month = String(
                              today.getMonth() + 1,
                            ).padStart(2, "0");
                            const year = today.getFullYear();
                            const dateStr = `${year}-${month}-${day}`;
                            const formatted =
                              formatDateToDDMMYYYY(dateStr);
                            setSubmitDate(formatted);
                            setShowSubmitDatePicker(false);
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
                              submitDate
                                ? (() => {
                                    const parts =
                                      submitDate.split("/");
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
                                const dateStr = `${year}-${month}-${day}`;
                                const formatted =
                                  formatDateToDDMMYYYY(dateStr);
                                setSubmitDate(formatted);
                                setShowSubmitDatePicker(false);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </Card>

            {/* Document List */}
            <div>
              <div className="border border-purple-200 rounded-lg">
                {pvrData.filter((p) => !p.isSubmitted)
                  .length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <div className="text-lg mb-2">
                      No Documents Available for Submission
                    </div>
                    <div className="text-sm">
                      All documents have been submitted or there
                      are no documents available. Please verify
                      documents first before submitting.
                    </div>
                  </div>
                ) : (
                  pvrData
                    .filter((p) => !p.isSubmitted)
                    .map((pvr) => (
                      <div
                        key={pvr.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-purple-100 last:border-b-0 hover:bg-purple-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (
                            selectedPVRsForSubmit.includes(
                              pvr.id,
                            )
                          ) {
                            setSelectedPVRsForSubmit(
                              selectedPVRsForSubmit.filter(
                                (id) => id !== pvr.id,
                              ),
                            );
                          } else {
                            setSelectedPVRsForSubmit([
                              ...selectedPVRsForSubmit,
                              pvr.id,
                            ]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedPVRsForSubmit.includes(
                            pvr.id,
                          )}
                          onCheckedChange={() => {
                            if (
                              selectedPVRsForSubmit.includes(
                                pvr.id,
                              )
                            ) {
                              setSelectedPVRsForSubmit(
                                selectedPVRsForSubmit.filter(
                                  (id) => id !== pvr.id,
                                ),
                              );
                            } else {
                              setSelectedPVRsForSubmit([
                                ...selectedPVRsForSubmit,
                                pvr.id,
                              ]);
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {pvr.pt}
                            </Badge>
                            <span className="text-sm font-medium text-purple-700">
                              {pvr.pvrNo}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {pvr.supplierName}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {pvr.currency}{" "}
                          {(() => {
                            // Calculate grand total from localStorage data
                            let grandTotal = 0;
                            if (pvr.linkedDocs && pvr.linkedDocs.length > 0) {
                              const filteredDocs = pvr.linkedDocs.filter(
                                (doc) =>
                                  (doc.documentType === "PI" ||
                                    doc.documentType === "SR" ||
                                    doc.documentType === "IC" ||
                                    doc.documentType === "EN") &&
                                  doc.piNo &&
                                  doc.piNo.trim() !== "",
                              );
                              
                              let totalAmountPaid = 0;
                              let totalDiscount = 0;
                              
                              filteredDocs.forEach((doc) => {
                                const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                const savedData = localStorage.getItem(docStorageKey);
                                
                                let amountPaid = doc.totalAmount;
                                let discount = 0;
                                
                                if (savedData) {
                                  try {
                                    const parsed = JSON.parse(savedData);
                                    if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                      amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                    }
                                    if (parsed.discount) {
                                      discount = parseFormattedNumber(parsed.discount);
                                    }
                                  } catch {}
                                }
                                
                                totalAmountPaid += amountPaid;
                                totalDiscount += discount;
                              });
                              
                              grandTotal = totalAmountPaid - totalDiscount;
                            } else {
                              grandTotal = pvr.totalInvoice || 0;
                            }
                            
                            return formatNumber(grandTotal);
                          })()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2">
            <Button
              onClick={() => {
                setShowSubmitDialog(false);
                setSelectedPVRsForSubmit([]);
                setSubmitTo("AP");
                setPicName("");
                setSubmitDate("");
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSubmitSummaryDialog(true);
              }}
              disabled={
                selectedPVRsForSubmit.length === 0 ||
                !submitTo ||
                !picName.trim() ||
                !submitDate
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit {selectedPVRsForSubmit.length}{" "}
              Document
              {selectedPVRsForSubmit.length !== 1
                ? "s"
                : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              PVR Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the selected PVR
            </DialogDescription>
          </DialogHeader>

          {/* Saved Notification */}
          {showSavedNotification && savedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 mx-4 flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {savedChanges}
              </span>
            </motion.div>
          )}

          {selectedDetail && (
            <>
              <div className="flex-1 overflow-y-auto px-1 space-y-4">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="grid grid-cols-7 gap-3">
                    {/* PVR Number */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        PVR No
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.pvrNo}
                      </div>
                    </div>
                    {/* PVR Date */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        PVR Date
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.pvrDate
                          ? formatDateToDDMMYYYY(
                              selectedDetail.pvrDate,
                            )
                          : "-"}
                      </div>
                    </div>
                    {/* Supplier */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        Supplier
                      </div>
                      <div
                        className="font-semibold text-purple-900 text-sm truncate"
                        title={selectedDetail.supplierName}
                      >
                        {selectedDetail.supplierName}
                      </div>
                    </div>
                    {/* Reference */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        Reference
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.reference || "-"}
                      </div>
                    </div>
                    {/* Currency */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold text-center">
                        Currency
                      </div>
                      <div className="grid grid-cols-[auto_min-content_auto]">
                        <div className="font-semibold text-purple-900 text-sm text-right">
                          {selectedDetail.currency || "-"}
                        </div>
                        <div className="font-semibold text-purple-900 text-sm px-[5px} mx-[5px] text-center"></div>
                        <div className="font-semibold text-purple-900 text-sm text-left">
                          {selectedDetail.rate || "1"}
                        </div>
                      </div>
                    </div>

                    {/* Bank Account */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        Bank Account
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.bankAccount || "-"}
                      </div>
                    </div>
                    {/* Method */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        Method
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.method || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setActiveDetailTab("info")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeDetailTab === "info"
                        ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Payable Items
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

                {/* Tab Content */}
                {activeDetailTab === "info" && (
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
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const getDocTypeStyles = (
                            type: string,
                          ) => {
                            switch (type) {
                              case "PI":
                                return "bg-blue-100 text-blue-700 border-blue-200";
                              case "IC":
                                return "bg-amber-100 text-amber-700 border-amber-200";
                              case "SR":
                                return "bg-green-100 text-green-700 border-green-200";
                              case "EN":
                                return "bg-rose-100 text-rose-700 border-rose-200";
                              default:
                                return "bg-gray-100 text-gray-700 border-gray-200";
                            }
                          };

                          const linkedDocs =
                            selectedDetail.linkedDocs || [];
                          const filteredDocs =
                            linkedDocs.filter(
                              (doc) =>
                                (doc.documentType === "PI" ||
                                  doc.documentType === "SR" ||
                                  doc.documentType === "IC" ||
                                  doc.documentType === "EN") &&
                                doc.piNo &&
                                doc.piNo.trim() !== "",
                            );

                          // Helper function to add days to a date (accepts DD/MM/YYYY format)
                          const addDays = (
                            dateStr: string,
                            days: number,
                          ) => {
                            // Convert DD/MM/YYYY to YYYY-MM-DD for Date constructor
                            const parts = dateStr.split("/");
                            const isoDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                            const date = new Date(isoDateStr);
                            date.setDate(date.getDate() + days);
                            return formatDateToDDMMYYYY(
                              date.toISOString().split("T")[0],
                            );
                          };

                          return filteredDocs.length > 0 ? (
                            filteredDocs.map((doc) => {
                              const docType =
                                doc.documentType || "PI";
                              const allocationDate =
                                selectedDetail!.pvrDate
                                  ? formatDateToDDMMYYYY(
                                      convertToStorageDate(
                                        selectedDetail!.pvrDate,
                                      ),
                                    )
                                  : "-";
                              const dueDate = selectedDetail!
                                .pvrDate
                                ? addDays(
                                    selectedDetail!.pvrDate,
                                    30,
                                  )
                                : "-";

                              return (
                                <React.Fragment key={doc.id}>
                                  {(() => {
                                    // Group documents by PO number
                                    const grouped = new Map<string, typeof filteredDocs>();
                                    filteredDocs.forEach((d) => {
                                      const poNum = d.poNo || "NO_PO";
                                      if (!grouped.has(poNum)) {
                                        grouped.set(poNum, []);
                                      }
                                      grouped.get(poNum)!.push(d);
                                    });

                                    // Check if this is the first document in its PO group and group has multiple docs
                                    const docPoNo = doc.poNo || "NO_PO";
                                    const docsInThisGroup = grouped.get(docPoNo) || [];
                                    const isFirstInGroup = docsInThisGroup[0]?.id === doc.id && docsInThisGroup.length > 1;

                                    return (
                                      <>
                                        {isFirstInGroup && (
                                          <tr className="bg-purple-100 h-8">
                                            <td colSpan={6} className="px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-purple-900">
                                                  Purchase Order:
                                                </span>
                                                <span className="text-xs font-semibold text-purple-700">
                                                  {doc.poNo || "No linked PO"}
                                                </span>
                                                <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-[10px]">
                                                  {docsInThisGroup.length} Invoice{docsInThisGroup.length > 1 ? "s" : ""}
                                                </Badge>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                        <tr
                                          className="border-b hover:bg-purple-50"
                                        >

                                  {/* VIEW DOC TYPE */}
                                  <td className="px-4 py-3 text-sm">
                                    {getDocumentTypeLabel(
                                      doc.documentType || "PI",
                                    )}
                                  </td>
                                  {/* VIEW DOC NO */}
                                  <td className="px-4 py-3 text-sm truncate">
                                    {getDocumentNumber(doc)}
                                  </td>
                                  
                              
                                  
                                  {/* VIEW ITEM TOTAL */}
                                  <td className="px-4 py-3 text-sm">
                                    {formatNumber(
                                      doc.totalAmount,
                                    )}
                                  </td>
                                  {/* VIEW AMOUNT PAID */}
                                  <td className="px-4 py-3 text-sm">
                                    {(() => {
                                      void tableRefreshTrigger; // Trigger dependency
                                      const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                      const savedData = localStorage.getItem(docStorageKey);
                                      let amountPaid = doc.totalAmount;
                                      
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                            amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                            return parsed.amountPaid[0].amount;
                                          }
                                        } catch {}
                                      } else if (doc.amountPaid) {
                                        // Fallback to saved amountPaid from linkedDocs
                                        amountPaid = doc.amountPaid;
                                      }
                                      
                                      return formatNumber(amountPaid);
                                    })()}
                                  </td>
                                  {/* VIEW Discount */}
                                  <td className="px-4 py-3 text-sm">
                                    <span className="text-left block text-gray-700 font-medium">
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                        const savedData =
                                          localStorage.getItem(
                                            docStorageKey,
                                          );
                                        if (savedData) {
                                          try {
                                            const parsed =
                                              JSON.parse(
                                                savedData,
                                              );
                                            if (parsed.discount) {
                                              return `${parsed.discount}`;
                                            }
                                          } catch {
                                            return "-";
                                          }
                                        }
                                        return "-";
                                      })()}
                                    </span>
                                  </td>
                                  {/* VIEW Outstanding */}
                                  <td className="px-4 py-3 text-sm">
                                    <span className="text-left block">
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let itemTotal = doc.totalAmount;
                                        let amountPaid = itemTotal;
                                        
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                            }
                                          } catch {}
                                        }
                                        
                                        const outstanding = itemTotal - amountPaid;
                                        if (outstanding > 0) {
                                          return formatNumber(outstanding);
                                        } else {
                                          return formatNumber(0);
                                        }
                                      })()}
                                    </span>
                                  </td>
                                </tr>
                                      </>
                                    );
                                  })()}
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-8 text-center text-gray-500"
                              >
                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No linked documents</p>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* History Tab */}
                {activeDetailTab === "history" && (
                  <div className="p-6 overflow-y-auto h-full">
                    <div className="text-center text-gray-500 py-12">
                      <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No history records yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks and Financial Summary */}
              <div className="flex gap-4 items-stretch">
                {/* Remarks Section */}
                <div className="w-1/2 flex flex-col h-full">
                  <Label>Remarks</Label>
                  <div className="flex-1">
                    <Textarea
                      value=""
                      readOnly
                      placeholder="No remarks"
                      className="flex-1 resize-none min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] flex items-center">
                  <div className="flex-1 flex flex-col justify-between">
                    {(() => {
                      // Force recalculation when tableRefreshTrigger changes
                      void tableRefreshTrigger;
                      
                      // Calculate total using newest edited Amount Paid from localStorage
                      let totalAmount = 0;
                      if (selectedDetail.linkedDocs && selectedDetail.linkedDocs.length > 0) {
                        const filteredDocs = selectedDetail.linkedDocs.filter(
                          (doc) =>
                            (doc.documentType === "PI" ||
                              doc.documentType === "SR" ||
                              doc.documentType === "IC" ||
                              doc.documentType === "EN") &&
                            doc.piNo &&
                            doc.piNo.trim() !== "",
                        );
                        totalAmount = filteredDocs.reduce((sum, doc) => {
                          // Check localStorage for newest edited Amount Paid
                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                          const savedData = localStorage.getItem(docStorageKey);
                          let amountPaid = doc.totalAmount;
                          
                          if (savedData) {
                            try {
                              const parsed = JSON.parse(savedData);
                              if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                              }
                            } catch {}
                          } else if (doc.amountPaid) {
                            // Use saved amountPaid from linkedDocs if localStorage is cleared
                            amountPaid = doc.amountPaid;
                          }
                          
                          return sum + amountPaid;
                        }, 0);
                      }
                      
                      return (
                        <>
                          {/* Total Amount */}
                          <div className="flex items-center">
                            <span className="text-gray-700 text-sm flex-1 font-bold">
                              Total Amount
                            </span>
                            <span className="text-gray-700 text-sm w-12 text-center font-bold">
                              {selectedDetail.currency}
                            </span>
                            <span className="text-gray-700 text-sm w-4 text-right"></span>
                            <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                              {formatNumber(totalAmount)}
                            </span>
                            <span className="text-gray-700 text-sm w-4 text-left"></span>
                          </div>
                          {/* Discount */}
                          <div className="flex items-center">
                            <span className="text-gray-700 text-sm flex-1 font-bold">
                              Discount
                            </span>
                            <span className="text-gray-700 text-sm w-12 text-center font-bold">
                              {selectedDetail.currency}
                            </span>
                            <span className="text-gray-700 text-sm w-4 text-right"></span>
                            <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                              {(() => {
                                let totalDiscount = 0;
                                if (selectedDetail.linkedDocs && selectedDetail.linkedDocs.length > 0) {
                                  selectedDetail.linkedDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.discount) {
                                          totalDiscount += parseFormattedNumber(parsed.discount);
                                        }
                                      } catch {}
                                    }
                                  });
                                }
                                void tableRefreshTrigger;
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
                              {selectedDetail.currency}
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
                              {selectedDetail.currency}
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
                              {selectedDetail.currency}
                            </span>
                            <span className="text-gray-900 text-sm w-4 text-right"></span>
                            <span className="text-gray-900 text-sm w-[114px] text-right font-bold">
                              {(() => {
                                let totalDiscount = 0;
                                if (selectedDetail.linkedDocs && selectedDetail.linkedDocs.length > 0) {
                                  selectedDetail.linkedDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.discount) {
                                          totalDiscount += parseFormattedNumber(parsed.discount);
                                        }
                                      } catch {}
                                    }
                                  });
                                }
                                void tableRefreshTrigger;
                                const grandTotal = totalAmount - totalDiscount;
                                return formatNumber(grandTotal);
                              })()}
                            </span>
                            <span className="text-gray-900 text-sm w-4 text-left"></span>
                          </div>
                          {/* Grand Total (IDR) */}
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
                                let totalDiscount = 0;
                                if (selectedDetail.linkedDocs && selectedDetail.linkedDocs.length > 0) {
                                  selectedDetail.linkedDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.discount) {
                                          totalDiscount += parseFormattedNumber(parsed.discount);
                                        }
                                      } catch {}
                                    }
                                  });
                                }
                                void tableRefreshTrigger;
                                const grandTotal = totalAmount - totalDiscount;
                                const rate = selectedDetail.rate;
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
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Footer with Action Buttons */}
              <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-1 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDetail(null);
                    setShowDetailDialog(false);
                  }}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Close
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Discount Detail Dialog */}
      <Dialog
        open={editingDiscountId !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setEditingDiscountId(null);
            setEditingDiscountValue("");
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Edit Discount Details
            </DialogTitle>
            <DialogDescription>
              Enter discount details for this document
            </DialogDescription>
          </DialogHeader>

          {/* Document Information Section */}
          {/* {editingDocument ? (
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300 p-4 mx-4 mb-3">
              <h3 className="text-sm font-bold text-purple-900 mb-3">Document Information</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="text-xs text-purple-600 font-semibold mb-1">Doc Number</div>
                  <div className="text-sm font-bold text-purple-900">{getDocumentNumber(editingDocument)}</div>
                </div>
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="text-xs text-purple-600 font-semibold mb-1">Doc Type</div>
                  <div className="text-sm font-bold text-purple-900">{getDocumentTypeLabel(editingDocument.documentType || "PI")}</div>
                </div>
               
              </div>
            </div>
          ) : null} */}

          <div className="flex-1 overflow-y-auto px-1">
            {/* Payment Details Section */}
            <div className="max-h-[500px] overflow-y-auto space-y-3 py-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Discount Details
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Discount Details */}
                  <div
                    className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">
                          Discount Details #1
                        </h4>
                        <p className="text-xs text-gray-600">
                          Masukkan jumlah Discount untuk dokumen ini
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid gap-3"
                      style={{ gridTemplateColumns: "200px 1fr" }}
                    >
                      <label className="text-xs font-medium text-gray-700">
                        Discount Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm">
                          {editingDocument?.currency || ""}
                        </span>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={formatNumber(
                            parseFloat(
                              noteValue
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

                            setNoteValue(formatted);

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
                          className="w-full pl-10 pr-3 py-1.5 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Account Code / Account Name
                      </label>
                      <div className="flex gap-4 w-full">
                        <div className="w-1/2">
                          <Select
                            value={
                              accountCodeSearchTerms[0] || ""
                            }
                            onValueChange={(value: string) =>
                              setAccountCodeSearchTerms({
                                ...accountCodeSearchTerms,
                                [0]: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select account code...">
                                {accountCodeSearchTerms[0] ||
                                  "Select account code..."}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                              <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                <input
                                  type="text"
                                  placeholder="Search account code or name..."
                                  value={
                                    accountCodeSearchTerms[0] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setAccountCodeSearchTerms({
                                      ...accountCodeSearchTerms,
                                      [0]: e.target.value,
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
                                          accountCodeSearchTerms[0] ||
                                          ""
                                        ).toLowerCase(),
                                      ) ||
                                    opt.name
                                      .toLowerCase()
                                      .includes(
                                        (
                                          accountCodeSearchTerms[0] ||
                                          ""
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
                        </div>

                        <div className="w-1/2">
                          <Input
                            value={
                              accountOptions.find(
                                (opt) =>
                                  opt.code ===
                                  accountCodeSearchTerms[0],
                              )?.name || ""
                            }
                            readOnly
                            placeholder="Account Name"
                            className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Dept Code / Dept Name
                      </label>
                      <div className="flex gap-4 w-full">
                        <div className="w-1/2">
                          <Select
                            value={
                              departmentCodeSearchTerms[0] || ""
                            }
                            onValueChange={(value: string) =>
                              setDepartmentCodeSearchTerms({
                                ...departmentCodeSearchTerms,
                                [0]: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select dept code...">
                                {departmentCodeSearchTerms[0] ||
                                  "Select dept code..."}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                              className="w-[1000px] p-0 border border-gray-300 rounded-md overflow-hidden"
                              onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
                                e.preventDefault()
                              }
                            >
                              <div
                                className="px-3 py-2 border-b border-gray-300 bg-white"
                                onMouseDown={(e) =>
                                  e.preventDefault()
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Search dept code or name..."
                                  value={
                                    departmentCodeSearchTerms[0] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setDepartmentCodeSearchTerms({
                                      ...departmentCodeSearchTerms,
                                      [0]: e.target.value,
                                    })
                                  }
                                  onMouseDownCapture={(e) =>
                                    e.stopPropagation()
                                  }
                                  onKeyDownCapture={(e) =>
                                    e.stopPropagation()
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
                                          departmentCodeSearchTerms[0] ||
                                          ""
                                        ).toLowerCase(),
                                      ) ||
                                    opt.name
                                      .toLowerCase()
                                      .includes(
                                        (
                                          departmentCodeSearchTerms[0] ||
                                          ""
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
                        </div>

                        <div className="w-1/2">
                          <Input
                            value={
                              departmentOptions.find(
                                (opt) =>
                                  opt.code ===
                                  departmentCodeSearchTerms[0],
                              )?.name || ""
                            }
                            readOnly
                            placeholder="Dept Name"
                            className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description..."
                        rows={3}
                        className="col-span-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Additional Debit/Credit Note Details */}
                  {(
                    noteDetailsPerDoc[editingDocument?.id] || []
                  ).map((detail, index) => (
                    <motion.div
                      key={detail.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-900">
                          Discount Detail #{index + 2}
                        </h4>
                        <button
                          onClick={() => {
                            const docId = editingDocument?.id;
                            setNoteDetailsPerDoc({
                              ...noteDetailsPerDoc,
                              [docId]: (
                                noteDetailsPerDoc[docId] || []
                              ).filter((d) => d.id !== detail.id),
                            });
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: "200px 1fr",
                        }}
                      >
                        <label className="text-xs font-medium text-gray-700">
                          Discount Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm">
                            {editingDocument?.currency || ""}
                          </span>
                          <input
                            type="text"
                            placeholder="0,00"
                            value={formatNumber(
                              parseFloat(
                                detail.noteValue
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
                              const docId = editingDocument?.id;
                              setNoteDetailsPerDoc({
                                ...noteDetailsPerDoc,
                                [docId]: (
                                  noteDetailsPerDoc[docId] || []
                                ).map((d) =>
                                  d.id === detail.id
                                    ? {
                                        ...d,
                                        noteValue: formatted,
                                      }
                                    : d,
                                ),
                              });
                              const commaIndex =
                                formatted.indexOf(",");
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
                            className="w-full pl-10 pr-3 py-1.5 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <label className="text-xs font-medium text-gray-700">
                          Account Code / Account Name
                        </label>
                        <div className="flex gap-4 w-full">
                          <div className="w-1/2">
                            <Select
                              value={detail.accountCode}
                              onValueChange={(value: string) => {
                                const docId = editingDocument?.id;
                                setNoteDetailsPerDoc({
                                  ...noteDetailsPerDoc,
                                  [docId]: (
                                    noteDetailsPerDoc[docId] || []
                                  ).map((d) =>
                                    d.id === detail.id
                                      ? {
                                          ...d,
                                          accountCode: value,
                                        }
                                      : d,
                                  ),
                                });
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select account code...">
                                  {detail.accountCode ||
                                    "Select account code..."}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {accountOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.code}
                                    value={opt.code}
                                  >
                                    <div className="flex gap-2">
                                      <span>{opt.code}</span>
                                      <span className="text-gray-500">
                                        {opt.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-1/2">
                            <Input
                              value={
                                accountOptions.find(
                                  (opt) =>
                                    opt.code ===
                                    detail.accountCode,
                                )?.name || ""
                              }
                              readOnly
                              placeholder="Account Name"
                              className="bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <label className="text-xs font-medium text-gray-700">
                          Dept Code / Dept Name
                        </label>
                        <div className="flex gap-4 w-full">
                          <div className="w-1/2">
                            <Select
                              value={detail.departmentCode}
                              onValueChange={(value: string) => {
                                const docId = editingDocument?.id;
                                setNoteDetailsPerDoc({
                                  ...noteDetailsPerDoc,
                                  [docId]: (
                                    noteDetailsPerDoc[docId] || []
                                  ).map((d) =>
                                    d.id === detail.id
                                      ? {
                                          ...d,
                                          departmentCode: value,
                                        }
                                      : d,
                                  ),
                                });
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select dept code...">
                                  {detail.departmentCode ||
                                    "Select dept code..."}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {departmentOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.code}
                                    value={opt.code}
                                  >
                                    <div className="flex gap-2">
                                      <span>{opt.code}</span>
                                      <span className="text-gray-500">
                                        {opt.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-1/2">
                            <Input
                              value={
                                departmentOptions.find(
                                  (opt) =>
                                    opt.code ===
                                    detail.departmentCode,
                                )?.name || ""
                              }
                              readOnly
                              placeholder="Dept Name"
                              className="bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <label className="text-xs font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          placeholder="Enter description..."
                          rows={2}
                          value={detail.description}
                          onChange={(e) => {
                            const docId = editingDocument?.id;
                            setNoteDetailsPerDoc({
                              ...noteDetailsPerDoc,
                              [docId]: (
                                noteDetailsPerDoc[docId] || []
                              ).map((d) =>
                                d.id === detail.id
                                  ? {
                                      ...d,
                                      description: e.target.value,
                                    }
                                  : d,
                              ),
                            });
                          }}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Button to Add New Discount Card */}
                  <button
                    onClick={() => {
                      const newDetail = {
                        id: `note-${Date.now()}`,
                        noteType: "debit",
                        noteValue: "",
                        accountCode: "",
                        departmentCode: "",
                        description: "",
                      };
                      const docId = editingDocument?.id;
                      setNoteDetailsPerDoc({
                        ...noteDetailsPerDoc,
                        [docId]: [
                          ...(noteDetailsPerDoc[docId] || []),
                          newDetail,
                        ],
                      });
                    }}
                    className="w-full px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Discount Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Discount Total Summary */}
          <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-1">
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Discount Total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    {editingDocument?.currency || ""}
                  </span>
                  <span className="text-lg font-bold text-purple-700">
                    {(() => {
                      // Calculate main discount
                      const mainDiscount = parseFloat(
                        noteValue
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      ) || 0;

                      // Calculate additional discounts
                      const additionalDiscount = (
                        noteDetailsPerDoc[editingDocument?.id] || []
                      ).reduce((sum, detail) => {
                        const amount = parseFloat(
                          detail.noteValue
                            .replace(/\./g, "")
                            .replace(/,/g, "."),
                        ) || 0;
                        return sum + amount;
                      }, 0);

                      // Total
                      const total = mainDiscount + additionalDiscount;
                      return formatNumber(total);
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditingDiscountId(null);
                setEditingDiscountValue("");
              }}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingDiscountId) {
                  const docStorageKey = `pvr_edit_doc_${editingDiscountId}`;
                  const savedData = localStorage.getItem(docStorageKey);
                  const parsedData = savedData ? JSON.parse(savedData) : {};
                  
                  // Calculate total discount (main + all additional discounts)
                  const mainDiscount = parseFloat(
                    noteValue
                      .replace(/\./g, "")
                      .replace(/,/g, "."),
                  ) || 0;

                  const additionalDiscount = (
                    noteDetailsPerDoc[editingDiscountId] || []
                  ).reduce((sum, detail) => {
                    const amount = parseFloat(
                      detail.noteValue
                        .replace(/\./g, "")
                        .replace(/,/g, "."),
                    ) || 0;
                    return sum + amount;
                  }, 0);

                  const totalDiscount = mainDiscount + additionalDiscount;
                  
                  // Save discount data and detail data to localStorage
                  parsedData.discount = formatNumber(totalDiscount);
                  parsedData.noteValue = noteValue; // Store the main discount value
                  parsedData.noteDetailsPerDoc = noteDetailsPerDoc[editingDiscountId] || []; // Store additional discount details
                  parsedData.savedAt = new Date().toISOString();
                  localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
                  setTableRefreshTrigger((prev) => prev + 1);
                  setEditingDiscountId(null);
                  setEditingDiscountValue("");
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New PVR Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            resetForm();
            setLinkedPIs([]);
            setShowSupplierDropdown(false);
            setSupplierSearchTerm("");
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
                      setSupplierSearchTerm(e.target.value);
                    }}
                    onClick={() =>
                      setShowSupplierDropdown(true)
                    }
                    onBlur={() =>
                      setShowSupplierDropdown(false)
                    }
                    placeholder="Type to search..."
                  />
                  {showSupplierDropdown &&
                    filteredSuppliers.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredSuppliers.map((supplier) => (
                          <button
                            key={supplier.name}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSupplierChange(
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
                    onValueChange={(value: TermType) =>
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
                      // Don't allow typing if cursor is at the rightmost position (end of field)
                      if (
                        e.target.selectionStart ===
                        e.target.value.length
                      ) {
                        return;
                      }

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
                    onValueChange={(value: PTType) => {
                      setPvrForm({
                        ...pvrForm,
                        pt: value,
                        pvrNo: generatePVRNumber(
                          value,
                          pvrForm.pvrDate,
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
                            // Allow only numbers and slashes
                            const filtered = value.replace(
                              /[^0-9/]/g,
                              "",
                            );
                            // Auto-format as user types
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
                          const today = new Date();
                          const day = String(
                            today.getDate(),
                          ).padStart(2, "0");
                          const month = String(
                            today.getMonth() + 1,
                          ).padStart(2, "0");
                          const year = today.getFullYear();
                          const dateStr = `${year}-${month}-${day}`;
                          const formatted =
                            formatDateToDDMMYYYY(dateStr);
                          setPvrForm({
                            ...pvrForm,
                            pvrDate: formatted,
                            pvrNo: generatePVRNumber(
                              pvrForm.pt,
                              formatted,
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
                              const dateStr = `${year}-${month}-${day}`;
                              const formatted =
                                formatDateToDDMMYYYY(dateStr);
                              setPvrForm({
                                ...pvrForm,
                                pvrDate: formatted,
                                pvrNo: generatePVRNumber(
                                  pvrForm.pt,
                                  formatted,
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
                    onValueChange={(value: PaymentMethod) =>
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
                      {(() => {
                        const getDocTypeStyles = (
                          type: string,
                        ) => {
                          switch (type) {
                            case "PI":
                              return "bg-blue-100 text-blue-700 border-blue-200";
                            case "IC":
                              return "bg-amber-100 text-amber-700 border-amber-200";
                            case "SR":
                              return "bg-green-100 text-green-700 border-green-200";
                            case "EN":
                              return "bg-rose-100 text-rose-700 border-rose-200";
                            default:
                              return "bg-gray-100 text-gray-700 border-gray-200";
                          }
                        };

                        const addDays = (
                          dateStr: string,
                          days: number,
                        ) => {
                          const parts = dateStr.split("/");
                          const isoDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                          const date = new Date(isoDateStr);
                          date.setDate(date.getDate() + days);
                          return formatDateToDDMMYYYY(
                            date.toISOString().split("T")[0],
                          );
                        };

                        return linkedPIs.length > 0 ? (
                          linkedPIs.map((pi) => {
                            const docType =
                              pi.documentType || "PI";
                            const getDocTypeLabel = (
                              type: string,
                            ) => {
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
                            const allocationDate =
                              pvrForm.pvrDate
                                ? formatDateToDDMMYYYY(
                                    convertToStorageDate(
                                      pvrForm.pvrDate,
                                    ),
                                  )
                                : "-";
                            const dueDate = pvrForm.pvrDate
                              ? addDays(pvrForm.pvrDate, 30)
                              : "-";

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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = formatNumber(pi.totalAmount);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              currentValue = parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        setEditingAmountPaidId(pi.id);
                                        setEditingAmountPaidValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              return parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(pi.totalAmount);
                                      })()}
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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.discount = editingDiscountValue;
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.discount = editingDiscountValue;
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = '0';
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              currentValue = parsed.discount;
                                            }
                                          } catch {}
                                        }
                                        setEditingDiscountId(pi.id);
                                        setEditingDiscountValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              return formatNumber(parseFormattedNumber(parsed.discount));
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(0);
                                      })()}
                                      <Edit className="w-3 h-3 flex-shrink-0" />
                                    </button>
                                  )}
                                </td>
                                {/* Outstanding CELL - CREATE NEW PVR */}
                                <td className="px-4 py-3 text-sm">
                                  {(() => {
                                    const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    let itemTotal = pi.totalAmount;
                                    let amountPaid = itemTotal;
                                    
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                          amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                        }
                                      } catch {}
                                    }
                                    
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
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No payable items
                            </td>
                          </tr>
                        );
                      })()}
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          // Force recalculation by including tableRefreshTrigger
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
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
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;

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
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePVR}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                  disabled={!pvrForm.supplierName}
                >
                  Save PVR
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit PVR Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Edit PVR
            </DialogTitle>
            <DialogDescription>
              Modify the PVR details. All changes will be
              recorded in history.
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="flex flex-col h-full">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                {/* Header Information Grid - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Supplier Name */}
                  <div className="space-y-2">
                    <div className="text-xs text-purple-600 mb-1">
                      Supplier Name{" "}
                      <span className="text-red-500">*</span>
                    </div>
                    <Input
                      value={editFormData.supplierName}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Term */}
                  <div className="space-y-2">
                    <div className="text-xs text-purple-600 mb-1">
                      Term{" "}
                      <span className="text-red-500">*</span>
                    </div>
                    <Input
                      value={editFormData.term || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <div className="text-xs text-purple-600 mb-1">
                      Currency{" "}
                      <span className="text-red-500">*</span>
                    </div>
                    <Input
                      value={editFormData.currency}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <div className="text-xs text-purple-600 mb-1">
                      Rate
                    </div>
                    <Input
                      type="text"
                      value={formatNumber(
                        editFormData?.rate || 0,
                      )}
                      onChange={(e) => {
                        // Don't allow typing if cursor is at the rightmost position (end of field)
                        if (
                          e.target.selectionStart ===
                          e.target.value.length
                        ) {
                          return;
                        }

                        const parsed = parseFloat(
                          e.target.value
                            .replace(/\./g, "")
                            .replace(/,/g, "."),
                        );
                        let newRate = isNaN(parsed)
                          ? 0
                          : parsed;

                        // Check if formatted length exceeds 6 characters (max 6 digits, not counting ,00)
                        const formatted = formatNumber(newRate);
                        const integerPart =
                          formatted.split(",")[0];
                        if (integerPart.length > 6) {
                          return; // Don't update if it exceeds max length
                        }

                        setEditFormData({
                          ...editFormData,
                          rate: newRate,
                        });

                        // setelah update, set caret kembali ke sebelum koma
                        const commaIndex =
                          formatted.indexOf(",");
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
                      placeholder="0,00"
                      className="mt-1"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <div className="text-xs text-purple-600 mb-1">
                      Company
                      <span className="text-red-500">*</span>
                    </div>
                    <Input
                      value={editFormData.pt || ""}
                      disabled
                      className="bg-gray-50"
                    />
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
                      open={showEditDatePicker}
                      onOpenChange={setShowEditDatePicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {editFormData.pvrDate ||
                            "Pick a date"}
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
                            value={editFormData.pvrDate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only numbers and slashes
                              const filtered = value.replace(
                                /[^0-9/]/g,
                                "",
                              );
                              // Auto-format as user types
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
                              setEditFormData({
                                ...editFormData,
                                pvrDate: formatted.slice(0, 10),
                              });
                            }}
                            className="text-sm"
                          />
                        </div>

                        {/* Today Button */}
                        <Button
                          onClick={() => {
                            const today = new Date();
                            const day = String(
                              today.getDate(),
                            ).padStart(2, "0");
                            const month = String(
                              today.getMonth() + 1,
                            ).padStart(2, "0");
                            const year = today.getFullYear();
                            const dateStr = `${year}-${month}-${day}`;
                            const formatted =
                              formatDateToDDMMYYYY(dateStr);
                            setEditFormData({
                              ...editFormData,
                              pvrDate: formatted,
                            });
                            setShowEditDatePicker(false);
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
                              editFormData.pvrDate
                                ? (() => {
                                    const parts =
                                      editFormData.pvrDate.split(
                                        "/",
                                      );
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
                                const dateStr = `${year}-${month}-${day}`;
                                const formatted =
                                  formatDateToDDMMYYYY(dateStr);
                                setEditFormData({
                                  ...editFormData,
                                  pvrDate: formatted,
                                });
                                setShowEditDatePicker(false);
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
                      value={editFormData.bankAccount || ""}
                      onValueChange={(value: string) =>
                        setEditFormData({
                          ...editFormData,
                          bankAccount: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account..." />
                      </SelectTrigger>
                      <SelectContent>
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
                      value={editFormData.method || ""}
                      onValueChange={(value: string) =>
                        setEditFormData({
                          ...editFormData,
                          method: value,
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
                        <SelectItem value="Cash">
                          Cash
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reference */}
                  <div className="space-y-2 w-full">
                    <div className="text-xs text-purple-600 mb-1">
                      Reference
                    </div>
                    <Input
                      value={editFormData.reference || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
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
                      onClick={() => {
                        setShowAddDocumentDialog(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3 flex items-center gap-1"
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
                        {(() => {
                          const getDocTypeStyles = (
                            type: string,
                          ) => {
                            switch (type) {
                              case "PI":
                                return "bg-blue-100 text-blue-700 border-blue-200";
                              case "IC":
                                return "bg-amber-100 text-amber-700 border-amber-200";
                              case "SR":
                                return "bg-green-100 text-green-700 border-green-200";
                              case "EN":
                                return "bg-rose-100 text-rose-700 border-rose-200";
                              default:
                                return "bg-gray-100 text-gray-700 border-gray-200";
                            }
                          };

                          const linkedDocs =
                            editLinkedPIs || [];
                          const filteredDocs =
                            linkedDocs.filter(
                              (doc) =>
                                (doc.documentType === "PI" ||
                                  doc.documentType === "SR" ||
                                  doc.documentType === "IC" ||
                                  doc.documentType === "EN") &&
                                doc.piNo &&
                                doc.piNo.trim() !== "",
                            );

                          // Helper function to add days to a date (accepts DD/MM/YYYY format)
                          const addDays = (
                            dateStr: string,
                            days: number,
                          ) => {
                            // Convert DD/MM/YYYY to YYYY-MM-DD for Date constructor
                            const parts = dateStr.split("/");
                            const isoDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                            const date = new Date(isoDateStr);
                            date.setDate(date.getDate() + days);
                            return formatDateToDDMMYYYY(
                              date.toISOString().split("T")[0],
                            );
                          };

                          return filteredDocs.length > 0 ? (
                            filteredDocs.map((doc) => {
                              const docType =
                                doc.documentType || "PI";
                              const allocationDate =
                                selectedDetail!.pvrDate
                                  ? formatDateToDDMMYYYY(
                                      convertToStorageDate(
                                        selectedDetail!.pvrDate,
                                      ),
                                    )
                                  : "-";
                              const dueDate = selectedDetail!
                                .pvrDate
                                ? addDays(
                                    selectedDetail!.pvrDate,
                                    30,
                                  )
                                : "-";

                              return (
                                <tr
                                  key={doc.id}
                                  className="border-b hover:bg-purple-50"
                                >
                                     {/* DOC TYPE EDIT */}
                                  <td className="px-4 py-3 text-sm">
                                    {getDocumentTypeLabel(
                                      doc.documentType || "PI",
                                    )}
                                  </td>
                                  {/* DOC NO EDIT */}
                                  <td className="px-4 py-3 text-sm truncate">
                                    {getDocumentNumber(doc)}
                                  </td>
                               
                                  {/* ITEM TOTAL EDIT */}
                                  <td className="px-4 py-3 text-sm">
                                    {formatNumber(
                                      doc.totalAmount,
                                    )}
                                  </td>
                                  {/* AMOUNT PAID EDIT */}
                                  <td className="px-4 py-3 text-sm">
                                    {editingAmountPaidId === doc.id ? (
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
                                              const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                              const savedData = localStorage.getItem(docStorageKey);
                                              const parsedData = savedData ? JSON.parse(savedData) : {};
                                              parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                              parsedData.savedAt = new Date().toISOString();
                                              localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                            const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          let currentValue = formatNumber(doc.totalAmount);
                                          if (savedData) {
                                            try {
                                              const parsed = JSON.parse(savedData);
                                              if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                                currentValue = parsed.amountPaid[0].amount;
                                              }
                                            } catch {}
                                          }
                                          setEditingAmountPaidId(doc.id);
                                          setEditingAmountPaidValue(currentValue);
                                        }}
                                        className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                        title="Click to edit"
                                      >
                                        {(() => {
                                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          if (savedData) {
                                            try {
                                              const parsed = JSON.parse(savedData);
                                              if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                                return parsed.amountPaid[0].amount;
                                              }
                                            } catch {}
                                          }
                                          return formatNumber(doc.totalAmount);
                                        })()}
                                        <Edit className="w-3 h-3 flex-shrink-0" />
                                      </button>
                                    )}
                                  </td>
                                  {/* Discount CELL WITH INLINE EDITING */}
                                  <td className="px-4 py-3 text-sm">
                                    {editingDiscountId === doc.id ? (
                                      <div className="flex gap-1">
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
                                              const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                              const savedData = localStorage.getItem(docStorageKey);
                                              const parsedData = savedData ? JSON.parse(savedData) : {};
                                              parsedData.discount = editingDiscountValue;
                                              parsedData.savedAt = new Date().toISOString();
                                              localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
                                              setEditingDiscountId(null);
                                              setEditingDiscountValue('');
                                              setTableRefreshTrigger(prev => prev + 1);
                                            } else if (e.key === 'Escape') {
                                              setEditingDiscountId(null);
                                              setEditingDiscountValue('');
                                            }
                                          }}
                                          className="h-8 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                          autoFocus
                                        />
                                        <Button
                                          onClick={() => {
                                            const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.discount = editingDiscountValue;
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
                                            setEditingDiscountId(null);
                                            setEditingDiscountValue('');
                                            setTableRefreshTrigger(prev => prev + 1);
                                          }}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          let currentValue = '0';
                                          if (savedData) {
                                            try {
                                              const parsed = JSON.parse(savedData);
                                              if (parsed.discount) {
                                                currentValue = parsed.discount;
                                              }
                                            } catch {}
                                          }
                                          setEditingDiscountId(doc.id);
                                          setEditingDiscountValue(currentValue);
                                        }}
                                        className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                        title="Click to edit"
                                      >
                                        {(() => {
                                          // Depend on tableRefreshTrigger to force re-render when discount is saved
                                          void tableRefreshTrigger;
                                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          if (savedData) {
                                            try {
                                              const parsed = JSON.parse(savedData);
                                              if (parsed.discount) {
                                                return formatNumber(parseFormattedNumber(parsed.discount));
                                              }
                                            } catch {}
                                          }
                                          return formatNumber(0);
                                        })()}
                                        <Edit className="w-3 h-3 flex-shrink-0" />
                                      </button>
                                    )}
                                  </td>
                                  {/* Outstanding CELL - EDIT EXISTING PVR */}
                                  <td className="px-4 py-3 text-sm">
                                    {(() => {
                                      const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                      const savedData = localStorage.getItem(docStorageKey);
                                      let itemTotal = doc.totalAmount;
                                      let amountPaid = itemTotal;
                                      
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                            amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                          }
                                        } catch {}
                                      }
                                      
                                      const outstanding = itemTotal - amountPaid;
                                      if (outstanding > 0) {
                                        return formatNumber(outstanding);
                                      } else {
                                        return formatNumber(0);
                                      }
                                    })()}
                                  </td>
                                  {/* ACTION COLUMN - DELETE ONLY */}
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => {
                                        const updatedLinkedDocs =
                                          editLinkedPIs.filter(
                                            (linkedDoc) =>
                                              linkedDoc.id !==
                                              doc.id,
                                          );
                                        setEditLinkedPIs(
                                          updatedLinkedDocs,
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
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-8 text-center text-gray-500"
                              >
                                No payable items
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 border-t border-gray-200 pt-4 space-y-4">
                {/* Remarks and Financial Summary */}
                <div className="flex gap-4 items-stretch">
                  {/* Remarks Section */}
                  <div className="w-1/2 flex flex-col h-full">
                    <Label>Remarks</Label>
                    <div className="flex-1">
                      <Textarea
                        value={editFormData.remarks || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="Enter remarks..."
                        className="flex-1 resize-none min-h-[190px]"
                      />
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] flex items-center">
                    <div className="flex-1 flex flex-col justify-between">
                      {(() => {
                        // Calculate total from editLinkedPIs (reactive to added documents)
                        const filteredDocs = editLinkedPIs.filter(
                          (doc) =>
                            (doc.documentType === "PI" ||
                              doc.documentType === "SR" ||
                              doc.documentType === "IC" ||
                              doc.documentType === "EN") &&
                            doc.piNo &&
                            doc.piNo.trim() !== "",
                        );
                        const totalAmount = filteredDocs.reduce((sum, doc) => {
                          // Check localStorage for newest edited Amount Paid
                          const docStorageKey = `pvr_edit_doc_${doc.id}`;
                          const savedData = localStorage.getItem(docStorageKey);
                          let amountPaid = doc.totalAmount;
                          
                          if (savedData) {
                            try {
                              const parsed = JSON.parse(savedData);
                              if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                              }
                            } catch {}
                          }
                          
                          return sum + amountPaid;
                        }, 0);

                        return (
                          <>
                            {/* Total Amount */}
                            <div className="flex items-center">
                              <span className="text-gray-700 text-sm flex-1 font-bold">
                                Total Amount
                              </span>
                              <span className="text-gray-700 text-sm w-12 text-center font-bold">
                                {editFormData.currency}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right"></span>
                              <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                {formatNumber(totalAmount)}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-left"></span>
                            </div>
                            {/* Discount */}
                            <div className="flex items-center">
                              <span className="text-gray-700 text-sm flex-1 font-bold">
                                Discount
                              </span>
                              <span className="text-gray-700 text-sm w-12 text-center font-bold">
                                {editFormData.currency}
                              </span>
                              <span className="text-gray-700 text-sm w-4 text-right"></span>
                              <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                {(() => {
                                  let totalDiscount = 0;
                                  filteredDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    // Include currently edited discount if user is editing this doc
                                    if (editingDiscountId === doc.id && editingDiscountValue) {
                                      totalDiscount += parseFormattedNumber(editingDiscountValue);
                                    } else {
                                      const savedData = localStorage.getItem(docStorageKey);
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.discount) {
                                            totalDiscount += parseFormattedNumber(parsed.discount);
                                          }
                                        } catch {}
                                      }
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
                                {editFormData.currency}
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
                                {editFormData.currency}
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
                                {editFormData.currency}
                              </span>
                              <span className="text-gray-900 text-sm w-4 text-right"></span>
                              <span className="text-gray-900 text-sm w-[114px] text-right font-bold">
                                {(() => {
                                  let totalDiscount = 0;
                                  filteredDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    // Include currently edited discount if user is editing this doc
                                    if (editingDiscountId === doc.id && editingDiscountValue) {
                                      totalDiscount += parseFormattedNumber(editingDiscountValue);
                                    } else {
                                      const savedData = localStorage.getItem(docStorageKey);
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.discount) {
                                            totalDiscount += parseFormattedNumber(parsed.discount);
                                          }
                                        } catch {}
                                      }
                                    }
                                  });
                                  const grandTotal = totalAmount - totalDiscount;
                                  return formatNumber(grandTotal);
                                })()}
                              </span>
                              <span className="text-gray-900 text-sm w-4 text-left"></span>
                            </div>
                            {/* Grand Total (IDR) */}
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
                                  let totalDiscount = 0;
                                  filteredDocs.forEach((doc) => {
                                    const docStorageKey = `pvr_edit_doc_${doc.id}`;
                                    // Include currently edited discount if user is editing this doc
                                    if (editingDiscountId === doc.id && editingDiscountValue) {
                                      totalDiscount += parseFormattedNumber(editingDiscountValue);
                                    } else {
                                      const savedData = localStorage.getItem(docStorageKey);
                                      if (savedData) {
                                        try {
                                          const parsed = JSON.parse(savedData);
                                          if (parsed.discount) {
                                            totalDiscount += parseFormattedNumber(parsed.discount);
                                          }
                                        } catch {}
                                      }
                                    }
                                  });
                                  const grandTotal = totalAmount - totalDiscount;
                                  const rate = editFormData.rate;
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
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setShowDetailDialog(true);
                      setEditFormData(null);
                      setEditLinkedPIs([]);
                      setEditPvrItems([]);
                    }}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save Change
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New PV Dialog */}
      <Dialog
        open={showCreatePVDialog}
        onOpenChange={(open: boolean) => {
          setShowCreatePVDialog(open);
          if (!open) {
            resetForm();
            setLinkedPIs([]);
            setShowSupplierDropdown(false);
            setSupplierSearchTerm("");
          }
        }}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Create New PV
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new Payment
              Voucher
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
                      setSupplierSearchTerm(e.target.value);
                    }}
                    onClick={() =>
                      setShowSupplierDropdown(true)
                    }
                    onBlur={() =>
                      setShowSupplierDropdown(false)
                    }
                    placeholder="Type to search..."
                  />
                  {showSupplierDropdown &&
                    filteredSuppliers.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredSuppliers.map((supplier: any) => (
                          <button
                            key={supplier.supplierName || supplier.name}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSupplierChange(
                                supplier.supplierName || supplier.name,
                              );
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{supplier.supplierName || supplier.name}</span>
                              {(supplier.category || supplier.supplierCategory) && (
                                <Badge
                                  variant="outline"
                                  className={
                                    (supplier.category || supplier.supplierCategory) ===
                                    "OVERSEAS"
                                      ? "border-purple-200 text-purple-700"
                                      : "border-blue-200 text-blue-700"
                                  }
                                >
                                  {supplier.category || supplier.supplierCategory}
                                </Badge>
                              )}
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
                    onValueChange={(value: any) =>
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
                      // Don't allow typing if cursor is at the rightmost position (end of field)
                      if (
                        e.target.selectionStart ===
                        e.target.value.length
                      ) {
                        return;
                      }

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
                    onValueChange={(value: any) => {
                      setPvrForm({
                        ...pvrForm,
                        pt: value,
                        pvrNo: generatePVRNumber(
                          value,
                          pvrForm.pvrDate,
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
                {/* PV Date */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    PV Date{" "}
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
                            // Allow only numbers and slashes
                            const filtered = value.replace(
                              /[^0-9/]/g,
                              "",
                            );
                            // Auto-format as user types
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
                          const today = new Date();
                          const day = String(
                            today.getDate(),
                          ).padStart(2, "0");
                          const month = String(
                            today.getMonth() + 1,
                          ).padStart(2, "0");
                          const year = today.getFullYear();
                          const dateStr = `${year}-${month}-${day}`;
                          const formatted =
                            formatDateToDDMMYYYY(dateStr);
                          setPvrForm({
                            ...pvrForm,
                            pvrDate: formatted,
                            pvrNo: generatePVRNumber(
                              pvrForm.pt,
                              formatted,
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
                              const dateStr = `${year}-${month}-${day}`;
                              const formatted =
                                formatDateToDDMMYYYY(dateStr);
                              setPvrForm({
                                ...pvrForm,
                                pvrDate: formatted,
                                pvrNo: generatePVRNumber(
                                  pvrForm.pt,
                                  formatted,
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
                    onValueChange={(value: any) =>
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
                    Add PVR

                  </Button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 sticky top-0 z-10">
                      <tr className="h-12">
                         <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "25%", minWidth: "220px" }}
                        >
                          PVR No
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%", minWidth: "150px" }}
                        >
                          Doc Type
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "25%", minWidth: "250px" }}
                        >
                          Doc No
                        </th>
                   
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Item Total
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Amount Paid
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "100px" }}
                        >
                          Discount
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Outstanding
                        </th>
                        <th
                          className="text-purple-900 text-xs text-center px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "80px" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const addDays = (
                          dateStr: string,
                          days: number,
                        ) => {
                          const parts = dateStr.split("/");
                          const isoDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                          const date = new Date(isoDateStr);
                          date.setDate(date.getDate() + days);
                          return formatDateToDDMMYYYY(
                            date.toISOString().split("T")[0],
                          );
                        };

                        return linkedPIs.length > 0 ? (
                          linkedPIs.map((pi) => {
                            const docType =
                              pi.documentType || "PI";
                            const getDocTypeLabel = (
                              type: string,
                            ) => {
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
                                  {pi.pvrNo || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {getDocTypeLabel(docType)}
                                </td>
                                <td className="px-4 py-3 text-sm">
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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = formatNumber(pi.totalAmount);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              currentValue = parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        setEditingAmountPaidId(pi.id);
                                        setEditingAmountPaidValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              return parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(pi.totalAmount);
                                      })()}
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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.discount = editingDiscountValue;
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.discount = editingDiscountValue;
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = '0';
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              currentValue = parsed.discount;
                                            }
                                          } catch {}
                                        }
                                        setEditingDiscountId(pi.id);
                                        setEditingDiscountValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              return formatNumber(parseFormattedNumber(parsed.discount));
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(0);
                                      })()}
                                      <Edit className="w-3 h-3 flex-shrink-0" />
                                    </button>
                                  )}
                                </td>
                                {/* Outstanding CELL - CREATE NEW PV */}
                                <td className="px-4 py-3 text-sm">
                                  {(() => {
                                    const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    let itemTotal = pi.totalAmount;
                                    let amountPaid = itemTotal;
                                    
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                          amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                        }
                                      } catch {}
                                    }
                                    
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
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No payable items
                            </td>
                          </tr>
                        );
                      })()}
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          // Force recalculation by including tableRefreshTrigger
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
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
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;

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
                    setShowCreatePVDialog(false);
                    resetForm();
                    setLinkedPIs([]);
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // 1. Get existing PV data
                    let pvData: any[] = [];
                    try {
                      const saved = localStorage.getItem("pvData");
                      pvData = saved ? JSON.parse(saved) : [];
                    } catch (e) {
                      pvData = [];
                    }

                    // 2. Process linked documents to include amountPaid and discount
                    let totalAmountPaid = 0;
                    let totalDiscount = 0;
                    
                    const processedLinkedDocs = linkedPIs.map((pi) => {
                      const docStorageKey = `pvr_edit_doc_${pi.id}`;
                      const savedData = localStorage.getItem(docStorageKey);
                      let amountPaid = pi.totalAmount;
                      let discount = 0;
                      
                      if (savedData) {
                        try {
                          const parsed = JSON.parse(savedData);
                          if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                            amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                          }
                          if (parsed.discount) {
                            discount = parseFormattedNumber(parsed.discount);
                          }
                        } catch {}
                      }
                      
                      totalAmountPaid += amountPaid;
                      totalDiscount += discount;

                      return {
                        ...pi,
                        amountPaid,
                        discount
                      };
                    });

                    const grandTotal = totalAmountPaid - totalDiscount;

                    // 3. Create new PV object
                    const newPV = {
                      id: `pv-${Date.now()}`,
                      pvNo: pvrForm.pvrNo ? pvrForm.pvrNo.replace("PVR", "PV") : `PV-${Date.now()}`,
                      pvrNo: pvrForm.pvrNo,
                      pvDate: pvrForm.pvrDate,
                      supplierName: pvrForm.supplierName,
                      currency: pvrForm.currency,
                      rate: pvrForm.rate,
                      term: pvrForm.term,
                      pt: pvrForm.pt,
                      bankAccount: pvrForm.bankAccount,
                      paymentMethod: pvrForm.paymentMethod,
                      remarks: pvrForm.remarks,
                      totalAmount: grandTotal,
                      linkedDocs: processedLinkedDocs,
                      status: "Draft",
                      createdAt: new Date().toISOString()
                    };

                    // 4. Save to localStorage
                    pvData.push(newPV);
                    localStorage.setItem("pvData", JSON.stringify(pvData));

                    // 5. Close dialog and reset
                    setShowCreatePVDialog(false);
                    resetForm();
                    setLinkedPIs([]);
                    
                    // 6. Show success dialog with new PV details
                    setSavedPVNo(newPV.pvNo);
                    setSavedPVLinkedDocs(processedLinkedDocs);
                    setShowPVSuccessDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                  disabled={!pvrForm.supplierName}
                >
                  Save PV
                </Button>
              </div>
            </div>
          </div>
          
        </DialogContent>
      </Dialog>


      {/* Add Document Dialog in pvr edit mode*/}
      <Dialog
        open={showAddDocumentDialog}
        onOpenChange={setShowAddDocumentDialog}
      >
        <DialogContent className="w-full max-h-[85vh] flex flex-col overflow-x-hidden overflow-y-auto">
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
              value={addDocumentSearchTerm}
              onChange={(e) => setAddDocumentSearchTerm(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          {/* Sticky Header */}
          <div className="flex-shrink-0 bg-gray-50 border-b border-gray-300 px-4 py-1 flex sticky top-0 z-10">
            <div className="px-2 py-1 flex items-center border-r border-gray-200 min-w-[60px]">
              <span className="text-xs font-semibold text-gray-600">Select</span>
            </div>
            <div className="flex-1 px-3 py-1 border-r border-gray-200 min-w-[300px]">
              <span className="text-xs font-semibold text-gray-600">Purchase Order</span>
            </div>
            <div className="flex-1 px-3 py-1 border-r border-gray-200 min-w-[300px]">
              <span className="text-xs font-semibold text-gray-600">Purchase Invoice</span>
            </div>
            <div className="flex-1 px-3 py-1 border-r border-gray-200 min-w-[300px]">
              <span className="text-xs font-semibold text-gray-600">Expense Note</span>
            </div>
            <div className="flex-1 px-3 py-1 min-w-[300px]">
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

              // Also add documents already in editLinkedPIs (for edit mode)
              editLinkedPIs.forEach((doc) => {
                linkedDocIds.add(`${doc.documentType}-${doc.piNo}`);
              });

              // Filter unlinked documents and search by document number
              const searchLower = addDocumentSearchTerm.toLowerCase();
              
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
                let poIdToMatch: (string | string[] | null) = null;
                if (docType === "PI") {
                  poIdToMatch = doc.poId;
                } else if (docType === "IC") {
                  const poNoValue = doc.poNo || (mockImportCosts.find(ic => ic.icNum === doc.icNum)?.poNo);
                  poIdToMatch = poNoValue;
                } else if (docType === "SR") {
                  const poNoValue = doc.poNo || (mockShipmentRequest.find(sr => sr.srNum === doc.srNum)?.poNo);
                  poIdToMatch = poNoValue;
                }
                
                const relatedPOs = poIdToMatch
                  ? mockPurchaseOrder.filter(
                      (po) => {
                        if (docType === "PI") {
                          return po.poId === poIdToMatch;
                        } else {
                          // For IC/SR, poIdToMatch could be string or array
                          const poNoArray = Array.isArray(poIdToMatch) ? poIdToMatch : [poIdToMatch];
                          return poNoArray.includes(po.purchaseOrderNo);
                        }
                      },
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
                    className=" rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex h-16"
                  >

                    <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px]">
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
                      <div className="flex-1 px-2 overflow-hidden min-w-[300px] border-r border-gray-200 flex items-center gap-2">
                        {relatedPOs.map((po) => (
                          <div
                            key={`PO-${po.purchaseOrderNo}`}
                            className="flex flex-col gap-0.5 text-xs min-w-0 flex-1"
                          >
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {po.purchaseOrderNo}
                            </span>
                            <span className="text-gray-500 font-semibold truncate">
                              Total: {po.currency || "IDR"} {formatNumber(po.totalAmount)}
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
                      <div className="flex-1 px-2 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200 min-w-[300px]">
                        No linked PO
                      </div>
                    )}

                    {/* Main Document - Left-Middle Side */}
                    <div className="px-3 flex-1 border-r border-gray-200 min-w-[300px] flex items-center">
                      <div className="flex items-center gap-2 flex-1 min-w-0">

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5 text-xs min-w-0">
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {docNo}
                            </span>

                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 truncate whitespace-nowrap">
                            Total: {doc.currency || "IDR"} {formatNumber(amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Expense Notes - Middle-Right Side */}
                    {relatedENs.length > 0 && (
                      <div className="flex-1 px-2 overflow-hidden min-w-[300px] border-r border-gray-200 flex items-center">
                        {relatedENs.slice(0, 1).map((en) => (
                          <div
                            key={`EN-${en.apNoteNo}`}
                            className="flex flex-col gap-0.5 text-xs min-w-0"
                          >
                            <span className="font-medium text-gray-700 truncate whitespace-nowrap">
                              {en.apNoteNo}
                            </span>
                            <span className="text-gray-500 truncate whitespace-nowrap">
                              Total: {en.currency || "IDR"} {formatNumber(en.totalInvoice)}
                            </span>


                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state if no AP Notes */}
                    {relatedENs.length === 0 && (
                      <div className="flex-1 px-2 flex items-center justify-center text-gray-400 text-xs border-r border-gray-200 line-clamp-1">
                        No linked AP Notes
                      </div>
                    )}

                    {/* Related Purchase Return - Far Right Side */}
                    <div className="flex-1 px-2 flex items-center justify-center text-gray-400 text-xs min-w-[300px] line-clamp-1">
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
                        <div key={`group-${groupKey}`} className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          {/* Group Header */}
                          {docsInGroup.length > 1 && (
                            <>
                              {groupKey.startsWith("IC-") ? (
                                // Grouping berdasarkan Import Cost
                                <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-green-900">Import Cost:</span>
                                    <span className="text-xs font-semibold text-green-700">
                                      {(() => {
                                        const icNum = groupKey.replace("IC-", "");
                                        const relatedIC = mockImportCosts.find(ic => ic.icNum === icNum);
                                        return relatedIC ? relatedIC.icNum : icNum;
                                      })()}
                                    </span>
                                    <Badge className="bg-blue-100 text-blue-700 border border-blue-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              ) : groupKey.startsWith("SR-") ? (
                                // Grouping berdasarkan Shipment Request
                                <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-900">Shipment Request:</span>
                                    <span className="text-xs font-semibold text-amber-700">
                                      {(() => {
                                        const srNum = groupKey.replace("SR-", "");
                                        const relatedSR = mockShipmentRequest.find(sr => sr.srNum === srNum);
                                        return relatedSR ? relatedSR.srNum : srNum;
                                      })()}
                                    </span>
                                    <Badge className="bg-orange-100 text-orange-700 border border-orange-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              ) : groupKey.startsWith("PI-") ? (
                                // Grouping berdasarkan PI
                                <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-900">Purchase Invoice:</span>
                                    <span className="text-xs font-semibold text-blue-700">
                                      {(() => {
                                        const piNum = groupKey.replace("PI-", "");
                                        const relatedPI = mockpurchaseInvoice.find(pi => pi.purchaseInvoiceNo === piNum);
                                        return relatedPI ? relatedPI.purchaseInvoiceNo : piNum;
                                      })()}
                                    </span>
                                    <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              ) : groupKey !== "NO_PO" ? (
                                // Grouping berdasarkan PO
                                <div className="bg-purple-100 border border-purple-300 rounded-lg px-4 py-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-purple-900">Purchase Order:</span>
                                    <span className="text-xs font-semibold text-purple-700">
                                      {(() => {
                                        const relatedPO = mockPurchaseOrder.find(po => po.poId === groupKey);
                                        return relatedPO ? relatedPO.purchaseOrderNo : groupKey;
                                      })()}
                                    </span>
                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                // Fallback: No Grouping Key
                                <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">No Grouping Key:</span>
                                    <span className="text-xs font-semibold text-gray-700">N/A</span>
                                    <Badge className="bg-gray-200 text-gray-700 border border-gray-300 text-[10px]">
                                      {getBadgeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Documents in group */}
                          <div className="space-y-2">
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
              onClick={() => setShowAddDocumentDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Add selected documents to the PVR
                if (editFormData) {
                  // Edit mode - add to editLinkedPIs
                  const selectedDocsList = Array.from(
                    selectedDocuments,
                  ).map((docId) => {
                    const [type, no] = docId.split("-", 2);
                    const remaining = docId.substring(
                      type.length + 1,
                    );

                    if (type === "PI") {
                      const pi = mockpurchaseInvoice.find(
                        (p) =>
                          p.purchaseInvoiceNo === remaining,
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
                        (i) => i.icNum === remaining,
                      );
                      // Extract all PO numbers from linkedDocs or poNo field
                      let poNumbers: string[] = [];
                      
                      // First, collect from linkedDocs
                      if (ic?.linkedDocs && Array.isArray(ic.linkedDocs)) {
                        const poDocs = ic.linkedDocs.filter(
                          (doc: any) => doc.type === "Purchase Order"
                        );
                        poNumbers = poDocs.map((doc: any) => doc.docNo);
                      }
                      
                      // If no linkedDocs POs, use poNo field
                      if (poNumbers.length === 0) {
                        let poNo = ic?.poNo || "";
                        // Handle case where poNo might be an array
                        if (Array.isArray(poNo)) {
                          poNumbers = poNo.filter(p => p);
                        } else if (poNo) {
                          poNumbers = [poNo];
                        }
                      }
                      
                      // If no POs found, return single entry with empty poNo
                      if (poNumbers.length === 0) {
                        return ic
                          ? {
                              id: `${type}-${ic.icId}`,
                              piNo: ic.icNum,
                              poNo: "",
                              invoiceNo: ic.invoiceNo || "",
                              invoiceDate: ic.icDate || "",
                              currency: ic.currency,
                              totalAmount: ic.totalImportCost,
                              documentType: "IC" as const,
                            }
                          : null;
                      }
                      
                      // For multiple POs, this will be handled by expanding the entry
                      return ic
                        ? {
                            id: `${type}-${ic.icId}`,
                            piNo: ic.icNum,
                            poNo: poNumbers,
                            invoiceNo: ic.invoiceNo || "",
                            invoiceDate: ic.icDate || "",
                            currency: ic.currency,
                            totalAmount: ic.totalImportCost,
                            documentType: "IC" as const,
                          }
                        : null;
                    } else if (type === "SR") {
                      const sr = mockShipmentRequest.find(
                        (s) => s.srNum === remaining,
                      );
                      // Extract all PO numbers from linkedDocs or poNo field
                      let poNumbers: string[] = [];
                      
                      // First, collect from linkedDocs
                      if (sr?.linkedDocs && Array.isArray(sr.linkedDocs)) {
                        const poDocs = sr.linkedDocs.filter(
                          (doc: any) => doc.type === "Purchase Order"
                        );
                        poNumbers = poDocs.map((doc: any) => doc.docNo);
                      }
                      
                      // If no linkedDocs POs, use poNo field
                      if (poNumbers.length === 0) {
                        let poNo = sr?.poNo || "";
                        // Handle case where poNo might be an array
                        if (Array.isArray(poNo)) {
                          poNumbers = poNo.filter(p => p);
                        } else if (poNo) {
                          poNumbers = [poNo];
                        }
                      }
                      
                      // If no POs found, return single entry with empty poNo
                      if (poNumbers.length === 0) {
                        return sr
                          ? {
                              id: `${type}-${sr.srId}`,
                              piNo: sr.srNum,
                              poNo: "",
                              invoiceNo: sr.invoiceNo || "",
                              invoiceDate: sr.docReceivedDate,
                              currency: sr.currency,
                              totalAmount: sr.totalShipmentRequest,
                              documentType: "SR" as const,
                            }
                          : null;
                      }
                      
                      // For multiple POs, this will be handled by expanding the entry
                      return sr
                        ? {
                            id: `${type}-${sr.srId}`,
                            piNo: sr.srNum,
                            poNo: poNumbers,
                            invoiceNo: sr.invoiceNo || "",
                            invoiceDate: sr.docReceivedDate,
                            currency: sr.currency,
                            totalAmount: sr.totalShipmentRequest,
                            documentType: "SR" as const,
                          }
                        : null;
                    } else if (type === "EN") {
                      const en = mockExpenseNote.find(
                        (e) => e.apNoteNo === remaining,
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
                    } else if (type === "PO") {
                      const po = mockPurchaseOrder.find(
                        (p) => p.purchaseOrderNo === remaining,
                      );
                      return po
                        ? {
                            id: `${type}-${po.poId}`,
                            piNo: "",
                            poNo: po.purchaseOrderNo,
                            invoiceNo: "",
                            invoiceDate: po.createDate || "",
                            currency: "IDR",
                            totalAmount: po.totalAmount,
                            documentType: "PO" as const,
                          }
                        : null;
                    }
                    return null;
                  });

                  setEditLinkedPIs([
                    ...editLinkedPIs,
                    ...(selectedDocsList.filter(doc => doc !== null) as LinkedPIDocument[]),
                  ]);
                } else {
                  // Create mode - add to linkedPIs
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
                      // Extract all PO numbers from linkedDocs or poNo field
                      let poNumbers: string[] = [];
                      
                      // First, collect from linkedDocs
                      if (ic?.linkedDocs && Array.isArray(ic.linkedDocs)) {
                        const poDocs = ic.linkedDocs.filter(
                          (doc: any) => doc.type === "Purchase Order"
                        );
                        poNumbers = poDocs.map((doc: any) => doc.docNo);
                      }
                      
                      // If no linkedDocs POs, use poNo field
                      if (poNumbers.length === 0) {
                        let poNo = ic?.poNo || "";
                        // Handle case where poNo might be an array
                        if (Array.isArray(poNo)) {
                          poNumbers = poNo.filter(p => p);
                        } else if (poNo) {
                          poNumbers = [poNo];
                        }
                      }
                      
                      // If no POs found, return single entry with empty poNo
                      if (poNumbers.length === 0) {
                        return ic
                          ? {
                              id: `${type}-${ic.icId}`,
                              piNo: ic.icNum,
                              poNo: "",
                              invoiceNo: ic.invoiceNo || "",
                              invoiceDate: ic.icDate || "",
                              currency: ic.currency,
                              totalAmount: ic.totalImportCost,
                              documentType: "IC" as const,
                            }
                          : null;
                      }
                      
                      // For multiple POs, this will be handled by expanding the entry
                      return ic
                        ? {
                            id: `${type}-${ic.icId}`,
                            piNo: ic.icNum,
                            poNo: poNumbers,
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
                      // Extract all PO numbers from linkedDocs or poNo field
                      let poNumbers: string[] = [];
                      
                      // First, collect from linkedDocs
                      if (sr?.linkedDocs && Array.isArray(sr.linkedDocs)) {
                        const poDocs = sr.linkedDocs.filter(
                          (doc: any) => doc.type === "Purchase Order"
                        );
                        poNumbers = poDocs.map((doc: any) => doc.docNo);
                      }
                      
                      // If no linkedDocs POs, use poNo field
                      if (poNumbers.length === 0) {
                        let poNo = sr?.poNo || "";
                        // Handle case where poNo might be an array
                        if (Array.isArray(poNo)) {
                          poNumbers = poNo.filter(p => p);
                        } else if (poNo) {
                          poNumbers = [poNo];
                        }
                      }
                      
                      // If no POs found, return single entry with empty poNo
                      if (poNumbers.length === 0) {
                        return sr
                          ? {
                              id: `${type}-${sr.srId}`,
                              piNo: sr.srNum,
                              poNo: "",
                              invoiceNo: sr.invoiceNo || "",
                              invoiceDate: sr.docReceivedDate,
                              currency: sr.currency,
                              totalAmount: sr.totalShipmentRequest,
                              documentType: "SR" as const,
                            }
                          : null;
                      }
                      
                      // For multiple POs, this will be handled by expanding the entry
                      return sr
                        ? {
                            id: `${type}-${sr.srId}`,
                            piNo: sr.srNum,
                            poNo: poNumbers,
                            invoiceNo: sr.invoiceNo || "",
                            invoiceDate: sr.docReceivedDate,
                            currency: sr.currency,
                            totalAmount: sr.totalShipmentRequest,
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
                    } else if (type === "PO") {
                      const po = mockPurchaseOrder.find(
                        (p) => p.purchaseOrderNo === no,
                      );
                      return po
                        ? {
                            id: `${type}-${po.poId}`,
                            piNo: "",
                            poNo: po.purchaseOrderNo,
                            invoiceNo: "",
                            invoiceDate: po.createDate || "",
                            currency: "IDR",
                            totalAmount: po.totalAmount,
                            documentType: "PO" as const,
                          }
                        : null;
                    }
                    return null;
                  });

                  setLinkedPIs([
                    ...linkedPIs,
                    ...(selectedDocsList.filter(doc => doc !== null) as LinkedPIDocument[]),
                  ]);
                }

                setShowAddDocumentDialog(false);
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

      {/* Add Document in create new Dialog */}
      <Dialog
        open={showAddLinksDialog}
        onOpenChange={setShowAddLinksDialog}
      >
             <DialogContent
          className="w-full flex flex-col overflow-x-hidden overflow-y-auto"
          style={{ height: "85vh" }}
        >
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
                              Total: {po.currency || "IDR"} {formatNumber(po.totalAmount)}
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
                            Total: {doc.currency || "IDR"} {formatNumber(amount)}
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
                            <span className="text-gray-500 truncate whitespace-nowrap">
                              Total: {en.currency || "IDR"} {formatNumber(en.totalInvoice)}
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
                  ...(selectedDocsList.filter(doc => doc !== null) as LinkedPIDocument[]),
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

      {/* Void Dialog */}
      <Dialog
        open={showVoidDialog}
        onOpenChange={setShowVoidDialog}
      >
        <DialogContent className="w-[400px] max-w-full mx-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Void PVR
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for voiding this PVR
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Void Date</Label>
              <Input
                type="text"
                value={formatDateToDDMMYYYY(getTodayYYYYMMDD())}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>Void Reason</Label>
              <Textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={4}
                placeholder="Enter reason for voiding this PVR..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowVoidDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVoid}
              className="bg-red-600 hover:bg-red-700"
              disabled={!voidReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Void PVR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Approve Payment Voucher Request
            </DialogTitle>
            <DialogDescription>
              Please review the PVR details before approving
            </DialogDescription>
          </DialogHeader>
          {selectedForApprove && (
            <div className="space-y-4">
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        PVR No
                      </div>
                      <div className="text-purple-900">
                        {selectedForApprove.pvrNo}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Supplier
                      </div>
                      <div className="text-gray-900">
                        {selectedForApprove.supplierName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Amount
                      </div>
                      <div className="text-gray-900">
                        {selectedForApprove.currency}{" "}
                        {selectedForApprove.totalInvoice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Success Dialog - PVR Created */}
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
                  {savedLinkedDocs.length}
                </Badge>
              </div>
              {savedLinkedDocs.length > 0 && (
                <div
                  className="space-y-3"
                  style={{ width: "500px", maxHeight: "300px", overflowY: "auto" }}
                >
                  {savedLinkedDocs.map((doc) => {
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
                            <FileText className="w-5 h-5" style={{ color: textColor.split("-")[1] ? textColor : undefined }} />
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
                  setShowSuccessDialog(false);
                  // Expand the newly created PVR
                  setExpandedItems((prev) =>
                    new Set([
                      Date.now().toString(),
                      ...Array.from(prev),
                    ])
                  );
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

       {/* Success Dialog - PV Created */}
      <Dialog
        open={showPVSuccessDialog}
        onOpenChange={setShowPVSuccessDialog}
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
              PV Saved
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">
                PV No
              </div>
              <div className="text-lg font-semibold text-purple-900">
                {savedPVNo}
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
                  {savedPVLinkedDocs.length}
                </Badge>
              </div>
              {savedPVLinkedDocs.length > 0 && (
                <div
                  className="space-y-3"
                  style={{ width: "500px", maxHeight: "300px", overflowY: "auto" }}
                >
                  {savedPVLinkedDocs.map((doc) => {
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
                            <FileText className="w-5 h-5" style={{ color: textColor.split("-")[1] ? textColor : undefined }} />
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
                  setShowPVSuccessDialog(false);
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
                  const linkedDocsCount = !selectedForLinkedDocs?.linkedDocs ||
                    selectedForLinkedDocs.linkedDocs.length === 0
                    ? 0
                    : selectedForLinkedDocs.linkedDocs.length;
                  
                  // Load PV data and find related PVs
                  let pvData: any[] = [];
                  try {
                    const saved = localStorage.getItem("pvData");
                    pvData = saved ? JSON.parse(saved) : [];
                  } catch (e) {
                    pvData = [];
                  }
                  
                  const linkedPVs = pvData.filter(
                    (pv) => pv.pvrNo === selectedForLinkedDocs?.pvrNo
                  );

                  const filteredDocs = (selectedForLinkedDocs?.linkedDocs || []).filter((doc) => {
                    const isValidType =
                      doc.documentType === "PI" ||
                      doc.documentType === "SR" ||
                      doc.documentType === "IC" ||
                      doc.documentType === "EN" ||
                      doc.documentType === "PO";
                    const hasValidNumber =
                      doc.documentType === "PO"
                        ? (doc.poNo && doc.poNo.trim() !== "") ||
                          (doc.invoiceNo && doc.invoiceNo.trim() !== "")
                        : doc.piNo && doc.piNo.trim() !== ""
                    return isValidType && hasValidNumber;
                  });

                  const groupRelatedDocuments = (docs: typeof filteredDocs) => {
                    const groups: { poNumber: string; documents: typeof filteredDocs }[] = [];
                    const processedIds = new Set<string>();
                    docs.forEach((doc) => {
                      if (!processedIds.has(doc.id)) {
                        const poNumber = doc.poNo || "";
                        const relatedGroup = docs.filter((d) => {
                          const hasSamePO = d.poNo === poNumber;
                          const isRelatedType =
                            d.documentType === "PI" ||
                            d.documentType === "PO" ||
                            d.documentType === "EN" ||
                            d.documentType === "SR" ||
                            d.documentType === "IC";
                          return hasSamePO && isRelatedType;
                        });
                        relatedGroup.forEach((d) => processedIds.add(d.id));
                        groups.push({
                          poNumber: poNumber,
                          documents: relatedGroup,
                        });
                      }
                    });
                    return groups;
                  };

                  const documentGroups = groupRelatedDocuments(filteredDocs);
                  
                  // Count PVs per group + all documents
                  const pvCountPerGroup = linkedPVs.length > 0 ? documentGroups.length * linkedPVs.length : 0;
                  
                  return linkedDocsCount + pvCountPerGroup;
                })()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "600px" }}>
            {(() => {
              // Load PV data
              let pvData: any[] = [];
              try {
                const saved = localStorage.getItem("pvData");
                pvData = saved ? JSON.parse(saved) : [];
              } catch (e) {
                pvData = [];
              }
              
              // Find PVs created from this PVR
              const linkedPVs = pvData.filter(
                (pv) => pv.pvrNo === selectedForLinkedDocs?.pvrNo
              );

              const linkedDocs =
                selectedForLinkedDocs?.linkedDocs || [];
              const filteredDocs = linkedDocs.filter(
                (doc) => {
                  const isValidType =
                    doc.documentType === "PI" ||
                    doc.documentType === "SR" ||
                    doc.documentType === "IC" ||
                    doc.documentType === "EN" ||
                    doc.documentType === "PO";

                  // For PO, check poNo or invoiceNo; for others, check piNo
                  const hasValidNumber =
                    doc.documentType === "PO"
                      ? (doc.poNo && doc.poNo.trim() !== "") ||
                        (doc.invoiceNo &&
                          doc.invoiceNo.trim() !== "")
                      : doc.piNo && doc.piNo.trim() !== "";

                  return isValidType && hasValidNumber;
                },
              );

              const getDocTypeStyles = (type: string) => {
                switch (type) {
                  case "PI":
                    return {
                      border: "border-blue-200",
                      hover: "hover:bg-blue-50",
                      icon: "text-blue-600",
                      text: "text-blue-700",
                      badge:
                        "bg-blue-100 text-blue-700 border-blue-200",
                    };
                  case "PO":
                    return {
                      border: "border-indigo-200",
                      hover: "hover:bg-indigo-50",
                      icon: "text-indigo-600",
                      text: "text-indigo-700",
                      badge:
                        "bg-indigo-100 text-indigo-700 border-indigo-200",
                    };
                  case "IC":
                    return {
                      border: "border-amber-200",
                      hover: "hover:bg-amber-50",
                      icon: "text-amber-600",
                      text: "text-amber-700",
                      badge:
                        "bg-amber-100 text-amber-700 border-amber-200",
                    };
                  case "SR":
                    return {
                      border: "border-green-200",
                      hover: "hover:bg-green-50",
                      icon: "text-green-600",
                      text: "text-green-700",
                      badge:
                        "bg-green-100 text-green-700 border-green-200",
                    };
                  case "EN":
                    return {
                      border: "border-rose-200",
                      hover: "hover:bg-rose-50",
                      icon: "text-rose-600",
                      text: "text-rose-700",
                      badge:
                        "bg-rose-100 text-rose-700 border-rose-200",
                    };
                  default:
                    return {
                      border: "border-gray-200",
                      hover: "hover:bg-gray-50",
                      icon: "text-gray-600",
                      text: "text-gray-700",
                      badge:
                        "bg-gray-100 text-gray-700 border-gray-200",
                    };
                }
              };

              // Function to group related documents by Purchase Order
              const groupRelatedDocuments = (
                docs: typeof linkedDocs,
              ) => {
                const groups: {
                  poNumber: string;
                  documents: typeof linkedDocs;
                }[] = [];
                const processedIds = new Set<string>();

                docs.forEach((doc) => {
                  if (!processedIds.has(doc.id)) {
                    const poNumber = doc.poNo || "";
                    
                    // Find all related documents (PI, PO, EN with same PO number)
                    const relatedGroup = docs.filter((d) => {
                      const hasSamePO = d.poNo === poNumber;
                      const isRelatedType =
                        d.documentType === "PI" ||
                        d.documentType === "PO" ||
                        d.documentType === "EN" ||
                        d.documentType === "SR" ||
                        d.documentType === "IC";
                      return hasSamePO && isRelatedType;
                    });

                    relatedGroup.forEach((d) =>
                      processedIds.add(d.id),
                    );
                    
                    groups.push({
                      poNumber: poNumber,
                      documents: relatedGroup,
                    });
                  }
                });

                return groups;
              };

              const documentGroups = groupRelatedDocuments(filteredDocs);
              const hasContent = documentGroups.length > 0 || linkedPVs.length > 0;

              return hasContent ? (
                <>
                  {/* Linked Documents Section */}
                  {documentGroups.length > 0 && (
                    <>
                      {documentGroups.map((group, groupIndex) => {
                        // Get PO display name
                        const poDisplayName = (() => {
                          const relatedPO = mockPurchaseOrder.find(
                            (po) => po.poId === group.poNumber,
                          );
                          return (
                            relatedPO?.purchaseOrderNo ||
                            group.poNumber ||
                            "N/A"
                          );
                        })();

                        // Count PIs in this group
                        const piCount = group.documents.filter(
                          (d) => d.documentType === "PI",
                        ).length;
                        const hasMultiplePIs = piCount > 1;

                        return (
                          <div
                            key={`group-${groupIndex}`}
                            className="border-2 border-blue-300 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white"
                          >
                            {/* Group Content */}
                            <div className="space-y-2">
                              {/* Created Payment Vouchers - Inside Group */}
                              {linkedPVs.length > 0 && (
                                <>
                                  {linkedPVs.map((pv, pvIndex) => (
                                    <div
                                      key={`pv-${pvIndex}`}
                                      className="w-full p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-purple-50"
                                      onClick={() => {
                                        setShowLinkedDocsDialog(false);
                                        // Navigate to PV page
                                        const pvNumber = pv.pvNo || pv.id;
                                        onNavigateToPV?.(pvNumber);
                                      }}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                          <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-purple-700 font-semibold text-sm">
                                              {pv.pvNo || pv.id}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              Payment Voucher Request
                                            </p>
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                                          PVR
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}

                              {/* Linked Documents */}
                              {group.documents.map((doc, docIndex) => {
                                const docType = doc.documentType || "PI";
                                const styles = getDocTypeStyles(docType);
                                const badgeLabel =
                                  docType === "EN" ? "AP" : docType;

                                return (
                                  <div
                                    key={doc.id}
                                    className={`w-full p-4 bg-white border ${styles.border} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${styles.hover}`}
                                    onClick={() => {
                                      setShowLinkedDocsDialog(false);
                                      if (docType === "PI") {
                                        onNavigateToPurchaseInvoice?.(
                                          doc.piNo,
                                        );
                                      } else if (docType === "PO") {
                                        onNavigateToPurchaseOrder?.(
                                          doc.poNo,
                                        );
                                      } else if (docType === "EN") {
                                        onNavigateToAPNote?.(doc.piNo);
                                      } else if (docType === "IC") {
                                        onNavigateToImportCost?.(
                                          doc.piNo,
                                        );
                                      } else if (docType === "SR") {
                                        onNavigateToShipmentRequest?.(
                                          doc.piNo,
                                        );
                                      }
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3 flex-1">
                                        <FileText
                                          className={`w-5 h-5 ${styles.icon} mt-0.5 flex-shrink-0`}
                                        />
                                        <div className="flex-1">
                                          <p
                                            className={`${styles.text} font-semibold text-sm`}
                                          >
                                            {docType === "PO"
                                              ? (() => {
                                                  if (
                                                    doc.invoiceNo
                                                  ) {
                                                    return doc.invoiceNo;
                                                  }
                                                  const relatedPO =
                                                    mockPurchaseOrder.find(
                                                      (po) =>
                                                        po.poId ===
                                                        doc.poNo,
                                                    );
                                                  return (
                                                    relatedPO?.purchaseOrderNo ||
                                                    doc.poNo ||
                                                    ""
                                                  );
                                                })()
                                              : doc.piNo}
                                          </p>
                                          <p className="text-xs text-gray-600 mt-0.5">
                                            {getDocumentTypeLabel(
                                              docType,
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={styles.badge}
                                      >
                                        {badgeLabel}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No linked documents or payment vouchers</p>
                </div>
              );
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

      {/* Edit Discount Dialog */}
      <Dialog
        open={showEditDocumentDialog}
        onOpenChange={setShowEditDocumentDialog}
      >
        <DialogContent className="sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>
              Edit Discount {getDocumentNumber(editingDocument)}
            </DialogTitle>
            
          </DialogHeader>

          {/* Saved Notification */}
          {showSavedNotification && savedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 mx-4 flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {savedChanges}
              </span>
            </motion.div>
          )}

          {/* Payment Details Section */}
          <div className="max-h-[500px] overflow-y-auto space-y-3 py-2">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Discount Details
                </h3>
              </div>
              <div className="space-y-3">
               
      

                {/* Debit Note / Credit Note Buttons */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    Note Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const itemTotal =
                        editingDocument?.totalAmount || 0;
                      const totalPaid =
                        parseFloat(
                          (amountPaid[0]?.amount || "")
                            .replace(/\./g, "")
                            .replace(/,/g, "."),
                        ) || 0;
                      const balance = itemTotal - totalPaid;
                      const isDebitNoteApplicable = balance > 0; // Unpaid (underbayar)
                      const isCreditNoteApplicable =
                        balance < 0; // Overpaid (overbayar)

                      return (
                        <>
                          <button
                            onClick={() => {
                              setActiveNoteType("debit");
                              const balanceAmount =
                                (parseFloat(
                                  (amountPaid[0]?.amount || "")
                                    .replace(/\./g, "")
                                    .replace(/,/g, "."),
                                ) || 0) -
                                (editingDocument?.totalAmount ||
                                  0);
                              setNoteValue(
                                formatNumber(
                                  Math.abs(balanceAmount),
                                ),
                              );
                            }}
                            disabled={isCreditNoteApplicable}
                            className={`group relative px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                              isCreditNoteApplicable
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : activeNoteType === "debit"
                                  ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-200"
                                  : "text-gray-700 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Debit Note</span>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setActiveNoteType("credit");
                              const balanceAmount =
                                (editingDocument?.totalAmount ||
                                  0) -
                                (parseFloat(
                                  (amountPaid[0]?.amount || "")
                                    .replace(/\./g, "")
                                    .replace(/,/g, "."),
                                ) || 0);
                              setNoteValue(
                                formatNumber(balanceAmount),
                              );
                            }}
                            disabled={isDebitNoteApplicable}
                            className={`group relative px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                              isDebitNoteApplicable
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : activeNoteType === "credit"
                                  ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-200"
                                  : "text-gray-700 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Credit Note</span>
                            </div>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div> 

                {/* Debit Note / Credit Note Details */}
                <div
                  className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">
                        Discount Details #1
                      </h4>
                      <p className="text-xs text-gray-600">
                        Masukkan jumlah Discount untuk dokumen ini
                      </p>
                    </div>
                  </div>

                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "200px 1fr" }}
                  >
                    <label className="text-xs font-medium text-gray-700">
                      Discount Amount
                      {(() => {
                        const mainAmount =
                          activeNoteType && noteValue
                            ? parseFloat(
                                noteValue
                                  .replace(/\./g, "")
                                  .replace(/,/g, "."),
                              ) || 0
                            : 0;
                        const additionalAmount = (
                          noteDetailsPerDoc[
                            editingDocument?.id
                          ] || []
                        ).reduce((sum, detail) => {
                          const amount = detail.noteValue
                            ? parseFloat(
                                detail.noteValue
                                  .replace(/\./g, "")
                                  .replace(/,/g, "."),
                              ) || 0
                            : 0;
                          return sum + amount;
                        }, 0);
                        const totalAmount =
                          mainAmount + additionalAmount;
                        const noteCount =
                          (
                            noteDetailsPerDoc[
                              editingDocument?.id
                            ] || []
                          ).length + (activeNoteType ? 1 : 0);

                        return null;
                      })()}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm">
                        {editingDocument?.currency || "-"}
                      </span>
                      <input
                        type="text"
                        placeholder="0,00"
                        value={formatNumber(
                          parseFloat(
                            noteValue
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

                          // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                          const formatted =
                            formatNumber(newValue);
                          const integerPart =
                            formatted.split(",")[0];
                          if (integerPart.length > 13) {
                            return; // Don't update if it exceeds max length
                          }

                          setNoteValue(formatted);

                          // setelah update, set caret kembali ke sebelum koma
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
                        className="w-full pl-10 pr-3 py-1.5 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <label className="text-xs font-medium text-gray-700">
                      Account Code / Account Name
                    </label>
                    <div className="flex gap-4 w-full">
                      <div className="w-1/2">
                        <Select
                          value={
                            accountCodeSearchTerms[0] || ""
                          }
                          onValueChange={(value: string) =>
                            setAccountCodeSearchTerms({
                              ...accountCodeSearchTerms,
                              [0]: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account code...">
                              {accountCodeSearchTerms[0] ||
                                "Select account code..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                            {/* Search box di dalam dropdown */}
                            <div className="px-3 py-2 border-b border-gray-300 bg-white">
                              <input
                                type="text"
                                placeholder="Search account code or name..."
                                value={
                                  accountCodeSearchTerms[0] ||
                                  ""
                                }
                                onChange={(e) =>
                                  setAccountCodeSearchTerms({
                                    ...accountCodeSearchTerms,
                                    [0]: e.target.value,
                                  })
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
                                        accountCodeSearchTerms[0] ||
                                        ""
                                      ).toLowerCase(),
                                    ) ||
                                  opt.name
                                    .toLowerCase()
                                    .includes(
                                      (
                                        accountCodeSearchTerms[0] ||
                                        ""
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
                      </div>

                      <div className="w-1/2">
                        <Input
                          value={
                            accountOptions.find(
                              (opt) =>
                                opt.code ===
                                accountCodeSearchTerms[0],
                            )?.name || ""
                          }
                          readOnly
                          placeholder="Account Name"
                          className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <label className="text-xs font-medium text-gray-700">
                      Dept Code / Dept Name
                    </label>
                    <div className="flex gap-4 w-full">
                      <div className="w-1/2">
                        <Select
                          value={
                            departmentCodeSearchTerms[0] || ""
                          }
                          onValueChange={(value: string) =>
                            setDepartmentCodeSearchTerms({
                              ...departmentCodeSearchTerms,
                              [0]: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select dept code...">
                              {departmentCodeSearchTerms[0] ||
                                "Select dept code..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            className="w-[1000px] p-0 border border-gray-300 rounded-md overflow-hidden"
                            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
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
                                placeholder="Search dept code or name..."
                                value={
                                  departmentCodeSearchTerms[0] ||
                                  ""
                                }
                                onChange={(e) =>
                                  setDepartmentCodeSearchTerms({
                                    ...departmentCodeSearchTerms,
                                    [0]: e.target.value,
                                  })
                                }
                                onMouseDownCapture={(e) =>
                                  e.stopPropagation()
                                }
                                onKeyDownCapture={(e) =>
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
                                        departmentCodeSearchTerms[0] ||
                                        ""
                                      ).toLowerCase(),
                                    ) ||
                                  opt.name
                                    .toLowerCase()
                                    .includes(
                                      (
                                        departmentCodeSearchTerms[0] ||
                                        ""
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
                      </div>

                      <div className="w-1/2">
                        <Input
                          value={
                            departmentOptions.find(
                              (opt) =>
                                opt.code ===
                                departmentCodeSearchTerms[0],
                            )?.name || ""
                          }
                          readOnly
                          placeholder="Dept Name"
                          className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <label className="text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter description..."
                      rows={3}
                      className="col-span-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Additional Debit/Credit Note Details */}
                {(
                  noteDetailsPerDoc[editingDocument?.id] || []
                ).map((detail, index) => (
                  <motion.div
                    key={detail.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-900">
                        Discount Detail #{index + 2}
                      </h4>
                      <button
                        onClick={() => {
                          const docId = editingDocument?.id;
                          setNoteDetailsPerDoc({
                            ...noteDetailsPerDoc,
                            [docId]: (
                              noteDetailsPerDoc[docId] || []
                            ).filter((d) => d.id !== detail.id),
                          });
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: "200px 1fr",
                      }}
                    >
                      <label className="text-xs font-medium text-gray-700">
                        Discount Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm">
                          {editingDocument?.currency || "-"}
                        </span>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={formatNumber(
                            parseFloat(
                              detail.noteValue
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
                            const docId = editingDocument?.id;
                            setNoteDetailsPerDoc({
                              ...noteDetailsPerDoc,
                              [docId]: (
                                noteDetailsPerDoc[docId] || []
                              ).map((d) =>
                                d.id === detail.id
                                  ? {
                                      ...d,
                                      noteValue: formatted,
                                    }
                                  : d,
                              ),
                            });
                            const commaIndex =
                              formatted.indexOf(",");
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
                          className="w-full pl-10 pr-3 py-1.5 text-sm border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Account Code / Account Name
                      </label>
                      <div className="flex gap-4 w-full">
                        <div className="w-1/2">
                          <Select
                            value={detail.accountCode}
                            onValueChange={(value: string) => {
                              const docId = editingDocument?.id;
                              setNoteDetailsPerDoc({
                                ...noteDetailsPerDoc,
                                [docId]: (
                                  noteDetailsPerDoc[docId] || []
                                ).map((d) =>
                                  d.id === detail.id
                                    ? {
                                        ...d,
                                        accountCode: value,
                                      }
                                    : d,
                                ),
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select account code...">
                                {detail.accountCode ||
                                  "Select account code..."}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {accountOptions.map((opt) => (
                                <SelectItem
                                  key={opt.code}
                                  value={opt.code}
                                >
                                  <div className="flex gap-2">
                                    <span>{opt.code}</span>
                                    <span className="text-gray-500">
                                      {opt.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/2">
                          <Input
                            value={
                              accountOptions.find(
                                (opt) =>
                                  opt.code ===
                                  detail.accountCode,
                              )?.name || ""
                            }
                            readOnly
                            placeholder="Account Name"
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Dept Code / Dept Name
                      </label>
                      <div className="flex gap-4 w-full">
                        <div className="w-1/2">
                          <Select
                            value={detail.departmentCode}
                            onValueChange={(value: string) => {
                              const docId = editingDocument?.id;
                              setNoteDetailsPerDoc({
                                ...noteDetailsPerDoc,
                                [docId]: (
                                  noteDetailsPerDoc[docId] || []
                                ).map((d) =>
                                  d.id === detail.id
                                    ? {
                                        ...d,
                                        departmentCode: value,
                                      }
                                    : d,
                                ),
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select dept code...">
                                {detail.departmentCode ||
                                  "Select dept code..."}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {departmentOptions.map((opt) => (
                                <SelectItem
                                  key={opt.code}
                                  value={opt.code}
                                >
                                  <div className="flex gap-2">
                                    <span>{opt.code}</span>
                                    <span className="text-gray-500">
                                      {opt.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/2">
                          <Input
                            value={
                              departmentOptions.find(
                                (opt) =>
                                  opt.code ===
                                  detail.departmentCode,
                              )?.name || ""
                            }
                            readOnly
                            placeholder="Dept Name"
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <label className="text-xs font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description..."
                        rows={2}
                        value={detail.description}
                        onChange={(e) => {
                          const docId = editingDocument?.id;
                          setNoteDetailsPerDoc({
                            ...noteDetailsPerDoc,
                            [docId]: (
                              noteDetailsPerDoc[docId] || []
                            ).map((d) =>
                              d.id === detail.id
                                ? {
                                    ...d,
                                    description: e.target.value,
                                  }
                                : d,
                            ),
                          });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Button to Add New Discount Card */}
                <button
                  onClick={() => {
                    const newDetail = {
                      id: `note-${Date.now()}`,
                      noteType: "debit",
                      noteValue: "",
                      accountCode: "",
                      departmentCode: "",
                      description: "",
                    };
                    const docId = editingDocument?.id;
                    setNoteDetailsPerDoc({
                      ...noteDetailsPerDoc,
                      [docId]: [
                        ...(noteDetailsPerDoc[docId] || []),
                        newDetail,
                      ],
                    });
                  }}
                  className="w-full px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Discount Card
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
            >
              
              

              {/* INPUT Discount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Total Discount
                </label>
                <input
                  type="text"
                  value={(() => {
                    const mainAmount =
                      noteValue
                        ? parseFloat(
                            noteValue
                              .replace(/\./g, "")
                              .replace(/,/g, "."),
                          ) || 0
                        : 0;
                    const additionalAmount = (
                      noteDetailsPerDoc[
                        editingDocument?.id
                      ] || []
                    ).reduce((sum, detail) => {
                      const amount = detail.noteValue
                        ? parseFloat(
                            detail.noteValue
                              .replace(/\./g, "")
                              .replace(/,/g, "."),
                          ) || 0
                        : 0;
                      return sum + amount;
                    }, 0);
                    const totalAmount =
                      mainAmount + additionalAmount;
                    
                    return totalAmount > 0 ? formatNumber(totalAmount) : "-";
                  })()}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

            
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Remove empty note details before closing
                const docId = editingDocument?.id;
                if (docId && noteDetailsPerDoc[docId]) {
                  const filteredDetails = (
                    noteDetailsPerDoc[docId] || []
                  ).filter((d) => {
                    const hasNoteValue =
                      d.noteValue &&
                      parseFloat(
                        d.noteValue
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      ) !== 0;
                    const hasAccountCode =
                      d.accountCode &&
                      d.accountCode.trim() !== "";
                    const hasDeptCode =
                      d.departmentCode &&
                      d.departmentCode.trim() !== "";
                    const hasDescription =
                      d.description &&
                      d.description.trim() !== "";
                    return (
                      hasNoteValue ||
                      hasAccountCode ||
                      hasDeptCode ||
                      hasDescription
                    );
                  });
                  setNoteDetailsPerDoc({
                    ...noteDetailsPerDoc,
                    [docId]: filteredDetails,
                  });
                }
                setShowEditDocumentDialog(false);
                setAmountPaid([
                  {
                    id: Date.now().toString(),
                    amount: formatNumber(
                      mockpurchaseInvoice[0]?.totalAmount || 0,
                    ),
                  },
                ]);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                // Remove empty note details before saving
                const docId = editingDocument?.id;
                if (docId && noteDetailsPerDoc[docId]) {
                  const filteredDetails = (
                    noteDetailsPerDoc[docId] || []
                  ).filter((d) => {
                    const hasNoteValue =
                      d.noteValue &&
                      parseFloat(
                        d.noteValue
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      ) !== 0;
                    const hasAccountCode =
                      d.accountCode &&
                      d.accountCode.trim() !== "";
                    const hasDeptCode =
                      d.departmentCode &&
                      d.departmentCode.trim() !== "";
                    const hasDescription =
                      d.description &&
                      d.description.trim() !== "";
                    return (
                      hasNoteValue ||
                      hasAccountCode ||
                      hasDeptCode ||
                      hasDescription
                    );
                  });
                  setNoteDetailsPerDoc({
                    ...noteDetailsPerDoc,
                    [docId]: filteredDetails,
                  });
                }

                // Calculate balance
                const totalPaid = amountPaid.reduce(
                  (sum, entry) => {
                    const parsed = parseFloat(
                      entry.amount
                        .replace(/\./g, "")
                        .replace(/,/g, "."),
                    ) || 0;
                    return sum + parsed;
                  },
                  0,
                );
                const debitBalance =
                  totalPaid - (editingDocument?.totalAmount || 0);
                const creditBalance =
                  (editingDocument?.totalAmount || 0) - totalPaid;
                const balance =
                  activeNoteType === "debit"
                    ? debitBalance
                    : creditBalance;

                // Calculate total of all discount amounts (main + additional details)
                const mainNoteAmount =
                  noteValue
                    ? parseFloat(
                        noteValue
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      ) || 0
                    : 0;

                const additionalNotesAmount = (
                  noteDetailsPerDoc[editingDocument?.id] || []
                ).reduce((sum, detail) => {
                  const amount = detail.noteValue
                    ? parseFloat(
                        detail.noteValue
                          .replace(/\./g, "")
                          .replace(/,/g, "."),
                      ) || 0
                    : 0;
                  return sum + amount;
                }, 0);

                const totalNoteAmount =
                  mainNoteAmount + additionalNotesAmount;

                // Calculate remaining balance - operation depends on note type
                let finalBalance;
                if (activeNoteType === "debit") {
                  // For debit notes, subtract from balance (paying down the underpayment)
                  finalBalance = balance - totalNoteAmount;
                } else {
                  // For credit notes, add to balance (reducing the overpayment)
                  finalBalance = balance + totalNoteAmount;
                }

                // If remaining balance is close to 0, set to 0
                if (Math.abs(finalBalance) < 0.01) {
                  finalBalance = 0;
                }

                setCalculatedBalance(finalBalance);

                // Calculate total discount
                const totalDiscount =
                  mainNoteAmount + additionalNotesAmount;

                // Always save to localStorage with document-specific key
                const docStorageKey = `pvr_edit_doc_${editingDocument?.id}`;
                const dataToSave = {
                  amountPaid: amountPaid.map((item) => ({
                    ...item,
                    amount: item.amount, // Already formatted
                  })),
                  activeNoteType: activeNoteType,
                  noteValue: noteValue,
                  accountCodeSearchTerms:
                    accountCodeSearchTerms,
                  departmentCodeSearchTerms:
                    departmentCodeSearchTerms,
                  noteDetailsPerDoc:
                    noteDetailsPerDoc[editingDocument?.id] ||
                    [],
                  discount: totalDiscount, // Already formatted
                  savedAt: new Date().toISOString(),
                };
                localStorage.setItem(
                  docStorageKey,
                  JSON.stringify(dataToSave),
                );

                // Trigger table refresh to show updated data
                setTableRefreshTrigger((prev) => prev + 1);

            
                // Auto-close dialog immediately
                setShowEditDocumentDialog(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Submit Summary Dialog */}
      <Dialog
        open={showSubmitSummaryDialog}
        onOpenChange={setShowSubmitSummaryDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Submission Summary
            </DialogTitle>
            <DialogDescription>
              Review the details before submitting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Submission Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-blue-900">
                Submission Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Submit To
                  </div>
                  <div className="text-sm font-semibold text-blue-900">
                    {submitTo}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    PIC Name
                  </div>
                  <div className="text-sm font-semibold text-blue-900">
                    {picName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Submit Date
                  </div>
                  <div className="text-sm font-semibold text-blue-900">
                    {submitDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Documents */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Selected Documents ({selectedPVRsForSubmit.length})
              </h3>
              <div className="border border-gray-200 rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {pvrData
                  .filter((pvr) =>
                    selectedPVRsForSubmit.includes(pvr.id),
                  )
                  .map((pvr) => (
                    <div
                      key={pvr.id}
                      className="p-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {pvr.pt}
                            </Badge>
                            <span className="text-sm font-medium text-purple-700">
                              {pvr.pvrNo}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {pvr.supplierName}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {pvr.currency}{" "}
                          {formatNumber(pvr.totalInvoice)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSubmitSummaryDialog(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const updatedData = pvrData.map((pvr) =>
                  selectedPVRsForSubmit.includes(pvr.id)
                    ? { ...pvr, isSubmitted: true }
                    : pvr,
                );
                setPvrData(updatedData);
                setShowSubmitSummaryDialog(false);
                setShowSubmitDialog(false);
                setSelectedPVRsForSubmit([]);
                setSubmitTo("AP");
                setPicName("");
                setSubmitDate("");
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Create New PV Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open: boolean) => {
          setShowCreateDialog(open);
          if (!open) {
            resetForm();
            setLinkedPIs([]);
            setShowSupplierDropdown(false);
            setSupplierSearchTerm("");
          }
        }}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              Create New PV
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new Payment
              Voucher
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
                      setSupplierSearchTerm(e.target.value);
                    }}
                    onClick={() =>
                      setShowSupplierDropdown(true)
                    }
                    onBlur={() =>
                      setShowSupplierDropdown(false)
                    }
                    placeholder="Type to search..."
                  />
                  {showSupplierDropdown &&
                    filteredSuppliers.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredSuppliers.map((supplier: any) => (
                          <button
                            key={supplier.supplierName || supplier.name}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSupplierChange(
                                supplier.supplierName || supplier.name,
                              );
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{supplier.supplierName || supplier.name}</span>
                              {(supplier.category || supplier.supplierCategory) && (
                                <Badge
                                  variant="outline"
                                  className={
                                    (supplier.category || supplier.supplierCategory) ===
                                    "OVERSEAS"
                                      ? "border-purple-200 text-purple-700"
                                      : "border-blue-200 text-blue-700"
                                  }
                                >
                                  {supplier.category || supplier.supplierCategory}
                                </Badge>
                              )}
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
                    onValueChange={(value: any) =>
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
                      // Don't allow typing if cursor is at the rightmost position (end of field)
                      if (
                        e.target.selectionStart ===
                        e.target.value.length
                      ) {
                        return;
                      }

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
                    onValueChange={(value: any) => {
                      setPvrForm({
                        ...pvrForm,
                        pt: value,
                        pvrNo: generatePVRNumber(
                          value,
                          pvrForm.pvrDate,
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
                {/* PV Date */}
                <div className="space-y-2 w-full">
                  <div className="text-xs text-purple-600 mb-1">
                    PV Date{" "}
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
                            // Allow only numbers and slashes
                            const filtered = value.replace(
                              /[^0-9/]/g,
                              "",
                            );
                            // Auto-format as user types
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
                          const today = new Date();
                          const day = String(
                            today.getDate(),
                          ).padStart(2, "0");
                          const month = String(
                            today.getMonth() + 1,
                          ).padStart(2, "0");
                          const year = today.getFullYear();
                          const dateStr = `${year}-${month}-${day}`;
                          const formatted =
                            formatDateToDDMMYYYY(dateStr);
                          setPvrForm({
                            ...pvrForm,
                            pvrDate: formatted,
                            pvrNo: generatePVRNumber(
                              pvrForm.pt,
                              formatted,
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
                              const dateStr = `${year}-${month}-${day}`;
                              const formatted =
                                formatDateToDDMMYYYY(dateStr);
                              setPvrForm({
                                ...pvrForm,
                                pvrDate: formatted,
                                pvrNo: generatePVRNumber(
                                  pvrForm.pt,
                                  formatted,
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
                    onValueChange={(value: any) =>
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
                    Add PVR

                  </Button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 sticky top-0 z-10">
                      <tr className="h-12">
                         <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "25%", minWidth: "220px" }}
                        >
                          PVR No
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "15%", minWidth: "150px" }}
                        >
                          Doc Type
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "25%", minWidth: "250px" }}
                        >
                          Doc No
                        </th>
                   
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Item Total
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Amount Paid
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "100px" }}
                        >
                          Discount
                        </th>
                        <th
                          className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "120px" }}
                        >
                          Outstanding
                        </th>
                        <th
                          className="text-purple-900 text-xs text-center px-4 py-2 font-medium border-b"
                          style={{ width: "9%", minWidth: "80px" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const addDays = (
                          dateStr: string,
                          days: number,
                        ) => {
                          const parts = dateStr.split("/");
                          const isoDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                          const date = new Date(isoDateStr);
                          date.setDate(date.getDate() + days);
                          return formatDateToDDMMYYYY(
                            date.toISOString().split("T")[0],
                          );
                        };

                        return linkedPIs.length > 0 ? (
                          linkedPIs.map((pi) => {
                            const docType =
                              pi.documentType || "PI";
                            const getDocTypeLabel = (
                              type: string,
                            ) => {
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
                                  {pi.pvrNo || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {getDocTypeLabel(docType)}
                                </td>
                                <td className="px-4 py-3 text-sm">
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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.amountPaid = [{ id: Date.now().toString(), amount: editingAmountPaidValue }];
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = formatNumber(pi.totalAmount);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              currentValue = parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        setEditingAmountPaidId(pi.id);
                                        setEditingAmountPaidValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                              return parsed.amountPaid[0].amount;
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(pi.totalAmount);
                                      })()}
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
                                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                            const savedData = localStorage.getItem(docStorageKey);
                                            const parsedData = savedData ? JSON.parse(savedData) : {};
                                            parsedData.discount = editingDiscountValue;
                                            parsedData.savedAt = new Date().toISOString();
                                            localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                          const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                          const savedData = localStorage.getItem(docStorageKey);
                                          const parsedData = savedData ? JSON.parse(savedData) : {};
                                          parsedData.discount = editingDiscountValue;
                                          parsedData.savedAt = new Date().toISOString();
                                          localStorage.setItem(docStorageKey, JSON.stringify(parsedData));
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
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        let currentValue = '0';
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              currentValue = parsed.discount;
                                            }
                                          } catch {}
                                        }
                                        setEditingDiscountId(pi.id);
                                        setEditingDiscountValue(currentValue);
                                      }}
                                      className="text-sm text-gray-900 hover:text-gray-700 cursor-pointer font-normal flex items-center gap-1"
                                      title="Click to edit"
                                    >
                                      {(() => {
                                        const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                        const savedData = localStorage.getItem(docStorageKey);
                                        if (savedData) {
                                          try {
                                            const parsed = JSON.parse(savedData);
                                            if (parsed.discount) {
                                              return formatNumber(parseFormattedNumber(parsed.discount));
                                            }
                                          } catch {}
                                        }
                                        return formatNumber(0);
                                      })()}
                                      <Edit className="w-3 h-3 flex-shrink-0" />
                                    </button>
                                  )}
                                </td>
                                {/* Outstanding CELL - CREATE NEW PV */}
                                <td className="px-4 py-3 text-sm">
                                  {(() => {
                                    const docStorageKey = `pvr_edit_doc_${pi.id}`;
                                    const savedData = localStorage.getItem(docStorageKey);
                                    let itemTotal = pi.totalAmount;
                                    let amountPaid = itemTotal;
                                    
                                    if (savedData) {
                                      try {
                                        const parsed = JSON.parse(savedData);
                                        if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                          amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                        }
                                      } catch {}
                                    }
                                    
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
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No payable items
                            </td>
                          </tr>
                        );
                      })()}
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          // Force recalculation by including tableRefreshTrigger
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
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
                          let totalAmountPaid = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;
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
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            let amountPaid = pi.totalAmount;
                            
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.amountPaid && Array.isArray(parsed.amountPaid) && parsed.amountPaid.length > 0) {
                                  amountPaid = parseFormattedNumber(parsed.amountPaid[0].amount);
                                }
                              } catch {}
                            }
                            totalAmountPaid += amountPaid;
                          });
                          
                          let totalDiscount = 0;
                          linkedPIs.forEach((pi) => {
                            const docStorageKey = `pvr_edit_doc_${pi.id}`;
                            const savedData = localStorage.getItem(docStorageKey);
                            if (savedData) {
                              try {
                                const parsed = JSON.parse(savedData);
                                if (parsed.discount) {
                                  totalDiscount += parseFormattedNumber(parsed.discount);
                                }
                              } catch {}
                            }
                          });
                          // Force recalculation by including tableRefreshTrigger
                          void tableRefreshTrigger;
                          const grandTotal = totalAmountPaid - totalDiscount;

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
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePVR}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                  disabled={!pvrForm.supplierName}
                >
                  Save PV
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. PV Already Exists Warning Dialog */}
      <Dialog open={showPVExistsDialog} onOpenChange={setShowPVExistsDialog}>
        <DialogContent style={{ maxWidth: "500px" }} >
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Information
            </DialogTitle>
            <DialogDescription className="py-2 text-gray-700">
              This Payment Voucher Request has already been fully paid.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPVExistsDialog(false)} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}