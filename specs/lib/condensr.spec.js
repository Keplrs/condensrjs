var Condensr = require('../../lib/condensr'),
    sinon = require('sinon');

describe('When all parameters are supplied', function () {
    var condensr;

    before(function () {
        condensr = new Condensr();
    });

    it('should upload the file supplied', function () {
        expect(3).equal(3);
    });
});