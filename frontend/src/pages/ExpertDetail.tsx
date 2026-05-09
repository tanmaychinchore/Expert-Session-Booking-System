import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { createBooking, fetchExpertById } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Expert } from '../types';

const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadExpert = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const response = await fetchExpertById(id);
        setExpert(response.data.data);
        setSelectedDate(response.data.data.slotGroups?.[0]?.date ?? '');
      } catch (error) {
        setMessage({ type: 'error', text: 'Unable to load expert details.' });
      } finally {
        setLoading(false);
      }
    };

    loadExpert();
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);


  useEffect(() => {
    const onSlotBooked = (payload: { expert: string; date: string; timeSlot: string }) => {
      if (payload.expert !== id) return;
      setExpert((current) => {
        if (!current) return current;
        return {
          ...current,
          slotGroups: current.slotGroups?.map((group) => ({
            ...group,
            slots: group.slots.map((slot) =>
              group.date === payload.date && slot.time === payload.timeSlot
                ? { ...slot, isBooked: true }
                : slot
            ),
          })),
        } as Expert;
      });
    };

    socket.on('slotBooked', onSlotBooked);
    return () => {
      socket.off('slotBooked', onSlotBooked);
    };
  }, [id]);

  const selectedGroup = useMemo(() => {
    return expert?.slotGroups?.find((group) => group.date === selectedDate);
  }, [expert, selectedDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!expert || !selectedDate || !selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a date and slot before booking.' });
      return;
    }

    setSubmitting(true);

    try {
      await createBooking({
        expert: expert._id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes: form.notes,
      });

      setMessage({ type: 'success', text: 'Booking completed successfully!' });
      setSelectedSlot('');
      setTimeout(() => navigate('/bookings'), 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'This slot is no longer available.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <section className="page-panel"><div className="status-message">Loading expert details...</div></section>;
  }

  if (!expert) {
    return <section className="page-panel"><div className="status-message error">Expert not found.</div></section>;
  }

  return (
    <section className="page-panel detail-view">
      <div className="detail-top">
        <button className="button button-ghost" onClick={() => navigate(-1)}>&larr; Back</button>
        <div className="detail-header">
          <h2>{expert.name}</h2>
          <p>{expert.category} · {expert.experience}+ yrs · ⭐ {expert.rating}</p>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <div className="expert-info">
            <div className="expert-avatar large">{expert.name.charAt(0)}</div>
            <div>
              <h3>{expert.name}</h3>
              <p>{expert.bio}</p>
              <div className="price-pill">${expert.price.toFixed(0)} / session</div>
            </div>
          </div>

          <div className="slots-panel">
            <h3>Available time slots</h3>
            <div className="slot-tabs">
              {expert.slotGroups?.map((group) => (
                <button
                  key={group.date}
                  type="button"
                  className={group.date === selectedDate ? 'slot-tab active' : 'slot-tab'}
                  onClick={() => {
                    setSelectedDate(group.date);
                    setSelectedSlot('');
                  }}
                >
                  {group.date}
                </button>
              ))}
            </div>
            <div className="slot-list">
              {selectedGroup?.slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  className={`slot-item ${slot.isBooked ? 'booked' : ''} ${selectedSlot === slot.time ? 'selected' : ''}`}
                  disabled={slot.isBooked}
                  onClick={() => !slot.isBooked && setSelectedSlot(slot.time)}
                >
                  <span>{slot.time}</span>
                  {slot.isBooked && <small>Booked</small>}
                </button>
              ))}
            </div>
          </div>
        </section>

        <form className="detail-card booking-form" onSubmit={handleSubmit}>
          <h3>Confirm booking</h3>
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>
              Name
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Email
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          </div>
          <label>
            Notes
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Add any details for your session"
            />
          </label>

          {message && <div className={`status-message ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

          <button type="submit" className="button button-primary" disabled={submitting || !selectedSlot}>
            {submitting ? 'Booking…' : 'Book session'}
          </button>
        </form>
      </div>
    </section>
  );
}
