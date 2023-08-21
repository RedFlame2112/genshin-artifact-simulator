import { Artifact, Substats, MainStats } from "./objects";
import {
  MainStatTypeToSubStatChances,
  _DomainIdsToSetIds,
  _MainStatsToPossibleSubStats,
  _MainStatsLevelValues,
  _PossibleRolls,
  _TypeToPossibleMainStats,
} from "./data";
//simulator for rolling new artifacts in a domain
export class domainMonteCarlo {
  domainId: number; //identifier of the domain that we have used our resin on
  resinUsed: number; //the number of resin used thus far. We will use this to increment the counter of resin
  //for the MonteCarlo simulation. This will also be used to measure how efficient our resin usage was.
  constructor(domain: number) {
    this.domainId = domain;
    this.resinUsed = 0; //start off with 0 resin used.
  }

  private static getExtraArtifactProb(): boolean {
    // There is a 0.6% chance that we will get an extra artifact. besides the one we are guaranteed
    return Math.random() < 0.006;
  }

  public rollArtifacts = (domainId: number, condensed: boolean): Artifact[] => {
    let artifacts: Artifact[] = [];
    if (!condensed) {
      artifacts.push(this.getArtifact(domainId));
      if (domainMonteCarlo.getExtraArtifactProb()) {
        artifacts.push(this.getArtifact(domainId));
      }
    } else {
      artifacts.push(this.getArtifact(domainId));
      artifacts.push(this.getArtifact(domainId));
      if (domainMonteCarlo.getExtraArtifactProb()) {
        artifacts.push(this.getArtifact(domainId));
      }
      if (domainMonteCarlo.getExtraArtifactProb()) {
        artifacts.push(this.getArtifact(domainId));
      }
    }
    return artifacts;
  };

  private getArtifact(domainId: number): Artifact {
    //Choose random index 0 or 1.
    let index = Math.floor(Math.random() * 2);
    let artifactId = _DomainIdsToSetIds[domainId][index];
    //There are 5 types of mainStats, so let's choose a random index from 0 to 4.
    let typeIndex = Math.floor(Math.random() * 5);

    let type: string = "";
    switch (typeIndex) {
      case 0:
        type = "flower";
        break;
      case 1:
        type = "feather";
        break;
      case 2:
        type = "circlet";
        break;
      case 3:
        type = "goblet";
        break;
      case 4:
        type = "sands";
        break;
    }


    let mainStat = this.getMainStat(type);
    const numStartStats = this.getStartingSubStatCount();
    let mainStatLevelValue: number = _MainStatsLevelValues[mainStat][0];

    let substats: Partial<Record<Substats, number>> = this.generateSubStats(
      mainStat,
      type,
      numStartStats
    );

    let artifactMainStat: Partial<Record<MainStats, number>> = {
      [mainStat]: mainStatLevelValue,
    };

    return {
      setId: artifactId,
      type: type,
      mainStat: artifactMainStat,
      substats: substats,
      numStartStats: numStartStats,
    };
  }


  private getRandomIndx = (weights: number[], results: any[]): any => {
    let num: number = Math.random(),
      s: number = 0,
      lastIndex: number = weights.length - 1;
    for (let i = 0; i < lastIndex; ++i) {
      s += weights[i];
      if (num < s) {
        return results[i];
      }
    }
    return results[lastIndex];
  };
  private getMainStat(type: string): MainStats {
    try {
      if (type === "feather") {
        return MainStats.ATK; //will always return flat ATK
      } else if (type === "circlet") {
        let weights = [0.22, 0.22, 0.22, 0.04, 0.1, 0.1, 0.1];
        let possibleStats: MainStats[] = _TypeToPossibleMainStats[type];
        return this.getRandomIndx(weights, possibleStats);
      } else if (type === "goblet") {
        let weights = [
          0.1925, 0.1925, 0.19, 0.025, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05,
        ];
        let possibleStats: MainStats[] = _TypeToPossibleMainStats[type];
        return this.getRandomIndx(weights, possibleStats);
      } else if (type === "sands") {
        let weights = [0.2666, 0.2668, 0.2666, 0.1, 0.1];
        let possibleStats: MainStats[] = _TypeToPossibleMainStats[type];
        return this.getRandomIndx(weights, possibleStats);
      } else {
        //throw an exception that this isn't a valid type
        return MainStats.HP;
      }
    } catch (e) {
      console.log(e);
    }
    //lmao external case control; this line should never be reached by default since the type is guaranteed to be something valid
    return MainStats.HP; //just some random val for stopping the complaining TS compiler
  }


  private generateSubStats(
    mainStat: MainStats,
    type: string,
    numStartStats: number
  ): Partial<Record<Substats, number>> {
    //Chance of getting 3 substats is approx 90%, chance of 4 starting is approx 10%

    const substatChances = MainStatTypeToSubStatChances[type][mainStat];
    let substatsArray = Object.keys(substatChances) as Substats[];


    const generatedSubstats: Partial<Record<Substats, number>> = {};
    for (let i = 0; i < numStartStats; ++i) {
      const { selectedSubstat, updatedSubstatsArray } =
        this.selectRandomSubstat(substatsArray, substatChances);
      substatsArray = updatedSubstatsArray;
      const selectedValue = this.selectRandomSubstatValue(selectedSubstat);
      generatedSubstats[selectedSubstat] = selectedValue;
    }

    return generatedSubstats;
  }


  private selectRandomSubstat(
    substatsArray: Substats[],
    substatChances: Record<Substats, number>
  ): { selectedSubstat: Substats; updatedSubstatsArray: Substats[] } {
    const weightsArray = substatsArray.map(
      (substat) => substatChances[substat]
    );

    const selectedSubstat = this.getRandomIndx(
      weightsArray,
      substatsArray
    ) as Substats;
    const index = substatsArray.indexOf(selectedSubstat);
    substatsArray.splice(index, 1); // Remove the chosen substat

    return {
      selectedSubstat,
      updatedSubstatsArray: substatsArray,
    };
  }


  private getStartingSubStatCount(): number {
    const results: number[] = [3, 4];
    const weights: number[] = [0.9, 0.1];
    return this.getRandomIndx(weights, results);
  }


  private selectRandomSubstatValue(substat: Substats): number {
    const possibleValues = _PossibleRolls[substat];
    const randomValueIndex = Math.floor(Math.random() * possibleValues.length);
    return possibleValues[randomValueIndex];
  }
}

//simulator for levelling up the artifacts from a list of Artifact objects
export class rollsMonteCarlo {
  artifacts: Artifact[];
  constructor(artifacts: Artifact[]) {
      this.artifacts = artifacts;
  }
  //we are going to raise every artifact in the list up to level 20.
  //


  public levelArtifacts(): { artifacts: Artifact[]; rollHistory: Record<number, { substat: Substats; value: number }[]> } {
    let newArtifacts: Artifact[] = [];
    let rollHistory: Record<number, { substat: Substats; value: number }[]> = {};

    for(const [index, artifact] of this.artifacts.entries()) {
      const result = this.levelArtifact(artifact);
      newArtifacts.push(result.artifact);
      rollHistory[index] = result.rolls;
    }

    return {
      artifacts: newArtifacts,
      rollHistory: rollHistory,
    };
  }

  
  private levelArtifact(artifact: Artifact): { artifact: Artifact, rolls: { substat: Substats; value: number }[] } {
    const currentSubstats = Object.keys(artifact.substats) as Substats[];
    let rollValues: { substat: Substats; value: number }[] = [];
    for (const substat of currentSubstats) {
      rollValues.push({ substat: substat, value: artifact.substats[substat]! });
    }
    
    let newSubstats = { ...artifact.substats };
    let leveledRolls = 5;
    if(artifact.numStartStats === 3){
      const mainStat = Object.keys(artifact.mainStat)[0] as MainStats;
      const recalculatedProbs: Partial<Record<Substats, number>> =
        this.recalculateProbs(
          mainStat,
          artifact.type,
          currentSubstats
        );
      const substatToAdd = this.getRandomSubstat(recalculatedProbs);
      const rollValue = this.getRandomRoll(_PossibleRolls[substatToAdd]);
      rollValues.push({ substat: substatToAdd, value: rollValue });
      newSubstats[substatToAdd] = rollValue;
      leveledRolls -= 1;
    }

    for (let i = 0; i <= leveledRolls; ++i) {
      const substatToUpgrade = this.getRandomElement<Substats>(Object.keys(newSubstats) as Substats[]);
      const rollValue = this.getRandomRoll(_PossibleRolls[substatToUpgrade]);
      newSubstats[substatToUpgrade] = (newSubstats[substatToUpgrade] ?? 0) + rollValue;
      rollValues.push({ substat: substatToUpgrade, value: rollValue });
    }

    const artifactMainStat = Object.keys(artifact.mainStat)[0] as MainStats;
    const newMainStatValue = _MainStatsLevelValues[artifactMainStat][1]; //level 20 main stat value
    let newMainStats: Partial<Record<MainStats, number>> = {
      [artifactMainStat]: newMainStatValue
    };
    const leveledArtifact: Artifact = {
      ...artifact,
      mainStat: newMainStats,
      substats: newSubstats,
    };

    return {
      artifact: leveledArtifact,
      rolls: rollValues,
    };
  }


  private recalculateProbs(
    mainStat: MainStats,
    type: string,
    rolledSubStats: Substats[]
  ): Partial<Record<Substats, number>> {
    const originalProbs = MainStatTypeToSubStatChances[type][mainStat];
    const newProbs: Partial<Record<Substats, number>> = {};

    let totalProbLeft = 1;
    for(const rolledSubstat of rolledSubStats) {
      totalProbLeft -= originalProbs[rolledSubstat];
    }

    for(const substat in originalProbs) {
      if(!rolledSubStats.includes(substat as Substats)){
        // Calculate the adjusted probability
        const adjustedProb = (originalProbs[substat as Substats] / totalProbLeft) * (1 - totalProbLeft);
        // If it doesn't exist, initialize it. Otherwise, add the adjusted probability.
        newProbs[substat as Substats] = (newProbs[substat as Substats] || 0) + adjustedProb + originalProbs[substat as Substats];
      }
    }

    return newProbs;
  }


  private getRandomSubstat(probs: Partial<Record<Substats, number>>): Substats {
    const total = Object.values(probs).reduce((sum, prob) => sum + prob, 0);
    const randomValue = Math.random() * total;
    let sum = 0;
    for (const [substat, prob] of Object.entries(probs)) {
        sum += prob!;
        if (randomValue <= sum) return substat as Substats;
    }

    throw new Error("Could not get a random substat.");
  }


  private getRandomRoll(possibleValues: number[]): number {
    const randomIndex = Math.floor(Math.random() * possibleValues.length);
    return possibleValues[randomIndex];
  }


  private getRandomElement<T>(array: T[]): T {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
  }

};
