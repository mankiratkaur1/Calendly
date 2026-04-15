import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getBookings, cancelBooking } from '../api';
import { Calendar, Filter, DownloadCloud, Info, ChevronDown, X, Clock, User, Mail } from 'lucide-react';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBuffers, setShowBuffers] = useState(false);

  useEffect(() => {
    document.title = 'Meetings - Calendly';
  }, []);

  const queryClient = useQueryClient();

  const { data: bookingsItems, isLoading } = useQuery({
    queryKey: ['bookings', activeTab],
    queryFn: () => getBookings(activeTab),
  });
  const bookings = bookingsItems?.data?.data || [];

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setShowCancelModal(false);
      setSelectedBooking(null);
      toast.success('Meeting cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel meeting');
    },
  });

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      cancelMutation.mutate(selectedBooking.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate(),
      weekday: date.toLocaleDateString('default', { weekday: 'long' }),
      fullDate: date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const formatTime = (start, end) => {
    const startTime = new Date(start).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    const endTime = new Date(end).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="w-full flex flex-col pt-4 max-w-[1000px]">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
              My Calendly <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
             <div className="flex items-center gap-2 text-sm text-gray-700">
                Show buffers <Info className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setShowBuffers(!showBuffers)}
                  className={`w-9 h-5 rounded-full inline-flex items-center px-0.5 ml-1 cursor-pointer transition-colors relative ${showBuffers ? 'bg-calendlyBlue' : 'bg-gray-200'}`}
                >
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${showBuffers ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
             </div>
         </div>
         <div className="text-sm text-gray-500">
            {bookings.length > 0 ? `Displaying 1 – ${bookings.length} of ${bookings.length} Events` : 'Displaying 0 – 0 of 0 Events'}
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[400px]">
        {/* Tabs inside card */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 pt-4">
           <div className="flex items-center gap-6">
             <button
               onClick={() => setActiveTab('upcoming')}
               className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'upcoming' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Upcoming
               {activeTab === 'upcoming' && (
                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-calendlyBlue rounded-t-md"></div>
               )}
             </button>
             <button
               onClick={() => setActiveTab('past')}
               className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'past' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Past
               {activeTab === 'past' && (
                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-calendlyBlue rounded-t-md"></div>
               )}
             </button>
             <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1">
               Date Range <ChevronDown className="w-3 h-3" />
             </button>
           </div>
           
           <div className="pb-2">
             {/* filter/export removed — not yet implemented */}
           </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4 py-8">
               <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
               <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
               <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="relative mb-6">
                 <Calendar className="w-20 h-20 text-gray-300" />
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm">0</div>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">No Events Yet</h2>
              <p className="text-gray-500 mb-6 text-sm">Share Event Type links to schedule events.</p>
              <button
                onClick={() => window.location.href = '/app/event-types'}
                className="bg-calendlyBlue hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm shadow-sm"
              >
                View Event Types
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-xl flex items-stretch hover:shadow-md transition-shadow overflow-hidden">
                  {/* Left Date Panel */}
                  <div className="bg-gray-50 w-28 border-r border-gray-200 p-4 flex flex-col items-center justify-center gap-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {formatDate(booking.startTime).weekday.slice(0,3)}, {formatDate(booking.startTime).month}
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">{formatDate(booking.startTime).day}</div>
                  </div>
                  
                  {/* Right Detail Panel */}
                  <div className="p-5 flex-1 flex justify-between items-center bg-white">
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <span className="w-2.5 h-2.5 rounded-full bg-calendlyBlue flex-shrink-0"></span>
                         <span className="text-sm text-gray-500 font-semibold">{formatTime(booking.startTime, booking.endTime)}</span>
                       </div>
                       {showBuffers && (booking.eventType.bufferBefore > 0 || booking.eventType.bufferAfter > 0) && (
                         <div className="ml-5.5 mb-2 flex flex-wrap gap-2">
                           {booking.eventType.bufferBefore > 0 && (
                             <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-tighter">
                               Buffer Before: {booking.eventType.bufferBefore}m
                             </span>
                           )}
                           {booking.eventType.bufferAfter > 0 && (
                             <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-tighter">
                               Buffer After: {booking.eventType.bufferAfter}m
                             </span>
                           )}
                         </div>
                       )}
                       <h3 className="font-bold text-gray-900 mb-0.5 text-base">{booking.inviteeName}</h3>
                       <p className="text-sm text-gray-500">
                         <span className="font-medium text-gray-700">{booking.eventType.name}</span>
                         {' · '}{booking.inviteeEmail}
                       </p>
                     </div>

                     <div className="flex flex-col items-end gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {booking.status === 'CONFIRMED' ? '✓ Confirmed' : 'Cancelled'}
                        </span>
                        {activeTab === 'upcoming' && booking.status === 'CONFIRMED' && (
                          <div className="flex gap-3">
                             <button
                               onClick={() => handleReschedule(booking)}
                               className="text-sm text-calendlyBlue font-bold hover:underline transition"
                             >
                               Reschedule
                             </button>
                             <button
                               onClick={() => handleCancel(booking)}
                               className="text-sm text-gray-500 hover:text-red-600 font-bold transition"
                             >
                               Cancel
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Cancel Modal ─── */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Cancel Meeting</h3>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-semibold text-gray-700">{selectedBooking.eventType.name}</span> with <span className="font-semibold text-gray-700">{selectedBooking.inviteeName}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {formatTime(selectedBooking.startTime, selectedBooking.endTime)} · {formatDate(selectedBooking.startTime).fullDate}
            </p>
            <p className="text-sm text-gray-600 mb-6">This will notify the invitee and remove the event from your calendar.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-full font-bold text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
              >
                Go back
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelMutation.isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelMutation.isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reschedule Modal ─── */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900">Reschedule Meeting</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meeting Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold">{selectedBooking.inviteeName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{selectedBooking.inviteeEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{formatTime(selectedBooking.startTime, selectedBooking.endTime)} · {formatDate(selectedBooking.startTime).fullDate}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              To reschedule, share the booking link with <span className="font-semibold">{selectedBooking.inviteeName}</span> and ask them to book a new time. Then cancel the current meeting.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/mankirat/${selectedBooking.eventType.slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Booking link copied — share it with the invitee!');
                  setShowRescheduleModal(false);
                }}
                className="w-full py-3 bg-calendlyBlue text-white rounded-full font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200"
              >
                Copy Booking Link
              </button>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  handleCancel(selectedBooking);
                }}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-full font-bold hover:bg-red-50 transition text-sm"
              >
                Cancel this meeting too
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="w-full py-2.5 text-gray-500 font-semibold hover:text-gray-700 text-sm"
              >
                Never mind
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;