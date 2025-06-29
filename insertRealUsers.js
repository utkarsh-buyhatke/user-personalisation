const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse'); // Renamed to 'parse' to avoid conflict with path.parse
const dbMain = require("/old/home/ubuntu/dealsFilterCron/db/dbHandleMain.js");
const dbTest = require("../testDb.js");

// Database table names
const PRODUCT_CATEGORIZATION_TABLE = 'buyhatke_eweather.productCategorization'; // In your main DB (e.g., buyhatke_eweather)
const USER_PERSONAS_TABLE = 'personalisation.user_persona'; // In your main DB

// Checkout table is in 'analytics' database. Assuming same MySQL server.
const CHECKOUT_TABLE_FULL_PATH = 'analytics.checkout';

// CSV file path
const CSV_FILE_PATH = path.join(__dirname, 'all_visit.csv');

// Directory for storing large JSON data files (e.g., visited products)
const VISITED_PRODUCTS_DATA_DIR = path.join(__dirname, 'personaTxts');

// Date for timestamps (June 28th, 2025, 4:22:30 PM IST)
// Use the precise timestamp for deterministic results as requested
const today = new Date('2025-06-28T16:22:30.000+05:30').getTime();
const fortyDaysAgo = today - (40 * 24 * 60 * 60 * 1000);

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

// Define Pincode to City and City to Tier Mappings
// These will now be used for random generation, not lookup from checkout
const PINCODE_TO_CITY = {
    "560001": "BENGALURU", "560002": "BENGALURU", "560003": "BENGALURU", "560004": "BENGALURU",
    "560005": "BENGALURU", "560006": "BENGALURU", "560007": "BENGALURU", "560008": "BENGALURU",
    "560009": "BENGALURU", "560010": "BENGALURU", 

    "462046": "BHOPAL", "462047": "BHOPAL", "462048": "BHOPAL", "462050": "BHOPAL",
    "462051": "BHOPAL", "462052": "BHOPAL", "462053": "BHOPAL", "462054": "BHOPAL",
    "462055": "BHOPAL", "462060": "BHOPAL", "462061": "BHOPAL", "462062": "BHOPAL",
    "462063": "BHOPAL", "462064": "BHOPAL", "462066": "BHOPAL", "462100": "BHOPAL",

    "482004": "JABALPUR", "482001": "JABALPUR", "482003": "JABALPUR", "482005": "JABALPUR",
};

const CITY_TO_TIER = {
    "BENGALURU": "Tier1",
    "BHOPAL": "Tier2",
    "JABALPUR": "Tier3"
};

const ALL_CITIES_FOR_RANDOM = Object.keys(PINCODE_TO_CITY).map(pincode => PINCODE_TO_CITY[pincode]);
const UNIQUE_CITIES_FOR_RANDOM = [...new Set(ALL_CITIES_FOR_RANDOM)];


// Main function to run the data pipeline
const runDataPipeline = async () => {
    const startTime = Date.now();
    console.log(`Starting data pipeline at ${new Date(startTime).toLocaleString()}...`);

    // Ensure the data directories exist
    try {
        fs.mkdirSync(VISITED_PRODUCTS_DATA_DIR, { recursive: true });
        console.log(`Ensured directory exists: ${VISITED_PRODUCTS_DATA_DIR}`);
    } catch (err) {
        console.error(`Failed to create data directory ${VISITED_PRODUCTS_DATA_DIR}:`, err);
        return; // Exit if directory cannot be created
    }

    const usersData = new Map(); // Map to store aggregated data per ext_id

    // Phase 1: Read CSV and aggregate visited product data
    console.log('Phase 1: Reading CSV and aggregating visited products...');
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(CSV_FILE_PATH)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on('data', (row) => {
                    // Normalize data types from CSV (which are strings)
                    const extId = parseInt(row.ext_id, 10);
                    const pid = row.PID;
                    const pos = parseInt(row.pos, 10);
                    const count = parseInt(row.count, 10) || 1; // Default to 1 if count is missing/invalid
                    const eventLastTime = parseInt(row.event_last_time, 10) || getRandomTimestamp(fortyDaysAgo, today); // Fallback timestamp

                    if (isNaN(extId) || !pid || isNaN(pos)) {
                        console.warn(`Skipping invalid CSV row: ${JSON.stringify(row)}`);
                        return;
                    }

                    if (!usersData.has(extId)) {
                        // Initialize userData without userPincode from CSV/Checkout
                        usersData.set(extId, { visitedRaw: [], purchasedRaw: [], checkoutExtId: null });
                    }
                    const userData = usersData.get(extId);

                    // Add product to visitedRaw, duplicating based on 'count'
                    for (let i = 0; i < count; i++) {
                        userData.visitedRaw.push({ pid, pos, eventLastTime });
                    }
                })
                .on('end', () => {
                    console.log(`Phase 1 complete. Processed ${usersData.size} unique ext_ids from CSV.`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error reading CSV:', err);
                    reject(err);
                });
        });
    } catch (error) {
        console.error('Failed to read CSV. Exiting:', error);
        return;
    }

    // Phase 2: Fetch and aggregate purchased product data from checkout table
    // console.log('Phase 2: Fetching purchased products from checkout table...');
    // try {
    //     const checkoutQuery = `
    //         SELECT ext_id, pos, item_details, date
    //         FROM ${CHECKOUT_TABLE_FULL_PATH}
    //         WHERE ext_id IN (?);
    //     `;
    //     const uniqueExtIds = Array.from(usersData.keys());

    //     if (uniqueExtIds.length === 0) {
    //         console.log('No unique ext_ids found from CSV to fetch checkout data. Skipping Phase 2.');
    //     } else {
    //         // Batch process ext_ids for checkout query to avoid huge IN clause or too many queries
    //         const BATCH_SIZE = 1000;
    //         for (let i = 0; i < uniqueExtIds.length; i += BATCH_SIZE) {
    //             const batchIds = uniqueExtIds.slice(i, i + BATCH_SIZE);
    //             console.log(`Fetching checkout data for batch ${i / BATCH_SIZE + 1}...`);
    //             const checkoutResults = await dbTest.commonQuery(checkoutQuery, [batchIds]);

    //             checkoutResults.forEach(checkoutRow => {
    //                 const extId = checkoutRow.ext_id;
    //                 const pos = checkoutRow.pos; // Site POS from checkout table
    //                 const itemDetails = JSON.parse(checkoutRow.item_details); // Parse JSON string
    //                 // Removed address parsing as pincode is no longer taken from here
    //                 const orderDate = new Date(checkoutRow.date).getTime() / 1000; // Convert to epoch seconds

    //                 if (!usersData.has(extId)) {
    //                     // This ext_id might only be in checkout, but we only process ext_ids from CSV for now
    //                     return;
    //                 }

    //                 const userData = usersData.get(extId);
    //                 userData.checkoutExtId = extId; // Mark that checkout data was found

    //                 for (const itemPID in itemDetails) {
    //                     const item = itemDetails[itemPID];
    //                     const quantity = item.quantity || 1;
    //                     for (let k = 0; k < quantity; k++) { // Duplicate based on quantity in checkout
    //                          // Use item.ts if available, otherwise orderDate (checkout.dated)
    //                         const itemTimestamp = item.ts ? Math.floor(item.ts / 1000) : orderDate;
    //                         userData.purchasedRaw.push({
    //                             pid: item.PID || itemPID, // Use item.PID or the key itself
    //                             pos: pos, // Use the pos from the checkout table directly for the purchase
    //                             price: parseFloat(isNaN(item.price || 0) ? 0 : (item.price || 0)), // Ensure price is number
    //                             prodName: item.prod || "",
    //                             timestamp: itemTimestamp
    //                         });
    //                     }
    //                 }
    //             });
    //         }
    //         console.log('Phase 2 complete.');
    //     }
    // } catch (error) {
    //     console.error('Failed to fetch checkout data. Exiting:', error);
    //     return;
    // }

    // Phase 2: Fetch and aggregate purchased product data from checkout table
    console.log('Phase 2: Fetching purchased products from checkout table...');
    try {
        const checkoutQuery = `
            SELECT ext_id, pos, item_details, date
            FROM ${CHECKOUT_TABLE_FULL_PATH}
            WHERE ext_id IN (?) AND pos IN (2, 63);
        `;
        const uniqueExtIds = Array.from(usersData.keys());

        if (uniqueExtIds.length === 0) {
            console.log('No unique ext_ids found from CSV to fetch checkout data. Skipping Phase 2.');
        } else {
            // Batch process ext_ids for checkout query to avoid huge IN clause or too many queries
            const BATCH_SIZE = 1000;
            for (let i = 0; i < uniqueExtIds.length; i += BATCH_SIZE) {
                const batchIds = uniqueExtIds.slice(i, i + BATCH_SIZE);
                console.log(`Fetching checkout data for batch ${i / BATCH_SIZE + 1}...`);
                const checkoutResults = await dbTest.commonQuery(checkoutQuery, [batchIds]);

                checkoutResults.forEach(checkoutRow => {
                    const extId = checkoutRow.ext_id;
                    const pos = checkoutRow.pos; // Site POS from checkout table
                    const rawItemDetails = JSON.parse(checkoutRow.item_details); // Parse outer JSON string
                    const orderDate = new Date(checkoutRow.date).getTime() / 1000; // Convert to epoch seconds

                    if (!usersData.has(extId)) {
                        // This ext_id might only be in checkout, but we only process ext_ids from CSV for now
                        return;
                    }

                    const userData = usersData.get(extId);
                    userData.checkoutExtId = extId; // Mark that checkout data was found

                    let itemsToProcess = [];

                    // Check for the new array-based structure: { "itemDetails": [...] }
                    if (rawItemDetails && Array.isArray(rawItemDetails.itemDetails)) {
                        itemsToProcess = rawItemDetails.itemDetails;
                    } 
                    // Check for the old object-based structure: { "PID1": {...}, "PID2": {...} }
                    else if (rawItemDetails && typeof rawItemDetails === 'object' && rawItemDetails !== null) {
                        for (const itemPID in rawItemDetails) {
                            if (Object.hasOwnProperty.call(rawItemDetails, itemPID)) {
                                itemsToProcess.push({ ...rawItemDetails[itemPID], pid: itemPID }); // Add PID from key
                            }
                        }
                    } else {
                        console.warn(`Unexpected 'item_details' format for ext_id ${extId}: Not a recognized object or array structure. Skipping purchased items for this row.`);
                    }

                    itemsToProcess.forEach(item => {
                        // For the new array format, quantity is typically 1 unless explicitly in the item object.
                        // For the old object format, quantity was not explicitly given, so assuming 1.
                        const quantity = item.quantity || 1; 
                        for (let k = 0; k < quantity; k++) {
                            // Use item.ts if available (in ms), otherwise orderDate (in seconds)
                            const itemTimestamp = item.ts ? Math.floor(item.ts / 1000) : orderDate;
                            
                            userData.purchasedRaw.push({
                                pid: item.pid, 
                                pos: pos, // Use the pos from the checkout table directly for the purchase
                                price: parseFloat(item.price), // Ensure price is number
                                prodName: item.prod,
                                timestamp: itemTimestamp
                            });
                        }
                    });
                });
            }
            console.log('Phase 2 complete.');
        }
    } catch (error) {
        console.error('Failed to fetch checkout data. Exiting:', error);
        return;
    }


    // Phase 3: Fetch all unique product details from productCategorization table
    console.log('Phase 3: Fetching unique product details...');
    const uniqueProductLookups = new Set(); // Stores "PID_POS"
    usersData.forEach(userData => {
        userData.visitedRaw.forEach(p => uniqueProductLookups.add(`${p.pid}~${p.pos}`));
        userData.purchasedRaw.forEach(p => uniqueProductLookups.add(`${p.pid}~${p.pos}`));
    });

    const productDetailsMap = new Map(); // Map to store PID_POS -> full product object
    
    // Transform uniqueProductLookups into an array of [pid, pos] pairs for batch querying
    const pidPosPairs = Array.from(uniqueProductLookups).map(s => s.split('~'));

    if (pidPosPairs.length === 0) {
        console.log('No products to look up details for. Skipping Phase 3.');
    } else {
        // Adjust BULK_PAIR_QUERY_SIZE based on your server's max_allowed_packet and parameter limits.
        // Each pair (pid, pos) uses 2 parameters, so 250 pairs means 500 parameters.
        const BULK_PAIR_QUERY_SIZE = 250; 
        for (let i = 0; i < pidPosPairs.length; i += BULK_PAIR_QUERY_SIZE) {
            const batchPairs = pidPosPairs.slice(i, i + BULK_PAIR_QUERY_SIZE);
            
            // Construct the WHERE clause with OR conditions for (pid = ? AND pos = ?) pairs
            const whereConditions = batchPairs.map(() => `(pid = ? AND pos = ?)`);
            const queryParams = [];
            batchPairs.forEach(pair => {
                queryParams.push(pair[0]); // pid (string)
                queryParams.push(parseInt(pair[1], 10)); // pos (integer)
            });

            const productsInScopeQuery = `
                SELECT id, pid, pos, brandName, genericName, applicableTo, category, subCategory, subSubCategory, colour, price, prodName
                FROM ${PRODUCT_CATEGORIZATION_TABLE}
                WHERE ${whereConditions.join(' OR ')};
            `;
            try {
                const productsInScope = await dbMain.commonQuery(productsInScopeQuery, queryParams);
                productsInScope.forEach(p => {
                    productDetailsMap.set(`${p.pid}~${p.pos}`, p);
                });
                console.log(`Fetched details for ${productsInScope.length} products in batch ${i / BULK_PAIR_QUERY_SIZE + 1}.`);
            } catch (err) {
                console.error(`Error fetching product details for PID/POS batch starting at index ${i}:`, err);
            }
        }
        console.log(`Total unique product details fetched: ${productDetailsMap.size}`);
    }
    console.log('Phase 3 complete.');

    // Phase 4: Construct user persona data and insert into user_personas table
    console.log('Phase 4: Constructing user personas and inserting...');
    let usersInsertedCount = 0;
    // Pre-select a random city and pincode for each user once before the loop
    const userPincodeMap = new Map(); // extId -> { pincode, cityName, tierName }
    Array.from(usersData.keys()).forEach(extId => {
        const randomCityName = getRandomItem(UNIQUE_CITIES_FOR_RANDOM);
        const pincodesForCity = Object.keys(PINCODE_TO_CITY).filter(p => PINCODE_TO_CITY[p] === randomCityName);
        const randomPincode = getRandomItem(pincodesForCity);
        const userTierName = CITY_TO_TIER[randomCityName];
        userPincodeMap.set(extId, { pincode: randomPincode, cityName: randomCityName, tierName: userTierName });
    });


    for (const [extId, userData] of usersData.entries()) {
        process.stdout.write(`\rProcessing user ${usersInsertedCount + 1}/${usersData.size}...`); // Live update

        const { pincode: userPincode, cityName: userCityName, tierName: userTierName } = userPincodeMap.get(extId);

        if (!userPincode) {
            console.warn(`Skipping user ${extId}: Could not generate valid pincode or tier.`);
            continue;
        }

        // Format products for visited and purchased lists
        const formatProductForPersona = (rawProd, isPurchased = false) => {
            const productDetail = productDetailsMap.get(`${rawProd.pid}~${rawProd.pos}`);

            if (!productDetail) {
                // console.warn(`Product details not found for PID ${rawProd.pid}, POS ${rawProd.pos}. Skipping product.`);
                return null; // Return null if details are missing
            }

            // If it's a purchase, use the explicit timestamp from item.ts or dated
            // If it's a visit, use the event_last_time from CSV
            // If neither, generate a random one within the range
            const timestamp = isPurchased ? rawProd.timestamp : (rawProd.eventLastTime || getRandomTimestamp(fortyDaysAgo, today));

            return {
                prod: productDetail.prodName,
                pid: productDetail.pid,
                pos: productDetail.pos,
                price: productDetail.price,
                brand: productDetail.brandName,
                color: productDetail.colour,
                gender: productDetail.applicableTo,
                genericName: productDetail.genericName,
                category: productDetail.category,
                subCategory: productDetail.subCategory,
                subSubCategory: productDetail.subSubCategory,
                pincode: parseInt(userPincode, 10), // Use the randomly generated pincode
                timestamp: timestamp
            };
        };

        let finalVisitedProds = [];
        userData.visitedRaw.forEach(rawProd => {
            const formattedProd = formatProductForPersona(rawProd);
            if (formattedProd) {
                finalVisitedProds.push(formattedProd); // Add original
                const randomNumber = Math.floor(Math.random() * 10) + 1; // Number between 1 and 10
                if (randomNumber === 1 || randomNumber === 2) { // 20% chance of duplication
                    // Create a new object for the duplicate with a potentially new timestamp
                    const duplicatedProd = { ...formattedProd, timestamp: getRandomTimestamp(fortyDaysAgo, today) };
                    finalVisitedProds.push(duplicatedProd);
                }
            }
        });

        const finalPurchasedProds = userData.purchasedRaw
            .map(rawProd => formatProductForPersona(rawProd, true))
            .filter(Boolean); // Filter out any nulls if product details were missing

        // Skip user if neither visited nor purchased products can be formed
        if (finalVisitedProds.length === 0 && finalPurchasedProds.length === 0) {
            // console.warn(`Skipping user ${extId}: No valid products for visited or purchased lists.`);
            continue;
        }

        // 1. Define file path for visited products JSON
        const visitedProdsFileName = `visited_${extId}.json`;
        const visitedProdsFilePath = path.join(VISITED_PRODUCTS_DATA_DIR, visitedProdsFileName);

        // 2. Save finalVisitedProds to the file
        try {
            await fs.promises.writeFile(visitedProdsFilePath, JSON.stringify(finalVisitedProds, null, 2));
            // console.log(`Saved visited products for ${extId} to ${visitedProdsFilePath}`);
        } catch (fileWriteError) {
            console.error(`\nError writing visited products file for user ${extId}:`, fileWriteError);
            continue; // Skip user if file cannot be written
        }

        // 3. Update the insert query and params to store the file path
        const insertQuery = `
            INSERT INTO ${USER_PERSONAS_TABLE} (extId, listOfProdsVisited, listOfProdsPurchased)
            VALUES (?, ?, ?);
        `;

        const params = [
            extId, // Use ext_id from CSV/Checkout as extId for user_personas
            JSON.stringify({filepath : visitedProdsFilePath}), // Store the file path instead of the JSON string
            JSON.stringify(finalPurchasedProds)
        ];

        try {
            await dbTest.commonQuery(insertQuery, params);
            usersInsertedCount++;
        } catch (insertError) {
            console.error(`\nError inserting data for user ${extId}:`, insertError);
            // Continue processing other users
        }
    }
    console.log(`\nPhase 4 complete. Successfully inserted data for ${usersInsertedCount} users.`);

    const endTime = Date.now();
    const elapsedTimeSeconds = (endTime - startTime) / 1000;
    console.log(`Data pipeline finished at ${new Date(endTime).toLocaleString()}.`);
    console.log(`Total execution time: ${elapsedTimeSeconds.toFixed(2)} seconds.`);
};

// Run the data pipeline
runDataPipeline();