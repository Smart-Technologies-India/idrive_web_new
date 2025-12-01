"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddCarAdminForm, AddCarAdminSchema } from "@/schema/addcaradmin";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { Button, Card, Modal } from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { createCarAdmin } from "@/services/car-admin.api";

const AddCarAdminPage = () => {
  const router = useRouter();

  const methods = useForm<AddCarAdminForm>({
    resolver: valibotResolver(AddCarAdminSchema),
    defaultValues: {
      category: "SEDAN",
    },
  });

  const createCarAdminMutation = useMutation({
    mutationKey: ["createCarAdmin"],
    mutationFn: async (data: AddCarAdminForm) => {
      const carAdminResponse = await createCarAdmin({
        name: data.name,
        manufacturer: data.manufacturer,
        category: data.category as "SEDAN" | "MUV" | "SUV" | "HATCHBACK",
      });

      if (!carAdminResponse.status) {
        throw new Error(carAdminResponse.message || "Failed to create car");
      }

      return { carAdmin: carAdminResponse.data };
    },
    onSuccess: (response) => {
      if (response.carAdmin?.createCarAdmin) {
        const carAdmin = response.carAdmin.createCarAdmin;
        Modal.success({
          title: "Car Created Successfully!",
          content: (
            <div className="space-y-2">
              <p><strong>Name:</strong> {carAdmin.name}</p>
              <p><strong>Manufacturer:</strong> {carAdmin.manufacturer}</p>
              <p><strong>Category:</strong> {carAdmin.category}</p>
            </div>
          ),
          onOk: () => router.push("/admin/car-admin"),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create car. Please try again.");
    },
  });

  const onSubmit = (data: AddCarAdminForm) => {
    Modal.confirm({
      title: "Confirm Car Creation",
      content: (
        <div>
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Manufacturer:</strong> {data.manufacturer}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <br />
          <p>Are you sure you want to create this car?</p>
        </div>
      ),
      okText: "Yes, Create Car",
      cancelText: "Cancel",
      onOk: () => {
        createCarAdminMutation.mutate(data);
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

  const categoryOptions = [
    { label: "Sedan", value: "SEDAN" },
    { label: "MUV (Multi Utility Vehicle)", value: "MUV" },
    { label: "SUV (Sport Utility Vehicle)", value: "SUV" },
    { label: "Hatchback", value: "HATCHBACK" },
  ];

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
              onClick={() => router.push("/admin/car-admin")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Add a new car to the master data for schools to use
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
                    <TextInput<AddCarAdminForm>
                      name="name"
                      title="Car Name"
                      placeholder="e.g., Swift, Innova, City"
                      required
                    />
                  </div>

                  <div>
                    <TextInput<AddCarAdminForm>
                      name="manufacturer"
                      title="Manufacturer"
                      placeholder="e.g., Maruti Suzuki, Toyota, Honda"
                      required
                    />
                  </div>

                  <div>
                    <MultiSelect<AddCarAdminForm>
                      name="category"
                      title="Category"
                      placeholder="Select car category"
                      options={categoryOptions}
                      required={true}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button size="large" onClick={handleReset}>
                  Reset Form
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<AntDesignPlusCircleOutlined />}
                  loading={createCarAdminMutation.isPending}
                  className="!bg-green-600 hover:!bg-green-700"
                >
                  Create Car
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default AddCarAdminPage;
