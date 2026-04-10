# 02 — Entities & Database Context

## Overview

This document covers the data layer of the NeoGenesis Park system — the entity model, the database context, and how Entity Framework Core connects the C# code to the PostgreSQL database on the VPS.

---

## Entity Model — `Dinosaurio.cs`

**Location:** `NeoGenesisPark/Models/Dinosaurio.cs`

The `Dinosaurio` class represents the main entity of the system. Each instance of this class maps to one row in the `Dinosaurios` table in the database. Entity Framework Core reads this class and automatically generates the SQL table structure from it.

```csharp
using System;

namespace NeoGenesisPark.Models;

public class Dinosaurio
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;   // assigned name
    public string LastName { get; set; } = null!;    // scientific classification / species
    public string Username { get; set; } = null!;    // unique specimen identifier
    public string Email { get; set; } = null!;       // unique lab registration code
    public string? Phone { get; set; }               // tracking device
    public string? Address { get; set; }             // registered location
    public string? City { get; set; }                // park zone
    public string? Country { get; set; }             // park sector
    public int? Age { get; set; }                    // age (must be >= 0)
    public string? Type { get; set; }                // carnivore / herbivore
    public string? Password { get; set; }            // security code
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### Field explanations

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Id` | `int` | Auto | Primary key, auto-incremented by EF Core |
| `FirstName` | `string` | ✓ | Name assigned to the dinosaur |
| `LastName` | `string` | ✓ | Scientific classification or species |
| `Username` | `string` | ✓ | Unique specimen identifier |
| `Email` | `string` | ✓ | Unique lab registration code |
| `Phone` | `string?` | ✗ | Tracking device identifier |
| `Address` | `string?` | ✗ | Registered physical location |
| `City` | `string?` | ✗ | Park zone (equivalent to city) |
| `Country` | `string?` | ✗ | Park sector (equivalent to country) |
| `Age` | `int?` | ✗ | Age in years, must be >= 0 |
| `Type` | `string?` | ✗ | Dinosaur type: carnivore or herbivore |
| `Password` | `string?` | ✗ | Security code for the record |
| `CreatedAt` | `DateTime` | Auto | UTC timestamp set automatically on creation |

### C# conventions used

**Required fields** use `= null!` — the `!` tells the compiler that the value will never be null at runtime, suppressing nullable warnings. These fields map to `NOT NULL` columns in PostgreSQL.

**Optional fields** use `string?` or `int?` — the `?` marks the type as nullable, meaning the field can hold a null value. These map to columns that accept `NULL` in PostgreSQL.

**`Id`** — EF Core automatically recognizes a property named `Id` as the primary key and makes it auto-incremented. No additional configuration is needed.

**`CreatedAt`** — assigned `DateTime.UtcNow` as a default value. UTC time is used to avoid timezone inconsistencies between the developer's machine and the VPS.

---

## Database Context — `AppDbContext.cs`

**Location:** `NeoGenesisPark/Data/AppDbContext.cs`

The `AppDbContext` is the bridge between the C# code and the PostgreSQL database. It tells EF Core which tables exist, how to connect to the database, and any special rules for the tables (such as uniqueness constraints).

```csharp
using Microsoft.EntityFrameworkCore;
using NeoGenesisPark.Models;

namespace NeoGenesisPark.Data;

public class AppDbContext : DbContext
{
    private readonly string _connectionString;

    public DbSet<Dinosaurio> Dinosaurios { get; set; }

    public AppDbContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseNpgsql(_connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dinosaurio>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }
}
```

### Key components explained

**`DbSet<Dinosaurio> Dinosaurios`** — tells EF Core that a table called `Dinosaurios` exists and that each row is a `Dinosaurio` object. All queries, inserts, updates, and deletes go through this property.

**`OnConfiguring`** — configures the database connection. `UseNpgsql()` tells EF Core to use the PostgreSQL driver (Npgsql) with the provided connection string.

**`OnModelCreating`** — runs once when EF Core builds the model. Used here to enforce uniqueness on `Username` and `Email`. `HasIndex().IsUnique()` creates a unique index on those columns — if a duplicate value is inserted, the database rejects it automatically.

---

## Design-Time Factory — `AppDbContextFactory.cs`

**Location:** `NeoGenesisPark/Data/AppDbContextFactory.cs`

This class is required for EF Core migration commands to work from the terminal. When running `dotnet ef migrations add` or `dotnet ef database update`, EF Core needs to instantiate the `AppDbContext` without running the full application. The factory tells it exactly how to do that.

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace NeoGenesisPark.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = config.GetConnectionString("DefaultConnection")!;
        return new AppDbContext(connectionString);
    }
}
```

This factory reads the connection string from `appsettings.json` and `appsettings.Development.json` (if it exists) and uses it to create the context. The `optional: true` parameter on the Development file means the app won't crash if that file doesn't exist.

---

## Configuration — `appsettings.json`

**Location:** `NeoGenesisPark/appsettings.json`

This file is committed to the repository with placeholder values only. It serves as a template for team members.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=IP_DEL_VPS;Database=neogenesis_park;Username=TU_USUARIO;Password=TU_CONTRASEÑA"
  }
}
```

Each team member creates a local `appsettings.Development.json` file with the real VPS credentials. This file is listed in `.gitignore` and is never committed to the repository.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=REAL_VPS_IP;Database=neogenesis_park;Username=real_user;Password=real_password"
  }
}
```

---

## NuGet Packages

The following packages were installed to support EF Core with PostgreSQL:

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.EntityFrameworkCore` | 9.0.1 | Core ORM framework |
| `Microsoft.EntityFrameworkCore.Design` | 9.0.1 | Required for migration commands |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | 9.0.4 | PostgreSQL driver for EF Core |
| `Microsoft.Extensions.Configuration` | 9.0.1 | Configuration system |
| `Microsoft.Extensions.Configuration.Json` | 9.0.1 | JSON file support for configuration |

> **Important:** Package versions must match the .NET version. This project uses .NET 9, so all packages use version 9.x.x. Installing without specifying a version may pull incompatible v10 packages.

---

## Migrations

Migrations are the mechanism EF Core uses to translate C# model changes into database schema changes. They are generated automatically and should never be edited manually.

### Required tool

Install the EF Core CLI tool globally:

```bash
dotnet tool install --global dotnet-ef --version 9.0.1
```

### Running migrations

From inside the `NeoGenesisPark/` folder:

**Step 1 — Generate the migration file:**
```bash
dotnet ef migrations add InitialCreate
```

This reads the `Dinosaurio` class and `AppDbContext` and generates a C# file in the `Migrations/` folder with the SQL instructions to create the table. It does not touch the database yet.

**Step 2 — Apply the migration to the database:**
```bash
dotnet ef database update
```

This connects to the VPS using the credentials in `appsettings.Development.json` and executes the migration, creating the `neogenesis_park` database and the `Dinosaurios` table.

### Generated files

After running `dotnet ef migrations add InitialCreate`, EF Core creates:

```
NeoGenesisPark/
└── Migrations/
    ├── 20260409XXXXXX_InitialCreate.cs       ← table creation instructions
    └── AppDbContextModelSnapshot.cs          ← current model snapshot
```

### Verifying the result

After `dotnet ef database update`, connect to the VPS in Rider:

**Database panel** → **+** → **Data Source** → **PostgreSQL**
- Host: VPS IP
- Port: 5432
- Database: neogenesis_park
- User / Password: VPS credentials

You should see the `neogenesis_park` database with the `Dinosaurios` table containing 13 columns and the `__EFMigrationsHistory` table which EF Core uses to track applied migrations.

---

## Troubleshooting

### Smart App Control blocking migrations (Windows 11)

**Error:** `Could not load assembly 'NeoGenesisPark'. Una directiva de Control de aplicaciones bloqueó este archivo.`

**Cause:** Windows 11 Smart App Control blocks unsigned DLL files generated by .NET compilation.

**Solution:** Disable Smart App Control:
Start → **Windows Security** → **App & browser control** → **Smart App Control settings** → select **Off**

Restart the PC after disabling. This setting cannot be re-enabled without reinstalling Windows, but Windows Defender and all other protections remain active.

### Migration runs but table not visible in Rider

**Cause:** Rider shows only 1 of N databases by default.

**Solution:** Click on **"1 of 3"** (or similar) next to the server name in the Database panel to show all available databases.

### Password authentication failed

**Error:** `28P01: password authentication failed for user "root"`

**Cause:** PostgreSQL default user is `postgres`, not `root` (that is MySQL).

**Solution:** Update `appsettings.Development.json` to use `Username=postgres` and verify the correct password with whoever configured the VPS.