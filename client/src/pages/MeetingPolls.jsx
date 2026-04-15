import { useState } from 'react';
import { Search, Filter, Link2, MoreVertical, X, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPolls, createPoll, deletePoll as deletePollAPI } from '../api';

/* ─── tiny helpers ─── */
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am–7pm

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtHour(h) {
  if (h === 12) return '12PM';
  if (h > 12) return `${h - 12}PM`;
  return `${h}AM`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
}

/* ─── Step 1: Week‑calendar slot picker ─── */
function SlotPicker({ selections, onChange }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date(); today.setHours(0,0,0,0);

  const toggleSlot = (day, hour) => {
    const key = `${day.toDateString()}|${hour}`;
    const next = new Set(selections);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange(next);
  };

  const isSelected = (day, hour) => selections.has(`${day.toDateString()}|${hour}`);

  const clearDay = (day) => {
    const next = new Set(selections);
    HOURS.forEach(h => next.delete(`${day.toDateString()}|${h}`));
    onChange(next);
  };
  const addAllDay = (day) => {
    const next = new Set(selections);
    HOURS.forEach(h => next.add(`${day.toDateString()}|${h}`));
    onChange(next);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Week nav */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
        <button onClick={() => setWeekStart(addDays(weekStart,-7))} className="p-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600"/>
        </button>
        <button onClick={() => setWeekStart(addDays(weekStart,7))} className="p-1.5 rounded-full hover:bg-gray-100">
          <ChevronRight className="w-5 h-5 text-gray-600"/>
        </button>
        <span className="font-bold text-gray-900 text-base">
          {MONTHS[weekStart.getMonth()]} {weekStart.getFullYear()}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="h-16 flex items-end pb-2 pl-2 text-xs text-gray-400">All day</div>
        {weekDays.map((day, i) => {
          const past = day < today;
          const hasAny = HOURS.some(h => selections.has(`${day.toDateString()}|${h}`));
          return (
            <div key={i} className={`h-16 flex flex-col items-center justify-end pb-2 select-none ${past ? 'opacity-40' : ''}`}>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{DAYS[i]}</span>
              <span className={`text-xl font-extrabold mt-0.5 ${isSameDay(day, new Date()) ? 'bg-calendlyBlue text-white w-9 h-9 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                {day.getDate()}
              </span>
              {!past && (
                hasAny
                  ? <button onClick={() => clearDay(day)} className="text-[10px] text-red-500 font-semibold mt-0.5 hover:underline leading-none">Clear times</button>
                  : <button onClick={() => addAllDay(day)} className="text-[10px] text-calendlyBlue font-semibold mt-0.5 hover:underline leading-none">+ Add times</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Hour grid */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => (
          <div key={hour} className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            <div className="h-12 flex items-start pt-1 pl-2 text-xs text-gray-400 font-medium">{fmtHour(hour)}</div>
            {weekDays.map((day, di) => {
              const past = day < today;
              const sel = isSelected(day, hour);
              return (
                <button
                  key={di}
                  disabled={past}
                  onClick={() => !past && toggleSlot(day, hour)}
                  className={`h-12 border border-gray-100 transition-colors ${past ? 'cursor-not-allowed bg-gray-50/50' : sel ? 'bg-calendlyBlue/20 border-calendlyBlue/30 hover:bg-calendlyBlue/30' : 'hover:bg-blue-50'}`}
                >
                  {sel && (
                    <span className="block mx-1 rounded text-xs bg-calendlyBlue text-white font-semibold px-1 py-0.5 truncate leading-tight">
                      {fmtHour(hour)} – {fmtHour(hour + 1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main MeetingPolls component ─── */
const MeetingPolls = () => {
  const queryClient = useQueryClient();
  const { data: pollsData, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: getPolls,
  });
  const polls = pollsData?.data?.data || [];

  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1); // 1=calendar 2=details 3=share
  const [selections, setSelections] = useState(new Set());
  const [duration, setDuration] = useState('30 minutes');
  const [details, setDetails] = useState({ name: 'Meeting', location: 'zoom', description: '', reserveTimes: false, showVotes: true });
  const [pollLink, setPollLink] = useState('');
  const [search, setSearch] = useState('');

  const resetWizard = () => {
    setStep(1); setSelections(new Set());
    setDetails({ name: 'Meeting', location: 'zoom', description: '', reserveTimes: false, showVotes: true });
    setDuration('30 minutes'); setPollLink('');
  };

  const openWizard = () => { resetWizard(); setCreating(true); };
  const closeWizard = () => { setCreating(false); resetWizard(); };

  const createMutation = useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      setStep(3);
    },
    onError: () => toast.error('Failed to create poll'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePollAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      toast.success('Poll deleted');
    },
    onError: () => toast.error('Failed to delete poll'),
  });

  const handleShare = () => {
    const id = Math.random().toString(36).slice(2, 10);
    const link = `${window.location.origin}/poll/${id}`;
    setPollLink(link);
    
    createMutation.mutate({
      name: details.name,
      duration,
      location: details.location,
      description: details.description,
      reserveTimes: details.reserveTimes,
      showVotes: details.showVotes,
      link,
      selections: Array.from(selections),
    });
  };

  const copyLink = (link = pollLink) => {
    navigator.clipboard.writeText(link);
    toast.success('Poll link copied!');
  };

  const deletePoll = (id) => {
    deleteMutation.mutate(id);
  };

  const filteredPolls = polls.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* ─── Wizard Modal ─── */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 flex items-center justify-between px-6 h-14 shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900 text-base">New meeting poll</span>
              {/* Progress bar */}
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-calendlyBlue rounded-full transition-all" style={{ width: `${((step-1)/2)*100}%` }}/>
              </div>
            </div>
            <button onClick={closeWizard} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Step 1 – Select times */}
          {step === 1 && (
            <div className="flex flex-1 overflow-hidden bg-white">
              {/* Left panel */}
              <div className="w-56 border-r border-gray-200 p-6 flex flex-col gap-6 shrink-0">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time zone</label>
                  <button className="flex items-center gap-1.5 text-sm text-calendlyBlue font-semibold">
                    🌐 India Standard Time ▾
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-400">
                    {['15 minutes','30 minutes','45 minutes','60 minutes','90 minutes'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Host</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-calendlyBlue text-white flex items-center justify-center font-bold text-sm">MK</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mankirat Kaur (you)</p>
                      <p className="text-xs text-gray-400">Weekdays, 9am – 5pm</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-auto">Click on slots in the calendar to propose times.</p>
              </div>

              {/* Calendar */}
              <SlotPicker selections={selections} onChange={setSelections} />

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-500 font-medium">
                  {selections.size} / 40 times selected ▾
                </span>
                <button
                  onClick={() => { if (selections.size === 0) { toast.error('Select at least one time slot'); return; } setStep(2); }}
                  className="bg-calendlyBlue text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2 – Event details */}
          {step === 2 && (
            <div className="flex-1 overflow-y-auto bg-gray-50 flex items-start justify-center py-10 px-4">
              <div className="w-full max-w-lg space-y-5">
                {/* Selections summary */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Selections</h3>
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-calendlyBlue font-semibold hover:underline">
                      ✏️ Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">👤 Mankirat Kaur (you)</p>
                    <p className="flex items-center gap-2">🕐 {duration}</p>
                    <p className="flex items-center gap-2">📅 {selections.size} time{selections.size !== 1 ? 's' : ''} selected ▾</p>
                  </div>
                </div>

                {/* Event details */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <h3 className="font-bold text-gray-900">Event details</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting name <span className="text-red-500">*</span></label>
                    <input
                      value={details.name} onChange={e => setDetails(prev => ({...prev, name: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{key:'zoom',label:'Zoom',emoji:'📹'},{key:'phone',label:'Phone call',emoji:'📞'},{key:'inperson',label:'In-person meeting',emoji:'📍'},{key:'other',label:'All options',emoji:'⌄'}].map(loc => (
                        <button key={loc.key} onClick={() => setDetails(prev=>({...prev,location:loc.key}))} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition ${details.location===loc.key ? 'border-calendlyBlue bg-blue-50 text-calendlyBlue' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <span className="text-xl">{loc.emoji}</span> {loc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setDetails(prev=>({...prev, showDesc: !prev.showDesc}))} className="text-sm text-calendlyBlue font-semibold hover:underline">
                    + Add description/instructions
                  </button>
                  {details.showDesc && (
                    <textarea rows={3} placeholder="Add a description..." value={details.description} onChange={e => setDetails(prev=>({...prev,description:e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  )}
                </div>

                {/* Optional settings */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <h3 className="font-bold text-gray-900">Optional settings</h3>
                  {[
                    { key:'reserveTimes', label:'Reserve times', desc:'Put placeholders on your calendar for all offered times until one of them is booked.' },
                    { key:'showVotes', label:'Show votes on page', desc:'Allow poll participants to see each other\'s names and votes.' },
                  ].map(s => (
                    <div key={s.key} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                      </div>
                      <button onClick={() => setDetails(prev=>({...prev,[s.key]:!prev[s.key]}))}
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${details[s.key] ? 'bg-calendlyBlue' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${details[s.key] ? 'translate-x-5' : ''}`}/>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Invitee language</p>
                      <p className="text-xs text-gray-400">Sets the language of your booking page and communications.</p>
                    </div>
                    <span className="text-sm text-calendlyBlue font-semibold">English</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pb-10">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-full font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    Back
                  </button>
                  <button onClick={handleShare} disabled={!details.name.trim()} className="flex-1 py-2.5 rounded-full font-bold bg-calendlyBlue text-white hover:bg-blue-700 transition shadow-md shadow-blue-200 disabled:opacity-50">
                    Share meeting poll
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 – Share */}
          {step === 3 && (
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                {/* Blue header */}
                <div className="bg-[#1b3d6e] p-8 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Link2 className="w-6 h-6 text-white"/>
                  </div>
                  <h2 className="text-2xl font-extrabold mb-1">Your poll is ready to share!</h2>
                  <p className="text-white/70 text-sm">Invite people to vote on times that work for them.</p>
                  {/* Link copy bar */}
                  <div className="mt-5 flex items-center gap-2 bg-white rounded-xl overflow-hidden px-4 py-2.5">
                    <span className="flex-1 text-gray-700 text-sm truncate font-medium">{pollLink}</span>
                    <button className="p-1 text-gray-400 hover:text-gray-700">✏️</button>
                    <button onClick={() => copyLink(pollLink)} className="bg-calendlyBlue text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
                      Copy Link
                    </button>
                  </div>
                  <button className="mt-3 text-white/70 text-sm flex items-center gap-1 hover:text-white">
                    🔗 View live page
                  </button>
                </div>

                {/* Next steps */}
                <div className="p-8 space-y-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Steps</h3>
                  {[
                    { n:1, title:'Share the link', desc:"Send your poll to everyone you want to vote on times." },
                    { n:2, title:'Track the votes', desc:"We'll send you an email whenever someone votes, and you can come back to check the results at any time." },
                    { n:3, title:'Book the meeting!', desc:"We'll show you the most popular options, and send everyone calendar invites once you decide on a final meeting time." },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 shrink-0">{s.n}</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                        <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-8 pb-8">
                  <button onClick={closeWizard} className="w-full py-3 rounded-full font-bold bg-calendlyBlue text-white hover:bg-blue-700 transition shadow-md shadow-blue-200">
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Main Page ─── */}
      <div className="w-full flex flex-col pt-4">
        {/* Search + filter bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search meeting polls"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4"/> Filter ▾
          </button>
        </div>

        {polls.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-white border border-gray-200 rounded-2xl p-12 shadow-sm">
            <div className="max-w-md">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Find the best time for everyone</h2>
              <p className="text-gray-500 mb-6">Gather everyone's availability to pick the best time for the group. Track votes as they come in, and book the most popular time.</p>
              <div className="flex items-center gap-4">
                <button onClick={openWizard} className="flex items-center gap-2 bg-calendlyBlue text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200">
                  + Create meeting poll
                </button>
                <a href="#" className="text-sm text-calendlyBlue font-semibold hover:underline flex items-center gap-1">
                  🎓 Learn more →
                </a>
              </div>
            </div>
            {/* Decorative illustration */}
            <div className="shrink-0 bg-blue-50 rounded-2xl p-6 flex gap-4 items-center">
              <div className="bg-white rounded-xl shadow-md p-4 w-44 space-y-2">
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map((day,i) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: ['#ef4444','#f59e0b','#006bff','#8b5cf6','#22c55e'][i] }}/>
                    <span className="text-xs font-semibold text-gray-700">{day}</span>
                    <div className="flex gap-1 ml-auto">
                      {[0,1,2].slice(0, i < 2 ? 1 : i === 2 ? 3 : i === 3 ? 2 : 1).map(j => (
                        <span key={j} className="text-gray-400 text-xs">👍</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-calendlyBlue rounded-xl shadow-md p-4 text-white text-center w-32">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5 text-white"/>
                </div>
                <p className="font-bold text-sm">Wednesday</p>
                <p className="text-white/70 text-xs">Confirmed</p>
                <div className="mt-2 text-white/60 text-lg">📅</div>
              </div>
            </div>
          </div>
        ) : (
          /* Polls table */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid gap-0 border-b border-gray-100 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ gridTemplateColumns:'2rem 1fr 1fr 1fr 1fr auto' }}>
              <input type="checkbox" className="mt-0.5"/>
              <span>Name</span><span>Created</span><span>Status</span><span>Votes</span><span/>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredPolls.map(poll => (
                <div key={poll.id} className="grid items-center gap-0 px-6 py-4 hover:bg-gray-50 transition" style={{ gridTemplateColumns:'2rem 1fr 1fr 1fr 1fr auto' }}>
                  <input type="checkbox" className="mt-0.5"/>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{poll.name}</p>
                    <p className="text-xs text-gray-400">{poll.duration}</p>
                  </div>
                  <span className="text-sm text-gray-600">{new Date(poll.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm text-calendlyBlue font-semibold">{poll.status}</span>
                  <span className="text-sm text-gray-600">{poll.votes}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyLink(poll.link)} className="flex items-center gap-1 text-sm text-calendlyBlue font-semibold hover:underline">
                      <Link2 className="w-4 h-4"/> Copy link
                    </button>
                    <div className="relative group">
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-4 h-4"/>
                      </button>
                      <div className="absolute right-0 hidden group-hover:block w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        <button onClick={() => { copyLink(poll.link); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Link2 className="w-4 h-4 text-gray-400"/> Copy link
                        </button>
                        <button onClick={() => deletePoll(poll.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4"/> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Create more */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={openWizard} className="flex items-center gap-2 text-sm text-calendlyBlue font-bold hover:underline">
                + Create meeting poll
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MeetingPolls;
