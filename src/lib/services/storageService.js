import { browser } from '$app/environment';

const USER_DATA_KEY = 'user_data';
const USER_TOKEN_KEY = 'user_token';

class StorageService {
  /**
   * Mengambil data pengguna dari localStorage.
   * @returns {Object | null} Objek data pengguna atau null jika tidak ada/error.
   */
  getUserData() {
    if (!browser) return null; // Pastikan kode berjalan di browser
    try {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }

  /**
   * Mengambil nilai spesifik (email, id, name) dari data pengguna.
   * @param {string} key Kunci data yang ingin diambil ('email', 'id', 'name').
   * @returns {string | null} Nilai data atau null jika tidak ditemukan.
   */
  get(key) {
    const userData = this.getUserData();
    if (userData && userData[key]) {
      return String(userData[key]);
    }
    return null;
  }

  /**
   * Menyimpan data pengguna ke localStorage.
   * @param {Object} data Objek data pengguna yang akan disimpan.
   */
  setUserData(data) {
    if (!browser) return;
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  /**
   * Menghapus semua data pengguna dari localStorage.
   */
  clearUserData() {
    if (!browser) return;
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_TOKEN_KEY); // Juga hapus token jika disimpan terpisah
  }

  clearToken() {
    localStorage.removeItem(USER_TOKEN_KEY)
  }

  /**
   * Mengambil token dari localStorage.
   * @returns {string | null} Token atau null jika tidak ada.
   */
  getToken() {
    if (!browser) return null;
    return localStorage.getItem(USER_TOKEN_KEY);
  }

  /**
   * Menyimpan token ke localStorage.
   * @param {string} token String token.
   */
  setToken(token) {
    if (!browser) return;
    localStorage.setItem(USER_TOKEN_KEY, token);
  }
}

export const storageService = new StorageService();
