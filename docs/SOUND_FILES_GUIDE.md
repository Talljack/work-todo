# Sound Files Guide for Routine Reminder

## Overview

The v1.1 update adds sound reminder functionality. This guide explains how to add sound files to the extension.

## Required Sound Files

The extension requires **15 sound files** in total (5 styles × 3 urgency levels):

### File Structure

```
public/sounds/
├── professional-gentle.mp3      # Professional style - gentle reminder
├── professional-normal.mp3      # Professional style - normal reminder
├── professional-urgent.mp3      # Professional style - urgent reminder
├── cute-gentle.mp3             # Cute style - gentle reminder
├── cute-normal.mp3             # Cute style - normal reminder
├── cute-urgent.mp3             # Cute style - urgent reminder
├── minimal-gentle.mp3          # Minimal style - gentle reminder
├── minimal-normal.mp3          # Minimal style - normal reminder
├── minimal-urgent.mp3          # Minimal style - urgent reminder
├── motivational-gentle.mp3     # Motivational style - gentle reminder
├── motivational-normal.mp3     # Motivational style - normal reminder
├── motivational-urgent.mp3     # Motivational style - urgent reminder
├── humorous-gentle.mp3         # Humorous style - gentle reminder
├── humorous-normal.mp3         # Humorous style - normal reminder
└── humorous-urgent.mp3         # Humorous style - urgent reminder
```

## Sound Requirements

### File Specifications

- **Format**: MP3 (recommended for best browser compatibility)
- **Size**: < 50KB per file (total < 750KB for all files)
- **Duration**: 1-3 seconds
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Rate**: 128kbps or lower

### Sound Characteristics

#### Professional Style

- **Gentle**: Soft notification bell, subtle ding
- **Normal**: Standard email notification, message pop
- **Urgent**: Alert beep, warning sound

#### Cute Style

- **Gentle**: Gentle bell, soft chime
- **Normal**: Cat meow, playful sound
- **Urgent**: Cute alarm, urgent chime

#### Minimal Style

- **Gentle**: Minimal click, single tick
- **Normal**: Simple beep, short tone
- **Urgent**: Sharp beep, quick alert

#### Motivational Style

- **Gentle**: Encouraging chime, motivational tone
- **Normal**: Achievement sound, success chime
- **Urgent**: Victory fanfare, urgent motivation

#### Humorous Style

- **Gentle**: Funny chime, playful sound
- **Normal**: Comic sound effect, humorous tone
- **Urgent**: Dramatic alarm, funny urgent sound

## Where to Find Sound Files

### Free Sound Resources

1. **Freesound.org** (https://freesound.org)
   - Search keywords: "notification", "bell", "chime", "alert", "beep"
   - License: Creative Commons (check individual licenses)
   - Download and convert to MP3 if needed

2. **Zapsplat.com** (https://www.zapsplat.com)
   - Free sound effects library
   - Search by category: "Interface & UI" > "Notifications"
   - Free for personal and commercial use with attribution

3. **Mixkit.co** (https://mixkit.co/free-sound-effects/)
   - Free sound effects
   - No attribution required
   - Filter by category: "Notification"

4. **BBC Sound Effects** (https://sound-effects.bbcrewind.co.uk/)
   - Free for personal, educational, or research purposes
   - Large archive of sound effects

### Search Keywords by Style

#### Professional

- "soft notification"
- "gentle bell"
- "email notification"
- "standard alert"
- "urgent beep"
- "warning sound"

#### Cute

- "cute bell"
- "cat meow"
- "playful chime"
- "kawaii sound"
- "adorable notification"

#### Minimal

- "minimal click"
- "simple beep"
- "tick sound"
- "short tone"
- "UI click"

#### Motivational

- "achievement"
- "success"
- "victory"
- "fanfare"
- "level up"

#### Humorous

- "funny notification"
- "comic sound"
- "cartoon sound"
- "silly beep"
- "humorous alert"

## How to Add Sound Files

### Step 1: Download or Create Sounds

1. Visit one of the free sound libraries above
2. Search for appropriate sounds using the keywords
3. Download the files (MP3 format preferred)
4. Rename files according to the naming convention

### Step 2: Optimize File Size

Use one of these tools to compress the audio files:

#### Online Tools

- **Online Audio Converter** (https://online-audio-converter.com)
  - Upload file
  - Select "MP3" format
  - Set quality to 128kbps
  - Download compressed file

- **AudioMass** (https://audiomass.co)
  - Web-based audio editor
  - Import file
  - Export with lower bitrate

#### Desktop Tools

- **Audacity** (Free, https://www.audacityteam.org)
  ```
  1. File > Open (select your sound file)
  2. File > Export > Export as MP3
  3. Quality: 128 kbps CBR
  4. Save
  ```

### Step 3: Add Files to Project

1. Place all sound files in `public/sounds/` directory
2. Ensure filenames match exactly (case-sensitive)
3. Verify total size < 750KB

### Step 4: Test

1. Build the extension: `pnpm run build`
2. Load the extension in Chrome
3. Go to Settings > Reminder Styles
4. Select a sound style
5. Click "Preview Sound" to test

## Creating Your Own Sounds

### Using Audacity (Free)

1. **Download Audacity**: https://www.audacityteam.org
2. **Generate a Simple Beep**:
   ```
   Generate > Tone...
   - Waveform: Sine
   - Frequency:
     - Gentle: 440 Hz (A4)
     - Normal: 880 Hz (A5)
     - Urgent: 1320 Hz (E6)
   - Amplitude: 0.5
   - Duration: 0.3-1.0 seconds
   ```
3. **Add Fade In/Out**:
   ```
   Select all (Ctrl+A)
   Effect > Fade In
   Effect > Fade Out
   ```
4. **Export**:
   ```
   File > Export > Export as MP3
   Quality: 128 kbps
   ```

### Using Online Tools

**BeepBox** (https://www.beepbox.co)

- Create custom chiptune/8-bit sounds
- Free, no account needed
- Export as WAV, then convert to MP3

## Temporary Workaround (For Testing)

If you don't have sound files ready, you can:

1. **Disable sound temporarily**:
   - Go to Settings > Reminder Styles
   - Toggle off "Sound Reminders"

2. **Use a single dummy file**:
   - Create a very short silent MP3
   - Copy it 15 times with different names
   - This allows the extension to run without errors

## License Considerations

When using free sound resources:

1. **Check the license** for each file
2. **Attribution**: Some require attribution (e.g., "Sound by X from Freesound.org")
3. **Commercial use**: Ensure the license allows commercial use if needed
4. **Modify**: Check if modifications are allowed

## File Size Optimization Tips

1. **Duration**: Keep sounds under 2 seconds
2. **Bitrate**: 96-128 kbps is sufficient for short sounds
3. **Sample Rate**: 44.1kHz is standard
4. **Mono vs Stereo**: Use mono for smaller file size
5. **Remove silence**: Trim silence at start/end

## Troubleshooting

### Sound Not Playing

1. **Check browser autoplay policy**:
   - Chrome requires user interaction before playing audio
   - The first sound may not play; this is normal

2. **Check file paths**:
   - Files must be in `public/sounds/`
   - Filenames must match exactly

3. **Check file format**:
   - Must be MP3
   - Check that file isn't corrupted

4. **Check console**:
   - Open DevTools > Console
   - Look for sound loading errors

### File Size Too Large

1. **Reduce bitrate**: Use 96 kbps or 64 kbps
2. **Shorten duration**: Keep under 1 second
3. **Use mono**: Convert stereo to mono
4. **Remove metadata**: Strip ID3 tags

## Example Sound Configuration

Here's an example of how different urgency levels should sound:

### Professional Style Example

- **Gentle**: Soft "ding" (like a hotel desk bell)
- **Normal**: Clear "boop" (like email notification)
- **Urgent**: Sharp "beep beep" (like a timer alarm)

### Cute Style Example

- **Gentle**: Gentle wind chime
- **Normal**: Soft meow or chirp
- **Urgent**: Quick succession of cute beeps

## Next Steps

After adding sound files:

1. **Test all styles**: Go through each style and urgency level
2. **Adjust volume**: Settings > Sound Volume
3. **Get feedback**: Ask team members if sounds are appropriate
4. **Iterate**: Replace sounds that don't work well

## Contributing

If you create a good set of sounds, consider:

1. **Share with the community**: Open a PR with your sound pack
2. **Document sources**: Include attribution in comments
3. **License**: Use CC0 or CC-BY for maximum compatibility

---

**Last Updated**: 2025-10-26

**Related Files**:

- `src/utils/soundManager.ts` - Sound management logic
- `src/components/ReminderStyleSettings.tsx` - UI for sound settings
- `src/content-script/content-script.ts` - Sound playback implementation
