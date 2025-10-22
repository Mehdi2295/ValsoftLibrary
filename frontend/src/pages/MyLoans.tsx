import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Loan } from '@/types';
import toast from 'react-hot-toast';
import { BookMarked, Calendar, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

export default function MyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [returning, setReturning] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/loans/my-loans${params}`);
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    setReturning(loanId);
    try {
      await api.put(`/loans/return/${loanId}`);
      toast.success('Book returned successfully!');
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  const getStatusBadge = (loan: Loan) => {
    const statusStyles = {
      active: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[loan.status]}`}>
        {loan.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
        {loan.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
      </span>
    );
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const filteredLoans = loans;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-1 inline-flex">
        {(['all', 'active', 'overdue', 'returned'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Loans List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-24 h-32 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all'
              ? "You haven't borrowed any books yet"
              : `You don't have any ${filter} loans`}
          </p>
          <Link
            to="/books"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex gap-6">
                {/* Book Cover */}
                <Link
                  to={`/books/${loan.book_id}`}
                  className="flex-shrink-0 w-24 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group"
                >
                  {loan.cover_image ? (
                    <img
                      src={loan.cover_image}
                      alt={loan.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-primary-400 group-hover:scale-110 transition" />
                  )}
                </Link>

                {/* Loan Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        to={`/books/${loan.book_id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition"
                      >
                        {loan.title}
                      </Link>
                      <p className="text-gray-600">{loan.author}</p>
                    </div>
                    {getStatusBadge(loan)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Borrowed: {formatDate(loan.borrowed_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {formatDate(loan.due_date)}</span>
                    </div>
                    {loan.status === 'active' && (
                      <div className="flex items-center text-sm font-medium">
                        <span className={differenceInDays(new Date(loan.due_date), new Date()) < 3 ? 'text-red-600' : 'text-gray-600'}>
                          {getDaysRemaining(loan.due_date)}
                        </span>
                      </div>
                    )}
                    {loan.returned_at && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span>Returned: {formatDate(loan.returned_at)}</span>
                      </div>
                    )}
                  </div>

                  {loan.status !== 'returned' && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleReturn(loan.id)}
                        disabled={returning === loan.id}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {returning === loan.id ? 'Returning...' : 'Return Book'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

