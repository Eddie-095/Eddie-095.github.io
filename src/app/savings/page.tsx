'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, SAVINGS_PLANS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

interface SavingsPlan {
  $id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  dailyDeposit: number;
}

export default function SavingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSavingsPlans();
    }
  }, [user]);

  const fetchSavingsPlans = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SAVINGS_PLANS_COLLECTION_ID,
        [Query.equal('userId', user!.$id)]
      );
      setSavingsPlans(response.documents as SavingsPlan[]);
    } catch (error) {
      console.error('Error fetching savings plans:', error);
    }
  };

  const calculateDailyDeposit = (targetAmount: number, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil(targetAmount / days);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const targetAmount = parseFloat(formData.targetAmount);
      const dailyDeposit = calculateDailyDeposit(targetAmount, formData.startDate, formData.endDate);

      await databases.createDocument(
        DATABASE_ID,
        SAVINGS_PLANS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user!.$id,
          name: formData.name,
          targetAmount,
          currentAmount: 0,
          startDate: formData.startDate,
          endDate: formData.endDate,
          dailyDeposit,
        }
      );

      setFormData({ name: '', targetAmount: '', startDate: '', endDate: '' });
      setShowCreateForm(false);
      fetchSavingsPlans();
    } catch (error) {
      console.error('Error creating savings plan:', error);
    } finally {
      setIsSubmitting(false);
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Savings Plans</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showCreateForm ? 'Cancel' : 'Create Plan'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Savings Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. Rent Savings"
                  />
                </div>
                <div>
                  <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                    Target Amount (₦)
                  </label>
                  <input
                    type="number"
                    id="targetAmount"
                    required
                    min="1"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="100000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                {formData.targetAmount && formData.startDate && formData.endDate && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-800">
                      Daily deposit needed: ₦{calculateDailyDeposit(parseFloat(formData.targetAmount), formData.startDate, formData.endDate).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Savings Plans List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Savings Plans</h3>
            {savingsPlans.length === 0 ? (
              <p className="text-gray-500">No savings plans yet. Create your first plan above.</p>
            ) : (
              <div className="space-y-4">
                {savingsPlans.map((plan) => (
                  <div key={plan.$id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium">{plan.name}</h4>
                      <span className={`px-2 py-1 rounded text-sm ${
                        plan.currentAmount >= plan.targetAmount ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {plan.currentAmount >= plan.targetAmount ? 'Completed' : 'Active'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>₦{plan.currentAmount.toLocaleString()} / ₦{plan.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((plan.currentAmount / plan.targetAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Daily deposit: ₦{plan.dailyDeposit.toLocaleString()}</span>
                      <span>Ends: {new Date(plan.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Deposit
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                        Edit
                      </button>
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