const BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';

export async function fetchEvents() {
  try {
    const response = await fetch(`${BASE_URL}/events?days=365&status=all`);

    if (!response.ok) throw new Error(`Erreur HTTP`);

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error(error);
    return [];
  }
}
