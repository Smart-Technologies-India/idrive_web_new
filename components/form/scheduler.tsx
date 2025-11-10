"use client";
import { useState, useMemo } from "react";
import { DatePicker, Table, Tag, Pagination, Button, Tooltip, Select, Tabs } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  CalendarOutlined,
  CarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";

// Time slots divided into periods
const TIME_SLOTS = {
  morning: ["07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00"],
  afternoon: ["12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"],
  evening: ["17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"]
};

const ALL_SLOTS = [...TIME_SLOTS.morning, ...TIME_SLOTS.afternoon, ...TIME_SLOTS.evening];

interface Booking {
  id: string;
  slot: string;
  customerName: string;
  status: "booked" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
}

interface Car {
  id: string;
  name: string;
  model: string;
  registrationNumber: string;
  status: "active" | "maintenance" | "inactive";
  bookings: Booking[];
  holidaySlots?: string[];
  nextFreeDate?: string;
}

// Mock data
const generateMockCars = (): Car[] => {
  const cars: Car[] = [];
  for (let i = 1; i <= 25; i++) {
    const models = ["Toyota Camry", "Honda Civic", "Hyundai Creta", "Maruti Swift", "Mahindra XUV"];
    const statuses: ("active" | "maintenance" | "inactive")[] = ["active", "active", "active", "maintenance", "active"];
    
    const bookings: Booking[] = [];
    const numBookings = Math.floor(Math.random() * 5);
    for (let j = 0; j < numBookings; j++) {
      const randomSlot = ALL_SLOTS[Math.floor(Math.random() * ALL_SLOTS.length)];
      const daysBooked = Math.floor(Math.random() * 5) + 1;
      const endDate = dayjs().add(daysBooked, 'day');
      
      bookings.push({
        id: `booking-${i}-${j}`,
        slot: randomSlot,
        customerName: `Customer ${j + 1}`,
        status: "booked",
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      });
    }

    const nextFreeDate = bookings.length > 0
      ? bookings.reduce((latest, b) => 
          dayjs(b.endDate || dayjs()).isAfter(dayjs(latest)) ? b.endDate! : latest,
          bookings[0].endDate || dayjs().format('YYYY-MM-DD')
        )
      : undefined;

    cars.push({
      id: `car-${i}`,
      name: `Car ${i}`,
      model: models[i % models.length],
      registrationNumber: `TN${String(i).padStart(2, "0")}AB${String(1000 + i).slice(-4)}`,
      status: statuses[i % statuses.length],
      bookings,
      holidaySlots: i % 7 === 0 ? ["07:00-08:00", "08:00-09:00"] : [],
      nextFreeDate,
    });
  }
  return cars;
};

const CarScheduler = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon" | "evening">("morning");

  const allCars = useMemo(() => generateMockCars(), []);

  const filteredCars = useMemo(() => {
    if (statusFilter === "all") return allCars;
    return allCars.filter(car => car.status === statusFilter);
  }, [allCars, statusFilter]);

  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredCars.slice(start, end);
  }, [filteredCars, currentPage, pageSize]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const isSlotBooked = (car: Car, slot: string): boolean => {
    return car.bookings.some(booking => booking.slot === slot && booking.status === "booked");
  };

  const isSlotOnHoliday = (car: Car, slot: string): boolean => {
    return car.holidaySlots?.includes(slot) || false;
  };

  const getBookingInfo = (car: Car, slot: string): Booking | null => {
    return car.bookings.find(booking => booking.slot === slot) || null;
  };

  const getAvailableSlotCount = (car: Car): number => {
    return ALL_SLOTS.filter(slot => 
      !isSlotBooked(car, slot) && !isSlotOnHoliday(car, slot)
    ).length;
  };

  const renderSlotCell = (car: Car, slot: string) => {
    const isBooked = isSlotBooked(car, slot);
    const isHoliday = isSlotOnHoliday(car, slot);
    const booking = getBookingInfo(car, slot);

    if (isHoliday) {
      return (
        <Tooltip title="Holiday - Slot Blocked">
          <div className="w-full h-16 flex flex-col items-center justify-center bg-gray-300 rounded cursor-not-allowed">
            <span className="text-2xl text-gray-600">🚫</span>
            <span className="text-xs text-gray-700 font-medium mt-1">Holiday</span>
          </div>
        </Tooltip>
      );
    }

    if (isBooked && booking) {
      const freeDate = booking.endDate ? dayjs(booking.endDate).format('DD MMM') : '?';
      const freeDateFull = booking.endDate ? dayjs(booking.endDate).format('YYYY-MM-DD') : '';
      
      return (
        <Tooltip 
          title={
            <div className="text-sm">
              <div className="font-semibold">{booking.customerName}</div>
              <div className="text-gray-300">Free from: {freeDate}</div>
              <div className="text-yellow-300 text-xs mt-1">Click to rebook from {freeDate}</div>
            </div>
          }
        >
          <div 
            className="w-full h-16 flex flex-col items-center justify-center bg-red-50 border-2 border-red-300 rounded cursor-pointer hover:bg-red-100 transition-all"
            onClick={() => {
              const bookingUrl = `/mtadmin/booking?carId=${car.id}&carName=${encodeURIComponent(car.name)}&slot=${encodeURIComponent(slot)}&minDate=${freeDateFull}`;
              router.push(bookingUrl);
            }}
          >
            <CloseCircleOutlined className="text-red-600 text-xl" />
            <span className="text-sm text-red-700 font-bold mt-1">
              {freeDate}
            </span>
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Available - Click to book">
        <div 
          className="w-full h-16 flex flex-col items-center justify-center bg-green-50 border-2 border-green-400 rounded cursor-pointer hover:bg-green-200 hover:scale-105 transition-all"
          onClick={() => {
            const bookingUrl = `/mtadmin/booking?carId=${car.id}&carName=${encodeURIComponent(car.name)}&slot=${encodeURIComponent(slot)}`;
            router.push(bookingUrl);
          }}
        >
          <CheckCircleOutlined className="text-green-600 text-xl" />
          <span className="text-sm text-green-700 font-bold mt-1">Free</span>
        </div>
      </Tooltip>
    );
  };

  // Get current time slots based on active tab
  const currentSlots = TIME_SLOTS[activeTab];

  const columns: ColumnsType<Car> = [
    {
      title: "Car Details",
      key: "carInfo",
      fixed: "left",
      width: 220,
      render: (_, car) => (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2">
            <CarOutlined className="text-blue-600 text-xl" />
            <span className="font-bold text-lg text-gray-900">{car.name}</span>
          </div>
          <div className="text-base text-gray-700 font-medium">{car.model}</div>
          <div className="text-sm text-gray-500">{car.registrationNumber}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Tooltip title={
              car.status === "active" 
                ? "Car is operational and available for booking" 
                : car.status === "maintenance" 
                ? "Car is under maintenance/repair" 
                : "Car is not in service"
            }>
              <Tag 
                color={car.status === "active" ? "green" : car.status === "maintenance" ? "orange" : "red"}
                className="text-xs px-2 py-1 m-0 cursor-help font-medium"
              >
                {car.status === "active" ? "✓ ACTIVE" : car.status === "maintenance" ? "🔧 MAINTENANCE" : "✗ INACTIVE"}
              </Tag>
            </Tooltip>
            <span className="text-sm">
              <span className="text-green-600 font-bold">{getAvailableSlotCount(car)}</span>
              <span className="text-gray-500 font-medium">/15 free</span>
            </span>
          </div>
        </div>
      ),
    },
    // Time slot columns - only show slots for active tab
    ...currentSlots.map((slot) => ({
      title: (
        <div className="text-center py-1">
          <div className="font-bold text-base">{slot.split('-')[0]}</div>
          <div className="text-xs text-gray-500 font-normal">
            {parseInt(slot) < 12 ? 'AM' : 'PM'}
          </div>
        </div>
      ),
      key: slot,
      width: 110,
      render: (_: unknown, car: Car) => renderSlotCell(car, slot),
    })),
  ];

  // Stats calculations
  const totalCars = filteredCars.length;
  const activeCars = filteredCars.filter(car => car.status === "active").length;
  const totalSlots = filteredCars.length * ALL_SLOTS.length;
  const bookedSlots = filteredCars.reduce(
    (sum, car) => sum + car.bookings.filter(b => b.status === "booked").length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CarOutlined className="text-blue-600" />
                Car Booking Schedule
              </h1>
              <p className="text-gray-600 mt-1">View and manage car availability across all time slots</p>
            </div>
            <Button 
              type="primary" 
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleRefresh}
              size="large"
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{totalCars}</p>
              </div>
              <CarOutlined className="text-4xl text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Cars</p>
                <p className="text-2xl font-bold text-green-600">{activeCars}</p>
              </div>
              <CheckCircleOutlined className="text-4xl text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
              </div>
              <CalendarOutlined className="text-4xl text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Booked Slots</p>
                <p className="text-2xl font-bold text-red-600">{bookedSlots}</p>
              </div>
              <CloseCircleOutlined className="text-4xl text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarOutlined className="mr-2" />
                Select Date
              </label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                format="DD MMM YYYY"
                size="large"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CarOutlined className="mr-2" />
                Filter by Status
              </label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                className="w-full"
                options={[
                  { value: "all", label: "All Cars" },
                  { value: "active", label: "Active Only" },
                  { value: "maintenance", label: "Maintenance Only" },
                  { value: "inactive", label: "Inactive Only" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Results
              </label>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {filteredCars.length} Car{filteredCars.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Legend & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-800">Slot Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-green-50 border-2 border-green-400 rounded flex flex-col items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 text-base" />
                  <span className="text-xs text-green-700 font-bold">Free</span>
                </div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-red-50 border-2 border-red-300 rounded flex flex-col items-center justify-center">
                  <CloseCircleOutlined className="text-red-600 text-base" />
                  <span className="text-xs text-red-700 font-bold">15 Nov</span>
                </div>
                <span className="text-sm text-gray-700">Booked (free date shown)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-gray-300 rounded flex flex-col items-center justify-center">
                  <span className="text-lg">🚫</span>
                  <span className="text-xs text-gray-700 font-medium">Holiday</span>
                </div>
                <span className="text-sm text-gray-700">Blocked</span>
              </div>
            </div>
          </div>

          {/* Car Status Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-800">Car Status:</span>
              <div className="flex items-center gap-2">
                <Tag color="green" className="text-xs px-2 py-1 m-0 font-medium">✓ ACTIVE</Tag>
                <span className="text-sm text-gray-700">Ready for booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="orange" className="text-xs px-2 py-1 m-0 font-medium">🔧 MAINTENANCE</Tag>
                <span className="text-sm text-gray-700">Under repair</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="red" className="text-xs px-2 py-1 m-0 font-medium">✗ INACTIVE</Tag>
                <span className="text-sm text-gray-700">Not in service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Period Tabs with Schedule Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "morning" | "afternoon" | "evening")}
            size="large"
            className="px-4 pt-3"
            items={[
              {
                key: "morning",
                label: (
                  <span className="text-base font-semibold px-4">
                    🌅 Morning (7 AM - 11 AM)
                  </span>
                ),
              },
              {
                key: "afternoon",
                label: (
                  <span className="text-base font-semibold px-4">
                    ☀️ Afternoon (12 PM - 4 PM)
                  </span>
                ),
              },
              {
                key: "evening",
                label: (
                  <span className="text-base font-semibold px-4">
                    🌙 Evening (5 PM - 9 PM)
                  </span>
                ),
              },
            ]}
          />
          
          {/* Schedule Table */}
          <Table
            columns={columns}
            dataSource={paginatedCars}
            pagination={false}
            scroll={{ x: 900 }}
            size="middle"
            rowKey="id"
            className="scheduler-table"
          />
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <Pagination
            current={currentPage}
            total={filteredCars.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} cars`}
            size="default"
          />
        </div>
      </div>

      <style jsx global>{`
        .scheduler-table .ant-table-cell {
          padding: 10px !important;
          font-size: 14px;
        }
        
        .scheduler-table .ant-table-thead > tr > th {
          background: #f0f9ff;
          font-weight: 700;
          border-bottom: 3px solid #3b82f6;
          padding: 14px 10px !important;
        }
        
        .scheduler-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .scheduler-table .ant-table-tbody > tr:hover > td {
          background: #fefce8;
        }

        .ant-tabs-tab {
          padding: 14px 10px !important;
        }
        
        .ant-tabs-tab-active {
          background: #eff6ff !important;
          border-radius: 8px 8px 0 0 !important;
        }
      `}</style>
    </div>
  );
};

export default CarScheduler;
