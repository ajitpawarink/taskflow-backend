export const userType = `#graphql

type User {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
}

extend type Query {
  users: [User!]  # or remove if not needed
}

`;
