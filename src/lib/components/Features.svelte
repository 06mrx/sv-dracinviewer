<script>
  const features = [
    {
      title: 'Performa Cepat',
      description: 'Svelte menyusun kode Anda menjadi JavaScript murni, menghasilkan bundle yang sangat kecil dan cepat.',
      icon: '🚀'
    },
    {
      title: 'Desain Responsif',
      description: 'Dengan Tailwind, Anda bisa membangun UI yang indah dan responsif tanpa menulis CSS dari awal.',
      icon: '📱'
    },
    {
      title: 'Integrasi API Mudah',
      description: 'Terhubung dengan lancar ke backend Goravel Anda untuk mengambil dan mengirim data.',
      icon: '🔗'
    }
  ];
</script>

<section class="py-16 bg-white">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-extrabold text-gray-900">Fitur Unggulan</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each features as feature}
        <div class="bg-gray-100 p-8 rounded-lg shadow-md text-center transform transition duration-300 hover:scale-105">
          <div class="text-4xl mb-4">{feature.icon}</div>
          <h3 class="text-xl font-bold mb-2">{feature.title}</h3>
          <p class="text-gray-600">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>