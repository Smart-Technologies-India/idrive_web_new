"use client";

import { Card, Button } from "antd";
import {
  Fa6RegularFileLines,
  AntDesignEyeOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const Reports = () => {
  const router = useRouter();

  const reportCards: ReportCard[] = [
     {
      id: "students",
      title: "Student Report List",
      description: "View comprehensive reports on student activities and performance",
      icon: <span className="text-3xl">🧑‍🎓</span>,
      color: "bg-blue-500",
    },
    {
      id: "student-join",
      title: "Student Enrollment Report",
      description: "View students who joined between specific dates",
      icon: <span className="text-3xl">👥</span>,
      color: "bg-blue-500",
    },
    {
      id: "car-training",
      title: "Car Training Report",
      description: "View student training on particular car within date range",
      icon: <span className="text-3xl">🚗</span>,
      color: "bg-green-500",
    },
    {
      id: "attendance",
      title: "Daily Attendance Report",
      description: "Day and car wise student attendance tracking",
      icon: <span className="text-3xl">✅</span>,
      color: "bg-purple-500",
    },
    {
      id: "payment-collection",
      title: "Payment Collection Report",
      description: "Track payment collections between date range",
      icon: <span className="text-3xl">💵</span>,
      color: "bg-orange-500",
    },
    {
      id: "driver-performance",
      title: "Driver Performance Report",
      description: "Analyze driver activity and session statistics",
      icon: <span className="text-3xl">👨‍✈️</span>,
      color: "bg-indigo-500",
    },
    {
      id: "course-completion",
      title: "Course Completion Report",
      description: "Students who completed courses in date range",
      icon: <span className="text-3xl">🎓</span>,
      color: "bg-emerald-500",
    },
    {
      id: "revenue-analysis",
      title: "Revenue Analysis Report",
      description: "Revenue breakdown by course, car, and payment method",
      icon: <span className="text-3xl">💰</span>,
      color: "bg-amber-500",
    },
    {
      id: "pending-payments",
      title: "Pending Payments Report",
      description: "Track outstanding and pending payments",
      icon: <span className="text-3xl">⏳</span>,
      color: "bg-red-500",
    },
    {
      id: "car-utilization",
      title: "Car Utilization Report",
      description: "Analyze which cars are being used most frequently",
      icon: <span className="text-3xl">🚙</span>,
      color: "bg-cyan-500",
    },
    {
      id: "session-cancellation",
      title: "Session Cancellation Report",
      description: "View cancelled sessions with reasons and trends",
      icon: <span className="text-3xl">❌</span>,
      color: "bg-pink-500",
    },
    {
      id: "license-applications",
      title: "License Applications Report",
      description: "Track license application status and approvals",
      icon: <span className="text-3xl">📄</span>,
      color: "bg-violet-500",
    },
    {
      id: "peak-hours",
      title: "Peak Hours Analysis",
      description: "Identify busiest time slots and days for bookings",
      icon: <span className="text-3xl">⏰</span>,
      color: "bg-rose-500",
    },
    {
      id: "student-progress",
      title: "Student Progress Report",
      description: "Track individual student learning progress and milestones",
      icon: <span className="text-3xl">📊</span>,
      color: "bg-teal-500",
    },
    {
      id: "monthly-revenue",
      title: "Monthly Revenue Comparison",
      description: "Compare revenue across different months",
      icon: <span className="text-3xl">📈</span>,
      color: "bg-lime-500",
    },
    {
      id: "booking-conversion",
      title: "Booking Conversion Report",
      description: "Analyze booking to completion conversion rates",
      icon: <span className="text-3xl">🎯</span>,
      color: "bg-fuchsia-500",
    },
    {
      id: "active-students",
      title: "Active Students Report",
      description: "View currently active students with ongoing sessions",
      icon: <span className="text-3xl">🔥</span>,
      color: "bg-sky-500",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Fa6RegularFileLines className="text-2xl text-white" />
              </div>
              Reports
            </h1>
            <p className="text-gray-600 text-lg">
              Generate and view various reports for your driving school
            </p>
          </div>
        
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportCards.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
              hoverable
              style={{ padding: "10px" }}
            >
              <div className="text-center">
                <div
                  className={`${report.color} bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <div className={`${report.color.replace("bg-", "text-")}`}>
                    {report.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 min-h-10">
                  {report.description}
                </p>
                <Button
                  type="primary"
                  icon={<AntDesignEyeOutlined />}
                  onClick={() => router.push(`/mtadmin/reports/${report.id}`)}
                  className="w-full"
                  size="large"
                >
                  View Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
