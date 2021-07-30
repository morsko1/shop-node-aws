import { basicAuthorizer } from '../handler';

const allowResponse = {
  "principalId": "*",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Allow",
        "Resource": "ARN"
      }
    ]
  }
};

const denyResponse = {
  "principalId": "*",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Deny",
        "Resource": "ARN"
      }
    ]
  }
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

beforeEach(() => {
  process.env = {
    ...process.env,
    TEST_USER: 'TEST_PASSWORD'
  };
});

describe('basicAuthorizer', () => {

  test('basicAuthorizer: allow', async () => {
    const res = await basicAuthorizer({"authorizationToken": "Basic VEVTVF9VU0VSOlRFU1RfUEFTU1dPUkQ=", "methodArn": "ARN"});
    expect(res).toEqual(allowResponse);
  });
  
  test('basicAuthorizer: deny', async () => {
    const res = await basicAuthorizer({"authorizationToken": "Basic FEVTVF9VU0VSOlRFU1RfUEFTU1dPUkQ=", "methodArn": "ARN"});
    expect(res).toEqual(denyResponse);
  });

  test('basicAuthorizer: failure', async () => {
    const res = await basicAuthorizer({});
    expect(res).toEqual(failureResponse);
  });

});
