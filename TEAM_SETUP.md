# Team Setup Guide

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/NexTicket/EVMS.git
cd EVMS
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Get Database Access**
   - Ask project owner for Supabase project invite OR
   - Get the database credentials to update your `.env` file

5. **Generate Prisma Client**
```bash
npx prisma generate
```

6. **Sync Database Schema**
```bash
npx prisma db pull
```

7. **Start Development Server**
```bash
npm run dev
```

## Supabase Access

### Option 1: Project Invite (Preferred)
- Wait for Supabase project invitation email
- Access database via Supabase dashboard

### Option 2: Shared Credentials
Update your `.env` file with:
- `SUPABASE_URL`: [Get from project owner]
- `SUPABASE_ANON_KEY`: [Get from project owner]  
- `DATABASE_URL`: [Get from project owner]

## Making Database Changes

1. **Schema Changes**: Update `prisma/schema.prisma`
2. **Push to Database**: `npx prisma db push`
3. **Generate Client**: `npx prisma generate`

## Troubleshooting

- **Database connection issues**: Check your `.env` credentials
- **Prisma errors**: Run `npx prisma generate` after pulling latest changes
- **Port conflicts**: Change PORT in `.env` if 8000 is occupied
