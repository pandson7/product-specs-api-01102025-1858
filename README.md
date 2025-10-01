# Product Specifications API

A serverless REST API built with AWS CDK that provides access to product specifications stored in a flexible JSON format.

## Architecture

The API is built using AWS serverless services:

- **Amazon DynamoDB**: NoSQL database for storing product specifications
- **AWS Lambda**: Serverless compute for API logic
- **Amazon API Gateway**: REST API endpoint management
- **AWS CDK**: Infrastructure as Code

## API Endpoints

### Base URL
```
https://ahffv8v919.execute-api.us-east-1.amazonaws.com/prod/
```

### Endpoints

#### GET /products
Retrieve all product specifications.

**Response**: Array of product objects
```json
[
  {
    "productId": "prod-001",
    "productName": "iPhone 15 Pro",
    "category": "Electronics",
    "brand": "Apple",
    "specifications": {
      "color": "Natural Titanium",
      "storage": "256GB",
      "display": "6.1-inch Super Retina XDR",
      "camera": "48MP Main",
      "weight": 187,
      "dimensions": {
        "length": 146.6,
        "width": 70.6,
        "height": 8.25
      }
    },
    "createdAt": "2025-10-01T23:07:55.482Z",
    "updatedAt": "2025-10-01T23:07:55.482Z"
  }
]
```

#### GET /products/{productId}
Retrieve a specific product by ID.

**Parameters**:
- `productId` (path): The unique identifier of the product

**Response**: Single product object or error
```json
{
  "productId": "prod-001",
  "productName": "iPhone 15 Pro",
  "category": "Electronics",
  "brand": "Apple",
  "specifications": {
    "color": "Natural Titanium",
    "storage": "256GB",
    "display": "6.1-inch Super Retina XDR",
    "camera": "48MP Main",
    "weight": 187,
    "dimensions": {
      "length": 146.6,
      "width": 70.6,
      "height": 8.25
    }
  },
  "createdAt": "2025-10-01T23:07:55.482Z",
  "updatedAt": "2025-10-01T23:07:55.482Z"
}
```

**Error Response** (404):
```json
{
  "error": "Product not found"
}
```

## Sample Data

The API comes pre-populated with sample product data including:

1. **iPhone 15 Pro** (Electronics/Apple)
2. **MacBook Air M3** (Computers/Apple)
3. **Galaxy S24 Ultra** (Electronics/Samsung)
4. **AirPods Pro 2nd Gen** (Audio/Apple)
5. **ThinkPad X1 Carbon** (Computers/Lenovo)

## Testing the API

### Get all products
```bash
curl "https://ahffv8v919.execute-api.us-east-1.amazonaws.com/prod/products"
```

### Get specific product
```bash
curl "https://ahffv8v919.execute-api.us-east-1.amazonaws.com/prod/products/prod-001"
```

## Deployment

The infrastructure is deployed using AWS CDK:

```bash
cd cdk-app
npm install
npm run build
npx cdk deploy
```

## Project Structure

```
product-specs-api-01102025-1858/
├── specs/
│   ├── requirements.md      # User stories and acceptance criteria
│   ├── design.md           # Technical architecture and design
│   └── tasks.md            # Implementation tasks
├── cdk-app/                # CDK application
│   ├── lib/
│   │   └── cdk-app-stack.ts # Main CDK stack definition
│   ├── package.json
│   └── tsconfig.json
├── generated-diagrams/     # Architecture diagrams
│   └── product-specs-api-architecture.png
└── README.md              # This file
```

## Features

- **Flexible JSON Schema**: Supports varying product attributes without schema constraints
- **Serverless Architecture**: Scales automatically with demand
- **RESTful API**: Standard HTTP methods and status codes
- **CORS Enabled**: Supports cross-origin requests
- **Error Handling**: Proper HTTP status codes and error messages
- **Sample Data**: Pre-populated with diverse product examples

## AWS Resources Created

- DynamoDB Table: `product-specs-{timestamp}`
- Lambda Functions:
  - Get All Products Function
  - Get Product By ID Function
  - Data Seed Function
  - Seed Data Provider Function
- API Gateway REST API: `product-specs-api-{timestamp}`
- IAM Roles and Policies for Lambda execution
- CloudWatch Log Groups for monitoring