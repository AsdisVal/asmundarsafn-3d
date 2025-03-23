import { gsap } from 'gsap'; // if using modules
// Add this to the top of `statues.js`
let isZoomedIn = false;
let originalCameraPosition = new THREE.Vector3();
let originalTarget = new THREE.Vector3();

/**
 *
 * Statues.js
 * Handles loading and placement of statue models in the scene.
 * It implements interactivity like hovering and clicking on statues.
 * This module uses Three.js loaders and raycasting to create an interactive experience.
 *
 */
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getStatuesData } from './data.js';

// Array to keep track of statue objects in the scene for interactions
const statueObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// References to tooltip and info panel elements from the DOM, they are hidden initially
const tooltipEl = document.getElementById('tooltip');
const infoPanelEl = document.getElementById('info-panel');

// Load all statues into the scene
export function loadStatues(scene, camera) {
  // Fetch statue data from the JSON via data.js
  getStatuesData().then((statues) => {
    statues.forEach((st) => {
      // Load each statue model using GLTFLoader
      const loader = new GLTFLoader();
      loader.load(
        st.model,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(st.position.x, st.position.y, st.position.z);
          // Apply scaling if defined in the JSON
          if (st.scale) {
            if (typeof st.scale === 'number') {
              // Uniform scaling
              model.scale.set(st.scale, st.scale, st.scale);
            } else if (typeof st.scale === 'object') {
              // Non-uniform scaling
              model.scale.set(st.scale.x, st.scale.y, st.scale.z);
            }
          }
          model.userData = { name: st.name, info: st }; // store statue info for reference
          scene.add(model);
          statueObjects.push(model); // keep track for raycasting
        },
        undefined,
        (error) => {
          console.error('Error loading statue model:', error);
        }
      );
    });
  });

  const mtlLoader = new MTLLoader();
  mtlLoader.load(
    'data/models/Piltur og stúlka - Uniform/piltur_og_stulka.mtl',
    (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        'data/models/Piltur og stúlka - Uniform/piltur_og_stulka.obj',
        (object) => {
          // Set position, scale, or any other properties
          object.name = 'Piltur og stúlka';
          object.userData = { name: 'Piltur og stúlka' };

          object.scale.set(2.5, 2.5, 2.5);
          object.rotateY(Math.PI / 2);
          object.position.set(25, 2.7, 0);
          scene.add(object);
        },
        undefined,
        (error) => {
          console.error('Error loading OBJ model:', error);
        }
      );
    }
  );

  // load another mtlobj
  const mtlLoader2 = new MTLLoader();
  mtlLoader2.load('data/models/hugss/hugs.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      'data/models/hugss/hugs.obj',
      (hugs) => {
        // Set position, scale, or any other properties
        hugs.name = 'Hugs';
        hugs.userData = { name: 'Hugs' };

        hugs.scale.set(2, 2, 2);
        hugs.position.set(60, 0, -30);
        hugs.rotateY(Math.PI);

        scene.add(hugs);
      },
      undefined,
      (error) => {
        console.error('Error loading OBJ model:', error); // eslint-disable-line no-console
      }
    );
  });

  // load another mtlobj
  const mtlLoader3 = new MTLLoader();
  mtlLoader3.load('data/models/twoHeads/twoHeads.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      'data/models/twoHeads/twoHeads.obj',
      (object) => {
        // Set position, scale, or any other properties
        object.name = 'TwoHeads';
        object.userData = { name: 'TwoHeads' };

        object.scale.set(3, 3, 3);
        object.rotateY(Math.PI);
        object.position.set(30, 0, -50);
        scene.add(object);
      },
      undefined,
      (error) => {
        console.error('Error loading OBJ model:', error); // eslint-disable-line no-console
      }
    );
  });

  // load another mtlobj
  const mtlLoader4 = new MTLLoader();
  mtlLoader4.load('data/models/scream/scream.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      'data/models/scream/scream.obj',
      (object) => {
        // Set position, scale, or any other properties
        object.name = 'Scream';
        object.userData = { name: 'scream' };

        object.scale.set(3, 3, 3);
        object.rotateY(Math.PI);
        object.position.set(-30, 0, -50);
        scene.add(object);
      },
      undefined,
      (error) => {
        console.error('Error loading OBJ model:', error); // eslint-disable-line no-console
      }
    );
  });

  // Set up event listeners for hover and click
  window.addEventListener('pointermove', (event) =>
    onPointerMove(event, camera)
  );
  window.addEventListener('click', (event) => onClick(event, camera));
}
// Hover handler: show tooltip if hovering over a statue
function onPointerMove(event, camera) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // Update raycaster with camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(statueObjects, true);
  if (intersects.length > 0 && tooltipEl) {
    // if hovering over a statue has detected at least one object that the mouse
    //  is currently hovering over do the following:
    const statueObj = intersects[0].object; // retrieve the first object that the mouse is currently hovering over
    tooltipEl.style.left = `${event.pageX + 5}px`; // position tooltip slightly to the right of the mouse
    tooltipEl.style.top = `${event.pageY + 5}px`; // position tooltip slightly below the mouse
    tooltipEl.textContent = statueObj.userData.name; // Set the text inside the tooltip to the name of the statue.
    // this is done because the statue's name is stored in userData and is used here to inform the user which statue they are hovering over.
    tooltipEl.style.display = 'block'; // Makes the tooltip element visible by changing its display style to 'block'.
  } else {
    if (tooltipEl) {
      tooltipEl.style.display = 'none'; // If there are no intersections (i.e., the mouse isn’t hovering over any statue),
      // then the tooltip is hidden by setting its display style to 'none'.
    }
  }
}

// Click handler: show info panel if a statue is clicked
function onClick(event, camera) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(statueObjects, true);
  if (intersects.length > 0 && infoPanelEl) {
    const statueObj = intersects[0].object;
    const info = statueObj.userData.info;
    infoPanelEl.innerHTML = `
      <h3>${info.name} (${info.year})</h3>
      <img src="${info.image}" alt="${info.name}" style="max-width:100%;" />
      <p><em>${info.name}</em> description and details...</p>
    `;
    infoPanelEl.style.display = 'block';
  } else if (infoPanelEl) {
    // (Optional) hide or clear info panel if clicking elsewhere
    infoPanelEl.style.display = 'none';
  }
}
