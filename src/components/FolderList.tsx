import { useState } from "react";
import { motion } from "motion/react";
import {
  Folder,
  ChevronRight,
  Warehouse,
  FileStack,
} from "lucide-react";
import { DocumentFolder } from "./NotificationButton";
import { FolderDocumentsList } from "./FolderDocumentsList";
import { Badge } from "./ui/badge";

interface FolderListProps {
  folders: DocumentFolder[];
  onReceiveDocuments: (
    folderId: string,
    documentIds: string[],
  ) => void;
}

export function FolderList({
  folders,
  onReceiveDocuments,
}: FolderListProps) {
  const [selectedFolder, setSelectedFolder] = useState<
    string | null
  >(null);

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Folder className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600">Inbox Empty</p>
        <p className="text-gray-400 text-sm">
          All documents have been received
        </p>
      </div>
    );
  }

  if (selectedFolder) {
    const folder = folders.find((f) => f.id === selectedFolder);
    if (!folder) return null;

    return (
      <FolderDocumentsList
        folder={folder}
        onBack={() => setSelectedFolder(null)}
        onReceiveDocuments={onReceiveDocuments}
      />
    );
  }


  // FOLDER DOCUMENT RECEIPT PURCHASE INVOICE
  return (
    <div className="space-y-3">
      {folders.map((folder, index) => (
        <motion.button
          key={folder.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setSelectedFolder(folder.id)}
          className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all text-left group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Folder className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 mb-1 truncate">
                  {folder.folderName}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Warehouse className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 text-sm">
                      {folder.warehouse}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileStack className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">
                      {folder.documents.length} docs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white">
                {folder.documents.length}
              </Badge>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}