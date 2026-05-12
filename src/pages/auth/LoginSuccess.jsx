import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        // 1. Simpan token ke localStorage
        localStorage.setItem('token', token);
        
        try {
          // 2. Ambil data user terbaru menggunakan token tersebut
          await refreshUser();
          
          toast.success('Berhasil masuk dengan Google!');
          
          // 3. Redirect ke dashboard
          // Kita beri sedikit delay agar proses refreshUser selesai sempurna
          setTimeout(() => {
            navigate('/buyer/dashboard');
          }, 500);
          
        } catch (error) {
          console.error('Error fetching user after Google login:', error);
          toast.error('Gagal mengambil data pengguna.');
          navigate('/login');
        }
      } else {
        toast.error('Token tidak ditemukan.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Memproses Login...</h2>
          <p className="text-gray-500 mt-1 text-sm">Mohon tunggu sebentar, Anda akan segera dialihkan.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;
