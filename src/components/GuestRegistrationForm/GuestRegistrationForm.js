import { useEffect, useState } from 'react';
import { submitRegistration } from '../../api/submitRegistration';
import Stepper from '../Stepper/Stepper';
import CountrySelect from '../CountrySelect/CountrySelect';
import PhoneInput from '../PhoneInput/PhoneInput';
import IdAttachmentUpload from '../IdAttachmentUpload/IdAttachmentUpload';
import SignaturePad from '../SignaturePad/SignaturePad';
import SiteHeader from '../SiteHeader/SiteHeader';
import './GuestRegistrationForm.css';

const TERMS_PDF_URL = `${process.env.PUBLIC_URL}/Marambo%20Residence%2CTerms%20and%20Conditions.pdf`;

const STEPS = [
  'Guest Info',
  'Identification',
  'Stay Details',
  'Vehicle',
  'Emergency',
  'Declaration',
];

const INITIAL_FORM_DATA = {
  bookingRoomNo: '',
  fullName: '',
  nationality: '',
  dateOfBirth: '',
  gender: '',
  phoneCountryCode: '',
  phoneNumber: '',
  emailAddress: '',
  residentialAddress: '',
  idType: '',
  idNumber: '',
  countryOfIssue: '',
  checkInDateTime: '',
  checkOutDateTime: '',
  numberOfGuests: '',
  purposeOfStay: '',
  vehicleMakeModel: '',
  registrationNumber: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactCountryCode: '',
  emergencyContactPhone: '',
  agreedToTerms: false,
  signature: '',
  signatureDate: '',
};

function GuestRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [idAttachment, setIdAttachment] = useState(null);
  const [idAttachmentPreview, setIdAttachmentPreview] = useState('');
  const [idAttachmentError, setIdAttachmentError] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    return () => {
      if (idAttachmentPreview) {
        URL.revokeObjectURL(idAttachmentPreview);
      }
    };
  }, [idAttachmentPreview]);

  const handleIdAttachmentChange = (file, errorMessage = '') => {
    setIdAttachment(file);
    setIdAttachmentError(errorMessage);

    if (file?.type.startsWith('image/')) {
      setIdAttachmentPreview(URL.createObjectURL(file));
    } else {
      setIdAttachmentPreview('');
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (event) => {
    const form = event.currentTarget.closest('form');
    if (!form.reportValidity()) {
      return;
    }

    if (currentStep === 2 && !idAttachment) {
      setIdAttachmentError('Please attach a copy of your ID (image or PDF).');
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.agreedToTerms) {
      return;
    }

    if (!formData.signature) {
      setSignatureError('Please provide your signature.');
      return;
    }

    if (!idAttachment) {
      setIdAttachmentError('Please attach a copy of your ID (image or PDF).');
      setCurrentStep(2);
      return;
    }

    setSignatureError('');
    setIdAttachmentError('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await submitRegistration(formData, idAttachment);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setIdAttachment(null);
    setIdAttachmentPreview('');
    setIdAttachmentError('');
    setSignatureError('');
    setSubmitError('');
    setCurrentStep(1);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="guest-form-page">
        <SiteHeader />
        <div className="guest-form">
          <div className="guest-form__success">
            <h2>Registration Submitted</h2>
            <p>Thank you for completing the Marambo Residence guest registration form.</p>
            <button type="button" className="btn btn--primary" onClick={handleReset}>
              Register Another Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-form-page">
      <SiteHeader />

      <div className="guest-form">
        <p className="guest-form__intro">Complete your registration details below</p>

        <Stepper steps={STEPS} currentStep={currentStep} />

      <form className="guest-form__body" onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <section className="form-step" aria-labelledby="step-1-heading">
            <h2 id="step-1-heading" className="form-step__heading">
              1. Guest Information
            </h2>

            <div className="form-field form-field--full">
              <label htmlFor="bookingRoomNo">Booking / Room No.</label>
              <input
                id="bookingRoomNo"
                type="text"
                value={formData.bookingRoomNo}
                onChange={(e) => updateField('bookingRoomNo', e.target.value)}
                placeholder="e.g. MR-204"
              />
            </div>

            <div className="form-grid form-grid--spaced-top">
              <div className="form-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <CountrySelect
                id="nationality"
                label="Nationality"
                value={formData.nationality}
                onChange={(value) => updateField('nationality', value)}
                placeholder="Select country"
                required
              />

              <div className="form-field">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  required
                />
              </div>

              <fieldset className="form-field form-field--fieldset">
                <legend>Gender</legend>
                <div className="radio-group radio-group--pills">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <label key={option} className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => updateField('gender', e.target.value)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <PhoneInput
                id="phoneNumber"
                label="Phone Number"
                countryCode={formData.phoneCountryCode}
                phoneNumber={formData.phoneNumber}
                onCountryChange={(value) => updateField('phoneCountryCode', value)}
                onPhoneChange={(value) => updateField('phoneNumber', value)}
                required
              />

              <div className="form-field">
                <label htmlFor="emailAddress">Email Address</label>
                <input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => updateField('emailAddress', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="residentialAddress">Residential Address</label>
                <textarea
                  id="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={(e) => updateField('residentialAddress', e.target.value)}
                  placeholder="Enter residential address"
                  rows={3}
                  required
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="form-step" aria-labelledby="step-2-heading">
            <h2 id="step-2-heading" className="form-step__heading">
              2. Identification Details
            </h2>

            <fieldset className="form-field form-field--fieldset form-field--full">
              <legend>ID Type</legend>
              <div className="radio-group radio-group--cards">
                {['National ID', 'Passport', "Driver's License", 'Other'].map((option) => (
                  <label key={option} className="radio-option">
                    <input
                      type="radio"
                      name="idType"
                      value={option}
                      checked={formData.idType === option}
                      onChange={(e) => updateField('idType', e.target.value)}
                      required
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-grid form-grid--spaced-top">
              <div className="form-field">
                <label htmlFor="idNumber">ID Number</label>
                <input
                  id="idNumber"
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => updateField('idNumber', e.target.value)}
                  placeholder="Enter ID number"
                  required
                />
              </div>

              <CountrySelect
                id="countryOfIssue"
                label="Country of Issue"
                value={formData.countryOfIssue}
                onChange={(value) => updateField('countryOfIssue', value)}
                placeholder="Select country of issue"
                required
              />
            </div>

            <div className="form-field form-field--full form-field--spaced-top">
              <IdAttachmentUpload
                file={idAttachment}
                previewUrl={idAttachmentPreview}
                onChange={handleIdAttachmentChange}
                error={idAttachmentError}
              />
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="form-step" aria-labelledby="step-3-heading">
            <h2 id="step-3-heading" className="form-step__heading">
              3. Stay Details
            </h2>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="checkInDateTime">Check-In Date &amp; Time</label>
                <input
                  id="checkInDateTime"
                  type="datetime-local"
                  value={formData.checkInDateTime}
                  onChange={(e) => updateField('checkInDateTime', e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="checkOutDateTime">Expected Check-Out Date &amp; Time</label>
                <input
                  id="checkOutDateTime"
                  type="datetime-local"
                  value={formData.checkOutDateTime}
                  onChange={(e) => updateField('checkOutDateTime', e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="numberOfGuests">Number of Guests</label>
                <input
                  id="numberOfGuests"
                  type="number"
                  min="1"
                  value={formData.numberOfGuests}
                  onChange={(e) => updateField('numberOfGuests', e.target.value)}
                  placeholder="Enter number of guests"
                  required
                />
              </div>

              <fieldset className="form-field form-field--fieldset form-field--full">
                <legend>Purpose of Stay</legend>
                <div className="radio-group radio-group--cards">
                  {['Business', 'Leisure', 'Transit', 'Other'].map((option) => (
                    <label key={option} className="radio-option">
                      <input
                        type="radio"
                        name="purposeOfStay"
                        value={option}
                        checked={formData.purposeOfStay === option}
                        onChange={(e) => updateField('purposeOfStay', e.target.value)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        )}

        {currentStep === 4 && (
          <section className="form-step" aria-labelledby="step-4-heading">
            <h2 id="step-4-heading" className="form-step__heading">
              4. Vehicle Information
              <span className="form-step__optional">(Optional)</span>
            </h2>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="vehicleMakeModel">Vehicle Make / Model</label>
                <input
                  id="vehicleMakeModel"
                  type="text"
                  value={formData.vehicleMakeModel}
                  onChange={(e) => updateField('vehicleMakeModel', e.target.value)}
                  placeholder="e.g. Toyota Corolla"
                />
              </div>

              <div className="form-field">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  id="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => updateField('registrationNumber', e.target.value)}
                  placeholder="Enter registration number"
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === 5 && (
          <section className="form-step" aria-labelledby="step-5-heading">
            <h2 id="step-5-heading" className="form-step__heading">
              5. Emergency Contact
            </h2>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="emergencyContactName">Name</label>
                <input
                  id="emergencyContactName"
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="emergencyContactRelationship">Relationship</label>
                <input
                  id="emergencyContactRelationship"
                  type="text"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                  placeholder="e.g. Spouse, Parent, Friend"
                  required
                />
              </div>

              <PhoneInput
                id="emergencyContactPhone"
                label="Phone Number"
                className="form-field--full"
                countryCode={formData.emergencyContactCountryCode}
                phoneNumber={formData.emergencyContactPhone}
                onCountryChange={(value) => updateField('emergencyContactCountryCode', value)}
                onPhoneChange={(value) => updateField('emergencyContactPhone', value)}
                required
              />
            </div>
          </section>
        )}

        {currentStep === 6 && (
          <section className="form-step" aria-labelledby="step-6-heading">
            <h2 id="step-6-heading" className="form-step__heading">
              6. Declaration
            </h2>

            <div className="terms-section">
              <p className="terms-section__text">
                Please read and agree to the Marambo Residence terms and conditions before
                submitting your registration.
              </p>
              <a
                href={TERMS_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="terms-section__link"
              >
                View Marambo Residence Terms and Conditions (PDF)
              </a>
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                required
              />
              <span>
                I have read and agree to the{' '}
                <a
                  href={TERMS_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terms-checkbox__inline-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms and Conditions
                </a>
              </span>
            </label>

            <div className="form-grid form-grid--spaced-top">
              <div className="form-field form-field--full">
                <SignaturePad
                  value={formData.signature}
                  onChange={(value) => {
                    updateField('signature', value);
                    if (value) setSignatureError('');
                  }}
                  error={signatureError}
                />
              </div>

              <div className="form-field">
                <label htmlFor="signatureDate">Date</label>
                <input
                  id="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={(e) => updateField('signatureDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </section>
        )}

        <div className="form-actions">
          {submitError && (
            <p className="form-actions__error" role="alert">
              {submitError}
            </p>
          )}

          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button type="button" className="btn btn--primary" onClick={(e) => handleNext(e)}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}

export default GuestRegistrationForm;
