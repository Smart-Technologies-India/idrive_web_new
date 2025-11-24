import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

type DateRangePickerProps<T extends FieldValues> = {
  name: Path<T>;
  title: string;
  placeholder?: [string, string];
  required: boolean;
  disable?: boolean;
  mindate?: Dayjs;
  maxdate?: Dayjs;
  format?: string;
  allowSingleDate?: boolean;
  futureOnly?: boolean;
};

export function DateRangePicker<T extends FieldValues>(
  props: DateRangePickerProps<T>
) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[props.name as keyof typeof errors];

  // Get minimum date - either provided or tomorrow if futureOnly is true
  const getMinDate = () => {
    if (props.mindate) return props.mindate;
    if (props.futureOnly) {
      return dayjs().add(1, "day").startOf("day");
    }
    return undefined;
  };

  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => (
        <>
          <label
            htmlFor={props.name}
            className="text-sm font-semibold mb-2 block text-gray-900"
          >
            {props.title}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          <div>
            <RangePicker
              disabled={props.disable ?? false}
              className="w-full"
              size="large"
              value={
                field.value && Array.isArray(field.value)
                  ? [
                      field.value[0] ? dayjs(field.value[0]) : null,
                      field.value[1] ? dayjs(field.value[1]) : null,
                    ]
                  : null
              }
              status={error ? "error" : undefined}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  field.onChange([
                    dates[0].toDate().toISOString(),
                    dates[1].toDate().toISOString(),
                  ]);
                } else if (
                  dates &&
                  dates[0] &&
                  !dates[1] &&
                  props.allowSingleDate
                ) {
                  // Allow single date selection if enabled
                  field.onChange([
                    dates[0].toDate().toISOString(),
                    dates[0].toDate().toISOString(),
                  ]);
                } else {
                  field.onChange(null);
                }
              }}
              minDate={getMinDate()}
              maxDate={props.maxdate ? props.maxdate : undefined}
              placeholder={props.placeholder ?? ["Start Date", "End Date"]}
              format={props.format ?? "DD-MM-YYYY"}
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
