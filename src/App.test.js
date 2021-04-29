import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the predictor', () => {
  render(<App />);
  const linkElement = screen.getByText(/Predictor/i);
  expect(linkElement).toBeInTheDocument();
});
