# MongoDB Database Setup

This backend uses **MongoDB** as the primary database with **Mongoose** as the ODM (Object Document Mapper).

## Key Features

- ✅ **MongoDB**: Document-based NoSQL database
- ✅ **Mongoose**: ODM for MongoDB with schema validation
- ✅ **Migration System**: Using `migrate-mongo` for database migrations
- ✅ **Health Monitoring**: Check database status via `/api/health` endpoint

## Configuration

### Environment Variables

Add this to your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/asceta_mongodb
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/asceta_mongodb
```

### MongoDB Connection String Formats

- **Local MongoDB**: `mongodb://localhost:27017/asceta_mongodb`
- **MongoDB with Authentication**: `mongodb://username:password@localhost:27017/asceta_mongodb`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/asceta_mongodb`
- **MongoDB with Options**: `mongodb://localhost:27017/asceta_mongodb?authSource=admin`

## Usage

### Using Mongoose Models

Import and use Mongoose models directly:

```typescript
import { User } from "./models/User.model";
import { News } from "./models/News.model";
import { Event } from "./models/Event.model";
import { Page } from "./models/Page.model";

// Find users
const users = await User.find({ role: 'student' });

// Create a user
const user = new User({
  email: 'user@example.com',
  passwordHash: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.STUDENT,
});
await user.save();

// Find with pagination
const news = await News.find({ status: 'published' })
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(10);
```

## User Model Separation

The backend uses separate user models for different authentication systems:

- **User Model** (`users` collection): Main ASCETA authentication system
  - JWT-based authentication
  - Roles: student, lecturer, admin
  - Used by: News, Events, Pages (author/createdBy references)

- **AccaddUser Model** (`accadd-users` collection): ACCADD system authentication
  - Supabase-based authentication
  - Separate from main user system
  - Used by: ACCADD payment and auth controllers

## Migration System

The backend uses `migrate-mongo` for database migrations.

### Migration Commands

```bash
# Create a new migration
yarn migration:create

# Run pending migrations
yarn migration:up

# Rollback last migration
yarn migration:down

# Check migration status
yarn migration:status
```

### Migration Files

Migrations are stored in `src/migrations/mongodb/` directory. Each migration file exports `up()` and `down()` functions.

Example migration:
```javascript
module.exports = {
  async up(db, client) {
    // Migration logic here
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },

  async down(db, client) {
    // Rollback logic here
    await db.collection('users').dropIndex({ email: 1 });
  },
};
```

## Health Check

The `/api/health` endpoint returns the MongoDB connection status:

```json
{
  "status": "ok",
  "message": "ASCETA API is running",
  "database": {
    "mongodb": {
      "connected": true,
      "error": null,
      "readyState": 1
    }
  }
}
```

**Status values**:
- `status: "ok"` - MongoDB connected
- `status: "degraded"` - MongoDB disconnected (HTTP 503)

**MongoDB readyState values**:
- `0` - Disconnected
- `1` - Connected
- `2` - Connecting
- `3` - Disconnecting

## Collections

The following collections are used:

- **users**: Main ASCETA users (students, lecturers, admins)
- **accadd-users**: ACCADD system users
- **news**: News articles
- **events**: Events
- **pages**: Static pages
- **migrations**: Migration tracking (managed by migrate-mongo)

## Troubleshooting

### MongoDB Connection Fails

1. **Check MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl status mongod
   ```

2. **Verify connection string** in `.env` file

3. **Check MongoDB logs** for connection errors

4. **Server will still start** - The API will be available but database operations will fail

### Migration Issues

1. **Check migration status**: `yarn migration:status`
2. **Rollback if needed**: `yarn migration:down`
3. **Verify migration files** are in `src/migrations/mongodb/` directory

## Best Practices

1. **Always use Mongoose models** - Don't access MongoDB directly
2. **Use migrations** for schema changes and indexes
3. **Handle errors gracefully** - MongoDB operations can fail
4. **Use indexes** for frequently queried fields
5. **Validate data** using Mongoose schemas
