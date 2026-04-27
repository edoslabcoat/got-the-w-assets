// got-the-w production runtime
// Lightbox + scroll-scrub interludes + hero fade + reveal-on-scroll
(function(){
  // Set this once you've uploaded the 3 frame folders to GitHub Pages.
  // Example: 'https://yourname.github.io/got-the-w-assets/'
  // (must end with trailing slash)
  var FRAMES_BASE = 'https://edoslabcoat.github.io/got-the-w-assets/';

  // ===== LIGHTBOX (Vimeo reel) =====
  var VIMEO_ID = '1186729876'; // edit here to swap reel
  var lightbox = document.getElementById('lightbox');
  var lbIframe = document.getElementById('lightbox-iframe');
  var playBtn = document.getElementById('play-reel');
  var poster = document.getElementById('poster');
  var closeBtn = document.getElementById('lightbox-close');
  var reelCta = document.getElementById('reel-cta');

  function openReel(){
    lbIframe.src = 'https://player.vimeo.com/video/' + VIMEO_ID + '?autoplay=1&title=0&byline=0&portrait=0&color=E5D6B5';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeReel(){
    lbIframe.src = '';
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (playBtn)  playBtn.addEventListener('click', openReel);
  if (poster)   poster.addEventListener('click', openReel);
  if (reelCta)  reelCta.addEventListener('click', openReel);
  if (closeBtn) closeBtn.addEventListener('click', closeReel);
  if (lightbox) lightbox.addEventListener('click', function(e){ if (e.target === lightbox) closeReel(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeReel(); });

  // ===== REVEAL-ON-SCROLL =====
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if (en.isIntersecting) en.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach(function(el){ io.observe(el); });

  // ===== SCROLL UTILITIES =====
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function easeOut(t){ return 1 - Math.pow(1 - t, 2); }
  function progressOf(el){
    var r = el.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-r.top / total, 0, 1);
  }

  // ===== HERO FADE =====
  var heroContent = document.getElementById('hero-content');
  function renderHeroFade(){
    if (!heroContent) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight || 1;
    var fade = clamp(1 - (y / (vh * 0.7)), 0, 1);
    heroContent.style.setProperty('--hero-fade', fade.toFixed(3));
  }

  // ===== SCROLL SCRUB (frame sequences) =====
  function createScrub(opts){
    var wrap = document.getElementById(opts.wrapId);
    if (!wrap) return function(){};
    var band = opts.bandId && document.getElementById(opts.bandId);
    var layerA = document.getElementById(opts.layerAId);
    var layerB = document.getElementById(opts.layerBId);
    var progress = opts.progressId && document.getElementById(opts.progressId);
    var headline = opts.headlineId && document.getElementById(opts.headlineId);
    var headlineRevealAt = opts.headlineRevealAt || 0.18;

    var frameUrls = [];
    for (var i = 1; i <= opts.count; i++){
      var idx = String(i).padStart(3, '0');
      var url = opts.framesDir + '/frame-' + idx + '.jpg';
      var img = new Image(); img.src = url;
      frameUrls.push(url);
    }

    var activeLayer = layerA, nextLayer = layerB;
    var activeIdx = -1, nextIdx = -1;
    activeLayer.style.opacity = '1';
    nextLayer.style.opacity = '0';

    function setSrc(layer, url){
      if (layer.dataset.src !== url){ layer.src = url; layer.dataset.src = url; }
    }

    var PLAY_IN = 0.02, PLAY_OUT = 0.62, DRIFT_OUT = 0.90;

    return function render(){
      var t = progressOf(wrap);
      var fp = clamp((t - PLAY_IN) / (PLAY_OUT - PLAY_IN), 0, 1);
      var f = clamp(fp * opts.count, 0, opts.count - 0.0001);
      var i = Math.floor(f);
      var frac = f - i;
      var j = Math.min(opts.count - 1, i + 1);

      if (i !== activeIdx){ setSrc(activeLayer, frameUrls[i]); activeIdx = i; }
      if (j !== nextIdx){   setSrc(nextLayer, frameUrls[j]);   nextIdx = j; }
      nextLayer.style.opacity = frac.toFixed(3);
      if (frac > 0.999){
        var tmp = activeLayer; activeLayer = nextLayer; nextLayer = tmp;
        activeLayer.style.opacity = '1';
        nextLayer.style.opacity = '0';
        activeIdx = j; nextIdx = -1;
      }

      if (band){
        var shift = clamp((t - PLAY_OUT) / (DRIFT_OUT - PLAY_OUT), 0, 1);
        var fadeIn = clamp(t / PLAY_IN, 0, 1);
        var fadeOut = clamp((t - DRIFT_OUT) / (1 - DRIFT_OUT), 0, 1);
        var opacity = Math.min(fadeIn, 1 - fadeOut);
        band.style.setProperty('--shift', easeOut(shift).toFixed(3));
        band.style.setProperty('--band-opacity', opacity.toFixed(3));
      }

      if (progress) progress.style.width = (fp * 100).toFixed(1) + '%';
      if (headline){
        if (fp > headlineRevealAt) headline.classList.add('in');
        else headline.classList.remove('in');
      }
    };
  }

  var renderDriftScrub = createScrub({
    wrapId: 'interlude-drift', bandId: 'scrub-band-drift',
    layerAId: 'scrub-layer-a', layerBId: 'scrub-layer-b',
    framesDir: FRAMES_BASE + 'frames', count: 80, progressId: 'scrub-progress'
  });
  var renderHockeyScrub = createScrub({
    wrapId: 'interlude-hockey', bandId: 'scrub-band-hockey',
    layerAId: 'scrub-layer-hockey-a', layerBId: 'scrub-layer-hockey-b',
    framesDir: FRAMES_BASE + 'frames-hockey', count: 80, progressId: 'scrub-progress-hockey'
  });
  var renderBasketballScrub = createScrub({
    wrapId: 'interlude-basketball', bandId: 'scrub-band-basketball',
    layerAId: 'scrub-layer-basketball-a', layerBId: 'scrub-layer-basketball-b',
    framesDir: FRAMES_BASE + 'frames-basketball', count: 80, progressId: 'scrub-progress-basketball'
  });

  var rafId = null;
  function tick(){
    renderDriftScrub();
    renderHockeyScrub();
    renderBasketballScrub();
    renderHeroFade();
    rafId = null;
  }
  function onScroll(){ if (!rafId) rafId = requestAnimationFrame(tick); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
})();
