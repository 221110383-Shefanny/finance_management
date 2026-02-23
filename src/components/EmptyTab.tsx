interface EmptyTabProps {
  tabName?: string;
}

export default function EmptyTab({
  tabName = "Tab",
}: EmptyTabProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {tabName}
        </h2>
        <p className="text-gray-500">
          This section is coming soon...
        </p>
      </div>
    </div>
  );
}