export const party = {
  celebrant: "DEBORAH WOOLLEY",
  title: "DEBORAH WOOLLEY's 70th Birthday Celebration",
  dateISO: "2026-10-24T17:00:00",
  message: "CELEBRATING 70 YEARS OF FAITH, GRACE AND LOVE",
  events: [
    {
      id: "friday",
      day: "Friday",
      date: "October 23, 2026",
      name: "Praise Night",
      time: "6:30pm - 8:30 pm",
      venue: "INTERNATIONAL CHARISMATIC CHURCH (ICC)",
      address: "1737 SW 3rd St, Grand Prairie, TX 75051",
      dressCode: "All White",
      note: "All White",
      icon: "🙏",
      color: "from-blue-500 to-cyan-500",
      mapQuery: "1737 SW 3rd St, Grand Prairie, TX 75051",
    },
    {
      id: "saturday",
      day: "Saturday",
      date: "October 24, 2026",
      name: "70TH BIRTHDAY CELEBRATION",
      time: "5:00 PM - 10:00 PM",
      venue: "BOB DUNCAN CENTER",
      address: "2800 S Center ST, Arlington, TX 76014",
      dressCode: "Formal",
      note: "Formal",
      icon: "🎂",
      color: "from-purple-500 to-pink-500",
      mapQuery: "2800 S Center ST, Arlington, TX 76014",
      featured: true,
    },
    {
      id: "sunday",
      day: "Sunday",
      date: "October 25, 2026",
      name: "THANKSGIVING SERVICE",
      time: "9:00 AM - 12:30 PM",
      venue: "INTERNATIONAL CHARISMATIC CHURCH (ICC)",
      address: "1717 SW 3rd St, Grand Prairie, TX 75051",
      dressCode: "Fascinator and Hats",
      note: "Fascinator and Hats",
      icon: "🕊️",
      color: "from-amber-500 to-orange-500",
      mapQuery: "1717 SW 3rd St, Grand Prairie, TX 75051",
    },
  ],
};

export function mapEmbedUrl(query?: string) {
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const address = query || party.events[1].mapQuery;
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(
    address,
  )}&zoom=15`;
}
