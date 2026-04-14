import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Hash,
  Building2,
  CheckCircle2,
  Clock,
  Link2,
  DollarSign,
  TrendingUp,
  Eye,
  Printer,
  Link,
  Calendar,
  Plus,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import {
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { mockInvoiceReceipts, mockSuppliers, mockPurchaseInvoiceDataForPI } from "../mocks/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarComponent } from "./ui/calendar";

interface InvoiceReceiptItem {
  itemCode: string;
  itemName: string;
  description: string;
  pph: boolean;
  qty: number;
  uom: string;
  discount: number;
  pricePerQty: number;
  total: number;
  itemReturned: string;
}

interface LinkedDoc {
  type: string;
  docNo: string;
  badgeLabel: string;
  badgeColor: string;
}

interface InvoiceReceiptData {
  id: string;
  invoiceReceiptNo: string;
  linkedPurchaseInvoiceNo?: string;
  linkedPONo?: string;
  supplierName: string;
  ptCompany?: string;
  warehouse?: string;
  createDate: string;
  totalAmount: number;
  discount?: number;
  ppn?: number;
  pph?: number;
  otherCost?: number;
  grandTotal?: number;
  downPayment?: number;
  outstanding?: number;
  currency?: string;
  remarks?: string;
  status: string;
  items?: InvoiceReceiptItem[];
  linkedDocs?: LinkedDoc[];
}

  const convertToISODate = (d: string) => {
    const [day, month, year] = d.split("/");
    return `${year}-${month}-${day}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${now.getFullYear()}`;
  }

function InvoiceReceiptCard({
  data,
  expandAll,
  selectedInvoiceReceiptNo,
}: {
  data: InvoiceReceiptData;
  expandAll: boolean;
  selectedInvoiceReceiptNo?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLinkedDialog, setShowLinkedDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "activity">("items");

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  useEffect(() => {
    if (selectedInvoiceReceiptNo && data.invoiceReceiptNo === selectedInvoiceReceiptNo) {
      setIsExpanded(true);
      setTimeout(() => {
        const el = document.getElementById(`ir-card-${data.id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [selectedInvoiceReceiptNo]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
            <Clock className="w-3.5 h-3.5" />
            Partial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
            <Clock className="w-3.5 h-3.5" />
            Outstanding
          </Badge>
        );
    }
  };



  

  return (
    <motion.div
      id={`ir-card-${data.id}`}
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-gray-900 font-mono min-w-[180px] flex items-center gap-1">
                    <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {data.invoiceReceiptNo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm truncate">
                    {data.supplierName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {getStatusBadge(data.status)}

            {/* Amount Pill */}
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <span className="text-green-700">
                IDR {data.totalAmount.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
              </span>
            </div>

            {/* Chevron */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
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
            <div className="px-6 pb-6 pt-4 border-t border-purple-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Invoice Date</span>
                  <div className="text-sm text-gray-900 mt-0.5">-</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowDetailsDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2 text-sm font-medium gap-1.5 min-w-[140px]"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </Button>
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowLinkedDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2 text-sm font-medium gap-1.5 min-w-[120px]"
                >
                  <Link className="w-4 h-4" />
                  Link
                </Button>
           
            
                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Invoice Receipt Detail
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex flex-row gap-6">
                {/* Left Side: Invoice & PO Details */}
                <div className="flex flex-row items-center gap-6 pb-1 w-full">
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Invoice Receipt No</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {data.invoiceReceiptNo}
                    </div>
                  </div>
                <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Supplier Name</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {data.supplierName}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Invoice Date</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {data.createDate}
                    </div>
                  </div>
               
                  <div className="flex-1">
                    <div className="text-xs text-purple-600 mb-1">Warehouse</div>
                    <div className="font-semibold text-purple-900 text-sm whitespace-nowrap">
                      {data.warehouse || "MEDAN"}
                    </div>
                  </div>
                </div>

               
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("items")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "items"
                      ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  Items
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "activity"
                      ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  Activity Log
                </button>
              </div>
            </div>

            {/* Items Table */}
            {activeTab === "items" && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-purple-50">
                      <tr>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b">
                          Document Type
                        </th>
                        <th className="text-purple-900 text-xs text-left whitespace-nowrap px-4 py-3 font-medium border-b" style={{ minWidth: "200px" }}>
                          Document Number
                        </th>
                        <th className="text-purple-900 text-xs text-right whitespace-nowrap px-4 py-3 font-medium border-b" style={{ minWidth: "200px" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.linkedPurchaseInvoiceNo && (
                        <tr className="hover:bg-purple-50/50 border-b last:border-b-0">
                          <td className="font-medium text-xs whitespace-nowrap px-4 py-3">
                            Purchase Invoice
                          </td>
                          <td className="text-xs whitespace-nowrap px-4 py-3">
                            {data.linkedPurchaseInvoiceNo}
                          </td>
                          <td className="text-right text-xs whitespace-nowrap px-4 py-3">
                            IDR {(data.totalAmount ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === "activity" && (
              <div className="text-center text-gray-500 py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No Activity Log records yet</p>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 pt-4 px-6 pb-6 space-y-4">
            {/* Financial Summary with Remarks */}
            {activeTab === "items" && (
              <div className="flex gap-4 items-stretch">
                {/* Remarks Section */}
                <div className="w-1/2 flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-2">Remarks</span>
                  <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-500" style={{ minHeight: "170px" }}>
                    {data.remarks || "No remarks"}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 mt-[14px] mb-3">
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">Total Amount</span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(data.totalAmount ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">Discount</span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">(</span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(data.discount ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">PPN</span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(data.ppn ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">PPH</span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                      <span className="text-gray-700 text-sm w-4 text-right font-bold">(</span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(data.pph ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left font-bold">)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700 text-sm flex-1 font-bold">Other Cost</span>
                      <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                      <span className="text-gray-700 text-sm w-4 text-right"></span>
                      <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                        {(data.otherCost ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
                      </span>
                      <span className="text-gray-700 text-sm w-4 text-left"></span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-gray-700 text-sm flex-1 font-bold">Grand Total</span>
                        <span className="text-gray-700 text-sm w-12 text-center font-bold">IDR</span>
                        <span className="text-gray-700 text-sm w-4 text-right"></span>
                        <span className="text-gray-700 text-sm w-[114px] text-right font-bold">
                          {(data.grandTotal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ".")}
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
                onClick={() => setShowDetailsDialog(false)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Linked Document Dialog */}
      <Dialog open={showLinkedDialog} onOpenChange={setShowLinkedDialog}>
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              Linked Documents
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700 border-purple-200"
              >
                {data.linkedDocs?.length ?? 0}
              </Badge>
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Documents linked with this Invoice Receipt</p>
          </DialogHeader>
          <div className="space-y-3" style={{width:"500px"}}>
            {data.linkedDocs && data.linkedDocs.length > 0 ? (
              data.linkedDocs.map((doc, index) => {
                if (doc.type === "Purchase Invoice") {
                  return (
                    <div
                      key={`pi-${index}`}
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setShowLinkedDialog(false);
                        window.dispatchEvent(new CustomEvent("navigateToPurchaseInvoice", { detail: { piNo: doc.docNo, docNo: doc.docNo } }));
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-blue-700 font-medium">{doc.docNo}</p>
                            <p className="text-sm text-gray-500">Purchase Invoice</p>
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
                return null;
              })
            ) : (
              <p className="text-gray-500 text-sm">No linked documents</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLinkedDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function InvoiceReceipt({ selectedInvoiceReceiptNo }: { selectedInvoiceReceiptNo?: string | null }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [ptFilter, setPtFilter] = useState<string>("ALL PT");
  const [picFilter, setPicFilter] = useState<string>("ALL PIC");
  const [activeFilterType, setActiveFilterType] = useState<"pt" | "pic" | null>(null);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createActiveTab, setCreateActiveTab] = useState<"items" | "linked">("items");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [createForm, setCreateForm] = useState({
    supplierName: "",
    term: "Credit",
    currency: "IDR",
    company: "WNS",
    documentReceivedDate: "02/04/2026",
    apNoteDate: "02/04/2026",
    invoiceNumber: "",
    remarks: "",
  });
  const [createItems, setCreateItems] = useState<{documentType: string; documentNumber: string; itemTotal: number; amountPaid: number; discount: number; outstanding: number;}[]>([]);
  const [createDiscount, setCreateDiscount] = useState(0);
  const [createPPN, setCreatePPN] = useState(0);
  const [createPPH, setCreatePPH] = useState(0);
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);
  const [addDocSearch, setAddDocSearch] = useState("");
  const [savedReceipts, setSavedReceipts] = useState<InvoiceReceiptData[]>(() => {
    try {
      const stored = localStorage.getItem("invoiceReceipts");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const allReceipts = [...mockInvoiceReceipts, ...savedReceipts];

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  // Purchase invoices already linked to existing invoice receipts
  const linkedPINumbers = new Set(
    allReceipts.map((ir) => ir.linkedPurchaseInvoiceNo).filter(Boolean)
  );
  // Also exclude PIs already added to current createItems
  const addedPINumbers = new Set(createItems.map((item) => item.documentNumber));
  const availablePurchaseInvoices = mockPurchaseInvoiceDataForPI.filter(
    (pi) => !linkedPINumbers.has(pi.purchaseInvoiceNo) && !addedPINumbers.has(pi.purchaseInvoiceNo)
  ).filter(
    (pi) => addDocSearch === "" || pi.purchaseInvoiceNo.toLowerCase().includes(addDocSearch.toLowerCase()) || pi.supplierName.toLowerCase().includes(addDocSearch.toLowerCase())
  );

  const filteredData = allReceipts.filter((ir) => {
    const matchesSearch =
      searchQuery === "" ||
      ir.invoiceReceiptNo
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      ir.supplierName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesPt = ptFilter === "ALL PT" || ir.ptCompany === ptFilter;

    // Date filter
    let matchesDate = true;
    if (calendarDateFrom || calendarDateTo) {
      const parts = ir.createDate.split("/");
      if (parts.length === 3) {
        const irDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (calendarDateFrom) {
          const fromParts = calendarDateFrom.split("/");
          if (fromParts.length === 3) {
            const fromDate = new Date(parseInt(fromParts[2]), parseInt(fromParts[1]) - 1, parseInt(fromParts[0]));
            if (irDate < fromDate) matchesDate = false;
          }
        }
        if (calendarDateTo) {
          const toParts = calendarDateTo.split("/");
          if (toParts.length === 3) {
            const toDate = new Date(parseInt(toParts[2]), parseInt(toParts[1]) - 1, parseInt(toParts[0]));
            if (irDate > toDate) matchesDate = false;
          }
        }
      }
    }

    return matchesSearch && matchesPt && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* PT and PIC Filter Buttons */}
      <div className="flex items-center gap-1.5 mb-4">
        <button
          onClick={() => setActiveFilterType(activeFilterType === "pt" ? null : "pt")}
          className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${activeFilterType === "pt" || ptFilter !== "ALL PT"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
        >
          {ptFilter === "ALL PT" ? "ALL PT" : ptFilter}
        </button>
        <button
          onClick={() => setActiveFilterType(activeFilterType === "pic" ? null : "pic")}
          className={`
            flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
            ${activeFilterType === "pic" || picFilter !== "ALL PIC"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
            }
          `}
        >
          {picFilter === "ALL PIC" ? "ALL PIC" : picFilter}
        </button>
      </div>

      {/* Filter Options Dropdown */}
      <div className="flex flex-1 items-center gap-1.5 mb-4 min-h-[38px]">
        {activeFilterType === "pt" &&
          ["ALL PT", "AMT", "GMI", "MJS", "TTP", "WNS", "WSI", "IMI"].map((key) => {
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
                {key}
              </button>
            );
          })}

        {activeFilterType === "pic" &&
          ["ALL PIC", "CHINTYA", "DEWI", "ELLVA", "ERNI", "HELEN", "JENNIFER", "JESSICA", "KELLY", "NADYA", "SHEFANNY", "STELLA", "VANNESA"].map((key) => {
            const isSelected = picFilter === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setPicFilter(key);
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
                {key}
              </button>
            );
          })}
      </div>

      {/* Header with buttons */}
      <div className="flex justify-end items-center gap-3">
        {/* Clear Filter Button */}
        {(ptFilter !== "ALL PT" || picFilter !== "ALL PIC" || calendarDateFrom || calendarDateTo) && (
          <Button
            onClick={() => {
              setPtFilter("ALL PT");
              setPicFilter("ALL PIC");
              setCalendarDateFrom("");
              setCalendarDateTo("");
              setActiveFilterType(null);
            }}
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
          >
            ✕ Clear Filters
          </Button>
        )}

        {/* Filter Date */}
        <Button
          onClick={() => setShowCalendarDialog(true)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          size="lg"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Filter Date
        </Button>

        {/* Expand / Collapse All */}
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

        {/* Create */}
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowCreateDialog(true)}
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
          {allReceipts.length}
        </span>{" "}
        documents
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
        <Input
          placeholder="🔍 Search Invoice Receipt Number or Supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-purple-200 focus:border-purple-400"
        />
      </div>

      {/* Card List */}
      <div className="space-y-4">
        {filteredData.map((ir) => (
          <InvoiceReceiptCard
            key={ir.id}
            data={ir}
            expandAll={expandAll}
            selectedInvoiceReceiptNo={selectedInvoiceReceiptNo}
          />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No invoice receipts found
        </div>
      )}

      {/* Create Expense Note Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[1600px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="text-xl text-purple-900">
              Create Invoice Receipt
            </DialogTitle>
            <p className="text-sm text-gray-500">Fill in the details to create a new Expense Note</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Header Information Grid - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Supplier Name */}
              <div className="space-y-2 relative">
                <div className="text-xs text-purple-600 mb-1">
                  Supplier Name <span className="text-red-500">*</span>
                </div>
                <Input
                  placeholder="Type to search..."
                  value={createForm.supplierName}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, supplierName: e.target.value });
                    setSupplierSearchTerm(e.target.value);
                  }}
                  onClick={() => setShowSupplierDropdown(true)}
                  onBlur={() => setShowSupplierDropdown(false)}
                />
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.supplierName}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0 text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setCreateForm({ ...createForm, supplierName: supplier.supplierName });
                          setShowSupplierDropdown(false);
                          setSupplierSearchTerm("");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {supplier.supplierName}
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
                <Select value={createForm.term} onValueChange={(v: string) => setCreateForm({ ...createForm, term: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <div className="text-xs text-purple-600 mb-1">
                  Currency <span className="text-red-500">*</span>
                </div>
                <Select value={createForm.currency} onValueChange={(v: string) => setCreateForm({ ...createForm, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <div className="text-xs text-purple-600 mb-1">
                  Company <span className="text-red-500">*</span>
                </div>
                <Select value={createForm.company} onValueChange={(v: string) => setCreateForm({ ...createForm, company: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WNS">WNS</SelectItem>
                    <SelectItem value="MJS">MJS</SelectItem>
                    <SelectItem value="AMT">AMT</SelectItem>
                    <SelectItem value="GMI">GMI</SelectItem>
                    <SelectItem value="TTP">TTP</SelectItem>
                    <SelectItem value="WSI">WSI</SelectItem>
                    <SelectItem value="IMI">IMI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Header Information Grid - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Document Received Date */}
              <div className="space-y-2">
                <div className="text-xs text-purple-600 mb-1">
                  Document Received Date <span className="text-red-500">*</span>
                </div>
                <Input
                  value={createForm.documentReceivedDate}
                  onChange={(e) => setCreateForm({ ...createForm, documentReceivedDate: e.target.value })}
                />
              </div>

              {/* AP Note Date */}
              <div className="space-y-2">
                <div className="text-xs text-purple-600 mb-1">
                  AP Note Date <span className="text-red-500">*</span>
                </div>
                <Input
                  value={createForm.apNoteDate}
                  onChange={(e) => setCreateForm({ ...createForm, apNoteDate: e.target.value })}
                />
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <div className="text-xs text-purple-600 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </div>
                <Input
                  placeholder="Enter invoice number"
                  value={createForm.invoiceNumber}
                  onChange={(e) => setCreateForm({ ...createForm, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200">
              <button
                onClick={() => setCreateActiveTab("items")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  createActiveTab === "items"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Items
              </button>
              <Button
                onClick={() => { setAddDocSearch(""); setShowAddDocDialog(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Documents
              </Button>
            </div>

            {/* Items Tab */}
            {createActiveTab === "items" && (
              <div className="space-y-4">
                {/* Payable Items Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-purple-700">Doc Type</th>
                        <th className="text-left py-3 px-4 font-medium text-purple-700">Doc No</th>
                        <th className="text-left py-3 px-4 font-medium text-purple-700">Amount</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {createItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            No payable items
                          </td>
                        </tr>
                      ) : (
                        createItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700">{item.documentType || "\u2014"}</td>
                            <td className="py-3 px-4 text-gray-700">{item.documentNumber || "\u2014"}</td>
                            <td className="py-3 px-4 text-gray-700">
                              <div className="flex items-center justify-between">
                                <span>IDR {item.itemTotal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <button
                                  onClick={() => setCreateItems(createItems.filter((_, i) => i !== idx))}
                                  className="text-red-400 hover:text-red-600 transition-colors text-xs ml-3"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

    

                {/* Remarks + Summary */}
                <div className="flex gap-4 items-stretch">
                  <div className="w-1/2 space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Remarks</label>
                    <Textarea
                      placeholder="Enter remarks"
                      value={createForm.remarks}
                      onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
                      className="border-gray-300 h-[120px] resize-none"
                    />
                  </div>
                  <div className="w-1/2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
                    {(() => {
                      const totalAmount = createItems.reduce((sum, item) => sum + item.itemTotal, 0);
                      const grandTotal = totalAmount - createDiscount + createPPN - createPPH;
                      return (
                        <div className="flex flex-col justify-between h-full text-sm">
                          <div className="flex justify-between">
                            <span className="font-semibold text-purple-700">Total Amount</span>
                            <span>IDR {totalAmount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-purple-700">Discount</span>
                            <span>IDR ({createDiscount.toLocaleString("id-ID", { minimumFractionDigits: 2 })})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-purple-700">PPN</span>
                            <span>IDR {createPPN.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-purple-700">PPH</span>
                            <span>IDR ({createPPH.toLocaleString("id-ID", { minimumFractionDigits: 2 })})</span>
                          </div>
                          <div className="border-t border-purple-300 pt-2 mt-2 flex justify-between">
                            <span className="font-bold text-purple-800">Grand Total</span>
                            <span className="font-bold">IDR {grandTotal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Linked Documents Tab */}
            {createActiveTab === "linked" && (
              <div className="text-center text-gray-500 py-12">
                <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No Linked Documents yet</p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => {
                setCreateForm({
                  supplierName: "Vendor Maju Jaya",
                  term: "Credit",
                  currency: "IDR",
                  company: "WNS",
                  documentReceivedDate: "02/04/2026",
                  apNoteDate: "02/04/2026",
                  invoiceNumber: "INV-2025-0146",
                  remarks: "Test expense note",
                });
                setCreateItems([{
                  documentType: "Purchase Invoice",
                  documentNumber: "STID734821056",
                  itemTotal: 3035000,
                  amountPaid: 0,
                  discount: 0,
                  outstanding: 3035000,
                }]);
                setCreateDiscount(0);
                setCreatePPN(55000);
                setCreatePPH(0);
              }}
            >
              Autofill Test Data
            </Button>
            <Button
              variant="outline"
              onClick={() => 
              {
                setCreateItems([]);
                setCreateDiscount(0);
                setCreatePPN(0);
                setCreatePPH(0);
                setCreateForm({ supplierName: "", term: "Credit", currency: "IDR", company: "WNS", documentReceivedDate: "02/04/2026", apNoteDate: "02/04/2026", invoiceNumber: "", remarks: "" });
                setShowCreateDialog(false)
              }
                }
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => 
              {
                const totalAmount = createItems.reduce((sum, item) => sum + item.itemTotal, 0);
                const grandTotal = totalAmount - createDiscount + createPPN - createPPH;
                const seqNo = String(allReceipts.length + 1).padStart(4, "0");
                const company = createForm.company || "WNS";
                const dateParts = (createForm.apNoteDate || "02/04/2026").split("/");
                const monthYear = dateParts.length === 3 ? `${dateParts[1]}${dateParts[2].slice(-2)}` : "0426";
                const newReceipt: InvoiceReceiptData = {
                  id: `IR-${String(allReceipts.length + 1).padStart(3, "0")}`,
                  invoiceReceiptNo: `IR/${company}.MDN/${monthYear}/${seqNo}`,
                  linkedPurchaseInvoiceNo: createItems[0]?.documentNumber,
                  linkedPONo: undefined,
                  supplierName: createForm.supplierName || "Unknown Supplier",
                  ptCompany: company,
                  warehouse: "MEDAN",
                  createDate: createForm.apNoteDate,
                  totalAmount,
                  discount: createDiscount,
                  ppn: createPPN,
                  pph: createPPH,
                  otherCost: 0,
                  grandTotal,
                  downPayment: 0,
                  outstanding: grandTotal,
                  currency: createForm.currency,
                  remarks: createForm.remarks,
                  status: "COMPLETE",
                  linkedDocs: createItems.map((item) => ({
                    type: "Purchase Invoice",
                    docNo: item.documentNumber,
                    badgeLabel: "PI",
                    badgeColor: "blue",
                  })),
                  items: [],
                };
                const updated = [...savedReceipts, newReceipt];
                setSavedReceipts(updated);
                localStorage.setItem("invoiceReceipts", JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent("invoiceReceiptCreated"));
                setCreateItems([]);
                setCreateDiscount(0);
                setCreatePPN(0);
                setCreatePPH(0);
                setCreateForm({ supplierName: "", term: "Credit", currency: "IDR", company: "WNS", documentReceivedDate: "02/04/2026", apNoteDate: "02/04/2026", invoiceNumber: "", remarks: "" });
                setShowCreateDialog(false);
              }
               }
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Documents Dialog */}
      <Dialog open={showAddDocDialog} onOpenChange={setShowAddDocDialog}>
        <DialogContent className="w-[900px] max-w-[90vw] h-auto max-h-[90vh] flex flex-col overflow-hidden px-6 py-0">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="text-base text-purple-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Select Purchase Invoice
            </DialogTitle>
            <p className="text-xs text-gray-500">Choose a purchase invoice to add as a payable item</p>
            <div className="mt-1.5">
              <Input
                placeholder="Search by PI number or supplier..."
                value={addDocSearch}
                onChange={(e) => setAddDocSearch(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-2 space-y-3" style={{ maxHeight: "384px" }}>
            {availablePurchaseInvoices.length === 0 ? (
              <div className="text-center text-gray-400 py-6">
                <FileText className="w-8 h-8 mx-auto mb-1.5 text-gray-300" />
                <p>No available purchase invoices</p>
              </div>
            ) : (
              availablePurchaseInvoices.map((pi) => (
                <button
                  key={pi.piId}
                  onClick={() => {
                    setCreateItems([...createItems, {
                      documentType: "Purchase Invoice",
                      documentNumber: pi.purchaseInvoiceNo,
                      itemTotal: pi.grandTotal,
                      amountPaid: 0,
                      discount: 0,
                      outstanding: pi.outstanding,
                    }]);
                    setShowAddDocDialog(false);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg hover:shadow-md hover:bg-purple-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pl-2">
                
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{pi.purchaseInvoiceNo}</p>
                        <p className="text-xs text-gray-500 truncate">{pi.supplierName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 whitespace-nowrap pl-3 pr-2">
                      <p className="font-medium text-sm text-gray-900">
                        {pi.currency} {pi.grandTotal.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">PI</Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAddDocDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>  
      </Dialog>

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
