# FILTER CITY HRMS — Store Release Preparation

Source checkpoint: `stable-step10-final-2026-09-03` (read-only)

Active store-preparation branch: `store-release-prep-2026-09-03`

## Google Play

- Package ID: `com.filtercity.hrms`
- Version: `1.0.0`
- Version code: `1`
- Minimum Android: API 23
- Compile/target API: 36 (Android 16)
- Android Gradle Plugin: 8.10.0
- Gradle: 8.11.1
- Play delivery format: signed Android App Bundle (`.aab`)
- Play App Signing: recommended/expected for the new app.
- Signed AAB workflow: `.github/workflows/android-store-aab.yml`

The signed AAB workflow requires these GitHub repository secrets before it can be run:

- `FC_UPLOAD_KEYSTORE_B64`
- `FC_UPLOAD_STORE_PASSWORD`
- `FC_UPLOAD_KEY_ALIAS`
- `FC_UPLOAD_KEY_PASSWORD`

Do not commit the keystore or passwords to Git.

## Apple App Store

- Bundle ID: `com.filtercity.hrms`
- Version: `1.0.0`
- Build: `1`
- Minimum iOS: 15.0
- Store build requirement: Xcode 26+ with iOS 26 SDK+
- iOS project definition: `ios/project.yml`
- Native wrapper: `WKWebView` with Back, Forward, Refresh, JavaScript dialogs, location usage description, photo library usage description and camera usage description.
- Privacy manifest: `ios/FILTERCITYHRMS/PrivacyInfo.xcprivacy`
- Unsigned simulator validation: `.github/workflows/ios-validate.yml`

A signed App Store archive still requires the publishing Apple Developer team, App Store Connect app record, distribution signing and provisioning.

## Store compliance pages

- `/privacy.html` — bilingual Privacy Policy
- `/support.html` — bilingual Support page
- `store-compliance-ui.js` exposes Privacy Policy and Support links inside the HRMS login/app UI.

## Store listing draft

Recommended app name: `FILTER CITY HRMS`

English short description:
`HR, attendance, tasks, leave, payroll and workforce records for FILTER CITY.`

Arabic short description:
`إدارة الموارد البشرية والحضور والمهام والإجازات والرواتب لشركة FILTER CITY.`

Suggested category: Business

Suggested audience: company employees and administrators; not directed to children.

## Required visual assets before submission

Google Play:
- 512 x 512 store icon PNG
- 1024 x 500 feature graphic
- Minimum two phone screenshots; prepare English and Arabic sets

Apple App Store:
- Final App Store icon in the iOS asset catalog
- At least one iPhone screenshot; prepare a full English and Arabic set
- Optional app preview video

Use only fictional/test employee data in all public screenshots.

## Privacy declarations to review in the consoles

The HRMS may process:
- Name, employee ID, mobile and employment profile information
- National ID/Iqama and nationality
- Precise location for attendance where enabled
- Task photos selected/captured by the user
- Salary, bank/payment, payroll and EOSB information
- Leave, attendance, task and audit records

The app is not designed for advertising, cross-app tracking or sale of personal information. Store-console privacy answers must match the final production behavior and the public privacy policy.

## Release order

1. Validate API 36 Android APK build.
2. Test store-prep web release on PC/mobile, English/Arabic.
3. Generate secure Play upload key and configure GitHub signing secrets.
4. Build signed `.aab` and upload to Google Play Internal testing.
5. Validate iOS simulator build on Xcode 26 runner.
6. Add final iOS icon and Apple signing team.
7. Build signed archive and upload to TestFlight.
8. Test Google Play Internal testing and TestFlight on real devices.
9. Complete privacy/data-safety, age/content-rating and store metadata forms.
10. Submit to production only after both test tracks pass.
