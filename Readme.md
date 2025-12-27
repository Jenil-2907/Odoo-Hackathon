# 🛠️ Odoo Hackathon – Maintenance Management System

Backend system for managing **maintenance requests**, **equipment**, and **teams** with strict role-based logic.

---

## 🚀 Features

- Role-based users: **Manager**, **Technician**, **User**
- Secure authentication with password hashing
- Equipment linked to maintenance teams
- Maintenance requests:
  - Corrective & Preventive
  - Auto-assigned to correct team
  - Status tracking
- Enforced data integrity at backend level

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- mysql2
- bcryptjs
- dotenv

### Frontend
- React
- Vite

---

## 🔧 Maintenance Request Logic

- Each equipment is assigned to a maintenance team
- When a maintenance request is created:
  - System fetches `maintenance_team_id` from the equipment
  - Request is automatically assigned to that team
- Prevents incorrect or manual team selection
- Ensures consistency between equipment, team, and request

---

## ⚙️ Environment Variables
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hackathon_db
Create a `.env` file inside the `backend/` directory:
```
---

## ▶️ Run the Project

### Backend
```bash
cd backend
npm install
npm run dev
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```
---
