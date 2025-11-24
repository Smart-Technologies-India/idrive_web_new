"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddServiceForm, AddServiceSchema } from "@/schema/addservice";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { Button, Card, Modal } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { getCookie } from "cookies-next";
import { createService } from "@/services/service.api";

const AddServicePage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const methods = useForm<AddServiceForm>({
    resolver: valibotResolver(AddServiceSchema),
    defaultValues: {
      serviceType: "LICENSE",
    },
  });

  const createServiceMutation = useMutation({
    mutationKey: ["createService"],
    mutationFn: async (data: AddServiceForm) => {
      if (!schoolId) {
        throw new Error("School ID not found. Please login again.");
      }

      // Generate serviceId: SRV-{schoolId}-{timestamp}
      const serviceId = `SRV-${schoolId}-${Date.now()}`;

      // Create service
      const serviceResponse = await createService({
        schoolId: schoolId,
        serviceId: serviceId,
        serviceName: data.serviceName,
        serviceType: data.serviceType as "LICENSE" | "ADDON",
        category: data.category,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        description: data.description,
        features: data.features,
        includedServices: data.includedServices,
        requirements: data.requirements,
        termsAndConditions: data.termsAndConditions,
      });

      if (!serviceResponse.status) {
        throw new Error(serviceResponse.message || "Failed to create service");
      }

      return { service: serviceResponse.data };
    },
    onSuccess: (response) => {
      if (response.service?.createService) {
        const service = response.service.createService;
        Modal.success({
          title: "Service Created Successfully!",
          content: (
            <div className="space-y-2">
              <p><strong>Service Name:</strong> {service.serviceName}</p>
              <p><strong>Service Type:</strong> {service.serviceType}</p>
              <p><strong>Category:</strong> {service.category}</p>
              <p><strong>Duration:</strong> {service.duration} days</p>
              <p><strong>Price:</strong> ₹{service.price}</p>
            </div>
          ),
          onOk: () => router.push("/mtadmin/service"),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create service. Please try again.");
    },
  });

  const onSubmit = (data: AddServiceForm) => {
    Modal.confirm({
      title: "Confirm Service Creation",
      content: (
        <div>
          <p><strong>Service Name:</strong> {data.serviceName}</p>
          <p><strong>Service Type:</strong> {data.serviceType}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <p><strong>Duration:</strong> {data.duration} days</p>
          <p><strong>Price:</strong> ₹{data.price}</p>
          <br />
          <p>Are you sure you want to create this service?</p>
        </div>
      ),
      okText: "Yes, Create Service",
      cancelText: "Cancel",
      onOk: () => {
        createServiceMutation.mutate(data);
      },
      okButtonProps: {
        className: "!bg-green-600",
      },
    });
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
              onClick={() => router.push("/mtadmin/service")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Create a new license service or add-on offering
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
                    <TextInput<AddServiceForm>
                      name="serviceName"
                      title="Service Name"
                      placeholder="Enter service name"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<AddServiceForm>
                      name="serviceType"
                      title="Service Type"
                      placeholder="Select service type"
                      required={true}
                      options={[
                        { label: "License", value: "LICENSE" },
                        { label: "Add-on", value: "ADDON" },
                      ]}
                    />
                  </div>
                  <div>
                    <MultiSelect<AddServiceForm>
                      name="category"
                      title="Category"
                      placeholder="Select category"
                      required={true}
                      options={[
                        { label: "Two Wheeler", value: "Two Wheeler" },
                        { label: "Four Wheeler", value: "Four Wheeler" },
                        { label: "Heavy Vehicle", value: "Heavy Vehicle" },
                        { label: "Commercial Vehicle", value: "Commercial Vehicle" },
                      ]}
                    />
                  </div>
                  <div>
                    <TextInput<AddServiceForm>
                      name="price"
                      title="Price (₹)"
                      placeholder="e.g., 5000"
                      required
                      onlynumber
                      numdes
                    />
                  </div>
                  <div>
                    <TextInput<AddServiceForm>
                      name="duration"
                      title="Duration (Days)"
                      placeholder="e.g., 30"
                      required
                      onlynumber
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
                    <TaxtAreaInput<AddServiceForm>
                      name="description"
                      title="Description"
                      placeholder="Enter detailed service description"
                      required
                    />
                  </div>
                  <div>
                    <TaxtAreaInput<AddServiceForm>
                      name="features"
                      title="Key Features (Optional)"
                      placeholder="Enter key features (one per line or comma-separated)"
                      required={false}
                    />
                  </div>
                  <div>
                    <TaxtAreaInput<AddServiceForm>
                      name="includedServices"
                      title="Included Services (Optional)"
                      placeholder="Enter what's included in this service"
                      required={false}
                    />
                  </div>
                  <div>
                    <TaxtAreaInput<AddServiceForm>
                      name="requirements"
                      title="Requirements (Optional)"
                      placeholder="Enter service requirements (prerequisites, documents needed, etc.)"
                      required={false}
                    />
                  </div>
                  <div>
                    <TaxtAreaInput<AddServiceForm>
                      name="termsAndConditions"
                      title="Terms & Conditions (Optional)"
                      placeholder="Enter terms and conditions"
                      required={false}
                    />
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Important Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>
                    Service ID will be generated automatically based on your school
                  </li>
                  <li>
                    The service will be created with ACTIVE status by default
                  </li>
                  <li>
                    You can edit service details and update status later from the service list
                  </li>
                  <li>
                    Duration is specified in days for consistency
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
                  onClick={() => router.push("/mtadmin/service")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={createServiceMutation.isPending}
                  icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Add Service
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default AddServicePage;
