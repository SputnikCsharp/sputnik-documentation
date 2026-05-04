# 04 — CRUD Modules

## Overview

**Author:** Person 2 — Backend Developer  
**Location:** `NeoGenesisPark/Modules/`

This document covers the three CRUD modules of the NeoGenesis Park system — Insert, Update, and Delete. Each module handles one category of operations on the `Dinosaurios` table.

---

## How modules connect to the database

All modules receive the `AppDbContext` through their constructor. This pattern is called **dependency injection** — the context is created once in `Program.cs` and passed to each module.

```csharp
// Program.cs creates the context once
var db = new AppDbContext(connectionString);

// And passes it to each module
var insertModule = new InsertModule(db);
var updateModule = new UpdateModule(db);
var deleteModule = new DeleteModule(db);
```

---

## Insert Module — `InsertModule.cs`

**Location:** `NeoGenesisPark/Modules/InsertModule.cs`

Handles the registration of new dinosaurs in the system.

### Rules enforced
- `FirstName`, `LastName`, `Username`, and `Email` are required — cannot be empty
- `Username` must be unique across all records
- `Email` must be unique across all records and must have a valid format
- `Age` must be >= 0 if provided
- On success, shows a confirmation message
- On duplicate `Username` or `Email`, shows an error and rejects the record

### Flow

```
Ask for required fields (FirstName, LastName, Username, Email)
  ↓
Validate fields are not empty
  ↓
Validate email format
  ↓
Check Username is not already taken
  ↓
Check Email is not already taken
  ↓
Ask for optional fields (Phone, Address, City, Country, Age, Type, Password)
  ↓
Save to database
  ↓
Show confirmation: "Dinosaurio registrado correctamente"
```

### Code structure

```csharp
using Microsoft.EntityFrameworkCore;
using NeoGenesisPark.Data;
using NeoGenesisPark.Models;
using NeoGenesisPark.Validations;

namespace NeoGenesisPark.Modules;

public class InsertModule
{
    private readonly AppDbContext _db;

    public InsertModule(AppDbContext db)
    {
        _db = db;
    }

    public void RegistrarDinosaurio()
    {
        // 1. Ask for required fields
        // 2. Validate with DinosaurValidator
        // 3. Check uniqueness
        // 4. Ask for optional fields
        // 5. Save and confirm
    }
}
```

---

## Update Module — `UpdateModule.cs`

**Location:** `NeoGenesisPark/Modules/UpdateModule.cs`

Handles updating existing dinosaur records.

### Operations
- Update any individual field of the dinosaur
- Update the security code (password) with confirmation — user must enter the new password twice

### Rules enforced
- The dinosaur must exist before updating
- Updated `Username` and `Email` must still be unique (excluding the current record)
- Password update requires entering the value twice to confirm
- On success, shows a confirmation message

### Flow

```
Ask for dinosaur ID or Email to find the record
  ↓
Find record in database
  ↓
Record found? → No → Show "not found" message → Return
  ↓
Show current data
  ↓
Ask which field to update
  ↓
Validate new value
  ↓
Save changes
  ↓
Show confirmation: "Datos actualizados correctamente"
```

### Password update flow

```
User selects "Update password"
  ↓
Ask for new password
  ↓
Ask to confirm new password
  ↓
Passwords match? → No → Show error → Return
  ↓
Save new password
  ↓
Show confirmation: "Contraseña actualizada correctamente"
```

### Code structure

```csharp
using NeoGenesisPark.Data;
using NeoGenesisPark.Models;

namespace NeoGenesisPark.Modules;

public class UpdateModule
{
    private readonly AppDbContext _db;

    public UpdateModule(AppDbContext db)
    {
        _db = db;
    }

    public void ActualizarDinosaurio()
    {
        // 1. Find record by ID or Email
        // 2. Show current data
        // 3. Ask which field to update
        // 4. Validate and save
    }

    public void ActualizarPassword()
    {
        // 1. Find record
        // 2. Ask for new password twice
        // 3. Confirm match and save
    }
}
```

---

## Delete Module — `DeleteModule.cs`

**Location:** `NeoGenesisPark/Modules/DeleteModule.cs`

Handles the removal of dinosaur records from the system.

### Operations
- Delete by ID
- Delete by Email (registration code)

### Rules enforced
- The dinosaur must exist before deleting
- Before deleting, the system shows the record details and asks for confirmation:
  `"¿Está seguro de eliminar este dinosaurio? (S/N)"`
- If the user answers `N`, the operation is cancelled
- On successful deletion, shows a confirmation message

### Flow

```
Ask for ID or Email
  ↓
Find record in database
  ↓
Record found? → No → Show "not found" message → Return
  ↓
Show record details
  ↓
Ask: "¿Está seguro de eliminar este dinosaurio? (S/N)"
  ↓
Answer is S? → No → Show "operation cancelled" → Return
  ↓
Delete record
  ↓
Show confirmation: "Dinosaurio eliminado correctamente"
```

### Code structure

```csharp
using NeoGenesisPark.Data;
using NeoGenesisPark.Models;

namespace NeoGenesisPark.Modules;

public class DeleteModule
{
    private readonly AppDbContext _db;

    public DeleteModule(AppDbContext db)
    {
        _db = db;
    }

    public void EliminarPorId()
    {
        // 1. Ask for ID
        // 2. Find record
        // 3. Show details and confirm
        // 4. Delete and confirm
    }

    public void EliminarPorEmail()
    {
        // 1. Ask for Email
        // 2. Find record
        // 3. Show details and confirm
        // 4. Delete and confirm
    }
}
```

---

## Validations — `DinosaurValidator.cs`

**Location:** `NeoGenesisPark/Validations/DinosaurValidator.cs`

Shared validation logic used by the Insert and Update modules.

### Validations implemented

| Rule | Description |
|------|-------------|
| Required fields | `FirstName`, `LastName`, `Username`, `Email` cannot be empty |
| Email format | Must contain `@` and a valid domain |
| Username uniqueness | No two dinosaurs can share the same `Username` |
| Email uniqueness | No two dinosaurs can share the same `Email` |
| Age range | If provided, `Age` must be >= 0 |

### Code structure

```csharp
using NeoGenesisPark.Data;

namespace NeoGenesisPark.Validations;

public static class DinosaurValidator
{
    public static bool IsValidEmail(string email)
    {
        // Check format
    }

    public static bool IsUsernameAvailable(AppDbContext db, string username, int? excludeId = null)
    {
        // Check uniqueness excluding current record on update
    }

    public static bool IsEmailAvailable(AppDbContext db, string email, int? excludeId = null)
    {
        // Check uniqueness excluding current record on update
    }
}
```

---

## Confirmation Messages Reference

| Operation | Success message |
|-----------|----------------|
| Insert | `"✓ Dinosaurio registrado correctamente"` |
| Update | `"✓ Datos actualizados correctamente"` |
| Update password | `"✓ Contraseña actualizada correctamente"` |
| Delete | `"✓ Dinosaurio eliminado correctamente"` |
| Delete cancelled | `"Operación cancelada"` |
| Not found | `"No se encontró ningún dinosaurio con ese dato"` |
| Duplicate username | `"Error: ese Username ya está en uso"` |
| Duplicate email | `"Error: ese Email ya está registrado"` |