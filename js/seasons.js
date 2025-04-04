/**
 * seasons.js
 * Implements the seasonal effects system with visual and audio enhancements.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
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
    autumnGroup.children.forEach((leaf) => {
      leaf.position.y -= 0.05;
      if (leaf.position.y < 0) leaf.position.y = 15;
      leaf.rotation.z += 0.01;
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
  const birdGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.2);
  const birdMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const bird = new THREE.Mesh(birdGeometry, birdMaterial);
  bird.position.set(0, 10, 0);
  group.add(bird);

  let angle = 0;
  const radius = 10;
  function animateBird() {
    angle += 0.01;
    bird.position.set(
      Math.cos(angle) * radius,
      10 + Math.sin(angle * 2) * 2,
      Math.sin(angle) * radius
    );
    requestAnimationFrame(animateBird);
  }
  animateBird();

  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group();
  const leafGeom = new THREE.PlaneGeometry(0.5, 0.5);

  for (let i = 0; i < 50; i++) {
    const leafMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.05, 1, 0.5),
      transparent: true,
      opacity: Math.random() * 0.5 + 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(
      Math.random() * 50 - 25,
      Math.random() * 15 + 5,
      Math.random() * 50 - 25
    );
    leaf.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    group.add(leaf);
  }
  return group;
}
