import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Book } from '@/types';
import toast from 'react-hot-toast';
import { Sparkles, Search, BookOpen, Star, TrendingUp } from 'lucide-react';

export default function AIFeatures() {
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/ai/recommendations');
      setRecommendations(response.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to load recommendations');
      }
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await api.get(`/ai/smart-search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        toast.info('No results found. Try different keywords.');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center mb-4">
          <Sparkles className="h-10 w-10 mr-3" />
          <h1 className="text-4xl font-bold">AI-Powered Features</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Discover your next favorite book with our intelligent recommendation system and smart search.
        </p>
      </div>

      {/* Smart Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Search className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Search</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Our AI-powered search understands context and finds relevant books based on meaning, not just exact matches.
        </p>
        
        <form onSubmit={handleSmartSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try: 'books about space exploration' or 'mystery with detective'"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {book.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{book.author}</p>
                      {book.averageRating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs text-gray-500">
                            {book.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Based on your reading history and preferences, we think you'll enjoy these books.
        </p>

        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start borrowing and rating books to get personalized recommendations!
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-gray-50 rounded-xl hover:shadow-lg transition overflow-hidden group"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-24 w-24 text-purple-400 group-hover:scale-110 transition" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>
                  
                  {book.averageRating !== null && book.averageRating !== undefined && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{book.averageRating.toFixed(1)}</span>
                      <span className="ml-1 text-xs">({book.reviewCount})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      book.available_copies > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                    </span>
                    {book.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {book.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
          <p className="text-gray-700 text-sm">
            Semantic search that understands context and finds books based on meaning, not just keywords.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <p className="text-gray-700 text-sm">
            Get personalized book suggestions based on your reading history and preferences.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Auto-Categorization</h3>
          <p className="text-gray-700 text-sm">
            AI automatically suggests categories when adding new books based on title and description.
          </p>
        </div>
      </div>
    </div>
  );
}

