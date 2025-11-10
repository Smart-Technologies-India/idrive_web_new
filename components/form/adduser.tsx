"use client";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { AddUserForm, AddUserSchema } from "@/schema/adduser";
import { TextInput } from "./inputfields/textinput";
import { MultiSelect } from "./inputfields/multiselect";
import { PasswordInput } from "./inputfields/passwordinput";

const AddUserPage = () => {
  const router = useRouter();
  const methods = useForm<AddUserForm>({
    resolver: valibotResolver(AddUserSchema),
  });

  type AddUserResponse = {
    id: string;
    contact1: string;
    role: string;
  };

  const createUser = useMutation({
    mutationKey: ["createUser"],
    mutationFn: async (data: AddUserForm) => {
      const response = await ApiCall({
        query: `mutation CreateUser($inputType: CreateUserInput!) {
            createUser(inputType: $inputType) {
              id,
              contact1,
              role
            }
          }`,
        variables: {
          inputType: {
            contact1: data.contact1,
            password: data.password,
            role: data.role,
            name: "SYSTEM CREATED",
          },
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      if (!(response.data as Record<string, unknown>)["createUser"]) {
        throw new Error("Value not found in response");
      }
      return (response.data as Record<string, unknown>)[
        "createUser"
      ] as AddUserResponse;
    },

    onSuccess: () => {
      toast.success("User created successfully!");
      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const roleOptions = [
    { label: "System", value: "SYSTEM" },
    { label: "Admin", value: "ADMIN" },
    { label: "User", value: "USER" },
    { label: "Driver", value: "DRIVER" },
    { label: "School Admin", value: "MT_ADMIN" },
    { label: "School Accounts", value: "MT_ACCOUNTS" },
    { label: "School Manager", value: "MT_MANAGER" },
  ];

  const onSubmit = async (data: AddUserForm) => {
    createUser.mutate({
      contact1: data.contact1,
      password: data.password,
      role: data.role,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Add New User</h1>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit, onFormError)}
              className="space-y-6"
            >
              <TextInput<AddUserForm>
                title="Mobile Number"
                required={true}
                name="contact1"
                onlynumber={true}
                maxlength={10}
                placeholder="Enter mobile number"
              />

              <PasswordInput<AddUserForm>
                title="Password"
                required={true}
                name="password"
                placeholder="Enter password"
              />

              <MultiSelect<AddUserForm>
                title="User Role"
                required={true}
                name="role"
                options={roleOptions}
                placeholder="Select role"
              />

              <button
                type="submit"
                disabled={
                  methods.formState.isSubmitting || createUser.isPending
                }
                className="w-full px-4 py-3 mt-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
