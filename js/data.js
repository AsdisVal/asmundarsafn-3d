/**
 * data.js
 * Loads and provides access to the statue data from the JSON file.
 */
export async function getStatuesData() {
  try {
    const response = await fetch('statues.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching statue data:', error);
    return [];
  }
}

export function getStatueInfo(name) {
  return getStatuesData().then((list) =>
    list.find((item) => item.name === name)
  );
}
