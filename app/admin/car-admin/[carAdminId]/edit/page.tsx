"use client";

import { use, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Card, Modal, Spin } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCarAdminById, updateCarAdmin } from "@/services/car-admin.api";
import { EditCarAdminForm, EditCarAdminSchema } from "@/schema/editcaradmin";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";

const EditCarAdminPage = ({
  params,
}: {
  params: Promise<{ carAdminId: string }>;
}) => {
  const router = useRouter();
  const { carAdminId: carAdminIdStr } = use(params);
  const carAdminId = parseInt(carAdminIdStr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const methods = useForm<EditCarAdminForm>({
    resolver: valibotResolver(EditCarAdminSchema),
  });

  // Fetch car admin data from API
  const {
    data: carAdminResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["carAdmin", carAdminId],
    queryFn: () => getCarAdminById(carAdminId),
    enabled: carAdminId > 0,
  });

  const carAdminData = carAdminResponse?.data?.getCarAdminById;

  // Update car admin mutation
  const updateCarAdminMutation = useMutation({
    mutationFn: updateCarAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carAdmin", carAdminId] });
      queryClient.invalidateQueries({ queryKey: ["carAdmins"] });
      Modal.success({
        title: "Car Updated Successfully!",
        content: (
          <div className="space-y-2">
            <p>
              <strong>Car Name:</strong> {carAdminData?.name}
            </p>
            <p>
              <strong>Status:</strong> {carAdminData?.status}
            </p>
          </div>
        ),
        onOk: () => router.push(`/admin/car-admin/${carAdminId}`),
      });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to update car. Please try again."
      );
      setIsSubmitting(false);
    },
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (carAdminData) {
      const formData: Partial<EditCarAdminForm> = {
        name: carAdminData.name,
        manufacturer: carAdminData.manufacturer,
        category: carAdminData.category,
        status: carAdminData.status,
      };
      methods.reset(formData);
    }
  }, [methods, carAdminData]);

  const onSubmit = (data: EditCarAdminForm) => {
    Modal.confirm({
      title: "Confirm Car Update",
      content: (
        <div>
          <p>
            <strong>Car Name:</strong> {data.name}
          </p>
          <p>
            <strong>Manufacturer:</strong> {data.manufacturer}
          </p>
          <p>
            <strong>Category:</strong> {data.category}
          </p>
          <p>
            <strong>Status:</strong> {data.status}
          </p>
          <br />
          <p>Are you sure you want to update this car?</p>
        </div>
      ),
      okText: "Yes, Update Car",
      cancelText: "Cancel",
      onOk: () => {
        setIsSubmitting(true);

        updateCarAdminMutation.mutate({
          id: carAdminId,
          name: data.name,
          manufacturer: data.manufacturer,
          category: data.category as "SEDAN" | "MUV" | "SUV" | "HATCHBACK",
          status: data.status as "ACTIVE" | "INACTIVE" | "MAINTENANCE",
        });
      },
      okButtonProps: {
        className: "!bg-blue-600",
      },
    });
  };

  const handleReset = () => {
    if (carAdminData) {
      const formData: Partial<EditCarAdminForm> = {
        name: carAdminData.name,
        manufacturer: carAdminData.manufacturer,
        category: carAdminData.category,
        status: carAdminData.status,
      };
      methods.reset(formData);
    }
    toast.info("Form reset to original values");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !carAdminData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error ? "Failed to load car data" : "Car not found"}
            </p>
            <Button onClick={() => router.push("/admin/car-admin")}>
              Back to Car List
            </Button>
          </div>
        </Card>
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
              onClick={() => router.push(`/admin/car-admin/${carAdminId}`)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Car</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Update car details - {carAdminData?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        <Card className="shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<EditCarAdminForm>
                      name="name"
                      title="Car Name"
                      placeholder="e.g., Maruti Swift"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<EditCarAdminForm>
                      name="manufacturer"
                      title="Manufacturer"
                      placeholder="e.g., Maruti Suzuki"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<EditCarAdminForm>
                      name="category"
                      title="Category"
                      placeholder="Select category"
                      required={true}
                      options={[
                        { label: "Sedan", value: "SEDAN" },
                        { label: "MUV", value: "MUV" },
                        { label: "SUV", value: "SUV" },
                        { label: "Hatchback", value: "HATCHBACK" },
                      ]}
                    />
                  </div>
                  <div>
                    <MultiSelect<EditCarAdminForm>
                      name="status"
                      title="Status"
                      placeholder="Select status"
                      required={true}
                      options={[
                        { label: "Active", value: "ACTIVE" },
                        { label: "Inactive", value: "INACTIVE" },
                        { label: "Maintenance", value: "MAINTENANCE" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Update Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>
                    Changes will affect all schools using this car
                  </li>
                  <li>
                    Car ID cannot be modified once created
                  </li>
                  <li>
                    Setting status to INACTIVE will hide this car from school selections
                  </li>
                  <li>
                    Use MAINTENANCE status for temporary unavailability
                  </li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button size="large" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  size="large"
                  onClick={() => router.push(`/admin/car-admin/${carAdminId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isSubmitting}
                  icon={<AntDesignCheckOutlined />}
                  className="!bg-gradient-to-r from-blue-600 to-cyan-600"
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

export default EditCarAdminPage;
