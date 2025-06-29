const { commonQuery } = require("../db.js");
const { createSchema, deleteSchema, opensearchQueryBySql, opensearchAggregateQueryBySql } = require("./opensearch.js");

// const configMappingSchema = {
//   "entry_id": {
//     "type": "integer"
//   },
//   // "config": {
//   //   "type": "object",
//   //   "enabled": false
//   // },
//   "mappedPids": {
//     "type": "object",
//     "enabled": false
//   },
//   "prod": {
//     "type": "text",
//   },
//   "cat_id": {
//     "type": "integer"
//   },
//   "subcat_id": {
//     "type": "integer"
//   },
//   "rank": {
//     "type": "integer",
//     "index": false
//   }
// }

// const pidSchema = {
//     "entry_id": {
//       "type": "integer"
//     },
//     "pid": {
//       "type": "keyword"
//     },
//     "prod": {
//       "type": "text"
//     },
//     "brand": {
//       "type": "text",
//     },
//     "mrp": {
//       "type": "float",
//       "index": false
//     },
//     "qty": {
//       "type": "keyword",
//       "index": false
//     },
//     "imageUrl": {
//       "type": "keyword",
//       "index": false
//     },
//     "spin": {
//       "type": "keyword",
//       "null_value": "",
//       "index": false
//     },
//     "pos": {
//       "type": "integer"
//     }
// }

// const priceDataTable = {
//   "entry_id": {
//     "type": "integer"
//   },
//   "pos": {
//     "type": "short"
//   },
//   "configId": {
//     "type": "integer"
//   },
//   "storeId": {
//     "type": "integer"
//   },
//   "internalPid": {
//     "type": "integer"
//   },
//   "price": {
//     "type": "float",
//     "index": false
//   },
//   "passPrice": {
//     "type": "float",
//     "index": false
//   },
//   "mrp": {
//     "type": "float",
//     "index": false
//   },
//   "oos": {
//     "type": "byte",
//     "index": false
//   },
//   "timestamp": {
//     "type": "integer",  // epoch in seconds
//   }
// }

const personaTable = {
  "user_id": { "type": "integer" },
  "city": { "type": "object", "enabled": true },
  "gender": { "type": "keyword" },
  "brandAffinity": { "type": "object", "enabled": true },
  "genericAffinity": { "type": "object", "enabled": true },
  "categoryAffinity": { "type": "object", "enabled": true },
  // "vector": { "type": "dense_vector", "dims": 5 } // Optional for vector search
}

  
setTimeout(async () => {
    // await createSchema(configMappingSchema,"grocery_config_mapping");
    // await createSchema(pidSchema,"grocery_pids");

    await createSchema(personaTable,"user_persona_attributes");
    // await deleteSchema("user_persona_attributes");

    // await createSchema(priceDataTable,"grocery_price_data");
    
    // let sel_candles = "SELECT token_id,COUNT(DISTINCT maker) as maker_cnt,type FROM signature_logs WHERE token_id IN ('415248_0','415250_0') AND blocktime >= 1720501982 AND blocktime <= 1720678986 AND type IN (0,1) GROUP BY token_id,type;";
    // let res_candles = await opensearchAggregateQueryBySql(sel_candles,["token_id","maker_cnt","type"],["token_id","type"]);
    // console.log(res_candles,Date.now()-start);
    // let sel_candles = "SELECT * FROM token_search";
    // let res_candles = await opensearchQueryBySql(sel_candles);
    // console.log(res_candles, "hello");
}, 100)