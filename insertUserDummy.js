// index.js
require('dotenv').config();
const { time } = require('console');
const dbMain = require("/old/home/ubuntu/dealsFilterCron/db/dbHandleMain.js");
const db = require("../testDb.js");
// const { GoogleGenerativeAI } = require('@google/generative-ai'); // Not needed if Gemini API isn't used

// const API_KEY = process.env.GEMINI_API_KEY; // Not needed if Gemini API isn't used
// if (!API_KEY) {
//     console.error('GEMINI_API_KEY not found in .env file. Please set it.');
//     process.exit(1);
// }
// const genAI = new GoogleGenerativeAI(API_KEY); // Not needed if Gemini API isn't used

let globBoostedIds = {};

const PRODUCT_CATEGORIZATION_TABLE = 'buyhatke_eweather.productCategorization'; // Your product table name
const USER_PERSONAS_TABLE = 'personalisation.user_persona'; // Your user persona table name

// June 28th, 2025 in milliseconds (Current time is Friday, June 28, 2025 at 4:03:17 PM IST)
// Updated to current IST date and time
const today = new Date('2025-06-28T16:18:19.000+05:30').getTime();
const fortyDaysAgo = today - (40 * 24 * 60 * 60 * 1000);

const SUB_CATEGORIES = [9, 29, 37, 72, 99, 896, 88, 59];
const PINC_CITIES = {
    "BENGALURU": [560001, 560002, 560003, 560004, 560005, 560006, 560007, 560008, 560009, 560010],
    "BHOPAL": [462046, 462047, 462048, 462050, 462051, 462052, 462053, 462054, 462055, 462060, 462061, 462062, 462063, 462064, 462066, 462100],
    "JABALPUR": [482004, 482001, 482003, 482005]
};

// Define Tiers for cities
const CITY_TIERS = {
    "Tier1": ["BENGALURU"],
    "Tier2": ["BHOPAL"],
    "Tier3": ["JABALPUR"]
};
const ALL_TIER_NAMES = Object.keys(CITY_TIERS);

// Helper function to get a random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random timestamp within last 40 days, distributed
const getRandomTimestamp = (startDate, endDate) => {
    const randomTime = startDate + Math.random() * (endDate - startDate);
    return Math.floor(randomTime / 1000); // Convert to epoch seconds
};

// Function to calculate dominant gender (still in code, but not used for insertion)
// const getDominantGender = (products) => {
//     const genderCounts = {};
//     products.forEach(p => {
//         const gender = p.applicableTo ? p.applicableTo.toLowerCase() : 'unisex'; // Ensure lowercase and default
//         genderCounts[gender] = (genderCounts[gender] || 0) + 1;
//     });

//     let dominantGender = 'unisex';
//     let maxCount = 0;

//     for (const gender in genderCounts) {
//         if (genderCounts[gender] > maxCount) {
//             maxCount = genderCounts[gender];
//             dominantGender = gender;
//         }
//     }
//     return dominantGender;
// };

const generateUserDataAndInsert = async (numUsers = 10) => {
    const startTime = Date.now(); // Record start time
    console.log(`Starting data generation for ${numUsers} users at ${new Date(startTime).toLocaleString()}...`);


    for (let i = 0; i < numUsers; i++) {
        try {
            console.log(`Processing user ${i + 1}/${numUsers}...`);

            // 1. Random SubCategory Selection for Boosting
            const boostedSubCategory = getRandomItem(SUB_CATEGORIES);

            console.log(boostedSubCategory);

            let allBoostedIds;

            if(globBoostedIds[boostedSubCategory]){
                allBoostedIds = globBoostedIds[boostedSubCategory];
            } else {
                // 2. Product Selection (Boosted & Non-Boosted) - Optimized Approach
                    // Get all IDs for boosted category
                    const boostedIdsQuery = `
                    SELECT id
                    FROM ${PRODUCT_CATEGORIZATION_TABLE}
                    WHERE pos IN (2, 63) AND subCategory = ?;
                `;
                const boostedIdsResult = await dbMain.commonQuery(boostedIdsQuery, [boostedSubCategory]);
                
                allBoostedIds = boostedIdsResult.map(row => row.id);

                globBoostedIds[boostedSubCategory] = allBoostedIds;
            }

            // If not enough boosted IDs (minimum 500 needed), warn and skip
            if (allBoostedIds.length < 500) {
                console.warn(`Not enough boosted products found for subCategory ${boostedSubCategory}. Found ${allBoostedIds.length}. Skipping user ${i + 1}.`);
                continue;
            }

            // Randomly select 500 IDs from the fetched boosted IDs
            const selectedBoostedIds = [];
            while (selectedBoostedIds.length < 500 && allBoostedIds.length > 0) {
                const randomIndex = Math.floor(Math.random() * allBoostedIds.length);
                selectedBoostedIds.push(allBoostedIds.splice(randomIndex, 1)[0]); // Remove to prevent duplicates
            }

            // Fetch full details for the selected boosted IDs
            let boostedProducts = [];
            if (selectedBoostedIds.length > 0) {
                const fetchBoostedDetailsQuery = `
                    SELECT id, pid, pos, brandName, genericName, applicableTo, category, subCategory, subSubCategory, colour, price, prodName
                    FROM ${PRODUCT_CATEGORIZATION_TABLE}
                    WHERE id IN (?)
                `;
                // Use a single query for all selected IDs
                boostedProducts = await dbMain.commonQuery(fetchBoostedDetailsQuery, [selectedBoostedIds]);
            }


            // Fetch 200 non-boosted products - Optimized: ORDER BY DESC instead of RAND()
            const nonBoostedProdsQuery = `
                SELECT id, pid, pos, brandName, genericName, applicableTo, category, subCategory, subSubCategory, colour, price, prodName
                FROM ${PRODUCT_CATEGORIZATION_TABLE}
                WHERE pos IN (2, 63) AND subCategory != ?
                ORDER BY id DESC LIMIT 200;
            `;
            const nonBoostedProducts = await dbMain.commonQuery(nonBoostedProdsQuery, [boostedSubCategory]);

            const allProducts = [...boostedProducts, ...nonBoostedProducts];

            // If the combined list is less than 700, warn and skip
            if (allProducts.length < 700) {
                console.warn(`Not enough total products found for user ${i + 1}. Found ${allProducts.length} (boosted: ${boostedProducts.length}, non-boosted: ${nonBoostedProducts.length}). Skipping this user.`);
                continue; // Skip if we don't have enough products
            }

            // Shuffle all products to ensure random distribution for visited/purchased
            for (let j = allProducts.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [allProducts[j], allProducts[k]] = [allProducts[k], allProducts[j]];
            }

            // 3. Populating listOfProdsVisited and listOfProdsPurchased
            const numPurchased = Math.floor(0.02 * allProducts.length); // 2%
            const numVisited = allProducts.length - numPurchased; // 98%

            const purchasedProductsRaw = allProducts.slice(0, numPurchased);
            const visitedProductsRaw = allProducts.slice(numPurchased, numPurchased + numVisited);

            // Select a random tier for this user
            const randomTierName = getRandomItem(ALL_TIER_NAMES);
            const citiesInTier = CITY_TIERS[randomTierName];
            const randomCityName = getRandomItem(citiesInTier);
            const cityPincodes = PINC_CITIES[randomCityName];
            const randomPincode = getRandomItem(cityPincodes);

            const formatProductForPersona = (prod) => {
                const timestamp = getRandomTimestamp(fortyDaysAgo, today);
                return {
                    prod: prod.prodName,
                    pid: prod.pid,
                    pos: prod.pos,
                    price: prod.price,
                    brand: prod.brandName,
                    color: prod.colour,
                    gender: prod.applicableTo,
                    genericName: prod.genericName,
                    category: prod.category,
                    subCategory: prod.subCategory,
                    subSubCategory: prod.subSubCategory,
                    pincode: randomPincode,
                    timestamp: timestamp
                };
            };

            const listOfProdsPurchased = purchasedProductsRaw.map(formatProductForPersona);

            // Implement the 20% duplication logic for visited products
            let listOfProdsVisited = [];
            visitedProductsRaw.forEach(rawProd => {
                listOfProdsVisited.push(formatProductForPersona(rawProd)); // Add original
                const randomNumber = Math.floor(Math.random() * 10) + 1; // Number between 1 and 10
                if (randomNumber === 1 || randomNumber === 2) { // 20% chance
                    listOfProdsVisited.push(formatProductForPersona(rawProd)); // Add duplicate with potentially new timestamp
                }
            });


            const insertQuery = `
                INSERT INTO ${USER_PERSONAS_TABLE} (listOfProdsVisited, listOfProdsPurchased)
                VALUES (?, ?);
            `;

            const params = [
                JSON.stringify(listOfProdsVisited),
                JSON.stringify(listOfProdsPurchased)
            ];

            await db.commonQuery(insertQuery, params);
            console.log(`Inserted data for user ${i + 1}.`);

        } catch (error) {
            console.error(`Error processing user ${i + 1}:`, error);
        }
    }
    const endTime = Date.now(); // Record end time
    const elapsedTimeSeconds = (endTime - startTime) / 1000;
    console.log(`Data generation and insertion complete for ${numUsers} users at ${new Date(endTime).toLocaleString()}.`);
    console.log(`Total execution time: ${elapsedTimeSeconds.toFixed(2)} seconds.`);

    process.exit(0);
};

// Run the data generation
generateUserDataAndInsert();