'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, INVESTMENTS_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

interface Investment {
  $id: string;
  type: string;
  amount: number;
  returnRate: number;
  startDate: string;
  currentValue: number;
}

const investmentOptions = [
  { type: 'Agriculture', returnRate: 10, description: 'Sustainable farming investments' },
  { type: 'Tech', returnRate: 15, description: 'Technology sector investments' },
];

export default function InvestmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedOption, setSelectedOption] = useState<typeof investmentOptions[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        INVESTMENTS_COLLECTION_ID,
        [Query.equal('userId', user!.$id)]
      );
      setInvestments(response.documents as Investment[]);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const handleInvest = async () => {
    if (!selectedOption || !amount) return;

    setIsInvesting(true);
    try {
      const investmentAmount = parseFloat(amount);
      const startDate = new Date().toISOString();

      // Create investment record
      await databases.createDocument(
        DATABASE_ID,
        INVESTMENTS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user!.$id,
          type: selectedOption.type,
          amount: investmentAmount,
          returnRate: selectedOption.returnRate,
          startDate,
          currentValue: investmentAmount, // Initial value
        }
      );

      // Create transaction record
      await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user!.$id,
          type: 'investment',
          amount: investmentAmount,
          description: `Investment in ${selectedOption.type}`,
          date: startDate,
        }
      );

      setSelectedOption(null);
      setAmount('');
      fetchInvestments();
    } catch (error) {
      console.error('Error creating investment:', error);
    } finally {
      setIsInvesting(false);
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Investments</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Investment Options */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Investment Options</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {investmentOptions.map((option) => (
                <div
                  key={option.type}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOption?.type === option.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <h4 className="font-medium text-lg">{option.type}</h4>
                  <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                  <div className="text-green-600 font-semibold">{option.returnRate}% return</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Form */}
        {selectedOption && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Invest in {selectedOption.type}
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Investment Amount (₦)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    min="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10000"
                  />
                </div>
                {amount && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800">
                      Expected return: ₦{(parseFloat(amount) * (1 + selectedOption.returnRate / 100)).toLocaleString()} ({selectedOption.returnRate}% growth)
                    </p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handleInvest}
                    disabled={!amount || isInvesting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isInvesting ? 'Investing...' : 'Invest Now'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOption(null);
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

        {/* Your Investments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Investments</h3>
            {investments.length === 0 ? (
              <p className="text-gray-500">No investments yet. Choose an option above to get started.</p>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.$id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{investment.type} Investment</h4>
                        <p className="text-sm text-gray-500">
                          Invested: ₦{investment.amount.toLocaleString()} | Return: {investment.returnRate}%
                        </p>
                        <p className="text-sm text-gray-500">
                          Started: {new Date(investment.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ₦{investment.currentValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Current Value
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}