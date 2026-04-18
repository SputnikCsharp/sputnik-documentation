#  Guía de Despliegue: ASP.NET MVC con Docker, Nginx y SSL en Ubuntu

> **Propósito:** Documento de referencia para desplegar proyectos ASP.NET MVC (.NET 10) en un servidor Ubuntu usando Docker como contenedor, Nginx como reverse proxy y Certbot para HTTPS con Let's Encrypt.

---

##  Requisitos Previos

- Servidor Ubuntu 24.04 LTS
- Docker instalado y corriendo
- Nginx instalado
- Un dominio con DNS apuntando a la IP del servidor
- Proyecto ASP.NET MVC ya creado y funcionando localmente

---

##  Paso 1: Crear el Dockerfile

Dentro de la raíz del proyecto (donde está el archivo `.csproj`), crear un archivo llamado `Dockerfile` con el siguiente contenido:

```dockerfile
# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
#  Asegurarse de que la versión de .NET coincida con la del proyecto

WORKDIR /app

# Copiar csproj y restaurar dependencias
COPY *.csproj ./
RUN dotnet restore

# Copiar todo el código fuente
COPY . ./

# Publicar la aplicación en modo Release
RUN dotnet publish -c Release -o /out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copiar los archivos publicados desde la etapa de build
COPY --from=build /out .

# Exponer el puerto (siempre 8080 para contenedores ASP.NET)
EXPOSE 8080

#  Reemplazar "TuProyecto.dll" con el nombre real del archivo .dll del proyecto
ENTRYPOINT ["dotnet", "TuProyecto.dll"]
```

> **Notas importantes:**
> - La versión de .NET en `sdk:10.0` y `aspnet:10.0` debe coincidir con la versión usada en el proyecto (revisar el `.csproj`).
> - El nombre del `.dll` en el `ENTRYPOINT` debe ser exactamente el nombre del proyecto (ejemplo: `EventixMVC.dll`).
> - El puerto `8080` es el estándar para contenedores ASP.NET; no cambiarlo dentro del Dockerfile.

---

##  Paso 2: Construir la Imagen Docker

Navegar a la carpeta del proyecto y ejecutar:

```bash
cd /var/www/Projects/mi-proyecto
docker build -t nombre-imagen .
```

Verificar que la imagen fue creada correctamente:

```bash
docker images
```

Se debería ver algo como:

```
IMAGE                  ID             DISK USAGE
nombre-imagen:latest   b04c40a31730   368MB
```

---

##  Paso 3: Correr el Contenedor

```bash
docker run -d -p 8082:8080 --name nombre-contenedor nombre-imagen
```

**Explicación de los flags:**

| Flag | Descripción |
|------|-------------|
| `-d` | Corre el contenedor en segundo plano (detached) |
| `-p 8082:8080` | Mapea el puerto `8082` del servidor al puerto `8080` del contenedor |
| `--name` | Nombre identificador del contenedor |

> **Nota sobre puertos:** El número a la izquierda del `:` es el puerto del servidor (se puede cambiar según disponibilidad). El de la derecha (`8080`) es el interno del contenedor y no se modifica.

Verificar que el contenedor está corriendo:

```bash
docker ps
```

Probar que responde:

```bash
curl http://localhost:8082
```

Si devuelve HTML, el contenedor está funcionando correctamente.

---

##  Paso 4: Configurar Nginx como Reverse Proxy

### 4.1 Crear el archivo de configuración del sitio

```bash
sudo vim /etc/nginx/sites-available/mi-dominio-com
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name mi-dominio.com;  # ← Reemplazar con el dominio real

    location / {
        proxy_pass http://localhost:8082;  # ← Puerto donde corre el contenedor

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> **Nota:** El puerto en `proxy_pass` debe coincidir con el puerto del servidor especificado al correr el contenedor (`-p 8082:8080`).

### 4.2 Activar el sitio creando un symlink

```bash
ln -s /etc/nginx/sites-available/mi-dominio-com /etc/nginx/sites-enabled/
```

### 4.3 Verificar la configuración de Nginx

```bash
sudo nginx -t
```

Debe responder:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4.4 Recargar Nginx

```bash
sudo service nginx restart
sudo systemctl reload nginx
```

### 4.5 Verificar que el dominio responde

```bash
ping mi-dominio.com
```

Si el ping devuelve la IP del servidor, el DNS está bien configurado y se puede continuar.

---

##  Paso 5: Configurar SSL con Certbot (HTTPS)

### 5.1 Instalar Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Verificar Nginx antes de ejecutar Certbot

```bash
sudo nginx -t
```

Debe mostrar `syntax is ok` y `test is successful`.

### 5.3 Ejecutar Certbot

```bash
sudo certbot --nginx
```

Certbot hará las siguientes preguntas de forma interactiva:

1. **Email:** Ingresar un correo válido para notificaciones de renovación.
2. **Aceptar términos:** Escribir `Y` y presionar Enter.
3. **Seleccionar dominio:** Mostrará los dominios detectados desde Nginx, por ejemplo:
   ```
   1: mi-dominio.com
   ```
   Escribir el número correspondiente y presionar Enter.
4. **Redirección HTTP → HTTPS:** Seleccionar opción `2` (recomendada) para redirigir todo el tráfico HTTP a HTTPS automáticamente.

### 5.4 Qué hace Certbot automáticamente

- Genera el certificado SSL de Let's Encrypt
- Modifica el archivo de Nginx para agregar la configuración HTTPS
- Activa el puerto 443
- Configura la redirección de HTTP a HTTPS

### 5.5 Verificar que HTTPS funciona

```bash
curl -I https://mi-dominio.com
```

Debe devolver `HTTP/2 200` o similar con cabeceras del sitio.

También se puede verificar desde el navegador entrando a `https://mi-dominio.com` y confirmando que aparece el candado verde.

---

##  Referencia Rápida: Comandos Útiles

```bash
# Ver contenedores corriendo
docker ps

# Ver todas las imágenes
docker images

# Ver logs de un contenedor
docker logs nombre-contenedor

# Detener un contenedor
docker stop nombre-contenedor

# Eliminar un contenedor
docker rm nombre-contenedor

# Reconstruir imagen después de cambios
docker build -t nombre-imagen .

# Reiniciar Nginx
sudo systemctl reload nginx

# Verificar config de Nginx
sudo nginx -t
```

---

##  Estructura de Archivos Relevante

```
/var/www/Projects/
└── mi-proyecto/
    ├── Controllers/
    ├── Models/
    ├── Views/
    ├── wwwroot/
    ├── MiProyecto.csproj
    ├── Program.cs
    └── Dockerfile          ← Creado en el Paso 1

/etc/nginx/
├── sites-available/
│   └── mi-dominio-com      ← Creado en el Paso 4
└── sites-enabled/
    └── mi-dominio-com      ← Symlink creado en el Paso 4
```

---

##  Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `open Dockerfile: no such file or directory` | El Dockerfile no existe o el comando se ejecutó desde la carpeta incorrecta | Verificar estar en la raíz del proyecto con `ls` |
| `Conflict. The container name is already in use` | Ya existe un contenedor con ese nombre | Usar un nombre diferente o eliminar el anterior con `docker rm nombre-contenedor` |
| `nginx: configuration file test failed` | Error de sintaxis en la config de Nginx | Revisar el archivo en `/etc/nginx/sites-available/` |
| Certbot no detecta el dominio | El archivo de Nginx no tiene el `server_name` correcto | Verificar que `server_name` coincida exactamente con el dominio |
| `curl` devuelve página de Nginx por defecto | El symlink no fue creado o Nginx no fue recargado | Ejecutar el `ln -s` y luego `sudo systemctl reload nginx` |

---

> **Renovación automática de certificado SSL**
> 
> Certbot instala automáticamente una tarea programada (cron/systemd timer) que renueva el certificado antes de que expire. Para verificarlo manualmente se puede ejecutar:
> ```bash
> sudo certbot renew --dry-run
> ```