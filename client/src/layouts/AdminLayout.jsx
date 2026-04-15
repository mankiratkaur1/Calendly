import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Link2, Clock, Calendar, Settings, Plus, Menu, CheckSquare,
  User, Star, ExternalLink, MoreVertical, BookOpen, Users,
  LogOut, ChevronDown, X,
} from 'lucide-react';

/* ─── User dropdown ─── */
function UserDropdown({ onClose }) {
  return (
    <div className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Profile header */}
      <div className="p-5 border-b border-gray-100">
        <p className="font-extrabold text-gray-900 text-base uppercase tracking-wide">Mankirat Kaur</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">Teams free trial</span>
          <span className="text-sm font-bold text-calendlyBlue hover:underline cursor-pointer">Upgrade</span>
        </div>
        <span className="inline-block mt-2 bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
          14 days left
        </span>
      </div>

      {/* Account settings */}
      <div className="px-3 py-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Account settings</p>
        {[
          { icon: <User className="w-4 h-4"/>, label: 'Profile' },
          { icon: <Star className="w-4 h-4"/>, label: 'Branding' },
          { icon: <Link2 className="w-4 h-4"/>, label: 'My Link' },
          { icon: <MoreVertical className="w-4 h-4"/>, label: 'All settings' },
        ].map(item => (
          <button key={item.label} onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition">
            <span className="text-gray-500">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Resources */}
      <div className="px-3 py-3 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Resources</p>
        {[
          { icon: <BookOpen className="w-4 h-4"/>, label: 'Getting started guide' },
          { icon: <Users className="w-4 h-4"/>, label: 'Community' },
        ].map(item => (
          <button key={item.label} onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition">
            <span className="text-gray-500">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 border-t border-gray-100">

        <button onClick={() => { onClose(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
          <LogOut className="w-4 h-4 text-gray-500"/> Logout
        </button>
      </div>
    </div>
  );
}

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { path: '/app/event-types', label: 'Event types', icon: <Link2 className="w-5 h-5" /> },
    { path: '/app/meetings', label: 'Meetings', icon: <Calendar className="w-5 h-5" /> },
    { path: '/app/availability', label: 'Availability', icon: <Clock className="w-5 h-5" /> },
    { path: '/app/meeting-polls', label: 'Meeting polls', icon: <CheckSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-surface-50 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-calendlyBlue rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Calendly</span>
        </div>

        {/* Create Button */}
        <div className="px-6 mb-6">
          <Link to="/app/event-types/new" onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-900 font-semibold transition-all">
            <Plus className="w-5 h-5" /> Create
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (location.pathname.startsWith('/app/event-types') && item.path === '/app/event-types') ||
              (location.pathname.startsWith('/app/meeting-polls') && item.path === '/app/meeting-polls');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors font-medium ${isActive ? 'bg-blue-50 text-calendlyBlue' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
                <span className={`mr-3 ${isActive ? 'text-calendlyBlue' : 'text-gray-500'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 mt-auto space-y-1">
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <Settings className="w-5 h-5 mr-3 text-gray-400" /> Admin center
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 md:hidden mr-4">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 hidden md:block">
              {location.pathname === '/app/event-types' ? 'Event Types' :
               location.pathname.includes('/new') ? 'New Event Type' :
               location.pathname === '/app/availability' ? 'Availability' :
               location.pathname === '/app/meetings' ? 'Meetings' :
               location.pathname === '/app/meeting-polls' ? 'Meeting Polls' : 'Dashboard'}
            </h1>
          </div>

          {/* Right — user avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-calendlyBlue text-sm">
                MK
              </div>
              <span className="hidden md:block text-sm font-semibold text-gray-700">Mankirat</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
            </button>
            {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)}/>}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;