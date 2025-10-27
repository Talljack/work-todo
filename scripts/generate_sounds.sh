#!/bin/bash

# Generate sound files for Routine Reminder extension
# This script creates 15 sound files (5 styles × 3 urgency levels)

SOUNDS_DIR="public/sounds"

# Create sounds directory if it doesn't exist
mkdir -p "$SOUNDS_DIR"

echo "🎵 Generating sound files..."

# Professional Style
# Gentle: Soft notification bell (440Hz, 0.3s)
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=0.3" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.2:d=0.1,volume=0.4" "$SOUNDS_DIR/professional-gentle.mp3" 2>/dev/null
echo "✓ professional-gentle.mp3"

# Normal: Standard notification (880Hz, 0.4s)
ffmpeg -y -f lavfi -i "sine=frequency=880:duration=0.4" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.3:d=0.1,volume=0.5" "$SOUNDS_DIR/professional-normal.mp3" 2>/dev/null
echo "✓ professional-normal.mp3"

# Urgent: Alert beep (1320Hz, 0.5s with double beep)
ffmpeg -y -f lavfi -i "sine=frequency=1320:duration=0.15" -af "volume=0.6" "$SOUNDS_DIR/temp1.mp3" 2>/dev/null
ffmpeg -y -i "$SOUNDS_DIR/temp1.mp3" -i "$SOUNDS_DIR/temp1.mp3" -filter_complex "[0:a]adelay=0|0[a0];[1:a]adelay=200|200[a1];[a0][a1]amix=inputs=2:duration=longest" "$SOUNDS_DIR/professional-urgent.mp3" 2>/dev/null
rm "$SOUNDS_DIR/temp1.mp3"
echo "✓ professional-urgent.mp3"

# Cute Style
# Gentle: Gentle bell (660Hz, 0.4s, softer)
ffmpeg -y -f lavfi -i "sine=frequency=660:duration=0.4" -af "afade=t=in:st=0:d=0.15,afade=t=out:st=0.25:d=0.15,volume=0.35" "$SOUNDS_DIR/cute-gentle.mp3" 2>/dev/null
echo "✓ cute-gentle.mp3"

# Normal: Playful chime (1100Hz, 0.3s)
ffmpeg -y -f lavfi -i "sine=frequency=1100:duration=0.3" -af "afade=t=in:st=0:d=0.05,afade=t=out:st=0.25:d=0.05,volume=0.45" "$SOUNDS_DIR/cute-normal.mp3" 2>/dev/null
echo "✓ cute-normal.mp3"

# Urgent: Quick cute alarm (1500Hz, 0.6s with triple beep)
ffmpeg -y -f lavfi -i "sine=frequency=1500:duration=0.12" -af "volume=0.5" "$SOUNDS_DIR/temp2.mp3" 2>/dev/null
ffmpeg -y -i "$SOUNDS_DIR/temp2.mp3" -i "$SOUNDS_DIR/temp2.mp3" -i "$SOUNDS_DIR/temp2.mp3" -filter_complex "[0:a]adelay=0|0[a0];[1:a]adelay=150|150[a1];[2:a]adelay=300|300[a2];[a0][a1][a2]amix=inputs=3:duration=longest" "$SOUNDS_DIR/cute-urgent.mp3" 2>/dev/null
rm "$SOUNDS_DIR/temp2.mp3"
echo "✓ cute-urgent.mp3"

# Minimal Style
# Gentle: Minimal click (800Hz, 0.15s, very short)
ffmpeg -y -f lavfi -i "sine=frequency=800:duration=0.15" -af "afade=t=in:st=0:d=0.02,afade=t=out:st=0.13:d=0.02,volume=0.3" "$SOUNDS_DIR/minimal-gentle.mp3" 2>/dev/null
echo "✓ minimal-gentle.mp3"

# Normal: Simple beep (1000Hz, 0.2s)
ffmpeg -y -f lavfi -i "sine=frequency=1000:duration=0.2" -af "afade=t=in:st=0:d=0.02,afade=t=out:st=0.18:d=0.02,volume=0.4" "$SOUNDS_DIR/minimal-normal.mp3" 2>/dev/null
echo "✓ minimal-normal.mp3"

# Urgent: Sharp beep (1400Hz, 0.25s)
ffmpeg -y -f lavfi -i "sine=frequency=1400:duration=0.25" -af "afade=t=in:st=0:d=0.02,afade=t=out:st=0.23:d=0.02,volume=0.55" "$SOUNDS_DIR/minimal-urgent.mp3" 2>/dev/null
echo "✓ minimal-urgent.mp3"

# Motivational Style
# Gentle: Encouraging tone (500Hz rising to 700Hz, 0.5s)
ffmpeg -y -f lavfi -i "sine=frequency=500:duration=0.5,aeval=sin(2*PI*(500+400*t/0.5)*t):s=44100:d=0.5" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.4:d=0.1,volume=0.4" "$SOUNDS_DIR/motivational-gentle.mp3" 2>/dev/null
echo "✓ motivational-gentle.mp3"

# Normal: Achievement chime (600Hz to 900Hz, 0.6s)
ffmpeg -y -f lavfi -i "sine=frequency=600:duration=0.6,aeval=sin(2*PI*(600+500*t/0.6)*t):s=44100:d=0.6" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.5:d=0.1,volume=0.5" "$SOUNDS_DIR/motivational-normal.mp3" 2>/dev/null
echo "✓ motivational-normal.mp3"

# Urgent: Victory fanfare (700Hz to 1200Hz, 0.7s)
ffmpeg -y -f lavfi -i "sine=frequency=700:duration=0.7,aeval=sin(2*PI*(700+700*t/0.7)*t):s=44100:d=0.7" -af "afade=t=in:st=0:d=0.05,afade=t=out:st=0.65:d=0.05,volume=0.6" "$SOUNDS_DIR/motivational-urgent.mp3" 2>/dev/null
echo "✓ motivational-urgent.mp3"

# Humorous Style
# Gentle: Funny chime (550Hz + 750Hz together, 0.35s)
ffmpeg -y -f lavfi -i "sine=frequency=550:duration=0.35,sine=frequency=750:duration=0.35" -filter_complex "[0:a][1:a]amix=inputs=2:duration=shortest" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.25:d=0.1,volume=0.35" "$SOUNDS_DIR/humorous-gentle.mp3" 2>/dev/null
echo "✓ humorous-gentle.mp3"

# Normal: Comic sound (900Hz bouncing, 0.4s)
ffmpeg -y -f lavfi -i "sine=frequency=900:duration=0.2,sine=frequency=700:duration=0.2" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -af "volume=0.45" "$SOUNDS_DIR/humorous-normal.mp3" 2>/dev/null
echo "✓ humorous-normal.mp3"

# Urgent: Dramatic alarm (1200Hz to 800Hz to 1400Hz, 0.6s)
ffmpeg -y -f lavfi -i "sine=frequency=1200:duration=0.2,sine=frequency=800:duration=0.2,sine=frequency=1400:duration=0.2" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" -af "volume=0.55" "$SOUNDS_DIR/humorous-urgent.mp3" 2>/dev/null
echo "✓ humorous-urgent.mp3"

echo ""
echo "✅ All 15 sound files generated successfully!"
echo "📂 Files location: $SOUNDS_DIR"
echo ""
echo "File sizes:"
du -h "$SOUNDS_DIR"/*.mp3
echo ""
echo "Total size:"
du -sh "$SOUNDS_DIR"
