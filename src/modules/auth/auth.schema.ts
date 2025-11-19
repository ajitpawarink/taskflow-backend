export const authType = `#graphql

extend type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
}

extend type Query {
  me: User
}

type AuthPayload {
  token: String!
  user: User!
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

`;
