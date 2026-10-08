import type { Mission } from "@/lib/demo-data";

export const MFA_MISSIONS_URL = "https://www.mfa.go.ke/diplomatic-missions";
export const MFA_DIRECTORY_URL = "https://www.mfa.go.ke/diplomatic-directory";
export const MFA_CONTACT_URL = "https://www.mfa.go.ke/contact-us";
export const MFA_GUANGZHOU_URL = "https://guangzhou.mfa.go.ke/";
export const MFA_BERLIN_URL = "https://berlin.mfa.go.ke/";
export const MFA_JEDDAH_SOURCE_URL = "https://www.mfa.go.ke/kenyans-arrive-saudi-hajj";
export const DIRECTORY_SOURCE_CHECKED = "2026-10-07";

interface MissionRow {
  id: string;
  missionType: Mission["missionType"];
  name: string;
  hostCountry: string;
  hostCountryCode: string;
  hostCity: string;
  serves?: string[];
  phone?: string;
  email?: string;
  timezone: string;
  sourceUrl?: string;
  sourceLabel?: string;
  address?: string;
  districts?: string[];
  canProvideConsularSupport?: boolean;
}

const directory = MFA_MISSIONS_URL;
const diplomaticDirectory = MFA_DIRECTORY_URL;

const rows: MissionRow[] = [
  // Africa — offices and concurrent accreditations are taken from the Ministry directory.
  { id: "kenya-algiers", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Algeria", hostCountry: "Algeria", hostCountryCode: "DZ", hostCity: "Algiers", phone: "+213 555 524 638; +213 674 328 823", email: "Algiers@mfa.go.ke", timezone: "Africa/Algiers" },
  { id: "kenya-luanda", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Angola", hostCountry: "Angola", hostCountryCode: "AO", hostCity: "Luanda", timezone: "Africa/Luanda" },
  { id: "kenya-gaborone", missionType: "High Commission", name: "Kenya High Commission in Botswana", hostCountry: "Botswana", hostCountryCode: "BW", hostCity: "Gaborone", phone: "+267 395 1408; +267 395 1430", email: "Gaborone@mfa.go.ke", timezone: "Africa/Gaborone" },
  { id: "kenya-bujumbura", missionType: "High Commission", name: "Kenya High Commission in Burundi", hostCountry: "Burundi", hostCountryCode: "BI", hostCity: "Bujumbura", timezone: "Africa/Bujumbura" },
  { id: "kenya-kinshasa", missionType: "Embassy", name: "Embassy of the Republic of Kenya in the Democratic Republic of the Congo", hostCountry: "Democratic Republic of the Congo", hostCountryCode: "CD", hostCity: "Kinshasa", phone: "+243 815 565 935 / 36", email: "Kinshasa@mfa.go.ke", timezone: "Africa/Kinshasa", serves: ["Central African Republic", "Republic of the Congo", "Gabon"] },
  { id: "kenya-goma", missionType: "Consulate General", name: "Kenya Consulate General in Goma", hostCountry: "Democratic Republic of the Congo", hostCountryCode: "CD", hostCity: "Goma", phone: "+243 147 734 46", email: "goma@mfa.go.ke", timezone: "Africa/Lubumbashi", serves: ["Democratic Republic of the Congo"], sourceUrl: diplomaticDirectory },
  { id: "kenya-djibouti", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Djibouti", hostCountry: "Djibouti", hostCountryCode: "DJ", hostCity: "Djibouti", phone: "+253 21 252 424", timezone: "Africa/Djibouti" },
  { id: "kenya-cairo", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Egypt", hostCountry: "Egypt", hostCountryCode: "EG", hostCity: "Cairo", phone: "+20 2 2359 2159; +20 2 2358 1260", email: "cairo@mfa.go.ke", timezone: "Africa/Cairo", serves: ["Eritrea", "Jordan"] },
  { id: "kenya-addis", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Ethiopia", hostCountry: "Ethiopia", hostCountryCode: "ET", hostCity: "Addis Ababa", email: "addisababa@mfa.go.ke", timezone: "Africa/Addis_Ababa", serves: ["Djibouti"] },
  { id: "kenya-accra", missionType: "High Commission", name: "Kenya High Commission in Ghana", hostCountry: "Ghana", hostCountryCode: "GH", hostCity: "Accra", phone: "+233 (0) 55 180 8808", email: "accra@mfa.go.ke", timezone: "Africa/Accra" },
  { id: "kenya-maputo", missionType: "High Commission", name: "Kenya High Commission in Mozambique", hostCountry: "Mozambique", hostCountryCode: "MZ", hostCity: "Maputo", phone: "+258 85 881 8074", email: "maputo@mfa.go.ke", timezone: "Africa/Maputo" },
  { id: "kenya-windhoek", missionType: "High Commission", name: "Kenya High Commission in Namibia", hostCountry: "Namibia", hostCountryCode: "NA", hostCity: "Windhoek", phone: "+264 61 226 836; +264 61 225 900", email: "windhoek@mfa.go.ke", timezone: "Africa/Windhoek", serves: ["Angola"] },
  { id: "kenya-abuja", missionType: "High Commission", name: "Kenya High Commission in Nigeria", hostCountry: "Nigeria", hostCountryCode: "NG", hostCity: "Abuja", phone: "+234 978 121 93; +234 978 121 94", email: "abuja@mfa.go.ke", timezone: "Africa/Lagos", serves: ["Benin", "Guinea", "Guinea-Bissau", "Côte d’Ivoire", "Liberia", "Sierra Leone", "Togo"] },
  { id: "kenya-kigali", missionType: "High Commission", name: "Kenya High Commission in Rwanda", hostCountry: "Rwanda", hostCountryCode: "RW", hostCity: "Kigali", phone: "+250 5 83332", email: "Kigali@mfa.go.ke", timezone: "Africa/Kigali" },
  { id: "kenya-dakar", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Senegal", hostCountry: "Senegal", hostCountryCode: "SN", hostCity: "Dakar", phone: "+221 33 864 4600; +221 33 868 4867", email: "dakar@mfa.go.ke", timezone: "Africa/Dakar" },
  { id: "kenya-mogadishu", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Somalia", hostCountry: "Somalia", hostCountryCode: "SO", hostCity: "Mogadishu", phone: "+254 20 273 3883; +254 20 273 6390", timezone: "Africa/Mogadishu" },
  { id: "kenya-pretoria", missionType: "High Commission", name: "Kenya High Commission in South Africa", hostCountry: "South Africa", hostCountryCode: "ZA", hostCity: "Pretoria", phone: "+27 12 362 2249; +27 12 362 2250; +27 12 362 2251", timezone: "Africa/Johannesburg", serves: ["Eswatini", "Lesotho"] },
  { id: "kenya-juba", missionType: "Embassy", name: "Embassy of the Republic of Kenya in South Sudan", hostCountry: "South Sudan", hostCountryCode: "SS", hostCity: "Juba", timezone: "Africa/Juba" },
  { id: "kenya-khartoum", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Sudan", hostCountry: "Sudan", hostCountryCode: "SD", hostCity: "Khartoum", phone: "+249 120 060 6102", email: "Khartoum@mfa.go.ke", timezone: "Africa/Khartoum" },
  { id: "kenya-dar", missionType: "High Commission", name: "Kenya High Commission in Tanzania", hostCountry: "Tanzania", hostCountryCode: "TZ", hostCity: "Dar es Salaam", phone: "+255 22 266 8285; +255 22 266 8286", email: "daressalaam@mfa.go.ke", timezone: "Africa/Dar_es_Salaam" },
  { id: "kenya-arusha", missionType: "Consulate General", name: "Kenya Consulate General in Arusha", hostCountry: "Tanzania", hostCountryCode: "TZ", hostCity: "Arusha", phone: "+255 693 100 505", email: "arusha@mfa.go.ke", timezone: "Africa/Dar_es_Salaam", sourceUrl: diplomaticDirectory },
  { id: "kenya-kampala", missionType: "High Commission", name: "Kenya High Commission in Uganda", hostCountry: "Uganda", hostCountryCode: "UG", hostCity: "Kampala", phone: "+256 414 258 232; +256 414 258 236", email: "kampala@mfa.go.ke", timezone: "Africa/Kampala" },
  { id: "kenya-lusaka", missionType: "High Commission", name: "Kenya High Commission in Zambia", hostCountry: "Zambia", hostCountryCode: "ZM", hostCity: "Lusaka", email: "Lusaka@mfa.go.ke", timezone: "Africa/Lusaka", serves: ["Malawi"] },
  { id: "kenya-harare", missionType: "High Commission", name: "Kenya High Commission in Zimbabwe", hostCountry: "Zimbabwe", hostCountryCode: "ZW", hostCity: "Harare", email: "Harare@mfa.go.ke", timezone: "Africa/Harare" },
  { id: "kenya-abidjan", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Côte d’Ivoire", hostCountry: "Côte d’Ivoire", hostCountryCode: "CI", hostCity: "Abidjan", timezone: "Africa/Abidjan", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory" },
  { id: "kenya-rabat", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Morocco", hostCountry: "Morocco", hostCountryCode: "MA", hostCity: "Rabat", phone: "+212 537 65 52 54; +212 537 75 39 57", email: "rabat@mfa.go.ke", timezone: "Africa/Casablanca", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory" },

  // Americas.
  { id: "kenya-brasilia", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Brazil", hostCountry: "Brazil", hostCountryCode: "BR", hostCity: "Brasília", phone: "+55 61 3364 0691", email: "brazil@mfa.go.ke", timezone: "America/Sao_Paulo", serves: ["Argentina", "Chile", "Colombia", "Venezuela"] },
  { id: "kenya-ottawa", missionType: "High Commission", name: "Kenya High Commission in Canada", hostCountry: "Canada", hostCountryCode: "CA", hostCity: "Ottawa", phone: "+1 613 563 1773; +1 613 563 1774; +1 613 563 1776", email: "ottawa@mfa.go.ke", timezone: "America/Toronto", serves: ["Cuba"] },
  { id: "kenya-havana", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Cuba", hostCountry: "Cuba", hostCountryCode: "CU", hostCity: "Havana", phone: "+53 7 214 0734; +53 7 214 0735", email: "cuba@mfa.go.ke", timezone: "America/Havana" },
  { id: "kenya-washington", missionType: "Embassy", name: "Embassy of the Republic of Kenya in the United States", hostCountry: "United States", hostCountryCode: "US", hostCity: "Washington, D.C.", phone: "+1 202 387 6101", email: "washington@mfa.go.ke", timezone: "America/New_York", serves: ["Costa Rica", "El Salvador", "Honduras", "Mexico", "Nicaragua"] },
  { id: "kenya-los-angeles", missionType: "Consulate", name: "Kenya Consulate in Los Angeles", hostCountry: "United States", hostCountryCode: "US", hostCity: "Los Angeles", phone: "+1 323 939 2408", email: "losangeles@mfa.go.ke", timezone: "America/Los_Angeles", sourceUrl: diplomaticDirectory },
  { id: "kenya-new-york", missionType: "Consulate", name: "Kenya Consulate in New York", hostCountry: "United States", hostCountryCode: "US", hostCity: "New York", phone: "+1 212 421 4741", email: "newyork@mfa.go.ke", timezone: "America/New_York", sourceUrl: diplomaticDirectory },

  // Asia and Pacific.
  { id: "kenya-beijing", missionType: "Embassy", name: "Embassy of the Republic of Kenya in China", hostCountry: "China", hostCountryCode: "CN", hostCity: "Beijing", phone: "+86 10 6532 3381; +86 10 6532 2473; +86 10 6532 5561", email: "beijing@mfa.go.ke", timezone: "Asia/Shanghai", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory" },
  { id: "kenya-new-delhi", missionType: "High Commission", name: "Kenya High Commission in India", hostCountry: "India", hostCountryCode: "IN", hostCity: "New Delhi", phone: "+91 11 2614 6537; +91 11 2624 6538; +91 11 2624 6540", email: "newdelhi@mfa.go.ke", timezone: "Asia/Kolkata", serves: ["Bangladesh", "Sri Lanka", "Singapore"] },
  { id: "kenya-jakarta", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Indonesia", hostCountry: "Indonesia", hostCountryCode: "ID", hostCity: "Jakarta", phone: "+62 21 2239 3200", email: "jakarta@mfa.go.ke", timezone: "Asia/Jakarta" },
  { id: "kenya-tokyo", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Japan", hostCountry: "Japan", hostCountryCode: "JP", hostCity: "Tokyo", phone: "+81 3 3723 4006; +81 3 3723 4007", email: "tokyo@mfa.go.ke", timezone: "Asia/Tokyo" },
  { id: "kenya-kuala-lumpur", missionType: "High Commission", name: "Kenya High Commission in Malaysia", hostCountry: "Malaysia", hostCountryCode: "MY", hostCity: "Kuala Lumpur", phone: "+60 3 2146 1163", email: "kualalumpur@mfa.go.ke", timezone: "Asia/Kuala_Lumpur", serves: ["Indonesia", "Philippines"] },
  { id: "kenya-seoul", missionType: "Embassy", name: "Embassy of the Republic of Kenya in the Republic of Korea", hostCountry: "Republic of Korea", hostCountryCode: "KR", hostCity: "Seoul", phone: "+82 2 3785 2903; +82 2 3785 2904", email: "seoul@mfa.go.ke", timezone: "Asia/Seoul", serves: ["South Korea"] },
  { id: "kenya-bangkok", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Thailand", hostCountry: "Thailand", hostCountryCode: "TH", hostCity: "Bangkok", phone: "+66 2 712 5721; +66 2 391 0906; +66 2 391 0907", email: "bangkok@mfa.go.ke", timezone: "Asia/Bangkok", serves: ["Cambodia", "Laos", "Vietnam"] },
  { id: "kenya-guangzhou", missionType: "Consulate General", name: "Consulate General of the Republic of Kenya in Guangzhou", hostCountry: "China", hostCountryCode: "CN", hostCity: "Guangzhou", serves: ["China"], phone: "+86 188 020 34500", email: "consular.guangzhou@mfa.go.ke", timezone: "Asia/Shanghai", sourceUrl: "https://guangzhou.mfa.go.ke/", sourceLabel: "Official Consulate General website", address: "Unit 02A, 34th Floor, Office Building A No. 109, Pazhou Avenue, Mingfeng Square, Haizhu District, Guangzhou, China", districts: ["Guangdong", "Fujian", "Guangxi", "Hainan"] },

  // Europe.
  { id: "kenya-vienna", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Austria", hostCountry: "Austria", hostCountryCode: "AT", hostCity: "Vienna", phone: "+43 1 712 3919; +43 1 712 3920", email: "vienna@mfa.go.ke", timezone: "Europe/Vienna", serves: ["Hungary", "Slovakia"] },
  { id: "kenya-brussels", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Belgium", hostCountry: "Belgium", hostCountryCode: "BE", hostCity: "Brussels", email: "brussels@mfa.go.ke", timezone: "Europe/Brussels", serves: ["Luxembourg"] },
  { id: "kenya-paris", missionType: "Embassy", name: "Embassy of the Republic of Kenya in France", hostCountry: "France", hostCountryCode: "FR", hostCity: "Paris", phone: "+33 1 41 45 68 32 81", email: "Paris@amb-kenya.fr", timezone: "Europe/Paris", serves: ["Portugal", "Serbia", "Monaco", "Holy See"] },
  { id: "kenya-unesco", missionType: "Permanent Mission", name: "Permanent Delegation of Kenya to UNESCO", hostCountry: "France", hostCountryCode: "FR", hostCity: "Paris", phone: "+33 1 45 68 32 81", email: "Paris-unesco@mfa.go.ke", timezone: "Europe/Paris", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory", canProvideConsularSupport: false },
  { id: "kenya-berlin", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Germany", hostCountry: "Germany", hostCountryCode: "DE", hostCity: "Berlin", phone: "+49 30 2592 6611", email: "berlin@mfa.go.ke", timezone: "Europe/Berlin", serves: ["Poland", "Czech Republic"], sourceUrl: "https://berlin.mfa.go.ke/", sourceLabel: "Official Embassy website" },
  { id: "kenya-dublin", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Ireland", hostCountry: "Ireland", hostCountryCode: "IE", hostCity: "Dublin", phone: "+353 1 613 6380", email: "dublin@mfa.go.ke", timezone: "Europe/Dublin" },
  { id: "kenya-rome", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Italy", hostCountry: "Italy", hostCountryCode: "IT", hostCity: "Rome", phone: "+39 335 682 8393; +39 335 682 8570", email: "rome@mfa.go.ke", timezone: "Europe/Rome", serves: ["Poland", "Greece", "Malta", "Cyprus"] },
  { id: "kenya-hague", missionType: "Embassy", name: "Embassy of the Republic of Kenya in the Netherlands", hostCountry: "Netherlands", hostCountryCode: "NL", hostCity: "The Hague", phone: "+31 70 338 252; +31 70 338 251", email: "hague@mfa.go.ke", timezone: "Europe/Amsterdam", sourceUrl: diplomaticDirectory },
  { id: "kenya-moscow", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Russia", hostCountry: "Russia", hostCountryCode: "RU", hostCity: "Moscow", phone: "+7 499 230 0232; +7 499 230 2778; +7 499 230 0554", email: "moscow@mfa.go.ke", timezone: "Europe/Moscow", serves: ["Belarus", "Kazakhstan", "Ukraine"] },
  { id: "kenya-madrid", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Spain", hostCountry: "Spain", hostCountryCode: "ES", hostCity: "Madrid", phone: "+34 91 781 2000", email: "madrid@mfa.go.ke", timezone: "Europe/Madrid" },
  { id: "kenya-stockholm", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Sweden", hostCountry: "Sweden", hostCountryCode: "SE", hostCity: "Stockholm", phone: "+46 8 218 300; +46 8 440 2114; +46 8 218 309; +46 8 440 2117", email: "stockholm@mfa.go.ke", timezone: "Europe/Stockholm" },
  { id: "kenya-bern", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Switzerland", hostCountry: "Switzerland", hostCountryCode: "CH", hostCity: "Bern", phone: "+41 31 710 592; +41 31 710 594; +41 76 288 0813", email: "bern@mfa.go.ke", timezone: "Europe/Zurich" },
  { id: "kenya-geneva", missionType: "Permanent Mission", name: "Permanent Mission of Kenya to the United Nations in Geneva", hostCountry: "Switzerland", hostCountryCode: "CH", hostCity: "Geneva", phone: "+41 22 906 4050", email: "geneva@mfa.go.ke", timezone: "Europe/Zurich", sourceUrl: diplomaticDirectory, canProvideConsularSupport: false },
  { id: "kenya-london", missionType: "High Commission", name: "Kenya High Commission in the United Kingdom", hostCountry: "United Kingdom", hostCountryCode: "GB", hostCity: "London", phone: "+44 20 7636 2371", email: "London@mfa.go.ke", timezone: "Europe/London" },
  { id: "kenya-ankara", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Türkiye", hostCountry: "Türkiye", hostCountryCode: "TR", hostCity: "Ankara", phone: "+90 312 491 4508; +90 312 491 4509; +90 312 491 4512; +90 312 491 4516", email: "ankara@mfa.go.ke", timezone: "Europe/Istanbul" },

  // Middle East.
  { id: "kenya-tehran", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Iran", hostCountry: "Iran", hostCountryCode: "IR", hostCity: "Tehran", phone: "+98 21 2204 5689", email: "Tehran@mfa.go.ke", timezone: "Asia/Tehran" },
  { id: "kenya-tel-aviv", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Israel", hostCountry: "Israel", hostCountryCode: "IL", hostCity: "Tel Aviv", phone: "+972 3 575 4633; +972 3 575 4674", email: "telaviv@mfa.go.ke", timezone: "Asia/Jerusalem" },
  { id: "kenya-kuwait", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Kuwait", hostCountry: "Kuwait", hostCountryCode: "KW", hostCity: "Kuwait City", phone: "+965 2524 3771; +965 2524 3772", email: "kuwait@mfa.go.ke", timezone: "Asia/Kuwait" },
  { id: "kenya-muscat", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Oman", hostCountry: "Oman", hostCountryCode: "OM", hostCity: "Muscat", phone: "+968 2469 7664", email: "muscat@mfa.go.ke", timezone: "Asia/Muscat" },
  { id: "kenya-islamabad", missionType: "High Commission", name: "Kenya High Commission in Pakistan", hostCountry: "Pakistan", hostCountryCode: "PK", hostCity: "Islamabad", phone: "+92 51 260 1502; +92 51 260 504-6", email: "islamabad@mfa.go.ke", timezone: "Asia/Karachi" },
  { id: "kenya-doha", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Qatar", hostCountry: "Qatar", hostCountryCode: "QA", hostCity: "Doha", phone: "+974 4493 1870", timezone: "Asia/Qatar", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory; contact email requires confirmation" },
  { id: "kenya-riyadh", missionType: "Embassy", name: "Embassy of the Republic of Kenya in Saudi Arabia", hostCountry: "Saudi Arabia", hostCountryCode: "SA", hostCity: "Riyadh", phone: "+966 11 488 2484; +966 11 488 1238", email: "Riyadh@mfa.go.ke", timezone: "Asia/Riyadh" },
  { id: "kenya-jeddah", missionType: "Consulate General", name: "Consulate General of the Republic of Kenya in Jeddah", hostCountry: "Saudi Arabia", hostCountryCode: "SA", hostCity: "Jeddah", timezone: "Asia/Riyadh", sourceUrl: MFA_JEDDAH_SOURCE_URL, sourceLabel: "MFA notice confirming the Consulate General; contact details not listed there" },
  { id: "kenya-abu-dhabi", missionType: "Embassy", name: "Embassy of the Republic of Kenya in the United Arab Emirates", hostCountry: "United Arab Emirates", hostCountryCode: "AE", hostCity: "Abu Dhabi", phone: "+971 2 666 6300", email: "abudhabi@mfa.go.ke", timezone: "Asia/Dubai" },
  { id: "kenya-dubai", missionType: "Consulate General", name: "Kenya Consulate General in Dubai", hostCountry: "United Arab Emirates", hostCountryCode: "AE", hostCity: "Dubai", phone: "+971 4 344 2811", email: "dubai@mfa.go.ke", timezone: "Asia/Dubai", sourceUrl: diplomaticDirectory, sourceLabel: "2025/26 MFA diplomatic directory" },

  // Oceania.
  { id: "kenya-canberra", missionType: "High Commission", name: "Kenya High Commission in Australia", hostCountry: "Australia", hostCountryCode: "AU", hostCity: "Canberra", phone: "+61 2 6247 4788", email: "canberra@mfa.go.ke", timezone: "Australia/Sydney", serves: ["New Zealand"] },
];

function asMission(row: MissionRow): Mission {
  const contactLabel = row.phone || row.email ? "Published general office contact; confirm on the linked official Ministry or mission page." : "No general phone or email is listed in the source shown. Check the current Ministry directory.";
  return {
    id: row.id,
    name: row.name,
    missionType: row.missionType,
    hostCountry: row.hostCountry,
    hostCountryCode: row.hostCountryCode,
    hostCity: row.hostCity,
    serves: [...new Set([row.hostCountry, ...(row.serves ?? [])])],
    address: row.address ?? "",
    hours: "",
    timezone: row.timezone,
    phone: row.phone ?? "",
    email: row.email ?? "",
    emergency: "",
    website: row.sourceUrl ?? directory,
    sourceUrl: row.sourceUrl ?? directory,
    sourceLabel: row.sourceLabel ?? "Ministry of Foreign and Diaspora Affairs · Diplomatic Missions",
    services: row.canProvideConsularSupport === false
      ? ["Multilateral representation; not a destination consular service desk"]
      : ["Consular support — contact the mission to confirm the service and eligibility", "Citizen and diaspora enquiries — confirm current arrangements"],
    verifiedAt: DIRECTORY_SOURCE_CHECKED,
    locallyPresent: true,
    canProvideConsularSupport: row.canProvideConsularSupport ?? row.missionType !== "Permanent Mission",
    districts: row.districts ?? [],
    contactNote: contactLabel,
  };
}

export const KENYAN_MISSIONS: Mission[] = rows.map(asMission);

export const KENYAN_DIRECTORY_COUNTRIES = [...new Set(KENYAN_MISSIONS.flatMap((mission) => mission.serves))].sort((a, b) => a.localeCompare(b));
