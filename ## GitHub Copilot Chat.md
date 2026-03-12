## GitHub Copilot Chat

- Extension: 0.37.9 (prod)
- VS Code: 1.109.5 (072586267e68ece9a47aa43f8c108e0dcbf44622)
- OS: win32 10.0.19045 x64
- GitHub Account: Minhtien2412

## Network

User Settings:

```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:

- DNS ipv4 Lookup: 20.205.243.168 (23 ms)
- DNS ipv6 Lookup: Error (30 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): HTTP 200 (57 ms)
- Node.js https: HTTP 200 (169 ms)
- Node.js fetch: HTTP 200 (44 ms)

Connecting to https://api.githubcopilot.com/_ping:

- DNS ipv4 Lookup: 140.82.114.21 (21 ms)
- DNS ipv6 Lookup: Error (22 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): HTTP 200 (762 ms)
- Node.js https: HTTP 200 (733 ms)
- Node.js fetch: HTTP 200 (741 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:

- DNS ipv4 Lookup: 52.175.140.176 (33 ms)
- DNS ipv6 Lookup: Error (29 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (260 ms)
- Node.js https: HTTP 200 (280 ms)
- Node.js fetch: HTTP 200 (248 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (227 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (755 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (735 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (738 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (267 ms)

Number of system certificates: 76

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
