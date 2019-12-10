const fs = require('fs')
const { exec } = require('child_process')

const classicHeaders = 'itemString,regionMarketValue,regionMinBuyout,regionHistorical,regionSale,regionSoldPerDay,regionSalePercent,'
const headersForEveryOtherServer = 'itemString,marketValue,minBuyout,historical,numAuctions,'


function main(){
    
    const {serverName, mapFilePath, appDataFilePath, automaticallyOpenCSV} = getSettings()

    const rawtext = String(fs.readFileSync(appDataFilePath))

    // TO-DO: clean up headers code with a real regex parse
    let headers = serverName !== 'Classic-US' ? `${headersForEveryOtherServer}\r\n` : `${classicHeaders}\r\n`
    
    const itemsArr = getItemsArr(rawtext, serverName)
    
    let map
    
    if (mapFilePath){
        map = getItemIdToItemNameMap(mapFilePath)
        headers = 'itemName,' + headers
    }
    
    // save items in csv file
    const items_as_csv = itemsArr.reduce((pv, line_as_arr) => {
        let line_as_csv = line_as_arr.reduce((pv, value) => pv += `${value},`,'')
        if (mapFilePath){
            const itemString = line_as_arr[0]
            const key = String(itemString)
            const found_item_name = map[key]

            if (found_item_name){
                return pv += `${found_item_name},${line_as_csv}\r\n`
            } else {
                return pv += `,${line_as_csv}\r\n`
            }
        } else {
            return pv += `${line_as_csv}\r\n`
        }
    },headers)

    const output_file_path = `${serverName}.csv`

    try {
        fs.writeFileSync(output_file_path, items_as_csv)
    } catch(e){      
        // user may already have the file open that they requested we write to  
        console.log(`there was an error finding or opening ${output_file_path}`)
        console.log(e.message)
        process.exit(1)
    }

    if (automaticallyOpenCSV){
        exec(`start "" ${output_file_path}`)
    }
}

function getItemsArr(rawtext, serverName){
    const item_pricing_string_matcher = new RegExp(`(?<=select\\(2, ...\\).LoadData\\("AUCTIONDB_MARKET_DATA","${serverName}",\\[\\[return {)(.*)(?=}}\]\])`)    
    
    const substrs = item_pricing_string_matcher.exec(rawtext)
    if (!substrs){
        // regex returned no results
        console.error(`couldn't find ${serverName} data in your AppData.lua file.\r\nremember that the server name is case-sensitive.\r\n`)
        const viable_server_names = getPossibleServerNames(rawtext)
        if (!viable_server_names.length){
            console.error(`unable to find any viable server names in your file.  expected the server name to contain letters and hypens`)
        } else {
            console.error(`\r\nServers found in your data file:`)
            for (let name_of_found_server of viable_server_names){
                console.error(`${name_of_found_server}`)
            }
        }
        process.exit(0)
    }
    
    let substr = substrs[0].split('data={')[1]
    substr = substr.replace(/{/g, '[')
    substr = substr.replace(/}/g, ']')
    
    return JSON.parse(`[${substr}]`)
}

function getPossibleServerNames(rawtext){
    const server_name_extractor = /(?<=AUCTIONDB_MARKET_DATA",")([a-zA-Z-]*)(?=")/g
    const possibleNamesArr = []

    let match = server_name_extractor.exec(rawtext)

    while(match !== null){
        const server_name = match[0]
        possibleNamesArr.push(server_name)
        match = server_name_extractor.exec(rawtext)
    }
    
    return possibleNamesArr
}

function getSettings(){
    const rawtext = String(fs.readFileSync('./mysettings.json'))
    const settings = JSON.parse(rawtext)
    return settings
}

function getItemIdToItemNameMap(mapFilePath){
    const data = String(fs.readFileSync(mapFilePath))
    const objArr = JSON.parse(data)
    const map = {}
    for (let item of objArr){
        const { itemId, itemName } = item
        map[itemId] = itemName
    }
    return map
}



main()