import { gsap } from 'gsap'; // if using modules
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getStatuesData } from './data.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const placeholderObjects = [];
const statueObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltipEl = document.getElementById('tooltip');
const infoPanelEl = document.getElementById('info-panel');

const radlagningEl = document.getElementById('radlagning');

let isZoomedIn = false;
let originalCameraPosition = new THREE.Vector3();
let originalTarget = new THREE.Vector3();

// References to tooltip and info panel elements from the DOM, they are hidden initially
export function loadPlaceholderStatues(scene, camera, controls) {
  const placeholderGeometry = new THREE.BoxGeometry(5, 5, 5);
  const placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
  placeholder.position.set(-5, 2.5, 35);
  placeholder.name = 'placeholder'; // Identifier for raycasting
  scene.add(placeholder);
  placeholderObjects.push(placeholder);
  window.addEventListener('pointermove', (event) =>
    onPointerMove1(event, camera)
  );
  window.addEventListener('click', (event) => onClick(event, camera, controls));
}
/**
 *
 * Load all statues dynamically from the JSON file and add them to the scene.
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {OrbitControls} controls
 */
export function loadStatues(scene, camera, controls) {
  getStatuesData().then((statues) => {
    statues.forEach((st) => {
      if (!st.model) {
        console.warn('Missing model path for statue:', st);
        return;
      }

      if (st.format === 'glb') {
        const loader = new GLTFLoader();
        loader.load(
          st.model,
          (gltf) => {
            const model = gltf.scene;
            setupModel(model, st);
            scene.add(model);
            statueObjects.push(model);
          },
          undefined,
          (error) => console.error('Error loading GLTF:', error)
        );
      } else if (st.format === 'obj') {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(
          st.mtl,
          (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
              st.model,
              (object) => {
                setupModel(object, st);
                scene.add(object);
                statueObjects.push(object);
              },
              undefined,
              (error) => console.error('Error loading OBJ:', error)
            );
          },
          undefined,
          (error) => console.error('Error loading MTL:', error)
        );
      }
    });
  });

  // Add interactivity
  window.addEventListener('pointermove', (event) =>
    onPointerMove(event, camera)
  );
  window.addEventListener('click', (event) => onClick(event, camera, controls));
}

/**
 * Apply scale, position, rotation, and metadata to model
 */
function setupModel(model, st) {
  model.name = st.name;
  model.userData = { name: st.name, info: st };

  if (st.position) {
    model.position.set(st.position.x, st.position.y, st.position.z);
  }

  if (st.scale) {
    model.scale.set(st.scale.x, st.scale.y, st.scale.z);
  }

  if (st.rotationY) {
    model.rotation.y = st.rotationY;
  }
}

/**
 * Hover interaction (tooltip + scale)
 */
function onPointerMove(event, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(statueObjects, true);

  if (intersects.length > 0 && tooltipEl) {
    const statueObj = intersects[0].object;

    // Tooltip
    tooltipEl.style.left = `${event.pageX + 5}px`;
    tooltipEl.style.top = `${event.pageY + 5}px`;
    tooltipEl.textContent = statueObj.userData.name || 'Statue';
    tooltipEl.style.display = 'block';

    // Scale-up on hover
    statueObjects.forEach((obj) => {
      if (obj === statueObj) {
        gsap.to(obj.scale, {
          x: obj.scale.x * 1.05,
          y: obj.scale.y * 1.05,
          z: obj.scale.z * 1.05,
          duration: 0.2,
        });
      } else {
        const st = obj.userData.info;
        if (st && st.scale) {
          gsap.to(obj.scale, {
            x: st.scale.x,
            y: st.scale.y,
            z: st.scale.z,
            duration: 0.2,
          });
        }
      }
    });
  } else {
    if (tooltipEl) {
      tooltipEl.style.display = 'none';
    }
  }
}

function onPointerMove1(event, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const snerting = raycaster.intersectObjects(placeholderObjects, true);

  if (snerting.length > 0 && radlagningEl) {
    const statuePlaceholder = snerting[0].object;

    // Tooltip
    radlagningEl.style.left = `${event.pageX + 5}px`;
    radlagningEl.style.top = `${event.pageY + 5}px`;
    radlagningEl.textContent = statuePlaceholder.userData.name || 'Statue';
    radlagningEl.style.display = 'block';
  }
}

// Click handler: show info panel if a statue is clicked
function onClick(event, camera, controls) {
  loadStatues(event, camera, controls);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(statueObjects, true);

  if (intersects.length > 0 && infoPanelEl) {
    const statueObj = intersects[0].object;
    const info = statueObj.userData.info;
    console.log(info);

    if (isZoomedIn) return;
    isZoomedIn = true;

    originalCameraPosition.copy(camera.position); // save original camera position
    originalTarget.copy(controls.target); // save original camera target

    const targetPosition = new THREE.Vector3();
    statueObj.getWorldPosition(targetPosition); // get position of clicked statue
    const offset = new THREE.Vector3(0, 2, 5);
    const newCamPos = targetPosition.clone().add(offset);
    camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z);

    gsap.to(camera.position, {
      x: newCamPos.x,
      y: newCamPos.y,
      z: newCamPos.z,
      duration: 1.5,
      onUpdate: () => {
        camera.lookAt(targetPosition);
      },
      onComplete: () => {
        // Update OrbitControls target to the selected statue’s position
        controls.target.copy(targetPosition);
        controls.update();
      },
    });

    infoPanelEl.innerHTML = `
    <div class="info-content">
      <img src="${info.card}" alt="${info.name}" class="card-image"/>
      <img src="${info.image}" alt="${info.name}" class="model-image"/>
      <div class="description">${
        info.description || 'No description available'
      }</div>
      <button id="back-btn">Back to Main View</button>
    </div>
  `;
    infoPanelEl.style.display = 'flex'; // Use flex for layout

    const backBtn = document.getElementById('back-btn');
    backBtn?.addEventListener('click', () => {
      gsap.to(camera.position, {
        x: originalCameraPosition.x,
        y: originalCameraPosition.y,
        z: originalCameraPosition.z,
        duration: 1.5,
        onUpdate: () => {
          camera.lookAt(originalTarget);
        },
        onComplete: () => {
          controls.enabled = true; // Re-enable controls
          infoPanelEl.style.display = 'none'; // Hide info panel
          isZoomedIn = false;
          document.body.classList.toggle('overview-mode');
        },
      });
    });
  }
}
