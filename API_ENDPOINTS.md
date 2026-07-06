# FlowPay API - Endpoints completos

Base URL:
- `http://localhost:3000/api`

> Ajusta el puerto si tu servidor usa otro valor en `PORT`.

---

## Salud del servidor

### GET /api/health
- URL completa: `http://localhost:3000/api/health`
- Método: `GET`
- Cuerpo: ninguno

Respuesta esperada:
```json
{
  "estado": "servidor corriendo",
  "proyecto": "FlowPay",
  "fecha_servidor": "2026-07-02T...",
  "cesar": "alejandro"
}
```

---

## Autenticación

### POST /api/auth/registrar
- URL completa: `http://localhost:3000/api/auth/registrar`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "nombre": "Cesar Alejandro",
  "correo": "usuario@example.com",
  "contrasena": "MiPassword123"
}
```

### POST /api/auth/login
- URL completa: `http://localhost:3000/api/auth/login`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "correo": "usuario@example.com",
  "contrasena": "MiPassword123"
}
```

### POST /api/auth/google
- URL completa: `http://localhost:3000/api/auth/google`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "idToken": "TOKEN_DE_GOOGLE_ID"
}
```

### POST /api/auth/forgot-password
- URL completa: `http://localhost:3000/api/auth/forgot-password`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "correo": "usuario@example.com"
}
```

### POST /api/auth/reset-password
- URL completa: `http://localhost:3000/api/auth/reset-password`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "token": "TOKEN_RECUPERACION_GENERADO",
  "nuevaContrasena": "NuevaPassword123"
}
```

---

## Jornada

### POST /api/jornada/abrir
- URL completa: `http://localhost:3000/api/jornada/abrir`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "usuario_id": 1,
  "monto_inversion": 100.50
}
```

### GET /api/jornada/estado/:usuario_id
- URL completa: `http://localhost:3000/api/jornada/estado/1`
- Método: `GET`
- Cuerpo: ninguno

### PUT /api/jornada/cerrar
- URL completa: `http://localhost:3000/api/jornada/cerrar`
- Método: `PUT`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "jornada_id": 123
}
```

---

## Producto

### POST /api/producto/crear
- URL completa: `http://localhost:3000/api/producto/crear`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "usuario_id": 1,
  "nombre": "Bebida Energética",
  "precio": 45.00
}
```

### GET /api/producto/catalogo/:usuario_id
- URL completa: `http://localhost:3000/api/producto/catalogo/1`
- Método: `GET`
- Cuerpo: ninguno

### PUT /api/producto/actualizar-estado
- URL completa: `http://localhost:3000/api/producto/actualizar-estado`
- Método: `PUT`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "id": 5,
  "activo": 0
}
```

> `activo` debe ser `1` para activar o `0` para desactivar.

---

## Venta

### POST /api/venta/registrar
- URL completa: `http://localhost:3000/api/venta/registrar`
- Método: `POST`
- Content-Type: `multipart/form-data`

Campos del formulario:
- `jornada_id`: número
- `total`: número
- `tipo_pago`: texto
- `detalles`: JSON como cadena
- `imagen`: archivo opcional (comprobante)

Ejemplo de `detalles` como string:
```json
[
  {
    "producto_id": 5,
    "cantidad": 2,
    "precio": 45.00
  },
  {
    "producto_id": 8,
    "cantidad": 1,
    "precio": 30.00
  }
]
```

Ejemplo de datos en Postman usando `form-data`:
- `jornada_id`: `12`
- `total`: `120.00`
- `tipo_pago`: `efectivo`
- `detalles`: `[{
  "producto_id": 5,
  "cantidad": 2,
  "precio": 45.00
},
{
  "producto_id": 8,
  "cantidad": 1,
  "precio": 30.00
}]`
- `imagen`: archivo (opcional)

---

## Encuesta

### POST /api/encuesta/registrar
- URL completa: `http://localhost:3000/api/encuesta/registrar`
- Método: `POST`
- Content-Type: `application/json`

Cuerpo JSON:
```json
{
  "jornada_id": 12,
  "puntuacion_app": 5,
  "comentarios": "Excelente servicio"
}
```

> `comentarios` es opcional.

---

## Reporte

### GET /api/reporte/semanal/:usuario_id
- URL completa: `http://localhost:3000/api/reporte/semanal/1`
- Método: `GET`
- Cuerpo: ninguno

> Este endpoint sólo devuelve datos si la encuesta de satisfacción ya fue contestada y el historial fue desbloqueado.
