"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddSchoolServiceForm, AddSchoolServiceSchema } from "@/schema/addschoolservice";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { Button, Card, Modal, Select } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { getCookie } from "cookies-next";
import { createSchoolService } from "@/services/school-service.api";
import { getAllServices } from "@/services/service.api";

const AddSchoolServicePage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
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

  const methods = useForm<AddSchoolServiceForm>({
    resolver: valibotResolver(AddSchoolServiceSchema),
    defaultValues: {
      licensePrice: 0,
      addonPrice: 0,
    },
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

  // Create school service mutation
  const createSchoolServiceMutation = useMutation({
    mutationKey: ["createSchoolService"],
    mutationFn: async (data: AddSchoolServiceForm) => {
      const createData = {
        schoolId,
        serviceId: parseInt(data.serviceId.toString()),
        licensePrice: parseFloat(data.licensePrice.toString()),
        addonPrice: parseFloat(data.addonPrice.toString()),
      };
      const selectedService = servicesResponse?.data?.getAllService?.find(
        (s) => s.id == parseInt(data.serviceId.toString())
      );
      return { response: await createSchoolService(createData), selectedService };
    },
    onSuccess: ({ response, selectedService }) => {
      if (response.status && response.data?.createSchoolService) {
        const schoolService = response.data.createSchoolService;
        Modal.success({
          title: "School Service Added Successfully",
          content: (
            <div className="space-y-2">
              <p>
                <strong>Service:</strong> {selectedService?.serviceName}
              </p>
              <p>
                <strong>Category:</strong> {formatCategory(selectedService?.category || "")}
              </p>
              <p>
                <strong>License Price:</strong> ₹
                {schoolService.licensePrice.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Addon Price:</strong> ₹
                {schoolService.addonPrice.toLocaleString("en-IN")}
              </p>
            </div>
          ),
          onOk: () => router.push("/mtadmin/schoolservice"),
        });
      } else {
        toast.error(response.message || "Failed to add school service");
      }
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "An error occurred while adding the school service"
      );
    },
  });

  const onSubmit = (data: AddSchoolServiceForm) => {
    createSchoolServiceMutation.mutate(data);
  };

  const handleReset = () => {
    methods.reset({
      licensePrice: 0,
      addonPrice: 0,
    });
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
              onClick={() => router.push("/mtadmin/schoolservice")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New School Service
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Configure pricing for a service at your school
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
                    <MultiSelect<AddSchoolServiceForm>
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
                      <strong>ℹ️ Note:</strong> First select a category to filter services, then choose a service created by the admin. You can set different prices for license and addon services.
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
                    <TextInput<AddSchoolServiceForm>
                      name="licensePrice"
                      title="License Price (₹)"
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<AddSchoolServiceForm>
                      name="addonPrice"
                      title="Addon Price (₹)"
                      placeholder="e.g., 2000"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Pricing Guide:</strong>
                    <br />
                    • <strong>License Price:</strong> Set the price for license-related services (e.g., learner&apos;s license, permanent license)
                    <br />
                    • <strong>Addon Price:</strong> Set the price for addon services (e.g., extra classes, advanced training)
                  </p>
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
                  icon={<AntDesignPlusCircleOutlined />}
                  loading={createSchoolServiceMutation.isPending}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Add School Service
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default AddSchoolServicePage;
