# 06 — Main Menu & Program Setup

## Overview

**Author:** Person 4 — Docs / DevOps  
**Location:** `NeoGenesisPark/Program.cs`, `NeoGenesisPark/Seed/DataSeeder.cs`, `NeoGenesisPark/Helpers/ConsoleHelper.cs`

This document covers the main entry point of the NeoGenesis Park system — the console menu that connects all modules, the seed data for testing, and the console helper utilities.

---

## Program.cs — Main entry point

`Program.cs` is where the application starts. It is responsible for:

1. Reading the configuration (connection string)
2. Creating the `AppDbContext`
3. Running seed data if the database is empty
4. Showing the main menu in a loop until the user exits

### Code structure

```csharp
using Microsoft.Extensions.Configuration;
using NeoGenesisPark.Data;
using NeoGenesisPark.Helpers;
using NeoGenesisPark.Modules;
using NeoGenesisPark.Seed;

// 1. Read configuration
var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .Build();

// 2. Create database context
var connectionString = config.GetConnectionString("DefaultConnection")!;
var db = new AppDbContext(connectionString);

// 3. Run seed data
DataSeeder.Seed(db);

// 4. Initialize modules
var insertModule = new InsertModule(db);
var updateModule = new UpdateModule(db);
var deleteModule = new DeleteModule(db);
var queryModule = new QueryModule(db);

// 5. Show main menu
bool running = true;
while (running)
{
    ConsoleHelper.ShowMainMenu();
    string option = Console.ReadLine() ?? "";

    switch (option)
    {
        case "1": insertModule.RegistrarDinosaurio(); break;
        case "2": updateModule.ActualizarDinosaurio(); break;
        case "3": deleteModule.EliminarPorId(); break;
        case "4": queryModule.ShowQueryMenu(); break;
        case "5": running = false; break;
        default: ConsoleHelper.ShowError("Opción no válida"); break;
    }
}

Console.WriteLine("Hasta luego, investigador.");
```

---

## Main menu structure

```
╔══════════════════════════════════════╗
║     NEOGENESIS PARK — SISTEMA        ║
║     DE REGISTRO DE DINOSAURIOS       ║
╠══════════════════════════════════════╣
║  1. Registrar dinosaurio             ║
║  2. Actualizar dinosaurio            ║
║  3. Eliminar dinosaurio              ║
║  4. Consultas                        ║
║  5. Salir                            ║
╚══════════════════════════════════════╝
```

---

## Query submenu structure

```
╔══════════════════════════════════════╗
║          MÓDULO DE CONSULTAS         ║
╠══════════════════════════════════════╣
║  1.  Listar todos los dinosaurios    ║
║  2.  Filtrar por zona                ║
║  3.  Filtrar por sector              ║
║  4.  Filtrar por edad                ║
║  5.  Filtrar por tipo                ║
║  6.  Nombre completo + código        ║
║  7.  Contar total                    ║
║  8.  Contar por zona                 ║
║  9.  Contar por sector               ║
║  10. Sin rastreador                  ║
║  11. Sin ubicación                   ║
║  12. Sin rastreador ni ubicación     ║
║  13. Ordenar por fecha               ║
║  14. Orden alfabético                ║
║  15. Consulta combinada              ║
║  16. Volver al menú principal        ║
╚══════════════════════════════════════╝
```

---

## ConsoleHelper.cs — UI utilities

**Location:** `NeoGenesisPark/Helpers/ConsoleHelper.cs`

Reusable methods for consistent console output across all modules.

```csharp
namespace NeoGenesisPark.Helpers;

public static class ConsoleHelper
{
    public static void ShowTitle(string text)
    {
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"=== {text} ===");
        Console.ResetColor();
    }

    public static void ShowSuccess(string message)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"✓ {message}");
        Console.ResetColor();
    }

    public static void ShowError(string message)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"✗ {message}");
        Console.ResetColor();
    }

    public static void ShowWarning(string message)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"⚠ {message}");
        Console.ResetColor();
    }

    public static void PressEnterToContinue()
    {
        Console.WriteLine("\nPresiona cualquier tecla para continuar...");
        Console.ReadKey();
        Console.Clear();
    }

    public static void ShowMainMenu()
    {
        Console.Clear();
        Console.ForegroundColor = ConsoleColor.DarkCyan;
        Console.WriteLine("╔══════════════════════════════════════╗");
        Console.WriteLine("║     NEOGENESIS PARK — SISTEMA        ║");
        Console.WriteLine("║     DE REGISTRO DE DINOSAURIOS       ║");
        Console.WriteLine("╠══════════════════════════════════════╣");
        Console.WriteLine("║  1. Registrar dinosaurio             ║");
        Console.WriteLine("║  2. Actualizar dinosaurio            ║");
        Console.WriteLine("║  3. Eliminar dinosaurio              ║");
        Console.WriteLine("║  4. Consultas                        ║");
        Console.WriteLine("║  5. Salir                            ║");
        Console.WriteLine("╚══════════════════════════════════════╝");
        Console.ResetColor();
        Console.Write("\nSelecciona una opción: ");
    }
}
```

---

## DataSeeder.cs — Test data

**Location:** `NeoGenesisPark/Seed/DataSeeder.cs`

The seeder inserts sample dinosaurs into the database when the table is empty. This ensures all team members have data to test their modules without manually inserting records.

```csharp
using NeoGenesisPark.Data;
using NeoGenesisPark.Models;

namespace NeoGenesisPark.Seed;

public static class DataSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Dinosaurios.Any()) return; // skip if data already exists

        var dinosaurios = new List<Dinosaurio>
        {
            new() { FirstName = "Rex",    LastName = "Tyrannosaurus",  Username = "trex_01",   Email = "trex01@neogenesis.com",   Phone = "555-0001", Address = "Sector A-1", City = "Norte",  Country = "Selva",   Age = 68,  Type = "Carnívoro",  Password = "pass123" },
            new() { FirstName = "Bronto", LastName = "Brontosaurus",   Username = "bronto_01", Email = "bronto01@neogenesis.com", Phone = null,       Address = "Sector B-2", City = "Sur",    Country = "Pradera", Age = 152, Type = "Herbívoro",  Password = "pass123" },
            new() { FirstName = "Raptor", LastName = "Velociraptor",   Username = "raptor_01", Email = "raptor01@neogenesis.com", Phone = "555-0003", Address = null,         City = "Norte",  Country = "Selva",   Age = 75,  Type = "Carnívoro",  Password = "pass123" },
            new() { FirstName = "Trice",  LastName = "Triceratops",    Username = "trice_01",  Email = "trice01@neogenesis.com",  Phone = "555-0004", Address = "Sector C-3", City = "Este",   Country = "Montaña", Age = 68,  Type = "Herbívoro",  Password = "pass123" },
            new() { FirstName = "Stego",  LastName = "Stegosaurus",    Username = "stego_01",  Email = "stego01@neogenesis.com",  Phone = null,       Address = null,         City = "Sur",    Country = "Pradera", Age = 155, Type = "Herbívoro",  Password = "pass123" },
            new() { FirstName = "Ptero",  LastName = "Pterodactylus",  Username = "ptero_01",  Email = "ptero01@neogenesis.com",  Phone = "555-0006", Address = "Sector D-4", City = "Norte",  Country = "Costa",   Age = 150, Type = "Carnívoro",  Password = "pass123" },
            new() { FirstName = "Anky",   LastName = "Ankylosaurus",   Username = "anky_01",   Email = "anky01@neogenesis.com",   Phone = null,       Address = "Sector E-5", City = "Oeste",  Country = "Montaña", Age = 66,  Type = "Herbívoro",  Password = "pass123" },
            new() { FirstName = "Spino",  LastName = "Spinosaurus",    Username = "spino_01",  Email = "spino01@neogenesis.com",  Phone = "555-0008", Address = null,         City = "Este",   Country = "Costa",   Age = 95,  Type = "Carnívoro",  Password = "pass123" },
        };

        db.Dinosaurios.AddRange(dinosaurios);
        db.SaveChanges();

        Console.WriteLine($"✓ Seed completado: {dinosaurios.Count} dinosaurios registrados.");
    }
}
```

### Seed data coverage

The seed data is designed to cover all query scenarios:

| Scenario | Records |
|----------|---------|
| With tracking device (Phone not null) | Rex, Raptor, Trice, Ptero, Spino |
| Without tracking device (Phone null) | Bronto, Stego, Anky |
| With location (Address not null) | Rex, Bronto, Trice, Ptero, Anky |
| Without location (Address null) | Raptor, Stego, Spino |
| Without tracker AND location | Stego |
| Zone Norte | Rex, Raptor, Ptero |
| Zone Sur | Bronto, Stego |
| Zone Este | Trice, Spino |
| Zone Oeste | Anky |
| Carnivores | Rex, Raptor, Ptero, Spino |
| Herbivores | Bronto, Trice, Stego, Anky |
| Age >= 150 | Bronto (152), Stego (155), Ptero (150) |

---

## Azure DevOps / Jira — Activity tracking

Person 4 is responsible for maintaining the activity board. Each task must be tracked with the following states:

```
To Do → In Progress → In Review → Done
```

### Task breakdown per person

**Person 1 — Architect:**
- Configure repository and branches
- Create Dinosaurio entity
- Create AppDbContext
- Run migrations

**Person 2 — Backend:**
- Implement InsertModule
- Implement UpdateModule
- Implement DeleteModule
- Implement DinosaurValidator

**Person 3 — LINQ:**
- Implement QueryModule (15 queries)
- Create flow diagram

**Person 4 — Docs/DevOps:**
- Configure Azure DevOps / Jira board
- Implement Program.cs main menu
- Implement DataSeeder
- Implement ConsoleHelper
- Write Docusaurus documentation

---

## Conventional Commits reference

All team members must follow this format for every commit:

```
type: short description in present tense
```

| Type | When to use |
|------|-------------|
| `feat:` | New feature or module |
| `chore:` | Configuration, setup, packages |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring without behavior change |

**Examples:**
```
feat: agregar modulo de insercion de dinosaurios
feat: implementar 15 consultas LINQ
chore: agregar seed de datos de prueba
fix: corregir validacion de email duplicado
docs: agregar documentacion del modulo CRUD
refactor: extraer logica de validacion a DinosaurValidator
```