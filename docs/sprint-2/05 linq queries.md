# 05 — LINQ Query Module

## Overview

**Author:** Person 3 — LINQ / Queries Developer  
**Location:** `NeoGenesisPark/Modules/QueryModule.cs`

This document covers all 15 functional queries of the NeoGenesis Park system implemented using LINQ (Language Integrated Query) with Entity Framework Core.

---

## What is LINQ?

LINQ is a C# feature that allows querying data collections using a syntax similar to SQL, but written directly in C#. When used with EF Core, LINQ queries are automatically translated to SQL and executed against the PostgreSQL database.

```csharp
// Instead of writing raw SQL:
SELECT * FROM "Dinosaurios" WHERE "Type" = 'Carnívoro';

// You write LINQ:
_db.Dinosaurios.Where(d => d.Type == "Carnívoro").ToList();
```

---

## Field mapping reference

The query module uses the field names defined in `Dinosaurio.cs`:

| Concept | Field name in code |
|---------|-------------------|
| Assigned name | `FirstName` |
| Species | `LastName` |
| Unique identifier | `Username` |
| Registration code | `Email` |
| Tracking device | `Phone` (null = no tracker) |
| Location | `Address` (null = no location) |
| Park zone | `City` |
| Park sector | `Country` |
| Age | `Age` |
| Type | `Type` |
| Registration date | `CreatedAt` |

---

## Module structure

```csharp
using Microsoft.EntityFrameworkCore;
using NeoGenesisPark.Data;
using NeoGenesisPark.Models;

namespace NeoGenesisPark.Modules;

public class QueryModule
{
    private readonly AppDbContext _db;

    public QueryModule(AppDbContext db)
    {
        _db = db;
    }

    // All 15 queries go here
}
```

---

## Query 1 — List all dinosaurs

Returns all registered dinosaurs. Used for the general report.

```csharp
public List<Dinosaurio> ListarTodos()
{
    return _db.Dinosaurios.ToList();
}
```

---

## Query 2 — Filter by zone (City)

Returns all dinosaurs in a specific park zone.

```csharp
public List<Dinosaurio> FiltrarPorZona(string zona)
{
    return _db.Dinosaurios
        .Where(d => d.City == zona)
        .ToList();
}
```

---

## Query 3 — Filter by sector (Country)

Returns all dinosaurs in a specific park sector.

```csharp
public List<Dinosaurio> FiltrarPorSector(string sector)
{
    return _db.Dinosaurios
        .Where(d => d.Country == sector)
        .ToList();
}
```

---

## Query 4 — Filter by minimum age

Returns all dinosaurs older than a specified age.

```csharp
public List<Dinosaurio> FiltrarPorEdad(int edadMinima)
{
    return _db.Dinosaurios
        .Where(d => d.Age >= edadMinima)
        .ToList();
}
```

---

## Query 5 — Filter by type

Returns all dinosaurs of a specific type (carnivore or herbivore).

```csharp
public List<Dinosaurio> FiltrarPorTipo(string tipo)
{
    return _db.Dinosaurios
        .Where(d => d.Type == tipo)
        .ToList();
}
```

---

## Query 6 — Projection: full name + registration code

Returns a formatted string list with full name and email for scientific reports.

```csharp
public List<string> ProyeccionNombreCodigo()
{
    return _db.Dinosaurios
        .Select(d => $"{d.FirstName} {d.LastName} — {d.Email}")
        .ToList();
}
```

---

## Query 7 — Count total dinosaurs

Returns the total number of dinosaurs registered in the system.

```csharp
public int ContarTotal()
{
    return _db.Dinosaurios.Count();
}
```

---

## Query 8 — Count by zone

Groups dinosaurs by zone and returns the count for each zone.

```csharp
public List<(string Zona, int Total)> ContarPorZona()
{
    return _db.Dinosaurios
        .GroupBy(d => d.City)
        .Select(g => new { Zona = g.Key, Total = g.Count() })
        .AsEnumerable()
        .Select(x => (x.Zona ?? "Sin zona", x.Total))
        .ToList();
}
```

> **Note:** `.AsEnumerable()` is used before the final `.Select()` because tuple types cannot be translated directly to SQL by EF Core.

---

## Query 9 — Count by sector

Groups dinosaurs by sector and returns the count for each sector.

```csharp
public List<(string Sector, int Total)> ContarPorSector()
{
    return _db.Dinosaurios
        .GroupBy(d => d.Country)
        .Select(g => new { Sector = g.Key, Total = g.Count() })
        .AsEnumerable()
        .Select(x => (x.Sector ?? "Sin sector", x.Total))
        .ToList();
}
```

---

## Query 10 — Without tracking device

Returns dinosaurs that have no tracking device registered (`Phone` is null).

```csharp
public List<Dinosaurio> SinRastreador()
{
    return _db.Dinosaurios
        .Where(d => d.Phone == null)
        .ToList();
}
```

---

## Query 11 — Without registered location

Returns dinosaurs that have no location registered (`Address` is null).

```csharp
public List<Dinosaurio> SinUbicacion()
{
    return _db.Dinosaurios
        .Where(d => d.Address == null)
        .ToList();
}
```

---

## Query 12 — Without tracker or location

Returns dinosaurs that have neither a tracking device nor a registered location — maximum alert level.

```csharp
public List<Dinosaurio> SinRastreadorNiUbicacion()
{
    return _db.Dinosaurios
        .Where(d => d.Phone == null && d.Address == null)
        .ToList();
}
```

---

## Query 13 — Order by registration date

Returns all dinosaurs ordered by registration date, most recent first.

```csharp
public List<Dinosaurio> OrdenarPorFecha()
{
    return _db.Dinosaurios
        .OrderByDescending(d => d.CreatedAt)
        .ToList();
}
```

---

## Query 14 — Alphabetical order by species

Returns all dinosaurs ordered alphabetically by species (`LastName`), then by name (`FirstName`).

```csharp
public List<Dinosaurio> OrdenAlfabetico()
{
    return _db.Dinosaurios
        .OrderBy(d => d.LastName)
        .ThenBy(d => d.FirstName)
        .ToList();
}
```

---

## Query 15 — Combined query

Filters dinosaurs by zone and type that have a tracking device, then orders by species. Used for advanced scientific reports.

```csharp
public List<Dinosaurio> Combinada(string zona, string tipo)
{
    return _db.Dinosaurios
        .Where(d => d.City == zona && d.Type == tipo && d.Phone != null)
        .OrderBy(d => d.LastName)
        .ToList();
}
```

---

## LINQ operators used

| Operator | Purpose | Used in |
|----------|---------|---------|
| `.Where()` | Filter records | Queries 2, 3, 4, 5, 10, 11, 12, 15 |
| `.Select()` | Project/transform data | Queries 6, 8, 9 |
| `.GroupBy()` | Group records | Queries 8, 9 |
| `.OrderBy()` | Sort ascending | Queries 14, 15 |
| `.OrderByDescending()` | Sort descending | Query 13 |
| `.ThenBy()` | Secondary sort | Query 14 |
| `.Count()` | Count records | Query 7 |
| `.ToList()` | Execute and return list | All queries |
| `.AsEnumerable()` | Switch from SQL to in-memory | Queries 8, 9 |