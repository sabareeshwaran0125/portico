# Portico

Portico (formerly SocietyHub) is a comprehensive Apartment Management System that helps manage residents, bills, visitors, and more.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Spring Boot + Java
- **Database**: MySQL (Prod) / H2 (Dev)

## Features
- **Admin Dashboard**: Manage residents, security guards, flats, bills, notices, and complaints.
- **Resident Portal**: View maintenance bills, pay online via Razorpay, pre-approve visitors, and view visitor history.
- **Security Guard Portal**: Log walk-in visitors and track entries/exits of approved visitors.
- **Role-Based Authentication**: Secure JWT-based auth separating Admin, Resident, and Guard roles.
- **Notifications**: Real-time polling notifications for resident walk-in approvals.

## Local Setup

### 1. Database Setup (MySQL)
Create a MySQL database named `portico` (if running in prod profile):
```sql
CREATE DATABASE portico;
```

### 2. Backend Setup
1. Navigate to the `backend` directory.
2. The application uses H2 in-memory database by default in `dev` profile. 
3. **Razorpay Payments**: 
   - Test mode is enabled by default with a local mock flow (`rzp_test_YOUR_KEY_HERE`).
   - To use live test mode, open `backend/src/main/resources/application.yml` and replace the placeholder `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with your real test keys.
3. To run in `prod` profile with MySQL, set the following environment variables:
   - `DB_URL=jdbc:mysql://localhost:3306/portico`
   - `DB_USERNAME=your_username`
   - `DB_PASSWORD=your_password`
   - `JWT_SECRET=your_secure_random_jwt_secret_key`
   - `RAZORPAY_KEY_ID=your_razorpay_key`
   - `RAZORPAY_KEY_SECRET=your_razorpay_secret`
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your backend URL and Razorpay Key ID (if testing real payments).
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Demo Credentials
(The database is seeded with these users in dev mode)
- **Admin**: admin@portico.com / admin123
- **Resident**: resident@portico.com / resident123
- **Security Guard**: guard@portico.com / guard123
