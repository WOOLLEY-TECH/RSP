export function normalizePhoneForWhatsApp(phone: string, countryCode = "233"): string {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith(countryCode)) {
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    return countryCode + cleaned.slice(1);
  }

  return countryCode + cleaned;
}

export function generateWhatsAppMessage(params: {
  fullName: string;
  attending: boolean;
  attendingDays: string[];
  guestCount: number;
}): string {
  const { fullName, attending, attendingDays, guestCount } = params;
  const firstName = fullName.split(" ")[0];

  if (!attending) {
    return [
      `Thank you, ${firstName}, for responding to the birthday invitation.`,
      "",
      "We are sorry you won't be able to join us, but we truly appreciate your response.",
      "",
      "We hope to celebrate with you another time. ❤️",
    ].join("\n");
  }

  const daysText = attendingDays.length > 0 ? attendingDays.join(", ") : "Not specified";
  const totalPeople = 1 + guestCount;

  return [
    "🎉 RSVP CONFIRMED!",
    "",
    `Hello ${firstName},`,
    "",
    "Thank you for confirming your attendance at the birthday celebration.",
    "",
    `Attendance: Joyfully attending`,
    `Attending days: ${daysText}`,
    `Additional guests: ${guestCount}`,
    `Total attending: ${totalPeople}`,
    "",
    "We are excited to celebrate with you! 🎂🥳",
    "",
    "See you there!",
  ].join("\n");
}

export function openWhatsApp(phone: string, message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
