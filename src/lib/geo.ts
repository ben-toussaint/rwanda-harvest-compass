export const DISTRICTS: Record<string, string[]> = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  Northern: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  Southern: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  Eastern: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  Western: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
};
export const provinceOf = (district: string) =>
  Object.entries(DISTRICTS).find(([, ds]) => ds.includes(district))?.[0] ?? "";

export const CROPS = [
  { id: "maize", label: "Maize", available: true },
  { id: "irish_potato", label: "Irish potato", available: false },
  { id: "beans", label: "Beans", available: false },
  { id: "cassava", label: "Cassava", available: false },
];
