import { useState, useCallback } from "react";

interface UseModalReturn<T = void> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Custom hook for managing modal state
 *
 * @example
 * // Simple usage
 * const modal = useModal();
 * <button onClick={modal.open}>Open Modal</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>...</Modal>
 *
 * @example
 * // With data
 * const modal = useModal<User>();
 * <button onClick={() => modal.open(user)}>Edit User</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *   {modal.data && <UserForm user={modal.data} />}
 * </Modal>
 */
function useModal<T = void>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setData(null);
    }, 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

export default useModal;
export { useModal };
