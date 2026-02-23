import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Plus, Trash2, Edit, Check, FileText } from "lucide-react";
import { formatNumber } from "../utils/numberFormat";

interface PVRFormData {
  supplierName: string;
  term: "Credit" | "Urgent";
  currency: string;
  rate: number;
  pt: "AMT" | "GMI" | "IMI" | "MJS" | "TTP" | "WNS" | "WSI";
  pvrDate: string;
  pvrNo: string;
  bankAccount: string;
  paymentMethod: "Transfer" | "Cash";
  reference: string;
  remarks: string;
}

interface LinkedDocument {
  id: string;
  piNo: string;
  poNo: string;
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  totalAmount: number;
  documentType: "PI" | "IC" | "SR" | "EN" | "PO";
}

interface PVRDialogsProps {
  showCreatePVRDialog: boolean;
  setShowCreatePVRDialog: (show: boolean) => void;
  showPVRSuccessDialog: boolean;
  setShowPVRSuccessDialog: (show: boolean) => void;
  showAddLinksDialog: boolean;
  setShowAddLinksDialog: (show: boolean) => void;
  pvrForm: PVRFormData;
  setPvrForm: (form: PVRFormData) => void;
  linkedPIs: LinkedDocument[];
  setLinkedPIs: (docs: LinkedDocument[]) => void;
  showCreateDatePicker: boolean;
  setShowCreateDatePicker: (show: boolean) => void;
  showSupplierPVRDropdown: boolean;
  setShowSupplierPVRDropdown: (show: boolean) => void;
  filteredSuppliers: any[];
  handleSupplierPVRChange: (supplierName: string) => void;
  editingAmountPaidId: string | null;
  setEditingAmountPaidId: (id: string | null) => void;
  editingAmountPaidValue: string;
  setEditingAmountPaidValue: (value: string) => void;
  editingDiscountId: string | null;
  setEditingDiscountId: (id: string | null) => void;
  editingDiscountValue: string;
  setEditingDiscountValue: (value: string) => void;
  tableRefreshTrigger: number;
  setTableRefreshTrigger: (trigger: number) => void;
  handleCreatePVR: () => void;
  resetPVRForm: () => void;
  savedPvrNo: string;
  savedPvrLinkedDocs: LinkedDocument[];
  setLinkedDocsRefresh: (refresh: number | ((prev: number) => number)) => void;
  setShowLinkedDocsDialog: (show: boolean) => void;
  getTodayDate: () => string;
  generatePVRNumber: (pt: string, date: string) => string;
  getDocumentNumber: (pi: LinkedDocument) => string;
  addLinksSearchTerm: string;
  setAddLinksSearchTerm: (term: string) => void;
  selectedDocuments: Set<string>;
  setSelectedDocuments: (docs: Set<string>) => void;
  selectAllDocuments: boolean;
  setSelectAllDocuments: (select: boolean) => void;
  mockExpenseNote: any[];
  mockpurchaseInvoice: any[];
  mockImportCosts: any[];
  mockShipmentRequest: any[];
  mockPurchaseOrder: any[];
  pvrData: any[];
}

export function PVRDialogs({
  showCreatePVRDialog,
  setShowCreatePVRDialog,
  showPVRSuccessDialog,
  setShowPVRSuccessDialog,
  showAddLinksDialog,
  setShowAddLinksDialog,
  pvrForm,
  setPvrForm,
  linkedPIs,
  setLinkedPIs,
  showCreateDatePicker,
  setShowCreateDatePicker,
  showSupplierPVRDropdown,
  setShowSupplierPVRDropdown,
  filteredSuppliers,
  handleSupplierPVRChange,
  editingAmountPaidId,
  setEditingAmountPaidId,
  editingAmountPaidValue,
  setEditingAmountPaidValue,
  editingDiscountId,
  setEditingDiscountId,
  editingDiscountValue,
  setEditingDiscountValue,
  tableRefreshTrigger,
  setTableRefreshTrigger,
  handleCreatePVR,
  resetPVRForm,
  savedPvrNo,
  savedPvrLinkedDocs,
  setLinkedDocsRefresh,
  setShowLinkedDocsDialog,
  getTodayDate,
  generatePVRNumber,
  getDocumentNumber,
  addLinksSearchTerm,
  setAddLinksSearchTerm,
  selectedDocuments,
  setSelectedDocuments,
  selectAllDocuments,
  setSelectAllDocuments,
  mockExpenseNote,
  mockpurchaseInvoice,
  mockImportCosts,
  mockShipmentRequest,
  mockPurchaseOrder,
  pvrData,
}: PVRDialogsProps) {
  return (
    <>
      {/* Create New PVR Dialog */}
      <Dialog
        open={showCreatePVRDialog}
        onOpenChange={(open) => {
          setShowCreatePVRDialog(open);
          if (!open) {
            resetPVRForm();
            setLinkedPIs([]);
            setShowSupplierPVRDropdown(false);
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
                  const pvrDataStr = localStorage.getItem("pvrData");
                  window.dispatchEvent(new StorageEvent("storage", { 
                    key: "pvrData",
                    newValue: pvrDataStr
                  }));
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
              const linkedDocIds = new Set<string>();
              pvrData.forEach((pvr) => {
                pvr.linkedDocs?.forEach((doc: any) => {
                  linkedDocIds.add(`${doc.documentType}-${doc.piNo}`);
                });
              });

              linkedPIs.forEach((doc) => {
                linkedDocIds.add(`${doc.documentType}-${doc.piNo}`);
              });

              const searchLower = addLinksSearchTerm.toLowerCase();
              
              const searchedENs = mockExpenseNote.filter(
                (en) => en.apNoteNo.toLowerCase().includes(searchLower),
              );
              
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

              return unlinkedPIs.length > 0 ||
                unlinkedICs.length > 0 ||
                unlinkedSRs.length > 0 ? (
                <div className="space-y-3">
                  {unlinkedPIs.map((pi) => (
                    <div key={`PI-${pi.purchaseInvoiceNo}`} className="p-3 border border-gray-200 rounded">
                      <div className="text-sm font-medium">{pi.purchaseInvoiceNo}</div>
                      <div className="text-xs text-gray-500">Total: {formatNumber(pi.totalAmount)}</div>
                    </div>
                  ))}
                  {unlinkedICs.map((ic) => (
                    <div key={`IC-${ic.icNum}`} className="p-3 border border-gray-200 rounded">
                      <div className="text-sm font-medium">{ic.icNum}</div>
                      <div className="text-xs text-gray-500">Total: {formatNumber(ic.totalImportCost)}</div>
                    </div>
                  ))}
                  {unlinkedSRs.map((sr) => (
                    <div key={`SR-${sr.srNum}`} className="p-3 border border-gray-200 rounded">
                      <div className="text-sm font-medium">{sr.srNum}</div>
                      <div className="text-xs text-gray-500">Total: {formatNumber(sr.totalShipmentRequest)}</div>
                    </div>
                  ))}
                </div>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
