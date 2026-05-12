import React from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Container from '../../components/layout/Container';
import Header from '../../components/layout/Header';

const VerifyNotice = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/email/verification-notification');
      toast.success('Link verifikasi baru telah dikirim ke email Anda.');
    } catch (error) {
      toast.error('Gagal mengirim email. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const updatedUser = await refreshUser();
      if (updatedUser?.email_verified_at) {
        toast.success('Email sudah terverifikasi!');
        navigate('/buyer/dashboard');
      } else {
        toast.error('Email belum terverifikasi. Silakan cek inbox atau folder spam Anda.');
      }
    } catch (error) {
      toast.error('Gagal mengecek status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            <Mail size={40} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email Anda</h1>
          <p className="text-gray-600 mb-8">
            Hampir sampai! Kami telah mengirimkan link verifikasi ke <span className="font-bold text-gray-900">{user?.email}</span>. 
            Silakan klik link tersebut untuk mengaktifkan semua fitur belanja Anda.
          </p>

          <div className="space-y-3">
            <Button 
              fullWidth 
              onClick={handleCheckStatus}
              loading={loading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Saya Sudah Verifikasi
            </Button>
            
            <button 
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Kirim Ulang Link Verifikasi
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 mx-auto text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </Container>
    </div>
  );
};

export default VerifyNotice;
