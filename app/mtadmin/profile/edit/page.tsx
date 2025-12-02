"use client";

import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EditProfileForm, EditProfileSchema } from "@/schema/editprofile";
import { TextInput } from "@/components/form/inputfields/textinput";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TimeInput } from "@/components/form/inputfields/timeinput";
import { DateInput } from "@/components/form/inputfields/dateinput";
import { IcBaselineArrowBack, AntDesignCheckOutlined } from "@/components/icons";
import { Button, Spin, Alert } from "antd";
import { getCookie } from "cookies-next";
import { getSchoolById, updateSchool } from "@/services/school.api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const weekDays = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

dayjs.extend(customParseFormat);

const EditSchoolProfilePage = () => {
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string | null | undefined): string => {
    if (!time24) return "";
    
    // Try parsing various 24-hour formats (HH:mm, HH:mm:ss, H:mm)
    const parsedTime = dayjs(time24, ["HH:mm:ss", "HH:mm", "H:mm"], true);
    
    // If parsing failed, return empty string
    if (!parsedTime.isValid()) return "";
    
    // Convert to 12-hour format
    return parsedTime.format("h:mm A");
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12: string | null | undefined): string => {
    if (!time12) return "";
    
    // Parse 12-hour format (h:mm A)
    const parsedTime = dayjs(time12, "h:mm A", true);
    
    // If parsing failed, return empty string
    if (!parsedTime.isValid()) return "";
    
    // Convert to 24-hour format
    return parsedTime.format("HH:mm");
  };

  const methods = useForm<EditProfileForm>({
    resolver: valibotResolver(EditProfileSchema),
  });

  // Fetch existing school data
  const { data: schoolResponse, isLoading, isError, error } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      if (!schoolId || schoolId == 0) {
        throw new Error("School ID not found");
      }
      return await getSchoolById(schoolId);
    },
    enabled: schoolId > 0,
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (schoolResponse?.status && schoolResponse.data.getSchoolById && !initialDataLoaded.current) {
      const school = schoolResponse.data.getSchoolById;
      methods.reset({
        name: school.name || "",
        email: school.email || "",
        phone: school.phone || "",
        alternatePhone: school.alternatePhone || "",
        address: school.address || "",
        registrationNumber: school.registrationNumber || "",
        gstNumber: school.gstNumber || "",
        establishedYear: school.establishedYear || "",
        website: school.website || "",
        dayStartTime: convertTo12Hour(school.dayStartTime),
        dayEndTime: convertTo12Hour(school.dayEndTime),
        lunchStartTime: convertTo12Hour(school.lunchStartTime),
        lunchEndTime: convertTo12Hour(school.lunchEndTime),
        weeklyHoliday: school.weeklyHoliday || "",
        ownerName: school.ownerName || "",
        ownerPhone: school.ownerPhone || "",
        ownerEmail: school.ownerEmail || "",
        bankName: school.bankName || "",
        accountNumber: school.accountNumber || "",
        ifscCode: school.ifscCode || "",
        branchName: school.branchName || "",
        rtoLicenseNumber: school.rtoLicenseNumber || "",
        rtoLicenseExpiry: school.rtoLicenseExpiry || "",
        insuranceProvider: school.insuranceProvider || "",
        insurancePolicyNumber: school.insurancePolicyNumber || "",
        insuranceExpiry: school.insuranceExpiry || "",
        facebook: school.facebook || "",
        instagram: school.instagram || "",
        twitter: school.twitter || "",
      });
      initialDataLoaded.current = true;
    }
  }, [schoolResponse, methods]);

  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationKey: ["updateSchool"],
    mutationFn: async (data: EditProfileForm) => {
      const updateData = {
        id: schoolId,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        alternatePhone: data.alternatePhone || undefined,
        address: data.address,
        registrationNumber: data.registrationNumber,
        gstNumber: data.gstNumber && data.gstNumber.trim() !== "" ? data.gstNumber : undefined,
        establishedYear: data.establishedYear,
        website: data.website || undefined,
        dayStartTime: convertTo24Hour(data.dayStartTime),
        dayEndTime: convertTo24Hour(data.dayEndTime),
        lunchStartTime: convertTo24Hour(data.lunchStartTime),
        lunchEndTime: convertTo24Hour(data.lunchEndTime),
        weeklyHoliday: data.weeklyHoliday,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail && data.ownerEmail.trim() !== "" ? data.ownerEmail : undefined,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        branchName: data.branchName,
        rtoLicenseNumber: data.rtoLicenseNumber,
        rtoLicenseExpiry: data.rtoLicenseExpiry ? new Date(data.rtoLicenseExpiry) : undefined,
        insuranceProvider: data.insuranceProvider || undefined,
        insurancePolicyNumber: data.insurancePolicyNumber || undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
        facebook: data.facebook || undefined,
        instagram: data.instagram || undefined,
        twitter: data.twitter || undefined,
      };


      const response = await updateSchool(updateData);
      if (!response.status) {
        throw new Error(response.message || "Failed to update profile");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("School profile updated successfully!");
      window.location.href = "/mtadmin/profile";
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onSubmit = async (data: EditProfileForm) => {
    updateSchoolMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Error"
          description={error?.message || "Failed to load school profile"}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push("/mtadmin/profile")}>Back to Profile</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/mtadmin/profile")}
              size="large"
            >
              Back to Profile
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit School Profile</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update your driving school information
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6">
        <div className="shadow-sm max-w-6xl mx-auto bg-white rounded-lg p-4 sm:p-8 overflow-x-hidden">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)} className="space-y-6 w-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<EditProfileForm>
                    title="School Name"
                    required={true}
                    name="name"
                    placeholder="Enter school name"
                  />
                  <TextInput<EditProfileForm>
                    title="Registration Number"
                    required={true}
                    name="registrationNumber"
                    placeholder="Enter registration number"
                  />
                  <TextInput<EditProfileForm>
                    title="GST Number (Optional)"
                    required={false}
                    name="gstNumber"
                    placeholder="Enter GST number"
                    maxlength={15}
                  />
                  <TextInput<EditProfileForm>
                    title="Established Year"
                    required={true}
                    name="establishedYear"
                    placeholder="Enter year (e.g., 2022)"
                    maxlength={4}
                    onlynumber={true}
                  />
                  <TextInput<EditProfileForm>
                    title="Website (Optional)"
                    required={false}
                    name="website"
                    placeholder="https://www.yourschool.com"
                  />
                  <div className="md:col-span-2">
                    <TaxtAreaInput<EditProfileForm>
                      title="Address"
                      required={true}
                      name="address"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<EditProfileForm>
                    title="Email Address (Optional)"
                    required={false}
                    name="email"
                    placeholder="school@example.com"
                  />
                  <TextInput<EditProfileForm>
                    title="Phone Number"
                    required={true}
                    name="phone"
                    placeholder="9876543210"
                    onlynumber={true}
                    maxlength={10}
                  />
                  <TextInput<EditProfileForm>
                    title="Alternate Phone Number (Optional)"
                    required={false}
                    name="alternatePhone"
                    placeholder="9876543211"
                    onlynumber={true}
                    maxlength={10}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TimeInput<EditProfileForm>
                    title="Day Start Time"
                    required={true}
                    name="dayStartTime"
                    placeholder="08:00 AM"
                    format="h:mm A"
                    use12Hours={true}
                    minuteStep={30}
                  />
                  <TimeInput<EditProfileForm>
                    title="Day End Time"
                    required={true}
                    name="dayEndTime"
                    placeholder="08:00 PM"
                    format="h:mm A"
                    use12Hours={true}
                    minuteStep={30}
                  />
                  <MultiSelect<EditProfileForm>
                    title="Weekly Holiday"
                    required={true}
                    name="weeklyHoliday"
                    placeholder="Select day"
                    options={weekDays}
                  />
                  <TimeInput<EditProfileForm>
                    title="Lunch Start Time"
                    required={true}
                    name="lunchStartTime"
                    placeholder="01:00 PM"
                    format="h:mm A"
                    use12Hours={true}
                    minuteStep={30}
                  />
                  <TimeInput<EditProfileForm>
                    title="Lunch End Time"
                    required={true}
                    name="lunchEndTime"
                    placeholder="02:00 PM"
                    format="h:mm A"
                    use12Hours={true}
                    minuteStep={30}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Owner / Contact Person
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TextInput<EditProfileForm>
                    title="Owner Name"
                    required={true}
                    name="ownerName"
                    placeholder="Enter owner name"
                  />
                  <TextInput<EditProfileForm>
                    title="Owner Phone"
                    required={true}
                    name="ownerPhone"
                    placeholder="9876543210"
                    onlynumber={true}
                    maxlength={10}
                  />
                  <TextInput<EditProfileForm>
                    title="Owner Email (Optional)"
                    required={false}
                    name="ownerEmail"
                    placeholder="owner@school.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<EditProfileForm>
                    title="Bank Name"
                    required={true}
                    name="bankName"
                    placeholder="Enter bank name"
                  />
                  <TextInput<EditProfileForm>
                    title="Branch Name"
                    required={true}
                    name="branchName"
                    placeholder="Enter branch name"
                  />
                  <TextInput<EditProfileForm>
                    title="Account Number"
                    required={true}
                    name="accountNumber"
                    placeholder="Enter account number"
                  />
                  <TextInput<EditProfileForm>
                    title="IFSC Code"
                    required={true}
                    name="ifscCode"
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  License & Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput<EditProfileForm>
                    title="RTO License Number"
                    required={true}
                    name="rtoLicenseNumber"
                    placeholder="Enter RTO license number"
                  />
                  <DateInput<EditProfileForm>
                    title="RTO License Expiry Date (Optional)"
                    required={false}
                    name="rtoLicenseExpiry"
                    placeholder="Select date"
                    format="YYYY-MM-DD"
                  />
                  <TextInput<EditProfileForm>
                    title="Insurance Provider (Optional)"
                    required={false}
                    name="insuranceProvider"
                    placeholder="Enter insurance provider name"
                  />
                  <TextInput<EditProfileForm>
                    title="Insurance Policy Number (Optional)"
                    required={false}
                    name="insurancePolicyNumber"
                    placeholder="Enter policy number"
                  />
                  <DateInput<EditProfileForm>
                    title="Insurance Expiry Date (Optional)"
                    required={false}
                    name="insuranceExpiry"
                    placeholder="Select date"
                    format="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Social Media Links (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TextInput<EditProfileForm>
                    title="Facebook"
                    required={false}
                    name="facebook"
                    placeholder="https://facebook.com/yourpage"
                  />
                  <TextInput<EditProfileForm>
                    title="Instagram"
                    required={false}
                    name="instagram"
                    placeholder="https://instagram.com/yourpage"
                  />
                  <TextInput<EditProfileForm>
                    title="Twitter"
                    required={false}
                    name="twitter"
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="default"
                  size="large"
                  onClick={() => router.push("/mtadmin/profile")}
                  className="flex-1"
                  disabled={updateSchoolMutation.isPending}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={methods.formState.isSubmitting || updateSchoolMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AntDesignCheckOutlined />
                  {updateSchoolMutation.isPending ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default EditSchoolProfilePage;
