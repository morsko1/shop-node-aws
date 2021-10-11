# shop-node-aws

Serverless Node.js backend for [shop-react-redux-cloudfront](https://github.com/morsko1/shop-react-redux-cloudfront)

---  
### product-service:

##### getProductsList:  
Triggered by GET `/products` endpoint.  
Lambda returns all products from database.
[invoke](https://284w5ktc8h.execute-api.eu-west-1.amazonaws.com/dev/products)  

##### getProductsById:  

Triggered by GET `/products/{productId}` endpoint.  
Lambda returns specific product from database by id.
[invoke](https://284w5ktc8h.execute-api.eu-west-1.amazonaws.com/dev/products/ac88584b-a7d9-4bee-b7cf-295341f8931a)  

##### createProduct:  
Triggered by PUT `/products` endpoint.  
Lambda creates new product in database.

---  

### import-service:

##### importProductsFile
Triggered by GET `/import` endpoint.  
Lambda returns signed URL.

##### importFileParser
Triggered by the S3 `s3:ObjectCreated:*` event.
Lambda sends CSV records into SQS.

##### catalogBatchProcess
Triggered by SQS with maximum 5 messages at once.
Lambda function iterates over all SQS messages and creates corresponding products in the products table.
lambda also sends an email once it creates products or error occurs.

---  

### authorization-service:

##### basicAuthorizer:
Lambda should take Basic authorization_token, decode it and check that credentials provided by token exist in the lambda environment variable. This lambda should return 403 HTTP status if access is denied for this user (invalid authorization_token) and 401 HTTP status if Authorization header is not provided.
Lambda is applied to `/import` path of the `import-service`.

---  

### bff-service:

An Express application that listens for all requests and redirects those requests to the appropriate services based on variables provided by the `.env` file.
