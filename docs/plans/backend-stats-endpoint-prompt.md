# Backend Engineer Task: Implement Catalog Statistics API Endpoint

## 🎯 Mission

You are tasked with implementing a `/stats` API endpoint for the Varekatalog (Norwegian building supplies catalog) system. This endpoint will provide real-time statistics about the product catalog to power a welcome screen dashboard on the frontend.

**CRITICAL**: You have no prior knowledge of this system. This document provides all necessary context.

---

## 🏗️ System Architecture Overview

### Business Context
- **Company**: E.A. Smith (building supplies retailer)
- **Client**: Byggern (Norwegian retail chain)
- **Purpose**: Digital product catalog for warehouse employees
- **Data Source**: Løvenskiold Logistikk (supplier via SFTP)
- **Language**: Norwegian (Bokmål)
- **Users**: Warehouse employees checking stock levels and prices

### AWS Infrastructure (Verified September 2025)

**Accounts**:
- **PROD**: 785105558045
- **DEV**: 852634887748
- **Region**: eu-west-1

**Core Components**:
```yaml
API Gateway:
  PROD: varekatalog-api-prod (17lf5fwwik.execute-api.eu-west-1.amazonaws.com)
  DEV: varekatalog-api-dev (28svlvit82.execute-api.eu-west-1.amazonaws.com)

DynamoDB:
  Table: eas-varekatalog-products-{env}
  Items: 9,376 products (PROD), 9,275 products (DEV)
  Size: 6.7MB
  Billing: PAY_PER_REQUEST

OpenSearch:
  PROD: eas-prod-varekatalog (OpenSearch 3.1, 30GB)
  DEV: eas-dev-varekatalog (OpenSearch 3.1, 30GB)
  Index: eas-varekatalog-products

Lambda Functions (5 total):
  - varekatalog-search-api-{env}: 512MB, nodejs22.x, 30s
  - varekatalog-file-processor-{env}: 1024MB, python3.12, 300s
  - varekatalog-dynamodb-sync-{env}: 1024MB, nodejs22.x, 300s
  - varekatalog-index-setup-{env}: 512MB, nodejs22.x, 60s
  - varekatalog-sftp-collector-{env}: 512MB, nodejs22.x, 180s

Current API Endpoints:
  POST /search
  GET /products/{id}
  GET /products/{id}/prices
  GET /products/{id}/inventory
  GET /health
```

### Data Model (25 fields per product)
```json
{
  "vvsnr": "54327454",                           // VVS product number (8 digits)
  "produktNavn": "Multislipepapir 40k sta31432 5 ark",
  "produktBeskrivelse": "<p>STANLEY multislipepapir...</p>",
  "lagerantall": 80,                             // Stock quantity
  "grunnpris": 3226,                             // Base price (øre)
  "nettopris": 2581,                             // Net price (øre)
  "hovedgruppe": "50",                           // Main category
  "undergruppe": "196",                          // Subcategory
  "artikkelgruppe": "196",                       // Article group
  "leverandørNavn": "STANLEY",                   // Supplier name
  "produsentNr": "154768",
  "EAN": "5035048374535",
  "LHNummer": "0000003068866",
  "lh": "3068866",
  "enhet": "STK",
  "uom": "STK",
  "pakningAntall": 5,
  "antallIPakning": 5,
  "kanAnbrekke": "",                             // Partial quantity ("Ja"/"Nei"/empty)
  "dataCompleteness": 93,
  "updatedAt": 1758327031840,                    // Timestamp (epoch milliseconds)
  "lastFileProcessed": "price"                   // Last update type
}
```

### Data Flow
```
SFTP Updates: EventBridge → SFTP Collector → Løvenskiold SFTP → S3 → File Processor → DynamoDB → Sync → OpenSearch
User Requests: Frontend → API Gateway → Search Lambda → DynamoDB/OpenSearch → Response
```

### Update Schedule
- **Full Stock Updates**: Daily at 03:30 UTC
- **Delta Updates**: Every 10 minutes, 07:00-17:00, Monday-Saturday
- **Price Updates**: As needed via manual file upload

---

## 🎯 Your Task: Implement `/stats` Endpoint

### Requirements

**Endpoint**: `GET /stats`
**Authentication**: Public (no authentication required)
**Response Format**: JSON
**Timeout**: < 2 seconds
**Caching**: 5-15 minutes

### Required Statistics Response

```typescript
interface CatalogStats {
  // Core Counts
  totalProducts: number;        // Total items in DynamoDB
  totalCategories: number;      // Unique count of hovedgruppe values
  totalSuppliers: number;       // Unique count of leverandørNavn values

  // Update Timestamps (ISO 8601)
  lastStockUpdate: string;      // When lagerantall was last updated
  lastPriceUpdate: string;      // When prices were last updated

  // Recent Activity
  recentAdditions: number;      // Products added in last 7 days
}
```

**Example Response**:
```json
{
  "totalProducts": 9376,
  "totalCategories": 127,
  "totalSuppliers": 43,
  "lastStockUpdate": "2025-01-07T14:30:00Z",
  "lastPriceUpdate": "2025-01-06T22:00:00Z",
  "recentAdditions": 47
}
```

---

## 📁 Implementation Location

### Repository Structure
```
/home/rydesp/dev/easmith-varekatalog-backend/
├── src/lambdas/search-api/           # ← MODIFY THIS LAMBDA
│   ├── src/
│   │   ├── index.ts                  # Main handler (add /stats route)
│   │   ├── types.ts                  # Add CatalogStats interface
│   │   ├── health.ts                 # Health check handler
│   │   ├── oauth-middleware.ts       # Authentication middleware
│   │   └── search-query-implementation.ts
│   ├── package.json
│   └── tsconfig.json
├── infrastructure/
│   ├── aws-sam/template.yaml         # SAM template
│   └── cloudformation/               # CloudFormation templates
└── docs/architecture/                # Architecture documentation
```

### Why search-api Lambda?
- Already handles API Gateway routes (/search, /products, /health)
- Has access to DynamoDB and OpenSearch
- Uses Node.js 22.x runtime
- Already has TypeScript setup and OAuth middleware
- No new infrastructure needed

---

## 🔧 Step-by-Step Implementation

### Step 1: Add Route Handler to Main Lambda

**File**: `/home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api/src/index.ts`

Find the route handling section (around line 66) and add the stats route:

```typescript
// Add this import at the top
import { handleStats } from './stats-handler';

// In the main handler function, add this route:
if (path === '/stats' && method === 'GET') {
  return await handleStats(event, authContext);
}
```

### Step 2: Create Stats Handler

**File**: `/home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api/src/stats-handler.ts`

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { createAPIResponse, AuthContext } from './oauth-middleware';
import { CatalogStats } from './types';

// Initialize clients (reuse from index.ts pattern)
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-west-1'
});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBClient);

const opensearchClient = new Client({
  ...AwsSigv4Signer({
    region: process.env.AWS_REGION || 'eu-west-1',
    service: 'es'
  }),
  node: `https://${process.env.OPENSEARCH_DOMAIN}`
});

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || '';
const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX || 'eas-varekatalog-products';

export async function handleStats(
  event: APIGatewayProxyEvent,
  authContext: AuthContext
): Promise<APIGatewayProxyResult> {
  try {
    console.log('Stats API request received');

    const stats = await collectCatalogStats();

    return createAPIResponse(200, stats, authContext);
  } catch (error) {
    console.error('Stats API Error:', error);
    return createAPIResponse(500, {
      error: 'Failed to retrieve catalog statistics',
      message: (error as Error).message
    }, authContext);
  }
}

async function collectCatalogStats(): Promise<CatalogStats> {
  console.log('Collecting catalog statistics...');

  // Run all queries in parallel for performance
  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    updateTimestamps,
    recentAdditions
  ] = await Promise.all([
    getTotalProducts(),
    getTotalCategories(),
    getTotalSuppliers(),
    getLastUpdateTimestamps(),
    getRecentAdditions()
  ]);

  const stats: CatalogStats = {
    totalProducts,
    totalCategories,
    totalSuppliers,
    lastStockUpdate: updateTimestamps.lastStockUpdate,
    lastPriceUpdate: updateTimestamps.lastPriceUpdate,
    recentAdditions
  };

  console.log('Catalog statistics collected:', stats);
  return stats;
}

async function getTotalProducts(): Promise<number> {
  try {
    // Use OpenSearch count for performance
    const response = await opensearchClient.count({
      index: OPENSEARCH_INDEX
    });
    return response.body.count;
  } catch (error) {
    console.warn('OpenSearch count failed, falling back to DynamoDB:', error);

    // Fallback to DynamoDB scan with count only
    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE,
      Select: 'COUNT'
    });

    const response = await dynamodb.send(command);
    return response.Count || 0;
  }
}

async function getTotalCategories(): Promise<number> {
  try {
    const response = await opensearchClient.search({
      index: OPENSEARCH_INDEX,
      body: {
        size: 0,
        aggs: {
          unique_categories: {
            cardinality: {
              field: 'hovedgruppe.keyword'
            }
          }
        }
      }
    });

    return response.body.aggregations.unique_categories.value;
  } catch (error) {
    console.warn('Categories aggregation failed:', error);
    return 0; // Graceful fallback
  }
}

async function getTotalSuppliers(): Promise<number> {
  try {
    const response = await opensearchClient.search({
      index: OPENSEARCH_INDEX,
      body: {
        size: 0,
        aggs: {
          unique_suppliers: {
            cardinality: {
              field: 'leverandørNavn.keyword'
            }
          }
        }
      }
    });

    return response.body.aggregations.unique_suppliers.value;
  } catch (error) {
    console.warn('Suppliers aggregation failed:', error);
    return 0; // Graceful fallback
  }
}

async function getLastUpdateTimestamps(): Promise<{
  lastStockUpdate: string;
  lastPriceUpdate: string;
}> {
  try {
    // Query for the most recent stock update
    const stockQuery = await opensearchClient.search({
      index: OPENSEARCH_INDEX,
      body: {
        size: 1,
        sort: [{ "updatedAt": { "order": "desc" } }],
        query: {
          term: { "lastFileProcessed": "stock" }
        },
        _source: ["updatedAt"]
      }
    });

    // Query for the most recent price update
    const priceQuery = await opensearchClient.search({
      index: OPENSEARCH_INDEX,
      body: {
        size: 1,
        sort: [{ "updatedAt": { "order": "desc" } }],
        query: {
          term: { "lastFileProcessed": "price" }
        },
        _source: ["updatedAt"]
      }
    });

    const stockHit = stockQuery.body.hits.hits[0];
    const priceHit = priceQuery.body.hits.hits[0];

    const lastStockUpdate = stockHit ?
      new Date(stockHit._source.updatedAt).toISOString() :
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Default to 24h ago

    const lastPriceUpdate = priceHit ?
      new Date(priceHit._source.updatedAt).toISOString() :
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 7 days ago

    return { lastStockUpdate, lastPriceUpdate };
  } catch (error) {
    console.warn('Update timestamps query failed:', error);
    return {
      lastStockUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastPriceUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

async function getRecentAdditions(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const response = await opensearchClient.search({
      index: OPENSEARCH_INDEX,
      body: {
        size: 0,
        query: {
          range: {
            "updatedAt": {
              "gte": sevenDaysAgo.getTime()
            }
          }
        }
      }
    });

    return response.body.hits.total.value;
  } catch (error) {
    console.warn('Recent additions query failed:', error);
    return 0;
  }
}
```

### Step 3: Add Type Definitions

**File**: `/home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api/src/types.ts`

Add this interface to the existing types file:

```typescript
export interface CatalogStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lastStockUpdate: string;   // ISO 8601
  lastPriceUpdate: string;   // ISO 8601
  recentAdditions: number;
}
```

### Step 4: Add Caching (Performance Optimization)

For production performance, consider adding a simple caching layer using DynamoDB:

**Optional Enhancement**: Create a metadata table to cache stats for 5-15 minutes:

```typescript
// Add to stats-handler.ts
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function getCachedStats(): Promise<CatalogStats | null> {
  try {
    const command = new GetCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { PK: 'METADATA', SK: 'CATALOG_STATS' }
    });

    const response = await dynamodb.send(command);
    const item = response.Item;

    if (item && item.expiresAt && item.expiresAt > Date.now()) {
      return item.stats as CatalogStats;
    }

    return null;
  } catch (error) {
    console.warn('Cache read failed:', error);
    return null;
  }
}

async function setCachedStats(stats: CatalogStats): Promise<void> {
  try {
    const command = new PutCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        PK: 'METADATA',
        SK: 'CATALOG_STATS',
        stats,
        expiresAt: Date.now() + CACHE_TTL,
        updatedAt: Date.now()
      }
    });

    await dynamodb.send(command);
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
}
```

---

## 🧪 Testing Requirements

### Unit Tests

Create test file: `/home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api/__tests__/stats-handler.test.ts`

```typescript
import { handleStats } from '../src/stats-handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Stats Handler', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    path: '/stats',
    httpMethod: 'GET'
  };

  const mockAuthContext = {
    isAuthenticated: false,
    scopes: [],
    user: null
  };

  it('should return all required statistics fields', async () => {
    const response = await handleStats(mockEvent as APIGatewayProxyEvent, mockAuthContext);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty('totalProducts');
    expect(body).toHaveProperty('totalCategories');
    expect(body).toHaveProperty('totalSuppliers');
    expect(body).toHaveProperty('lastStockUpdate');
    expect(body).toHaveProperty('lastPriceUpdate');
    expect(body).toHaveProperty('recentAdditions');
  });

  it('should return valid ISO timestamps', async () => {
    const response = await handleStats(mockEvent as APIGatewayProxyEvent, mockAuthContext);
    const body = JSON.parse(response.body);

    expect(new Date(body.lastStockUpdate).toISOString()).toBe(body.lastStockUpdate);
    expect(new Date(body.lastPriceUpdate).toISOString()).toBe(body.lastPriceUpdate);
  });

  it('should return numbers for all count fields', async () => {
    const response = await handleStats(mockEvent as APIGatewayProxyEvent, mockAuthContext);
    const body = JSON.parse(response.body);

    expect(typeof body.totalProducts).toBe('number');
    expect(typeof body.totalCategories).toBe('number');
    expect(typeof body.totalSuppliers).toBe('number');
    expect(typeof body.recentAdditions).toBe('number');
  });
});
```

### Integration Testing

**Test DEV endpoint after deployment**:
```bash
# Test the deployed endpoint
curl -X GET https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev/stats

# Expected response format:
{
  "totalProducts": 9275,
  "totalCategories": 127,
  "totalSuppliers": 43,
  "lastStockUpdate": "2025-01-07T14:30:00Z",
  "lastPriceUpdate": "2025-01-06T22:00:00Z",
  "recentAdditions": 47
}
```

**Performance Testing**:
```bash
# Test response time (should be < 2 seconds)
time curl -X GET https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev/stats

# Test multiple requests to verify caching
for i in {1..5}; do
  curl -w "%{time_total}s\n" -o /dev/null -s \
    https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev/stats
done
```

---

## 🚀 Deployment Instructions

### Build and Deploy

```bash
# Navigate to the search-api directory
cd /home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api

# Install dependencies (if not already done)
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Deploy to DEV environment
# (Use existing deployment script - check with system admin)
cd /home/rydesp/dev/easmith-varekatalog-backend
./infrastructure/cloudformation/deploy.sh dev

# Or use SAM if that's the deployment method:
sam build
sam deploy --config-env dev
```

### Environment Variables

The Lambda already has these required environment variables:
- `PRODUCTS_TABLE`: eas-varekatalog-products-{env}
- `OPENSEARCH_DOMAIN`: OpenSearch endpoint URL
- `OPENSEARCH_INDEX`: eas-varekatalog-products
- `AWS_REGION`: eu-west-1

### IAM Permissions

The search-api Lambda already has the required permissions:
- `dynamodb:Scan` on products table
- `dynamodb:GetItem` on products table
- `es:ESHttpGet` on OpenSearch domain
- `es:ESHttpPost` on OpenSearch domain

---

## ✅ Success Criteria

**Functional Requirements**:
- ✅ Endpoint responds at `GET /stats`
- ✅ Returns all 6 required statistics fields
- ✅ Timestamps are valid ISO 8601 format
- ✅ Numbers match actual database counts
- ✅ CORS headers allow frontend access

**Performance Requirements**:
- ✅ Response time < 2 seconds
- ✅ Handles concurrent requests without errors
- ✅ Caching improves subsequent request performance

**Quality Requirements**:
- ✅ Error handling returns graceful 500 responses
- ✅ Unit tests achieve >80% code coverage
- ✅ Integration tests pass in DEV environment
- ✅ Code follows existing TypeScript patterns

---

## 🐛 Troubleshooting

### Common Issues

**OpenSearch Connection Fails**:
- Check OPENSEARCH_DOMAIN environment variable
- Verify Lambda IAM permissions for OpenSearch
- Test with direct DynamoDB fallback

**High Response Times**:
- Implement caching layer
- Use OpenSearch count() instead of DynamoDB scan
- Run queries in parallel with Promise.all()

**Timestamp Queries Fail**:
- Verify lastFileProcessed field exists in data
- Check updatedAt field format (epoch milliseconds)
- Implement graceful fallbacks with reasonable defaults

**Aggregation Errors**:
- Ensure .keyword fields exist for text aggregations
- Verify OpenSearch mapping includes required fields
- Add try-catch blocks with fallback values

### Debug Commands

```bash
# Check Lambda logs
aws logs tail /aws/lambda/varekatalog-search-api-dev --follow --profile dev

# Test OpenSearch directly
aws opensearch describe-domain --domain-name eas-dev-varekatalog --profile dev

# Check DynamoDB item count
aws dynamodb scan --table-name eas-varekatalog-products-dev --select COUNT --profile dev
```

---

## 📞 Support Contacts

**For System Architecture Questions**: Check repository documentation
**For AWS Infrastructure Issues**: Use existing deployment scripts
**For OpenSearch Queries**: Reference existing search-api implementation
**For Emergency Issues**: Check CloudWatch logs first

---

*This task is part of implementing a catalog statistics welcome screen for the frontend. The frontend team is waiting for this backend endpoint to be completed before they can proceed with their implementation.*

**Priority**: High
**Timeline**: 2-3 days
**Dependencies**: None (all required infrastructure exists)