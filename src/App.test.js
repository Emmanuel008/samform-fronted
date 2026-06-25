import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders guest registration form', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText(/Guest Registration/i)).toBeInTheDocument();
  expect(screen.getByText(/MARAMBO RESIDENCE/i)).toBeInTheDocument();
  expect(screen.getByAltText(/Marambo Residence logo/i)).toBeInTheDocument();
});

test('renders admin login page', () => {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText(/Admin Sign In/i)).toBeInTheDocument();
});
