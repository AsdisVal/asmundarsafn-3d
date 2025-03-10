/**
 * data.js
 * Loads and provides access to the statue data from the JSON file.
 * This keeps data logic separated from rendering logic.
 */

// Fetch the statues data from the JSON file and return a Promise
function getStatuesData() {
  return fetch('statues.json').then((response) => response.json());
}

// (Optional) Additional helper to get a specific statue's info by name
function getStatueInfo(name) {
  return getStatuesData().then((list) =>
    list.find((item) => item.name === name)
  );
}
