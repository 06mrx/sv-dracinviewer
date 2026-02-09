<script>
  import { getFirstError } from '$lib/services/functionService';

  // Ini adalah cara yang benar untuk mendefinisikan properti
  // yang dapat diikat (bindable) di Svelte 5.
  // Properti 'value' ditandai secara inline menggunakan $bindable().
  let {
    label = '',
    name = '',
    placeholder = '',
    isRequired = false,
    error = '',
    type = 'text',
    value = $bindable(''),
    autocomplete = type === 'password' ? 'new-password' : name, // Menambahkan properti autocomplete

  } = $props();

  // --- Logika untuk Password Strength Indicator ---
  let passwordStrength = $state(0);
    // let score = 0;

  function getPasswordStrengthInfo() {
    if (passwordStrength === 1) return { text: 'Lemah', color: 'text-red-600' };
    if (passwordStrength === 2) return { text: 'Sedang', color: 'text-yellow-600' };
    if (passwordStrength === 3) return { text: 'Kuat', color: 'text-blue-600' };
    if (passwordStrength === 4) return { text: 'Sangat Kuat', color: 'text-green-600' };
    return { text: '', color: '' };
  }

  function checkPasswordStrength(password) {
    // Reset skor di awal setiap panggilan
    let score = 1;
    
    // Perbaikan logika:
    // Poin diberikan berdasarkan kombinasi, bukan hanya keberadaan satu kategori.
    
    // Aturan 1: Minimal 8 karakter
    if (password.length >= 8) {
        score++;
    }
    
    // Aturan 2: Mengandung huruf kecil DAN huruf besar
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++;
    }
    
    // Aturan 3: Mengandung angka
    if (/\d/.test(password)) {
        score++;
    }
    
    // Aturan 4: Mengandung karakter spesial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score++;
    }
    
    // Perbarui state passwordStrength dengan skor baru
    passwordStrength = score;
  }
  
</script>

<div class="space-y-1">
  <label for={name} class="block text-sm font-medium text-gray-700">
    {label}
    <span class="text-red-500 {isRequired ? '' : 'hidden'}">*</span>
  </label>
  <input
    id={name}
    name={name}
    type={type}
    autocomplete={autocomplete}
    required={isRequired}
    class="block w-full rounded-lg  px-3 py-2.5 text-sm placeholder-gray-400 shadow-lg transition-colors focus:bg-indigo-500/10 {getFirstError(
      error
    )
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'focus:border-indigo-500 focus:ring-indigo-500'}"
    {placeholder}
    bind:value
    oninput={() => {
      if (type === 'password') {
        checkPasswordStrength(value);
      }
    }}
  />
  
  {#if getFirstError(error)}
    <p class="flex items-center gap-1 text-xs text-red-600">
      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {getFirstError(error)}
    </p>
  {:else if type === 'password' && value.length > 0}
    <!-- Password Strength Indicator -->
    <div class="mt-2 flex items-center gap-2">
      <div class="flex flex-1 gap-1">
        {#each Array(4) as _, i}
          <div
            class="h-1.5 flex-1 rounded-full {passwordStrength > i
              ? passwordStrength === 1
                ? 'bg-red-400'
                : passwordStrength === 2
                  ? 'bg-yellow-400'
                  : passwordStrength === 3
                    ? 'bg-blue-400'
                    : 'bg-green-400'
              : 'bg-gray-200'}"
          ></div>
        {/each}
      </div>
      <span class="text-xs font-medium {getPasswordStrengthInfo().color}">
        {getPasswordStrengthInfo().text}
      </span>
    </div>
  {/if}
</div>
