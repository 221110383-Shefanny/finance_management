import { useState } from "react";
import { motion } from "motion/react";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import {
  ArrowLeft,
  FileText,
  Building2,
  Warehouse,
  Calendar,
  Paperclip,
  CheckCircle2,
  Package,
  DollarSign,
} from "lucide-react";
import { DocumentFolder, Document } from "./NotificationButton";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner@2.0.3";

interface FolderDocumentsListProps {
  folder: DocumentFolder;
  onBack: () => void;
  onReceiveDocuments: (
    folderId: string,
    documentIds: string[],
  ) => void;
}

export function FolderDocumentsList({
  folder,
  onBack,
  onReceiveDocuments,
}: FolderDocumentsListProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<
    Set<string>
  >(new Set());
  const [selectedPT, setSelectedPT] = useState<string | null>(null);

  // Get unique PT companies from documents
  const uniquePTs = Array.from(
    new Set(folder.documents.map((doc: any) => doc.ptCompany))
  ).filter(Boolean);

  // Filter documents by selected PT
  const filteredDocuments = selectedPT
    ? folder.documents.filter((doc: any) => doc.ptCompany === selectedPT)
    : folder.documents;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(
        new Set(filteredDocuments.map((doc) => doc.id)),
      );
    } else {
      setSelectedDocuments(new Set());
    }
  };

  const handleSelectDocument = (
    documentId: string,
    checked: boolean,
  ) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(documentId);
    } else {
      newSelected.delete(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleReceive = () => {
    if (selectedDocuments.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    onReceiveDocuments(
      folder.id,
      Array.from(selectedDocuments),
    );
    setSelectedDocuments(new Set());
    // Don't auto-navigate away - keep the folder view open for date selection dialog
  };

  const allSelected =
    selectedDocuments.size === filteredDocuments.length &&
    filteredDocuments.length > 0;
  const someSelected =
    selectedDocuments.size > 0 &&
    selectedDocuments.size < filteredDocuments.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h3 className="text-gray-900">{folder.folderName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Warehouse className="w-4 h-4" />
            {folder.warehouse}
          </div>
        </div>
      </div>

      {/* PT Filter */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Filter by PT:</span>
        <Select value={selectedPT || "all"} onValueChange={(value) => setSelectedPT(value === "all" ? null : value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select PT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {uniquePTs.map((pt) => (
              <SelectItem key={pt} value={pt || ""}>
                {pt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            className={
              someSelected
                ? "data-[state=checked]:bg-purple-600"
                : ""
            }
          />
          <label
            htmlFor="select-all"
            className="text-gray-900 cursor-pointer select-none"
          >
            Select All ({filteredDocuments.length} documents)
          </label>
        </div>

        {selectedDocuments.size > 0 && (
          <Badge className="bg-purple-600 text-white">
            {selectedDocuments.size} selected
          </Badge>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
        {filteredDocuments.map((doc, index) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            index={index}
            isSelected={selectedDocuments.has(doc.id)}
            onSelect={(checked) =>
              handleSelectDocument(doc.id, checked)
            }
          />
        ))}
        {filteredDocuments.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <p>No documents found for selected PT</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 pt-4 bg-white border-t">
        <div className="flex gap-3">
          <Button
            onClick={handleReceive}
            disabled={selectedDocuments.size === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Receive{" "}
            {selectedDocuments.size > 0
              ? `(${selectedDocuments.size})`
              : ""}
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DocumentItemProps {
  document: Document;
  index: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

function DocumentItem({
  document,
  index,
  isSelected,
  onSelect,
}: DocumentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? "bg-purple-50 border-purple-400 shadow-md"
          : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
      }`}
      onClick={() => onSelect(!isSelected)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`doc-${document.id}`}
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? "bg-purple-200" : "bg-blue-100"
              }`}
            >
              <FileText
                className={`w-5 h-5 ${isSelected ? "text-purple-700" : "text-blue-600"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900 truncate">
                  {document.purchaseInvoiceNo}
                </span>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 flex-shrink-0 font-bold"
                >
                  {document.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {document.purchaseOrderNo}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Supplier
                </div>
                <div className="text-gray-900 truncate">
                  {document.supplier}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Warehouse
                </div>
                <div className="text-gray-900">
                  {document.warehouse}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Delivery Date
                </div>
                <div className="text-gray-900">
                  {document.docDeliveryDate ? formatDateToDDMMYYYY(document.docDeliveryDate) : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Received Date
                </div>
                <div className="text-gray-900">
                  {document.docReceivedDate ? formatDateToDDMMYYYY(document.docReceivedDate) : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Attachment
                </div>
                <div className="text-gray-900 truncate">
                  {document.attachment}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">
                  Grand Total
                </div>
                <div className="text-green-700">
                  {document.grandTotal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}