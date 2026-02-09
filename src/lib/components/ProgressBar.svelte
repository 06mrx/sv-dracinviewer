<script lang="ts">
	let { 
        progressStore = {},
    } = $props();
</script>
<div class="fixed top-0 left-0 right-0 h-0.5 z-100 transition-all duration-300 ease-out"
     class:bg-pink-500={progressStore.isLoading}
     style="width: {progressStore.progress}%;">
</div>