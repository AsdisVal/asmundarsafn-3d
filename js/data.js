/**
 * data.js
 * Loads and provides access to the statue data from the JSON file.
 * This keeps data logic separated from rendering logic.
 */

// Fetch the statues data from the JSON file and return a Promise
export function getStatuesData() {
  return fetch('data/statues.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Error fetching statue data:', error);
      return [];
    });
}

// (Optional) Additional helper to get a specific statue's info by name
export function getStatueInfo(name) {
  return getStatuesData().then((list) =>
    list.find((item) => item.name === name)
  );
}
