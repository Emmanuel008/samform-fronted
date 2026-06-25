import { useEffect, useRef, useState } from 'react';
import './SignaturePad.css';

function SignaturePad({ value, onChange, error }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = '#111827';
    contextRef.current = context;

    return { context, width, height };
  };

  useEffect(() => {
    setupCanvas();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const setup = setupCanvas();
    if (!canvas || !setup) return;

    const { context, width, height } = setup;

    if (!value) {
      context.clearRect(0, 0, width, height);
      setIsEmpty(true);
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      setIsEmpty(false);
    };
    image.src = value;
  }, [value]);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const context = contextRef.current;
    if (!context) return;

    const { x, y } = getPosition(event);
    isDrawingRef.current = true;
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();

    const context = contextRef.current;
    if (!context) return;

    const { x, y } = getPosition(event);
    context.lineTo(x, y);
    context.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = (event) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    isDrawingRef.current = false;
    saveSignature();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    context.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setIsEmpty(true);
    onChange('');
  };

  return (
    <div className="signature-pad">
      <div className="signature-pad__header">
        <label htmlFor="signatureCanvas">Signature</label>
        <button type="button" className="signature-pad__clear" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div
        className={[
          'signature-pad__canvas-wrap',
          error && 'signature-pad__canvas-wrap--error',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <canvas
          id="signatureCanvas"
          ref={canvasRef}
          className="signature-pad__canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Draw your signature"
        />
        {isEmpty && !value && (
          <span className="signature-pad__placeholder" aria-hidden="true">
            Sign here
          </span>
        )}
      </div>

      {error && (
        <p className="signature-pad__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default SignaturePad;
