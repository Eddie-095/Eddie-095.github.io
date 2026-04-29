'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, SAVINGS_PLANS_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID, WALLETS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface SavingsPlan {
  $id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
}

interface Transaction {
  $id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface Wallet {
  balance: number;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch savings plans
      const plansResponse = await databases.listDocuments(
        DATABASE_ID,
        SAVINGS_PLANS_COLLECTION_ID,
        [Query.equal('userId', user!.$id), Query.limit(5)]
      );
      setSavingsPlans(plansResponse.documents as SavingsPlan[]);

      // Calculate total savings
      const total = plansResponse.documents.reduce((sum: number, plan: any) => sum + plan.currentAmount, 0);
      setTotalSavings(total);

      // Fetch recent transactions
      const transactionsResponse = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [Query.equal('userId', user!.$id), Query.orderDesc('date'), Query.limit(5)]
      );
      setRecentTransactions(transactionsResponse.documents as Transaction[]);

      // Fetch wallet balance
      const walletResponse = await databases.listDocuments(
        DATABASE_ID,
        WALLETS_COLLECTION_ID,
        [Query.equal('userId', user!.$id), Query.limit(1)]
      );
      if (walletResponse.documents.length > 0) {
        setWalletBalance(walletResponse.documents[0].balance);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-blue text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <header className="bg-white card-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-blue">Eddie's Savings</h1>
                <p className="text-sm text-dark-gray">{getGreeting()}, {user.name.split(' ')[0]} 👋</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Total Balance Card */}
        <div className="mb-8">
          <div className="glassmorphism rounded-2xl p-8 card-shadow card-hover">
            <div className="text-center">
              <p className="text-dark-gray text-lg mb-2">Total Balance</p>
              <h2 className="text-5xl font-bold text-secondary-blue mb-4">
                ₦{(walletBalance + totalSavings).toLocaleString()}
              </h2>
              <div className="flex justify-center space-x-8 text-sm">
                <div>
                  <p className="text-dark-gray">Wallet</p>
                  <p className="font-semibold text-primary">₦{walletBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-dark-gray">Savings</p>
                  <p className="font-semibold text-accent">₦{totalSavings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-dark-gray">Investments</p>
                  <p className="font-semibold text-secondary-blue">₦0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Savings Progress */}
          <div className="bg-white rounded-2xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-secondary-blue">Savings Goals</h3>
              <Link href="/savings" className="text-primary hover:text-primary/80 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {savingsPlans.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-dark-gray mb-4">No savings goals yet</p>
                  <Link href="/savings" className="gradient-bg text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
                    Create Your First Goal
                  </Link>
                </div>
              ) : (
                savingsPlans.slice(0, 3).map((plan) => (
                  <div key={plan.$id} className="bg-light rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-secondary-blue">{plan.name}</h4>
                        <p className="text-sm text-dark-gray">
                          ₦{plan.currentAmount.toLocaleString()} / ₦{plan.targetAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {Math.round((plan.currentAmount / plan.targetAmount) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="gradient-bg h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((plan.currentAmount / plan.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-secondary-blue">Recent Activity</h3>
              <Link href="/transactions" className="text-primary hover:text-primary/80 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-dark-gray">No transactions yet</p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.$id} className="flex items-center justify-between p-3 bg-light rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100' :
                        transaction.type === 'withdrawal' ? 'bg-red-100' :
                        transaction.type === 'investment' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-lg">
                          {transaction.type === 'deposit' ? '💰' :
                           transaction.type === 'withdrawal' ? '💸' :
                           transaction.type === 'investment' ? '📈' : '💳'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-blue">{transaction.description}</p>
                        <p className="text-sm text-dark-gray">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'deposit' || transaction.type === 'savings_deposit' ? 'text-green-600' :
                      transaction.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 card-shadow card-hover">
          <h3 className="text-xl font-semibold text-secondary-blue mb-6 text-center">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/savings" className="gradient-bg text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="text-3xl mb-3">💰</div>
              <div className="font-semibold">Save Money</div>
            </Link>
            <Link href="/investments" className="bg-secondary-blue text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="text-3xl mb-3">📈</div>
              <div className="font-semibold">Invest</div>
            </Link>
            <Link href="/wallet" className="bg-accent text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="text-3xl mb-3">👛</div>
              <div className="font-semibold">Add Funds</div>
            </Link>
            <Link href="/transactions" className="bg-primary text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-semibold">History</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}