/**
 * seasons.js
 * Implements the seasonal effects system with visual and audio enhancements.
 */

import * as THREE from 'three';
import { ground, scene } from '../main';
console.log('seasons.js loaded');
let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

let audioListener;
let rainSound, birdSound;
// Initialize seasonal effects and UI
export function initSeasons(scene, camera) {
  // Create audio listener
  audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  // Load sounds
  const audioLoader = new THREE.AudioLoader();

  birdSound = new THREE.Audio(audioListener);
  audioLoader.load('sound/birds.mp3', (buffer) => {
    birdSound.setBuffer(buffer);
    birdSound.setLoop(true);
    birdSound.setVolume(0.5);
  });

  rainSound = new THREE.Audio(audioListener);
  audioLoader.load('sound/rain.mp3', (buffer) => {
    rainSound.setBuffer(buffer);
    rainSound.setLoop(true);
    rainSound.setVolume(0.5);
  });

  // Create effect objects for each season
  winterGroup = createWinterEffect();
  springGroup = createSpringEffect();
  summerGroup = createSummerEffect();
  autumnGroup = createAutumnEffect();

  scene.add(winterGroup, springGroup, summerGroup, autumnGroup);
  winterGroup.visible =
    springGroup.visible =
    summerGroup.visible =
    autumnGroup.visible =
      false;
  springGroup.visible = true;
  currentSeason = 'spring';

  createSeasonMenu();
  playSeasonAudio('spring');
}

export function updateSeasonEffects() {
  if (currentSeason === 'winter') {
    winterGroup.children.forEach((p) => {
      p.position.y -= 0.1;
      p.position.x += Math.sin(p.rotation.y) * 0.01;
      p.rotation.y += 0.01;
      if (p.position.y < 0) p.position.y = 20;
    });
  }
  if (currentSeason === 'autumn') {
    autumnGroup.children.forEach((obj) => {
      if (obj.geometry.type === 'PlaneGeometry' && obj.material.map) {
        // it's a leaf
        obj.position.y -= obj.userData.fallSpeed || 0.02;
        obj.rotation.z += obj.userData.rotationSpeed || 0.005;

        if (obj.position.y < 0) {
          obj.position.y = Math.random() * 20 + 10;
          obj.position.x = Math.random() * 250 - 125;
          obj.position.z = Math.random() * 110 - 55 - 29;
        }
      } else {
        // it's a rain drop
        obj.position.y -= 0.4;
        if (obj.position.y < 0) {
          obj.position.y = Math.random() * 10 + 15;
          obj.position.x = Math.random() * 250 - 125;
          obj.position.z = Math.random() * 110 - 55 - 29;
        }
      }
    });
  }
  if (currentSeason === 'spring') {
    springGroup.children.forEach((flower) => {
      const s = flower.scale.x;
      if (s < 1) {
        const newScale = s + 0.01;
        flower.scale.set(newScale, newScale, newScale);
      }
    });
  }
  // Summer bird animation handled internally
}

function createSeasonMenu() {
  const menu = document.createElement('div');
  menu.id = 'season-menu';
  document.body.appendChild(menu);
  ['winter', 'spring', 'summer', 'autumn'].forEach((seasonName) => {
    const btn = document.createElement('button');
    btn.textContent = seasonName;
    btn.onclick = () => setSeason(seasonName.toLowerCase());
    menu.appendChild(btn);
  });
}

function setSeason(season) {
  currentSeason = season;

  winterGroup.visible = season === 'winter';
  springGroup.visible = season === 'spring';
  summerGroup.visible = season === 'summer';
  autumnGroup.visible = season === 'autumn';
  playSeasonAudio(season);
  setSeasonBackgroundEffects(season);
  setSeasonGroundColor(season);

  // Add this code to update active button state
  document.querySelectorAll('#season-menu button').forEach((btn) => {
    btn.classList.remove('active');
    if (btn.textContent && btn.textContent.toLowerCase() === season) {
      btn.classList.add('active');
    }
  });
}

function setSeasonGroundColor(season) {
  if (ground) {
    switch (season) {
      case 'winter':
        ground.material.color.set(0xe0e0e0); // light snowy ground
        break;
      case 'spring':
        ground.material.color.set(0x7fc97f); // fresh green
        break;
      case 'summer':
        ground.material.color.set(0x3b5f3b); // deep green
        break;
      case 'autumn':
        ground.material.color.set(0xd9a86a); // autumn ground
        break;
    }
  }
}

function setSeasonBackgroundEffects(season) {
  if (scene) {
    switch (season) {
      case 'winter':
        scene.background = new THREE.Color(0xd0e8f2); // light icy blue
        break;
      case 'spring':
        scene.background = new THREE.Color(0xa1d3d8); // soft green
        break;
      case 'summer':
        scene.background = new THREE.Color(0xa1e3d8); // clear blue
        break;
      case 'autumn':
        scene.background = new THREE.Color(0x87cefa); // warm blue
        break;
    }
  }
}

function playSeasonAudio(season) {
  if (birdSound && birdSound.isPlaying) birdSound.stop();
  if (rainSound && rainSound.isPlaying) rainSound.stop();

  if (season === 'summer') birdSound.play();
  if (season === 'autumn') rainSound.play();
}

function createWinterEffect() {
  const group = new THREE.Group();
  const geom = new THREE.SphereGeometry(0.1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 1000; i++) {
    const snowflake = new THREE.Mesh(geom, mat);
    snowflake.position.set(
      Math.random() * 250 - 125,
      Math.random() * 20 + 10,
      Math.random() * 110 - 55 - 29 // account for ground.position.z
    );
    group.add(snowflake);
  }
  return group;
}

function createSpringEffect() {
  const group = new THREE.Group();

  const petalColor = 0xff69b4;
  const centerColor = 0xffff66;

  const petalGeometry = new THREE.ConeGeometry(0.15, 0.4, 12);
  const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });

  const centerGeometry = new THREE.SphereGeometry(0.15, 24, 24);
  const centerMaterial = new THREE.MeshStandardMaterial({ color: centerColor });

  for (let i = 0; i < 80; i++) {
    const flower = new THREE.Group();

    const petalCount = 6;
    for (let j = 0; j < petalCount; j++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial.clone());

      const angle = (j / petalCount) * Math.PI * 2;
      const radius = 0.25;

      // Set position in a circle
      petal.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      // Reset rotation and then orient outward
      petal.rotation.set(0, 0, 0);
      petal.rotateZ(-Math.PI); // Lay flat
      petal.rotateY(angle); // Point outward

      flower.add(petal);
    }

    const center = new THREE.Mesh(centerGeometry, centerMaterial.clone());
    center.position.y = 0.1;
    flower.add(center);

    flower.position.set(
      Math.random() * 250 - 125,
      0,
      Math.random() * 110 - 55 - 29
    );
    flower.scale.set(0.01, 0.01, 0.01); // animate later
    group.add(flower);
  }

  return group;
}

function createSummerEffect() {
  const group = new THREE.Group();
  const center = new THREE.Vector3(0, 0, 10); // Museum center
  const birds = [];

  for (let i = 0; i < 10; i++) {
    const bird = new THREE.Group();

    // Body (cube)
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bird.add(body);

    // Beak (small cone)
    const beakGeo = new THREE.ConeGeometry(0.1, 0.2, 3);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0, 0.35); // Front of body
    bird.add(beak);

    // Wings (triangles)
    const wingGeo = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([0, 0, 0, 0.4, 0.2, 0, 0.4, -0.2, 0]);
    wingGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(wingVertices, 3)
    );
    wingGeo.computeVertexNormals();
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.3, 0, 0);
    leftWing.rotation.y = Math.PI / 2;
    bird.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.3, 0, 0);
    rightWing.rotation.y = -Math.PI / 2;
    bird.add(rightWing);

    // Add orbit properties
    Object.assign(bird, {
      orbitRadius: THREE.MathUtils.randFloat(8, 18),
      orbitSpeed:
        THREE.MathUtils.randFloat(0.005, 0.01) * (Math.random() < 0.5 ? -1 : 1),
      orbitAngle: Math.random() * Math.PI * 2,
      orbitHeight: THREE.MathUtils.randFloat(8, 14),
    });

    birds.push(bird);
    group.add(bird);
  }

  function animateBirds() {
    birds.forEach((bird) => {
      bird.orbitAngle += bird.orbitSpeed;

      bird.position.set(
        center.x + bird.orbitRadius * Math.cos(bird.orbitAngle),
        bird.orbitHeight + Math.sin(bird.orbitAngle * 2) * 1.5,
        center.z + bird.orbitRadius * Math.sin(bird.orbitAngle)
      );

      // Make bird face forward in the orbit
      bird.lookAt(center);
    });

    requestAnimationFrame(animateBirds);
  }

  animateBirds();
  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group();

  // --- RAIN ---
  const rainGeom = new THREE.PlaneGeometry(0.05, 0.4);
  for (let i = 0; i < 1000; i++) {
    const rainMat = new THREE.MeshBasicMaterial({
      color: 0x87cefa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const rainDrop = new THREE.Mesh(rainGeom, rainMat);
    rainDrop.position.set(
      Math.random() * 250 - 125,
      Math.random() * 20 + 10,
      Math.random() * 110 - 55 - 29
    );
    group.add(rainDrop);
  }

  // --- LEAVES ---
  const textureLoader = new THREE.TextureLoader();
  const leafTexture = textureLoader.load(
    'models/nature/red_fall_leaf/textures/Material.001_baseColor.png'
  );

  const leafMat = new THREE.MeshBasicMaterial({
    map: leafTexture,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1, // discard transparent pixels
  });

  const leafGeom = new THREE.PlaneGeometry(0.5, 0.5);

  for (let i = 0; i < 100; i++) {
    const leaf = new THREE.Mesh(leafGeom, leafMat);

    leaf.position.set(
      Math.random() * 250 - 125,
      Math.random() * 20 + 10,
      Math.random() * 110 - 55 - 29
    );

    // Face camera roughly
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    leaf.scale.setScalar(Math.random() * 0.5 + 0.3); // Varied size

    // Add custom fall speed and rotation
    leaf.userData = {
      fallSpeed: THREE.MathUtils.randFloat(0.02, 0.05),
      rotationSpeed: THREE.MathUtils.randFloat(0.005, 0.01),
    };

    group.add(leaf);
  }

  return group;
}
