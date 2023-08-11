//interface for parsing the JSON file containing an array of Artifact objects. We follow this schema for parsing 
//the file and then doing logic with them

//FOR SIMULATION ASSUMPTIONS, ALL ARTIFACTS ARE CONSIDERED 5 STAR. 
//might consider adding 4* arti support later in another expansion
export interface Artifact {
  setId: number; //what set the artifact belongs to via ID mapping
  type: string;
  //a single key/value pair for the main stat and its value
  mainStat: Partial<Record<MainStats, number>>;
  //key/value dictionary for substats and the corresponding value
  substats: Partial<Record<Substats, number>>;
  numStartStats: number;
};

export enum Substats {
  HP = "HP",
  HP_ = "HP%",
  ATK = "ATK",
  ATK_ = "ATK%",
  DEF = "DEF",
  DEF_ = "DEF%",
  CDMG_ = "CRIT DMG",
  CRATE_ = "CRIT Rate",
  EM = "Elemental Mastery",
  ER_ = "Energy Recharge",
};

export enum MainStats {
  HP = "HP",
  HP_ = "HP%",
  ATK = "ATK",
  ATK_ = "ATK%",
  DEF_ = "DEF%",
  CDMG_ = "CRIT DMG",
  CRATE_ = "CRIT Rate",
  EM = "Elemental Mastery",
  ER_ = "Energy Recharge",
  HEAL_ = "Healing Bonus",

  //these are just the main stats for goblets
  DendroDMG_ = "Dendro DMG Bonus",
  ElectroDMG_ = "Electro DMG Bonus",
  PyroDMG_ = "Pyro DMG Bonus",
  HydroDMG_ = "Hydro DMG Bonus",
  CryoDMG_ = "Cryo DMG Bonus",
  AnemoDMG_ = "Anemo DMG Bonus",
  GeoDMG_ = "Geo DMG Bonus",
  PhysDMG_ = "Physical DMG Bonus",
}
