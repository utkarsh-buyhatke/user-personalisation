const dbHandle = require("../testDb.js");

const brandMap = {};

const genericMap = {};

(async ()=> {
    let selQ = "SELECT brandAffinity, genericAffinity FROM `personalisation`.`user_persona`";
    let resQ = await dbHandle.commonQuery(selQ, []);

    for(let res of resQ){
        let {brandAffinity, genericAffinity} = res;

        brandAffinity = JSON.parse(brandAffinity);

        genericAffinity = JSON.parse(genericAffinity);

        for(brand in brandAffinity){
            brandMap[brand] = (brandMap[brand] || 0) + brandAffinity[brand];
        }

        for(genericName in genericAffinity){
            genericMap[genericName] = (genericMap[genericName] || 0) + genericAffinity[genericName];
        }
    }

    // Get top 300 brand keys based on their affinity values (rhs values)
        const topBrands = Object.entries(brandMap)
        .sort(([, a], [, b]) => b - a) // Sort by descending rhs values
        .slice(0, 300) // Take top 300 entries
        .map(([key]) => key); // Extract keys

    // Get top 500 generic names based on their affinity values (rhs values)
    const topGenerics = Object.entries(genericMap)
        .sort(([, a], [, b]) => b - a) // Sort by descending rhs values
        .slice(0, 500) // Take top 500 entries
        .map(([key]) => key); // Extract keys

    console.log("Top Brands:", JSON.stringify(topBrands));
    console.log("Top Generics:", JSON.stringify(topGenerics));
})();