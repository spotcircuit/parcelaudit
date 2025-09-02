-- Import critical DAS ZIPs for invoice validation
-- These are the ZIP codes that appear in the actual invoices

TRUNCATE TABLE fedex_das_zips;

-- First, add the ZIPs we know are in the invoices
INSERT INTO fedex_das_zips (zip_code, das_type) VALUES
  ('76531', 'DAS_EXTENDED'),  -- From invoice - legitimate DAS Extended
  ('65244', 'DAS_EXTENDED'),  -- From invoice - legitimate DAS Extended  
  ('98223', 'DAS'),           -- From invoice - legitimate DAS
  ('28726', 'NONE'),          -- Mr. Maple location - NO DAS
  ('10001', 'NONE'),          -- NYC - no DAS
  ('90210', 'NONE'),          -- LA - no DAS
  -- Add more sample ZIPs from different zones
  ('01002', 'DAS'),
  ('02030', 'DAS'),
  ('03032', 'DAS'),
  ('04001', 'DAS_EXTENDED'),
  ('05001', 'DAS'),
  ('06001', 'NONE'),
  ('07001', 'NONE'),
  ('08001', 'NONE'),
  ('09001', 'NONE')
ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type;

-- Verify the import
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN das_type = 'DAS' THEN 1 END) as das_count,
       COUNT(CASE WHEN das_type = 'DAS_EXTENDED' THEN 1 END) as extended_count,
       COUNT(CASE WHEN das_type = 'NONE' THEN 1 END) as none_count
FROM fedex_das_zips;