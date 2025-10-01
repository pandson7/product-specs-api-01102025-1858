import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for product specifications
    const productsTable = new dynamodb.Table(this, 'ProductSpecsTable', {
      tableName: `product-specs-${Date.now()}`,
      partitionKey: {
        name: 'productId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Lambda function to get all products
    const getAllProductsFunction = new lambda.Function(this, 'GetAllProductsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          try {
            const command = new ScanCommand({
              TableName: process.env.TABLE_NAME
            });
            
            const result = await docClient.send(command);
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify(result.Items || [])
            };
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Internal server error' })
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: productsTable.tableName
      }
    });

    // Lambda function to get product by ID
    const getProductByIdFunction = new lambda.Function(this, 'GetProductByIdFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          try {
            const productId = event.pathParameters?.id;
            
            if (!productId) {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Product ID is required' })
              };
            }

            const command = new GetCommand({
              TableName: process.env.TABLE_NAME,
              Key: { productId }
            });
            
            const result = await docClient.send(command);
            
            if (!result.Item) {
              return {
                statusCode: 404,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Product not found' })
              };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify(result.Item)
            };
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Internal server error' })
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: productsTable.tableName
      }
    });

    // Data seeder Lambda function
    const dataSeedFunction = new lambda.Function(this, 'DataSeedFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      timeout: cdk.Duration.minutes(5),
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        const sampleProducts = [
          {
            productId: 'prod-001',
            productName: 'iPhone 15 Pro',
            category: 'Electronics',
            brand: 'Apple',
            specifications: {
              color: 'Natural Titanium',
              storage: '256GB',
              display: '6.1-inch Super Retina XDR',
              camera: '48MP Main',
              weight: 187,
              dimensions: { length: 146.6, width: 70.6, height: 8.25 }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            productId: 'prod-002',
            productName: 'MacBook Air M3',
            category: 'Computers',
            brand: 'Apple',
            specifications: {
              color: 'Midnight',
              processor: 'Apple M3 chip',
              memory: '16GB',
              storage: '512GB SSD',
              display: '13.6-inch Liquid Retina',
              weight: 1.24,
              dimensions: { length: 304.1, width: 215, height: 11.3 }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            productId: 'prod-003',
            productName: 'Galaxy S24 Ultra',
            category: 'Electronics',
            brand: 'Samsung',
            specifications: {
              color: 'Titanium Black',
              storage: '512GB',
              display: '6.8-inch Dynamic AMOLED 2X',
              camera: '200MP Wide',
              battery: '5000mAh',
              weight: 232,
              dimensions: { length: 162.3, width: 79, height: 8.6 }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            productId: 'prod-004',
            productName: 'AirPods Pro 2nd Gen',
            category: 'Audio',
            brand: 'Apple',
            specifications: {
              color: 'White',
              connectivity: 'Bluetooth 5.3',
              batteryLife: '6 hours listening',
              features: ['Active Noise Cancellation', 'Spatial Audio', 'Adaptive Transparency'],
              weight: 5.3,
              chargingCase: 'MagSafe and Lightning'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            productId: 'prod-005',
            productName: 'ThinkPad X1 Carbon',
            category: 'Computers',
            brand: 'Lenovo',
            specifications: {
              color: 'Black',
              processor: 'Intel Core i7-1365U',
              memory: '32GB LPDDR5',
              storage: '1TB SSD',
              display: '14-inch WUXGA IPS',
              weight: 1.12,
              dimensions: { length: 315.6, width: 222.5, height: 15.36 }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        exports.handler = async (event) => {
          try {
            console.log('Starting data seeding...');
            
            for (const product of sampleProducts) {
              const command = new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: product
              });
              
              await docClient.send(command);
              console.log(\`Inserted product: \${product.productId}\`);
            }
            
            console.log('Data seeding completed successfully');
            return {
              statusCode: 200,
              body: JSON.stringify({ 
                message: 'Sample data seeded successfully',
                count: sampleProducts.length 
              })
            };
          } catch (error) {
            console.error('Error seeding data:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to seed data' })
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: productsTable.tableName
      }
    });

    // Grant DynamoDB permissions to Lambda functions
    productsTable.grantReadData(getAllProductsFunction);
    productsTable.grantReadData(getProductByIdFunction);
    productsTable.grantWriteData(dataSeedFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ProductSpecsApi', {
      restApiName: `product-specs-api-${Date.now()}`,
      description: 'API for accessing product specifications',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // API Gateway integrations
    const getAllProductsIntegration = new apigateway.LambdaIntegration(getAllProductsFunction);
    const getProductByIdIntegration = new apigateway.LambdaIntegration(getProductByIdFunction);

    // API routes
    const products = api.root.addResource('products');
    products.addMethod('GET', getAllProductsIntegration);
    
    const productById = products.addResource('{id}');
    productById.addMethod('GET', getProductByIdIntegration);

    // Custom resource to trigger data seeding
    const seedDataProvider = new lambda.Function(this, 'SeedDataProvider', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
        const lambda = new LambdaClient({});

        exports.handler = async (event) => {
          console.log('Custom resource event:', JSON.stringify(event, null, 2));
          
          if (event.RequestType === 'Create') {
            try {
              const command = new InvokeCommand({
                FunctionName: process.env.SEED_FUNCTION_NAME,
                InvocationType: 'RequestResponse'
              });
              
              const result = await lambda.send(command);
              console.log('Seed function result:', result);
              
              await sendResponse(event, 'SUCCESS', { message: 'Data seeded successfully' });
            } catch (error) {
              console.error('Error invoking seed function:', error);
              await sendResponse(event, 'FAILED', { error: error.message });
            }
          } else {
            await sendResponse(event, 'SUCCESS', { message: 'No action needed' });
          }
        };

        async function sendResponse(event, status, data) {
          const responseBody = JSON.stringify({
            Status: status,
            Reason: data.message || data.error,
            PhysicalResourceId: 'seed-data-' + Date.now(),
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            Data: data
          });

          const url = event.ResponseURL;
          const https = require('https');
          const { URL } = require('url');
          const parsedUrl = new URL(url);

          const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'PUT',
            headers: {
              'Content-Type': '',
              'Content-Length': responseBody.length
            }
          };

          return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
              console.log('Response status:', res.statusCode);
              resolve();
            });

            req.on('error', (err) => {
              console.error('Error sending response:', err);
              reject(err);
            });

            req.write(responseBody);
            req.end();
          });
        }
      `),
      environment: {
        SEED_FUNCTION_NAME: dataSeedFunction.functionName
      }
    });

    // Grant permission to invoke seed function
    dataSeedFunction.grantInvoke(seedDataProvider);

    // Custom resource to trigger data seeding on deployment
    new cdk.CustomResource(this, 'SeedDataResource', {
      serviceToken: seedDataProvider.functionArn
    });

    // Output the API endpoint
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'Product Specifications API endpoint'
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: productsTable.tableName,
      description: 'DynamoDB table name'
    });
  }
}