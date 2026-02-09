<script lang="ts">
	let { 
        pagination = {},
        prevPage = null,
        nextPage = null
    } = $props();
</script>

<nav
	class="flex items-center gap-2 justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
	aria-label="Pagination"
>
	<div class="hidden sm:block">
		<p class="text-sm text-gray-700">
			Menampilkan
			<span class="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span>
			sampai
			<span class="font-medium"
				>{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span
			>
			dari
			<span class="font-medium">{pagination.total}</span>
			hasil
		</p>
	</div>
	<div class="flex flex-1 justify-between sm:justify-end">
		<button
			onclick={prevPage}
			disabled={pagination.current_page === 1}
			class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50 {pagination.current_page ===
			1
				? 'cursor-not-allowed opacity-50'
				: ''}"
		>
			Sebelumnya
		</button>
		<button
			onclick={nextPage}
			disabled={pagination.current_page === pagination.last_page}
			class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50 {pagination.current_page ===
			pagination.last_page
				? 'cursor-not-allowed opacity-50'
				: ''}"
		>
			Berikutnya
		</button>
	</div>
</nav>
