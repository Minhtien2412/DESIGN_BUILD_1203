#!/bin/sh
# Harden CRM scaffold controllers by adding required field validation to create() methods
# Each module gets a check for its key required field(s) — returns 400 instead of creating empty records

MODULES="contacts warranty daily-report budget change-orders construction-progress rfi submittal punch-list equipment inspection"

for m in $MODULES; do
  FILE="/app/dist/$m/$m.controller.js"
  if [ ! -f "$FILE" ]; then
    # Try alternate naming (e.g. change-orders => change-orders)
    echo "SKIP $m — controller not found at $FILE"
    continue
  fi

  # Check if already patched (look for "required" string in the file)
  if grep -q "is required" "$FILE" 2>/dev/null; then
    echo "ALREADY PATCHED: $m"
    continue
  fi

  echo "PATCHING: $m"

  # Use sed to replace the create method with a validated version
  # The pattern is: create(d) { return this.svc.create(d); }
  # Replace with validation + original call
  case "$m" in
    contacts)
      REQUIRED_FIELD="name"
      LABEL="Contact name"
      ;;
    warranty)
      REQUIRED_FIELD="title"
      LABEL="Warranty title"
      ;;
    daily-report)
      REQUIRED_FIELD="title"
      LABEL="Report title"
      ;;
    budget)
      REQUIRED_FIELD="title"
      LABEL="Budget title"
      ;;
    change-orders)
      REQUIRED_FIELD="title"
      LABEL="Change order title"
      ;;
    construction-progress)
      REQUIRED_FIELD="title"
      LABEL="Progress title"
      ;;
    rfi)
      REQUIRED_FIELD="title"
      LABEL="RFI title"
      ;;
    submittal)
      REQUIRED_FIELD="title"
      LABEL="Submittal title"
      ;;
    punch-list)
      REQUIRED_FIELD="title"
      LABEL="Punch list title"
      ;;
    equipment)
      REQUIRED_FIELD="name"
      LABEL="Equipment name"
      ;;
    inspection)
      REQUIRED_FIELD="title"
      LABEL="Inspection title"
      ;;
  esac

  # Replace: create(d) { return this.svc.create(d); }
  # With:    create(d) { if (!d || typeof d.$REQUIRED_FIELD !== 'string' || !d.$REQUIRED_FIELD.trim()) { throw new common_1.BadRequestException('$LABEL is required'); } return this.svc.create(d); }
  sed -i "s|create(d) { return this.svc.create(d); }|create(d) { if (!d || typeof d.${REQUIRED_FIELD} !== 'string' || !d.${REQUIRED_FIELD}.trim()) { throw new common_1.BadRequestException('${LABEL} is required and must be a non-empty string'); } return this.svc.create(d); }|" "$FILE"

  if [ $? -eq 0 ]; then
    echo "  OK — $m now requires '$REQUIRED_FIELD'"
  else
    echo "  FAIL — sed failed for $m"
  fi
done

echo ""
echo "=== Verification ==="
for m in $MODULES; do
  FILE="/app/dist/$m/$m.controller.js"
  if [ -f "$FILE" ]; then
    if grep -q "is required" "$FILE"; then
      echo "  OK: $m has validation"
    else
      echo "  MISSING: $m lacks validation"
    fi
  fi
done
