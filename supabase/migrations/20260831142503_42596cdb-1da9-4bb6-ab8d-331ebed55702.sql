GRANT EXECUTE ON FUNCTION private.can_edit(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_treasury(uuid) TO authenticated, service_role;