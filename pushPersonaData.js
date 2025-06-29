const dbHandle = require("../testDb.js");
const { pushBulkDataToTable } = require("./opensearch.js");
const fs = require("fs");

async function getPersonaRows() {
    try {
        let selPersonaRows = "SELECT extId, city, gender, brandAffinity, categoryAffinity, genericAffinity, listOfProdsVisited FROM `personalisation`.`user_persona` WHERE hasChanged = 2 LIMIT 100";
        let resPersonaRows = await dbHandle.commonQuery(selPersonaRows, []);
        return resPersonaRows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function main() {
    try {
        let dataToPush = await getPersonaRows();
        if (dataToPush.length == 0) {
            return;
        }
        let personaIdArr = []
        let personaData = "";
        for(let data of dataToPush){
            try {
                let {extId, city, gender, brandAffinity, categoryAffinity, genericAffinity, listOfProdsVisited} = data;

                let normalisedCity = {}, normalisedGender = "unisex", normalisedBrandAff = {}, normalisedCategoryAff = {}, normalisedGenericAff = {};

                city = JSON.parse(city);
                brandAffinity = JSON.parse(brandAffinity);
                categoryAffinity = JSON.parse(categoryAffinity);
                genericAffinity = JSON.parse(genericAffinity);
                gender = JSON.parse(gender);

                listOfProdsVisited = JSON.parse(listOfProdsVisited);

                let filePath = listOfProdsVisited.filepath;
                listOfProdsVisited = fs.readFileSync(filePath, 'utf8');
                listOfProdsVisited = JSON.parse(listOfProdsVisited);

                if(listOfProdsVisited.length < 3){
                    // less prods so skip
                    continue;
                }

                if(gender && Object.keys(gender).length > 0){
                    const menCount = (gender["men"] || 0) + (gender["boys"] || 0);
                    const womenCount = (gender["women"] || 0) + (gender["girls"] || 0);

                    if(menCount / (menCount + womenCount) >= 0.8){
                        normalisedGender = "men";
                    } else if(womenCount / (menCount + womenCount) >= 0.8){
                        normalisedGender = "women";
                    } else {
                        normalisedGender = "unisex";
                    }
                }

                if (city && Object.keys(city).length > 0) {
                    const denominator = Object.values(city).reduce((a, b) => a + b, 0);
                    for (let key in city) {
                        normalisedCity[key] = parseFloat(city[key] / denominator);
                    }
                }

                if (brandAffinity && Object.keys(brandAffinity).length > 0) {
                    const denominator = Object.values(brandAffinity).reduce((a, b) => a + b, 0);
                    for (let key in brandAffinity) {
                        // if([ "samsung", "apple", "oneplus", "xiaomi", "redmi", "mi", "iqoo", "realme", "vivo", "oppo", "motorola", "nokia", "lava", "infinix", "google", "nothing", "sony", "lg", "panasonic", "philips", "bajaj", "usha", "havells", "v-guard", "orient", "crompton", "bosch", "ifb", "whirlpool", "haier", "godrej", "kent", "eureka forbes", "prestige", "pigeon", "milton", "cello", "butterfly", "lifelong", "bajaj vacco", "fire-boltt", "noise", "boat", "portronics", "ambrane", "zebronics", "jbl", "anker", "soundcore", "skullcandy", "logitech", "hp", "dell", "asus", "lenovo", "acer", "msi", "apple", "amazon basics", "sony playstation", "wrogn", "puma", "adidas", "nike", "reebok", "sparx", "red tape", "bata", "campus", "asian", "liberty", "crocs", "woodland", "metro", "fila", "skechers", "hrx", "levis", "peter england", "allen solly", "van heusen", "roadster", "flying machine", "us polo", "tommy hilfiger", "dennis lingo", "bewakoof", "zara", "h&m", "max", "shining diva", "yellow chimes", "jpearls", "sukkhi", "aristocrat", "wildcraft", "american tourister", "skybags", "safari", "fastrack", "timex", "casio", "sonata", "titan", "noise", "fire-boltt", "apple watch", "boat watch", "gshock", "fitbit", "boldfit", "mivi", "realme buds", "anker", "intex", "micromax", "karbonn", "blaupunkt", "vu", "tcl"].includes(key)){
                        if(["generic","samsung","mediatek","snapdragon","apple","realme","oneplus","portronics","boat","philips","iqoo","sony","intel","hp","lenovo","zebronics","fresh","asus","amazon basics","lg","nutraj","exynos","acer","puma","agaro","amazon","panasonic","lakmé","xiaomi","casio","crompton","havells","ant esports","tp-link","boldfit","wakefit","biotique","boult","sandisk","motorola","msi","evofox","the derma co","maybelline new york","fortune","adidas","pigeon","jbl","atomberg","redmi","plantex","amd","amul","ambrane","safari","oppo","google","amazon brand - solimo","noise","prestige","lifelong","pond's","garnier","faces canada","dettol","nike","crucial","amazon brand - symbol","nivea","ariel","asian","stedo","minimalist","mamaearth","u.s. polo assn.","bajaj","ugaoo","amazon brand","nivia","haier","liberty","farmley","logitech","wildcraft","western digital","tcl","milton","esr","neutrogena","lymio","campus","sounce","classic","bata","logitech g","dell","american tourister","the plant fix plix","fogg","navratna","epigamia","milky mist","daikin","bare anatomy","aazeem","nothing","cello","canon","v-guard","godrej","spigen","cetaphil","razer","redtape","flipkart smartbuy","luminous","harpic","happilo","skechers","saniya corporation","mtr","dabur","poco","solimo","whirlpool","steelbird","action","asics","coirfit","green soul","vivo","luvlap","titan","himalaya","l'oréal paris","whiskas","borosil","colgate","red tape","syndopa","kreo","britannia","dji","dove","pears","bosch","gigabyte","muscleblaze","cadbury","flipkart grocery","gear","usha shriram","honor","arctic fox","exide","hayden haiza","dermatouch","hindware","studds","mamypoko","cmf by nothing","ifb","jockey","voltas","cosmic byte","saraza","bsb home","thegiftkart","sonavi","wild stone","conscious chemist","sparx","concept kart","doctor extra soft","kellogg's","gillette","mi","xyxx","fastrack","fire-boltt","murphy","hisense","wipro","dot & key","tata sampann","hawkins","epson","wishcare","homestrap","deconstruct","meat up","striff","lakme","aroma magic","amazon brand - presto!","aquaguard","l'oreal paris","belkin","hyuman","itel","dyazo","yonex","provogue","orient electric","amazonbasics","nakpro","aqualogica","insta360","daawat","swiss beauty","vega","haldiram's","motul","soulflower","amul taza","pluckk","og beauty luxury","lukzer","lavie","myfitness","tukzer","redragon","yogabar","instacuppa","timex","gnc","tecno","skybags","kohler","crocs","digitek","honeywell","matrix","nerf","wolf-garten","neeman's","glun","kuber industries","kuhl","ibell","avimee","mexple","fedus","best choice nutrition","cir","dtodexpress","winnifred","jn handicraft","urbanbox","larah by borosil","ganesh","ikea","jialto","airson","ptron","the face shop","wonderchef","tekcool","combraided","signoraware","pramirol","quench","minara","powera","anker","perfora","force","envie","ezee live life ezee way","shivi creations","swisse","gharsoaps","centrino","zency rubber industry","beaatho","khadi natural","arctic hunter","carbamide forte","faber","hershey's","urbano fashion","oral-b","wavex","engage","astride","benq","cerave","hrx by hrithik roshan","pw","lego","lino perros","lapster","the indus valley","la verne","blue star","wolpin","the indian garage co","bigmuscles nutrition","neuherbs","doctor health"].includes(key)){
                            normalisedBrandAff[key] = parseFloat(brandAffinity[key] / denominator);
                        }
                    }
                }

                if (categoryAffinity && Object.keys(categoryAffinity).length > 0) {
                    const denominator = Object.values(categoryAffinity).reduce((a, b) => a + b, 0);
                    for (let key in categoryAffinity) {
                        if([8, 9, 10, 88, 89, 158, 198, 276, 408, 533, 675, 1125, 1475, 1900, 28, 29, 36, 37, 38, 187, 329, 366, 1163, 1644, 55, 99, 58, 59, 60, 109, 71, 72, 73, 134, 139, 140, 151, 210, 211, 269, 352, 393, 434, 437, 543, 601, 781, 924, 1066, 1452, 1859, 1955, 3445, 277, 896, 897, 1594, 1606, 2340, 2426, 2511, 2650, 2690, 2825, 2882].includes(key)){
                            normalisedCategoryAff[key] = parseFloat(categoryAffinity[key] / denominator);
                        }
                    }
                }

                if (genericAffinity && Object.keys(genericAffinity).length > 0) {
                    const denominator = Object.values(genericAffinity).reduce((a, b) => a + b, 0);
                    for (let key in genericAffinity) {
                        // if([ "mobile", "laptop", "headphone", "speaker", "charger", "power bank", "smartwatch", "earbud", "tablet", "television", "camera", "printer", "keyboard", "mouse", "monitor", "router", "webcam", "microphone", "usb drive", "hard drive", "ssd", "gaming console", "gaming accessory", "drone", "smart home device", "smart light", "smart plug", "doorbell", "security camera", "home theatre", "projector", "blender", "mixer grinder", "pressure cooker", "induction cooktop", "air fryer", "microwave", "refrigerator", "washing machine", "dishwasher", "vacuum cleaner", "iron", "water purifier", "geyser", "fan", "air cooler", "heater", "coffee maker", "toaster", "electric kettle", "juicer", "food processor", "cookware set", "frying pan", "saucepan", "cooker", "kitchen utensil", "dinner set", "glassware", "storage container", "lunch box", "water bottle", "thermos", "cutting board", "knife set", "peeler", "grater", "apparel", "t-shirt", "shirt", "jeans", "trouser", "dress", "saree", "kurti", "jacket", "sweater", "hoodie", "shorts", "skirt", "top", "sportswear", "swimwear", "underwear", "socks", "footwear", "shoes", "sneaker", "sandal", "slipper", "heels", "boot", "watch", "handbag", "backpack", "wallet", "belt", "sunglasses", "jewelry set", "earrings", "necklace", "bracelet", "ring", "perfume", "deodorant", "shampoo", "conditioner", "soap", "body wash", "lotion", "moisturizer", "face wash", "serum", "sunscreen", "makeup", "lipstick", "foundation", "mascara", "eyeliner", "nail polish", "hair dryer", "straightener", "curler", "trimmer", "shaver", "toothbrush", "toothpaste", "mouthwash", "hand sanitizer", "mask", "vitamins", "supplements", "protein powder", "ayurvedic product", "medical device", "thermometer", "bp monitor", "pulse oximeter", "first aid kit", "yoga mat", "dumbbell", "resistance band", "treadmill", "exercise bike", "fitness tracker", "sports shoe", "cricket bat", "football", "basketball", "badminton racket", "tennis racket", "sleeping bag", "tent", "camping gear", "water bottle", "gardening tool", "plant seed", "pot", "fertilizer", "pest control", "home decor", "curtain", "bedsheet", "cushion cover", "rug", "carpet", "photo frame", "wall art", "vase", "candle", "decorative lamp", "figurine", "artificial plant", "furniture", "sofa", "bed", "mattress", "dining table", "chair", "wardrobe", "bookshelf", "study table", "tv unit", "shoe rack", "book", "fiction book", "non-fiction book", "children's book", "textbook", "ebook reader", "dvd", "blu-ray", "cd", "vinyl record", "video game", "toy", "doll", "action figure", "building block", "board game", "puzzle", "remote control toy", "stuffed animal", "baby product", "diaper", "baby wipes", "baby food", "baby lotion", "baby shampoo", "baby soap", "pram", "stroller", "car seat", "crib", "baby carrier", "pet food", "pet toy", "pet grooming tool", "pet bed", "cat litter", "dog collar", "dog leash", "groceries", "staples", "snack", "beverage", "breakfast cereal", "cooking oil", "spices", "flour", "rice", "lentils", "sugar", "salt", "tea", "coffee", "chocolate", "biscuit", "chips", "noodle", "sauce", "jam", "honey", "dry fruit", "nut", "canned food", "frozen food", "cleaning supply", "detergent", "floor cleaner", "dishwashing liquid", "toilet cleaner", "glass cleaner", "brush", "mop", "dustbin", "tissue paper", "toilet paper", "paper towel", "stationery", "pen", "pencil", "notebook", "paper", "eraser", "sharpener", "scale", "calculator", "bag", "school bag", "office supply", "file folder", "stapler", "punch machine", "glue", "tape", "art supply", "paint", "brush set", "canvas", "drawing book", "craft kit", "musical instrument", "guitar", "keyboard", "drum set", "ukulele", "violin", "home improvement", "drill machine", "tool kit", "screwdriver", "hammer", "wrench", "paint", "adhesive", "tape", "lighting fixture", "bulb", "battery", "extension cord", "power strip", "vehicle accessory", "car charger", "car air freshener", "car cleaner", "bike helmet", "bike accessory", "luggage", "travel bag", "suitcase", "duffel bag", "travel pillow", "travel adapter", "gift set", "flower", "chocolate box", "greeting card", "voucher", "subscription", "software", "antivirus", "operating system", "utility software", "education course", "online class", "web hosting", "domain name", "digital product", "ebook", "music download", "movie download", "game download", "gift card", "furniture cover", "car cover", "bike cover", "umbrella", "raincoat", "sleeping mask", "earplugs", "travel neck pillow", "electric blanket", "heating pad", "massager", "humidifier", "dehumidifier", "air purifier", "air conditioner", "water dispenser", "cooler", "vacuum flask", "storage box", "basket", "hanger", "clothes rack", "laundry basket", "drying rack", "mirror", "clock", "photo album", "journal", "diary", "calendar", "planner", "desk organizer", "pen stand", "file cabinet", "shredder", "projector screen", "webcam cover", "screen protector", "laptop stand", "mobile stand", "ring light", "tripod", "microphone stand", "keyboard cover", "mouse pad", "webcam light", "usb hub", "cable organizer", "cable protector", "power adapter", "travel mug", "tumbler", "coaster", "tablecloth", "napkin", "placemat", "cutlery set", "chopsticks", "straw", "bottle opener", "can opener", "kitchen scale", "timer", "oven mitt", "apron", "dish towel", "cleaning cloth", "sponge", "scrubber", "broom", "dustpan", "wiper", "gloves", "disinfectant", "air freshener", "insect repellent", "candle holder", "incense stick", "aroma diffuser", "essential oil", "massage oil", "bath bomb", "bath salt", "loofah", "hair brush", "comb", "razor", "shaving cream", "aftershave", "hand cream", "foot cream", "lip balm", "body butter", "face mask", "hair mask", "sun hat", "scarf", "gloves", "belt buckle", "tie", "cufflinks", "brooch", "keychain", "umbrella", "rain boots", "swimming goggles", "swim cap", "gym bag", "sports water bottle", "protein bar", "energy drink", "health supplement", "protein supplement", "fish oil", "multivitamin", "calcium supplement", "iron supplement", "zinc supplement", "vitamin c", "vitamin d", "b-complex", "probiotic", "prebiotic", "digestive enzyme", "sleep aid", "stress relief", "pain relief", "cold medicine", "fever medicine", "allergy medicine", "antiseptic", "bandage", "gauze", "cotton ball", "ointment", "spray", "hand wash", "sanitizer refill", "tissue box", "face towel", "bath towel", "hand towel", "door mat", "shoe mat", "car mat", "boot mat", "dash cam", "car vacuum cleaner", "tire inflator", "jump starter", "car perfume", "car polish", "car wax", "bike lock", "bike pump", "bike light", "cycle bell", "cycle stand"].includes(key)){
                        if(["smartphone","laptop","earbuds","t-shirt","book","smart tv","watch","sunscreen","tablet","sneakers","running shoes","headphones","kurta","ceiling fan","gaming laptop","shirt","na","refrigerator","face wash","ssd","water bottle","ac","mattress","monitor","shampoo","bedsheet","air cooler","backpack","laptop backpack","casual shirt","smartwatch","gaming mouse","tablets","dress","sunglasses","keyboard","phone case","clogs","gaming monitor","hair oil","slippers","back cover","helmet","body wash","jeans","jewel set","perfume","soundbar","office chair","power bank","washing machine","flats sandal","water purifier","printer","split ac","soap","trousers","eau de parfum","sandal","gaming keyboard","lunch box","toothpaste","door mat","trimmer","moisturizer","wallet","earphones","wireless mouse","track pants","suitcase","analog watch","liquid detergent","notebook","mixer grinder","sneaker","pressure cooker","pillow","screen protector","baby diapers","charging cable","mouse pad","deodorant","casuals","garbage bags","sandals","saree","toy car","umbrella","air fryer","peanut butter","earrings","sling bag","gamepad","whey protein","facewash","lipstick","flip flops","speaker","running shoe","watering can","face serum","body pillow","smart watch","vest","yogurt","action camera","casual shoes","mechanical keyboard","necklace","wall clock","creatine","jutis","mosquito net","face moisturizer","charger","graphics card","inverter battery","biscuit","hair colour","chocolate","laptop stand","slides","grocery container","polo t-shirt","webcam","polo shirt","mattress protector","chimney","mango","instant coffee","lehenga choli","juicer mixer grinder","supplement","anarkali gown","earring","cat food","detergent","kajal","mouse","pay balance","wifi range extender","bluetooth speaker","door curtain","almonds","voltage stabilizer","formal shirt","tie","cookies","hair dryer","shoulder bag","sunflower oil","chia seeds","jewellery set","motherboard","ram","clogs sandal","antiseptic liquid","battery","razor","sneaker shoes","vacuum cleaner","hair growth serum","induction cooktop","floor mat","shorts","walking shoes","camera","milk","peel-off mask","usb cable","table fan","night lamp","cargo pants","electric kettle","body lotion","day cream","fish oil","lip balm","shower gel","mobile holder","storage box","earphone","toilet cleaner","walnuts","cargos","serum","socks","foundation","multivitamin","ball pen","blood pressure monitor","mouthwash","bracelet","luggage","toothbrush","dog treats","baby wipes","ghee","inverter","exhaust fan","toy","potli","ipad","hair spray","dinner set","diapers","cleaning gloves","face scrub","capsules","school shoes","anti-dandruff shampoo","mustard oil","phone cover","heels sandal","led bulb","paneer","slipper","muesli","laptop table","projector","briefs","bathroom cleaner","photo frame","milk frother","cashews","action figure","dates","study table","badminton racquet","computer case","watch strap","headset","chopping board","kurta set","tumbler","sunscreen lotion","sweatshirt","oats","coffee mug","security camera","tempered glass","sound card","trolley bag","kurti","creatine monohydrate","dark chocolate","cookware set","tyre inflator","apple cider vinegar","gaming headset","card game","laundry basket","eyeliner","olive oil","board game","led batten","table cover","snack","pyjama","clog","hair color","gaming console","seeds","engine oil","track pant","tawa","protein bar","shoe rack","generic","bed","comforter","wireless controller","gaming chair","knife set","coconut opener","eggs","camera lens","wall charger","avocado","vitamin e capsule","tv","microwave oven","onion","water melon","protein powder","wardrobe","curd","headphone","usb hub","handwash","essential oil","rain coat","books","lunch bag","mirrorless camera","bookshelf","ink bottle","school bag","car charger","jam","bathroom shelf","game","egift card","foam mattress","swimming goggles","bathing bar","black tea","memory card","laptop bag","microphone","night light","microsdxc card","console","kitchen rack","concealer","screwdriver set","ring","co-ords set","coconut water"," ","beard trimmer","coffee","tripod","laptop sleeve","wallpaper","monitor stand","kurta pant dupatta set","cricket shoes","dumbbells","coffee maker","maxi dress","detergent powder","eyeshadow palette","cocoa powder","pedestal fan","extension board","laptop cooling pad","motorbike helmet","knee support","gond katira","snacks","perfume gift set","key holder","ups","desktop processor","moisturiser","lotion","curtain","sugar","shoes","streaming device","fountain pen","heels","electric scooter","shampoo bar","spice set","mini ups","oil","keychain","led strip light","ssd enclosure","wedges sandal","sports shoes","swimming cap","handbag","seat cushion","macbook air","hair removal cream","gown","leather belt","loafers","split inverter ac","saree cover","washing machine cover","garbage bag","stain remover","power supply","sanitary pads","keypad phone","textbook","dry broom","tongue cleaner","door seal","microsd card","car cover","ladder","multipurpose spray","rack","shirt stacker","boxer","raincoat","kitchen scale","sauce","talc","casual sandal","tablet case","massager","paperback","facial beauty oil","window ac","tofu","tomato","spinach","cheese slices","hair serum","hair color spray","computer desk","rusk","dishwash bar","card verification","type c cable","video game","fridge container","vegetable chopper","stylus pen","air conditioner cover","dish drainer","wireless earbuds","facial cleanser","usb-c cable","wall fan","belt","liquid lipstick","processor","gaming controller","pistachios","smart speaker","battery charger","kitchen knife set","led monitor","bedsheets","basmati rice","steam iron","chain","travel adapter","yoga mat","digital watch","card holder","sanitary pad","polo neck t-shirt","led panel light","usb adapter","trunk","gloves","night cream","athleisure shoes","formal shoes","car shampoo","rucksack","wash basin","wired headset","ethernet cable","spray paint","otg drive","body spray","cctv camera","sports shorts","earpods","electric toothbrush","cutlery set","conditioner","shaker bottle","poha","creatine powder","knee brace","kurta palazzo set","anti-acne face wash","air conditioner","top","adapter","primer","hair conditioner","table runner","luggage suitcase","selfie stick","straight kurta","casual pants","adult diapers","tds meter","wired earphones","ice cream","formal shoe","wall shelf","cleaning brush","artificial plant","garment steamer","shoe","screwdriver","paddock stand","arm sleeves","keyboard cover","formula powder","football","weather stripping","desk grommet","kurta pant set","storage boxes","weighing scale","keyboard and mouse","tv wall mount"].includes(key)){   
                            normalisedGenericAff[key] = parseFloat(genericAffinity[key] / denominator);   
                        }
                    }
                }

                // if (brandAffinity && Object.keys(brandAffinity).length > 0) {
                //     const topBrands = Object.entries(brandAffinity)
                //         .sort((a, b) => b[1] - a[1]) // sort descending by value
                //         .slice(0, 3); // keep top 150
                
                //     const denominator = topBrands.reduce((sum, [_, val]) => sum + val, 0);
                
                //     for (let [key, val] of topBrands) {
                //         normalisedBrandAff[key] = parseFloat(val / denominator);
                //     }
                // }
                
                // if (categoryAffinity && Object.keys(categoryAffinity).length > 0) {
                //     const topCategories = Object.entries(categoryAffinity)
                //         .sort((a, b) => b[1] - a[1])
                //         .slice(0, 100); // top 300
                
                //     const denominator = topCategories.reduce((sum, [_, val]) => sum + val, 0);
                
                //     for (let [key, val] of topCategories) {
                //         normalisedCategoryAff[key] = parseFloat(val / denominator);
                //     }
                // }
                
                // if (genericAffinity && Object.keys(genericAffinity).length > 0) {
                //     const topGeneric = Object.entries(genericAffinity)
                //         .sort((a, b) => b[1] - a[1])
                //         .slice(0, 3); // top 150
                
                //     const denominator = topGeneric.reduce((sum, [_, val]) => sum + val, 0);
                
                //     for (let [key, val] of topGeneric) {
                //         normalisedGenericAff[key] = parseFloat(val / denominator);
                //     }
                // }
                

                let ele = { user_id : extId, city : normalisedCity, gender : normalisedGender, brandAffinity : normalisedBrandAff, categoryAffinity : normalisedCategoryAff, genericAffinity :  normalisedGenericAff};
                let dataToAddInBetween = {
                    index: {
                        _index: "user_persona_attributes",
                        _id: `${extId}`,
                    },
                };

                console.log(JSON.stringify(ele));

                let line = `${JSON.stringify(dataToAddInBetween)}\n${JSON.stringify(ele)}\n`;
                personaData += line;
                personaIdArr.push(extId);
            } catch (error) {
                console.error("iterating db entries", error, data);
            }
        }
        if (personaData !== "" && personaIdArr.length > 0) {
            try {
                await pushBulkDataToTable("user_persona_attributes", personaData);
                let updateToPush = "UPDATE `personalisation`.`user_persona` SET hasChanged = 0 WHERE extId IN (?)";
                await dbHandle.commonQuery(updateToPush, [personaIdArr]);
                personaIdArr = [];
                personaData = '';
            } catch (err) {
                console.error("error in range entry_id", personaIdArr[0], "to", personaIdArr[personaIdArr.length-1]);
                throw err;
            }
        }
    } catch (error) {
        console.log({ "function:": "main", error });
    }
}

let glob_lock = false;

setInterval(async () => {
    try {
        if (glob_lock)
            return;
        glob_lock = true;
        await main();
        glob_lock = false;
    } catch (error) {
        glob_lock = false;
        console.error(error);
    }
}, 5 * 1000);   // every 5 seconds pushing data

setInterval(()=>{
    process.exit(0);
}, 1000*60*60*24);