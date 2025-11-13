/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FormErrorBoundary } from '../../components/FormErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that works fine
const WorkingComponent = () => <Text>Working</Text>;

describe('FormErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <FormErrorBoundary>
        <WorkingComponent />
      </FormErrorBoundary>
    );
    
    expect(getByText('Working')).toBeTruthy();
  });

  it('catches errors and shows fallback UI', () => {
    const { getByText } = render(
      <FormErrorBoundary>
        <ThrowError />
      </FormErrorBoundary>
    );
    
    expect(getByText(/Something went wrong/i)).toBeTruthy();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = jest.fn();
    
    render(
      <FormErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </FormErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalled();
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
  });

  it('shows custom fallback when provided', () => {
    const CustomFallback = () => <Text>Custom Error Message</Text>;
    
    const { getByText } = render(
      <FormErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </FormErrorBoundary>
    );
    
    expect(getByText('Custom Error Message')).toBeTruthy();
  });
});
