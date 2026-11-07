import * as THREE from 'three';

/**
 * Creates high-fidelity textures for celestial bodies and spacecraft.
 * Provides authentic SVG textures for ISS, Tiangong, Hubble, and communication satellites.
 */
class TextureFactory {
  private canvasCache = new Map<string, THREE.CanvasTexture>();
  private loader = new THREE.TextureLoader();
  private imageCache = new Map<string, THREE.Texture>();

  /**
   * Loads or returns cached image texture for spacecraft
   */
  getSpacecraftTexture(type: 'iss' | 'tiangong' | 'hubble' | 'satellite'): THREE.Texture {
    if (this.imageCache.has(type)) {
      return this.imageCache.get(type)!;
    }

    let url = '/images/satellites/satellite_comms.svg';
    if (type === 'iss') url = '/images/satellites/iss.svg';
    else if (type === 'tiangong') url = '/images/satellites/tiangong.svg';
    else if (type === 'hubble') url = '/images/satellites/hubble.svg';

    const texture = this.loader.load(url);
    this.imageCache.set(type, texture);
    return texture;
  }

  /**
   * Loads or returns authentic image texture for asteroids (Ceres, Vesta, Psyche, Bennu, Ryugu, Eros, Apophis, or generic)
   */
  getAsteroidTexture(variant: string = 'generic'): THREE.Texture {
    const key = `asteroid-${variant.toLowerCase()}`;
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    let file = 'generic_asteroid.svg';
    const v = variant.toLowerCase();
    if (v.includes('ceres')) file = 'ceres.svg';
    else if (v.includes('vesta')) file = 'vesta.svg';
    else if (v.includes('psyche')) file = 'psyche.svg';
    else if (v.includes('bennu')) file = 'bennu.svg';
    else if (v.includes('ryugu')) file = 'ryugu.svg';
    else if (v.includes('eros')) file = 'eros.svg';
    else if (v.includes('apophis')) file = 'apophis.svg';

    const url = `/images/asteroids/${file}`;
    const texture = this.loader.load(url);
    this.imageCache.set(key, texture);
    return texture;
  }

  /**
   * Earth texture: Photorealistic globe showing oceans, continents, and cloud swirls
   */
  getEarthTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('earth')) return this.canvasCache.get('earth')!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Deep Ocean Base (Equirectangular projection)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#0c2340');
    oceanGrad.addColorStop(0.5, '#0284c7');
    oceanGrad.addColorStop(1, '#0c2340');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Continents in Equirectangular Map (Approximate landmass silhouettes)
    ctx.fillStyle = '#15803d'; // Vegetation green
    ctx.strokeStyle = '#ca8a04'; // Coastal ochre
    ctx.lineWidth = 1.5;

    // North America
    ctx.beginPath();
    ctx.moveTo(120, 80);
    ctx.bezierCurveTo(200, 70, 260, 110, 230, 180);
    ctx.bezierCurveTo(220, 240, 180, 260, 190, 290); // Central America
    ctx.bezierCurveTo(140, 260, 100, 200, 110, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // South America
    ctx.beginPath();
    ctx.moveTo(200, 290);
    ctx.bezierCurveTo(260, 310, 270, 370, 230, 440);
    ctx.bezierCurveTo(200, 460, 180, 410, 190, 330);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eurasia (Europe + Asia)
    ctx.beginPath();
    ctx.moveTo(460, 90);
    ctx.bezierCurveTo(580, 70, 850, 80, 880, 180);
    ctx.bezierCurveTo(850, 240, 780, 290, 720, 280); // India/SE Asia
    ctx.bezierCurveTo(650, 260, 580, 290, 530, 220); // Middle East
    ctx.bezierCurveTo(460, 210, 440, 140, 460, 90);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Africa
    ctx.beginPath();
    ctx.moveTo(460, 200);
    ctx.bezierCurveTo(540, 200, 570, 260, 550, 360);
    ctx.bezierCurveTo(520, 420, 470, 410, 440, 320);
    ctx.bezierCurveTo(430, 250, 440, 210, 460, 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Australia
    ctx.beginPath();
    ctx.ellipse(820, 360, 55, 38, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Antarctica (South pole ice cap)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 480, 1024, 32);
    // Greenland (North pole ice)
    ctx.beginPath();
    ctx.ellipse(330, 50, 45, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Latitude & Longitude Graticule lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    // Parallels (Equator, Tropics, Arctic)
    [128, 200, 256, 312, 384].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    });
    // Meridians
    for (let x = 0; x <= 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    // 4. Atmospheric Cloud Swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(300, 140, 120, 25, 0.2, 0, Math.PI * 2);
    ctx.ellipse(650, 120, 160, 30, -0.1, 0, Math.PI * 2);
    ctx.ellipse(220, 280, 100, 22, -0.15, 0, Math.PI * 2);
    ctx.ellipse(780, 320, 140, 28, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('earth', texture);
    return texture;
  }

  /**
   * Sun texture: Glowing corona flare + solar photosphere
   */
  getSunTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('sun')) return this.canvasCache.get('sun')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const cx = 128;
    const cy = 128;

    // Outer corona glow
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 128);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.8, '#b45309');
    grad.addColorStop(1, 'rgba(180, 83, 9, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 128, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright solar core
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('sun', texture);
    return texture;
  }

  /**
   * Moon texture: Realistic maria (lunar seas) and cratered highlands
   */
  getMoonTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('moon')) return this.canvasCache.get('moon')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(80, 100, 45, 55, 0.2, 0, Math.PI * 2);
    ctx.ellipse(150, 85, 35, 30, -0.1, 0, Math.PI * 2);
    ctx.ellipse(175, 120, 28, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(185, 155, 30, 26, 0.1, 0, Math.PI * 2);
    ctx.ellipse(145, 180, 22, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(130, 210);
      ctx.lineTo(130 + Math.cos(angle) * 70, 210 + Math.sin(angle) * 70);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(130, 210, 4, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('moon', texture);
    return texture;
  }

  /**
   * Mars texture
   */
  getMarsTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('mars')) return this.canvasCache.get('mars')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(120, 130, 60, 35, 0.3, 0, Math.PI * 2);
    ctx.ellipse(170, 160, 40, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(128, 15, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('mars', texture);
    return texture;
  }

  /**
   * Jupiter texture
   */
  getJupiterTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('jupiter')) return this.canvasCache.get('jupiter')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fde68a';
    ctx.fillRect(0, 0, 256, 256);

    const bands = [
      { y: 35, h: 20, color: '#b45309' },
      { y: 70, h: 28, color: '#92400e' },
      { y: 125, h: 18, color: '#fef3c7' },
      { y: 155, h: 32, color: '#78350f' },
      { y: 205, h: 22, color: '#b45309' },
    ];

    bands.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(0, b.y, 256, b.h);
    });

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(175, 172, 22, 14, 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('jupiter', texture);
    return texture;
  }

  /**
   * Saturn texture
   */
  getSaturnTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('saturn')) return this.canvasCache.get('saturn')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 256);

    const bands = [
      { y: 45, h: 16, color: '#eab308' },
      { y: 90, h: 22, color: '#ca8a04' },
      { y: 140, h: 26, color: '#a16207' },
      { y: 195, h: 18, color: '#ca8a04' },
    ];

    bands.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(0, b.y, 256, b.h);
    });

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('saturn', texture);
    return texture;
  }

  /**
   * Mercury texture: Craters and gray-brown regolith
   */
  getMercuryTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('mercury')) return this.canvasCache.get('mercury')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(80, 70, 30, 25, 0.1, 0, Math.PI * 2);
    ctx.ellipse(160, 140, 45, 38, -0.2, 0, Math.PI * 2);
    ctx.ellipse(90, 180, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('mercury', texture);
    return texture;
  }

  /**
   * Venus texture: Opaque pale yellow sulfur cloud bands
   */
  getVenusTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('venus')) return this.canvasCache.get('venus')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 256);

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fef9c3');
    grad.addColorStop(0.3, '#fde047');
    grad.addColorStop(0.7, '#eab308');
    grad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 0, 256, 256);
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('venus', texture);
    return texture;
  }

  /**
   * Uranus texture: Pale cyan methane haze
   */
  getUranusTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('uranus')) return this.canvasCache.get('uranus')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, '#cffafe');
    grad.addColorStop(0.7, '#67e8f9');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('uranus', texture);
    return texture;
  }

  /**
   * Neptune texture: Deep azure blue with supersonic dark storm bands
   */
  getNeptuneTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('neptune')) return this.canvasCache.get('neptune')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1e40af');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Dark spot storm
    ctx.fillStyle = '#172554';
    ctx.beginPath();
    ctx.ellipse(150, 130, 28, 16, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('neptune', texture);
    return texture;
  }

  /**
   * Pluto texture: Tan reddish surface with pale Tombaugh Regio ice heart
   */
  getPlutoTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('pluto')) return this.canvasCache.get('pluto')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(0, 0, 256, 256);

    // Reddish terrain
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(80, 140, 50, 0, Math.PI * 2);
    ctx.fill();

    // Heart shape (Tombaugh Regio)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.bezierCurveTo(150, 100, 130, 90, 115, 110);
    ctx.bezierCurveTo(100, 90, 80, 100, 80, 120);
    ctx.bezierCurveTo(80, 145, 115, 170, 115, 170);
    ctx.bezierCurveTo(115, 170, 150, 145, 150, 120);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('pluto', texture);
    return texture;
  }

  /**
   * Spiral Galaxy texture: Luminous central bulge with winding logarithmic spiral arms
   */
  getGalaxyTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('galaxy')) return this.canvasCache.get('galaxy')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const cx = 256;
    const cy = 256;

    // Glowing core
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 70);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.2, '#fef08a');
    coreGrad.addColorStop(0.6, '#38bdf8');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();

    // Spiral arms
    const arms = 2;
    for (let arm = 0; arm < arms; arm++) {
      const baseAngle = (arm * Math.PI * 2) / arms;
      for (let i = 0; i < 400; i++) {
        const t = i / 400;
        const r = 25 + t * 210;
        const theta = baseAngle + t * Math.PI * 3.5;
        const x = cx + r * Math.cos(theta) + (Math.random() - 0.5) * 24 * t;
        const y = cy + r * Math.sin(theta) + (Math.random() - 0.5) * 24 * t;

        const size = Math.random() * 2.8 + 0.6;
        const alpha = Math.max(0, 1 - t * 0.8) * 0.75;
        ctx.fillStyle = t < 0.3 ? `rgba(254, 240, 138, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('galaxy', texture);
    return texture;
  }

  /**
   * Black hole texture: Pitch-black shadow with glowing relativistic photon ring
   */
  getBlackHoleTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('blackhole')) return this.canvasCache.get('blackhole')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const cx = 256;
    const cy = 256;

    // Glowing relativistic accretion disk
    const diskGrad = ctx.createRadialGradient(cx, cy, 70, cx, cy, 240);
    diskGrad.addColorStop(0, '#ffffff');
    diskGrad.addColorStop(0.15, '#fb923c');
    diskGrad.addColorStop(0.4, '#ea580c');
    diskGrad.addColorStop(0.7, '#7c2d12');
    diskGrad.addColorStop(1, 'rgba(124, 45, 18, 0)');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Pure black event horizon core
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();

    // Bright photon sphere ring
    ctx.strokeStyle = '#fff7ed';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 84, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('blackhole', texture);
    return texture;
  }

  /**
   * Wormhole texture: Swirling spacetime vortex throat
   */
  getWormholeTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('wormhole')) return this.canvasCache.get('wormhole')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const cx = 256;
    const cy = 256;

    // Swirling spacetime vortex
    const vortexGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 240);
    vortexGrad.addColorStop(0, '#ffffff');
    vortexGrad.addColorStop(0.2, '#c084fc');
    vortexGrad.addColorStop(0.5, '#7c3aed');
    vortexGrad.addColorStop(0.8, '#4c1d95');
    vortexGrad.addColorStop(1, 'rgba(76, 29, 149, 0)');
    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Geometric throat concentric ripples
    ctx.lineWidth = 2;
    for (let r = 40; r < 200; r += 20) {
      ctx.strokeStyle = `rgba(232, 121, 249, ${0.8 - r / 240})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('wormhole', texture);
    return texture;
  }

  /**
   * Planetary Nebula / Dying star gas ionization shell
   */
  getNebulaTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('nebula')) return this.canvasCache.get('nebula')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const cx = 256;
    const cy = 256;

    // Outer H-alpha envelope
    const outGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 230);
    outGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
    outGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)');
    outGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = outGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 230, 0, Math.PI * 2);
    ctx.fill();

    // Inner O-III glowing cyan torus
    const inGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 140);
    inGrad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
    inGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.6)');
    inGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = inGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();

    // Central white dwarf star
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('nebula', texture);
    return texture;
  }

  /**
   * Star diffraction cross-spike texture
   */
  getStarStarburstTexture(): THREE.CanvasTexture {
    if (this.canvasCache.has('starburst')) return this.canvasCache.get('starburst')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const cx = 64;
    const cy = 64;

    const rad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
    rad.addColorStop(0, '#ffffff');
    rad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    const spikeGradH = ctx.createLinearGradient(0, cy, 128, cy);
    spikeGradH.addColorStop(0, 'rgba(255,255,255,0)');
    spikeGradH.addColorStop(0.5, '#ffffff');
    spikeGradH.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = spikeGradH;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, cy);
    ctx.lineTo(124, cy);
    ctx.stroke();

    const spikeGradV = ctx.createLinearGradient(cx, 0, cx, 128);
    spikeGradV.addColorStop(0, 'rgba(255,255,255,0)');
    spikeGradV.addColorStop(0.5, '#ffffff');
    spikeGradV.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = spikeGradV;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx, 124);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.canvasCache.set('starburst', texture);
    return texture;
  }
}

export const textureFactory = new TextureFactory();
