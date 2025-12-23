#!/bin/bash

OUTPUT_FILE="frontend_full_code.txt"
MAX_SIZE=800000  # 800KB in bytes
PART_NUM=1
CURRENT_FILE="frontend_part${PART_NUM}.txt"
CURRENT_SIZE=0

# Clear previous output files
rm -f frontend_full_code.txt frontend_part*.txt

# Function to write to file with size check
write_to_file() {
    local content="$1"
    local content_size=${#content}
    
    if (( CURRENT_SIZE + content_size > MAX_SIZE )); then
        PART_NUM=$((PART_NUM + 1))
        CURRENT_FILE="frontend_part${PART_NUM}.txt"
        CURRENT_SIZE=0
    fi
    
    echo "$content" >> "$CURRENT_FILE"
    CURRENT_SIZE=$((CURRENT_SIZE + content_size))
}

# Function to process a file
process_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local header="
=== File: $file ===
"
        local content=$(cat "$file")
        write_to_file "$header"
        write_to_file "$content"
        echo "Added: $file"
    fi
}

# Start with package.json and app.json
process_file "package.json"
process_file "app.json"

# Find and process files from specified directories
# Exclude: lock files, images, fonts, binaries
find src app components types -type f \
    ! -name "*.lock" \
    ! -name "package-lock.json" \
    ! -name "yarn.lock" \
    ! -name "bun.lockb" \
    ! -name "*.png" \
    ! -name "*.jpg" \
    ! -name "*.jpeg" \
    ! -name "*.gif" \
    ! -name "*.svg" \
    ! -name "*.ico" \
    ! -name "*.webp" \
    ! -name "*.ttf" \
    ! -name "*.otf" \
    ! -name "*.woff" \
    ! -name "*.woff2" \
    ! -name "*.eot" \
    ! -name "*.mp3" \
    ! -name "*.mp4" \
    ! -name "*.wav" \
    ! -name "*.pdf" \
    2>/dev/null | sort | while read -r file; do
    process_file "$file"
done

# Check if we need to rename single file
if [[ $PART_NUM -eq 1 ]]; then
    mv "$CURRENT_FILE" "$OUTPUT_FILE"
    echo ""
    echo "✅ Created: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
else
    echo ""
    echo "✅ Created ${PART_NUM} parts:"
    ls -lh frontend_part*.txt
fi

echo ""
echo "Total files processed."
