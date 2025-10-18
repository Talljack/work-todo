# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-15

### Added

#### Core Features

- 🎯 **Customizable Work Schedule**
  - Configurable work days selection (Mon-Sun)
  - Start time, deadline, and interval configuration
  - Multiple late reminder support
  - Smart reminder algorithm that respects already-sent status

#### Reminder System

- 🔔 **Multiple Notification Methods**
  - Browser notifications using Chrome Notifications API
  - On-page toast notifications (custom implementation)
  - Badge alerts on extension icon
  - Notification click handling to open extension

#### Templates & Productivity

- 📋 **TODO Templates**
  - Pre-built English and Chinese templates
  - Fully customizable template editor
  - One-click copy to clipboard
  - Auto-language switching based on i18n settings

- 🧩 **Per-Rule Overrides**
  - Individual templates per reminder rule
  - Custom notification/toast copy per rule
  - Independent toast targets for each reminder

#### Statistics & Gamification

- 📊 **Statistics Dashboard** (NEW!)
  - Completion rate tracking
  - Current streak counter 🔥
  - Longest streak record 🏆
  - Weekly and monthly completion rates
  - Last 7 days activity chart (bar chart)
  - Monthly calendar view (GitHub-style)
  - Encouragement messages for 7+ day streaks

- 💾 **History Tracking** (NEW!)
  - 90-day history storage
  - Automatic daily status recording
  - Work-day filtering in statistics
  - Export/import compatibility

#### User Experience

- 🧭 **Refined Popup Experience** (NEW!)
  - Highlight of the next active reminder rule
  - Live countdown to the upcoming deadline
  - Contextual status chips (pending/sent/rest day)

- ⌨️ **Keyboard Shortcuts** (NEW!)
  - `Ctrl/Cmd+Shift+T`: Open extension popup
  - `Ctrl/Cmd+Shift+D`: Mark today as sent
  - `Ctrl/Cmd+Shift+O`: Open settings page
  - Visual confirmation notifications

#### Settings & Configuration

- ⚙️ **Enhanced Settings Page**
  - Tab-based navigation (Settings / Statistics)
  - Improved UI with Tailwind CSS and Radix UI
  - Language switcher (EN/ZH) with auto-template update
  - Toast message customization
  - Toast duration configuration (5-120 seconds)
  - Export/Import configuration (JSON format)

#### Internationalization

- 🌐 **Multi-language Support**
  - Full English translation
  - Full Chinese (Simplified) translation
  - react-i18next integration
  - Language-aware template switching
  - Browser locale detection

#### Technical Improvements

- 🛠️ **Development Setup**
  - TypeScript 5.7 with strict mode
  - React 18.3 with hooks
  - Vite 5.4 build system
  - ESLint + Prettier configuration
  - Vitest for testing
  - GitHub Actions CI pipeline

- 🎨 **UI Components**
  - Radix UI primitives
  - Custom Tailwind CSS components
  - Responsive design (mobile-friendly)
  - Consistent design system
  - Accessibility improvements

- 🔒 **Privacy & Security**
  - All data stored locally (chrome.storage.local & chrome.storage.sync)
  - No external API calls
  - No tracking or analytics
  - No data collection
  - Open source for transparency

### Changed

- Improved popup UI with modern card-based design
- Enhanced notification system with better error handling
- Optimized alarm scheduling to prevent duplicate triggers
- Better state management with TypeScript types
- Improved timezone handling

### Fixed

- Fixed alarm duplicate triggering after browser sleep/restart
- Fixed template language mismatch detection
- Fixed daily state not resetting at midnight properly
- Fixed notification click not opening extension in some cases
- Fixed storage sync conflicts between devices

### Technical Details

- **Storage Structure**:
  - `app_config` (sync): User configuration
  - `daily_state` (local): Current day status
  - `app_data` (local): History and metadata

- **Alarm System**:
  - Dynamic scheduling based on work days
  - Midnight reset alarm (daily at 00:00)
  - Smart re-initialization on browser startup
  - Prevention of stale alarm accumulation

- **Type Safety**:
  - Comprehensive TypeScript types
  - Strict null checks
  - Interface definitions for all data structures

### Dependencies

- React 18.3.1
- TypeScript 5.7.2
- Vite 5.4.11
- Tailwind CSS 3.4.15
- Radix UI components
- react-i18next 15.1.3
- react-hot-toast 2.6.0
- webextension-polyfill 0.12.0

---

## [0.2.0] - 2025-01-10 (Beta)

### Added

- Toast notifications on active tabs
- Late reminder configuration
- Template reset functionality
- Import/export configuration

### Fixed

- Alarm scheduling bugs
- Storage sync issues

---

## [0.1.0] - 2025-01-05 (Alpha)

### Added

- Initial release
- Basic reminder functionality
- Work days configuration
- Simple popup UI
- Browser notifications

---

## Release Notes

### v1.0.0 Release Highlights

This is the first stable release of Work TODO Reminder! 🎉

**What's New:**

- 📊 Statistics dashboard with beautiful charts
- 🎓 Interactive onboarding for new users
- ⌨️ Keyboard shortcuts for power users
- 💾 90-day history tracking
- 🔥 Streak counter and gamification

**For Users:**

- More engaging experience with statistics
- Easier to get started with onboarding
- Faster workflow with keyboard shortcuts
- Visual progress tracking

**For Developers:**

- Well-documented codebase
- Comprehensive TypeScript types
- CI/CD pipeline
- Testing setup

---

## Upgrade Guide

### From Beta (0.x) to 1.0.0

**Data Migration:**

- Your existing configuration will be preserved
- History tracking starts fresh from v1.0.0
- No manual migration needed

**New Features to Try:**

1. Check out the new Statistics tab
2. Learn the keyboard shortcuts (Ctrl/Cmd+Shift+T)
3. Explore the monthly calendar view

**Breaking Changes:**

- None! Fully backward compatible

---

## Future Releases

See [TODO.md](TODO.md) for planned features in upcoming versions.

**Next Up (v1.1):**

- Sound notification options
- Dark mode support
- Context menu integration
- Cloud backup (optional)

---

[Unreleased]: https://github.com/yugangcao/work-todo-reminder/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yugangcao/work-todo-reminder/releases/tag/v1.0.0
[0.2.0]: https://github.com/yugangcao/work-todo-reminder/releases/tag/v0.2.0
[0.1.0]: https://github.com/yugangcao/work-todo-reminder/releases/tag/v0.1.0
