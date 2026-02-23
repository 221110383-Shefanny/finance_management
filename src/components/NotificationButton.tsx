import { useState } from "react";
import { FileSignature } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { FolderList } from "./FolderList";

export interface Document {
  id: string;
  purchaseInvoiceNo: string;
  purchaseOrderNo: string;
  supplier: string;
  warehouse: string;
  docDeliveryDate: string;
  docReceivedDate: string;
  attachment: string;
  type: string;
  grandTotal: string;
  ptCompany: string;
  verifiedDate?: string;
}

export interface DocumentFolder {
  id: string;
  folderName: string;
  warehouse: string;
  documents: Document[];
}

interface NotificationButtonProps {
  pendingFolders: DocumentFolder[];
  onReceiveDocuments: (
    folderId: string,
    documentIds: string[],
  ) => void;
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
          className="relative bg-white hover:bg-purple-50 border-purple-300 shadow-lg hover:shadow-xl transition-all"
        >
          <FileSignature className="w-5 h-5 text-purple-600" />
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
              <FileSignature className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div>Document Receipt</div>
              <div className="text-sm text-gray-500">
                {totalFolders} folder
                {totalFolders !== 1 ? "s" : ""} •{" "}
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