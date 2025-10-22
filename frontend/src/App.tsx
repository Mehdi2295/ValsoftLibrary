import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Books from '@/pages/Books';
import BookDetail from '@/pages/BookDetail';
import BookForm from '@/pages/BookForm';
import MyLoans from '@/pages/MyLoans';
import Dashboard from '@/pages/Dashboard';
import AIFeatures from '@/pages/AIFeatures';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && (user?.role === 'admin' || user?.role === 'librarian') ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Layout>
                <Books />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <BookDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/books/new"
          element={
            <AdminRoute>
              <Layout>
                <BookForm />
              </Layout>
            </AdminRoute>
          }
        />
        
        <Route
          path="/books/:id/edit"
          element={
            <AdminRoute>
              <Layout>
                <BookForm />
              </Layout>
            </AdminRoute>
          }
        />
        
        <Route
          path="/my-loans"
          element={
            <ProtectedRoute>
              <Layout>
                <MyLoans />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </AdminRoute>
          }
        />
        
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <Layout>
                <AIFeatures />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

