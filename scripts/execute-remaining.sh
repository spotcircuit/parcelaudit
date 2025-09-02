#!/bin/bash
echo "Executing remaining batches (2-26)..."
echo "Each batch contains 1000 ZIP codes (except batch 26 with 354)"
echo ""

for i in {2..26}; do
  file="batch_$(printf "%02d" $i).sql"
  if [ -f "$file" ]; then
    echo "Ready: Batch $i - $file"
  fi
done

echo ""
echo "Total batches to execute: 25"
echo "Total ZIP codes to import: 24,354 (batch 1 already done: 1000)"
echo ""
echo "Execute each batch via Neon SQL tool"