import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as dat from "https://cdn.skypack.dev/dat.gui";

let scene, camera, renderer, controls, skybox;
let planet_sun;

let planets = {
  mercury: {
    name: "Mercury",
    texture: "../img/mercury_hd.jpg",
    radius: 2,
    orbit: 50,
    speed: 0.24,
    diameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 58.6,
    description: "Mercury is the smallest planet in our solar system and closest to the Sun.",
    mesh: null,
    angle: 0
  },
  venus: {
    name: "Venus",
    texture: "../img/venus_hd.jpg",
    radius: 3,
    orbit: 60,
    speed: 0.615,
    diameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    rotationPeriod: 243,
    description: "Venus is the hottest planet in our solar system due to its thick atmosphere.",
    mesh: null,
    angle: 0
  },
  earth: {
    name: "Earth",
    texture: "../img/earth_hd.jpg",
    radius: 4,
    orbit: 70,
    speed: 1,
    diameter: 12742,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    rotationPeriod: 1,
    description: "Earth is the only planet known to support life, with a surface covered by 70% water.",
    mesh: null,
    angle: 0
  },
  mars: {
    name: "Mars",
    texture: "../img/mars_hd.jpg",
    radius: 3.5,
    orbit: 80,
    speed: 0.524,
    diameter: 6779,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 1.03,
    description: "Mars is known as the Red Planet and has the largest volcano in the solar system.",
    mesh: null,
    angle: 0
  },
  jupiter: {
    name: "Jupiter",
    texture: "../img/jupiter_hd.jpg",
    radius: 10,
    orbit: 100,
    speed: 0.084,
    diameter: 139820,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    rotationPeriod: 0.41,
    description: "Jupiter is the largest planet in our solar system and has a famous storm called the Great Red Spot.",
    mesh: null,
    angle: 0
  },
  saturn: {
    name: "Saturn",
    texture: "../img/saturn_hd.jpg",
    radius: 8,
    orbit: 120,
    speed: 0.034,
    diameter: 116460,
    distanceFromSun: 1434,
    orbitalPeriod: 10759,
    rotationPeriod: 0.45,
    description: "Saturn is known for its beautiful ring system, made of ice and rock.",
    mesh: null,
    angle: 0
  },
  uranus: {
    name: "Uranus",
    texture: "../img/uranus_hd.jpg",
    radius: 6,
    orbit: 140,
    speed: 0.012,
    diameter: 50724,
    distanceFromSun: 2871,
    orbitalPeriod: 30687,
    rotationPeriod: 0.72,
    description: "Uranus is unique because it rotates on its side, making its seasons extreme.",
    mesh: null,
    angle: 0
  },
  neptune: {
    name: "Neptune",
    texture: "../img/neptune_hd.jpg",
    radius: 5,
    orbit: 160,
    speed: 0.006,
    diameter: 49244,
    distanceFromSun: 4495,
    orbitalPeriod: 60190,
    rotationPeriod: 0.67,
    description: "Neptune is the farthest planet from the Sun and has strong winds reaching up to 2,100 km/h.",
    mesh: null,
    angle: 0
  }
};

let sun = {
  name: "Sun",
  texture: "../img/sun_hd.jpg",
  radius: 20,
  description: "The Sun is a star at the center of the solar system, and its gravity holds the planets in orbit around it."
};

function createMaterialArray() {
  const skyboxImagepaths = [
    '../img/skybox/space_ft.png',
    '../img/skybox/space_bk.png',
    '../img/skybox/space_up.png',
    '../img/skybox/space_dn.png',
    '../img/skybox/space_rt.png',
    '../img/skybox/space_lf.png'
  ];

  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(texture) });
  return new THREE.Mesh(geometry, material);
}

function createRing(innerRadius) {
  let outerRadius = innerRadius - 0.1;
  let thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // إعداد عناصر التحكم
  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 50; // تعيين موضع الكاميرا

  // إعداد واجهة المستخدم
  const gui = new dat.GUI();
  const params = {
    speed: 0.01, // السرعة العامة
    zoom: 12
  };
  gui.add(params, 'speed', 0, 10).onChange((value) => {
    Object.values(planets).forEach(planet => {
      planet.speed = value; // تعيين السرعة لكل كوكب
    });
  });
  gui.add(params, 'zoom', 2, 100).onChange((value) => {
    camera.position.z = value; // تعيين موضع الكاميرا
  });

  setSkyBox();

  // Load sun
  planet_sun = loadPlanetTexture(sun.texture, sun.radius);
  scene.add(planet_sun);

  // Load planets
  Object.keys(planets).forEach(key => {
    let planetData = planets[key];
    planetData.mesh = loadPlanetTexture(planetData.texture, planetData.radius);
    scene.add(planetData.mesh);
    createRing(planetData.orbit); // Add rings for orbits
  });

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1).normalize();
  scene.add(directionalLight);

  setupPlanetButtons();
}

function setupPlanetButtons() {
  document.getElementById('mercuryButton').addEventListener('click', () => displayPlanetInfo(planets.mercury));
  document.getElementById('venusButton').addEventListener('click', () => displayPlanetInfo(planets.venus));
  document.getElementById('earthButton').addEventListener('click', () => displayPlanetInfo(planets.earth));
  document.getElementById('marsButton').addEventListener('click', () => displayPlanetInfo(planets.mars));
  document.getElementById('jupiterButton').addEventListener('click', () => displayPlanetInfo(planets.jupiter));
  document.getElementById('saturnButton').addEventListener('click', () => displayPlanetInfo(planets.saturn));
  document.getElementById('uranusButton').addEventListener('click', () => displayPlanetInfo(planets.uranus));
  document.getElementById('neptuneButton').addEventListener('click', () => displayPlanetInfo(planets.neptune));
  document.getElementById('sunButton').addEventListener('click', () => displayPlanetInfo(sun));
}
function displayPlanetInfo(planet) {
  const infoDiv = document.getElementById('planetInfo');
  infoDiv.innerHTML = `
      <strong>Name:</strong> ${planet.name}<br>
      <strong>Diameter:</strong> ${planet.diameter || 'N/A'} km<br>
      <strong>Distance from Sun:</strong> ${planet.distanceFromSun || 'N/A'} million km<br>
      <strong>Orbital Period:</strong> ${planet.orbitalPeriod || 'N/A'} days<br>
      <strong>Rotation Period:</strong> ${planet.rotationPeriod || 'N/A'} days<br>
      <strong>Description:</strong> ${planet.description}<br><br>
      <button id="sendButton1" class="info-button">NASA Info</button>
      <button id="sendButton2" class="info-button">Wikipedia Info</button>
  `;

  // إضافة وظيفة الزر لفتح رابط ناسا
  document.getElementById('sendButton1').addEventListener('click', function() {
      window.open(`https://solarsystem.nasa.gov/planets/${planet.name.toLowerCase()}/overview/`, '_blank');
  });

  // إضافة وظيفة الزر لفتح رابط ويكيبيديا
  document.getElementById('sendButton2').addEventListener('click', function() {
      window.open(`https://en.wikipedia.org/wiki/${planet.name}`, '_blank');
  });
}

function animate() {
  requestAnimationFrame(animate);
  updatePlanetPositions();
  renderer.render(scene, camera);
}

function updatePlanetPositions() {
  const delta = 0.01; // Adjust this for more visible motion
  Object.keys(planets).forEach(key => {
    let planetData = planets[key];
    planetData.angle += planetData.speed * delta;
    planetData.mesh.position.x = Math.cos(planetData.angle) * planetData.orbit;
    planetData.mesh.position.z = Math.sin(planetData.angle) * planetData.orbit;

    // Optional: Ensure planets are always facing the center
    planetData.mesh.lookAt(0, 0, 0);
  });
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();