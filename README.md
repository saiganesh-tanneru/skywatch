# Skywatch 🌌🔭

A modern, real-time celestial tracking dashboard and observatory web application built with **React 18**, **TypeScript**, **Vite**, **Three.js / React Three Fiber**, **satellite.js**, and **astronomy-engine**.

Skywatch visualizes everything above your local horizon in real time—satellites, the Sun, Moon, planets, and bright stars—with time-travel scrubbing, satellite pass predictions, close-approach asteroid tracking, meteor shower countdowns, realistic spacecraft and celestial body textures, and a multi-perspective 3D engine (Sky Dome, 2D Planisphere, 3D Geocentric Earth Orbit, and 3D Heliocentric Solar System Orrery).

---

## 🚀 Key Features

### 1. Multi-Perspective Viewing Modes
- **3D Alt-Azimuth Dome (`3D`)**: Observer at the center of the celestial sphere with cardinal headings (N, NE, E, SE, S, SW, W, NW), altitude rings (0° horizon, 30°, 60°, 90° zenith), azimuth meridian guides, and atmospheric limb glow.
- **2D Flat Polar Chart (`2D`)**: Interactive planisphere chart with Zenith at the center, horizon at the border, and celestial objects mapped with stereographic polar projection.
- **3D Earth Orbit View (`Globe`)**: Geocentric "relative to Earth" view displaying an interactive 3D textured Earth with continents, atmosphere, observer ground pin, and satellites orbiting in real-time 3D space with line-of-sight beams.
- **3D Solar System View (`Solar`)**: Heliocentric orrery with the Sun at the center, true planetary orbits (Mercury through Pluto), Moon in lunar orbit, Main Asteroid Belt (1,800+ bodies), major meteor shower debris streams, and interplanetary probes (Parker Solar Probe, JWST, MRO, Juno, BepiColombo, Cassini, Voyager).
- **3D Vast Known Universe (`Universe`)**: Deep cosmic map spanning from the Milky Way out to the Cosmic Microwave Background (CMB) horizon (46.5 billion ly). Features galaxies, supermassive & stellar-mass black holes, dead/dying stars (supernovae, pulsars, white dwarfs, planetary nebulae), theoretical Einstein-Rosen wormhole portals, and the cosmic web scaffolding (3,200 galaxy clusters).

### 2. High-Fidelity Celestial & Spacecraft Imagery
- **Spacecraft Models & Textures**: Realistic SVG & canvas representations for the International Space Station (ISS) with golden solar array wings and radiator trusses, Tiangong Space Station (CSS), Hubble Space Telescope (HST), and communication satellites.
- **Planetary Surfaces**: Procedural surface textures for the Sun (solar corona and granulation), Moon (craters and live phase illumination), Mars (terracotta terrain with polar ice cap), Jupiter (atmospheric bands and Great Red Spot), and Saturn (golden planet with 3D tilted ring system).
- **Deep Space Starfield**: 2,500 background stars with Yale Bright Star Catalog overlay (spectral class color temperatures: hot blue O/B to red M class).

### 3. Real-Time Tracking & Orbit Propagation
- **Live SGP4 Satellite Propagation**: Uses `satellite.js` to compute satellite positions every second with batched vector transforms, SGP4 error guards, and altitude/horizon filtering.
- **CelesTrak GP Integration**: Fetches General Perturbations orbital elements (OMM JSON/TLE) for visual satellites, space stations, active satellites, and Starlink with 2-hour `localStorage` caching and fallback offline fixtures.

### 4. Interactive Time Travel Slider (-2h to +48h)
- Scrub time backwards 2 hours or forwards up to 48 hours into the future.
- Play / Pause time simulation with selectable speeds (10x, 60x, 300x, 1800x).
- Quick jumps (`-1h`, `Now`, `+1h`, `+24h`).
- "Now" reset button restores live real-time simulation immediately.
- All dome objects, planetary orbits, and satellite passes dynamically recompute for the selected simulation epoch.

### 5. Detail Drawer & Smooth Camera Zoom
- Clicking any celestial body or satellite opens an observatory telemetry drawer.
- Displays altitude, azimuth, compass bearing, distance (km or AU), orbital velocity, RA/Dec, visual magnitude, and ground footprint (sub-satellite latitude and longitude).
- Smooth camera interpolation (`lerp`) glides toward the target object in 3D space upon selection and smoothly zooms back out when closed.

### 6. Mission Control Tools & Side Panels
- **Satellite Pass Predictions**: Local 24-hour pass predictor stepping through time with SGP4 to compute rise time, peak elevation, set time, and compass directions without external API calls.
- **NASA NeoWs Near-Earth Asteroid Feed**: Displays asteroids making close approaches this week with relative velocity, miss distance in Lunar Distances, diameter ranges, and potentially hazardous flags.
- **Meteor Shower Tracker**: Comprehensive annual meteor shower calendar with peak dates, Zenithal Hourly Rate (ZHR), radiant constellations, parent comets, and active/upcoming status.
- **Observer Location Manager**: Auto-prompts browser GPS with automatic IP geolocation fallback and instant 1-click preset cities (New York, San Francisco, Tokyo, Sydney, London, Bengaluru, Paris, Honolulu) or custom manual coordinates.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any`)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Astrodynamics**: [satellite.js](https://github.com/shashwatak/satellite-js) (SGP4/SDP4 propagation) + [astronomy-engine](https://github.com/cosinekitty/astronomy) (planetary mechanics & coordinate reductions)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with jsdom (29 tests passing)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with Node 20 / 22 / 25)
- npm or pnpm or yarn

### 2. Installation
```bash
# Clone or navigate to the repository
cd skywatch

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
# NASA NeoWs Near-Earth Object API Key
# Default DEMO_KEY works out of the box with standard hourly rate limits.
# Register for your own free key at https://api.nasa.gov/
VITE_NASA_API_KEY=DEMO_KEY
```

> **Note**: `VITE_` variables are public in the client bundle. DEMO_KEY is safe to commit.

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Running the Unit Tests
```bash
npm test
```
Runs the full Vitest suite testing coordinate conversions, SGP4 propagation, local pass prediction algorithms, astronomy engine calculations, and storage cache TTL.

### 6. Production Build
```bash
npm run build
```
Typechecks with `tsc -b` and bundles with Vite to the `dist/` folder.

---

## 🛰️ Data Sources

| Source | Endpoint / Format | Purpose | Cache Policy |
| :--- | :--- | :--- | :--- |
| **CelesTrak GP** | `https://celestrak.org/NORAD/elements/gp.php` | Live Two-Line Element sets (TLE / OMM JSON) for satellites | Cached in `localStorage` with a 2-hour TTL. Proxied via `/api/celestrak` in Vite to avoid browser CORS restrictions. Offline fallback fixtures included. |
| **NASA NeoWs** | `https://api.nasa.gov/neo/rest/v1/feed` | Near-Earth Asteroid close approach data | Cached in `localStorage` with a 6-hour TTL. Friendly banner on HTTP 429 rate limit. |
| **Yale Bright Star Catalog** | Static JSON (`/public/data/yale_bright_stars.json`) | 110 prominent stars with RA, Dec, visual magnitude, and spectral classifications | Loaded locally once on app boot. |
| **astronomy-engine** | Client-side pure JavaScript computation | High-precision ephemerides for Sun, Moon (phases & illumination), and Planets (Mercury through Pluto) | Computed entirely on-device with zero network latency. |
| **ipwho.is** | `https://ipwho.is/` | IP-based observer geolocation fallback when browser GPS is denied or unavailable | Cached in `localStorage`. |

---

## ⚠️ Known Limitations & Design Decisions

1. **NASA NeoWs Asteroids on the Dome**: NASA NeoWs provides close-approach parameters (relative velocity, miss distance, size), but *not* topocentric sky coordinates (RA/Dec/Alt/Az). As specified by mission requirements, asteroids are presented in the "Near-Earth Asteroids this week" drawer rather than plotted on the dome.
2. **CelesTrak CORS**: CelesTrak does not send permissive browser `Access-Control-Allow-Origin` headers. The Vite development server provides a built-in reverse proxy at `/api/celestrak` that automatically forwards requests upstream.
3. **Starlink Scale**: Starlink consists of thousands of satellites. The Starlink group is toggled off by default to maintain 60fps rendering and minimize bandwidth; it can be enabled via the Layers panel.
4. **Logarithmic Solar System Distance**: The true physical distance between the Sun and Pluto is ~40x the distance to Earth. To make inner planets and outer gas giants simultaneously visible and navigable, the Solar System view uses a compressed power scaling $28 \times (\text{distAU})^{0.46}$.

---

## 📄 License
MIT
