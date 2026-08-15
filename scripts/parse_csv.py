import csv
import json
import os
import re

CSV_DIR = os.path.join(os.path.dirname(__file__), '..', 'word-bank-csv')
OUTPUT_JS = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'words.js')

LANG_CONFIG = [
    {
        'key': 'swedish',
        'name': 'Swedish',
        'flag': '🇸🇪',
        'filename': 'Swedish Pictionary Word Sheets.csv'
    },
    {
        'key': 'mandarin',
        'name': 'Mandarin',
        'flag': '🇨🇳',
        'filename': 'Mandarin Pictionary Word Sheets.csv'
    },
    {
        'key': 'indonesian',
        'name': 'Indonesian',
        'flag': '🇮🇩',
        'filename': 'Indonesian Pictionary Word Sheets.csv'
    }
]

def parse_csv_file(filepath):
    words = []
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = list(csv.reader(f))
    
    # Rows with data start at index 3 (line 4 in 1-based indexing)
    for row_idx in range(3, len(reader)):
        row = reader[row_idx]
        if not row:
            continue
        
        # Left side: columns 0, 1, 2, 3 (ID, English, Target, Pronunciation)
        if len(row) >= 4 and row[0].strip().isdigit():
            id_val = int(row[0].strip())
            eng = row[1].strip()
            tgt = row[2].strip()
            pron = row[3].strip() if len(row) > 3 else ''
            if eng and tgt:
                words.append({
                    'id': id_val,
                    'english': eng,
                    'foreign': tgt,
                    'pronunciation': pron
                })
        
        # Right side: columns 5, 6, 7, 8 (ID, English, Target, Pronunciation)
        if len(row) >= 8 and row[5].strip().isdigit():
            id_val = int(row[5].strip())
            eng = row[6].strip()
            tgt = row[7].strip()
            pron = row[8].strip() if len(row) > 8 else ''
            if eng and tgt:
                words.append({
                    'id': id_val,
                    'english': eng,
                    'foreign': tgt,
                    'pronunciation': pron
                })
    
    # Sort by ID
    words.sort(key=lambda x: x['id'])
    return words

def main():
    os.makedirs(os.path.dirname(OUTPUT_JS), exist_ok=True)
    all_data = {}
    
    for cfg in LANG_CONFIG:
        filepath = os.path.join(CSV_DIR, cfg['filename'])
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Missing CSV file: {filepath}")
        
        words = parse_csv_file(filepath)
        print(f"Parsed {len(words)} words for {cfg['name']} ({cfg['flag']})")
        if len(words) != 100:
            print(f"WARNING: Expected 100 words, found {len(words)} in {cfg['filename']}")
            
        all_data[cfg['key']] = {
            'key': cfg['key'],
            'name': cfg['name'],
            'flag': cfg['flag'],
            'totalWords': len(words),
            'words': words
        }
    
    # Write as ES module / browser-compatible JS
    js_content = f"""/**
 * Auto-generated word bank data for Foreigner Pictionary.
 * Source CSVs parsed from word-bank-csv/
 */

export const WORD_BANKS = {json.dumps(all_data, indent=2, ensure_ascii=False)};

// Also attach to window object for non-module script tag compatibility
if (typeof window !== 'undefined') {{
  window.WORD_BANKS = WORD_BANKS;
}}
"""
    with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Successfully generated {OUTPUT_JS} with {sum(len(d['words']) for d in all_data.values())} total words.")

if __name__ == '__main__':
    main()
