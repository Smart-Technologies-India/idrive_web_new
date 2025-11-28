import { Suspense } from "react";
import { Spin } from "antd";
import AmendmentForm from "@/components/form/amendment";

function AmendmentFormWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    }>
      <AmendmentForm />
    </Suspense>
  );
}

export default function AmendmentPage() {
  return <AmendmentFormWrapper />;
}
