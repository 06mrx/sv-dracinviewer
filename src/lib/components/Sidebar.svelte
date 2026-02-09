<script lang="ts">
  // Script logic untuk sidebar (jika ada)
  // Misalnya, data untuk navigasi
  const navItems = [
    { name: 'Dashboard', href: '/app/dashboard' },
    { name: 'Pengaturan', href: '/app/settings' },
    { name: 'Profil', href: '/app/profile' },
  ];
</script>

<aside class="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
  <div class="text-2xl font-bold mb-6 text-center">App Logo</div>
  <nav class="flex-grow">
    <ul>
      {#each navItems as item}
        <li class="mb-2">
          <a
            href={item.href}
            class="block p-3 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            {item.name}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <div class="mt-auto pt-4 border-t border-gray-700 text-center">
    <p class="text-sm text-gray-400">© 2025 Aplikasi Saya</p>
  </div>
</aside>
