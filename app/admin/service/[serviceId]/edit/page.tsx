"use client";

import { use, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Card, Modal, Spin } from "antd";
import { ChipInput } from "@/components/form/inputfields/chipinput";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceById, updateService } from "@/services/service.api";

// Temporary form interface - will be replaced with schema
interface EditServiceForm {
  serviceId: string;
  serviceName: string;
  category: string;
  duration: string;
  description: string;
  features: string[];
  requirements: string;
  termsAndConditions: string;
  includedServices: string[];
  status: string;
}

const EditServicePage = ({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) => {
  const router = useRouter();
  const { serviceId: serviceIdStr } = use(params);
  const serviceId = parseInt(serviceIdStr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const methods = useForm<EditServiceForm>();

  // Fetch service data from API
  const {
    data: serviceResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: serviceId > 0,
  });

  const serviceData = serviceResponse?.data?.getServiceById;

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      Modal.success({
        title: "Service Updated Successfully!",
        content: (
          <div className="space-y-2">
            <p>
              <strong>Service Name:</strong> {serviceData?.serviceName}
            </p>
            <p>
              <strong>Status:</strong> {serviceData?.status}
            </p>
          </div>
        ),
        onOk: () => router.push(`/admin/service/${serviceId}`),
      });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to update service. Please try again."
      );
      setIsSubmitting(false);
    },
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (serviceData) {
      // Parse features and includedServices from JSON strings
      const parsedFeatures = serviceData.features
        ? typeof serviceData.features === "string"
          ? JSON.parse(serviceData.features)
          : serviceData.features
        : [];
      const parsedIncludedServices = serviceData.includedServices
        ? typeof serviceData.includedServices === "string"
          ? JSON.parse(serviceData.includedServices)
          : serviceData.includedServices
        : [];

      methods.reset({
        serviceId: serviceData.serviceId,
        serviceName: serviceData.serviceName,
        category: serviceData.category,
        duration: serviceData.duration.toString(),
        description: serviceData.description,
        features: parsedFeatures,
        includedServices: parsedIncludedServices,
        requirements: serviceData.requirements || "",
        termsAndConditions: serviceData.termsAndConditions || "",
        status: serviceData.status,
      });
    }
  }, [methods, serviceData]);

  const onSubmit = (data: EditServiceForm) => {
    Modal.confirm({
      title: "Confirm Service Update",
      content: (
        <div>
          <p>
            <strong>Service Name:</strong> {data.serviceName}
          </p>
          <p>
            <strong>Status:</strong> {data.status}
          </p>
          <br />
          <p>Are you sure you want to update this service?</p>
        </div>
      ),
      okText: "Yes, Update Service",
      cancelText: "Cancel",
      onOk: () => {
        setIsSubmitting(true);

        // Filter out empty strings and ensure proper array format
        const cleanFeatures =
          data.features?.filter((f) => f && f.trim() !== "") || [];
        const cleanIncludedServices =
          data.includedServices?.filter((s) => s && s.trim() !== "") || [];

        console.log({
          id: serviceId,
          serviceName: data.serviceName,
          category: data.category,
          duration: parseInt(data.duration),
          description: data.description,
          features:
            cleanFeatures.length > 0
              ? JSON.stringify(cleanFeatures)
              : undefined,
          includedServices:
            cleanIncludedServices.length > 0
              ? JSON.stringify(cleanIncludedServices)
              : undefined,
          requirements: data.requirements,
          termsAndConditions: data.termsAndConditions,
          status: data.status as
            | "ACTIVE"
            | "INACTIVE"
            | "UPCOMING"
            | "DISCONTINUED",
        });
        updateServiceMutation.mutate({
          id: serviceId,
          serviceName: data.serviceName,
          category: data.category,
          duration: parseInt(data.duration),
          description: data.description,
          features:
            cleanFeatures.length > 0
              ? JSON.stringify(cleanFeatures)
              : undefined,
          includedServices:
            cleanIncludedServices.length > 0
              ? JSON.stringify(cleanIncludedServices)
              : undefined,
          requirements: data.requirements,
          termsAndConditions: data.termsAndConditions,
          status: data.status as
            | "ACTIVE"
            | "INACTIVE"
            | "UPCOMING"
            | "DISCONTINUED",
        });
        setIsSubmitting(false);
      },
      okButtonProps: {
        className: "!bg-blue-600",
      },
    });
  };

  const handleReset = () => {
    if (serviceData) {
      // Parse features and includedServices from JSON strings
      const parsedFeatures = serviceData.features
        ? typeof serviceData.features === "string"
          ? JSON.parse(serviceData.features)
          : serviceData.features
        : [];
      const parsedIncludedServices = serviceData.includedServices
        ? typeof serviceData.includedServices === "string"
          ? JSON.parse(serviceData.includedServices)
          : serviceData.includedServices
        : [];

      methods.reset({
        serviceId: serviceData.serviceId,
        serviceName: serviceData.serviceName,
        category: serviceData.category,
        duration: serviceData.duration.toString(),
        description: serviceData.description,
        features: parsedFeatures,
        includedServices: parsedIncludedServices,
        requirements: serviceData.requirements || "",
        termsAndConditions: serviceData.termsAndConditions || "",
        status: serviceData.status,
      });
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

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error ? "Failed to load service data" : "Service not found"}
            </p>
            <Button onClick={() => router.push("/admin/service")}>
              Back to Services
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl text-gray-600">Service not found</h2>
          <Button
            type="primary"
            className="mt-4"
            onClick={() => router.push("/admin/service")}
          >
            Back to Services
          </Button>
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
              onClick={() => router.push(`/admin/service/${serviceId}`)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Update service details - {serviceData?.serviceId}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service ID{" "}
                      <span className="text-gray-500">(Auto-generated)</span>
                    </label>
                    <input
                      {...methods.register("serviceId")}
                      type="text"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...methods.register("serviceName", { required: true })}
                      type="text"
                      placeholder="Enter service name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("status", { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="DISCONTINUED">Discontinued</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("category", { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="Two Wheeler">Two Wheeler</option>
                      <option value="Four Wheeler">Four Wheeler</option>
                      <option value="Heavy Vehicle">Heavy Vehicle</option>
                      <option value="Commercial Vehicle">
                        Commercial Vehicle
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...methods.register("duration", { required: true })}
                      type="number"
                      placeholder="e.g., 365"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Service Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...methods.register("description", { required: true })}
                      placeholder="Enter detailed service description"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <ChipInput<EditServiceForm>
                      name="features"
                      title="Key Features"
                      placeholder="e.g., 20 hours practical training, Theory sessions"
                      required={false}
                    />
                  </div>
                  <div>
                    <ChipInput<EditServiceForm>
                      name="includedServices"
                      title="Included Services"
                      placeholder="e.g., Theory Classes, Practical Training, Mock Test"
                      required={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements{" "}
                      <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      {...methods.register("requirements")}
                      placeholder="Enter service requirements"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms & Conditions{" "}
                      <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      {...methods.register("termsAndConditions")}
                      placeholder="Enter terms and conditions"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  onClick={() => router.push(`/mtadmin/service/${serviceId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isSubmitting}
                  icon={<AntDesignCheckOutlined />}
                  className="!bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Update Service
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default EditServicePage;
