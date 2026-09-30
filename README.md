# TerraNex 3D Cadastre (V-ULPIN)

AI-Powered 3D Cadastre & Virtual Unique Land Parcel Identification Number (V-ULPIN) Platform Prototype.

## Features
- **3D Geospatial Visualization**: Multi-floor interactive building model using Three.js & OrbitControls.
- **Vertical Sub-division & Slicing**: Dynamic floor-by-floor and unit-level spatial slicing.
- **AI Validation Engine**: Sub-unit parcel validation against parent parcel 14-digit ULPIN rules.
- **Automated V-ULPIN Generator**: Generates 22-digit standard V-ULPIN codes dynamically based on block, floor, and unit coordinates.

## Getting Started

### Run the Prototype Locally

1. Open `prototype/index.html` directly in any web browser, or:
2. Serve via a local web server:
   ```bash
   python -m http.server 8000 --directory "prototype"
   ```
3. Open `http://localhost:8000` in your browser.
