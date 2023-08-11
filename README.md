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
- When you run the command, you should get some file with the title of the domain you just ran through as a .txt file (apologies as the name is long for now; I'll fix it in the future) and another file representing the amount of resin you have already used. Check examples for such an example when running the command
    ```
    $ npm run simulator -- farm --domain=8 --numRuns=4 --condensed
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