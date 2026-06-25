import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRegistrations, getRecordId, getRegistrationLabel } from '../../api/adminRegistrations';
import { IconCalendar, IconRegistrations, IconUsers } from '../../components/AdminIcons/AdminIcons';
import { formatDateTime } from '../../utils/registrationDisplay';
import '../AdminDashboard/AdminDashboard.css';
import './AdminOverview.css';

const RECENT_REGISTRATIONS_LIMIT = 5;

function getRegistrationTimestamp(record) {
  const value =
    record.createdAt ||
    record.updatedAt ||
    record.checkInDateTime ||
    record.created_at ||
    record.updated_at ||
    record.check_in_date_time;

  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

function getRecentRegistrations(registrations, limit = RECENT_REGISTRATIONS_LIMIT) {
  return [...registrations]
    .sort((a, b) => getRegistrationTimestamp(b) - getRegistrationTimestamp(a))
    .slice(0, limit);
}

function AdminOverview() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchRegistrations();
      setRegistrations(data);
    } catch (loadError) {
      setError(loadError.message);
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const upcomingCheckIns = registrations.filter((record) => {
    if (!record.checkInDateTime) {
      return false;
    }

    const checkIn = new Date(record.checkInDateTime);
    const now = new Date();
    const weekAhead = new Date();
    weekAhead.setDate(now.getDate() + 7);

    return checkIn >= now && checkIn <= weekAhead;
  }).length;

  const recentRegistrations = getRecentRegistrations(registrations);

  return (
    <div className="admin-dashboard admin-overview">
      <div className="admin-dashboard__topbar">
        <div>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Overview of guest registrations at Marambo Residence.
          </p>
        </div>
        <button
          type="button"
          className="admin-dashboard__refresh"
          onClick={loadOverview}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="admin-dashboard__error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-overview__cards">
        <article className="admin-overview__card">
          <div className="admin-overview__card-icon admin-overview__card-icon--primary">
            <IconUsers className="admin-overview__icon" />
          </div>
          <div>
            <p className="admin-overview__card-label">Total Registrations</p>
            <p className="admin-overview__card-value">
              {isLoading ? '—' : registrations.length}
            </p>
          </div>
        </article>

        <article className="admin-overview__card">
          <div className="admin-overview__card-icon admin-overview__card-icon--accent">
            <IconCalendar className="admin-overview__icon" />
          </div>
          <div>
            <p className="admin-overview__card-label">Check-ins This Week</p>
            <p className="admin-overview__card-value">
              {isLoading ? '—' : upcomingCheckIns}
            </p>
          </div>
        </article>

        <article className="admin-overview__card">
          <div className="admin-overview__card-icon admin-overview__card-icon--neutral">
            <IconRegistrations className="admin-overview__icon" />
          </div>
          <div>
            <p className="admin-overview__card-label">Manage Records</p>
            <Link to="/admin/registrations" className="admin-overview__card-link">
              View all registrations
            </Link>
          </div>
        </article>
      </div>

      <section className="admin-dashboard__card admin-overview__recent">
        <div className="admin-overview__recent-header">
          <div>
            <h2>Recent Registrations</h2>
            <p className="admin-overview__recent-note">Showing latest {RECENT_REGISTRATIONS_LIMIT} registrations</p>
          </div>
          <Link to="/admin/registrations" className="admin-overview__view-all">
            View all
          </Link>
        </div>

        {isLoading ? (
          <p className="admin-dashboard__empty">Loading registrations...</p>
        ) : recentRegistrations.length === 0 ? (
          <p className="admin-dashboard__empty">No registrations yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((record, index) => (
                  <tr key={getRecordId(record) || `overview-row-${index}`}>
                    <td data-label="Guest">{getRegistrationLabel(record, index)}</td>
                    <td data-label="Room">{record.bookingRoomNo || '—'}</td>
                    <td data-label="Check-in">{formatDateTime(record.checkInDateTime)}</td>
                    <td data-label="Email">{record.emailAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminOverview;
