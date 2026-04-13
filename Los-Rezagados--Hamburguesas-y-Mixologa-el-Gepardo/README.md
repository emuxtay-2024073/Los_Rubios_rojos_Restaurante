# Sistema de Gestión de Restaurantes

## Nota
Este proyecto fue desarrollado con fines didácticos como parte del curso de **Taller de IN6AM de la jornada Matiutina.**.  
Implementa una arquitectura basada en microservicios independientes, aplicando buenas prácticas de seguridad, autenticación y control de versiones.

---

## Descripción General

El **Sistema de Gestión de Restaurantes** es una aplicación backend basada en una arquitectura de microservicios, diseñada para administrar usuarios, autenticación segura, restaurantes, menús y operaciones asociadas.

El sistema combina tecnologías modernas como **ASP.NET Core (.NET 8)** para el servicio de autenticación y **Node.js** para los servicios de negocio, permitiendo una solución escalable, mantenible y con una clara separación de responsabilidades.

---

## Arquitectura del Sistema

El sistema está dividido en microservicios independientes, cada uno responsable de una funcionalidad específica.

### Microservicios

### Authentication Service (.NET)
- Registro de usuarios
- Inicio de sesión
- Generación y validación de tokens JWT
- Verificación de correo electrónico
- Recuperación y restablecimiento de contraseña

### Restaurant Service (Node.js)
- Gestión de restaurantes
- Creación y actualización de información del restaurante

### Menu Service (Node.js)
- Gestión de productos del menú
- Asociación de menús a restaurantes

### Banking Service (Node.js – opcional)
- Operaciones financieras internas
- Manejo de transacciones (según implementación)

---

## Tecnologías Utilizadas

### Backend
- ASP.NET Core 8 (.NET 8)
- Node.js
- Express
- MongoDB
- Entity Framework Core
- JWT (JSON Web Token)
- BCrypt (encriptación de contraseñas)

### Herramientas de Desarrollo
- Git
- GitHub
- Postman
- Visual Studio
- Visual Studio Code

---
## Rutas Principales

### Públicas
| Método | Ruta                          | Descripción                     |
| ------ | ----------------------------- | ------------------------------- |
| POST   | /api/v1/auth/register         | Registro de usuario             |
| POST   | /api/v1/auth/login            | Inicio de sesión y obtención JWT |
| POST   | /api/v1/auth/verify-email     | Verificación de correo          |
| POST   | /api/v1/auth/forgot-password  | Solicitud de recuperación       |
| POST   | /api/v1/auth/reset-password   | Restablecer contraseña          |

---

### Protegidas (requieren JWT)
| Método | Ruta                          | Descripción                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | /api/v1/auth/profile          | Obtener perfil del usuario     |
| GET    | /api/restaurants              | Listar restaurantes            |
| POST   | /api/restaurants              | Crear restaurante              |
| PUT    | /api/restaurants/{id}         | Actualizar restaurante         |
| DELETE | /api/restaurants/{id}         | Eliminar restaurante           |
| GET    | /api/menu                     | Listar productos del menú      |
| POST   | /api/menu                     | Crear producto del menú        |
| PUT    | /api/menu/{id}                | Actualizar producto del menú   |
| DELETE | /api/menu/{id}                | Eliminar producto del menú     |

---

## Estructura General del Proyecto

Sistema-Restaurantes  
│  
├── authentication-service  
│   ├── Controllers   – manejo de endpoints de autenticación  
│   ├── Models        – entidades y modelos de usuario  
│   ├── Services      – lógica de autenticación y JWT  
│   ├── Middleware    – validaciones y seguridad  
│   └── Program.cs / appsettings.json  
│  
├── restaurant-service  
│   ├── Controllers   – gestión de restaurantes  
│   ├── Models        – esquemas de restaurantes  
│   ├── Routes        – definición de rutas  
│   ├── Services      – lógica de negocio  
│   └── app.js / server.js  
│  
├── menu-service  
│   ├── Controllers   – gestión del menú  
│   ├── Models        – esquemas de productos  
│   ├── Routes        – rutas del menú  
│   ├── Services      – lógica de negocio  
│   └── app.js / server.js  
│  
├── banking-service (opcional)  
│   ├── Controllers   – operaciones financieras  
│   ├── Models        – transacciones  
│   ├── Services      – lógica financiera  
│   └── app.js / server.js  
│  
└── README.md
---

## Estado del Proyecto
- Arquitectura base implementada  
- Autenticación JWT funcional  
- Separación por microservicios  
- Conexión con MongoDB  
- Control de versiones mediante Git  

---

## Autores

Proyecto desarrollado como parte del curso de **Taller de IN6AM de la jornada Matiutina**.

**Equipo de desarrollo:**  
Los Rezagados
