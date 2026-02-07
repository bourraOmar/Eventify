# Admin User Setup

## Default Admin Credentials

The application automatically creates a default admin user on first startup.

### Credentials:
- **Email:** `admin@eventify.com`
- **Password:** `Admin@123`

⚠️ **IMPORTANT:** Please change these credentials after your first login!

## How It Works

The `DatabaseSeedService` runs when the application starts and:
1. Checks if an admin user with the configured email exists
2. If not, creates a new admin user with the credentials from `.env`
3. Logs the credentials to the console for reference

## Customizing Admin Credentials

You can customize the admin credentials by editing the `.env` file:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

After changing these values, you need to:
1. Delete the existing admin user from the database (if any)
2. Restart the application

## Logging In as Admin

1. Go to `http://localhost:3000/login`
2. Enter the admin email and password
3. You will be redirected to the admin dashboard at `/dashboard/admin`

## Admin Capabilities

As an admin, you can:
- View and manage all events
- Create, edit, and delete events
- View all reservations
- Approve or reject reservation requests
- View user statistics

## Security Notes

- The default password is intentionally simple for development
- **Always change the default password in production**
- Use a strong password with:
  - At least 12 characters
  - Mix of uppercase and lowercase letters
  - Numbers and special characters
- Consider using environment variables for production credentials
- Never commit real credentials to version control
