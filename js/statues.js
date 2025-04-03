import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { getStatuesData } from './data.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const placeholderObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const radlagningEl = document.getElementById('radlagning');

let modalScene, modalCamera, modalControls, modalModel, modalRenderer;
let modalAnimating = false;

/**
 * Loads placeholder objects based on statues.json data.
 * Each placeholder is a simple cylinder marking the position of a real statue.
 */
export function loadPlaceholderStatues(scene, camera, controls) {
  getStatuesData().then((statues) => {
    statues.forEach((st) => {
      const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
      const color = st.visited ? 0xff0000 : 0xeeeeee;
      const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
      });
      const placeholder = new THREE.Mesh(geometry, material);
      placeholder.position.set(st.position.x, st.position.y, st.position.z);
      placeholder.name = st.name;
      // Attach the full statue data for later use
      placeholder.userData = st;
      scene.add(placeholder);
      placeholderObjects.push(placeholder);
    });
  });

  window.addEventListener('pointermove', (event) =>
    onPlaceholderPointerMove(event, camera)
  );
  window.addEventListener('click', (event) =>
    onPlaceholderClick(event, camera, controls, scene)
  );
}

function onPlaceholderPointerMove(event, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(placeholderObjects, true);
  if (intersects.length > 0 && radlagningEl) {
    const placeholder = intersects[0].object;
    radlagningEl.style.left = `${event.pageX + 5}px`;
    radlagningEl.style.top = `${event.pageY + 5}px`;
    radlagningEl.textContent = placeholder.userData.name || 'Statue';
    radlagningEl.style.display = 'block';
  } else if (radlagningEl) {
    radlagningEl.style.display = 'none';
  }
}

/**
 * When a placeholder is clicked, load the full-resolution model.
 */
function onPlaceholderClick(event, camera, controls, scene) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(placeholderObjects, true);
  if (intersects.length > 0) {
    const placeholder = intersects[0].object;
    openStatueModal(placeholder.userData);
    loadStatueModel(placeholder.userData, placeholder, camera, controls, scene);
  }
}

function openStatueModal(statueData) {
  const modal = document.getElementById('statueModal');
  const canvas = document.getElementById('statue3DCanvas');
  const photo = document.getElementById('statuePhoto');
  const desc = document.getElementById('statueDesc');
  const year = document.getElementById('statueYear');
  const card = document.getElementById('imageCard');

  if (!modal || !canvas) return;

  // Safely set properties only if the element exists
  if (photo) photo.src = statueData.image;
  if (desc) desc.textContent = statueData.description;
  if (year) year.textContent = `Year: ${statueData.year}`;
  if (card) card.src = statueData['image-card'];

  modal.style.display = 'flex';

  modalScene = new THREE.Scene();
  modalCamera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  modalCamera.position.set(0, 1, 3);
  modalRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  modalRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  modalControls = new OrbitControls(modalCamera, canvas);
  modalControls.enableDamping = true;
  modalControls.target.set(0, 0.5, 0);
  modalControls.update();

  modalScene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 7);
  modalScene.add(light);
  if (statueData.format === 'glb') {
    const loader = new GLTFLoader();
    loader.load(statueData.model, (gltf) => {
      modalModel = gltf.scene;
      modalScene.add(modalModel);
    });
  } else if (statueData.format === 'obj') {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(statueData.mtl, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(statueData.model, (object) => {
        modalModel = object;
        modalScene.add(modalModel);
      });
    });
  }

  modalAnimating = true;
  animateModal();

  const overviewBtn = document.getElementById('overviewBtn');
  if (overviewBtn) {
    overviewBtn.onclick = () => {
      modalAnimating = false;
      modal.style.display = 'none';
      if (modalModel) modalScene.remove(modalModel);
      modalModel = null;
    };
  }
}

function animateModal() {
  if (!modalAnimating) return;
  requestAnimationFrame(animateModal);
  modalControls.update();
  modalRenderer.render(modalScene, modalCamera);
}

/**
 * Animates the camera to the statue's location and lazy‑loads the full model!
 */
function loadStatueModel(statueData, placeholder, camera, controls, scene) {
  const targetPosition = new THREE.Vector3(
    statueData.position.x,
    statueData.position.y,
    statueData.position.z
  );
  const offset = new THREE.Vector3(0, 2, 5);
  const newCamPos = targetPosition.clone().add(offset);

  gsap.to(camera.position, {
    x: newCamPos.x,
    y: newCamPos.y,
    z: newCamPos.z,
    duration: 1.5,
    onUpdate: () => camera.lookAt(targetPosition),
    onComplete: () => {
      controls.target.copy(targetPosition);
      controls.update();

      // Load the heavy model based on its format
      if (statueData.format === 'glb') {
        const loader = new GLTFLoader();
        loader.load(
          statueData.model,
          (gltf) => {
            //placeholder.visible = false;
            const model = gltf.scene;
            model.position.set(
              statueData.position.x,
              statueData.position.y,
              statueData.position.z
            );
            if (statueData.scale) {
              model.scale.set(
                statueData.scale.x,
                statueData.scale.y,
                statueData.scale.z
              );
            }
            if (statueData.rotationY) {
              model.rotation.y = statueData.rotationY;
            }

            scene.add(model);
            statueData.visited = true;
            placeholder.material.color.set(0xff0000);

            if (radlagningEl) {
              radlagningEl.style.display = 'block';
              radlagningEl.innerHTML = `
                <h3>${statueData.name}</h3>
                <p>${statueData.description || 'No description available.'}</p>
              `;
            }
          },
          undefined,
          (error) => console.error('Error loading GLTF model:', error)
        );
      } else if (statueData.format === 'obj') {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(
          statueData.mtl,
          (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
              statueData.model,
              (object) => {
                placeholder.visible = false;
                object.position.set(
                  statueData.position.x,
                  statueData.position.y,
                  statueData.position.z
                );
                if (statueData.scale) {
                  object.scale.set(
                    statueData.scale.x,
                    statueData.scale.y,
                    statueData.scale.z
                  );
                }
                if (statueData.rotationY) {
                  object.rotation.y = statueData.rotationY;
                }
                scene.add(object);
                statueData.visited = true;
                placeholder.material.color.set(0xff0000);

                // ✨ Show info tab
                if (radlagningEl) {
                  radlagningEl.style.display = 'block';
                  radlagningEl.innerHTML = `
                    <h3>${statueData.name}</h3>
                    <p>${
                      statueData.description || 'No description available.'
                    }</p>
                  `;
                }
              },
              undefined,
              (error) => console.error('Error loading OBJ model:', error)
            );
          },
          undefined,
          (error) => console.error('Error loading MTL file:', error)
        );
      }
    },
  });
}
