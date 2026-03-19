-- Fix: next_custom_id needs SECURITY DEFINER to update id_counters
CREATE OR REPLACE FUNCTION next_custom_id(p_type TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_pad INTEGER;
  v_next BIGINT;
BEGIN
  CASE p_type
    WHEN 'worker' THEN v_prefix := 'W'; v_pad := 9;
    WHEN 'employer' THEN v_prefix := 'E'; v_pad := 9;
    WHEN 'job_listing' THEN v_prefix := 'JID'; v_pad := 10;
    ELSE RAISE EXCEPTION 'Invalid type: %', p_type;
  END CASE;
  UPDATE id_counters SET last_id = last_id + 1
  WHERE entity_type = p_type
  RETURNING last_id INTO v_next;
  RETURN v_prefix || LPAD(v_next::TEXT, v_pad, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
