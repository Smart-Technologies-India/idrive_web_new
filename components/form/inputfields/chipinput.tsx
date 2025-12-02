"use client";
import { useController, FieldValues, Path } from "react-hook-form";
import { Input } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

interface ChipInputProps<T extends FieldValues> {
  name: Path<T>;
  title: string;
  placeholder?: string;
  required?: boolean;
  maxChips?: number;
}

export function ChipInput<T extends FieldValues>({
  name,
  title,
  placeholder = "Add item and press Enter",
  required = false,
  maxChips,
}: ChipInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController<T>({ name });

  const [inputValue, setInputValue] = useState("");
  // Ensure items is always an array, even if field.value is undefined, null, or not an array
  const items: string[] = Array.isArray(field.value) ? field.value : [];

  const handleAddItem = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !items.includes(trimmedValue)) {
      const newItems = [...items, trimmedValue];
      if (maxChips && newItems.length > maxChips) {
        return;
      }
      field.onChange(newItems);
      setInputValue("");
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    field.onChange(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="flex gap-2 mb-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          size="large"
        />
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!inputValue.trim() || (maxChips ? items.length >= maxChips : false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <PlusOutlined />
          Add
        </button>
      </div>

      {/* Items List Display */}
      <div className="space-y-2">
        {items.length == 0 ? (
          <div className="min-h-[40px] p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <span className="text-gray-400 text-sm">No items added yet</span>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={item}
                readOnly
                className="flex-1"
                size="large"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                title="Remove item"
              >
                <CloseOutlined />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Info Text */}
      <div className="mt-1 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Press Enter or click Add button to add items
        </p>
        {maxChips && (
          <p className="text-xs text-gray-500">
            {items.length} / {maxChips} items
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
}
