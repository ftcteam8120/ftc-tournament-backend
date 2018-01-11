import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { checkFields, requireFields } from '../src/utils/requireFields';

describe('The checkFields function', () => {
  describe('simple objects', () => {
    it('should work normally', () => {
      expect(checkFields(['name', 'address'], {
        name: 'Mario',
        address: 'Peach Street',
        another: 'Hello'
      })).to.eql([]);
    });
    it('should find missing fields', function() {
      expect(checkFields(['name', 'address', 'test'], {
        name: 'Mario',
        address: 'Peach Street',
        another: 'Hello'
      })).to.eql(['test']);
    });
  });

  describe('nested objects', function () {
    it('should work normally', function () {
      expect(checkFields(['name.first', 'name.last', 'address'], {
        name: {
          first: 'John',
          last: 'Doe'
        },
        address: 'Test Road'
      })).to.eql([]);
    });
    it('should find missing fields', function () {
      expect(checkFields(['name.first', 'name.last', 'address'], {
        name: {
          last: 'Doe'
        },
        address: 'Test Road'
      })).to.eql(['name.first']);
    });
  });

  describe('multiple nested objects', function () {
    it('should work normally', function () {
      expect(checkFields(['email.address', 'email.site.name', 'email.site.type'], {
        email: {
          address: 'test',
          site: {
            name: 'gmail',
            type: 'com'
          }
        }
      })).to.eql([]);
    });
    it('should find missing fields', function () {
      expect(checkFields(['email.address', 'email.site.name', 'email.site.type', 'email.site.secure'], {
        email: {
          address: 'test',
          site: {
            name: 'gmail',
            type: 'com'
          }
        }
      })).to.eql(['email.site.secure']);
    });
  });
});

describe('The requireFields middleware', function () {
  describe('request handler creation', function() {
    let mw;
    beforeEach(function () {
      mw = requireFields(['test']);
    });
    it('should return a function()', function() {
      expect(mw).to.be.a('function');
    });
    it('should accept three arguments', function() {
      expect(mw.length).to.equal(3);
    });
  });

  describe('request handler calling', function() {
    it('should call next() once', function() {
      let mw = requireFields(['test']);
      let nextSpy = sinon.spy();
      mw(({ body: { test: 'test' } } as any), ({} as any), nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });
  });
});