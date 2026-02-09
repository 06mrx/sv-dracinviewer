<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';
  
  // Tipe `gotoFunction` sekarang secara eksplisit didefinisikan sebagai fungsi penanganan acara klik mouse.
  let {
    gotoFunction = (() => {}) as MouseEventHandler<HTMLButtonElement>,
  } = $props();
</script>

<div
  class="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-12 text-center"
>
  <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-600" viewBox="0 0 24 24"
      ><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ><path
        d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5M1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12S17.937 22.75 12 22.75S1.25 17.937 1.25 12"
      /><path
        d="M7.4 8.55a.75.75 0 0 1 1.05-.15l2 1.5a.75.75 0 0 1 0 1.2l-2 1.5a.75.75 0 1 1-.9-1.2l1.2-.9l-1.2-.9a.75.75 0 0 1-.15-1.05m9.2 0a.75.75 0 0 0-1.05-.15l-2 1.5a.75.75 0 0 0 0 1.2l2 1.5a.75.75 0 1 0 .9-1.2l-1.2-.9l1.2-.9a.75.75 0 0 0 .15-1.05m-1.07 7.98a.75.75 0 0 1-1.06 0l-.47-.47l-.47.47a.75.75 0 0 1-1.06 0l-.47-.47l-.47.47a.75.75 0 0 1-1.06 0l-.47-.47l-.47.47a.75.75 0 0 1-1.06-1.06l1-1a.75.75 0 0 1 1.06 0l.47.47l.47-.47a.75.75 0 0 1 1.06 0l.47.47l.47-.47a.75.75 0 0 1 1.06 0l1 1a.75.75 0 0 1 0 1.06"
      /></g
    ></svg>
  </div>
  <h3 class="text-xl font-semibold text-amber-800">Yang kamu cari tidak ada</h3>
  <p class="mt-2 text-amber-700">Coba kata kunci yang lain atau buat baru.</p>
  <button
    onclick={gotoFunction}
    class="mt-6 rounded-xl bg-amber-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-700"
  >
    Buat Sekarang
  </button>
</div>
