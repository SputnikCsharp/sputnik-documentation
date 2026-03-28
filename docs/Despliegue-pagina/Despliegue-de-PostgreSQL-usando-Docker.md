# Despliegue de PostgreSQL usando Docker

## 1. Obtención de la imagen oficial

Para iniciar, se debe consultar la página oficial de imágenes en **Docker Hub**, donde se encuentra el comando base para desplegar un contenedor de PostgreSQL:

```
docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

Este comando sirve como referencia inicial para la creación del contenedor.

---

## 2. Personalización del contenedor

El comando anterior debe ajustarse según las necesidades del entorno:
    * **Nombre del contenedor:** Definir un nombre personalizado.
    * **Contraseña:** Establecer una contraseña segura para el usuario `postgres`.
    * **Puertos:** Mapear el puerto del contenedor al host para permitir conexiones externas.

---

## 3. Creación del contenedor PostgreSQL

Ejecutar el siguiente comando con los ajustes correspondientes:

```
docker run --name nombrePostgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

**Explicación de parámetros:**
    * `--name nombrePostgres`: Nombre personalizado del contenedor.
    * `-p 5432:5432`: Mapeo de puertos (host → contenedor).
    * `-e POSTGRES_PASSWORD=...`: Contraseña del usuario `postgres`.
    * `-d`: Ejecución en segundo plano (modo detached).
    * `postgres`: Imagen oficial de PostgreSQL.

---

## 4. Verificación del contenedor

Para comprobar que el contenedor se encuentra en ejecución:

```
docker ps
```

Si el contenedor aparece en la lista, significa que PostgreSQL está corriendo correctamente.

---

## 5. Conexión a la base de datos

Una vez el contenedor esté activo, es posible conectarse a la base de datos utilizando herramientas de administración como **DBeaver** u otros clientes SQL.

**Parámetros de conexión:**
    * **Host:** IP del servidor
    * **Puerto:** 5432
    * **Usuario:** postgres
    * **Contraseña:** La definida en el contenedor

6. Conclusión

Con estos pasos, se dispone de una instancia funcional de PostgreSQL ejecutándose en un contenedor Docker, permitiendo una configuración rápida, aislada y fácilmente replicable en distintos entornos.