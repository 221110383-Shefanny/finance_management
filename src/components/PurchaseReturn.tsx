import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Plus, ChevronDown, FileText, Hash, Building2, Calendar, ChevronUp, X, Upload, Search, Filter, AlertCircle, Warehouse, FileCheck, Send, Building, Check, Edit, Eye, Link, Receipt, CheckCircle2, Clock, ClockIcon, Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { DocumentMonitoringDialog } from "./DocumentMonitoringDialog";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { InvoiceCollapsible } from "./InvoiceCollapsible";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FolderList } from "./FolderList";
import { mockpurchaseReturns, mockDivisionPICs, mockPurchaseOrder } from "../mocks/mockData";

// Type definitions
type DocumentType = "QPF" | "REIMBURSEMENT" | "BUNKER / FRESH WATER" | "CREDIT" | "DOWN PAYMENT";
type Division = "AP" | "COSTING" | "ACCOUNTING";

interface PurchaseReturnProps {
    selectedPRNo?: string | null;
    onNavigateToPurchaseOrder?: (documentNo: string) => void;
    onNavigateToPurchaseInvoice?: (documentNo: string) => void;
    onNavigateToImportCost?: (documentNo: string) => void;
    onNavigateToAPNote?: (apNoteId: string) => void;
    onNavigateToPVR?: (pvrNo: string) => void;
}

interface NotificationButtonProps {
    pendingFolders: Array<{
        id: string;
        name: string;
        documents: Array<{
            id: string;
            name: string;
            status: string;
        }>;
    }>;
    onReceiveDocuments: (folderId: string, documentIds: string[]) => void;
}

export function NotificationButton({
  pendingFolders,
  onReceiveDocuments,
}: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const totalFolders = pendingFolders.length;
  const totalDocuments = pendingFolders.reduce(
    (sum, folder) => sum + folder.documents.length,
    0,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="relative bg-white hover:bg-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all"
        >
          <Bell className="w-5 h-5 text-purple-600" />
          {totalFolders > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white min-w-6 h-6 flex items-center justify-center px-1.5">
              {totalFolders}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div>Purchase Return Receiving</div>
              <div className="text-sm text-gray-500">
               
                {totalDocuments} document
                {totalDocuments !== 1 ? "s" : ""}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <FolderList
          folders={pendingFolders}
          onReceiveDocuments={onReceiveDocuments}
        />
      </SheetContent>
    </Sheet>
  );
}

export default function PurchaseReturn({
    selectedPRNo,
    onNavigateToPurchaseOrder,
    onNavigateToPurchaseInvoice,
    onNavigateToImportCost,
    onNavigateToAPNote,
    onNavigateToPVR,
}: PurchaseReturnProps) {
    const [purchaseReturns, setPurchaseReturns] = useState<any[]>([]);
    const [activeFilterType, setActiveFilterType] = useState<
        "pt" | "warehouse" | "pic" | null
    >(null);
    const [ptFilter, setPtFilter] = useState("all");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [picPIFilter, setPicPIFilter] = useState("all");
    const [expandedPR, setExpandedPR] = useState<Set<string>>(new Set());
    const [expandAll, setExpandAll] = useState(false);
    const [showCalendarDialog, setShowCalendarDialog] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isSubmitMode, setIsSubmitMode] = useState(false);

    // Additional state variables
    const [searchQuery, setSearchQuery] = useState("");
    const [submitDialogSearch, setSubmitDialogSearch] = useState("");
    const [selectedDocs, setSelectedDocs] = useState(new Set<string>());
    const [submitDialogSelectAll, setSubmitDialogSelectAll] = useState(false);
    const [documentType, setDocumentType] = useState("");
    const [submittedTo, setSubmittedTo] = useState("");
    const [picName, setPicName] = useState("");
    const [submissionDate, setSubmissionDate] = useState("");
    const [activeTab, setActiveTab] = useState<string[]>(["all"]);
    const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
    const [isEditingRefNo, setIsEditingRefNo] = useState(false);
    const [editReferenceNo, setEditReferenceNo] = useState("");
    const [isEditingRefDate, setIsEditingRefDate] = useState(false);
    const [editReferenceDate, setEditReferenceDate] = useState("");
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showLinkedDocsDialog, setShowLinkedDocsDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [apNotes, setApNotes] = useState<any[]>([]);
    const [activeDetailTab, setActiveDetailTab] = useState<string>("items");
    const [mockItems, setMockItems] = useState<any[]>([]);
    const [selectedItemForImage, setSelectedItemForImage] = useState<any>(null);
    const [showImageGalleryDialog, setShowImageGalleryDialog] = useState(false);
    const [showOtherCostDialog, setShowOtherCostDialog] = useState(false);
    const [otherCosts, setOtherCosts] = useState<any[]>([]);
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [editDiscount, setEditDiscount] = useState<number>(0);
    const [grandTotal, setGrandTotal] = useState<number>(0);
    const [expandOtherCostsSection, setExpandOtherCostsSection] = useState(false);
    const [newOtherCost, setNewOtherCost] = useState<{costAmount: number; description: string}>({
        costAmount: 0,
        description: "",
    });
    const [isVoided, setIsVoided] = useState(false);
    const [apNoteAuditTrails, setApNoteAuditTrails] = useState<Record<string, any[]>>({});
    const [showAttachmentUploadDialog, setShowAttachmentUploadDialog] = useState(false);
    const [showUploadAttachmentDialog, setShowUploadAttachmentDialog] = useState(false);
    const [documents, setDocuments] = useState<Array<{id: string; name: string; type: string; image: string}>>([]);
    const [notifiedItems, setNotifiedItems] = useState(new Set<string>());
    const [pendingFolders, setPendingFolders] = useState<Array<{id: string; name: string; documents: Array<{id: string; name: string; status: string}>}>>([]);
    
    // Calendar filter state
    const [calendarFilterType, setCalendarFilterType] = useState<"received" | "verified" | "submitted">("received");
    const [calendarUseTodayDate, setCalendarUseTodayDate] = useState(false);
    const [calendarDateFrom, setCalendarDateFrom] = useState("");
    const [calendarDateTo, setCalendarDateTo] = useState("");

    // Receive date dialog state
    const [showReceiveDateDialog, setShowReceiveDateDialog] = useState(false);
    const [useCurrentDateForReceive, setUseCurrentDateForReceive] = useState(false);
    const [receiveDateInput, setReceiveDateInput] = useState("");
    const [showReceiveConfirmDialog, setShowReceiveConfirmDialog] = useState(false);
    const [receiveDate, setReceiveDate] = useState("");
    const [pendingReceiveData, setPendingReceiveData] = useState<any>(null);

    const [showPOMonitoringDialog, setShowPOMonitoringDialog] = useState(false);

    // Mock data
    const filteredData: any[] = [];
    const invoicesData: any[] = [];

    // Sample documents data with images
    const sampleDocuments = [
      {
        id: "1",
        name: "Business License",
        image:
          "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
        type: "License",
      },
      {
        id: "2",
        name: "Tax Certificate",
        image:
          "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
        type: "Certificate",
      },
      {
        id: "3",
        name: "Company Registration",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f70504646?w=300&h=200&fit=crop",
        type: "Registration",
      },
      {
        id: "4",
        name: "Bank Statement",
        image:
          "https://images.unsplash.com/photo-1526304640581-d334cdbbf35f?w=300&h=200&fit=crop",
        type: "Bank",
      },
      {
        id: "5",
        name: "ISO Certificate",
        image:
          "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&h=200&fit=crop",
        type: "Certificate",
      },
    ];

    // Initialize documents with sample data
    useEffect(() => {
        setDocuments(sampleDocuments);
    }, []);

    // Initialize purchase returns with mock data
    useEffect(() => {
        setPurchaseReturns(mockpurchaseReturns);
    }, []);

    // Initialize pending folders with not-received purchase returns
    useEffect(() => {
        const receivedPRs = mockpurchaseReturns.filter(pr => pr.receivedStatus !== "Received");
        const folders = receivedPRs.map(pr => ({
            id: pr.returId,
            name: `Purchase Return Receiving`,
            folderName: `${pr.warehouse} Warehouse - ${pr.receivedDate ? formatDateToDDMMYYYY(pr.receivedDate) : "28/10/2026"}`,
            warehouse: pr.warehouse,
            documents: [
                {
                    id: pr.returId,
                    name: `${pr.prNo} - ${pr.supplierName}`,
                    status: "Received",
                    purchaseInvoiceNo: pr.piNo,
                    purchaseOrderNo: pr.poNo,
                    type: pr.ptCompany || "MJS",
                    supplier: pr.supplierName,
                    warehouse: pr.warehouse,
                    docDeliveryDate: "28/10/2025",
                    docReceivedDate: "28/10/2025",
                    attachment: "",
                    grandTotal: `Rp ${pr.totalReturnAmount?.toLocaleString("id-ID") || "0"}`
                }
            ]
        }));
        setPendingFolders(folders);
    }, []);

    // Listen for purchase return navigation event
    useEffect(() => {
        const handleNavigateToPurchaseReturn = (event: any) => {
            const { prNo } = event.detail;
            if (prNo) {
                // Find the purchase return index
                const index = purchaseReturns.findIndex((p: any) => p.prNo === prNo);
                if (index !== -1) {
                    setExpandedPR((prev) => new Set(prev).add(`pr-${index}`));
                    console.log(`✅ Purchase Return ${prNo} expanded`);
                }
            }
        };

        window.addEventListener("navigateToPurchaseReturn", handleNavigateToPurchaseReturn);
        return () => {
            window.removeEventListener("navigateToPurchaseReturn", handleNavigateToPurchaseReturn);
        };
    }, [purchaseReturns]);

    // Mock linked documents data
    const mockLinkedPOs: any[] = [];
    const mockLinkedPVRs: any[] = [];

    // Helper functions for finding linked documents
    const findLinkedPVRsByPONo = (poNo: string): any[] => {
        return mockLinkedPVRs.filter((pvr) => pvr.noPO === poNo);
    };

    const findLinkedPVRsByPINo = (piNo: string): any[] => {
        return mockLinkedPVRs.filter((pvr) => pvr.purchaseInvoiceNo === piNo);
    };
    const sortedData: any[] = [];
    const refreshKey = 0;
    const pendingCards = new Set<string>();
    const selectedInvoiceNo: any = null;
    
    // Filter documents that are not submitted AND have been received
    // Accept both boolean true and string "Received" for receivedStatus
    const availableDocsForSubmission = purchaseReturns.filter(
      (pr) => 
        (pr.receivedStatus === true || pr.receivedStatus === "Received") &&
        ((pr.submitStatus === null || pr.submitStatus === undefined) ||
        (pr.submissionStatus && pr.submissionStatus !== "Submitted"))
    ).map((pr) => ({
      id: pr.returId,
      purchaseInvoiceNo: pr.prNo,
      noPO: pr.poNo || "N/A",
      supplierName: pr.supplierName || "N/A",
      warehouse: pr.warehouse || "MEDAN",
      otherTotal: 0,
      grandTotal: pr.totalReturnAmount || 0,
    }));


    // Utility functions
const formatCurrency = (amount: number): string => {
  return `IDR ${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const isValidDate = (dateString: string): boolean => {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return regex.test(dateString);
    };

    const convertToISODate = (dateString: string): string => {
        if (!isValidDate(dateString)) return "";
        const [day, month, year] = dateString.split("/");
        return `${year}-${month}-${day}`;
    };

    const formatDateToDDMMYYYY = (dateString: string): string => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    // Handler functions
    const handleReceiveDocuments = (folderId: string, documentIds: string[]) => {
        console.log("📋 handleReceiveDocuments called:", { folderId, documentIds });
        // Set pending data and open receive date dialog
        setPendingReceiveData({ folderId, documentIds });
        setShowReceiveDateDialog(true);
        console.log("✅ showReceiveDateDialog should be true now");
    };

    const confirmReceiveDocuments = () => {
        console.log("✅ Confirming receive with date:", receiveDateInput);
        // Update mock data to mark as received
        if (pendingReceiveData) {
            const updatedPRs = mockpurchaseReturns.map(pr => {
                if (pr.returId === pendingReceiveData.folderId) {
                    return {
                        ...pr,
                        receivedStatus: "Received",
                        receivedDate: receiveDateInput ? convertToISODate(receiveDateInput) : receiveDateInput
                    };
                }
                return pr;
            });
            setPurchaseReturns(updatedPRs);
        }
        // Remove the folder from pending list
        if (pendingReceiveData) {
            setPendingFolders(prev => prev.filter(folder => folder.id !== pendingReceiveData.folderId));
        }
        // Close dialog and reset state
        setShowReceiveDateDialog(false);
        setPendingReceiveData(null);
        setReceiveDateInput("");
        setReceiveDate("");
        setUseCurrentDateForReceive(false);
    };

    const handleConfirmReceive = () => {
        console.log("✅ Confirming receive from confirmation dialog:", receiveDate);
        // Update mock data to mark as received
        if (pendingReceiveData) {
            const updatedPRs = mockpurchaseReturns.map(pr => {
                if (pr.returId === pendingReceiveData.folderId) {
                    return {
                        ...pr,
                        receivedStatus: "Received",
                        receivedDate: receiveDate ? convertToISODate(receiveDate) : receiveDate
                    };
                }
                return pr;
            });
            setPurchaseReturns(updatedPRs);
        }
        // Remove the folder from pending list
        if (pendingReceiveData) {
            setPendingFolders(prev => prev.filter(folder => folder.id !== pendingReceiveData.folderId));
        }
        // Close dialogs and reset state
        setShowReceiveConfirmDialog(false);
        setPendingReceiveData(null);
        setReceiveDateInput("");
        setReceiveDate("");
        setUseCurrentDateForReceive(false);
    };

    const handleSubmitDocs = () => {
        console.log("Submitting documents:", selectedDocs);
        
        // Update purchase returns to mark as submitted
        const updatedPRs = purchaseReturns.map(pr => {
            if (selectedDocs.has(pr.returId)) {
                return {
                    ...pr,
                    submitStatus: "Submitted",
                    submissionStatus: "Submitted",
                    submitDate: getCurrentDate()
                };
            }
            return pr;
        });
        setPurchaseReturns(updatedPRs);
        
        // Reset form and close dialog
        setShowSubmitDialog(false);
        setSelectedDocs(new Set());
        setSubmitDialogSelectAll(false);
        setDocumentType("");
        setSubmittedTo("");
        setPicName("");
        setSubmissionDate("");
        
        console.log("✅ Documents submitted successfully");
    };

    const handleToggleDoc = (docId: string) => {
        const newDocs = new Set(selectedDocs);
        if (newDocs.has(docId)) {
            newDocs.delete(docId);
        } else {
            newDocs.add(docId);
        }
        setSelectedDocs(newDocs);
    };

    const handleValidateInvoice = (invoice: any) => {
        console.log("Validating invoice:", invoice);
    };

    const handleStatusClick = (invoice: any) => {
        console.log("Status clicked:", invoice);
    };

    const handleReasonView = (invoice: any) => {
        console.log("View reason:", invoice);
    };

    const handleShowHistory = (invoice: any) => {
        console.log("Show history:", invoice);
    };

    const handleEditReference = (invoice: any) => {
        console.log("Edit reference:", invoice);
    };

    const handleAPNoteClick = () => {
        console.log("View AP Notes:", apNotes);
    };

    const handleAttachmentClick = () => {
        setShowAttachmentUploadDialog(true);
    };

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

    const onViewReason = () => {
        console.log("View reason");
    };

    const onStatusClick = () => {
        console.log("Status clicked");
    };

    const onValidate = () => {
        console.log("Validating");
    };

    const onUpdateInvoice = (invoice: any) => {
        console.log("Update invoice:", invoice);
    };

    // Mock invoice variable for dialog content
    const invoice = selectedDetail || {};

    // Generate Purchase Return document number
    const generatePRNumber = (ptInitial: string = "MJS", sequentialNum: number = 1): string => {
        const today = new Date();
        const lastTwoDigitsYear = String(today.getFullYear()).slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const sequential = String(sequentialNum).padStart(4, "0");

        return `PR/${ptInitial.toUpperCase()}.D0/${lastTwoDigitsYear}${month}/${sequential}`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            {/* Filter Tabs - Row 1: PT, Warehouse, and PIC */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() =>
                        setActiveFilterType(
                            activeFilterType === "pt" ? null : "pt",
                        )
                    }
                    className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${activeFilterType === "pt" ||
                            ptFilter !== "all"
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        }
          `}
                >
                    {ptFilter === "all" ? "ALL PT" : ptFilter}
                </button>

                <button
                    onClick={() =>
                        setActiveFilterType(
                            activeFilterType === "warehouse" ? null : "warehouse",
                        )
                    }
                    className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${activeFilterType === "warehouse" ||
                            warehouseFilter !== "all"
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        }
          `}
                >
                    {warehouseFilter === "all" ? "ALL WAREHOUSE" : warehouseFilter}
                </button>

                <button
                    onClick={() =>
                        setActiveFilterType(
                            activeFilterType === "pic" ? null : "pic",
                        )
                    }
                    className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${activeFilterType === "pic" ||
                            picPIFilter !== "all"
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        }
          `}
                >
                    {picPIFilter === "all" ? "ALL PIC" : picPIFilter}
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
              ${isSelected
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
              ${isSelected
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
              ${isSelected
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
            </div>

            {/* Submit Button and Notification */}
            <div className="flex justify-end items-center gap-3">
              {/* Clear Filter Button - Only show when filters are active */}
              {(ptFilter !== "all" || warehouseFilter !== "all" || picPIFilter !== "all") && (
                <Button
                  onClick={() => {
                    ptFilter !== "all" && setPtFilter("all");
                    warehouseFilter !== "all" && setWarehouseFilter("all");
                    picPIFilter !== "all" && setPicPIFilter("all");
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
                    onClick={() => {
                        if (expandAll) {
                            setExpandedPR(new Set());
                        } else {
                            const allIndices = new Set<string>();
                            for (let i = 0; i < (purchaseReturns.length > 0 ? purchaseReturns.length : 1); i++) {
                                allIndices.add(`pr-${i}`);
                            }
                            setExpandedPR(allIndices);
                        }
                        setExpandAll(!expandAll);
                    }}
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
                {/* NOTIFICATION BUTTON */}
                <NotificationButton
                    pendingFolders={pendingFolders}
                    onReceiveDocuments={handleReceiveDocuments}
                />
                {/* SUBMIT DOCUMENT BUTTON HIDE TEMP */}
                {/* <Button
                    onClick={() => {
                        setShowSubmitDialog(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    size="lg"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Documents
                </Button> */}
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
                        {invoicesData.length}
                    </span>{" "}
                    documents
                </div>

                {/* Search Input */}
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

                {/* Document Count Display or Submit Details */}
                <>
                {/* Invoice List */}
                <div>
                    {(() => {
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
                        const normalizeStatus = (inv: any) => {
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
                                        onShowActivityLog={handleShowHistory}
                                        onEditReference={handleEditReference}
                                        expandAll={expandAll}
                                        selectedInvoiceNo={selectedInvoiceNo}
                                        onNavigateToPO={(poNumber: string) => {
                                            const poId = mockLinkedPOs.find((po: any) => po.purchaseOrderNo === poNumber)?.poId;
                                            if (poId) onNavigateToPurchaseOrder?.(poId);
                                        }}
                                        onNavigateToPVR={onNavigateToPVR}
                                        onNavigateToAPNote={onNavigateToAPNote}
                                        onNavigateToPurchaseReturn={(prNo: string) => {
                                            // Find the purchase return by prNo and expand it
                                            const pr = purchaseReturns.find((p: any) => p.prNo === prNo);
                                            if (pr) {
                                                setExpandedPR(new Set(expandedPR).add(prNo));
                                            }
                                        }}
                                        onShowAttachmentDialog={() => {
                                            setShowAttachmentUploadDialog(true);
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
                                            onShowActivityLog={handleShowHistory}
                                            onEditReference={handleEditReference}
                                            expandAll={expandAll}
                                            selectedInvoiceNo={selectedInvoiceNo}
                                            onNavigateToPO={(poNumber: string) => {
                                                const poId = mockLinkedPOs.find((po: any) => po.purchaseOrderNo === poNumber)?.poId;
                                                if (poId) onNavigateToPurchaseOrder?.(poId);
                                            }}
                                            onNavigateToPVR={onNavigateToPVR}
                                            onNavigateToAPNote={onNavigateToAPNote}
                                            onNavigateToPurchaseReturn={(prNo: string) => {
                                                // Find the purchase return by prNo and expand it
                                                const pr = purchaseReturns.find((p: any) => p.prNo === prNo);
                                                if (pr) {
                                                    setExpandedPR(new Set(expandedPR).add(prNo));
                                                }
                                            }}
                                            onShowAttachmentDialog={() => {
                                                setShowAttachmentUploadDialog(true);
                                            }}
                                        />
                                    </div>
                                ))}
                            </>
                        );
                    })()}
                </div>
                </>
            </div>

            {/* Empty State */}
            <div className="space-y-2">
                {(purchaseReturns.length > 0
                    ? purchaseReturns
                    : [{}]
                ).map((pr, index) => (
                    <motion.div
                        key={index}
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
                            onClick={() => {
                                const newSet = new Set(expandedPR);
                                const id = `pr-${index}`;
                                if (newSet.has(id)) {
                                    newSet.delete(id);
                                } else {
                                    newSet.add(id);
                                }
                                setExpandedPR(newSet);
                            }}
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
                                                <span className="text-gray-900 font-mono">
                                                    {pr.prNo}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-purple-50 text-purple-700 border-purple-200"
                                                >
                                                    MJS
                                                </Badge>
                                                <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm truncate">
                                                    {pr?.supplierName || "Supplier Name"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {/* Receive Status Badge */}
                                    <div className="flex flex-col items-start gap-0.5">
                                        <Badge
                                            variant="outline"
                                            className={`flex items-center gap-1.5 ${
                                                pr?.receivedStatus === "Received"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            {pr?.receivedStatus === "Received" ? (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            ) : (
                                                <Clock className="w-3.5 h-3.5" />
                                            )}
                                            {pr?.receivedStatus || "Receive"}
                                        </Badge>
                                      
                                    </div>

                                    {/* Submit Status Badge */}
                                    <div className="flex flex-col items-start gap-0.5">
                                        <Badge
                                            variant="outline"
                                            className={`flex items-center gap-1.5 ${
                                                pr?.submitStatus === "Submitted"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            {pr?.submitStatus === "Submitted" ? (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            ) : (
                                                <Clock className="w-3.5 h-3.5" />
                                            )}
                                            {pr?.submitStatus || "Submit"}
                                        </Badge>
                                        
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    {/* Total Amount */}
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                                        <span className="text-green-700 font-semibold">
                                            {formatCurrency(pr?.totalReturnAmount || 0)}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedPR.has(`pr-${index}`)
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                    />
                                </div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedPR.has(`pr-${index}`) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden border-t border-gray-200 bg-gray-50"
                                >
                                    <div className="px-6 py-4">
                                        <div className="space-y-4">
                                            {/* Details List - 4 columns, 2 rows */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                                                   {/* Created Date */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                                                        <span className="text-gray-500 text-xs">
                                                            Created Date
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-900 text-base">
                                                        {pr?.returnCreatedDate
                                                            ? formatDateToDDMMYYYY(
                                                                pr.returnCreatedDate,
                                                            )
                                                            : "N/A"}
                                                    </div>
                                                </div>

                                                {/* Created By */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Send className="w-3.5 h-3.5 text-yellow-600" />
                                                        <span className="text-gray-500 text-xs">
                                                            Created By
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-900 text-base">
                                                        {pr?.returnCreatedBy || "N/A"}
                                                    </div>
                                                </div>
                                                {/* Return Date */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                                        <span className="text-gray-500 text-xs">
                                                            Return Date
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-900 text-base">
                                                        {pr?.returnDate
                                                            ? formatDateToDDMMYYYY(pr.returnDate)
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
                                                        {pr?.warehouse || "N/A"}
                                                    </div>
                                                </div>
                                                 {/* Warehouse */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span className="text-gray-500 text-xs">
                                                            Received Date
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-900 text-base">
                                                        {pr?.receivedDate
                                                            ? formatDateToDDMMYYYY(pr.receivedDate)
                                                            : "N/A"}
                                                    </div>
                                                </div>


                                             


                                            </div>
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
                                                        setSelectedDetail(pr);
                                                        setMockItems(pr?.returnedItems || []);
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
                                                        setSelectedDetail(pr);
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
                                                {/* <Button
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                handleAPNoteClick();
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                                        >
                                            <Receipt className="w-4 h-4 mr-2" />
                                            <span className="flex-1 text-center">
                                                {apNotes && apNotes.length > 0
                                                    ? `Expense Note (${apNotes.length})`
                                                    : "Expense Note"}
                                            </span>
                                        </Button> */}

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

                                                 {/* Monitoring button */}
                                                                <Button
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDetail(pr);
                                                                    setShowPOMonitoringDialog(true);
                                                                  }}
                                                                  className="bg-purple-600 hover:bg-purple-700"
                                                                >
                                                                  <Receipt className="w-4 h-4 mr-2" />
                                                                  Monitoring
                                                                </Button>










                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>


            {/* Detail Dialog */}
            <Dialog
                open={showDetailDialog}
                onOpenChange={setShowDetailDialog}
            >
                <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0">
                    <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
                        <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
                            <Receipt className="w-6 h-6" />
                            Purchase Return Detail
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <div className="text-xs text-purple-600 mb-1">
                                        Purchase Return No
                                    </div>
                                    <div className="font-semibold text-purple-900 text-sm">
                                        {selectedDetail?.prNo || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-purple-600 mb-1">
                                        Purchase Order No
                                    </div>
                                    <div className="font-semibold text-purple-900 text-sm">
                                        {selectedDetail?.poNo || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-purple-600 mb-1">
                                        Purchase Invoice No
                                    </div>
                                    <div className="font-semibold text-purple-900 text-sm">
                                        {selectedDetail?.piNo || "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-purple-600 mb-1">
                                        Supplier Name
                                    </div>
                                    <div className="font-semibold text-purple-900 text-sm">
                                        {selectedDetail?.supplierName || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-purple-600 mb-1">
                                        Warehouse
                                    </div>
                                    <div className="font-semibold text-purple-900 text-sm">
                                        {selectedDetail?.warehouse || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB MENU PURCHASE RETURN DETAIL */}
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
                                                    To Be Used By
                                                </th>
                                                <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                                                    Req By
                                                </th>
                                                <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                                                    PR Number
                                                </th>
                                                <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                                                    Purpose
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
                                                    <td className="text-center text-xs whitespace-nowrap px-4 py-3">
                                                        <input type="checkbox" disabled checked={item.pphApplicable} className="cursor-not-allowed bg-white accent-blue-500" />
                                                    </td>
                                                    <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                                                        {item.quantity.toLocaleString()}
                                                    </td>
                                                    <td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {item.uom}
                                                    </td><td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {/* untuk nominal discount diskon */}
                                                    </td>

                                                    <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                                                        {formatCurrency(item.pricePerQty)}
                                                    </td>
                                                    <td className="text-right  text-xs whitespace-nowrap px-4 py-3">
                                                        {formatCurrency(
                                                            item.quantity * item.pricePerQty,
                                                        )}
                                                    </td>
                                                    <td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {item.toBeUsedBy}
                                                    </td>
                                                    <td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {item.reqBy}
                                                    </td>
                                                    <td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {item.prNumber}
                                                    </td>
                                                    <td className="text-xs whitespace-nowrap px-4 py-3">
                                                        {item.purpose}
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
                              {/* Reason Section */}
                              <div className="w-1/2 flex flex-col h-full">
                                <div
                                  className="flex flex-col justify-between border rounded-md p-4 bg-gray-50 overflow-y-auto"
                                  style={{ minHeight: "170px" }}
                                >
                                  <Label className="mb-3 font-semibold text-purple-900">Reason</Label>
                                  {/* Atas */}
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id="reason-spec"
                                      checked={false}
                                      disabled
                                    />
                                    <label htmlFor="reason-spec" className="text-sm text-gray-700 cursor-pointer">
                                      The specifications of the received item do not match
                                    </label>
                                  </div>

                                  {/* Tengah */}
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id="reason-damaged"
                                      checked={selectedDetail.reasonType === "damaged"}
                                      disabled
                                    />
                                    <label htmlFor="reason-damaged" className="text-sm text-gray-700 cursor-pointer">
                                      The received item is damaged”
                                    </label>
                                  </div>

                                  {/* Bawah */}
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <Checkbox
                                        id="reason-custom"
                                        checked={true}   // default checked
                                        disabled
                                      />
                                      <label
                                        htmlFor="reason-custom"
                                        className="text-sm text-gray-700 cursor-pointer"
                                      >
                                        Custom
                                      </label>
                                    </div>

                                    {/* tampilkan input jika checked true */}
                                    {true && (
                                      <div className="ml-6 bg-white border border-gray-300 rounded p-2">
                                        <input
                                          type="text"
                                          value={selectedDetail.customReason || ""}
                                          readOnly
                                          placeholder="Custom reason"
                                          className="w-full text-xs bg-white text-gray-700"
                                        />
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </div>



                               {/* Action Section */}
                                 <div className="w-1/2 flex flex-col h-full">
                                <div
                                  className="flex flex-col justify-between border rounded-md p-4 bg-gray-50 overflow-y-auto"
                                  style={{ minHeight: "190px" }}
                                >
                                  <Label className="mb-3 font-semibold text-purple-900">Outcome</Label>
                                  {/* Atas */}
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id="reason-spec"
                                      checked={true}
                                      disabled
                                    />
                                    <label htmlFor="reason-spec" className="text-sm text-gray-700 cursor-pointer">
                                      Refund
                                    </label>
                                  </div>

                                  {/* Tengah */}
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id="reason-damaged"
                                      checked={selectedDetail.reasonType === "damaged"}
                                      disabled
                                    />
                                    <label htmlFor="reason-damaged" className="text-sm text-gray-700 cursor-pointer">
                                      Resupply
                                    </label>
                                  </div>

                                  {/* Bawah */}
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <Checkbox
                                        id="reason-custom"
                                        checked={selectedDetail.reasonType === "custom"}
                                        disabled
                                      />
                                      <label htmlFor="reason-custom" className="text-sm text-gray-700 cursor-pointer">
                                        Close current Purchase Order & open new Purchase Order
                                      </label>
                                    </div>
                                    {selectedDetail.reasonType === "custom" && (
                                      <div className="ml-6 bg-white border border-gray-300 rounded p-2">
                                        <input
                                          type="text"
                                          value={selectedDetail.customReason || ""}
                                          readOnly
                                          placeholder="Custom reason"
                                          className="w-full text-xs bg-white text-gray-700"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                                {/* Remarks Section */}
                                <div className="w-1/2 flex flex-col  h-full">
                                    <div className="flex-1 flex flex-col border rounded-md p-4 bg-gray-50" style={{ minHeight: "190px" }}>
                                        <Label className="mb-3 font-semibold text-purple-900">Remarks</Label>
                                        <Textarea
                                            value={
                                                selectedDetail.remarks || ""
                                            }
                                            readOnly
                                            placeholder="No remarks"
                                            className="flex-1 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[10px] mb-3"style={{minHeight: '190px'}}>
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
                                                    selectedDetail?.totalReturnAmount || 0
                                                )}
                                            </span>
                                            <span className="text-gray-700 text-sm w-4 text-left"></span>
                                        </div>

                                        {/* Discount */}
                                        <div className="flex items-center">
                                            <span className="text-gray-700 text-sm flex-1 font-bold flex items-center gap-2">
                                                Discount
                                              
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
                                                <span className="text-gray-700 text-sm w-4 text-right"></span>
                                                <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                                                    {formatCurrency(
                                                        (selectedDetail?.totalReturnAmount || 0) +
                                                        (selectedDetail?.tax || 0) +
                                                        otherCosts.reduce((sum, cost) => sum + cost.costAmount, 0) -
                                                        ((editDiscount || 0) + (selectedDetail?.pph || 0))
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
                                onClick={() => {
                                    alert("Nanti ikutin format logistik deh tampilan print nya gmn, tim PI gk ada keperluan print Purchase Return");
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
                                {selectedDetail?.linkedDocs?.length || 0}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Documents linked with this purchase return
                        </DialogDescription>
                    </DialogHeader>
                    <div
                        className="space-y-3"
                        style={{ width: "500px" }}
                    >
                        {!selectedDetail?.linkedDocs || selectedDetail.linkedDocs.length === 0 ? (
                            <p className="text-gray-500 text-sm">No linked documents</p>
                        ) : (
                            <>
                                {selectedDetail.linkedDocs.map((doc: any, idx: number) => {
                                    // Determine icon and colors based on document type
                                    let iconComponent;
                                    let borderColor;
                                    let hoverColor;
                                    let badgeClass;
                                    let iconColor;

                                    if (doc.type === "Purchase Order") {
                                        iconComponent = <FileText className="w-5 h-5 text-indigo-600" />;
                                        borderColor = "border-indigo-200";
                                        hoverColor = "hover:bg-indigo-50";
                                        badgeClass = "bg-indigo-100 text-indigo-700 border-indigo-200";
                                        iconColor = "text-indigo-600";
                                    } else if (doc.type === "Purchase Invoice") {
                                        iconComponent = <FileCheck className="w-5 h-5 text-blue-600" />;
                                        borderColor = "border-blue-200";
                                        hoverColor = "hover:bg-blue-50";
                                        badgeClass = "bg-blue-100 text-blue-700 border-blue-200";
                                        iconColor = "text-blue-600";
                                    } else if (doc.type === "Import Cost") {
                                        iconComponent = <Warehouse className="w-5 h-5 text-orange-600" />;
                                        borderColor = "border-orange-200";
                                        hoverColor = "hover:bg-orange-50";
                                        badgeClass = "bg-orange-100 text-orange-700 border-orange-200";
                                        iconColor = "text-orange-600";
                                    } else {
                                        iconComponent = <FileText className="w-5 h-5 text-gray-600" />;
                                        borderColor = "border-gray-200";
                                        hoverColor = "hover:bg-gray-50";
                                        badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                                        iconColor = "text-gray-600";
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 bg-white border ${borderColor} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${hoverColor}`}
                                            onClick={() => {
                                                if (doc.type === "Purchase Order") {
                                                    onNavigateToPurchaseOrder?.(doc.docNo);
                                                } else if (doc.type === "Purchase Invoice") {
                                                    onNavigateToPurchaseInvoice?.(doc.docNo);
                                                } else if (doc.type === "Import Cost") {
                                                    onNavigateToImportCost?.(doc.docNo);
                                                }
                                                setShowLinkedDocsDialog(false);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {iconComponent}
                                                    <div>
                                                        <p className={`font-medium`} style={{ color: iconColor.includes('indigo') ? '#4f46e5' : iconColor.includes('blue') ? '#2563eb' : iconColor.includes('orange') ? '#ea580c' : '#4b5563' }}>
                                                            {doc.docNo}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {doc.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={badgeClass}
                                                >
                                                    {doc.type === "Purchase Order" ? "PO" : doc.type === "Purchase Invoice" ? "PI" : doc.type === "Import Cost" ? "IC" : "DOC"}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* AP NOTES */}
                                {apNotes && apNotes.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <p className="font-medium text-sm text-gray-700">Linked AP Notes</p>
                                            <Badge
                                                variant="outline"
                                                className="bg-indigo-100 text-indigo-700 border-indigo-200"
                                            >
                                                {apNotes.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {apNotes.map((note, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-100"
                                                    onClick={() => {
                                                        onNavigateToAPNote?.(note.id);
                                                        setShowLinkedDocsDialog(false);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Receipt className="w-4 h-4 text-indigo-600" />
                                                            <div>
                                                                <p className="text-indigo-700 font-medium text-sm">{note.apNoteNo || `AP Note ${idx + 1}`}</p>
                                                                <p className="text-xs text-gray-500">{note.date || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-indigo-600 text-white">AP Note</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
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
              variant="outline"
              onClick={() => setShowAttachmentUploadDialog(false)}
              className="flex-1"
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
                {selectedDetail?.supplierName || "N/A"}
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



      {/* Submit Dialog */}
      <Dialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
      >
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0 pointer-events-auto z-50" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 pointer-events-auto">
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
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
            <Card className="p-3 bg-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Filter className="h-4 w-4" />
                  <span>
                    {selectedDocs.size} of{" "}
                    {availableDocsForSubmission.length}{" "}
                    documents selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={submitDialogSelectAll}
                    onCheckedChange={(checked: boolean) => {
                      setSubmitDialogSelectAll(
                        checked === true,
                      );
                      if (checked === true) {
                        const allIds = new Set(
                          availableDocsForSubmission.map(
                            (doc) => doc.id,
                          ),
                        );
                        setSelectedDocs(allIds);
                      } else {
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


          </div>

          <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-6 flex justify-between gap-2 pointer-events-auto">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="pointer-events-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDocs}
              disabled={
                selectedDocs.size === 0 ||
                
                !submittedTo ||
                !submissionDate ||
                !isValidDate(submissionDate)
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 pointer-events-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit {selectedDocs.size} Document
              {selectedDocs.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Date Selection Dialog */}
      <Dialog
        open={showReceiveDateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowReceiveDateDialog(false);
          }
        }}
      >
        <DialogContent className="w-auto max-w-sm" onClick={(e) => e.stopPropagation()}>
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
                
      {/* Document Monitoring Dialog */}
      <DocumentMonitoringDialog
        open={showPOMonitoringDialog}
        onOpenChange={setShowPOMonitoringDialog}
        po={mockPurchaseOrder?.find((po: any) => po.purchaseOrderNo === selectedDetail?.poNo) || { purchaseOrderNo: selectedDetail?.poNo }}
        mockItems={mockItems}
        isPOCreated={(poNumber: string) => mockPurchaseOrder?.some((po: any) => po.purchaseOrderNo === poNumber) || false}
        getEffectivePOStatus={(po: any, items: any[]) => po?.status || "Draft"}
        formatDateToDDMMYYYY={formatDateToDDMMYYYY}
        piNumber={selectedDetail?.piNo || selectedDetail?.prNo || ""}
        formatCurrency={formatCurrency}
        initialActiveStep="pr"
      />

    </div>
  );
}
