import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const USERS_COLLECTION_ID = 'users';
export const SAVINGS_PLANS_COLLECTION_ID = 'savings_plans';
export const TRANSACTIONS_COLLECTION_ID = 'transactions';
export const INVESTMENTS_COLLECTION_ID = 'investments';
export const WALLETS_COLLECTION_ID = 'wallets';