<script>
    import { onMount } from 'svelte';
    import { toast, Toaster } from 'svelte-french-toast';
    import { debounce } from '$lib/services/functionService';
    import { PUBLIC_API_URL2, PUBLIC_APP_NAME } from '$env/static/public';
    import { goto } from '$app/navigation';
	import FloatingBar from '$lib/components/FloatingBar.svelte';

    // State untuk Data
    let dubIndoItems = $state([]);
    let trendingItems = $state([]);
    let popularItems = $state([]);
    let historyItems = $state([]); // State untuk History
    
    // State untuk UI & Loading
    let loadingDub = $state(true); 
    let loadingTrending = $state(false);
    let loadingPopular = $state(false);
    let loadingSearch = $state(false);
    
    let error = $state('');
    let searchTerm = $state('');
    let scrollY = $state(0);

    // State Pagination untuk Infinite Scroll
    let pageDub = $state(1);
    let hasMoreDub = $state(true);
    let isSearchActive = $state(false);

    const HISTORY_KEY = 'drama_history_v1';
    const MAX_HISTORY = 5;

    // --- HISTORY FUNCTIONS ---
    function loadHistory() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                try {
                    historyItems = JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse history', e);
                }
            }
        }
    }

    function addToHistory(drama) {
        if (!drama) return;

        const newItem = {
            id: drama.id || drama.bookId,
            name: drama.name || drama.bookName,
            cover: drama.cover || drama.coverWap,
            lastEpisode: 1, 
            timestamp: Date.now()
        };

        let newHistory = historyItems.filter(item => item.id !== newItem.id);
        newHistory.unshift(newItem);
        newHistory = newHistory.slice(0, MAX_HISTORY);
        historyItems = newHistory;

        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        }
    }

    // --- 1. FETCH DUB INDO ---
    async function fetchDubIndo(append = false) {
        if (!append) {
            dubIndoItems = [];
            pageDub = 1;
            hasMoreDub = true;
        }
        
        // if (loadingDub || !hasMoreDub) return;
        
        loadingDub = true;
        error = '';

        try {
            if (!PUBLIC_API_URL2) throw new Error("API_URL2 is not defined");

            const apiUrl = `${PUBLIC_API_URL2}/api/dramabox/dubindo?classify=terbaru&page=${pageDub}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (Array.isArray(result)) {
                if (append) {
                    dubIndoItems = [...dubIndoItems, ...result];
                } else {
                    dubIndoItems = result;
                }
                
                if (result.length === 0 || result.length < 20) {
                    hasMoreDub = false;
                } else {
                    pageDub++;
                }
            } else {
                error = 'Format data tidak valid.';
            }
        } catch (err) {
            console.error('Fetch error:', err);
            error = err.message || 'Terjadi kesalahan jaringan.';
            toast.error(error);
        } finally {
            loadingDub = false;
        }
    }

    // --- 2. FETCH TRENDING ---
    async function fetchTrending() {
        loadingTrending = true;
        try {
            if (!PUBLIC_API_URL2) return;
            const apiUrl = `${PUBLIC_API_URL2}/api/dramabox/trending`;
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (Array.isArray(result)) {
                trendingItems = result;
            }
        } catch (err) {
            console.error(err);
        } finally {
            loadingTrending = false;
        }
    }

    // --- 3. FETCH POPULAR SEARCH ---
    async function fetchPopular() {
        loadingPopular = true;
        try {
            if (!PUBLIC_API_URL2) return;
            const apiUrl = `${PUBLIC_API_URL2}/api/dramabox/populersearch`;
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (Array.isArray(result)) {
                popularItems = result;
            }
        } catch (err) {
            console.error(err);
        } finally {
            loadingPopular = false;
        }
    }

    // --- SEARCH FUNCTION (UPDATED) ---
    async function handleSearch() {
        if (!searchTerm.trim()) {
            isSearchActive = false;
            fetchDubIndo(false);
            return;
        }

        isSearchActive = true;
        loadingSearch = true;
        dubIndoItems = [];
        error = '';
        
        try {
            // UPDATE: Endpoint baru & parameter query
            const apiUrl = `${PUBLIC_API_URL2}/api/dramabox/search?query=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (Array.isArray(result)) {
                dubIndoItems = result;
            } else {
                toast.error('Pencarian tidak ditemukan');
                dubIndoItems = [];
            }
        } catch (err) {
            console.error('Search error:', err);
            toast.error('Gagal melakukan pencarian');
        } finally {
            loadingSearch = false;
        }
    }

    // --- UTILITIES ---
    function getExcerpt(content, maxLength = 100) {
        if (!content) return '-';
        const textContent = content.replace(/<[^>]*>/g, '');
        return textContent.length > maxLength
            ? textContent.substring(0, maxLength) + '...'
            : textContent;
    }

    function viewDetail(id,title) {
        goto(`/dramabox/${id}?title=${encodeURIComponent(title)}`);
    }
    
    // --- OBSERVER & LIFECYCLE ---
    let loadMoreTrigger;
    let observer;

    onMount(() => {
        fetchDubIndo(false);
        fetchTrending();
        fetchPopular();
        loadHistory();

        const handleScroll = () => {
            scrollY = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);

        if (typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !isSearchActive && !loadingDub && hasMoreDub) {
                    fetchDubIndo(true);
                }
            }, { rootMargin: '200px' });

            if (loadMoreTrigger) {
                observer.observe(loadMoreTrigger);
            }
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observer) observer.disconnect();
        };
    });

    $effect(() => {
        if (loadMoreTrigger && observer && !isSearchActive) {
            observer.observe(loadMoreTrigger);
        }
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<Toaster />
<FloatingBar currentTitle="Episode 3 - The Journey" /><div class="app-container">
    <!-- Animated Background -->
    <div class="background-layer">
        <div class="gradient-orb orb-1" style="transform: translate({scrollY * 0.1}px, {scrollY * 0.15}px)"></div>
        <div class="gradient-orb orb-2" style="transform: translate({-scrollY * 0.08}px, {scrollY * 0.12}px)"></div>
        <div class="gradient-orb orb-3" style="transform: translate({scrollY * 0.05}px, {-scrollY * 0.1}px)"></div>
        <div class="noise-overlay"></div>
    </div>

    <div class="content-wrapper">
        
        <!-- Hero Header -->
        <header class="hero-header">
            <div class="header-content">
                <div class="title-section">
                    <div class="label">{ PUBLIC_APP_NAME }</div>
                    <h1 class="main-title">
                        {isSearchActive ? 'Search Results' : 'Discover Drama'}
                    </h1>
                    <p class="subtitle">
                        {isSearchActive 
                            ? `Found stories matching "${searchTerm}"` 
                            : 'Curated selection of compelling narratives from around the world'}
                    </p>
                </div>
                
                <div class="search-section">
                    <div class="search-wrapper">
                        <div class="search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            bind:value={searchTerm}
                            oninput={()=>debounce(handleSearch, 800)}
                            class="search-input"
                        />
                        {#if searchTerm}
                            <button onclick={() => { searchTerm = ''; isSearchActive = false; fetchDubIndo(false); }} class="clear-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        {/if}
                    </div>

                    <button 
                        onclick={() => { searchTerm = ''; isSearchActive = false; fetchDubIndo(false); }}
                        class="reset-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg"  class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                        Reset
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            
            {#if isSearchActive}
                <!-- SEARCH RESULTS VIEW ONLY -->
                <div class="section-header">
                    <h2>Search Results</h2>
                </div>
                
                {#if loadingSearch}
                     <div class="drama-grid">
                        {#each Array(12) as _, i}
                            <div class="drama-card skeleton" style="animation-delay: {i * 0.05}s">
                                <div class="card-image skeleton-shimmer"></div>
                                <div class="card-body">
                                    <div class="skeleton-line skeleton-shimmer" style="width: 80%"></div>
                                    <div class="skeleton-line skeleton-shimmer" style="width: 50%"></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else if dubIndoItems.length === 0}
                    <div class="state-card empty-state">
                        <h3>No results found</h3>
                        <p>Try different keywords</p>
                    </div>
                {:else}
                    <!-- SEARCH GRID (Menggunakan style 6 kolom & tanpa deskripsi) -->
                    <div class="drama-grid">
                        {#each dubIndoItems as drama, i (drama.bookId)}
                            <!-- Mapping khusus API Search -->
                            {@const cardData = { 
                                ...drama, 
                                id: drama.bookId, 
                                name: drama.bookName, 
                                cover: drama.cover, 
                                tags: drama.tagNames || [], 
                                playCount: drama.playCount || '0',
                                chapterCount: null // API search tidak ada chapter count
                            }}
                            <article 
                                class="drama-card"
                                onclick={() => { addToHistory(cardData); viewDetail(cardData.id, cardData.name); }}
                            >
                                <div class="card-image-wrapper">
                                    <img 
                                        src={cardData.cover} 
                                        alt={cardData.name} 
                                        class="card-image"
                                        loading="lazy"
                                    />
                                    <div class="image-overlay"></div>
                                    
                                    <!-- Play Badge: Hanya tampil jika ada data -->
                                    {#if cardData.playCount && cardData.playCount !== '0'}
                                        <div class="play-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/>
                                            </svg>
                                            <span>{cardData.playCount}</span>
                                        </div>
                                    {/if}
                                </div>

                                <div class="card-body">
                                    <h3 class="card-title">{cardData.name}</h3>
                                    
                                    <!-- Tags: Tampilkan jika ada -->
                                    <!-- <div class="card-tags">
                                        {#each cardData.tags.slice(0, 2) as tag}
                                            <span class="tag">{tag}</span>
                                        {/each}
                                        {#if cardData.tags.length > 2}
                                            <span class="tag tag-more">+{cardData.tags.length - 2}</span>
                                        {/if}
                                    </div> -->
                                </div>
                            </article>
                        {/each}
                    </div>
                {/if}

            {:else}
                <!-- HOME VIEW (MULTI SECTIONS) -->

                <!-- 0. SECTION: RIWAYAT TONTONAN -->
                {#if historyItems.length > 0}
                    <section class="content-section history-section">
                        <div class="section-header">
                            <h2>Continue Watching</h2>
                        </div>
                        <div class="history-grid">
                            {#each historyItems as item (item.id)}
                                <article 
                                    class="history-card"
                                    onclick={() => viewDetail(item.id, item.name)}
                                >
                                    <div class="history-img-wrapper">
                                        <img 
                                            src={item.cover} 
                                            alt={item.name} 
                                            class="history-img"
                                        />
                                        <div class="history-overlay"></div>
                                    </div>
                                    <div class="history-info">
                                        <h4 class="history-title">{item.name}</h4>
                                        <span class="history-ep">EP {item.lastEpisode}</span>
                                    </div>
                                </article>
                            {/each}
                        </div>
                    </section>
                {/if}

                <!-- 1. SECTION: DUB INDO (Infinite Scroll) -->
                <section class="content-section">
                    <div class="section-header">
                        <h2>Dub Indo & Terbaru</h2>
                    </div>

                    {#if error}
                        <div class="state-card error-state" style="margin: 40px auto;">
                            <h3>Gagal Memuat Data</h3>
                            <p>{error}</p>
                            <button onclick={fetchDubIndo} class="reset-btn" style="margin: 20px auto 0; display: flex;">Coba Lagi</button>
                        </div>

                    {:else if dubIndoItems.length === 0 && loadingDub}
                        <div class="drama-grid">
                            {#each Array(12) as _, i}
                                <div class="drama-card skeleton" style="animation-delay: {i * 0.05}s">
                                    <div class="card-image skeleton-shimmer"></div>
                                    <div class="card-body">
                                        <div class="skeleton-line skeleton-shimmer" style="width: 80%"></div>
                                        <div class="skeleton-line skeleton-shimmer" style="width: 50%"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>

                    {:else if dubIndoItems.length === 0}
                        <div class="state-card empty-state">
                            <h3>Belum ada data</h3>
                            <p>Data sedang kosong atau gagal dimuat.</p>
                        </div>

                    {:else}
                        <!-- DATA GRID (Style: 6 kolom, tanpa deskripsi) -->
                        <div class="drama-grid">
                            {#each dubIndoItems as drama, i (drama.bookId)}
                                {@const cardData = { ...drama, id: drama.bookId, name: drama.bookName, cover: drama.coverWap, cornerName: drama.corner?.name, cornerColor: drama.corner?.color }}
                                <article 
                                    class="drama-card"
                                    onclick={() => { addToHistory(cardData); viewDetail(cardData.id, cardData.name); }}
                                    style="animation-delay: {i * 0.05}s"
                                >
                                    <div class="card-image-wrapper">
                                        <img 
                                            src={cardData.cover} 
                                            alt={cardData.name} 
                                            class="card-image"
                                            loading="lazy"
                                        />
                                        <div class="image-overlay"></div>
                                        
                                        {#if cardData.cornerName}
                                            <div 
                                                class="corner-badge"
                                                style="background: {cardData.cornerColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}"
                                            >
                                                {cardData.cornerName}
                                            </div>
                                        {/if}

                                        <div class="play-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/>
                                            </svg>
                                            <span>{cardData.playCount}</span>
                                        </div>
                                    </div>

                                    <div class="card-body">
                                        <h3 class="card-title">{cardData.name}</h3>
                                        
                                        <!-- Tags Saja (Description dihilangkan sesuai style baru) -->
                                        <!-- <div class="card-tags">
                                            {#each cardData.tags.slice(0, 2) as tag}
                                                <span class="tag">{tag}</span>
                                            {/each}
                                            {#if cardData.tags.length > 2}
                                                <span class="tag tag-more">+{cardData.tags.length - 2}</span>
                                            {/if}
                                        </div> -->
                                    </div>
                                </article>
                            {/each}
                        </div>
                        
                        <!-- Infinite Scroll Trigger -->
                        {#if hasMoreDub}
                            <div class="load-more-container" bind:this={loadMoreTrigger}>
                                {#if loadingDub}
                                    <div class="loading-spinner"></div>
                                {:else}
                                    <span class="text-xs text-gray-400">Scroll for more</span>
                                {/if}
                            </div>
                        {/if}
                    {/if}
                </section>

                <!-- 2. SECTION: TRENDING (Horizontal Scroll) -->
                {#if trendingItems.length > 0}
                    <section class="content-section">
                        <div class="section-header">
                            <h2>Trending Now 🔥</h2>
                        </div>
                        
                        <div class="horizontal-scroll-container">
                            {#each trendingItems as drama (drama.bookId)}
                                {@const cardData = { ...drama, id: drama.bookId, name: drama.bookName, cover: drama.coverWap, cornerName: drama.corner?.name, cornerColor: drama.corner?.color }}
                                <div class="h-scroll-card" onclick={() => { addToHistory(cardData); viewDetail(cardData.id, cardData.name); }}>
                                    <div class="h-scroll-image">
                                        <img src={cardData.cover} alt={cardData.name} loading="lazy" />
                                        {#if cardData.cornerName}
                                            <span class="h-scroll-badge" style="background: {cardData.cornerColor}">
                                                {cardData.cornerName}
                                            </span>
                                        {/if}
                                    </div>
                                    <div class="h-scroll-info">
                                        <h4>{cardData.name}</h4>
                                        <span>{cardData.playCount} views</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}

                <!-- 3. SECTION: POPULAR SEARCH (Grid) -->
                {#if popularItems.length > 0}
                    <section class="content-section">
                        <div class="section-header">
                            <h2>Popular Search</h2>
                        </div>
                        <div class="drama-grid popular-grid">
                            {#each popularItems as drama (drama.bookId)}
                                {@const cardData = { ...drama, id: drama.bookId, name: drama.bookName, cover: drama.coverWap, cornerName: drama.corner?.name, cornerColor: drama.corner?.color }}
                                <article 
                                    class="drama-card popular-card"
                                    onclick={() => { addToHistory(cardData); viewDetail(cardData.id, cardData.name); }}
                                >
                                    <div class="card-image-wrapper">
                                        <img 
                                            src={cardData.cover} 
                                            alt={cardData.name} 
                                            class="card-image"
                                            loading="lazy"
                                        />
                                        <div class="image-overlay"></div>
                                        
                                        <div class="play-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/>
                                            </svg>
                                            <span>{cardData.playCount}</span>
                                        </div>
                                    </div>

                                    <div class="card-body">
                                        <h3 class="card-title">{cardData.name}</h3>
                                        <!-- <div class="card-tags">
                                            {#each cardData.tags.slice(0, 2) as tag}
                                                <span class="tag">{tag}</span>
                                            {/each}
                                        </div> -->
                                    </div>
                                </article>
                            {/each}
                        </div>
                    </section>
                {/if}

            {/if}
        </main>
    </div>
</div>

<style>
    :global(body) { margin: 0; padding: 0; overflow-x: hidden; }
    * { box-sizing: border-box; }

    .app-container {
        min-height: 100vh;
        position: relative;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1a1a2e;
        overflow-x: hidden;
    }

    .background-layer {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        overflow: hidden;
    }

    .gradient-orb {
        position: absolute; border-radius: 50%;
        filter: blur(80px); opacity: 0.4;
        animation: float 20s ease-in-out infinite;
    }

    .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #9d50bb 0%, #6e48aa 100%); top: -200px; right: -100px; animation-delay: 0s; }
    .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #667eea 0%, #764ba2 100%); bottom: -150px; left: -150px; animation-delay: 7s; }
    .orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #f093fb 0%, #f5576c 100%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 14s; }

    @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .noise-overlay {
        position: absolute; inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.03; mix-blend-mode: overlay;
    }

    .content-wrapper { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 0 24px; }

    /* Hero Header */
    .hero-header { padding: 80px 0 60px; animation: fadeInUp 0.8s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    .header-content { display: grid; gap: 48px; }
    .title-section { text-align: center; }
    .label {
        display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
        color: #f5f5f5; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
        padding: 8px 20px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); margin-bottom: 24px;
    }
    .main-title {
        font-family: 'Playfair Display', serif; font-size: clamp(48px, 8vw, 92px); font-weight: 900; line-height: 1.1; margin: 0 0 20px;
        background: linear-gradient(135deg, #ffffff 0%, #e0c3fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; letter-spacing: -0.02em;
    }
    .subtitle { font-size: 18px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); max-width: 600px; margin: 0 auto; }

    .search-section { display: flex; gap: 16px; max-width: 600px; margin: 0 auto; }
    .search-wrapper { flex: 1; position: relative; }
    .search-icon {
        position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
        width: 20px; height: 20px; color: rgba(255, 255, 255, 0.4); pointer-events: none;
    }
    .search-input {
        width: 100%; height: 56px; padding: 0 56px 0 52px; font-size: 16px; font-family: 'DM Sans', sans-serif;
        color: #ffffff; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; outline: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .search-input::placeholder { color: rgba(255, 255, 255, 0.4); }
    .search-input:focus {
        background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.4);
        box-shadow: 0 8px 32px rgba(157, 80, 187, 0.3);
    }
    .clear-btn {
        position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
        background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer;
        transition: all 0.2s; padding: 0;
    }
    .clear-btn:hover { color: rgba(255, 255, 255, 0.9); transform: translateY(-50%) scale(1.1); }
    .reset-btn {
        height: 56px; padding: 0 24px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
        color: #ffffff; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; cursor: pointer;
        display: flex; align-items: center; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;
    }
    .reset-btn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); transform: translateY(-2px); }

    /* Main Content */
    .main-content { padding-bottom: 80px; }
    
    .content-section { margin-bottom: 60px; }
    .section-header { margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
    .section-header h2 {
        font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #ffffff;
        margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    /* --- HISTORY SECTION --- */
    .history-section {
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 60px !important;
    }
    .history-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 16px;
    }
    @media (min-width: 640px) { .history-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 1024px) { .history-grid { grid-template-columns: repeat(6, 1fr); } }

    .history-card {
        cursor: pointer;
        transition: transform 0.2s;
    }
    .history-card:hover { transform: scale(1.05); }
    .history-img-wrapper {
        position: relative;
        aspect-ratio: 2/3;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .history-img { width: 100%; height: 100%; object-fit: cover; }
    .history-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%);
    }
    .history-info { padding: 0 4px; }
    .history-title {
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 4px 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .history-ep {
        font-size: 10px;
        font-weight: 600;
        color: #e0c3fc;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* --- NORMAL DRAMA GRID (UPDATED CSS) --- */
    .drama-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr); /* 6 Columns sesuai request */
        gap: 32px;
    }

    .drama-card {
        background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 24px; overflow: hidden;
        cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.5); animation: cardFadeIn 0.6s ease-out backwards;
    }
    @keyframes cardFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .drama-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 48px rgba(157, 80, 187, 0.3); border-color: rgba(255, 255, 255, 0.8); }

    .card-image-wrapper { position: relative; aspect-ratio: 2/3; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    .drama-card:hover .card-image { transform: scale(1.1); }
    .image-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%); opacity: 0.6; }
    .corner-badge {
        position: absolute; top: 16px; left: 16px; padding: 8px 16px; font-size: 11px; font-weight: 700;
        letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff; border-radius: 12px;
        backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .play-badge {
        position: absolute; bottom: 16px; right: 16px; display: flex; align-items: center; gap: 6px;
        padding: 8px 12px; font-size: 12px; font-weight: 600; color: #ffffff;
        background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); border-radius: 12px;
    }
    .play-badge svg { width: 14px; height: 14px; }

    .card-body { padding: 24px; }
    .card-title {
        font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; line-height: 1.3; margin: 0 0 12px;
        color: #1a1a2e; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .chapter-info { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: #6e48aa; margin-bottom: 12px; }
    .chapter-info svg { width: 16px; height: 16px; }
    
    /* Description di-hide sesuai request style baru */
    .card-description { display: none; }

    .card-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
        font-size: 11px; font-weight: 600; padding: 6px 12px;
        background: linear-gradient(135deg, rgba(157, 80, 187, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        color: #6e48aa; border-radius: 8px; border: 1px solid rgba(157, 80, 187, 0.2);
    }
    .tag-more { background: rgba(0, 0, 0, 0.05); color: #999; border-color: rgba(0, 0, 0, 0.1); }

    /* Load More / Infinite Scroll */
    .load-more-container {
        display: flex; justify-content: center; align-items: center; padding: 40px 0;
        width: 100%;
    }
    .loading-spinner {
        width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Horizontal Scroll Styling */
    .horizontal-scroll-container {
        display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px;
        scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }
    .horizontal-scroll-container::-webkit-scrollbar { display: none; }
    
    .h-scroll-card {
        flex: 0 0 200px; scroll-snap-align: start; cursor: pointer; transition: transform 0.2s;
    }
    .h-scroll-card:hover { transform: translateY(-5px); }
    .h-scroll-image {
        position: relative; aspect-ratio: 2/3; border-radius: 16px; overflow: hidden; margin-bottom: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .h-scroll-image img { width: 100%; height: 100%; object-fit: cover; }
    .h-scroll-badge {
        position: absolute; top: 8px; left: 8px; padding: 4px 8px; font-size: 10px; font-weight: 700;
        color: white; border-radius: 6px; backdrop-filter: blur(4px);
    }
    .h-scroll-info h4 {
        font-size: 14px; font-weight: 700; color: white; margin: 0 0 4px 0;
        display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }
    .h-scroll-info span { font-size: 12px; color: rgba(255,255,255,0.7); }

    /* Popular Grid (Smaller) */
    .popular-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
    }
    .popular-card .card-body { padding: 16px; }
    .popular-card .card-title { font-size: 10px; }

    /* Skeleton & States */
    .skeleton { pointer-events: none; }
    .skeleton-shimmer {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
        background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .skeleton-line { height: 12px; border-radius: 6px; margin-bottom: 8px; }

    .state-card {
        max-width: 500px; margin: 80px auto; padding: 60px 40px; text-align: center;
        background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
        border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .state-icon {
        width: 64px; height: 64px; margin: 0 auto 24px; color: rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
    }
    .state-icon svg { width: 32px; height: 32px; }
    .state-card h3 {
        font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; margin: 0 0 12px; color: #1a1a2e;
    }
    .state-card p { font-size: 16px; line-height: 1.6; color: #5a5a6e; margin: 0; }
    .error-state .state-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

    /* Responsive */
    @media (max-width: 768px) {
        .hero-header { padding: 60px 0 40px; }
        .main-title { font-size: 48px; }
        .search-section { flex-direction: column; }
        .drama-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
        .content-wrapper { padding: 0 16px; }
    }
    @media (max-width: 480px) {
        .drama-grid { grid-template-columns: 1fr 1fr; } /* 2 col di mobile biar gak kecil banget */
        .popular-grid { grid-template-columns: 1fr 1fr; }
    }
</style>