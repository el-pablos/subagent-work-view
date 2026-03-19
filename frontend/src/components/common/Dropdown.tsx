import React, { useState, useRef, useEffect, ReactNode } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
  maxHeight?: string;
  onItemClick?: (item: DropdownItem) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "left",
  width = "200px",
  maxHeight = "300px",
  onItemClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const enabledItems = items.filter(
        (item) => !item.disabled && !item.divider,
      );

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;

        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= enabledItems.length) return 0;
            return nextIndex;
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev - 1;
            if (nextIndex < 0) return enabledItems.length - 1;
            return nextIndex;
          });
          break;

        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
            const item = enabledItems[focusedIndex];
            handleItemClick(item);
          }
          break;

        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;

        case "End":
          event.preventDefault();
          setFocusedIndex(enabledItems.length - 1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, focusedIndex, items]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.divider) return;

    item.onClick?.();
    onItemClick?.(item);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const enabledItems = items.filter((item) => !item.disabled && !item.divider);
  const getFocusedItemId = () => {
    if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
      return enabledItems[focusedIndex].id;
    }
    return null;
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* Trigger */}
      <div
        onClick={handleToggle}
        style={{ cursor: "pointer", userSelect: "none" }}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            [align]: 0,
            width,
            maxHeight,
            overflowY: "auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "4px",
            zIndex: 1000,
            animation: "dropdownSlideIn 0.15s ease-out",
          }}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={item.id}
                  style={{
                    height: "1px",
                    backgroundColor: "#e2e8f0",
                    margin: "4px 8px",
                  }}
                />
              );
            }

            const isFocused = item.id === getFocusedItemId();

            return (
              <div
                key={item.id}
                role="menuitem"
                aria-disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => {
                  if (!item.disabled) {
                    const enabledIndex = enabledItems.findIndex(
                      (i) => i.id === item.id,
                    );
                    setFocusedIndex(enabledIndex);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  backgroundColor: isFocused ? "#f1f5f9" : "transparent",
                  color: item.disabled
                    ? "#94a3b8"
                    : item.destructive
                      ? "#dc2626"
                      : "#1e293b",
                  opacity: item.disabled ? 0.5 : 1,
                  transition: "background-color 0.1s ease",
                  userSelect: "none",
                }}
              >
                {item.icon && (
                  <span
                    style={{
                      fontSize: "16px",
                      width: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
