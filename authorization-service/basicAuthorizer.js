const basicAuthorizer = async (event) => {
  try {
    console.log('basicAuthorizer event: ', event);
    const token = event.authorizationToken.split(' ')[1];
    console.log('token = ', token);
    const tokenDecoded = Buffer.from(token, 'base64').toString('utf-8');
    console.log('tokenDecoded = ', tokenDecoded);
    const [userName, password] = tokenDecoded.split(':');
    console.log('userName = ', userName);
    console.log('password = ', password);

    const effect = userName in process.env && process.env[userName] === password ? 'Allow' : 'Deny';
    console.log('effect = ', effect);

    return {
      "principalId": "*",
      "policyDocument": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Action": "execute-api:Invoke",
            "Effect": effect,
            "Resource": event.methodArn
          }
        ]
      }
    };
  } catch (error) {
    console.log('basicAuthorizer error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

export default basicAuthorizer;
