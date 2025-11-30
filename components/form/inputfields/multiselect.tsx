import { OptionValue } from "@/models/main";
import { Select } from "antd";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

type MultiSelectProps<T extends FieldValues> = {
  name: Path<T>;
  options: OptionValue[];
  title?: string;
  placeholder: string;
  required: boolean;
  disable?: boolean;
};

export function MultiSelect<T extends FieldValues>(props: MultiSelectProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[props.name as keyof typeof errors];

  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => (
        <>
          {props.title && (
            <label
              htmlFor={props.name}
              className="text-sm font-semibold mb-2 block text-gray-900"
            >
              {props.title}
              {props.required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          )}
          <div>
            <Select
              disabled={props.disable ?? false}
              showSearch={true}
              status={error ? "error" : undefined}
              className="w-full"
              size="large"
              onChange={(value) => {
                // Always keep value as string to match schema expectations
                field.onChange(value.toString());
              }}
              value={field.value && field.value !== 0 ? field.value.toString() : undefined}
              placeholder={props.placeholder}
              options={props.options}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownStyle={{
                maxHeight: 400,
                overflow: 'auto',
              }}
              optionLabelProp="label"
              style={{
                width: '100%',
              }}
              popupClassName="select-dropdown-popup"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error.message?.toString()}
              </p>
            )}
          </div>
        </>
      )}
    />
  );
}
