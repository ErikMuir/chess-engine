const logLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

module.exports = class Logger {
  constructor(name) {
    this.name = name;
  }

  trace = (...data) => this.#log('trace', data);

  debug = (...data) => this.#log('debug', data);

  info = (...data) => this.#log('info', data);

  warn = (...data) => this.#log('warn', data);

  error = (...data) => this.#log('error', data);

  fatal = (...data) => this.#log('fatal', data);

  #log = (logType, data) => {
    if (logLevels[logType] < (logLevels[process.env.LOG_LEVEL] || logLevels.info)) {
      return;
    }
    const { message, error, categorizedData } = this.categorize(data);
    const logObject = {
      time: new Date().toISOString(),
      level: logType,
      logger: this.name,
      message,
      exception: error && error.stack,
      exceptionType: error && error.name,
      data: categorizedData,
    };
    const serializedLog = JSON.stringify(logObject, (k, v) => (v === null ? undefined : v));
    process.stdout.write(`${serializedLog}\n`);
  };

  categorize = (data) => {
    let message = '';
    let categorizedData = [];
    let error;
    data.forEach((d) => {
      switch (typeof d) {
        case 'number':
        case 'string':
        case 'boolean':
          message += d;
          break;
        default:
          if (d instanceof Error) {
            error = d;
          } else {
            categorizedData.push(d);
          }
      }
    });
    if (categorizedData.length === 0) {
      categorizedData = undefined;
    } else if (categorizedData.length === 1) {
      [categorizedData] = categorizedData;
    }
    return { message, error, categorizedData };
  };
};
