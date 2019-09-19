export interface IOptions {
  exclude?: string | string[]
  include?: string[]
}

export function canonicalizeEx(obj: any, options?: IOptions) {
  let buffer = ''
  const vInclude = options && options.include
  let vExclude = options && options.exclude
  if (vExclude) {
    if (typeof vExclude === 'string') vExclude = [vExclude]
  }
  if (vInclude) vInclude.sort()

  serialize(obj)

  return buffer

  function serialize(object: any, parent?: object) {
    if (
      object === null ||
      typeof object !== 'object' ||
      object.toJSON != null
    ) {
      /////////////////////////////////////////////////
      // Primitive data type - Use ES6/JSON          //
      /////////////////////////////////////////////////
      buffer += JSON.stringify(object)

      // } else if (object instanceof Date) {
      //   buffer += JSON.stringify(object);
    } else if (Array.isArray(object)) {
      /////////////////////////////////////////////////
      // Array - Maintain element order              //
      /////////////////////////////////////////////////
      buffer += '['
      let next = false
      object.forEach((element) => {
        if (next) {
          buffer += ','
        }
        next = true
        /////////////////////////////////////////
        // Array element - Recursive expansion //
        /////////////////////////////////////////
        serialize(element, object)
      })
      buffer += ']'
    } else {
      /////////////////////////////////////////////////
      // Object - Sort properties before serializing //
      /////////////////////////////////////////////////
      buffer += '{'
      if (!parent && vInclude) {
        vInclude.forEach((property, index) => {
          if (!object.hasOwnProperty(property)) return
          addProp(object, property, index)
        })
      } else {
        const vKeys = Object.keys(object).sort()
        vKeys.forEach((property, index) => addProp(object, property, index))
      }
      buffer += '}'
    }
  }

  function addProp(object: any, property: string, index: number) {
    if (vExclude && vExclude.length) {
      for (const v of vExclude) {
        if (v === property) return
      }
    }
    if (index > 0) {
      buffer += ','
    }
    ///////////////////////////////////////////////
    // Property names are strings - Use ES6/JSON //
    ///////////////////////////////////////////////
    buffer += JSON.stringify(property)
    buffer += ':'
    //////////////////////////////////////////
    // Property value - Recursive expansion //
    //////////////////////////////////////////
    serialize(object[property], object)
  }
}
