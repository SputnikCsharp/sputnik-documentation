# Despliegue de MySQL usando Docker

## 1. Obtención de la imagen oficial

Para iniciar, se debe consultar la página oficial de imágenes en **Docker Hub**, donde se encuentra el comando base para desplegar un contenedor de MySQL:

```
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
```

Este comando sirve como referencia inicial para la creación del contenedor.

---

## 2. Personalización del contenedor

El comando anterior debe ajustarse según las necesidades del entorno:
    * **Nombre del contenedor:** Definir un nombre personalizado.
    * **Contraseña:** Establecer una contraseña segura para el usuario `root`.
    * **Puertos:** Mapear el puerto del contenedor al host para permitir conexiones externas.

---

## 3. Creación del contenedor MySQL

Ejecutar el siguiente comando con los ajustes correspondientes:

```
docker run --name nombreNuevo -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql
```

**Explicación de parámetros:**
    * `--name nombreNuevo`: Nombre personalizado del contenedor.
    * `-p 3306:3306`: Mapeo de puertos (host → contenedor).
    * `-e MYSQL_ROOT_PASSWORD=...`: Contraseña del usuario root.
    * `-d`: Ejecución en segundo plano (modo detached).
    * `mysql`: Imagen oficial de MySQL.

---

## 4. Verificación del contenedor

Para comprobar que el contenedor se encuentra en ejecución:
```
docker ps
```

Si el contenedor aparece en la lista, significa que MySQL está corriendo correctamente.

---

## 5. Conexión a la base de datos

Una vez el contenedor esté activo, es posible conectarse a la base de datos utilizando herramientas de administración como **DBeaver** u otros clientes SQL.

Parámetros de conexión:
    * **Host:** IP del servidor
    * **Puerto:** 3306
    * **Usuario:** root
    * **Contraseña:** La definida en el contenedor


## 6. Conclusión

Con estos pasos, se dispone de una instancia funcional de MySQL ejecutándose en un contenedor Docker, permitiendo una configuración rápida, aislada y fácilmente replicable en distintos entornos.