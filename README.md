This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend & Auth

- Backend APIs are implemented using Next.js Route Handlers under `app/api`.
- Database uses Postgres via Prisma (`prisma/schema.prisma`).
- Authentication is handled by Auth.js / NextAuth with a single admin account and Credentials Provider.
- Protected routes:
  - `/ele`, `/water`
  - `/api/bills`

For more details, see `docs/backend-and-deploy.md`.

### Local setup (backend)

1. Create a `.env` file with at least:

   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/home_calc"
   AUTH_SECRET="your-random-secret"
   ADMIN_USERNAME="your-admin"
   ADMIN_PASSWORD_HASH="bcrypt-hash-of-password"
   SINGLE_USER_ID="home-calc-single-user"
   ```

2. Run Prisma:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

3. Start dev server:

   ```bash
   pnpm dev
   ```

Then open `/login` to sign in before accessing `/ele` or `/water`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
