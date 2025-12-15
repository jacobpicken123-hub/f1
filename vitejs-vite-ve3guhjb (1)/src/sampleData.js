// sampleData.js

export const races = [
  { id: 1,  name: "India GP" },
  { id: 2,  name: "Saudi Arabia GP" },
  { id: 3,  name: "Australia GP" },
  { id: 4,  name: "Japan GP" },
  { id: 5,  name: "Canada GP" },
  { id: 6,  name: "Monaco GP" },
  { id: 7,  name: "Spain GP" },
  { id: 8,  name: "Austria GP" },
  { id: 9,  name: "Belgium GP" },
  { id: 10, name: "Italy GP" },
  { id: 11, name: "Singapore GP" },
  { id: 12, name: "Russia GP" },
  { id: 13, name: "USA GP" },
  { id: 14, name: "Mexico GP" },
  { id: 15, name: "Brazil GP" },
  { id: 16, name: "France GP" },
  { id: 17, name: "Germany GP" },
  { id: 18, name: "Hungary GP" },
  { id: 19, name: "Netherlands GP" },
  { id: 20, name: "Portugal GP" },
  { id: 21, name: "China GP" },
  { id: 22, name: "Austria Sprint" },
  { id: 23, name: "Japan Sprint" },
  { id: 24, name: "Abu Dhabi GP" }
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
  fl: { driver: "", points: 0 },
  pole: { driver: "", points: 0 }
}));
