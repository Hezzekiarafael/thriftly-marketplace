import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import { ShieldAlert, Mail, MessageCircle, CreditCard, UserCheck, ArrowRight } from 'lucide-react';

export const useVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingSteps, setMissingSteps] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkVerification = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsChecking(true);
    try {
      const bankAccounts = await userService.getBankAccounts();
      const hasBankAccount = bankAccounts && bankAccounts.length > 0;

      const steps = [];
      if (!user.emailVerifiedAt && !user.email_verified_at) steps.push('email');
      if (!user.phoneVerifiedAt && !user.phone_verified_at) steps.push('whatsapp');
      if (user.ktp_status !== 'verified') steps.push('ktp');
      if (!hasBankAccount) steps.push('rekening');

      if (steps.length === 0) {
        navigate('/seller/products/add');
      } else {
        setMissingSteps(steps);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memeriksa status verifikasi');
    } finally {
      setIsChecking(false);
    }
  };

  const VerificationModal = () => {
    if (!isModalOpen) return null;

    const stepsConfig = {
      email: {
        title: 'Verifikasi Email',
        desc: 'Lakukan verifikasi email untuk mengamankan akun jualan Anda.',
        icon: Mail,
      },
      whatsapp: {
        title: 'Verifikasi WhatsApp OTP',
        desc: 'Verifikasi nomor HP Anda untuk menerima notifikasi transaksi via WhatsApp.',
        icon: MessageCircle,
      },
      ktp: {
        title: 'Verifikasi Identitas (KTP)',
        desc: 'Unggah KTP Anda untuk verifikasi identitas sebagai penjual.',
        icon: UserCheck,
      },
      rekening: {
        title: 'Hubungkan Rekening Bank',
        desc: 'Tambahkan rekening bank untuk menarik saldo penghasilan Anda.',
        icon: CreditCard,
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Verifikasi Akun Diperlukan</h2>
            <p className="text-sm text-center text-gray-500 mb-6 leading-relaxed">
              Sebelum dapat menambahkan produk ke marketplace, mohon lengkapi verifikasi keamanan akun Anda berikut ini:
            </p>

            <div className="space-y-3">
              {missingSteps.map((stepKey, index) => {
                const step = stepsConfig[stepKey];
                const isFirst = index === 0;
                return (
                  <button
                    key={stepKey}
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate('/profile');
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 group hover:shadow-md ${
                      isFirst ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isFirst ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-sm mb-1 ${isFirst ? 'text-red-600' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 mt-1 ${isFirst ? 'text-red-500' : 'text-gray-300 group-hover:text-emerald-500'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 px-4 bg-white border border-emerald-600 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-colors"
            >
              Kembali ke Dasbor
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { checkVerification, isChecking, VerificationModal };
};
