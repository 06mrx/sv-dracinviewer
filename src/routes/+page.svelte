<script>
  import { goto } from '$app/navigation';

  function goTo(path) {
    goto(path);
  }
</script>

<div class="relative min-h-screen w-full bg-[#0a0612] flex flex-col items-center justify-center gap-12 overflow-hidden">

  <!-- Background orbs -->
  <div class="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-[100px] animate-pulse"></div>
  <div class="absolute -bottom-32 -right-16 w-[420px] h-[420px] rounded-full bg-purple-600/20 blur-[100px] animate-pulse delay-1000"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-900/30 blur-[80px]"></div>

  <!-- Grid overlay -->
  <div class="absolute inset-0 opacity-[0.04]"
    style="background-image: linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px); background-size: 40px 40px;">
  </div>

  <!-- Header -->
  <div class="relative z-10 flex flex-col items-center gap-3 text-center">
    <span class="text-[10px] font-bold tracking-[4px] text-violet-400 border border-violet-700/40 bg-violet-900/20 px-4 py-1.5 rounded-full uppercase">
      Short Drama
    </span>
    <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
      Choose <span class="bg-gradient-to-r from-fuchsia-400 to-violet-500 bg-clip-text text-transparent">Platform</span>
    </h1>
    <p class="text-sm text-gray-500 font-light tracking-wide">Select your streaming destination</p>
  </div>

  <!-- Cards -->
  <div class="relative z-10 flex flex-wrap gap-5 justify-center">

    <!-- Dramabox -->
    <button
      on:click={() => goTo('/dramabox')}
      class="group relative w-64 h-40 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-pink-500/40 hover:shadow-[0_20px_50px_rgba(236,72,153,0.2)]"
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

      <div class="relative z-10 h-full flex flex-col justify-center items-start px-6 gap-1.5">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center mb-2">
          <img src="/db.webp" alt="Dramabox" class="w-full h-full object-contain rounded-xl" />
        </div>
        <span class="text-xl font-bold text-violet-50 tracking-tight">Dramabox</span>
        <span class="text-xs text-gray-500 font-light">Premium Drama Series</span>
      </div>

      <span class="absolute right-5 bottom-5 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300 text-lg">→</span>
    </button>

    <!-- Netshort -->
    <button
      on:click={() => goTo('/netshort')}
      class="group relative w-64 h-40 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-500/40 hover:shadow-[0_20px_50px_rgba(139,92,246,0.25)]"
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

      <div class="relative z-10 h-full flex flex-col justify-center items-start px-6 gap-1.5">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-800 flex items-center justify-center mb-2">
          <img src="/ns.png" alt="Netshort" class="w-full h-full object-contain rounded-xl" />
        </div>
        <span class="text-xl font-bold text-violet-50 tracking-tight">Netshort</span>
        <span class="text-xs text-gray-500 font-light">Short Film Collection</span>
      </div>

      <span class="absolute right-5 bottom-5 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300 text-lg">→</span>
    </button>

  </div>

  <!-- Footer -->
  <div class="flex flex-col justify-center items-center gap-3">
    <p class="relative z-10 text-xs text-gray-700 tracking-widest uppercase">
    Support by <span class="text-violet-700">Sansekai</span>
  </p>
  <!-- Created by -->
  <p class="relative z-10 text-xs text-gray-700 tracking-widest uppercase">
    Created by <span class="text-rose-700">MRX</span>
  </p>
  </div>

</div>