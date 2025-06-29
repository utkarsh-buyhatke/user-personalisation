interface Categories {
	L1: { id: string; name: string }[];
	L2: { [key: string]: { id: string; name: string }[] };
	L3: { [key: string]: { id: string; name: string }[] };
}

export const categories: Categories = {
	L1: [
		{ id: "8", name: "Mobiles & Accessories" },
		{ id: "10", name: "Footwear" },
		{ id: "28", name: "Watches" },
		{ id: "36", name: "Beauty and Grooming" },
		{ id: "55", name: "Computers" },
		{ id: "58", name: "Audio & Video" },
		{ id: "71", name: "Home & Kitchen" },
		{ id: "277", name: "Books" }
	],
	L2: {
		"8": [{ id: "9", name: "Mobiles" }],
		"10": [{ id: "88", name: "Women's Footwear" }],
		"28": [{ id: "29", name: "Wrist Watches" }],
		"36": [{ id: "37", name: "Makeup" }],
		"55": [{ id: "99", name: "Laptops" }],
		"58": [{ id: "59", name: "Headset" }],
		"71": [{ id: "72", name: "Home Appliances" }],
		"277": [{ id: "896", name: "Fiction Books" }]
	},
	L3: {
		"37": [
			{ id: "38", name: "Face Makeup" },
			{ id: "187", name: "Makeup Accessory" },
			{ id: "329", name: "Lips" },
			{ id: "366", name: "Nails" },
			{ id: "1163", name: "Eye Makeup" },
			{ id: "1644", name: "Makeup Kits & Combo" }
		],
		"59": [
			{ id: "60", name: "Earphones" },
			{ id: "109", name: "Headphones" }
		],
		"72": [
			{ id: "73", name: "Air Conditioners" },
			{ id: "134", name: "Air Coolers" },
			{ id: "139", name: "Refrigerators" },
			{ id: "140", name: "Vacuum Cleaners" },
			{ id: "151", name: "Fans" },
			{ id: "210", name: "Water purifiers" },
			{ id: "211", name: "Irons" },
			{ id: "269", name: "Voltage Stabilizers" },
			{ id: "352", name: "Immersion Rods" },
			{ id: "393", name: "Water Geysers" },
			{ id: "434", name: "Appliance Parts & Accessories" },
			{ id: "437", name: "Washing Machines" }
		],
		"88": [
			{ id: "89", name: "Women's Ballerinas" },
			{ id: "158", name: "Women's Sports Shoes" },
			{ id: "198", name: "Women's Casual Shoes" },
			{ id: "276", name: "Women's Slippers & Flip Flops" },
			{ id: "408", name: "Women's Heels" },
			{ id: "533", name: "Women's Flats" },
			{ id: "675", name: "Women's Wedges" },
			{ id: "1125", name: "Women's Ethnic Shoes" },
			{ id: "1475", name: "Women's Sports Sandals" },
			{ id: "1900", name: "Women's Formals" }
		],
		"896": [
			{ id: "897", name: "General Fiction Books" },
			{ id: "1594", name: "Crime, Mystery and Thriller Books" },
			{ id: "1606", name: "Myths and Fairytale Books" },
			{ id: "2340", name: "Romance Books" },
			{ id: "2426", name: "Action and Adventure Books" },
			{ id: "2511", name: "Fantasy Fiction Books" },
			{ id: "2650", name: "Science Fiction Books" },
			{ id: "2690", name: "Supernatural and Horror Fiction Books" },
			{ id: "2825", name: "Religion and Spirituality Fiction Books" },
			{ id: "2882", name: "Historical Fiction Books" }
		]
	}
};