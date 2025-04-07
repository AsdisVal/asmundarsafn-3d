/**
 * seasons.js
 * Implements the seasonal effects system with visual and audio enhancements.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { ground } from '../main';
console.log('seasons.js loaded');
let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

let audioListener;
let rainSound, birdSound;
import { scene } from '../main.js'; // Import the scene from main.js
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
  audioLoader.load('sound/rain.mp4', (buffer) => {
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
    autumnGroup.children.forEach((rainDrop) => {
      rainDrop.position.y -= 0.4; // Faster fall
      if (rainDrop.position.y < 0) {
        rainDrop.position.y = Math.random() * 10 + 15;
        rainDrop.position.x = Math.random() * 50 - 25;
        rainDrop.position.z = Math.random() * 50 - 25;
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
        ground.material.color.set(0xcc9966); // dried brown
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
        scene.background = new THREE.Color(0xb4f2b4); // soft green
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
  for (let i = 0; i < 200; i++) {
    const snowflake = new THREE.Mesh(geom, mat);
    snowflake.position.set(
      Math.random() * 50 - 25,
      Math.random() * 20 + 10,
      Math.random() * 50 - 25
    );
    group.add(snowflake);
  }
  return group;
}

function createSpringEffect() {
  const group = new THREE.Group();
  const flowerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
  for (let i = 0; i < 30; i++) {
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial.clone());
    flower.position.set(Math.random() * 40 - 20, 0, Math.random() * 40 - 20);
    flower.scale.set(0.01, 0.01, 0.01);
    group.add(flower);
  }
  return group;
}

function createSummerEffect() {
  const group = new THREE.Group();
  const center = new THREE.Vector3(0, 0, 10); // same as museum position
  const birds = [];

  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.BoxGeometry(0.5, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    });
    const bird = new THREE.Mesh(geometry, material);

    // Safely assign custom properties
    Object.assign(bird, {
      orbitRadius: THREE.MathUtils.randFloat(8, 18),
      orbitSpeed:
        THREE.MathUtils.randFloat(0.005, 0.01) * (Math.random() < 0.5 ? -1 : 1),
      orbitAngle: Math.random() * Math.PI * 2,
      orbitHeight: THREE.MathUtils.randFloat(8, 14),
    });

    group.add(bird);
    birds.push(bird);
  }

  function animateBirds() {
    birds.forEach((bird) => {
      bird.orbitAngle += bird.orbitSpeed;

      bird.position.set(
        center.x + bird.orbitRadius * Math.cos(bird.orbitAngle),
        bird.orbitHeight + Math.sin(bird.orbitAngle * 2) * 1.5,
        center.z + bird.orbitRadius * Math.sin(bird.orbitAngle)
      );
    });
    requestAnimationFrame(animateBirds);
  }

  animateBirds();
  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group();
  const rainGeom = new THREE.PlaneGeometry(0.05, 0.4); // Thin rain drops

  for (let i = 0; i < 200; i++) {
    const rainMat = new THREE.MeshBasicMaterial({
      color: 0x87cefa, // Light blue
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const rainDrop = new THREE.Mesh(rainGeom, rainMat);
    rainDrop.position.set(
      Math.random() * 50 - 25,
      Math.random() * 20 + 10,
      Math.random() * 50 - 25
    );
    group.add(rainDrop);
  }

  return group;
}
