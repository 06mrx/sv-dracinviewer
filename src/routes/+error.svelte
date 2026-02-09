<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	const jokes = [
		'Kayaknya server lagi ngopi dulu ☕',
		'Oops! Kabelnya ketarik kucing 🐈',
		'Santai... ini cuma error, bukan kiamat 🌍🔥',
		'Developer lagi OTW benerin... mungkin 🚴‍♂️',
		'Error ini lebih misterius daripada mantan kamu 👻'
	];
	const joke = jokes[Math.floor(Math.random() * jokes.length)];
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			window.location.href = '/';
		}
	}
</script>

<!-- Main Container -->
<div class="min-w-screen flex-col flex min-h-screen items-center justify-center">
	<pre class="text-5xl text-gray-400">{$page.status}</pre>
	&nbsp;
	<!-- <blockquote>{joke} </blockquote> -->
    

<figure class="max-w-screen-md mx-auto text-center -mt-8">
    <svg class=" w-30 h-30 mx-auto mb-3 text-gray-400 " xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M19 8h1v1h-1zm1-3h-1v2h1V6h.5c.28 0 .5-.22.5-.5v-2c0-.28-.22-.5-.5-.5H18v1h2zm-3-2h-1v4h1zm-3.5 12.5a2 2 0 1 0 4 0c0-1.11-.89-2-2-2s-2 .9-2 2M17 8h-1v1h1zm5 6h-1c0-1.5-.47-2.87-1.26-4h-2.77c1.22.91 2.03 2.36 2.03 4v2h2v1h-2v3H5v-3H3v-1h2v-2c0-2.76 2.24-5 5-5h4c.34 0 .68.04 1 .1V7.08c-.33-.05-.66-.08-1-.08h-1V5.73A2 2 0 1 0 10 4c0 .74.4 1.39 1 1.73V7h-1c-3.87 0-7 3.13-7 7H2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h1v1a2 2 0 0 0 2 2h14c1.11 0 2-.89 2-2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1m-13.5-.5c-1.1 0-2 .9-2 2s.9 2 2 2s2-.89 2-2s-.89-2-2-2"/></svg>
    <blockquote>
        <p class="text-2xl italic font-medium text-gray-800 ">"{joke}."</p>
    </blockquote>
    <!-- <figcaption class="flex items-center justify-center mt-6 space-x-3 rtl:space-x-reverse">
        <img class="w-6 h-6 rounded-full" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png" alt="profile picture">
        <div class="flex items-center divide-x-2 rtl:divide-x-reverse divide-gray-500 dark:divide-gray-700">
            <cite class="pe-3 font-medium text-gray-900 ">Webserver</cite>
            <cite class="ps-3 text-sm text-gray-500 ">CEO at Google</cite>
        </div>
    </figcaption> -->
</figure>


    <button onclick={goBack} class="p-3 shadow-lg rounded-lg mt-10 text-gray-700 font-bold"> Kembali </button>
</div>
