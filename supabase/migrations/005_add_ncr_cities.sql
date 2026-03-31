-- Add all NCR cities (idempotent — skips existing rows)
INSERT INTO cities (id, name_en, name_hi, is_active, center_lat, center_lng) VALUES
  ('gurgaon',      'Gurgaon',       'गुरुग्राम',       true,  28.4595, 77.0266),
  ('delhi',        'Delhi',         'दिल्ली',          false, 28.6139, 77.2090),
  ('noida',        'Noida',         'नोएडा',           false, 28.5355, 77.3910),
  ('faridabad',    'Faridabad',     'फरीदाबाद',        false, 28.4089, 77.3178),
  ('ghaziabad',    'Ghaziabad',     'गाज़ियाबाद',       false, 28.6692, 77.4538),
  ('greater-noida','Greater Noida', 'ग्रेटर नोएडा',     false, 28.4744, 77.5040),
  ('manesar',      'Manesar',       'मानेसर',           false, 28.3590, 76.9366)
ON CONFLICT (id) DO NOTHING;
