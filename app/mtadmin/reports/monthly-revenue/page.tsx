"use client";

import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { Table, Tag, Row, Col, Button, Statistic } from "antd";
import dayjs from "dayjs";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { AntDesignBookOutlined, MaterialSymbolsCalendarClockRounded } from "@/components/icons";

const REPORT_TITLE = "Monthly Revenue Report";

interface Payment {
  id: number;
  amount: number;
  createdAt: string;
}

interface MonthRow {
  month: string;
  revenue: number;
  growth: number | null;
}

const GET_ALL_PAYMENT = `
  query GetAllPayment($where: PaymentWhereInput) {
    getAllPayment(where: $where) {
      id
      amount
      createdAt
    }
  }
`;

export default function MonthlyRevenuePage() {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");

  const { data: rawData, isLoading } = useQuery<Payment[]>({
    queryKey: ["monthlyRevenueReport", schoolId],
    queryFn: async () => {
      const res = await ApiCall<{ getAllPayment: Payment[] }>({
        query: GET_ALL_PAYMENT,
        variables: { where: { schoolId } },
      });
      return res.data.getAllPayment || [];
    },
    enabled: !!schoolId,
  });

  const monthlyMap = new Map<string, number>();
  (rawData || []).forEach((p) => {
    const month = dayjs(p.createdAt).format("MMM YYYY");
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + (p.amount || 0));
  });

  const monthRows: MonthRow[] = Array.from(monthlyMap.entries())
    .sort((a, b) => dayjs(a[0], "MMM YYYY").valueOf() - dayjs(b[0], "MMM YYYY").valueOf())
    .map(([month, revenue], idx, arr) => ({
      month,
      revenue,
      growth: idx === 0 ? null : arr[idx - 1][1] > 0 ? Math.round(((revenue - arr[idx - 1][1]) / arr[idx - 1][1]) * 100) : null,
    }));

  const totalRevenue = monthRows.reduce((s, r) => s + r.revenue, 0);
  const avgMonthly = monthRows.length > 0 ? Math.round(totalRevenue / monthRows.length) : 0;

  const columns = [
    { title: "Month", dataIndex: "month", key: "month" },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: "Growth",
      dataIndex: "growth",
      key: "growth",
      render: (val: number | null) => {
        if (val === null) return <Tag color="blue">Baseline</Tag>;
        const color = val > 0 ? "green" : val < 0 ? "red" : "default";
        return <Tag color={color}>{val > 0 ? "+" : ""}{val}%</Tag>;
      },
    },
  ];

  function handleExport(exportAll = false) {
    const table = document.querySelector(".report-content table") as HTMLTableElement;
    if (!table) return;
    const rows = exportAll ? Array.from(table.querySelectorAll("tr")) : Array.from(table.querySelectorAll("tr"));
    const csv = rows
      .map((r) =>
        Array.from(r.querySelectorAll("th, td"))
          .map((c) => `"${(c.textContent || "").replace(/₹/g, "")}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-revenue-${dayjs().format("YYYY-MM-DD")}.csv`;
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
          <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center text-white text-sm">
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
          <span className="text-sm font-medium text-gray-600">All time monthly revenue breakdown</span>
        </div>
      </div>

      <div className="report-content">
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}>
            <div className="bg-linear-to-r from-lime-500 to-green-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-lime-100">Total Revenue</span>}
                value={totalRevenue}
                prefix="₹"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-green-100">Average Monthly</span>}
                value={avgMonthly}
                prefix="₹"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <Statistic
                title={<span className="text-blue-100">Months Tracked</span>}
                value={monthRows.length}
                prefix="📈"
                valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              />
            </div>
          </Col>
        </Row>

        <Table
          dataSource={monthRows}
          columns={columns}
          rowKey="month"
          loading={isLoading}
          scroll={{ x: true }}
          pagination={{ defaultPageSize: 12, showSizeChanger: true, pageSizeOptions: ["10", "12", "25", "50"] }}
        />
      </div>
    </div>
  );
}
