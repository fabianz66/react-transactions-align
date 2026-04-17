export function getMerchant(desc: string): string {
  const udesc = desc.toUpperCase();

  const merchantKeywords = [
    'ICETEL', 'CCSS', 'LIBERTY', 'ICELEC', 'AMAZON', 'APPLE', 'UBER', 'DIDI',
    'MCDONALDS', 'SPOON', 'AUTO MERCADO', 'VINDI', 'MASXMENOS', 'PALI',
    'DISNEY', 'NETFLIX', 'HBO', 'MAX', 'GOOGLE', 'YOUTUBE', 'SPOTIFY', 'HULU',
    'PARAMOUNT', 'PRIME VIDEO', 'PEACOCK', 'TIDAL', 'PANDORA',
    'CRUNCHYROLL'
  ];

  // Extract known merchant keywords.
  const escapedKeywords = merchantKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const merchantRegex = new RegExp(`(${escapedKeywords.join('|')})`);
  const match = udesc.match(merchantRegex);
  if (match) return match[1].toUpperCase();

  // Pattern: "00000000/ TEXT" - extracts the phone number and subsequent text
  // Matches 8 digits, followed by '/', then any combination of alphanumeric, spaces, slashes, hyphens, or periods.
  const phoneNumberPattern = /(\d{8}\/[A-Z0-9\s\/\-\.]+)/;
  const phoneNumberMatch = udesc.match(phoneNumberPattern);
  if (phoneNumberMatch && phoneNumberMatch[1]) {
    return phoneNumberMatch[1].trim();
  }

  // Pattern: "TEXT1/ TEXT2" - extracts the second part after the last '/'
  // Matches any text, followed by '/', then captures the subsequent text.
  const textSlashTextPattern = /.*\/([A-Z0-9\s\/\-\.]+)/;
  const textSlashTextMatch = udesc.match(textSlashTextPattern);
  if (textSlashTextMatch && textSlashTextMatch[1]) {
    return textSlashTextMatch[1].trim();
  }
  return desc;
}