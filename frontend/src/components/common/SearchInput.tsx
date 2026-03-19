import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  isLoading = false,
  className = "",
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Handle clear button click
  const handleClear = () => {
    setInternalValue("");
    onChange("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    inputRef.current?.focus();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const hasValue = internalValue.length > 0;

  return (
    <div
      className={`relative flex items-center group ${className}`}
      style={{
        minWidth: "200px",
      }}
    >
      {/* Search Icon */}
      <div className="absolute left-3 pointer-events-none">
        <Search
          className={`w-4 h-4 transition-colors ${
            isFocused ? "text-blue-400" : "text-gray-500"
          }`}
        />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full pl-10 pr-10 py-2
          bg-gray-800 text-gray-100 text-sm
          border border-gray-700
          rounded-lg
          placeholder-gray-500
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isFocused ? "shadow-lg shadow-blue-500/10" : ""}
        `}
      />

      {/* Right side icons (Loading or Clear) */}
      <div className="absolute right-3 flex items-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : hasValue ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              disabled={disabled}
              className={`
                p-0.5 rounded-full
                text-gray-500 hover:text-gray-300
                hover:bg-gray-700
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Focus indicator */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  );
};

export default SearchInput;
