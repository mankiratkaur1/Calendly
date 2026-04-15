import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAvailability, updateAvailability } from '../api';
import { Calendar, Plus, Copy, X, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── tiny helpers ─── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function formatTimeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const val = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      const suffix = h >= 12 ? 'pm' : 'am';
      const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
      opts.push({ value: val, label: `${dh}:${String(m).padStart(2,'0')}${suffix}` });
    }
  }
  return opts;
}
const TIMES = formatTimeOptions();
function fmtTime(val) {
  const t = TIMES.find(t => t.value === val);
  return t ? t.label : val;
}

/* ─── Date-specific Hours Modal ─── */
function DateHoursModal({ onClose, onApply }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [timeRanges, setTimeRanges] = useState([{ start: '09:00', end: '17:00' }]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const toggleDate = (day) => {
    const d = new Date(calYear, calMonth, day);
    if (d < today) return;
    const key = toKey(d);
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleApply = () => {
    if (selectedDates.size === 0) { toast.error('Select at least one date'); return; }
    onApply(Array.from(selectedDates), timeRanges);
    onClose();
  };

  const totalDays = daysInMonth(calYear, calMonth);
  const firstDay = firstDayOfMonth(calYear, calMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const hasSelection = selectedDates.size > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5 leading-tight">
            Select the date(s) you want to<br/>assign specific hours
          </h2>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-800">{MONTHS[calMonth]} {calYear}</span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500">
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-gray-100 border-2 border-calendlyBlue text-calendlyBlue transition">
                <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx}/>;
              const d = new Date(calYear, calMonth, day);
              const isPast = d < today;
              const isToday = toKey(d) === toKey(today);
              const isSelected = selectedDates.has(toKey(d));
              return (
                <button
                  key={idx}
                  disabled={isPast}
                  onClick={() => toggleDate(day)}
                  className={`w-9 h-9 mx-auto rounded-full text-sm font-semibold flex items-center justify-center transition-all
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-calendlyBlue text-white shadow-md shadow-blue-200' : ''}
                    ${isToday && !isSelected ? 'border-2 border-calendlyBlue text-calendlyBlue' : ''}
                    ${!isPast && !isSelected && !isToday ? 'text-gray-700 hover:bg-blue-50 hover:text-calendlyBlue' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker — shows after date selected */}
          {hasSelection && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-800 mb-3">What hours are you available?</p>
              <div className="space-y-2">
                {timeRanges.map((range, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={range.start}
                      onChange={e => setTimeRanges(prev => prev.map((r,j) => j===i ? {...r, start: e.target.value} : r))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <span className="text-gray-400 font-medium">-</span>
                    <select
                      value={range.end}
                      onChange={e => setTimeRanges(prev => prev.map((r,j) => j===i ? {...r, end: e.target.value} : r))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {timeRanges.length > 1 && (
                      <button onClick={() => setTimeRanges(prev => prev.filter((_,j) => j!==i))} className="p-1 text-gray-400 hover:text-red-500 transition">
                        <X className="w-4 h-4"/>
                      </button>
                    )}
                    {i === timeRanges.length - 1 && (
                      <button onClick={() => setTimeRanges(prev => [...prev, { start:'09:00', end:'17:00' }])} className="p-1 text-gray-400 hover:text-calendlyBlue transition">
                        <Plus className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleApply} className="flex-1 py-2.5 rounded-full font-bold bg-calendlyBlue text-white hover:bg-blue-700 transition shadow-md shadow-blue-200">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Availability Component ─── */
const Availability = () => {
  const queryClient = useQueryClient();
  const [timezone] = useState('India Standard Time (IST)');
  const [days, setDays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dateOverrides, setDateOverrides] = useState([]); // [{ dateKey, label, ranges }]

  useEffect(() => { document.title = 'Availability - Calendly'; }, []);

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: getAvailability,
  });

  useEffect(() => {
    if (availabilityData?.data?.data) {
      const dayMap = {};
      availabilityData.data.data.forEach(day => { dayMap[day.dayOfWeek] = day; });
      const initialDays = [];
      for (let i = 0; i < 7; i++) {
        initialDays.push(dayMap[i] || {
          dayOfWeek: i, startTime: '09:00', endTime: '17:00',
          isAvailable: i >= 1 && i <= 5,
        });
      }
      setDays(initialDays);
    }
  }, [availabilityData]);

  const updateMutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => { queryClient.invalidateQueries(['availability']); toast.success('Availability saved'); },
    onError: () => { toast.error('Failed to update availability'); },
  });

  const handleDayChange = (dayOfWeek, field, value) =>
    setDays(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));

  const handleSave = () => {
    days.forEach(day => updateMutation.mutate({
      dayOfWeek: day.dayOfWeek, startTime: day.startTime,
      endTime: day.endTime, isAvailable: day.isAvailable,
    }));
  };

  const handleApplyDates = (dateKeys, timeRanges) => {
    const d = new Date(dateKeys[0]);
    const newOverrides = dateKeys.map(key => {
      const [yr, mo, day] = key.split('-').map(Number);
      const date = new Date(yr, mo-1, day);
      const label = `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
      return { dateKey: key, label, year: yr, ranges: timeRanges };
    });
    setDateOverrides(prev => {
      const map = {};
      [...prev, ...newOverrides].forEach(o => { map[o.dateKey] = o; });
      return Object.values(map).sort((a,b) => a.dateKey.localeCompare(b.dateKey));
    });
    toast.success('Date-specific hours saved!');
  };

  const removeOverride = (dateKey) => setDateOverrides(prev => prev.filter(o => o.dateKey !== dateKey));

  const dayAbbreviations = ['S','M','T','W','T','F','S'];

  // Group overrides by year
  const overridesByYear = dateOverrides.reduce((acc, o) => {
    if (!acc[o.year]) acc[o.year] = [];
    acc[o.year].push(o);
    return acc;
  }, {});

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <>
      {showModal && <DateHoursModal onClose={() => setShowModal(false)} onApply={handleApplyDates}/>}

      <div className="w-full flex flex-col pt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        </div>

        {/* Single tab */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
          <button className="pb-4 text-sm font-semibold text-gray-900 relative">
            Schedules
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-calendlyBlue rounded-t-md"></div>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-20 max-w-[1000px]">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Schedule</p>
              <h2 className="text-lg font-bold text-calendlyBlue flex items-center gap-2 cursor-pointer">
                Working hours (default) <span className="text-xs">▼</span>
              </h2>
              <p className="text-sm text-gray-500 mt-2">Active on: <span className="text-calendlyBlue font-semibold">1 event type</span></p>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* Left: Weekly Hours */}
            <div className="flex-[2] p-8 border-r border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Weekly hours
              </h3>
              <p className="text-sm text-gray-500 mb-8">Set when you are typically available for meetings</p>

              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.dayOfWeek} className="flex items-start gap-4">
                    <button
                      onClick={() => handleDayChange(day.dayOfWeek, 'isAvailable', !day.isAvailable)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors flex-shrink-0 ${day.isAvailable ? 'bg-calendlyBlue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {dayAbbreviations[day.dayOfWeek]}
                    </button>
                    <div className="flex-1">
                      {day.isAvailable ? (
                        <div className="flex items-center gap-3">
                          <select value={day.startTime} onChange={e => handleDayChange(day.dayOfWeek, 'startTime', e.target.value)}
                            className="w-24 text-center px-2 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 hover:border-gray-400 bg-white">
                            {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <span className="text-gray-400">-</span>
                          <select value={day.endTime} onChange={e => handleDayChange(day.dayOfWeek, 'endTime', e.target.value)}
                            className="w-24 text-center px-2 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 hover:border-gray-400 bg-white">
                            {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <button onClick={() => handleDayChange(day.dayOfWeek, 'isAvailable', false)} className="p-1.5 text-gray-400 hover:text-gray-700 ml-2">
                            <X className="w-5 h-5"/>
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-700">
                            <Plus className="w-5 h-5"/>
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-700">
                            <Copy className="w-4 h-4"/>
                          </button>
                        </div>
                      ) : (
                        <div className="h-10 flex items-center">
                          <span className="text-gray-400 text-sm font-medium">Unavailable</span>
                          <button onClick={() => handleDayChange(day.dayOfWeek, 'isAvailable', true)} className="p-1 text-gray-400 hover:text-gray-600 ml-3">
                            <Plus className="w-5 h-5"/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button className="flex items-center gap-2 text-sm text-calendlyBlue font-bold hover:underline">
                  <Globe className="w-4 h-4"/> {timezone}
                </button>
                <button onClick={handleSave} disabled={updateMutation.isLoading}
                  className="bg-calendlyBlue text-white py-2 px-6 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Right: Date-specific hours */}
            <div className="flex-[1.5] p-8 bg-gray-50/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600"/>
                  Date-specific hours
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-semibold bg-white hover:bg-gray-50 hover:border-calendlyBlue hover:text-calendlyBlue transition"
                >
                  <Plus className="w-4 h-4"/> Hours
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">Adjust hours for specific days</p>

              {dateOverrides.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-12 opacity-60">
                  <Calendar className="w-10 h-10 text-gray-300 mb-3"/>
                  <p className="text-sm text-gray-500 font-medium">No date-specific hours set</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(overridesByYear).sort().map(([year, overrides]) => (
                    <div key={year}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{year}</p>
                      <div className="space-y-2">
                        {overrides.map(o => (
                          <div key={o.dateKey} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-gray-800 w-12">{o.label}</span>
                              <div className="space-y-0.5">
                                {o.ranges.map((r, i) => (
                                  <span key={i} className="block text-sm text-gray-600">
                                    {fmtTime(r.start)} – {fmtTime(r.end)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => removeOverride(o.dateKey)} className="p-1 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50">
                              <X className="w-4 h-4"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Availability;