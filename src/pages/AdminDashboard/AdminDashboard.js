import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteRegistration,
  fetchRegistration,
  fetchRegistrations,
  getRecordField,
  getRecordId,
  updateRegistration,
} from '../../api/adminRegistrations';
import { clearAdminSession, getAdminSession } from '../../api/adminLogin';
import SiteHeader from '../../components/SiteHeader/SiteHeader';
import {
  formatDateTime,
  getCountryLabel,
  registrationToFormState,
} from '../../utils/registrationDisplay';
import './AdminDashboard.css';

const EMPTY_FORM = registrationToFormState({});

function AdminDashboard() {
  const navigate = useNavigate();
  const session = getAdminSession();

  const [registrations, setRegistrations] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRegistrations = async (query = '') => {
    setIsLoading(true);
    setListError('');

    try {
      const data = await fetchRegistrations(query);
      setRegistrations(data);
    } catch (error) {
      setListError(error.message);
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      navigate('/admin', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const timer = setTimeout(() => {
      loadRegistrations(searchInput.trim());
    }, searchInput ? 350 : 0);

    return () => clearTimeout(timer);
  }, [searchInput, session]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin', { replace: true });
  };

  const openRegistration = async (id) => {
    setPanelError('');
    setIsEditing(false);
    setIsPanelOpen(true);

    try {
      const record = await fetchRegistration(id);
      setFormState(registrationToFormState(record));
    } catch (error) {
      setPanelError(error.message);
      setFormState({ ...EMPTY_FORM, id });
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setIsEditing(false);
    setPanelError('');
    setFormState(EMPTY_FORM);
  };

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setPanelError('');
    setIsSaving(true);

    try {
      await updateRegistration(formState);
      setIsEditing(false);
      await loadRegistrations(searchInput.trim());
      const record = await fetchRegistration(formState.id);
      setFormState(registrationToFormState(record));
    } catch (error) {
      setPanelError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this registration permanently? This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    setPanelError('');
    setIsDeleting(true);

    try {
      await deleteRegistration(formState.id);
      closePanel();
      await loadRegistrations(searchInput.trim());
    } catch (error) {
      setPanelError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="admin-page">
      <SiteHeader />

      <div className="admin-dashboard">
        <div className="admin-dashboard__topbar">
          <div>
            <h1 className="admin-dashboard__title">Registrations</h1>
            <p className="admin-dashboard__subtitle">
              Manage guest registrations for Marambo Residence.
            </p>
          </div>
          <button type="button" className="admin-dashboard__logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        <div className="admin-dashboard__toolbar">
          <input
            type="search"
            className="admin-dashboard__search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, room, email, or phone..."
          />
          <button
            type="button"
            className="admin-dashboard__refresh"
            onClick={() => loadRegistrations(searchInput.trim())}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>

        <div className="admin-dashboard__stats">
          <span>{registrations.length} registration{registrations.length === 1 ? '' : 's'}</span>
          {session.admin?.email && <span>Signed in as {session.admin.email}</span>}
        </div>

        {listError && (
          <p className="admin-dashboard__error" role="alert">
            {listError}
          </p>
        )}

        <div className="admin-dashboard__card">
          {isLoading ? (
            <p className="admin-dashboard__empty">Loading registrations...</p>
          ) : registrations.length === 0 ? (
            <p className="admin-dashboard__empty">No registrations found.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((record) => {
                    const id = getRecordId(record);
                    return (
                      <tr key={id}>
                        <td data-label="Guest">{getRecordField(record, 'fullName', 'full_name')}</td>
                        <td data-label="Room">
                          {getRecordField(record, 'bookingRoomNo', 'booking_room_no')}
                        </td>
                        <td data-label="Check-in">
                          {formatDateTime(
                            getRecordField(record, 'checkInDateTime', 'check_in_date_time'),
                          )}
                        </td>
                        <td data-label="Email">
                          {getRecordField(record, 'emailAddress', 'email_address')}
                        </td>
                        <td data-label="Phone">
                          {getRecordField(record, 'phoneNumber', 'phone_number')}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-table__view-btn"
                            onClick={() => openRegistration(id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div className="admin-panel">
          <button
            type="button"
            className="admin-panel__backdrop"
            aria-label="Close registration details"
            onClick={closePanel}
          />
          <div className="admin-panel__content" role="dialog" aria-modal="true">
            <div className="admin-panel__header">
              <div>
                <h2>{formState.fullName || 'Registration Details'}</h2>
                <p>Booking / Room: {formState.bookingRoomNo || '—'}</p>
              </div>
              <button type="button" className="admin-panel__close" onClick={closePanel}>
                ×
              </button>
            </div>

            {panelError && (
              <p className="admin-dashboard__error admin-panel__error" role="alert">
                {panelError}
              </p>
            )}

            <div className="admin-panel__actions">
              {!isEditing ? (
                <>
                  <button type="button" className="btn btn--secondary" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn--secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>

            <div className="admin-panel__sections">
              <RegistrationFields
                formState={formState}
                isEditing={isEditing}
                onChange={updateField}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationFields({ formState, isEditing, onChange }) {
  const sections = [
    {
      title: 'Guest Information',
      fields: [
        { key: 'bookingRoomNo', label: 'Booking / Room No.' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'nationality', label: 'Nationality', display: getCountryLabel(formState.nationality) },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender' },
        { key: 'phoneCountryCode', label: 'Phone Country Code' },
        { key: 'phoneNumber', label: 'Phone Number' },
        { key: 'emailAddress', label: 'Email Address', type: 'email' },
        { key: 'residentialAddress', label: 'Residential Address', textarea: true },
      ],
    },
    {
      title: 'Identification',
      fields: [
        { key: 'idType', label: 'ID Type' },
        { key: 'idNumber', label: 'ID Number' },
        {
          key: 'countryOfIssue',
          label: 'Country of Issue',
          display: getCountryLabel(formState.countryOfIssue),
        },
      ],
    },
    {
      title: 'Stay Details',
      fields: [
        { key: 'checkInDateTime', label: 'Check-In', type: 'datetime-local' },
        { key: 'checkOutDateTime', label: 'Check-Out', type: 'datetime-local' },
        { key: 'numberOfGuests', label: 'Number of Guests', type: 'number' },
        { key: 'purposeOfStay', label: 'Purpose of Stay' },
        { key: 'vehicleMakeModel', label: 'Vehicle Make / Model' },
        { key: 'registrationNumber', label: 'Registration Number' },
      ],
    },
    {
      title: 'Emergency Contact',
      fields: [
        { key: 'emergencyContactName', label: 'Name' },
        { key: 'emergencyContactRelationship', label: 'Relationship' },
        { key: 'emergencyContactCountryCode', label: 'Phone Country Code' },
        { key: 'emergencyContactPhone', label: 'Phone Number' },
      ],
    },
    {
      title: 'Declaration',
      fields: [
        { key: 'signatureDate', label: 'Signature Date', type: 'date' },
        {
          key: 'declarationConfirmed',
          label: 'Declaration Confirmed',
          display: formState.declarationConfirmed === '1' || formState.declarationConfirmed === true
            ? 'Yes'
            : 'No',
        },
      ],
    },
  ];

  return sections.map((section) => (
    <section key={section.title} className="admin-panel__section">
      <h3>{section.title}</h3>
      <div className="admin-panel__grid">
        {section.fields.map((field) => (
          <div
            key={field.key}
            className={['admin-panel__field', field.textarea && 'admin-panel__field--full']
              .filter(Boolean)
              .join(' ')}
          >
            <label htmlFor={`admin-field-${field.key}`}>{field.label}</label>
            {isEditing && !field.display ? (
              field.textarea ? (
                <textarea
                  id={`admin-field-${field.key}`}
                  value={formState[field.key] || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  id={`admin-field-${field.key}`}
                  type={field.type || 'text'}
                  value={formState[field.key] || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              )
            ) : (
              <p>{field.display ?? (formState[field.key] || '—')}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  ));
}

export default AdminDashboard;
