// 1. On stocke l'adresse de base dans une "boîte" étiquetée BASE_URL
const BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';

// 2. La fonction magique
export async function fetchEvents(limit = 20) {
  try {
    const response = await fetch(`${BASE_URL}/events?limit=${limit}`);
    if (!response.ok) throw new Error(`Erreur HTTP`);
    const data = await response.json();


    return data.events;
  } catch (error) {
    console.error(error);
    return [];
  }
}
