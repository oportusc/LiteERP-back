// Test script para verificar GraphQL
const fetch = require('node-fetch');

async function testGraphQL() {
  try {
    // Test introspection query
    const introspectionQuery = {
      query: `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `
    };

    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(introspectionQuery),
    });

    const data = await response.json();
    console.log('GraphQL Schema Types:');
    console.log(data.data.__schema.types.map(t => t.name).filter(name => !name.startsWith('__')).slice(0, 10));
    
    // Test register mutation
    const registerMutation = {
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            access_token
            user {
              id
              email
              name
              role
              companies
            }
          }
        }
      `,
      variables: {
        input: {
          name: "Test User GraphQL",
          email: "test-graphql@example.com",
          password: "password123"
        }
      }
    };

    console.log('\nTesting Register Mutation...');
    const registerResponse = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerMutation),
    });

    const registerData = await registerResponse.json();
    if (registerData.errors) {
      console.log('Register errors:', registerData.errors);
    } else {
      console.log('Register successful:', registerData.data.register.user.email);
    }

  } catch (error) {
    console.error('Error testing GraphQL:', error.message);
  }
}

testGraphQL();
