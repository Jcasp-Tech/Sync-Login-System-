const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;

const apiEndpoints = {
  name: "Authentication Service API",
  version: "v1",
  client: {
    name: "Client API",
    basePath: "/api/v1/client/auth",
    endpoints: [
      {
        name: "Register",
        endpoint: "/api/v1/client/auth/register",
        curl: `curl -X POST ${baseUrl}/api/v1/client/auth/register -H "Content-Type: application/json" -d '{"full_name":"John Doe","position_title":"Software Engineer","email_address":"john.doe@example.com","phone_no":"+1234567890","industry":"Technology","password":"SecurePass123"}'`
      },
      {
        name: "Login",
        endpoint: "/api/v1/client/auth/login",
        curl: `curl -X POST ${baseUrl}/api/v1/client/auth/login -H "Content-Type: application/json" -d '{"email":"john.doe@example.com","password":"SecurePass123"}'`
      },
      {
        name: "Refresh Token",
        endpoint: "/api/v1/client/auth/refresh",
        curl: `curl -X POST ${baseUrl}/api/v1/client/auth/refresh -H "Content-Type: application/json" -d '{"accessToken":"your_access_token_here"}'`
      },
      {
        name: "Logout",
        endpoint: "/api/v1/client/auth/logout",
        curl: `curl -X POST ${baseUrl}/api/v1/client/auth/logout -H "Content-Type: application/json" -H "Authorization: Bearer your_access_token_here" -d '{"refreshToken":"your_refresh_token_here"}'`
      },
      {
        name: "Generate API Access Key",
        endpoint: "/api/v1/client/auth/api-clients",
        curl: `curl -X POST ${baseUrl}/api/v1/client/auth/api-clients -H "Content-Type: application/json" -H "Authorization: Bearer your_access_token_here" -d '{"environment":"live","rate_limit":1000}'`
      },
      {
        name: "List API Access Keys",
        endpoint: "/api/v1/client/auth/api-clients",
        curl: `curl -X GET ${baseUrl}/api/v1/client/auth/api-clients -H "Authorization: Bearer your_access_token_here"`
      },
      {
        name: "Revoke API Access Key",
        endpoint: "/api/v1/client/auth/api-clients/:access_key_id",
        curl: `curl -X DELETE ${baseUrl}/api/v1/client/auth/api-clients/ak_live_your_key_here -H "Authorization: Bearer your_access_token_here"`
      }
    ]
  },
  service: {
    name: "Service API",
    basePath: "/api/v1/service/auth",
    endpoints: [
      {
        note: "Service API endpoints will be available in future releases"
      }
    ]
  }
};

module.exports = apiEndpoints;
