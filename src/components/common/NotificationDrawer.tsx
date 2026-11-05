import { useEffect, useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { Notification } from '../../types';
import { Bell, CheckCircle2, Clock, DollarSign, ShieldCheck, Tag, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function NotificationDrawer({ isOpen, onClose, userId }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const update = () => {
      setNotifications(dbStore.getNotifications(userId));
    };
    update();
    return dbStore.subscribe(update);
  }, [userId]);

  if (!isOpen) return null;

  const getIcon = (type: Notification['notification_type']) => {
    switch (type) {
      case 'offer_new':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'offer_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-[#E2EDE0]">
        <div className="p-4 border-b border-[#E2EDE0] flex items-center justify-between bg-[#F4F9F1]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#35A853]" />
            <h3 className="font-bold text-[#15351A] text-base">Notifications</h3>
            <span className="text-xs bg-[#7ED957]/30 text-[#15351A] font-semibold px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#6B7C6B]">
              <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-[#E2EDE0] bg-white hover:bg-[#F4F9F1]/60 transition-colors shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F4F9F1] border border-[#E2EDE0] shrink-0 mt-0.5">
                    {getIcon(notif.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#15351A] leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-xs text-[#6B7C6B] mt-1 leading-normal">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[#E2EDE0] bg-[#F4F9F1] text-center">
          <p className="text-xs text-[#6B7C6B]">Real-time notification service active</p>
        </div>
      </div>
    </div>
  );
}
