export const party = {
  celebrant: "Auntie",
  title: "Auntie's Birthday Celebration",
  date: "Tuesday, 20th October 2026",
  time: "5:00 PM",
  venue: "Venue to be confirmed",
  // Used for the Google Map. Replace with the real street address.
  venueAddress: "Accra, Ghana",
  message:
    "Come share an evening of good food, music and laughter as we celebrate another beautiful year of life.",
};

export function mapEmbedUrl() {
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(
    party.venueAddress,
  )}&zoom=15`;
}
