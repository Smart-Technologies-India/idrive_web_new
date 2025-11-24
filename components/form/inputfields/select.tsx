import { OptionValue } from "@/models/main";
import { JSX } from "react";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

type SelectProps<T extends FieldValues> = {
  name: Path<T>;
  title?: string;
  placeholder?: string;
  required?: boolean;
  options: OptionValue[];
  extratax?: JSX.Element;
  disable?: boolean;
};

export function Select<T extends FieldValues>(props: SelectProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Get the error for this specific field
  const error = errors[props.name as keyof typeof errors];

  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => (
        <>
          {props.title && (
            <div className="w-full flex flex-wrap">
              <label htmlFor={props.name} className="text-sm font-normal">
                {props.title}
                {props.required && <span className="text-rose-500">*</span>}
              </label>
              {props.extratax && props.extratax}
            </div>
          )}
          <div>
            <select
              {...field}
              disabled={props.disable ?? false}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {props.placeholder && (
                <option value="" disabled>
                  {props.placeholder}
                </option>
              )}
              {props.options.map((option: OptionValue, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-xs text-red-500">
                {error.message?.toString()}
              </p>
            )}
          </div>
        </>
      )}
    />
  );
}
