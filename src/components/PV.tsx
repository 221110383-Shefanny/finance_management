import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, m } from "motion/react";
import { formatDateToDDMMYYYY, isValidDate } from "../utils/dateFormat";
import { formatNumber, parseFormattedNumber } from "../utils/numberFormat";
import {
  mockPV,
  mockSuppliers,
  mockpurchaseInvoice,
  mockImportCosts,
  mockShipmentRequest,
  mockExpenseNote,
  mockPurchaseOrder,
  mockPVR,
  mockpurchaseReturns,
  findLinkedPVRsByPINo,
} from "../mocks/mockData";
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
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Globe2,
  MapPin,
  Receipt,
  Wallet,
  User,
  CreditCard,
  Check,
  FileCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
  Filter,
  Clock,
  ClockIcon,
  CheckCircle2,
  Edit,
  Link as LinkIcon,
  Trash2,
  XCircle,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type SupplierCategory = "OVERSEAS" | "LOCAL";
type TermType = "Credit" | "Urgent" | "QPF" | "CREDIT";
type PaymentMethod = "Transfer" | "Cash" | "TRANSFER" | "CASH";
type PTType =
  | "WNS"
  | "MJS"
  | "TTP"
  | "GMI"
  | "AMT"
  | "WSI"
  | "IMI";
type PVStatus = "DRAFT" | "PROCESSED" | "PAID" | "voided";

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

interface PVData {
  id: string;
  pvNo: string;
  pvDate: string;
  pvrNo: string;
  pvrDate?: string;
  supplierName: string;
  supplierCategory: SupplierCategory;
  currency: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdBy: string;
  pt: PTType;
  status: PVStatus;
  remarks: string;
  term: string;
  linkedDocs?: LinkedPIDocument[];
  totalInvoice?: number;
  rate?: number;
  bankAccount?: string;
  method?: string;
  reference?: string;
}

// Mock data for approved PVRs that become PVs

interface PVProps {
  onNavigateToPurchaseInvoice?: (piNo: string) => void;
  onNavigateToPurchaseOrder?: (poNo: string) => void;
  onNavigateToImportCost?: (icNo: string) => void;
  onNavigateToShipmentRequest?: (srNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToAPNote?: (apNoteNo: string) => void;
  onNavigateToPurchaseReturn?: (prNo: string) => void;
}

export default function PV({
  onNavigateToPurchaseInvoice,
  onNavigateToPurchaseOrder,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToPVR,
  onNavigateToAPNote,
  onNavigateToPurchaseReturn,
}: PVProps) {
  const [pvData, setPvData] = useState<PVData[]>(() => {
    try {
      const saved = localStorage.getItem("pvData");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return (mockPV as any[]).map((pv: any) => {
      const pvrNo = (mockPVR.find((p: any) => p.poNumber === pv.poNumber || p.pvrNo === pv.pvrNo))?.pvrNo || pv.poNumber || pv.pvrNo || "";
      
      return {
        id: pv.pvid || Math.random().toString(36).substr(2, 9),
        pvNo: pv.pvNo || "N/A",
        pvDate: pv.pvDate || new Date().toISOString().split("T")[0],
        pvrNo: pvrNo,
        pvrDate: pv.pvDate || new Date().toISOString().split("T")[0],
        supplierName: pv.supplierName || "Unknown Supplier",
        supplierCategory: pv.supplierCategory || "LOCAL",
        currency: pv.currency || "IDR",
        paymentMethod: (pv.paymentMethod || "TRANSFER") as PaymentMethod,
        totalAmount: pv.totalAmount || 0,
        createdBy: pv.createdBy || "System",
        pt: (pv.pt || "AMT") as PTType,
        status: "DRAFT" as PVStatus,
        remarks: pv.remarks || "",
        term: pv.term || "CREDIT",
        linkedDocs: (pv.linkedDocs || []).map((doc: any) => ({
          ...doc,
          pvrNo: doc.pvrNo || pvrNo,
        })),
        totalInvoice: pv.totalAmount || 0,
        rate: pv.rate || 1,
        bankAccount: pv.bankAccount || "",
        method: pv.method || pv.paymentMethod || "",
        reference: pv.reference || "",
      };
    });
  });

  useEffect(() => {
    localStorage.setItem("pvData", JSON.stringify(pvData));
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  }, [pvData]);

  // Listen for navigation event to expand PV card
  useEffect(() => {
    const handleNavigateToPV = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { pvNo } = customEvent.detail;

      console.log("=== PV navigateToPaymentVoucher event ===", pvNo);

      // Find the PV with matching number
      const matchingPV = pvData.find(
        (pv) => pv.pvNo === pvNo || pv.id === pvNo,
      );

      if (matchingPV) {
        console.log("Found matching PV:", matchingPV.pvNo, "ID:", matchingPV.id);
        // Expand ONLY this PV card (clear others and add this one)
        setExpandedItems(new Set([matchingPV.id]));

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(`pv-card-${matchingPV.pvNo}`);
          console.log(
            "Looking for element:",
            `pv-card-${matchingPV.pvNo}`,
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
        console.warn("No matching PV found for pvNo:", pvNo);
      }
    };

    window.addEventListener("navigateToPaymentVoucher", handleNavigateToPV);

    return () => {
      window.removeEventListener(
        "navigateToPaymentVoucher",
        handleNavigateToPV,
      );
    };
  }, [pvData]);

  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [savedChanges, setSavedChanges] = useState("");

  const getDocumentTypeLabel = (docType: string): string => {
    const typeMap: Record<string, string> = {
      PI: "Purchase Invoice",
      PO: "Purchase Order",
      IC: "Import Cost",
      SR: "Shipment Request",
      EN: "Expense Note",
      PVR: "Payment Voucher Request",
    };
    return typeMap[docType] || docType;
  };

  const getDocumentNumber = (doc: any): string => {
    if (!doc) return "";
    const type = doc.documentType || doc.type;
    switch (type) {
      case "PO":
      case "Purchase Order":
        return doc.invoiceNo || doc.poNo || doc.piNo || "";
      case "IC":
      case "Import Cost":
        return doc.icNum || doc.piNo || "";
      case "SR":
      case "Shipment Request":
        return doc.srNo || doc.piNo || doc.srNum || "";
      case "EN":
      case "Expense Note":
        return doc.apNoteNo || doc.piNo || "";
      default:
        return doc.piNo || doc.docNo || "";
    }
  };

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

  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const [selectedDetail, setSelectedDetail] =
    useState<PVData | null>(null);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ptFilter, setPtFilter] = useState("ALL");
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "details" | "remarks" | "info" | "history"
  >("info");
  const [picPIFilter, setPicPIFilter] = useState("all");
  const [activeFilterType, setActiveFilterType] = useState<
    "pt" | "pic" | null
  >(null);
  const [calendarFilterType, setCalendarFilterType] = useState("pvDate");
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);

  const [pvrForm, setPvrForm] = useState<any>({
    supplierName: "",
    term: "Credit",
    currency: "IDR",
    rate: 1,
    pt: "AMT",
    pvrDate: formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]),
    pvrNo: "",
    bankAccount: "",
    paymentMethod: "Transfer",
    reference: "",
    remarks: "",
  });
  const [linkedPIs, setLinkedPIs] = useState<any[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [editingAmountPaidId, setEditingAmountPaidId] = useState<string | null>(null);
  const [editingAmountPaidValue, setEditingAmountPaidValue] = useState("");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState("");
  const [showAddLinksDialog, setShowAddLinksDialog] = useState(false);
  const [addLinksSearchTerm, setAddLinksSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [showLinkedDocsDialog, setShowLinkedDocsDialog] = useState(false);
  const [selectedForLinkedDocs, setSelectedForLinkedDocs] = useState<PVData | null>(null);

  const handleVoidClick = (pv: PVData) => {
    setPvData(prev => prev.map(item => 
      item.id === pv.id ? { ...item, status: 'voided' } : item
    ));
    setSavedChanges("Payment Voucher successfully voided");
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  const filteredSuppliers = (mockSuppliers || []).filter((s: any) =>
    (s.supplierName || s.name || "").toLowerCase().includes((supplierSearchTerm || "").toLowerCase()),
  );

  const generatePVRNumber = (pt: string, date: string): string => {
    if (!date) return "";
    const parts = date.split("/");
    if (parts.length < 3) return "";
    const yy = parts[2].slice(-2);
    const mm = parts[1];
    const ran = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `PV/${pt}.MDN/${yy}${mm}/00${ran}`;
  };

  const handleSupplierChange = (name: string) => {
    const safeName = name || "Unknown Supplier";
    setPvrForm({ ...pvrForm, supplierName: safeName });
    setSupplierSearchTerm(safeName);
    setShowSupplierDropdown(false);
  };

  const resetForm = () => {
    const today = formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]);
    setPvrForm({
      supplierName: "",
      term: "Credit",
      currency: "IDR",
      rate: 1,
      pt: "AMT",
      pvrDate: today,
      pvrNo: generatePVRNumber("AMT", today),
      bankAccount: "",
      paymentMethod: "Transfer",
      reference: "",
      remarks: "",
    });
    setLinkedPIs([]);
    setSupplierSearchTerm("");
    setShowSupplierDropdown(false);
  };

  const handleCreatePVR = () => {
    // Generate actual PV data from form
    const newPV: PVData = {
      id: Math.random().toString(36).substr(2, 9),
      pvNo: pvrForm.pvrNo,
      pvDate: convertToISODate(pvrForm.pvrDate || getCurrentDate()),
      pvrNo: pvrForm.pvrNo,
      supplierName: pvrForm.supplierName,
      supplierCategory: pvrForm.supplierCategory || "LOCAL",
      currency: pvrForm.currency,
      paymentMethod: pvrForm.paymentMethod as any,
      totalAmount: (() => {
        let grandTotal = 0;
        linkedPIs.forEach((doc) => {
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
              if (parsed.discount) discount = parseFormattedNumber(parsed.discount);
            } catch {}
          }
          grandTotal += (amountPaid - discount);
        });
        return grandTotal;
      })(),
      createdBy: "SHEFANNY",
      pt: pvrForm.pt as any,
      status: "PAID",
      remarks: pvrForm.remarks,
      term: pvrForm.term,
      linkedDocs: linkedPIs,
      totalInvoice: (() => {
        let total = 0;
        linkedPIs.forEach(doc => {
          total += doc.totalAmount;
        });
        return total;
      })(),
      rate: pvrForm.rate,
      bankAccount: pvrForm.bankAccount,
      method: pvrForm.paymentMethod,
      reference: pvrForm.reference,
    };

    setPvData((prev) => [newPV, ...prev]);
    setShowSavedNotification(true);
    setSavedChanges("Payment Voucher successfully created");
    setShowCreateDialog(false);
    resetForm();
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  // Initialize PV Number on mount
  useEffect(() => {
    if (!pvrForm.pvrNo) {
      const today = formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]);
      setPvrForm((prev: any) => ({
        ...prev,
        pvrNo: generatePVRNumber(prev.pt, today)
      }));
    }
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const convertToISODate = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes("/")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleExpandAll = () => {
    const newExpandAll = !expandAll;
    if (newExpandAll) {
      const allIds = filteredData.map((item) => item.id);
      setExpandedItems(new Set(allIds));
    } else {
      setExpandedItems(new Set());
    }
    setExpandAll(newExpandAll);
  };

  // Filter data based on search and PT filter
  const filteredData = pvData.filter((pv) => {
    const searchLower = (searchTerm || "").toLowerCase();
    const matchesSearch =
      (pv.pvNo || "").toLowerCase().includes(searchLower) ||
      (pv.pvrNo || "").toLowerCase().includes(searchLower) ||
      (pv.supplierName || "").toLowerCase().includes(searchLower);

    const matchesPT = ptFilter === "ALL" || pv.pt === ptFilter;
    const matchesPIC =
      picPIFilter === "all" ||
      (pv.createdBy || "").toLowerCase() === picPIFilter.toLowerCase();

    const matchesDate = (() => {
      if (!calendarDateFrom && !calendarDateTo) return true;
      const pvDateISO = pv.pvDate;
      const fromISO = calendarDateFrom
        ? convertToISODate(calendarDateFrom)
        : "";
      const toISO = calendarDateTo
        ? convertToISODate(calendarDateTo)
        : "";

      if (fromISO && toISO)
        return pvDateISO >= fromISO && pvDateISO <= toISO;
      if (fromISO) return pvDateISO >= fromISO;
      if (toISO) return pvDateISO <= toISO;
      return true;
    })();

    return matchesSearch && matchesPT && matchesPIC && matchesDate;
  });

  // Calculate stats
  const overseasCount = pvData.filter(
    (p) => p.supplierCategory === "OVERSEAS",
  ).length;
  const localCount = pvData.filter(
    (p) => p.supplierCategory === "LOCAL",
  ).length;

  return (
    <div className="space-y-4">
      {/* Additional Filters - PT & PIC */}
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
              activeFilterType === "pt" || ptFilter !== "ALL"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
        >
          {ptFilter === "ALL" ? "ALL PT" : ptFilter}
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
            "ALL",
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
                {key}
              </button>
            );
          })}

        {activeFilterType === "pic" &&
          ["all", "SHEFANNY", "ANDI WIJAYA", "RINI KUSUMA"].map(
            (key) => {
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
            },
          )}
      </div>

      {/* Header with buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-purple-900"></h2>
        <div className="flex justify-end items-center gap-3">
          {/* Filter Date Button */}
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search by PV No or Supplier Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
      </div>



      {/* Document Counter */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-purple-700">
          {filteredData.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-purple-700">
          {pvData.length}
        </span>{" "}
        documents
      </div>

   

      {/* PV List - Collapsible Cards */}
      <div className="space-y-3">
        {filteredData.map((pv) => {
          const isExpanded = expandedItems.has(pv.id);
          const isVoided = pv.status === "voided";
          return (
            <motion.div
              id={`pv-card-${pv.pvNo}`}
              key={pv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100 ${
                isVoided ? "opacity-75 grayscale-[0.2]" : ""
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #DCCCEC 0%, #E8DDEF 15%, #F0E6F3 30%, #F4EDFA 45%, #F8F5FC 60%, #FAFAFF 75%, #FCFCFF 85%, #FFFFFF 100%)",
              }}
            >
              {/* Collapsed View */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedItems(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(pv.id)) {
                      newSet.delete(pv.id);
                    } else {
                      newSet.add(pv.id);
                    }
                    return newSet;
                  });
                }}
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
                            {pv.pvNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={
                              pv.supplierCategory === "OVERSEAS"
                                ? "border-blue-300 text-blue-700 bg-blue-50"
                                : "border-green-300 text-green-700 bg-green-50"
                            }
                          >
                            {pv.supplierCategory === "OVERSEAS" ? (
                              <Globe2 className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {(pv.supplierCategory || "LOCAL").charAt(0).toUpperCase() +
                              (pv.supplierCategory || "LOCAL").slice(1).toLowerCase()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              (pv.term || "CREDIT") === "URGENT"
                                ? "border-blue-300 text-blue-700 bg-blue-50"
                                : "border-green-300 text-green-700 bg-green-50"
                            }
                          >
                            {(pv.term || "CREDIT").charAt(0).toUpperCase() +
                              (pv.term || "CREDIT").slice(1).toLowerCase()}
                          </Badge>
                          {isVoided && (
                            <Badge
                              variant="destructive"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              Voided
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {pv.pt || "N/A"}
                          </Badge>
                          <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm truncate">
                            {pv.supplierName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Total Invoice tandai*/}
                    <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center w-36">
                        <span className="text-green-900 font-medium text-sm">
                          {pv.currency || "IDR"}
                        </span>
                        <span className="text-green-900 font-medium text-sm text-right">
                          {(() => {
                            // Calculate grand total from localStorage data
                            let grandTotal = 0;
                            if (pv.linkedDocs && pv.linkedDocs.length > 0) {
                              const filteredDocs = pv.linkedDocs.filter(
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
                                const savedData =
                                  localStorage.getItem(docStorageKey);

                                let amountPaid = doc.totalAmount;
                                let discount = 0;

                                if (savedData) {
                                  try {
                                    const parsed = JSON.parse(savedData);
                                    if (
                                      parsed.amountPaid &&
                                      Array.isArray(
                                        parsed.amountPaid,
                                      ) &&
                                      parsed.amountPaid.length > 0
                                    ) {
                                      amountPaid =
                                        parseFormattedNumber(
                                          parsed.amountPaid[0]
                                            .amount,
                                        );
                                    }
                                    if (parsed.discount) {
                                      discount =
                                        parseFormattedNumber(
                                          parsed.discount,
                                        );
                                    }
                                  } catch {}
                                }

                                totalAmountPaid += amountPaid;
                                totalDiscount += discount;
                              });

                              grandTotal =
                                totalAmountPaid - totalDiscount;
                            } else {
                              grandTotal = pv.totalInvoice || 0;
                            }

                            return formatNumber(grandTotal);
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Status & Chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded View */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Separator className="bg-purple-100" />
                    <div className="p-6 space-y-4">
                      {/* Details Grid */}
                      <div className="w-full p-6 bg-white rounded-xl border border-gray-200 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* PV Date */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-600 text-sm">
                                PV Date
                              </span>
                            </div>
                            <div className="text-gray-900">
                              {formatDateToDDMMYYYY(pv.pvDate)}
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
                            <div className="text-gray-900">
                              {pv.paymentMethod}
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
                            <div className="text-gray-900">
                              {pv.createdBy}
                            </div>
                          </div>

                          
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDetail(pv);
                            setShowDetailDialog(true);
                          }}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {/* Link Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(
                            e: React.MouseEvent<HTMLButtonElement>,
                          ) => {
                            e.stopPropagation();
                            setSelectedForLinkedDocs(pv);
                            setShowLinkedDocsDialog(true);
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link
                        </Button>

                        {/* Void Button */}
                        <Button
                          size="sm"
                          onClick={(
                            e: React.MouseEvent<HTMLButtonElement>,
                          ) => {
                            e.stopPropagation();
                            handleVoidClick(pv);
                          }}
                          disabled={pv.status === "voided"}
                          variant="outline"
                          className={`${
                            pv.status === "voided"
                              ? "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed"
                              : "border-red-200 text-red-700 hover:bg-red-50"
                          }`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {pv.status === "voided"
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

        {filteredData.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No payment vouchers found
            </p>
          </Card>
        )}
      </div>

      {/* View Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      >
        <DialogContent className="w-[1600px] h-[800px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-purple-900">
              PV Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the selected PV
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
                    {/* PV Number */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        PV No
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.pvNo}
                      </div>
                    </div>
                    {/* PV Date */}
                    <div>
                      <div className="text-xs text-purple-600 mb-1 font-semibold">
                        PV Date
                      </div>
                      <div className="font-semibold text-purple-900 text-sm">
                        {selectedDetail.pvDate
                          ? formatDateToDDMMYYYY(
                              selectedDetail.pvDate,
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
                                                <span 
                                                  className="text-xs font-semibold text-purple-700 flex items-center gap-1"
                                                >
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
                                  <td className="px-4 py-3 text-sm">
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
                      let totalAmountValue = 0;
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
                        totalAmountValue = filteredDocs.reduce((sum, doc) => {
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
                              {formatNumber(totalAmountValue)}
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
                                const grandTotalValue = totalAmountValue - totalDiscount;
                                return formatNumber(grandTotalValue);
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
                                const grandTotalValue = totalAmountValue - totalDiscount;
                                const rate = selectedDetail.rate;
                                const finalTotal =
                                  rate && rate > 0
                                    ? grandTotalValue *
                                      parseFloat(
                                        String(rate).replace(
                                          /,/g,
                                          ".",
                                        ),
                                      )
                                    : grandTotalValue;
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
              Add Payment Voucher Request
            </DialogTitle>
            <DialogDescription>
              Select Payment Voucher Request to add to the payable items.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
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
                <span className="text-xs font-semibold text-gray-600">Payment Voucher Request No</span>
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
                // Load all PVRs from storage or mock
                let allPVRs: any[] = [];
                try {
                  const saved = localStorage.getItem("pvrData");
                  allPVRs = saved ? JSON.parse(saved) : mockPVR;
                } catch (e) {
                  console.error("Failed to load PVR data:", e);
                  allPVRs = mockPVR;
                }

                // Collect IDs of PVRs already linked in existing PVs
                const linkedPvrNos = new Set<string>();
                pvData.forEach((pv) => {
                  if (pv.pvrNo) {
                    linkedPvrNos.add(pv.pvrNo);
                    // Match against allPVRs to catch cases where pvrNo stored in PV is actually a PO number
                    const matchedPVR = allPVRs.find(p => p.pvrNo === pv.pvrNo || p.poNumber === pv.pvrNo);
                    if (matchedPVR) linkedPvrNos.add(matchedPVR.pvrNo);
                  }
                  // Also check individual linked docs for PVR tags
                  pv.linkedDocs?.forEach((doc: any) => {
                    if (doc.pvrNo) linkedPvrNos.add(doc.pvrNo);
                  });
                });

                // Filter unlinked PVRs
                const searchLower = addLinksSearchTerm.toLowerCase();
                const displayPVRs = allPVRs.filter((pvr) => 
                  !linkedPvrNos.has(pvr.pvrNo) &&
                  (pvr.pvrNo.toLowerCase().includes(searchLower) ||
                  (pvr.supplierName && pvr.supplierName.toLowerCase().includes(searchLower)))
                );

                const renderPVRRow = (pvr: any) => {
                  const linkedDocs = pvr.linkedDocs || [];
                  
                  // Extract POs
                  const pos = Array.from(new Set(linkedDocs.map((d: any) => d.poNo).filter(Boolean)));
                  
                  // Extract PIs (regular PI, Import Cost, Shipment Request)
                  const pis = Array.from(new Set(linkedDocs
                    .filter((d: any) => ["PI", "IC", "SR", "Purchase Invoice", "Import Cost", "Shipment Request"].includes(d.documentType))
                    .map((d: any) => d.piNo || d.docNo || d.invoiceNo)
                    .filter(Boolean)
                  ));
                  
                  // Extract Expense Notes
                  const ens = Array.from(new Set(linkedDocs
                    .filter((d: any) => d.documentType === "EN" || d.documentType === "Expense Note")
                    .map((d: any) => d.piNo || d.docNo || d.apNoteNo)
                    .filter(Boolean)
                  ));

                  // Find related Purchase Returns
                  const prs = mockpurchaseReturns.filter(pr => 
                    (pr.poNo && pos.includes(pr.poNo)) || 
                    (pr.piNo && pis.includes(pr.piNo))
                  );

                  return (
                    <div
                      key={pvr.pvrNo}
                      className="rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex h-16"
                    >
                      <div className="px-2 flex items-center border-r border-gray-200 min-w-[60px] h-full">
                        <input
                          type="checkbox"
                          className="cursor-pointer w-4 h-4 flex-shrink-0"
                          checked={selectedDocuments.has(`PVR-${pvr.pvrNo}`)}
                          onChange={(e) => {
                            const pvrId = `PVR-${pvr.pvrNo}`;
                            const newSelected = new Set(selectedDocuments);
                            if (e.target.checked) {
                              newSelected.add(pvrId);
                            } else {
                              newSelected.delete(pvrId);
                            }
                            setSelectedDocuments(newSelected);
                          }}
                        />
                      </div>

                      {/* Payment Voucher Request No Column */}
                      <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full">
                        <div className="flex flex-col gap-0.5 text-xs min-w-0">
                            <span className="font-medium text-gray-700 whitespace-nowrap">
                              {pvr.pvrNo}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-gray-500 font-semibold truncate">
                              Total: {pvr.currency || "IDR"} {formatNumber(pvr.totalInvoice || pvr.totalPVR || pvr.totalAmount || 0)}
                            </span>
                            <span className="text-purple-600 font-medium"></span>
                          </div>
                        </div>
                      </div>

                      {/* Purchase Order Column */}
                      <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full overflow-hidden">
                        {pos.length > 0 ? (
                          <div className="flex flex-col gap-2 text-xs min-w-0">
                            {pos.map(no => <span key={no as string} className="truncate">{no as string}</span>)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No linked PO</span>
                        )}
                      </div>

                      {/* Purchase Invoice Column */}
                      <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full overflow-hidden">
                        {pis.length > 0 ? (
                          <div className="flex flex-col gap-2 text-xs min-w-0">
                            {pis.map(no => <span key={no as string} className="truncate">{no as string}</span>)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No linked PI/IC/SR</span>
                        )}
                      </div>

                      {/* Expense Note Column */}
                      <div className="flex-1 px-3 border-r border-gray-200 min-w-[300px] flex items-center h-full overflow-hidden">
                        {ens.length > 0 ? (
                          <div className="flex flex-col gap-2 text-xs min-w-0">
                            {ens.map(no => <span key={no as string} className="truncate">{no as string}</span>)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No linked Expense Note</span>
                        )}
                      </div>

                      {/* Purchase Return Column */}
                      <div className="flex-1 px-3 min-w-[300px] flex items-center h-full overflow-hidden">
                        {prs.length > 0 ? (
                          <div className="flex flex-col gap-2 text-xs min-w-0">
                            {prs.map(pr => <span key={pr.prNo} className="truncate text-red-600 font-medium">{pr.prNo}</span>)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No linked Purchase Return</span>
                        )}
                      </div>
                    </div>
                  );
                };

                return displayPVRs.length > 0 ? (
                  <div className="space-y-3">
                    {displayPVRs.map((pvr) => renderPVRRow(pvr))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No Payment Voucher Requests available
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
                  // Final list of documents to add to the PV
                  let newlySelectedDocs: any[] = [];
                  
                  // Load PVRs one more time to get fresh data
                  let pvrSource: any[] = [];
                  try {
                    const saved = localStorage.getItem("pvrData");
                    pvrSource = saved ? JSON.parse(saved) : mockPVR;
                  } catch (e) {
                    pvrSource = mockPVR;
                  }

                  // Process each selected PVR
                  selectedDocuments.forEach((id) => {
                    const pvrNo = id.replace("PVR-", "");
                    const pvr = pvrSource.find(p => p.pvrNo === pvrNo);
                    
                    if (pvr && pvr.linkedDocs) {
                      pvr.linkedDocs.forEach((doc: any) => {
                        // Standardize document structure for LinkedPIDocument interface
                        newlySelectedDocs.push({
                          id: doc.id || `${doc.documentType}-${doc.piNo}-${Math.random().toString(36).substr(2, 4)}`,
                          piNo: doc.piNo || doc.docNo || doc.invoiceNo,
                          poNo: doc.poNo || "",
                          invoiceNo: doc.invoiceNo || doc.piNo || doc.docNo,
                          invoiceDate: doc.invoiceDate || doc.date || "",
                          currency: doc.currency || pvr.currency || "IDR",
                          totalAmount: doc.totalAmount || 0,
                          amountPaid: doc.amountPaid || doc.totalAmount || 0, // Use saved amountPaid from PVR if available
                          documentType: doc.documentType,
                          pvrNo: pvr.pvrNo // Tag with source PVR
                        });
                      });

                      // Auto-populate PVR form details if they're still at default
                      if (!pvrForm.supplierName || pvrForm.supplierName === "") {
                        setPvrForm((prev: any) => ({
                          ...prev,
                          pvrNo: pvr.pvrNo,
                          pvrDate: pvr.pvrDate || prev.pvrDate,
                          supplierName: pvr.supplierName,
                          currency: pvr.currency || prev.currency,
                          rate: pvr.rate || 1,
                          term: pvr.term || prev.term,
                          pt: pvr.pt || prev.pt,
                          bankAccount: pvr.bankAccount || prev.bankAccount,
                          paymentMethod: pvr.paymentMethod || prev.paymentMethod,
                        }));
                      }
                    }
                  });

                  // Update linked documents state
                  setLinkedPIs([
                    ...linkedPIs,
                    ...newlySelectedDocs,
                  ]);

                  setShowAddLinksDialog(false);
                  setSelectedDocuments(new Set());
                  setSelectAllDocuments(false);
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={selectedDocuments.size === 0}
              >x
                Add ({selectedDocuments.size})
              </Button>
            </DialogFooter>
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
            const linkedDocs = selectedForLinkedDocs?.linkedDocs || [];
            const filteredDocs = linkedDocs.filter(
              (doc) => {
                const isValidType =
                  doc.documentType === "PI" ||
                  doc.documentType === "SR" ||
                  doc.documentType === "IC" ||
                  doc.documentType === "EN" ||
                  doc.documentType === "PO";

                const hasValidNumber =
                  doc.documentType === "PO"
                    ? (doc.poNo && doc.poNo.trim() !== "") ||
                      (doc.invoiceNo &&
                        doc.invoiceNo.trim() !== "")
                    : doc.piNo && doc.piNo.trim() !== "";

                return isValidType && hasValidNumber;
              },
            );

            // Add PVR document if it exists and there are any valid linked documents
            const hasValidDocs = linkedDocs.some(doc => 
              doc.documentType === "PO" || 
              doc.documentType === "PI" || 
              doc.documentType === "IC" || 
              doc.documentType === "SR" || 
              doc.documentType === "EN"
            );
            
            // Create PVR documents for each unique PO group
            const pvrDocs: any[] = [];
            if (selectedForLinkedDocs?.pvrNo && hasValidDocs) {
              // Find all unique PO numbers in filteredDocs
              const uniquePOs = Array.from(new Set(
                filteredDocs
                  .filter(doc => doc.poNo && doc.poNo.trim() !== "")
                  .map(doc => doc.poNo)
              ));
              
              // Create a PVR for each unique PO number
              uniquePOs.forEach((poNo, index) => {
                pvrDocs.push({
                  id: `pvr-${selectedForLinkedDocs.pvrNo}-${index}`,
                  documentType: "PVR",
                  piNo: selectedForLinkedDocs.pvrNo,
                  poNo: poNo,
                  invoiceNo: selectedForLinkedDocs.pvrNo,
                  invoiceDate: selectedForLinkedDocs.pvDate || "",
                  currency: selectedForLinkedDocs.currency || "IDR",
                  totalAmount: selectedForLinkedDocs.totalAmount || 0,
                  pvrNo: selectedForLinkedDocs.pvrNo,
                });
              });
            }
            
            // Total count = all documents + PVRs
            const totalCount = filteredDocs.length + pvrDocs.length;
            return totalCount;
          })()}
        </Badge>
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-3" style={{ width: "600px" }}>


      {(() => {
        const linkedDocs =
          selectedForLinkedDocs?.linkedDocs || [];
        
        // Add PVR document if it exists and there are any valid linked documents
        const hasValidDocs = linkedDocs.some(doc => 
          doc.documentType === "PO" || 
          doc.documentType === "PI" || 
          doc.documentType === "IC" || 
          doc.documentType === "SR" || 
          doc.documentType === "EN"
        );
        
        // Create PVR documents for each unique PO group
        const pvrDocs: any[] = [];
        if (selectedForLinkedDocs?.pvrNo && hasValidDocs) {
          // Find all unique PO numbers in linkedDocs
          const uniquePOs = Array.from(new Set(
            linkedDocs
              .filter(doc => doc.poNo && doc.poNo.trim() !== "")
              .map(doc => doc.poNo)
          ));
          
          // Create a PVR for each unique PO number
          uniquePOs.forEach((poNo, index) => {
            pvrDocs.push({
              id: `pvr-${selectedForLinkedDocs.pvrNo}-${index}`,
              documentType: "PVR",
              piNo: selectedForLinkedDocs.pvrNo,
              poNo: poNo,
              invoiceNo: selectedForLinkedDocs.pvrNo,
              invoiceDate: selectedForLinkedDocs.pvDate || "",
              currency: selectedForLinkedDocs.currency || "IDR",
              totalAmount: selectedForLinkedDocs.totalAmount || 0,
              pvrNo: selectedForLinkedDocs.pvrNo,
            });
          });
        }
        
        const allDocs = pvrDocs.length > 0 ? [...pvrDocs, ...linkedDocs] : linkedDocs;
        
        const filteredDocs = allDocs.filter(
          (doc) => {
            const isValidType =
              doc.documentType === "PI" ||
              doc.documentType === "SR" ||
              doc.documentType === "IC" ||
              doc.documentType === "EN" ||
              doc.documentType === "PO" ||
              doc.documentType === "PVR";

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
            case "PVR":
              return {
                border: "border-purple-200",
                hover: "hover:bg-purple-50",
                icon: "text-purple-600",
                text: "text-purple-700",
                badge:
                  "bg-purple-100 text-purple-700 border-purple-200",
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
          docs: any[],
        ) => {
          const groups: {
            poNumber: string;
            documents: any[];
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
                  d.documentType === "IC" ||
                  d.documentType === "PVR";
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

        return documentGroups.length > 0 ? (
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
              }
            )();

              return (
                <div
                  key={`group-${groupIndex}`}
                  className="border-2 border-purple-300 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white"
                >
                  {/* Group Content */}
                  <div className="space-y-2">
                    {group.documents.map((doc, docIndex) => {
                      const docType = doc.documentType || "PI";
                      const styles = getDocTypeStyles(docType);
                      const badgeLabel =
                        docType === "EN" ? "AP" : docType === "PVR" ? "PVR" : docType;

                      const handleDocClick = () => {
                        const docNumber = docType === "PO"
                          ? (doc.invoiceNo || doc.poNo || "")
                          : doc.piNo || "";

                        if (!docNumber) return;

                        switch (docType) {
                          case "PI":
                            onNavigateToPurchaseInvoice?.(docNumber);
                            break;
                          case "PO":
                            onNavigateToPurchaseOrder?.(docNumber);
                            break;
                          case "IC":
                            onNavigateToImportCost?.(docNumber);
                            break;
                          case "SR":
                            onNavigateToShipmentRequest?.(docNumber);
                            break;
                          case "EN":
                            onNavigateToAPNote?.(docNumber);
                            break;
                          case "PVR":
                            onNavigateToPVR?.(docNumber);
                            break;
                        }
                      };

                      return (
                        <div
                          key={doc.id}
                          onClick={handleDocClick}
                          className={`w-full p-4 bg-white border ${styles.border} rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
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
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No linked documents</p>
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
    </div>
  );
}