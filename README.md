# Genshin Artifact Roll Simulator

Just a utility for creating a simulation for genshin artifact rolls. Right on your command line

### Installation

- Clone this git repository using 
    ```
    $ git clone https://github.com/RedFlame2112/genshin-opt-calc
    ``` 
    in your command line. You can also directly download the ZIP files from the repository.
- Navigate to the project folder. It should be called `genshin-opt-calc` but you can name it whatever you like. Use the command
    ```
    $ cd genshin-opt-calc
    ```
- Make sure you have [npm](https://www.npmjs.com/) installed on your computer. Else you can just follow the link over there and get NPM running fine
- Install all the dependencies required by using the command
    ```
    $ npm install
    ```
### Usage
- To actually generate the file needed to run the project make sure you run the command 
  ```
  $ npm run build
  ```
  so that it actually compiles
- The main usage of the command will be something like
  ```
  $ npm run simulator -- farm --domain=8 --numRuns=5 --condensed
  ```
  where the condensed flag is optional and just represents a run with condensed resin used.
- If you want a list of all the domain IDs, just run
  ```
  $ npm run simulator list-domains
  ```
- When you run the command, your artifact details you have gained from the run are written to your "lifetime" artifacts file (artifacts.txt) and another file representing the amount of resin you have already used is either created or updated called "resin-data.txt"; you can keep track of how much resin has globally been used already at this file, and it's written in the console output too. Check examples for such an example when running the commands
    ```
    $ npm run simulator -- farm --domain=8 --numRuns=5
    $ npm run simulator -- farm --domain=11 --numRuns=3 --condensed
    ```
    in succession
- You can print all of the artifacts that you currently have earned (written in the file) directly to the console as an array of Artifact objects-- partially as a functional test. Just run
    ```
    $ npm run simulator read-artifacts
    ```

### List of current supported domains
Currently, we have these domain IDs to choose from and farm.
```
ID: 1 - Name: Midsummer courtyard (thundering fury and thundersoother)
ID: 2 - Name: Valley of Remembrance (Viridescent Venerer and Maiden Beloved)
ID: 3 - Name: Domain of Guyun (Archaic Petra and Retracing Bolide)
ID: 4 - Name: Hidden Palace of Zhou Formula (Crimson Witch of Flames and Lavawalker)
ID: 5 - Name: Clear Pool and Mountain Cavern (Noblesse Oblige and Bloodstained Chivalry)
ID: 6 - Name: Peak of Vindagnyr (Blizzard Strayer and Heart of Depth)
ID: 7 - Name: Ridge Watch (Tenacity of the Milelith and Pale flame)
ID: 8 - Name: Momiji-Dyed Court (Emblem of Severed Fate and Shimenawa's Reminiscence)
ID: 9 - Name: Slumbering Court (Husk of Opulent Dreams and Ocean hued Clam)
ID: 10 - Name: The Lost Valley (Vermillion Hereafter and Echoes of an Offering)
ID: 11 - Name: Spire of Solitary Enlightenment (Deepwood Memories and Gilded Dreams)
ID: 12 - Name: City of Gold (Flower of Paradise Lost and Desert Pavilion Chronicle)
ID: 13 - Name: Molten Iron Fortress (Nymph's Dreams and Vorukasha's Glow)
```