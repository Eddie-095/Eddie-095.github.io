'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, TRANSACTIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface Transaction {
  $id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export default function TransactionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, filter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let queries = [Query.equal('userId', user!.$id), Query.orderDesc('date')];

      if (filter !== 'all') {
        queries.push(Query.equal('type', filter));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        queries
      );
      setTransactions(response.documents as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'investment':
        return '📈';
      case 'savings_deposit':
        return '🏦';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'savings_deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'investment':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Transaction History</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded ${filter === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded ${filter === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setFilter('investment')}
                className={`px-4 py-2 rounded ${filter === 'investment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Investments
              </button>
              <button
                onClick={() => setFilter('savings_deposit')}
                className={`px-4 py-2 rounded ${filter === 'savings_deposit' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Savings
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Transactions</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions found.</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.$id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="text-2xl mr-4">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{transactions.filter(t => t.type === 'deposit' || t.type === 'savings_deposit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Deposits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ₦{transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Withdrawals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₦{transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Investments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {transactions.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Transactions</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}