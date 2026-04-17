export const fetchWikipediaInfo = async (query) => {
  try {
    console.log(`🔍 [Wiki] Recherche pour : "${query}"`);

    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exchars=400&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      if (pages.length > 0) {
        console.log(`✅ [Wiki] Article trouvé : ${pages[0].title}`);
        return {
          title: pages[0].title,
          extract: pages[0].extract,
          url: pages[0].fullurl
        };
      }
    }

    console.log(`[Wiki] Rien trouvé pour cette recherche.`);
    return null;

  } catch (error) {
    console.error("Crash réseau Wiki :", error);
    return null;
  }
};
