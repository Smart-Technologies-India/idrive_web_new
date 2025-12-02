"use client";

import { use, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Card, Modal, Spin } from "antd";
import { EditServiceForm, EditServiceSchema } from "@/schema/editservice";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { ChipInput } from "@/components/form/inputfields/chipinput";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceById, updateService } from "@/services/service.api";

const EditServicePage = ({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) => {
  const router = useRouter();
  const { serviceId: serviceIdStr } = use(params);
  const serviceId = parseInt(serviceIdStr);
  const queryClient = useQueryClient();

  const methods = useForm<EditServiceForm>({
    resolver: valibotResolver(EditServiceSchema),
  });

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
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to update service. Please try again."
      );
    },
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (serviceData) {
      // Parse features and includedServices from JSON strings
      const parsedFeatures = serviceData.features
        ? typeof serviceData.features == "string"
          ? JSON.parse(serviceData.features)
          : serviceData.features
        : [];
      const parsedIncludedServices = serviceData.includedServices
        ? typeof serviceData.includedServices == "string"
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
            <strong>Category:</strong> {data.category}
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
        // Filter out empty strings and ensure proper array format
        const cleanFeatures =
          data.features?.filter((f) => f && f.trim() !== "") || [];
        const cleanIncludedServices =
          data.includedServices?.filter((s) => s && s.trim() !== "") || [];

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
        ? typeof serviceData.features == "string"
          ? JSON.parse(serviceData.features)
          : serviceData.features
        : [];
      const parsedIncludedServices = serviceData.includedServices
        ? typeof serviceData.includedServices == "string"
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
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)}>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<EditServiceForm>
                      name="serviceId"
                      title="Service ID"
                      placeholder="Auto-generated"
                      required={false}
                      disable
                    />
                  </div>
                  <div>
                    <TextInput<EditServiceForm>
                      name="serviceName"
                      title="Service Name"
                      placeholder="Enter service name"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<EditServiceForm>
                      name="category"
                      title="Category"
                      placeholder="Select category"
                      required={true}
                      options={[
                        { label: "New License", value: "NEW_LICENSE" },
                        { label: "I Hold License", value: "I_HOLD_LICENSE" },
                        { label: "Transport", value: "TRANSPORT" },
                        { label: "IDP", value: "IDP" },
                      ]}
                    />
                  </div>
                  <div>
                    <TextInput<EditServiceForm>
                      name="duration"
                      title="Duration (Days)"
                      placeholder="e.g., 30"
                      required
                      onlynumber
                    />
                  </div>
                  <div>
                    <MultiSelect<EditServiceForm>
                      name="status"
                      title="Status"
                      placeholder="Select status"
                      required={true}
                      options={[
                        { label: "Active", value: "ACTIVE" },
                        { label: "Inactive", value: "INACTIVE" },
                        { label: "Upcoming", value: "UPCOMING" },
                        { label: "Discontinued", value: "DISCONTINUED" },
                      ]}
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
                    <TaxtAreaInput<EditServiceForm>
                      name="description"
                      title="Description"
                      placeholder="Enter detailed service description"
                      required
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
                    <TaxtAreaInput<EditServiceForm>
                      name="requirements"
                      title="Requirements (Optional)"
                      placeholder="Enter service requirements (prerequisites, documents needed, etc.)"
                      required={false}
                    />
                  </div>
                  <div>
                    <TaxtAreaInput<EditServiceForm>
                      name="termsAndConditions"
                      title="Terms & Conditions (Optional)"
                      placeholder="Enter terms and conditions"
                      required={false}
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
                  onClick={() => router.push(`/admin/service/${serviceId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={updateServiceMutation.isPending}
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
