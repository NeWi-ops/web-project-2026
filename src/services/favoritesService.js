const STORAGE_KEY = 'nasa_eonet_favorites';

export const favoritesService = {
  getFavorites() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },
  toggleFavorite(eventId) {
    let favorites = this.getFavorites();
    const index = favorites.indexOf(eventId);

    if (index === -1) {
      favorites.push(eventId);
    } else {
      favorites.splice(index, 1);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return favorites;
  },

  isFavorite(eventId) {
    const favorites = this.getFavorites();
    return favorites.includes(eventId);
  }
};
