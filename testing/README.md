# 🧪 Testing Directory

All testing-related files and scripts.

## 📂 Structure

### `/scripts/`
PowerShell test scripts:
- `test-*.ps1` - Various test scripts
- API testing
- Authentication testing
- CRM integration testing

### `/e2e/`
End-to-end tests

### `/unit/`
Unit tests (__tests__ folder)

### Configuration
- `jest.config.js` - Jest configuration
- `jest-setup.js` - Jest setup

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run specific test
npm test -- test-name

# Run E2E tests
npm run test:e2e
```

## 📖 Documentation
See [Testing Guide](../docs/testing/) for detailed testing documentation.
