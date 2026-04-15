import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getEventTypes, getSlots, createBooking } from '../api';
import { Clock, Globe, ArrowLeft, Video, Link as LinkIcon, Loader } from 'lucide-react';

const PublicBookingPage = () => {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Calendar/Time, 2 = Form Details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    document.title = `Select a Date & Time - Calendly`;
  }, []);

  const { data: eventTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: getEventTypes,
  });

  const eventType = eventTypes?.data?.data?.find(et => et.slug === slug);

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', eventType?.id, selectedDate],
    queryFn: () => selectedDate ? getSlots(eventType.id, selectedDate.toISOString().split('T')[0]) : null,
    enabled: !!selectedDate && !!eventType,
  });

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      navigate('/confirmed', { state: { booking: data.data.data, eventType } });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error('This time slot is already booked');
      } else {
        toast.error('Failed to book meeting');
      }
    },
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
  };

  const proceedToForm = () => {
    if (selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    const bookingData = {
      eventTypeId: eventType.id,
      inviteeName: formData.name,
      inviteeEmail: formData.email,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime.time24, // Use 24h format "HH:MM" — backend does new Date(`${date}T${time}:00`)
    };
    createMutation.mutate(bookingData);
  };

  if (typesLoading || !eventType) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
           <Loader className="w-10 h-10 text-calendlyBlue animate-spin mb-4" />
           <p className="text-gray-500 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  const initials = eventType.user?.name ? eventType.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'MK';

  return (
    <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center font-sans py-12 px-4">
      {/* Main Card Container */}
      <div className={`bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${step === 1 && selectedDate ? 'max-w-[1060px]' : 'max-w-[800px]'} w-full items-stretch`}>
        
        {/* Left Panel: Event Details */}
        <div className={`w-full md:w-[320px] p-8 border-r border-gray-100 flex flex-col relative`}>
          {step === 2 && (
             <button onClick={() => setStep(1)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-gray-50 transition shadow-sm">
                <ArrowLeft className="w-5 h-5 cursor-pointer" />
             </button>
          )}

          <div className={`${step === 2 ? 'mt-12' : ''}`}>
             <p className="text-gray-500 font-bold mb-3">{eventType.user?.name || 'Mankirat Kaur'}</p>
             <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{eventType.name}</h1>
             
             <div className="space-y-4">
                <div className="flex items-start text-gray-600 font-medium text-sm">
                   <Clock className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                   {eventType.durationMinutes} min
                </div>
                <div className="flex items-start text-gray-600 font-medium text-sm">
                   <Video className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                   Web conferencing details provided upon confirmation.
                </div>
                {step === 2 && selectedDate && selectedTime && (
                   <div className="flex items-start text-calendlyBlue font-medium text-sm">
                      <CalendarIcon className="w-5 h-5 mr-3 mt-0.5" />
                      {selectedTime.time} - {selectedTime.endTime || ''}, {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                   </div>
                )}
                {step === 2 && (
                   <div className="flex items-start text-gray-600 font-medium text-sm">
                      <Globe className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                      {eventType.user?.timezone || 'India Standard Time'}
                   </div>
                )}
             </div>

             {eventType.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                   <p className="text-gray-600 text-sm">{eventType.description}</p>
                </div>
             )}
          </div>
        </div>

        {/* Right Area */}
        <div className="flex-1 flex w-full">
           {step === 1 ? (
             <div className="flex w-full overflow-hidden relative">
               {/* Calendar Pane */}
               <div className={`p-8 w-full md:w-[480px] flex-shrink-0 transition-transform duration-300 ${selectedDate ? 'md:-translate-x-0' : ''}`}>
                 <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Date & Time</h2>
                 <DateSelection currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} onDateSelect={handleDateSelect} selectedDate={selectedDate} />
                 
                 <div className="mt-8 pt-4">
                    <p className="text-sm font-bold text-gray-800 mb-1">Time zone</p>
                    <div className="flex items-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded-md py-1 -ml-2 px-2 w-max">
                       <Globe className="w-4 h-4 mr-2 text-gray-400" />
                       India Standard Time (11:24pm) ▼
                    </div>
                 </div>
               </div>
               
               {/* Sliding Time Slots Pane */}
               {selectedDate && (
                  <div className="w-[280px] p-8 border-l border-gray-100 bg-white h-full overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-300 hidden md:block">
                     <p className="text-gray-600 font-medium mb-6">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                     </p>
                     
                     {slotsLoading ? (
                        <div className="flex justify-center py-10"><Loader className="w-8 h-8 text-calendlyBlue animate-spin" /></div>
                     ) : slotsData?.data?.data?.length > 0 ? (
                        <div className="space-y-3">
                           {slotsData.data.data.map(slot => (
                              <TimeSlotBtn 
                                 key={slot.time} 
                                 slot={slot} 
                                 isSelected={selectedTime?.time === slot.time}
                                 onSelect={() => handleTimeSelect(slot)}
                                 onConfirm={proceedToForm}
                              />
                           ))}
                        </div>
                     ) : (
                        <p className="text-center text-gray-500 py-10">No times available</p>
                     )}
                  </div>
               )}
            </div>
           ) : (
             <div className="flex-1 p-8 overflow-y-auto w-full">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Enter Details</h2>
                <form onSubmit={handleFormSubmit} className="space-y-5 max-w-sm">
                   <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">Name *</label>
                      <input 
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                         required
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">Email *</label>
                      <input 
                         type="email" 
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                         required
                      />
                      <button type="button" className="text-calendlyBlue hover:underline text-sm font-medium mt-3 border border-calendlyBlue rounded-full px-4 py-1">
                        Add Guests
                      </button>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">Please share anything that will help prepare for our meeting.</label>
                      <textarea 
                         value={formData.notes}
                         onChange={e => setFormData({...formData, notes: e.target.value})}
                         rows="3"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                      ></textarea>
                   </div>
                   
                   <div className="pt-4">
                      <button 
                         type="submit"
                         disabled={createMutation.isLoading}
                         className="bg-calendlyBlue text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                      >
                         {createMutation.isLoading ? 'Scheduling...' : 'Schedule Event'}
                      </button>
                   </div>
                </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const TimeSlotBtn = ({ slot, isSelected, onSelect, onConfirm }) => {
   if (isSelected) {
      return (
         <div className="flex gap-2">
            <div className="w-1/2 bg-gray-600 text-white font-bold text-sm h-12 flex items-center justify-center rounded-lg shadow-inner">
               {slot.time}
            </div>
            <button 
               onClick={onConfirm}
               className="flex-1 bg-calendlyBlue text-white font-bold text-sm h-12 flex items-center justify-center rounded-lg shadow hover:bg-blue-700 transition"
            >
               Confirm
            </button>
         </div>
      );
   }

   return (
      <button 
         onClick={onSelect}
         className="w-full h-12 border border-calendlyBlue text-calendlyBlue bg-white hover:border-2 font-bold text-sm flex items-center justify-center rounded-lg transition-all"
      >
         {slot.time}
      </button>
   );
};

const CalendarIcon = ({ className }) => (
   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
   </svg>
);

const DateSelection = ({ currentMonth, setCurrentMonth, onDateSelect, selectedDate }) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

  const isPast = (date) => {
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-blue-50 flex items-center justify-center text-calendlyBlue transition absolute left-8">‹</button>
        <span className="text-gray-900 font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-blue-50 flex items-center justify-center text-calendlyBlue transition absolute right-8 md:right-auto md:left-[360px]">›</button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 mb-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-500 tracking-wider h-8 flex items-center justify-center">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {days.map((date, i) => {
          const isCurrentMonth = date.getMonth() === month;
          if(!isCurrentMonth) return <div key={i}></div>;
          
          const isPastDate = isPast(new Date(date));
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();

          const baseClasses = "w-11 h-11 mx-auto flex items-center justify-center rounded-full font-bold text-sm transition-colors relative";
          let stateClasses = "text-calendlyBlue bg-blue-50 hover:bg-blue-100 cursor-pointer";
          
          if (isPastDate) stateClasses = "text-gray-300 font-medium cursor-default";
          else if (isSelected) stateClasses = "bg-calendlyBlue text-white shadow-md";
          
          return (
            <div key={i} className="flex justify-center items-center h-12">
               <button
                 onClick={() => !isPastDate && onDateSelect(new Date(date))}
                 disabled={isPastDate}
                 className={`${baseClasses} ${stateClasses}`}
               >
                 {date.getDate()}
                 {isToday && !isSelected && <div className="absolute bottom-1 bg-calendlyBlue w-1 h-1 rounded-full"></div>}
               </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicBookingPage;