# Assets Guide - Chrome Web Store Promotional Materials

This guide explains how to create the required promotional images and screenshots for the Chrome Web Store listing.

---

## Required Assets Checklist

### Icons (Required)

- [x] **Extension Icon** - multi-size PNG (16/32/48/128/256/512)
  - Location: `src/assets/icons/icon-*.png`
  - Regenerate via `python3 scripts/generate_icon.py`
  - Used in: Extension toolbar, Chrome Web Store listing

### Promotional Tiles

- [ ] **Small Promotional Tile** - 440x280px (Required)
  - Purpose: Shown in Chrome Web Store search results and category pages
  - Format: PNG or JPEG
  - Important: Must clearly show what the extension does

- [ ] **Large Promotional Tile** - 1280x800px (Highly Recommended)
  - Purpose: Featured on extension detail page
  - Format: PNG or JPEG
  - Important: This is the hero image users see first

- [ ] **Marquee Promotional Tile** - 1400x560px (Optional)
  - Purpose: Used if extension is featured by Chrome Web Store
  - Format: PNG or JPEG
  - Note: Only needed if you want to be considered for featuring

### Screenshots (Required: 3-5 images)

- [ ] **Screenshot 1** - Main Popup (1280x800px or 640x400px)
- [ ] **Screenshot 2** - Settings Page (1280x800px or 640x400px)
- [ ] **Screenshot 3** - Statistics Dashboard (1280x800px or 640x400px)
- [ ] **Screenshot 4** - Onboarding Flow (1280x800px or 640x400px)
- [ ] **Screenshot 5** - Notifications in Action (1280x800px or 640x400px)

---

## Design Guidelines

### General Principles

1. **Clarity**: Show actual functionality, not abstract concepts
2. **Consistency**: Use the same brand colors and fonts across all images
3. **Quality**: High resolution, crisp text, no blur
4. **Context**: Show the extension in real-world usage scenarios
5. **Branding**: Include extension name/logo where appropriate

### Brand Colors

Based on your extension theme:

```
Primary Blue: #3B82F6 (Tailwind blue-500)
Primary Dark: #1E40AF (Tailwind blue-800)
Success Green: #10B981 (Tailwind green-500)
Warning Red: #EF4444 (Tailwind red-500)
Background: #FFFFFF
Text: #111827 (Tailwind gray-900)
```

### Typography

- **Headings**: System UI fonts (SF Pro, Segoe UI)
- **Body**: Same as headings for consistency
- **Avoid**: Comic Sans, decorative fonts, handwriting fonts

---

## Creating Promotional Tiles

### Small Promotional Tile (440x280px)

**Design Elements:**

1. **Background**: Gradient from #3B82F6 to #1E40AF
2. **Extension Icon**: Place in left or center (96x96px scaled)
3. **Text Overlay**:
   - "Routine Reminder"
   - Tagline: "Build Daily Routines That Stick"
4. **Visual**: Small screenshot or mockup of popup
5. **Call-to-action**: Not needed (implied by store button)

**Tools:**

- Figma (recommended, free)
- Canva (easy, free tier available)
- Photoshop (professional)
- Sketch (Mac only)

**Template Idea:**

```
┌─────────────────────────────────────────────┐
│  [Icon]    Routine Reminder               │
│            Never Forget Your                │
│            Daily Routine                    │
│                                             │
│         [Mini screenshot of popup]          │
│                                             │
│    ✓ Smart Reminders  ✓ Streak Tracking   │
└─────────────────────────────────────────────┘
```

### Large Promotional Tile (1280x800px)

**Design Elements:**

1. **Hero Section** (top 50%):
   - Large extension icon (128x128px)
   - Extension name in large text
   - Compelling tagline
   - Feature highlights with icons

2. **Screenshot Section** (bottom 50%):
   - 2-3 small screenshots showing key features
   - Or: One large screenshot of the main interface

**Template Idea:**

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   [Icon 128px]                                           │
│                                                           │
│        Routine Reminder                                │
│        Stay Productive with Smart Daily Reminders        │
│                                                           │
│   🔔 Customizable    📊 Statistics    🔥 Streaks        │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  [Screenshot 1]  [Screenshot 2]  [Screenshot 3]         │
│   Main Popup      Statistics      Settings               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Marquee Promotional Tile (1400x560px)

Similar to Large Tile but wider aspect ratio. Focus on:

- Horizontal layout
- Extension in action (show browser with extension running)
- Clear value proposition in one glance

---

## Creating Screenshots

### Method 1: Using Chrome DevTools (Recommended)

**Steps:**

1. **Prepare the Extension**:

   ```bash
   cd /Users/yugangcao/apps/my-apps/work-todo
   pnpm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Capture Screenshots**:

   **For Popup (Screenshot 1)**:

   ```bash
   # Open the popup, then:
   # 1. Right-click > Inspect
   # 2. In DevTools, press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
   # 3. Type "Capture screenshot"
   # 4. Select "Capture node screenshot" (to capture just the popup)
   ```

   **For Options Page (Screenshots 2-4)**:

   ```bash
   # Open chrome-extension://[your-id]/src/options/options.html
   # In DevTools, press Cmd+Shift+P
   # Type "Capture screenshot"
   # Select "Capture full size screenshot"
   ```

4. **Resize if Needed**:
   - Use online tools: iloveimg.com, tinypng.com
   - Or: ImageMagick: `convert input.png -resize 1280x800 output.png`

### Method 2: Manual Screenshot + Editing

**Steps:**

1. Take screenshot with:
   - **Mac**: Cmd+Shift+4 (select area)
   - **Windows**: Win+Shift+S (snipping tool)
   - **Linux**: Screenshot tool or `scrot`

2. Edit in:
   - **Mac**: Preview (built-in)
   - **Windows**: Paint, Snip & Sketch
   - **Cross-platform**: GIMP (free), Photoshop

3. Crop and resize to 1280x800 or 640x400

### Method 3: Using MCP Chrome DevTools

If you have the chrome-devtools MCP server configured:

```typescript
// You can programmatically capture screenshots
// This would require using the MCP chrome-devtools tool
// to navigate and capture specific elements
```

---

## Screenshot Content Guide

### Screenshot 1: Main Popup (Priority: Highest)

**What to Show:**

- Extension popup in its default state
- Show a sample routine template filled in
- Quick links section visible
- "Mark as Done" button prominent
- Clean, organized layout

**Tips:**

- Use realistic sample data (not Lorem Ipsum)
- Show it's a work day
- Make sure timezone/date is visible
- Avoid personal information

**Caption for Store:**

> "Quick access popup with routine template and one-click copying"

### Screenshot 2: Settings Page - Settings Tab (Priority: High)

**What to Show:**

- Settings tab active
- Work days selection visible
- Reminder times configured
- Example late reminders displayed
- Language selector

**Tips:**

- Fill in all fields with reasonable defaults
- Show both English and Chinese if possible (or mention in caption)
- Make sure form is scrolled to show variety of settings

**Caption for Store:**

> "Fully customizable work schedule and reminder settings"

### Screenshot 3: Statistics Dashboard (Priority: High)

**What to Show:**

- Statistics tab active
- Show impressive stats (e.g., 15-day streak, 85% completion rate)
- Bar chart with data
- Monthly calendar with green/red days
- Encouragement message visible

**Tips:**

- Use mock data that looks realistic
- Show a mix of successful and missed days
- Make sure the calendar shows clear patterns
- Highlight the streak counter

**Caption for Store:**

> "Track your progress with detailed statistics and streak counters"

### Screenshot 4: Onboarding Flow (Priority: Medium)

**What to Show:**

- One of the onboarding steps (preferably step 1 or 2)
- Modal overlay visible
- Progress dots at bottom
- Clean, welcoming design

**Tips:**

- Choose the most visually appealing step
- Make sure background is slightly visible (shows it's a modal)
- Show navigation buttons

**Caption for Store:**

> "Interactive onboarding guides new users through setup"

### Screenshot 5: Notifications in Action (Priority: Medium)

**What to Show:**

- Browser notification visible
- Toast notification on a webpage
- Badge on extension icon

**Tips:**

- This is the hardest to capture naturally
- Consider creating a composite image
- Or: Just show the browser notification

**Caption for Store:**

> "Multiple reminder methods: browser notifications, toast alerts, and badge indicators"

---

## Adding Screenshots to Chrome Web Store

1. **Login** to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

2. **Create New Item** or **Edit Existing**

3. **Navigate to "Store Listing" tab**

4. **Upload Screenshots**:
   - Drag and drop or click to upload
   - Recommended: 1280x800px (will be auto-resized for thumbnails)
   - Minimum: 640x400px
   - Maximum: 5 screenshots
   - Order matters: First screenshot is most prominent

5. **Add Captions**:
   - Each screenshot can have a caption
   - Keep captions short (1-2 sentences)
   - Highlight the feature shown

6. **Upload Promotional Tiles**:
   - Small tile: Required
   - Large tile: Highly recommended
   - Marquee tile: Optional

7. **Preview**:
   - Use the preview button to see how it looks
   - Test on different screen sizes
   - Check thumbnail quality

---

## Quick Start: Using Figma Templates

### Free Figma Template for Chrome Extensions

1. **Search** for "Chrome Extension Promotional Tile" on Figma Community
2. **Duplicate** to your account
3. **Customize** with your:
   - Extension name
   - Icon
   - Colors
   - Screenshots
4. **Export** as PNG at 2x resolution

### Recommended Templates

- **Material Design Kit**: Clean, professional look
- **Chrome Extension Store Assets**: Pre-sized templates
- **SaaS Landing Page Kits**: Adaptable for extensions

---

## Tools & Resources

### Design Tools

| Tool                                     | Cost       | Best For                        |
| ---------------------------------------- | ---------- | ------------------------------- |
| [Figma](https://figma.com)               | Free       | Collaborative design, templates |
| [Canva](https://canva.com)               | Free/Pro   | Quick designs, templates        |
| [Photoshop](https://adobe.com/photoshop) | Paid       | Professional editing            |
| [GIMP](https://gimp.org)                 | Free       | Photoshop alternative           |
| [Sketch](https://sketch.com)             | Paid (Mac) | UI/UX design                    |

### Screenshot Tools

| Tool            | Platform | Best For                 |
| --------------- | -------- | ------------------------ |
| Chrome DevTools | All      | Precise element capture  |
| Snagit          | All      | Annotations, editing     |
| Lightshot       | All      | Quick sharing            |
| CleanShot X     | Mac      | Professional screenshots |
| ShareX          | Windows  | Automation               |

### Image Optimization

| Tool                                              | Purpose                        |
| ------------------------------------------------- | ------------------------------ |
| [TinyPNG](https://tinypng.com)                    | Compress PNG/JPEG              |
| [Squoosh](https://squoosh.app)                    | Format conversion, compression |
| [ImageOptim](https://imageoptim.com)              | Mac optimization tool          |
| [SVGOMG](https://jakearchibald.github.io/svgomg/) | SVG optimization               |

### Color Tools

| Tool                                                              | Purpose                    |
| ----------------------------------------------------------------- | -------------------------- |
| [Coolors](https://coolors.co)                                     | Color palette generation   |
| [Adobe Color](https://color.adobe.com)                            | Color wheel, harmony rules |
| [Contrast Checker](https://webaim.org/resources/contrastchecker/) | Accessibility              |

---

## Accessibility Considerations

### Text on Images

- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Font Size**: Minimum 14px for body text, 18px for headings
- **Readability**: Avoid thin fonts on busy backgrounds

### Color Blindness

- **Don't rely on color alone**: Use icons, labels, patterns
- **Test**: Use [Color Oracle](https://colororacle.org/) to simulate
- **Safe Combinations**:
  - Blue + Orange (not blue + red)
  - Purple + Yellow
  - Black + White (always safe)

### Alt Text (for web use)

If using these images on a website, provide descriptive alt text:

```html
<img
  src="screenshot-popup.png"
  alt="Routine Reminder popup showing daily template, active rule details, and Mark as Done button"
/>
```

---

## Quality Checklist

Before uploading to Chrome Web Store:

### All Images

- [ ] Correct dimensions (verify with image properties)
- [ ] High resolution (no pixelation when zoomed)
- [ ] File size reasonable (<500KB for screenshots, <200KB for tiles)
- [ ] No personal information visible
- [ ] No Lorem Ipsum or placeholder text
- [ ] Consistent branding across all images
- [ ] No spelling errors in text overlays

### Screenshots

- [ ] Show actual functionality
- [ ] Use realistic data
- [ ] Clean interface (no debug tools, console errors)
- [ ] Proper window size (not too small)
- [ ] Good lighting/contrast
- [ ] No cursor in screenshot (unless intentional)
- [ ] Properly cropped (no unnecessary whitespace)

### Promotional Tiles

- [ ] Extension name clearly visible
- [ ] Value proposition clear
- [ ] Not too cluttered
- [ ] High contrast text
- [ ] Professional appearance
- [ ] Matches extension branding

---

## Storage Organization

Recommended folder structure:

```
work-todo-reminder/
├── assets/
│   ├── screenshots/
│   │   ├── 1-popup.png (1280x800)
│   │   ├── 2-settings.png (1280x800)
│   │   ├── 3-statistics.png (1280x800)
│   │   ├── 4-onboarding.png (1280x800)
│   │   └── 5-notifications.png (1280x800)
│   ├── store/
│   │   ├── tile-small.png (440x280)
│   │   ├── tile-large.png (1280x800)
│   │   └── tile-marquee.png (1400x560)
│   ├── source/
│   │   ├── tile-small.fig (Figma source file)
│   │   └── tile-large.fig
│   └── icon/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
└── docs/
    └── ASSETS_GUIDE.md (this file)
```

---

## Example Captions for Chrome Web Store

### Screenshot Captions

1. **Popup**: "Access your daily routine template and upcoming reminder details instantly"
2. **Settings**: "Customize work days, reminder times, and notification preferences"
3. **Statistics**: "Track completion rates, build streaks, and visualize your progress"
4. **Onboarding**: "New users are guided through setup with interactive tutorials"
5. **Notifications**: "Get reminded via browser notifications, toast alerts, or badge indicators"

### Promotional Tile Text Ideas

**Headline Options:**

- "Never Miss Your Daily Routine Again"
- "Stay Accountable with Smart TODO Reminders"
- "Build Productivity Streaks, One Day at a Time"
- "Your Daily Standup Reminder, Simplified"

**Subheadline Options:**

- "Customizable reminders • Statistics tracking • Streak building"
- "For remote teams and forgetful developers"
- "Privacy-first • Local storage • Open source"

---

## Getting Feedback

Before publishing, get feedback from:

1. **Friends/Colleagues**: General impressions
2. **Design Community**: r/design_critiques, Designer News
3. **Target Users**: Show to potential users
4. **A/B Testing**: Create 2 versions, see which is clearer

Ask specifically:

- "What does this extension do?" (test clarity)
- "Would you install this?" (test appeal)
- "What questions do you have?" (test completeness)

---

## Common Mistakes to Avoid

1. ❌ Using generic stock photos instead of real screenshots
2. ❌ Too much text on promotional tiles
3. ❌ Low contrast text (white on light blue, etc.)
4. ❌ Inconsistent branding between images
5. ❌ Showing error states or debug tools
6. ❌ Personal information in screenshots
7. ❌ Wrong dimensions (will be rejected)
8. ❌ Blurry or pixelated images
9. ❌ Misleading screenshots (showing features that don't exist)
10. ❌ Forgetting to update screenshots when UI changes

---

## Chrome Web Store Review Tips

Your screenshots and tiles affect approval:

- **Be Accurate**: Don't show features that don't exist
- **Be Clear**: Reviewers should understand what the extension does
- **Be Professional**: Avoid jokes, memes, or informal language in tiles
- **Be Compliant**: Follow [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)

---

## Need Help?

- **Design Feedback**: Post on [r/design_critiques](https://reddit.com/r/design_critiques)
- **Chrome Store Issues**: [Chrome Web Store Support](https://support.google.com/chrome_webstore/)
- **Extension Issues**: Open an issue on GitHub

---

## Next Steps

1. [ ] Review this guide thoroughly
2. [ ] Choose your tools (Figma recommended for beginners)
3. [ ] Capture screenshots using Chrome DevTools
4. [ ] Design promotional tiles (start with small tile)
5. [ ] Get feedback from 2-3 people
6. [ ] Optimize images for web
7. [ ] Upload to Chrome Web Store Developer Dashboard
8. [ ] Preview and adjust
9. [ ] Submit for review

**Estimated Time**: 2-4 hours for complete asset creation

---

Last Updated: 2025-01-17
