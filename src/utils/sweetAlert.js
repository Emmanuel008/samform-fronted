import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './sweetAlert.css';

const DARK_THEME = {
  background: '#1f2a3d',
  color: '#f8fafc',
  confirmButtonColor: '#7c5cfc',
  iconColor: '#22c55e',
};

function fireAlert(options) {
  return Swal.fire({
    buttonsStyling: true,
    confirmButtonText: 'OK',
    heightAuto: false,
    ...DARK_THEME,
    customClass: {
      popup: 'swal-marambo',
      title: 'swal-marambo__title',
      htmlContainer: 'swal-marambo__text',
      confirmButton: 'swal-marambo__confirm',
      icon: 'swal-marambo__icon',
    },
    ...options,
  });
}

export function getAdminDisplayName(session, fallback = 'Admin') {
  return (
    session?.admin?.name ||
    session?.admin?.email ||
    session?.admin?.username ||
    session?.name ||
    session?.email ||
    fallback
  );
}

export function showLoginSuccessAlert(displayName = 'Admin') {
  return fireAlert({
    title: 'Welcome back',
    text: `Signed in as ${displayName}`,
    icon: 'success',
    confirmButtonText: 'OK',
  });
}

export function showRegistrationSuccessAlert() {
  return fireAlert({
    title: 'Registration Submitted',
    text: 'Thank you for completing the Marambo Residence guest registration form.',
    icon: 'success',
    confirmButtonText: 'Register Another Guest',
  });
}

export function showSuccessAlert(title, text, confirmButtonText = 'OK') {
  return fireAlert({
    title,
    text,
    icon: 'success',
    confirmButtonText,
  });
}

export function showErrorAlert(title, text) {
  return fireAlert({
    title,
    text,
    icon: 'error',
    iconColor: '#ef4444',
    confirmButtonColor: '#7c5cfc',
  });
}
