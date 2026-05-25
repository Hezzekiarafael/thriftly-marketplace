import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasRun.current) return;
      
      const token = searchParams.get('token');
      console.log('Google Login Callback - Token found:', !!token);
      
      if (token) {
        hasRun.current = true;
        // 1. Simpan token ke localStorage
        localStorage.setItem('token', token);
        
        try {
          // 2. Ambil data user terbaru menggunakan token tersebut
          console.log('Refreshing user data...');
          const userData = await refreshUser();
          console.log('User refreshed successfully:', userData);
          
          toast.success('Berhasil masuk dengan Google!', { id: 'google-login-success' });
          
          // 3. Redirect ke dashboard berdasarkan role
          const targetPath = userData?.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
          
          // Kita beri sedikit delay agar proses refreshUser selesai sempurna di state global
          setTimeout(() => {
            navigate(targetPath, { replace: true });
          }, 800);
          
        } catch (error) {
          console.error('Error fetching user after Google login:', error);
          localStorage.removeItem('token'); // Bersihkan token yang gagal
          toast.error('Gagal mengambil data pengguna.');
          navigate('/login', { replace: true });
        }
      } else {
        console.warn('No token found in URL search params');
        toast.error('Token tidak ditemukan.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  return <PageSkeleton />;
};

export default LoginSuccess;
