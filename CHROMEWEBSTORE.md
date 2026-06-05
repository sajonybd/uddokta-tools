# Chrome Web Store Listing — UddoktaBD Premium Tools

> Last Updated: 2026-06-06

## Store Listing

**Extension Name**  
UddoktaBD Premium Tools

**Short Description**  
Securely synchronizes ChatGPT session layers directly from the UddoktaBD user dashboard.

**Detailed Description**  
UddoktaBD Premium Tools is a secure helper extension built exclusively for active subscribers of tools.uddoktabd.com.

This extension enables one-click synchronization of your premium dashboard access tokens straight to chatgpt.com without manual logins. It operates strictly inside a closed-loop environment between our dashboard and designated premium destinations, prioritizing user account privacy and low permission footprints.

Features:
- Seamless session synchronization between your tools.uddoktabd.com dashboard and chatgpt.com.
- Eliminates manual typing or copy-pasting of access tokens.
- Secure, locally handled authentication cookie synchronization.
- Minimal permissions required.

How to use it:
1. Log in to your dashboard at tools.uddoktabd.com.
2. Ensure you have the UddoktaBD Premium Tools extension installed.
3. Click on the ChatGPT access button inside your dashboard page.
4. The extension automatically initializes your session on chatgpt.com.

**Category**  
Tools / Developer Tools

**Single Purpose**  
Securely synchronizes ChatGPT session layers directly from the UddoktaBD user dashboard.

**Primary Language**  
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `browser-extension/UddoktaBD/icons/128x128.png` |
| Screenshot 1 | 1280×800 or 640×400 | ✅ Ready | `browser-extension/UddoktaBD/screenshot.png` (or upload direct mockup) |
| Small Promo Tile | 440×280 Canvas | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 Canvas | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Showing the tools.uddoktabd.com dashboard interface with the "UddoktaBD Premium Tools" action button, showcasing the synchronization trigger.


## Permissions Justification

Every permission in `manifest.json` is justified below for CWS review:

| Permission | Type | Justification |
|------------|------|---------------|
| `tabs` | permissions | Used to query and verify active tab domains to ensure session sync actions are only performed on authorized UddoktaBD dashboards and ChatGPT target pages. |
| `cookies` | permissions | Required to safely read session authentication tokens from tools.uddoktabd.com and set/synchronize them on chatgpt.com. |
| `scripting` | permissions | Used to inject helper scripts to verify page loads and handle secure communication between the dashboard and target pages. |
| `webNavigation` | permissions | Used to monitor and intercept navigation changes on chatgpt.com to block access to logout flows and redirect users to the main page. |
| `https://tools.uddoktabd.com/*` | host_permissions | Required to access dashboard cookies and listen for synchronization events triggered by the user. |
| `https://*.chatgpt.com/*` | host_permissions | Required to write synchronization cookies to chatgpt.com and run blocker scripts to prevent user logout/plan changes. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes (Authentication info)

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes | No (Processed locally) | Read session keys from tools.uddoktabd.com to write them directly to chatgpt.com inside the browser runtime. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL**  
`https://tools.uddoktabd.com/privacy-policy`

> [!IMPORTANT]
> When submitting the extension, you must fill in the Privacy Policy URL field in the Developer Dashboard exactly as:
> `https://tools.uddoktabd.com/privacy-policy`
> Do not use `https://tools.uddoktabd.com` or `https://uddoktabd.com` (as Google rejects owner homepages; the link must lead directly to a dedicated privacy policy page).


## Distribution

**Visibility**: Public  
**Regions**: All regions  
**Pricing**: Free (Requires subscription on dashboard to use)


## Developer Info

**Publisher Name**  
UddoktaBD

**Contact Email**  
(Your developer email)

**Support URL**  
`https://tools.uddoktabd.com`

**Homepage URL**  
`https://uddoktabd.com`


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-06 | Initial store resubmission draft. <br> 1. Updated all extension icons to valid PNG files to fix rendering issues. <br> 2. Configured website privacy policy URL. <br> 3. Implemented secure workspace UI controls (hiding settings, upgrades, and logout interfaces on target tool pages) and custom branding injection. | Draft |


## Review Notes

### Rejection History
| Date | Reason | Fix Applied | Resubmitted |
|------|--------|-------------|-------------|
| 2026-06-01 | **Violation: User Data Privacy (Purple Nickel)**. Privacy policy link did not lead to a valid privacy policy (owner sites are not considered valid privacy policies) and icons were not displaying. | 1. Updated website privacy policy at `/privacy-policy` to explicitly detail extension data handling. <br> 2. Converted all extension icons from `.jpg` to `.png` and updated `manifest.json`. <br> 3. Pointed CWS privacy policy URL to `https://tools.uddoktabd.com/privacy-policy`. | Pending |
