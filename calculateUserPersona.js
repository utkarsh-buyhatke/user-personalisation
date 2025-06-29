const dbHandle = require("../testDb.js");
const fs = require('fs');

const PINC_TO_CITY = {
    560001: "BENGALURU", 560002: "BENGALURU", 560003: "BENGALURU", 560004: "BENGALURU", 560005: "BENGALURU",
    560006: "BENGALURU", 560007: "BENGALURU", 560008: "BENGALURU", 560009: "BENGALURU", 560010: "BENGALURU",
    462046: "BHOPAL", 462047: "BHOPAL", 462048: "BHOPAL", 462050: "BHOPAL", 462051: "BHOPAL",
    462052: "BHOPAL", 462053: "BHOPAL", 462054: "BHOPAL", 462055: "BHOPAL", 462060: "BHOPAL",
    462061: "BHOPAL", 462062: "BHOPAL", 462063: "BHOPAL", 462064: "BHOPAL", 462066: "BHOPAL",
    462100: "BHOPAL", 482004: "JABALPUR", 482001: "JABALPUR", 482003: "JABALPUR", 482005: "JABALPUR"
};

const CITY_TO_TIER = {
    "BENGALURU": "Tier1",
    "BHOPAL": "Tier2",
    "JABALPUR": "Tier3"
};

function getRandomIndices(arrayLength, count = 10) {
    if (arrayLength <= 0) return [];
    count = Math.min(count, arrayLength); // <-- Fix
    const indices = Array.from({ length: arrayLength }, (_, i) => i);

    for (let i = indices.length - 1; i > indices.length - 1 - count; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(-count);
}

function getFirst3to5Words(str) {
    const words = str.trim().split(/\s+/);
    const count = Math.min(words.length, 3 + Math.floor(Math.random() * 3)); // 3 to 5 words
    return words.slice(0, count).join(' ');
}

async function calculatePersona() {
    try {
        let selQ = "SELECT extId, listOfProdsVisited, listOfProdsPurchased FROM `personalisation`.`user_persona` WHERE hasChanged = 1 LIMIT 100";
        let resQ = await dbHandle.commonQuery(selQ, []);

        for(let res of resQ){
            try {
                let {extId, listOfProdsVisited, listOfProdsPurchased} = res;

                // part to read file

                listOfProdsVisited = JSON.parse(listOfProdsVisited);

                let filePath = listOfProdsVisited.filepath;

                listOfProdsVisited = fs.readFileSync(filePath, 'utf8');

                let brandAffinity = {}, genderMap = {}, categoryAffinity = {}, ecommerceMap = {}, cityMap = {}, genericAffinity = {}, searchTerms = [];

                if(listOfProdsVisited){
                    listOfProdsVisited = JSON.parse(listOfProdsVisited);

                    for(let eachObj of listOfProdsVisited){
                        let { prod, pid, pos, price, brand, gender, pincode, timestamp, category, subCategory, subSubCategory, genericName } = eachObj;

                        if(brand){
                            brand = brand.toLowerCase();
                            brandAffinity[brand] = (brandAffinity[brand] || 0) + 1; // 1 point for visit
                        }

                        if(gender){
                            gender = gender.toLowerCase();
                            genderMap[gender] = (genderMap[gender] || 0) + 1; // 1 point for visit
                        }

                        if(category && category != -1){
                            categoryAffinity[category] = (categoryAffinity[category] || 0) + 1;
                        }

                        if(subCategory && subCategory != -1){
                            categoryAffinity[subCategory] = (categoryAffinity[subCategory] || 0) + 1;
                        }

                        if(subSubCategory && subSubCategory != -1){
                            categoryAffinity[subSubCategory] = (categoryAffinity[subSubCategory] || 0) + 1;
                        }

                        ecommerceMap[pos] = (ecommerceMap[pos] || 0) + 1;

                        if(genericName){
                            genericName = genericName.toLowerCase();
                            genericAffinity[genericName] = (genericAffinity[genericName] || 0) + 1;
                        }

                        if(pincode && PINC_TO_CITY[pincode] && CITY_TO_TIER[PINC_TO_CITY[pincode]]){
                            cityMap[CITY_TO_TIER[PINC_TO_CITY[pincode]]] = (cityMap[CITY_TO_TIER[PINC_TO_CITY[pincode]]] || 0) + 1;
                        }
                    }
                }

                if(listOfProdsPurchased){
                    listOfProdsPurchased = JSON.parse(listOfProdsPurchased);

                    for(let eachObj of listOfProdsPurchased){
                        let { prod, pid, pos, price, brand, gender, pincode, timestamp, category, subCategory, subSubCategory, genericName } = eachObj;

                        if(brand){
                            brand = brand.toLowerCase();
                            brandAffinity[brand] = (brandAffinity[brand] || 0) + 40; // 40 point for purchase
                        }

                        if(gender){
                            gender = gender.toLowerCase();
                            genderMap[gender] = (genderMap[gender] || 0) + 1; // 1 point for visit
                        }

                        if(category && category != -1){
                            categoryAffinity[category] = (categoryAffinity[category] || 0) + 40;
                        }

                        if(subCategory && subCategory != -1){
                            categoryAffinity[subCategory] = (categoryAffinity[subCategory] || 0) + 40;
                        }

                        if(subSubCategory && subSubCategory != -1){
                            categoryAffinity[subSubCategory] = (categoryAffinity[subSubCategory] || 0) + 40;
                        }

                        ecommerceMap[pos] = (ecommerceMap[pos] || 0) + 40;

                        if(genericName){
                            genericName = genericName.toLowerCase();
                            genericAffinity[genericName] = (genericAffinity[genericName] || 0) + 40;
                        }

                        if(pincode && PINC_TO_CITY[pincode] && CITY_TO_TIER[PINC_TO_CITY[pincode]]){
                            cityMap[CITY_TO_TIER[PINC_TO_CITY[pincode]]] = (cityMap[CITY_TO_TIER[PINC_TO_CITY[pincode]]] || 0) + 1;
                        }
                    }
                }

                const randomIndices = getRandomIndices(listOfProdsVisited.length, 20);

                for(let indice of randomIndices){

                    let {prod, pos, brand, timestamp, category, subCategory, subSubCategory, genericName} = listOfProdsVisited[indice];

                    let query = getFirst3to5Words(prod);

                    query = query.toLowerCase();

                    if(brand){
                        brand = brand.toLowerCase();
                        brandAffinity[brand] = (brandAffinity[brand] || 0) + 5; // 5 point for search
                    }

                    if(category && category != -1){
                        categoryAffinity[category] = (categoryAffinity[category] || 0) + 5;
                    }

                    if(subCategory && subCategory != -1){
                        categoryAffinity[subCategory] = (categoryAffinity[subCategory] || 0) + 5;
                    }

                    if(subSubCategory && subSubCategory != -1){
                        categoryAffinity[subSubCategory] = (categoryAffinity[subSubCategory] || 0) + 5;
                    }

                    ecommerceMap[pos] = (ecommerceMap[pos] || 0) + 5;

                    if(genericName){
                        genericName = genericName.toLowerCase();
                        genericAffinity[genericName] = (genericAffinity[genericName] || 0) + 5;
                    }

                    searchTerms.push({query, timestamp, brand, genericName, category, subCategory, subSubCategory, pos});
                }

                let upd = "UPDATE `personalisation`.`user_persona` SET searchTerms = ?, gender = ?, city = ?, ecomm = ?, brandAffinity = ?, categoryAffinity = ?, genericAffinity = ?, hasChanged = 2 WHERE extId = ?";
                await dbHandle.commonQuery(upd, [JSON.stringify(searchTerms), JSON.stringify(genderMap), JSON.stringify(cityMap), JSON.stringify(ecommerceMap), JSON.stringify(brandAffinity), JSON.stringify(categoryAffinity), JSON.stringify(genericAffinity), extId]);

            } catch (err) {
                console.error(err);
            }
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

calculatePersona();