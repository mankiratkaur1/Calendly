import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { CheckCircle2, User, Video, Calendar as CalendarIcon, Globe } from 'lucide-react';

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, eventType } = location.state || {};

  useEffect(() => {
    document.title = 'Booking Confirmed - Calendly';
  }, []);

  if (!booking || !eventType) {
    return <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center font-sans text-gray-500 font-medium">No booking data found.</div>;
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventType.name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Meeting with ${booking.inviteeName}`)}`;

  const hostName = eventType.user?.name || 'Mankirat Kaur';

  return (
    <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center font-sans py-12 px-4">
      <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden max-w-[800px] w-full p-10 flex flex-col items-center">
        
        <div className="flex flex-col items-center text-center mb-8">
           <div className="flex items-center gap-2 mb-12 opacity-80">
             <div className="w-8 h-8 bg-calendlyBlue rounded-full flex items-center justify-center">
               <span className="text-white font-bold text-xl leading-none">C</span>
             </div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">Calendly</span>
           </div>
           <CheckCircle2 className="w-16 h-16 text-[#00a587] mb-6" />
           <h1 className="text-3xl font-extrabold text-gray-900 mb-2">You are scheduled</h1>
           <p className="text-gray-600 font-medium text-lg">A calendar invitation has been sent to your email address.</p>
        </div>

        <div className="w-full max-w-[500px] border border-gray-200 rounded-xl p-6 mb-8 text-left">
           <h2 className="text-xl font-bold text-gray-900 mb-4">{eventType.name}</h2>
           
           <div className="space-y-4">
              <div className="flex text-gray-600">
                 <User className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                 <span className="font-medium text-[15px]">{hostName}</span>
              </div>
              <div className="flex text-gray-600">
                 <CalendarIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                 <span className="font-bold text-[15px]">{startTime} - {endTime}, {formattedDate}</span>
              </div>
              <div className="flex text-gray-600">
                 <Globe className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                 <span className="font-medium text-[15px]">India Standard Time</span>
              </div>
              <div className="flex text-gray-600">
                 <Video className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                 <span className="font-medium text-[15px]">Web conferencing details to follow.</span>
              </div>
           </div>
        </div>

        <div className="w-full max-w-[500px] flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 mb-8">
           <a
             href={googleCalendarUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="flex-1 flex justify-center items-center font-bold text-sm bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-full hover:border-[#006bff] hover:text-[#006bff] transition"
           >
             Google Calendar
           </a>
           <button className="flex-1 font-bold text-sm bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-full hover:border-[#006bff] hover:text-[#006bff] transition">
             Outlook / iCal
           </button>
        </div>

        <Link to="/app/event-types" className="text-[#006bff] font-bold text-sm hover:underline">
          Schedule another event
        </Link>

      </div>
    </div>
  );
};

export default BookingConfirmed;