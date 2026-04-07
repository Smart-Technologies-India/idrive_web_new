"use client";

import { use } from "react";
import { Button, Spin, Card } from "antd";
import { IcBaselineArrowBack, AntDesignBookOutlined } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/user.api";
import { getAllBookings } from "@/services/booking.api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { getSchoolById } from "@/services/school.api";
import { baseurl } from "@/utils/conts";

const Form14Page = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const { userId } = use(params);
  const numericUserId = parseInt(userId);
  const schoolId = parseInt((getCookie("school") as string) || "0");

  // Fetch user data
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["user-detail", numericUserId],
    queryFn: () => getUserById(numericUserId),
    enabled: !isNaN(numericUserId),
  });

  // Fetch school data
  const { data: schoolResponse, isLoading: schoolLoading } = useQuery({
    queryKey: ["school-detail", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });

  // Fetch bookings
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ["user-bookings", numericUserId],
    queryFn: () =>
      getAllBookings({
        schoolId,
      }),
    enabled: !isNaN(numericUserId),
  });

  const user = userResponse?.data?.getUserById;
  const school = schoolResponse?.data?.getSchoolById;
  const allBookings = bookingsResponse?.data?.getAllBooking || [];
  
  // Filter bookings for this specific user
  const bookings = allBookings.filter((booking) => booking.customerId === numericUserId);

  // Get the first booking for course details
  const firstBooking = bookings.length > 0 ? bookings[0] : null;

  const handlePrint = () => {
    window.print();
  };

  if (userLoading || schoolLoading || bookingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>User not found</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              icon={<IcBaselineArrowBack />}
              onClick={() => router.back()}
              size="large"
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<AntDesignBookOutlined />}
              onClick={handlePrint}
              size="large"
            >
              Download / Print
            </Button>
          </div>
        </div>
      </div>

      {/* Form 14 Content */}
      <div className="p-8 print:p-0">
        <div
          id="form-14-printable"
          className="bg-white max-w-4xl mx-auto shadow-lg print:shadow-none relative"
          style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}
        >
          {/* Photo Box */}
          <div
            className="absolute border border-black"
            style={{
              width: "120px",
              height: "140px",
              top: "240px",
              right: "40px",
            }}
          >
            {user.profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${baseurl}${user.profile}`}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100"></div>
            )}
          </div>

          {/* Header */}
          <div className="text-center border-2 border-black p-4 mb-6">
            <div className="font-bold text-lg mb-2">
              {school?.name || "CHOHAN MOTOR DRIVING SCHOOL"}
            </div>
            <div className="text-sm mb-1">
              {school?.address || "Kalewadi, Gangve Chs., Alandi Nagre, near Bandgore, Audyogic (V.), Mumbai KY."}
            </div>
            <div className="text-sm mb-1">
              {school?.phone && `T.A.: ${school.phone}`}
              {school?.alternatePhone && ` / ${school.alternatePhone}`}
            </div>
            <div className="font-bold mt-3 text-xl">FORM 14</div>
            <div className="text-xs">[See Rule 27(a)]</div>
          </div>

          {/* Title */}
          <div className="text-center font-bold mb-6 text-base">
            REGISTER SHOWING THE ENROLMENT OF TRAINEE (S) IN THE<br />
            DRIVING SCHOOL ESTABLISHMENTS
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-sm">
            {/* Year */}
            <div className="flex">
              <div className="w-64">Register for the year</div>
              <div className="flex-1 border-b border-black font-semibold text-center">
                {new Date().getFullYear()}
              </div>
            </div>

            {/* Enrollment Number */}
            <div className="flex">
              <div className="w-64">1. Enrolment number</div>
              <div className="flex-1 border-b border-black font-semibold">
                {firstBooking?.bookingId || `PRA ${new Date().getFullYear()} - ${user.id.toString().padStart(4, "0")}`}
              </div>
            </div>

            {/* Name of Trainee */}
            <div className="flex">
              <div className="w-64">2. Name of the trainee with his photograph</div>
              <div className="flex-1 border-b border-black font-semibold uppercase">
                {user.surname && user.surname.toUpperCase()}, {user.name.toUpperCase()}
              </div>
            </div>

            {/* Son/Daughter */}
            <div className="flex">
              <div className="w-64">3. Son /wife /daughter of</div>
              <div className="flex-1 border-b border-black font-semibold uppercase">
                {user.fatherName || ""}
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <div className="flex">
                <div className="w-64">4. Address</div>
                <div className="flex-1 border-b border-black font-semibold">
                  {user.address || ""}
                </div>
              </div>
              <div className="flex">
                <div className="w-64 pl-8">(b) Permanent Address</div>
                <div className="flex-1 border-b border-black font-semibold">
                  {user.permanentAddress || user.address || ""}
                </div>
              </div>
              <div className="flex">
                <div className="w-64 pl-8">(a) Temporary Address/Official Address (if any)</div>
                <div className="flex-1 border-b border-black font-semibold">
                  {user.address || ""}
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex">
              <div className="w-64">5. Date of Birth</div>
              <div className="flex-1 border-b border-black font-semibold">
                {user.dob ? dayjs(user.dob).format("DD/MM/YYYY") : ""}
              </div>
            </div>

            {/* Class of Vehicle */}
            <div className="flex">
              <div className="w-64">6. Class of vehicle for which training imparted</div>
              <div className="flex-1 border-b border-black font-semibold">
                {firstBooking?.courseName || ""}
              </div>
            </div>

            {/* Date of Enrollment */}
            <div className="flex">
              <div className="w-64">7. Date of enrollment</div>
              <div className="flex-1 border-b border-black font-semibold">
                {firstBooking?.bookingDate
                  ? dayjs(firstBooking.bookingDate).format("DD/MM/YYYY")
                  : dayjs().format("DD/MM/YYYY")}
              </div>
            </div>

            {/* Learner's License */}
            <div className="flex">
              <div className="w-64">8. Learner&apos;s License Number & date of its expiry</div>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* Date of Completion */}
            <div className="flex">
              <div className="w-64">9. Date of completion of the course</div>
              <div className="flex-1 border-b border-black font-semibold">
              </div>
            </div>

            {/* Date of Test */}
            <div className="flex">
              <div className="w-64">10. Date of pertagthe test of competence to drive</div>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* Driving License Number */}
            <div className="flex">
              <div className="w-64">
                11. Driving License Number & date of issue &<br />
                <span className="pl-4">Licensing authority which issued the licenre</span>
              </div>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* Remarks */}
            <div className="flex">
              <div className="w-64">12. Remarks</div>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* Signature of License Holder */}
            <div className="flex">
              <div className="w-64">13. Signature of the licence holder</div>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* Signature of License Authority */}
            <div className="flex">
              <div className="w-64">14. Signature of the licence authority</div>
              <div className="flex-1 border-b border-black"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-xs text-gray-500">
            Printed by: Smart Technologies
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          #form-14-printable {
            max-width: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Form14Page;
