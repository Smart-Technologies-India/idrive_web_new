import React from "react";
import { TimePicker, TimePickerProps } from "antd";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

type TimeInputProps<T extends FieldValues> = {
  name: Path<T>;
  title?: string;
  placeholder?: string;
  required?: boolean;
  format?: string;
  use12Hours?: boolean;
  minuteStep?: TimePickerProps["minuteStep"];
};

export function TimeInput<T extends FieldValues>(props: TimeInputProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const format = props.format || "HH:mm";

  // Get the error for this specific field
  const error = errors[props.name as keyof typeof errors];

  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => (
        <>
          {props.title && (
            <div className="w-full flex flex-wrap mb-1">
              <label htmlFor={props.name} className="text-sm font-normal">
                {props.title}
                {props.required && <span className="text-rose-500">*</span>}
              </label>
            </div>
          )}

          <div>
            <TimePicker
              status={error ? "error" : undefined}
              className="w-full"
              format={format}
              use12Hours={props.use12Hours}
              {...(props.minuteStep && { minuteStep: props.minuteStep })}
              value={field.value ? dayjs(field.value, format) : null}
              onChange={(time: Dayjs | null) => {
                field.onChange(time ? time.format(format) : "");
              }}
              placeholder={props.placeholder ?? undefined}
            />
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
