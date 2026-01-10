# Semester Report Template (AR1–AR12)

> Target: ~0.5–1 page per section.
> Submit **ONE PDF** containing all sections.

## AR1 — Old performance management process + context view
- Summarize the original process from assignment 1
- Include UML package diagram (context view)

## AR2 — Context view of your architecture
- UML package diagram: Angular UI, Node backend, MongoDB, OrangeHRM, OpenCRX, (optional Odoo), (optional Camunda)

## AR3 — Module view (white box)
- 4-views / package diagrams / class diagrams
- Mention: controllers, routes, services (integration adapters), models

## AR4 — Enterprise apps (OrangeHRM, OpenCRX)
- What each system does in your project
- What data is fetched/stored

## AR5 — Class diagram (business objects)
- Salesman, SocialPerformanceRecord, OrderEvaluationRecord, BonusComputation, Qualification

## AR6 — Security mechanisms (sequence diagrams)
- Login + JWT flow (frontend → backend)
- Backend → OrangeHRM and backend → OpenCRX security (token/basic auth)

## AR7 — Implemented functional requirements
- Use case diagram or user stories
- Include BPMN from Camunda if implemented

## AR8 — Technical requirements checklist (Lam & Shankararaman)
- Map checklist items to: REST, DB, logging, auth, tests, deployment, etc.

## AR9 — UI mockup or final GUI
- If Angular UI works, include screenshots
- Otherwise include mockups from assignment 3

## AR10 — Code walkthrough
- Show key snippets:
  - Angular → backend integration (HttpClient + JWT interceptor)
  - Backend → OrangeHRM/OpenCRX adapters
  - Bonus algorithm (bonus.service.js)

## AR11 — Lessons learned / limitations / future work
- What worked
- What didn’t (e.g., tenant API mismatch)
- Next steps

## AR12 — Single PDF deliverable
- Ensure the final upload is ONE PDF
