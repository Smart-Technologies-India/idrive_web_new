"use client";

import { use, useEffect, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Card, Modal, Spin } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignCheckOutlined,
} from "@/components/icons";

// Temporary form interface - will be replaced with schema
interface EditServiceForm {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  features: string;
  requirements: string;
  termsAndConditions: string;
  includedServices: string;
  activeUsers: string;
  totalRevenue: string;
  status: string;
}

const EditServicePage = ({ params }: { params: Promise<{ serviceId: string }> }) => {
  const router = useRouter();
  const { serviceId: serviceIdStr } = use(params);
  const serviceId = parseInt(serviceIdStr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<EditServiceForm>();

  // Mock data - Replace with actual API call
  const serviceData = useMemo(() => ({
    id: serviceId,
    serviceId: "SRV-001",
    serviceName: "Two Wheeler License",
    serviceType: "LICENSE",
    category: "Two Wheeler",
    price: 5000,
    duration: 365,
    status: "ACTIVE",
    activeUsers: 150,
    totalRevenue: 750000,
    description: "Complete two wheeler driving license training program",
    features: "20 hours of practical training\n10 sessions of theory classes\nRoad safety training\nRTO test preparation\nLicense application assistance",
    requirements: "Minimum age 16 years, Valid Aadhar card, Medical fitness certificate",
    termsAndConditions: "Valid for 365 days from purchase date. Non-transferable. Refund policy as per terms.",
    includedServices: "Theory Classes, Practical Training, Mock Test, RTO Assistance",
  }), [serviceId]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (serviceData) {
        methods.reset({
          serviceId: serviceData.serviceId,
          serviceName: serviceData.serviceName,
          serviceType: serviceData.serviceType,
          category: serviceData.category,
          price: serviceData.price.toString(),
          duration: serviceData.duration.toString(),
          description: serviceData.description,
          features: serviceData.features,
          requirements: serviceData.requirements,
          termsAndConditions: serviceData.termsAndConditions,
          includedServices: serviceData.includedServices,
          activeUsers: serviceData.activeUsers.toString(),
          totalRevenue: serviceData.totalRevenue.toString(),
          status: serviceData.status,
        });
      }
      setIsLoading(false);
    }, 500);
  }, [methods, serviceData]);

  const onSubmit = (data: EditServiceForm) => {
    Modal.confirm({
      title: "Confirm Service Update",
      content: (
        <div>
          <p><strong>Service Name:</strong> {data.serviceName}</p>
          <p><strong>Service Type:</strong> {data.serviceType}</p>
          <p><strong>Status:</strong> {data.status}</p>
          <br />
          <p>Are you sure you want to update this service?</p>
        </div>
      ),
      okText: "Yes, Update Service",
      cancelText: "Cancel",
      onOk: async () => {
        setIsSubmitting(true);
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          Modal.success({
            title: "Service Updated Successfully!",
            content: (
              <div className="space-y-2">
                <p><strong>Service Name:</strong> {data.serviceName}</p>
                <p><strong>Status:</strong> {data.status}</p>
              </div>
            ),
            onOk: () => router.push(`/mtadmin/service/${serviceId}`),
          });
        } catch {
          toast.error("Failed to update service. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      },
      okButtonProps: {
        className: "!bg-blue-600",
      },
    });
  };

  const handleReset = () => {
    if (serviceData) {
      methods.reset({
        serviceId: serviceData.serviceId,
        serviceName: serviceData.serviceName,
        serviceType: serviceData.serviceType,
        category: serviceData.category,
        price: serviceData.price.toString(),
        duration: serviceData.duration.toString(),
        description: serviceData.description,
        features: serviceData.features,
        requirements: serviceData.requirements,
        termsAndConditions: serviceData.termsAndConditions,
        includedServices: serviceData.includedServices,
        activeUsers: serviceData.activeUsers.toString(),
        totalRevenue: serviceData.totalRevenue.toString(),
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

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl text-gray-600">Service not found</h2>
          <Button 
            type="primary" 
            className="mt-4"
            onClick={() => router.push("/mtadmin/service")}
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
              onClick={() => router.push(`/mtadmin/service/${serviceId}`)}
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
                      Service ID <span className="text-gray-500">(Auto-generated)</span>
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
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("serviceType", { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="LICENSE">License Service</option>
                      <option value="ADDON">Add-on</option>
                    </select>
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
                      <option value="Commercial Vehicle">Commercial Vehicle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...methods.register("price", { required: true })}
                      type="number"
                      placeholder="e.g., 5000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
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

              {/* Statistics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Active Users <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      {...methods.register("activeUsers")}
                      type="number"
                      placeholder="e.g., 150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Revenue (₹) <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      {...methods.register("totalRevenue")}
                      type="number"
                      placeholder="e.g., 750000"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features <span className="text-gray-500">(Optional - One per line)</span>
                    </label>
                    <textarea
                      {...methods.register("features")}
                      placeholder="Enter features, one per line"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Included Services <span className="text-gray-500">(Optional - Comma separated)</span>
                    </label>
                    <input
                      {...methods.register("includedServices")}
                      type="text"
                      placeholder="e.g., Theory Classes, Practical Training, Mock Test"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements <span className="text-gray-500">(Optional)</span>
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
                      Terms & Conditions <span className="text-gray-500">(Optional)</span>
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
