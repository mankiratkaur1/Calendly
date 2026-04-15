import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEventTypes, deleteEventType } from '../api';
import { Search, ExternalLink, Copy, Clock, Calendar, Trash2, Pencil, Link2, MoreHorizontal, CalendarPlus } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Event types');

  useEffect(() => {
    document.title = 'Event Types - Calendly';
  }, []);

  const { data: eventTypes, isLoading, error } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: getEventTypes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventType,
    onSuccess: () => {
      queryClient.invalidateQueries(['eventTypes']);
      toast.success('Event type deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete event type');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/mankirat/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  // Tabs — removed "Single-use links", added "Meeting polls" which navigates away
  const tabs = ['Event types', 'Meeting polls'];

  const handleTabClick = (tab) => {
    if (tab === 'Meeting polls') {
      navigate('/app/meeting-polls');
    } else {
      setActiveTab(tab);
    }
  };

  const [search, setSearch] = useState('');
  const filteredEventTypes = eventTypes?.data?.data?.filter(et => 
    et.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col pt-4">
       {/* Tabs */}
       <div className="flex items-center gap-8 border-b border-gray-200 mb-6">
         {tabs.map(tab => (
           <button
             key={tab}
             onClick={() => handleTabClick(tab)}
             className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
           >
             {tab}
             {activeTab === tab && (
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-calendlyBlue rounded-t-md"></div>
             )}
           </button>
         ))}
       </div>

       {/* Actions Bar */}
       <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-sm">
             <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input
                type="text"
                placeholder="Search event types"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
             />
          </div>
       </div>

       {/* User Profile Link Header */}
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">MK</div>
             <div>
                <p className="text-sm text-gray-500">Mankirat Kaur</p>
                <a href="/mankirat" className="text-calendlyBlue hover:underline font-semibold flex items-center gap-1">
                   mankirat <ExternalLink className="w-3 h-3" />
                </a>
             </div>
          </div>
       </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse h-48"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-red-500 bg-red-50 rounded-lg border border-red-100">Error loading event types</div>
      ) : filteredEventTypes?.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg mt-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Calendar className="w-8 h-8 text-calendlyBlue" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">No event types found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredEventTypes?.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              onEdit={() => navigate(`/app/event-types/${eventType.id}/edit`)}
              onDelete={() => handleDelete(eventType.id)}
              onCopyLink={() => handleCopyLink(eventType.slug)}
              onBook={() => navigate(`/mankirat/${eventType.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EventTypeCard = ({ eventType, onEdit, onDelete, onCopyLink, onBook }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: eventType.color || '#006bff' }}
      ></div>
      <div className="p-5 flex-1 cursor-pointer" onClick={onEdit}>
        <div className="flex justify-between items-start mb-2">
           <div>
             <input type="checkbox" className="w-4 h-4 text-calendlyBlue border-gray-300 rounded mb-3 mt-1 cursor-pointer" onClick={e => e.stopPropagation()}/>
             <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-calendlyBlue transition-colors">{eventType.name}</h3>
           </div>
           <div className="relative" onClick={e => e.stopPropagation()}>
             <button
               onClick={() => setMenuOpen(prev => !prev)}
               className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition"
             >
               <MoreHorizontal className="w-5 h-5" />
             </button>
             {menuOpen && (
               <div
                 className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                 onMouseLeave={() => setMenuOpen(false)}
               >
                 <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                   <Pencil className="w-4 h-4 text-gray-400" /> Edit
                 </button>
                 <button onClick={() => { setMenuOpen(false); onBook(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                   <CalendarPlus className="w-4 h-4 text-gray-400" /> Book meeting
                 </button>
                 <button onClick={() => { setMenuOpen(false); onCopyLink(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                   <Link2 className="w-4 h-4 text-gray-400" /> Copy link
                 </button>
                 <div className="border-t border-gray-100 my-1" />
                 <button onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                   <Trash2 className="w-4 h-4" /> Delete
                 </button>
               </div>
             )}
           </div>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{eventType.description || "No description provided."}</p>
        <div className="flex items-center text-gray-500 text-sm mb-1 font-medium">
          <Clock className="w-4 h-4 mr-2" />
          {eventType.durationMinutes} mins
        </div>
      </div>
      {/* Card Footer — "Book meeting" replaces "Copy link" */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 group-hover:bg-blue-50/30 transition-colors">
         <button
           onClick={onBook}
           className="text-calendlyBlue hover:text-blue-800 text-sm font-semibold flex items-center gap-1.5"
         >
           <CalendarPlus className="w-4 h-4" /> Book meeting
         </button>
         <button
           onClick={onCopyLink}
           className="px-4 py-1.5 border border-calendlyBlue text-calendlyBlue rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1.5"
         >
           <Copy className="w-3.5 h-3.5" /> Copy link
         </button>
      </div>
    </div>
  );
};

export default Dashboard;