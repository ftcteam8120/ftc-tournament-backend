import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

/*
 * Resolver for the custom date type
 */
export const dateScalarResolver = new GraphQLScalarType({
  name: 'Date',
  description: 'The Date scalar type represents date and time values provided by any of the compatible JavaScript date formats',
  parseValue(value: any) {
    // Parse existing values into a JavaScript Date object
    return new Date(value);
  },
  serialize(value: any) {
    // Serialize date values as ISO strings
    return new Date(value).toDateString();
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
        // Parse the value as an integer if it has an int type  
        return parseInt(ast.value, 10);
      case Kind.STRING:
        // Return if it is already a string  
        return ast.value;
    }
    // Otherwise return null
    return null;
  },
});

