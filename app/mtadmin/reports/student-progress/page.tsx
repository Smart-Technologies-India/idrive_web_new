"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { DatePicker, Table, Tag, Row, Col, Button, Statistic } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { AntDesignBookOutlined, MaterialSymbolsCalendarClockRounded } from "@/components/icons";

const { RangePicker } = DatePicker;

const REPORT_TITLE = "Student Progress Report";

interface Session {
  id: number;
  status: string;
  attended: boolean;
}

interface Booking {
  id: number;
  customerName: string;
  customerContact: string;
  courseName: string;
  sessions: Session[];
}

interface ProgressRow {
  id: number;
  customerName: string;
  customerContact: string;
  courseName: string;
  totalSessions: number;
  completedSessions: number;
  attendedSessions: number;
  progressPercent: number;
}

const GET_ALL_BOOKING = `
  query GetAllBooking($where: BookingWhereInput) {
    getAllBooking(where: $where) {
      id
      customerName
      customerContact
      courseName
      sessions {
        id
        status
        attended
      }
    }
  }
`;

export default function StudentProgressPage() {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const { data: rawData, isLoading } = useQuery<Booking[]>({
    queryKey: ["studentProgressReport", schoolId],
    queryFn: async () => {
      const res = await ApiCall<{ getAllBooking: Booking[] }>({
        query: GET_ALL_BOOKING,
        variables: { where: { schoolId } },
      });
      return res.data.getAllBooking || [];
    },
    enabled: !!schoolId,
  });

  const progressData: ProgressRow[] = (rawData || []).map((b) => {
    const total = b.sessions?.length || 0;
    const completed = b.sessions?.filter((s) => s.status === "COMPLETED").length || 0;
    const attended = b.sessions?.filter((s) => s.attended).length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      id: b.id,
      customerName: b.customerName,
      customerContact: b.customerContact,
      courseName: b.courseName,
      totalSessions: total,
      completedSessions: completed,
      attendedSessions: attended,
      progressPercent: progress,
    };
  });

  const columns = [
    { title: "Booking ID", dataIndex: "id", key: "id" },
    { title: "Student Name", dataIndex: "customerName", key: "customerName" },
    { title: "Contact", dataIndex: "customerContact", key: "customerContact" },
    { title: "Course", dataIndex: "courseName", key: "courseName" },
    { title: "Total Sessions", dataIndex: "totalSessions", key: "totalSessions" },
    {
      title: "Completed",
      dataIndex: "completedSessions",
      key: "completedSessions",
      render: (val: number) => <Tag color="green">{val}</Tag>,
    },
    {
      title: "Attended",
      dataIndex: "attendedSessions",
      key: "attendedSessions",
      render: (val: number) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Progress %",
      dataIndex: "progressPercent",
      key: "progressPercent",
      render: (val: number) => {
        const color = val >= 75 ? "green" : val >= 50 ? "gold" : "red";
        return <Tag color={color}>{val}%</Tag>;
      },
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
    a.download = `student-progress-${dayjs().format("YYYY-MM-DD")}.csv`;
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
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm">
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
          <div className="flex items-center gap-2">
            <MaterialSymbolsCalendarClockRounded className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Date Range:</span>
          </div>
          <RangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val as [Dayjs | null, Dayjs | null])}
          />
        </div>
      </div>

      <div className="report-content">
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}>
            <div className="bg-linear-to-r from-teal-500 to-cyan-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-teal-100">Students Being Tracked</span>}
                value={progressData.length}
                prefix="📊"
                valueStyle={{ color: "white", fontSize: "32px", fontWeight: "bold" }}
              />
            </div>
          </Col>
        </Row>

        <Table
          dataSource={progressData}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: true }}
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
        />
      </div>
    </div>
  );
}
