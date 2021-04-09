INSERT INTO leave_app.entity_location (id, entity_id, name, created_at, updated_at, code) VALUES (1, 1, 'infosys pune', '2021-03-28 15:11:14.692924+00', '2021-03-28 15:11:14.692924+00', 'INFYPUNE');
INSERT INTO leave_app.entity_location (id, entity_id, name, created_at, updated_at, code) VALUES (2, 1, 'infosys bangalore', '2021-03-28 15:11:53.434623+00', '2021-03-28 15:11:53.434623+00', 'INFBANG');
INSERT INTO leave_app.entity_location (id, entity_id, name, created_at, updated_at, code) VALUES (3, 2, 'tcs mumbai', '2021-03-28 15:32:22.996168+00', '2021-03-28 15:32:22.996168+00', 'TCSMUM');
INSERT INTO leave_app.entity_location (id, entity_id, name, created_at, updated_at, code) VALUES (4, 2, 'tcs chennai', '2021-03-28 15:32:39.241147+00', '2021-03-28 15:32:39.241147+00', 'TCSCHN');
SELECT pg_catalog.setval('leave_app.entity_location_id_seq', 4, true);
