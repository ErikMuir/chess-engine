/**
 * Interface ISchemaUtil
 *
 * @class ISchemaUtil
 */
class ISchemaUtil {
  constructor() {
    if (this.constructor === ISchemaUtil) {
      throw new Error("Interfaces can't be instantiated.");
    }
  }

  static isValid() {
    throw new Error("Method 'isValid()' must be implemented.");
  }

  static standardize() {
    throw new Error("Method 'standardize()' must be implemented.");
  }
}

export default ISchemaUtil;
