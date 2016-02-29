var chalk = require("chalk"),
    errorFormat = chalk.bold.red;

var errorHandler = {
    raiseError: function (err){
        console.log (errorFormat(err));
        return 1;
    }
};

module.exports = errorHandler;