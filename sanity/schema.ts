import { type SchemaTypeDefinition } from 'sanity'

import post from './schemaTypes/post'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post],
}
