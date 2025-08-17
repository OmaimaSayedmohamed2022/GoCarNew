const carRates = {
  Economy: { base: 20, perKm: 5 },
  Large: { base: 30, perKm: 7 },
  VIP: { base: 50, perKm: 10 },
  Pet: { base: 25, perKm: 6 }
};

// Function to calculate distance between 2 points (Haversine Formula)
export function calculateDistance(loc1, loc2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Radius of Earth in KM
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in KM
}

export function calculatePrice(carType, distanceKm) {
  const rate = carRates[carType];
  return rate.base + rate.perKm * distanceKm;
}
