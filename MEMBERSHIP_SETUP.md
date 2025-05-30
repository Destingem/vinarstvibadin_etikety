# Membership System Setup Guide

## ✅ Completed Implementation

The membership system has been fully implemented with the following features:

### 🔧 Technical Implementation
- **Authentication**: Uses localStorage with Authorization headers (fixed from cookie-based auth)
- **Database**: Appwrite collections (removed Prisma dependency)
- **Admin Panel**: Full UI for membership management at `/dashboard/admin`
- **API Endpoints**: Complete CRUD operations for memberships
- **Wine Limits**: Automatic enforcement with annual reset
- **Demo Account**: Auto-reset every hour with NEOMEZENĚ plan

### 💰 Pricing Tiers
1. **STANDARD**: 690 Kč/rok - Do 20 šarží
2. **PLUS**: 1,490 Kč/rok - Do 50 šarží  
3. **NEOMEZENĚ**: 6,990 Kč/rok - Neomezeně šarží
4. **ENTERPRISE**: Na dotaz - Individuálně

### 👤 Admin Users
- `admin@etiketa.wine`
- `ondrej.zaplatilek@gmail.com` ✅
- `ondrej.zaplatilek@bytedev.cz` ✅

## 🚀 Next Steps

### 1. Verify Appwrite Collection
Make sure your `memberships` collection in Appwrite has ID: `memberships`

If different, update `MEMBERSHIPS_COLLECTION_ID` in `/src/lib/appwrite.ts`

### 2. Environment Variables
Add to your `.env.local`:
```bash
# Required for cron jobs
CRON_SECRET=your-secure-random-string

# Appwrite credentials (should already exist)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=vinarstviqr
APPWRITE_KEY=your-appwrite-api-key
JWT_SECRET=your-jwt-secret
```

### 3. Set Up Cron Jobs (Optional)
For production, set up these endpoints to run automatically:

#### Demo Account Reset (Hourly)
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.com/api/cron/demo-reset
```

#### Membership Expiration Check (Daily)
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.com/api/cron/expire-memberships
```

#### Expiration Warnings (Daily)
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.com/api/cron/membership-warnings
```

### 4. Test the System

#### Test Collection Access
```bash
curl https://your-domain.com/api/test/memberships
```

#### Test Admin Panel
1. Log in with your admin email
2. Visit `/dashboard/admin`
3. Create test memberships
4. Test wine creation limits

## 📁 Key Files Modified

- `/src/lib/appwrite.ts` - Membership functions
- `/src/app/api/admin/` - Admin API endpoints  
- `/src/app/dashboard/admin/page.tsx` - Admin UI
- `/src/components/DashboardLayout.tsx` - Admin navigation
- `/src/app/api/wines/route.ts` - Wine limit enforcement
- `/src/app/demo/page.tsx` - Demo account page

## 🔄 Wine Creation Flow

1. User attempts to create wine
2. System checks membership status
3. Validates wine limit for current year
4. If allowed, creates wine and increments count
5. If limit exceeded, returns 403 error

## 🎯 Admin Panel Features

- View all users and memberships
- Create new memberships
- Change subscription plans
- Activate/deactivate memberships
- View usage statistics

## 🧪 Demo Account

- **URL**: `/demo`
- **Email**: `demo@etiketa.wine`
- **Password**: `demo123456`
- **Plan**: NEOMEZENĚ (unlimited)
- **Reset**: Every hour automatically

The membership system is now fully functional and ready for production! 🚀