import { domainMonteCarlo } from "../interfaces/monte-carlo";
import { _SetIdToName, _DomainIdToName } from "../interfaces/data";
import { Artifact } from "../interfaces/objects";
import * as fs from "fs";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

// Resin Constants
const NORMAL_RESIN_COST = 20;
const CONDENSED_RESIN_COST = 40;

const generateSummary = (artifacts: Artifact[], domainId: number) => {
  //initiate buffer for summary 
  let report =`Simulation Report for Domain: ${_DomainIdToName[domainId]}\n\n======================================\n`;
  artifacts.forEach((artifact, index) => {
    report += `Artifact ${index + 1}:\n`;
    report += `Type: ${artifact.type}\n`;
    report += `Set: ${_SetIdToName[artifact.setId]}\n`;
    for (let [key, value] of Object.entries(artifact.mainStat)) {
      report += `Main Stat: ${key}${key.includes('_') ? '%' : ''} - ${value}${key.includes('_') ? '%' : ''}\n`;
    }
    report += 'Substats:\n';
    for (let [key, value] of Object.entries(artifact.substats)) {
      report += `${key}${key.includes('_') ? '%' : ''}: ${value}${key.includes('_') ? '%' : ''}\n`;
    }
    report += '======================================\n';
  });
  fs.writeFileSync(`${_DomainIdToName[domainId]}-run.txt`, report, { flag: 'a' });
};

const yargsSetup = (yargs: Argv) => {
  return yargs.options({
    'domain': {
      type: 'number',
      default: 1,
      describe: 'Domain ID to simulate',
    },
    'numRuns': {
      type: 'number',
      default: 1,
      describe: 'Number of runs to simulate',
    },
    'condensed': {
      type: 'boolean',
      default: false,
      describe: 'Whether to use condensed resin',
    }
  });
}

yargs(hideBin(process.argv))
.command(
  'farm', 
  'Start the farming simulator', 
  yargsSetup, 
  farmSimulator
)
.command(
  'list-domains',
  'List all domain IDs and names',
  () => {
    for (const [id, name] of Object.entries(_DomainIdToName)) {
      console.log(`ID: ${id} - Name: ${name}`);
    }
    process.exit(0);
  }
)
.demandCommand(1, 'You must provide a command')
.help()
.argv;

//generate summary from list of artifacts

function farmSimulator(argv: any) {
  let totalResinUsed = 0;
  try {
    const previousResinData = fs.readFileSync('resin-data.txt', 'utf-8');
    totalResinUsed = parseInt(previousResinData);
  } catch (err) {
    console.log("No previous resin data found. Starting fresh.");
  }

  if (argv.numRuns && argv.domain) {
    for (let i = 0; i < argv.numRuns; i++) {
      const sim = new domainMonteCarlo(argv.domain);
      const artifacts: Artifact[] = sim.rollArtifacts(argv.domain, argv.condensed);
      generateSummary(artifacts, argv.domain);
      // Track resin usage
      totalResinUsed += argv.condensed ? CONDENSED_RESIN_COST : NORMAL_RESIN_COST;
      fs.writeFileSync('resin-data.txt', totalResinUsed.toString(), { flag: 'w' });
    }
    console.log(`Run Summary generated at ${_DomainIdToName[argv.domain]}-run.txt`)
  } else {
    console.log("Flags weren't set correctly!!");
    process.exit(1);
  } 
}
