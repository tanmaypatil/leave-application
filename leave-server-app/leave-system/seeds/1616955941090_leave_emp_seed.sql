INSERT INTO leave_app.employee (id, emp_name, mgr_id, status, entity_id, location_id) VALUES (7, 'john meyer', NULL, true, 1, 1);
INSERT INTO leave_app.employee (id, emp_name, mgr_id, status, entity_id, location_id) VALUES (9, 'john grisham', 7, true, 1, 1);
INSERT INTO leave_app.employee (id, emp_name, mgr_id, status, entity_id, location_id) VALUES (10, 'john snow', 7, true, 1, 1);
SELECT pg_catalog.setval('leave_app.employee_id_seq', 10, true);
