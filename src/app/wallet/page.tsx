'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, WALLETS_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

interface Wallet {
  $id: string;
  balance: number;
}

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'add' | 'withdraw' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        WALLETS_COLLECTION_ID,
        [Query.equal('userId', user!.$id), Query.limit(1)]
      );
      if (response.documents.length > 0) {
        setWallet(response.documents[0] as unknown as Wallet);
      } else {
        // Create wallet if it doesn't exist
        const newWallet = await databases.createDocument(
          DATABASE_ID,
          WALLETS_COLLECTION_ID,
          ID.unique(),
          {
            userId: user!.$id,
            balance: 0,
          }
        );
        setWallet(newWallet as unknown as Wallet);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleTransaction = async () => {
    if (!amount || !action || !wallet) return;

    setIsProcessing(true);
    try {
      const transactionAmount = parseFloat(amount);
      let newBalance = wallet.balance;

      if (action === 'add') {
        newBalance += transactionAmount;
      } else if (action === 'withdraw') {
        if (transactionAmount > wallet.balance) {
          alert('Insufficient balance');
          setIsProcessing(false);
          return;
        }
        newBalance -= transactionAmount;
      }

      // Update wallet balance
      await databases.updateDocument(
        DATABASE_ID,
        WALLETS_COLLECTION_ID,
        wallet.$id,
        { balance: newBalance }
      );

      // Create transaction record
      await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user!.$id,
          type: action === 'add' ? 'deposit' : 'withdrawal',
          amount: transactionAmount,
          description: `${action === 'add' ? 'Added funds to' : 'Withdrew from'} wallet`,
          date: new Date().toISOString(),
        }
      );

      setWallet({ ...wallet, balance: newBalance });
      setAmount('');
      setAction(null);
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">← Dashboard</Link>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Wallet</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Wallet Balance */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Current Balance</h3>
              <div className="text-4xl font-bold text-green-600 mb-4">
                ₦{wallet?.balance.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        {!action && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">What would you like to do?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setAction('add')}
                  className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-medium">Add Funds</div>
                  <div className="text-sm opacity-90">Deposit money into your wallet</div>
                </button>
                <button
                  onClick={() => setAction('withdraw')}
                  className="bg-red-600 text-white p-6 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <div className="text-2xl mb-2">💸</div>
                  <div className="font-medium">Withdraw Funds</div>
                  <div className="text-sm opacity-90">Take money out of your wallet</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form */}
        {action && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {action === 'add' ? 'Add Funds' : 'Withdraw Funds'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="1000"
                  />
                </div>
                {action === 'withdraw' && wallet && parseFloat(amount || '0') > wallet.balance && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Insufficient balance. Your current balance is ₦{wallet.balance.toLocaleString()}.
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handleTransaction}
                    disabled={Boolean(!amount || isProcessing || (action === 'withdraw' && wallet && parseFloat(amount || '0') > wallet.balance))}
                    className={`px-4 py-2 rounded text-white ${
                      action === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? 'Processing...' : action === 'add' ? 'Add Funds' : 'Withdraw Funds'}
                  </button>
                  <button
                    onClick={() => {
                      setAction(null);
                      setAmount('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Limits Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Transaction Limits</h4>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside">
                  <li>Minimum transaction: ₦100</li>
                  <li>Withdrawals may have a 24-hour processing time</li>
                  <li>This is a demo wallet - no real money involved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}