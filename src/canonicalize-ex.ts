import { type ISerializeOptions, _serialize } from './serializer';

/**
 * The extended canonicalization function, offering more granular control over the serialization process.
 *
 * Options are passed through to the serializer unmodified; only the options
 * actually present are applied (there are no defaults of its own).
 *
 * @param obj The JavaScript object to canonicalize.
 * @param options An object with the following properties:
 *  - `allowCircular` (boolean, optional): Same as in `canonicalize`.
 *  - `filterUndefined` (boolean, optional): If `true`, `undefined` values in objects will be filtered out.
 *  - `undefinedInArrayToNull` (boolean, optional): If `true`, `undefined` values in arrays will be converted to `null`.
 *  - `strictUndefined` (boolean, optional): If `true`, any `undefined` value terminates with an error (takes precedence over the two options above).
 *  - `include` (string[], optional): An array of property names to include in the canonicalization.
 *  - `exclude` (string[], optional): An array of property names to exclude from the canonicalization.
 * @returns The canonical string representation of the object.
 */
export function canonicalizeEx(obj: any, options?: ISerializeOptions) {
  return _serialize(obj, options);
}
