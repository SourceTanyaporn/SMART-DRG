"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

/**
 * Input Component
 * Supports standalone input, prefix/suffix icons, and unit badges (e.g. mmHg, kg, bpm)
 * 
 * @example
 * <Input placeholder="กรอกชื่อ" />
 * <Input unit="mmHg" placeholder="120" />
 * <Input prefix={<Search size={14} />} placeholder="ค้นหา..." />
 * <Input size="sm" error="ข้อมูลไม่ถูกต้อง" />
 */
const Input = React.forwardRef(function Input(
  {
    className,
    wrapperClassName,
    type = "text",
    size = "default",
    variant = "default",
    unit,
    prefix,
    suffix,
    error,
    disabled,
    ...props
  },
  ref
) {
  const isWrapped = Boolean(unit || prefix || suffix)

  const sizeClasses = {
    sm: "h-8 text-xs",
    default: "h-9 text-xs",
    lg: "h-10 text-sm",
  }[size] || "h-9 text-xs"

  const paddingClasses = {
    sm: cn("px-2.5 py-1.5", prefix && "pl-7", suffix && "pr-7"),
    default: cn("px-3 py-2", prefix && "pl-8", suffix && "pr-8"),
    lg: cn("px-3.5 py-2", prefix && "pl-9", suffix && "pr-9"),
  }[size] || "px-3 py-2"

  const baseInputClasses = cn(
    "w-full min-w-0 font-semibold text-slate-800 placeholder:text-slate-300 outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses,
    paddingClasses,
    !isWrapped && [
      "rounded-lg border bg-white shadow-2xs",
      error
        ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
        : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
      disabled && "bg-slate-50 text-slate-400",
    ],
    isWrapped && "bg-transparent border-0 focus:ring-0 shadow-none",
    className
  )

  const inputElement = (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      disabled={disabled}
      aria-invalid={Boolean(error)}
      className={baseInputClasses}
      {...props}
    />
  )

  if (!isWrapped) {
    return inputElement
  }

  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        "relative flex items-center rounded-lg border bg-white shadow-2xs transition overflow-hidden",
        sizeClasses,
        error
          ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
          : "border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100",
        disabled && "bg-slate-50 text-slate-400 cursor-not-allowed",
        wrapperClassName
      )}
    >
      {prefix && (
        <span className="pointer-events-none absolute left-2.5 flex items-center justify-center text-slate-400 shrink-0 select-none">
          {prefix}
        </span>
      )}

      {inputElement}

      {suffix && (
        <span className="pointer-events-none absolute right-2.5 flex items-center justify-center text-slate-400 shrink-0 select-none">
          {suffix}
        </span>
      )}

      {unit && (
        <span className="shrink-0 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-400 border-l border-slate-100 select-none h-full flex items-center">
          {unit}
        </span>
      )}
    </div>
  )
})

/**
 * DualInput Component
 * Perfect for Systolic / Diastolic Blood Pressure or Min / Max ranges
 * 
 * @example
 * <DualInput
 *   value1={sys}
 *   value2={dia}
 *   onChange1={setSys}
 *   onChange2={setDia}
 *   unit="mmHg"
 * />
 */
const DualInput = React.forwardRef(function DualInput(
  {
    label,
    badge,
    required,
    helperText,
    className,
    wrapperClassName,
    size = "default",
    value1,
    value2,
    onChange1,
    onChange2,
    placeholder1 = "-",
    placeholder2 = "-",
    separator = "/",
    unit,
    error,
    disabled,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: "h-8 text-xs",
    default: "h-9 text-xs",
    lg: "h-10 text-sm",
  }[size] || "h-9 text-xs"

  const inputElement = (
    <div
      ref={ref}
      data-slot="dual-input-wrapper"
      className={cn(
        "relative flex items-center rounded-lg border bg-white shadow-2xs transition overflow-hidden",
        sizeClasses,
        error
          ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
          : "border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100",
        disabled && "bg-slate-50 text-slate-400 cursor-not-allowed",
        wrapperClassName || (!label && !badge && className)
      )}
      {...props}
    >
      <input
        type="text"
        disabled={disabled}
        value={value1 ?? ""}
        onChange={(e) => onChange1?.(e.target.value, e)}
        placeholder={placeholder1}
        className="w-full min-w-0 bg-transparent px-2 py-1.5 font-semibold text-slate-800 placeholder:text-slate-300 outline-none text-center disabled:cursor-not-allowed"
      />

      <span className="shrink-0 text-xs font-bold text-slate-300 px-0.5 select-none">
        {separator}
      </span>

      <input
        type="text"
        disabled={disabled}
        value={value2 ?? ""}
        onChange={(e) => onChange2?.(e.target.value, e)}
        placeholder={placeholder2}
        className="w-full min-w-0 bg-transparent px-2 py-1.5 font-semibold text-slate-800 placeholder:text-slate-300 outline-none text-center disabled:cursor-not-allowed"
      />

      {unit && (
        <span className="shrink-0 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-400 border-l border-slate-100 select-none h-full flex items-center">
          {unit}
        </span>
      )}
    </div>
  )

  if (!label && !badge && !helperText && !error) {
    return inputElement
  }

  return (
    <div className={cn("space-y-1", className)}>
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-[11px] font-semibold text-slate-700 select-none">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
          )}
          {badge && (
            <span className="text-[9px] font-semibold">{badge}</span>
          )}
        </div>
      )}

      {inputElement}

      {error && typeof error === "string" && (
        <p className="text-[10px] font-medium text-destructive">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  )
})

/**
 * InputField Component
 * Input bundled with Label, Badge, HelperText, and Error message
 * 
 * @example
 * <InputField
 *   label="น้ำหนัก"
 *   unit="kg"
 *   value={weight}
 *   onChange={(e) => setWeight(e.target.value)}
 * />
 */
const InputField = React.forwardRef(function InputField(
  {
    label,
    badge,
    required,
    helperText,
    error,
    className,
    inputClassName,
    size = "default",
    ...props
  },
  ref
) {
  return (
    <div className={cn("space-y-1", className)}>
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-[11px] font-semibold text-slate-700 select-none">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
          )}
          {badge && (
            <span className="text-[9px] font-semibold">{badge}</span>
          )}
        </div>
      )}

      <Input
        ref={ref}
        size={size}
        error={Boolean(error)}
        className={inputClassName}
        {...props}
      />

      {error && typeof error === "string" && (
        <p className="text-[10px] font-medium text-destructive">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  )
})

export { Input, DualInput, InputField }
