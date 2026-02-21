# Chautari Backend

Backend API for Chautari journal app built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

3. Start the server:
```bash
npm run dev
```

## Default Admin Account

- Email: `admin@chautari.com`
- Password: `Admin@123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/users/me` - Get current user (requires auth)
- `PATCH /api/users/me` - Update current user (requires auth)

### Entries
- `GET /api/entries` - Get user's entries (requires auth)
- `POST /api/entries` - Create new entry (requires auth)
- `PATCH /api/entries/:id` - Update entry (requires auth)
- `DELETE /api/entries/:id` - Delete entry (requires auth)

### Admin
- `GET /api/admin/entries` - Get all entries (admin only)
- `GET /api/admin/stats` - Get statistics (admin only)
