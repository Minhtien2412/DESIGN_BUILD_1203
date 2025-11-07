/**
 * StatusBadge Component Tests
 */

import { render } from '@testing-library/react-native';
import StatusBadge from '../../components/ui/status-badge';

describe('StatusBadge Component', () => {
  test('renders with default props', () => {
    const { getByText } = render(<StatusBadge status="pending" />);
    expect(getByText('Chờ xử lý')).toBeTruthy();
  });

  test('renders custom label', () => {
    const { getByText } = render(
      <StatusBadge status="pending" label="Custom Label" />
    );
    expect(getByText('Custom Label')).toBeTruthy();
  });

  test('renders all status types correctly', () => {
    const statuses: Array<any> = [
      'pending',
      'active',
      'completed',
      'cancelled',
      'approved',
      'rejected',
      'in-progress',
      'on-hold',
    ];

    statuses.forEach(status => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container).toBeTruthy();
    });
  });

  test('renders without icon when showIcon is false', () => {
    const { queryByTestId } = render(
      <StatusBadge status="completed" showIcon={false} />
    );
    // Icon should not be rendered
    expect(queryByTestId('status-icon')).toBeNull();
  });

  test('applies correct size styles', () => {
    const { rerender, getByText } = render(
      <StatusBadge status="active" size="small" />
    );
    expect(getByText('Đang thực hiện')).toBeTruthy();

    rerender(<StatusBadge status="active" size="large" />);
    expect(getByText('Đang thực hiện')).toBeTruthy();
  });
});
