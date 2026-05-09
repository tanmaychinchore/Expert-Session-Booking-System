import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchExperts } from '../api';
import type { Expert } from '../types';

interface ExpertListProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const categories = ['All', 'Business', 'Technology', 'Design', 'Marketing'];

export default function ExpertList({ search, category, onSearchChange, onCategoryChange }: ExpertListProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadExperts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchExperts(page, search, category);
        setExperts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError('Unable to load experts. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadExperts();
  }, [page, search, category]);

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <h2>Event Types</h2>
          <p>Choose the right expert type and book your session.</p>
        </div>
        <div className="filters-row">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              setPage(1);
            }}
            placeholder="Search experts"
          />
          <select
            value={category}
            onChange={(event) => {
              onCategoryChange(event.target.value);
              setPage(1);
            }}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="status-message">Loading experts...</div>}
      {error && <div className="status-message error">{error}</div>}

      <div className="expert-grid">
        {experts.map((expert) => (
          <article key={expert._id} className="expert-card">
            <header>
              <div className="expert-avatar">{expert.name.charAt(0)}</div>
              <div>
                <h3>{expert.name}</h3>
                <p className="meta">{expert.category}</p>
              </div>
            </header>
            <p className="excerpt">{expert.bio}</p>
            <div className="expert-footer">
              <span>{expert.experience}+ yrs</span>
              <span>⭐ {expert.rating}</span>
              <span>₹{expert.price.toFixed(0)}</span>
            </div>
            <Link to={`/experts/${expert._id}`} className="button button-primary">
              View booking page
            </Link>
          </article>
        ))}
      </div>

      <div className="pagination-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
        <button className="button button-ghost" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
          Previous
        </button>
        <span style={{ fontWeight: 'bold' }}>Page {page} of {totalPages}</span>
        <button className="button button-ghost" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </section>
  );
}
