#!/bin/bash

# Generate missing motivational and humorous sound files

SOUNDS_DIR="public/sounds"

echo "🎵 Generating missing sound files..."

# Motivational Style - Using simpler approach
# Gentle: Encouraging tone (ascending)
ffmpeg -y -f lavfi -i "sine=frequency=500:duration=0.5" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.4:d=0.1,volume=0.4" "$SOUNDS_DIR/motivational-gentle.mp3" 2>/dev/null
echo "✓ motivational-gentle.mp3"

# Normal: Achievement chime
ffmpeg -y -f lavfi -i "sine=frequency=660:duration=0.6" -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.5:d=0.1,volume=0.5" "$SOUNDS_DIR/motivational-normal.mp3" 2>/dev/null
echo "✓ motivational-normal.mp3"

# Urgent: Victory fanfare
ffmpeg -y -f lavfi -i "sine=frequency=880:duration=0.7" -af "afade=t=in:st=0:d=0.05,afade=t=out:st=0.65:d=0.05,volume=0.6" "$SOUNDS_DIR/motivational-urgent.mp3" 2>/dev/null
echo "✓ motivational-urgent.mp3"

# Humorous Style
# Gentle: Funny chime (two tones)
ffmpeg -y -f lavfi -i "sine=frequency=550:duration=0.2" "$SOUNDS_DIR/temp1.mp3" 2>/dev/null
ffmpeg -y -f lavfi -i "sine=frequency=750:duration=0.2" "$SOUNDS_DIR/temp2.mp3" 2>/dev/null
ffmpeg -y -i "$SOUNDS_DIR/temp1.mp3" -i "$SOUNDS_DIR/temp2.mp3" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -af "afade=t=in:st=0:d=0.05,afade=t=out:st=0.35:d=0.05,volume=0.35" "$SOUNDS_DIR/humorous-gentle.mp3" 2>/dev/null
rm "$SOUNDS_DIR/temp1.mp3" "$SOUNDS_DIR/temp2.mp3"
echo "✓ humorous-gentle.mp3"

# Normal: Comic sound (bouncing)
ffmpeg -y -f lavfi -i "sine=frequency=900:duration=0.2" "$SOUNDS_DIR/temp1.mp3" 2>/dev/null
ffmpeg -y -f lavfi -i "sine=frequency=700:duration=0.2" "$SOUNDS_DIR/temp2.mp3" 2>/dev/null
ffmpeg -y -i "$SOUNDS_DIR/temp1.mp3" -i "$SOUNDS_DIR/temp2.mp3" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -af "volume=0.45" "$SOUNDS_DIR/humorous-normal.mp3" 2>/dev/null
rm "$SOUNDS_DIR/temp1.mp3" "$SOUNDS_DIR/temp2.mp3"
echo "✓ humorous-normal.mp3"

# Urgent: Dramatic alarm (three tones)
ffmpeg -y -f lavfi -i "sine=frequency=1200:duration=0.15" "$SOUNDS_DIR/temp1.mp3" 2>/dev/null
ffmpeg -y -f lavfi -i "sine=frequency=800:duration=0.15" "$SOUNDS_DIR/temp2.mp3" 2>/dev/null
ffmpeg -y -f lavfi -i "sine=frequency=1400:duration=0.15" "$SOUNDS_DIR/temp3.mp3" 2>/dev/null
ffmpeg -y -i "$SOUNDS_DIR/temp1.mp3" -i "$SOUNDS_DIR/temp2.mp3" -i "$SOUNDS_DIR/temp3.mp3" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" -af "volume=0.55" "$SOUNDS_DIR/humorous-urgent.mp3" 2>/dev/null
rm "$SOUNDS_DIR/temp1.mp3" "$SOUNDS_DIR/temp2.mp3" "$SOUNDS_DIR/temp3.mp3"
echo "✓ humorous-urgent.mp3"

echo ""
echo "✅ All missing sound files generated successfully!"
echo ""
echo "All files:"
ls -lh "$SOUNDS_DIR"/*.mp3
echo ""
echo "Total files:"
ls "$SOUNDS_DIR"/*.mp3 | wc -l
echo ""
echo "Total size:"
du -sh "$SOUNDS_DIR"
