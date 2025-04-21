/**
 * seasons.js
 * Implements the seasonal effects system with visual and audio enhancements.
 */

import * as THREE from 'three';
import { ground, scene } from '../main';

let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

let audioListener;
let rainSound, birdSound;

const SEASON_CONFIG = {
  winter: {
    groundColor: 0xe0e0e0,
    background: 0xd0e8f2,
    group: () => winterGroup,
    audio: null,
  },
  spring: {
    groundColor: 0x7fc97f,
    background: 0xa1d3d8,
    group: () => springGroup,
    audio: null,
  },
  summer: {
    groundColor: 0x3b5f3b,
    background: 0xa1e3d8,
    group: () => summerGroup,
    audio: () => birdSound,
  },
  autumn: {
    groundColor: 0xd9a86a,
    background: 0x87cefa,
    group: () => autumnGroup,
    audio: () => rainSound,
  },
};
export function initSeasons(scene, camera) {
  audioListener = new THREE.AudioListener();
  camera.add(audioListener);

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

  winterGroup = createWinterEffect();
  springGroup = createSpringEffect();
  summerGroup = createSummerEffect();
  autumnGroup = createAutumnEffect();

  [winterGroup, springGroup, summerGroup, autumnGroup].forEach((g) => {
    scene.add(g);
    g.visible = false;
  });

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
        obj.position.y -= obj.userData.fallSpeed || 0.02;
        obj.rotation.z += obj.userData.rotationSpeed || 0.005;
        if (obj.position.y < 0) {
          obj.position.y = Math.random() * 20 + 10;
          obj.position.x = Math.random() * 250 - 125;
          obj.position.z = Math.random() * 110 - 55 - 29;
        }
      } else {
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
}

function createSeasonMenu() {
  const menu = document.createElement('div');
  menu.id = 'season-menu';
  document.body.appendChild(menu);
  Object.keys(SEASON_CONFIG).forEach((seasonName) => {
    const btn = document.createElement('button');
    btn.textContent = seasonName;
    btn.onclick = () => setSeason(seasonName.toLowerCase());
    menu.appendChild(btn);
  });
}

function setSeason(season) {
  currentSeason = season;

  Object.entries(SEASON_CONFIG).forEach(([key, cfg]) => {
    cfg.group().visible = key === season;
  });

  scene.background = new THREE.Color(SEASON_CONFIG[season].background);
  ground.material.color.set(SEASON_CONFIG[season].groundColor);

  if (birdSound?.isPlaying) birdSound.stop();
  if (rainSound?.isPlaying) rainSound.stop();

  const audio = SEASON_CONFIG[season].audio;
  if (audio) audio().play();

  document.querySelectorAll('#season-menu button').forEach((btn) => {
    btn.classList.toggle(
      'active',
      btn.textContent !== null && btn.textContent.toLowerCase() === season
    );
  });
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
  const petalGeometry = new THREE.ConeGeometry(0.15, 0.4, 12);
  const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  const centerGeometry = new THREE.SphereGeometry(0.15, 24, 24);
  const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffff66 });

  for (let i = 0; i < 80; i++) {
    const flower = new THREE.Group();
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeometry, petalMaterial.clone());
      petal.position.set(Math.cos(angle) * 0.25, 0, Math.sin(angle) * 0.25);
      petal.rotation.set(0, 0, 0);
      petal.rotateZ(-Math.PI);
      petal.rotateY(angle);
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
    flower.scale.set(0.01, 0.01, 0.01);
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

    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bird.add(body);

    const beakGeo = new THREE.ConeGeometry(0.1, 0.2, 3);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0, 0.35); // Front of body
    bird.add(beak);

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
      bird.lookAt(center);
    });
    requestAnimationFrame(animateBirds);
  }
  animateBirds();
  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group();

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
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    leaf.scale.setScalar(Math.random() * 0.5 + 0.3); // Varied size
    leaf.userData = {
      fallSpeed: THREE.MathUtils.randFloat(0.02, 0.05),
      rotationSpeed: THREE.MathUtils.randFloat(0.005, 0.01),
    };

    group.add(leaf);
  }
  return group;
}
