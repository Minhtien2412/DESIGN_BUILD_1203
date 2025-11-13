/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../../components/ui/button';

describe('Button Component', () => {
  it('renders correctly with text', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock}>Press Me</Button>);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} disabled>
        Disabled Button
      </Button>
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { UNSAFE_getByType } = render(
      <Button loading>
        Loading
      </Button>
    );
    
    // Should show ActivityIndicator when loading
    const activityIndicator = UNSAFE_getByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('applies variant styles', () => {
    const { getByTestId } = render(
      <Button variant="outline" testID="outline-button">
        Outline
      </Button>
    );
    
    expect(getByTestId('outline-button')).toBeTruthy();
  });
});
