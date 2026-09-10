export interface ISerializeOptions {
  allowCircular?: boolean;
  include?: string[];
  exclude?: string | string[];
  filterUndefined?: boolean;
  undefinedInArrayToNull?: boolean;
  /**
   * If `true`, any `undefined` value participating in the canonicalization
   * (the root input, object property values, array elements) terminates with
   * an error instead of being filtered, converted or emitted. Takes
   * precedence over `filterUndefined` and `undefinedInArrayToNull`.
   * Properties excluded via `exclude` are not validated, just like any other
   * value inside them. This is the most RFC 8785-faithful behavior:
   * `undefined` does not exist in the JSON data model (RFC 8259) and the RFC
   * constrains input to I-JSON, so strictly it is invalid input - handled the
   * same way as NaN/Infinity (RFC 8785 §3.2.2.3).
   */
  strictUndefined?: boolean;
}

const CircularRootPathName = '$';

export function _serialize(obj: any, options?: ISerializeOptions) {
  let buffer = '';
  const vInclude = options && options.include;
  let vExclude = options && options.exclude;
  if (vExclude) {
    if (typeof vExclude === 'string') vExclude = [vExclude];
  }
  if (vInclude) vInclude.sort();

  const visited = new WeakMap<object, string>();
  const allowCircular = options && options.allowCircular;
  const filterUndefined = options && options.filterUndefined;
  const undefinedInArrayToNull = options && options.undefinedInArrayToNull;
  const strictUndefined = options && options.strictUndefined;

  serialize(obj, CircularRootPathName);

  return buffer;

  function serialize(object: any, path: string) {
    if (strictUndefined && object === undefined) {
      throw new Error(
        `undefined is not permitted in JSON at "${path}" (strictUndefined)`
      );
    }
    if (
      object === null ||
      typeof object !== 'object' ||
      object.toJSON != null
    ) {
      /////////////////////////////////////////////////
      // Primitive data type - Use ES6/JSON          //
      /////////////////////////////////////////////////
      if (typeof object === 'number' && !Number.isFinite(object)) {
        throw new Error(
          `Non-finite number (${object}) is not permitted in JSON (RFC 8785 §3.2.2.3)`
        );
      }
      buffer += JSON.stringify(object);

    } else if (Array.isArray(object)) {
      /////////////////////////////////////////////////
      // Array - Maintain element order              //
      /////////////////////////////////////////////////
      const visitedPath = visited.get(object);
      if (visitedPath !== undefined) {
        if (path.startsWith(visitedPath)) {
          if (!allowCircular) {
            throw new Error('Circular reference detected');
          }
          buffer += '"[Circular:' + visitedPath + ']"';

          return;
        }
      }
      visited.set(object, path);

      buffer += '[';
      let next = false;
      object.forEach((element, index) => {
        if (next) {
          buffer += ',';
        }
        next = true;
        if (element === undefined && strictUndefined) {
          throw new Error(
            `undefined is not permitted in JSON at "${path}[${index}]" (strictUndefined)`
          );
        }
        if (undefinedInArrayToNull && element === undefined) {
          element = null;
        }
        /////////////////////////////////////////
        // Array element - Recursive expansion //
        /////////////////////////////////////////
        serialize(element, `${path}[${index}]`);
      });
      buffer += ']';
    } else {
      /////////////////////////////////////////////////
      // Object - Sort properties before serializing //
      /////////////////////////////////////////////////
      const visitedPath = visited.get(object);
      if (visitedPath !== undefined) {
        if (path.startsWith(visitedPath)) {
          if (!allowCircular) {
            throw new Error('Circular reference detected');
          }
          buffer += '"[Circular:' + visitedPath + ']"';

          return;
        }
      }
      visited.set(object, path);

      buffer += '{';
      let next = false;

      const addProp = (property: string) => {
        if (vExclude && (vExclude as string[]).includes(property)) {
          return;
        }

        if (strictUndefined && object[property] === undefined) {
          throw new Error(
            `undefined is not permitted in JSON at "${path}.${property}" (strictUndefined)`
          );
        }

        if (next) {
          buffer += ',';
        }
        next = true;
        ///////////////////////////////////////////////
        // Property names are strings - Use ES6/JSON //
        ///////////////////////////////////////////////
        buffer += JSON.stringify(property);
        buffer += ':';
        //////////////////////////////////////////
        // Property value - Recursive expansion //
        //////////////////////////////////////////
        serialize(object[property], `${path}.${property}`);
      };

      if (path === CircularRootPathName && vInclude) {
        vInclude.forEach((property) => {
          if (object.hasOwnProperty(property)) {
            addProp(property);
          }
        });
      } else {
        let vKeys = Object.keys(object);
        // strictUndefined must see `undefined` properties itself, so do not
        // filter them out beforehand (it throws on them in `addProp`).
        if (filterUndefined && !strictUndefined) {
          vKeys = vKeys.filter((k) => object[k] !== undefined);
        }
        vKeys.sort();
        vKeys.forEach((property) => {
          addProp(property);
        });
      }
      buffer += '}';
    }
  }
}
