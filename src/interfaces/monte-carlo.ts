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

  //create an array of a random number of artifacts of any type.
  //For a single run, we are always guaranteed 1 5* artifact.

  //roll a number of starting level artifacts based on which domain we are farming.
  //If we are using condensed resin, we will guarantee 2 artifacts, with a small possibility of getting 3 or 4 artifacts.
  //If we are not using condensed resin, we will guarantee 1 artifact with a small possibility of getting 2 artifacts.
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

//simulator for levelling up the artifacts
// export class rollsMonteCarlo {

// };
