<script>
  import { page } from '$app/state';

  // reactive getter
  $: pathname = page.url.pathname;

  $: isDramabox = pathname.startsWith('/dramabox');
  $: isNetshort = pathname.startsWith('/netshort');
</script>

<div class="floating-bar">
  <a
    href="/dramabox"
    class="tab"
    class:active={isDramabox}
  >
    Dramabox
  </a>

  <a
    href="/netshort"
    class="tab"
    class:active={isNetshort}
  >
    Netshort
  </a>
</div>

<style>
.floating-bar {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  
  width: 90%;
  max-width: 500px;
  padding: 6px;

  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);

  border-radius: 999px;

  display: flex;
  gap: 6px;

  z-index: 1000;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 10px 16px;
  border-radius: 999px;

  text-decoration: none;
  color: white;
  font-weight: 500;

  transition: all 0.25s ease;
}

.tab:hover {
  background: rgba(255,255,255,0.1);
}

.tab.active {
  background: white;
  color: black;
  font-weight: 600;
}
</style>
