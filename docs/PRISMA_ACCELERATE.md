# Prisma Accelerate Setup Guide

This project uses Prisma Accelerate for improved database performance and global distribution.

## Setup Steps

1. Create a Prisma Data Platform account at https://cloud.prisma.io

2. Create a new Prisma Accelerate project and get your API key

3. Configure your environment variables:
   - Copy `.env.example` to `.env`
   - Replace `YOUR_API_KEY` with your actual Prisma Accelerate API key
   - Add your direct database URL as `DIRECT_URL` for migrations

Example `.env`:
```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_URL="postgres://username:password@host:port/database"
```

4. Run database migrations:
```bash
pnpm prisma migrate deploy
```

5. Generate Prisma Client:
```bash
pnpm prisma generate
```

## Performance Optimizations

The schema has been optimized for Prisma Accelerate with:
- Appropriate indexes for frequently queried fields
- Optimized relations between models
- Efficient query patterns in the codebase

## Development Workflow

1. Make schema changes in `schema.prisma`
2. Create a migration:
```bash
pnpm prisma migrate dev --name your_migration_name
```
3. Deploy changes:
```bash
pnpm prisma migrate deploy
```

## Monitoring & Debugging

- View query performance in the Prisma Data Platform
- Check query logs in development using the configured logger
- Monitor database operations in production through Prisma Accelerate dashboard

## Security Notes

- Keep your API keys secure
- Don't commit `.env` file
- Use environment variables in production
- Regularly rotate API keys

## Additional Resources

- [Prisma Accelerate Documentation](https://www.prisma.io/docs/concepts/components/prisma-data-platform/accelerate)
- [Database Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
