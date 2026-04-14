import { useState, useEffect, useRef } from "react";
import { formatNumber, parseFormattedNumber } from "../utils/numberFormat";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  Building2,
  LayoutDashboard,
  Filter,
  X,
  Link,
  FileCheck,
  Receipt,
  User,
  UserCheck,
  Clock,
  Wallet,
  Eye,
  Plus,
  Trash2,
  Edit,
  Check,
  Archive,
  Trash,
  AlertCircle
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { mockReimburseWithoutPO as mockReimburseData, mockSuppliers } from "../mocks/mockData";

export default function ReimburseWithoutPO({
  onNavigateToPurchaseOrder,
  onNavigateToPaymentVoucher,
}: {
  onNavigateToPurchaseOrder?: (documentNo: string) => void;
  onNavigateToPaymentVoucher?: (pvrNo: string, pvrId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ptFilter, setPtFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [vendorOriginFilter, setVendorOriginFilter] = useState("all");
  const [activeFilterType, setActiveFilterType] = useState<"status" | "pt" | "type" | "vendorOrigin" | null>(null);

  const [expandAll, setExpandAll] = useState(false);
  const [expandedReimIds, setExpandedReimIds] = useState<Set<string>>(new Set());
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] = useState(false);
  const navigationLockRef = useRef<{ id: string; timeout: NodeJS.Timeout } | null>(null);

  // Auto-expand effect for navigation
  useEffect(() => {
    const handleNavigation = (event: any) => {
      const { reimburseNo, reimId } = event.detail;
      const currentNavigationId = Date.now().toString();

      console.log("🔔 [REIMBURSE] Navigation event received:", reimburseNo, "ID:", currentNavigationId);
      console.log("🔒 [REIMBURSE] Current lock:", navigationLockRef.current?.id);

      // CRITICAL: Only process if we're NOT already locked
      if (navigationLockRef.current) {
        console.log("⛔ [REIMBURSE] Navigation blocked - already processing");
        return;
      }

      // Set the lock with unique ID
      const timeoutId = setTimeout(() => {
        navigationLockRef.current = null;
        console.log("🔓 [REIMBURSE] Navigation lock released automatically");
      }, 1500);

      navigationLockRef.current = { id: currentNavigationId, timeout: timeoutId };
      console.log("🔐 [REIMBURSE] Navigation lock enabled, ID:", currentNavigationId);

      const targetReim = mockReimburseData.find(r =>
        (reimburseNo && r.reimburseNo === reimburseNo) ||
        (reimId && r.reimId === reimId)
      );

      if (targetReim) {
        console.log("✨ [REIMBURSE] Expanding and scrolling to:", targetReim.reimburseNo);
        setExpandedReimIds(prev => {
          const next = new Set(prev);
          next.add(targetReim.reimId);
          return next;
        });

        // Clear search and filters to make sure it's visible
        setSearchQuery("");
        setStatusFilter("all");
        setPtFilter("all");
        setTypeFilter("all");
        setVendorOriginFilter("all");
        setCalendarDateFrom("");
        setCalendarDateTo("");
        setActiveFilterType(null);

        // Scroll to card
        setTimeout(() => {
          const element = document.getElementById(`reim-card-${targetReim.reimburseNo}`);
          if (element) {
            console.log("✅ [REIMBURSE] Scrolled to element");
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      } else {
        // Clear lock if reimbursement not found
        if (navigationLockRef.current?.id === currentNavigationId) {
          clearTimeout(navigationLockRef.current.timeout);
          navigationLockRef.current = null;
        }
        console.log("⚠️  [REIMBURSE] No matching reimbursement found for:", { reimburseNo, reimId });
      }
    };

    window.addEventListener("navigateToReimburse", handleNavigation);
    return () => {
      window.removeEventListener("navigateToReimburse", handleNavigation);
      // Cleanup lock on unmount
      if (navigationLockRef.current) {
        clearTimeout(navigationLockRef.current.timeout);
        navigationLockRef.current = null;
      }
    };
  }, []);

  // Helper functions for date formatting
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isValidDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 10) return false;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return false;
    return true; // Simplified for this example
  };

  const convertToISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
  };

  const filteredData = mockReimburseData.filter((item) => {
    const matchesSearch = searchQuery === "" ||
      item.reimburseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPt = ptFilter === "all" || item.ptCompany === ptFilter;
    const matchesType = typeFilter === "all" || item.reimburseType === typeFilter;
    const matchesVendorOrigin = vendorOriginFilter === "all" || item.vendorOrigin === vendorOriginFilter;

    let matchesDateRange = true;
    if (calendarDateFrom || calendarDateTo) {
      const itemDateISO = convertToISODate(item.createDate);
      const fromISO = calendarDateFrom ? convertToISODate(calendarDateFrom) : "";
      const toISO = calendarDateTo ? convertToISODate(calendarDateTo) : "";
      if (fromISO && itemDateISO < fromISO) matchesDateRange = false;
      if (toISO && itemDateISO > toISO) matchesDateRange = false;
    }

    return matchesSearch && matchesStatus && matchesPt && matchesType && matchesVendorOrigin && matchesDateRange;
  }

  );

  return (
    <div className="p-6 space-y-6 relative overflow-hidden">
      {/* Tab Filters (Same as PurchaseOrder.tsx) */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          {[
            { id: "pt", label: ptFilter === "all" ? "ALL PT" : ptFilter },
            { id: "status", label: statusFilter === "all" ? "ALL STATUS" : statusFilter },
            { id: "type", label: typeFilter === "all" ? "ALL REIMBURSE TYPE" : typeFilter.toUpperCase() },
            { id: "vendorOrigin", label: vendorOriginFilter === "all" ? "ALL VENDOR ORIGIN" : vendorOriginFilter.toUpperCase() }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilterType(activeFilterType === btn.id ? null : btn.id as any)}
              className={`
                flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
                ${activeFilterType === btn.id || (btn.id === "pt" && ptFilter !== "all") || (btn.id === "status" && statusFilter !== "all") || (btn.id === "type" && typeFilter !== "all") || (btn.id === "vendorOrigin" && vendorOriginFilter !== "all")
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                }
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Dynamic Filter Details Row */}
        <div className="h-[44px] flex items-center overflow-hidden">
          <div className="flex flex-1 items-center gap-1.5">
            {activeFilterType === "status" && ["all", "OUTSTANDING", "PARTIAL", "COMPLETE"].map((key) => (
              <button
                key={key}
                onClick={() => { setStatusFilter(key); setActiveFilterType(null); }}
                className={`flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all ${statusFilter === key ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"}`}
              >
                {key === "all" ? "ALL STATUS" : key}
              </button>
            ))}
            {activeFilterType === "pt" && ["all", "AMT", "GMI", "MJS", "TTP", "WNS", "WSI", "IMI"].map((key) => (
              <button
                key={key}
                onClick={() => { setPtFilter(key); setActiveFilterType(null); }}
                className={`flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all ${ptFilter === key ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"}`}
              >
                {key === "all" ? "ALL PT" : key}
              </button>
            ))}
            {activeFilterType === "type" && ["all", "Urgent", "Credit"].map((key) => (
              <button
                key={key}
                onClick={() => { setTypeFilter(key); setActiveFilterType(null); }}
                className={`flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all ${typeFilter === key ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"}`}
              >
                {key === "all" ? "ALL REIMBURSE TYPE" : key.toUpperCase()}
              </button>
            ))}
            {activeFilterType === "vendorOrigin" && ["all", "Overseas", "Local"].map((key) => (
              <button
                key={key}
                onClick={() => { setVendorOriginFilter(key); setActiveFilterType(null); }}
                className={`flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all ${vendorOriginFilter === key ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"}`}
              >
                {key === "all" ? "ALL VENDOR ORIGIN" : key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {(statusFilter !== "all" || ptFilter !== "all" || typeFilter !== "all" || vendorOriginFilter !== "all") && (
          <Button
            onClick={() => {
              setStatusFilter("all");
              setPtFilter("all");
              setTypeFilter("all");
              setVendorOriginFilter("all");
              setActiveFilterType(null);
            }}
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
          >
            <X className="w-3 h-3 mr-1" /> Clear Filters
          </Button>
        )}
        <Button
          onClick={() => setShowCalendarDialog(true)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Filter Date
        </Button>
        <Button
          onClick={() => setExpandAll(!expandAll)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {expandAll ? (
            <><ChevronUp className="h-4 w-4 mr-2" /> Collapse All</>
          ) : (
            <><ChevronDown className="h-4 w-4 mr-2" /> Expand All</>
          )}
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-purple-700">{filteredData.length}</span>{" "}
        of{" "}
        <span className="font-semibold text-purple-700">{mockReimburseData.length}</span> documents
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <Input
            placeholder="Search Reimburse Number or Supplier..."
            className="pl-10 border-purple-200 focus:border-purple-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <div key={item.reimId} id={`reim-card-${item.reimburseNo}`}>
            <ReimburseCollapsible
              item={item}
              expandAll={expandAll}
              isInitiallyExpanded={expandedReimIds.has(item.reimId)}
              onNavigateToPurchaseOrder={onNavigateToPurchaseOrder}
              onNavigateToPaymentVoucher={onNavigateToPaymentVoucher}
            />
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No reimburse documents found
        </div>
      )}

      {/* Calendar Dialog (Same as PurchaseOrder.tsx) */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Filter by Date Range</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />{calendarDateFrom || "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={calendarDateFrom ? new Date(convertToISODate(calendarDateFrom)) : undefined} onSelect={(date) => { if (date) { const day = String(date.getDate()).padStart(2, "0"); const month = String(date.getMonth() + 1).padStart(2, "0"); const year = date.getFullYear(); setCalendarDateFrom(`${day}/${month}/${year}`); } }} initialFocus />
                  </PopoverContent>
                </Popover>
                <Input placeholder="DD/MM/YYYY" value={calendarDateFrom} onChange={(e) => setCalendarDateFrom(e.target.value)} className="w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />{calendarDateTo || "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={calendarDateTo ? new Date(convertToISODate(calendarDateTo)) : undefined} onSelect={(date) => { if (date) { const day = String(date.getDate()).padStart(2, "0"); const month = String(date.getMonth() + 1).padStart(2, "0"); const year = date.getFullYear(); setCalendarDateTo(`${day}/${month}/${year}`); } }} initialFocus />
                  </PopoverContent>
                </Popover>
                <Input placeholder="DD/MM/YYYY" value={calendarDateTo} onChange={(e) => setCalendarDateTo(e.target.value)} className="w-48" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="use-today" checked={calendarUseTodayDate} onCheckedChange={(checked) => { setCalendarUseTodayDate(checked as boolean); if (checked) { const today = getCurrentDate(); setCalendarDateFrom(today); setCalendarDateTo(today); } }} />
              <label htmlFor="use-today" className="text-sm font-medium leading-none">Use today's date</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setShowCalendarDialog(false); setCalendarDateFrom(""); setCalendarDateTo(""); setCalendarUseTodayDate(false); }}>Clear Filter</Button>
              <Button onClick={() => setShowCalendarDialog(false)} className="bg-purple-600 hover:bg-purple-700">Apply Filter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Internal Collapsible Component (Mimics POCollapsible compact view)
function ReimburseCollapsible({
  item,
  expandAll,
  isInitiallyExpanded,
  onNavigateToPurchaseOrder,
  onNavigateToPaymentVoucher,
}: {
  item: any;
  expandAll: boolean;
  isInitiallyExpanded?: boolean;
  onNavigateToPurchaseOrder?: (documentNo: string) => void;
  onNavigateToPaymentVoucher?: (pvNo: string, pvId: string, pvData?: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(expandAll || isInitiallyExpanded);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] = useState(false);
  const [showAttachmentUploadDialog, setShowAttachmentUploadDialog] = useState(false);
  const [showUploadAttachmentDialog, setShowUploadAttachmentDialog] = useState(false);
  const [showPVDialog, setShowPVDialog] = useState(false);
  const [showCreatePVDialog, setShowCreatePVDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedPVNumber, setSavedPVNumber] = useState("");
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [showSupplierPVDropdown, setShowSupplierPVDropdown] = useState(false);
  const [supplierSearchTermPV, setSupplierSearchTermPV] = useState("");
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState("");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState("");
  const [pvDataFromStorage, setPvDataFromStorage] = useState<any[]>([]);
  const [createdPVs, setCreatedPVs] = useState<any[]>([]);

  const getDocumentNumber = (pi: any) => {
    return pi.piNo || pi.invoiceNo || pi.documentNo;
  };

  // Load PVs created from this Reimburse when dialog opens
  useEffect(() => {
    if (showLinkedDocsDialog) {
      try {
        const pvData = JSON.parse(localStorage.getItem("pvData") || "[]");
        setPvDataFromStorage(pvData);
        
        // Filter PVs that were created from this Reimburse
        const filtered = pvData.filter(
          (pv: any) => pv.linkedFromReimburseNo === item.reimburseNo
        );
        setCreatedPVs(filtered);
      } catch (error) {
        console.error("[ReimburseWithoutPO] Failed to load PV data:", error);
        setPvDataFromStorage([]);
        setCreatedPVs([]);
      }
    }
  }, [showLinkedDocsDialog, item.reimburseNo]);

  useEffect(() => {
    if (showCreatePVDialog) {
      const initialPt = item.ptCompany || "WNS";
      const initialDate = getTodayDate();
      
      setLinkedPIs([
        {
          id: item.id,
          piNo: item.reimburseNo,
          invoiceNo: item.reimburseNo,
          invoiceDate: item.createDate || initialDate,
          totalAmount: item.grandTotal || 0,
          documentType: "PI",
          documentTypeLabel: "Reimburse without PO",
        },
      ]);

      // Set form state with mock data defaults
      setPvrForm(prev => ({ 
        ...prev, 
        supplier: item.supplier || "",
        pt: initialPt,
        pvrNo: generatePVNumber(initialPt, initialDate),
        term: (item.reimburseType === "Credit" || item.reimburseType === "Urgent") 
               ? item.reimburseType 
               : "Credit",
        currency: item.vendorOrigin === "Overseas" ? "USD" : "IDR"
      }));
    }
  }, [showCreatePVDialog, item]);

  // Import mock suppliers for the PV dropdown
  const mockSuppliers = [
    { name: "PT. ADI JAYA TEKNIK", category: "LOCAL" },
    { name: "PT. MANDIRI JAYA SENTOSA", category: "LOCAL" },
    { name: "CATERPILLAR OVERSEAS", category: "OVERSEAS" },
    { name: "PT. SUMBER BARU", category: "LOCAL" },
    { name: "PT. ALAM JAYA", category: "LOCAL" },
  ];

  const filteredSuppliers = mockSuppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearchTermPV.toLowerCase())
  );

  // Helper functions for PV
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const convertToStorageDate = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes("/")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const generatePVNumber = (pt: string, pvrDate: string): string => {
    const dateParts = pvrDate.split("/");
    const month = dateParts[1] || "01";
    const year = dateParts[2] || "2024";
    const yy = year.slice(-2);
    const zz = month;
    const aa = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    return `PV/${pt}.MDN/${yy}${zz}/00${aa}`;
  };

  const [pvrForm, setPvrForm] = useState({
    pvrNo: generatePVNumber("WNS", getTodayDate()),
    pvrDate: getTodayDate(),
    docReceiptDate: getTodayDate(),
    term: "Credit",
    supplier: "",
    currency: "IDR",
    paymentMethod: "Transfer",
    remarks: "",
    pt: "",
    rate: 0,
    bankAccount: "KAS SEMENTARA",
    reference: "",
  });

  const resetPVForm = () => {
    const today = getTodayDate();
    setPvrForm({
      pvrNo: generatePVNumber("WNS", today),
      pvrDate: today,
      docReceiptDate: today,
      term: "Credit",
      supplier: "",
      currency: "IDR",
      paymentMethod: "Transfer",
      remarks: "",
      pt: "WNS",
      rate: 0,
      bankAccount: "KAS SEMENTARA",
      reference: "",
    });
  };

  const handleSupplierPVChange = (supplier: string) => {
    setPvrForm({ ...pvrForm, supplier });
    setShowSupplierPVDropdown(false);
  };

  const handleCreatePV = () => {
    // Build complete PVR object
    let totalAmount = 0;
    linkedPIs.forEach((pi) => {
      totalAmount += pi.totalAmount || 0;
    });
    
    const supplierCategory = item.vendorOrigin === "Overseas" ? "OVERSEAS" : "LOCAL";
    
    const newPV = {
      id: Date.now().toString(),
      pvNo: pvrForm.pvrNo,
      pvDate: convertToStorageDate(pvrForm.pvrDate),
      docReceiptDate: convertToStorageDate(pvrForm.docReceiptDate),
      supplierName: pvrForm.supplier,
      supplierCategory: supplierCategory,
      currency: pvrForm.currency,
      rate: pvrForm.rate,
      term: pvrForm.term,
      pt: pvrForm.pt,
      bankAccount: pvrForm.bankAccount,
      paymentMethod: pvrForm.paymentMethod,
      remarks: pvrForm.remarks,
      reference: pvrForm.reference,
      poNumber: "",
      totalInvoice: totalAmount,
      createdBy: "Admin",
      createdDate: new Date().toISOString(),
      isSubmitted: false,
      isApproved: false,
      status: "active",
      linkedFromReimburseNo: item.reimburseNo,
      linkedDocs: linkedPIs.map((pi) => ({
        id: pi.id,
        piNo: pi.piNo || "",
        poNo: "",
        invoiceNo: pi.invoiceNo || "",
        invoiceDate: pi.invoiceDate || "",
        currency: pvrForm.currency,
        totalAmount: pi.totalAmount || 0,
        amountPaid: pi.amountPaid || pi.totalAmount || 0,
        documentType: "PI",
        documentTypeLabel: "Reimburse without PO",
      }))
    };
    
    // Save to localStorage with key "pvData" to sync with PaymentVoucherV2.tsx
    try {
      const existingPVs = JSON.parse(localStorage.getItem("pvData") || "[]");
      const updatedPVs = [newPV, ...existingPVs];
      localStorage.setItem("pvData", JSON.stringify(updatedPVs));
      console.log("[ReimburseWithoutPO] PV saved to localStorage:", newPV.pvNo);
      
      // Dispatch custom event to notify PaymentVoucherV2 of new PV
      window.dispatchEvent(new CustomEvent("pvDataUpdated", { 
        detail: { updatedPVs, newPV } 
      }));
      console.log("[ReimburseWithoutPO] Dispatched pvDataUpdated event");
    } catch (error) {
      console.error("[ReimburseWithoutPO] Failed to save PV to localStorage:", error);
    }
    
    setSavedPVNumber(pvrForm.pvrNo);
    setShowCreatePVDialog(false);
    setShowSuccessDialog(true);
    

    
    resetPVForm();
  };

  // Mock data for attachments
  const documents = [
    {
      id: "1",  
      name: "Receipt_001.jpg",
      type: "Image",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Invoice_PT_AMT.pdf",
      type: "PDF Document",
      image: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=500&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    if (isInitiallyExpanded) {
      setIsExpanded(true);
    }
  }, [isInitiallyExpanded]);

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val).replace("Rp", "Rp ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100"
      style={{
        background: "linear-gradient(135deg, #DCCCEC 0%, #E8DDEF 15%, #F0E6F3 30%, #F4EDFA 45%, #F8F5FC 60%, #FAFAFF 75%, #FCFCFF 85%, #FFFFFF 100%)",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-purple-50/30 transition-colors relative"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900 font-mono min-w-[180px] flex items-center gap-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  {item.reimburseNo}
                </span>

              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#7C3AED]/5 text-[#7C3AED] border-[#7C3AED]/20 text-[10px] font-bold">
                  {item.ptCompany}
                </Badge>
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600 text-sm font-medium truncate">
                  {item.supplier}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <Badge className={`${item.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-700' : item.status === 'OUTSTANDING' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} border-transparent`}>
              {item.status}
            </Badge>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <span className="text-green-700">
                {formatCurrency(item.grandTotal)}
              </span>
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/50 border-t border-[#7C3AED]/10"
          >
            <div className="p-6">
              {/* Header Info - Similar to POCollapsible */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">



                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-500" /> Created By
                  </span>
                  <div className="text-sm font-semibold text-gray-900">{item.createdBy}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Checked By
                  </span>
                  <div className="text-sm font-semibold text-gray-900">{item.approvedBy || "N/A"}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Approved By
                  </span>
                  <div className="text-sm font-semibold text-gray-900">{item.approvedBy || "N/A"}</div>
                </div>
              </div>

              {/* Financial Summary Cards - Exactly matching POCollapsible */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 border border-green-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">Rp</div>
                    <div className="flex-1">
                      <div className="text-xs text-green-700 font-medium">Grand Total</div>
                      <div className="text-sm font-bold text-green-900">{formatCurrency(item.grandTotal)}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">DP</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium">Down Payment</div>
                      <div className="text-sm font-bold text-blue-900">{formatCurrency(0)}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">!</div>
                    <div className="flex-1">
                      <div className="text-xs text-orange-700 font-medium">Outstanding</div>
                      <div className="text-sm font-bold text-orange-900">{formatCurrency(item.grandTotal)}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">%</div>
                    <div className="flex-1">
                      <div className="text-xs text-purple-700 font-medium">Progress</div>
                      <div className="text-sm font-bold text-purple-900">0.0%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New empty div box */}
              {item.items?.map((subItem: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-6 pb-8 border border-[#7C3AED]/10 shadow-sm mb-6 last:mb-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Detail Information {item.items.length > 1 ? `#${idx + 1}` : ""}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] uppercase font-semibold">Airline Ticket For</span>
                        <span className="text-gray-900 text-sm font-medium">{subItem.airlineTicketPayment}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] uppercase font-semibold">Departure Date</span>
                        <span className="text-gray-900 text-sm font-medium">{subItem.departureDate}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] uppercase font-semibold">Destination</span>
                        <span className="text-gray-900 text-sm font-medium">{subItem.destination}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] uppercase font-semibold">SPK/PO/WO Number</span>
                        <span className="text-gray-900 text-sm font-medium">{subItem.spkPoWoNo}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] uppercase font-semibold">Amount</span>
                        <span className="text-gray-900 text-sm font-medium">{formatCurrency(subItem.amount)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-4 border-t border-gray-50 mb-4">
                      <span className="text-gray-400 text-[10px] uppercase font-semibold">Purpose</span>
                      <span className="text-gray-900 text-sm font-medium italic">{subItem.purpose}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
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

                {/* Attachment Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowAttachmentUploadDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px] justify-start"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">Attachment</span>
                </Button>

                {/* Create PV Button */}
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowCreatePVDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-center">PV</span>
                </Button>
              </div>

              {/* Attachment Dialog */}
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

              {/* Upload New Attachment Dialog */}
              <Dialog open={showUploadAttachmentDialog} onOpenChange={setShowUploadAttachmentDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-purple-900 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-purple-600" />
                      Upload New Attachment
                    </DialogTitle>
                    <DialogDescription>
                      Choose a file to attach to {item.reimburseNo}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer">
                      <FileCheck className="w-10 h-10 text-purple-300 mb-2" />
                      <p className="text-sm text-purple-700 font-medium font-mono">Click or drag to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF up to 10MB</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUploadAttachmentDialog(false)}>Cancel</Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowUploadAttachmentDialog(false)}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* create new PV Dialog */}
              <Dialog
                open={showCreatePVDialog}
                onOpenChange={(open) => {
                  setShowCreatePVDialog(open);
                  if (!open) {
                    resetPVForm();
                    setLinkedPIs([]);
                    setShowSupplierPVDropdown(false);
                    setSupplierSearchTermPV("");
                  }
                }}
              >
                <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-purple-900">
                      Create New Payment Voucher
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
                            value={pvrForm.supplier}
                            onChange={(e) => {
                              setPvrForm({
                                ...pvrForm,
                                supplier: e.target.value,
                              });
                              setSupplierSearchTermPV(e.target.value);
                            }}
                            onClick={() =>
                              setShowSupplierPVDropdown(true)
                            }
                            onBlur={() =>
                              setTimeout(() => setShowSupplierPVDropdown(false), 200)
                            }
                            placeholder="Type to search..."
                          />
                          {showSupplierPVDropdown &&
                            filteredSuppliers.length > 0 && (
                              <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                                {filteredSuppliers.map((supplier) => (
                                  <button
                                    key={supplier.name}
                                    className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSupplierPVChange(
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
                                pvrNo: generatePVNumber(
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
                                      pvrNo: generatePVNumber(
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
                                    pvrNo: generatePVNumber(
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
                                        pvrNo: generatePVNumber(
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
                            disabled={!pvrForm.supplier}
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
                                {/* <th
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
                                </th> */}
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
                                        {pi.documentTypeLabel || getDocTypeLabel(docType)}
                                      </td>
                                      <td className="px-4 py-3 text-sm truncate">
                                        {getDocumentNumber(pi)}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {formatNumber(pi.totalAmount)}
                                      </td>
                                      {/* <td className="px-4 py-3 text-sm">
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
                                      </td> */}
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
                          onClick={handleCreatePV}
                          className="bg-purple-600 hover:bg-purple-700 text-sm"
                          disabled={!pvrForm.supplier || linkedPIs.length === 0}
                        >
                          Save PV
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Success Notification Dialog */}
              <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent style={{ maxWidth: "500px" }}>
                  <DialogHeader>
                    <DialogTitle className="text-purple-900 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      Success
                    </DialogTitle>
                    <DialogDescription className="py-2 text-gray-700">
                      Payment Voucher has been successfully saved.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-purple-600 font-medium mb-1">PV Number</div>
                    <div className="text-lg font-bold text-purple-900">{savedPVNumber}</div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => setShowSuccessDialog(false)}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                      OK
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Linked Documents Dialog */}
              <Dialog
                open={showLinkedDocsDialog}
                onOpenChange={setShowLinkedDocsDialog}
              >
                <DialogContent className="w-fit min-w-[600px] max-h-[700px] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-purple-900 flex items-center gap-2">
                      Linked Documents
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-700 border-purple-200"
                      >
                        {(item.linkedDocs?.length || 0) + createdPVs.length}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Purchase Orders + Payment Vouchers created from this Reimburse
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto space-y-2 py-3" style={{ width: "550px" }}>
                    {/* Linked Documents - Combined POs and PVs */}
                    <div className="space-y-2">
                      {/* Purchase Orders */}
                      {item.linkedDocs && item.linkedDocs.map((doc: any, idx: number) => (
                        <div
                          key={`po-${idx}`}
                          className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                          onClick={() => {
                            if (doc.documentType === "Purchase Order") {
                              if (onNavigateToPurchaseOrder) {
                                onNavigateToPurchaseOrder(doc.documentNo);
                              } else {
                                const event = new CustomEvent("navigateToPurchaseOrder", {
                                  detail: { poNo: doc.documentNo },
                                });
                                window.dispatchEvent(event);
                              }
                              setShowLinkedDocsDialog(false);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <div>
                                <p className="font-semibold text-indigo-700">
                                  {doc.documentNo}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Purchase Order
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className="bg-indigo-100 text-indigo-700 border-indigo-200"
                              >
                                PO
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Payment Vouchers */}
                      {createdPVs.map((pv: any) => (
                        <div
                          key={`pv-${pv.id}`}
                          className="p-4 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-indigo-50"
                          onClick={() => {
                            if (onNavigateToPaymentVoucher) {
                              onNavigateToPaymentVoucher(pv.pvNo, pv.id, pv);
                            } else {
                              const event = new CustomEvent("navigateToPaymentVoucher", {
                                detail: { pvNo: pv.pvNo, pvId: pv.id, pvData: pv },
                              });
                              window.dispatchEvent(event);
                            }
                            setShowLinkedDocsDialog(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <div>
                                <p className="font-semibold text-indigo-700">{pv.pvNo}</p>
                                <p className="text-sm text-gray-500">Payment Voucher</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                              PV
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!item.linkedDocs || item.linkedDocs.length === 0) && createdPVs.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-500 italic">
                          No linked documents found
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-shrink-0 border-t pt-3">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


