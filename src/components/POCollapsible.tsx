import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import { formatNumber, parseFormattedNumber } from "../utils/numberFormat";
import {
  FileText,
  ChevronDown,
  Building2,
  Hash,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  User,
  CircleDot,
  ClipboardList,
  Link,
  Receipt,
  Plus,
  Trash2,
  Link as LinkIcon,
  Link2,
  Check,
  Edit,
  Eye,
  AlertCircle,
  X,
  Wallet,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent } from "./ui/tabs";
import { Card } from "./ui/card";
import { Clock as ClockIcon } from "lucide-react";
import { useRef } from "react";
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
  PopoverTrigger,
  PopoverContent,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { mockLinkedPOs, mockPurchaseOrder, mockpurchaseInvoice, mockpurchaseReturns, mockImportCosts, mockShipmentRequest, mockExpenseNote, findLinkedPVRsByPONo, findLinkedPVRsByPINo, getSyncedPaymentAmounts, getSyncedPaymentAmountsByPO, findLinkedPIsByPONo, findLinkedPVsByPONo, findLinkedPVsByPINo } from "../mocks/mockData";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type POStatus = "Outstanding" | "Partial" | "Complete";

type AccountItem = {
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
};

type LinkedDocument = {
  id: string;
  documentType: string;
  documentNo: string;
  documentNoPO?: string;
  documentTypeLabel?: string;
  totalAmount?: number;
};

type TermType = "URGENT" | "CREDIT" | "ONLINE SHOPPING";
type PTType = "MJS" | "AMT" | "GMI" | "WNS" | "WSI" | "TTP" | "IMI";

interface POCollapsibleProps {
  po: {
    poId: string;
    purchaseOrderNo: string;
    supplierName: string;
    createdBy: string;
    createDate: string;
    totalAmount: number;
    poStatus: POStatus;
    purchaseInvoiceNo?: string;
    internalRemarks: string;
    otherTotal: number;
    grandTotal: number;
    ptCompany?: string;
  };
  pvrData?: any[];
  refreshKey: number;
  expandAll?: boolean;
  selectedPOId?: string | null;
  vendorOriginFilter?: string;
  onNavigateToPurchaseInvoice?: (docNo: string) => void;
  onNavigateToImportCost?: (docNo: string) => void;
  onNavigateToShipmentRequest?: (docNo: string) => void;
  onNavigateToPurchaseOrder?: (docNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseReturn?: (prNo: string) => void;
  onNavigateToPV?: (pvNo: string) => void;
}

export function POCollapsible({
  po,
  pvrData,
  refreshKey,
  expandAll,
  selectedPOId,
  vendorOriginFilter,
  onNavigateToPurchaseInvoice,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToPurchaseOrder,
  onNavigateToPVR,
  onNavigateToAPNote,
  onNavigateToPurchaseReturn,
  onNavigateToPV,
}: POCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] =
    useState(false);
  const [selectedTermFilter, setSelectedTermFilter] = useState<"All" | "URGENT" | "CREDIT">("All");
  const [linkedDocsRefresh, setLinkedDocsRefresh] = useState(0);
  const [downPaymentRefresh, setDownPaymentRefresh] = useState(0);
  const [showExpenseNoteDialog, setShowExpenseNoteDialog] =
    useState(false);
  const [showAPNoteListDialog, setShowAPNoteListDialog] =
    useState(false);
  const [showItemDetailDialog, setShowItemDetailDialog] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any>(null);
  const [showDocTypeSelection, setShowDocTypeSelection] = useState(false);
  const [showAPNoteDialog, setShowAPNoteDialog] = useState(false);
  const [selectedForAPNote, setSelectedForAPNote] = useState<any>(null);
  const [selectedDocType, setSelectedDocType] = useState<"AP Note" | "AP DISC NOTE" | "">("" as any);
  const [apNotes, setApNotes] = useState<any[]>([]);
  const [activeCreateTabItems, setActiveCreateTabItems] = useState<"items" | "links">("items");
  const [showClosePODialog, setShowClosePODialog] = useState(false);
  const [showClosePOSuccessDialog, setShowClosePOSuccessDialog] = useState(false);
  const [showClosePartialPODialog, setShowClosePartialPODialog] = useState(false);
  const [closePartialPOReason, setClosePartialPOReason] = useState("");
  const [isPOClosed, setIsPOClosed] = useState(false);
  const closureTimestampRef = useRef<string | null>(null);
  const [showPOClosedDetailDialog, setShowPOClosedDetailDialog] = useState(false);
  const [poClosureReason, setPoClosureReason] = useState<string | null>(null);
  const [poClosureType, setPoClosureType] = useState<"Partial" | "Regular" | null>(null);
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
    supplierName: "",
    pt: "MJS",
    discount: 0,
    tax: 0,
    pph: 0,
    companyName: "",
    docReceiptDate: "",
    apNoteCreateDate: "",
  });
  
  // Refs for dialog scrolling
  const mainDialogContentRef = useRef<HTMLDivElement>(null);
  const mainDialogScrollRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const lastAccountItemRef = useRef<HTMLTableRowElement>(null);
  
  // State for dropdowns and search
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSupplierSelected, setIsSupplierSelected] = useState(false);
  const [accountCodeSearchTerms, setAccountCodeSearchTerms] = useState<Record<number, string>>({});
  const [departmentCodeSearchTerms, setDepartmentCodeSearchTerms] = useState<Record<number, string>>({});
  const [linkedDocNoSearchTerms, setLinkedDocNoSearchTerms] = useState<Record<string | number, string>>({});
  const [openDeptCodeDropdown, setOpenDeptCodeDropdown] = useState<Record<number, boolean>>({});
  const [openLinkedDocDropdown, setOpenLinkedDocDropdown] = useState<Record<string | number, boolean>>({});
  const [availableDocsForSupplier, setAvailableDocsForSupplier] = useState<any[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedAPNoteNo, setSavedAPNoteNo] = useState("");
  const [activeDetailTab, setActiveDetailTab] = useState<"items" | "details">("items");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [editDiscount, setEditDiscount] = useState(250000);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [otherCosts, setOtherCosts] = useState<any[]>([]);
  const [showOtherCostDialog, setShowOtherCostDialog] = useState(false);
  const [showImageGalleryDialog, setShowImageGalleryDialog] = useState(false);
  const [selectedItemForImage, setSelectedItemForImage] = useState<any>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [selectedNotificationReason, setSelectedNotificationReason] = useState<string>("");
  const [showNotifiedDialog, setShowNotifiedDialog] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [notifiedItems, setNotifiedItems] = useState<Set<string>>(new Set());
  
  // PVR Dialog and Form State
  const [showCreatePVRDialog, setShowCreatePVRDialog] = useState(false);
  const [showPVRSuccessDialog, setShowPVRSuccessDialog] = useState(false);
  const [showFullyPaidWarning, setShowFullyPaidWarning] = useState(false);
  const [showPVRLinkedWarning, setShowPVRLinkedWarning] = useState(false);
  const [savedPvrNo, setSavedPvrNo] = useState("");
  const [savedPvrLinkedDocs, setSavedPvrLinkedDocs] = useState<any[]>([]);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [addLinksSearchTerm, setAddLinksSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState<string>("");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState<string>("");
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [showSupplierPVRDropdown, setShowSupplierPVRDropdown] = useState(false);
  const [supplierSearchTermPVR, setSupplierSearchTermPVR] = useState("");
  
  const [pvrForm, setPvrForm] = useState({
    pvrNo: "",
    pvrDate: "",
    supplierName: "",
    term: "Credit" as "Credit" | "Urgent",
    currency: "IDR",
    rate: 1,
    pt: "GMI" as "AMT" | "GMI" | "IMI" | "MJS" | "TTP" | "WNS" | "WSI",
    bankAccount: "",
    paymentMethod: "Transfer" as "Transfer" | "Cash",
    reference: "",
    remarks: "",
  });
  
  // Mock data
  const supplierMasterData = [
    { name: "PT. Supplier A", category: "LOCAL" },
    { name: "PT. Supplier B", category: "OVERSEAS" },
    { name: "PT. Supplier C", category: "LOCAL" },
  ];
  
  // Mock supplier data filtered based on search term
  const filteredSuppliers = supplierMasterData.filter(s =>
    s.name.toLowerCase().includes(supplierSearchTermPVR.toLowerCase())
  );


  
  const accountOptions = [
    { code: "5101", name: "Material Cost" },
    { code: "5102", name: "Labor Cost" },
    { code: "5103", name: "Overhead" },
  ];
  
  const departmentOptions = [
    { code: "PROD", name: "Production" },
    { code: "SALES", name: "Sales" },
    { code: "ADMIN", name: "Administration" },
  ];
  

  
  const apNoteData: any[] = [];
  
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
  const shouldShowSupplierDropdown = (value: string) => {
    return supplierMasterData.some(s => s.name.toLowerCase().includes(value.toLowerCase()));
  };
  
  const handleSupplierSelect = (supplier: any) => {
    setApNoteForm({
      ...apNoteForm,
      supplierName: supplier.name,
    });
    setShowSupplierDropdown(false);
    setIsSupplierSelected(true);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const getTodayYYYYMMDD = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  
  const isAccountItemsValid = () => {
    return accountItems.every(item => item.accountCode && item.department && item.qty > 0 && item.unitPrice > 0);
  };

  // PVR Helper Functions
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

  const getTodayDate = (): string => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
    setLinkedPIs([]);
    setShowSupplierPVRDropdown(false);
    setSupplierSearchTermPVR("");
  };

  const handleCreatePVR = () => {
    if (!pvrForm.supplierName) {
      alert("Please select a supplier");
      return;
    }
    
    // Check if there's at least one non-PO document (PI, IC, SR, EN)
    const hasPayableItems = linkedPIs.some(doc => doc.documentType !== "PO");
    if (!hasPayableItems) {
      alert("Please add at least one payable item (Purchase Invoice, Import Cost, Shipment Request, or AP Note)");
      return;
    }

    // Get supplier category from local supplier data
    const supplierData = supplierMasterData.find(s => s.name === pvrForm.supplierName);
    const supplierCategory = (supplierData?.category === "OVERSEAS" ? "OVERSEAS" : "LOCAL") as any;

    // Calculate total invoice (excluding PO documents)
    const totalInvoice = linkedPIs
      .filter(doc => doc.documentType !== "PO" && doc.piNo && doc.piNo.trim() !== "")
      .reduce((sum: number, doc: any) => sum + (doc.totalAmount || 0), 0);

    // Log paired documents for verification
    console.log(`[POCollapsible] Creating PVR with paired documents:`, linkedPIs.map(doc => ({
      documentType: doc.documentType,
      docNo: doc.documentType === "PO" ? doc.poNo : doc.piNo,
      poNo: doc.poNo,
      totalAmount: doc.totalAmount
    })));

    // Create PVR object with all required fields
    const newPVR = {
      id: Date.now().toString(),
      pvrNo: pvrForm.pvrNo,
      pvrDate: convertToStorageDate(pvrForm.pvrDate),
      docReceiptDate: convertToStorageDate(pvrForm.pvrDate), // Use pvrDate as default since docReceiptDate is not in form
      supplierName: pvrForm.supplierName,
      supplierCategory: supplierCategory,
      term: (pvrForm.term || "CREDIT") as any,
      currency: pvrForm.currency,
      paymentMethod: (pvrForm.paymentMethod || "Transfer") as any,
      remarks: pvrForm.remarks,
      linkedDocs: linkedPIs,
      createdAt: new Date().toISOString(),
      poNumber: po.purchaseOrderNo,
      poId: po.poId,
      totalInvoice: totalInvoice,
      createdBy: "SHEFANNY",
      pt: (pvrForm.pt || "WNS") as any,
      rate: pvrForm.rate || 1,
      bankAccount: pvrForm.bankAccount || "",
      reference: pvrForm.reference || "",
      isSubmitted: false,
      isApproved: false,
      status: "active" as any,
    };

    try {
      const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
      console.log(`[POCollapsible] Before adding new PVR - existing count: ${existingPVRs.length}`);
      existingPVRs.push(newPVR);
      console.log(`[POCollapsible] After adding new PVR - total count: ${existingPVRs.length}`);
      console.log(`[POCollapsible] Saved PVR with ${newPVR.linkedDocs.length} linked documents`);
      localStorage.setItem("pvrData", JSON.stringify(existingPVRs));
      
      // Show success dialog
      setSavedPvrNo(newPVR.pvrNo);
      setSavedPvrLinkedDocs(linkedPIs);
      setShowPVRSuccessDialog(true);
      
      setShowCreatePVRDialog(false);
      resetPVRForm();
    } catch (error) {
      console.error("Failed to create PVR:", error);
      alert("Failed to create PVR");
    }
  };

  // Check if a linked document is the auto-populated PI/PO pair (first document and matches the selected PO)
  const isAutoPopulatedPIPO = (index: number, doc: LinkedDocument) => {
    return (
      index === 0 && 
      doc.documentType === "PI/PO" && 
      doc.documentNoPO === selectedForAPNote?.purchaseOrderName
    );
  };

  // Get items from mockLinkedPOs matching the current PO
  const mockPOData = mockLinkedPOs.find(
    (item) => item.poId === po.poId,
  );
  const mockItems = mockPOData?.items || [];

  // Get linked Purchase Invoice using poId from centralized structure
  const linkedPI = mockPOData?.purchaseInvoices?.[0];
  const piNumber = linkedPI?.purchaseInvoiceNo || "N/A";

  const calculateAmount = () => {
    return mockItems.reduce(
      (sum, item) => sum + item.quantity * item.pricePerQty,
      0,
    );
  };

  const amount = calculateAmount();
  const otherCost = po.otherTotal || 0;
  const discount = po.discount || 0;
  const ppn = po.ppn || 0;
  const otherTax = po.otherTax || 0;
  const totalAmount = po.totalAmount || 0;
  const grandTotal = po.grandTotal || (amount - discount + ppn + otherCost + otherTax);

  // Initialize selectedDetail when detail dialog opens
  useEffect(() => {
    if (showDetailDialog) {
      setSelectedDetail({
        ...po,
        items: mockItems,
        remarks: "Sample remarks",
        currency: "IDR",
        linkedDocuments: [],
        tax: ppn,
        pph: otherTax,
      });
      setEditDiscount(discount);
      setOtherCosts([{ id: "1", costAmount: otherCost, description: "Other Cost" }]);
    }
  }, [showDetailDialog]);

  // Sync with parent expandAll state and selectedPOId
  useEffect(() => {
    if (selectedPOId) {
      // If a specific PO is selected, only expand that one
      const shouldExpand = selectedPOId === po.poId;
      console.log(`POCollapsible ${po.poId} - selectedPOId=${selectedPOId}, comparing: ${selectedPOId} === ${po.poId} = ${shouldExpand}`);
      setIsExpanded(shouldExpand);
    } else if (expandAll !== undefined) {
      // Otherwise, use expandAll prop
      setIsExpanded(expandAll);
    }
  }, [expandAll, selectedPOId, po.poId]);

  // Auto-scroll to selected PO when it gets expanded
  useEffect(() => {
    if (selectedPOId === po.poId && selectedPOId) {
      // Use a small timeout to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(
          `po-collapsible-${po.poId}`,
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [selectedPOId, po.poId]);

  // Listen for PVR data changes and refresh linked documents dialog
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pvrData" && showLinkedDocsDialog) {
        // Force refresh of linked documents when PVR data changes
        setLinkedDocsRefresh(prev => prev + 1);
      }
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [showLinkedDocsDialog]);

  // Listen for custom events when dialog opens to refresh
  useEffect(() => {
    if (showLinkedDocsDialog) {
      // Force refresh when dialog opens
      setLinkedDocsRefresh(prev => prev + 1);
    }
  }, [showLinkedDocsDialog]);

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

  // Auto-populate linked documents when Create AP Note dialog opens
  useEffect(() => {
    if (showCreateDialog && selectedForAPNote && linkedDocs.length === 0) {
      // Get the mockPOData for the selected PO
      const selectedPOData = mockLinkedPOs.find(
        (item) => item.poId === selectedForAPNote.poId,
      );
      
      // If we have PO data with PI, auto-add the PI/PO pair
      if (selectedPOData?.purchaseInvoices?.[0]) {
        const linkedPI = selectedPOData.purchaseInvoices[0];
        const newLinkedDoc: LinkedDocument = {
          id: Date.now().toString(),
          documentType: "PI/PO",
          documentTypeLabel: "Purchase Invoice | Purchase Order",
          documentNo: linkedPI.purchaseInvoiceNo, // Purchase Invoice number
          documentNoPO: selectedForAPNote.purchaseOrderNo, // Purchase Order number
        };
        setLinkedDocs([newLinkedDoc]);
      }
    }
  }, [showCreateDialog, selectedForAPNote]);

  // Auto-populate supplier name from selected PO
  useEffect(() => {
    if (showCreateDialog && selectedForAPNote) {
      setApNoteForm((prevForm) => ({
        ...prevForm,
        supplierName: selectedForAPNote.supplierName || "",
      }));
      setIsSupplierSelected(true);
    }
  }, [showCreateDialog, selectedForAPNote]);

  // Load AP Notes from localStorage when component mounts or PO changes
  useEffect(() => {
    const loadAPNotesFromStorage = () => {
      try {
        const savedAPNotes = JSON.parse(localStorage.getItem("createdAPNotes") || "[]");
        if (savedAPNotes && Array.isArray(savedAPNotes)) {
          // Filter AP Notes for this specific PO - check both poNumber and linkedDocs
          const linkedNotes = savedAPNotes.filter((note: any) => {
            const isLinked = note.linkedDocs?.some((doc: any) =>
              doc.documentNo === po.purchaseOrderNo ||
              doc.documentNoPO === po.purchaseOrderNo ||
              (doc.documentType === "PO" && doc.documentNo === po.purchaseOrderNo)
            );
            return note.poNumber === po.purchaseOrderNo || isLinked;
          });
          setApNotes(linkedNotes);
          console.log(`Loaded ${linkedNotes.length} AP Notes for PO ${po.purchaseOrderNo}`, linkedNotes);
        }
      } catch (error) {
        console.error("Failed to load AP Notes from localStorage:", error);
      }
    };

    loadAPNotesFromStorage();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "createdAPNotes") {
        console.log("createdAPNotes changed in localStorage, reloading...");
        loadAPNotesFromStorage();
      }
    };

    // Listen for custom event when AP Note is created
    const handleExpenseNoteCreated = (e: Event) => {
      const event = e as CustomEvent;
      const { linkedDocs: createdLinkedDocs } = event.detail;
      if (createdLinkedDocs?.some((doc: any) => doc.documentNo === po.purchaseOrderNo || doc.documentNoPO === po.purchaseOrderNo)) {
        console.log("expenseNoteCreated event received for this PO, reloading...");
        loadAPNotesFromStorage();
      }
    };

    // Listen for storageUpdated event
    const handleStorageUpdated = () => {
      console.log("storageUpdated event received, reloading AP Notes...");
      loadAPNotesFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("expenseNoteCreated", handleExpenseNoteCreated);
    window.addEventListener("storageUpdated", handleStorageUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("expenseNoteCreated", handleExpenseNoteCreated);
      window.removeEventListener("storageUpdated", handleStorageUpdated);
    };
  }, [po.purchaseOrderNo]);

  // Auto-close PO when down payment equals grand total
  useEffect(() => {
    if (!isPOClosed) {
      const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
      const downPayment = syncedAmounts.downPayment || po.downPayment || 0;
      
      if (downPayment > 0 && downPayment === po.grandTotal) {
        console.log(`✅ Auto-closing PO ${po.purchaseOrderNo} - Payment Complete`);
        
        // Store the closure reason and type
        setPoClosureReason("Complete");
        setPoClosureType("Regular");
        
        // Capture the closure timestamp
        const now = new Date().toISOString();
        closureTimestampRef.current = now;
        
        // Set the PO closed state
        setIsPOClosed(true);
      }
    }
  }, [po.purchaseOrderNo, po.grandTotal, downPaymentRefresh, isPOClosed]);

  const getPTCompany = (purchaseOrderNo: string) => {
    if (!purchaseOrderNo || typeof purchaseOrderNo !== "string") {
      return "N/A";
    }
    const match = purchaseOrderNo.match(/^PO\/([A-Z]+)\./);
    return match ? match[1] : "N/A";
  };

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-700 border-green-200";
      case "Partial":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Outstanding":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: POStatus) => {
    switch (status) {
      case "Complete":
        return CheckCircle2;
      case "Partial":
        return CircleDot;
      case "Outstanding":
        return Clock;
      default:
        return Clock;
    }
  };

  const getEffectivePOStatus = (poData: any, itemsData: any[]) => {
    // Check if any item has no received quantity from linked PIs
    let hasUnreceivedItems = false;
    let hasReceivedItems = false;

    itemsData.forEach((item) => {
      const linkedPIs = findLinkedPIsByPONo(poData.purchaseOrderNo);
      let receivedQty = 0;

      linkedPIs.forEach((pi: any) => {
        if (pi.items && Array.isArray(pi.items)) {
          const matchingItem = pi.items.find(
            (piItem: any) => piItem.itemCode === item.itemCode
          );
          if (matchingItem) {
            receivedQty += matchingItem.quantity || 0;
          }
        }
      });

      if (receivedQty === 0) {
        hasUnreceivedItems = true;
      } else {
        hasReceivedItems = true;
      }
    });

    // If there are both received and unreceived items, status is "Partial"
    if (hasReceivedItems && hasUnreceivedItems) {
      return "Partial";
    }

    // If all items are unreceived, return original status
    if (hasUnreceivedItems && !hasReceivedItems) {
      return poData.poStatus;
    }

    // If all items are received, return original status
    return poData.poStatus;
  };

  const getStatusBadge = (status: POStatus) => {
    const config = {
      Complete: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
        displayText: "Complete",
      },
      Partial: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Clock,
        displayText: "Partial",
      },
      Outstanding: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock,
        displayText: "Outstanding",
      },
    };

    const normalizedStatus = (status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || "Outstanding") as POStatus;
    const { color, icon: Icon, displayText } = config[normalizedStatus];

    return (
      <Badge variant="outline" className={`${color} border`}>
        <Icon className="w-3 h-3" />
        {displayText}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return `${currency} ${formatNumber(amount)}`;
  };

  const onUpdateInvoice = (updates: any) => {
    // Update selected detail with new values
    setSelectedDetail({
      ...selectedDetail,
      ...updates,
    });
  };

  const handleAPNoteClick = () => {
    // Check if PO is linked to PVR
    const existingPVRs = JSON.parse(localStorage.getItem("pvrData") || "[]");
    const isLinkedToPVR = existingPVRs.some((pvr: any) =>
      pvr.linkedDocs?.some((doc: any) => doc.poNo === po.purchaseOrderNo)
    );

    if (isLinkedToPVR) {
      setShowPVRLinkedWarning(true);
      return;
    }

    setSelectedForAPNote(po);
    // Always go to document type selection for creating new expense note
    setShowDocTypeSelection(true);
  };

  const handleCreateAPNote = () => {
    // Generate AP Note Number in format: AP/XXX.MDN/AABB/CCCC
    // XXX = company code, AABB = last 2 digits of year + 2 digit month, CCCC = sequential number 0000-0100
    
    const company = apNoteForm.pt || "MJS"; // Company code (XXX)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year (AA)
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 2 digit month (BB)
    const sequentialNum = String(Math.floor(Math.random() * 101)).padStart(4, "0"); // Random 0000-0100 (CCCC)
    
    const apNoteNo = `AP/${company}.MDN/${year}${month}/${sequentialNum}`;
    setSavedAPNoteNo(apNoteNo);
    
    // Calculate total amount
    const totalAmount = accountItems.length > 0
      ? accountItems.reduce((sum, item) => sum + item.totalAmount, 0) -
        (apNoteForm.discount || 0) +
        (apNoteForm.tax || 0) -
        (apNoteForm.pph || 0)
      : linkedDocs.reduce((sum, doc) => sum + (doc.totalAmount || 0), 0) -
        (apNoteForm.discount || 0) +
        (apNoteForm.tax || 0) -
        (apNoteForm.pph || 0);
    
    // Process linkedDocs to split PI/PO pairs into separate documents
    const processedLinkedDocs = linkedDocs.flatMap((doc: LinkedDocument) => {
      if (doc.documentType === "PI/PO") {
        // Split PI/PO into two separate documents
        return [
          {
            id: Date.now().toString() + "-pi",
            documentType: "PI",
            documentNo: doc.documentNo, // This is the PI number
            totalAmount: doc.totalAmount,
          },
          {
            id: Date.now().toString() + "-po",
            documentType: "PO",
            documentNo: doc.documentNoPO, // This is the PO number
            totalAmount: doc.totalAmount,
          },
        ];
      }
      return [doc];
    });
    
    // Create complete AP Note object for APNote page
    const newAPNote = {
      id: Date.now().toString(),
      apNoteNo: apNoteNo,
      apNoteType: apNoteForm.apNoteType || "MDN",
      docType: selectedDocType === "AP Note" ? "AP NOTE" : "AP DISC NOTE",
      supplierName: apNoteForm.supplierName,
      supplierCategory: "LOCAL", // Default category
      totalInvoice: totalAmount,
      amount: totalAmount, // Keep for backward compatibility
      docReceiptDate: apNoteForm.documentReceivedDate,
      invoiceDate: apNoteForm.apNoteDate,
      apNoteCreateDate: new Date().toISOString().split("T")[0],
      createdBy: "SHEFANNY",
      invoiceNumber: apNoteForm.invoiceNumber,
      currency: apNoteForm.currency,
      term: apNoteForm.term as TermType,
      pt: apNoteForm.pt as PTType,
      remarks: apNoteForm.remarks,
      poNumber: po.purchaseOrderNo,
      items: accountItems,
      accountItems: accountItems,
      linkedDocs: processedLinkedDocs,
      discount: apNoteForm.discount,
      tax: apNoteForm.tax,
      pph: apNoteForm.pph,
      status: "Created",
    };
    
    // Add to local apNotes list for PO card display
    setApNotes([...apNotes, newAPNote]);
    
    // Save to localStorage for APNote page access
    const savedAPNotes = JSON.parse(localStorage.getItem("createdAPNotes") || "[]");
    localStorage.setItem("createdAPNotes", JSON.stringify([...savedAPNotes, newAPNote]));
    
    // Dispatch custom event to notify APNote page of new note
    window.dispatchEvent(new CustomEvent("apNoteCreated", { detail: newAPNote }));
    
    // Show success dialog
    setShowSuccessDialog(true);
    setShowCreateDialog(false);
  };
  
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setShowAPNoteDialog(false);
    setShowDocTypeSelection(false);
    setAccountItems([]);
    setLinkedDocs([]);
    setApNoteForm({
      apNoteNo: "AP-NOTE-001",
      apNoteDate: new Date().toISOString().split("T")[0],
      currency: "IDR",
      invoiceNumber: "",
      term: "CREDIT",
      documentReceivedDate: new Date().toISOString().split("T")[0],
      remarks: "",
      supplierName: "",
      pt: "MJS",
      discount: 0,
      tax: 0,
      pph: 0,
      companyName: "",
      docReceiptDate: "",
      apNoteCreateDate: "",
    });
    setIsSupplierSelected(false);
    setActiveCreateTabItems("items");
  };
  
  const handleViewAPNote = () => {
    // Navigate to AP Note details by dispatching event
    console.log("=== Navigate to Created AP Note ===", savedAPNoteNo);
    
    // Generate the same expandable ID format used in APNote
    const expandId = `apn-${savedAPNoteNo.replace(/\//g, "-")}`;
    
    // Close success dialog
    setShowSuccessDialog(false);
    
    // Call the navigation callback to switch to EXPENSES NOTE tab and auto-expand
    if (onNavigateToAPNote) {
      onNavigateToAPNote(expandId);
    }
    
    // Dispatch navigation event to APNote page
    window.dispatchEvent(
      new CustomEvent("navigateToAPNote", {
        detail: {
          apNoteId: expandId,
          apNoteNo: savedAPNoteNo,
        },
      })
    );
    
    console.log(
      "✅ navigateToAPNote event dispatched with ID:",
      expandId,
    );
  };

  const StatusIcon = getStatusIcon(po.poStatus);

  return (
    <motion.div
      id={`po-collapsible-${po.poId}`}
      key={`${po.poId}-${refreshKey}`}
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
        className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors relative"
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
                      {po.purchaseOrderNo}
                    </span>
                    <div className="flex items-start gap-2 mb-1">
    {(po as any).vendorOrigin && (
                    <Badge
                      className={`text-xs font-medium ${
                        (po as any).vendorOrigin === "Local"
                          ? "bg-blue-100 text-blue-800"
                          : (po as any).vendorOrigin === "Overseas"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(po as any).vendorOrigin}
                    </Badge>
                  )}
                  {(po as any).poType && (
                    <Badge
                      className={
                        (po as any).poType === "Urgent"
                          ? "bg-red-600 text-white"
                          : (po as any).poType === "Credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {(po as any).poType || "N/A"}
                    </Badge>
                  )}
                    </div>

                  </div>               
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {(po as any).ptCompany || getPTCompany(po.purchaseOrderNo)}
                  </Badge>

                  <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm truncate">
                    {po.supplierName}
                  </span>
              
                  
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Status Badge */}
            {getStatusBadge(getEffectivePOStatus(po, mockItems))}

            {/* Grand Total */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <span className="text-green-700">
                {formatCurrency(po.grandTotal, po.currency || "IDR")}
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
              {/* Details List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {/* Created By */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-gray-500 text-xs">
                      Created By
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {po.createdBy}
                  </div>
                </div>

                {/* Create Date */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-gray-500 text-xs">
                      Create Date
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {formatDateToDDMMYYYY(po.createDate)}
                  </div>
                </div>

                {/* Trace Code */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-gray-500 text-xs">
                      Trace Code
                    </span>
                  </div>
                  <div className="text-gray-900 text-base flex items-center justify-between gap-2">
                    <span>
                   
                   {po.traceCode || "-"}
                    </span>
                      
                  </div>
                </div>

          

                {/* PO Closed Status */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-gray-500 text-xs">
                      Status
                    </span>
                  </div>
                  <div className="text-gray-900 text-base">
                    {isPOClosed ? (
                      <>
                        <Badge 
                          className="bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors"
                          onClick={() => setShowPOClosedDetailDialog(true)}
                        >
                          PO Closed <Eye className="w-4 h-4 text-black-600" />
                        </Badge>
                        
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Summary - 4 Cards */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3"
              >
                {/* Grand Total */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 border border-green-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-green-700 font-medium">
                        Grand Total
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
                            getSyncedPaymentAmountsByPO(po.purchaseOrderNo).downPayment || po.downPayment || 0,
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
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-orange-700 font-medium">
                        Outstanding
                      </div>
                      <div className="text-sm font-bold text-orange-900">
                        {(() => {
                          void downPaymentRefresh; // Trigger dependency
                          const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
                          const downPayment = syncedAmounts.downPayment || 0;
                          return formatCurrency(grandTotal - downPayment);
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-purple-700 font-medium">
                        Payment Progress
                      </div>
                      <div className="text-sm font-bold text-purple-900">
                        {(() => {
                          const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
                          const downPayment = syncedAmounts.downPayment || 0;
                          return grandTotal > 0
                            ? `${((downPayment / grandTotal) * 100).toFixed(1)}%`
                            : "0.0%";
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                  {/* LINKED DOCUMENT BUTTON */}
                <Button
                  onClick={() => {
                    setShowLinkedDocsDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px]"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Link
                </Button>

                {/* Expense Note button - Show for all items */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAPNoteClick();
                  }}
                  disabled={po.poStatus === "Outstanding"}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Expense Note
                </Button>
                {/* PVR button*/}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    const today = getTodayDate();
                    
                    // Get company from PT code in PO number (e.g., PO/GMI.MDN/2510/0777)
                    const ptMatch = po.purchaseOrderNo.match(/\/([A-Z]+)\./);
                    const ptCode = ptMatch ? ptMatch[1] : "GMI";
                    
                    // Check payment status - get synced payment amounts
                    const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
                    const downPayment = syncedAmounts.downPayment || 0;
                    const poGrandTotal = po.grandTotal || 0;
                    const outstanding = poGrandTotal - downPayment;
                    
                    // Determine if PO is fully paid (outstanding <= 0 means already have PVR stored)
                    const isFullyPaid = outstanding <= 0;
                    
                    if (isFullyPaid) {
                      // If fully paid, show warning dialog and white empty form
                      setShowFullyPaidWarning(true);
                      
                      const emptyPvrForm = {
                        pvrNo: generatePVRNumber(ptCode, today),
                        pvrDate: today,
                        supplierName: "",
                        term: "Credit" as const,
                        currency: "IDR",
                        rate: 1,
                        pt: ptCode as any,
                        bankAccount: "",
                        paymentMethod: "Transfer" as const,
                        reference: "",
                        remarks: "",
                      };
                      setPvrForm(emptyPvrForm);
                      setLinkedPIs([]);
                    } else {
                      // If not fully paid, auto-fill with outstanding amount
                      // Get linked Purchase Invoices from this PO
                      const linkedPIsData = findLinkedPIsByPONo(po.purchaseOrderNo) || [];
                      
                      // Map linked PIs to document format with amounts
                      // If only partial payment needed, adjust the amounts to match outstanding
                      const prepopulatedLinkedPIs = linkedPIsData.map((pi: any) => {
                        const piAmount = pi.grandTotal || pi.totalAmount || 0;
                        // Show the full PI grandTotal amount - user can edit in the table
                        return {
                          id: pi.id || `${Date.now()}-${Math.random()}`,
                          piNo: pi.purchaseInvoiceNo || pi.piNo,
                          poNo: po.purchaseOrderNo,
                          invoiceNo: pi.purchaseInvoiceNo || pi.piNo,
                          invoiceDate: pi.piDate || pi.invoiceDate || "",
                          currency: pi.currency || "IDR",
                          documentType: "PI",
                          totalAmount: piAmount,
                          status: pi.status || "Pending",
                        };
                      });
                      
                      // Add the PO itself to the linked documents
                      const poDocument = {
                        id: po.poId || `${Date.now()}-po`,
                        piNo: "",
                        poNo: po.purchaseOrderNo,
                        invoiceNo: po.purchaseOrderNo,
                        invoiceDate: po.createDate || "",
                        currency: po.currency || "IDR",
                        documentType: "PO" as const,
                        totalAmount: po.grandTotal || po.totalAmount || 0,
                        documentTypeLabel: "Purchase Order",
                      };
                      prepopulatedLinkedPIs.push(poDocument);
                      
                      // Initialize PVR form with PO details and outstanding
                      setPvrForm({
                        pvrNo: generatePVRNumber(ptCode, today),
                        pvrDate: today,
                        supplierName: po.supplierName,
                        term: "Credit",
                        currency: "IDR",
                        rate: 1,
                        pt: ptCode as any,
                        bankAccount: "",
                        paymentMethod: "Transfer",
                        reference: po.purchaseOrderNo,
                        remarks: `PVR for PO: ${po.purchaseOrderNo} (Outstanding: ${formatNumber(outstanding)})`,
                      });
                      
                        // Set linked PIs (with PO included)
                      setLinkedPIs(prepopulatedLinkedPIs);
                      setShowCreatePVRDialog(true);
                    }
                  }}

                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  PVR
                </Button>
                {/* Close PO button - Show for all items */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Check if PO status is Partial
                    if (getEffectivePOStatus(po, mockItems) === "Partial") {
                      setShowClosePartialPODialog(true);
                    } else {
                      setShowClosePODialog(true);
                    }
                  }}
                  disabled={po.poStatus === "Outstanding" || isPOClosed}
                  className={isPOClosed ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}
                  title={isPOClosed ? "PO Already Closed" : "Close PO"}
                >
                  <X className="w-4 h-4" />
                  {isPOClosed ? "PO Closed" : "Close PO"}
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
              <FileText className="w-6 h-6" />
              Purchase Order Detail
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Scrollable Content */}
            {/* Header Info */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex flex-row gap-6">

                {/* Left Side: PO Details */}
                <div className="flex flex-row items-center gap-6 pb-1 w-full" >
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">PO Number</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {po.purchaseOrderNo}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Supplier Name</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {po.supplierName}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Create Date</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {formatDateToDDMMYYYY(po.createDate)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Created By</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {po.createdBy}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Status</div>
                    {getStatusBadge(getEffectivePOStatus(po, mockItems))}
                  </div>
                </div>

                {/* Right Side: Payment Cards */}
                <div className="flex flex-row items-center gap-4 pb-1 w-full" >
                  {/* Down Payment Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-blue-700 font-medium leading-tight">
                        Down Payment
                      </div>
                      <div className="text-sm font-bold text-blue-900">
                        {(() => {
                          void downPaymentRefresh;
                          return formatCurrency(
                            getSyncedPaymentAmountsByPO(po.purchaseOrderNo).downPayment || po.downPayment || 0
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Outstanding Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-orange-700 font-medium leading-tight">Outstanding</div>
                      <div className="text-sm font-bold text-orange-900">
                        {(() => {
                          void downPaymentRefresh;
                          const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
                          const downPayment = syncedAmounts.downPayment || 0;
                          return formatCurrency(grandTotal - downPayment);
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Progress Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-purple-700 font-medium leading-tight">Payment Progress</div>
                      <div className="text-sm font-bold text-purple-900">
                        {(() => {
                          const syncedAmounts = getSyncedPaymentAmountsByPO(po.purchaseOrderNo);
                          const downPayment = syncedAmounts.downPayment || 0;
                          return grandTotal > 0
                            ? `${((downPayment / grandTotal) * 100).toFixed(1)}%`
                            : "0.0%";
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
            {/* Items Table */}
            {activeDetailTab === "items" && (
             
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-auto" style={{ maxHeight: '200px' }}>
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
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Qty
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          UOM
                        </th>
                        
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Discount
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Price/Qty
                        </th>
                        <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b">
                          Total
                        </th>
                         <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Item Received
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
                                <span className="text-red-600 text-2xl">●</span>
                                {notifiedItems.has(item.itemCode) && (
                                  <div className="absolute top-0 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center" title="Notification sent to logistic">
                                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                          </td>
                          <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                            {formatCurrency(item.pricePerQty)}
                          </td>
                          <td className="text-right font-semibold text-xs whitespace-nowrap px-4 py-3">
                            {formatCurrency(
                              item.quantity * item.pricePerQty,
                            )}
                          </td>
                          {/* show received item from pi */}
                          <td className="text-xs whitespace-nowrap px-4 py-3">
                            {(() => {
                              // Find PIs linked to this PO using the helper function
                              const linkedPIs = findLinkedPIsByPONo(po.purchaseOrderNo);
                              
                              // Calculate total received quantity for this item from all linked PIs
                              let receivedQty = 0;
                              linkedPIs.forEach((pi: any) => {
                                if (pi.items && Array.isArray(pi.items)) {
                                  const matchingItem = pi.items.find(
                                    (piItem: any) => piItem.itemCode === item.itemCode
                                  );
                                  if (matchingItem) {
                                    receivedQty += matchingItem.quantity || 0;
                                  }
                                }
                              });
                              
                              return receivedQty > 0 ? receivedQty.toLocaleString() : "-";
                            })()}
                          </td>
                          <td className="text-xs whitespace-nowrap px-4 py-3">
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
                      No Activity Log records yet
                    </p>
                  </div>
                )}
              </div>
            )}


          </div>

          {/* Sticky Footer - Outside Scrollable Container */}
          <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-4 space-y-4 bg-white">
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
                          className="text-gray-900 text-sm border rounded px-2 py-1 font-bold w-[114px] text-right"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-700 text-sm font-bold w-[114px] text-right">
                          {formatNumber(
                            Math.abs(
                              editDiscount || 0,
                            ),
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
                        {formatCurrency(
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
                          )}
                        </span>
                        <span className="text-gray-700 text-sm w-4 text-left"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-white">
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
                  // Simple count: count all rendered items
                  let count = 0;
                  
                  // Count main docs with valid docNo - split PI/PO pairs into 2 items
                  const docsToProcess = mockPOData?.linkedDocs 
                    ? (Array.isArray(mockPOData.linkedDocs) ? mockPOData.linkedDocs : [mockPOData.linkedDocs])
                    : [];
                  docsToProcess.forEach((doc: any) => {
                    if (doc && doc.docNo) {
                      // If it's a PI/PO pair, count as 2 (PI and PO separately)
                      if (doc.documentType === "PI/PO") {
                        count += 2;
                      } else {
                        count += 1;
                      }
                    }
                  });
                  
                  // Count PRs
                  count += mockpurchaseReturns.filter((pr: any) => pr.poNo === po.purchaseOrderNo).length;
                  
                  // Count PVRs - directly count from rendered list below
                  try {
                    const savedPVRs = localStorage.getItem("pvrData");
                    if (savedPVRs) {
                      const currentPVRData = JSON.parse(savedPVRs);
                      const piLinkedToThisPO = mockpurchaseInvoice.filter((pi) => pi.noPO === po.purchaseOrderNo);
                      
                      const pvrsMap = new Map<string, any>();
                      currentPVRData.forEach((pvr: any) => {
                        if (pvr.poNumber === po.purchaseOrderNo || pvr.poNumber === po.poId) {
                          pvrsMap.set(pvr.pvrNo, pvr);
                        } else if (pvr.linkedDocs && Array.isArray(pvr.linkedDocs)) {
                          const matchingPODocs = pvr.linkedDocs.filter((doc: any) => doc.poNo === po.purchaseOrderNo);
                          if (matchingPODocs.length > 0) {
                            pvrsMap.set(pvr.pvrNo, pvr);
                          } else {
                            const matchingPIDocs = pvr.linkedDocs.filter((doc: any) => 
                              piLinkedToThisPO.find((pi) => pi.purchaseInvoiceNo === doc.piNo)
                            );
                            if (matchingPIDocs.length > 0) {
                              pvrsMap.set(pvr.pvrNo, pvr);
                            }
                          }
                        }
                      });
                      count += pvrsMap.size;
                    }
                  } catch (e) {
                    // Silent fail
                  }
                  
                  // Count expense notes
                  count += (apNotes?.length || 0);

                  // Count PVs
                  const linkedPVs = findLinkedPVsByPONo(po.purchaseOrderNo);
                  count += linkedPVs.length;
                  
                  return count;
                })()}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Documents linked with this purchase order
            </DialogDescription>
          </DialogHeader>
          <div
            className="space-y-3"
            style={{ width: "500px" }}
          >
            {(() => {
              const linkedDocs = mockPOData?.linkedDocs;
              if (!linkedDocs) return <p className="text-gray-500 text-sm">No linked documents</p>;

              const docComponents = [];
              const docsToProcess = Array.isArray(linkedDocs) ? linkedDocs : [linkedDocs];

              docsToProcess.forEach((linkedDoc, idx) => {
                if (!linkedDoc || !linkedDoc.docNo) return;

                const { type, docNo, pairedPO } = linkedDoc;

                // Display main document based on type
                if (type === "Purchase Invoice") {
                  docComponents.push(
                    <div
                      key={`pi-${docNo}`}
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        // Dispatch event for global navigation
                        const event = new CustomEvent(
                          "navigateToPurchaseInvoice",
                          { detail: { docNo } },
                        );
                        window.dispatchEvent(event);
                        
                        setShowLinkedDocsDialog(false);
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

              return docComponents.length > 0 ? docComponents : <p className="text-gray-500 text-sm">No linked documents to display</p>;
            })()}

            {/* LINKED PURCHASE RETURNS SECTION */}
            {(() => {
              // Import mockpurchaseReturns and filter by current PO number
              const linkedPRs = mockpurchaseReturns.filter(
                (pr: any) => pr.poNo === po.purchaseOrderNo
              );
              
              if (!linkedPRs || linkedPRs.length === 0) return null;

              return (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="font-medium text-sm text-gray-700">Linked Purchase Returns</p>
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      {linkedPRs.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {linkedPRs.map((pr: any) => (
                      <div
                        key={pr.returId}
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-orange-100"
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
                            <FileText className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="text-orange-700 font-medium text-sm">{pr.prNo}</p>
                              <p className="text-xs text-gray-500">{pr.supplierName}</p>
                            </div>
                          </div>
                          <Badge className="bg-orange-600 text-white">PR</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* LINKED PVRs SECTION */}
            {(() => {
              // Use linkedDocsRefresh as dependency to force re-evaluation
              void linkedDocsRefresh;
              
              // Load pvrData from localStorage directly to ensure we get the latest
              let currentPVRData: any[] = [];
              try {
                const savedPVRs = localStorage.getItem("pvrData");
                if (savedPVRs) {
                  currentPVRData = JSON.parse(savedPVRs);
                }
              } catch (error) {
                console.error("Failed to load PVR data from localStorage:", error);
                currentPVRData = pvrData || [];
              }
              
              console.log("🔍 [LINKED PVRS] Looking for PVRs for PO:", po.purchaseOrderNo);
              console.log("📊 [LINKED PVRS] Total PVRs in localStorage:", currentPVRData.length);
              console.log("📋 [LINKED PVRS] All PVRs in storage:", currentPVRData.map(p => ({
                pvrNo: p.pvrNo,
                poNumber: p.poNumber,
                linkedDocsCount: p.linkedDocs?.length || 0,
                linkedDocsPOs: p.linkedDocs?.map((d: any) => ({ piNo: d.piNo, poNo: d.poNo })) || []
              })));
              
              let allLinkedPVRs: any[] = [];
              
              if (currentPVRData && Array.isArray(currentPVRData) && currentPVRData.length > 0) {
                // Get all PIs linked to this PO
                const piLinkedToThisPO = mockpurchaseInvoice.filter(
                  (pi) => pi.noPO === po.purchaseOrderNo
                );
                
                console.log("📋 [LINKED PVRS] PIs linked to this PO:", piLinkedToThisPO);
                
                // Find PVRs from currentPVRData that are linked to this PO or its PIs
                const pvrsMap = new Map<string, any>();
                
                currentPVRData.forEach((pvr) => {
                  console.log(`📌 [LINKED PVRS] Checking PVR ${pvr.pvrNo}:`, {
                    poNumber: pvr.poNumber,
                    targetPO: po.purchaseOrderNo,
                    targetPoId: po.poId,
                    matches: pvr.poNumber === po.purchaseOrderNo || pvr.poNumber === po.poId
                  });
                  
                  // Check if PVR is linked to this PO by poNumber (could be poId or purchaseOrderNo)
                  if (pvr.poNumber === po.purchaseOrderNo || pvr.poNumber === po.poId) {
                    console.log("✅ [LINKED PVRS] Found PVR linked by PO number/poId:", pvr.pvrNo, "with poNumber:", pvr.poNumber);
                    pvrsMap.set(pvr.pvrNo, pvr);
                  } else if (pvr.linkedDocs && Array.isArray(pvr.linkedDocs)) {
                    // Check if PVR is linked to this PO directly via linkedDocs.poNo
                    const matchingPODocs = pvr.linkedDocs.filter((doc: any) => {
                      const matches = doc.poNo === po.purchaseOrderNo;
                      console.log(`  📄 [LINKED PVRS] Checking doc: piNo=${doc.piNo}, poNo=${doc.poNo}, matches=${matches}`);
                      return matches;
                    });
                    
                    if (matchingPODocs.length > 0) {
                      console.log("✅ [LINKED PVRS] Found PVR linked by PO (via linkedDocs.poNo):", pvr.pvrNo);
                      pvrsMap.set(pvr.pvrNo, pvr);
                    } else {
                      // Also check if linked to any PI that's linked to this PO
                      const matchingPIDocs = pvr.linkedDocs.filter((doc: any) => {
                        const piInThisPO = piLinkedToThisPO.find(
                          (pi) => pi.purchaseInvoiceNo === doc.piNo
                        );
                        if (piInThisPO) {
                          console.log("✅ [LINKED PVRS] Found PVR linked by PI:", pvr.pvrNo, "with PI:", doc.piNo);
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
              
              console.log("🎯 [LINKED PVRS] Total linked PVRs found:", allLinkedPVRs.length, allLinkedPVRs);
              
              // If nothing found from localStorage, fallback to mock functions
              if (allLinkedPVRs.length === 0) {
                console.log("⚠️ [LINKED PVRS] No PVRs found in localStorage, trying mock data...");
                const pvrsLinkedByPO = findLinkedPVRsByPONo(po.purchaseOrderNo);
                const piLinkedToThisPO = mockpurchaseInvoice.filter(
                  (pi) => pi.noPO === po.purchaseOrderNo
                );
                
                let pvrsLinkedByPI: any[] = [];
                piLinkedToThisPO.forEach((pi) => {
                  const pvrs = findLinkedPVRsByPINo(pi.purchaseInvoiceNo);
                  pvrsLinkedByPI = [...pvrsLinkedByPI, ...pvrs];
                });
                
                const pvrsMap = new Map<string, any>();
                pvrsLinkedByPO.forEach(pvr => pvrsMap.set(pvr.pvrNo, pvr));
                pvrsLinkedByPI.forEach(pvr => pvrsMap.set(pvr.pvrNo, pvr));
                allLinkedPVRs = Array.from(pvrsMap.values());
                
                console.log("📦 [LINKED PVRS] Found from mock data:", allLinkedPVRs.length);
              }
              
              // Always render the section, even if empty, for better UX
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
                            <p className="text-blue-700 font-medium">{pvr.pvrNo}</p>
                            <p className="text-sm text-gray-500">Payment Voucher Request</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white">PVR</Badge>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* LINKED EXPENSE NOTES - Embedded in main list */}
            {apNotes && apNotes.length > 0 && (
              <>
                {apNotes.map((apNote) => (
                  <div
                    key={apNote.id || apNote.apNoteNo}
                    className="p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-purple-50"
                    onClick={() => {
                      console.log(
                        "=== Navigate to AP Note ===",
                        apNote.apNoteNo,
                      );
                      // Close the linked docs dialog
                      setShowLinkedDocsDialog(false);
                      
                      // Dispatch navigation event to APNote page
                      const expandId = `apn-${apNote.apNoteNo.replace(
                        /\//g,
                        "-"
                      )}`;
                      
                      window.dispatchEvent(
                        new CustomEvent("navigateToAPNote", {
                          detail: {
                            apNoteId: expandId,
                            apNoteNo: apNote.apNoteNo,
                          },
                        })
                      );
                      
                      // Call the navigation callback to switch to EXPENSES NOTE tab
                      if (onNavigateToAPNote) {
                        onNavigateToAPNote(expandId);
                      }
                      
                      console.log(
                        "✅ navigateToAPNote event dispatched with ID:",
                        expandId,
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-purple-700 font-medium">
                            {apNote.apNoteNo}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expense Note
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className="bg-purple-600 text-white"
                      >
                        Expense Note
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* LINKED PVs SECTION */}
            {(() => {
              const linkedPVs = findLinkedPVsByPONo(po.purchaseOrderNo);
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

      {/* AP Note List Dialog - DEPRECATED, kept for reference */}
      <Dialog
        open={showAPNoteListDialog}
        onOpenChange={setShowAPNoteListDialog}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Expense Notes
            </DialogTitle>
            <DialogDescription>
              {selectedForAPNote?.purchaseOrderNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3" style={{ width: "500px" }}>
            {/* Linked AP Notes List */}
            {apNotes && apNotes.length > 0 ? (
              apNotes.map((apNote) => (
                <div
                  key={apNote.id}
                  className="p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-purple-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Receipt className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            console.log(
                              "=== Navigate to AP Note ===",
                              apNote.apNoteNo,
                            );
                            // Close the AP Note list dialog
                            setShowAPNoteListDialog(false);
                            
                            // Dispatch navigation event to APNote page
                            // The APNote component will listen for this and navigate/expand
                            const expandId = `apn-${apNote.apNoteNo.replace(
                              /\//g,
                              "-"
                            )}`;
                            
                            window.dispatchEvent(
                              new CustomEvent("navigateToAPNote", {
                                detail: {
                                  apNoteId: expandId,
                                  apNoteNo: apNote.apNoteNo,
                                },
                              })
                            );
                            
                            // Call the navigation callback to switch to EXPENSES NOTE tab
                            if (onNavigateToAPNote) {
                              onNavigateToAPNote(expandId);
                            }
                            
                            console.log(
                              "✅ navigateToAPNote event dispatched with ID:",
                              expandId,
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
              ))
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 text-sm">
                  No expense notes linked yet
                </p>
              </div>
            )}
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

          {/* Create AP Note Dialog */}
          <Dialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
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
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Auto fill all mandatory fields - temporary, will delete later
                        const today = getTodayYYYYMMDD()
                          .split("-")
                          .reverse()
                          .join("/"); // Convert to DD/MM/YYYY

                        // Use first account item as reference if exists
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
                          docReceiptDate:
                            apNoteForm.docReceiptDate || today,
                          apNoteCreateDate:
                            apNoteForm.apNoteCreateDate ||
                            today,
                          invoiceNumber:
                            apNoteForm.invoiceNumber ||
                            `INV-${Date.now()}`,
                        });

                        // Auto fill account items if empty
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
                          // Fill missing fields in existing items
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
                  {linkedDocs.length > 0 ? (
                    linkedDocs.map((doc, idx) => {
                      // Handle PI/PO documents - show as two separate cards
                      if (doc.documentType === "PI/PO") {
                        return (
                          <div key={doc.id} className="space-y-2">
                            {/* Purchase Invoice Card */}
                            <div
                              className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                setShowSuccessDialog(false);
                                onNavigateToPurchaseInvoice?.(doc.documentNo);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium text-blue-700">
                                      Purchase Invoice
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {doc.documentNo || "N/A"}
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

                            {/* Purchase Order Card */}
                            <div
                              className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                              onClick={() => {
                                setShowSuccessDialog(false);
                                onNavigateToPurchaseOrder?.(doc.documentNoPO);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                  <div>
                                    <p className="font-medium text-indigo-700">
                                      Purchase Order
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {doc.documentNoPO || "N/A"}
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
                          </div>
                        );
                      }

                      // Handle other document types (IC, SR)
                      let borderColor = "border-amber-200";
                      let bgHover = "hover:bg-amber-50";
                      let textColor = "text-amber-700";
                      let iconColor = "text-amber-600";
                      let badgeClass = "bg-amber-100 text-amber-700 border-amber-200";
                      let badgeLabel = "IC";
                      let docTitle = "Import Cost";

                      if (doc.documentType === "SR") {
                        borderColor = "border-green-200";
                        bgHover = "hover:bg-green-50";
                        textColor = "text-green-700";
                        iconColor = "text-green-600";
                        badgeClass = "bg-green-100 text-green-700 border-green-200";
                        badgeLabel = "SR";
                        docTitle = "Shipment Request";
                      }

                      return (
                        <div
                          key={doc.id}
                          className={`p-4 bg-white border ${borderColor} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${bgHover}`}
                          onClick={() => {
                            setShowSuccessDialog(false);
                            if (doc.documentType === "IC") {
                              onNavigateToImportCost?.(doc.documentNo);
                            } else if (doc.documentType === "SR") {
                              onNavigateToShipmentRequest?.(doc.documentNo);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className={`w-5 h-5 ${iconColor}`} />
                              <div>
                                <p className={`font-medium ${textColor}`}>
                                  {docTitle}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {doc.documentNo || "N/A"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${badgeClass}`}
                            >
                              {badgeLabel}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">
                      No linked documents
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              onClick={handleCloseSuccessDialog}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleViewAPNote}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              View {selectedDocType === "AP NOTE" ? "AP Note" : selectedDocType === "AP DISC NOTE" ? "AP Disc Note" : selectedDocType}
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
      <Dialog
        open={showNotifyDialog}
        onOpenChange={setShowNotifyDialog}
      >
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
              onClick={() => {
                setSelectedNotificationReason("re-confirm-item");
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedNotificationReason === "re-confirm-item"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300 bg-white"
              }`}
            >
              <p className="font-semibold text-gray-900">Re-confirm Item</p>
             
            </button>

            <button
              onClick={() => {
                setSelectedNotificationReason("image-not-attached");
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedNotificationReason === "image-not-attached"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300 bg-white"
              }`}
            >
              <p className="font-semibold text-gray-900">Item Image Has Not Been Attached</p>
            
            </button>

            <button
              onClick={() => {
                setSelectedNotificationReason("image-not-attached");
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedNotificationReason === "image-not-clear"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300 bg-white"
              }`}
            >
              <p className="font-semibold text-gray-900">Image Is Not Clear</p>
         
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
                console.log("Notification sent:", {
                  item: selectedItemForImage,
                  reason: selectedNotificationReason,
                });
                setShowNotifyDialog(false);
                setShowNotifiedDialog(true);
              }}
              disabled={!selectedNotificationReason}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notified Dialog */}
      <Dialog open={showNotifiedDialog} onOpenChange={setShowNotifiedDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center space-y-4">
         
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Notified to Logistic
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Notification has been sent successfully
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
          </div>

          <DialogFooter className="flex gap-2">
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
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Partial PO Dialog - Request Reason */}
      <Dialog
        open={showClosePartialPODialog}
        onOpenChange={setShowClosePartialPODialog}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Close Partial Purchase Order
            </DialogTitle>
            <DialogDescription>
              This PO has partial status. Please provide a reason for closing it.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 my-4">
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">PO Number:</span>
                <span className="font-semibold text-gray-900">{po.purchaseOrderNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Supplier:</span>
                <span className="font-semibold text-gray-900">{po.supplierName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Partial</Badge>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="w-full space-y-2">
            <Label className="text-sm font-medium text-gray-700">Reason for Closing</Label>
            <Textarea
              value={closePartialPOReason}
              onChange={(e) => setClosePartialPOReason(e.target.value)}
              placeholder="Enter the reason for closing this partial PO (e.g., No more items needed, Supplier issue, Project cancelled)"
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                // Close the dialog
                setShowClosePartialPODialog(false);
                
                // Perform close PO action
                console.log(`✅ Purchase Order ${po.purchaseOrderNo} has been closed`);
                console.log(`📝 Reason: ${closePartialPOReason}`);
                
                // Store the closure reason and type for detail dialog
                setPoClosureReason(closePartialPOReason);
                setPoClosureType("Partial");
                
                // Capture the closure timestamp immediately
                const now = new Date().toISOString();
                closureTimestampRef.current = now;
                
                // Set the PO closed state
                setIsPOClosed(true);
                
                // Show success dialog
                setShowClosePOSuccessDialog(true);
                
                // Reset reason
                setClosePartialPOReason("");
              }}
              disabled={!closePartialPOReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Close PO
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowClosePartialPODialog(false);
                setClosePartialPOReason("");
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close PO Confirmation Dialog */}
      <Dialog
        open={showClosePODialog}
        onOpenChange={setShowClosePODialog}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Confirm Close PO
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to close this Purchase Order?
            </DialogDescription>
          </DialogHeader>

          <div className="w-full bg-purple-50 border border-purple-200 rounded-lg p-4 my-4">
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">PO Number:</span>
                <span className="font-semibold text-gray-900">{po.purchaseOrderNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Supplier:</span>
                <span className="font-semibold text-gray-900">{po.supplierName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="bg-purple-600">{po.poStatus}</Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
         
            <Button
              onClick={() => {
                // Close the confirmation dialog
                setShowClosePODialog(false);
                
                // Perform close PO action
                console.log(`✅ Purchase Order ${po.purchaseOrderNo} has been closed`);
                
                
                // Capture the closure timestamp immediately
                const now = new Date().toISOString();
                closureTimestampRef.current = now;
                
                // Set the PO closed state
                setIsPOClosed(true);
                
                // Show success dialog
                setShowClosePOSuccessDialog(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Close PO
            </Button>
               <Button
              variant="outline"
              onClick={() => setShowClosePODialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close PO Success Dialog */}
      <Dialog
        open={showClosePOSuccessDialog}
        onOpenChange={setShowClosePOSuccessDialog}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
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
                <DialogTitle className="text-2xl text-gray-900">
                  Purchase Order Closed
                </DialogTitle>
                <DialogDescription className="text-base">
                  Purchase Order has been successfully closed
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* PO Details */}
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">PO Number:</span>
              <span className="font-mono font-bold text-green-900">{po.purchaseOrderNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Supplier:</span>
              <span className="font-semibold text-gray-900">{po.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Closed Date:</span>
              <span className="font-semibold text-gray-900">
                {closureTimestampRef.current 
                  ? (() => {
                      const date = new Date(closureTimestampRef.current);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()
                  : 'N/A'}
              </span>
            </div>
           
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowClosePOSuccessDialog(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PO Closed Detail Dialog */}
      <Dialog
        open={showPOClosedDetailDialog}
        onOpenChange={setShowPOClosedDetailDialog}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {/* Info Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl text-gray-900">
                  Purchase Order Closed
                </DialogTitle>
                <DialogDescription className="text-base">
                  View details of the closed purchase order
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* PO Closed Details */}
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
            {/* PO Number */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">PO Number:</span>
              <span className="font-mono font-bold text-green-900">{po.purchaseOrderNo}</span>
            </div>

            {/* Supplier */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Supplier:</span>
              <span className="font-semibold text-gray-900">{po.supplierName}</span>
            </div>

        

            {/* Closed Date */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Closed Date:</span>
              <span className="font-semibold text-gray-900">
                {closureTimestampRef.current 
                  ? (() => {
                      const date = new Date(closureTimestampRef.current);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()
                  : 'N/A'}
              </span>
            </div>

            {/* Closure Reason - Show for all closure types */}
            {poClosureReason && (
              <div className="pt-3 border-t border-green-200">
                <span className="text-sm font-medium text-gray-700 block mb-2">Reason for Closure:</span>
                <div className="bg-white rounded p-3 border border-green-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {poClosureReason}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowPOClosedDetailDialog(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
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
              Expense note cannot be created because this Purchase Order is linked to a PVR.
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
                          void tableRefreshTrigger;
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
                          void tableRefreshTrigger;
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
