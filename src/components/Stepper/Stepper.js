import './Stepper.css';

function Stepper({ steps, currentStep }) {
  return (
    <nav className="stepper" aria-label="Form progress">
      <p className="stepper__counter">
        STEP {currentStep} OF {steps.length}
      </p>
      <ol className="stepper__list">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <li
              key={label}
              className={[
                'stepper__item',
                isCompleted && 'stepper__item--completed',
                isActive && 'stepper__item--active',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="stepper__indicator" aria-hidden="true">
                {stepNumber}
              </span>
              <span className="stepper__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
