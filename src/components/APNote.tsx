  import { useState, useEffect, useRef } from "react";
  import type { ReactNode } from "react";
  import { createPortal } from "react-dom";
  import { motion, AnimatePresence } from "motion/react";
  import {
    formatDateToDDMMYYYY as formatDate,
    getTodayDDMMYYYY,
    getTodayYYYYMMDD,
    convertYYYYMMDDtoDDMMYYYY,
    convertDDMMYYYYtoYYYYMMDD,
  } from "../utils/dateFormat";
  import { formatNumber } from "../utils/numberFormat";
  import {
    calculateItemTotal,
    calculateTotalFromItems,
    calculateTotalFromDocs,
    calculateCombinedTotal,
    calculateNetTotal,
  } from "../utils/apNoteCalculations";
  import { Card } from "./ui/card";
  import { Button } from "./ui/button";
  import { Badge } from "./ui/badge";
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
    MapPin,
    Zap,
    CreditCard,
    ShoppingCart,
    Plus,
    XCircle,
    Link as LinkIcon,
    ClockIcon,
    Trash2,
    Receipt,
    BarChart3,
    Edit,
    Send,
    Users,
    FileCheck,
    ChevronDown,
    ChevronUp,
    Hash,
    X,
    Circle,
    CheckCircle2,
    Upload,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import ImportCost from "./ImportCost";
import {
  mockLinkedPOs,
  findLinkedPVRs,
  mockpurchaseInvoice,
  mockImportCosts,
  mockShipmentRequest,
} from "../mocks/mockData";
import ShipmentRequest from "./ShipmentRequest";
import type { APNoteDataFromSR } from "./ShipmentRequest";
import type { APNoteDataFromIC } from "./ImportCost";
import { PopoverContent, Popover, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";

// Type definitions
type Division = "AP" | "COSTING" | "ACCOUNTING";

// Mock data for division PICs
const mockDivisionPICs = [
  { id: "1", division: "AP" as Division, name: "SHEFANNY", email: "shefanny@example.com" },
  { id: "2", division: "AP" as Division, name: "CHINTYA", email: "chintya@example.com" },
  { id: "3", division: "COSTING" as Division, name: "DEWI", email: "dewi@example.com" },
  { id: "4", division: "ACCOUNTING" as Division, name: "HELEN", email: "helen@example.com" },
];

// Utility functions
const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.length !== 10) return false;
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  const [day, month, year] = dateString.split("/").map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
};

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

  // Alias for the imported function to match existing usage in this file
  const formatDateToDDMMYYYY = formatDate;

  // Helper function to extract all AP Notes from linked document structure
  const extractAPNotesFromLinkedStructure = () => {
    const allAPNotes: APNoteData[] = [];
    const seenIds = new Set<string>();

    // Get all expense notes from the first PO's allExpenseNotes collection
    // (allExpenseNotes contains ALL expense notes regardless of linkage)
    const firstPO = mockLinkedPOs[0];
    if (
      firstPO?.allExpenseNotes &&
      Array.isArray(firstPO.allExpenseNotes)
    ) {
      firstPO.allExpenseNotes.forEach((note: any) => {
        const noteId = note.apnoteId || note.id;
        if (!seenIds.has(noteId)) {
          // Normalize linkedDocs format: convert old {type, docNo} to {documentType, documentNo, id}
          // Also merge PI/PO pairs into single PI/PO rows
          let normalizedLinkedDocs: LinkedDocument[] = [];
          if (note.linkedDocs && Array.isArray(note.linkedDocs)) {
            const typeMap: {[key: string]: string} = {
              "Purchase Invoice": "PI",
              "Purchase Order": "PO",
              "Import Cost": "IC",
              "Shipment Request": "SR",
            };
            
            const processedIds = new Set<number>();
            
            note.linkedDocs.forEach((doc: any, idx: number) => {
              if (processedIds.has(idx)) return;
              
              const docType = typeMap[doc.type] || doc.type || "";
              
              // Handle PI/PO merging
              if (docType === "PI") {
                // Find corresponding PO in the same linkedDocs array
                const poIndex = note.linkedDocs.findIndex(
                  (d: any, i: number) =>
                    i !== idx && 
                    (typeMap[d.type] === "PO" || d.type === "PO")
                );
                
                if (poIndex !== -1) {
                  // Found PO, create merged PI/PO row
                  const poDoc = note.linkedDocs[poIndex];
                  normalizedLinkedDocs.push({
                    id: doc.id || `ld-${noteId}-${idx}`,
                    documentType: "PI/PO",
                    documentTypeLabel: "Purchase Invoice | Purchase Order",
                    documentNo: doc.docNo || "",
                    documentNoPO: poDoc.docNo || "",
                  });
                  processedIds.add(idx);
                  processedIds.add(poIndex);
                } else {
                  // No PO found, just add PI
                  normalizedLinkedDocs.push({
                    id: doc.id || `ld-${noteId}-${idx}`,
                    documentType: docType,
                    documentTypeLabel: doc.type || "",
                    documentNo: doc.docNo || "",
                  });
                  processedIds.add(idx);
                }
              } else if (docType === "PO") {
                // Find corresponding PI in the same linkedDocs array
                const piIndex = note.linkedDocs.findIndex(
                  (d: any, i: number) =>
                    i !== idx && 
                    (typeMap[d.type] === "PI" || d.type === "PI")
                );
                
                if (piIndex !== -1) {
                  // Found PI, create merged PI/PO row
                  const piDoc = note.linkedDocs[piIndex];
                  normalizedLinkedDocs.push({
                    id: doc.id || `ld-${noteId}-${idx}`,
                    documentType: "PI/PO",
                    documentTypeLabel: "Purchase Invoice | Purchase Order",
                    documentNo: piDoc.docNo || "",
                    documentNoPO: doc.docNo || "",
                  });
                  processedIds.add(idx);
                  processedIds.add(piIndex);
                } else {
                  // No PI found, just add PO
                  normalizedLinkedDocs.push({
                    id: doc.id || `ld-${noteId}-${idx}`,
                    documentType: docType,
                    documentTypeLabel: doc.type || "",
                    documentNo: doc.docNo || "",
                  });
                  processedIds.add(idx);
                }
              } else {
                // Not PI or PO, just add as is
                normalizedLinkedDocs.push({
                  id: doc.id || `ld-${noteId}-${idx}`,
                  documentType: docType,
                  documentTypeLabel: doc.type || "",
                  documentNo: doc.docNo || "",
                });
                processedIds.add(idx);
              }
            });
          }
          
          // Add the note with normalized linkedDocs
          allAPNotes.push({
            ...note,
            linkedDocs: normalizedLinkedDocs,
          });
          seenIds.add(noteId);
        }
      });
    }

    return allAPNotes;
  };

  type SupplierCategory = "OVERSEAS" | "LOCAL";
  type TermType = "URGENT" | "CREDIT" | "ONLINE SHOPPING";
  type PTType =
    | "ALL PT"
    | "WNS"
    | "MJS"
    | "TTP"
    | "GMI"
    | "AMT"
    | "WSI"
    | "IMI";
  type DocType = "AP NOTE" | "AP DISC NOTE";

  interface APNoteData {
    id: string;
    apNoteNo: string;
    apNoteType?: string;
    invoiceNumber: string;
    supplierName: string;
    supplierCategory: SupplierCategory;
    totalInvoice: number;
    docReceiptDate: string;
    apNoteCreateDate: string;
    invoiceDate: string;
    createdBy: string;
    term: TermType;
    currency?: string;
    remarks?: string;
    items?: AccountItem[];
    linkedDocs?: LinkedDocument[];
    pt?: PTType;
    isSubmitted?: boolean;
    docType?: DocType;
    linkedDocumentType?:
      | "PURCHASE_INVOICE"
      | "IMPORT_COST"
      | "SHIPMENT_REQUEST";
    tax?: number;
    pph?: number;
    discount?: number;
  }

  interface AccountItem {
    id: string;
    accountCode: string;
    accountName: string;
    deptDescription: string;
    qty: number;
    unitPrice: number;
    totalAmount: number;
    description: string;
    category?: string;
    department?: string;
    bankCode?: string;
  }

  interface LinkedDocument {
    id: string;
    documentType: string;
    documentTypeLabel?: string;
    documentNo: string;
    documentNoPO?: string;
    itemDate?: string;
    totalAmount?: number;
  }

  interface AuditTrailEntry {
    timestamp: string;
    user: string;
    action: string;
  }

  interface PurchaseInvoiceData {
    id: string;
    noPO: string;
    purchaseInvoiceNo: string;
    supplierName: string;
    warehouse: string;
    grandTotal: number;
    status: string;
    internalRemarks: string;
    referenceNo?: string;
    referenceDate?: string;
    downPayment?: number;
    outstanding?: number;
    submissionStatus?: string;
    submittedTo?: string;
    submissionDate?: string;
    ptCompany?: string;
    picPI?: string;
    docReceivedDate?: string;
    receivedStatus?: string;
    validationStatus?: string;
    history?: Array<{
      id: string;
      timestamp: Date;
      action: string;
      description: string;
      referenceNo?: string;
      reason?: string;
    }>;
  }

  // Mock data for Import Cost - imported from mockData.ts (single source of truth)
  const mockImportCostData = mockImportCosts;

  // Mock data for Shipment Request - imported from mockData.ts (single source of truth)
  const mockShipmentRequestData = mockShipmentRequest;

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

  // Supplier master data
  interface SupplierData {
    name: string;
    category: "OVERSEAS" | "LOCAL";
    availableDocuments?: any[];
  }

  interface SupplierListInfo extends SupplierData {}

  const supplierMasterData: SupplierData[] = [
    {
      name: "PT. Logistik Prima",
      category: "LOCAL",
      availableDocuments: [],
    },
    {
      name: "PT. Bea Cukai Services",
      category: "LOCAL",
      availableDocuments: [],
    },
    {
      name: "PT. Supplier Test",
      category: "LOCAL",
      availableDocuments: [],
    },
    {
      name: "Global Logistics Corp",
      category: "OVERSEAS",
      availableDocuments: [],
    },
    {
      name: "International Shipping Ltd",
      category: "OVERSEAS",
      availableDocuments: [],
    },
];

interface APNoteProps {
  onNavigateToPurchaseInvoice?: (documentNo: string) => void;
  onNavigateToPurchaseOrder?: (documentNo: string) => void;
  onNavigateToImportCost?: (documentNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToShipmentRequest?: (documentNo: string) => void;
  selectedICNo?: string | null;
  selectedAPNoteNo?: string | null;
}

export default function APNote({
  onNavigateToPurchaseInvoice,
  onNavigateToPurchaseOrder,
  onNavigateToImportCost,
  onNavigateToPVR,
  onNavigateToShipmentRequest,
  selectedICNo,
  selectedAPNoteNo,
}: APNoteProps) {
  const [view, setView] = useState<"dashboard" | "work">(
    "work",
  );
  const [activeTab, setActiveTab] = useState<
    "ap-note" | "import-cost" | "shipment-request"
  >("ap-note");
    const [internalSelectedICNo, setInternalSelectedICNo] =
      useState<string | null>(null);

    // Sync selectedICNo with the prop from parent when import cost is selected
    useEffect(() => {
      if (selectedICNo) {
        // Switch to import-cost tab
        setActiveTab("import-cost");
      }
    }, [selectedICNo]);

    // Sync selectedAPNoteNo with the prop from parent when AP Note is selected
    useEffect(() => {
      if (selectedAPNoteNo) {
        // Reset filters to show all items
        setSupplierFilter("all");
        setTermFilter("all");
        setPtFilter("ALL PT");
        setDocTypeFilter("all");
        setSearchTerm("");

        // Switch to AP Note tab first
        setActiveTab("ap-note");

        // Create the mapped ID for the AP Note document
        // Try to find the AP Note by matching piNo or invoiceNumber
        setTimeout(() => {
          // Auto expand the specific AP Note
          const apNoteId = `apn-${selectedAPNoteNo.replace(/\//g, "-")}`;
          setExpandedItems(
            (prev) => new Set([apNoteId, ...Array.from(prev)]),
          );

          // Scroll to the item
          setTimeout(() => {
            const element = document.getElementById(apNoteId);
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 500);
        }, 100);
      }
    }, [selectedAPNoteNo]);

    // Load AP Notes - merged mock data from linked structure
    // Initialize with empty array - will load data in useEffect
    const [apNoteData, setApNoteData] = useState<APNoteData[]>(
      [],
    );
    const [selectedDetail, setSelectedDetail] =
      useState<APNoteData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] =
      useState<APNoteData | null>(null);
    const [editAccountItems, setEditAccountItems] = useState<
      AccountItem[]
    >([]);
    const [editLinkedDocs, setEditLinkedDocs] = useState<
      LinkedDocument[]
    >([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [accountCodeSearchTerms, setAccountCodeSearchTerms] =
      useState<{ [key: number]: string }>({});
    const [
      departmentCodeSearchTerms,
      setDepartmentCodeSearchTerms,
    ] = useState<{ [key: number]: string }>({});
    const [openDeptCodeDropdown, setOpenDeptCodeDropdown] =
      useState<{
        [key: number]: boolean;
      }>({});
    const [openAccountCodeDropdown, setOpenAccountCodeDropdown] =
      useState<{
        [key: number]: boolean;
      }>({});
    const [openDocumentNoDropdown, setOpenDocumentNoDropdown] =
      useState<{
        [key: number]: boolean;
      }>({});
    const [expandedItems, setExpandedItems] = useState<
      Set<string>
    >(new Set());
    const [supplierFilter, setSupplierFilter] = useState("all");
    const [termFilter, setTermFilter] = useState("all");
    const [ptFilter, setPtFilter] = useState("ALL PT");
    const [docTypeFilter, setDocTypeFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<
      SupplierListInfo[]
    >([]);
    const [filteredAPNotes, setFilteredAPNotes] =
      useState<APNoteData[]>(apNoteData);
    const [selectedAPNote, setSelectedAPNote] =
      useState<APNoteData | null>(null);
    const detailsRef = useRef<HTMLDivElement | null>(null);
    const lastAPNoteItemRef = useRef<HTMLTableRowElement | null>(
      null,
    );
    const lastEditAccountItemRef =
      useRef<HTMLTableRowElement | null>(null);
    const [activeFilterType, setActiveFilterType] = useState<
      | "supplier"
      | "term"
      | "pt"
      | "warehouse"
      | "pic"
      | "doctype"
      | null
    >(null);
    const [expandAll, setExpandAll] = useState(false);
    const [activeAccountCodeIdx, setActiveAccountCodeIdx] =
      useState<number | null>(null);
    const [activeDeptCodeIdx, setActiveDeptCodeIdx] = useState<
      number | null
    >(null);
    const [accountCodeDropdownPos, setAccountCodeDropdownPos] =
      useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
      });
    const [deptCodeDropdownPos, setDeptCodeDropdownPos] =
      useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
      });
    const [warehouseFilter, setWarehouseFilter] =
      useState<string>("all");
    const [picPIFilter, setPicPIFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] =
      useState(false);
    const [activeCreateTabItems, setActiveCreateTabItems] =
      useState<"items" | "links">("items");
    const [showSuccessDialog, setShowSuccessDialog] =
      useState(false);
    const [savedApNoteNo, setSavedApNoteNo] = useState("");
    const [savedDocType, setSavedDocType] =
      useState<DocType>("AP NOTE");
    const [savedApNoteId, setSavedApNoteId] = useState("");
    const [savedLinkedDocs, setSavedLinkedDocs] = useState<
      LinkedDocument[]
    >([]);
    const [isSupplierSelected, setIsSupplierSelected] =
      useState(false);
    const [showNoLinkedDocsWarning, setShowNoLinkedDocsWarning] =
      useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [selectedForVoid, setSelectedForVoid] =
      useState<APNoteData | null>(null);
    const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
      useState(false);
    const [selectedForLinkedDocs, setSelectedForLinkedDocs] =
      useState<APNoteData | null>(null);
    const [selectedPIC, setSelectedPIC] = useState<{
      name: string;
      value: number;
    } | null>(null);
    const [showSubmitDialog, setShowSubmitDialog] =
      useState(false);
    const [selectedDocsForSubmit, setSelectedDocsForSubmit] =
      useState<string[]>([]);
    const [isMarkingSubmitted, setIsMarkingSubmitted] =
      useState(false);
    const [submitForm, setSubmitForm] = useState({
      docType: "CREDIT" as TermType,
      submitTo: "AP",
      picName: "",
      submitDate: getTodayYYYYMMDD(),
    });
    const [submittedTo, setSubmittedTo] = useState<Division>("AP");
    const [picName, setPicName] = useState("");
    const [submissionDate, setSubmissionDate] = useState(getCurrentDate());

    // Calendar Filter Dialog States
    const [showCalendarDialog, setShowCalendarDialog] =
      useState(false);
    const [calendarDateFrom, setCalendarDateFrom] = useState("");
    const [calendarDateTo, setCalendarDateTo] = useState("");
    const [calendarUseTodayDate, setCalendarUseTodayDate] =
      useState(false);
    const [calendarFilterType, setCalendarFilterType] = useState<
      "apNoteDate" | "docReceivedDate"
    >("apNoteDate");

    // Store audit trails per AP Note
    const [apNoteAuditTrails, setApNoteAuditTrails] = useState<{
      [key: string]: AuditTrailEntry[];
    }>({});

    // ✅ LOAD DATA ON MOUNT - Primary effect untuk inisialisasi data dengan merge logic
    useEffect(() => {
      const loadAPNotes = () => {
        // Get AP Notes from linked document structure (always get fresh mock)
        const linkedAPNotes = extractAPNotesFromLinkedStructure();

        // Primary: Try to get from localStorage (user modifications)
        // ⚠️ IMPORTANT: Only use localStorage if it contains VALID data (length > 0)
        const stored = localStorage.getItem("apNote_data");
        let allAPNotes: APNoteData[] = [];

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
                "APNote data loaded from localStorage (apNote_data):",
                parsed.length,
                "records",
              );
              allAPNotes = parsed;
            } else {
              console.warn(
                "localStorage (apNote_data) is empty or invalid, loading from other sources",
              );
            }
          } catch (e) {
            console.error("Failed to parse apNote_data:", e);
          }
        }

        // Load from createdAPNotes (created from POCollapsible)
        const createdNotes =
          localStorage.getItem("createdAPNotes");
        if (createdNotes) {
          try {
            const parsed = JSON.parse(createdNotes);
            if (
              parsed &&
              Array.isArray(parsed) &&
              parsed.length > 0
            ) {
              console.log(
                "AP Notes loaded from createdAPNotes:",
                parsed.length,
                "records",
              );
              // Merge with existing data, avoiding duplicates
              const existingIds = new Set(
                allAPNotes.map((item: APNoteData) => item.id),
              );
              const newNotes = parsed.filter(
                (item: APNoteData) => !existingIds.has(item.id),
              );
              allAPNotes = [...allAPNotes, ...newNotes];
            }
          } catch (e) {
            console.error("Failed to parse createdAPNotes:", e);
          }
        }

        // Merge with linked mock data, avoiding duplicates
        if (allAPNotes.length > 0) {
          const existingIds = new Set(
            allAPNotes.map((item: APNoteData) => item.id),
          );
          const uniqueLinkedData = linkedAPNotes.filter(
            (item) => !existingIds.has(item.id),
          );
          console.log(
            "Merged APNote data:",
            allAPNotes.length + uniqueLinkedData.length,
            "records (stored + created + unique mock)",
          );
          allAPNotes = [...allAPNotes, ...uniqueLinkedData];
        } else if (linkedAPNotes && linkedAPNotes.length > 0) {
          // Use linked AP Notes if no localStorage data
          console.log(
            "APNote data loaded from mock structure:",
            linkedAPNotes.length,
            "records",
          );
          allAPNotes = linkedAPNotes;
        } else {
          // Final fallback: Empty array (no data available)
          console.warn(
            "⚠️ No AP note data found in localStorage or centralized structure",
          );
          allAPNotes = [];
        }

        return allAPNotes;
      };

      // Load data when component mounts
      const initialData = loadAPNotes();
      setApNoteData(initialData);
    }, []); // Empty dependency - only run once on mount

    // ✅ Listen for apNoteCreated events from POCollapsible
    useEffect(() => {
      const handleAPNoteCreated = (event: Event) => {
        const customEvent = event as CustomEvent;
        const newAPNote = customEvent.detail;

        console.log(
          "=== APNote: Received apNoteCreated event ===",
        );
        console.log("New AP Note:", newAPNote);

        // Add the newly created note to the apNoteData state
        setApNoteData((prev) => {
          // Check if note already exists (by ID)
          const exists = prev.some(
            (item) => item.id === newAPNote.id,
          );
          if (exists) {
            console.log(
              "AP Note already exists in state, skipping duplicate",
            );
            return prev;
          }

          // Add the new note to the beginning of the list
          const updated = [newAPNote, ...prev];
          console.log(
            "Updated apNoteData with new note. Total:",
            updated.length,
          );
          return updated;
        });

        // Auto expand the newly created item
        const expandableId = `apn-${newAPNote.apNoteNo.replace(
          /\//g,
          "-",
        )}`;
        setExpandedItems(
          (prev) => new Set([expandableId, ...Array.from(prev)]),
        );

        console.log("AP Note added to display and expanded");
      };

      // Register the event listener
      window.addEventListener(
        "apNoteCreated",
        handleAPNoteCreated as EventListener,
      );

      // Cleanup
      return () => {
        window.removeEventListener(
          "apNoteCreated",
          handleAPNoteCreated as EventListener,
        );
      };
    }, []);

    // ✅ DEBUG: Function to clear localStorage and reload
    // Call this from console: window.clearAPNoteData()
    useEffect(() => {
      (window as any).clearAPNoteData = () => {
        console.log("🧹 Clearing APNote localStorage...");
        localStorage.removeItem("apNote_data");
        console.log("✅ localStorage cleared - reloading...");
        window.location.reload();
      };
    }, []);

    // Function to handle AP Note created from ShipmentRequest
    const handleAPNoteFromSR = (newAPNote: APNoteDataFromSR) => {
      console.log("=== handleAPNoteFromSR CALLED ===");
      console.log(
        "Adding AP Note to list:",
        newAPNote.id,
        newAPNote.apNoteNo,
      );
      console.log("Full AP Note data:", newAPNote);
      setApNoteData((prev) => {
        console.log("Previous apNoteData length:", prev.length);
        const updated = [newAPNote as APNoteData, ...prev];
        console.log("Updated apNoteData length:", updated.length);
        return updated;
      });

      // Add audit trail
      setApNoteAuditTrails((prev) => ({
        ...prev,
        [newAPNote.id]: [
          {
            timestamp: new Date().toLocaleString(),
            user: "SHEFANNY",
            action: `Created ${newAPNote.docType} from Shipment Request`,
          },
        ],
      }));

      // Auto expand the newly created item using the mapped ID
      const expandableId = `apn-${newAPNote.apNoteNo.replace(/\//g, "-")}`;
      setExpandedItems(
        (prev) => new Set([expandableId, ...Array.from(prev)]),
      );

      // DON'T switch to AP Note tab - stay on Shipment Request tab
      // setActiveTab("ap-note");
    };

    const handleAPNoteFromIC = (newAPNote: APNoteDataFromIC) => {
      console.log("=== handleAPNoteFromIC CALLED ===");
      console.log(
        "Adding AP Note to list:",
        newAPNote.id,
        newAPNote.apNoteNo,
      );
      console.log("Full AP Note data:", newAPNote);
      setApNoteData((prev) => {
        console.log("Previous apNoteData length:", prev.length);
        const updated = [newAPNote as APNoteData, ...prev];
        console.log("Updated apNoteData length:", updated.length);
        return updated;
      });

      // Add audit trail
      setApNoteAuditTrails((prev) => ({
        ...prev,
        [newAPNote.id]: [
          {
            timestamp: new Date().toLocaleString(),
            user: "SHEFANNY",
            action: `Created ${newAPNote.docType} from Import Cost`,
          },
        ],
      }));

      // Auto expand the newly created item using the mapped ID
      const expandableId = `apn-${newAPNote.apNoteNo.replace(/\//g, "-")}`;
      setExpandedItems(
        (prev) => new Set([expandableId, ...Array.from(prev)]),
      );

      // DON'T switch to AP Note tab - stay on Import Cost tab
      // setActiveTab("ap-note");
    };

    // Save AP Notes to localStorage whenever data changes
    useEffect(() => {
      localStorage.setItem(
        "apNote_data",
        JSON.stringify(apNoteData),
      );
    }, [apNoteData]);

    // Auto-expand and scroll to AP Note when navigated from ImportCost
    useEffect(() => {
      if (apNoteData.length === 0) return;

      // First check sessionStorage for selectedAPNoteId (direct navigation from ImportCost)
      let targetId = sessionStorage.getItem("selectedAPNoteId");
      
      // Fallback to prop if sessionStorage not found
      if (!targetId && selectedAPNoteNo) {
        targetId = selectedAPNoteNo;
      }

      if (!targetId) return;

      console.log(
        "=== Auto-expand from sessionStorage or prop ===",
        "targetId:",
        targetId,
      );

      // Find the AP Note by ID
      const matchingAPNote = apNoteData.find((note) => {
        if (note.id === targetId) {
          return true;
        }
        // Fallback: try matching by computed ID format
        const computedId = `apn-${note.apNoteNo.replace(/\//g, "-")}`;
        if (computedId === targetId) {
          return true;
        }
        // Also try matching apNoteNo directly
        if (note.apNoteNo === targetId) {
          return true;
        }
        return false;
      });

      if (matchingAPNote) {
        console.log(
          "Found matching AP Note:",
          matchingAPNote.apNoteNo,
          "ID:",
          matchingAPNote.id,
        );

        // Reset all filters to show all items
        setSupplierFilter("all");
        setTermFilter("all");
        setPtFilter("ALL PT");
        setDocTypeFilter("all");
        setSearchTerm("");

        // Expand the matching AP Note card
        setExpandedItems(new Set([matchingAPNote.id]));

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(
            matchingAPNote.id,
          );
          console.log(
            "Looking for element:",
            matchingAPNote.id,
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

        // Clear the sessionStorage item after use
        sessionStorage.removeItem("selectedAPNoteId");
      } else {
        console.warn(
          "No matching AP Note found for targetId:",
          targetId,
          "Looking for in",
          apNoteData.length,
          "records",
        );
      }
    }, [apNoteData, selectedAPNoteNo]);

    // Click outside handler for dropdowns
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Close account code dropdown if clicking outside
        if (activeAccountCodeIdx !== null) {
          const dropdown = document.getElementById(
            "account-code-dropdown",
          );
          const input = document.getElementById(
            `account-code-input-${activeAccountCodeIdx}`,
          );

          if (
            dropdown &&
            input &&
            !dropdown.contains(target) &&
            !input.contains(target)
          ) {
            setActiveAccountCodeIdx(null);
          }
        }

        // Close department code dropdown if clicking outside
        if (activeDeptCodeIdx !== null) {
          const dropdown = document.getElementById(
            "dept-code-dropdown",
          );
          const input = document.getElementById(
            `dept-code-input-${activeDeptCodeIdx}`,
          );

          if (
            dropdown &&
            input &&
            !dropdown.contains(target) &&
            !input.contains(target)
          ) {
            setActiveDeptCodeIdx(null);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside,
        );
      };
    }, [activeAccountCodeIdx, activeDeptCodeIdx]);

    // Function to handle navigation from ShipmentRequest
    const handleNavigateToAPNote = (apNoteId: string) => {
      console.log("Navigating to AP Note ID:", apNoteId);
      console.log(
        "Current apNoteData:",
        apNoteData.map((item) => ({
          id: item.id,
          apNoteNo: item.apNoteNo,
          computedId: `apn-${item.apNoteNo.replace(/\//g, "-")}`,
        })),
      );

      // Reset all filters to show all items
      setSupplierFilter("all");
      setTermFilter("all");
      setPtFilter("ALL PT");
      setDocTypeFilter("all");
      setSearchTerm("");

      // Switch to AP Note tab first
      setActiveTab("ap-note");

      // Wait for tab to render and filters to apply, then expand and scroll
      setTimeout(() => {
        // Auto expand the specific AP Note using the mapped ID
        setExpandedItems(
          (prev) => new Set([apNoteId, ...Array.from(prev)]),
        );

        // Scroll to the item with longer timeout
        setTimeout(() => {
          const element = document.getElementById(apNoteId);

          console.log(
            "Looking for element with ID:",
            apNoteId,
            "Found:",
            !!element,
          );

          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);
      }, 100);
    };

    // Effect to handle navigation event from ImportCost or other components
    useEffect(() => {
      const handleNavigateToAPNoteEvent = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { apNoteId, apNoteNo } = customEvent.detail;

        console.log(
          "=== APNote navigateToAPNote event ===",
          "apNoteId:",
          apNoteId,
          "apNoteNo:",
          apNoteNo,
        );

        // Find the AP Note - can search by apNoteNo since that's the displayed number
        const matchingAPNote = apNoteData.find((note) => {
          // Match by apNoteNo (the displayed invoice number)
          if (apNoteNo && note.apNoteNo === apNoteNo) {
            return true;
          }
          // Fallback: also try matching by the computed ID format
          const computedId = `apn-${note.apNoteNo.replace(/\//g, "-")}`;
          if (computedId === apNoteId) {
            return true;
          }
          return false;
        });

        if (matchingAPNote) {
          console.log(
            "Found matching AP Note:",
            matchingAPNote.apNoteNo,
            "ID:",
            matchingAPNote.id,
          );

          // Reset all filters to show all items
          setSupplierFilter("all");
          setTermFilter("all");
          setPtFilter("ALL PT");
          setDocTypeFilter("all");
          setSearchTerm("");

          // Expand the matching AP Note card using its actual ID
          setExpandedItems(new Set([matchingAPNote.id]));

          // Scroll to the card after DOM updates
          setTimeout(() => {
            const element = document.getElementById(
              matchingAPNote.id,
            );
            console.log(
              "Looking for element:",
              matchingAPNote.id,
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
          console.warn(
            "No matching AP Note found for apNoteNo:",
            apNoteNo,
            "apNoteId:",
            apNoteId,
          );
        }
      };

      window.addEventListener(
        "navigateToAPNote",
        handleNavigateToAPNoteEvent,
      );

      return () => {
        window.removeEventListener(
          "navigateToAPNote",
          handleNavigateToAPNoteEvent,
        );
      };
    }, [apNoteData]);

    // Function to handle navigation to Shipment Request
    const handleNavigateToShipmentRequest = (
      srDocumentNo: string,
    ) => {
      console.log("=== Navigating to Shipment Request ===");
      console.log("SR Document No:", srDocumentNo);

      // Close the Linked Documents dialog
      setShowLinkedDocsDialog(false);
      setSelectedForLinkedDocs(null);

      // Store SR document number in sessionStorage for ShipmentRequest component
      sessionStorage.setItem("linkedSRNumber", srDocumentNo);
      sessionStorage.setItem(
        "selectedSRDocumentNo",
        srDocumentNo,
      );

      // Switch to Shipment Request tab
      setActiveTab("shipment-request");

      // Wait for tab to render, then trigger auto-expand
      setTimeout(() => {
        // Dispatch event to ShipmentRequest component to handle auto-expand
        window.dispatchEvent(
          new CustomEvent("navigateToShipmentRequest", {
            detail: { documentNo: srDocumentNo },
          }),
        );

        // Also try to expand if element is available
        setTimeout(() => {
          const element = document.getElementById(
            `sr-card-${srDocumentNo}`,
          );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      }, 100);
    };

    // Validate if account items are properly filled
    const isAccountItemsValid = (): boolean => {
      if (accountItems.length === 0) {
        return true; // No items is valid, validation will be handled by other checks
      }
      // Check if at least one item has all required fields filled
      return accountItems.some(
        (item) =>
          item.accountCode &&
          item.accountName &&
          item.department &&
          item.deptDescription &&
          item.qty !== 0 &&
          item.unitPrice !== 0 &&
          item.totalAmount !== 0,
      );
    };

    // Helper function to generate AP Note Number in format AP/XXX.YYY/AABB/0000
    const generateAPNoteNo = (
      pt: PTType = "WNS",
      date: string = getTodayYYYYMMDD(),
    ): string => {
      // Extract year (2 digits) and month (2 digits) from date
      const dateObj = new Date(date);
      const year = String(dateObj.getFullYear()).slice(-2);
      const month = String(dateObj.getMonth() + 1).padStart(
        2,
        "0",
      );
      // Generate random 4-digit number
      const randomNum = String(
        Math.floor(Math.random() * 10000),
      ).padStart(4, "0");

      // Format: AP/PT.MDN/YYMM/XXXX
      return `AP/${pt}.MDN/${year}${month}/${randomNum}`;
    };

    // Create AP Note form state
    const [apNoteForm, setApNoteForm] = useState({
      apNoteNo: "",
      apNoteType: "MDN",
      apNoteDate: getTodayYYYYMMDD(),
      supplierName: "",
      currency: "IDR",
      invoiceNumber: "",
      term: "CREDIT" as TermType,
      documentReceivedDate: getTodayYYYYMMDD(),
      remarks: "",
      pt: "WNS" as PTType,
    });

    const [accountItems, setAccountItems] = useState<
      AccountItem[]
    >([]);
    const [linkedDocs, setLinkedDocs] = useState<
      LinkedDocument[]
    >([]);
    const [linkedDocNoSearchTerms, setLinkedDocNoSearchTerms] =
      useState<{ [key: number]: string }>({});
    const [openLinkedDocDropdown, setOpenLinkedDocDropdown] =
      useState<{ [key: number]: boolean }>({});
    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddLinks, setShowAddLinks] = useState(false);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [auditTrail, setAuditTrail] = useState<
      AuditTrailEntry[]
    >([]);
    const [selectedDocType, setSelectedDocType] =
      useState<DocType>("AP NOTE");

    // Supplier selection state
    const [showSupplierDropdown, setShowSupplierDropdown] =
      useState(false);
    const supplierDropdownRef = useRef<HTMLDivElement>(null);

    // Refs for auto-scrolling to new items
    const lastAccountItemRef = useRef<HTMLTableRowElement>(null);
    const mainDialogScrollRef = useRef<HTMLDivElement>(null);
    const editDialogScrollRef = useRef<HTMLDivElement>(null);
    const mainDialogContentRef = useRef<HTMLDivElement>(null);
    const editDialogContentRef = useRef<HTMLDivElement>(null);

    const [
      availableDocsForSupplier,
      setAvailableDocsForSupplier,
    ] = useState<LinkedDocument[]>([]);
    const [showDocumentSelection, setShowDocumentSelection] =
      useState(false);
    const [documentNoSearchTerms, setDocumentNoSearchTerms] =
      useState<{ [key: number]: string }>({});
    const [showLinkedDocDropdown, setShowLinkedDocDropdown] =
      useState(false);

    // Edit mode supplier state
    const [
      showEditSupplierDropdown,
      setShowEditSupplierDropdown,
    ] = useState(false);
    const [
      availableEditDocsForSupplier,
      setAvailableEditDocsForSupplier,
    ] = useState<LinkedDocument[]>([]);
    const [
      showEditDocumentSelection,
      setShowEditDocumentSelection,
    ] = useState(false);

    // Void form state
    const [voidReason, setVoidReason] = useState("");
    const [voidDate, setVoidDate] = useState(getTodayYYYYMMDD());

    // Detail dialog state
    const [showDetailDialog, setShowDetailDialog] =
      useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState<
      "items" | "details" | "remarks" | "history"
    >("items");
    const [activeEditTabItems, setActiveEditTabItems] = useState<
      "items" | "links"
    >("items");
    const [expandedDetailItems, setExpandedDetailItems] =
      useState<Set<string>>(new Set());

    // Auto-scroll to newly added account items in main view
    useEffect(() => {
      if (!lastAccountItemRef.current) return;

      // Use multiple RAF calls and timeout for proper DOM update timing
      const rafId = requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          const rafId2 = requestAnimationFrame(() => {
            if (!lastAccountItemRef.current) return;

            // Method 1: Direct scroll on container
            if (mainDialogScrollRef.current) {
              mainDialogScrollRef.current.scrollTop =
                mainDialogScrollRef.current.scrollHeight + 1000;
            }

            // Method 2: scrollIntoView as fallback
            setTimeout(() => {
              lastAccountItemRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            }, 100);
          });
          return () => cancelAnimationFrame(rafId2);
        }, 100);
        return () => clearTimeout(timer);
      });

      return () => cancelAnimationFrame(rafId);
    }, [accountItems]);

    // Auto-scroll to newly added account items in edit mode
    useEffect(() => {
      if (!lastEditAccountItemRef.current) return;

      // Use multiple RAF calls and timeout for proper DOM update timing
      const rafId = requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          const rafId2 = requestAnimationFrame(() => {
            if (!lastEditAccountItemRef.current) return;

            // Method 1: Direct scroll on container
            if (editDialogScrollRef.current) {
              editDialogScrollRef.current.scrollTop =
                editDialogScrollRef.current.scrollHeight + 1000;
            }

            // Method 2: scrollIntoView as fallback
            setTimeout(() => {
              lastEditAccountItemRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            }, 100);
          });
          return () => cancelAnimationFrame(rafId2);
        }, 100);
        return () => clearTimeout(timer);
      });

      return () => cancelAnimationFrame(rafId);
    }, [editAccountItems]);

    const filteredData = apNoteData.filter((item) => {
      const matchesSearch =
        item.apNoteNo
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesSupplier =
        supplierFilter === "all" ||
        item.supplierCategory === supplierFilter;
      const matchesTerm =
        termFilter === "all" || item.term === termFilter;
      const matchesPT =
        ptFilter === "ALL PT" || item.pt === ptFilter;
      const matchesDocType =
        docTypeFilter === "all" || item.docType === docTypeFilter;
      const matchesSubmitted = !isMarkingSubmitted
        ? true
        : item.isSubmitted === true;
      const matchesPIC =
        picPIFilter === "all" || item.createdBy === picPIFilter;
      return (
        matchesSearch &&
        matchesSupplier &&
        matchesTerm &&
        matchesPT &&
        matchesDocType &&
        matchesSubmitted &&
        matchesPIC
      );
    });

    const overseasCount = apNoteData.filter(
      (d) => d.supplierCategory === "OVERSEAS",
    ).length;
    const localCount = apNoteData.filter(
      (d) => d.supplierCategory === "LOCAL",
    ).length;
    const urgentCount = apNoteData.filter(
      (d) => d.term === "URGENT",
    ).length;
    const creditCount = apNoteData.filter(
      (d) => d.term === "CREDIT",
    ).length;
    const onlineShoppingCount = apNoteData.filter(
      (d) => d.term === "ONLINE SHOPPING",
    ).length;
    const submittedCount = apNoteData.filter(
      (d) => d.isSubmitted === true,
    ).length;
    const apNoteCount = apNoteData.filter(
      (d) => d.docType === "AP NOTE",
    ).length;
    const apDiscNoteCount = apNoteData.filter(
      (d) => d.docType === "AP DISC NOTE",
    ).length;
    const formatCurrency = (
      amount: number,
      currency: string = "IDR",
    ) => {
      const currencyMap: { [key: string]: string } = {
        IDR: "id-ID",
        USD: "en-US",
        EUR: "de-DE",
        SGD: "en-SG",
      };
      const locale = currencyMap[currency] || "id-ID";
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      // Return currency code with formatted number (no symbol)
      return `${currency} ${formatted}`;
    };

    const formatNumber = (
      amount: number,
      currency: string = "IDR",
    ) => {
      const currencyMap: { [key: string]: string } = {
        IDR: "id-ID",
        USD: "en-US",
        EUR: "de-DE",
        SGD: "en-SG",
      };
      const locale = currencyMap[currency] || "id-ID";

      const safeAmount =
        typeof amount === "number" && !isNaN(amount) ? amount : 0;

      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2, // ⬅️ selalu tampilkan 2 digit
        maximumFractionDigits: 2, // ⬅️ batasi 2 digit saja
      }).format(safeAmount);

      return formatted;
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
      if (!expandAll) {
        // Expand all filtered items using the mapped IDs
        const allIds = new Set(
          filteredData.map((item) => item.id),
        );
        setExpandedItems(allIds);
        setExpandAll(true);
      } else {
        // Collapse all
        setExpandedItems(new Set());
        setExpandAll(false);
      }
    };

    // Handler for supplier selection
    const handleSupplierSelect = (supplier: SupplierData) => {
      setApNoteForm({
        ...apNoteForm,
        supplierName: supplier.name,
      });
      setAvailableDocsForSupplier(supplier.availableDocuments || []);
      setShowSupplierDropdown(false);
      setIsSupplierSelected(true);
    };

    // Handler for supplier selection in edit mode
    const handleEditSupplierSelect = (supplier: SupplierData) => {
      if (editFormData) {
        setEditFormData({
          ...editFormData,
          supplierName: supplier.name,
          supplierCategory: supplier.category,
        });
        setAvailableEditDocsForSupplier(
          supplier.availableDocuments || [],
        );
        setShowEditSupplierDropdown(false);
      }
    };

    // Handler for adding linked documents from supplier
    const handleAddLinksFromSupplier = () => {
      if (availableDocsForSupplier.length === 0) {
        alert("No available documents for this supplier");
        return;
      }
      setShowDocumentSelection(true);
    };

    // Handler for adding linked documents in edit mode
    const handleEditAddLinksFromSupplier = () => {
      if (availableEditDocsForSupplier.length === 0) {
        alert("No available documents for this supplier");
        return;
      }
      setShowEditDocumentSelection(true);
    };

    // Handler for selecting documents to link
    const handleSelectDocument = (doc: LinkedDocument) => {
      setLinkedDocs([
        ...linkedDocs,
        { ...doc, id: Date.now().toString() + Math.random() },
      ]);
    };

    // Handler for selecting documents to link in edit mode
    const handleEditSelectDocument = (doc: LinkedDocument) => {
      setEditLinkedDocs([
        ...editLinkedDocs,
        { ...doc, id: Date.now().toString() + Math.random() },
      ]);
    };

    // Handler to save AP Note without linked documents
    const handleSaveWithoutLinkedDocs = () => {
      // Generate AP Note Number before creating
      const generatedApNoteNo = generateAPNoteNo();

      // Get supplier category from master data
      const supplier = supplierMasterData.find(
        (s) => s.name === apNoteForm.supplierName,
      );
      const supplierCategory: SupplierCategory =
        supplier?.category || "LOCAL";

      // Calculate total from items or linked docs
      let totalInvoice = 0;
      if (accountItems.length > 0) {
        totalInvoice = accountItems.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        );
      } else if (linkedDocs.length > 0) {
        totalInvoice = linkedDocs.reduce(
          (sum, doc) => sum + doc.totalAmount,
          0,
        );
      }

      // Create new AP Note
      const newAPNote: APNoteData = {
        id: Date.now().toString(),
        apNoteNo: generatedApNoteNo,
        apNoteType: apNoteForm.apNoteType || "MDN",
        invoiceNumber: apNoteForm.invoiceNumber,
        supplierName: apNoteForm.supplierName,
        supplierCategory: supplierCategory,
        totalInvoice: totalInvoice,
        docReceiptDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.documentReceivedDate,
        ),
        apNoteCreateDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.apNoteDate,
        ),
        invoiceDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.apNoteDate,
        ),
        createdBy: "SHEFANNY",
        term: apNoteForm.term,
        currency: apNoteForm.currency,
        remarks: apNoteForm.remarks,
        items: [...accountItems],
        linkedDocs: [...linkedDocs],
        pt: apNoteForm.pt,
        docType: "AP NOTE",
      };

      // Add to data
      setApNoteData([newAPNote, ...apNoteData]);

      // Add audit trail entry for this AP Note
      setApNoteAuditTrails({
        ...apNoteAuditTrails,
        [newAPNote.id]: [
          {
            timestamp: new Date().toLocaleString(),
            user: "SHEFANNY",
            action: "Created AP Note",
          },
        ],
      });

      // Show success dialog with the generated AP Note No
      setSavedApNoteNo(generatedApNoteNo);
      setSavedDocType("AP NOTE");
      setSavedApNoteId(newAPNote.id);
      setSavedLinkedDocs([...linkedDocs]); // Save linked docs before clearing
      
      // Close the create dialog and no linked docs warning
      setShowCreateDialog(false);
      setShowNoLinkedDocsWarning(false);
      
      // Show success dialog
      setShowSuccessDialog(true);

      // Reset form
      setApNoteForm({
        apNoteNo: "",
        apNoteType: "MDN",
        apNoteDate: getTodayYYYYMMDD(),
        supplierName: "",
        invoiceNumber: "",
        documentReceivedDate: getTodayYYYYMMDD(),
        term: "URGENT",
        currency: "IDR",
        pt: "MJS",
        remarks: "",
        discount: 0,
        tax: 0,
        pph: 0,
      });

      setAccountItems([]);
      setLinkedDocs([]);
      setAvailableDocsForSupplier([]);
      setIsSupplierSelected(false);
      setActiveDetailTab("items");
    };
    const handleCreateAPNote = () => {
      // Check if linked documents are actually filled (have documentNo)
      const hasFilledLinkedDocs = linkedDocs.some(
        (doc) => doc.documentNo && doc.documentNo.trim() !== "",
      );

      if (!hasFilledLinkedDocs) {
        setShowNoLinkedDocsWarning(true);
        return;
      }

      // Generate AP Note Number before creating
      const generatedApNoteNo = generateAPNoteNo();

      // Get supplier category from master data
      const supplier = supplierMasterData.find(
        (s) => s.name === apNoteForm.supplierName,
      );
      const supplierCategory: SupplierCategory =
        supplier?.category || "LOCAL";

      // Calculate total from items or linked docs
      let totalInvoice = 0;
      if (accountItems.length > 0) {
        totalInvoice = accountItems.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        );
      } else if (linkedDocs.length > 0) {
        totalInvoice = linkedDocs.reduce(
          (sum, doc) => sum + doc.totalAmount,
          0,
        );
      }

      // Create new AP Note
      const newAPNote: APNoteData = {
        id: Date.now().toString(),
        apNoteNo: generatedApNoteNo,
        apNoteType: apNoteForm.apNoteType || "MDN",
        invoiceNumber: apNoteForm.invoiceNumber,
        supplierName: apNoteForm.supplierName,
        supplierCategory: supplierCategory,
        totalInvoice: totalInvoice,
        docReceiptDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.documentReceivedDate,
        ),
        apNoteCreateDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.apNoteDate,
        ),
        invoiceDate: convertYYYYMMDDtoDDMMYYYY(
          apNoteForm.apNoteDate,
        ),
        createdBy: "SHEFANNY",
        term: apNoteForm.term,
        currency: apNoteForm.currency,
        remarks: apNoteForm.remarks,
        items: [...accountItems],
        linkedDocs: [...linkedDocs],
        pt: apNoteForm.pt,
        docType: "AP NOTE",
      };

      // Add to data
      setApNoteData([newAPNote, ...apNoteData]);

      // Also save to createdAPNotes for linking
      try {
        const createdAPNotes = JSON.parse(
          localStorage.getItem("createdAPNotes") || "[]"
        );
        
        // Save the full AP Note object with all details including linkedDocs
        createdAPNotes.push(newAPNote);
        localStorage.setItem(
          "createdAPNotes",
          JSON.stringify(createdAPNotes)
        );
        console.log(
          "Saved AP Note to storage with linked documents:",
          newAPNote
        );
      } catch (error) {
        console.error(
          "Failed to save AP Note to storage:",
          error
        );
      }

      // Add audit trail entry for this AP Note
      setApNoteAuditTrails({
        ...apNoteAuditTrails,
        [newAPNote.id]: [
          {
            timestamp: new Date().toLocaleString(),
            user: "SHEFANNY",
            action: "Created AP Note",
          },
        ],
      });

      // Show success dialog with the generated AP Note No
      setSavedApNoteNo(generatedApNoteNo);
      setSavedDocType("AP NOTE");
      setSavedApNoteId(newAPNote.id);
      setSavedLinkedDocs([...linkedDocs]); // Save linked docs before clearing
      setShowSuccessDialog(true);

      // Dispatch event to notify other components (like InvoiceCollapsible) about the new AP Note
      window.dispatchEvent(
        new CustomEvent("expenseNoteCreated", {
          detail: {
            apNoteNo: generatedApNoteNo,
            linkedDocs: linkedDocs,
            totalAmount: totalInvoice,
          },
        })
      );

      // Reset form
      setApNoteForm({
        apNoteNo: "",
        apNoteType: "MDN",
        apNoteDate: getTodayYYYYMMDD(),
        supplierName: "",
        currency: "IDR",
        invoiceNumber: "",
        term: "CREDIT" as TermType,
        documentReceivedDate: getTodayYYYYMMDD(),
        remarks: "",
        pt: "WNS" as PTType,
      });
      setAccountItems([]);
      setLinkedDocs([]);
      setAvailableDocsForSupplier([]);
      setShowDocumentSelection(false);
      setIsSupplierSelected(false);
    };

    const handleVoid = () => {
      if (selectedForVoid) {
        // Update apNoteData to set isVoided = true
        setApNoteData((prev) =>
          prev.map((item) =>
            item.apNoteNo === selectedForVoid.apNoteNo
              ? {
                  ...item,
                  isVoided: true,
                  voidDate: voidDate,
                  voidReason: voidReason,
                }
              : item,
          ),
        );

        // Update audit trail
        setApNoteAuditTrails((prev) => ({
          ...prev,
          [selectedForVoid.apNoteNo]: [
            ...(prev[selectedForVoid.apNoteNo] || []),
            {
              timestamp: new Date().toISOString(),
              action: "VOIDED",
              description: `AP Note voided. Reason: ${voidReason}`,
              user: "Current User",
            },
          ],
        }));

        console.log(
          "Voiding AP Note:",
          selectedForVoid.apNoteNo,
          voidReason,
          voidDate,
        );
        setShowVoidDialog(false);
        setVoidReason("");
        setVoidDate(getTodayYYYYMMDD());
        setSelectedForVoid(null);
      }
    };

    const addAccountItem = () => {
      const newItem: AccountItem = {
        id: Date.now().toString(),
        accountCode: "",
        accountName: "",
        deptDescription: "",
        qty: 0,
        unitPrice: 0,
        totalAmount: 0,
        description: "",
      };
      setAccountItems([...accountItems, newItem]);
    };

    const addLinkedDoc = () => {
      const newDoc: LinkedDocument = {
        id: Date.now().toString(),
        documentNo: "",
        itemDate: "",
        totalAmount: 0,
      };
      setLinkedDocs([...linkedDocs, newDoc]);
    };
    const handleEditAPNote = () => {
      if (!selectedDetail || !editFormData) return;

      // Track changes for audit trail
      const changes: string[] = [];

      // Invoice Number
      if (
        selectedDetail.invoiceNumber !==
        editFormData.invoiceNumber
      ) {
        changes.push(
          `Invoice Number: "${selectedDetail.invoiceNumber}" → "${editFormData.invoiceNumber}"`,
        );
      }

      // Supplier Name
      if (
        selectedDetail.supplierName !== editFormData.supplierName
      ) {
        changes.push(
          `Supplier Name: "${selectedDetail.supplierName}" → "${editFormData.supplierName}"`,
        );
      }

      // Supplier Category
      if (
        selectedDetail.supplierCategory !==
        editFormData.supplierCategory
      ) {
        changes.push(
          `Supplier Category: "${selectedDetail.supplierCategory}" → "${editFormData.supplierCategory}"`,
        );
      }

      // Doc Receipt Date
      if (
        selectedDetail.docReceiptDate !==
        editFormData.docReceiptDate
      ) {
        changes.push(
          `Doc Receipt Date: "${selectedDetail.docReceiptDate}" → "${editFormData.docReceiptDate}"`,
        );
      }

      // AP Note Create Date
      if (
        selectedDetail.apNoteCreateDate !==
        editFormData.apNoteCreateDate
      ) {
        changes.push(
          `AP Note Create Date: "${selectedDetail.apNoteCreateDate}" → "${editFormData.apNoteCreateDate}"`,
        );
      }

      // Invoice Date
      if (
        selectedDetail.invoiceDate !== editFormData.invoiceDate
      ) {
        changes.push(
          `Invoice Date: "${selectedDetail.invoiceDate}" → "${editFormData.invoiceDate}"`,
        );
      }

      // Term
      if (selectedDetail.term !== editFormData.term) {
        changes.push(
          `Term: "${selectedDetail.term}" → "${editFormData.term}"`,
        );
      }

      // Currency
      if (selectedDetail.currency !== editFormData.currency) {
        changes.push(
          `Currency: "${selectedDetail.currency || "IDR"}" → "${editFormData.currency}"`,
        );
      }

      // Remarks
      if (selectedDetail.remarks !== editFormData.remarks) {
        changes.push(
          `Remarks: "${selectedDetail.remarks || ""}" → "${editFormData.remarks}"`,
        );
      }

      // AP Note No (format baru)
      if (selectedDetail.apNoteNo !== editFormData.apNoteNo) {
        changes.push(
          `AP Note No: "${selectedDetail.apNoteNo}" → "${editFormData.apNoteNo}"`,
        );
      }

      // Track item changes
      const oldItemsCount = selectedDetail.items?.length || 0;
      const newItemsCount = editAccountItems.length;
      if (oldItemsCount !== newItemsCount) {
        changes.push(
          `Items count: ${oldItemsCount} → ${newItemsCount}`,
        );
      }

      // Track linked docs changes
      const oldLinkedDocsCount =
        selectedDetail.linkedDocs?.length || 0;
      const newLinkedDocsCount = editLinkedDocs.length;
      if (oldLinkedDocsCount !== newLinkedDocsCount) {
        changes.push(
          `Linked Documents count: ${oldLinkedDocsCount} → ${newLinkedDocsCount}`,
        );
      }

      // Calculate new total using the utility function
      const newTotal = calculateDisplayedTotal(
        editAccountItems.length > 0
          ? editAccountItems
          : undefined,
        editLinkedDocs.length > 0 ? editLinkedDocs : undefined,
      );

      // Calculate old total from selectedDetail
      const oldTotal = calculateDisplayedTotal(
        selectedDetail.items,
        selectedDetail.linkedDocs,
      );

      if (oldTotal !== newTotal) {
        changes.push(
          `Total Invoice: ${formatCurrency(oldTotal)} → ${formatCurrency(newTotal)}`,
        );
      }

      // Update the AP Note data
      const updatedAPNote: APNoteData = {
        ...editFormData,
        items: editAccountItems,
        linkedDocs: editLinkedDocs,
        totalInvoice: newTotal,
      };

      setApNoteData(
        apNoteData.map((item) =>
          item.id === selectedDetail.id ? updatedAPNote : item,
        ),
      );

      // Add audit trail entries
      if (changes.length > 0) {
        const newAuditEntries: AuditTrailEntry[] = changes.map(
          (change) => ({
            timestamp: new Date().toLocaleString(),
            user: "SHEFANNY",
            action: `Updated: ${change}`,
          }),
        );

        setApNoteAuditTrails({
          ...apNoteAuditTrails,
          [selectedDetail.id]: [
            ...(apNoteAuditTrails[selectedDetail.id] || []),
            ...newAuditEntries,
          ],
        });
      }

      // Exit edit mode and update selected detail
      setIsEditMode(false);
      setSelectedDetail(updatedAPNote);
      setEditFormData(null);
      setEditAccountItems([]);
      setEditLinkedDocs([]);
      setActiveEditTabItems("items");
    };

    const handleStartEdit = () => {
      if (selectedDetail) {
        setEditFormData({ ...selectedDetail });
        setEditAccountItems(selectedDetail.items || []);

        // Convert old PI/PO format to new unified PI/PO format
        let linkedDocsToConvert =
          selectedDetail.linkedDocs || [];
        
        // If linkedDocs is empty, try to find linked documents from mockpurchaseInvoice
        // This handles AP Notes created before linkedDocs feature was implemented
        if (linkedDocsToConvert.length === 0) {
          // Try to find Purchase Invoices that match this AP Note
          const matchingPIs = mockpurchaseInvoice.filter(
            (pi) =>
              pi.supplierName ===
                selectedDetail.supplierName,
          );
          
          if (matchingPIs.length > 0) {
            // Create linkedDocs from matching PIs
            linkedDocsToConvert = matchingPIs.map((pi) => ({
              id: pi.piId || `pi-${pi.purchaseInvoiceNo}`,
              documentType: "PI/PO",
              documentTypeLabel:
                "Purchase Invoice | Purchase Order",
              documentNo: pi.purchaseInvoiceNo,
              documentNoPO: pi.noPO,
            }));
            
            // Update the AP Note to include the reconstructed linkedDocs
            const updatedAPNote = {
              ...selectedDetail,
              linkedDocs: linkedDocsToConvert,
            };
            setSelectedDetail(updatedAPNote);
            setEditFormData(updatedAPNote);
          }
        }
        
        const convertedLinkedDocs: LinkedDocument[] = [];
        const processedIds = new Set<string>();

        linkedDocsToConvert.forEach((doc) => {
          if (processedIds.has(doc.id)) return; // Skip if already processed as part of a pair

          if (doc.documentType === "PI") {
            // Find corresponding PO
            const poDoc = linkedDocsToConvert.find(
              (d) => d.documentType === "PO",
            );

            // Create merged PI/PO row
            const mergedDoc: LinkedDocument = {
              id: doc.id,
              documentType: "PI/PO",
              documentTypeLabel:
                "Purchase Invoice | Purchase Order",
              documentNo: doc.documentNo,
              documentNoPO: poDoc?.documentNo || "",
            };
            convertedLinkedDocs.push(mergedDoc);
            processedIds.add(doc.id);
            if (poDoc) processedIds.add(poDoc.id);
          } else if (doc.documentType === "PO") {
            // Find corresponding PI
            const piDoc = linkedDocsToConvert.find(
              (d) => d.documentType === "PI",
            );

            // Create merged PI/PO row
            const mergedDoc: LinkedDocument = {
              id: doc.id,
              documentType: "PI/PO",
              documentTypeLabel:
                "Purchase Invoice | Purchase Order",
              documentNo: piDoc?.documentNo || "",
              documentNoPO: doc.documentNo,
            };
            convertedLinkedDocs.push(mergedDoc);
            processedIds.add(doc.id);
            if (piDoc) processedIds.add(piDoc.id);
          } else if (doc.documentType === "PI/PO") {
            // Already in merged format
            convertedLinkedDocs.push(doc);
            processedIds.add(doc.id);
          } else {
            // Not PI or PO, keep as is
            convertedLinkedDocs.push(doc);
            processedIds.add(doc.id);
          }
        });

        setEditLinkedDocs(convertedLinkedDocs);
        setIsEditMode(true);
      }
    };

    const handleCancelEdit = () => {
      setIsEditMode(false);
      setEditFormData(null);
      setEditAccountItems([]);
      setEditLinkedDocs([]);
      setActiveEditTabItems("items");
    };

    // Helper function to get document type label (handles both old and new formats)
    const getDocumentTypeLabel = (documentType: string) => {
      const typeToLabel: { [key: string]: string } = {
        "PI/PO": "Purchase Invoice | Purchase Order",
        PI: "Purchase Invoice | Purchase Order",
        PO: "Purchase Invoice | Purchase Order",
        IC: "Import Cost",
        SR: "Shipment Request",
      };
      return typeToLabel[documentType] || documentType;
    };

    const handlePieClick = (data: any) => {
      // Toggle selection - if same PIC is clicked, deselect it
      if (selectedPIC?.name === data.name) {
        setSelectedPIC(null);
      } else {
        setSelectedPIC(data);
      }
    };

    const handleSubmitDocuments = () => {
      if (selectedDocsForSubmit.length === 0) {
        alert("Please select at least one document to submit");
        return;
      }

      // Mark selected documents as submitted
      setApNoteData(
        apNoteData.map((item) => {
          if (selectedDocsForSubmit.includes(item.id)) {
            return { ...item, isSubmitted: true };
          }
          return item;
        }),
      );

      // Reset form
      setShowSubmitDialog(false);
      setSelectedDocsForSubmit([]);
      setSubmitForm({
        docType: "CREDIT",
        submitTo: "AP",
        picName: "",
        submitDate: getTodayYYYYMMDD(),
      });
    };

    // Close supplier dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          supplierDropdownRef.current &&
          !supplierDropdownRef.current.contains(
            event.target as Node,
          )
        ) {
          setShowSupplierDropdown(false);
        }
      };

      if (showSupplierDropdown) {
        document.addEventListener(
          "mousedown",
          handleClickOutside,
        );
        return () => {
          document.removeEventListener(
            "mousedown",
            handleClickOutside,
          );
        };
      }
    }, [showSupplierDropdown]);

    // Filter supplier dropdown based on input length
    const shouldShowSupplierDropdown = (inputValue: string) => {
      return inputValue.length >= 2;
    };

    // Calculate displayed total based on items or linked docs
    const calculateDisplayedTotal = (
      items?: AccountItem[],
      linkedDocs?: LinkedDocument[],
    ): number => {
      if (items && items.length > 0) {
        return calculateTotalFromItems(items);
      } else if (linkedDocs && linkedDocs.length > 0) {
        return calculateTotalFromDocs(linkedDocs.map(doc => ({ ...doc, totalAmount: doc.totalAmount || 0 })));
      }
      return 0;
    };

    return (
      <div className="space-y-4">
        {/* submit document & submitted */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as typeof activeTab);
            // Trigger event when switching to Shipment Request tab
            if (value === "shipment-request") {
              window.dispatchEvent(
                new Event("shipmentRequestTabActive"),
              );
            }
          }}
          className="w-full"
        >
          {/* Flex container untuk TabsList + Button */}
          
          <TabsContent value="ap-note" className="mt-4">
            {/* Filter Tabs - DocType Filter */}
         

            {/* Additional Filters - PT, Warehouse, PIC */}
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
              activeFilterType === "pic" || picPIFilter !== "all"
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
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-purple-900"></h2>
              <div className="flex justify-end items-center gap-3">
                {/* Clear Filter Button - Only show when filters are active */}
                {(supplierFilter !== "all" || termFilter !== "all" || ptFilter !== "ALL PT" || docTypeFilter !== "all" || warehouseFilter !== "all" || picPIFilter !== "all") && (
                  <Button
                    onClick={() => {
                      supplierFilter !== "all" && setSupplierFilter("all");
                      termFilter !== "all" && setTermFilter("all");
                      ptFilter !== "ALL PT" && setPtFilter("ALL PT");
                      docTypeFilter !== "all" && setDocTypeFilter("all");
                      warehouseFilter !== "all" && setWarehouseFilter("all");
                      picPIFilter !== "all" && setPicPIFilter("all");
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
                {/* Expand/Collapse All Button */}
                <Button
                  onClick={handleExpandAll}
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
                  onClick={() => {
                    setSelectedDocType("AP NOTE");
                    const defaultItem: AccountItem = {
                      id: Date.now().toString(),
                      accountCode: "",
                      accountName: "",
                      deptDescription: "",
                      qty: 0,
                      unitPrice: 0,
                      totalAmount: 0,
                      description: "",
                    };
                    const defaultLink: LinkedDocument = {
                      id: Date.now().toString(),
                      documentType: "",
                      documentNo: "",
                    };
                    setAccountItems([defaultItem]);
                    setLinkedDocs([defaultLink]);
                    setShowCreateDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
 <Button
                onClick={() => {
                  setShowSubmitDialog(true);
                  setSelectedDocsForSubmit([]);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" /> Submit
                Documents
              </Button>
              {/* Tombol Toggle Submitted Status */}
              <Button
                onClick={() =>
                  setIsMarkingSubmitted(!isMarkingSubmitted)
                }
                className={`${
                  isMarkingSubmitted
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {isMarkingSubmitted ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Circle className="h-4 w-4 mr-2" />
                )}
                Submitted
              </Button>
              </div>
            </div>

            {/* Content Area - Toggle between Normal View and Submit View */}
            {!showSubmitDialog ? (
              // Normal View - AP Note List
              <div className="space-y-4">
                {/* Document Counter */}
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-purple-700">
                    {filteredData.length}
                  </span>
                  of{" "}
                  <span className="font-semibold text-purple-700">
                    {apNoteData.length}
                  </span>{" "}
                  documents
                </div>

                {/* Search Bar */}
                <Card className="p-4 border-purple-100 shadow-sm">
                  <Input
                    placeholder="🔍 Search by AP Note No or Invoice Number..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </Card>

                {/* AP Note List - Collapsible Cards */}
                <div className="space-y-3">
                  {filteredData.map((item: APNoteData) => {
                    // Use item.id directly - this matches the ID sent from ImportCost
                    const apNoteId = item.id;
                    const isExpanded =
                      expandedItems.has(apNoteId);
                    return (
                      <motion.div
                        key={apNoteId}
                        id={apNoteId}
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
                          onClick={() => toggleExpand(apNoteId)}
                          className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors"
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
                                  <div className="flex items-center gap-2 mb-1">
                                    <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-900 font-mono min-w-[180px]">
                                      {item.apNoteNo}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="bg-purple-50 text-purple-700 border-purple-200"
                                    >
                                      {item.pt || "N/A"}
                                    </Badge>
                                    <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm truncate">
                                      {item.supplierName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center gap-6 flex-shrink-0">
                              {/* Supplier Category Badge - Desktop */}
                              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className={
                                    item.supplierCategory ===
                                    "OVERSEAS"
                                      ? "border-blue-300 text-blue-700 bg-blue-50"
                                      : "border-green-300 text-green-700 bg-green-50"
                                  }
                                >
                                  {item.supplierCategory ===
                                  "OVERSEAS" ? (
                                    <Globe2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <MapPin className="h-3 w-3 mr-1" />
                                  )}
                                  {item.supplierCategory ===
                                  "OVERSEAS"
                                    ? "Overseas"
                                    : "Local"}
                                </Badge>
                              </div>

                              {/* Term Badge - Desktop */}
                              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className={
                                    item.term === "URGENT"
                                      ? "border-red-300 text-red-700 bg-red-50"
                                      : item.term === "CREDIT"
                                        ? "border-purple-300 text-purple-700 bg-purple-50"
                                        : "border-orange-300 text-orange-700 bg-orange-50"
                                  }
                                >
                                  {item.term === "URGENT" ? (
                                    <Zap className="h-3 w-3 mr-1" />
                                  ) : item.term === "CREDIT" ? (
                                    <CreditCard className="h-3 w-3 mr-1" />
                                  ) : (
                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                  )}
                                  {item.term === "URGENT"
                                    ? "Urgent"
                                    : item.term === "CREDIT"
                                      ? "Credit"
                                      : "Online shopping"}
                                </Badge>
                              </div>

                              {/* Submitted Badge - Desktop */}
                              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedData =
                                      apNoteData.map((note) =>
                                        note.id === item.id
                                          ? {
                                              ...note,
                                              isSubmitted:
                                                !note.isSubmitted,
                                            }
                                          : note,
                                      );
                                    setApNoteData(updatedData);
                                  }}
                                  className={`cursor-pointer transition-colors ${
                                    item.isSubmitted
                                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                      : "border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  {item.isSubmitted ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Submitted
                                    </>
                                  ) : (
                                    <>
                                      <ClockIcon className="w-3 h-3 mr-1" />
                                      Submit
                                    </>
                                  )}
                                </Badge>
                              </div>

                              {/* Void Badge - Desktop */}
                              {item.isVoided && (
                                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className="bg-red-100 text-red-700 border-red-200"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Void
                                  </Badge>
                                </div>
                              )}

                              {/* Total Invoice */}
                              <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg border border-green-200">
                                <div className="flex justify-between items-center w-36">
                                  <span className="text-green-900 font-medium text-sm">
                                    {item.currency || "IDR"}
                                  </span>
                                  <span className="text-green-900 font-medium text-sm text-right">
                                    {formatNumber(
                                      calculateCombinedTotal(
                                        calculateDisplayedTotal(
                                          item.items,
                                          item.linkedDocs,
                                        ),
                                        item.tax || 0,
                                        item.discount || 0,
                                        item.pph || 0,
                                      ),
                                    )}
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
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                              }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-purple-100" />
                              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-purple-50/30">
                                {/* Layout: grid 1x4 */}
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 items-start">
                                  {/* Right Grid - 1x4 Details */}
                                  <div className="w-full p-6 bg-white rounded-xl border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                      {/* Doc Receipt Date */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Calendar className="w-4 h-4 text-blue-600" />
                                          <span className="text-gray-600 text-sm">
                                            Doc Receipt Date
                                          </span>
                                        </div>
                                        <div className="text-gray-900">
                                          {formatDateToDDMMYYYY(
                                            item.docReceiptDate,
                                          )}
                                        </div>
                                      </div>

                                      {/* Invoice Date */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Calendar className="w-4 h-4 text-green-600" />
                                          <span className="text-gray-600 text-sm">
                                            Invoice Date
                                          </span>
                                        </div>
                                        <div className="text-gray-900">
                                          {formatDateToDDMMYYYY(
                                            item.invoiceDate,
                                          )}
                                        </div>
                                      </div>

                                      {/* Created By */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <User className="w-4 h-4 text-orange-600" />
                                          <span className="text-gray-600 text-sm">
                                            Created By
                                          </span>
                                        </div>
                                        <div className="text-gray-900">
                                          {item.createdBy}
                                        </div>
                                      </div>

                                      {/* AP Note Create Date */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Calendar className="w-4 h-4 text-purple-600" />
                                          <span className="text-gray-600 text-sm">
                                            Created Date
                                          </span>
                                        </div>
                                        <div className="text-gray-900">
                                          {formatDateToDDMMYYYY(
                                            item.apNoteCreateDate,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
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

                                  {/* Link Button */}
                                  <Button
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedForLinkedDocs(
                                        item,
                                      );
                                      setShowLinkedDocsDialog(
                                        true,
                                      );
                                    }}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                  >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Link
                                  </Button>

                                  {/* Void Button */}
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!item.isVoided) {
                                        setSelectedForVoid(item);
                                        setShowVoidDialog(true);
                                      }
                                    }}
                                    disabled={item.isVoided}
                                    variant="outline"
                                    className={
                                      item.isVoided
                                        ? "border-red-200 text-red-700 cursor-not-allowed bg-red-50"
                                        : "border-red-200 text-red-700 hover:bg-red-50"
                                    }
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {item.isVoided
                                      ? "Voided"
                                      : "Void"}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredData.length === 0 && (
                  <Card className="p-8 border-purple-100 shadow-sm">
                    <div className="text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-purple-300" />
                      <p>No AP Notes found</p>
                    </div>
                  </Card>
                )}
              </div>
            ) : null}

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
                    <div className="flex items-center gap-4">
                      <Input
                        placeholder="🔍 Search by AP_ Note No or Invoice Number..."
                        className="flex-1 border-purple-200 focus:border-purple-400"
                      />
                    </div>
                    {/* Submission Details */}
                    <Card className="p-3 bg-blue-50 border-blue-200">
                      <div className="text-xs font-medium text-blue-800 mb-3">
                        Submission Details
                      </div>

                      <div className="flex gap-3 w-full">


                        {/* Submitted To */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Submitted To{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={submittedTo}
                            onValueChange={(value: Division) =>
                              setSubmittedTo(value)
                            }
                          >
                            <SelectTrigger className="border-blue-200 h-9 w-full">
                              <SelectValue placeholder="Select Division" />
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
                        <div className="flex flex-col flex-1 min-w-0">
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            PIC Name
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
                              <SelectValue placeholder={submittedTo ? "Select PIC (optional)" : "Select Division first"} />
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
                        <div className="flex flex-col flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Submission Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal h-9 ${!submissionDate &&
                                  "text-muted-foreground"
                                  } ${submissionDate && !isValidDate(submissionDate) ? "border-red-300 bg-red-50" : "border-blue-200"}`}
                              >
                                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {submissionDate &&
                                    isValidDate(submissionDate)
                                    ? submissionDate
                                    : "Pick a date"}
                                </span>
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
                                    onCheckedChange={(checked: boolean) => {
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
                                onSelect={(date: Date) => {
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
                              <p className="text-xs text-red-500 mt-1">
                                Invalid date format
                              </p>
                            )}
                        </div>
                      </div>
                    </Card>
                  </Card>


                 

                  {/* Info Card with Select All */}
                  <Card className="p-3 bg-purple-50 border-purple-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <Receipt className="h-4 w-4" />
                        <span>
                          {selectedDocsForSubmit.length} of{" "}
                          {
                            apNoteData.filter(
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
                            selectedDocsForSubmit.length ===
                              apNoteData.filter(
                                (item) => !item.isSubmitted,
                              ).length &&
                            apNoteData.filter(
                              (item) => !item.isSubmitted,
                            ).length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDocsForSubmit(
                                apNoteData
                                  .filter(
                                    (item) => !item.isSubmitted,
                                  )
                                  .map((item) => item.id),
                              );
                            } else {
                              setSelectedDocsForSubmit([]);
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

                  {/* Document List */}
                  <div>
                    <div className="border border-purple-200 rounded-lg max-h-[300px] overflow-y-auto">
                      {apNoteData.filter(
                        (item) => !item.isSubmitted,
                      ).length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <div className="text-lg mb-2">
                            No Documents Available for Submission
                          </div>
                          <div className="text-sm">
                            All documents have been submitted or
                            there are no documents available. Please
                            verify documents first before
                            submitting.
                          </div>
                        </div>
                      ) : (
                        apNoteData
                          .filter((item) => !item.isSubmitted)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-purple-100 last:border-b-0 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => {
                                if (
                                  selectedDocsForSubmit.includes(
                                    item.id,
                                  )
                                ) {
                                  setSelectedDocsForSubmit(
                                    selectedDocsForSubmit.filter(
                                      (id) => id !== item.id,
                                    ),
                                  );
                                } else {
                                  setSelectedDocsForSubmit([
                                    ...selectedDocsForSubmit,
                                    item.id,
                                  ]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={selectedDocsForSubmit.includes(
                                  item.id,
                                )}
                                onCheckedChange={() => {
                                  if (
                                    selectedDocsForSubmit.includes(
                                      item.id,
                                    )
                                  ) {
                                    setSelectedDocsForSubmit(
                                      selectedDocsForSubmit.filter(
                                        (id) => id !== item.id,
                                      ),
                                    );
                                  } else {
                                    setSelectedDocsForSubmit([
                                      ...selectedDocsForSubmit,
                                      item.id,
                                    ]);
                                  }
                                }}
                              />
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    AP Note No
                                  </span>
                                  <div className="font-medium text-purple-700">
                                    {item.apNoteNo}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Supplier
                                  </span>
                                  <div className="font-medium">
                                    {item.supplierName}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Amount
                                  </span>
                                  <div className="font-medium">
                                    {formatCurrency(
                                      item.totalInvoice,
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Type
                                  </span>
                                  <div className="font-medium">
                                    {item.docType === "AP_NOTE"
                                      ? "AP NOTE"
                                      : "AP DISC NOTE"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
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
                      onClick={handleSubmitDocuments}
                      disabled={
                        selectedDocsForSubmit.length === 0 ||
                        !submitForm.submitTo.trim() ||
                        !submitForm.picName.trim() ||
                        !submitForm.submitDate.trim()
                      }
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit {selectedDocsForSubmit.length} Document
                      {selectedDocsForSubmit.length !== 1 ? "s" : ""}
                    </Button>
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



            {/* Detail Dialog */}
            <Dialog
              open={!!selectedDetail}
              onOpenChange={() => {
                setSelectedDetail(null);
                setIsEditMode(false);
                setEditFormData(null);
                setActiveEditTabItems("items");
              }}
            >
              <DialogContent
                className="w-[1800px] h-[800px] flex flex-col overflow-hidden"
                ref={editDialogContentRef}
              >
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="text-purple-900">
                    {isEditMode
                      ? "Edit Expense Note"
                      : "Expense Note Details"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? "Update the Expense Note information"
                      : "Complete information about the Expense Note"}
                  </DialogDescription>
                </DialogHeader>

                {selectedDetail && (
                  <>
                    <div
                      ref={editDialogScrollRef}
                      className="flex-1 overflow-y-auto px-1 space-y-6"
                    >
                      {!isEditMode ? (
                        <>
                          {/* Header Info, Tabs, and Tables - all view mode content */}
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 mb-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* Expense Note No */}
                              <div>
                                <div className="text-xs text-purple-600 mb-1">
                                  Expense Note No{" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </div>
                                <div className="font-semibold text-purple-900 text-sm">
                                  {selectedDetail.apNoteNo}
                                </div>
                              </div>

                              {/* Expense Note Date */}
                              <div>
                                <div className="text-xs text-purple-600 mb-1">
                                  Expense Note Date{" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </div>
                                <div className="font-semibold text-purple-900 text-sm">
                                  {formatDateToDDMMYYYY(
                                    selectedDetail.apNoteCreateDate,
                                  )}
                                </div>
                              </div>

                              {/* Supplier Name */}
                              <div>
                                <div className="text-xs text-purple-600 mb-1">
                                  Supplier Name{" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </div>
                                <div className="font-semibold text-purple-900 text-sm truncate">
                                  {selectedDetail.supplierName}
                                </div>
                              </div>

                              {/* Invoice Number */}
                              <div>
                                <div className="text-xs text-purple-600 mb-1">
                                  Reference Number (ini nanti
                                  bakalan panjang juga){" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </div>
                                <div
                                  className="font-semibold text-purple-900 text-sm truncate"
                                  title={
                                    selectedDetail.invoiceNumber
                                  }
                                >
                                  {selectedDetail.invoiceNumber}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tabs above Items Table */}
                          <div className="flex items-center justify-between border-b border-gray-200 mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setActiveDetailTab("items")
                                }
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
                          </div>

                          {/* Tables Container */}
                          {selectedDetail?.items &&
                          selectedDetail.items.length > 0 ? (
                            <div className="border border-gray-200 rounded-xl overflow-hidden h-auto">
                              {/* Items Tab */}
                              {activeDetailTab === "items" && (
                                <div className="overflow-y-auto h-full">
                                  {selectedDetail?.items &&
                                  selectedDetail.items.length >
                                    0 ? (
                                    <table className="w-full table-fixed">
                                      <thead className="bg-purple-50 sticky top-0 z-10">
                                        <tr className="h-12">
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Category
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "20%",
                                            }}
                                          >
                                            Description
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Account Code
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Account Name
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Department
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "20%",
                                            }}
                                          >
                                            Dept. Description
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "10%",
                                            }}
                                          >
                                            Qty
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-left px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Unit Price
                                          </th>
                                          <th
                                            className="text-purple-900 text-xs text-right px-4 py-2 font-medium border-b"
                                            style={{
                                              width: "15%",
                                            }}
                                          >
                                            Amount
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedDetail.items.map(
                                          (item) => (
                                            <tr
                                              key={item.id}
                                              className="hover:bg-purple-50 border-b h-12"
                                            >
                                              <td className="text-xs px-4 py-2">
                                                {item.category ||
                                                  "-"}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {item.description ||
                                                  "-"}
                                              </td>
                                              <td className="text-xs px-4 py-2 font-medium">
                                                {item.accountCode}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {item.accountName}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {item.department ||
                                                  "-"}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {item.deptDescription ||
                                                  "-"}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {item.qty}
                                              </td>
                                              <td className="text-xs px-4 py-2">
                                                {formatCurrency(
                                                  item.unitPrice,
                                                )}
                                              </td>
                                              <td className="text-xs px-4 py-2 text-right text-purple-900 font-semibold">
                                                {formatCurrency(
                                                  calculateItemTotal(
                                                    item.qty,
                                                    item.unitPrice,
                                                  ),
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="text-center text-gray-500 py-4">
                                      No items found
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Details Tab */}
                              {activeDetailTab === "details" && (
                                <div className="p-6 space-y-4 overflow-y-auto h-full">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-purple-900 font-semibold mb-2 text-sm">
                                        General Information
                                      </h4>
                                      <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
                                        <div>
                                          <span className="text-xs text-gray-600">
                                            Supplier Category
                                          </span>
                                          <div className="text-sm font-medium text-purple-900">
                                            {
                                              selectedDetail.supplierCategory
                                            }
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-xs text-gray-600">
                                            Term
                                          </span>
                                          <div className="text-sm font-medium text-purple-900">
                                            {selectedDetail.term}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-xs text-gray-600">
                                            Currency
                                          </span>
                                          <div className="text-sm font-medium text-purple-900">
                                            {selectedDetail.currency ||
                                              "IDR"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-purple-900 font-semibold mb-2 text-sm">
                                        Dates
                                      </h4>
                                      <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
                                        <div>
                                          <span className="text-xs text-gray-600">
                                            Invoice Date
                                          </span>
                                          <div className="text-sm font-medium text-purple-900">
                                            {
                                              selectedDetail.invoiceDate
                                            }
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-xs text-gray-600">
                                            Created By
                                          </span>
                                          <div className="text-sm font-medium text-purple-900">
                                            {
                                              selectedDetail.createdBy
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Linked Documents */}
                                  {selectedDetail?.linkedDocs &&
                                    selectedDetail.linkedDocs
                                      .length > 0 && (
                                      <div>
                                        <h4 className="text-purple-900 font-semibold mb-2 text-sm flex items-center gap-2">
                                          <Receipt className="h-4 w-4" />
                                          Linked Documents
                                        </h4>
                                        <div className="space-y-2">
                                          {selectedDetail.linkedDocs.map(
                                            (doc) => (
                                              <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Receipt className="h-4 w-4 text-purple-600" />
                                                  <div>
                                                    <span className="text-sm font-medium">
                                                      {
                                                        doc.documentNo
                                                      }
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                      {
                                                        doc.itemDate
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                                <span className="text-sm text-purple-900 font-semibold">
                                                  {formatCurrency(
                                                    doc.totalAmount,
                                                  )}
                                                </span>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                              {/* Remarks Tab */}
                              {activeDetailTab === "remarks" && (
                                <div className="p-6 overflow-y-auto h-full">
                                  <textarea
                                    className="w-full h-full text-sm text-gray-700 whitespace-pre-wrap border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    value={
                                      selectedDetail?.remarks ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setSelectedDetail({
                                        ...selectedDetail,
                                        remarks: e.target.value,
                                      })
                                    }
                                    placeholder="Enter remarks..."
                                  />
                                </div>
                              )}

                              {/* History Tab */}
                              {activeDetailTab === "history" && (
                                <div className="p-6 overflow-y-auto h-full">
                                  {selectedDetail?.id &&
                                  apNoteAuditTrails[
                                    selectedDetail.id
                                  ] &&
                                  apNoteAuditTrails[
                                    selectedDetail.id
                                  ].length > 0 ? (
                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
                                        <ClockIcon className="w-5 h-5" />
                                        Activity Timeline
                                      </h3>
                                      <div className="space-y-6">
                                        {apNoteAuditTrails[
                                          selectedDetail.id
                                        ].map((entry, idx) => (
                                          <div
                                            key={`${entry.timestamp}-${entry.user}-${idx}`}
                                            className="flex gap-4"
                                          >
                                            <div className="flex flex-col items-center">
                                              <div className="w-4 h-4 bg-purple-600 rounded-full mt-1.5" />
                                              {idx <
                                                apNoteAuditTrails[
                                                  selectedDetail
                                                    .id
                                                ].length -
                                                  1 && (
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
                                                    {
                                                      entry.timestamp
                                                    }
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
                                        No history records yet
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <>
                          {/* Edit Form - also scrollable content */}
                          {editFormData &&
                            (() => {
                              // Convert DD-MM-YYYY to YYYY-MM-DD for date input
                              const dateParts = (
                                editFormData.apNoteCreateDate ||
                                getTodayYYYYMMDD()
                              ).split("-");

                              let year = "";
                              let month = "";
                              let day = "";

                              if (dateParts.length === 3) {
                                // Check if format is DD-MM-YYYY or YYYY-MM-DD
                                if (dateParts[2].length === 4) {
                                  // DD-MM-YYYY format
                                  day = dateParts[0];
                                  month = dateParts[1];
                                  year = dateParts[2];
                                } else {
                                  // YYYY-MM-DD format
                                  year = dateParts[0];
                                  month = dateParts[1];
                                  day = dateParts[2];
                                }
                              }
                              return (
                                <div className="space-y-4">
                                  {/* Baris Atas (1x4): Supplier | Term | Currency | Company */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Supplier Name */}
                                    <div className="relative">
                                      <Label>
                                        Supplier Name
                                        <span className="text-red-500">
                                          *
                                        </span>
                                      </Label>
                                      <Input
                                        value={
                                          editFormData.supplierName ||
                                          ""
                                        }
                                        readOnly
                                        disabled
                                        placeholder="Supplier Name"
                                      />
                                      {showEditSupplierDropdown &&
                                        shouldShowSupplierDropdown(
                                          editFormData.supplierName,
                                        ) && (
                                          <div className="absolute z-50 w-full mt-1 bg-white border border-purple-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {supplierMasterData
                                              .filter((s) =>
                                                s.name
                                                  .toLowerCase()
                                                  .includes(
                                                    editFormData.supplierName.toLowerCase(),
                                                  ),
                                              )
                                              .map(
                                                (
                                                  supplier,
                                                  idx,
                                                ) => (
                                                  <div
                                                    key={`supplier-edit-${supplier.supplierName}-${idx}`}
                                                    onClick={() =>
                                                      handleEditSupplierSelect(
                                                        supplier,
                                                      )
                                                    }
                                                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                                                  >
                                                    <span>
                                                      {
                                                        supplier.name
                                                      }
                                                    </span>
                                                    <Badge
                                                      variant="outline"
                                                      className={
                                                        supplier.category ===
                                                        "OVERSEAS"
                                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                                          : "bg-green-50 text-green-700 border-green-200"
                                                      }
                                                    >
                                                      {
                                                        supplier.category
                                                      }
                                                    </Badge>
                                                  </div>
                                                ),
                                              )}
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
                                        value={editFormData.term}
                                        onValueChange={(
                                          value: TermType,
                                        ) =>
                                          setEditFormData({
                                            ...editFormData,
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
                                        value={
                                          editFormData.currency ||
                                          ""
                                        }
                                        disabled
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
                                      <Input
                                        value={
                                          editFormData.companyName ||
                                          ""
                                        }
                                        readOnly
                                        disabled
                                        placeholder="Company"
                                      />
                                    </div>
                                  </div>

                                  {/* Baris Bawah (1x3): Doc Received Date | Expense Note Date | Invoice Number */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Doc Received Date */}
                                    <div>
                                      <Label>
                                        Document Received Date
                                        <span className="text-red-500">
                                          *
                                        </span>
                                      </Label>
                                      <Input
                                        type="text"
                                        value={
                                          editFormData.docReceiptDate ||
                                          ""
                                        }
                                        onChange={(e) => {
                                          const raw =
                                            e.target.value.replace(
                                              /\D/g,
                                              "",
                                            ); // ambil hanya angka
                                          if (raw.length === 8) {
                                            const day = raw.slice(
                                              0,
                                              2,
                                            );
                                            const month =
                                              raw.slice(2, 4);
                                            const year =
                                              raw.slice(4);
                                            const formatted = `${day}/${month}/${year}`;
                                            setEditFormData({
                                              ...editFormData,
                                              docReceiptDate:
                                                formatted,
                                            });
                                          } else {
                                            setEditFormData({
                                              ...editFormData,
                                              docReceiptDate:
                                                e.target.value,
                                            });
                                          }
                                        }}
                                        placeholder="DD/MM/YYYY"
                                      />
                                    </div>

                                    {/* Expense Note Date */}
                                    <div>
                                      <Label>
                                        AP Note Date
                                        <span className="text-red-500">
                                          *
                                        </span>
                                      </Label>
                                      <Input
                                        type="text"
                                        value={
                                          editFormData.apNoteCreateDate ||
                                          ""
                                        }
                                        onChange={(e) => {
                                          const raw =
                                            e.target.value.replace(
                                              /\D/g,
                                              "",
                                            ); // ambil hanya angka
                                          if (raw.length === 8) {
                                            const day = raw.slice(
                                              0,
                                              2,
                                            );
                                            const month =
                                              raw.slice(2, 4);
                                            const year =
                                              raw.slice(4);
                                            const formatted = `${day}/${month}/${year}`;
                                            setEditFormData({
                                              ...editFormData,
                                              apNoteCreateDate:
                                                formatted,
                                            });
                                          } else {
                                            setEditFormData({
                                              ...editFormData,
                                              apNoteCreateDate:
                                                e.target.value,
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
                                        value={
                                          editFormData.invoiceNumber
                                        }
                                        onChange={(e) =>
                                          setEditFormData({
                                            ...editFormData,
                                            invoiceNumber:
                                              e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  {/* Tabs for Items and Linked Documents in Edit Mode */}
                                  <Tabs
                                    value={activeEditTabItems}
                                    onValueChange={(val) =>
                                      setActiveEditTabItems(
                                        val as "items" | "links",
                                      )
                                    }
                                    className="w-full"
                                  >
                                    <div className="flex items-center justify-between border-b border-gray-200 mb-3">
                                      <div className="flex items-center gap-0">
                                        <button
                                          onClick={() => {
                                            setActiveEditTabItems(
                                              "items",
                                            );
                                          }}
                                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                                            activeEditTabItems ===
                                            "items"
                                              ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                                              : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                                          }`}
                                        >
                                          Items
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveEditTabItems(
                                              "links",
                                            );
                                          }}
                                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                                            activeEditTabItems ===
                                            "links"
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
                                            const newItem: AccountItem =
                                              {
                                                id: Date.now().toString(),
                                                accountCode: "",
                                                accountName: "",
                                                deptDescription:
                                                  "",
                                                qty: 0,
                                                unitPrice: 0,
                                                totalAmount: 0,
                                                description: "",
                                              };
                                            setEditAccountItems([
                                              ...editAccountItems,
                                              newItem,
                                            ]);

                                            // Scroll to bottom after state updates
                                            setTimeout(() => {
                                              if (
                                                editDialogScrollRef.current
                                              ) {
                                                editDialogScrollRef.current.scrollTo(
                                                  {
                                                    top:
                                                      editDialogScrollRef
                                                        .current
                                                        .scrollHeight +
                                                      500,
                                                    behavior:
                                                      "smooth",
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
                                      <div className="border rounded-lg overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>
                                                Category
                                              </TableHead>
                                              <TableHead>
                                                Description
                                              </TableHead>
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
                                              <TableHead>
                                                Amount
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {editAccountItems.length >
                                              0 && (
                                              <>
                                                {editAccountItems.map(
                                                  (
                                                    item,
                                                    index,
                                                  ) => (
                                                    <div
                                                      key={
                                                        item.id
                                                      }
                                                      ref={
                                                        index ===
                                                        editAccountItems.length -
                                                          1
                                                          ? lastEditAccountItemRef
                                                          : null
                                                      }
                                                    >
                                                      <TableRow>
                                                        <TableCell>
                                                          {/* Category Input */}
                                                          <Input
                                                            value={
                                                              item.category ||
                                                              ""
                                                            }
                                                            onChange={(
                                                              e,
                                                            ) => {
                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ] =
                                                                {
                                                                  ...newItems[
                                                                    index
                                                                  ],
                                                                  category:
                                                                    e
                                                                      .target
                                                                      .value,
                                                                };
                                                              setEditAccountItems(
                                                                newItems,
                                                              );
                                                            }}
                                                            placeholder="Category"
                                                            className="min-w-[120px]"
                                                          />
                                                        </TableCell>

                                                        <TableCell>
                                                          {/* Description Input */}
                                                          <Input
                                                            value={
                                                              item.description
                                                            }
                                                            onChange={(
                                                              e,
                                                            ) => {
                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ] =
                                                                {
                                                                  ...newItems[
                                                                    index
                                                                  ],
                                                                  description:
                                                                    e
                                                                      .target
                                                                      .value,
                                                                };
                                                              setEditAccountItems(
                                                                newItems,
                                                              );
                                                            }}
                                                            placeholder="Description"
                                                            className="min-w-[150px]"
                                                          />
                                                        </TableCell>

                                                        <TableCell>
                                                          {/* Account Code Dropdown */}
                                                          <Select
                                                            value={
                                                              item.accountCode
                                                            }
                                                            onValueChange={(
                                                              value,
                                                            ) => {
                                                              const selected =
                                                                accountOptions.find(
                                                                  (
                                                                    opt,
                                                                  ) =>
                                                                    opt.code ===
                                                                    value,
                                                                );
                                                              if (
                                                                !selected
                                                              )
                                                                return;

                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ] =
                                                                {
                                                                  ...newItems[
                                                                    index
                                                                  ],
                                                                  accountCode:
                                                                    selected.code,
                                                                  accountName:
                                                                    selected.name,
                                                                };
                                                              setEditAccountItems(
                                                                newItems,
                                                              );
                                                              setAccountCodeSearchTerms(
                                                                {
                                                                  ...accountCodeSearchTerms,
                                                                  [index]:
                                                                    "",
                                                                },
                                                              );
                                                            }}
                                                          >
                                                            {/* Trigger hanya menampilkan Account Code */}
                                                            <SelectTrigger
                                                              className="min-w-[140px] px-3 py-2"
                                                              onMouseDown={(
                                                                e,
                                                              ) =>
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
                                                                onChange={(
                                                                  e,
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  setAccountCodeSearchTerms(
                                                                    {
                                                                      ...accountCodeSearchTerms,
                                                                      [index]:
                                                                        e
                                                                          .target
                                                                          .value,
                                                                    },
                                                                  );
                                                                }}
                                                                onKeyDown={(
                                                                  e,
                                                                ) =>
                                                                  e.stopPropagation()
                                                                }
                                                                onMouseDown={(
                                                                  e,
                                                                ) => {
                                                                  e.preventDefault();
                                                                  e.stopPropagation();
                                                                }}
                                                                onClick={(
                                                                  e,
                                                                ) =>
                                                                  e.stopPropagation()
                                                                }
                                                                onFocus={(
                                                                  e,
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  e.currentTarget.select();
                                                                }}
                                                                placeholder="Search account code"
                                                                className="w-full bg-transparent border-none outline-none text-sm"
                                                                autoFocus={
                                                                  false
                                                                }
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
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    setAccountCodeSearchTerms(
                                                                      {
                                                                        ...accountCodeSearchTerms,
                                                                        [index]:
                                                                          e
                                                                            .target
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
                                                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                                                                />
                                                              </div>

                                                              {/* Header */}
                                                              <div className="grid grid-cols-[100px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                                                <div>
                                                                  Account
                                                                  Code
                                                                </div>
                                                                <div>
                                                                  Account
                                                                  Name
                                                                </div>
                                                              </div>

                                                              {/* Items (filtered) */}
                                                              {accountOptions
                                                                .filter(
                                                                  (
                                                                    opt,
                                                                  ) =>
                                                                    opt.code
                                                                      .toLowerCase()
                                                                      .includes(
                                                                        (
                                                                          accountCodeSearchTerms[
                                                                            index
                                                                          ] ||
                                                                          ""
                                                                        ).toLowerCase(),
                                                                      ) ||
                                                                    opt.name
                                                                      .toLowerCase()
                                                                      .includes(
                                                                        (
                                                                          accountCodeSearchTerms[
                                                                            index
                                                                          ] ||
                                                                          ""
                                                                        ).toLowerCase(),
                                                                      ),
                                                                )
                                                                .map(
                                                                  (
                                                                    opt,
                                                                  ) => (
                                                                    <SelectItem
                                                                      key={
                                                                        opt.code
                                                                      }
                                                                      value={
                                                                        opt.code
                                                                      }
                                                                      className="!p-0"
                                                                    >
                                                                      <div className="grid grid-cols-[100px_auto] px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                                        <div className="w-[100px]">
                                                                          {
                                                                            opt.code
                                                                          }
                                                                        </div>
                                                                        <div className="w-full whitespace-pre-wrap">
                                                                          {
                                                                            opt.name
                                                                          }
                                                                        </div>
                                                                      </div>
                                                                    </SelectItem>
                                                                  ),
                                                                )}
                                                            </SelectContent>
                                                          </Select>
                                                        </TableCell>

                                                        <TableCell>
                                                          {/* Account Name (auto-filled, read-only) */}
                                                          <Input
                                                            value={
                                                              item.accountName
                                                            }
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
                                                              ] ||
                                                              false
                                                            }
                                                            onOpenChange={(
                                                              open,
                                                            ) =>
                                                              setOpenDeptCodeDropdown(
                                                                {
                                                                  ...openDeptCodeDropdown,
                                                                  [index]:
                                                                    open,
                                                                },
                                                              )
                                                            }
                                                            value={
                                                              item.department ||
                                                              ""
                                                            }
                                                            onValueChange={(
                                                              value,
                                                            ) => {
                                                              const selected =
                                                                departmentOptions.find(
                                                                  (
                                                                    opt,
                                                                  ) =>
                                                                    opt.code ===
                                                                    value,
                                                                );
                                                              if (
                                                                !selected
                                                              )
                                                                return;

                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ] =
                                                                {
                                                                  ...newItems[
                                                                    index
                                                                  ],
                                                                  department:
                                                                    selected.code,
                                                                  deptDescription:
                                                                    selected.name,
                                                                };
                                                              setEditAccountItems(
                                                                newItems,
                                                              );
                                                              setDepartmentCodeSearchTerms(
                                                                {
                                                                  ...departmentCodeSearchTerms,
                                                                  [index]:
                                                                    "",
                                                                },
                                                              );
                                                              setOpenDeptCodeDropdown(
                                                                {
                                                                  ...openDeptCodeDropdown,
                                                                  [index]: false,
                                                                },
                                                              );
                                                            }}
                                                          >
                                                            {/* Trigger jadi kotak input */}
                                                            <SelectTrigger
                                                              className="min-w-[140px]"
                                                              onMouseDown={(
                                                                e,
                                                              ) =>
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
                                                              onMouseDown={(
                                                                e,
                                                              ) =>
                                                                e.preventDefault()
                                                              }
                                                            >
                                                              {/* Search box */}
                                                              <div
                                                                className="px-3 py-2 border-b border-gray-300 bg-white"
                                                                onMouseDown={(
                                                                  e,
                                                                ) =>
                                                                  e.preventDefault()
                                                                }
                                                              >
                                                                <input
                                                                  type="text"
                                                                  placeholder="Search department code or name..."
                                                                  value={
                                                                    departmentCodeSearchTerms[
                                                                      index
                                                                    ] ||
                                                                    ""
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    setDepartmentCodeSearchTerms(
                                                                      {
                                                                        ...departmentCodeSearchTerms,
                                                                        [index]:
                                                                          e
                                                                            .target
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
                                                                  autoFocus={
                                                                    true
                                                                  }
                                                                />
                                                              </div>

                                                              {/* Header */}
                                                              <div className="grid grid-cols-[120px_auto] text-xs font-semibold bg-gray-100 px-3 py-2 border-b border-gray-300">
                                                                <div>
                                                                  Dept
                                                                  Code
                                                                </div>
                                                                <div>
                                                                  Dept
                                                                  Name
                                                                </div>
                                                              </div>

                                                              {/* Filtered Items */}
                                                              {departmentOptions
                                                                .filter(
                                                                  (
                                                                    opt,
                                                                  ) =>
                                                                    opt.code
                                                                      .toLowerCase()
                                                                      .includes(
                                                                        (
                                                                          departmentCodeSearchTerms[
                                                                            index
                                                                          ] ||
                                                                          ""
                                                                        ).toLowerCase(),
                                                                      ) ||
                                                                    opt.name
                                                                      .toLowerCase()
                                                                      .includes(
                                                                        (
                                                                          departmentCodeSearchTerms[
                                                                            index
                                                                          ] ||
                                                                          ""
                                                                        ).toLowerCase(),
                                                                      ),
                                                                )
                                                                .map(
                                                                  (
                                                                    opt,
                                                                  ) => (
                                                                    <SelectItem
                                                                      key={
                                                                        opt.code
                                                                      }
                                                                      value={
                                                                        opt.code
                                                                      }
                                                                      className="!p-0"
                                                                    >
                                                                      <div className="grid grid-cols-[120px_auto] px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                                        <div className="w-[120px]">
                                                                          {
                                                                            opt.code
                                                                          }
                                                                        </div>
                                                                        <div className="w-full whitespace-pre-wrap">
                                                                          {
                                                                            opt.name
                                                                          }
                                                                        </div>
                                                                      </div>
                                                                    </SelectItem>
                                                                  ),
                                                                )}
                                                            </SelectContent>
                                                          </Select>
                                                        </TableCell>

                                                        <TableCell>
                                                          {/* Dept Name (read-only) */}
                                                          <Input
                                                            value={
                                                              item.deptDescription ||
                                                              ""
                                                            }
                                                            readOnly
                                                            placeholder="Dept Name"
                                                            className="min-w-[180px] bg-gray-100 cursor-not-allowed"
                                                          />
                                                        </TableCell>

                                                        <TableCell>
                                                          <Input
                                                            type="number"
                                                            value={
                                                              item.qty
                                                            }
                                                            onChange={(
                                                              e,
                                                            ) => {
                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ].qty =
                                                                Number(
                                                                  e
                                                                    .target
                                                                    .value,
                                                                );
                                                              newItems[
                                                                index
                                                              ].totalAmount =
                                                                newItems[
                                                                  index
                                                                ]
                                                                  .qty *
                                                                newItems[
                                                                  index
                                                                ]
                                                                  .unitPrice;
                                                              setEditAccountItems(
                                                                newItems,
                                                              );
                                                            }}
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
                                                            onChange={(
                                                              e,
                                                            ) => {
                                                              const parsed =
                                                                parseFloat(
                                                                  e.target.value
                                                                    .replace(
                                                                      /\./g,
                                                                      "",
                                                                    )
                                                                    .replace(
                                                                      /,/g,
                                                                      ".",
                                                                    ),
                                                                );
                                                              const newItems =
                                                                [
                                                                  ...editAccountItems,
                                                                ];
                                                              newItems[
                                                                index
                                                              ].unitPrice =
                                                                isNaN(
                                                                  parsed,
                                                                )
                                                                  ? 0
                                                                  : parsed;
                                                              newItems[
                                                                index
                                                              ].totalAmount =
                                                                newItems[
                                                                  index
                                                                ]
                                                                  .qty *
                                                                newItems[
                                                                  index
                                                                ]
                                                                  .unitPrice;
                                                              setEditAccountItems(
                                                                newItems,
                                                              );

                                                              // setelah update, set caret kembali ke sebelum koma
                                                              const formatted =
                                                                formatNumber(
                                                                  newItems[
                                                                    index
                                                                  ]
                                                                    .unitPrice,
                                                                );
                                                              const commaIndex =
                                                                formatted.indexOf(
                                                                  ",",
                                                                );
                                                              if (
                                                                commaIndex >
                                                                -1
                                                              ) {
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
                                                            onFocus={(
                                                              e,
                                                            ) => {
                                                              const val =
                                                                e
                                                                  .target
                                                                  .value;
                                                              const commaIndex =
                                                                val.indexOf(
                                                                  ",",
                                                                );
                                                              if (
                                                                commaIndex >
                                                                -1
                                                              ) {
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
                                                              setEditAccountItems(
                                                                editAccountItems.filter(
                                                                  (
                                                                    _,
                                                                    i,
                                                                  ) =>
                                                                    i !==
                                                                    index,
                                                                ),
                                                              );
                                                            }}
                                                          >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                          </Button>
                                                        </TableCell>
                                                      </TableRow>
                                                    </div>
                                                  ),
                                                )}
                                              </>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </TabsContent>

                                    {/* Linked Documents Tab */}
                                    <TabsContent
                                      value="links"
                                      className="space-y-4"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => {
                                            const newDoc: LinkedDocument =
                                              {
                                                id: Date.now().toString(),
                                                documentType: "",
                                                documentNo: "",
                                              };
                                            setEditLinkedDocs([
                                              ...editLinkedDocs,
                                              newDoc,
                                            ]);

                                            // Scroll to bottom after state updates
                                            setTimeout(() => {
                                              if (
                                                editDialogScrollRef.current
                                              ) {
                                                editDialogScrollRef.current.scrollTo(
                                                  {
                                                    top:
                                                      editDialogScrollRef
                                                        .current
                                                        .scrollHeight +
                                                      500,
                                                    behavior:
                                                      "smooth",
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
                                            <TableRow className="flex w-full">
                                              <TableHead className="flex flex-1 items-center justify-start">
                                                Document Type
                                              </TableHead>
                                              <TableHead className="flex flex-[2] items-center justify-start">
                                                Document No.
                                              </TableHead>
                                              <TableHead className="flex w-16 items-center justify-start"></TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {editLinkedDocs.length >
                                              0 && (
                                              <>
                                                {editLinkedDocs.map(
                                                  (
                                                    doc,
                                                    index,
                                                  ) => (
                                                    <TableRow
                                                      key={doc.id}
                                                      className="flex w-full"
                                                    >
                                                      <TableCell className="flex-1">
                                                        <Select
                                                          value={
                                                            doc.documentType ||
                                                            ""
                                                          }
                                                          onValueChange={(
                                                            value,
                                                          ) => {
                                                            const newDocs =
                                                              [
                                                                ...editLinkedDocs,
                                                              ];

                                                            // Map document type to label
                                                            const typeToLabel: {
                                                              [
                                                                key: string
                                                              ]: string;
                                                            } = {
                                                              "PI/PO":
                                                                "Purchase Invoice | Purchase Order",
                                                              IC: "Import Cost",
                                                              SR: "Shipment Request",
                                                            };

                                                            newDocs[
                                                              index
                                                            ].documentType =
                                                              value;
                                                            newDocs[
                                                              index
                                                            ].documentTypeLabel =
                                                              typeToLabel[
                                                                value
                                                              ];

                                                            // Reset document numbers when type changes
                                                            newDocs[
                                                              index
                                                            ].documentNo =
                                                              "";
                                                            newDocs[
                                                              index
                                                            ].documentNoPO =
                                                              "";

                                                            setEditLinkedDocs(
                                                              newDocs,
                                                            );
                                                          }}
                                                        >
                                                          <SelectTrigger className="min-w-[200px]">
                                                            <SelectValue placeholder="Select document type">
                                                              {doc.documentTypeLabel ||
                                                                "Select document type"}
                                                            </SelectValue>
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="PI/PO">
                                                              Purchase
                                                              Invoice
                                                              |
                                                              Purchase
                                                              Order
                                                            </SelectItem>
                                                            <SelectItem value="IC">
                                                              Import
                                                              Cost
                                                            </SelectItem>
                                                            <SelectItem value="SR">
                                                              Shipment
                                                              Request
                                                            </SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                      </TableCell>
                                                      {/* Show 2 boxes for PI/PO pair, 1 box for IC/SR */}
                                                      {doc.documentType ===
                                                        "PI/PO" && (
                                                        <TableCell className="flex-1">
                                                          <div className="flex gap-2">
                                                            {/* Purchase Invoice box */}
                                                            <Select
                                                              open={
                                                                openDocumentNoDropdown[
                                                                  `${index}-PI`
                                                                ] ||
                                                                false
                                                              }
                                                              onOpenChange={(
                                                                open,
                                                              ) =>
                                                                setOpenDocumentNoDropdown(
                                                                  {
                                                                    ...openDocumentNoDropdown,
                                                                    [`${index}-PI`]:
                                                                      open,
                                                                  },
                                                                )
                                                              }
                                                              value={
                                                                doc.documentNo ||
                                                                ""
                                                              }
                                                              onValueChange={(
                                                                value,
                                                              ) => {
                                                                const newDocs =
                                                                  [
                                                                    ...editLinkedDocs,
                                                                  ];

                                                                // Look up the PI data to get matching PO
                                                                const piData =
                                                                  mockpurchaseInvoice.find(
                                                                    (
                                                                      pi,
                                                                    ) =>
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

                                                                setEditLinkedDocs(
                                                                  newDocs,
                                                                );
                                                                setDocumentNoSearchTerms(
                                                                  {
                                                                    ...documentNoSearchTerms,
                                                                    [`${index}-PI`]:
                                                                      "",
                                                                  },
                                                                );
                                                                setOpenDocumentNoDropdown(
                                                                  {
                                                                    ...openDocumentNoDropdown,
                                                                    [`${index}-PI`]: false,
                                                                  },
                                                                );
                                                              }}
                                                            >
                                                              <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300">
                                                                <input
                                                                  type="text"
                                                                  placeholder="Purchase Invoice"
                                                                  value={
                                                                    doc.documentNo ||
                                                                    ""
                                                                  }
                                                                  readOnly
                                                                  className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
                                                                />
                                                              </SelectTrigger>

                                                              <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                                                <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                                                  <input
                                                                    type="text"
                                                                    placeholder="Search..."
                                                                    value={
                                                                      documentNoSearchTerms[
                                                                        `${index}-PI`
                                                                      ] ||
                                                                      ""
                                                                    }
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
                                                                      setDocumentNoSearchTerms(
                                                                        {
                                                                          ...documentNoSearchTerms,
                                                                          [`${index}-PI`]:
                                                                            e
                                                                              .target
                                                                              .value,
                                                                        },
                                                                      )
                                                                    }
                                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                  />
                                                                </div>

                                                                {mockpurchaseInvoice
                                                                  .filter(
                                                                    (
                                                                      pi,
                                                                    ) => {
                                                                      // Check if already linked in current edit dialog
                                                                      const inCurrentEdit =
                                                                        editLinkedDocs.some(
                                                                          (
                                                                            d,
                                                                          ) =>
                                                                            d.documentNo ===
                                                                              pi.purchaseInvoiceNo ||
                                                                            d.documentNo ===
                                                                              pi.noPO,
                                                                        );

                                                                      // Check if already linked in saved AP Notes
                                                                      const inSavedAPNotes =
                                                                        apNoteData.some(
                                                                          (
                                                                            apNote,
                                                                          ) =>
                                                                            apNote.linkedDocs &&
                                                                            apNote.linkedDocs.some(
                                                                              (
                                                                                doc,
                                                                              ) =>
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
                                                                              documentNoSearchTerms[
                                                                                `${index}-PI`
                                                                              ] ||
                                                                              ""
                                                                            ).toLowerCase(),
                                                                          );

                                                                      return (
                                                                        !inCurrentEdit &&
                                                                        !inSavedAPNotes &&
                                                                        matchesSearch
                                                                      );
                                                                    },
                                                                  )
                                                                  .map(
                                                                    (
                                                                      pi,
                                                                    ) => (
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
                                                                    ),
                                                                  )}
                                                              </SelectContent>
                                                            </Select>

                                                            {/* Purchase Order box */}
                                                            <Select
                                                              open={
                                                                openDocumentNoDropdown[
                                                                  `${index}-PO`
                                                                ] ||
                                                                false
                                                              }
                                                              onOpenChange={(
                                                                open,
                                                              ) =>
                                                                setOpenDocumentNoDropdown(
                                                                  {
                                                                    ...openDocumentNoDropdown,
                                                                    [`${index}-PO`]:
                                                                      open,
                                                                  },
                                                                )
                                                              }
                                                              value={
                                                                doc.documentNoPO ||
                                                                ""
                                                              }
                                                              onValueChange={(
                                                                value,
                                                              ) => {
                                                                const newDocs =
                                                                  [
                                                                    ...editLinkedDocs,
                                                                  ];

                                                                // Look up which PI has this PO
                                                                const relatedPI =
                                                                  mockpurchaseInvoice.find(
                                                                    (
                                                                      pi,
                                                                    ) =>
                                                                      pi.noPO ===
                                                                      value,
                                                                  );

                                                                // Update the current PI/PO row with both PI and PO numbers
                                                                newDocs[
                                                                  index
                                                                ].documentNoPO =
                                                                  value;
                                                                if (
                                                                  relatedPI
                                                                ) {
                                                                  newDocs[
                                                                    index
                                                                  ].documentNo =
                                                                    relatedPI.purchaseInvoiceNo;
                                                                }

                                                                setDocumentNoSearchTerms(
                                                                  {
                                                                    ...documentNoSearchTerms,
                                                                    [`${index}-PO`]:
                                                                      "",
                                                                  },
                                                                );
                                                                setOpenDocumentNoDropdown(
                                                                  {
                                                                    ...openDocumentNoDropdown,
                                                                    [`${index}-PO`]: false,
                                                                  },
                                                                );

                                                                setEditLinkedDocs(
                                                                  newDocs,
                                                                );
                                                              }}
                                                            >
                                                              <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300">
                                                                <input
                                                                  type="text"
                                                                  placeholder="Purchase Order"
                                                                  value={
                                                                    doc.documentNoPO ||
                                                                    ""
                                                                  }
                                                                  readOnly
                                                                  className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
                                                                />
                                                              </SelectTrigger>

                                                              <SelectContent className="p-0 border border-gray-300 rounded-md overflow-hidden">
                                                                <div className="px-3 py-2 border-b border-gray-300 bg-white">
                                                                  <input
                                                                    type="text"
                                                                    placeholder="Search..."
                                                                    value={
                                                                      documentNoSearchTerms[
                                                                        `${index}-PO`
                                                                      ] ||
                                                                      ""
                                                                    }
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
                                                                      setDocumentNoSearchTerms(
                                                                        {
                                                                          ...documentNoSearchTerms,
                                                                          [`${index}-PO`]:
                                                                            e
                                                                              .target
                                                                              .value,
                                                                        },
                                                                      )
                                                                    }
                                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                  />
                                                                </div>

                                                                {mockpurchaseInvoice
                                                                  .filter(
                                                                    (
                                                                      pi,
                                                                    ) => {
                                                                      // Check if already linked in current edit dialog
                                                                      const isLinked =
                                                                        editLinkedDocs.some(
                                                                          (
                                                                            d,
                                                                          ) =>
                                                                            d.documentNoPO ===
                                                                              pi.noPO ||
                                                                            d.documentNo ===
                                                                              pi.noPO,
                                                                        );

                                                                      // Check if already linked in saved AP Notes
                                                                      const inSavedAPNotes =
                                                                        apNoteData.some(
                                                                          (
                                                                            apNote,
                                                                          ) =>
                                                                            apNote.linkedDocs &&
                                                                            apNote.linkedDocs.some(
                                                                              (
                                                                                doc,
                                                                              ) =>
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
                                                                              documentNoSearchTerms[
                                                                                `${index}-PO`
                                                                              ] ||
                                                                              ""
                                                                            ).toLowerCase(),
                                                                          );
                                                                      return (
                                                                        !isLinked &&
                                                                        !inSavedAPNotes &&
                                                                        matchesSearch
                                                                      );
                                                                    },
                                                                  )
                                                                  .reduce(
                                                                    (
                                                                      acc,
                                                                      pi,
                                                                    ) => {
                                                                      if (
                                                                        !acc.find(
                                                                          (
                                                                            p,
                                                                          ) =>
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
                                                                  .map(
                                                                    (
                                                                      pi,
                                                                    ) => (
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
                                                                          {
                                                                            pi.noPO
                                                                          }
                                                                        </div>
                                                                      </SelectItem>
                                                                    ),
                                                                  )}
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                        </TableCell>
                                                      )}

                                                      {(doc.documentType ===
                                                        "IC" ||
                                                        doc.documentType ===
                                                          "SR") && (
                                                        <TableCell className="flex-1">
                                                          {/* Document Number Select for IC/SR */}
                                                          <Select
                                                            open={
                                                              openDocumentNoDropdown[
                                                                index
                                                              ] ||
                                                              false
                                                            }
                                                            onOpenChange={(
                                                              open,
                                                            ) =>
                                                              setOpenDocumentNoDropdown(
                                                                {
                                                                  ...openDocumentNoDropdown,
                                                                  [index]:
                                                                    open,
                                                                },
                                                              )
                                                            }
                                                            value={
                                                              doc.documentNo
                                                            }
                                                            onValueChange={(
                                                              value,
                                                            ) => {
                                                              let selected: any;

                                                              // Find selected based on documentType
                                                              if (
                                                                doc.documentType ===
                                                                "PI"
                                                              ) {
                                                                selected =
                                                                  availableEditDocsForSupplier.find(
                                                                    (
                                                                      opt,
                                                                    ) =>
                                                                      opt.documentNo ===
                                                                      value,
                                                                  ) ||
                                                                  mockpurchaseInvoice.find(
                                                                    (
                                                                      pi,
                                                                    ) =>
                                                                      pi.piNo ===
                                                                      value,
                                                                  );
                                                              } else if (
                                                                doc.documentType ===
                                                                "IC"
                                                              ) {
                                                                selected =
                                                                  mockImportCostData.find(
                                                                    (
                                                                      ic,
                                                                    ) =>
                                                                      ic.icNo ===
                                                                      value,
                                                                  );
                                                              } else if (
                                                                doc.documentType ===
                                                                "SR"
                                                              ) {
                                                                selected =
                                                                  mockShipmentRequestData.find(
                                                                    (
                                                                      sr,
                                                                    ) =>
                                                                      sr.srNum ===
                                                                      value,
                                                                  );
                                                              }

                                                              if (
                                                                !selected
                                                              )
                                                                return;

                                                              const newDocs =
                                                                [
                                                                  ...editLinkedDocs,
                                                                ];

                                                              // Determine correct documentNo based on documentType
                                                              let finalDocumentNo =
                                                                "";
                                                              if (
                                                                doc.documentType ===
                                                                "PI"
                                                              ) {
                                                                finalDocumentNo =
                                                                  selected.documentNo ||
                                                                  selected.purchaseInvoiceNo;
                                                              } else if (
                                                                doc.documentType ===
                                                                "PO"
                                                              ) {
                                                                finalDocumentNo =
                                                                  selected.documentNo ||
                                                                  selected.noPO;
                                                              } else if (
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

                                                              newDocs[
                                                                index
                                                              ] =
                                                                {
                                                                  ...newDocs[
                                                                    index
                                                                  ],
                                                                  documentNo:
                                                                    finalDocumentNo,
                                                                  documentType:
                                                                    doc.documentType,
                                                                };

                                                              setEditLinkedDocs(
                                                                newDocs,
                                                              );
                                                              setDocumentNoSearchTerms(
                                                                {
                                                                  ...documentNoSearchTerms,
                                                                  [index]:
                                                                    "",
                                                                },
                                                              );
                                                              setOpenDocumentNoDropdown(
                                                                {
                                                                  ...openDocumentNoDropdown,
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
                                                                  doc.documentNo ||
                                                                  ""
                                                                }
                                                                readOnly
                                                                className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
                                                              />
                                                            </SelectTrigger>

                                                            {/* Dropdown list dengan kolom search */}
                                                            <SelectContent
                                                              className="p-0 border border-gray-300 rounded-md overflow-hidden"
                                                              onMouseDown={(
                                                                e,
                                                              ) =>
                                                                e.preventDefault()
                                                              }
                                                            >
                                                              {/* Search box di dalam dropdown */}
                                                              <div
                                                                className="px-3 py-2 border-b border-gray-300 bg-white"
                                                                onMouseDown={(
                                                                  e,
                                                                ) =>
                                                                  e.preventDefault()
                                                                }
                                                              >
                                                                <input
                                                                  type="text"
                                                                  placeholder="Search document no or type..."
                                                                  value={
                                                                    documentNoSearchTerms[
                                                                      index
                                                                    ] ||
                                                                    ""
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    setDocumentNoSearchTerms(
                                                                      {
                                                                        ...documentNoSearchTerms,
                                                                        [index]:
                                                                          e
                                                                            .target
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
                                                                  autoFocus={
                                                                    true
                                                                  }
                                                                />
                                                              </div>

                                                              {/* Header */}
                                                              <div className="px-3 py-2 border-b border-gray-300 bg-gray-100 text-xs font-semibold">
                                                                Document
                                                                No
                                                              </div>

                                                              {/* Items (filtered) - Display based on documentType */}
                                                              {doc.documentType ===
                                                                "IC" &&
                                                                mockImportCostData
                                                                  .filter(
                                                                    (
                                                                      ic,
                                                                    ) =>
                                                                      !editLinkedDocs.some(
                                                                        (
                                                                          d,
                                                                        ) =>
                                                                          d.documentNo ===
                                                                          ic.icNo,
                                                                      ) &&
                                                                      (
                                                                        ic.icNo ||
                                                                        ""
                                                                      )
                                                                        .toLowerCase()
                                                                        .includes(
                                                                          (
                                                                            documentNoSearchTerms[
                                                                              index
                                                                            ] ||
                                                                            ""
                                                                          ).toLowerCase(),
                                                                        ),
                                                                  )
                                                                  .map(
                                                                    (
                                                                      ic,
                                                                    ) => (
                                                                      <SelectItem
                                                                        key={
                                                                          "ic-" +
                                                                          ic.id
                                                                        }
                                                                        value={
                                                                          ic.icNo
                                                                        }
                                                                        className="!p-0"
                                                                      >
                                                                        <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                                          {
                                                                            ic.icNo
                                                                          }
                                                                        </div>
                                                                      </SelectItem>
                                                                    ),
                                                                  )}
                                                              {doc.documentType ===
                                                                "SR" &&
                                                                mockShipmentRequestData
                                                                  .filter(
                                                                    (
                                                                      sr,
                                                                    ) =>
                                                                      !editLinkedDocs.some(
                                                                        (
                                                                          d,
                                                                        ) =>
                                                                          d.documentNo ===
                                                                          sr.srNum,
                                                                      ) &&
                                                                      (
                                                                        sr.srNum ||
                                                                        ""
                                                                      )
                                                                        .toLowerCase()
                                                                        .includes(
                                                                          (
                                                                            documentNoSearchTerms[
                                                                              index
                                                                            ] ||
                                                                            ""
                                                                          ).toLowerCase(),
                                                                        ),
                                                                  )
                                                                  .map(
                                                                    (
                                                                      sr,
                                                                    ) => (
                                                                      <SelectItem
                                                                        key={
                                                                          "sr-" +
                                                                          sr.id
                                                                        }
                                                                        value={
                                                                          sr.srNum
                                                                        }
                                                                        className="!p-0"
                                                                      >
                                                                        <div className="px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-200 w-full">
                                                                          {
                                                                            sr.srNum
                                                                          }
                                                                        </div>
                                                                      </SelectItem>
                                                                    ),
                                                                  )}
                                                            </SelectContent>
                                                          </Select>
                                                        </TableCell>
                                                      )}
                                                      <TableCell className="w-16 text-center">
                                                        <Button
                                                          type="button"
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={() => {
                                                            const docToDelete =
                                                              editLinkedDocs[
                                                                index
                                                              ];
                                                            let indicesToDelete =
                                                              [
                                                                index,
                                                              ];

                                                            // If deleting PI, also delete related PO
                                                            if (
                                                              docToDelete.documentType ===
                                                              "PI"
                                                            ) {
                                                              const relatedPOIndex =
                                                                editLinkedDocs.findIndex(
                                                                  (
                                                                    d,
                                                                  ) =>
                                                                    d.documentType ===
                                                                    "PO",
                                                                );
                                                              if (
                                                                relatedPOIndex !==
                                                                -1
                                                              ) {
                                                                indicesToDelete.push(
                                                                  relatedPOIndex,
                                                                );
                                                              }
                                                            }
                                                            // If deleting PO, also delete related PI
                                                            else if (
                                                              docToDelete.documentType ===
                                                              "PO"
                                                            ) {
                                                              const relatedPIIndex =
                                                                editLinkedDocs.findIndex(
                                                                  (
                                                                    d,
                                                                  ) =>
                                                                    d.documentType ===
                                                                    "PI",
                                                                );
                                                              if (
                                                                relatedPIIndex !==
                                                                -1
                                                              ) {
                                                                indicesToDelete.push(
                                                                  relatedPIIndex,
                                                                );
                                                              }
                                                            }

                                                            // Delete all indices (sort in reverse to avoid index shifting)
                                                            const sortedIndices =
                                                              indicesToDelete.sort(
                                                                (
                                                                  a,
                                                                  b,
                                                                ) =>
                                                                  b -
                                                                  a,
                                                              );
                                                            const newDocs =
                                                              editLinkedDocs.filter(
                                                                (
                                                                  _,
                                                                  i,
                                                                ) =>
                                                                  !sortedIndices.includes(
                                                                    i,
                                                                  ),
                                                              );
                                                            setEditLinkedDocs(
                                                              newDocs,
                                                            );
                                                          }}
                                                        >
                                                          <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                      </TableCell>
                                                    </TableRow>
                                                  ),
                                                )}
                                              </>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </TabsContent>
                                  </Tabs>

                                  {/* Audit Trail in Edit Mode */}
                                  {selectedDetail?.id &&
                                    apNoteAuditTrails[
                                      selectedDetail.id
                                    ] &&
                                    apNoteAuditTrails[
                                      selectedDetail.id
                                    ].length > 0 && (
                                      <Card className="p-4 border-purple-100">
                                        <div className="flex items-center gap-2 mb-3">
                                          <ClockIcon className="h-5 w-5 text-purple-600" />
                                          <h4 className="text-purple-900">
                                            Audit Trail
                                          </h4>
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                          {selectedDetail?.id &&
                                            apNoteAuditTrails[
                                              selectedDetail.id
                                            ].map(
                                              (entry, idx) => (
                                                <div
                                                  key={`auditentry-viewdetail-${entry.timestamp}-${idx}`}
                                                  className="flex items-start gap-3 text-sm border-l-2 border-purple-300 pl-3 py-2"
                                                >
                                                  <div className="flex-1">
                                                    <div className="text-gray-700 mb-1">
                                                      {
                                                        entry.action
                                                      }
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                      <User className="h-3 w-3" />
                                                      <span>
                                                        {
                                                          entry.user
                                                        }
                                                      </span>
                                                      <span>
                                                        •
                                                      </span>
                                                      <ClockIcon className="h-3 w-3" />
                                                      <span>
                                                        {
                                                          entry.timestamp
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                        </div>
                                      </Card>
                                    )}
                                </div>
                              );
                            })()}
                        </>
                      )}
                    </div>

                    {/* Footer: Financial Summary & Action Buttons */}
                    {!isEditMode && (
                      <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-4 pb-4 space-y-4">
                        {/* Financial Summary with Remarks */}
                        {activeDetailTab === "items" && (
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
                                  className="flex-1 resize-none min-h-[152px]"
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
                                  <span className="text-gray-700 text-sm flex-1 font-bold">
                                    Discount
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
                                        selectedDetail.discount ||
                                          0,
                                      ),
                                      selectedDetail.currency ||
                                        "IDR",
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
                                        selectedDetail.totalInvoice -
                                          (selectedDetail.discount ||
                                            0) +
                                          (selectedDetail.tax ||
                                            0) -
                                          (selectedDetail.pph ||
                                            0),
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
                            variant="outline"
                            onClick={() =>
                              setSelectedDetail(null)
                            }
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            Close
                          </Button>
                          <Button
                            onClick={handleStartEdit}
                            disabled={selectedDetail?.isVoided}
                            className={
                              selectedDetail?.isVoided
                                ? "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Edit Mode Footer */}
                    {isEditMode && (
                      <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-4 pb-4 space-y-4">
                        {/* Input Grid for Discount, Tax, PPH */}
                        <div className="grid grid-cols-3 gap-4">
                          {/* Discount Input */}
                          <div>
                            <Label className="text-sm font-bold">
                              Discount (
                              {editFormData?.currency || "IDR"})
                            </Label>
                            <Input
                              type="text"
                              value={formatNumber(
                                editFormData?.discount || 0,
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

                                // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                                const formatted =
                                  formatNumber(newDiscount);
                                const integerPart =
                                  formatted.split(",")[0];
                                if (integerPart.length > 13) {
                                  return; // Don't update if it exceeds max length
                                }

                                setEditFormData({
                                  ...editFormData,
                                  discount: newDiscount,
                                });

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
                              placeholder="0,00"
                              className="mt-1"
                            />
                          </div>

                          {/* Tax Input */}
                          <div>
                            <Label className="text-sm font-bold">
                              PPN (
                              {editFormData?.currency || "IDR"})
                            </Label>
                            <Input
                              type="text"
                              value={formatNumber(
                                editFormData?.tax || 0,
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

                                // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                                const formatted =
                                  formatNumber(newTax);
                                const integerPart =
                                  formatted.split(",")[0];
                                if (integerPart.length > 13) {
                                  return; // Don't update if it exceeds max length
                                }

                                setEditFormData({
                                  ...editFormData,
                                  tax: newTax,
                                });

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
                              placeholder="0,00"
                              className="mt-1"
                            />
                          </div>

                          {/* PPH Input */}
                          <div>
                            <Label className="text-sm font-bold">
                              PPH (
                              {editFormData?.currency || "IDR"})
                            </Label>
                            <Input
                              type="text"
                              value={formatNumber(
                                editFormData?.pph || 0,
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

                                // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                                const formatted =
                                  formatNumber(newPph);
                                const integerPart =
                                  formatted.split(",")[0];
                                if (integerPart.length > 13) {
                                  return; // Don't update if it exceeds max length
                                }

                                setEditFormData({
                                  ...editFormData,
                                  pph: newPph,
                                });

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
                                value={editFormData.remarks || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
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
                                  {editFormData?.currency ||
                                    "IDR"}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-right"></span>
                                <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                  {formatNumber(
                                    editAccountItems.length > 0
                                      ? editAccountItems.reduce(
                                          (sum, item) =>
                                            sum +
                                            item.totalAmount,
                                          0,
                                        )
                                      : editLinkedDocs.reduce(
                                          (sum, doc) =>
                                            sum +
                                            (doc.totalAmount ||
                                              0),
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
                                  {editFormData?.currency ||
                                    "IDR"}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-right font-bold">
                                  (
                                </span>
                                <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                  {formatNumber(
                                    Math.abs(
                                      editFormData?.discount || 0,
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
                                  {editFormData?.currency ||
                                    "IDR"}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-right"></span>
                                <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                  {formatNumber(
                                    editFormData?.tax || 0,
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
                                  {editFormData?.currency ||
                                    "IDR"}
                                </span>
                                <span className="text-gray-700 text-sm w-4 text-right font-bold">
                                  (
                                </span>
                                <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                                  {formatNumber(
                                    Math.abs(
                                      editFormData?.pph || 0,
                                    ),
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
                                    {editFormData?.currency ||
                                      "IDR"}
                                  </span>
                                  <span className="text-gray-700 text-sm w-4 text-right"></span>
                                  <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                    {formatNumber(
                                      (editAccountItems.length > 0
                                        ? editAccountItems.reduce(
                                            (sum, item) =>
                                              sum +
                                              (item.totalAmount ||
                                                0),
                                            0,
                                          )
                                        : editLinkedDocs.reduce(
                                            (sum, doc) =>
                                              sum +
                                              (doc.totalAmount ||
                                                0),
                                            0,
                                          )) -
                                        (editFormData?.discount ||
                                          0) +
                                        (editFormData?.tax || 0) -
                                        (editFormData?.pph || 0),
                                    )}
                                  </span>
                                  <span className="text-gray-700 text-sm w-4 text-left"></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleEditAPNote}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Create Expense Note Dialog */}
            <Dialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            >
              <DialogContent
                ref={mainDialogContentRef}
                className="w-[2700px] h-[800px] flex flex-col"
              >
                <DialogHeader className="space-y-1 flex-shrink-0">
                  <DialogTitle className="text-purple-900">
                    Create Expense Note
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new Expense Note
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
                                      } // otomatis select isi
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

                                        // setelah update, set caret kembali ke sebelum koma
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
                              };
                              setLinkedDocs([
                                ...linkedDocs,
                                newDoc,
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
                                      value={
                                        doc.documentType || ""
                                      }
                                      onValueChange={(value) => {
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
                                      }}
                                    >
                                      <SelectTrigger className="min-w-[200px]">
                                        <SelectValue placeholder="Select document type">
                                          {doc.documentTypeLabel ||
                                            "Select document type"}
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
                                            open={
                                              openLinkedDocDropdown[
                                                `${index}-PI`
                                              ] || false
                                            }
                                            onOpenChange={(
                                              open,
                                            ) =>
                                              setOpenLinkedDocDropdown(
                                                {
                                                  ...openLinkedDocDropdown,
                                                  [`${index}-PI`]:
                                                    open,
                                                },
                                              )
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
                                            <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300">
                                              <input
                                                type="text"
                                                placeholder="Purchase Invoice"
                                                value={
                                                  doc.documentNo ||
                                                  ""
                                                }
                                                readOnly
                                                className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
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
                                                  // Get the PI number from mockpurchaseInvoice
                                                  const piNo = pi.purchaseInvoiceNo;
                                                  const poNo = pi.noPO;

                                                  // Check if already linked in current dialog
                                                  const inCurrentDialog =
                                                    linkedDocs.some(
                                                      (d, idx) =>
                                                        (d.documentNo ===
                                                          piNo ||
                                                          d.documentNo ===
                                                            poNo ||
                                                          d.documentNoPO ===
                                                            piNo ||
                                                          d.documentNoPO ===
                                                            poNo) &&
                                                        idx !== index,
                                                    );

                                                  // Check if already linked in saved AP Notes (linkedDocs)
                                                  const inSavedLinkedDocs =
                                                    apNoteData.some(
                                                      (apNote) =>
                                                        apNote.linkedDocs &&
                                                        apNote.linkedDocs.some(
                                                          (doc) =>
                                                            doc.documentNo ===
                                                              piNo ||
                                                            doc.documentNo ===
                                                              poNo ||
                                                            doc.documentNoPO ===
                                                              piNo ||
                                                            doc.documentNoPO ===
                                                              poNo,
                                                        ),
                                                    );

                                                  // Also check if document appears in any item description or ID
                                                  const inItems =
                                                    apNoteData.some(
                                                      (apNote) =>
                                                        apNote.items &&
                                                        apNote.items.some(
                                                          (item) =>
                                                            item.description ===
                                                              piNo ||
                                                            item.description ===
                                                              poNo ||
                                                            item.accountCode ===
                                                              piNo ||
                                                            item.accountCode ===
                                                              poNo ||
                                                            item.id === piNo ||
                                                            item.id === poNo,
                                                        ),
                                                    );

                                                  const matchesSearch =
                                                    piNo
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
                                                    !inSavedLinkedDocs &&
                                                    !inItems &&
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
                                            open={
                                              openLinkedDocDropdown[
                                                `${index}-PO`
                                              ] || false
                                            }
                                            onOpenChange={(
                                              open,
                                            ) =>
                                              setOpenLinkedDocDropdown(
                                                {
                                                  ...openLinkedDocDropdown,
                                                  [`${index}-PO`]:
                                                    open,
                                                },
                                              )
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
                                            <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300">
                                              <input
                                                type="text"
                                                placeholder="Purchase Order"
                                                value={
                                                  doc.documentNoPO ||
                                                  ""
                                                }
                                                readOnly
                                                className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
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
                                                  // Get the PI and PO numbers from mockpurchaseInvoice
                                                  const piNo = pi.purchaseInvoiceNo;
                                                  const poNo = pi.noPO;

                                                  // Check if already linked in current dialog
                                                  const isLinked =
                                                    linkedDocs.some(
                                                      (d, idx) =>
                                                        (d.documentNoPO ===
                                                          poNo ||
                                                          d.documentNo ===
                                                            poNo ||
                                                          d.documentNoPO ===
                                                            piNo ||
                                                          d.documentNo ===
                                                            piNo) &&
                                                        idx !== index,
                                                    );

                                                  // Check if already linked in saved AP Notes
                                                  const inSavedLinkedDocs =
                                                    apNoteData.some(
                                                      (apNote) =>
                                                        apNote.linkedDocs &&
                                                        apNote.linkedDocs.some(
                                                          (doc) =>
                                                            doc.documentNoPO ===
                                                              poNo ||
                                                            doc.documentNo ===
                                                              poNo ||
                                                            doc.documentNoPO ===
                                                              piNo ||
                                                            doc.documentNo ===
                                                              piNo,
                                                        ),
                                                    );

                                                  // Also check if document appears in any item
                                                  const inItems =
                                                    apNoteData.some(
                                                      (apNote) =>
                                                        apNote.items &&
                                                        apNote.items.some(
                                                          (item) =>
                                                            item.description ===
                                                              poNo ||
                                                            item.description ===
                                                              piNo ||
                                                            item.accountCode ===
                                                              poNo ||
                                                            item.accountCode ===
                                                              piNo ||
                                                            item.id === poNo ||
                                                            item.id === piNo,
                                                        ),
                                                    );

                                                  const matchesSearch =
                                                    poNo
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
                                                    !inSavedLinkedDocs &&
                                                    !inItems &&
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

                            // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                            const formatted =
                              formatNumber(newDiscount);
                            const integerPart =
                              formatted.split(",")[0];
                            if (integerPart.length > 13) {
                              return; // Don't update if it exceeds max length
                            }

                            setApNoteForm({
                              ...apNoteForm,
                              discount: newDiscount,
                            });

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

                            // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                            const formatted =
                              formatNumber(newTax);
                            const integerPart =
                              formatted.split(",")[0];
                            if (integerPart.length > 13) {
                              return; // Don't update if it exceeds max length
                            }

                            setApNoteForm({
                              ...apNoteForm,
                              tax: newTax,
                            });

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

                            // Check if formatted length exceeds 13 characters (max 13 digits, not counting ,00)
                            const formatted =
                              formatNumber(newPph);
                            const integerPart =
                              formatted.split(",")[0];
                            if (integerPart.length > 13) {
                              return; // Don't update if it exceeds max length
                            }

                            setApNoteForm({
                              ...apNoteForm,
                              pph: newPph,
                            });

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
                                  <ClockIcon className="h-4 w-4 text-purple-600" />
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
                    <div className="flex justify-end gap-2">
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
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={
                          !apNoteForm.supplierName ||
                          !apNoteForm.invoiceNumber ||
                          !isSupplierSelected ||
                          (accountItems.length === 0 &&
                            linkedDocs.length === 0) ||
                          !isAccountItemsValid()
                        }
                      >
                        Save Expense Note
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Success Dialog - Expense Note Created */}
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
                    Expense Note Saved
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-sm text-gray-600 mb-1">
                      Expense Note No
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

                          return null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        // Switch to AP Note tab
                        setActiveTab("ap-note");

                        // Expand the newly created AP Note
                        const expandableId = `apn-${savedApNoteNo.replace(/\//g, "-")}`;
                        setExpandedItems(
                          (prev) =>
                            new Set([
                              expandableId,
                              ...Array.from(prev),
                            ]),
                        );

                        // Close dialogs and reset form
                        setShowSuccessDialog(false);
                        setShowCreateDialog(false);
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

            {/* No Linked Docs Warning Dialog */}
            <Dialog
              open={showNoLinkedDocsWarning}
              onOpenChange={setShowNoLinkedDocsWarning}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-yellow-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    No Linked Documents
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Continue without linking any documents?
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNoLinkedDocsWarning(false);
                        setShowCreateDialog(true);
                        setActiveCreateTabItems("links");
                        setTimeout(() => {
                          if (mainDialogScrollRef.current) {
                            mainDialogScrollRef.current.scrollTo({
                              top:
                                mainDialogScrollRef.current
                                  .scrollHeight + 500,
                              behavior: "smooth",
                            });
                          }
                        }, 100);
                      }}
                    >
                      No, Add Documents
                    </Button>
                    <Button
                      onClick={handleSaveWithoutLinkedDocs}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Yes, Continue
                    </Button>
                  </div>
                </div>
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
                    Void AP Note
                  </DialogTitle>
                  <DialogDescription>
                    Please provide a reason for voiding this AP
                    Note
                  </DialogDescription>
                </DialogHeader>
                {selectedForVoid && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-sm text-purple-700">
                        <span className="font-medium">
                          AP Note:{" "}
                        </span>
                        {selectedForVoid.apNoteNo}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedForVoid.supplierName} -{" "}
                        {formatCurrency(
                          selectedForVoid.totalInvoice,
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Void Date</Label>
                      <Input
                        type="date"
                        value={voidDate}
                        onChange={(e) =>
                          setVoidDate(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>
                        Void Reason
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={voidReason}
                        onChange={(e) =>
                          setVoidReason(e.target.value)
                        }
                        placeholder="Enter the reason for voiding this AP Note..."
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowVoidDialog(false);
                          setVoidReason("");
                          setSelectedForVoid(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleVoid}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={!voidReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Void
                      </Button>
                    </div>
                  </div>
                )}
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
                        const linkedDocs =
                          selectedForLinkedDocs?.linkedDocs;
                        if (Array.isArray(linkedDocs)) {
                          // Count actual cards that will be displayed
                          // PI/PO pairs will be displayed as 2 cards
                          let cardCount = 0;
                          linkedDocs.forEach((doc: any) => {
                            if (!doc) return;
                            const docType = doc.documentType || doc.type;
                            if (docType === "PI/PO") {
                              if (doc.documentNo) cardCount++;
                              if (doc.documentNoPO) cardCount++;
                            } else if (doc.documentNo || doc.docNo) {
                              cardCount++;
                            }
                          });
                          return cardCount;
                        }
                        return linkedDocs ? 1 : 0;
                      })()}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Documents linked with this Expense Note
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="space-y-3"
                  style={{ width: "500px" }}
                >
                  {(() => {
                    const linkedDocs =
                      selectedForLinkedDocs?.linkedDocs;
                    if (
                      !linkedDocs ||
                      (Array.isArray(linkedDocs) &&
                        linkedDocs.length === 0)
                    ) {
                      return (
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <p className="text-gray-500 text-sm">
                            No linked documents
                          </p>
                        </div>
                      );
                    }

                    // Handle array format linkedDocs (from created AP Notes)
                    if (Array.isArray(linkedDocs)) {
                      return linkedDocs.flatMap((doc: any, docIdx: number) => {
                        if (
                          !doc ||
                          (!doc.documentType && !doc.type) ||
                          (!doc.documentNo && !doc.docNo && !doc.documentNoPO)
                        ) {
                          return null;
                        }

                        // Support both old format (type, docNo) and new format (documentType, documentNo)
                        const docType =
                          doc.documentType || doc.type;
                        
                        // Handle PI/PO pairs - split into two separate cards
                        if (docType === "PI/PO") {
                          const piNo = doc.documentNo || "";
                          const poNo = doc.documentNoPO || "";
                          const cards = [];

                          // Add PI card if it exists
                          if (piNo) {
                            cards.push(
                              <div
                                key={`${docIdx}-pi`}
                                className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                                onClick={() => {
                                  setShowLinkedDocsDialog(false);
                                  onNavigateToPurchaseInvoice?.(piNo);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div>
                                      <p className="text-blue-700 font-medium">
                                        Purchase Invoice
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {piNo}
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
                            );
                          }

                          // Add PO card if it exists
                          if (poNo) {
                            cards.push(
                              <div
                                key={`${docIdx}-po`}
                                className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                                onClick={() => {
                                  setShowLinkedDocsDialog(false);
                                  onNavigateToPurchaseOrder?.(poNo);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    <div>
                                      <p className="text-indigo-700 font-medium">
                                        Purchase Order
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {poNo}
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

                          return cards;
                        }

                        // Handle single document types
                        const docNo = doc.documentNo || doc.docNo;

                        // Color and badge mapping
                        let borderColor = "border-blue-200";
                        let bgHoverColor = "hover:bg-blue-50";
                        let textColor = "text-blue-600";
                        let titleColor = "text-blue-700";
                        let badgeClass =
                          "bg-blue-100 text-blue-700 border-blue-200";
                        let badgeLabel = "DOC";
                        let handler = () =>
                          setShowLinkedDocsDialog(false);

                        if (
                          docType === "Purchase Invoice" ||
                          docType === "PI"
                        ) {
                          borderColor = "border-blue-200";
                          bgHoverColor = "hover:bg-blue-50";
                          textColor = "text-blue-600";
                          titleColor = "text-blue-700";
                          badgeClass =
                            "bg-blue-100 text-blue-700 border-blue-200";
                          badgeLabel = "PI";
                          handler = () => {
                            setShowLinkedDocsDialog(false);
                            onNavigateToPurchaseInvoice?.(docNo);
                          };
                        } else if (
                          docType === "Purchase Order" ||
                          docType === "PO"
                        ) {
                          borderColor = "border-indigo-200";
                          bgHoverColor = "hover:bg-indigo-50";
                          textColor = "text-indigo-600";
                          titleColor = "text-indigo-700";
                          badgeClass =
                            "bg-indigo-100 text-indigo-700 border-indigo-200";
                          badgeLabel = "PO";
                          handler = () => {
                            setShowLinkedDocsDialog(false);
                            onNavigateToPurchaseOrder?.(docNo);
                          };
                        } else if (
                          docType === "Import Cost" ||
                          docType === "IC"
                        ) {
                          borderColor = "border-amber-200";
                          bgHoverColor = "hover:bg-amber-50";
                          textColor = "text-amber-600";
                          titleColor = "text-amber-700";
                          badgeClass =
                            "bg-amber-100 text-amber-700 border-amber-200";
                          badgeLabel = "IC";
                          handler = () => {
                            setShowLinkedDocsDialog(false);
                            onNavigateToImportCost?.(docNo);
                          };
                        } else if (
                          docType === "Shipment Request" ||
                          docType === "SR"
                        ) {
                          borderColor = "border-green-200";
                          bgHoverColor = "hover:bg-green-50";
                          textColor = "text-green-600";
                          titleColor = "text-green-700";
                          badgeClass =
                            "bg-green-100 text-green-700 border-green-200";
                          badgeLabel = "SR";
                          handler = () => {
                            setShowLinkedDocsDialog(false);
                            onNavigateToShipmentRequest?.(docNo);
                          };
                        }

                        // Determine display title based on document type
                        let displayTitle = docNo;
                        if (docType === "PI") {
                          displayTitle = "Purchase Invoice";
                        } else if (docType === "PO") {
                          displayTitle = "Purchase Order";
                        } else if (docType === "IC") {
                          displayTitle = "Import Cost";
                        } else if (docType === "SR") {
                          displayTitle = "Shipment Request";
                        } else if (
                          docType === "Purchase Invoice"
                        ) {
                          displayTitle = "Purchase Invoice";
                        } else if (docType === "Purchase Order") {
                          displayTitle = "Purchase Order";
                        } else if (docType === "Import Cost") {
                          displayTitle = "Import Cost";
                        } else if (
                          docType === "Shipment Request"
                        ) {
                          displayTitle = "Shipment Request";
                        }

                        return (
                          <div
                            key={`${docType}-${docNo}`}
                            className={`p-4 bg-white border ${borderColor} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${bgHoverColor}`}
                            onClick={handler}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText
                                  className={`w-5 h-5 ${textColor}`}
                                />
                                <div>
                                  <p
                                    className={`${titleColor} font-medium`}
                                  >
                                    {displayTitle}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {docNo}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={badgeClass}
                              >
                                {badgeLabel}
                              </Badge>
                            </div>
                          </div>
                        );
                      });
                    }

                    // Single document (non-array format) - old format with type and docNo
                    if (!Array.isArray(linkedDocs) && typeof linkedDocs === 'object') {
                      const docType = linkedDocs.type;
                      const docNo = linkedDocs.docNo;

                      if (!docType || !docNo) {
                        return null;
                      }

                      // Color and badge mapping
                      let borderColor = "border-blue-200";
                      let bgHoverColor = "hover:bg-blue-50";
                      let textColor = "text-blue-600";
                      let titleColor = "text-blue-700";
                      let badgeClass =
                        "bg-blue-100 text-blue-700 border-blue-200";
                      let badgeLabel = "DOC";
                      let handler = () =>
                        setShowLinkedDocsDialog(false);

                      if (docType === "Purchase Invoice") {
                        borderColor = "border-blue-200";
                        bgHoverColor = "hover:bg-blue-50";
                        textColor = "text-blue-600";
                        titleColor = "text-blue-700";
                        badgeClass =
                          "bg-blue-100 text-blue-700 border-blue-200";
                        badgeLabel = "PI";
                        handler = () => {
                          setShowLinkedDocsDialog(false);
                          onNavigateToPurchaseInvoice?.(docNo);
                        };
                      } else if (docType === "Purchase Order") {
                        borderColor = "border-indigo-200";
                        bgHoverColor = "hover:bg-indigo-50";
                        textColor = "text-indigo-600";
                        titleColor = "text-indigo-700";
                        badgeClass =
                          "bg-indigo-100 text-indigo-700 border-indigo-200";
                        badgeLabel = "PO";
                        handler = () => {
                          setShowLinkedDocsDialog(false);
                          onNavigateToPurchaseOrder?.(docNo);
                        };
                      } else if (docType === "Import Cost") {
                        borderColor = "border-amber-200";
                        bgHoverColor = "hover:bg-amber-50";
                        textColor = "text-amber-600";
                        titleColor = "text-amber-700";
                        badgeClass =
                          "bg-amber-100 text-amber-700 border-amber-200";
                        badgeLabel = "IC";
                        handler = () => {
                          setShowLinkedDocsDialog(false);
                          onNavigateToImportCost?.(docNo);
                        };
                      } else if (docType === "Shipment Request") {
                        borderColor = "border-green-200";
                        bgHoverColor = "hover:bg-green-50";
                        textColor = "text-green-600";
                        titleColor = "text-green-700";
                        badgeClass =
                          "bg-green-100 text-green-700 border-green-200";
                        badgeLabel = "SR";
                        handler = () => {
                          setShowLinkedDocsDialog(false);
                          onNavigateToShipmentRequest?.(docNo);
                        };
                      }

                      return (
                        <div
                          className={`p-4 bg-white border ${borderColor} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${bgHoverColor}`}
                          onClick={handler}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText
                                className={`w-5 h-5 ${textColor}`}
                              />
                              <div>
                                <p className={`${titleColor} font-medium`}>
                                  {docType}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {docNo}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={badgeClass}
                            >
                              {badgeLabel}
                            </Badge>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* LINKED PVRs SECTION */}
                  {selectedForLinkedDocs &&
                    (() => {
                      const linkedPVRs = findLinkedPVRs(
                        "EN",
                        selectedForLinkedDocs.apNoteNo,
                      );
                      if (linkedPVRs.length === 0) return null;

                      return (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <p className="font-medium text-sm text-gray-700">
                              Linked PVRs
                            </p>
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-700 border-purple-200"
                            >
                              {linkedPVRs.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {linkedPVRs.map((pvr) => (
                              <div
                                key={pvr.pvrNo}
                                className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-purple-100"
                                onClick={() => {
                                  onNavigateToPVR?.(pvr.pvrNo);
                                  setShowLinkedDocsDialog(false);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <p className="text-purple-700 font-medium text-sm">
                                        {pvr.pvrNo}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {pvr.supplierName}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className="bg-purple-600 text-white">
                                    PVR
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
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
          </TabsContent>

          <TabsContent value="import-cost" className="mt-4">
            <ImportCost
              onAPNoteCreated={handleAPNoteFromIC}
              onNavigateToAPNote={handleNavigateToAPNote}
              selectedICNo={selectedICNo || internalSelectedICNo}
            />
          </TabsContent>
          <TabsContent value="shipment-request" className="mt-4">
            <ShipmentRequest
              onAPNoteCreated={handleAPNoteFromSR}
              onNavigateToAPNote={handleNavigateToAPNote}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }