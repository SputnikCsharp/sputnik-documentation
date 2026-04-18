# Cómo Actualizar un Proyecto Ya Desplegado en el Servidor

> **Propósito:** Guía de referencia para cuando ya tienes un proyecto corriendo en el servidor con Docker + Nginx y necesitas aplicar nuevos cambios desde el repositorio.

> **Prerequisito:** El proyecto ya está desplegado y funcionando. Si aún no lo has hecho, revisar primero la guía de despliegue inicial.

---

##  ¿Qué pasa por debajo?

Cuando actualizas un proyecto, Docker **no actualiza el contenedor en caliente**. Lo que hay que hacer es:

1. Traer los cambios nuevos del repo
2. Construir una nueva imagen con esos cambios
3. Eliminar el contenedor viejo
4. Levantar un contenedor nuevo con la imagen actualizada

Nginx **no se toca** — sigue apuntando al mismo puerto de siempre.

---

## Paso 1: Ir a la carpeta del proyecto

```bash
cd /var/www/Projects/mi-proyecto
```

---

## Paso 2: Traer los cambios del repositorio

```bash
git pull
```

Deberías ver un resumen de los archivos modificados. Si dice `Already up to date`, no hay cambios nuevos que aplicar.

---

## Paso 3: Reconstruir la imagen Docker

```bash
docker build -t nombre-imagen .
```

> Docker es inteligente — reutiliza caché para las capas que no cambiaron (como el `dotnet restore`), así que este build será más rápido que el primero.

Verificar que la nueva imagen existe:

```bash
docker images
```

---

## Paso 4: Detener y eliminar el contenedor viejo

```bash
docker stop nombre-contenedor
docker rm nombre-contenedor
```

El sitio estará caído brevemente en este punto — por eso conviene tener listo el siguiente comando antes de ejecutar este.

---

##  Paso 5: Levantar el nuevo contenedor

> ** ADVERTENCIA — El error más común al actualizar**
>
> Si tu proyecto usa base de datos, **siempre** hay que pasar las variables de entorno con `-e` al momento de levantar el contenedor. Un error frecuente es olvidarlas, el contenedor arranca pero falla al conectarse a la base de datos, y toca volver a hacer `stop` + `rm` + `run` — generando tiempo de inactividad innecesario.
>
> **Regla de oro: tener el comando completo listo ANTES de hacer el `docker stop`.**

### Si el proyecto usa base de datos:

```bash
docker run -d -p 8082:8080 \
  -e ConnectionStrings__DefaultConnection="Server=IP_DEL_SERVIDOR;Database=nombre_db;User=usuario;Password=contraseña;" \
  --name nombre-contenedor \
  nombre-imagen
```

### Si el proyecto NO usa base de datos:

```bash
docker run -d -p 8082:8080 --name nombre-contenedor nombre-imagen
```

---

## Paso 6: Verificar que todo quedó bien

Confirmar que el contenedor está corriendo:

```bash
docker ps
```

Probar que responde:

```bash
curl http://localhost:8082
```

Y si tienes dominio configurado:

```bash
curl -I https://mi-dominio.com
```

---

## Resumen: Los 5 comandos del proceso

```bash
# 1. Ir al proyecto
cd /var/www/Projects/mi-proyecto

# 2. Traer cambios
git pull

# 3. Reconstruir imagen
docker build -t nombre-imagen .

# 4. Eliminar contenedor viejo
docker stop nombre-contenedor && docker rm nombre-contenedor

# 5. Levantar contenedor nuevo (con variables de entorno si aplica)
docker run -d -p 8082:8080 \
  -e ConnectionStrings__DefaultConnection="..." \
  --name nombre-contenedor \
  nombre-imagen
```

---

> **Nginx y SSL no se tocan.** El reverse proxy sigue apuntando al mismo puerto, y el certificado SSL sigue vigente. El sitio vuelve a estar disponible en cuanto el nuevo contenedor arranca.