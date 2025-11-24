import { DatePicker } from "antd";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

type DateInputProps<T extends FieldValues> = {
  name: Path<T>;
  title?: string;
  placeholder?: string;
  required?: boolean;
  format?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
};

export function DateInput<T extends FieldValues>(props: DateInputProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const format = props.format || "YYYY-MM-DD";

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
            <DatePicker
              status={error ? "error" : undefined}
              className="w-full"
              format={format}
              value={field.value ? dayjs(field.value, format) : null}
              onChange={(date: Dayjs | null) => {
                field.onChange(date ? date.format(format) : "");
              }}
              placeholder={props.placeholder ?? undefined}
              maxDate={props.maxDate}
              minDate={props.minDate}
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
