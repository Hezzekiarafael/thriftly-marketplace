import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'
import PageSkeleton from '../components/common/PageSkeleton'
import AdminPageSkeleton from '../components/common/AdminPageSkeleton'
import BuyerDashboardSkeleton from '../components/common/BuyerDashboardSkeleton'
import SellerDashboardSkeleton from '../components/common/SellerDashboardSkeleton'
import ProfileSkeleton from '../components/common/ProfileSkeleton'

// ── Eager load: hanya halaman publik utama ────────────────────────────────────
import Homepage from '../pages/guest/Homepage'

// ── Lazy load: semua halaman lainnya ──────────────────────────────────────────
const ProductList = lazy(() => import('../pages/guest/ProductList'))
const ProductDetail = lazy(() => import('../pages/guest/ProductDetail'))
const Login = lazy(() => import('../pages/auth/Login'))
const EmailSimulation = lazy(() => import('../pages/guest/EmailSimulation'))
const Membership = lazy(() => import('../pages/guest/Membership'))
const DokuSimulation = lazy(() => import('../pages/buyer/DokuSimulation'))
const BuyerRegister = lazy(() => import('../pages/buyer/BuyerRegister'))
const SellerRegister = lazy(() => import('../pages/seller/SellerRegister'))
const LoginSuccess = lazy(() => import('../pages/auth/LoginSuccess'))
const VerifyNotice = lazy(() => import('../pages/auth/VerifyNotice'))
const VerifyOtp = lazy(() => import('../pages/auth/VerifyOtp'))

const BuyerDashboard = lazy(() => import('../pages/buyer/BuyerDashboard'))
const MyOrders = lazy(() => import('../pages/buyer/MyOrders'))
const Checkout = lazy(() => import('../pages/buyer/Checkout'))
const PaymentDetail = lazy(() => import('../pages/buyer/PaymentDetail'))
const SubscriptionPayment = lazy(() => import('../pages/buyer/SubscriptionPayment'))
const SubscriptionSuccess = lazy(() => import('../pages/buyer/SubscriptionSuccess'))
const SimulatedMailbox = lazy(() => import('../pages/buyer/SimulatedMailbox'))

const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard'))
const AddProduct = lazy(() => import('../pages/seller/AddProduct'))
const MyProducts = lazy(() => import('../pages/seller/MyProducts'))
const EditProduct = lazy(() => import('../pages/seller/EditProduct'))
const SellerOrders = lazy(() => import('../pages/seller/SellerOrders'))
const Withdraw = lazy(() => import('../pages/seller/Withdraw'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const ApprovalQueue = lazy(() => import('../pages/admin/ApprovalQueue'))
const ManageCategories = lazy(() => import('../pages/admin/ManageCategories'))
const ReturResolution = lazy(() => import('../pages/admin/ReturResolution'))
const Transactions = lazy(() => import('../pages/admin/Transactions'))
const UsersList = lazy(() => import('../pages/admin/UsersList'))
const AdminComplaints = lazy(() => import('../pages/admin/AdminComplaints'))
const AdminBlog = lazy(() => import('../pages/admin/AdminBlog'))
const AddBlog = lazy(() => import('../pages/admin/AddBlog'))

const Chat = lazy(() => import('../pages/shared/Chat'))
const MyComplaints = lazy(() => import('../pages/shared/MyComplaints'))

// Info Pages
const AboutThriftly = lazy(() => import('../pages/info/AboutThriftly'))
const Careers = lazy(() => import('../pages/info/Careers'))
const Press = lazy(() => import('../pages/info/Press'))
const Blog = lazy(() => import('../pages/info/Blog'))
const BlogDetail = lazy(() => import('../pages/guest/BlogDetail'))
const HelpCenter = lazy(() => import('../pages/info/HelpCenter'))
const HowItWorks = lazy(() => import('../pages/info/HowItWorks'))
const LegalTerms = lazy(() => import('../pages/info/LegalTerms'))
const LegalPrivacy = lazy(() => import('../pages/info/LegalPrivacy'))

const Profile = lazy(() => import('../pages/buyer/Profile'))

// ── Loading Fallback ──────────────────────────────────────────────────────────
const PageLoader = () => {
  const location = useLocation()
  
  if (location.pathname.startsWith('/admin')) {
    return <AdminPageSkeleton />
  }
  
  if (location.pathname === '/buyer/dashboard' || location.pathname === '/login-success') {
    return <BuyerDashboardSkeleton />
  }
  
  if (location.pathname === '/seller/dashboard') {
    return <SellerDashboardSkeleton />
  }
  
  if (location.pathname === '/profile') {
    return <ProfileSkeleton />
  }
  
  return <PageSkeleton />
}

const ProtectedRoute = ({ children, allowedRoles, requireVerified = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  // Cek verifikasi email jika diwajibkan
  if (requireVerified && !user.email_verified_at) {
    return <Navigate to="/verify-notice" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/verify-notice" element={<VerifyNotice />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
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
            <ProtectedRoute allowedRoles={['buyer']} requireVerified={true}>
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
          path="/subscription/payment"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <SubscriptionPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/success"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <SubscriptionSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation/doku"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <DokuSimulation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation/mailbox"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <SimulatedMailbox />
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
          path="/seller/withdraw"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <Withdraw />
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

        <Route path="/profile"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'seller']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/membership" element={<Membership />} />
        <Route path="/simulation/mailbox" element={<EmailSimulation />} />
        <Route path="/simulation/doku"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'seller']}>
              <DokuSimulation />
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
    </Suspense>
  )
}

export default AppRoutes
