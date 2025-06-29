const { dslQuery } = require("./opensearch.js");

async function userPersona() {
  let resp = await dslQuery("user_persona_attributes", {
    query: {
      script_score: {
        query: {
          bool: {
            filter: [
              { terms: { gender: ["male", "unisex"] } }
            ]
          }
        },
        script: {
          source: `
            double cityScore = doc.containsKey('city.tier-1') && !doc['city.tier-1'].empty ? doc['city.tier-1'].value : 0;
            double genderScore = (doc['gender'].value == 'male' || doc['gender'].value == 'unisex') ? 1 : 0;
            double brandScore = doc.containsKey('brandAffinity.Boat') && !doc['brandAffinity.Boat'].empty ? doc['brandAffinity.Boat'].value : 0;
            double genericScore = doc.containsKey('genericAffinity.Fitness Band') && !doc['genericAffinity.Fitness Band'].empty ? doc['genericAffinity.Fitness Band'].value : 0;
            double categoryScore = (
              (doc.containsKey('categoryAffinity.Sports Equipment') && !doc['categoryAffinity.Sports Equipment'].empty ? doc['categoryAffinity.Sports Equipment'].value : 0) +
              (doc.containsKey('categoryAffinity.Sports Equipment') && !doc['categoryAffinity.Sports Equipment'].empty ? doc['categoryAffinity.Sports Equipment'].value : 0) +
              (doc.containsKey('categoryAffinity.Sports Equipment') && !doc['categoryAffinity.Sports Equipment'].empty ? doc['categoryAffinity.Sports Equipment'].value : 0)
            ) / params.numCategories;
            return params.w1 * cityScore + params.w2 * genderScore + params.w3 * brandScore + params.w4 * genericScore + params.w5 * categoryScore;
          `,
          params: {
            w1: 0.15,
            w2: 0.2,
            w3: 0.3,
            w4: 0.2,
            w5: 0.15,
            numCategories: 3
          }
        }
      }
    },
    size: 500,
    sort: [{ _score: { order: "desc" } }]
  });

  console.log(JSON.stringify(resp));
}

userPersona();
