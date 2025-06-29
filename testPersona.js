const db = require('../db');
const testDb = require('../testDb.js');
const express = require("express");
const router = express.Router();
const { dslQuery } = require("../opensearch/opensearch.js");

const fs = require("fs");

async function fetchUserPersonas(gender, cityTier, brand, genericName, level1Cat, level2Cat, level3Cat) {
    gender = gender.toLowerCase();

    let genderFilter = [];
    if (gender == "men") {
        genderFilter.push({ terms: { gender: ["men", "unisex"] } });
    } else if (gender == "women") {
        genderFilter.push({ terms: { gender: ["women", "unisex"] } });
    }

    brand = brand.toLowerCase();

    genericName = genericName.toLowerCase();

    let queryObject = {
        query: {
            script_score: {
                query: {
                    bool: {
                        filter: genderFilter,
                    }
                },
                script: {
                    // source: `
                    //         double cityScore = doc.containsKey('city.${cityTier}') && !doc['city.${cityTier}'].empty ? doc['city.${cityTier}'].value : 0;
                    //         double brandScore = doc.containsKey('brandAffinity.${brand}') && !doc['brandAffinity.${brand}'].empty ? doc['brandAffinity.${brand}'].value : 0;
                    //         double genericScore = doc.containsKey('genericAffinity.${genericName}') && !doc['genericAffinity.${genericName}'].empty ? doc['genericAffinity.${genericName}'].value : 0;
                    //         double categoryScore = (
                    //             (doc.containsKey('categoryAffinity.${level1Cat}') && !doc['categoryAffinity.${level1Cat}'].empty ? doc['categoryAffinity.${level1Cat}'].value : 0) +
                    //             (doc.containsKey('categoryAffinity.${level2Cat}') && !doc['categoryAffinity.${level2Cat}'].empty ? doc['categoryAffinity.${level2Cat}'].value : 0) +
                    //             (doc.containsKey('categoryAffinity.${level3Cat}') && !doc['categoryAffinity.${level3Cat}'].empty ? doc['categoryAffinity.${level3Cat}'].value : 0)
                    //         );
                    //         return params.cityWeight * cityScore + params.brandWeight * brandScore + params.genericWeight * genericScore + params.categoryWeight * categoryScore;
                    //     `,
                    source: `
                            double cityScore = params.cityTier == "" ? 1 : (
                                doc.containsKey('city.${cityTier}') && !doc['city.${cityTier}'].empty ? doc['city.${cityTier}'].value : 0
                            );

                            double brandScore = params.brand == "" ? 1 : (
                                doc.containsKey('brandAffinity.${brand}') && !doc['brandAffinity.${brand}'].empty ? doc['brandAffinity.${brand}'].value : 0
                            );

                            double genericScore = params.genericName == "" ? 1 : (
                                doc.containsKey('genericAffinity.${genericName}') && !doc['genericAffinity.${genericName}'].empty ? doc['genericAffinity.${genericName}'].value : 0
                            );

                            double categoryScore = 0;

                            categoryScore += params.level1Cat == -1 ? 0.3333 : (
                                doc.containsKey('categoryAffinity.${level1Cat}') && !doc['categoryAffinity.${level1Cat}'].empty ? doc['categoryAffinity.${level1Cat}'].value : 0
                            );

                            categoryScore += params.level2Cat == -1 ? 0.3333 : (
                                doc.containsKey('categoryAffinity.${level2Cat}') && !doc['categoryAffinity.${level2Cat}'].empty ? doc['categoryAffinity.${level2Cat}'].value : 0
                            );

                            categoryScore += params.level3Cat == -1 ? 0.3333 : (
                                doc.containsKey('categoryAffinity.${level3Cat}') && !doc['categoryAffinity.${level3Cat}'].empty ? doc['categoryAffinity.${level3Cat}'].value : 0
                            );

                            return params.cityWeight * cityScore
                                + params.brandWeight * brandScore
                                + params.genericWeight * genericScore
                                + params.categoryWeight * categoryScore;

                    `,
                    params: {
                        cityWeight: 0.15,
                        brandWeight: 0.35,
                        genericWeight: 0.20,
                        categoryWeight: 0.30,
                        cityTier,
                        brand,
                        genericName,
                        level1Cat,
                        level2Cat,
                        level3Cat
                    }
                }
            }
        },
        size: 20,
        sort: [{ _score: { order: "desc" } }]
    };    

    console.log(JSON.stringify(queryObject));

    const resp = await dslQuery("user_persona_attributes", queryObject);

    return resp;
}


router.post('/fetchPersonas', async (req, res) => {
    try {

        // give out all unique products for given string

        let { gender = "unisex", cityTier = "", brand = "", genericName = "", level1Cat = -1, level2Cat = -1, level3Cat = -1 } = req.body;

        level1Cat = parseInt(level1Cat);
        level2Cat = parseInt(level2Cat);
        level3Cat = parseInt(level3Cat);

        if(cityTier){
            cityTier = cityTier.split(" ").join("");
        }

        if(gender.toLowerCase() == "male"){
            gender = "men";
        }

        if(gender.toLowerCase() == "female"){
            gender = "women";
        }

        const response = await fetchUserPersonas(gender, cityTier, brand, genericName, level1Cat, level2Cat, level3Cat);

        for(let eachRes of response){
            let extId = eachRes._id;

            let selQ = "SELECT listOfProdsVisited, listOfProdsPurchased, searchTerms FROM `personalisation`.`user_persona` WHERE extId = ?";
            let resQ = await testDb.commonQuery(selQ, [extId]);

            if(resQ.length > 0){

                let {listOfProdsVisited, listOfProdsPurchased, searchTerms} = resQ[0];
                listOfProdsVisited = JSON.parse(listOfProdsVisited);
                let filePath = listOfProdsVisited.filepath;
                listOfProdsVisited = fs.readFileSync(filePath, 'utf8');

                listOfProdsVisited = JSON.parse(listOfProdsVisited);

                listOfProdsPurchased = JSON.parse(listOfProdsPurchased);

                searchTerms = JSON.parse(searchTerms);

                let updatedListOfProdsVisited = [], updatedListOfProdsPurchased = [], updatedSearchTerms = [];

                for(let prodVisit of listOfProdsVisited){
                    if((brand && prodVisit.brand.toLowerCase() == brand.toLowerCase()) || (genericName && prodVisit.genericName.toLowerCase() == genericName.toLowerCase()) || (level1Cat != -1 && prodVisit.category == level1Cat) || (level2Cat != -1 && prodVisit.subCategory == level2Cat) || (level3Cat != -1 && prodVisit.subSubCategory == level3Cat)){
                        updatedListOfProdsVisited.push(prodVisit);
                    }
                }

                for(let prodPurchase of listOfProdsPurchased){
                    if((brand && prodPurchase.brand.toLowerCase() == brand.toLowerCase()) || (genericName && prodPurchase.genericName.toLowerCase() == genericName.toLowerCase()) || (level1Cat != -1 && prodPurchase.category == level1Cat) || (level2Cat != -1 && prodPurchase.subCategory == level2Cat) || (level3Cat != -1 && prodPurchase.subSubCategory == level3Cat)){
                        updatedListOfProdsPurchased.push(prodPurchase);
                    }
                }

                for(let searchTerm of searchTerms){
                    if((brand && searchTerm.brand.toLowerCase() == brand.toLowerCase()) || (genericName && searchTerm.genericName.toLowerCase() == genericName.toLowerCase()) || (level1Cat != -1 && searchTerm.category == level1Cat) || (level2Cat != -1 && searchTerm.subCategory == level2Cat) || (level3Cat != -1 && searchTerm.subSubCategory == level3Cat)){
                        updatedSearchTerms.push(searchTerm);
                    }
                }

                eachRes.listOfProdsVisited = updatedListOfProdsVisited;
                eachRes.listOfProdsPurchased = updatedListOfProdsPurchased;
                eachRes.searchTerms = updatedSearchTerms;
            }
        }

        return res.send({ status: 1, data: response });

    } catch (err) {
        console.error("error in fetchPersonas", err);
        return res.send({ status: 0, msg: "Something went wrong!!" });
    }
});

module.exports = router;