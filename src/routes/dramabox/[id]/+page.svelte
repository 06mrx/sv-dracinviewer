<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { PUBLIC_API_URL2 } from '$env/static/public';
    import toast, { Toaster } from 'svelte-french-toast';
	import { goto } from '$app/navigation';

    let chapters = $state([]);
    let currentChapterIndex = $state(0);
    let loading = $state(true);
    let error = $state('');
    let dramaId = $page.params.id;
    let isPlaying = $state(false);
    let videoProgress = $state(0);
    let scrollY = $state(0);
    
    let videoRef;

    async function fetchChapters() {
        loading = true;
        error = '';
        try {
            const apiUrl = `${PUBLIC_API_URL2}/api/dramabox/allepisode?bookId=${dramaId}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (Array.isArray(result)) {
                chapters = result;
                if (chapters.length === 0) {
                    error = 'No episodes found.';
                }
            } else {
                error = 'Invalid data format.';
                toast.error(error);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            error = 'Failed to fetch data from server.';
            toast.error(error);
        } finally {
            loading = false;
        }
    }

    function playChapter(index) {
        if (index >= 0 && index < chapters.length) {
            currentChapterIndex = index;
            document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function handleVideoEnded() {
        if (currentChapterIndex < chapters.length - 1) {
            const nextIndex = currentChapterIndex + 1;
            currentChapterIndex = nextIndex;
            
            setTimeout(() => {
            if (videoRef) {
                videoRef.play();

                // Masuk fullscreen (hanya jalan jika ada interaksi user)
                if (document.fullscreenElement == null) {
                    videoRef.requestFullscreen?.();
                }
            }
        }, 100);
            toast.success(`Now playing Episode ${nextIndex + 1}`, {
                position: 'bottom-center',
                duration: 2000,
                style: 'background: rgba(157, 80, 187, 0.95); color: white; backdrop-filter: blur(10px);'
            });
        } else {
            toast('🎬 All episodes completed!', {
                position: 'bottom-center',
                duration: 3000,
                style: 'background: rgba(157, 80, 187, 0.95); color: white; backdrop-filter: blur(10px);'
            });
        }
    }

    function handleVideoPlay() {
        isPlaying = true;
    }

    function handleVideoPause() {
        isPlaying = false;
    }

    function handleTimeUpdate(e) {
        const video = e.target;
        videoProgress = (video.currentTime / video.duration) * 100 || 0;
    }

    function getSafeVideoUrl(chapter) {
        if (!chapter.cdnList || chapter.cdnList.length === 0) return '';
        const defaultCdn = chapter.cdnList.find(c => c.isDefault === 1) || chapter.cdnList[0];
        if (!defaultCdn.videoPathList || defaultCdn.videoPathList.length === 0) return '';
        const defaultQuality = defaultCdn.videoPathList.find(q => q.isDefault === 1) || defaultCdn.videoPathList[0];
        return defaultQuality?.videoPath || '';
    }

    function goToPrevious() {
        if (currentChapterIndex > 0) {
            playChapter(currentChapterIndex - 1);
        }
    }

    function goToNext() {
        if (currentChapterIndex < chapters.length - 1) {
            playChapter(currentChapterIndex + 1);
        }
    }

    onMount(() => {
        fetchChapters();
        
        const handleScroll = () => {
            scrollY = window.scrollY;
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    let currentChapter = $derived(chapters[currentChapterIndex]);
    let currentVideo = $derived(currentChapter ? getSafeVideoUrl(currentChapter) : '');
    let currentTitle = $derived(currentChapter?.chapterName || `Episode ${currentChapterIndex + 1}`);
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<Toaster />

<div class="watch-container">
    <!-- Animated Background -->
    <div class="background-layer">
        <div class="gradient-orb orb-1" style="transform: translate({scrollY * 0.08}px, {scrollY * 0.12}px)"></div>
        <div class="gradient-orb orb-2" style="transform: translate({-scrollY * 0.06}px, {scrollY * 0.1}px)"></div>
        <div class="noise-overlay"></div>
    </div>

    <div class="content-wrapper">
        
        <!-- Header with Back Button -->
        <header class="page-header">
            <button onclick={() => goto('/dramabox')} class="back-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                <span>Back</span>
            </button>

            <div class="header-info">
                <h1 class="page-title">Selamat MenontonG</h1>
                <p class="page-subtitle">Drama ID: {dramaId}</p>
            </div>
        </header>

        {#if loading}
            <!-- Loading State -->
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <div class="loading-orbs">
                        <div class="orb"></div>
                        <div class="orb"></div>
                        <div class="orb"></div>
                    </div>
                </div>
                <p class="loading-text">Loading episodes...</p>
            </div>

        {:else if error}
            <!-- Error State -->
            <div class="error-state">
                <div class="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                </div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onclick={fetchChapters} class="retry-button">Try Again</button>
            </div>

        {:else}
            <!-- Main Layout -->
            <div class="main-layout">
                
                <!-- Video Section -->
                <div class="video-section">
                    
                    <!-- Video Player -->
                    <div id="video-player" class="video-player-wrapper">
                        <div class="video-container">
                            {#if currentVideo}
                                {#key currentVideo}
                                    <video 
                                        bind:this={videoRef}
                                        controls 
                                        autoplay 
                                        poster={currentChapter?.chapterImg}
                                        class="video-element"
                                        src={currentVideo}
                                        onended={handleVideoEnded}
                                        onplay={handleVideoPlay}
                                        onpause={handleVideoPause}
                                        ontimeupdate={handleTimeUpdate}
                                    ></video>
                                {/key}
                            {:else}
                                <div class="video-placeholder">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5l-6 4.5z"/>
                                    </svg>
                                    <p>Video not available</p>
                                </div>
                            {/if}
                        </div>

                        <!-- Progress Bar (outside video) -->
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: {videoProgress}%"></div>
                        </div>
                    </div>

                    <!-- Video Info Card -->
                    <div class="video-info-card">
                        <div class="info-header">
                            <div>
                                <h2 class="video-title">{currentTitle}</h2>
                                <p class="video-meta">
                                    Episode {currentChapterIndex + 1} of {chapters.length}
                                </p>
                            </div>
                            
                            <div class="playback-status">
                                {#if isPlaying}
                                    <span class="status-badge playing">
                                        <span class="pulse"></span>
                                        Playing
                                    </span>
                                {:else}
                                    <span class="status-badge paused">Paused</span>
                                {/if}
                            </div>
                        </div>

                        <!-- Navigation Controls -->
                        <div class="episode-navigation">
                            <button 
                                onclick={goToPrevious}
                                disabled={currentChapterIndex === 0}
                                class="nav-button prev"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                </svg>
                                Previous
                            </button>

                            <div class="episode-counter">
                                <span class="counter-number">{currentChapterIndex + 1}</span>
                                <span class="counter-divider">/</span>
                                <span class="counter-total">{chapters.length}</span>
                            </div>

                            <button 
                                onclick={goToNext}
                                disabled={currentChapterIndex === chapters.length - 1}
                                class="nav-button next"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Episodes Sidebar -->
                <aside class="episodes-sidebar">
                    <div class="sidebar-sticky">
                        <div class="sidebar-header">
                            <h3 class="sidebar-title">Episodes</h3>
                            <span class="episode-count">{chapters.length}</span>
                        </div>

                        <div class="episodes-grid-container">
                            <div class="episodes-grid">
                                {#each chapters as chapter, i}
                                    <button
                                        onclick={() => playChapter(i)}
                                        class="episode-button {i === currentChapterIndex ? 'active' : ''}"
                                        title={chapter.chapterName}
                                    >
                                        <span class="episode-number">{i + 1}</span>
                                        {#if i === currentChapterIndex}
                                            <span class="play-indicator">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </span>
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                </aside>

            </div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    * {
        box-sizing: border-box;
    }

    .watch-container {
        min-height: 100vh;
        position: relative;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
    }

    /* Animated Background */
    .background-layer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        overflow: hidden;
    }

    .gradient-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
        opacity: 0.3;
        animation: float 25s ease-in-out infinite;
    }

    .orb-1 {
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, #9d50bb 0%, #6e48aa 100%);
        top: -200px;
        right: -200px;
    }

    .orb-2 {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, #667eea 0%, #764ba2 100%);
        bottom: -150px;
        left: -150px;
        animation-delay: 10s;
    }

    @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(50px, -80px) scale(1.1); }
        66% { transform: translate(-30px, 40px) scale(0.9); }
    }

    .noise-overlay {
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.03;
        mix-blend-mode: overlay;
    }

    .content-wrapper {
        position: relative;
        z-index: 1;
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 24px;
    }

    /* Header */
    .page-header {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 32px 0;
        animation: fadeInDown 0.6s ease-out;
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .back-button svg {
        width: 18px;
        height: 18px;
    }

    .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateX(-4px);
    }

    .header-info {
        flex: 1;
    }

    .page-title {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #ffffff 0%, #e0c3fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .page-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        margin: 4px 0 0;
    }

    /* Loading State */
    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        gap: 32px;
    }

    .loading-spinner {
        position: relative;
        width: 100px;
        height: 100px;
    }

    .spinner {
        position: absolute;
        inset: 0;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: #9d50bb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .loading-orbs {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .loading-orbs .orb {
        width: 10px;
        height: 10px;
        background: #9d50bb;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-orbs .orb:nth-child(1) { animation-delay: -0.32s; }
    .loading-orbs .orb:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }

    .loading-text {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.6);
    }

    /* Error State */
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        text-align: center;
        padding: 40px;
    }

    .error-icon {
        width: 80px;
        height: 80px;
        margin-bottom: 24px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .error-icon svg {
        width: 40px;
        height: 40px;
        color: #ffffff;
    }

    .error-state h3 {
        font-family: 'Playfair Display', serif;
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 12px;
    }

    .error-state p {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 24px;
    }

    .retry-button {
        padding: 14px 32px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .retry-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(157, 80, 187, 0.4);
    }

    /* Main Layout */
    .main-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 32px;
        padding-bottom: 80px;
        animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Video Section */
    .video-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .video-player-wrapper {
        position: relative;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .video-container {
        position: relative;
        aspect-ratio: 16/9;
        background: #000000;
    }

    .video-element {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .video-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: rgba(255, 255, 255, 0.4);
        gap: 16px;
    }

    .video-placeholder svg {
        width: 64px;
        height: 64px;
    }

    .video-placeholder p {
        font-size: 14px;
    }

    .progress-bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #9d50bb 0%, #667eea 100%);
        transition: width 0.1s linear;
        box-shadow: 0 0 8px rgba(157, 80, 187, 0.6);
    }

    /* Video Info Card */
    .video-info-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 24px;
    }

    .info-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        gap: 20px;
    }

    .video-title {
        font-family: 'Playfair Display', serif;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px;
        color: #ffffff;
    }

    .video-meta {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
    }

    .playback-status {
        flex-shrink: 0;
    }

    .status-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-badge.playing {
        background: rgba(157, 80, 187, 0.2);
        color: #e0c3fc;
        border: 1px solid rgba(157, 80, 187, 0.3);
    }

    .status-badge.paused {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .pulse {
        width: 6px;
        height: 6px;
        background: #e0c3fc;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* Episode Navigation */
    .episode-navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .nav-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .nav-button svg {
        width: 18px;
        height: 18px;
    }

    .nav-button:hover:not(:disabled) {
        background: rgba(157, 80, 187, 0.3);
        border-color: rgba(157, 80, 187, 0.5);
        transform: translateY(-2px);
    }

    .nav-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .episode-counter {
        display: flex;
        align-items: baseline;
        gap: 4px;
        font-family: 'Playfair Display', serif;
        color: #ffffff;
    }

    .counter-number {
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, #ffffff 0%, #e0c3fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .counter-divider {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.3);
    }

    .counter-total {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.5);
    }

    /* Episodes Sidebar */
    .episodes-sidebar {
        position: relative;
    }

    .sidebar-sticky {
        position: sticky;
        top: 24px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 24px;
        max-height: calc(100vh - 48px);
        display: flex;
        flex-direction: column;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-title {
        font-family: 'Playfair Display', serif;
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: #ffffff;
    }

    .episode-count {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 12px;
        font-size: 13px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        border-radius: 8px;
    }

    .episodes-grid-container {
        flex: 1;
        overflow-y: auto;
        margin: -4px;
        padding: 4px;
    }

    .episodes-grid-container::-webkit-scrollbar {
        width: 6px;
    }

    .episodes-grid-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }

    .episodes-grid-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .episodes-grid-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }

    .episode-button {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .episode-button:hover {
        background: rgba(157, 80, 187, 0.2);
        border-color: rgba(157, 80, 187, 0.4);
        color: #ffffff;
        transform: scale(1.05);
    }

    .episode-button.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: rgba(157, 80, 187, 0.5);
        color: #ffffff;
        transform: scale(1.08);
        box-shadow: 0 8px 16px rgba(157, 80, 187, 0.4);
    }

    .episode-number {
        position: relative;
        z-index: 1;
    }

    .play-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
    }

    .play-indicator svg {
        width: 10px;
        height: 10px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
        .main-layout {
            grid-template-columns: 1fr 280px;
        }

        .episodes-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 968px) {
        .main-layout {
            grid-template-columns: 1fr;
        }

        .episodes-sidebar {
            order: -1;
        }

        .sidebar-sticky {
            position: static;
            max-height: 300px;
        }

        .episodes-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    @media (max-width: 640px) {
        .content-wrapper {
            padding: 0 16px;
        }

        .page-header {
            padding: 24px 0;
        }

        .page-title {
            font-size: 24px;
        }

        .video-title {
            font-size: 20px;
        }

        .episode-navigation {
            flex-wrap: wrap;
        }

        .episodes-grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }
</style>