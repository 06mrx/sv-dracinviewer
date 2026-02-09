📚 Dokumentasi Integrasi Firebase & Kredensial
Dokumen ini memandu Anda melalui langkah-langkah penting untuk mengintegrasikan Firebase Authentication (khususnya Google Sign-In) ke dalam proyek SvelteKit Anda. Ini juga mencakup cara mendapatkan kredensial yang diperlukan dari konsol Firebase Anda, yang akan sangat berguna saat deploy proyek.

1. Instalasi Firebase SDK 🚀
Langkah pertama adalah memastikan firebase SDK terinstal sebagai dependensi di proyek Anda. Buka terminal di direktori root proyek Anda dan jalankan perintah berikut:

npm install firebase
# Atau jika Anda menggunakan Yarn:
# yarn add firebase
# Atau jika Anda menggunakan pnpm:
# pnpm add firebase

2. Mendapatkan Kredensial Firebase Proyek Anda 🔑
Untuk menginisialisasi Firebase di aplikasi Anda, Anda memerlukan objek konfigurasi spesifik proyek. Konfigurasi ini mencakup apiKey, authDomain, projectId, appId, dan properti penting lainnya.

Langkah-langkah Detail:
Buka Firebase Console Anda:

Navigasikan ke Firebase Console di browser Anda.

Pilih proyek Firebase Anda dari daftar yang ada.

Akses Pengaturan Proyek:

Di menu navigasi sebelah kiri, cari dan klik ikon roda gigi (⚙️) yang biasanya berada di samping "Project overview" atau nama proyek Anda.

Dari menu dropdown yang muncul, pilih Project settings.

Temukan Kredensial Aplikasi Web Anda:

Pada halaman "Project settings", gulir ke bawah hingga Anda menemukan bagian bernama "Your apps".

Jika Anda sudah mendaftarkan aplikasi web sebelumnya, Anda akan melihatnya tercantum di sana. Klik aplikasi web Anda (sering ditandai dengan ikon </>).

Jika Anda belum memiliki aplikasi web yang terdaftar, klik tombol Add app dan pilih ikon Web (</>). Ikuti petunjuk untuk menyelesaikan pendaftaran aplikasi baru.

Setelah proses ini selesai (atau jika Anda mengklik aplikasi yang sudah ada), Firebase akan menampilkan blok kode JavaScript yang berisi objek konfigurasi penting.

Contoh blok konfigurasi:

const firebaseConfig = {
  apiKey: "AIzaSyC...", // Ini adalah API Key Anda
  authDomain: "your-project-id.firebaseapp.com", // Ini adalah Auth Domain Anda
  projectId: "your-project-id", // Ini adalah Project ID Anda
  storageBucket: "your-project-id.appspot.com", // Ini adalah Storage Bucket Anda
  messagingSenderId: "1234567890", // Ini adalah Messaging Sender ID Anda
  appId: "1:1234567890:web:abcdef12345", // Ini adalah App ID Anda
  // measurementId: "G-..." // Mungkin juga ada measurementId, opsional
};

Salin semua nilai dari properti di dalam objek firebaseConfig ini. Ini adalah kredensial yang akan Anda gunakan dalam aplikasi SvelteKit Anda.

3. Mengaktifkan Google Sign-In di Firebase Authentication ✅
Agar pengguna Anda dapat login atau mendaftar menggunakan akun Google mereka, Anda harus secara eksplisit mengaktifkan penyedia Google di Firebase Authentication.

Langkah-langkah Detail:
Buka Firebase Console Anda dan pilih proyek Anda.

Di menu navigasi kiri, di bawah bagian Build, klik Authentication.

Pindah ke tab Sign-in method.

Cari penyedia Google di daftar dan klik ikon pensil (edit) di sebelahnya.

Aktifkan tombol Enable.

Di dropdown "Project support email", pilih email support untuk proyek Anda. Email ini akan ditampilkan kepada pengguna saat mereka melihat popup otentikasi Google.

Bagian Authorized domains sangat krusial untuk keamanan. Pastikan Anda menambahkan semua domain yang diizinkan untuk memanggil otentikasi ini:

localhost (untuk pengembangan lokal)

Domain produksi aplikasi Anda (misalnya, your-app-domain.com)

Domain Firebase Anda sendiri (misalnya, your-project-id.firebaseapp.com)

Setelah semua konfigurasi selesai, klik tombol Save.

4. Menggunakan Kredensial di Aplikasi SvelteKit Anda 🧑‍💻
Dalam kode SvelteKit Anda, Anda akan menggunakan kredensial yang telah Anda dapatkan. Pada komponen Svelte yang telah kita buat (misalnya, halaman login atau registrasi), kami telah mengimplementasikan mekanisme fallback dengan manualFirebaseConfig.

<script lang="ts">
  // Deklarasi variabel global untuk TypeScript agar dapat mengenalinya
  declare var __firebase_config: string; 

  // ... (import lainnya)

  // Konfigurasi Firebase manual sebagai fallback
  const manualFirebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",      // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
    authDomain: "YOUR_AUTH_DOMAIN",    // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
    projectId: "YOUR_PROJECT_ID",      // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
    storageBucket: "YOUR_STORAGE_BUCKET", // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
    appId: "YOUR_APP_ID"               // <--- TEMPEL DI SINI DARI FIREBASE CONSOLE
  };

  let firebaseConfig: Record<string, any> = {};

  onMount(() => {
    try {
      if (typeof __firebase_config === 'string' && __firebase_config.length > 0) {
        const parsedConfig = JSON.parse(__firebase_config);
        if (Object.keys(parsedConfig).length > 0) {
          firebaseConfig = parsedConfig;
        } else {
          console.warn('__firebase_config parsed to an empty object. Using manual config fallback.');
          firebaseConfig = manualFirebaseConfig;
        }
      } else {
        console.warn('__firebase_config is undefined or empty. Using manual config fallback.');
        firebaseConfig = manualFirebaseConfig;
      }
    } catch (e) {
      console.error('Error parsing __firebase_config, falling back to manual config:', e);
      firebaseConfig = manualFirebaseConfig;
    }

    // Lanjutkan inisialisasi Firebase hanya jika firebaseConfig tidak kosong dan bukan placeholder
    if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
      initializeApp(firebaseConfig);
      // ... (inisialisasi getAuth, GoogleAuthProvider)
    } else {
      console.error('Firebase config is still invalid or using placeholders. Google login/registration will not be available.');
      // ... (tampilkan pesan error ke pengguna)
    }
  });
  // ... (kode lainnya untuk login/registrasi)
</script>

Penting untuk Deploy:
Saat Anda mendeploy aplikasi SvelteKit Anda, idealnya Anda harus mengatur variabel lingkungan __firebase_config di lingkungan hosting Anda. Variabel ini harus berisi stringified JSON dari konfigurasi Firebase Anda. Ini memastikan bahwa kredensial Anda tidak dikomit langsung ke codebase dan lebih aman. manualFirebaseConfig berfungsi sebagai fallback yang bagus selama pengembangan lokal atau debugging jika variabel lingkungan tidak diatur dengan benar.

Dengan mengikuti dokumentasi ini, Anda akan siap untuk mengintegrasikan dan mendeploy fitur otentikasi Firebase di proyek SvelteKit Anda dengan percaya diri! 💪