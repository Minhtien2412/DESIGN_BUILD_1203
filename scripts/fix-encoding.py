"""
Fix Vietnamese text encoding (mojibake) in .tsx files.
Problem: UTF-8 text was double-encoded (UTF-8 bytes read as CP1252, then saved as UTF-8)
Solution: Encode as CP1252 to recover original bytes, then decode as UTF-8
"""
import os
import glob
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(BASE_DIR, 'app')

def fix_mojibake(text):
    """Reverse double-encoding: UTF-8 -> CP1252 -> UTF-8"""
    try:
        # Encode the garbled string as CP1252 to get original UTF-8 bytes
        raw_bytes = text.encode('cp1252')
        # Decode those bytes as UTF-8
        fixed = raw_bytes.decode('utf-8')
        return fixed, True
    except (UnicodeDecodeError, UnicodeEncodeError):
        return text, False

def fix_file_whole(filepath):
    """Try to fix entire file at once"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed, success = fix_mojibake(content)
    if success and fixed != content:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(fixed)
        return 'fixed'
    elif success:
        return 'no-change'
    else:
        return 'error-whole'

def fix_file_line_by_line(filepath):
    """Fix file line by line (fallback for files with mixed encoding)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixed_lines = []
    changed = False
    errors = 0
    
    for line in lines:
        try:
            fixed_line = line.encode('cp1252').decode('utf-8')
            fixed_lines.append(fixed_line)
            if fixed_line != line:
                changed = True
        except (UnicodeDecodeError, UnicodeEncodeError):
            fixed_lines.append(line)
            errors += 1
    
    if changed:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(fixed_lines))
        return f'fixed-partial({errors} lines skipped)'
    return 'no-change'

def main():
    # Find all .tsx files recursively
    pattern = os.path.join(APP_DIR, '**', '*.tsx')
    files = glob.glob(pattern, recursive=True)
    
    print(f"Found {len(files)} .tsx files in app/")
    
    stats = {'fixed': 0, 'no-change': 0, 'partial': 0, 'error': 0}
    fixed_files = []
    
    for filepath in sorted(files):
        rel_path = os.path.relpath(filepath, BASE_DIR)
        
        # First try whole-file fix
        result = fix_file_whole(filepath)
        
        if result == 'fixed':
            stats['fixed'] += 1
            fixed_files.append(rel_path)
            print(f"  FIXED: {rel_path}")
        elif result == 'no-change':
            stats['no-change'] += 1
        elif result == 'error-whole':
            # Try line-by-line
            result2 = fix_file_line_by_line(filepath)
            if result2.startswith('fixed'):
                stats['partial'] += 1
                fixed_files.append(rel_path)
                print(f"  PARTIAL: {rel_path} - {result2}")
            else:
                stats['error'] += 1
                print(f"  SKIP: {rel_path}")
    
    print(f"\n=== RESULTS ===")
    print(f"Total files: {len(files)}")
    print(f"Fixed (whole): {stats['fixed']}")
    print(f"Fixed (partial): {stats['partial']}")
    print(f"No change needed: {stats['no-change']}")
    print(f"Errors/Skipped: {stats['error']}")
    print(f"\nTotal files modified: {len(fixed_files)}")
    
    # Also check .ts files
    ts_pattern = os.path.join(APP_DIR, '**', '*.ts')
    ts_files = glob.glob(ts_pattern, recursive=True)
    ts_fixed = 0
    for filepath in sorted(ts_files):
        result = fix_file_whole(filepath)
        if result == 'fixed':
            ts_fixed += 1
            print(f"  FIXED (.ts): {os.path.relpath(filepath, BASE_DIR)}")
        elif result == 'error-whole':
            result2 = fix_file_line_by_line(filepath)
            if result2.startswith('fixed'):
                ts_fixed += 1
    
    if ts_fixed:
        print(f"\nAlso fixed {ts_fixed} .ts files")

if __name__ == '__main__':
    main()
