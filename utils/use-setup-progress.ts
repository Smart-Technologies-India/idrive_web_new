"use client";

import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { getSchoolById } from "@/services/school.api";
import { getPaginatedUsers } from "@/services/user.api";
import { getPaginatedCars } from "@/services/car.api";
import { getAllCarCourses } from "@/services/carcourse.api";
import { getAllSchoolServices } from "@/services/school-service.api";
import type { SetupProgress } from "@/utils/setup-progress";

/**
 * Custom hook to check setup progress for MT Admin
 * Checks actual data in database to determine completion status
 */
export const useSetupProgress = () => {
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Check school profile completion
  const { data: schoolData, isLoading: loadingSchool } = useQuery({
    queryKey: ["school-profile", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });

  // Check if drivers exist
  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ["drivers-check", schoolId],
    queryFn: () =>
      getPaginatedUsers({
        searchPaginationInput: { skip: 0, take: 1 },
        whereSearchInput: { schoolId, role: "DRIVER" },
      }),
    enabled: schoolId > 0,
  });

  // Check if cars exist
  const { data: carsData, isLoading: loadingCars } = useQuery({
    queryKey: ["cars-check", schoolId],
    queryFn: () =>
      getPaginatedCars({
        searchPaginationInput: { skip: 0, take: 1 },
        whereSearchInput: { schoolId },
      }),
    enabled: schoolId > 0,
  });

  // Check if courses exist (via car courses)
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["courses-check", schoolId],
    queryFn: async () => {
      // Get first car to check courses
      const carsResponse = await getPaginatedCars({
        searchPaginationInput: { skip: 0, take: 1 },
        whereSearchInput: { schoolId },
      });
      
      const firstCar = carsResponse?.data?.getPaginatedCar?.data?.[0];
      if (!firstCar) return null;
      
      return getAllCarCourses({ carId: firstCar.id });
    },
    enabled: schoolId > 0 && (carsData?.data?.getPaginatedCar?.total ?? 0) > 0,
  });

  // Check if services exist
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["services-check", schoolId],
    queryFn: () =>
      getAllSchoolServices({
        whereSearchInput: { schoolId, status: "ACTIVE" },
      }),
    enabled: schoolId > 0,
  });

  const isLoading = loadingSchool || loadingDrivers || loadingCars || loadingCourses || loadingServices;

  // Determine profile completion
  const school = schoolData?.data?.getSchoolById;
  const requiredFields = [
    "dayStartTime",
    "dayEndTime",
    "ownerName",
    "bankName",
    "accountNumber",
    "ifscCode",
    "rtoLicenseNumber",
  ];
  const profileComplete = school ? requiredFields.every(
    (field) => school[field as keyof typeof school]
  ) : false;

  // Check other setup steps
  const driversAdded = (driversData?.data?.getPaginatedUser?.total ?? 0) > 0;
  const carsAdded = (carsData?.data?.getPaginatedCar?.total ?? 0) > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coursesAdded = coursesData ? ((coursesData as any)?.data?.getAllCarCourse?.length ?? 0) > 0 : false;
  const servicesAdded = (servicesData?.data?.getAllSchoolService?.length ?? 0) > 0;

  const setupComplete = profileComplete && driversAdded && carsAdded && coursesAdded && servicesAdded;

  const progress: SetupProgress = {
    profileComplete,
    driversAdded,
    carsAdded,
    coursesAdded,
    servicesAdded,
    setupComplete,
  };

  return {
    progress,
    isLoading,
    schoolId,
  };
};
