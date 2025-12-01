"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddCarForm, AddCarSchema } from "@/schema/addcar";
import { TextInput } from "@/components/form/inputfields/textinput";
import { DateInput } from "@/components/form/inputfields/dateinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { Button, Card, Modal } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { getCookie } from "cookies-next";
import { createCar, getPaginatedCars } from "@/services/car.api";
import { getAllDrivers } from "@/services/driver.api";
import { getAllCarAdmins } from "@/services/car-admin.api";
import { useEffect } from "react";
import dayjs from "dayjs";

const AddCarPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const methods = useForm<AddCarForm>({
    resolver: valibotResolver(AddCarSchema),
  });

  // Fetch existing cars to generate next carId
  const { data: carsResponse } = useQuery({
    queryKey: ["carsForId", schoolId],
    queryFn: async () => {
      if (!schoolId || schoolId === 0) {
        throw new Error("School ID not found");
      }
      return await getPaginatedCars({
        searchPaginationInput: {
          skip: 0,
          take: 1000, // Get all cars to find the latest carId
          search: "",
        },
        whereSearchInput: {
          schoolId,
        },
      });
    },
    enabled: schoolId > 0,
  });

  // Generate carId when cars data is loaded
  useEffect(() => {
    if (carsResponse?.data?.getPaginatedCar?.data) {
      const cars = carsResponse.data.getPaginatedCar.data;
      const prefix = `CAR${schoolId}`;
      
      // Find the latest carId for this school
      const schoolCars = cars.filter(car => car.carId.startsWith(prefix));
      
      let nextNumber = 1;
      if (schoolCars.length > 0) {
        const latestCarId = schoolCars
          .map(car => {
            const numStr = car.carId.replace(prefix, '');
            return parseInt(numStr) || 0;
          })
          .sort((a, b) => b - a)[0];
        
        nextNumber = latestCarId + 1;
      }
      
      const newCarId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
      methods.setValue('carId', newCarId);
    }
  }, [carsResponse, schoolId, methods]);

  // Fetch all car admins
  const { data: carAdminsResponse } = useQuery({
    queryKey: ["allCarAdmins"],
    queryFn: async () => {
      return await getAllCarAdmins({
        status: "ACTIVE",
      });
    },
  });

  const carAdminOptions = carAdminsResponse?.data?.getAllCarAdmin?.map((car) => ({
    label: `${car.name} - ${car.manufacturer} (${car.category})`,
    value: car.id.toString(),
  })) || [];

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

  // Create car mutation
  const createCarMutation = useMutation({
    mutationKey: ["createCar"],
    mutationFn: async (data: AddCarForm) => {
      const createData = {
        schoolId,
        carId: data.carId,
        carAdminId: parseInt(data.carAdminId),
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
      };
      const selectedCarAdmin = carAdminsResponse?.data?.getAllCarAdmin?.find(c => c.id === parseInt(data.carAdminId));
      return { response: await createCar(createData), selectedCarAdmin };
    },
    onSuccess: ({ response, selectedCarAdmin }) => {
      if (response.status && response.data?.createCar) {
        const car = response.data.createCar;
        Modal.success({
          title: "Car Added Successfully",
          content: (
            <div className="space-y-2">
              <p><strong>Car:</strong> {selectedCarAdmin?.name} - {selectedCarAdmin?.manufacturer} ({selectedCarAdmin?.category})</p>
              <p><strong>Registration:</strong> {car.registrationNumber}</p>
              <p><strong>Status:</strong> {car.status}</p>
            </div>
          ),
          onOk: () => router.push("/mtadmin/car"),
        });
      } else {
        toast.error(response.message || "Failed to add car");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while adding the car");
    },
  });

  const onSubmit = (data: AddCarForm) => {
    createCarMutation.mutate(data);
  };

  const handleReset = () => {
    methods.reset();
    toast.info("Form reset");
  };

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
              onClick={() => router.push("/mtadmin/car")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Register a new vehicle to the fleet
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<AddCarForm>
                      name="carId"
                      title="Car ID (Auto-generated)"
                      placeholder="e.g., CAR001"
                      required
                      disable
                    />
                  </div>
                  <div>
                    <MultiSelect<AddCarForm>
                      name="carAdminId"
                      title="Select Car Model"
                      placeholder="Choose a car from master data"
                      required={true}
                      options={carAdminOptions}
                    />
                  </div>
                </div>

                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Note:</strong> Select a car model from the standardized master data. 
                    This ensures consistency and prevents data entry errors. Car details like manufacturer, 
                    model, fuel type, and transmission will be automatically linked.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <TextInput<AddCarForm>
                      name="registrationNumber"
                      title="Registration Number"
                      placeholder="e.g., DL01AB1234"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<AddCarForm>
                      name="year"
                      title="Year"
                      placeholder="e.g., 2023"
                      required
                      onlynumber
                    />
                  </div>
                  <div>
                    <TextInput<AddCarForm>
                      name="color"
                      title="Color"
                      placeholder="e.g., White"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<AddCarForm>
                      name="fuelType"
                      title="Fuel Type"
                      placeholder="Select fuel type"
                      required
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
                    <MultiSelect<AddCarForm>
                      name="transmission"
                      title="Transmission"
                      placeholder="Select transmission"
                      required
                      options={[
                        { label: "MANUAL", value: "MANUAL" },
                        { label: "AUTOMATIC", value: "AUTOMATIC" },
                      ]}
                    />
                  </div>
                  <div>
                    <TextInput<AddCarForm>
                      name="seatingCapacity"
                      title="Seating Capacity"
                      placeholder="e.g., 5"
                      required
                      onlynumber
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
                    <TextInput<AddCarForm>
                      name="engineNumber"
                      title="Engine Number"
                      placeholder="e.g., K15B-987654"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<AddCarForm>
                      name="chassisNumber"
                      title="Chassis Number"
                      placeholder="e.g., MA3ERLF1S00123456"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <TextInput<AddCarForm>
                      name="currentMileage"
                      title="Current Mileage (km)"
                      placeholder="e.g., 12500"
                      required
                      onlynumber
                      numdes
                    />
                  </div>
                  <div>
                    <TextInput<AddCarForm>
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
                    <DateInput<AddCarForm>
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
                    <TextInput<AddCarForm>
                      name="insuranceNumber"
                      title="Insurance Number"
                      placeholder="e.g., INC-2023-12345"
                      required
                    />
                  </div>
                  <div>
                    <DateInput<AddCarForm>
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
                    <DateInput<AddCarForm>
                      name="pucExpiry"
                      title="PUC Expiry Date"
                      placeholder="Select expiry date"
                      required
                      minDate={dayjs()}
                    />
                  </div>
                  <div>
                    <DateInput<AddCarForm>
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
                    <DateInput<AddCarForm>
                      name="lastServiceDate"
                      title="Last Service Date"
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <DateInput<AddCarForm>
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
                    <MultiSelect<AddCarForm>
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
                <Button size="large" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  size="large"
                  onClick={() => router.push("/mtadmin/car")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={createCarMutation.isPending}
                  icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Add Car
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default AddCarPage;
