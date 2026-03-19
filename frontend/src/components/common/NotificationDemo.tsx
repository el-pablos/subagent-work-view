import React from "react";
import { useNotificationStore } from "../../stores/notificationStore";

/**
 * Demo component untuk test notification system
 * Bisa digunakan untuk development testing
 */
const NotificationDemo: React.FC = () => {
  const { addToast, addNotification } = useNotificationStore();

  const handleToastSuccess = () => {
    addToast({
      type: "success",
      title: "Berhasil!",
      message: "Operasi telah berhasil dijalankan",
      duration: 5000,
    });
  };

  const handleToastError = () => {
    addToast({
      type: "error",
      title: "Error!",
      message: "Terjadi kesalahan saat memproses request",
      duration: 5000,
    });
  };

  const handleToastWarning = () => {
    addToast({
      type: "warning",
      title: "Perhatian!",
      message: "Anda memiliki perubahan yang belum disimpan",
      duration: 5000,
    });
  };

  const handleToastInfo = () => {
    addToast({
      type: "info",
      title: "Info",
      message: "Update sistem akan dilakukan pada pukul 23:00",
      duration: 5000,
    });
  };

  const handleToastWithAction = () => {
    addToast({
      type: "success",
      title: "Task Completed",
      message: "Task #1234 telah selesai dikerjakan",
      duration: 8000,
      action: {
        label: "Lihat Detail",
        onClick: () => {
          console.log("Action clicked!");
          alert("Navigating to task detail...");
        },
      },
    });
  };

  const handleAddNotification = () => {
    addNotification({
      type: "info",
      title: "New Message",
      message: "Agent-1 telah mengirim pesan baru kepada Anda",
      action: {
        label: "Buka Chat",
        onClick: () => {
          console.log("Open chat clicked");
          alert("Opening chat...");
        },
      },
    });
  };

  const handleMultipleToasts = () => {
    ["success", "error", "warning", "info"].forEach((type, index) => {
      setTimeout(() => {
        addToast({
          type: type as "success" | "error" | "warning" | "info",
          title: `Toast ${index + 1}`,
          message: `This is ${type} toast notification`,
          duration: 5000,
        });
      }, index * 500);
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-30 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
      <h3 className="text-sm font-semibold text-white mb-3">Notification Demo</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleToastSuccess}
          className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
        >
          Toast Success
        </button>
        <button
          onClick={handleToastError}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Toast Error
        </button>
        <button
          onClick={handleToastWarning}
          className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
        >
          Toast Warning
        </button>
        <button
          onClick={handleToastInfo}
          className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
        >
          Toast Info
        </button>
        <button
          onClick={handleToastWithAction}
          className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors"
        >
          Toast with Action
        </button>
        <button
          onClick={handleAddNotification}
          className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
        >
          Add Notification
        </button>
        <button
          onClick={handleMultipleToasts}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
        >
          Multiple Toasts
        </button>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Dev only - Remove before production
      </p>
    </div>
  );
};

export default NotificationDemo;
