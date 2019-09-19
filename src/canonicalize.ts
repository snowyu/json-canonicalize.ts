export function canonicalize(obj: any) {
  let buffer = ''

  serialize(obj)

  return buffer

  function serialize(object: any) {
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
        serialize(element)
      })
      buffer += ']'
    } else {
      /////////////////////////////////////////////////
      // Object - Sort properties before serializing //
      /////////////////////////////////////////////////
      buffer += '{'
      const vKeys = Object.keys(object).sort()
      vKeys.forEach((property, index) => addProp(object, property, index))
      buffer += '}'
    }
  }

  function addProp(object: any, property: string, index: number) {
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
    serialize(object[property])
  }
}
