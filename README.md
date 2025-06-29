# Demographic and Behavioral Modeling for E-Commerce User Segmentation in India

This project implements a system for user segmentation in an e-commerce context, focusing on demographic and behavioral modeling for Indian users. It processes user interaction data (visits and purchases) to create user personas based on attributes like city tier, gender, brand affinity, category affinity, and generic product preferences. The system leverages a MySQL database and OpenSearch for efficient storage, querying, and segmentation.

## Project Structure

```
utkarsh-buyhatke-user-personalisation/
├── calculateUserPersona.js      # Calculates user personas based on visited/purchased products
├── createSchema.js             # Defines and creates database schemas for user personas
├── fetchPersona.js             # Queries user personas using OpenSearch with scoring
├── getBrandGenericName.js      # Extracts top brands and generic names from user affinities
├── getL2Cats.js               # Fetches category hierarchies (L1, L2, L3) from database
├── insertRealUsers.js         # Inserts real user data from CSV and checkout records
├── insertUserDummy.js         # Generates and inserts dummy user data
├── pushPersonaData.js         # Normalizes and pushes persona data to OpenSearch
└── testPersona.js             # API endpoint to fetch personas based on filters
```

## Prerequisites

- **Node.js**: v14 or higher
- **MySQL**: For storing user and product data
- **OpenSearch**: For indexing and querying user personas
- **Dependencies**:
  - `express` (for API in `testPersona.js`)
  - `csv-parse` (for reading CSV in `insertRealUsers.js`)
  - `fs`, `path` (for file operations)
  - Custom database handlers (`dbHandleMain.js`, `testDb.js`, `opensearch.js`)

Install dependencies:
```bash
npm install express csv-parse
```

## Setup

1. **Database Configuration**:
   - Configure MySQL connections in `dbHandleMain.js` and `testDb.js`.
   - Ensure the following tables exist:
     - `buyhatke_eweather.productCategorization`: Product details
     - `buyhatke_eweather.newFlipBreadCrumbs`: Category hierarchy
     - `analytics.checkout`: Purchase data
     - `personalisation.user_persona`: User persona storage

2. **OpenSearch Setup**:
   - Configure OpenSearch in `opensearch.js`.
   - Run `createSchema.js` to create the `user_persona_attributes` index.

 Based on your previous need to handle large datasets with JSON attributes in MySQL and transition to OpenSearch, this setup optimizes for scalability and fast querying.

3. **Directory Setup**:
   - Create a `personaTxts` directory for storing visited products JSON files (used by `insertRealUsers.js`).

4. **Environment Variables**:
   - Create a `.env` file for `insertUserDummy.js` if using external APIs (e.g., Gemini API, though currently commented out).

## Usage

1. **Inserting Data**:
   - **Real Users**: Run `insertRealUsers.js` to process user visit data from `all_visit.csv` and purchase data from the checkout table.
     ```bash
     node insertRealUsers.js
     ```
   - **Dummy Users**: Run `insertUserDummy.js` to generate and insert synthetic user data.
     ```bash
     node insertUserDummy.js
     ```

2. **Calculating Personas**:
   - Run `calculateUserPersona.js` to compute user affinities (brand, category, generic, city, gender) based on visited and purchased products.
     ```bash
     node calculateUserPersona.js
     ```

3. **Pushing to OpenSearch**:
   - Run `pushPersonaData.js` to normalize and push persona data to OpenSearch.
     ```bash
     node pushPersonaData.js
     ```

4. **Querying Personas**:
   - Start the Express server in `testPersona.js` to query personas via a POST endpoint (`/fetchPersonas`).
     ```bash
     node testPersona.js
     ```
   - Example request:
     ```json
     {
       "gender": "men",
       "cityTier": "Tier1",
       "brand": "boat",
       "genericName": "smartwatch",
       "level1Cat": 8,
       "level2Cat": 9,
       "level3Cat": -1
     }
     ```

5. **Extracting Top Brands and Generics**:
   - Run `getBrandGenericName.js` to get the top 300 brands and 500 generic names by affinity.
     ```bash
     node getBrandGenericName.js
     ```

6. **Fetching Category Hierarchy**:
   - Run `getL2Cats.js` to retrieve category hierarchies (L1, L2, L3).
     ```bash
     node getL2Cats.js
     ```

## Key Features

- **Data Ingestion**: Processes real user data from CSV and checkout records (`insertRealUsers.js`) and generates synthetic data (`insertUserDummy.js`).
- **Persona Calculation**: Computes affinities for brands, categories, generics, cities, and gender based on weighted interactions (`calculateUserPersona.js`).
- **Normalization and Storage**: Normalizes affinities and stores them in OpenSearch for efficient querying (`pushPersonaData.js`).
- **Querying**: Supports filtering by gender, city tier, brand, generic name, and category levels with a scoring mechanism (`fetchPersona.js`, `testPersona.js`).
- **Category Management**: Fetches and organizes category hierarchies (`getL2Cats.js`).
- **Scalability**: Handles large datasets with batch processing and file-based storage for visited products.

## Detailed Logic

### **calculateUserPersona.js**
This script calculates user personas by processing visited and purchased product data, generating affinity scores, and updating the database.

- **Input**: Queries `personalisation.user_persona` for up to 100 users with `hasChanged = 1`, fetching `extId`, `listOfProdsVisited` (filepath to JSON), and `listOfProdsPurchased` (JSON string).
- **Processing**:
  - **Visited Products**: Reads JSON file from filepath, incrementing affinities by **1** for brand, gender, category, subcategory, sub-subcategory, e-commerce platform (`pos`), generic name, and city tier (derived from pincode).
  - **Purchased Products**: Parses JSON string, incrementing affinities by **40** for brand, category, subcategory, sub-subcategory, generic name, and e-commerce platform, and **1** for gender and city tier.
  - **Search Terms**: Selects up to 20 random visited products, generates 3-5 word search queries, and increments affinities by **5** for relevant attributes.
- **Output**: Updates `user_persona` with JSON strings for `searchTerms`, `gender`, `city`, `ecomm`, `brandAffinity`, `categoryAffinity`, and `genericAffinity`, setting `hasChanged = 2`.
- **Key Features**:
  - Weighted scoring (visits: 1, purchases: 40, searches: 5) emphasizes purchase intent.
  - Uses pincode-to-city and city-to-tier mappings for demographic segmentation.
  - Stores visited products in external JSON files for scalability.
- **Limitations**:
  - Limited to 100 users per run.
  - Assumes valid JSON and file paths; errors skip users.
  - No normalization (handled by `pushPersonaData.js`).

### **pushPersonaData.js**
This script normalizes user persona data and pushes it to the `user_persona_attributes` OpenSearch index.

- **Input**: Queries `personalisation.user_persona` for up to 100 users with `hasChanged = 2`, fetching `extId`, `city`, `gender`, `brandAffinity`, `categoryAffinity`, `genericAffinity`, and `listOfProdsVisited`.
- **Processing**:
  - **Normalization**:
    - **Gender**: Assigns "men" (≥80% male), "women" (≥80% female), or "unisex" based on counts.
    - **City**: Normalizes city tier affinities to sum to 1.
    - **Brand, Category, Generic**: Filters to predefined lists and normalizes affinities to sum to 1.
  - **Document Creation**: Creates OpenSearch documents with `user_id`, normalized `city`, `gender`, `brandAffinity`, `categoryAffinity`, and `genericAffinity`.
  - **Bulk Indexing**: Pushes documents to OpenSearch and updates `hasChanged = 0` for processed users.
- **Scheduling**: Runs every 5 seconds with a global lock, exiting after 24 hours.
- **Key Features**:
  - Normalizes affinities for consistent querying.
  - Filters attributes to reduce noise.
  - Uses bulk indexing for efficiency.
- **Limitations**:
  - Relies on predefined attribute lists, potentially excluding valid values.
  - Frequent 5-second runs may strain resources for large datasets.

### **testPersona.js**
This script provides an Express.js API endpoint (`/fetchPersonas`) to query user personas from OpenSearch.

- **Endpoint**: `POST /fetchPersonas`
- **Input**: JSON body with `gender` ("men", "women", "unisex"), `cityTier` (e.g., "Tier1"), `brand` (e.g., "boat"), `genericName` (e.g., "smartwatch"), `level1Cat`, `level2Cat`, `level3Cat` (category IDs or -1).
- **Processing**:
  - Normalizes inputs (e.g., "male" → "men", removes spaces from `cityTier`).
  - Queries OpenSearch with a `script_score` query:
    - **Scores**: City (0.15), brand (0.35), generic (0.20), and category (0.30) based on normalized affinities.
    - Assigns neutral scores (1 or 0.3333) for unspecified filters.
    - Returns top 20 users sorted by score.
  - Fetches `listOfProdsVisited`, `listOfProdsPurchased`, and `searchTerms` from MySQL, filtering to match query criteria.
- **Output**: JSON response with filtered user personas, including product lists and search terms.
- **Key Features**:
  - Flexible filtering and weighted scoring for precise segmentation.
  - Integrates OpenSearch for fast queries and MySQL for detailed data.
- **Limitations**:
  - Limited to 20 results.
  - Case-sensitive matching may cause issues.
  - Assumes valid file paths for visited products.

## Notes

- The `hasChanged` flag in `user_persona` table tracks processing stages (1: needs calculation, 2: calculated, 0: pushed to OpenSearch).
- Product visits have a 20% chance of duplication to simulate realistic user behavior.
- City tiers are mapped based on pincodes (e.g., Bengaluru: Tier1, Bhopal: Tier2, Jabalpur: Tier3).
- The system uses a weighted scoring model for persona matching (weights: city=0.15, gender=0.2, brand=0.3, generic=0.2, category=0.15).

## Limitations

- Requires pre-existing product and category data in the database.
- Assumes valid pincode-to-city mappings; invalid pincodes may skip users.
- OpenSearch queries may need tuning for performance with large datasets.
- Dummy data generation (`insertUserDummy.js`) may need adjustment for specific use cases.

## Future Improvements

- Add support for real-time data streaming.
- Implement vector-based similarity search for personas (uncomment `vector` field in `createSchema.js`).
- Enhance error handling for missing product details.
- Optimize database queries for larger datasets.
- Address field limit issues in OpenSearch by optimizing schema or integrating vector search (e.g., Faiss) for scalability, as discussed previously.
