
# Assignment 2.2 – Inspecting REST APIs of OrangeHRM & OpenCRX

This folder contains Postman collections (read-only) and UML diagrams.

## Postman
Import both files from `postman/`:
- `Assignment_2_Task_2.postman_collection.json`
- `SEPP.postman_environment.json`

The environment already contains the correct base URLs and demo credentials. 
Run the **OAuth – Issue Token** request first (OrangeHRM) and then execute the GET requests.

## Diagrams
PlantUML sources are in `diagrams/`:
- `orangehrm_opencrx_ooa.puml` – OOA Class Diagram (core business objects)
- `auth_orangehrm_seq.puml` – OAuth2 (Bearer) sequence
- `auth_opencrx_seq.puml` – Basic Auth sequence
