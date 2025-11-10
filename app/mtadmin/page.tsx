"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SchoolAdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mtadmin/dashboard");
  }, [router]);

  return null;
};

export default SchoolAdminPage;
