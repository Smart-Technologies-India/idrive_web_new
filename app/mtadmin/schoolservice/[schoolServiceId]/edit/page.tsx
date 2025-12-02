"use client";

import { use, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  EditSchoolServiceForm,
  EditSchoolServiceSchema,
} from "@/schema/editschoolservice";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { Button, Card, Spin, Alert, Modal, Select } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";
import {
  getSchoolServiceById,
  updateSchoolService,
} from "@/services/school-service.api";
import { getAllServices } from "@/services/service.api";

const EditSchoolServicePage = ({
  params,
}: {
  params: Promise<{ schoolServiceId: string }>;
}) => {
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const { schoolServiceId } = use(params);
  const numericId = parseInt(schoolServiceId);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const formatCategory = (category: string) => {
    const categoryLabels: Record<string, string> = {
      NEW_LICENSE: "New License",
      I_HOLD_LICENSE: "I Hold License",
      TRANSPORT: "Transport",
      IDP: "IDP",
    };
    return categoryLabels[category] || category;
  };

  const methods = useForm<EditSchoolServiceForm>({
    resolver: valibotResolver(EditSchoolServiceSchema),
  });

  // Fetch all active services
  const { data: servicesResponse } = useQuery({
    queryKey: ["allServices"],
    queryFn: async () => {
      return await getAllServices({
        status: "ACTIVE",
      });
    },
  });

  // Filter services by selected category
  const filteredServices = selectedCategory
    ? servicesResponse?.data?.getAllService?.filter(
        (service) => service.category == selectedCategory
      )
    : servicesResponse?.data?.getAllService;

  const serviceOptions =
    filteredServices?.map((service) => ({
      label: `${service.serviceName} - ${formatCategory(service.category)} (${service.duration} days)`,
      value: service.id.toString(),
    })) || [];

  // Fetch existing school service data
  const {
    data: serviceResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schoolService", numericId],
    queryFn: async () => {
      if (!numericId || isNaN(numericId)) {
        throw new Error("Invalid school service ID");
      }
      return await getSchoolServiceById(numericId);
    },
    enabled: !isNaN(numericId),
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (
      serviceResponse?.status &&
      serviceResponse.data.getSchoolServiceById &&
      !initialDataLoaded.current
    ) {
      const service = serviceResponse.data.getSchoolServiceById;
      methods.reset({
        serviceId: service.serviceId,
        licensePrice: service.licensePrice,
        addonPrice: service.addonPrice,
        status: service.status,
      });
      initialDataLoaded.current = true;
    }
  }, [serviceResponse, methods]);

  // Update school service mutation
  const updateSchoolServiceMutation = useMutation({
    mutationKey: ["updateSchoolService"],
    mutationFn: async (data: EditSchoolServiceForm) => {
      const updateData = {
        serviceId: parseInt(data.serviceId.toString()),
        licensePrice: parseFloat(data.licensePrice.toString()),
        addonPrice: parseFloat(data.addonPrice.toString()),
        status: data.status,
      };
      return await updateSchoolService(numericId, updateData);
    },
    onSuccess: (response) => {
      if (response.status && response.data?.updateSchoolService) {
        const schoolService = response.data.updateSchoolService;
        const selectedService = servicesResponse?.data?.getAllService?.find(
          (s) => s.id == schoolService.serviceId
        );
        Modal.success({
          title: "School Service Updated Successfully",
          content: (
            <div className="space-y-2">
              <p>
                <strong>Service:</strong> {selectedService?.serviceName}
              </p>
              <p>
                <strong>License Price:</strong> ₹
                {schoolService.licensePrice.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Addon Price:</strong> ₹
                {schoolService.addonPrice.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Status:</strong> {schoolService.status}
              </p>
            </div>
          ),
          onOk: () => router.push(`/mtadmin/schoolservice/${numericId}`),
        });
      } else {
        toast.error(response.message || "Failed to update school service");
      }
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "An error occurred while updating the school service"
      );
    },
  });

  const onSubmit = (data: EditSchoolServiceForm) => {
    updateSchoolServiceMutation.mutate(data);
  };

  const handleReset = () => {
    if (
      serviceResponse?.status &&
      serviceResponse.data.getSchoolServiceById
    ) {
      const service = serviceResponse.data.getSchoolServiceById;
      methods.reset({
        serviceId: service.serviceId,
        licensePrice: service.licensePrice,
        addonPrice: service.addonPrice,
        status: service.status,
      });
      toast.info("Form reset to original values");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading school service details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Error Loading School Service"
          description={error?.message || "Failed to load school service details"}
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
              onClick={() => router.push(`/mtadmin/schoolservice/${numericId}`)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit School Service
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Update service pricing for your school
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-3xl">
        <Card className="shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)}>
              {/* Service Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Service Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Category
                    </label>
                    <Select
                      size="large"
                      placeholder="Select category to filter services"
                      allowClear
                      className="w-full"
                      value={selectedCategory}
                      onChange={(value) => setSelectedCategory(value)}
                      options={[
                        { label: "New License", value: "NEW_LICENSE" },
                        { label: "I Hold License", value: "I_HOLD_LICENSE" },
                        { label: "Transport", value: "TRANSPORT" },
                        { label: "IDP", value: "IDP" },
                      ]}
                    />
                  </div>
                  <div>
                    <MultiSelect<EditSchoolServiceForm>
                      name="serviceId"
                      title="Select Service"
                      placeholder={selectedCategory ? "Choose a service from the list" : "Please select a category first"}
                      required={true}
                      options={serviceOptions}
                      disable={!selectedCategory}
                    />
                  </div>

                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> First select a category to filter services, then you can change the service associated with this pricing configuration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<EditSchoolServiceForm>
                      name="licensePrice"
                      title="License Price (₹)"
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<EditSchoolServiceForm>
                      name="addonPrice"
                      title="Addon Price (₹)"
                      placeholder="e.g., 2000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Status
                </h3>
                <div>
                  <MultiSelect<EditSchoolServiceForm>
                    name="status"
                    title="Service Status"
                    placeholder="Select status"
                    required={true}
                    options={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Inactive", value: "INACTIVE" },
                    ]}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button size="large" onClick={handleReset}>
                  Reset Form
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<AntDesignCheckOutlined />}
                  loading={updateSchoolServiceMutation.isPending}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Update School Service
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default EditSchoolServicePage;
