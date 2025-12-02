"use client";

import { Suspense } from "react";
import ServiceBookingForm from "@/components/form/servicebooking";
import { useSetupProgress } from "@/utils/use-setup-progress";
import { canAccessFeature, getNextStep } from "@/utils/setup-progress";
import { SetupBlocker } from "@/components/setup-wizard";

function ServiceBookingFormWrapper() {
  const { progress, isLoading } = useSetupProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  const access = canAccessFeature('servicebooking', progress);

  if (!access.allowed) {
    const nextStep = getNextStep(progress);
    return (
      <SetupBlocker
        reason={access.reason || "Setup incomplete"}
        nextStep={nextStep ? { title: nextStep.title, route: nextStep.route } : undefined}
      />
    );
  }

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
