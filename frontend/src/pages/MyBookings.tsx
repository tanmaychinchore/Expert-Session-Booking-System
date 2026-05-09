import { useEffect, useState } from 'react';
import { fetchBookingsByEmail } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types';

export default function MyBookings() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      loadBookingsForEmail(user.email);
    }
  }, [user]);

  const loadBookingsForEmail = async (targetEmail: string) => {
    if (!targetEmail.trim()) return;

    setError('');
    setBookings([]);
    setLoading(true);

    try {
      const response = await fetchBookingsByEmail(targetEmail);
      setBookings(response.data.data || []);
      if (!response.data.data || response.data.data.length === 0) {
        setError('No bookings found for this email.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    loadBookingsForEmail(email);
  };

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <h2>My bookings</h2>
          <p>{user ? 'Check your session bookings and status.' : 'Check your session bookings and status by entering your email.'}</p>
        </div>
      </div>

      {!user && (
        <form onSubmit={handleSearch} className="email-search-form" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="button button-primary">Search</button>
        </form>
      )}

      {loading && <div className="status-message">Loading bookings...</div>}
      {error && <div className="status-message error">{error}</div>}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article key={booking._id} className="booking-card">
            <div>
              <h3>{booking.expert.name}</h3>
              <p className="meta">{booking.expert.category} · {booking.date} · {booking.timeSlot}</p>
            </div>
            <div className="booking-details">
              <span className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</span>
              <p>{booking.name}</p>
              <p>{booking.email}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
