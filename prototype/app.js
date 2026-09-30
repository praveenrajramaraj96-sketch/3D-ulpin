// Initialize Three.js Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f172a'); // Dark theme background

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, (window.innerWidth - 350) / window.innerHeight, 1, 1000);
camera.position.set(40, 30, 40);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - 350, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Orbit Controls (Allows the user to drag, rotate, and zoom the 3D city)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
scene.add(dirLight);

// Ground (The 2D Parcel)
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid Helper to make it look like a technical blueprint map
const gridHelper = new THREE.GridHelper(100, 40, '#334155', '#334155');
scene.add(gridHelper);

// Materials
const solidMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 });
const wireframeMat = new THREE.MeshStandardMaterial({ color: '#475569', transparent: true, opacity: 0.1, wireframe: false });
const highlightMat = new THREE.MeshStandardMaterial({ color: '#fb923c', emissive: '#9a3412', roughness: 0.2 }); 
const pendingMat = new THREE.MeshStandardMaterial({ color: '#eab308', emissive: '#854d0e', roughness: 0.2 }); 
const successMat = new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#047857', roughness: 0.2 }); 
const errorMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#991b1b', roughness: 0.2 }); 

// Build the "Target Property" - A 5-Floor Apartment Building
const floors = [];
const floorHeight = 4;
const buildingSize = 12;

for (let i = 0; i < 5; i++) {
    const geo = new THREE.BoxGeometry(buildingSize, floorHeight - 0.2, buildingSize); 
    const mesh = new THREE.Mesh(geo, solidMat);
    mesh.position.set(0, (i * floorHeight) + (floorHeight / 2), 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    floors.push(mesh);
}

// Add fake context buildings around it
const createBuilding = (w, h, d, x, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), solidMat);
    mesh.position.set(x, h/2, z);
    mesh.castShadow = true;
    scene.add(mesh);
};
createBuilding(10, 30, 10, -25, -20);
createBuilding(15, 12, 12, 25, 15);
createBuilding(8, 20, 15, -15, 25);
createBuilding(12, 40, 12, 20, -25);

// UI Logic mapping
const slider = document.getElementById('floor-slider');
const floorNumberDisplay = document.getElementById('floor-number');
const flatSelect = document.getElementById('flat-select');
const validationBox = document.getElementById('validation-box');
const resultBox = document.getElementById('result-box');

// Update flat dropdown options
function updateFlats(floorLevel) {
    flatSelect.innerHTML = '';
    for(let i=1; i<=4; i++) {
        let flatNum = `${floorLevel}0${i}`;
        let opt = document.createElement('option');
        opt.value = flatNum;
        opt.innerHTML = `Flat/Unit ${flatNum}`;
        flatSelect.appendChild(opt);
    }
}

// Handle Slider Change
slider.addEventListener('input', (e) => {
    const selectedFloor = parseInt(e.target.value);
    floorNumberDisplay.innerText = selectedFloor;
    
    // Hide validation UI when scrolling
    validationBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    
    floors.forEach((floor, index) => {
        if (index + 1 === selectedFloor) {
            floor.material = highlightMat;
        } else if (index + 1 > selectedFloor) {
            floor.material = wireframeMat;
        } else {
            floor.material = solidMat;
        }
    });
    
    updateFlats(selectedFloor);
});

// Initialize
updateFlats(1);
floors[0].material = highlightMat;

// 1. Run AI Validation Button
document.getElementById('validate-btn').addEventListener('click', () => {
    validationBox.classList.remove('hidden');
    resultBox.classList.add('hidden');
    
    // Highlight floor yellow for pending review
    const floorIndex = parseInt(slider.value) - 1;
    floors[floorIndex].material = pendingMat;
});

// 2. Approve Button
document.getElementById('approve-btn').addEventListener('click', () => {
    const base = document.getElementById('base-ulpin').value;
    const block = document.getElementById('block-select').value;
    const floor = slider.value.padStart(2, '0');
    const flat = flatSelect.value;
    
    const vUlpin = `${base}-${block}-${floor}-${flat}`;
    
    document.getElementById('final-ulpin').innerText = vUlpin;
    resultBox.classList.remove('hidden');
    
    const floorIndex = parseInt(slider.value) - 1;
    floors[floorIndex].material = successMat;
});

// 3. Reject / Request Survey Button
document.getElementById('reject-btn').addEventListener('click', () => {
    validationBox.classList.add('hidden');
    
    const floorIndex = parseInt(slider.value) - 1;
    floors[floorIndex].material = errorMat;
    
    // Flash red then revert to normal selection
    setTimeout(() => {
        floors[floorIndex].material = highlightMat;
    }, 1500);
});

// Resize handler
window.addEventListener('resize', () => {
    const width = window.innerWidth - 350;
    renderer.setSize(width, window.innerHeight);
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
