/**
 * data.js
 * Loads and provides access to the statue data from the JSON file.
 */

let cachedStatues = null;

/**
 * Returns full statue data list (memoized after first load).
 */
export async function getStatuesData() {
  if (cachedStatues) return cachedStatues;

  try {
    const response = await fetch('statues.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    cachedStatues = await response.json();
    return cachedStatues;
  } catch (error) {
    console.error('Error fetching statue data:', error);
    return [];
  }
}

/**
 * Returns data for a single statue by name.
 */
export async function getStatueInfo(name) {
  const list = await getStatuesData();
  const statue = list.find((item) => item.name === name);
  if (!statue) console.warn(`No statue found with name: ${name}`);
  return statue;
}
