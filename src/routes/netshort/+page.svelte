<script>
    import { onMount } from 'svelte';
    import { toast, Toaster } from 'svelte-french-toast';
    import { debounce } from '$lib/services/functionService';
    import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
    import { goto } from '$app/navigation';
	import FloatingBar from '$lib/components/FloatingBar.svelte';

    // --- STATE ---
    let netshortItems = $state([]); // Data utama (For You atau Search Result)
    let historyItems = $state([]);  // Data History Netshort
    
    // UI States
    let loadingForYou = $state(true);
    let loadingSearch = $state(false);
    let error = $state('');
    let searchTerm = $state('');
    let scrollY = $state(0);
    let isSearchActive = $state(false);

    // --- HISTORY CONSTANTS ---
    const HISTORY_KEY = 'netshort_history_v1'; // Key terpisah untuk Netshort
    const MAX_HISTORY = 5;

    // --- HISTORY FUNCTIONS ---
    function loadHistory() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                try {
                    historyItems = JSON.parse(saved);
                } catch (e) {
                    console.error('Gagal memuat history Netshort', e);
                }
            }
        }
    }

    function addToHistory(item) {
        if (!item || !item.id) return;

        const newItem = {
            id: item.id,
            name: item.name,
            cover: item.cover,
            lastWatched: Date.now()
        };

        // Hapus item lama yang sama, masukkan ke paling depan
        let newHistory = historyItems.filter(i => i.id !== newItem.id);
        newHistory.unshift(newItem);
        
        // Batasi jumlah item
        if (newHistory.length > MAX_HISTORY) {
            newHistory = newHistory.slice(0, MAX_HISTORY);
        }
        
        historyItems = newHistory;

        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        }
    }

    // --- 1. FETCH FOR YOU ---
    async function fetchForYou() {
        loadingForYou = true;
        error = '';
        netshortItems = [];

        try {
            if (!PUBLIC_API_URL) throw new Error("API_URL not defined");

            const apiUrl = `${PUBLIC_API_URL}/api/netshort/foryou`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            // Mapping respons API "For You"
            // API mengembalikan objek dengan properti 'contentInfos'
            if (result && Array.isArray(result.contentInfos)) {
                netshortItems = result.contentInfos.map(mapNetshortData);
            } else {
                throw new Error("Format data For You tidak valid");
            }
        } catch (err) {
            console.error('Fetch For You error:', err);
            error = err.message || 'Gagal memuat rekomendasi.';
            toast.error(error);
        } finally {
            loadingForYou = false;
        }
    }

    // --- 2. SEARCH FUNCTION ---
    async function handleSearch() {
        if (!searchTerm.trim()) {
            isSearchActive = false;
            fetchForYou(); // Kembali ke tampilan For You
            return;
        }

        isSearchActive = true;
        loadingSearch = true;
        netshortItems = [];
        error = '';

        try {
            const query = encodeURIComponent(searchTerm);
            const apiUrl = `${PUBLIC_API_URL}/api/netshort/search?query=${query}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            // Mapping respons API "Search"
            // API mengembalikan objek dengan properti 'searchCodeSearchResult'
            if (result && Array.isArray(result.searchCodeSearchResult)) {
                netshortItems = result.searchCodeSearchResult.map(mapNetshortData);
            } else {
                toast.error('Pencarian tidak ditemukan');
                netshortItems = [];
            }
        } catch (err) {
            console.error('Search error:', err);
            toast.error('Gagal melakukan pencarian');
        } finally {
            loadingSearch = false;
        }
    }

    // --- HELPER: MAPPING DATA (NORMALISASI) ---
    // Fungsi ini menyamakan struktur data antara API For You dan Search
    // agar komponen UI (Card) tidak perlu bingung dengan nama field yang beda.
    function mapNetshortData(item) {
        return {
            id: item.shortPlayId,
            name: item.shortPlayName,
            cover: item.shortPlayCover,
            // Tags: For You pakai 'labelArray', Search pakai 'labelNameList'
            tags: item.labelArray || item.labelNameList || [],
            // Views/Heat: For You pakai 'heatScoreShow', Search pakai 'formatHeatScore'
            views: item.heatScoreShow || item.formatHeatScore || '0',
            // Badge Status: Contoh "Baru"
            badge: item.scriptName || null,
            // Extra info untuk search (opsional)
            desc: item.starMessage || ''
        };
    }

    function viewDetail(id) {
        // Arahkan ke rute Netshort
        goto(`/netshort/${id}`);
    }

    // --- LIFECYCLE ---
    onMount(() => {
        fetchForYou();
        loadHistory();

        const handleScroll = () => {
            scrollY = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<Toaster />
<FloatingBar />

<div class="app-container">
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
                    <div class="label">NETSHORT</div>
                    <h1 class="main-title">
                        {isSearchActive ? 'Search Results' : 'Short Stories'}
                    </h1>
                    <p class="subtitle">
                        {isSearchActive 
                            ? `Results for "${searchTerm}"` 
                            : 'Binge-worthy short dramas anytime, anywhere.'}
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
                            placeholder="Search netshort..."
                            bind:value={searchTerm}
                            oninput={()=>debounce(handleSearch, 800)}
                            class="search-input"
                        />
                        {#if searchTerm}
                            <button onclick={() => { searchTerm = ''; isSearchActive = false; fetchForYou(); }} class="clear-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        {/if}
                    </div>

                    <button 
                        onclick={() => { searchTerm = ''; isSearchActive = false; fetchForYou(); }}
                        class="reset-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
                <!-- SEARCH RESULTS VIEW -->
                <div class="section-header">
                    <h2>Search Results</h2>
                </div>
                
                {#if loadingSearch}
                     <div class="netshort-grid">
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
                {:else if netshortItems.length === 0}
                    <div class="state-card empty-state">
                        <h3>No results found</h3>
                        <p>Try different keywords</p>
                    </div>
                {:else}
                    <div class="netshort-grid">
                        {#each netshortItems as item, i (item.id)}
                            <article 
                                class="drama-card"
                                onclick={() => { addToHistory(item); viewDetail(item.id); }}
                            >
                                <div class="card-image-wrapper">
                                    <img 
                                        src={item.cover} 
                                        alt={item.name} 
                                        class="card-image"
                                        loading="lazy"
                                    />
                                    <div class="image-overlay"></div>
                                    
                                    <!-- Status Badge (Script Name) -->
                                    {#if item.badge}
                                        <div class="corner-badge">{item.badge}</div>
                                    {/if}

                                    <div class="play-badge">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/>
                                        </svg>
                                        <span>{item.views}</span>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <h3 class="card-title">{item.name}</h3>
                                    <div class="card-tags">
                                        {#each item.tags.slice(0, 2) as tag}
                                            <span class="tag">{tag}</span>
                                        {/each}
                                        {#if item.tags.length > 2}
                                            <span class="tag tag-more">+{item.tags.length - 2}</span>
                                        {/if}
                                    </div>
                                </div>
                            </article>
                        {/each}
                    </div>
                {/if}

            {:else}
                <!-- HOME VIEW: HISTORY & FOR YOU -->

                <!-- 1. SECTION: HISTORY (NETSHORT) -->
                {#if historyItems.length > 0}
                    <section class="content-section history-section">
                        <div class="section-header">
                            <h2>Continue Watching</h2>
                        </div>
                        <div class="history-grid">
                            {#each historyItems as item (item.id)}
                                <article 
                                    class="history-card"
                                    onclick={() => viewDetail(item.id)}
                                >
                                    <div class="history-img-wrapper">
                                        <img 
                                            src={item.cover} 
                                            alt={item.name} 
                                            class="history-img"
                                        />
                                        <div class="history-overlay"></div>
                                        <div class="play-icon-overlay">
                                            <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                    <div class="history-info">
                                        <h4 class="history-title">{item.name}</h4>
                                        <span class="history-ep">Watch Again</span>
                                    </div>
                                </article>
                            {/each}
                        </div>
                    </section>
                {/if}

                <!-- 2. SECTION: FOR YOU -->
                <section class="content-section">
                    <div class="section-header">
                        <h2>For You</h2>
                    </div>

                    {#if error}
                        <div class="state-card error-state" style="margin: 40px auto;">
                            <h3>Gagal Memuat Data</h3>
                            <p>{error}</p>
                            <button onclick={fetchForYou} class="reset-btn" style="margin: 20px auto 0; display: flex;">Coba Lagi</button>
                        </div>

                    {:else if netshortItems.length === 0 && loadingForYou}
                        <div class="netshort-grid">
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

                    {:else if netshortItems.length === 0}
                        <div class="state-card empty-state">
                            <h3>Belum ada data</h3>
                            <p>Data sedang kosong atau gagal dimuat.</p>
                        </div>

                    {:else}
                        <!-- FOR YOU GRID (Style: Netshort Vertical Video 3:4) -->
                        <div class="netshort-grid">
                            {#each netshortItems as item, i (item.id)}
                                <article 
                                    class="drama-card"
                                    onclick={() => { addToHistory(item); viewDetail(item.id); }}
                                    style="animation-delay: {i * 0.05}s"
                                >
                                    <div class="card-image-wrapper">
                                        <img 
                                            src={item.cover} 
                                            alt={item.name} 
                                            class="card-image"
                                            loading="lazy"
                                        />
                                        <div class="image-overlay"></div>
                                        
                                        {#if item.badge}
                                            <div class="corner-badge">{item.badge}</div>
                                        {/if}

                                        <div class="play-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/>
                                            </svg>
                                            <span>{item.views}</span>
                                        </div>
                                    </div>

                                    <div class="card-body">
                                        <h3 class="card-title">{item.name}</h3>
                                        
                                        <div class="card-tags">
                                            {#each item.tags.slice(0, 2) as tag}
                                                <span class="tag">{tag}</span>
                                            {/each}
                                            {#if item.tags.length > 2}
                                                <span class="tag tag-more">+{item.tags.length - 2}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </article>
                            {/each}
                        </div>
                    {/if}
                </section>
            {/if}
        </main>
    </div>
</div>

<style>
    :global(body) { margin: 0; padding: 0; overflow-x: hidden; background-color: #0f0c29; }
    * { box-sizing: border-box; }

    .app-container {
        min-height: 100vh;
        position: relative;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1a1a2e;
        overflow-x: hidden;
    }

    /* --- BACKGROUND & GENERAL --- */
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
    .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #f093fb 0%, #f5576c 100%); top: -200px; right: -100px; animation-delay: 0s; }
    .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #4facfe 0%, #00f2fe 100%); bottom: -150px; left: -150px; animation-delay: 7s; }
    .orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #43e97b 0%, #38f9d7 100%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 14s; }

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

    /* --- HERO HEADER --- */
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
        background: linear-gradient(135deg, #ffffff 0%, #a8edea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
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
        box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
    }
    .clear-btn {
        position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
        background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer;
        transition: all 0.2s; padding: 0;
    }
    .reset-btn {
        height: 56px; padding: 0 24px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
        color: #ffffff; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; cursor: pointer;
        display: flex; align-items: center; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;
    }
    .reset-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

    /* --- CONTENT SECTIONS --- */
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
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;
    }
    @media (min-width: 640px) { .history-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 1024px) { .history-grid { grid-template-columns: repeat(6, 1fr); } }

    .history-card {
        cursor: pointer;
        transition: transform 0.2s;
        position: relative;
    }
    .history-card:hover { transform: scale(1.05); }
    .history-img-wrapper {
        position: relative;
        aspect-ratio: 3/4; /* Netshort Vertical Ratio */
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .history-img { width: 100%; height: 100%; object-fit: cover; }
    .history-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%);
    }
    .play-icon-overlay {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8);
        width: 40px; height: 40px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: all 0.3s;
    }
    .history-card:hover .play-icon-overlay { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    .play-icon-overlay svg { width: 20px; height: 20px; fill: white; }
    
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
        color: #a8edea;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* --- NETSHORT GRID (3:4 RATIO) --- */
    .netshort-grid {
        display: grid;
        /* Grid otomatis responsif, tapi kita targetkan sekitar 6 kolom di layar besar */
        grid-template-columns: repeat(5, 1fr); 
        gap: 24px;
    }

    .drama-card {
        background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 24px; overflow: hidden;
        cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.5); animation: cardFadeIn 0.6s ease-out backwards;
    }
    @keyframes cardFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .drama-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 48px rgba(79, 172, 254, 0.3); border-color: rgba(255, 255, 255, 0.8); }

    /* Aspect Ratio 3:4 khusus Netshort (540x720) */
    .card-image-wrapper { position: relative; aspect-ratio: 3/4; overflow: hidden; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    .drama-card:hover .card-image { transform: scale(1.1); }
    .image-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%); opacity: 0.6; }
    
    .corner-badge {
        position: absolute; top: 12px; left: 12px; padding: 6px 12px; font-size: 10px; font-weight: 700;
        letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff; border-radius: 8px;
        background: rgba(244, 63, 94, 0.9); backdrop-filter: blur(4px);
    }
    .play-badge {
        position: absolute; bottom: 12px; right: 12px; display: flex; align-items: center; gap: 4px;
        padding: 6px 10px; font-size: 11px; font-weight: 600; color: #ffffff;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); border-radius: 8px;
    }
    .play-badge svg { width: 12px; height: 12px; }

    .card-body { padding: 16px; }
    .card-title {
        font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; line-height: 1.3; margin: 0 0 10px;
        color: #1a1a2e; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag {
        font-size: 10px; font-weight: 600; padding: 4px 8px;
        background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
        color: #0072ff; border-radius: 6px; border: 1px solid rgba(79, 172, 254, 0.2);
    }
    .tag-more { background: rgba(0, 0, 0, 0.05); color: #999; border-color: rgba(0, 0, 0, 0.1); }

    /* --- SKELETON & STATES --- */
    .skeleton { pointer-events: none; }
    .skeleton-shimmer {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
        background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .skeleton-line { height: 10px; border-radius: 6px; margin-bottom: 6px; }

    .state-card {
        max-width: 500px; margin: 80px auto; padding: 60px 40px; text-align: center;
        background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
        border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .state-card h3 {
        font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; margin: 0 0 12px; color: #1a1a2e;
    }
    .state-card p { font-size: 16px; line-height: 1.6; color: #5a5a6e; margin: 0; }

    /* --- RESPONSIVE --- */
    @media (max-width: 1024px) {
        .netshort-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 768px) {
        .hero-header { padding: 60px 0 40px; }
        .main-title { font-size: 48px; }
        .search-section { flex-direction: column; }
        .netshort-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
        .content-wrapper { padding: 0 16px; }
    }
    @media (max-width: 480px) {
        .netshort-grid { grid-template-columns: 1fr 1fr; gap: 12px; } /* 2 col di mobile */
        .card-body { padding: 12px; }
        .card-title { font-size: 10px; }
    }
</style>