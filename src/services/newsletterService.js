import api from './api';

export const newsletterService = {
  async subscribe(email) {
    try {
      // Mengirim data email ke tabel newsletters di backend
      const response = await api.post('/newsletters', { email });
      return response.data;
    } catch (error) {
      // Ambil pesan error dari backend jika ada (misal: "Email sudah terdaftar")
      const serverMessage = error.response?.data?.message;
      const customError = new Error(serverMessage || 'Gagal berlangganan');
      customError.status = error.response?.status;
      throw customError;
    }
  }
};
