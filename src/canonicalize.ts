export function canonicalize(obj: any, allowCircular?: boolean) {
  let buffer = ''

  const visited = new WeakMap<object, string>()

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
        if (element === undefined) {element = null}
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
      const vKeys = Object.keys(object).filter((k)=> object[k] !== undefined).sort()
      vKeys.forEach((property, index) => addProp(object, property, index, path))
      buffer += '}'
    }
  }

  function addProp(object: any, property: string, index: number, path: string) {
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
