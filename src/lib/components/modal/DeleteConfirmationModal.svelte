<script>
	// Menggunakan $props() untuk mendeklarasikan props di Svelte 5 runes mode
	let {
		isOpen = false,
		onClose = () => {},
		onConfirm = async () => {},
		itemName = '',
	} = $props();

	let isDeleting = $state(false); // State untuk menunjukkan proses penghapusan
	let deleteError = $state(''); // State untuk pesan error spesifik modal

	async function handleConfirmClick() {
		isDeleting = true;
		deleteError = '';
		try {
			await onConfirm(); // Panggil fungsi onConfirm dari parent
			// Jika onConfirm berhasil, parent akan menutup modal.
			// Jika onConfirm tidak menutup modal, kita bisa tambahkan onClose() di sini,
			// tapi sebaiknya parent yang memutuskan kapan menutup modal setelah konfirmasi.
			onClose(); // Menutup modal setelah konfirmasi berhasil
		} catch (e) {
			deleteError = 'Gagal melakukan penghapusan. Coba lagi.';
			console.error('Modal delete confirmation error:', e);
		} finally {
			isDeleting = false;
			// Jika onConfirm gagal, modal tetap terbuka dengan pesan error.
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
		<div class="animate-fade-in-up w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold text-gray-800">Konfirmasi Penghapusan</h3>
				<button onclick={onClose} class="text-gray-500 hover:text-gray-700" aria-label="closebtn">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<p class="mb-6 text-gray-700">
				Apakah Anda yakin ingin menghapus
				{#if itemName}
					data <strong class="font-bold">"{itemName}"</strong>
				{:else}
					item ini
				{/if}? Tindakan ini tidak dapat dibatalkan.
			</p>

			{#if deleteError}
				<div class="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700" role="alert">
					{deleteError}
				</div>
			{/if}

			<div class="flex justify-end space-x-3">
				<button
					onclick={onClose}
					disabled={isDeleting}
					class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Batal
				</button>
				<button
					onclick={handleConfirmClick}
					disabled={isDeleting}
					class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isDeleting}
						<svg
							class="mr-2 h-4 w-4 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Menghapus...
					{:else}
						Hapus
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animasi fade-in-up untuk modal */
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in-up {
		animation: fade-in-up 0.3s ease-out forwards;
	}
</style>
