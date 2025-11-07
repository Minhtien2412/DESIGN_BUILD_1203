/**
 * Formatters Utility Tests
 * Unit tests for all formatting functions
 */

import {
    capitalize,
    capitalizeWords,
    formatAddress,
    formatArea,
    formatCurrency,
    formatCurrencyShort,
    formatDate,
    formatDateTime,
    formatDuration,
    formatFileSize,
    formatNumberShort,
    formatPercentage,
    formatPhoneNumber,
    formatPriceRange,
    formatProgress,
    formatRating,
    formatRelativeTime,
    formatTime,
    isValidEmail,
    isValidVietnamesePhone,
    parseCurrency,
    truncateText,
} from '../../utils/formatters';

describe('Currency Formatting', () => {
  test('formatCurrency formats VND correctly', () => {
    expect(formatCurrency(1500000)).toBe('1,500,000 ₫');
    expect(formatCurrency(0)).toBe('0 ₫');
    expect(formatCurrency(1000)).toBe('1,000 ₫');
  });

  test('formatCurrencyShort converts to billions/millions', () => {
    expect(formatCurrencyShort(1500000000)).toBe('1.5 tỷ');
    expect(formatCurrencyShort(2500000)).toBe('2.5 tr');
    expect(formatCurrencyShort(500000)).toBe('500,000 ₫');
  });

  test('formatPriceRange formats ranges correctly', () => {
    expect(formatPriceRange(1000000, 5000000)).toContain('tr');
  });

  test('parseCurrency extracts numbers from formatted string', () => {
    expect(parseCurrency('1,500,000 ₫')).toBe(1500000);
    expect(parseCurrency('invalid')).toBe(0);
  });
});

describe('Date/Time Formatting', () => {
  const testDate = new Date('2025-01-15T14:30:00');

  test('formatDate returns dd/mm/yyyy', () => {
    expect(formatDate(testDate)).toBe('15/01/2025');
  });

  test('formatTime returns HH:mm', () => {
    expect(formatTime(testDate)).toBe('14:30');
  });

  test('formatDateTime combines date and time', () => {
    expect(formatDateTime(testDate)).toBe('15/01/2025 14:30');
  });

  test('formatRelativeTime returns Vietnamese relative time', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 phút trước');
  });
});

describe('Number Formatting', () => {
  test('formatArea adds square meter unit', () => {
    expect(formatArea(350)).toBe('350 m²');
    expect(formatArea(100, 'ha')).toBe('100 ha');
  });

  test('formatPercentage formats with decimals', () => {
    expect(formatPercentage(75.5, 1)).toBe('75.5%');
    expect(formatPercentage(80)).toBe('80%');
  });

  test('formatNumberShort uses K/M/B suffixes', () => {
    expect(formatNumberShort(1500)).toBe('1.5K');
    expect(formatNumberShort(2500000)).toBe('2.5M');
    expect(formatNumberShort(3500000000)).toBe('3.5B');
  });

  test('formatFileSize converts bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('formatRating formats with max rating', () => {
    expect(formatRating(4.8)).toBe('4.8/5.0');
  });
});

describe('Phone Number Formatting', () => {
  test('formatPhoneNumber formats Vietnamese numbers', () => {
    expect(formatPhoneNumber('0912345678')).toBe('0912 345 678');
  });

  test('isValidVietnamesePhone validates correctly', () => {
    expect(isValidVietnamesePhone('0912345678')).toBe(true);
    expect(isValidVietnamesePhone('0812345678')).toBe(true);
    expect(isValidVietnamesePhone('1234567890')).toBe(false);
    expect(isValidVietnamesePhone('091234567')).toBe(false);
  });
});

describe('Email Validation', () => {
  test('isValidEmail validates email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@')).toBe(false);
  });
});

describe('Text Formatting', () => {
  test('truncateText adds ellipsis', () => {
    expect(truncateText('Long text here', 10)).toBe('Long te...');
    expect(truncateText('Short', 10)).toBe('Short');
  });

  test('capitalize capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });

  test('capitalizeWords capitalizes each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });
});

describe('Address Formatting', () => {
  test('formatAddress combines address parts', () => {
    const address = {
      street: '123 Nguyen Hue',
      ward: 'P. Ben Nghe',
      district: 'Q1',
      city: 'TP. HCM',
    };
    expect(formatAddress(address)).toBe('123 Nguyen Hue, P. Ben Nghe, Q1, TP. HCM');
  });

  test('formatAddress handles missing parts', () => {
    const address = {
      street: '123 ABC',
      city: 'Hanoi',
    };
    expect(formatAddress(address)).toBe('123 ABC, Hanoi');
  });
});

describe('Duration Formatting', () => {
  test('formatDuration formats seconds to time', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});

describe('Progress Formatting', () => {
  test('formatProgress formats Vietnamese stage', () => {
    expect(formatProgress(2, 5)).toBe('Giai đoạn 2/5');
  });
});
