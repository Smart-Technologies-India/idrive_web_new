"use client";

import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { Table, Tag, Row, Col, Button, Statistic } from "antd";
import dayjs from "dayjs";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { AntDesignBookOutlined, MaterialSymbolsCalendarClockRounded } from "@/components/icons";

const REPORT_TITLE = "Active Students Report";

interface Session {
  id: number;
  sessionDate: string;
  status: string;
  attended: boolean;
}

interface Booking {
  id: number;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  courseName: string;
  sessions: Session[];
}

const GET_ALL_BOOKING = `
  query GetAllBooking($where: BookingWhereInput) {
    getAllBooking(where: $where) {
      id
      customerName
      customerContact
      customerEmail
      courseName
      sessions {
        id
        sessionDate
        status
        attended
      }
    }
  }
`;

export default function ActiveStudentsPage() {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");

  const { data: rawData, isLoading } = useQuery<Booking[]>({
    queryKey: ["activeStudentsReport", schoolId],
    queryFn: async () => {
      const res = await ApiCall<{ getAllBooking: Booking[] }>({
        query: GET_ALL_BOOKING,
        variables: { where: { schoolId, status: "PENDING" } },
      });
      return res.data.getAllBooking || [];
    },
    enabled: !!schoolId,
  });

  const today = dayjs();
  const activeStudents = (rawData || []).filter((b) =>
    b.sessions?.some((s) => dayjs(s.sessionDate).isAfter(today.subtract(7, "day")))
  );

  const columns = [
    { title: "Booking ID", dataIndex: "id", key: "id" },
    { title: "Student Name", dataIndex: "customerName", key: "customerName" },
    { title: "Contact", dataIndex: "customerContact", key: "customerContact" },
    { title: "Email", dataIndex: "customerEmail", key: "customerEmail" },
    { title: "Course", dataIndex: "courseName", key: "courseName" },
    {
      title: "Total Sessions",
      key: "totalSessions",
      render: (_: unknown, record: Booking) => record.sessions?.length || 0,
    },
    {
      title: "Completed",
      key: "completedSessions",
      render: (_: unknown, record: Booking) => {
        const count = record.sessions?.filter((s) => s.status === "COMPLETED").length || 0;
        return <Tag color="green">{count}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="blue">ACTIVE</Tag>,
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
    a.download = `active-students-${dayjs().format("YYYY-MM-DD")}.csv`;
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
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-sm">
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
          <span className="text-sm font-medium text-gray-600">Students with sessions in the last 7 days</span>
        </div>
      </div>

      <div className="report-content">
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}>
            <div className="bg-linear-to-r from-sky-500 to-blue-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-sky-100">Currently Active Students</span>}
                value={activeStudents.length}
                prefix="🔥"
                valueStyle={{ color: "white", fontSize: "32px", fontWeight: "bold" }}
              />
            </div>
          </Col>
        </Row>

        <Table
          dataSource={activeStudents}
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
