import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Setup raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// Tooltip element (CSS2DObject)
const tooltipDiv = document.createElement('div');
tooltipDiv.className = 'tooltip';
tooltipDiv.textContent = ''; // will be filled with statue name
tooltipDiv.style.padding = '4px 8px';
tooltipDiv.style.background = 'rgba(0,0,0,0.6)';
tooltipDiv.style.color = '#fff';
tooltipDiv.style.borderRadius = '4px';
const tooltipLabel = new THREE.CSS2DObject(tooltipDiv);
tooltipLabel.visible = false;
scene.add(tooltipLabel);
// Update mouse coords on move
renderer.domElement.addEventListener('mousemove', (event) => {
  event.preventDefault();
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});
// In render loop:
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children);
if (intersects.length > 0) {
  const statue = intersects[0].object;
  // Show tooltip at statue position
  tooltipLabel.position.copy(statue.position);
  tooltipLabel.position.y += statue.userData.height / 2 || 1; // offset above statue if height known
  tooltipDiv.textContent = statue.name;
  tooltipLabel.visible = true;
} else {
  tooltipLabel.visible = false;
}
