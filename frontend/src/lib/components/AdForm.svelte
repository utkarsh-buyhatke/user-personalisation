<script lang="ts">
	import { getUsersPersonas } from '$lib/api';
	import { goto } from '$app/navigation';

	// Product details
	let productName: string = '';
	let imageUrls: string[] = [''];
	let selectedL1Category: string = '';
	let selectedL2Category: string = '';
	let selectedL3Category: string = '';
	let selectedGender: string = 'Unisex';
	let selectedCityTier: string = 'No Tier';
	let brandName: string = '';

	// Fixed options with proper typing
	interface Categories {
		L1: { id: string; name: string }[];
		L2: { [key: string]: { id: string; name: string }[] };
		L3: { [key: string]: { id: string; name: string }[] };
	}

	const categories: Categories = {
		L1: [
			{ id: '8', name: 'Mobiles & Accessories' },
			{ id: '10', name: 'Footwear' },
			{ id: '28', name: 'Watches' },
			{ id: '36', name: 'Beauty and Grooming' },
			{ id: '55', name: 'Computers' },
			{ id: '58', name: 'Audio & Video' },
			{ id: '71', name: 'Home & Kitchen' },
			{ id: '277', name: 'Books' }
		],
		L2: {
			'8': [{ id: '9', name: 'Mobiles' }],
			'10': [{ id: '88', name: "Women's Footwear" }],
			'28': [{ id: '29', name: 'Wrist Watches' }],
			'36': [{ id: '37', name: 'Makeup' }],
			'55': [{ id: '99', name: 'Laptops' }],
			'58': [{ id: '59', name: 'Headset' }],
			'71': [{ id: '72', name: 'Home Appliances' }],
			'277': [{ id: '896', name: 'Fiction Books' }]
		},
		L3: {
			'37': [
				{ id: '38', name: 'Face Makeup' },
				{ id: '187', name: 'Makeup Accessory' },
				{ id: '329', name: 'Lips' },
				{ id: '366', name: 'Nails' },
				{ id: '1163', name: 'Eye Makeup' },
				{ id: '1644', name: 'Makeup Kits & Combo' }
			],
			'59': [
				{ id: '60', name: 'Earphones' },
				{ id: '109', name: 'Headphones' }
			],
			'72': [
				{ id: '73', name: 'Air Conditioners' },
				{ id: '134', name: 'Air Coolers' },
				{ id: '139', name: 'Refrigerators' },
				{ id: '140', name: 'Vacuum Cleaners' },
				{ id: '151', name: 'Fans' },
				{ id: '210', name: 'Water purifiers' },
				{ id: '211', name: 'Irons' },
				{ id: '269', name: 'Voltage Stabilizers' },
				{ id: '352', name: 'Immersion Rods' },
				{ id: '393', name: 'Water Geysers' },
				{ id: '434', name: 'Appliance Parts & Accessories' },
				{ id: '437', name: 'Washing Machines' }
			],
			'88': [
				{ id: '89', name: "Women's Ballerinas" },
				{ id: '158', name: "Women's Sports Shoes" },
				{ id: '198', name: "Women's Casual Shoes" },
				{ id: '276', name: "Women's Slippers & Flip Flops" },
				{ id: '408', name: "Women's Heels" },
				{ id: '533', name: "Women's Flats" },
				{ id: '675', name: "Women's Wedges" },
				{ id: '1125', name: "Women's Ethnic Shoes" },
				{ id: '1475', name: "Women's Sports Sandals" },
				{ id: '1900', name: "Women's Formals" }
			],
			'896': [
				{ id: '897', name: 'General Fiction Books' },
				{ id: '1594', name: 'Crime, Mystery and Thriller Books' },
				{ id: '1606', name: 'Myths and Fairytale Books' },
				{ id: '2340', name: 'Romance Books' },
				{ id: '2426', name: 'Action and Adventure Books' },
				{ id: '2511', name: 'Fantasy Fiction Books' },
				{ id: '2650', name: 'Science Fiction Books' },
				{ id: '2690', name: 'Supernatural and Horror Fiction Books' },
				{ id: '2825', name: 'Religion and Spirituality Fiction Books' },
				{ id: '2882', name: 'Historical Fiction Books' }
			]
		}
	};

	const validGenericNames = [
		'smartphone',
		'laptop',
		'earbuds',
		't-shirt',
		'book',
		'smart tv',
		'watch',
		'sunscreen',
		'tablet',
		'sneakers',
		'running shoes',
		'headphones',
		'kurta',
		'ceiling fan',
		'gaming laptop',
		'shirt',
		'na',
		'refrigerator',
		'face wash',
		'ssd',
		'water bottle',
		'ac',
		'mattress',
		'monitor',
		'shampoo',
		'bedsheet',
		'air cooler',
		'backpack',
		'laptop backpack',
		'casual shirt',
		'smartwatch',
		'gaming mouse',
		'tablets',
		'dress',
		'sunglasses',
		'keyboard',
		'phone case',
		'clogs',
		'gaming monitor',
		'hair oil',
		'slippers',
		'back cover',
		'helmet',
		'body wash',
		'jeans',
		'jewel set',
		'perfume',
		'soundbar',
		'office chair',
		'power bank',
		'washing machine',
		'flats sandal',
		'water purifier',
		'printer',
		'split ac',
		'soap',
		'trousers',
		'eau de parfum',
		'sandal',
		'gaming keyboard',
		'lunch box',
		'toothpaste',
		'door mat',
		'trimmer',
		'moisturizer',
		'wallet',
		'earphones',
		'wireless mouse',
		'track pants',
		'suitcase',
		'analog watch',
		'liquid detergent',
		'notebook',
		'mixer grinder',
		'sneaker',
		'pressure cooker',
		'pillow',
		'screen protector',
		'baby diapers',
		'charging cable',
		'mouse pad',
		'deodorant',
		'casuals',
		'garbage bags',
		'sandals',
		'saree',
		'toy car',
		'umbrella',
		'air fryer',
		'peanut butter',
		'earrings',
		'sling bag',
		'gamepad',
		'whey protein',
		'facewash',
		'lipstick',
		'flip flops',
		'speaker',
		'running shoe',
		'watering can',
		'face serum',
		'body pillow',
		'smart watch',
		'vest',
		'yogurt',
		'action camera',
		'casual shoes',
		'mechanical keyboard',
		'necklace',
		'wall clock',
		'creatine',
		'jutis',
		'mosquito net',
		'face moisturizer',
		'charger',
		'graphics card',
		'inverter battery',
		'biscuit',
		'hair colour',
		'chocolate',
		'laptop stand',
		'slides',
		'grocery container',
		'polo t-shirt',
		'webcam',
		'polo shirt',
		'mattress protector',
		'chimney',
		'mango',
		'instant coffee',
		'lehenga choli',
		'juicer mixer grinder',
		'supplement',
		'anarkali gown',
		'earring',
		'cat food',
		'detergent',
		'kajal',
		'mouse',
		'pay balance',
		'wifi range extender',
		'bluetooth speaker',
		'door curtain',
		'almonds',
		'voltage stabilizer',
		'formal shirt',
		'tie',
		'cookies',
		'hair dryer',
		'shoulder bag',
		'sunflower oil',
		'chia seeds',
		'jewellery set',
		'motherboard',
		'ram',
		'clogs sandal',
		'antiseptic liquid',
		'battery',
		'razor',
		'sneaker shoes',
		'vacuum cleaner',
		'hair growth serum',
		'induction cooktop',
		'floor mat',
		'shorts',
		'walking shoes',
		'camera',
		'milk',
		'peel-off mask',
		'usb cable',
		'table fan',
		'night lamp',
		'cargo pants',
		'electric kettle',
		'body lotion',
		'day cream',
		'fish oil',
		'lip balm',
		'shower gel',
		'mobile holder',
		'storage box',
		'earphone',
		'toilet cleaner',
		'walnuts',
		'cargos',
		'serum',
		'socks',
		'foundation',
		'multivitamin',
		'ball pen',
		'blood pressure monitor',
		'mouthwash',
		'bracelet',
		'luggage',
		'toothbrush',
		'dog treats',
		'baby wipes',
		'ghee',
		'inverter',
		'exhaust fan',
		'toy',
		'potli',
		'ipad',
		'hair spray',
		'dinner set',
		'diapers',
		'cleaning gloves',
		'face scrub',
		'capsules',
		'school shoes',
		'anti-dandruff shampoo',
		'mustard oil',
		'phone cover',
		'heels sandal',
		'led bulb',
		'paneer',
		'slipper',
		'muesli',
		'laptop table',
		'projector',
		'briefs',
		'bathroom cleaner',
		'photo frame',
		'milk frother',
		'cashews',
		'action figure',
		'dates',
		'study table',
		'badminton racquet',
		'computer case',
		'watch strap',
		'headset',
		'chopping board',
		'kurta set',
		'tumbler',
		'sunscreen lotion',
		'sweatshirt',
		'oats',
		'coffee mug',
		'security camera',
		'tempered glass',
		'sound card',
		'trolley bag',
		'kurti',
		'creatine monohydrate',
		'dark chocolate',
		'cookware set',
		'tyre inflator',
		'apple cider vinegar',
		'gaming headset',
		'card game',
		'laundry basket',
		'eyeliner',
		'olive oil',
		'board game',
		'led batten',
		'table cover',
		'snack',
		'pyjama',
		'clog',
		'hair color',
		'gaming console',
		'seeds',
		'engine oil',
		'track pant',
		'tawa',
		'protein bar',
		'shoe rack',
		'generic',
		'bed',
		'comforter',
		'wireless controller',
		'gaming chair',
		'knife set',
		'coconut opener',
		'eggs',
		'camera lens',
		'wall charger',
		'avocado',
		'vitamin e capsule',
		'tv',
		'microwave oven',
		'onion',
		'water melon',
		'protein powder',
		'wardrobe',
		'curd',
		'headphone',
		'usb hub',
		'handwash',
		'essential oil',
		'rain coat',
		'books',
		'lunch bag',
		'mirrorless camera',
		'bookshelf',
		'ink bottle',
		'school bag',
		'car charger',
		'jam',
		'bathroom shelf',
		'game',
		'egift card',
		'foam mattress',
		'swimming goggles',
		'bathing bar',
		'black tea',
		'memory card',
		'laptop bag',
		'microphone',
		'night light',
		'microsdxc card',
		'console',
		'kitchen rack',
		'concealer',
		'screwdriver set',
		'ring',
		'co-ords set',
		'coconut water',
		' ',
		'beard trimmer',
		'coffee',
		'tripod',
		'laptop sleeve',
		'wallpaper',
		'monitor stand',
		'kurta pant dupatta set',
		'cricket shoes',
		'dumbbells',
		'coffee maker',
		'maxi dress',
		'detergent powder',
		'eyeshadow palette',
		'cocoa powder',
		'pedestal fan',
		'extension board',
		'laptop cooling pad',
		'motorbike helmet',
		'knee support',
		'gond katira',
		'snacks',
		'perfume gift set',
		'key holder',
		'ups',
		'desktop processor',
		'moisturiser',
		'lotion',
		'curtain',
		'sugar',
		'shoes',
		'streaming device',
		'fountain pen',
		'heels',
		'electric scooter',
		'shampoo bar',
		'spice set',
		'mini ups',
		'oil',
		'keychain',
		'led strip light',
		'ssd enclosure',
		'wedges sandal',
		'sports shoes',
		'swimming cap',
		'handbag',
		'seat cushion',
		'macbook air',
		'hair removal cream',
		'gown',
		'leather belt',
		'loafers',
		'split inverter ac',
		'saree cover',
		'washing machine cover',
		'garbage bag',
		'stain remover',
		'power supply',
		'sanitary pads',
		'keypad phone',
		'textbook',
		'dry broom',
		'tongue cleaner',
		'door seal',
		'microsd card',
		'car cover',
		'ladder',
		'multipurpose spray',
		'rack',
		'shirt stacker',
		'boxer',
		'raincoat',
		'kitchen scale',
		'sauce',
		'talc',
		'casual sandal',
		'tablet case',
		'massager',
		'paperback',
		'facial beauty oil',
		'window ac',
		'tofu',
		'tomato',
		'spinach',
		'cheese slices',
		'hair serum',
		'hair color spray',
		'computer desk',
		'rusk',
		'dishwash bar',
		'card verification',
		'type c cable',
		'video game',
		'fridge container',
		'vegetable chopper',
		'stylus pen',
		'air conditioner cover',
		'dish drainer',
		'wireless earbuds',
		'facial cleanser',
		'usb-c cable',
		'wall fan',
		'belt',
		'liquid lipstick',
		'processor',
		'gaming controller',
		'pistachios',
		'smart speaker',
		'battery charger',
		'kitchen knife set',
		'led monitor',
		'bedsheets',
		'basmati rice',
		'steam iron',
		'chain',
		'travel adapter',
		'yoga mat',
		'digital watch',
		'card holder',
		'sanitary pad',
		'polo neck t-shirt',
		'led panel light',
		'usb adapter',
		'trunk',
		'gloves',
		'night cream',
		'athleisure shoes',
		'formal shoes',
		'car shampoo',
		'rucksack',
		'wash basin',
		'wired headset',
		'ethernet cable',
		'spray paint',
		'otg drive',
		'body spray',
		'cctv camera',
		'sports shorts',
		'earpods',
		'electric toothbrush',
		'cutlery set',
		'conditioner',
		'shaker bottle',
		'poha',
		'creatine powder',
		'knee brace',
		'kurta palazzo set',
		'anti-acne face wash',
		'air conditioner',
		'top',
		'adapter',
		'primer',
		'hair conditioner',
		'table runner',
		'luggage suitcase',
		'selfie stick',
		'straight kurta',
		'casual pants',
		'adult diapers',
		'tds meter',
		'wired earphones',
		'ice cream',
		'formal shoe',
		'wall shelf',
		'cleaning brush',
		'artificial plant',
		'garment steamer',
		'shoe',
		'screwdriver',
		'paddock stand',
		'arm sleeves',
		'keyboard cover',
		'formula powder',
		'football',
		'weather stripping',
		'desk grommet',
		'kurta pant set',
		'storage boxes',
		'weighing scale',
		'keyboard and mouse',
		'tv wall mount'
	];

	const validBrandNames = [
		'generic',
		'samsung',
		'mediatek',
		'snapdragon',
		'apple',
		'realme',
		'oneplus',
		'portronics',
		'boat',
		'philips',
		'iqoo',
		'sony',
		'intel',
		'hp',
		'lenovo',
		'zebronics',
		'fresh',
		'asus',
		'amazon basics',
		'lg',
		'nutraj',
		'exynos',
		'acer',
		'puma',
		'agaro',
		'amazon',
		'panasonic',
		'lakmé',
		'xiaomi',
		'casio',
		'crompton',
		'havells',
		'ant esports',
		'tp-link',
		'boldfit',
		'wakefit',
		'biotique',
		'boult',
		'sandisk',
		'motorola',
		'msi',
		'evofox',
		'the derma co',
		'maybelline new york',
		'fortune',
		'adidas',
		'pigeon',
		'jbl',
		'atomberg',
		'redmi',
		'plantex',
		'amd',
		'amul',
		'ambrane',
		'safari',
		'oppo',
		'google',
		'amazon brand - solimo',
		'noise',
		'prestige',
		'lifelong',
		"pond's",
		'garnier',
		'faces canada',
		'dettol',
		'nike',
		'crucial',
		'amazon brand - symbol',
		'nivea',
		'ariel',
		'asian',
		'stedo',
		'minimalist',
		'mamaearth',
		'u.s. polo assn.',
		'bajaj',
		'ugaoo',
		'amazon brand',
		'nivia',
		'haier',
		'liberty',
		'farmley',
		'logitech',
		'wildcraft',
		'western digital',
		'tcl',
		'milton',
		'esr',
		'neutrogena',
		'lymio',
		'campus',
		'sounce',
		'classic',
		'bata',
		'logitech g',
		'dell',
		'american tourister',
		'the plant fix plix',
		'fogg',
		'navratna',
		'epigamia',
		'milky mist',
		'daikin',
		'bare anatomy',
		'aazeem',
		'nothing',
		'cello',
		'canon',
		'v-guard',
		'godrej',
		'spigen',
		'cetaphil',
		'razer',
		'redtape',
		'flipkart smartbuy',
		'luminous',
		'harpic',
		'happilo',
		'skechers',
		'saniya corporation',
		'mtr',
		'dabur',
		'poco',
		'solimo',
		'whirlpool',
		'steelbird',
		'action',
		'asics',
		'coirfit',
		'green soul',
		'vivo',
		'luvlap',
		'titan',
		'himalaya',
		"l'oréal paris",
		'whiskas',
		'borosil',
		'colgate',
		'red tape',
		'syndopa',
		'kreo',
		'britannia',
		'dji',
		'dove',
		'pears',
		'bosch',
		'gigabyte',
		'muscleblaze',
		'cadbury',
		'flipkart grocery',
		'gear',
		'usha shriram',
		'honor',
		'arctic fox',
		'exide',
		'hayden haiza',
		'dermatouch',
		'hindware',
		'studds',
		'mamypoko',
		'cmf by nothing',
		'ifb',
		'jockey',
		'voltas',
		'cosmic byte',
		'saraza',
		'bsb home',
		'thegiftkart',
		'sonavi',
		'wild stone',
		'conscious chemist',
		'sparx',
		'concept kart',
		'doctor extra soft',
		"kellogg's",
		'gillette',
		'mi',
		'xyxx',
		'fastrack',
		'fire-boltt',
		'murphy',
		'hisense',
		'wipro',
		'dot & key',
		'tata sampann',
		'hawkins',
		'epson',
		'wishcare',
		'homestrap',
		'deconstruct',
		'meat up',
		'striff',
		'lakme',
		'aroma magic',
		'amazon brand - presto!',
		'aquaguard',
		"l'oreal paris",
		'belkin',
		'hyuman',
		'itel',
		'dyazo',
		'yonex',
		'provogue',
		'orient electric',
		'amazonbasics',
		'nakpro',
		'aqualogica',
		'insta360',
		'daawat',
		'swiss beauty',
		'vega',
		"haldiram's",
		'motul',
		'soulflower',
		'amul taza',
		'pluckk',
		'og beauty luxury',
		'lukzer',
		'lavie',
		'myfitness',
		'tukzer',
		'redragon',
		'yogabar',
		'instacuppa',
		'timex',
		'gnc',
		'tecno',
		'skybags',
		'kohler',
		'crocs',
		'digitek',
		'honeywell',
		'matrix',
		'nerf',
		'wolf-garten',
		"neeman's",
		'glun',
		'kuber industries',
		'kuhl',
		'ibell',
		'avimee',
		'mexple',
		'fedus',
		'best choice nutrition',
		'cir',
		'dtodexpress',
		'winnifred',
		'jn handicraft',
		'urbanbox',
		'larah by borosil',
		'ganesh',
		'ikea',
		'jialto',
		'airson',
		'ptron',
		'the face shop',
		'wonderchef',
		'tekcool',
		'combraided',
		'signoraware',
		'pramirol',
		'quench',
		'minara',
		'powera',
		'anker',
		'perfora',
		'force',
		'envie',
		'ezee live life ezee way',
		'shivi creations',
		'swisse',
		'gharsoaps',
		'centrino',
		'zency rubber industry',
		'beaatho',
		'khadi natural',
		'arctic hunter',
		'carbamide forte',
		'faber',
		"hershey's",
		'urbano fashion',
		'oral-b',
		'wavex',
		'engage',
		'astride',
		'benq',
		'cerave',
		'hrx by hrithik roshan',
		'pw',
		'lego',
		'lino perros',
		'lapster',
		'the indus valley',
		'la verne',
		'blue star',
		'wolpin',
		'the indian garage co',
		'bigmuscles nutrition',
		'neuherbs',
		'doctor health'
	];

	let filteredGenericNames: string[] = [...validGenericNames].slice(0, 10);
	let filteredBrandNames: string[] = [...validBrandNames].slice(0, 10);
	let showGenericSuggestions = false;
	let showBrandSuggestions = false;
	let genericNameInput: HTMLInputElement;
	let brandNameInput: HTMLInputElement;

	const handleGenericNameInput = (event: Event) => {
		const input = (event.target as HTMLInputElement).value.toLowerCase();
		if (input.length === 0) {
			filteredGenericNames = validGenericNames.slice(0, 10);
		} else {
			filteredGenericNames = validGenericNames
				.filter((name) => name.toLowerCase().includes(input))
				.slice(0, 10);
		}
		showGenericSuggestions = true;
	};

	const handleBrandNameInput = (event: Event) => {
		const input = (event.target as HTMLInputElement).value.toLowerCase();
		if (input.length === 0) {
			filteredBrandNames = validBrandNames.slice(0, 10);
		} else {
			filteredBrandNames = validBrandNames
				.filter((name) => name.toLowerCase().includes(input))
				.slice(0, 10);
		}
		showBrandSuggestions = true;
	};

	const handleGenericNameFocus = () => {
		filteredGenericNames = validGenericNames.slice(0, 10);
		showGenericSuggestions = true;
	};

	const handleBrandNameFocus = () => {
		filteredBrandNames = validBrandNames.slice(0, 10);
		showBrandSuggestions = true;
	};

	const handleGenericNameBlur = () => {
		setTimeout(() => {
			showGenericSuggestions = false;
		}, 200);
	};

	const handleBrandNameBlur = () => {
		setTimeout(() => {
			showBrandSuggestions = false;
		}, 200);
	};

	const selectGenericName = (suggestion: string) => {
		selectedGenericName = suggestion;
		showGenericSuggestions = false;
		if (genericNameInput) {
			genericNameInput.value = suggestion;
			genericNameInput.focus();
		}
	};

	const selectBrandName = (suggestion: string) => {
		brandName = suggestion;
		showBrandSuggestions = false;
		if (brandNameInput) {
			brandNameInput.value = suggestion;
			brandNameInput.focus();
		}
	};

	const genderOptions = ['Men', 'Women', 'Unisex'];
	const cityTierOptions = ['Tier 1', 'Tier 2', 'Tier 3', 'No Tier'];

	let loading: boolean = false;
	let error: string | null = null;
	let success: string | null = null;

	// Toggle functions for multiple selections
	const toggleGender = (gender: string) => {
		selectedGender = gender;
	};

	const toggleCityTier = (tier: string) => {
		selectedCityTier = tier;
	};

	// Add a new image URL field
	const addImageUrl = () => {
		imageUrls = [...imageUrls, ''];
	};

	// Remove an image URL field
	const removeImageUrl = (index: number) => {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	};

	// Helper function to get L2 categories based on L1 selection
	const getL2Categories = (l1Id: string) => {
		return categories.L2[l1Id] || [];
	};

	// Helper function to get L3 categories based on L2 selection
	const getL3Categories = (l2Id: string) => {
		return categories.L3[l2Id] || [];
	};

	// Helper function to check if next level has categories
	const hasL2Categories = (l1Id: string) => {
		return getL2Categories(l1Id).length > 0;
	};

	const hasL3Categories = (l2Id: string) => {
		return getL3Categories(l2Id).length > 0;
	};

	const handleSubmit = async () => {
		loading = true;
		error = null;
		success = null;

		try {
			const params = new URLSearchParams();
			params.append('cityTier', selectedCityTier === 'No Tier' ? '' : selectedCityTier);
			params.append('gender', selectedGender);
			params.append('brand', brandName.toLowerCase());
			params.append('level1Cat', selectedL1Category);
			params.append('level2Cat', hasL2Categories(selectedL1Category) ? selectedL2Category : '-1');
			params.append('level3Cat', hasL3Categories(selectedL2Category) ? selectedL3Category : '-1');
			params.append('genericName', selectedGenericName.toLowerCase());

			const { status, data } = await getUsersPersonas(params);

			if (status === 1) {
				// Navigate to success page with submitted data and response
				const submittedData = {
					productName,
					imageUrls,
					genericName: selectedGenericName,
					brandName,
					categories: {
						l1: categories.L1.find((c) => c.id === selectedL1Category)?.name || '',
						l2:
							getL2Categories(selectedL1Category).find((c) => c.id === selectedL2Category)?.name ||
							'',
						l3:
							getL3Categories(selectedL2Category).find((c) => c.id === selectedL3Category)?.name ||
							''
					},
					gender: selectedGender,
					cityTier: selectedCityTier,
					response: data
				};

				goto('/analytics/product', {
					replaceState: true,
					state: { submittedData }
				});
				return;
			}
		} catch {
			error = 'Failed to create product.';
		}
		// finally {
		// 	productName = '';
		// 	imageUrls = [''];
		// 	selectedL1Category = '';
		// 	selectedL2Category = '';
		// 	selectedL3Category = '';
		// 	selectedGenericName = '';
		// 	selectedGender = '';
		// 	selectedCityTier = '';
		// 	brandName = '';
		// }

		loading = false;
	};

	// Add these to the script section at the top
	let selectedGenericName = '';
</script>

<div class="w-full">
	<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<h2 class="flex-shrink-0 text-2xl font-bold text-slate-800">Add New Product</h2>

		<button
			class="order-last mb-8 hidden h-full w-full min-w-44 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-0 focus:outline-none disabled:opacity-50 md:order-none md:mb-0 md:flex md:w-fit"
			disabled={loading}
			onclick={handleSubmit}
		>
			{loading ? 'Creating...' : 'Add Product'}
		</button>
	</div>

	{#if success}
		<div class="my-4 rounded-md bg-green-100 p-3 text-green-700">{success}</div>
	{/if}
	{#if error}
		<div class="my-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>
	{/if}

	<div class="mb-10 space-y-4">
		<div>
			<label for="productName" class="block text-sm font-medium text-slate-700">Product Name</label>
			<input
				type="text"
				id="productName"
				bind:value={productName}
				class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				autocomplete="off"
				autocapitalize="off"
				required
			/>
		</div>

		<!-- Image URLs -->
		<div>
			<span class="block text-sm font-medium text-slate-700">Product Images</span>
			<div class="mt-1 space-y-4">
				{#each imageUrls as imageUrl, index}
					<div class="flex flex-col gap-2 md:flex-row md:gap-4">
						<input
							type="url"
							bind:value={imageUrl}
							placeholder="Image URL"
							class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							autocomplete="off"
							required
						/>
						{#if index !== imageUrls.length - 1}
							<button
								type="button"
								onclick={() => removeImageUrl(index)}
								class="mt-1 w-full min-w-44 rounded-md bg-red-500 px-3 py-2 text-nowrap text-white hover:bg-red-600 md:w-auto"
							>
								Remove
							</button>
						{:else}
							<button
								type="button"
								onclick={addImageUrl}
								class="mt-1 w-full min-w-44 rounded-md bg-orange-500 px-3 py-2 text-nowrap text-white hover:bg-orange-600 md:w-auto"
							>
								Add Image URL
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="flex w-full flex-col gap-4 md:flex-row">
			<!-- Generic Name -->
			<div class="relative flex-1">
				<label for="genericName" class="block text-sm font-medium text-slate-600">
					Generic Name
				</label>
				<input
					id="genericName"
					bind:this={genericNameInput}
					type="text"
					bind:value={selectedGenericName}
					onfocus={handleGenericNameFocus}
					onblur={handleGenericNameBlur}
					oninput={handleGenericNameInput}
					placeholder="Type or select generic name"
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					autocomplete="off"
					autocapitalize="off"
					required
				/>
				{#if showGenericSuggestions && filteredGenericNames.length > 0}
					<div
						class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
					>
						<ul class="py-1">
							{#each filteredGenericNames as suggestion}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-indigo-50"
										onclick={() => selectGenericName(suggestion)}
									>
										{suggestion}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<!-- Brand Name -->
			<div class="relative flex-1">
				<label for="brandName" class="block text-sm font-medium text-slate-600"> Brand Name </label>
				<input
					type="text"
					id="brandName"
					bind:this={brandNameInput}
					bind:value={brandName}
					onfocus={handleBrandNameFocus}
					onblur={handleBrandNameBlur}
					oninput={handleBrandNameInput}
					placeholder="Type or select brand name"
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					autocomplete="off"
					autocapitalize="off"
					required
				/>
				{#if showBrandSuggestions && filteredBrandNames.length > 0}
					<div
						class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
					>
						<ul class="py-1">
							{#each filteredBrandNames as suggestion}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-indigo-50"
										onclick={() => selectBrandName(suggestion)}
									>
										{suggestion}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>

		<!-- Categories -->
		<div class="flex w-full flex-col gap-4 space-y-4 md:flex-row">
			<div class="flex-1">
				<label for="l1category" class="block text-sm font-medium text-slate-600">
					Category L1
				</label>
				<select
					id="l1category"
					bind:value={selectedL1Category}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					required
				>
					<option value="">Select L1 Category</option>
					{#each categories.L1 as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex-1">
				<label for="l2category" class="block text-sm font-medium text-slate-600">Category L2</label>
				<select
					id="l2category"
					bind:value={selectedL2Category}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
					required={hasL2Categories(selectedL1Category)}
					disabled={!selectedL1Category || !hasL2Categories(selectedL1Category)}
				>
					<option value="">
						{#if !selectedL1Category}
							Please select Category L1 first
						{:else if !hasL2Categories(selectedL1Category)}
							No subcategories available
						{:else}
							Select L2 Category
						{/if}
					</option>
					{#each getL2Categories(selectedL1Category) as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex-1">
				<label for="l3category" class="block text-sm font-medium text-slate-600">Category L3</label>
				<select
					id="l3category"
					bind:value={selectedL3Category}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
					required={hasL3Categories(selectedL2Category)}
					disabled={!selectedL2Category || !hasL3Categories(selectedL2Category)}
				>
					<option value="">
						{#if !selectedL1Category}
							Please select Category L1 first
						{:else if !selectedL2Category}
							Please select Category L2 first
						{:else if !hasL3Categories(selectedL2Category)}
							No subcategories available
						{:else}
							Select L3 Category
						{/if}
					</option>
					{#each getL3Categories(selectedL2Category) as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex w-full flex-col gap-4 md:flex-row">
			<!-- Gender Selection -->
			<div class="flex-1">
				<span class="block text-sm font-medium text-slate-700"> Gender </span>
				<div class="mt-2 space-x-4">
					{#each genderOptions as gender}
						<label class="inline-flex items-center">
							<input
								type="radio"
								name="gender"
								value={gender}
								checked={selectedGender === gender}
								onchange={() => toggleGender(gender)}
								class="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="ml-2">{gender}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- City Tier Selection -->
			<div class="flex-1">
				<span class="block text-sm font-medium text-slate-700"> Target Cities </span>
				<div class="mt-2 space-x-4">
					{#each cityTierOptions as tier}
						<label class="inline-flex items-center">
							<input
								type="radio"
								name="cityTier"
								value={tier}
								checked={selectedCityTier === tier}
								onchange={() => toggleCityTier(tier)}
								class="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="ml-2">{tier}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<button
			class="order-last mb-8 flex h-full w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-0 focus:outline-none disabled:opacity-50 md:order-none md:mb-0 md:hidden md:w-fit"
			disabled={loading}
			onclick={handleSubmit}
		>
			{loading ? 'Creating...' : 'Add Product'}
		</button>
	</div>
</div>
