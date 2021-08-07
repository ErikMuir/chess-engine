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
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevels[logType] < logLevels[logLevel]) {
      return;
    }
    const loggers = process.env.LOGGERS;
    if (loggers && !loggers.split(',').includes(this.name)) {
      return;
    }
    console.log(this.name, ...data);
  };
};
