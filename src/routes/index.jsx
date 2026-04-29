import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Homepage from '../pages/guest/Homepage'
import ProductList from '../pages/guest/ProductList'
import ProductDetail from '../pages/guest/ProductDetail'
import Login from '../pages/auth/Login'
import BuyerRegister from '../pages/buyer/BuyerRegister'
import SellerRegister from '../pages/seller/SellerRegister'

import BuyerDashboard from '../pages/buyer/BuyerDashboard'
import MyOrders from '../pages/buyer/MyOrders'
import Checkout from '../pages/buyer/Checkout'
import PaymentDetail from '../pages/buyer/PaymentDetail'

import SellerDashboard from '../pages/seller/SellerDashboard'
import AddProduct from '../pages/seller/AddProduct'
import MyProducts from '../pages/seller/MyProducts'
import EditProduct from '../pages/seller/EditProduct'
import SellerOrders from '../pages/seller/SellerOrders'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ApprovalQueue from '../pages/admin/ApprovalQueue'
import ManageCategories from '../pages/admin/ManageCategories'
import ReturResolution from '../pages/admin/ReturResolution'
import Transactions from '../pages/admin/Transactions'
import UsersList from '../pages/admin/UsersList'
import AdminComplaints from '../pages/admin/AdminComplaints'
import AdminBlog from '../pages/admin/AdminBlog'
import AddBlog from '../pages/admin/AddBlog'

import Chat from '../pages/shared/Chat'
import MyComplaints from '../pages/shared/MyComplaints'

// Info Pages
import AboutThriftly from '../pages/info/AboutThriftly'
import Careers from '../pages/info/Careers'
import Press from '../pages/info/Press'
import Blog from '../pages/info/Blog'
import BlogDetail from '../pages/guest/BlogDetail'
import HelpCenter from '../pages/info/HelpCenter'
import HowItWorks from '../pages/info/HowItWorks'
import LegalTerms from '../pages/info/LegalTerms'
import LegalPrivacy from '../pages/info/LegalPrivacy'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/buyer" element={<BuyerRegister />} />
      <Route path="/register/seller" element={<SellerRegister />} />

      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/checkout/:productId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success/:orderId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <PaymentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/add"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <MyProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <EditProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approval"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApprovalQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/retur"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReturResolution />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blog"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminBlog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blog/add"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddBlog />
          </ProtectedRoute>
        }
      />

      <Route path="/chat"
        element={
          <ProtectedRoute allowedRoles={['buyer', 'seller']}>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/complaints"
        element={
          <ProtectedRoute allowedRoles={['buyer', 'seller']}>
            <MyComplaints />
          </ProtectedRoute>
        }
      />

      {/* Info Routes */}
      <Route path="/about" element={<AboutThriftly />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<Press />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/terms" element={<LegalTerms />} />
      <Route path="/privacy" element={<LegalPrivacy />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
