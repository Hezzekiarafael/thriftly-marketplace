import api from './api';
import { storage, STORAGE_KEYS } from './localStorage';

export const mapLaravelUser = (u) => {
  if (!u) return null;
  const name = u.nama || u.name || u.full_name || 'Pengguna';
  
  // Handle avatar URL
  let avatarUrl = u.avatar || u.profile?.avatar || null;
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    // Sesuaikan dengan URL storage Laravel Anda
    avatarUrl = `https://api.thriftly.my.id/storage/${avatarUrl}`;
  }

  return {
    id: u.id,
    email: u.email,
    name: name,
    role: u.role || 'buyer',
    email_verified_at: u.email_verified_at || null,
    phone_verified_at: u.phone_verified_at || u.profile?.phone_verified_at || null,
    createdAt: u.created_at || u.createdAt,
    profile: {
      nama: name,
      avatar: avatarUrl,
      lokasi: u.lokasi || u.location || u.profile?.lokasi || 'Semarang',
      alamat: u.alamat || u.profile?.alamat || '',
      noTelp: u.no_telp || u.no_Telp || u.profile?.noTelp || '-',
      tanggalLahir: u.date_of_birth || u.tanggalLahir || u.profile?.tanggalLahir || '',
      jenisKelamin: u.gender === 'L' ? 'Laki-laki' : (u.gender === 'P' ? 'Perempuan' : 'Laki-laki')
    }
  }
}


// Global cache untuk menghindari N+1 query di frontend yang bikin lemot
let usersCache = null;
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 detik

export const userService = {
  async createUser(userData) {
    try {
      // Mapping format Frontend ke format bawaan Laravel (name, password_confirmation)
      const payload = {
        name: userData.profile?.nama || userData.name || 'User',
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password, // Frontend sudah punya validasi confirmPassword kok, ini biar backend ga rewel
        role: userData.role,
        profile: userData.profile,
        alamat: userData.profile?.alamat || '',
        lokasi: userData.profile?.lokasi || '',
        no_telp: userData.profile?.noTelp || '',
        no_rekening: userData.profile?.noRekening || ''
      };

      const response = await api.post('/register', payload);

      // Jika Laravel mengirim kembali property token, simpan di localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Mengembalikan objek user yang didapat dari Backend, dipetakan ke format frontend
      const rawUser = response.data.user || response.data;
      return mapLaravelUser(rawUser) || rawUser;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal mendaftar, pastikan email belum terpakai.';
      throw new Error(errorMsg);
    }
  },

  async login(email, password) {
    // 🧪 MOCK MODE: Jika sedang nunggu backend, bisa login pake akun dummy apa aja
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('🧪 Menggunakan Mock Login (Mode Offline)');
      const mockUser = {
        id: email === 'admin@test.com' ? 1 : 2,
        email: email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : (email.includes('seller') ? 'seller' : 'buyer'),
        token: 'mock-token-' + Date.now()
      };
      localStorage.setItem('token', mockUser.token);
      return mapLaravelUser(mockUser);
    }

    try {
      const response = await api.post('/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      } else if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      const rawUser = response.data.user || response.data;
      return mapLaravelUser(rawUser) || rawUser;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Email atau password salah';
      throw new Error(errorMsg);
    }
  },

  async logout() {
    try {
      if (localStorage.getItem('token')) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Error saat logout dari server:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // 🧪 MOCK MODE
    if (import.meta.env.VITE_USE_MOCK_API === 'true' && token.startsWith('mock-token')) {
      return {
        id: 1,
        email: 'user@mock.com',
        name: 'Mock User',
        role: localStorage.getItem('mock_role') || 'buyer',
        profile: { nama: 'Mock User', lokasi: 'Semarang' }
      };
    }

    try {
      // Mendapatkan data milik user saat ini
      const response = await api.get('/user');
      return mapLaravelUser(response.data);
    } catch (error) {
      // Jika token tidak valid / kedaluwarsa, bersihkan localStorage
      localStorage.removeItem('token');
      return null;
    }
  },

  // Ini digunakan untuk fungsi update role
  async updateUser(id, updates) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const users = storage.get(STORAGE_KEYS.USERS) || []
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        users[index] = {
          ...users[index],
          ...updates,
          profile: { ...(users[index].profile || {}), ...(updates.profile || {}) }
        }
        storage.set(STORAGE_KEYS.USERS, users)
        return users[index]
      }
    }

    try {
      // Format payload sesuai validasi backend Laravel
      // Backend mengharapkan field flat: name, email, role, phone
      const payload = {
        name: updates.profile?.nama || updates.name || updates.email,
        email: updates.email,
        role: updates.role,
        phone: updates.profile?.noTelp || updates.phone || '',
        address: updates.profile?.alamat || updates.address || '',
      };
      if (updates.password) payload.password = updates.password;

      const response = await api.put(`/admin/users/${id}`, payload);
      const resData = response.data.user || response.data;
      return mapLaravelUser(resData) || resData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengupdate data user');
    }
  },




  async updateProfile(id, profileData) {
    try {
      const response = await api.put('/user/profile', profileData);
      const resData = response.data.user || response.data;
      return mapLaravelUser(resData) || resData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengupdate profil');
    }
  },

  async sendOtp(email, noTelp) {
    console.log('Sending OTP Request (Trying Multiple Phone Fields):', { noTelp });
    try {
      const response = await api.post('/otp/send', { 
        // Kita tidak kirim email agar tidak lari ke email
        no_telp: noTelp,
        phone: noTelp,
        number: noTelp,
        whatsapp: noTelp
      });
      console.log('OTP Send Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('OTP Send Error Response:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Gagal mengirim OTP');
    }
  },

  async verifyOtp(email, noTelp, otpCode) {
    console.log('Verifying OTP (Simple):', { code: otpCode });
    try {
      const response = await api.post('/otp/verify', { 
        code: otpCode
      });
      console.log('OTP Verify Success Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('OTP Verify Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Kode OTP salah atau kedaluwarsa');
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // ==========================================
  // API METHODS FOR USERS MANAGEMENT
  // ==========================================
  _fetchPromise: null,

  async getAllUsers() {
    const now = Date.now();
    if (usersCache && (now - lastFetch < CACHE_DURATION)) {
      return usersCache;
    }

    if (this._fetchPromise) {
        return this._fetchPromise;
    }

    this._fetchPromise = (async () => {
        try {
            const response = await api.get('/users')
            const data = response.data.data || response.data || []
            usersCache = data.map(mapLaravelUser);
            lastFetch = Date.now();
            return usersCache;
        } catch (error) {
            console.error('Failed to fetch users', error)
            return usersCache || []
        } finally {
            this._fetchPromise = null;
        }
    })();

    return this._fetchPromise;
  },

  async getUserById(id) {
    if (!id) return null;
    
    // Cek di cache dulu (sangat penting buat performa admin)
    if (usersCache) {
      const cached = usersCache.find(u => String(u.id) === String(id));
      if (cached) return cached;
    }

    try {
      // Jika tidak ada di cache, kita panggil getAllUsers yang sudah di-optimize
      const users = await this.getAllUsers();
      return users.find(u => String(u.id) === String(id)) || await this.getLocalUserById(id);
    } catch (error) {
      return await this.getLocalUserById(id)
    }
  },

  async getLocalUserById(id) {
    const localUsers = storage.get(STORAGE_KEYS.USERS) || []
    const user = localUsers.find(u => u.id == id)
    if (user) return user;

    // Safely fallback but preserve the ID so it's not undefined
    return {
      id: id || 2, // fallback to typical seller id if absolutely undefined
      name: 'Pengguna',
      role: 'user',
      profile: { nama: 'Pengguna', lokasi: 'Indonesia' }
    }
  },

  async deleteUser(id) {
    try {
      await api.delete(`/admin/users/${id}`)
      return true
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal menghapus user')
    }
  },

  updateSaldo(id, saldoData) {
    // This is pending backend integration
    console.warn("updateSaldo is not implemented with API yet")
  }
};
