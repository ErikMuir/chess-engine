/* eslint-disable camelcase */
import Logger from '../Logger';
import SchemaUtil_0_0_1 from './SchemaUtil_0_0_1';
import SchemaUtil_1_0_0 from './SchemaUtil_1_0_0';

const logger = new Logger('schemaHelpers');

const getStandardizedGameJson = (gameJson = {}) => {
  logger.trace('getStandardizedGameJson');
  const { schema } = gameJson;
  switch (schema) {
    case '0.0.1': return SchemaUtil_0_0_1.standardize(gameJson);
    case '1.0.0': return SchemaUtil_1_0_0.standardize(gameJson);
    default: throw new Error('Invalid game json');
  }
};

export { getStandardizedGameJson };
