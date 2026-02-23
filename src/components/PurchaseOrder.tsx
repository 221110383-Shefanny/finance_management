import { useState, useEffect } from "react";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import {
  mockLinkedPOs,
  findLinkedPVRsByPONo,
} from "../mocks/mockData";
import { POCollapsible } from "./POCollapsible";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Calendar, ChevronUp, ChevronDown } from "lucide-react";
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

type POStatus = "OUTSTANDING" | "PARTIAL" | "COMPLETE";

interface PurchaseOrderData {
  poId: string;
  purchaseOrderNo: string;
  supplierName: string;
  createdBy: string;
  createDate: string;
  totalAmount: number;
  poStatus: string;
  internalRemarks: string;
  otherTotal: number;
  grandTotal: number;
  items?: any[];
  [key: string]: any; // Allow additional properties from linked structure
}

const mockData = mockLinkedPOs;

export default function PurchaseOrder({
  selectedPONo,
  pvrData,
  onNavigateToPurchaseInvoice,
  onNavigateToPurchaseOrder,
  onNavigateToImportCost,
  onNavigateToShipmentRequest,
  onNavigateToPVR,
  onNavigateToAPNote,
  onNavigateToPurchaseReturn,
  onNavigateToPV,
  refreshKey: externalRefreshKey,
}: {
  selectedPONo?: string | null;
  pvrData?: any[];
  onNavigateToPurchaseInvoice?: (docNo: string) => void;
  onNavigateToPurchaseOrder?: (docNo: string) => void;
  onNavigateToImportCost?: (docNo: string) => void;
  onNavigateToShipmentRequest?: (docNo: string) => void;
  onNavigateToPVR?: (pvrNo: string) => void;
  onNavigateToAPNote?: (apNoteId: string) => void;
  onNavigateToPurchaseReturn?: (prNo: string) => void;
  onNavigateToPV?: (pvNo: string) => void;
  refreshKey?: number;
} = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [ptFilter, setPtFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [vendorOriginFilter, setVendorOriginFilter] = useState<string>("all");
  const [activeFilterType, setActiveFilterType] = useState<
    "status" | "pt" | "term" | "vendorOrigin" | null
  >(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedPOIds, setExpandedPOIds] = useState<
    Set<string>
  >(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Calendar Filter Dialog States
  const [showCalendarDialog, setShowCalendarDialog] =
    useState(false);
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarUseTodayDate, setCalendarUseTodayDate] =
    useState(false);

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

  // Convert DD/MM/YYYY to YYYY-MM-DD for comparison
  const convertToISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
  };

  // Effect to auto-expand PO when selectedPONo prop is provided
  useEffect(() => {
    if (selectedPONo) {
      const foundPO = mockData.find(
        (po) =>
          po.poId === selectedPONo ||
          po.purchaseOrderNo === selectedPONo,
      );
      if (foundPO) {
        const newExpanded = new Set(expandedPOIds);
        newExpanded.add(foundPO.poId || foundPO.id);
        setExpandedPOIds(newExpanded);
      }
    }
  }, [selectedPONo]);

  // Effect to handle navigation from linked documents
  useEffect(() => {
    const handleNavigateToPO = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { poNo } = customEvent.detail;

      console.log(
        "=== PurchaseOrder navigateToPurchaseOrder event ===",
        poNo,
      );
      console.log("Available mockData count:", mockData.length);
      console.log(
        "First few PO numbers:",
        mockData
          .slice(0, 3)
          .map((po: any) => po.purchaseOrderNo),
      );

      // Find the PO with matching number (use purchaseOrderNo, not noPO)
      const matchingPO = mockData.find(
        (po) => po.purchaseOrderNo === poNo || po.poId === poNo,
      );

      if (matchingPO) {
        console.log(
          "Found matching PO:",
          matchingPO.purchaseOrderNo,
          "ID:",
          matchingPO.poId || matchingPO.id,
        );
        // Expand the matching PO card
        const poIdToSet = matchingPO.poId || matchingPO.id;
        const newExpanded = new Set(expandedPOIds);
        newExpanded.add(poIdToSet);
        setExpandedPOIds(newExpanded);
        console.log(
          "✅ Added to expandedPOIds:",
          poIdToSet,
        );

        // Scroll to the card after DOM updates
        setTimeout(() => {
          const element = document.getElementById(
            `po-card-${matchingPO.purchaseOrderNo}`,
          );
          console.log(
            "Looking for element:",
            `po-card-${matchingPO.purchaseOrderNo}`,
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
        console.warn("No matching PO found for poNo:", poNo);
        console.warn(
          "Available purchaseOrderNo values:",
          mockData.map((po: any) => po.purchaseOrderNo),
        );
      }
    };

    window.addEventListener(
      "navigateToPurchaseOrder",
      handleNavigateToPO,
    );

    return () => {
      window.removeEventListener(
        "navigateToPurchaseOrder",
        handleNavigateToPO,
      );
    };
  }, [mockData]);

  const getPTCompany = (noPO: string) => {
    if (!noPO || typeof noPO !== "string") {
      return "N/A";
    }
    const match = noPO.match(/^PO\/([A-Z]+)\./);
    return match ? match[1] : "N/A";
  };

  const filteredData = mockData.filter((po) => {
    try {
      const matchesSearch =
        searchQuery === "" ||
        po.purchaseOrderNo
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        po.supplierName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || 
        po.poStatus?.toUpperCase() === statusFilter.toUpperCase();

      const ptCompany = (po as any).ptCompany || getPTCompany(po.purchaseOrderNo);
      const matchesPt =
        ptFilter === "all" || ptCompany === ptFilter;

      // PO Type filter - Get from poType field in purchase order
      let poTypeValue = "all";
      if ((po as any).poType) {
        poTypeValue = (po as any).poType;
      }
      const matchesTerm =
        termFilter === "all" || poTypeValue === termFilter;

      // Vendor Origin filter - Get from vendor origin field
      let vendorOrigin = "all";
      if ((po as any).vendorOrigin) {
        vendorOrigin = (po as any).vendorOrigin;
      }
      const matchesVendorOrigin =
        vendorOriginFilter === "all" || vendorOrigin === vendorOriginFilter;

      // Date range filter
      let matchesDateRange = true;
      if (calendarDateFrom || calendarDateTo) {
        const poDateISO = convertToISODate(
          po.createDate.split("-").reverse().join("/"),
        );
        const fromISO = calendarDateFrom
          ? convertToISODate(calendarDateFrom)
          : "";
        const toISO = calendarDateTo
          ? convertToISODate(calendarDateTo)
          : "";

        if (fromISO && poDateISO < fromISO)
          matchesDateRange = false;
        if (toISO && poDateISO > toISO)
          matchesDateRange = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPt &&
        matchesTerm &&
        matchesVendorOrigin &&
        matchesDateRange
      );
    } catch (error) {
      console.error("Error filtering PO data:", error);
      return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Tab Filters */}
      <div className="space-y-4">
        {/* Status, PT, and Term Filter Buttons */}
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

          {/* Status Filter Button */}
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
              : statusFilter}
          </button>

          {/* PO Type Filter Button */}
          <button
            onClick={() =>
              setActiveFilterType(
                activeFilterType === "term" ? null : "term",
              )
            }
            className={`
              flex-1 px-3 py-1.5 rounded-full font-medium text-xs transition-all
              ${
                activeFilterType === "term" || termFilter !== "all"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
              }
            `}
          >
            {termFilter === "all" ? "ALL PO TYPE" : termFilter.toUpperCase()}
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

        {/* Dynamic Filter Details Row */}
        <div className="h-[44px] flex items-center overflow-hidden">
          <div className="flex flex-1 items-center gap-1.5">
            {activeFilterType === "status" &&
              ["all", "OUTSTANDING", "PARTIAL", "COMPLETE"].map(
                (key) => {
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
                      {key === "all" ? "ALL STATUS" : key}
                    </button>
                  );
                },
              )}

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

            {activeFilterType === "term" &&
              ["all", "Urgent", "Credit"].map((key) => {
                const isSelected = termFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setTermFilter(key);
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
      </div>

      <div className="flex justify-end items-center gap-3">
      {/* Clear Filter Button - Only show when filters are active */}
      {(statusFilter !== "all" || ptFilter !== "all" || termFilter !== "all" || vendorOriginFilter !== "all") && (
        <Button
          onClick={() => {
            setStatusFilter("all");
            setPtFilter("all");
            setTermFilter("all");
            setVendorOriginFilter("all");
            setActiveFilterType(null);
          }}
          variant="outline"
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors border-2 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
        >
          ✕ Clear Filters
        </Button>
      )}

      {/* Filter Date Button */}
      
        <Button
          onClick={() => setShowCalendarDialog(true)}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
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
      </div>

      {/* Document Counter */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-purple-700">
          {filteredData.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-purple-700">
          {mockData.length}
        </span>{" "}
        documents
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
        <Input
          placeholder="🔍 Search PO Number or Supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-purple-200 focus:border-purple-400"
        />
      </div>

      {/* PO List */}
      <div className="space-y-4">
        {filteredData.map((po) => (
          <div
            key={po.poId}
            id={`po-card-${po.purchaseOrderNo}`}
          >
            <POCollapsible
              po={po}
              pvrData={pvrData}
              refreshKey={(externalRefreshKey || 0) + refreshKey}
              expandAll={expandAll}
              selectedPOId={expandedPOIds.has(po.poId) ? po.poId : undefined}
              vendorOriginFilter={vendorOriginFilter}
              onNavigateToPurchaseInvoice={
                onNavigateToPurchaseInvoice
              }
              onNavigateToImportCost={onNavigateToImportCost}
              onNavigateToPurchaseOrder={
                onNavigateToPurchaseOrder
              }
              onNavigateToShipmentRequest={
                onNavigateToShipmentRequest
              }
              onNavigateToPVR={onNavigateToPVR}
              onNavigateToAPNote={onNavigateToAPNote}
              onNavigateToPurchaseReturn={onNavigateToPurchaseReturn}
              onNavigateToPV={onNavigateToPV}
            />
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No purchase orders found
        </div>
      )}

      {/* Calendar Filter Dialog */}
      <Dialog
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filter by Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date From
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {calendarDateFrom || "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={
                        calendarDateFrom
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
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={calendarDateFrom}
                  onChange={(e) =>
                    setCalendarDateFrom(e.target.value)
                  }
                  className="w-48"
                />
              </div>
              {calendarDateFrom &&
                !isValidDate(calendarDateFrom) && (
                  <p className="text-xs text-red-500">
                    Invalid date format. Use DD/MM/YYYY
                  </p>
                )}
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date To
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {calendarDateTo || "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={
                        calendarDateTo
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
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={calendarDateTo}
                  onChange={(e) =>
                    setCalendarDateTo(e.target.value)
                  }
                  className="w-48"
                />
              </div>
              {calendarDateTo &&
                !isValidDate(calendarDateTo) && (
                  <p className="text-xs text-red-500">
                    Invalid date format. Use DD/MM/YYYY
                  </p>
                )}
            </div>

            {/* Use Today's Date Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-today"
                checked={calendarUseTodayDate}
                onCheckedChange={(checked) => {
                  setCalendarUseTodayDate(checked as boolean);
                  if (checked) {
                    const today = getCurrentDate();
                    setCalendarDateFrom(today);
                    setCalendarDateTo(today);
                  }
                }}
              />
              <label
                htmlFor="use-today"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use today's date
              </label>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCalendarDialog(false);
                  setCalendarDateFrom("");
                  setCalendarDateTo("");
                  setCalendarUseTodayDate(false);
                }}
              >
                Clear Filter
              </Button>
              <Button
                onClick={() => {
                  if (
                    (calendarDateFrom &&
                      !isValidDate(calendarDateFrom)) ||
                    (calendarDateTo &&
                      !isValidDate(calendarDateTo))
                  ) {
                    alert(
                      "Please enter valid dates in DD/MM/YYYY format",
                    );
                    return;
                  }
                  setShowCalendarDialog(false);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}