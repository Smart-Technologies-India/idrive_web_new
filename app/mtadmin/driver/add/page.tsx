"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddDriverForm, AddDriverSchema } from "@/schema/adddriver";
import { TextInput } from "@/components/form/inputfields/textinput";
import { DateInput } from "@/components/form/inputfields/dateinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { Button, Card, Modal } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { createDriver } from "@/services/driver.api";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";

const AddDriverPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const methods = useForm<AddDriverForm>({
    resolver: valibotResolver(AddDriverSchema),
  });

  const createDriverMutation = useMutation({
    mutationKey: ["createDriverWithUser"],
    mutationFn: async (data: AddDriverForm) => {
      if (!schoolId) {
        throw new Error("School ID not found. Please login again.");
      }

      // Generate password: First 4 letters (capitalized) + @ + last 4 mobile digits
      const driverNamePart = data.name.substring(0, 4);
      const formattedName =
        driverNamePart.charAt(0).toUpperCase() +
        driverNamePart.slice(1).toLowerCase();
      const last4Digits = data.mobile.slice(-4);
      const generatedPassword = `${formattedName}@${last4Digits}`;

      // Create user first with DRIVER role
      const userResponse = await ApiCall({
        query: `mutation CreateUser($inputType: CreateUserInput!) {
          createUser(inputType: $inputType) {
            id
            contact1
            role
          }
        }`,
        variables: {
          inputType: {
            contact1: data.mobile,
            password: generatedPassword,
            role: "DRIVER",
            name: data.name,
            schoolId: schoolId,
          },
        },
      });

      if (!userResponse.status) {
        throw new Error(userResponse.message || "Failed to create user");
      }

      const user = (userResponse.data as Record<string, unknown>)[
        "createUser"
      ] as { id: string };

      // Generate driverId: DRV-{schoolId}-{timestamp}
      const driverId = `DRV-${schoolId}-${Date.now()}`;

      // Create driver with userId
      const driverResponse = await createDriver({
        name: data.name,
        email: data.email || undefined,
        mobile: data.mobile,
        alternatePhone: data.alternatePhone,
        address: data.address,
        dateOfBirth: new Date(data.dateOfBirth),
        bloodGroup: data.bloodGroup,
        gender: data.gender,
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        licenseIssueDate: new Date(data.licenseIssueDate),
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        experience: data.experience ? parseInt(data.experience) : undefined,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        emergencyContactName: data.emergencyContactName,
        emergencyContactNumber: data.emergencyContactNumber,
        emergencyContactRelation: data.emergencyContactRelation,
        schoolId: schoolId,
        userId: parseInt(user.id),
        driverId: driverId,
      });

      if (!driverResponse.status) {
        throw new Error(driverResponse.message || "Failed to create driver");
      }

      return {
        driver: driverResponse.data,
        generatedPassword,
        mobile: data.mobile,
      };
    },
    onSuccess: (data) => {
      Modal.success({
        title: "Driver Created Successfully!",
        content: (
          <div className="space-y-2">
            <p>
              <strong>Driver Name:</strong> {data.driver?.createDriver?.name}
            </p>
            <p>
              <strong>Mobile:</strong> {data.mobile}
            </p>
            <p>
              <strong>Login Password:</strong> {data.generatedPassword}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Please note down the password. The driver can use mobile number
              and this password to login.
            </p>
          </div>
        ),
        onOk: () => router.push("/mtadmin/driver"),
      });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to create driver. Please try again."
      );
    },
  });

  const onSubmit = (data: AddDriverForm) => {
    const driverNamePart = data.name.substring(0, 4);
    const formattedName =
      driverNamePart.charAt(0).toUpperCase() +
      driverNamePart.slice(1).toLowerCase();
    const last4Digits = data.mobile.slice(-4);
    const generatedPassword = `${formattedName}@${last4Digits}`;

    Modal.confirm({
      title: "Confirm Driver Creation",
      content: (
        <div>
          <p>
            <strong>Driver Name:</strong> {data.name}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
          <p>
            <strong>Mobile:</strong> {data.mobile}
          </p>
          <p>
            <strong>License Number:</strong> {data.licenseNumber}
          </p>
          <br />
          <p className="text-gray-600">
            A user account will be created automatically with the following
            credentials:
          </p>
          <p className="text-sm text-blue-600">
            <strong>Username:</strong> {data.mobile}
            <br />
            <strong>Password:</strong> {generatedPassword}
          </p>
          <br />
          <p>Are you sure you want to create this driver?</p>
        </div>
      ),
      okText: "Yes, Create Driver",
      cancelText: "Cancel",
      onOk: () => {
        createDriverMutation.mutate(data);
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
              onClick={() => router.push("/mtadmin/driver")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Driver
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Fill in the details to register a new driver
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        <Card className="shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)}>
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<AddDriverForm>
                      name="name"
                      title="Full Name"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <TextInput<AddDriverForm>
                      name="email"
                      title="Email (Optional)"
                      placeholder="Enter email address"
                      required={false}
                    />
                  </div>
                  <div>
                    <TextInput<AddDriverForm>
                      name="mobile"
                      title="Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required
                      onlynumber
                      maxlength={10}
                    />
                  </div>
                  <div>
                    <TextInput<AddDriverForm>
                      name="alternatePhone"
                      title="Alternate Phone (Optional)"
                      placeholder="Enter 10-digit alternate number"
                      required={false}
                      onlynumber
                      maxlength={10}
                    />
                  </div>
                  <div>
                    <DateInput<AddDriverForm>
                      name="dateOfBirth"
                      title="Date of Birth"
                      placeholder="Select date of birth"
                      required
                      maxDate={dayjs().subtract(18, "years")}
                    />
                  </div>
                  <div>
                    <MultiSelect<AddDriverForm>
                      name="bloodGroup"
                      title="Blood Group (Optional)"
                      placeholder="Select blood group"
                      required={false}
                      options={[
                        { label: "A+", value: "A+" },
                        { label: "A-", value: "A-" },
                        { label: "B+", value: "B+" },
                        { label: "B-", value: "B-" },
                        { label: "AB+", value: "AB+" },
                        { label: "AB-", value: "AB-" },
                        { label: "O+", value: "O+" },
                        { label: "O-", value: "O-" },
                      ]}
                    />
                  </div>
                  <div>
                    <MultiSelect<AddDriverForm>
                      name="gender"
                      title="Gender"
                      placeholder="Select gender"
                      required
                      options={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TaxtAreaInput<AddDriverForm>
                      name="address"
                      title="Address"
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput<AddDriverForm>
                      name="licenseNumber"
                      title="License Number"
                      placeholder="e.g., DL-0320190012345"
                      required
                    />
                  </div>
                  <div>
                    <MultiSelect<AddDriverForm>
                      name="licenseType"
                      title="License Type"
                      placeholder="Select license type"
                      required
                      options={[
                        { label: "LMV (Light Motor Vehicle)", value: "LMV" },
                        { label: "MCWG (Motorcycle with Gear)", value: "MCWG" },
                        {
                          label: "MCWOG (Motorcycle without Gear)",
                          value: "MCWOG",
                        },
                        { label: "HMV (Heavy Motor Vehicle)", value: "HMV" },
                      ]}
                    />
                  </div>
                  <div>
                    <DateInput<AddDriverForm>
                      name="licenseIssueDate"
                      title="License Issue Date"
                      placeholder="Select issue date"
                      required
                      maxDate={dayjs()}
                    />
                  </div>
                  <div>
                    <DateInput<AddDriverForm>
                      name="licenseExpiryDate"
                      title="License Expiry Date"
                      placeholder="Select expiry date"
                      required
                      minDate={dayjs()}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <TextInput<AddDriverForm>
                      name="experience"
                      title="Years of Experience (Optional)"
                      placeholder="e.g., 5"
                      required={false}
                      onlynumber
                    />
                  </div>
                  <div>
                    <DateInput<AddDriverForm>
                      name="joiningDate"
                      title="Joining Date (Optional)"
                      placeholder="Select joining date"
                      required={false}
                    />
                  </div>
                  <div>
                    <TextInput<AddDriverForm>
                      name="salary"
                      title="Salary (Optional)"
                      placeholder="e.g., 25000"
                      required={false}
                      onlynumber
                      numdes
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <TextInput<AddDriverForm>
                      name="emergencyContactName"
                      title="Contact Name (Optional)"
                      placeholder="Enter contact name"
                      required={false}
                    />
                  </div>
                  <div>
                    <TextInput<AddDriverForm>
                      name="emergencyContactNumber"
                      title="Contact Number (Optional)"
                      placeholder="Enter 10-digit number"
                      required={false}
                      onlynumber
                      maxlength={10}
                    />
                  </div>
                  <div>
                    <MultiSelect<AddDriverForm>
                      name="emergencyContactRelation"
                      title="Relationship (Optional)"
                      placeholder="Select relationship"
                      required={false}
                      options={[
                        { label: "Father", value: "Father" },
                        { label: "Mother", value: "Mother" },
                        { label: "Spouse", value: "Spouse" },
                        { label: "Sibling", value: "Sibling" },
                        { label: "Friend", value: "Friend" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Important Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>
                    After creating the driver, a user account will be created
                    automatically
                  </li>
                  <li>
                    Login credentials will be: Phone Number & Password (first 4
                    letters of driver name + @ + last 4 digits of phone)
                  </li>
                  <li>
                    Example: Name &quot;Ramesh Kumar&quot; & Phone
                    &quot;9876543210&quot; → Password: &quot;Rame@3210&quot;
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
                  onClick={() => router.push("/mtadmin/driver")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={createDriverMutation.isPending}
                  icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Add Driver
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default AddDriverPage;
