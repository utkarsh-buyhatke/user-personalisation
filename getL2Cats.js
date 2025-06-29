const dbMain = require("/old/home/ubuntu/dealsFilterCron/db/dbHandleMain.js");

const catMap = {};

(async () => {
    let selQ = "SELECT * FROM buyhatke_eweather.newFlipBreadCrumbs WHERE level = 1 AND cat_id IN (8, 28, 36, 58, 71, 10, 55, 277);"
    let resQ = await dbMain.commonQuery(selQ, []);

    for(let res of resQ){
        let {cat_id, cat_name} = res;

        catMap[cat_id] = catMap[cat_id] || {
            catName : cat_name,
            children : {}
        }

        let selQ2 = "SELECT * FROM buyhatke_eweather.newFlipBreadCrumbs WHERE level = 2 AND parent_id = ? AND cat_id IN (9, 29, 37, 72, 99, 896, 88, 59)";
        let resQ2 = await dbMain.commonQuery(selQ2, [cat_id]);

        for(let res2 of resQ2){
            let {cat_id : cat_id2, cat_name : cat_name2} = res2;

            catMap[cat_id].children[cat_id2] = catMap[cat_id].children[cat_id2] || {
                catName : cat_name2,
                children : {}
            }

            let selQ3 = "SELECT * FROM buyhatke_eweather.newFlipBreadCrumbs WHERE level = 3 AND parent_id = ?";
            let resQ3 = await dbMain.commonQuery(selQ3, [cat_id2]);

            for(let res3 of resQ3){
                let {cat_id : cat_id3, cat_name : cat_name3} = res3;
    
                catMap[cat_id].children[cat_id2].children[cat_id3] = catMap[cat_id].children[cat_id2].children[cat_id3] || {
                    catName : cat_name3
                }
            }
        }
    }

    console.log(JSON.stringify(catMap));
})();