"use client";

import React from "react";
import Select, { Props as SelectProps, StylesConfig, GroupBase } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<SelectProps<Option, false, GroupBase<Option>>, 'styles'> {
  label?: string;
  error?: string;
  accentColor?: string;
}

const CustomSelect = ({ 
  label, 
  error, 
  accentColor = "#FF8C42", 
  ...props 
}: CustomSelectProps) => {
  const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#F9FAFB", // gray-50
      borderColor: state.isFocused ? accentColor : "#F3F4F6", // gray-100
      borderRadius: "1rem", // rounded-2xl
      padding: "2px 8px",
      minHeight: "52px",
      boxShadow: state.isFocused ? `${accentColor}33 0 0 0 2px` : "none",
      "&:hover": {
        borderColor: state.isFocused ? accentColor : "#E5E7EB",
        backgroundColor: "white",
      },
      transition: "all 0.3s ease",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF", // gray-400
      fontSize: "0.875rem", // text-sm
      fontWeight: "500",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#2C2C2C",
      fontSize: "0.875rem",
      fontWeight: "700", // font-bold
    }),
    input: (base) => ({
      ...base,
      color: "#2C2C2C",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "1px border-gray-100",
      marginTop: "8px",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? accentColor 
        : state.isFocused 
          ? `${accentColor}11` 
          : "transparent",
      color: state.isSelected ? "white" : "#2C2C2C",
      fontSize: "0.875rem",
      fontWeight: state.isSelected ? "700" : "500",
      padding: "12px 16px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: `${accentColor}33`,
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? accentColor : "#9CA3AF",
      transition: "color 0.3s ease",
      "&:hover": {
        color: accentColor,
      },
    }),
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <Select
        {...props}
        styles={customStyles}
        components={{
          ...props.components,
        }}
      />
      {error && (
        <p className="text-[10px] text-red-500 font-medium pl-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;
