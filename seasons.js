/**
 * seasons.js
 * Implements the seasonal effects system.
 * It creates visual effect for winter, spring, summer and autumn,
 * and allows the user to switch between seasons.
 * It also handles any ongoing animations for these effects.
 */

let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

// Initialize seasonal effects and UI
function initSeasons(scene) {
  //Create effect objects for each season
  winterGroup = createWinterEffect();
  springGroup = createSpringEffect();
  summerGroup = createSummerEffect();
  autumnGroup = createAutumnEffect();

  // Add all groups to the scene but keep them hidden initially
  scene.add(winterGroup, springGroup, summerGroup, autumnGroup);
  winterGroup.visible =
    springGroup.visible =
    summerGroup.visible =
    autumnGroup.visible =
      false;
  summerGroup.visible = true; // default to summer
  currentSeason = 'summer';

  // Create simple UI butons to switch seasons
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

//Function to switch the visible season
function setSeason(season) {
  currentSeason = season;
  // Toggle visibility of each season's group based on selection
  winterGroup.visible = season === 'winter';
  springGroup.visible = season === 'spring';
  summerGroup.visible = season === 'summer';
  autumnGroup.visible = season === 'autumn';
}

// Frame-by-frame update for animated effects
function updateSeasonEffects() {
  if (currentSeason === 'winter') {
    // Make snow particles
  }
  if (currentSeason === 'autumn') {
    // Make leaves fall and maybe rotate slowly
  }
  if (currentSeason === 'spring') {
    // Make flowers bloom
  }
  if (currentSeason === 'summer') {
    // Have birds fly around
  }
}
