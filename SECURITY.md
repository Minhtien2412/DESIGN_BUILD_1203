# Security Policy

## 🔐 Sensitive Files Protection

This project uses `.gitignore` to prevent sensitive files from being committed:

### Protected Files

- `.env`, `.env.local`, `.env.production` - Environment variables
- `*.key`, `*.pem`, `*.p12` - Private keys
- `google-services.json` - Firebase config
- `keystore.properties` - Android signing
- `config.php` (Perfex CRM) - Database credentials

### Safe Files (OK to commit)

- `.env.example` - Template without real values
- `config/env.ts` - Uses `process.env` references only

## 🛡️ Security Best Practices

### For Developers

1. **Never commit secrets** - Use environment variables
2. **Use `.env.example`** - Document required variables without values
3. **Rotate exposed keys immediately** - If you accidentally commit a secret
4. **Enable 2FA** - On GitHub account

### For Production

1. **Use GitHub Secrets** - For CI/CD workflows
2. **Use environment variables** - On VPS/hosting
3. **Restrict API keys** - By domain/IP if possible
4. **Enable audit logs** - Monitor access

## 🚨 Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email: security@baotienweb.cloud
3. Include steps to reproduce

## 📋 Pre-commit Checklist

Before pushing code:

- [ ] No `.env` files staged
- [ ] No API keys in source code
- [ ] No passwords in config files
- [ ] No private keys committed
- [ ] `.gitignore` is up to date

## 🔧 Tools Used

- **gitleaks** - Secret scanning (optional)
- **GitHub Secret Scanning** - Automatic (enabled by default)
- **Dependabot** - Dependency vulnerability alerts

---

Last updated: March 2026
