import { useState, useEffect } from "react";
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
  X
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
} from "./ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarComponent } from "./ui/calendar";

// Mock Data for Reimburse Without PO
const mockReimburseData = [
  {
    reimId: "reim_001",
    reimburseNo: "REIM/MJS.MDN/2510/0001",
    supplierName: "Employee A",
    ptCompany: "MJS",
    status: "COMPLETE",
    createdBy: "Admin A",
    createDate: "12/02/2026",
    vendorOrigin: "Local",
    reimburseType: "Credit",
    grandTotal: 500000,
  },
  {
    reimId: "reim_002",
    reimburseNo: "REIM/AMT.MDN/2510/0002",
    supplierName: "Employee B",
    ptCompany: "AMT",
    status: "OUTSTANDING",
    createdBy: "Admin B",
    createDate: "10/02/2026",
    vendorOrigin: "Local",
    reimburseType: "Urgent",
    grandTotal: 1200000,
  },
  
 
];

export default function ReimburseWithoutPO() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ptFilter, setPtFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [vendorOriginFilter, setVendorOriginFilter] = useState("all");
  const [activeFilterType, setActiveFilterType] = useState<"status" | "pt" | "type" | "vendorOrigin" | null>(null);
  
  const [expandAll, setExpandAll] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] = useState(false);

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
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    
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
  });

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
          <ReimburseCollapsible 
            key={item.reimId} 
            item={item} 
            expandAll={expandAll}
          />
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
function ReimburseCollapsible({ item, expandAll }: { item: any, expandAll: boolean }) {
  const [isExpanded, setIsExpanded] = useState(expandAll);

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
                  {item.supplierName}
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
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created Date
                  </span>
                  <div className="text-gray-900 font-medium">{item.createDate}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Created By</span>
                  <div className="text-gray-900 font-medium">{item.createdBy}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Status</span>
                  <div>
                    <Badge className={`${item.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.status}
                    </Badge>
                  </div>
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
              
              <div className="flex items-center gap-3">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 min-w-[120px]">
                  <FileText className="w-4 h-4 mr-2" /> View Details
                </Button>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 min-w-[100px]">
                  Link
                </Button>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 min-w-[130px]">
                  Expense Note
                </Button>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 min-w-[80px]">
                  PVR
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


