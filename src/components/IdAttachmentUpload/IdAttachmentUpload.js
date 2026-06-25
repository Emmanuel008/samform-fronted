import { useRef, useState } from 'react';
import './IdAttachmentUpload.css';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
];

const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf';
const MAX_SIZE_MB = 5;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IdAttachmentUpload({ file, previewUrl, onChange, error }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      onChange(null, 'Please upload a JPG, PNG, WEBP image or PDF file.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange(null, `File must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    onChange(selectedFile, '');
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange(null, '');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = file?.type.startsWith('image/');
  const isPdf = file?.type === 'application/pdf';

  return (
    <div className="id-attachment">
      <label className="id-attachment__label" htmlFor="idAttachment">
        Attach ID Copy
        <span className="id-attachment__hint">Image or PDF, max {MAX_SIZE_MB}MB</span>
      </label>

      {!file ? (
        <div
          className={[
            'id-attachment__dropzone',
            isDragging && 'id-attachment__dropzone--dragging',
            error && 'id-attachment__dropzone--error',
          ]
            .filter(Boolean)
            .join(' ')}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload ID copy as image or PDF"
        >
          <span className="id-attachment__icon" aria-hidden="true">
            📎
          </span>
          <p className="id-attachment__text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="id-attachment__formats">JPG, PNG, WEBP or PDF</p>
        </div>
      ) : (
        <div className="id-attachment__preview">
          {isImage && previewUrl && (
            <img
              src={previewUrl}
              alt="ID document preview"
              className="id-attachment__image"
            />
          )}
          {isPdf && (
            <div className="id-attachment__pdf-icon" aria-hidden="true">
              PDF
            </div>
          )}
          <div className="id-attachment__file-info">
            <span className="id-attachment__filename">{file.name}</span>
            <span className="id-attachment__filesize">{formatFileSize(file.size)}</span>
          </div>
          <div className="id-attachment__actions">
            <button
              type="button"
              className="id-attachment__btn id-attachment__btn--replace"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="id-attachment__btn id-attachment__btn--remove"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id="idAttachment"
        type="file"
        className="id-attachment__input"
        accept={ACCEPT_ATTR}
        onChange={handleFileChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'idAttachment-error' : undefined}
      />

      {error && (
        <p id="idAttachment-error" className="id-attachment__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default IdAttachmentUpload;
