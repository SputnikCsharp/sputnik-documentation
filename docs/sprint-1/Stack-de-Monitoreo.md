# Stack de Monitoreo: Prometheus + Grafana + Node Exporter

## Descripción General

Este documento describe el proceso de instalación y configuración de un stack de monitoreo sobre un servidor VPS con Docker ya en producción. El objetivo es agregar capacidades de observabilidad sin interrumpir los servicios existentes (MySQL, PostgreSQL).

El flujo de datos es el siguiente:

```
Grafana  <──  Prometheus  <──  Node Exporter
(puerto 3000)  (puerto 9090)    (puerto 9100)
```

- **Node Exporter** expone las métricas del servidor (CPU, RAM, disco, red)
- **Prometheus** las recolecta cada 5 segundos (scraping)
- **Grafana** se conecta a Prometheus y las visualiza en dashboards

---

## Requisitos Previos

- Servidor VPS con Docker instalado
- Acceso SSH al servidor (via Termius u otro cliente)
- Puertos `3000`, `9090` y `9100` disponibles

---

## Estructura de Archivos

Antes de desplegar, se debe crear la siguiente estructura en el servidor:

```
monitoring/
├── docker-compose.yml
└── prometheus/
    └── prometheus.yml
```

---

## Archivos de Configuración

### docker-compose.yml

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-storage:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: always
    ports:
      - "9100:9100"
    networks:
      - monitoring

networks:
  monitoring:

volumes:
  grafana-storage:
  prometheus-storage:
```

### prometheus.yml

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['prometheus:9090']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

## Pasos de Despliegue

### 1. Verificar el estado actual del servidor

Antes de subir cualquier archivo, verificar los contenedores y puertos en uso:

```bash
docker ps
docker network ls
```

### 2. Crear la estructura de carpetas en el servidor

```bash
mkdir -p ~/monitoring/prometheus
```

### 3. Subir los archivos

Desde Termius usar el panel SFTP para subir:

- `docker-compose.yml` → `~/monitoring/`
- `prometheus.yml` → `~/monitoring/prometheus/`

O desde terminal con SCP:

```bash
scp docker-compose.yml root@ip-del-servidor:~/monitoring/
scp prometheus.yml root@ip-del-servidor:~/monitoring/prometheus/
```

### 4. Levantar el stack

```bash
cd ~/monitoring
docker compose up -d
```

### 5. Verificar que todo esté corriendo

```bash
docker ps
```

Se deben ver los tres contenedores nuevos junto a los existentes (MySQL, PostgreSQL):

```
prometheus      Up
grafana         Up
node-exporter   Up
```

---

## Puertos del Stack

| Servicio | Puerto | Función |
|---|---|---|
| Grafana | 3000 | Visualización de dashboards |
| Prometheus | 9090 | Recolección y consulta de métricas |
| Node Exporter | 9100 | Exposición de métricas del servidor |

---

## Acceso a Grafana

Una vez desplegado, acceder desde el navegador:

```
http://ip-del-servidor:3000
```

Credenciales por defecto:
- **Usuario:** `admin`
- **Contraseña:** `admin`

:::warning
Se recomienda cambiar la contraseña por defecto en el primer inicio de sesión.
:::

---

## Rollback en caso de problemas

Si algo falla, bajar únicamente el stack de monitoreo sin afectar los demás servicios:

```bash
cd ~/monitoring
docker compose down
```

Los contenedores de MySQL y PostgreSQL **no se ven afectados** ya que corren en redes independientes.