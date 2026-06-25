import { useCallback, useEffect, useState } from 'react';
import {
  deleteRegistration,
  fetchRegistration,
  fetchRegistrations,
  getRecordId,
  getRegistrationLabel,
  updateRegistration,
} from '../../api/adminRegistrations';
import {
  formatDateTime,
  getCountryLabel,
  getIdDocumentUrl,
  isImageAsset,
  isPdfAsset,
  registrationToFormState,
} from '../../utils/registrationDisplay';
import {
  IconBed,
  IconCalendar,
  IconClose,
  IconEdit,
  IconIdCard,
  IconPhone,
  IconRoom,
  IconShield,
  IconTrash,
  IconUser,
} from '../../components/AdminIcons/AdminIcons';
import '../AdminDashboard/AdminDashboard.css';

const EMPTY_FORM = registrationToFormState({});
const PAGE_SIZE = 10;

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeRegistrationId, setActiveRegistrationId] = useState('');

  const loadRegistrations = useCallback(async (query = '') => {
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRegistrations(searchInput.trim());
    }, searchInput ? 350 : 0);

    return () => clearTimeout(timer);
  }, [searchInput, loadRegistrations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(registrations.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStartIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRegistrations = registrations.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);
  const showingFrom = registrations.length === 0 ? 0 : pageStartIndex + 1;
  const showingTo = Math.min(pageStartIndex + PAGE_SIZE, registrations.length);

  const openRegistration = async (id) => {
    setPanelError('');
    setIsEditing(false);
    setIsPanelOpen(true);
    setActiveRegistrationId(id);

    try {
      const record = await fetchRegistration(id);
      setFormState({
        ...registrationToFormState(record),
        id: getRecordId(record) || id,
      });
    } catch (error) {
      setPanelError(error.message);
      setFormState({ ...EMPTY_FORM, id });
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setIsEditing(false);
    setPanelError('');
    setActiveRegistrationId('');
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
      const recordId = getRecordId(formState) || activeRegistrationId;
      const record = await fetchRegistration(recordId);
      setFormState({
        ...registrationToFormState(record),
        id: getRecordId(record) || recordId,
      });
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

    const recordId = getRecordId(formState) || activeRegistrationId;

    if (!recordId) {
      setPanelError('Registration id is missing. Close this panel and open the record again.');
      setIsDeleting(false);
      return;
    }

    try {
      await deleteRegistration(recordId);
      closePanel();
      await loadRegistrations(searchInput.trim());
    } catch (error) {
      setPanelError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__topbar">
        <div>
          <h1 className="admin-dashboard__title">Registrations</h1>
          <p className="admin-dashboard__subtitle">
            Manage guest registrations for Marambo Residence.
          </p>
        </div>
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

      {listError && (
        <p className="admin-dashboard__error" role="alert">
          {listError}
        </p>
      )}

      <div className="admin-dashboard__card">
        {isLoading && registrations.length === 0 ? (
          <p className="admin-dashboard__empty">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <p className="admin-dashboard__empty">No registrations found.</p>
        ) : (
          <>
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
                  {paginatedRegistrations.map((record, index) => {
                    const id = getRecordId(record);
                    const rowKey = id || `registration-row-${pageStartIndex + index}`;

                    return (
                      <tr key={rowKey}>
                        <td data-label="Guest">
                          {getRegistrationLabel(record, pageStartIndex + index)}
                        </td>
                        <td data-label="Room">{record.bookingRoomNo || '—'}</td>
                        <td data-label="Check-in">{formatDateTime(record.checkInDateTime)}</td>
                        <td data-label="Email">{record.emailAddress || '—'}</td>
                        <td data-label="Phone">{record.phoneNumber || '—'}</td>
                        <td className="admin-table__actions">
                          <button
                            type="button"
                            className="admin-table__view-btn"
                            onClick={() => openRegistration(id)}
                            disabled={!id}
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

            {registrations.length > 0 && (
              <div className="admin-pagination">
                <p className="admin-pagination__info">
                  Showing {showingFrom}–{showingTo} of {registrations.length} registrations
                </p>
                <div className="admin-pagination__controls">
                  <button
                    type="button"
                    className="admin-pagination__btn"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={safePage === 1}
                  >
                    Previous
                  </button>

                  <div className="admin-pagination__pages">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={[
                          'admin-pagination__page',
                          page === safePage && 'admin-pagination__page--active',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === safePage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="admin-pagination__btn"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={safePage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isPanelOpen && (
        <div className="admin-panel">
          <button
            type="button"
            className="admin-panel__backdrop"
            aria-label="Close registration details"
            onClick={closePanel}
          />
          <div className="admin-panel__content" role="dialog" aria-modal="true" aria-labelledby="registration-panel-title">
            <div className="admin-panel__hero">
              <div className="admin-panel__hero-top">
                <span className="admin-panel__eyebrow">Guest Registration</span>
                <button type="button" className="admin-panel__close" onClick={closePanel} aria-label="Close">
                  <IconClose className="admin-panel__close-icon" />
                </button>
              </div>

              <h2 id="registration-panel-title" className="admin-panel__title">
                {formState.fullName || 'Registration Details'}
              </h2>

              <div className="admin-panel__meta">
                <span className="admin-panel__chip">
                  <IconRoom className="admin-panel__chip-icon" />
                  Room {formState.bookingRoomNo || '—'}
                </span>
                <span className="admin-panel__chip">
                  <IconCalendar className="admin-panel__chip-icon" />
                  {formatDateTime(formState.checkInDateTime)}
                </span>
                {(formState.declarationConfirmed === '1' || formState.declarationConfirmed === true) && (
                  <span className="admin-panel__chip admin-panel__chip--success">
                    <IconShield className="admin-panel__chip-icon" />
                    Declared
                  </span>
                )}
              </div>

              <div className="admin-panel__actions">
                {!isEditing ? (
                  <>
                    <button type="button" className="btn btn--secondary btn--with-icon" onClick={() => setIsEditing(true)}>
                      <IconEdit className="btn__icon" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--with-icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <IconTrash className="btn__icon" />
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
            </div>

            {panelError && (
              <p className="admin-dashboard__error admin-panel__error" role="alert">
                {panelError}
              </p>
            )}

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
      icon: IconUser,
      fields: [
        { key: 'bookingRoomNo', label: 'Booking / Room No.' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'nationality', label: 'Nationality', display: getCountryLabel(formState.nationality) },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender' },
        { key: 'phoneNumber', label: 'Phone Number' },
        { key: 'emailAddress', label: 'Email Address', type: 'email' },
        { key: 'residentialAddress', label: 'Residential Address', textarea: true },
      ],
    },
    {
      title: 'Identification',
      icon: IconIdCard,
      fields: [
        { key: 'idType', label: 'ID Type' },
        { key: 'idNumber', label: 'ID Number' },
        {
          key: 'countryOfIssue',
          label: 'Country of Issue',
          display: getCountryLabel(formState.countryOfIssue),
        },
        { key: 'idDocument', label: 'Uploaded ID', type: 'idDocument', fullWidth: true },
      ],
    },
    {
      title: 'Stay Details',
      icon: IconBed,
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
      icon: IconPhone,
      fields: [
        { key: 'emergencyContactName', label: 'Name' },
        { key: 'emergencyContactRelationship', label: 'Relationship' },
        { key: 'emergencyContactPhone', label: 'Phone Number' },
      ],
    },
    {
      title: 'Declaration',
      icon: IconShield,
      fields: [
        { key: 'signatureDate', label: 'Signature Date', type: 'date' },
        {
          key: 'declarationConfirmed',
          label: 'Declaration Confirmed',
          display: formState.declarationConfirmed === '1' || formState.declarationConfirmed === true
            ? 'Yes'
            : 'No',
          badge: formState.declarationConfirmed === '1' || formState.declarationConfirmed === true
            ? 'confirmed'
            : 'pending',
        },
      ],
    },
  ];

  return sections.map((section) => {
    const SectionIcon = section.icon;

    return (
      <section key={section.title} className="admin-panel__section-card">
        <div className="admin-panel__section-head">
          <span className="admin-panel__section-icon">
            <SectionIcon className="admin-panel__section-icon-svg" />
          </span>
          <h3>{section.title}</h3>
        </div>
        <div className="admin-panel__grid">
          {section.fields.map((field) => (
            <div
              key={field.key}
              className={[
                'admin-panel__field',
                (field.textarea || field.fullWidth) && 'admin-panel__field--full',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <label htmlFor={`admin-field-${field.key}`}>{field.label}</label>
              {field.type === 'idDocument' ? (
                <IdDocumentField value={formState.idDocument} />
              ) : isEditing && !field.display ? (
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
              ) : field.badge ? (
                <span className={`admin-panel__badge admin-panel__badge--${field.badge}`}>
                  {field.display ?? (formState[field.key] || '—')}
                </span>
              ) : (
                <div className="admin-panel__value">
                  {field.display
                    ?? (field.type === 'datetime-local'
                      ? formatDateTime(formState[field.key])
                      : (formState[field.key] || '—'))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  });
}

function IdDocumentField({ value }) {
  const url = getIdDocumentUrl({ idDocument: value });

  if (!url) {
    return <div className="admin-panel__value">—</div>;
  }

  if (isImageAsset(value) || isImageAsset(url)) {
    return (
      <div className="admin-panel__id-preview">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-panel__id-link"
        >
          <img src={url} alt="Uploaded ID document" className="admin-panel__id-image" />
        </a>
        <p className="admin-panel__id-caption">Click image to open full size</p>
      </div>
    );
  }

  if (isPdfAsset(value) || isPdfAsset(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="admin-panel__file-link"
      >
        View uploaded ID (PDF)
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="admin-panel__file-link">
      View uploaded ID
    </a>
  );
}

export default AdminRegistrations;
