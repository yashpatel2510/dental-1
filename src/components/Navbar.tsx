import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  GitBranch,
  FileSpreadsheet,
  Star,
  Smartphone,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { NotificationItem, StaffUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  staffUser: StaffUser;
  unreadChatCount: number;
  pendingBookingsCount: number;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  onOpenConnectWhatsApp: () => void;
  isWhatsAppConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  staffUser,
  unreadChatCount,
  pendingBookingsCount,
  isSimulatorOpen,
  setIsSimulatorOpen,
  isSoundEnabled,
  setIsSoundEnabled,
  onOpenConnectWhatsApp,
  isWhatsAppConnected = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : null,
      badgeColor: 'bg-amber-500'
    },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'flow', label: 'Bot Flow', icon: GitBranch },
    { id: 'sheets', label: 'Sheets', icon: FileSpreadsheet },
    { id: 'feedback', label: 'Feedback', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="text-xl font-black">🦷</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Dent<span className="text-emerald-600">Pulse</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                  Meta Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">WhatsApp Dental Booking Assistant & CRM</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                        item.badgeColor || 'bg-emerald-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connect Real WhatsApp Button */}
            <button
              onClick={onOpenConnectWhatsApp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors ${
                isWhatsAppConnected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title="Connect Real WhatsApp Business Cloud API"
            >
              {isWhatsAppConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="hidden md:inline">WhatsApp Live</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Connect Live WhatsApp</span>
                </>
              )}
            </button>

            {/* WhatsApp Simulator Button */}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                isSimulatorOpen
                  ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Open WhatsApp Patient Simulator"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSimulatorOpen ? 'Close Phone' : 'Test WhatsApp'}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isSoundEnabled ? 'Mute notification chimes' : 'Enable notification chimes'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Live Clinic Alerts
                      </span>
                      {unreadNotifications.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {unreadNotifications.length} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearAllNotifications}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No new notifications right now
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            if (notif.linkTab) {
                              setActiveTab(notif.linkTab);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Staff Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors"
              >
                <img
                  src={staffUser.avatar}
                  alt={staffUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                />
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                  {staffUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{staffUser.name}</p>
                    <p className="text-slate-500">{staffUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {staffUser.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Clinic Configuration
                  </button>
                  <button
                    onClick={() => {
                      setIsSimulatorOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Open WhatsApp Tester
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-white/30 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
