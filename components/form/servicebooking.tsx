"use client";
import { FormProvider, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { TextInput } from "./inputfields/textinput";
import { TaxtAreaInput } from "./inputfields/textareainput";
import { MultiSelect } from "./inputfields/multiselect";
import { Modal, Button, Tag, Spin, Drawer, Input } from "antd";
import { getCookie } from "cookies-next";
import {
  getAllSchoolServices,
  type SchoolService,
} from "@/services/school-service.api";
import { searchUserByContact, type User } from "@/services/user.api";
import {
  CheckCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CheckSquareOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import type { Customer } from "@/schema/booking";

// Types for form data
type FormService = {
  id: number;
  schoolServiceId: number;
  name: string;
  licensePrice: number;
  addonPrice: number;
  serviceType: string;
  description?: string;
  duration: number;
};

type ServiceBookingFormData = {
  customerMobile: string;
  customerName: string;
  customerEmail: string;
  serviceId: number;
  schoolServiceId: number;
  serviceName: string;
  servicePrice: number;
  selectedService?: FormService;
  totalAmount: number;
  notes: string;
};

const ServiceBookingForm = () => {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<ServiceBookingFormData | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<FormService | null>(
    null
  );
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [showCreateUserDrawer, setShowCreateUserDrawer] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserContact, setNewUserContact] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Get school ID from cookie
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch services for the school from schoolService table
  const { data: servicesResponse, isLoading: loadingServices } = useQuery({
    queryKey: ["schoolServices", schoolId],
    queryFn: () =>
      getAllSchoolServices({
        whereSearchInput: {
          schoolId: schoolId,
          status: "ACTIVE",
        },
      }),
    enabled: schoolId > 0,
  });

  const services: FormService[] =
    servicesResponse?.data?.getAllSchoolService
      ?.filter(
        (ss: SchoolService) =>
          ss.service &&
          (ss.service.category == "NEW_LICENSE" ||
            ss.service.category == "I_HOLD_LICENSE")
      ) // Only license-related services
      ?.map((schoolService: SchoolService) => ({
        id: schoolService.service!.id,
        schoolServiceId: schoolService.id,
        name: schoolService.service!.serviceName,
        licensePrice: schoolService.licensePrice,
        addonPrice: schoolService.addonPrice,
        serviceType: schoolService.service!.category,
        description: schoolService.service!.description,
        duration: schoolService.service!.duration,
      })) || [];

  const methods = useForm<ServiceBookingFormData>({
    mode: "onChange",
    defaultValues: {
      customerMobile: "",
      customerName: "",
      customerEmail: "",
      serviceId: 0,
      schoolServiceId: 0,
      serviceName: "",
      servicePrice: 0,
      totalAmount: 0,
      notes: "",
    },
  });

  const { watch, setValue } = methods;
  const formValues = watch();
  const watchedServiceId = watch("serviceId");

  // Watch for service selection changes
  useEffect(() => {
    if (watchedServiceId && watchedServiceId !== 0 && services.length > 0) {
      const numericServiceId =
        typeof watchedServiceId == "string"
          ? parseInt(watchedServiceId)
          : watchedServiceId;

      if (!selectedService || selectedService.id !== numericServiceId) {
        const service = services.find((s) => s.id == numericServiceId);
        if (service) {
          setSelectedService(service);
          setValue("schoolServiceId", service.schoolServiceId, {
            shouldValidate: false,
          });
          setValue("serviceName", service.name, { shouldValidate: false });
          setValue("servicePrice", service.licensePrice, {
            shouldValidate: false,
          });
          setValue("totalAmount", service.licensePrice, {
            shouldValidate: false,
          });
        }
      }
    } else if (watchedServiceId == 0 && selectedService) {
      setSelectedService(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedServiceId]);

  // Mutation for fetching customer details
  const { mutate: fetchCustomer, isPending: loadingCustomer } = useMutation({
    mutationFn: async (mobile: string) => {
      if (mobile.length < 10) {
        throw new Error("Invalid mobile number");
      }
      // Search for user across all schools with USER role
      return await searchUserByContact(mobile);
    },
    onSuccess: (response) => {
      const data = response.data as { searchUser?: User };
      if (response.status && data.searchUser) {
        const user: User = data.searchUser;

        const customerData: Customer = {
          id: user.id,
          name: user.name,
          contact1: user.contact1,
          contact2: user.contact2,
          email: user.email,
          address: user.address,
          role: user.role,
          status: user.status,
        };

        setCustomerData(customerData);
        setValue("customerName", user.name);
        setValue("customerEmail", user.email || "");
        toast.success("Customer details loaded successfully!");
        router.back();
      } else {
        setCustomerData(null);
        setValue("customerName", "");
        setValue("customerEmail", "");
        setNewUserContact(formValues.customerMobile);
        setShowCreateUserDrawer(true);
      }
    },
    onError: () => {
      toast.error("Failed to fetch customer details");
      setCustomerData(null);
      setValue("customerName", "");
      setValue("customerEmail", "");
    },
  });

  // Handle mobile number change with debounce
  useEffect(() => {
    const mobile = formValues.customerMobile;
    if (mobile && mobile.length >= 10) {
      const timer = setTimeout(() => {
        fetchCustomer(mobile);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setCustomerData(null);
      setValue("customerName", "");
      setValue("customerEmail", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.customerMobile]);

  // Mutation for creating new user
  const { mutate: createUser } = useMutation({
    mutationFn: async (data: { name: string; contact1: string }) => {
      return await ApiCall({
        query: `mutation CreateUser($inputType: CreateUserInput!) {
          createUser(inputType: $inputType) {
            id
            name
            contact1
            email
            role
            status
          }
        }`,
        variables: {
          inputType: {
            name: data.name,
            contact1: data.contact1,
            role: "USER",
            status: "ACTIVE",
            schoolId: schoolId,
          },
        },
      });
    },
    onSuccess: (response) => {
      const data = response.data as { createUser?: User };
      if (response.status && data.createUser) {
        const newUser = data.createUser;

        const customerData: Customer = {
          id: newUser.id,
          name: newUser.name,
          contact1: newUser.contact1,
          contact2: "",
          email: newUser.email || "",
          address: "",
          role: newUser.role,
          status: newUser.status,
        };

        setCustomerData(customerData);
        setValue("customerName", newUser.name);
        setValue("customerEmail", newUser.email || "");
        setShowCreateUserDrawer(false);
        setNewUserName("");
        setNewUserContact("");
        toast.success("User created successfully!");
      } else {
        toast.error(response.message || "Failed to create user");
      }
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    },
  });

  // Handle create user submit
  const handleCreateUser = () => {
    if (!newUserName || newUserName.trim().length < 3) {
      toast.error("Please enter a valid name (minimum 3 characters)");
      return;
    }
    if (!newUserContact || newUserContact.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setCreatingUser(true);
    createUser(
      { name: newUserName, contact1: newUserContact },
      {
        onSettled: () => {
          setCreatingUser(false);
        },
      }
    );
  };

  // Calculate progress
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 3; // Total required fields

    if (formValues.customerMobile && formValues.customerMobile.length >= 10)
      completed++;
    if (customerData) completed++;
    if (formValues.serviceId) completed++;

    return Math.round((completed / total) * 100);
  };

  // Validate form
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    console.log("Validating form with values:", formValues);
    const errors: string[] = [];

    if (!formValues.customerMobile || formValues.customerMobile.length !== 10) {
      errors.push("Please enter a valid 10-digit mobile number");
    }

    if (!customerData) {
      errors.push("Customer details could not be loaded");
    }

    if (!formValues.serviceId || formValues.serviceId == 0) {
      errors.push("Please select a service");
    }

    if (formValues.totalAmount <= 0) {
      errors.push("Please select a service to calculate the booking amount");
    }

    return {
      isValid: errors.length == 0,
      errors,
    };
  };

  // Handle form submission
  const handleSubmit = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setPendingData(formValues);
    setShowConfirmModal(true);
  };

  // Mutation for API call
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ServiceBookingFormData) => {
      // Generate confirmation number for service booking
      const confirmationNumber = `SB${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`;

      // Create the booking service record directly (no need for base booking)
      const serviceResponse = await ApiCall({
        query: `mutation CreateBookingService($inputType: CreateBookingServiceInput!) {
          createBookingService(inputType: $inputType) {
            id
            schoolServiceId
            schoolId
            userId
            confirmationNumber
          }
        }`,
        variables: {
          inputType: {
            schoolId: schoolId,
            userId: customerData?.id,
            schoolServiceId: data.schoolServiceId, // Use schoolServiceId instead of serviceId
            serviceName: data.serviceName,
            serviceType: "LICENSE", // Always LICENSE for this page
            price: data.servicePrice,
            description: data.selectedService?.description || "",
            confirmationNumber: confirmationNumber,
          },
        },
      });

      if (!serviceResponse.status) {
        throw new Error(
          serviceResponse.message || "Failed to create booking service"
        );
      }

      return serviceResponse;
    },
    onSuccess: () => {
      toast.success("Service booking created successfully!");
      setShowConfirmModal(false);
      router.push("/mtadmin/servicebooking");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to create service booking. Please try again."
      );
    },
  });

  // Confirm booking
  const confirmBooking = () => {
    if (pendingData) {
      mutate(pendingData);
    }
  };

  const progress = calculateProgress();

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingOutlined className="text-blue-600" />
                  New Service Booking
                </h1>
                <p className="text-gray-600 mt-2">
                  Book license services and add-ons for customers
                </p>
              </div>
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/mtadmin/servicebooking")}
              >
                Back to Service Bookings
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Booking Progress
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <UserOutlined className="text-blue-600" />
                  Customer Details
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <TextInput
                      name="customerMobile"
                      title="Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required
                      maxlength={10}
                      onlynumber
                    />
                    {loadingCustomer && (
                      <div className="absolute right-3 top-11">
                        <Spin size="small" />
                      </div>
                    )}
                  </div>

                  {customerData && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircleOutlined className="text-green-600 text-xl" />
                        <span className="font-bold text-green-700">
                          Customer Found!
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-semibold text-gray-900">
                            {customerData.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-semibold text-gray-900">
                            {customerData.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Primary Contact:
                          </span>
                          <p className="font-semibold text-gray-900">
                            {customerData.contact1}
                          </p>
                        </div>
                        {customerData.contact2 && (
                          <div>
                            <span className="text-gray-600">
                              Secondary Contact:
                            </span>
                            <p className="font-semibold text-gray-900">
                              {customerData.contact2}
                            </p>
                          </div>
                        )}
                        {customerData.address && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Address:</span>
                            <p className="font-semibold text-gray-900">
                              {customerData.address}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Role:</span>
                          <p className="font-semibold text-gray-900 capitalize">
                            {customerData.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Selection Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckSquareOutlined className="text-blue-600" />
                  Select Service
                </h2>

                <div className="space-y-4">
                  <MultiSelect<ServiceBookingFormData>
                    name="serviceId"
                    title=""
                    placeholder={
                      loadingServices
                        ? "Loading services..."
                        : "Choose a license service"
                    }
                    required={true}
                    options={services.map((service) => ({
                      value: service.id.toString(),
                      label: `${
                        service.name
                      } - ₹${service.licensePrice.toLocaleString("en-IN")}`,
                    }))}
                    disable={loadingServices}
                  />

                  {selectedService && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-300 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between border-b border-blue-200 pb-3">
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {selectedService.name}
                            </p>
                            <Tag
                              color={
                                selectedService.serviceType == "NEW_LICENSE"
                                  ? "purple"
                                  : selectedService.serviceType ==
                                    "I_HOLD_LICENSE"
                                  ? "blue"
                                  : "cyan"
                              }
                              className="mt-2"
                            >
                              {selectedService.serviceType}
                            </Tag>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">License Fee</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₹
                              {selectedService.licensePrice.toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">📅</span>
                            <p className="text-xs text-gray-500 font-semibold">
                              Duration
                            </p>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedService.duration} Days
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📝</span>
                            <p className="text-xs text-gray-500 font-semibold">
                              Description
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">
                            {selectedService.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {services.length == 0 && !loadingServices && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No services available for this school</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Additional Notes
                </h2>
                <TaxtAreaInput
                  name="notes"
                  title=""
                  placeholder="Any special requirements or notes..."
                  required={false}
                />
              </div>
            </div>

            {/* Summary - Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarOutlined className="text-green-600" />
                  Booking Summary
                </h2>

                <div className="space-y-4">
                  {/* Customer Info */}
                  {customerData && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-semibold text-gray-900">
                          {customerData.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-semibold text-gray-900">
                          {customerData.contact1}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Service */}
                  {selectedService && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Service:</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">
                          {selectedService.name}
                        </span>
                        <span className="font-bold text-blue-600">
                          ₹
                          {selectedService.licensePrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        ₹{(formValues.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Service booking fee</p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleSubmit}
                    disabled={progress < 100}
                    className="mt-6 h-12 text-lg font-semibold"
                    icon={<CheckCircleOutlined />}
                  >
                    Create Service Booking
                  </Button>

                  {progress < 100 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Complete all required fields to create booking
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            <CheckCircleOutlined className="text-blue-600" />
            <span>Confirm Service Booking</span>
          </div>
        }
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={[
          <Button
            key="cancel"
            size="large"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            size="large"
            loading={isPending}
            onClick={confirmBooking}
            icon={<CheckCircleOutlined />}
          >
            Confirm & Create Booking
          </Button>,
        ]}
        width={700}
      >
        {pendingData && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.customerName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Mobile:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.customerMobile}
                  </p>
                </div>
                {pendingData.customerEmail && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <p className="font-semibold text-gray-900">
                      {pendingData.customerEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3">Selected Service</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {pendingData.serviceName}
                    </span>
                    {pendingData.selectedService && (
                      <div className="mt-1">
                        <Tag
                          color={
                            pendingData.selectedService.serviceType ==
                            "NEW_LICENSE"
                              ? "purple"
                              : pendingData.selectedService.serviceType ==
                                "I_HOLD_LICENSE"
                              ? "blue"
                              : "cyan"
                          }
                        >
                          {pendingData.selectedService.serviceType}
                        </Tag>
                      </div>
                    )}
                  </div>
                  <span className="text-blue-600 font-bold">
                    ₹{pendingData.servicePrice.toLocaleString("en-IN")}
                  </span>
                </div>
                {pendingData.selectedService && (
                  <div className="pt-2 border-t border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Duration:</p>
                    <p className="text-sm text-gray-900">
                      {pendingData.selectedService.duration} Days
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  ₹{pendingData.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {pendingData.notes && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-700">{pendingData.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create User Drawer */}
      <Drawer
        title="Create New User"
        placement="right"
        width={400}
        onClose={() => {
          setShowCreateUserDrawer(false);
          setNewUserName("");
          setNewUserContact("");
        }}
        open={showCreateUserDrawer}
        footer={
          <div className="flex gap-2">
            <Button
              block
              size="large"
              onClick={() => {
                setShowCreateUserDrawer(false);
                setNewUserName("");
                setNewUserContact("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              block
              size="large"
              loading={creatingUser}
              onClick={handleCreateUser}
            >
              Create User
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>User not found!</strong> Create a new user account with
              the contact number provided.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              size="large"
              placeholder="Enter full name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <Input
              size="large"
              placeholder="Enter 10-digit mobile number"
              value={newUserContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setNewUserContact(value);
              }}
              maxLength={10}
              disabled
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">User Details</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Role:</strong> USER
              </li>
              <li>
                • <strong>Status:</strong> ACTIVE
              </li>
              <li>
                • <strong>School:</strong> Your School
              </li>
            </ul>
          </div>
        </div>
      </Drawer>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </FormProvider>
  );
};

export default ServiceBookingForm;
