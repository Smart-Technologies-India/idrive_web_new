import { Suspense } from "react";
import ServiceBookingForm from "@/components/form/servicebooking";

function ServiceBookingFormWrapper() {
  return <ServiceBookingForm />;
}

export default function ServiceBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading service booking form...</p>
        </div>
      </div>
    }>
      <ServiceBookingFormWrapper />
    </Suspense>
  );
}
