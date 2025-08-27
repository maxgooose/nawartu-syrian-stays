import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

interface PhoneInputComponentProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
}

export const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  defaultCountry = 'SY', // Default to Syria
}) => {
  return (
    <PhoneInput
      international
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "phone-input-container",
        className
      )}
      numberInputProps={{
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        )
      }}
    />
  );
};
