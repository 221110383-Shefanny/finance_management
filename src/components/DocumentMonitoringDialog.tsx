import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Check, Plus, Clock, TrendingUp, X } from "lucide-react";
import { Button } from "./ui/button";

interface DocumentMonitoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  po: any;
  mockItems?: any[];
  isPOCreated: (poNumber: string) => boolean;
  getEffectivePOStatus: (po: any, items: any[]) => string;
  formatDateToDDMMYYYY: (date: string) => string;
  piNumber?: string;
  icNumber?: string;
  invoiceReceiptNumber?: string;
  linkedPI?: any;
  formatCurrency?: (amount: number, currency: string) => string;
  isDemoMode?: boolean;
  initialActiveStep?: string | null;
  initialDocumentType?: "local" | "overseas";
}

export function DocumentMonitoringDialog({
  open,
  onOpenChange,
  po,
  mockItems = [],
  isPOCreated,
  getEffectivePOStatus,
  formatDateToDDMMYYYY,
  piNumber = "",
  icNumber = "",
  invoiceReceiptNumber = "",
  linkedPI = null,
  formatCurrency = (amount: number, currency: string) => `${currency} ${amount}`,
  isDemoMode = true,
  initialActiveStep = null,
  initialDocumentType = "local",
}: DocumentMonitoringDialogProps) {
  const [activeStep, setActiveStep] = useState<string | null>(initialActiveStep);
  const [documentType, setDocumentType] = useState<"local" | "overseas">(initialDocumentType);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [pvVoided, setPvVoided] = useState<boolean>(false);
  const [pvApproveStep, setPvApproveStep] = useState<'created' | 'approved' | 'undone'>('created');
  const [pvApproveHistory, setPvApproveHistory] = useState<('approved' | 'undone' | 're-approved')[]>([]);
  const [pvUndoClicked, setPvUndoClicked] = useState<boolean>(false);
  
  useEffect(() => {
    if (open && initialActiveStep) {
      setActiveStep(initialActiveStep);
      const optionalSteps = [ "pr", "en", "ic", "sr"];
      if (optionalSteps.includes(initialActiveStep)) {
        setSelectedProcedures(prev => 
          prev.includes(initialActiveStep) ? prev : [...prev, initialActiveStep]
        )
    }}
    if (open && initialDocumentType) {
      setDocumentType(initialDocumentType);
    }
  }, [open, initialActiveStep, initialDocumentType]);

  const toggleProcedure = (procedure: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procedure)
        ? prev.filter((p) => p !== procedure)
        : [...prev, procedure]
    );
  };

  // Define procedures for each document type
  const overseasProcedures = [
    { value: "", label: "Select Procedure" },
    { value: "pr", label: "Purchase Return" },
    { value: "en", label: "Expense Note" },
    { value: "ic", label: "Import Cost" },
  ];

  const localProcedures = [
    { value: "", label: "Select Procedure" },
    { value: "pr", label: "Purchase Return" },
    { value: "en", label: "Expense Note" },
    { value: "sr", label: "Shipment Request" },
  ];

  const currentProcedures = documentType === "overseas" ? overseasProcedures : localProcedures;

  // Define step sequences for each document type
  const overseasSteps = [
    { id: "po", label: "Purchase Order", status: "Completed", description: "Required" },
    { id: "pi", label: "Purchase Invoice", status: "Completed", description: "Required" },
    { id: "invoice", label: "Invoice Receipt", status: "Completed", description: "Required" },
    { id: "pr", label: "Purchase Return", status: "Completed", optional: true, description: "Optional" },
    { id: "en", label: "Expense Note", status: "Completed", optional: true, description: "Optional" },
    { id: "ic", label: "Import Cost", status: "Completed", optional: true, description: "Optional" },
    { id: "pv", label: "Payment Voucher", status: "Completed", description: "Required" },
  ];

  const localSteps = [
    { id: "po", label: "Purchase Order", status: "Completed", description: "Required" },
    { id: "pi", label: "Purchase Invoice", status: "Completed", description: "Required" },
    { id: "invoice", label: "Invoice Receipt", status: "Completed", description: "Required" },
    { id: "pr", label: "Purchase Return", status: "Completed", optional: true, description: "Optional" },
    { id: "en", label: "Expense Note", status: "Completed", optional: true, description: "Optional" },
    { id: "sr", label: "Shipment Request", status: "Completed", optional: true, description: "Optional" },
    { id: "pv", label: "Payment Voucher", status: "Completed", description: "Required" },
  ];

  const currentSteps = documentType === "overseas" ? overseasSteps : localSteps;

  // Filter steps to show only required steps and selected procedures
  const displayedSteps = currentSteps.filter((step) => {
    // In real data mode (notification menu), only show PO step
    if (!isDemoMode) {
      return step.id === "po";
    }
    // In demo mode, show all steps based on procedures
    return !step.optional || selectedProcedures.includes(step.id);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1800px] h-[800px] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-purple-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Document Monitoring
                        {isDemoMode && (
                          <>
                            {/* Developer Note*/} 
              <p className="mt-2 text-xs text-red-500 italic"> 
                Note for Developer / User : The current screen is a non-functional UI. All displayed statuses are for visual purposes only. 
                <br />In the real application, the Local, Overseas, and other filter buttons will not be displayed, as the system automatically determines the document type based on the PO data and shows the relevant steps accordingly."
              </p>
                          </>
                        )}
            </DialogTitle>
          </div>
          {isDemoMode && (
            <DialogDescription className="text-grey-900 flex items-center gap-2">
              (Not Available = Didn't added the mock data - UI only)
            </DialogDescription>
          )}
          {isDemoMode && (
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Document Type:</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as "local" | "overseas")}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 font-medium transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="local">Local</option>
                  <option value="overseas">Overseas</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <label className="text-sm font-medium text-gray-700">Add Step Procedure:</label>
                <div className="flex items-center gap-2">
                  {currentProcedures.map((proc) => (
                    proc.value && (
                      <Button
                        key={proc.value}
                        variant={selectedProcedures.includes(proc.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleProcedure(proc.value)}
                        className={selectedProcedures.includes(proc.value) ? "bg-purple-600 hover:bg-purple-700" : "text-gray-900 border-gray-300 hover:border-gray-400"}
                      >
                        {proc.label}
                      </Button>
                    )
                  ))}
                </div>
                {/* Developer Note*/} 
                <p className="mt-2 text-xs text-red-500 italic"> 
                  "Add Step Procedure" buttons are for demonstration purposes only. In a real application, the system would automatically determine which optional steps to display based on the PO data and user interactions, without requiring manual selection of procedures. 

                </p>


              </div>
            </div>
          )}

        </DialogHeader>

        {/* Main Content Area */}
        <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col overflow-hidden gap-6">
          {/* Current Status Section - NOT SCROLLABLE */}
          <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm flex-shrink-0">
            <div className="space-y-4">
              {/* Progress Line Container */}
              <div className="relative flex items-start justify-between">
                {/* Garis penghubung */}
                <div
                  className="absolute left-5 right-5 h-1 bg-gray-300"
                  style={{
                    top: "20px",
                    transform: "translateY(-50%)",
                  }}
                ></div>

                {/* Dynamic Steps */}
                {displayedSteps.map((step) => {
                  // Helper to find doc number from linkedDocs array
                  const findLinkedDocNo = (typeKeywords: string[]): string | undefined => {
                    const docs = linkedPI?.linkedDocs;
                    if (!docs) return undefined;
                    const arr = Array.isArray(docs) ? docs : [docs];
                    const found = arr.find((d: any) =>
                      typeKeywords.some((kw) => d.type?.toLowerCase().includes(kw.toLowerCase()))
                    );
                    return found?.docNo;
                  };
                  const demoFallback: Record<string, string> = {
                    pr: "PR/MJS.MDN/2510/0012",
                    en: "EN/MJS.MDN/2510/0045",
                    sr: "SR/MJS.MDN/2510/0078",
                    ic: "IC/MJS.MDN/2510/0033",
                    pv: "PV/MJS.MDN/2510/0091",
                    invoice: "IR/MJS.MDN/2601/0042",
                  };
                  const docNumberMap: Record<string, string | undefined> = {
                    po: po?.purchaseOrderNo,
                    pi: linkedPI?.purchaseInvoiceNo || piNumber || undefined,
                    invoice: invoiceReceiptNumber || linkedPI?.invoiceReceiptNo || findLinkedDocNo(["Invoice Receipt"]) || (isDemoMode ? demoFallback.invoice : undefined),
                    pr: linkedPI?.prNo || linkedPI?.returnNo || findLinkedDocNo(["Purchase Return", "Return"]) || (isDemoMode ? demoFallback.pr : undefined),
                    en: linkedPI?.enNo || linkedPI?.expenseNoteNo || findLinkedDocNo(["AP Note", "Expense Note"]) || (isDemoMode ? demoFallback.en : undefined),
                    ic: icNumber || linkedPI?.icNum || linkedPI?.icNo || findLinkedDocNo(["Import Cost"]) || (isDemoMode ? demoFallback.ic : undefined),
                    sr: linkedPI?.srNum || linkedPI?.srNo || findLinkedDocNo(["Shipment Request"]) || (isDemoMode ? demoFallback.sr : undefined),
                    pv: linkedPI?.pvNo || linkedPI?.pvNumber || findLinkedDocNo(["Payment Voucher"]) || (isDemoMode ? demoFallback.pv : undefined),
                  };
                  const docNumber = docNumberMap[step.id];
                  return (
                  <div key={step.id} className="flex flex-col items-center flex-1 z-10 relative w-full">
                    {docNumber ? (
                      <span className="text-xs text-gray-500 font-mono mb-1 text-center truncate w-full px-1 leading-tight" title={docNumber}>
                        {docNumber}
                      </span>
                    ) : (
                      <span className="text-xs mb-1 leading-tight">&nbsp;</span>
                    )}
                    <div
                      onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                      className={`w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                        step.id === "pv" && pvVoided
                          ? "bg-red-500"
                          : step.id === "pv" && pvApproveStep === "created"
                          ? "bg-yellow-500"
                          : step.id === "pv" && pvApproveStep === "approved"
                          ? "bg-green-500"
                          : step.id === "pv" && pvApproveStep === "undone"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {step.id === "pv" && (pvApproveStep === "created" || pvApproveStep === "undone") && !pvVoided ? (
                        <Clock className="text-sm font-bold" />
                      ) : step.id === "pv" && pvVoided ? (
                        <X className="text-sm font-bold" />
                      ) : (
                        <Check className="text-sm font-bold" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center font-semibold">
                      {step.label}
                    </span>
                    <span className="text-xs text-gray-600 mt-1 text-center">
                      {step.id === "pv" && pvVoided ? "Voided" : step.status}
                    </span>
                   
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Timeline Events Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* PURCHASE ORDER STEP DETAILS */}
          {activeStep === "po" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Purchase Order Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: "05/01/2026" },
                { label: "Approved", completed: true, badge: "07/01/2026" },
                { label: "Supplied", completed: true, badge: "10/01/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.completed ? "bg-green-100" : "bg-gray-100"}`}>
                      {row.completed ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    {row.badge ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">
                    3 / 3
                  </span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* PI STEP DETAILS */}
          {activeStep === "pi" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Purchase Invoice Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: linkedPI?.createDate ? formatDateToDDMMYYYY(linkedPI.createDate) : "15/01/2026" },
                { label: "Sent", completed: true, badge: linkedPI?.sendDate ? formatDateToDDMMYYYY(linkedPI.sendDate) : "16/01/2026" },
                { label: "Received", completed: true, badge: linkedPI?.receiveDate ? formatDateToDDMMYYYY(linkedPI.receiveDate) : "18/01/2026" },
                { label: "Validated", completed: true, badge: linkedPI?.validateDate ? formatDateToDDMMYYYY(linkedPI.validateDate) : "19/01/2026" },
                { label: "Submitted", completed: true, badge: linkedPI?.submitDate ? formatDateToDDMMYYYY(linkedPI.submitDate) : "20/01/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.completed ? "bg-green-100" : "bg-gray-100"}`}>
                      {row.completed ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    {row.badge ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">
                    5 / 5
                  </span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE RECEIPT STEP DETAILS */}
          {activeStep === "invoice" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Invoice Receipt Details</h4>
              </div>
              {[
                { label: "Received", completed: true, badge: linkedPI?.receiveDate ? formatDateToDDMMYYYY(linkedPI.receiveDate) : formatDateToDDMMYYYY(new Date().toISOString()) },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.completed ? "bg-green-100" : "bg-gray-100"}`}>
                      {row.completed ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    {row.badge ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">1 / 1</span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* PURCHASE RETURN STEP DETAILS */}
          {activeStep === "pr" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Purchase Return Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: "22/01/2026" },
                { label: "Return Reason", completed: true, badge: "23/01/2026" },
                { label: "Items Returned", completed: true, badge: "24/01/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.completed ? "bg-green-100" : "bg-gray-100"}`}>
                      {row.completed ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    {row.badge ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">
                    3 / 3
                  </span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* IMPORT COST STEP DETAILS */}
          {activeStep === "ic" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Import Cost Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: "25/01/2026" },
                { label: "Processed", completed: true, badge: "27/01/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">2 / 2</span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* SHIPMENT REQUEST STEP DETAILS */}
          {activeStep === "sr" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Shipment Request Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: "28/01/2026" },
                { label: "PV Created", completed: true, badge: "30/01/2026" },
                { label: "PV Approved", completed: true, badge: "01/02/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.completed ? "bg-green-100" : "bg-gray-100"}`}>
                      {row.completed ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    {row.badge ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">
                    3 / 3
                  </span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* EXPENSE NOTE STEP DETAILS */}
          {activeStep === "en" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Expense Note Details</h4>
              </div>
              {[
                { label: "Created", completed: true, badge: "02/02/2026" },
                { label: "Submitted", completed: true, badge: "03/02/2026" },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{row.badge}</span>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-green-600">2 / 2</span>
                  <span className="text-sm font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT VOUCHER STEP DETAILS */}
          {activeStep === "pv" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Payment Voucher Details</h4>
              </div>

              {/* PV Status Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${pvApproveStep === "created" ? "bg-yellow-100" : "bg-green-100"}`}>
                  {pvApproveStep === "created" ? <Clock className="w-4 h-4 text-yellow-600" /> : <Check className="w-4 h-4 text-green-600" />}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">Payment Voucher</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pvVoided ? "bg-red-100 text-red-700" : pvApproveStep === "created" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                  {pvVoided ? formatDateToDDMMYYYY(new Date().toISOString()) : pvApproveStep === "created" ? "N/A" : (po?.paymentDate ? formatDateToDDMMYYYY(po.paymentDate) : formatDateToDDMMYYYY(new Date().toISOString()))}
                </span>
              </div>

              {/* Note & Action Buttons */}
              <div className="px-4 pb-3">
                <p className="text-xs text-red-500 italic mb-2">
                  Note: "Approve" and "Void" buttons are for demonstration purposes only.
                </p>
                {!pvVoided && (
                  <div className="flex gap-2">
                    {!pvApproveHistory.includes('approved') ? (
                      <Button
                        onClick={() => { setPvApproveStep('approved'); setPvApproveHistory([...pvApproveHistory, 'approved']); }}
                        variant="default" size="sm"
                        className="text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve (Demo)
                      </Button>
                    ) : (
                      <Button
                        onClick={() => { setPvVoided(true); }}
                        variant="default" size="sm"
                        className="text-xs bg-red-600 hover:bg-red-700 text-white"
                      >
                        Void
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* History Rows */}
              {pvApproveHistory.map((item, index) => (
                <div key={index}>
                  <div className="h-px bg-gray-100" />
                  {item === 'approved' && (
                    <div>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Approved</p>
                          <p className="text-xs text-gray-500">{po?.paymentDate ? formatDateToDDMMYYYY(po.paymentDate) : ""}</p>
                        </div>
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{po?.paymentDate ? formatDateToDDMMYYYY(po.paymentDate) : formatDateToDDMMYYYY(new Date().toISOString())}</span>
                      </div>
                      {!pvUndoClicked && index === pvApproveHistory.lastIndexOf('approved') && (
                        <div className="px-4 pb-3">
                          <Button
                            onClick={() => { setPvUndoClicked(true); setPvApproveStep('undone'); setPvApproveHistory([...pvApproveHistory, 'undone']); }}
                            variant="default" size="sm"
                            className="text-xs bg-red-600 hover:bg-red-700 text-white"
                          >
                            Undo Approve (Demo)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {item === 'undone' && (
                    <div>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">Approval Undone</span>
                        <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">{formatDateToDDMMYYYY(new Date().toISOString())}</span>
                      </div>
                      {pvApproveStep === 'undone' && index === pvApproveHistory.lastIndexOf('undone') && (
                        <div className="px-4 pb-3">
                          <Button
                            onClick={() => { setPvApproveStep('approved'); setPvApproveHistory([...pvApproveHistory, 're-approved']); }}
                            variant="default" size="sm"
                            className="text-xs bg-green-600 hover:bg-green-700 text-white"
                          >
                            Re-approve (Demo)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {item === 're-approved' && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Re-approved</p>
                        <p className="text-xs text-gray-500">{po?.paymentDate ? formatDateToDDMMYYYY(po.paymentDate) : ""}</p>
                      </div>
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{po?.paymentDate ? formatDateToDDMMYYYY(po.paymentDate) : formatDateToDDMMYYYY(new Date().toISOString())}</span>
                    </div>
                  )}
                </div>
              ))}

              {pvVoided && (
                <div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Voided</p>
                      <p className="text-xs text-gray-500">Manual Void - Demo</p>
                    </div>
                    <span className="text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full">{formatDateToDDMMYYYY(new Date().toISOString())}</span>
                  </div>
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Completed Steps Status</span>
                <div className="flex items-center gap-1.5">
                  {pvVoided ? (
                    <span className="text-sm font-bold text-red-600">Voided</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-green-600">
                        {pvApproveHistory.some(h => h === 'approved' || h === 're-approved') ? "1 / 1" : "0 / 1"}
                      </span>
                      <span className="text-sm font-semibold text-green-600">Complete</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
