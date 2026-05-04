# 03 — System Diagrams

## Overview

This document covers the three required diagrams for the NeoGenesis Park system. All diagrams were created using [draw.io](https://app.diagrams.net) and are available in both editable (`.drawio`) and image (`.png`) formats in the `docs/diagrams/` folder.

---

## Class Diagram

**File:** `docs/diagrams/diagrama-clases.drawio`  
**Author:** Person 1 — Architect

The class diagram represents the structure of the system's code — the classes, their attributes, and their methods.

### How to read it

A class diagram has three sections:
- **Top section** — class name
- **Middle section** — attributes (data the class holds)
- **Bottom section** — methods (actions the class can perform)

The `+` symbol means the member is **public** (accessible from outside the class).

### `Dinosaurio` class

| Symbol | Member | Type | Description |
|--------|--------|------|-------------|
| + | Id | int | Primary key, auto-incremented |
| + | FirstName | string | Assigned name (required) |
| + | LastName | string | Species / scientific classification (required) |
| + | Username | string | Unique specimen identifier (required) |
| + | Email | string | Unique lab registration code (required) |
| + | Phone | string? | Tracking device (optional) |
| + | Address | string? | Registered location (optional) |
| + | City | string? | Park zone (optional) |
| + | Country | string? | Park sector (optional) |
| + | Age | int? | Age in years (optional) |
| + | Type | string? | Carnivore or herbivore (optional) |
| + | Password | string? | Security code (optional) |
| + | CreatedAt | DateTime | Auto-assigned UTC timestamp |

**Methods:**

| Method | Return type | Description |
|--------|-------------|-------------|
| Insert() | void | Registers a new dinosaur |
| Update() | void | Updates dinosaur data |
| Delete() | void | Removes a dinosaur from the system |
| GetAll() | List\<Dinosaurio\> | Returns all registered dinosaurs |
| GetById(id: int) | Dinosaurio | Returns a dinosaur by its ID |
| GetByEmail(email: string) | Dinosaurio | Returns a dinosaur by its registration code |
| GetByZone(city: string) | List\<Dinosaurio\> | Returns all dinosaurs in a specific zone |
| CountAll() | int | Returns the total count of dinosaurs |

---

## Use Case Diagram

**File:** `docs/diagrams/diagrama-casos-uso.drawio`  
**Author:** Person 1 — Architect

The use case diagram shows who interacts with the system and what actions they can perform.

### Elements

**Actor — Investigador (Researcher)**  
The scientist who operates the NeoGenesis Park registration system. This is the only actor in the system.

**System boundary**  
The rectangle labeled "Sistema NeoGenesis Park" contains all the use cases — everything inside it is part of the system.

**Use cases (ovals)**  
Each oval represents one action the researcher can perform in the system.

### Use cases by module

**Insert module:**
- Register dinosaur

**Query module:**
- List all dinosaurs
- Search by ID
- Search by email
- Filter by zone
- Filter by sector
- Filter by age
- Filter by type
- View without tracking device
- View without registered location
- Count dinosaurs
- View scientific report

**Update module:**
- Update data
- Update password

**Delete module:**
- Delete by ID
- Delete by email

---

## Flow Diagram

**File:** `docs/diagrams/diagrama-flujo.drawio`  
**Author:** Person 3 — LINQ / Queries Developer

The flow diagram represents the step-by-step logic of the system — how the user navigates through menus, what decisions are made, and what happens at each step.

### How to read it

| Shape | Meaning |
|-------|---------|
| Rounded rectangle | Start / End |
| Rectangle | Process or action |
| Diamond | Decision (yes/no) |
| Arrow | Flow direction |

### Main flow

```
Start
  ↓
Show main menu
  ↓
User selects option
  ↓
  ├── 1. Insert → validate data → save → confirm message
  ├── 2. Update → find record → validate → update → confirm
  ├── 3. Delete → find record → confirm? → delete → confirm
  ├── 4. Queries → show query menu → execute → display results
  └── 5. Exit → end
```

> **Note:** The detailed flow diagram will be added by Person 3 once completed.

---

## Diagram Files

All diagram files should be stored in:

```
neogenesis-park/
└── docs/
    └── diagrams/
        ├── diagrama-clases.drawio
        ├── diagrama-clases.drawio.png
        ├── diagrama-casos-uso.drawio
        ├── diagrama-casos-uso.drawio.png
        ├── diagrama-flujo.drawio         ← Person 3
        └── diagrama-flujo.drawio.png     ← Person 3
```