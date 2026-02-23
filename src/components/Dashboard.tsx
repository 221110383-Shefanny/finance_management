import { useState } from "react";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  TrendingUp,
  X,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");

  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  const [selectedCards, setSelectedCards] = useState<string[]>([
    "Purchase Orders",
    "Purchase Invoices",
    "Shipment Request",
    "Expenses Note",
    "Payment Voucher",
    "Payment Voucher Request",
  ]);

  const toggleCardSelection = (cardName: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardName)
        ? prev.filter((name) => name !== cardName)
        : [...prev, cardName],
    );
  };

  // Mock stats data for PO Status Distribution
  const stats = {
    complete: 19,
    partial: 11,
    outstanding: 14,
    total: 44,
  };

  // State for selected PIC detail
  const [selectedPICForDetail, setSelectedPICForDetail] =
    useState<string | null>(null);
  const [detailDocTypeFilter, setDetailDocTypeFilter] =
    useState("all");

  // State for AP Note charts
  const [selectedPIC, setSelectedPIC] = useState<{
    name: string;
    value: number;
  } | null>(null);

  // Mock data for AP Note charts
  const monthlyData = [
    { month: "Jan", count: 12 },
    { month: "Feb", count: 19 },
    { month: "Mar", count: 15 },
    { month: "Apr", count: 22 },
    { month: "May", count: 28 },
    { month: "Jun", count: 25 },
    { month: "Jul", count: 31 },
    { month: "Aug", count: 27 },
    { month: "Sep", count: 24 },
    { month: "Oct", count: 18 },
  ];

  const picActivityData = [
    { name: "SHEFANNY", value: 35 },
    { name: "ANDI", value: 28 },
    { name: "RUDI", value: 22 },
    { name: "SITI", value: 18 },
    { name: "BUDI", value: 15 },
    { name: "DEWI", value: 12 },
  ];

  const COLORS = [
    "#9333ea",
    "#a855f7",
    "#c084fc",
    "#d8b4fe",
    "#e9d5ff",
    "#f3e8ff",
  ];

  const handlePieClick = (data: any) => {
    setSelectedPIC(data);
  };

  // Mock data for PVR charts
  const pvrMonthlyData = [
    { month: "Jan", count: 10 },
    { month: "Feb", count: 15 },
    { month: "Mar", count: 13 },
    { month: "Apr", count: 18 },
    { month: "May", count: 24 },
    { month: "Jun", count: 21 },
    { month: "Jul", count: 27 },
    { month: "Aug", count: 23 },
    { month: "Sep", count: 20 },
    { month: "Oct", count: 16 },
  ];

  const pvrPicActivityData = [
    { name: "SHEFANNY", value: 32 },
    { name: "ANDI", value: 25 },
    { name: "RUDI", value: 20 },
    { name: "SITI", value: 16 },
    { name: "BUDI", value: 13 },
    { name: "DEWI", value: 10 },
  ];

  // State for PVR PIC selection
  const [selectedPVRPIC, setSelectedPVRPIC] = useState<{
    name: string;
    value: number;
  } | null>(null);

  const handlePVRPieClick = (data: any) => {
    setSelectedPVRPIC(data);
  };

  // Mock PVR data for detail view
  const mockPVRData = [
    {
      id: "1",
      pvrNo: "PVR-2024-001",
      pvrDate: "15/01/2024",
      createdBy: "SHEFANNY",
    },
    {
      id: "2",
      pvrNo: "PVR-2024-002",
      pvrDate: "18/01/2024",
      createdBy: "SHEFANNY",
    },
    {
      id: "3",
      pvrNo: "PVR-2024-003",
      pvrDate: "22/01/2024",
      createdBy: "ANDI",
    },
    {
      id: "4",
      pvrNo: "PVR-2024-004",
      pvrDate: "25/01/2024",
      createdBy: "RUDI",
    },
  ];

  // Mock data for PV charts
  const pvMonthlyRecapData = [
    { month: "Jul", count: 3 },
    { month: "Aug", count: 5 },
    { month: "Sep", count: 8 },
    { month: "Oct", count: 12 },
    { month: "Nov", count: 0 },
  ];

  const pvPicActivityData = [
    { name: "SHEFANNY", value: 4 },
    { name: "ANDI", value: 3 },
    { name: "RUDI", value: 2 },
    { name: "SITI", value: 2 },
    { name: "BUDI", value: 1 },
  ];

  // State for PV PIC selection
  const [selectedPVPIC, setSelectedPVPIC] = useState<{
    name: string;
    value: number;
  } | null>(null);

  const handlePVPieClick = (data: any) => {
    setSelectedPVPIC(data);
  };

  // Mock PV data for detail view
  const mockPVData = [
    {
      id: "1",
      pvNo: "PV-2024-001",
      supplierName: "ABC Corp",
      status: "PAID",
      createdBy: "SHEFANNY",
    },
    {
      id: "2",
      pvNo: "PV-2024-002",
      supplierName: "XYZ Ltd",
      status: "PROCESSED",
      createdBy: "SHEFANNY",
    },
    {
      id: "3",
      pvNo: "PV-2024-003",
      supplierName: "DEF Inc",
      status: "DRAFT",
      createdBy: "ANDI",
    },
    {
      id: "4",
      pvNo: "PV-2024-004",
      supplierName: "GHI Co",
      status: "PAID",
      createdBy: "RUDI",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-purple-900 mb-1">
              Financial Overview
            </h4>
            <p className="text-sm text-gray-600">
              Filter data by month and year to view specific
              metrics
            </p>
          </div>

          <div className="flex gap-3">
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem
                      key={year.value}
                      value={year.value}
                    >
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="selectAll"
          checked={selectedCards.length === 6}
          onChange={(e) => {
            if (e.target.checked) {
              // Select all cards
              setSelectedCards([
                "Purchase Orders",
                "Purchase Invoices",
                "Shipment Request",
                "Expenses Note",
                "Payment Voucher",
                "Payment Voucher Request",
              ]);
            } else {
              // Reset/clear all selections
              setSelectedCards([]);
            }
          }}
          className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
        />
        <label
          htmlFor="selectAll"
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {selectedCards.length === 7
            ? "Deselect All"
            : "Select All"}{" "}
          Stats Cards
        </label>
        {selectedCards.length > 0 && (
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            {selectedCards.length} selected
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Purchase Orders")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() => toggleCardSelection("Purchase Orders")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">📋</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  PURCHASE ORDER
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                44
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Purchase Invoices")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() =>
            toggleCardSelection("Purchase Invoices")
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">📄</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  PURCHASE INVOICE
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                28
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Shipment Request")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() =>
            toggleCardSelection("Shipment Request")
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">🚛</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  SHIPMENT REQUEST
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                12
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Expenses Note")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() => toggleCardSelection("Expenses Note")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">📊</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  EXPENSES NOTE
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                8
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Payment Voucher Request")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() =>
            toggleCardSelection("Payment Voucher Request")
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">📋</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  PAYMENT VOUCHER REQUEST
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                26
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 flex-1 min-w-[180px] max-w-[300px] ${
            selectedCards.includes("Payment Voucher")
              ? "ring-2 ring-purple-400 shadow-purple-200/50"
              : ""
          }`}
          onClick={() => toggleCardSelection("Payment Voucher")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <span className="h-4 w-4 text-sm">💳</span>
                <span className="text-xs uppercase tracking-wide font-medium">
                  PAYMENT VOUCHER
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                45
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PO Status Distribution Chart - Only show when Purchase Orders card is selected */}
      {selectedCards.includes("Purchase Orders") && (
        <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              PO STATUS DISTRIBUTION
            </h3>
          </div>

          <div className="flex items-center gap-6">
            {/* Left: Radial Bar Chart (Semi Circle) - VERTICAL */}
            <div
              className="relative"
              style={{ width: "300px", height: "400px" }}
            >
              <svg
                width="300"
                height="400"
                viewBox="0 0 300 400"
              >
                {(() => {
                  const segments = [
                    {
                      label: "Complete",
                      value: stats.complete,
                      color: "#2d1b69",
                    },
                    {
                      label: "Partial",
                      value: stats.partial,
                      color: "#5b3a9a",
                    },
                    {
                      label: "Outstanding",
                      value: stats.outstanding,
                      color: "#9a7fd6",
                    },
                  ];

                  const total = stats.total;
                  const radiusSizes = [180, 150, 120];

                  return segments.map((segment, index) => {
                    const radius = radiusSizes[index];
                    const percentage =
                      (segment.value / total) * 100;

                    // Calculate angles for this segment
                    let startAngle = 90;

                    // Calculate start angle by summing previous segments
                    for (let i = 0; i < index; i++) {
                      startAngle -=
                        (segments[i].value / total) * 180;
                    }

                    const angle = (segment.value / total) * 180;
                    const endAngle = startAngle - angle;

                    // Convert to radians
                    const startRad =
                      (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    // Calculate path for the segment (semi-circle from left)
                    const cx = 0;
                    const cy = 200;

                    const x1 = cx + radius * Math.cos(startRad);
                    const y1 = cy - radius * Math.sin(startRad);
                    const x2 = cx + radius * Math.cos(endRad);
                    const y2 = cy - radius * Math.sin(endRad);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const pathData = [
                      `M ${cx} ${cy}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                      `Z`,
                    ].join(" ");

                    // Calculate label position (inside the segment)
                    const midAngle =
                      (startAngle + endAngle) / 2;
                    const midRad = (midAngle * Math.PI) / 180;
                    // Use different offset based on radius size to keep labels inside
                    const labelRadius = radius * 0.4;
                    const labelX =
                      cx + labelRadius * Math.cos(midRad);
                    const labelY =
                      cy - labelRadius * Math.sin(midRad);

                    return (
                      <g
                        key={index}
                        style={{
                          cursor: "pointer",
                          transition:
                            "transform 0.3s ease, filter 0.3s ease",
                          transformOrigin: `${cx}px ${cy}px`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "scale(1.05)";
                          e.currentTarget.style.filter =
                            "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform =
                            "scale(1)";
                          e.currentTarget.style.filter = "none";
                        }}
                      >
                        <path
                          d={pathData}
                          fill={segment.color}
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                        >
                          <title>{`${segment.label}: ${percentage.toFixed(1)}%`}</title>
                        </path>

                        <text
                          x={labelX}
                          y={labelY}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontWeight="bold"
                          fontSize="18"
                          style={{
                            textShadow:
                              "1px 1px 2px rgba(0,0,0,0.3)",
                          }}
                        >
                          {`${percentage.toFixed(0)}%`}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* Central white circle */}
                <circle
                  cx="0"
                  cy="200"
                  r="25"
                  fill="white"
                  stroke="#e9d5ff"
                  strokeWidth="4"
                />
              </svg>
            </div>

            {/* Right: Labels with horizontal bars */}
            <div className="flex-1 space-y-3">
              {[
                {
                  label: "Complete",
                  value: stats.complete,
                  color: "#2d1b69",
                },
                {
                  label: "Partial",
                  value: stats.partial,
                  color: "#5b3a9a",
                },
                {
                  label: "Outstanding",
                  value: stats.outstanding,
                  color: "#9a7fd6",
                },
              ].map((item, index) => {
                const percentage =
                  (item.value / stats.total) * 100;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    {/* Horizontal connecting line */}
                    <div
                      className="w-8 h-0.5"
                      style={{ backgroundColor: item.color }}
                    />

                    {/* Label and percentage bar */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700 font-medium">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Progress bar container with liquid wave */}
                        <div
                          className="flex-1 relative overflow-visible"
                          style={{
                            height:
                              index === 0
                                ? "40px"
                                : index === 1
                                  ? "32px"
                                  : "26px",
                          }}
                        >
                          {/* Background track */}
                          <div className="absolute inset-0 bg-gray-200" />

                          {/* Progress bar fill with liquid wave effect */}
                          <div
                            className="h-full transition-all duration-700 ease-out relative overflow-visible"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                              boxShadow: `0 0 10px ${item.color}80`,
                            }}
                          >
                            {/* Liquid wave effect on top */}
                            <div
                              className="absolute top-0 left-0 w-full opacity-30"
                              style={{
                                height: "100%",
                                background:
                                  "rgba(255, 255, 255, 0.3)",
                                animation:
                                  "liquidWave 3s ease-in-out infinite",
                                clipPath:
                                  "polygon(0% 60%, 10% 55%, 20% 50%, 30% 48%, 40% 50%, 50% 55%, 60% 58%, 70% 55%, 80% 50%, 90% 48%, 100% 50%, 100% 100%, 0% 100%)",
                              }}
                            />

                            {/* Second wave layer for more depth */}
                            <div
                              className="absolute top-0 left-0 w-full opacity-20"
                              style={{
                                height: "100%",
                                background:
                                  "rgba(255, 255, 255, 0.4)",
                                animation:
                                  "liquidWave2 4s ease-in-out infinite",
                                animationDelay: "-1s",
                                clipPath:
                                  "polygon(0% 70%, 10% 65%, 20% 62%, 30% 60%, 40% 62%, 50% 68%, 60% 72%, 70% 68%, 80% 62%, 90% 60%, 100% 65%, 100% 100%, 0% 100%)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Percentage text */}
                        <span className="text-sm font-bold text-gray-800 min-w-[45px] text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Validation Distribution by PIC Chart - Only show when Purchase Invoices card is selected */}
      {selectedCards.includes("Purchase Invoices") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                VALIDATION DISTRIBUTION BY PIC
              </h3>
            </div>

            <div className="flex items-center gap-6">
              {/* Left: Radial Bar Chart (Semi Circle) - VERTICAL */}
              <div
                className="relative"
                style={{ width: "350px", height: "700px" }}
              >
                <svg
                  width="350"
                  height="700"
                  viewBox="0 0 350 700"
                >
                  {(() => {
                    const picData = [
                      { name: "NADYA", value: 19 },
                      { name: "STELLA", value: 16 },
                      { name: "VANNESA", value: 16 },
                      { name: "ERNI", value: 14 },
                      { name: "ELLVA", value: 9 },
                      { name: "DEWI", value: 9 },
                      { name: "SHEFANNY", value: 5 },
                      { name: "CHINTYA", value: 5 },
                      { name: "HELEN", value: 5 },
                      { name: "JESSICA", value: 2 },
                    ];

                    return picData.map((item, index) => {
                      // Different radius for each segment
                      const radiusSizes = [
                        250, 225, 200, 175, 150, 125, 100, 75,
                        50, 25,
                      ];
                      const radius = radiusSizes[index] || 125;

                      const purpleShades = [
                        "#2d1b69",
                        "#4c2a85",
                        "#5b3a9a",
                        "#6b4ba8",
                        "#2d1b69",
                        "#4c2a85",
                        "#5b3a9a",
                        "#6b4ba8",
                        "#2d1b69",
                        "#4c2a85",
                      ];

                      // Calculate angles for this segment
                      const total = picData.reduce(
                        (sum, d) => sum + d.value,
                        0,
                      );
                      let startAngle = 90;

                      // Calculate start angle by summing previous segments
                      for (let i = 0; i < index; i++) {
                        startAngle -=
                          (picData[i].value / total) * 180;
                      }

                      const angle = (item.value / total) * 180;
                      const endAngle = startAngle - angle;

                      // Convert to radians
                      const startRad =
                        (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;

                      // Calculate path for the segment (semi-circle from left)
                      const cx = 0;
                      const cy = 325;

                      const x1 =
                        cx + radius * Math.cos(startRad);
                      const y1 =
                        cy - radius * Math.sin(startRad);
                      const x2 = cx + radius * Math.cos(endRad);
                      const y2 = cy - radius * Math.sin(endRad);

                      const largeArcFlag = angle > 180 ? 1 : 0;

                      const pathData = [
                        `M ${cx} ${cy}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                        `Z`,
                      ].join(" ");

                      // Calculate label position
                      const midAngle =
                        (startAngle + endAngle) / 2;
                      const midRad = (midAngle * Math.PI) / 180;

                      // For small segments, show label outside with line
                      const isSmallSegment =
                        item.value < 15 || radius < 140;

                      let labelX,
                        labelY,
                        showLine = false,
                        lineEndX,
                        lineEndY,
                        elbowX,
                        elbowY;

                      if (isSmallSegment) {
                        // Line starts at segment edge
                        const lineStartRadius = radius - 3;
                        lineEndX =
                          cx +
                          lineStartRadius * Math.cos(midRad);
                        lineEndY =
                          cy -
                          lineStartRadius * Math.sin(midRad);

                        // Count position among small segments only
                        let smallSegmentIndex = 0;
                        for (let i = 0; i < index; i++) {
                          const checkRadius =
                            radiusSizes[i] || 100;
                          if (
                            picData[i].value < 15 ||
                            checkRadius < 140
                          ) {
                            smallSegmentIndex++;
                          }
                        }

                        // Fixed X position for all labels
                        const fixedLabelX = 260;
                        labelX = fixedLabelX;
                        labelY = 400 + smallSegmentIndex * 25;

                        // Horizontal line endpoint
                        elbowX = fixedLabelX - 5;
                        elbowY = labelY;

                        showLine = true;
                      } else {
                        // Position label inside
                        const labelRadius = radius * 0.65;
                        labelX =
                          cx + labelRadius * Math.cos(midRad);
                        labelY =
                          cy - labelRadius * Math.sin(midRad);
                      }

                      return (
                        <g
                          key={index}
                          style={{
                            cursor: "pointer",
                            transition:
                              "transform 0.3s ease, filter 0.3s ease",
                            transformOrigin: `${cx}px ${cy}px`,
                          }}
                          onClick={() =>
                            setSelectedPICForDetail(item.name)
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1.05)";
                            e.currentTarget.style.filter =
                              "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1)";
                            e.currentTarget.style.filter =
                              "none";
                          }}
                        >
                          <path
                            d={pathData}
                            fill={
                              purpleShades[
                                index % purpleShades.length
                              ]
                            }
                            stroke="#ffffff"
                            strokeWidth="3"
                          >
                            <title>{`${item.name}: ${item.value}%`}</title>
                          </path>

                          {showLine && (
                            <>
                              {/* Vertical line down from segment */}
                              <line
                                x1={lineEndX}
                                y1={lineEndY}
                                x2={lineEndX}
                                y2={labelY}
                                stroke="#6b4ba8"
                                strokeWidth="2"
                                style={{ opacity: 1 }}
                              />
                              {/* Horizontal line from vertical to label */}
                              <line
                                x1={lineEndX}
                                y1={labelY}
                                x2={elbowX}
                                y2={labelY}
                                stroke="#6b4ba8"
                                strokeWidth="2"
                                style={{ opacity: 1 }}
                              />
                              <circle
                                cx={lineEndX}
                                cy={lineEndY}
                                r="2.5"
                                fill={
                                  purpleShades[
                                    index % purpleShades.length
                                  ]
                                }
                              />
                            </>
                          )}

                          <text
                            x={labelX}
                            y={labelY}
                            fill={
                              isSmallSegment
                                ? "#6b4ba8"
                                : "white"
                            }
                            textAnchor={
                              isSmallSegment
                                ? "start"
                                : "middle"
                            }
                            dominantBaseline="central"
                            fontWeight="bold"
                            fontSize={
                              isSmallSegment ? "15" : "20"
                            }
                            style={{
                              textShadow: isSmallSegment
                                ? "none"
                                : "1px 1px 2px rgba(0,0,0,0.3)",
                            }}
                          >
                            {`${item.value.toFixed(0)}%`}
                          </text>
                        </g>
                      );
                    });
                  })()}

                  {/* Central white circle */}
                  <circle
                    cx="0"
                    cy="325"
                    r="30"
                    fill="white"
                    stroke="#e9d5ff"
                    strokeWidth="5"
                  />
                </svg>
              </div>

              {/* Right: Labels with horizontal bars */}
              <div className="flex-1 space-y-3">
                {[
                  { name: "NADYA", value: 19 },
                  { name: "STELLA", value: 16 },
                  { name: "VANNESA", value: 16 },
                  { name: "ERNI", value: 14 },
                  { name: "ELLVA", value: 9 },
                  { name: "DEWI", value: 9 },
                  { name: "SHEFANNY", value: 5 },
                  { name: "CHINTYA", value: 5 },
                  { name: "HELEN", value: 5 },
                  { name: "JESSICA", value: 2 },
                ].map((item, index) => {
                  const purpleShades = [
                    "#2d1b69",
                    "#4c2a85",
                    "#5b3a9a",
                    "#6b4ba8",
                    "#2d1b69",
                    "#4c2a85",
                    "#5b3a9a",
                    "#6b4ba8",
                    "#2d1b69",
                    "#4c2a85",
                  ];

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      {/* Horizontal connecting line */}
                      <div
                        className="w-8 h-0.5"
                        style={{
                          backgroundColor:
                            purpleShades[index % 10],
                        }}
                      />

                      {/* Label and percentage bar */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-700 font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Progress bar container */}
                          <div
                            className="flex-1 relative overflow-visible"
                            style={{
                              height:
                                index === 0
                                  ? "48px"
                                  : index === 1
                                    ? "40px"
                                    : index === 2
                                      ? "34px"
                                      : index === 3
                                        ? "28px"
                                        : index === 4
                                          ? "24px"
                                          : "20px",
                            }}
                          >
                            {/* Background track */}
                            <div className="absolute inset-0 bg-gray-200 rounded-sm" />

                            {/* Progress bar fill with liquid wave effect */}
                            <div
                              className="h-full transition-all duration-700 ease-out relative overflow-visible rounded-sm"
                              style={{
                                width: `${item.value}%`,
                                background: `linear-gradient(90deg, ${purpleShades[index % 10]}, ${purpleShades[index % 10]}dd)`,
                                boxShadow: `0 0 10px ${purpleShades[index % 10]}80`,
                              }}
                            >
                              {/* Liquid wave effect on top */}
                              <div
                                className="absolute top-0 left-0 w-full opacity-30"
                                style={{
                                  height: "100%",
                                  background:
                                    "rgba(255, 255, 255, 0.3)",
                                  animation:
                                    "liquidWave 3s ease-in-out infinite",
                                  clipPath:
                                    "polygon(0% 60%, 10% 55%, 20% 50%, 30% 48%, 40% 50%, 50% 55%, 60% 58%, 70% 55%, 80% 50%, 90% 48%, 100% 50%, 100% 100%, 0% 100%)",
                                }}
                              />

                              {/* Second wave layer for more depth */}
                              <div
                                className="absolute top-0 left-0 w-full opacity-20"
                                style={{
                                  height: "100%",
                                  background:
                                    "rgba(255, 255, 255, 0.4)",
                                  animation:
                                    "liquidWave2 4s ease-in-out infinite",
                                  animationDelay: "-1s",
                                  clipPath:
                                    "polygon(0% 70%, 10% 65%, 20% 62%, 30% 60%, 40% 62%, 50% 68%, 60% 72%, 70% 68%, 80% 62%, 90% 60%, 100% 65%, 100% 100%, 0% 100%)",
                                }}
                              />
                            </div>
                          </div>

                          {/* Percentage text */}
                          <span className="text-sm font-bold text-gray-800 min-w-[45px] text-right">
                            {item.value.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-purple-100">
              <p className="text-[10px] text-gray-400 text-right">
                Source: Purchase Invoice Validation System 2025
              </p>
            </div>
          </Card>

          {/* Detail Statistics Card */}
          <Card className="p-6 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-purple-900">DETAIL</h3>
              </div>
              {selectedPICForDetail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPICForDetail(null)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {selectedPICForDetail ? (
              <div className="space-y-4">
                {/* Doc Type Filter Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-purple-900">
                    Doc Type:
                  </span>
                  {[
                    "all",
                    "REIMBURSEMENT",
                    "BUNKER",
                    "FRESH WATER",
                    "FPP",
                    "CREDIT",
                    "PAID",
                  ].map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={
                        detailDocTypeFilter === type
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setDetailDocTypeFilter(type)
                      }
                      className={
                        detailDocTypeFilter === type
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }
                    >
                      {type === "all" ? "ALL" : type}
                    </Button>
                  ))}
                </div>

                {/* PIC Name Header */}
                <div className="flex items-center gap-2 p-3 bg-purple-100 rounded-lg">
                  <User className="h-5 w-5 text-purple-700" />
                  <span className="font-bold text-purple-900 text-lg">
                    {selectedPICForDetail}
                  </span>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Total PI */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total PI
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                      {selectedPICForDetail === "NADYA"
                        ? 28
                        : selectedPICForDetail === "STELLA"
                          ? 24
                          : selectedPICForDetail === "VANNESA"
                            ? 23
                            : selectedPICForDetail === "ERNI"
                              ? 20
                              : 15}
                    </span>
                  </div>

                  {/* Received */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Received
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      {selectedPICForDetail === "NADYA"
                        ? 26
                        : selectedPICForDetail === "STELLA"
                          ? 22
                          : selectedPICForDetail === "VANNESA"
                            ? 21
                            : selectedPICForDetail === "ERNI"
                              ? 18
                              : 13}
                    </span>
                  </div>

                  {/* Validated */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Validated
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-green-900">
                      {selectedPICForDetail === "NADYA"
                        ? 24
                        : selectedPICForDetail === "STELLA"
                          ? 20
                          : selectedPICForDetail === "VANNESA"
                            ? 19
                            : selectedPICForDetail === "ERNI"
                              ? 16
                              : 11}
                    </span>
                  </div>

                  {/* Pending Validation */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Pending Validation
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-orange-900">
                      {selectedPICForDetail === "NADYA"
                        ? 2
                        : selectedPICForDetail === "STELLA"
                          ? 2
                          : selectedPICForDetail === "VANNESA"
                            ? 2
                            : selectedPICForDetail === "ERNI"
                              ? 2
                              : 2}
                    </span>
                  </div>

                  {/* Pending Case */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Pending Case
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-900">
                      {selectedPICForDetail === "NADYA"
                        ? 1
                        : selectedPICForDetail === "STELLA"
                          ? 1
                          : selectedPICForDetail === "VANNESA"
                            ? 1
                            : selectedPICForDetail === "ERNI"
                              ? 1
                              : 1}
                    </span>
                  </div>

                  {/* Submitted */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Submitted
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-900">
                      {selectedPICForDetail === "NADYA"
                        ? 22
                        : selectedPICForDetail === "STELLA"
                          ? 18
                          : selectedPICForDetail === "VANNESA"
                            ? 17
                            : selectedPICForDetail === "ERNI"
                              ? 14
                              : 9}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click on a PIC segment to view details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* AP Note Charts - Only show when Expenses Note card is selected */}
      {selectedCards.includes("Expenses Note") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Recap Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                AP Note Creation - Monthly Recap
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e9d5ff"
                />
                <XAxis dataKey="month" stroke="#7c3aed" />
                <YAxis stroke="#7c3aed" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#9333ea"
                  name="AP Notes Created"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* PIC Activity Pie Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                PIC Activity Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={picActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                  cursor="pointer"
                >
                  {picActivityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* PIC Detail List - shows when a PIC is selected */}
            {selectedPIC && (
              <div className="mt-6 border-t pt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-purple-900">
                          {selectedPIC.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          PIC Name
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedPIC.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Documents
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm text-gray-700">
                    Sample Documents:
                  </h4>
                  {[1, 2, 3].map((item, index) => (
                    <Card
                      key={index}
                      className="p-3 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">
                            AP-{selectedPIC.name}-
                            {String(index + 1).padStart(3, "0")}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          2025-10-
                          {String(20 + index).padStart(2, "0")}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* PVR Charts - Only show when Payment Voucher Request card is selected */}
      {selectedCards.includes("Payment Voucher Request") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Recap Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                PVR Creation - Monthly Recap
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pvrMonthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e9d5ff"
                />
                <XAxis dataKey="month" stroke="#7c3aed" />
                <YAxis stroke="#7c3aed" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#9333ea"
                  name="PVRs Created"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* PIC Activity Pie Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                PIC Activity Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pvrPicActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePVRPieClick}
                  cursor="pointer"
                >
                  {pvrPicActivityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* PIC Detail List */}
            {selectedPVRPIC && (
              <div className="mt-6 border-t pt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-purple-900">
                          {selectedPVRPIC.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          PIC Name
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-purple-900">
                        {selectedPVRPIC.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total PVRs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm text-gray-700">
                    PVRs Created:
                  </h4>
                  {mockPVRData
                    .filter(
                      (item) =>
                        item.createdBy === selectedPVRPIC.name,
                    )
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="p-3 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">
                              {item.pvrNo}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateToDDMMYYYY(item.pvrDate)}
                          </span>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* PV Charts - Only show when Payment Voucher card is selected */}
      {selectedCards.includes("Payment Voucher") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Payment Voucher Recap Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                Monthly Payment Voucher Recap
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pvMonthlyRecapData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e9d5ff"
                />
                <XAxis dataKey="month" stroke="#7c3aed" />
                <YAxis stroke="#7c3aed" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#9333ea"
                  name="PVs Created"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* PV PIC Activity Pie Chart */}
          <Card className="p-6 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">
                PIC Activity Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pvPicActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePVPieClick}
                  cursor="pointer"
                >
                  {pvPicActivityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* PV PIC Detail List */}
            {selectedPVPIC && (
              <div className="mt-6 border-t pt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-purple-900">
                          {selectedPVPIC.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          PIC Name
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-purple-900">
                        {selectedPVPIC.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total PVs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-2">
                    PV Details:
                  </div>
                  {mockPVData
                    .filter(
                      (pv) =>
                        pv.createdBy === selectedPVPIC.name,
                    )
                    .map((pv) => (
                      <Card
                        key={pv.id}
                        className="p-3 border-purple-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-purple-900">
                              {pv.pvNo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pv.supplierName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {pv.status}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex-1 min-w-[200px]">
        <h4 className="text-lg font-semibold text-purple-900 mb-4">
          Recent Activity
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">
                  PO
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  New Purchase Order Created
                </p>
                <p className="text-sm text-gray-500">
                  PO-2024-001 - Office Supplies
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              2 hours ago
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">
                  PI
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Invoice Processed
                </p>
                <p className="text-sm text-gray-500">
                  INV-2024-089 - $1,250.00
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              4 hours ago
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">
                  PV
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Payment Voucher Approved
                </p>
                <p className="text-sm text-gray-500">
                  PV-2024-045 - $850.00
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              6 hours ago
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-4">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm font-medium text-purple-900">
                New PO
              </p>
            </div>
          </button>

          <button className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🧾</div>
              <p className="text-sm font-medium text-purple-900">
                Process Invoice
              </p>
            </div>
          </button>

          <button className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">💳</div>
              <p className="text-sm font-medium text-purple-900">
                Payment Request
              </p>
            </div>
          </button>

          <button className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-purple-900">
                View Reports
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}