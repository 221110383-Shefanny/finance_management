import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  formatDateToDDMMYYYY,
  getTodayYYYYMMDD,
  getTodayDDMMYYYY,
  isValidDate,
  convertDDMMYYYYtoYYYYMMDD,
} from "../utils/dateFormat";
import { formatNumber, formatCurrency } from "../utils/numberFormat";
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
  FileText,
  User,
  DollarSign,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Eye,
  Receipt,
  Edit,
  ClipboardList,
  MapPin,
  Link,
  Filter,
  Pencil,
  Trash2,
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
import { Checkbox } from "./ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  mockLinkedPOs,
  extractShipmentRequestsFromLinkedStructure,
  mockpurchaseInvoice,
  mockImportCosts,
  mockShipmentRequest,
  mockPVR,
  mockPurchaseOrder,
  mockExpenseNote,
  findLinkedPVRs,
} from "../mocks/mockData";
import { PVRDialogs } from "./PVRDialogs";

type ApprovalStatus = "Pending" | "Approved";
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

interface APNoteCreated {
  id: string;
  apNoteNo: string;
  docType: DocType;
  srId: string;
}

export interface APNoteDataFromSR {
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
  linkedSRId?: string;
  items?: any[];
  linkedDocs?: any[];
}

interface ShipmentRequestProps {
  onAPNoteCreated?: (apNoteData: APNoteDataFromSR) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseOrder?: (poNo: string) => void;
  onNavigateToPurchaseInvoice?: (docNo: string) => void;
  onNavigateToImportCost?: (docNo: string) => void;
  onNavigateToShipmentRequest?: (docNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
}

interface ShipmentRequestData {
  id: string;
  srId?: string;
  srNum: string;
  shipName: string;
  origin: string;
  destination: string;
  expenseType: string; // COA
  supplierName: string;
  totalShipmentRequest: number;
  currency: string; // IDR, USD, EUR, SGD
  payTo: string;
  company: PTType;
  approvalStatus: ApprovalStatus;
  approvalDate?: string;
  rejectionReason?: string;
  poNo?: string;
  invoiceNo?: string;
  linkedExpenseNoteId?: string;
  submittedDate?: string;
  docReceivedDate?: string;
  apNotes?: APNoteCreated[];
  isVoided?: boolean;
  tax?: number;
  pph?: number;
  discount?: number;
  items?: any[];
  linkedDocs?: any;
  linkedDocuments?: any[];
  otherCosts?: any[];
}

export default function ShipmentRequest({
  onAPNoteCreated,
  onNavigateToAPNote,
  onNavigateToPurchaseOrder,
  onNavigateToPurchaseInvoice,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToPVR,
}: ShipmentRequestProps = {}) {
  // Initialize with empty array - will load data in useEffect
  const [shipmentRequestData, setShipmentRequestData] =
    useState<ShipmentRequestData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] =
    useState<PTType>("ALL PT");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [activeFilterType, setActiveFilterType] = useState<
    "status" | "pt" | null
  >(null);
  const [selectedDetail, setSelectedDetail] =
    useState<ShipmentRequestData | null>(null);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [selectedForVoid, setSelectedForVoid] =
    useState<ShipmentRequestData | null>(null);

  // AP Note states
  const [showDocTypeSelection, setShowDocTypeSelection] =
    useState(false);
  const [showAPNoteDialog, setShowAPNoteDialog] =
    useState(false);
  const [showAPNoteListDialog, setShowAPNoteListDialog] =
    useState(false);
  const [selectedForAPNote, setSelectedForAPNote] =
    useState<ShipmentRequestData | null>(null);
  const [selectedDocType, setSelectedDocType] =
    useState<DocType>("AP NOTE");
  const [apNoteForm, setApNoteForm] = useState({
    apNoteNo:
      "APN-2025-" +
      String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
    Date: getTodayYYYYMMDD(),
    currency: "IDR",
    invoiceNumber: "",
    term: "CREDIT" as TermType,
    documentReceivedDate: getTodayYYYYMMDD(),
    remarks: "",
  });

  // Linked Documents states
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
    useState(false);
  const [selectedForLinkedDocs, setSelectedForLinkedDocs] =
    useState<ShipmentRequestData | null>(null);

  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [editDiscount, setEditDiscount] = useState(0);
  const [showOtherCostDialog, setShowOtherCostDialog] = useState(false);
  const [otherCosts, setOtherCosts] = useState<any[]>([]);

  const onUpdateInvoice = (updatedSR: any) => {
    setShipmentRequestData((prev) =>
      prev.map((sr) => (sr.id === updatedSR.id ? updatedSR : sr)),
    );
    setSelectedDetail(updatedSR);
  };

  // Edit mode states (for View Details dialog)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] =
    useState<ShipmentRequestData | null>(null);

  // Description dialog state
  const [showDescriptionDialog, setShowDescriptionDialog] =
    useState(false);
  const [selectedDescription, setSelectedDescription] =
    useState("");

  // Create form stateb
  const [createForm, setCreateForm] = useState({
    srNum:
      "SR-2025-" +
      String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
    expenseType: "5101 - Freight Charges",
    supplierName: "",
    totalShipmentRequest: 0,
    payTo: "Supplier",
    company: "WNS" as PTType,
    poNo: "",
    invoiceNo: "",
  });

  // Calendar Filter states
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");

  // PVR states
  const [pvrData, setPvrData] = useState<any[]>([]);
  const [showCreatePVRDialog, setShowCreatePVRDialog] = useState(false);
  const [showSupplierPVRDropdown, setShowSupplierPVRDropdown] = useState(false);
  const [supplierSearchTermPVR, setSupplierSearchTermPVR] = useState("");
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState("");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState("");
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [showPVRSuccessDialog, setShowPVRSuccessDialog] = useState(false);
  const [showFullyPaidWarning, setShowFullyPaidWarning] = useState(false);
  const [savedPvrNo, setSavedPvrNo] = useState("");
  const [savedPvrLinkedDocs, setSavedPvrLinkedDocs] = useState<any[]>([]);
  const [linkedDocsRefresh, setLinkedDocsRefresh] = useState(0);
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
    pt: "GMI" as any,
    bankAccount: "",
    paymentMethod: "Transfer" as "Transfer" | "Cash",
    reference: "",
    remarks: "",
  });

  // Supplier Master Data (mock for now, can be extracted from existing data)
  const supplierMasterData = [
    { name: "P.T. GLOBAL MARITIME INDONESIA", category: "LOCAL" },
    { name: "P.T. ADMIRAL LINES", category: "LOCAL" },
    { name: "SINAR MAS", category: "LOCAL" },
    { name: "Wartsila Indonesia", category: "LOCAL" },
    { name: "Caterpillar Singapore", category: "OVERSEAS" },
    { name: "GLOBAL MARITIME INC.", category: "OVERSEAS" },
  ];

  const filteredSuppliers = supplierMasterData.filter(s => 
    s.name.toLowerCase().includes(supplierSearchTermPVR.toLowerCase())
  );

  // Load PVR data from localStorage
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

    if (showCreatePVRDialog || showLinkedDocsDialog) {
      loadPVRData();
    }

    const handleStorageChange = (e: any) => {
      if (e.key === "storage_pvrData" || e.key === "pvrData") {
        loadPVRData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage_pvrData", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_pvrData", handleStorageChange);
    };
  }, [showCreatePVRDialog, showLinkedDocsDialog]);

  // ✅ LOAD DATA ON MOUNT - Primary effect untuk inisialisasi data
  useEffect(() => {
    const loadShipmentRequestData = () => {
      // Primary: Try to get from localStorage (user modifications)
      // ⚠️ IMPORTANT: Only use localStorage if it contains VALID data (length > 0)
      const stored = localStorage.getItem(
        "shipmentRequest_data",
      );
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
              "ShipmentRequest data loaded from localStorage:",
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
          console.error(
            "Failed to parse shipmentRequest_data:",
            e,
          );
        }
      }

      // Secondary: Get from centralized mock data structure
      const srsFromStructure =
        extractShipmentRequestsFromLinkedStructure();
      if (srsFromStructure && srsFromStructure.length > 0) {
        console.log(
          "ShipmentRequest data loaded from mock structure:",
          srsFromStructure.length,
          "records",
        );
        return srsFromStructure;
      }

      // Final fallback: Empty array (no mock data available)
      console.warn(
        "⚠️ No shipment request data found in localStorage or centralized structure",
      );
      return [];
    };

    // Load data when component mounts
    const initialData = loadShipmentRequestData();
    setShipmentRequestData(initialData);
  }, []); // Empty dependency - only run once on mount

  // ✅ DEBUG: Function to clear localStorage and reload
  // Call this from console: window.clearSRData()
  useEffect(() => {
    (window as any).clearSRData = () => {
      console.log(
        "🧹 Clearing ShipmentRequest localStorage...",
      );
      localStorage.removeItem("shipmentRequest_data");
      localStorage.removeItem("apNote_mapping");
      localStorage.removeItem("srToAPNote_mapping");
      console.log("✅ localStorage cleared - reloading...");
      window.location.reload();
    };
  }, []);

  // Save entire shipmentRequestData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "shipmentRequest_data",
      JSON.stringify(shipmentRequestData),
    );
  }, [shipmentRequestData]);

  // Reload shipmentRequestData from localStorage when tab becomes active
  useEffect(() => {
    const reloadData = () => {
      const stored = localStorage.getItem(
        "shipmentRequest_data",
      );
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setShipmentRequestData(parsedData);
          console.log(
            "ShipmentRequest data reloaded from localStorage",
          );
        } catch (e) {
          console.error(
            "Failed to reload shipmentRequest_data:",
            e,
          );
        }
      }
    };

    // Reload on focus (when user switches back to this tab)
    const handleFocus = () => {
      console.log(
        "ShipmentRequest tab focused - reloading data",
      );
      reloadData();
    };

    window.addEventListener("focus", handleFocus);

    // Also listen to custom event from tab switch
    const handleTabSwitch = () => {
      console.log(
        "Tab switched to Shipment Request - reloading data",
      );
      reloadData();
    };
    window.addEventListener(
      "shipmentRequestTabActive",
      handleTabSwitch,
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "shipmentRequestTabActive",
        handleTabSwitch,
      );
    };
  }, []);

  // Handle navigation from APNote component
  useEffect(() => {
    const handleNavigateToSR = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { documentNo } = customEvent.detail;

      console.log(
        "=== ShipmentRequest navigateToShipmentRequest event ===",
        documentNo,
      );

      // Find the SR with matching srNum
      const matchingSR = shipmentRequestData.find(
        (item) => item.srNum === documentNo,
      );

      if (matchingSR) {
        console.log(
          "Found matching SR:",
          matchingSR.srNum,
          "ID:",
          matchingSR.id || matchingSR.srId,
        );
        // Expand the matching SR card
        const srId = matchingSR.id || matchingSR.srId;
        console.log("✅ About to setExpandedItems with:", srId);
        if (srId) {
          setExpandedItems(new Set([srId]));
        }

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(
            `sr-card-${matchingSR.srNum}`,
          );
          console.log(
            "Looking for element:",
            `sr-card-${matchingSR.srNum}`,
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
          "No matching SR found for documentNo:",
          documentNo,
        );
      }
    };

    window.addEventListener(
      "navigateToShipmentRequest",
      handleNavigateToSR,
    );

    return () => {
      window.removeEventListener(
        "navigateToShipmentRequest",
        handleNavigateToSR,
      );
    };
  }, [shipmentRequestData]);

  const filteredData = shipmentRequestData.filter((item) => {
    const matchesSearch =
      item.srNum
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

  const pendingCount = shipmentRequestData.filter(
    (d) => d.approvalStatus === "Pending",
  ).length;
  const approvedCount = shipmentRequestData.filter(
    (d) => d.approvalStatus === "Approved",
  ).length;
  const submissionCount = shipmentRequestData.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  function formatNumber(value: number): string {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ✅ Helper function: Get linked PO data from SR
  const getLinkedPOData = (
    srItem: ShipmentRequestData | null,
  ) => {
    // Handle null/undefined input
    if (!srItem) {
      return {
        mockItems: [],
        linkedPI: null,
        piNumber: "N/A",
        calculateAmount: () => 0,
        mockPOData: null,
        poNumber: "N/A",
      };
    }

    // Find the PO in mockLinkedPOs that matches this SR
    let mockPOData = null;

    // First try: Find by PO number if it exists in srItem
    if (srItem.poNo) {
      mockPOData = mockLinkedPOs.find(
        (po) =>
          po.purchaseOrderNo === srItem.poNo,
      );
    }

    // Second try: Find by checking which PO has this SR linked in its linkedDocs
    if (!mockPOData) {
      mockPOData = mockLinkedPOs.find((po) => {
        if (!po.linkedDocs) return false;
        const docs = Array.isArray(po.linkedDocs)
          ? po.linkedDocs
          : [po.linkedDocs];
        return docs?.some(
          (doc: any) =>
            doc?.type === "Shipment Request" &&
            doc?.docNo === srItem.srNum,
        );
      });
    }

    // If still not found, return empty data
    if (!mockPOData) {
      return {
        mockItems: [],
        linkedPI: null,
        piNumber: "N/A",
        calculateAmount: () => 0,
        mockPOData: null,
        poNumber: "N/A",
      };
    }

    const mockItems = mockPOData?.items || [];
    const linkedPI = mockPOData?.purchaseInvoices?.[0];
    const piNumber = linkedPI?.purchaseInvoiceNo || "N/A";
    const poNumber =
      mockPOData?.purchaseOrderNo || "N/A";

    const calculateAmount = () => {
      return mockItems.reduce(
        (sum, item) =>
          sum + (item.quantity || 0) * (item.pricePerQty || 0),
        0,
      );
    };

    return {
      mockItems,
      linkedPI,
      piNumber,
      calculateAmount,
      mockPOData,
      poNumber,
    };
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    if (!expandAll) {
      // Expand all filtered items
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

  const handleVoid = () => {
    if (!selectedForVoid) return;

    const updatedData = shipmentRequestData.map((item) => {
      if (
        (item.id) ===
        (selectedForVoid.id)
      ) {
        return {
          ...item,
          isVoided: true,
        };
      }
      return item;
    });

    setShipmentRequestData(updatedData);
    setShowVoidDialog(false);
    setSelectedForVoid(null);
  };

  const handleAPNoteClick = (item: ShipmentRequestData) => {
    // Check if already has AP Notes - show list dialog (view only, no create if voided)
    if (item.apNotes && item.apNotes.length > 0) {
      setSelectedForAPNote(item);
      setShowAPNoteListDialog(true);
      return;
    }

    // Check if already approved
    if (item.approvalStatus !== "Approved") {
      alert(
        "⚠️ Warning: Shipment Request must be Approved first before creating AP Note!",
      );
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
    let totalInvoice = selectedForAPNote.totalShipmentRequest;
    if (selectedDocType === "AP DISC NOTE") {
      totalInvoice = -Math.abs(totalInvoice);
    }

    // Determine supplier category based on supplier name patterns
    const supplierCategory: SupplierCategory =
      selectedForAPNote.supplierName.match(/^(PT|CV)\s/i)
        ? "LOCAL"
        : "OVERSEAS";

    // Create full AP Note data to pass to APNote.tsx
    const fullAPNoteData: APNoteDataFromSR = {
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
      apNoteCreateDate: apNoteForm.Date,
      invoiceDate: apNoteForm.Date,
      createdBy: "SHEFANNY",
      term: apNoteForm.term,
      currency: apNoteForm.currency,
      remarks: apNoteForm.remarks,
      pt: selectedForAPNote.company,
      docType: selectedDocType,
      linkedSRId: selectedForAPNote.id,
      items: [],
      linkedDocs: [],
    };

    const newAPNote: APNoteCreated = {
      id: newAPNoteId,
      apNoteNo: apNoteForm.apNoteNo,
      docType: selectedDocType,
      srId: selectedForAPNote.id,
    };

    // Update shipment request data with new AP Note
    const updatedData = shipmentRequestData.map((item) => {
      if (
        (item.id) ===
        (selectedForAPNote.id)
      ) {
        return {
          ...item,
          apNotes: [...(item.apNotes || []), newAPNote],
        };
      }
      return item;
    });

    setShipmentRequestData(updatedData);

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

    alert(
      `${selectedDocType} ${apNoteForm.apNoteNo} created successfully and added to AP Note tab!`,
    );

    setShowAPNoteDialog(false);
    setSelectedForAPNote(null);

    // Reset form
    setApNoteForm({
      apNoteNo:
        "APN-2025-" +
        String(Math.floor(Math.random() * 1000)).padStart(
          3,
          "0",
        ),
      Date: getTodayYYYYMMDD(),
      currency: "IDR",
      invoiceNumber: "",
      term: "CREDIT",
      documentReceivedDate: getTodayYYYYMMDD(),
      remarks: "",
    });
    setSelectedDocType("AP NOTE");
  };

  const handleAPNoteNavigation = (apNoteNo: string) => {
    // Close dialog
    setShowAPNoteListDialog(false);
    setSelectedForAPNote(null);

    console.log("=== handleAPNoteNavigation ===");
    console.log("AP Note No:", apNoteNo);

    // Get AP Note ID from mapping
    const apNoteMapping = JSON.parse(
      localStorage.getItem("apNote_mapping") || "{}",
    );
    let apNoteId = apNoteMapping[apNoteNo];

    console.log("AP Note Mapping:", apNoteMapping);
    console.log("AP Note ID from mapping:", apNoteId);

    // If not found in mapping, try to create a mapping entry
    // This handles mock data and manually added AP Notes
    if (!apNoteId) {
      console.log(
        "AP Note ID not found in mapping, generating from apNoteNo hash",
      );
      // Generate a consistent ID for the AP Note based on its number
      apNoteId = "apn-" + apNoteNo.replace(/\//g, "-");
      apNoteMapping[apNoteNo] = apNoteId;
      localStorage.setItem(
        "apNote_mapping",
        JSON.stringify(apNoteMapping),
      );
      console.log("Generated and stored AP Note ID:", apNoteId);
    }

    // Store SR to APNote mapping for reverse navigation
    const srToAPNoteMapping = JSON.parse(
      localStorage.getItem("srToAPNote_mapping") || "{}",
    );
    if (selectedForAPNote) {
      srToAPNoteMapping[apNoteNo] = {
        srNum: selectedForAPNote.srNum,
        srId: selectedForAPNote.id,
        apNoteNo: apNoteNo,
        apNoteId: apNoteId,
      };
      localStorage.setItem(
        "srToAPNote_mapping",
        JSON.stringify(srToAPNoteMapping),
      );
      console.log(
        "Stored SR to APNote mapping:",
        srToAPNoteMapping,
      );
    }

    // Store in sessionStorage for APNote component
    sessionStorage.setItem(
      "linkedSRNumber",
      selectedForAPNote?.srNum || "",
    );
    sessionStorage.setItem(
      "linkedSRId",
      selectedForAPNote?.id || "",
    );
    sessionStorage.setItem("linkedAPNoteNo", apNoteNo);
    sessionStorage.setItem("selectedAPNoteId", apNoteId);

    console.log(
      "SessionStorage set with selectedAPNoteId:",
      apNoteId,
    );

    if (apNoteId && onNavigateToAPNote) {
      console.log(
        "Calling onNavigateToAPNote with ID:",
        apNoteId,
      );
      onNavigateToAPNote(apNoteId);
    } else {
      console.warn(
        "AP Note ID not found or callback not provided",
        "apNoteId:",
        apNoteId,
        "onNavigateToAPNote:",
        !!onNavigateToAPNote,
      );
      alert(`Could not navigate to AP Note: ${apNoteNo}`);
    }
  };

  const handleStartEdit = () => {
    if (selectedDetail) {
      setEditFormData({ ...selectedDetail });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (!selectedDetail || !editFormData) return;

    // Track changes
    const changes: string[] = [];

    if (
      selectedDetail.expenseType !== editFormData.expenseType
    ) {
      changes.push(
        `Expense Type: "${selectedDetail.expenseType}" → "${editFormData.expenseType}"`,
      );
    }
    if (
      selectedDetail.supplierName !== editFormData.supplierName
    ) {
      changes.push(
        `Supplier Name: "${selectedDetail.supplierName}" → "${editFormData.supplierName}"`,
      );
    }
    if (selectedDetail.payTo !== editFormData.payTo) {
      changes.push(
        `Pay To: "${selectedDetail.payTo}" → "${editFormData.payTo}"`,
      );
    }
    if (
      selectedDetail.totalShipmentRequest !==
      editFormData.totalShipmentRequest
    ) {
      changes.push(
        `Total: ${formatCurrency(selectedDetail.totalShipmentRequest)} → ${formatCurrency(editFormData.totalShipmentRequest)}`,
      );
    }
    if (selectedDetail.poNo !== editFormData.poNo) {
      changes.push(
        `PO No: "${selectedDetail.poNo || "N/A"}" → "${editFormData.poNo || "N/A"}"`,
      );
    }
    if (selectedDetail.invoiceNo !== editFormData.invoiceNo) {
      changes.push(
        `Invoice No: "${selectedDetail.invoiceNo || "N/A"}" → "${editFormData.invoiceNo || "N/A"}"`,
      );
    }

    // Update the shipment request data
    const updatedData = shipmentRequestData.map((item) =>
      (item.id) ===
      (selectedDetail.id)
        ? editFormData
        : item,
    );

    setShipmentRequestData(updatedData);

    // Update selectedDetail in real-time
    setSelectedDetail(editFormData);

    // Exit edit mode
    setIsEditMode(false);
    setEditFormData(null);

    if (changes.length > 0) {
      alert(
        "✅ Shipment Request updated successfully!\n\nChanges:\n" +
          changes.join("\n"),
      );
    } else {
      alert("✅ No changes were made.");
    }
  };

  const handleCreateShipmentRequest = () => {
    const newShipmentRequest: ShipmentRequestData = {
      id: Date.now().toString(),
      srNum: createForm.srNum,
      shipName: "",
      origin: "",
      destination: "",
      expenseType: createForm.expenseType,
      supplierName: createForm.supplierName,
      totalShipmentRequest: createForm.totalShipmentRequest,
      currency: "IDR",
      payTo: createForm.payTo,
      company: createForm.company,
      approvalStatus: "Pending",
      poNo: createForm.poNo,
      invoiceNo: createForm.invoiceNo,
      submittedDate: getTodayYYYYMMDD(),
    };

    setShipmentRequestData([
      newShipmentRequest,
      ...shipmentRequestData,
    ]);
    setShowCreateDialog(false);

    // Reset form
    setCreateForm({
      srNum:
        "SR-2025-" +
        String(Math.floor(Math.random() * 1000)).padStart(
          3,
          "0",
        ),
      expenseType: "5101 - Freight Charges",
      supplierName: "",
      totalShipmentRequest: 0,
      payTo: "Supplier",
      company: "WNS",
      poNo: "",
      invoiceNo: "",
    });
  };

  // PVR Helper Functions and Handlers
  const convertToStorageDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.replace(/\//g, "-").split("-");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        return dateStr;
      }
    }
    return dateStr;
  };

  const getTodayDate = () => getTodayDDMMYYYY();

  const generatePVRNumber = (pt: string, date: string): string => {
    if (!date) return "";
    const parts = date.split("/");
    if (parts.length !== 3) return "";
    
    const month = parts[1];
    const yearFull = parts[2];
    const yearLast2 = yearFull.slice(-2);
    
    let existingPVRs: any[] = [];
    try {
      const savedPVRs = localStorage.getItem("pvrData");
      if (savedPVRs) {
        existingPVRs = JSON.parse(savedPVRs);
      }
    } catch (error) {
      console.error("Failed to load PVR data:", error);
    }
    
    existingPVRs = [...existingPVRs, ...mockPVR];
    
    const pvrPattern = `PVR/${pt}.MDN/${yearLast2}${month}/`;
    const matchingPVRs = existingPVRs.filter((pvr: any) => 
      pvr.pvrNo && pvr.pvrNo.startsWith(pvrPattern)
    );
    
    let nextSeqNum = 1;
    if (matchingPVRs.length > 0) {
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
    return doc.piNo || doc.invoiceNo || doc.icNum || doc.srNum || "";
  };

  const resetPVRForm = () => {
    setPvrForm({
      pvrNo: "",
      pvrDate: "",
      supplierName: "",
      term: "Credit",
      currency: "IDR",
      rate: 1,
      pt: "GMI",
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
    if (!pvrForm.supplierName) {
      alert("Please select a supplier");
      return;
    }

    const hasPayableItems = linkedPIs.some(doc => doc.documentType !== "PO");
    if (!hasPayableItems) {
      alert("Please add at least one payable item");
      return;
    }

    try {
      const supplier = supplierMasterData.find(s => s.name === pvrForm.supplierName);
      const supplierCategory = supplier?.category || "LOCAL";

      const totalInvoice = linkedPIs
        .filter(doc => doc.documentType !== "PO")
        .reduce((sum: number, doc: any) => sum + (doc.totalAmount || 0), 0);

      const today = getTodayDDMMYYYY();
      const newPVR = {
        pvrNo: pvrForm.pvrNo || generatePVRNumber(pvrForm.pt, today),
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
          piNo: doc.piNo || doc.invoiceNo || doc.icNum || doc.srNum || "",
          amountPaid: doc.amountPaid !== undefined ? doc.amountPaid : doc.totalAmount,
          discount: doc.discount || 0
        }))
      };

      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      const updatedPVRs = [newPVR, ...existingPVRs];
      localStorage.setItem("pvrData", JSON.stringify(updatedPVRs));

      window.dispatchEvent(new Event("storage_pvrData"));

      setSavedPvrNo(newPVR.pvrNo);
      setSavedPvrLinkedDocs(newPVR.linkedDocs);
      setShowPVRSuccessDialog(true);
      setShowCreatePVRDialog(false);
      resetPVRForm();
      setLinkedPIs([]);
    } catch (error) {
      console.error("Error creating PVR:", error);
      alert("Failed to create PVR. Please try again.");
    }
  };

  return (
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
            ["all", "Pending", "Approved"].map((key) => {
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
          {shipmentRequestData.length}
        </span>{" "}
        documents
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="🔍 Search by SR Number or Invoice Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-purple-200 focus:border-purple-400"
        />
      </div>

      {/* Shipment Request List */}
      <div className="space-y-3">
        {filteredData.map((item) => {
          const itemId = item.srId || item.id;
          const isExpanded = expandedItems.has(itemId);
          console.log(
            `📌 SR Item - srId: ${item.srId}, id: ${item.id}, itemId: ${itemId}, isExpanded: ${isExpanded}`,
          );

          return (
            <motion.div
              key={itemId}
              id={`sr-card-${item.srNum}`}
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
                onClick={() => toggleExpand(itemId)}
                className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">
                            {item.srNum}
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
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Status Badge - Desktop */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={getStatusColor(
                          item.approvalStatus,
                        )}
                      >
                        {item.approvalStatus === "Pending" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {item.approvalStatus === "Approved" && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {item.approvalStatus}
                      </Badge>
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

                    {/* Total Shipment Request */}
                    <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center w-36">
                        <span className="text-green-900 font-medium text-sm">
                          {item.currency || "IDR"}
                        </span>
                        <span className="text-green-900 font-medium text-sm text-right">
                          {formatNumber(
                            item.totalShipmentRequest,
                          )}
                        </span>
                      </div>
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

                {/* Mobile Status Badge */}
                <div className="flex md:hidden items-center gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className={getStatusColor(
                      item.approvalStatus,
                    )}
                  >
                    {item.approvalStatus === "Pending" && (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {item.approvalStatus === "Approved" && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {item.approvalStatus}
                  </Badge>
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
                      {/* Details Grid - 2x4 */}
                      <div className="p-6 bg-white rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Ship Name */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-gray-500 text-xs">
                                Ship Name
                              </span>
                            </div>
                            <div className="text-gray-900 text-base">
                              {item.shipName || "N/A"}
                            </div>
                          </div>

                          {/* Origin */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-gray-500 text-xs">
                                Origin
                              </span>
                            </div>
                            <div className="text-gray-900 text-base">
                              {item.origin || "N/A"}
                            </div>
                          </div>

                          {/* Destination */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-red-600" />
                              <span className="text-gray-500 text-xs">
                                Destination
                              </span>
                            </div>
                            <div className="text-gray-900 text-base">
                              {item.destination || "N/A"}
                            </div>
                          </div>

                          {/* Doc Received Date */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-gray-500 text-xs">
                                Doc Received Date
                              </span>
                            </div>
                            <div className="text-gray-900 text-base">
                              {item.docReceivedDate
                                ? formatDateToDDMMYYYY(
                                    item.docReceivedDate,
                                  )
                                : "--"}
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
                              <div className="text-xs text-red-600 mb-1">
                                Rejection Reason
                              </div>
                              <div className="text-base text-red-900">
                                {item.rejectionReason}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 flex gap-2 justify-start">
                        {/* View Details */}
                        <Button
                          variant="outline"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            setSelectedDetail(item);
                            setEditDiscount(item.discount || 0);
                            setOtherCosts(item.otherCosts || []);
                            setShowDetailDialog(true);
                          }}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {/* Expense Note button - Always show */}
                        {/* <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAPNoteClick(item);
                          }}
                          disabled={
                            item.approvalStatus !==
                              "Approved" ||
                            (item.isVoided &&
                              (!item.apNotes ||
                                item.apNotes.length === 0))
                          }
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          {item.apNotes &&
                          item.apNotes.length > 0
                            ? `Expense Note (${item.apNotes.length})`
                            : "Expense Note"}
                        </Button> */}

                        {/* Linked Document Button */}
                        <Button
                          onClick={(e: any) => {
                            e.stopPropagation();
                            // Get linked PO data to access its linked documents
                            const poData =
                              getLinkedPOData(item);

                            // Create a temporary object with the linked docs from the PO
                            const srWithLinkedDocs = {
                              ...item,
                              linkedDocs:
                                poData.mockPOData?.linkedDocs ||
                                [],
                            };

                            setSelectedForLinkedDocs(
                              srWithLinkedDocs as ShipmentRequestData,
                            );
                            setShowLinkedDocsDialog(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Link
                        </Button>

                        {/* Warning Dialog for Fully Paid */}
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
                            const today = getTodayDDMMYYYY();

                            // Check if this Import Cost is already linked to any PVR in local storage
                            const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
                            const isLinkedToPVR = existingPVRs.some((pvr: any) =>
                              pvr.linkedDocs?.some((doc: any) =>
                                doc.icNum === item.srNum ||
                                doc.invoiceNo === item.srNum ||
                                doc.piNo === item.srNum
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

                            // If not linked, proceed with SR-only PVR logic
                            // Create document entry for the selected Shipment Request
                            const srDocument = {
                              id: item.srId || `sr-${Date.now()}`,
                              piNo: item.srNum,
                              icNum: item.srNum,
                              poNo: item.poNo || "",
                              invoiceNo: item.srNum,
                              invoiceDate: item.docReceivedDate || "",
                              currency: item.currency || "IDR",
                              documentType: "SR" as any,
                              totalAmount: item.totalShipmentRequest || 0,
                              status: item.approvalStatus || "Complete",
                            };

                            // Initialize PVR form ONLY with the SR details
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
                              reference: item.srNum || "",
                              remarks: `PVR for Shipment Request: ${item.srNum}`,
                            });

                            // ONLY include the SR in linked items for this PVR
                            setLinkedPIs([srDocument]);

                            setShowCreatePVRDialog(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          PVR
                        </Button>

                        {/* Void button */}
                        <Button
                          variant="outline"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            setSelectedForVoid(item);
                            setShowVoidDialog(true);
                          }}
                          disabled={item.isVoided}
                          className={`border-red-600 text-red-600 hover:bg-red-50 ${
                            item.isVoided
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
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
      </div>

      {filteredData.length === 0 && (
        <Card className="p-12 text-center border-purple-100">
          <FileText className="w-16 h-16 mx-auto mb-4 text-purple-300" />
          <p className="text-gray-500">
            No shipment requests found
          </p>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      >
        <DialogContent className="p-6" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Shipment Request Detail
            </DialogTitle>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <div className="text-xs text-purple-600 mb-1">
                      SR Number
                    </div>
                    <div className="font-semibold text-purple-900 text-sm">
                      {selectedDetail.srNum}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table  atau Detail Package*/}
              <div
                className="overflow-auto"
                style={{ maxHeight: "200px" }}
              >
                <table className="w-full min-w-[1000px]">
                  <thead className="sticky top-0 z-10 bg-purple-50">
                    <tr>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "35%" }}
                      >
                        Items Name
                      </th>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "5%" }}
                      >
                        Qty
                      </th>
                      <th
                        className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "10%" }}
                      >
                        UOM
                      </th>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "12.5%" }}
                      >
                        User Requisition
                      </th>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "12.5%" }}
                      >
                        Purchase Order
                      </th>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "12.5%" }}
                      >
                        Purchase Invoice
                      </th>
                      <th
                        className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b"
                        style={{ width: "12.5%" }}
                      >
                        Inventory Usage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-purple-50/50 border-b">
                      <td className="font-medium text-xs px-4 py-3">
                        KAWAT LAS (KOBE) RB-26 3.2MM
                        (T32.001.00151)
                      </td>
                      <td className="text-xs px-4 py-3">
                        10.00
                      </td>
                      <td className="text-right text-xs px-4 py-3">
                        KILOGRAM
                      </td>
                      <td className="text-xs px-4 py-3">
                        URGH125102065
                      </td>
                      <td className="text-xs px-4 py-3">
                        POTFTP-MDN/2511/0065
                      </td>
                      <td className="text-xs px-4 py-3">
                        STIH525110065
                      </td>
                      <td className="text-xs px-4 py-3">
                        SOLIH525110502
                      </td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 border-b">
                      <td className="font-medium text-xs px-4 py-3">
                        DISPLAY ECHOSOUNDER (BARANG DI HANDCARR
                        DARI JAKARTA)
                      </td>
                      <td className="text-xs px-4 py-3">
                        1.00
                      </td>
                      <td className="text-right text-xs px-4 py-3">
                        UNIT
                      </td>
                      <td className="text-xs px-4 py-3">
                        URGH125102066
                      </td>
                      <td className="text-xs px-4 py-3">
                        POTFTP-MDN/2511/0066
                      </td>
                      <td className="text-xs px-4 py-3">
                        STIH525110066
                      </td>
                      <td className="text-xs px-4 py-3">
                        SOLIH525110503
                      </td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 border-b">
                      <td className="font-medium text-xs px-4 py-3">
                        PCB T/R (JRC) N0739D CMN - 720 A B C (PO
                        TTP 2510.0374) - item sudah terpasang di
                        dislay echosounder (BARANG DI HANDCARRY
                        OLEH CREW)
                      </td>
                      <td className="text-xs px-4 py-3">
                        1.00
                      </td>
                      <td className="text-right text-xs px-4 py-3">
                        UNIT
                      </td>
                      <td className="text-xs px-4 py-3">
                        URGH125102067
                      </td>
                      <td className="text-xs px-4 py-3">
                        POTFTP-MDN/2511/0067
                      </td>
                      <td className="text-xs px-4 py-3">
                        STIH525110067
                      </td>
                      <td className="text-xs px-4 py-3">
                        SOLIH525110504
                      </td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 border-b">
                      <td className="font-medium text-xs px-4 py-3">
                        HANDY TALKY HT MERK MOTOROLA GP : 328 2
                        PC (BARANG TURUNAN KAPAL MT. GLOBAL TOP
                        UNTUK DIBALIKKAN KE KAPAL MT. PRINCESS
                        NAOMI)
                      </td>
                      <td className="text-xs px-4 py-3">
                        2.00
                      </td>
                      <td className="text-right text-xs px-4 py-3">
                        PCS
                      </td>
                      <td className="text-xs px-4 py-3">
                        URGH125102068
                      </td>
                      <td className="text-xs px-4 py-3">
                        POTFTP-MDN/2511/0068
                      </td>
                      <td className="text-xs px-4 py-3">
                        STIH525110068
                      </td>
                      <td className="text-xs px-4 py-3">
                        SOLIH525110505
                      </td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 border-b last:border-b-0">
                      <td className="font-medium text-xs px-4 py-3">
                        CHEMICAL (APEX) A-520 AIR COOLER CLEANER
                        @25 LITER / PAIL YANG DI PINJAM DAN DI
                        KEMBALIKAN KAPAL MT AIKATERINI REF
                        280/X/SR-GMI/G1/2025)
                      </td>
                      <td className="text-xs px-4 py-3">
                        50.00
                      </td>
                      <td className="text-right text-xs px-4 py-3">
                        LITER
                      </td>
                      <td className="text-xs px-4 py-3">
                        URGH125102069
                      </td>
                      <td className="text-xs px-4 py-3">
                        POTFTP-MDN/2511/0069
                      </td>
                      <td className="text-xs px-4 py-3">
                        STIH525110069
                      </td>
                      <td className="text-xs px-4 py-3">
                        SOLIH525110506
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* RINCIAN BIAYA Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="overflow-auto"
                  style={{ maxHeight: "200px" }}
                >
                  <table className="w-full min-w-[1000px] table-fixed">
                    <thead className="sticky top-0 z-10 bg-purple-50">
                      <tr>
                        <th className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b">
                          <div className="max-w-[120px]">
                            Pay To
                          </div>
                        </th>
                        <th className="text-purple-900 text-xs text-left px-4 py-3 font-medium border-b">
                          <div className="max-w-[150px]">
                            Expense Type
                          </div>
                        </th>
                        <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                          Qty
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Price
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Total Price
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          PPN
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          PPH
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Grand Total
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Expense Note
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-purple-50/50 border-b last:border-b-0">
                        <td className="font-medium text-xs px-4 py-3">
                          <div className="max-w-[120px] break-words">
                            UKAL BOAT BALIKPAPAN
                          </div>
                        </td>
                        <td className="text-xs px-4 py-3">
                          <div className="max-w-[150px] break-words">
                            BOAT EXPENSE 61081-LOGISTIC-BOAT
                            SERVICE EXPENSE
                          </div>
                        </td>
                        <td className="text-right font-semibold text-xs whitespace-nowrap px-4 py-3">
                          1 TRIP
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          600,000
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          600,000
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          0 (0.0%)
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          0 (0.0%)
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          600,000
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          APN-2025-036
                        </td>
                        <td className="text-xs whitespace-nowrap px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedDescription(
                                "Boat service expense for logistics transportation from Balikpapan to Outer Buoy. This service includes crew, fuel, and operational costs for TB. Martha Fortune. The trip was completed on schedule with all safety protocols followed.",
                              );
                              setShowDescriptionDialog(true);
                            }}
                            className="text-xs text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

             <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-4 space-y-4 bg-white">
                {/* Financial Summary */}
                {(() => {
                  const totalAmount =
                    selectedDetail?.items &&
                    selectedDetail.items.length > 0
                      ? selectedDetail.items.reduce(
                          (sum, item) =>
                            sum + (item.totalAmount || 0),
                          0,
                        )
                      : selectedDetail?.linkedDocuments &&
                        selectedDetail.linkedDocuments.length > 0
                      ? selectedDetail.linkedDocuments.reduce(
                          (sum, doc) =>
                            sum + (doc.totalAmount || 0),
                          0,
                        )
                      : 0;

                  const totalOtherCost = otherCosts.reduce(
                    (sum, cost) => sum + (cost.costAmount || 0),
                    0,
                  );
                  const grandTotal =
                    totalAmount -
                    (editDiscount || 0) +
                    (selectedDetail?.tax || 0) -
                    (selectedDetail?.pph || 0) +
                    totalOtherCost;

                  return (
                    <div className="flex justify-end">

                    
                    <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                      <div className="flex-1 flex flex-col justify-between">
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
                              {formatNumber(grandTotal)}
                            </span>
                            <span className="text-gray-700 text-sm w-4 text-left"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditMode}
        onOpenChange={() => {
          setIsEditMode(false);
          setEditFormData(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900 text-xl font-semibold">
              📝 Edit Shipment Request
            </DialogTitle>
            <DialogDescription>
              Update the Shipment Request information
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SR Number</Label>
                  <Input
                    value={editFormData.srNum}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Expense Type (COA)</Label>
                  <Select
                    value={editFormData.expenseType}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        expenseType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5101 - Freight Charges">
                        5101 - Freight Charges
                      </SelectItem>
                      <SelectItem value="5102 - Transportation Cost">
                        5102 - Transportation Cost
                      </SelectItem>
                      <SelectItem value="5103 - Warehouse Handling">
                        5103 - Warehouse Handling
                      </SelectItem>
                      <SelectItem value="5104 - Customs Clearance">
                        5104 - Customs Clearance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={editFormData.supplierName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        supplierName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Pay To</Label>
                  <Select
                    value={editFormData.payTo}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        payTo: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supplier">
                        Supplier
                      </SelectItem>
                      <SelectItem value="Forwarder">
                        Forwarder
                      </SelectItem>
                      <SelectItem value="Agent">
                        Agent
                      </SelectItem>
                      <SelectItem value="Service Provider">
                        Service Provider
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company</Label>
                  <Select
                    value={editFormData.company}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
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
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    value={editFormData.totalShipmentRequest}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        totalShipmentRequest:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>PO Number</Label>
                  <Input
                    value={editFormData.poNo || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        poNo: e.target.value,
                      })
                    }
                    placeholder="PO-2025-XXX"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>Invoice Number</Label>
                  <Input
                    value={editFormData.invoiceNo || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        invoiceNo: e.target.value,
                      })
                    }
                    placeholder="INV-2025-XXXX"
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-purple-900 font-medium">
                    Total Shipment Request:
                  </span>
                  <span className="text-purple-900 font-semibold text-lg">
                    {formatCurrency(
                      editFormData.totalShipmentRequest,
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Changes
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
            <DialogTitle className="text-red-900">
              Void Shipment Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to void this shipment
              request? This action cannot be undone. All buttons
              will be disabled for this request.
            </DialogDescription>
          </DialogHeader>
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
              Void
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Shipment Request Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              Create Shipment Request
            </DialogTitle>
            <DialogDescription>
              Enter the details for a new shipment request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SR Number *</Label>
                <Input
                  value={createForm.srNum}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      srNum: e.target.value,
                    })
                  }
                  placeholder="SR-2025-XXX"
                />
              </div>
              <div>
                <Label>Expense Type (COA) *</Label>
                <Select
                  value={createForm.expenseType}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      expenseType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5101 - Freight Charges">
                      5101 - Freight Charges
                    </SelectItem>
                    <SelectItem value="5102 - Transportation Cost">
                      5102 - Transportation Cost
                    </SelectItem>
                    <SelectItem value="5103 - Warehouse Handling">
                      5103 - Warehouse Handling
                    </SelectItem>
                    <SelectItem value="5104 - Customs Clearance">
                      5104 - Customs Clearance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier Name *</Label>
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
                <Label>Total Amount *</Label>
                <Input
                  type="number"
                  value={createForm.totalShipmentRequest}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      totalShipmentRequest:
                        parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Pay To *</Label>
                <Select
                  value={createForm.payTo}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      payTo: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supplier">
                      Supplier
                    </SelectItem>
                    <SelectItem value="Forwarder">
                      Forwarder
                    </SelectItem>
                    <SelectItem value="Agent">
                      Agent
                    </SelectItem>
                    <SelectItem value="Service Provider">
                      Service Provider
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company *</Label>
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
                  placeholder="PO-2025-XXX"
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
                  placeholder="INV-2025-XXXX"
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
              onClick={handleCreateShipmentRequest}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Shipment Request
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
                setSelectedDocType("AP NOTE");
                setShowDocTypeSelection(false);
                setTimeout(
                  () => setShowAPNoteDialog(true),
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
                  () => setShowAPNoteDialog(true),
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
        open={showAPNoteDialog}
        onOpenChange={setShowAPNoteDialog}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
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
              Create {selectedDocType} for{" "}
              {selectedForAPNote?.srNum}
              {selectedDocType === "AP DISC NOTE" &&
                " (Amount will be negative)"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>AP Note Number</Label>
                <Input
                  value={apNoteForm.apNoteNo}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>AP Note Date</Label>
                <Input
                  type="date"
                  value={apNoteForm.Date}
                  onChange={(e) =>
                    setApNoteForm({
                      ...apNoteForm,
                      Date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Currency</Label>
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
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={selectedForAPNote?.supplierName || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Invoice Number</Label>
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
              <div>
                <Label>Term</Label>
                <Select
                  value={apNoteForm.term}
                  onValueChange={(value) =>
                    setApNoteForm({
                      ...apNoteForm,
                      term: value as TermType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT">
                      CREDIT
                    </SelectItem>
                    <SelectItem value="URGENT">
                      URGENT
                    </SelectItem>
                    <SelectItem value="ONLINE SHOPPING">
                      ONLINE SHOPPING
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Document Received Date</Label>
                <Input
                  type="date"
                  value={apNoteForm.documentReceivedDate}
                  onChange={(e) =>
                    setApNoteForm({
                      ...apNoteForm,
                      documentReceivedDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input
                  value={formatCurrency(
                    selectedForAPNote?.totalShipmentRequest ||
                      0,
                  )}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea
                value={apNoteForm.remarks}
                onChange={(e) =>
                  setApNoteForm({
                    ...apNoteForm,
                    remarks: e.target.value,
                  })
                }
                placeholder="Enter remarks (optional)"
                rows={3}
              />
            </div>

            {/* Info Panel */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-2">
                Information from Shipment Request:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>SR Number: {selectedForAPNote?.srNum}</li>
                <li>
                  Expense Type: {selectedForAPNote?.expenseType}
                </li>
                <li>
                  PO No: {selectedForAPNote?.poNo || "N/A"}
                </li>
                <li>
                  Invoice No:{" "}
                  {selectedForAPNote?.invoiceNo || "N/A"}
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAPNoteDialog(false)}
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
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {selectedDocType}
            </Button>
          </DialogFooter>
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
              {selectedForAPNote?.srNum}
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
              Create More
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

      {/* Description Dialog */}
      <Dialog
        open={showDescriptionDialog}
        onOpenChange={setShowDescriptionDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Expense Description
            </DialogTitle>
            <DialogDescription>
              Detailed description of the expense item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedDescription}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDescriptionDialog(false)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Document Dialog */}
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
                  if (!selectedForLinkedDocs) return 0;

                  let count = 0;
                  // Count the linked PO if it exists
                  const poData = getLinkedPOData(
                    selectedForLinkedDocs,
                  );
                  if (poData.mockPOData) count += 1;
                  // Count other linked docs (excluding SR)
                  const linkedDocs =
                    selectedForLinkedDocs?.linkedDocs || [];
                  const docsToCount = Array.isArray(linkedDocs)
                    ? linkedDocs
                    : [linkedDocs];
                  count += docsToCount.filter(
                    (doc) => doc?.type !== "Shipment Request",
                  ).length;

                  // Add linked PVRs count
                  const linkedPVRs = findLinkedPVRs(
                    "SR",
                    selectedForLinkedDocs.srNum,
                  );
                  count += linkedPVRs.length;

                  return count;
                })()}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Documents linked with this Shipment Request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "500px" }}>
            {(() => {
              if (!selectedForLinkedDocs) {
                return (
                  <p className="text-gray-500 text-sm">
                    No Shipment Request selected
                  </p>
                );
              }

              const linkedDocs =
                selectedForLinkedDocs?.linkedDocs;
              const docComponents = [];

              // Add the linked PO first if it exists
              const poData = getLinkedPOData(
                selectedForLinkedDocs,
              );
              if (poData.mockPOData) {
                const poDocNo = poData.poNumber;
                docComponents.push(
                  <div
                    key={`po-${poDocNo}`}
                    className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                    onClick={() => {
                      // Check if document exists in mock data
                      const foundDoc = mockLinkedPOs.find(
                        (po) =>
                          po.purchaseOrderNo === poDocNo ||
                          po.poId === poDocNo,
                      );

                      if (!foundDoc) {
                        console.warn(
                          "PO not found in mock data:",
                          poDocNo,
                        );
                        alert(
                          `Purchase Order ${poDocNo} not found in system.`,
                        );
                        return;
                      }

                      console.log(
                        "Found PO in mock data, navigating to:",
                        poDocNo,
                      );
                      setShowLinkedDocsDialog(false);

                      // Dispatch event for global navigation
                      const event = new CustomEvent(
                        "navigateToPurchaseOrder",
                        { detail: { poNo: poDocNo } },
                      );
                      window.dispatchEvent(event);

                      // Also call callback
                      onNavigateToPurchaseOrder?.(poDocNo);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-indigo-700 font-medium">
                            {poDocNo}
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

              // Then add other linked documents from linkedDocs
              if (!linkedDocs) {
                if (docComponents.length === 0) {
                  return (
                    <p className="text-gray-500 text-sm">
                      No linked documents
                    </p>
                  );
                }
                return docComponents;
              }

              const docsToProcess = Array.isArray(linkedDocs)
                ? linkedDocs
                : [linkedDocs];

              docsToProcess.forEach((linkedDoc, idx) => {
                if (!linkedDoc || !linkedDoc.docNo) return;

                // Skip Shipment Request type documents when viewing from SR
                if (linkedDoc.type === "Shipment Request") {
                  return;
                }

                const { type, docNo } = linkedDoc;

                // Display main document based on type
                if (type === "Purchase Invoice") {
                  docComponents.push(
                    <div
                      key={`pi-${docNo}`}
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        // Check if document exists in mock data
                        const foundDoc =
                          mockpurchaseInvoice.find(
                            (pi: any) =>
                              pi.purchaseInvoiceNo === docNo ||
                              pi.piId === docNo,
                          );

                        if (!foundDoc) {
                          console.warn(
                            "PI not found in mock data:",
                            docNo,
                          );
                          alert(
                            `Purchase Invoice ${docNo} not found in system.`,
                          );
                          return;
                        }

                        console.log(
                          "Found PI in mock data, navigating to:",
                          docNo,
                        );
                        setShowLinkedDocsDialog(false);

                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseInvoice",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);

                        // Also call callback
                        onNavigateToPurchaseInvoice?.(docNo);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-blue-700 font-medium">
                              {docNo}
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
                    </div>,
                  );
                } else if (type === "Import Cost") {
                  docComponents.push(
                    <div
                      key={`ic-${docNo}`}
                      className="p-4 bg-white border border-amber-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-amber-50"
                      onClick={() => {
                        // Check if document exists in mock data
                        const foundDoc = mockImportCosts.find(
                          (ic: any) =>
                            ic.icNum === docNo ||
                            ic.icId === docNo,
                        );

                        if (!foundDoc) {
                          console.warn(
                            "IC not found in mock data:",
                            docNo,
                          );
                          alert(
                            `Import Cost ${docNo} not found in system.`,
                          );
                          return;
                        }

                        console.log(
                          "Found IC in mock data, navigating to:",
                          docNo,
                        );
                        setShowLinkedDocsDialog(false);

                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToImportCost",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);

                        // Also call callback
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
                        // Check if document exists in mock data
                        const foundDoc =
                          mockShipmentRequest.find(
                            (sr: any) =>
                              sr.srNum === docNo ||
                              sr.srId === docNo,
                          );

                        if (!foundDoc) {
                          console.warn(
                            "SR not found in mock data:",
                            docNo,
                          );
                          alert(
                            `Shipment Request ${docNo} not found in system.`,
                          );
                          return;
                        }

                        console.log(
                          "Found SR in mock data, navigating to:",
                          docNo,
                        );
                        setShowLinkedDocsDialog(false);

                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToShipmentRequest",
                          { detail: { documentNo: docNo } },
                        );
                        window.dispatchEvent(event);

                        // Also call callback
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
                        // Check if document exists in mock data
                        const foundDoc = mockLinkedPOs.find(
                          (po) =>
                            po.purchaseOrderNo === docNo ||
                            po.poId === docNo,
                        );

                        if (!foundDoc) {
                          console.warn(
                            "PO not found in mock data:",
                            docNo,
                          );
                          alert(
                            `Purchase Order ${docNo} not found in system.`,
                          );
                          return;
                        }

                        console.log(
                          "Found PO in mock data, navigating to:",
                          docNo,
                        );
                        setShowLinkedDocsDialog(false);

                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseOrder",
                          { detail: { poNo: docNo } },
                        );
                        window.dispatchEvent(event);

                        // Also call callback
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

              // ADD LINKED PVRs directly to docComponents
              const linkedPVRs = findLinkedPVRs(
                "SR",
                selectedForLinkedDocs.srNum,
              );

              linkedPVRs.forEach((pvr) => {
                docComponents.push(
                  <div
                    key={`pvr-${pvr.pvrNo}`}
                    className="p-4 bg-white border border-green-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-green-50"
                    onClick={() => {
                      onNavigateToPVR?.(pvr.pvrNo);
                      setShowLinkedDocsDialog(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-green-700 font-medium">
                            {pvr.pvrNo}
                          </p>
                          <p className="text-sm text-gray-500">
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
                  </div>,
                );
              });

              return docComponents.length > 0 ? (
                docComponents
              ) : (
                <p className="text-gray-500 text-sm">
                  No linked documents to display
                </p>
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
                              convertDDMMYYYYtoYYYYMMDD(
                                calendarDateTo,
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
                    // Apply the calendar filter
                    console.log(
                      "Filtering from:",
                      calendarDateFrom,
                      "to:",
                      calendarDateTo,
                    );

                    // Close the dialog
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

      <PVRDialogs
        showCreatePVRDialog={showCreatePVRDialog}
        setShowCreatePVRDialog={setShowCreatePVRDialog}
        showPVRSuccessDialog={showPVRSuccessDialog}
        setShowPVRSuccessDialog={setShowPVRSuccessDialog}
        showAddLinksDialog={showAddLinksDialog}
        setShowAddLinksDialog={setShowAddLinksDialog}
        pvrForm={pvrForm}
        setPvrForm={setPvrForm}
        linkedPIs={linkedPIs}
        setLinkedPIs={setLinkedPIs}
        showCreateDatePicker={showCreateDatePicker}
        setShowCreateDatePicker={setShowCreateDatePicker}
        showSupplierPVRDropdown={showSupplierPVRDropdown}
        setShowSupplierPVRDropdown={setShowSupplierPVRDropdown}
        filteredSuppliers={filteredSuppliers}
        handleSupplierPVRChange={handleSupplierPVRChange}
        editingAmountPaidId={editingAmountPaidId}
        setEditingAmountPaidId={setEditingAmountPaidId}
        editingAmountPaidValue={editingAmountPaidValue}
        setEditingAmountPaidValue={setEditingAmountPaidValue}
        editingDiscountId={editingDiscountId}
        setEditingDiscountId={setEditingDiscountId}
        editingDiscountValue={editingDiscountValue}
        setEditingDiscountValue={setEditingDiscountValue}
        tableRefreshTrigger={tableRefreshTrigger}
        setTableRefreshTrigger={setTableRefreshTrigger}
        handleCreatePVR={handleCreatePVR}
        resetPVRForm={resetPVRForm}
        savedPvrNo={savedPvrNo}
        savedPvrLinkedDocs={savedPvrLinkedDocs}
        setLinkedDocsRefresh={setLinkedDocsRefresh}
        setShowLinkedDocsDialog={setShowLinkedDocsDialog}
        getTodayDate={getTodayDate}
        generatePVRNumber={generatePVRNumber}
        getDocumentNumber={getDocumentNumber}
        addLinksSearchTerm={addLinksSearchTerm}
        setAddLinksSearchTerm={setAddLinksSearchTerm}
        selectedDocuments={selectedDocuments}
        setSelectedDocuments={setSelectedDocuments}
        selectAllDocuments={selectAllDocuments}
        setSelectAllDocuments={setSelectAllDocuments}
        mockExpenseNote={mockExpenseNote}
        mockpurchaseInvoice={mockpurchaseInvoice}
        mockImportCosts={mockImportCosts}
        mockShipmentRequest={shipmentRequestData}
        mockPurchaseOrder={mockPurchaseOrder}
        pvrData={pvrData}
      />
    </div>

  );
}