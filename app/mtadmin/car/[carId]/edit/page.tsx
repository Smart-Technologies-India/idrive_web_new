"use client";

import { use, useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EditCarForm, EditCarSchema } from "@/schema/editcar";
import { TextInput } from "@/components/form/inputfields/textinput";
import { DateInput } from "@/components/form/inputfields/dateinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { Button, Card, Spin, Alert, Modal } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { getCarById, updateCar } from "@/services/car.api";
import { getAllDrivers } from "@/services/driver.api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";

const EditCarPage = ({ params }: { params: Promise<{ carId: string }> }) => {
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const { carId } = use(params);
  const numericCarId = parseInt(carId);
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const methods = useForm<EditCarForm>({
    resolver: valibotResolver(EditCarSchema),
  });

  // Fetch active drivers for the school
  const { data: driversResponse } = useQuery({
    queryKey: ["allDrivers", schoolId],
    queryFn: async () => {
      if (!schoolId || schoolId === 0) {
        throw new Error("School ID not found");
      }
      return await getAllDrivers({
        schoolId,
        status: "ACTIVE",
      });
    },
    enabled: schoolId > 0,
  });

  const driverOptions = driversResponse?.data?.getAllDriver?.map((driver) => ({
    label: `${driver.name} (${driver.driverId})`,
    value: driver.id.toString(),
  })) || [];

  // Fetch existing car data
  const { data: carResponse, isLoading, isError, error } = useQuery({
    queryKey: ["car", numericCarId],
    queryFn: async () => {
      if (!numericCarId || isNaN(numericCarId)) {
        throw new Error("Invalid car ID");
      }
      return await getCarById(numericCarId);
    },
    enabled: !isNaN(numericCarId),
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (carResponse?.status && carResponse.data.getCarById && !initialDataLoaded.current) {
      const car = carResponse.data.getCarById;
      methods.reset({
        carName: car.carName || "",
        model: car.model || "",
        registrationNumber: car.registrationNumber || "",
        year: car.year?.toString() || "",
        color: car.color || "",
        fuelType: car.fuelType || "",
        transmission: car.transmission || "",
        seatingCapacity: car.seatingCapacity?.toString() || "",
        engineNumber: car.engineNumber || "",
        chassisNumber: car.chassisNumber || "",
        purchaseDate: car.purchaseDate || "",
        purchaseCost: car.purchaseCost?.toString() || "",
        currentMileage: car.currentMileage?.toString() || "",
        insuranceNumber: car.insuranceNumber || "",
        insuranceExpiry: car.insuranceExpiry || "",
        pucExpiry: car.pucExpiry || "",
        fitnessExpiry: car.fitnessExpiry || "",
        lastServiceDate: car.lastServiceDate || "",
        nextServiceDate: car.nextServiceDate || "",
        assignedDriverId: car.assignedDriverId?.toString() || "",
        status: car.status || "",
      });
      initialDataLoaded.current = true;
    }
  }, [carResponse, methods]);

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationKey: ["updateCar"],
    mutationFn: async (data: EditCarForm) => {
      const updateData = {
        id: numericCarId,
        carName: data.carName,
        model: data.model,
        registrationNumber: data.registrationNumber,
        year: parseInt(data.year),
        color: data.color,
        fuelType: data.fuelType as "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | "CNG",
        transmission: data.transmission as "MANUAL" | "AUTOMATIC" | "AMT" | "CVT",
        seatingCapacity: data.seatingCapacity ? parseInt(data.seatingCapacity) : 5,
        engineNumber: data.engineNumber || "",
        chassisNumber: data.chassisNumber || "",
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
        purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : 0,
        currentMileage: data.currentMileage ? parseFloat(data.currentMileage) : 0,
        insuranceNumber: data.insuranceNumber || "",
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : new Date(),
        pucExpiry: data.pucExpiry ? new Date(data.pucExpiry) : new Date(),
        fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : new Date(),
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : undefined,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined,
        assignedDriverId: parseInt(data.assignedDriverId),
        status: data.status as "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "INACTIVE",
      };
      return await updateCar(updateData);
    },
    onSuccess: (response) => {
      if (response.status && response.data?.updateCar) {
        const car = response.data.updateCar;
        Modal.success({
          title: "Car Updated Successfully",
          content: (
            <div className="space-y-2">
              <p><strong>Car Name:</strong> {car.carName}</p>
              <p><strong>Model:</strong> {car.model}</p>
              <p><strong>Registration:</strong> {car.registrationNumber}</p>
              <p><strong>Status:</strong> {car.status}</p>
            </div>
          ),
          onOk: () => router.push(`/mtadmin/car/${numericCarId}`),
        });
      } else {
        toast.error(response.message || "Failed to update car");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while updating the car");
    },
  });

  const onSubmit = (data: EditCarForm) => {
    updateCarMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading car details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Error Loading Car"
          description={error?.message || "Failed to load car details"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<Fa6SolidArrowLeftLong className="text-lg" />}
              size="large"
              onClick={() => router.push(`/mtadmin/car/${numericCarId}`)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Car</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Update vehicle information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        <Card className="shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)}>
              {/* Basic Car Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <TextInput<EditCarForm>
                      name="carId"
                      title="Car ID"
                      placeholder="e.g., CAR001"
                      disable
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="carName"
                      title="Car Name"
                      placeholder="e.g., Swift Dzire"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="model"
                      title="Model"
                      placeholder="e.g., VXI"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <TextInput<EditCarForm>
                      name="registrationNumber"
                      title="Registration Number"
                      placeholder="e.g., DL01AB1234"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="year"
                      title="Year"
                      placeholder="e.g., 2023"
                      required
                      onlynumber
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="color"
                      title="Color"
                      placeholder="e.g., White"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<EditCarForm>
                      name="fuelType"
                      title="Fuel Type"
                      placeholder="Select fuel type"
                      required={true}
                      options={[
                        { label: "PETROL", value: "PETROL" },
                        { label: "DIESEL", value: "DIESEL" },
                        { label: "ELECTRIC", value: "ELECTRIC" },
                        { label: "HYBRID", value: "HYBRID" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <MultiSelect<EditCarForm>
                      name="transmission"
                      title="Transmission"
                      placeholder="Select transmission"
                      required={true}
                      options={[
                        { label: "MANUAL", value: "MANUAL" },
                        { label: "AUTOMATIC", value: "AUTOMATIC" },
                      ]}
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="seatingCapacity"
                      title="Seating Capacity"
                      placeholder="e.g., 5"
                      required
                      onlynumber
                    />
                  </div>
                  <div>
                    <MultiSelect<EditCarForm>
                      name="status"
                      title="Status"
                      placeholder="Select status"
                      required={true}
                      options={[
                        { label: "AVAILABLE", value: "AVAILABLE" },
                        { label: "IN_USE", value: "IN_USE" },
                        { label: "MAINTENANCE", value: "MAINTENANCE" },
                        { label: "INACTIVE", value: "INACTIVE" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Technical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<EditCarForm>
                      name="engineNumber"
                      title="Engine Number"
                      placeholder="e.g., K15B-987654"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="chassisNumber"
                      title="Chassis Number"
                      placeholder="e.g., MA3ERLF1S00123456"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <TextInput<EditCarForm>
                      name="currentMileage"
                      title="Current Mileage (km)"
                      placeholder="e.g., 12500"
                      required
                      onlynumber
                      numdes
                    />
                  </div>
                  <div>
                    <TextInput<EditCarForm>
                      name="purchaseCost"
                      title="Purchase Cost (₹)"
                      placeholder="e.g., 850000"
                      required
                      onlynumber
                      numdes
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <DateInput<EditCarForm>
                      name="purchaseDate"
                      title="Purchase Date"
                      placeholder="Select purchase date"
                      required
                      maxDate={dayjs()}
                    />
                  </div>
                </div>
              </div>

              {/* Documents & Compliance */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Documents & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<EditCarForm>
                      name="insuranceNumber"
                      title="Insurance Number"
                      placeholder="e.g., INC-2023-12345"
                      required
                    />
                  </div>
                  <div>
                    <DateInput<EditCarForm>
                      name="insuranceExpiry"
                      title="Insurance Expiry Date"
                      placeholder="Select expiry date"
                      required
                      minDate={dayjs()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <DateInput<EditCarForm>
                      name="pucExpiry"
                      title="PUC Expiry Date"
                      placeholder="Select expiry date"
                      required
                      minDate={dayjs()}
                    />
                  </div>
                  <div>
                    <DateInput<EditCarForm>
                      name="fitnessExpiry"
                      title="Fitness Expiry Date"
                      placeholder="Select expiry date"
                      required
                      minDate={dayjs()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <DateInput<EditCarForm>
                      name="lastServiceDate"
                      title="Last Service Date"
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <DateInput<EditCarForm>
                      name="nextServiceDate"
                      title="Next Service Date"
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Assignment */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Driver Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <MultiSelect<EditCarForm>
                      name="assignedDriverId"
                      title="Assign Driver"
                      placeholder="Select a driver"
                      required={true}
                      options={driverOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button
                  size="large"
                  onClick={() => router.push(`/mtadmin/car/${numericCarId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={updateCarMutation.isPending}
                  icon={<AntDesignCheckOutlined className="text-lg" />}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Update Car
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default EditCarPage;
