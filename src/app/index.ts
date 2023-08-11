import { domainMonteCarlo } from "../interfaces/monte-carlo";
import {
  _SetIdToName,
  _DomainIdToName,
  _PossibleRolls,
} from "../interfaces/data";
import { Artifact, MainStats, Substats } from "../interfaces/objects";
import * as fs from "fs";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

// Resin Constants
const NORMAL_RESIN_COST = 20;
const CONDENSED_RESIN_COST = 40;

const generateSummary = (artifacts: Artifact[], domainId: number) => {
  //initiate buffer for summary
  let report = `Simulation Report for Domain: ${_DomainIdToName[domainId]}\n\n======================================\n`;
  artifacts.forEach((artifact, index) => {
    report += `Artifact ${index + 1}:\n`;
    report += `Type: ${artifact.type}\n`;
    report += `Set: ${_SetIdToName[artifact.setId]} (ID: ${artifact.setId}) \n`;
    for (let [key, value] of Object.entries(artifact.mainStat)) {
      report += `Main Stat: ${key}${key.includes("_") ? "%" : ""} - ${value}${
        key.includes("_") ? "%" : ""
      }\n`;
    }
    report += "Substats:\n";
    for (let [key, value] of Object.entries(artifact.substats)) {
      report += `${key}${key.includes("_") ? "%" : ""}: ${value}${
        key.includes("_") ? "%" : ""
      }\n`;
    }
    report += "======================================\n";
  });
  fs.writeFileSync(`artifacts.txt`, report, {
    flag: "a",
  });
};
const parseFileToArtifacts = (file: string): Artifact[] => {
  const contents = fs.readFileSync(file, "utf8");
  const sections = contents
    .split("======================================")
    .filter(Boolean);

  const setIdRegex = /ID: ([\d.]+)/;

  const artifacts: Artifact[] = [];

  for (const section of sections) {
    const lines = section.split("\n").filter(Boolean);

    // Check to see if the section is too short to be a valid artifact
    if (lines.length < 5) {
      continue;
    }

    let type = "";
    let setId = "0";
    let mainStat: Partial<Record<MainStats, number>> = {};

    let inSubstats = false;
    const substats: Partial<Record<Substats, number>> = {};

    lines.forEach((line, index) => {
      if (line.startsWith("Type")) {
        type = line.split(": ")[1].trim();
      } else if (line.includes("(ID:")) {
        const setIdMatch = line.match(setIdRegex);
        setId = setIdMatch ? setIdMatch[1] : "0";
      } else if (line.startsWith("Main Stat")) {
        const mainStatParts = line.split("-").map((part) => part.trim());
        if (mainStatParts.length !== 2) {
          console.error("Unexpected main stat format:", line);
          return;
        }
        const mainStatKey = mainStatParts[0].replace("Main Stat: ", "").trim();
        const mainStatValue = parseFloat(mainStatParts[1]);
        mainStat[mainStatKey as MainStats] = mainStatValue;
      } else if (line.startsWith("Substats:")) {
        inSubstats = true;
      } else if (inSubstats) {
        const substatParts = line.split(":").map((part) => part.trim());
        if (substatParts.length !== 2) {
          inSubstats = false;
          return;
        }
        const substatKey = substatParts[0];
        const substatValue = parseFloat(substatParts[1]);
        substats[substatKey as Substats] = substatValue;
      }
    });

    const artifact: Artifact = {
      setId: parseFloat(setId),
      type: type,
      mainStat: mainStat,
      substats: substats,
      numStartStats: Object.keys(substats).length,
    };

    artifacts.push(artifact);
  }
  return artifacts;
};


const yargsSetup = (yargs: Argv) => {
  return yargs.options({
    domain: {
      type: "number",
      default: 1,
      describe: "Domain ID to simulate",
    },
    numRuns: {
      type: "number",
      default: 1,
      describe: "Number of runs to simulate",
    },
    condensed: {
      type: "boolean",
      default: false,
      describe: "Whether to use condensed resin",
    },
  });
};

const yargsReadCommand = (yargs: Argv) => {
  return yargs.options({
    file: {
      type: "string",
      default: "artifacts.txt",
      demandOption: true,
      describe: "Path to file containing artifact data",
    },
  });
};

yargs(hideBin(process.argv))
  .command("farm", "Start the farming simulator", yargsSetup, farmSimulator)
  .command("list-domains", "List all domain IDs and names", () => {
    for (const [id, name] of Object.entries(_DomainIdToName)) {
      console.log(`ID: ${id} - Name: ${name}`);
    }
    process.exit(0);
  })
  .command(
    "read-artifacts",
    "Parse all artifacts and print them to the console from given filename",
    yargsReadCommand,
    (argv: any) => {
      const artifacts = parseFileToArtifacts(argv.file);
      console.log(artifacts);
    }
  )
  .demandCommand(1, "You must provide a command")
  .help().argv;

//generate summary from list of artifacts

function farmSimulator(argv: any) {
  let totalResinUsed = 0;
  try {
    const previousResinData = fs.readFileSync("resin-data.txt", "utf-8");
    totalResinUsed = parseInt(previousResinData);
  } catch (err) {
    console.log("No previous resin data found. Starting fresh.");
  }

  if (argv.numRuns && argv.domain) {
    for (let i = 0; i < argv.numRuns; i++) {
      const sim = new domainMonteCarlo(argv.domain);
      const artifacts: Artifact[] = sim.rollArtifacts(
        argv.domain,
        argv.condensed
      );
      generateSummary(artifacts, argv.domain);
      // Track resin usage
      totalResinUsed += argv.condensed
        ? CONDENSED_RESIN_COST
        : NORMAL_RESIN_COST;
      fs.writeFileSync("resin-data.txt", totalResinUsed.toString(), {
        flag: "w",
      });
    }
    let ref = _DomainIdToName[argv.domain];
    let domainName = ref.substring(0, ref.indexOf(" ("));
    console.log(
      `Run Summary of ${domainName} added/generated at artifacts.txt\n` + `Total Resin Used Thus far: ${totalResinUsed}`
    );
  } else {
    console.log("Flags weren't set correctly!!");
    process.exit(1);
  }
}
