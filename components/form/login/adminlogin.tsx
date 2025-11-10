import { AdminLoginForm, AdminLoginSchema } from "@/schema/login";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { TextInput } from "../inputfields/textinput";
import { PasswordInput } from "../inputfields/passwordinput";
import { setCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";

const AdminLoginPage = () => {
  const router = useRouter();
  const methods = useForm<AdminLoginForm>({
    resolver: valibotResolver(AdminLoginSchema),
  });

  type LoginResponse = {
    id: string;
    name: string;
    role: string;
  };

  type UserCompanyResponse = {
    user_id: number;
    company_id: number;
  };

  const searchUserCompany = async (userId: string) => {
    const response = await ApiCall({
      query:
        "query SearchUserCompany($whereSearchInput: WhereUserCompanySearchInput!) { searchUserCompany(whereSearchInput: $whereSearchInput) { user_id, company_id }}",
      variables: {
        whereSearchInput: {
          user_id: parseInt(userId),
        },
      },
    });

    if (!response.status) {
      return null;
    }

    // if value is not in response.data then return null
    if (!(response.data as Record<string, unknown>)["searchUserCompany"]) {
      return null;
    }
    
    return (response.data as Record<string, unknown>)[
      "searchUserCompany"
    ] as UserCompanyResponse;
  };

  const adminLogin = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: AdminLoginForm) => {
      const response = await ApiCall({
        query:
          "query Login($loginUserInput: LoginUserInput!) { login(loginUserInput: $loginUserInput) { id, name, role }}",
        variables: {
          loginUserInput: {
            contact: data.mobile,
            password: data.password,
          },
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      // if value is not in response.data then return the error
      if (!(response.data as Record<string, unknown>)["login"]) {
        throw new Error("Value not found in response");
      }
      return (response.data as Record<string, unknown>)[
        "login"
      ] as LoginResponse;
    },

    onSuccess: async (data) => {
      setCookie("role", data.role);
      setCookie("id", data.id);
      
      // Search for user company after successful login
      try {
        const userCompany = await searchUserCompany(data.id);
        if (userCompany && userCompany.company_id) {
          setCookie("company", userCompany.company_id.toString());
        }
      } catch (error) {
        // Silently handle the error - don't prevent login if company search fails
      }
      
      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: AdminLoginForm) => {
    adminLogin.mutate({
      mobile: data.mobile,
      password: data.password,
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onFormError)}
        className="space-y-6"
      >
        {/* Mobile Number Field */}
        <div className="space-y-2">
          <TextInput<AdminLoginForm>
            title="Mobile Number"
            required={true}
            name="mobile"
            placeholder="Enter your 10-digit mobile number"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <PasswordInput<AdminLoginForm>
            title="Password"
            required={true}
            name="password"
            placeholder="Enter your password"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={methods.formState.isSubmitting || adminLogin.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform "
        >
          {adminLogin.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </div>
          )}
        </button>

        {/* Additional Links */}
      </form>
    </FormProvider>
  );
};

export default AdminLoginPage;
