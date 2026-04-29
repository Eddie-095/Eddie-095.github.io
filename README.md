# Eddie's Savings

A full-stack savings and investment web application built with Next.js, TypeScript, Tailwind CSS, and Appwrite.

## Features

- User Authentication (Sign up / Login)
- Dashboard with balance, savings plans, and transactions
- Savings Plans with target amounts and auto-calculations
- Basic Investment tracking with mock returns
- Virtual Wallet system
- Transaction History
- Notifications (mock)
- Clean fintech UI

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Appwrite account (cloud.appwrite.io)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Eddie-095/Eddie-095.github.io.git
   cd Eddie-095.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Appwrite:
   - Create a new project at [Appwrite Cloud](https://cloud.appwrite.io)
   - Create a database
   - Create collections for users, savings_plans, transactions, investments, wallets
   - Set up authentication (email/password)

4. Configure environment variables:
   - Copy `.env.local` and fill in your Appwrite details:
     ```
     NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
     NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Collections

- **users**: User profiles
- **savings_plans**: Savings goals with name, target, duration
- **transactions**: All financial transactions
- **investments**: Investment records
- **wallets**: User wallet balances

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### GitHub Pages (Static Export)

For static deployment:

1. Update `next.config.ts` for static export
2. Build: `npm run build`
3. Deploy the `out/` folder

## Future Features

- Real payment integration (Flutterwave/Paystack)
- Auto-debit savings
- Referral system
- Interest calculation engine
- Admin dashboard
- Push notifications
- KYC verification
- AI financial assistant
- Crypto savings
- Group savings

## Contributing

Feel free to contribute by opening issues or pull requests.

## License

MIT
