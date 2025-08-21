# Safety Week Registration System

A Laravel + React application for managing Safety Week event registrations.

## Features

- **User Registration Interface**: Clean, modern UI for users to view available dates and time slots
- **Admin Management**: Admin panel to manage dates, times, and available slots
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Shows available slots and warns when slots are running low

## Quick Start

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL/PostgreSQL

### Installation

1. Clone the repository
2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Copy environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure your database in `.env`

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Seed the database with test data:
   ```bash
   php artisan db:seed
   ```

8. Build the frontend:
   ```bash
   npm run build
   ```

9. Start the development server:
   ```bash
   php artisan serve
   ```

## Usage

### For Users
- Visit `/` to see available registration dates and times
- Browse through available slots
- Click "Register Now" to select a slot (backend implementation pending)

### For Admins
- Login and visit `/admin` to manage:
  - Registration dates
  - Time slots
  - Available capacity for each slot

## Database Structure

- **RegisterDate**: Available dates for registration
- **RegisterTime**: Time slots for each date
- **RegisterSlot**: Individual slots with capacity limits

## Routes

- `/` - User registration interface (main page)
- `/dashboard` - User dashboard
- `/admin` - Admin panel (requires authentication)
- `/login` - Authentication

## Frontend Components

- **UserIndex**: Main registration page showing available dates/times
- **AppSidebar**: Navigation sidebar with registration link
- **AppHeader**: Top navigation with registration access

## Next Steps

The following features are planned for future implementation:
- User registration for specific slots
- Email confirmations
- Waitlist functionality
- Reporting and analytics
- User profile management

## Development

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Laravel 11 + Inertia.js
- Database: Eloquent ORM with relationships
- Styling: Modern UI components with shadcn/ui
