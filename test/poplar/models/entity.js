'use strict';

/*!
 * Module dependencies.
 */
const Immutable = require('seamless-immutable')

var util = require('util');
var debug = require('debug')('boqii-plant:entity');
var _ = require('lodash');
var assert = require('assert');
var Dynamic = require('./dynamic');

/**
 * @class A wrapper to map returns with input value.
 */
module.exports = class Entity {
  constructor(name, definitions) {
    this._name = name || 'Entity';
    this._mappings = {};
    this._excepts = false;
    this.define(definitions);
  }

  extend(name) {
    if (Immutable.isImmutable(this)) {
      const mutable = this.asMutable({ deep: true });
      mutable._name = name;
      return mutable;
    } else {
      throw new Error('Cannot extend an mutable entity: ' + this._name);
    }
  }

  asImmutable() {
    return Immutable(this, { prototype: Entity.prototype });
  }

  define(definitions) {
    var self = this;

    if (_.isPlainObject(definitions)) {
      _.each(definitions, function(fn, name) {
        if (fn === true) {
          self.expose(name);
        } else if (Array.isArray(fn)) {
          fn.unshift(name);
          self.expose.apply(self, fn);
        } else {
          fn = [name, fn];
          self.expose.apply(self, fn);
        }
      });
    } else if (!_.isUndefined(definitions)) {
      assert(false, util.format('\'%s\' is not a valid object', definitions));
    }
  }

  /**
   * check whether an object is an Entity instance
   */
  static isEntity(entity) {
    return !!(entity && _.isFunction(entity.isEntity) && this.prototype.isEntity.call(entity));
  }


  /**
   * Include all fields except
   */
  excepts() {
    let excepts = this._excepts || [];
    this._excepts = _.union(excepts, _.values(arguments), ['__v']);
  }

  /**
   * add a given name with or without corresponding function or value
   * { act: 'alias',
   *   value: 'name',
   *   default: null,
   *   using: MyEntity,
   *   if: function(obj, opts) {}
   * }
   * type: support array type
   *    number or ['number']
   *    date or ['date']
   *    string or ['string']
   *    boolean or ['boolean']
   *    any (default) or ['any']
   * act:
   *    function
   *    alias
   *    value
   * Usage:
   *    var entity = new Entity();
   *    entity.expose('name');
   *    entity.expose('name', { as: 'fullname' });
   *    entity.expose('fullname', { get: 'name' });
   *    entity.expose('name', { type: 'string', as: 'fullname' });
   *    entity.expose('sex', { value: 'male' });
   *    entity.expose('isAdult', function(obj) { return obj && obj.age >= 18; });
   *    entity.expose('activities', { using: myActivityEntity });
   *    entity.expose('extraInfo', { using: myExtraInfoEntity });
   *    entity.expose('condition', { if: function(obj, options) { return true } });
   */
  expose() {
    // ...names, options, fn

    var message = '\'%s\' is not a valid string';
    var self = this;

    assert(arguments.length !== 0, util.format(message, undefined));

    var options, fn;

    if (arguments.length > 1) {

      // extract `fn`
      if (_.isFunction(_.last(arguments))) {
        fn = Array.prototype.pop.call(arguments);
      }

      // extract `options`
      options = _.isPlainObject(_.last(arguments)) ? Array.prototype.pop.call(arguments) : {};

      if (arguments.length > 1) {
        assert(!options.as, 'You may not use the :as option on multi-attribute exposures.');
        assert(!fn, 'You may not use function on multi-attribute exposures.');
      }

    } else {
      options = {};
    }

    _.each(arguments, function(name) {
      var value = null,
        defaultVal = null,
        act = null,
        type = null,
        using = null,
        ifFn = null;
      var validName = (_.isString(name)) && (/^[a-zA-Z0-9_\.]+$/g.test(name));
      var invalidAsFunc = (options.as && fn);
      var invalidValueFunc = (options.as && fn);
      var invalidValueAs = (options.as && fn);
      assert(validName, util.format(message, name)); // name must be a string
      assert(!invalidAsFunc, 'You can not use the :as option with function.');
      assert(!invalidValueFunc, 'You can not use the :value option with function.');
      assert(!invalidValueAs, 'You can not use the :value option with :as option.');

      if (Array.isArray(options.type)) {
        type = [options.type[0] || 'any'];
      } else {
        type = options.type || 'any';
      }
      type = type.toLowerCase();

      act = 'alias';
      value = name;

      if (fn) {
        act = 'function';
        value = fn;
      }

      if (!_.isEmpty(options)) {

        if (options.hasOwnProperty('default')) {
          defaultVal = _.isUndefined(options['default']) ? null : options['default'];
        }

        if (options['if']) {
          assert(_.isFunction(options['if']), 'if condition must be a function');
          ifFn = options['if'];
        }

        if (options.using) {
          assert(Entity.isEntity(options.using), self._name + ' `using` ' + options.using._name + ' must be a Entity');
          using = options.using;
        }

        if (options.as) {
          if (!_.isString(options.as)) throw (new Error(util.format(message, options.as)));
          act = 'alias';
          value = name;
          name = options.as;
        } else
        if (options.get) {
          act = 'get';
          value = options.get;
        } else
        if (options.value) {
          act = 'value';
          value = options.value;
        }

      }
      //debug(self._name, 'expose', name);
      self._mappings[name] = {
        type: type,
        act: act,
        value: value,
        default: defaultVal,
        if: ifFn,
        using: using
      };
    });
  }


  /**
   * parse a input object with mappings
   * @param {Object} input: input object values
   * @param {Function} converter: value converter, which can accept one parameter
   */
  parse(input, options, converter) {
    var originalObj;
    var result = {};
    var self = this;

    if (_.isUndefined(input) || _.isNull(input)) {
      originalObj = {};
    } else {
      if (typeof input.toObject === 'function') { // mongoose object
        originalObj = input.toObject();
      } else
      if (typeof input.toJSON === 'function') {   // sequelize object
        originalObj = input.toJSON();
      } else {
        originalObj = input;
      }
    }

    if (_.isFunction(options)) {
      converter = options;
    }

    if (!_.isPlainObject(options)) {
      options = {};
    }

    //debug(this._name, 'parsing object', originalObj);
    if (Array.isArray(originalObj)) {
      // if input is an Array, then loop it
      result = [];
      _.each(originalObj, function(obj) {
        result.push(self.parse(obj, options, converter));
      });
      return result;
    } else {
      let keys = Object.keys(self._mappings);
      if (_.isEmpty(keys)) {
        // if no exposes, return
        return result;
      } else
      if (!_.isObject(originalObj)) {
        return originalObj;
      } else {
        // if excepts enabled then use all keys
        if (self._excepts) {
          keys = _.union(keys, _.keys(originalObj));
          keys = _.difference(keys, self._excepts);
        }
        // sort keys and put id at the first
        keys = _.sortBy(keys);
        if (_.pull(keys, 'id')) {
          keys.unshift('id');
        }
        //debug(self._name, 'mappings', keys, 'excepts', self._excepts);
        _.each(keys, function(k) {
          var o = self._mappings[k] || { act: 'alias', value: k, type: 'any' };
          var val = null;

          //debug(self._name, 'map ', k, 'o', o);
          if (o['if'] && !o['if'](originalObj, options)) {
            return;
          }

          switch (o.act) {
            case 'function':
              try {
                //debug('entity value function', o.value);
                val = o.value(originalObj, options);
              } catch (e) {
                console.error('entity function error', o.value, e);
                val = null;
              }
              break;
            case 'alias':
              val = _.get(originalObj, o.value);
              break;
            case 'get':
              val = _.get(originalObj, o.value);
              if (_.isUndefined(val)) {
                debug('missing get %s %s of %s', self._name, o.value, originalObj._id);
              }
              break;
            case 'value':
              val = o.value;
              break;
          }

          var isDefaultValueApplied = false;
          // if value is `null`, `undefined`, set default value
          if (_.isUndefined(val) || _.isNull(val)) {
            val = o.default;
            isDefaultValueApplied = true;
          }

          if (converter && _.isFunction(converter)) {
            val = converter(val, options);
          }

          //debug(self._name, 'using ', isDefaultValueApplied, o.using);
          if (!isDefaultValueApplied && o.using) {
            //debug(self._name, 'using entity', val, o.using);
            if (!_.isFunction(o.using.parse)) {
              debug('#### Invalid Entity Using ####\n', self._name, 'using entity', val, o.using._name);
            }
            val = o.using.parse(val, options, converter);
          }

          // cast type according to predefined dynamic converters
          try {
            val = Dynamic.convert(val, o.type, options);
          } catch (e) {
            console.error("entity dynamic convert error", e);
          }

          _.set(result, k, val);
        });
        // for convenience
        if (!keys.id && !result.id) {
          result.id = originalObj._id || originalObj.id;
        }
        return result;
      }
    }
  }

  /**
   * check if an object is an Entity
   */
  isEntity() {
    return this instanceof Entity;
  }
}