// Simple Hijri date converter (approximation)
export function getHijriDate(): string {
  const gregorianDate = new Date();
  
  // Approximate conversion (for accurate conversion, use a library like moment-hijri)
  // This is a simplified calculation
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth() + 1;
  const gregorianDay = gregorianDate.getDate();
  
  // Approximate Hijri year (rough calculation)
  const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
  
  const hijriMonths = [
    "Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir",
    "Jumadal Ula", "Jumadal Akhirah", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhul Qa'dah", "Dhul Hijjah"
  ];
  
  // Approximate month (this is very rough, for production use proper library)
  const hijriMonth = hijriMonths[gregorianMonth % 12];
  
  return `${gregorianDay} ${hijriMonth} ${hijriYear} H`;
}

export function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}
