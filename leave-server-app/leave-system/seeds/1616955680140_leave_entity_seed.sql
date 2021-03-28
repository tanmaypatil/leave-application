INSERT INTO leave_app.entity (id, name, created_at, updated_at, short_name) VALUES (1, 'infosys', '2021-03-28 15:09:37.5973+00', '2021-03-28 15:09:37.5973+00', 'infosys limited');
INSERT INTO leave_app.entity (id, name, created_at, updated_at, short_name) VALUES (2, 'tcs', '2021-03-28 15:09:59.037483+00', '2021-03-28 15:09:59.037483+00', 'tata consultancy ltd');
SELECT pg_catalog.setval('leave_app.entity_id_seq', 2, true);
