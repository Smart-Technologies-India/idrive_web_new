"use client";

import { useMemo } from "react";
import { Button, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { Fa6SolidAngleLeft, AntDesignBookOutlined } from "@/components/icons";
import { getBookingById, type Booking } from "@/services/booking.api";
import { getSchoolById } from "@/services/school.api";
import Image from "next/image";

const CertificatePage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bookingId = parseInt(params.id || "0");
  const schoolId = parseInt(getCookie("school")?.toString() || "0");

  const { data: bookingResponse, isLoading } = useQuery({
    queryKey: ["booking-certificate", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });

  const { data: schoolResponse } = useQuery({
    queryKey: ["school-detail", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });

  const booking: Booking | undefined = bookingResponse?.data?.getBookingById;
  const school = schoolResponse?.data?.getSchoolById;

  const certificateData = useMemo(() => {
    if (!booking) return null;

    const sessions = booking.sessions || [];
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    );

    const startDate = sortedSessions.length
      ? sortedSessions[0].sessionDate
      : booking.bookingDate;
    const endDate = sortedSessions.length
      ? sortedSessions[sortedSessions.length - 1].sessionDate
      : booking.bookingDate;

    // Determine course type based on course name
    let courseType = "LMV";
    const courseName = (
      booking.course?.courseName ||
      booking.courseName ||
      ""
    ).toUpperCase();
    if (courseName.includes("MCWG") || courseName.includes("TWO WHEELER")) {
      courseType = "MCWG";
    } else if (
      courseName.includes("LMV") ||
      courseName.includes("CAR") ||
      courseName.includes("FOUR WHEELER")
    ) {
      courseType = "LMV";
    }

    return {
      serialNumber: booking.bookingId,
      studentName: booking.customerName || booking.customer?.name || "-",
      fatherName: booking.customer?.fatherName || "-",
      address: booking.customer?.address || "-",
      enrollmentDate: booking.bookingDate,
      courseType,
      trainingFrom: startDate,
      trainingTo: endDate,
      photo: booking.customer?.id ? `/api/placeholder-student-photo` : null,
    };
  }, [booking]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading certificate..." />
      </div>
    );
  }

  if (!booking || !certificateData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          Certificate not found or invalid booking ID
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page min-h-screen bg-gray-100 p-6 md:p-8 print:bg-white print:p-0">
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button
          icon={<Fa6SolidAngleLeft />}
          onClick={() => router.back()}
          size="large"
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<AntDesignBookOutlined />}
          onClick={() => window.print()}
          size="large"
        >
          Print / Save PDF
        </Button>
      </div>

      {/* Certificate Container */}
      <div className="certificate-container max-w-[1400px] mx-auto bg-white shadow-lg print:shadow-none">
        {/* Green Border Frame */}
        <div className="border-frame bg-[#1a5c1a] p-3">
          <div className="bg-white p-2">
            <div className="certificate-content bg-white border-12 border-[#1a5c1a] p-8 md:p-10 relative">
            {/* Serial Number - Top Right */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-red-600 font-bold text-sm">Serial No :</div>
              <div className="text-red-600 font-bold text-lg">
                {certificateData.serialNumber}
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-red-600 mb-2">CHOHAN</h1>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                MOTOR DRIVING SCHOOL
              </h2>
              <p className="text-sm text-gray-700 mb-1">
                {school?.address ||
                  "Kanchan Ganga Shopping Centre, Manish Nagar, Four Bunglow, Andheri(W), Mumbai 53."}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-semibold">
                  MTS No: {school?.rtoLicenseNumber || "MH-02-SCHOOL-370"}
                </span>
                <span className="mx-4">
                  <span className="font-semibold">Class:</span>{" "}
                  {certificateData.courseType}
                </span>
                <span className="font-semibold">
                  Validity: {dayjs().add(1, "year").format("DD/MM/YYYY")}
                </span>
              </p>
            </div>

            {/* Form Title */}
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold mb-1">FORM - 5</h3>
              <p className="text-sm text-gray-700">
                [ See Rule 14 (e),17(1) (b), 27(d) and 31-A (2) ]
              </p>
              <p className="text-red-600 font-semibold">
                Driving Certificate issued by Driving School or Establishment
              </p>
            </div>

            {/* Main Content with Photo */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,150px] gap-6 mb-6">
              <div className="space-y-4">
                {/* Student Name */}
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">
                    This is to certify that
                  </span>
                  <span className="flex-1 border-b border-gray-400 text-red-600 font-bold uppercase">
                    {certificateData.studentName}
                  </span>
                </div>

                {/* Father's Name */}
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">
                    Son/Daughter of
                  </span>
                  <span className="flex-1 border-b border-gray-400 font-semibold uppercase">
                    {certificateData.fatherName}
                  </span>
                </div>

                {/* Address */}
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">
                    Residing at
                  </span>
                  <span className="flex-1 border-b border-gray-400 font-semibold">
                    {certificateData.address}
                  </span>
                </div>
              </div>

              {/* Student Photo */}
              <div className="flex justify-center md:justify-end">
                <div className="w-32 h-40 border-2 border-gray-400 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {certificateData.photo ? (
                    <Image
                      src={certificateData.photo}
                      alt="Student Photo"
                      width={128}
                      height={160}
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-2">
                      Student
                      <br />
                      Photo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enrollment Details */}
            <div className="space-y-3 mb-6 text-sm">
              <p className="leading-relaxed">
                <span className="font-semibold">
                  Has been enrolled in this Driving School on{" "}
                </span>
                <span className="text-red-600 font-bold">
                  {dayjs(certificateData.enrollmentDate).format("DD/MM/YYYY")}
                </span>
                <span className="font-semibold">
                  {" "}
                  and her/his name is registered vide Registration/ Serial
                  number{" "}
                </span>
                <span className="text-red-600 font-bold">
                  {certificateData.serialNumber}
                </span>
                <span className="font-semibold">
                  {" "}
                  in our register in Form no. 14 and that he/she has undergone
                  the course of Training in Driving of{" "}
                </span>
                <span className="text-red-600 font-bold">
                  {certificateData.courseType}
                </span>
                <span className="font-semibold">
                  {" "}
                  according to the syllabus as prescribed in Motor Vehicle Rule
                  1989 for a period From{" "}
                </span>
                <span className="text-red-600 font-bold">
                  {dayjs(certificateData.trainingFrom).format("DD/MM/YYYY")}
                </span>
                <span className="font-semibold"> To </span>
                <span className="text-red-600 font-bold">
                  {dayjs(certificateData.trainingTo).format("DD/MM/YYYY")}
                </span>
                <span className="font-semibold"> satisfactorily.</span>
              </p>
              <p className="font-semibold">
                I am Satisfied with her / his physical fitness and sense of
                responsibility.
              </p>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end mt-12">
              <div className="text-sm text-blue-900">
                For{" "}
                <span className="font-bold">CHOHAN MOTOR DRIVING SCHOOL</span>
              </div>
              <div className="text-right">
                <div className="mb-16">{/* Space for signature */}</div>
                <div className="text-red-600 font-bold">Proprietor</div>
                <div className="text-red-600 font-bold text-lg">L.L.CHOHAN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .certificate-page {
            padding: 0;
            background: white;
          }

          .certificate-container {
            max-width: 100%;
            box-shadow: none;
          }

          .border-frame {
            padding: 10mm;
          }

          .certificate-content {
            page-break-inside: avoid;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;
