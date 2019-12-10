# TSM-Extract

tsm-extract is a tool for extracting auction house data from your TSM addon and saving it in a .csv file. It works by parsing the .lua file containing TSM's AH values via Regex, converting those results into a javascript object, and then writing that information into a new .csv file.

## Installation

1) Make sure you have <a href="https://nodejs.org/">Nodejs</a> installed.
2) Copy this repo to your machine.  One way to do this is with the following command:
```bash
git clone https://github.com/enkemmc/tsm-extract
```
3) Open the mysettings.json file and replace the default settings for "serverName" and "appDataFilePath" with your own settings.

## Configuring mysettings.json

**"serverName"** - This property is the name of your server according to TSM.  It is necessary because your AppData.lua file can contain data from multiple servers.  e.g. Whitemane-Alliance, or Classic-US

**"appDataFilePath"** - This property tells the program where to find your AppData.lua file.  

**"mapFilePath"** - Your AppData.lua file does not contain the actual name of any item, only their item id.  The file at this path maps item ids to actual item names to make the csv more useful.  I found this file on an old forum post <a href="https://us.battle.net/forums/en/bnet/topic/14729973498">here</a>.

**"automaticallyOpenCSV"** - If you are on a windows machine and you want the csv to automatically open after you run the program, then change this setting from false to true.

## Usage

```bash
node tsm-extract.js
```
