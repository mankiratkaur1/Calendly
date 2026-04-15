import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import EventTypeForm from './pages/EventTypeForm';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import MeetingPolls from './pages/MeetingPolls';
import PublicBookingPage from './pages/PublicBookingPage';
import BookingConfirmed from './pages/BookingConfirmed';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/event-types" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/app/event-types/new" element={<AdminLayout><EventTypeForm /></AdminLayout>} />
          <Route path="/app/event-types/:id/edit" element={<AdminLayout><EventTypeForm /></AdminLayout>} />
          <Route path="/app/availability" element={<AdminLayout><Availability /></AdminLayout>} />
          <Route path="/app/meetings" element={<AdminLayout><Meetings /></AdminLayout>} />
          <Route path="/app/meeting-polls" element={<AdminLayout><MeetingPolls /></AdminLayout>} />
          <Route path="/:username/:slug" element={<PublicBookingPage />} />
          <Route path="/confirmed" element={<BookingConfirmed />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;