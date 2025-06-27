export interface IOptions {
  exclude?: string | string[]
  include?: string[]
  allowCircular?: boolean
}

export function canonicalizeEx(obj: any, options?: IOptions) {
  let buffer = ''
  const vInclude = options && options.include
  let vExclude = options && options.exclude
  if (vExclude) {
    if (typeof vExclude === 'string') vExclude = [vExclude]
  }
  if (vInclude) vInclude.sort()

  const visited = new WeakMap<object, string>()
  const allowCircular = options && options?.allowCircular
  serialize(obj, '')

  return buffer

  function serialize(object: any, path: string) {
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
      const visitedPath = visited.get(object)
      if (visitedPath !== undefined) {
        if (path.startsWith(visitedPath)) {
          if (!allowCircular) {
            throw new Error('Circular reference detected')
          }
          buffer += '"[Circular]"'

          return
        }
      }
      visited.set(object, path)

      buffer += '['
      let next = false
      object.forEach((element, index) => {
        if (next) {
          buffer += ','
        }
        next = true
        /////////////////////////////////////////
        // Array element - Recursive expansion //
        /////////////////////////////////////////
        serialize(element, `${path}[${index}]`)
      })
      buffer += ']'
    } else {
      /////////////////////////////////////////////////
      // Object - Sort properties before serializing //
      /////////////////////////////////////////////////
      const visitedPath = visited.get(object)
      if (visitedPath !== undefined) {
        if (path.startsWith(visitedPath)) {
          if (!allowCircular) {
            throw new Error('Circular reference detected')
          }
          buffer += '"[Circular]"'

          return
        }
      }
      visited.set(object, path)

      buffer += '{'
      if (path === '' && vInclude) {
        vInclude.forEach((property, index) => {
          if (!object.hasOwnProperty(property)) return
          addProp(object, property, index, path)
        })
      } else {
        const vKeys = Object.keys(object).sort()
        vKeys.forEach((property, index) => addProp(object, property, index, path))
      }
      buffer += '}'
    }
  }

  function addProp(object: any, property: string, index: number, path: string) {
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
    serialize(object[property], `${path}.${property}`)
  }
}
