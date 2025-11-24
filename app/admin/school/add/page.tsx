"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { AddSchoolForm, AddSchoolSchema } from "@/schema/addschool";
import { TextInput } from "@/components/form/inputfields/textinput";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { Button } from "antd";

type CreateSchoolResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type CreateUserResponse = {
  id: string;
  contact1: string;
  role: string;
};

const AddSchoolPage = () => {
  const router = useRouter();
  const methods = useForm<AddSchoolForm>({
    resolver: valibotResolver(AddSchoolSchema),
    defaultValues: {
      website: "https://www.",
    },
  });

  const createSchoolWithUser = useMutation({
    mutationKey: ["createSchoolWithUser"],
    mutationFn: async (data: AddSchoolForm) => {
      // First, create the school
      const schoolResponse = await ApiCall({
        query: `mutation CreateSchool($inputType: CreateSchoolInput!) {
          createSchool(inputType: $inputType) {
            id
            name
            email
            phone
          }
        }`,
        variables: {
          inputType: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            alternatePhone: data.alternatePhone || null,
            address: data.address,
            registrationNumber: data.registrationNumber,
            gstNumber: data.gstNumber || null,
            establishedYear: data.establishedYear,
            website: data.website || null,
          },
        },
      });

      if (!schoolResponse.status) {
        throw new Error(schoolResponse.message || "Failed to create school");
      }

      const school = (schoolResponse.data as Record<string, unknown>)[
        "createSchool"
      ] as CreateSchoolResponse;

      if (!school) {
        throw new Error("School not created");
      }

      // Generate password: first 4 letters of school name (first capital, rest lowercase) + @ + last 4 digits of phone
      const schoolNamePart = data.name.substring(0, 4);
      const formattedSchoolName =
        schoolNamePart.charAt(0).toUpperCase() +
        schoolNamePart.slice(1).toLowerCase();
      const last4Digits = data.phone.slice(-4);
      const generatedPassword = `${formattedSchoolName}@${last4Digits}`;

   

      // Create user for the school with MTADMIN role
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
            contact1: data.phone,
            password: generatedPassword,
            role: "MT_ADMIN",
            name: data.name,
            schoolId: school.id,
          },
        },
      });

      if (!userResponse.status) {
        throw new Error(userResponse.message || "Failed to create user");
      }

      const user = (userResponse.data as Record<string, unknown>)[
        "createUser"
      ] as CreateUserResponse;

      return { school, user, generatedPassword };
    },

    onSuccess: (data) => {
      toast.success(
        `School created successfully! Login credentials - Phone: ${data.school.phone}, Password: ${data.generatedPassword}`
      );
      router.push("/admin/school");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: AddSchoolForm) => {
    createSchoolWithUser.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/admin/school")}
              size="large"
            >
              Back to Schools
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New School</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Create a new driving school. School admin will complete remaining
              details after registration.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="shadow-sm max-w-4xl mx-auto bg-white rounded-lg p-8">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit, onFormError)}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<AddSchoolForm>
                    title="School Name"
                    required={true}
                    name="name"
                    placeholder="Enter school name (e.g., iDrive Driving School - Rohini)"
                  />

                  <TextInput<AddSchoolForm>
                    title="Registration Number"
                    required={true}
                    name="registrationNumber"
                    placeholder="Enter registration number (e.g., DL/DS/2022/12345)"
                  />

                  <TextInput<AddSchoolForm>
                    title="GST Number (Optional)"
                    required={false}
                    name="gstNumber"
                    placeholder="Enter GST number (e.g., 07AABCI1234F1Z5)"
                    maxlength={15}
                  />

                  <TextInput<AddSchoolForm>
                    title="Established Year"
                    required={true}
                    name="establishedYear"
                    placeholder="Enter year (e.g., 2022)"
                    maxlength={4}
                    onlynumber={true}
                  />

                  <TextInput<AddSchoolForm>
                    title="Website (Optional)"
                    required={false}
                    name="website"
                    placeholder="https://www.yourschool.com"
                  />

                  <div className="md:col-span-2">
                    <TaxtAreaInput<AddSchoolForm>
                      title="Address"
                      required={true}
                      name="address"
                      placeholder="Enter complete address with city and state"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<AddSchoolForm>
                    title="Email Address (Optional)"
                    required={false}
                    name="email"
                    placeholder="school@example.com"
                  />

                  <TextInput<AddSchoolForm>
                    title="Phone Number"
                    required={true}
                    name="phone"
                    placeholder="+919876543210"
                    onlynumber={true}
                    maxlength={10}
                  />

                  <TextInput<AddSchoolForm>
                    title="Alternate Phone Number (Optional)"
                    required={false}
                    name="alternatePhone"
                    placeholder="+919876543211"
                    onlynumber={true}
                    maxlength={10}
                  />
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
                    After creating the school, an MT Admin account will be
                    created automatically
                  </li>
                  <li>
                    Login credentials will be: Phone Number & Password (first 4
                    letters of school name + @ + last 4 digits of phone)
                  </li>
                  <li>
                    Example: School Name &quot;iDrive School&quot; & Phone
                    &quot;9876543210&quot; → Password: &quot;Idri@3210&quot;
                  </li>
                  <li>
                    School admin can complete remaining details like operating
                    hours, bank details, license information, etc.
                  </li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="default"
                  size="large"
                  onClick={() => router.push("/admin/school")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={
                    methods.formState.isSubmitting ||
                    createSchoolWithUser.isPending
                  }
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AntDesignCheckOutlined />
                  {createSchoolWithUser.isPending
                    ? "Creating..."
                    : "Create School"}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default AddSchoolPage;
