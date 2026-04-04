"use client";

import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { Table, Tag, Row, Col, Button, Statistic } from "antd";
import dayjs from "dayjs";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { AntDesignBookOutlined, MaterialSymbolsCalendarClockRounded } from "@/components/icons";

const REPORT_TITLE = "Booking Conversion Report";

interface Session {
  id: number;
  status: string;
}

interface Booking {
  id: number;
  status: string;
  sessions: Session[];
}

interface StatusRow {
  status: string;
  count: number;
  percentage: number;
}

const GET_ALL_BOOKING = `
  query GetAllBooking($where: BookingWhereInput) {
    getAllBooking(where: $where) {
      id
      status
      sessions {
        id
        status
      }
    }
  }
`;

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "green",
  PENDING: "orange",
  CANCELLED: "red",
};

export default function BookingConversionPage() {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");

  const { data: rawData, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookingConversionReport", schoolId],
    queryFn: async () => {
      const res = await ApiCall<{ getAllBooking: Booking[] }>({
        query: GET_ALL_BOOKING,
        variables: { where: { schoolId } },
      });
      return res.data.getAllBooking || [];
    },
    enabled: !!schoolId,
  });

  const total = rawData?.length || 0;

  const statusMap = new Map<string, number>();
  (rawData || []).forEach((b) => {
    statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1);
  });

  const statusData: StatusRow[] = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const completedCount = statusMap.get("COMPLETED") || 0;
  const cancelledCount = statusMap.get("CANCELLED") || 0;
  const pendingCount = statusMap.get("PENDING") || 0;
  const conversionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const cancellationRate = total > 0 ? Math.round((cancelledCount / total) * 100) : 0;

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string) => <Tag color={STATUS_COLOR[val] || "default"}>{val}</Tag>,
    },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (val: number) => `${val}%`,
    },
  ];

  function handleExport(exportAll = false) {
    const table = document.querySelector(".report-content table") as HTMLTableElement;
    if (!table) return;
    const rows = exportAll ? Array.from(table.querySelectorAll("tr")) : Array.from(table.querySelectorAll("tr"));
    const csv = rows.map((r) => Array.from(r.querySelectorAll("th, td")).map((c) => `"${c.textContent}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-conversion-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Fa6SolidArrowLeftLong />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-fuchsia-500 rounded-lg flex items-center justify-center text-white text-sm">
            <AntDesignBookOutlined />
          </div>
          <h1 className="text-xl font-bold text-gray-800">{REPORT_TITLE}</h1>
        </div>
        <Button icon={<AntDesignBookOutlined />} onClick={() => handleExport(false)}>
          Export CSV
        </Button>
        <Button icon={<AntDesignBookOutlined />} onClick={() => handleExport(true)} className="ml-2">
          Export All
        </Button>
      </div>

      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <MaterialSymbolsCalendarClockRounded className="text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Booking status breakdown and conversion analysis</span>
        </div>
      </div>

      <div className="report-content">
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}>
            <div className="bg-linear-to-r from-fuchsia-500 to-pink-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-fuchsia-100">Total Bookings</span>}
                value={total}
                prefix="🎯"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-green-100">Conversion Rate</span>}
                value={conversionRate}
                suffix="%"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="bg-linear-to-r from-red-500 to-rose-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-red-100">Cancellation Rate</span>}
                value={cancellationRate}
                suffix="%"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="bg-linear-to-r from-orange-500 to-amber-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-orange-100">Pending</span>}
                value={pendingCount}
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
        </Row>

        <Table
          dataSource={statusData}
          columns={columns}
          rowKey="status"
          loading={isLoading}
          scroll={{ x: true }}
          pagination={false}
        />
      </div>
    </div>
  );
}
