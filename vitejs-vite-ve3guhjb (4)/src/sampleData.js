edata · JS
Copy

// sampleData.js

export const races = [
  { id: 1,  name: "Bahrain GP", country: "bh", flag: "https://flagcdn.com/w160/bh.png" },
  { id: 2,  name: "Saudi Arabia GP", country: "sa", flag: "https://flagcdn.com/w160/sa.png" },
  { id: 3,  name: "Australia GP", country: "au", flag: "https://flagcdn.com/w160/au.png" },
  { id: 4,  name: "Japan GP", country: "jp", flag: "https://flagcdn.com/w160/jp.png" },
  { id: 5,  name: "China GP", country: "cn", flag: "https://flagcdn.com/w160/cn.png" },
  { id: 6,  name: "Miami GP", country: "us", flag: "https://flagcdn.com/w160/us.png" },
  { id: 7,  name: "Emilia Romagna GP", country: "it", flag: "https://flagcdn.com/w160/it.png" },
  { id: 8,  name: "Monaco GP", country: "mc", flag: "https://flagcdn.com/w160/mc.png" },
  { id: 9,  name: "Canada GP", country: "ca", flag: "https://flagcdn.com/w160/ca.png" },
  { id: 10, name: "Spain GP", country: "es", flag: "https://flagcdn.com/w160/es.png" },
  { id: 11, name: "Austria GP", country: "at", flag: "https://flagcdn.com/w160/at.png" },
  { id: 12, name: "British GP", country: "gb", flag: "https://flagcdn.com/w160/gb.png" },
  { id: 13, name: "Hungary GP", country: "hu", flag: "https://flagcdn.com/w160/hu.png" },
  { id: 14, name: "Belgium GP", country: "be", flag: "https://flagcdn.com/w160/be.png" },
  { id: 15, name: "Netherlands GP", country: "nl", flag: "https://flagcdn.com/w160/nl.png" },
  { id: 16, name: "Italy GP", country: "it", flag: "https://flagcdn.com/w160/it.png" },
  { id: 17, name: "Azerbaijan GP", country: "az", flag: "https://flagcdn.com/w160/az.png" },
  { id: 18, name: "Singapore GP", country: "sg", flag: "https://flagcdn.com/w160/sg.png" },
  { id: 19, name: "USA GP", country: "us", flag: "https://flagcdn.com/w160/us.png" },
  { id: 20, name: "Mexico GP", country: "mx", flag: "https://flagcdn.com/w160/mx.png" },
  { id: 21, name: "Brazil GP", country: "br", flag: "https://flagcdn.com/w160/br.png" },
  { id: 22, name: "Las Vegas GP", country: "us", flag: "https://flagcdn.com/w160/us.png" },
  { id: 23, name: "Qatar GP", country: "qa", flag: "https://flagcdn.com/w160/qa.png" },
  { id: 24, name: "Abu Dhabi GP", country: "ae", flag: "https://flagcdn.com/w160/ae.png" }
];

// Official F1 points system
const f1Points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export const initialRaces = races.map(r => ({
  ...r,
  results: Array.from({ length: 20 }, (_, i) => ({
    pos: i + 1,
    name: "",
    team: "",
    points: f1Points[i] ?? 0   // top 10 get points, rest 0
  })),
  pole: { driver: "", points: 1 },
  fl: { driver: "", points: 1 },
  flag: r.flag || null,
  country: r.country || null
}));
