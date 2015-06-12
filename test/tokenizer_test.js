'use strict';

// var assert = require("assert");
// var tokenizer = require('../src/tokenizer');

import * as assert from 'assert';
import * as tokenizer from '../src/tokenizer';

var Tokenizer = tokenizer.Tokenizer;
// var Token = tokenizer.Token;
var STRING_TOKEN = tokenizer.STRING_TOKEN;
var IDENTIFIER_TOKEN = tokenizer.IDENTIFIER_TOKEN;
var DOT_TOKEN = tokenizer.DOT_TOKEN;
var COMMA_TOKEN = tokenizer.COMMA_TOKEN;
var COLON_TOKEN = tokenizer.COLON_TOKEN;
var INTEGER_TOKEN = tokenizer.INTEGER_TOKEN;
var DECIMAL_TOKEN = tokenizer.DECIMAL_TOKEN;
var OPERATOR_TOKEN = tokenizer.OPERATOR_TOKEN;
var GROUPER_TOKEN = tokenizer.GROUPER_TOKEN;
var KEYWORD_TOKEN = tokenizer.KEYWORD_TOKEN;
var POSTFIX_PRECEDENCE = tokenizer.POSTFIX_PRECEDENCE;
var PRECEDENCE = tokenizer.PRECEDENCE;

function expectTokens(s, expected) {
  var tokens = new Tokenizer(s).tokenize();
  assert.deepEqual(tokens, expected);
}

function t(kind, value, precedence) {
  return tokenizer.token(kind, value, precedence);
}

suite('tokenizer', function() {

  test('should tokenize an empty expression', function() {
    expectTokens('', []);
  });

  test('should tokenize an identifier', function() {
    expectTokens('abc', [t(IDENTIFIER_TOKEN, 'abc')]);
  });

  test('should tokenize two identifiers', function() {
    expectTokens('abc def', [t(IDENTIFIER_TOKEN, 'abc'), t(IDENTIFIER_TOKEN, 'def')]);
  });

  test('should tokenize a double quoted String', function() {
    expectTokens('"abc"', [t(STRING_TOKEN, 'abc')]);
  });

  test('should tokenize a single quoted String', function() {
    expectTokens("'abc'", [t(STRING_TOKEN, 'abc')]);
  });

  test('should tokenize a String with escaping', function() {
    expectTokens('"a\\c\\\\d\\\'\\""', [t(STRING_TOKEN, 'ac\\d\'"')]);
  });

  test('should tokenize a dot operator', function() {
    expectTokens('a.b', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(DOT_TOKEN, '.', POSTFIX_PRECEDENCE),
        t(IDENTIFIER_TOKEN, 'b')]);
    expectTokens('ab.cd', [
        t(IDENTIFIER_TOKEN, 'ab'),
        t(DOT_TOKEN, '.', POSTFIX_PRECEDENCE),
        t(IDENTIFIER_TOKEN, 'cd')]);
    expectTokens('ab.cd()', [
        t(IDENTIFIER_TOKEN, 'ab'),
        t(DOT_TOKEN, '.', POSTFIX_PRECEDENCE),
        t(IDENTIFIER_TOKEN, 'cd'),
        t(GROUPER_TOKEN, '(', PRECEDENCE['(']),
        t(GROUPER_TOKEN, ')', PRECEDENCE[')'])]);
    expectTokens('ab.cd(e)', [
        t(IDENTIFIER_TOKEN, 'ab'),
        t(DOT_TOKEN, '.', POSTFIX_PRECEDENCE),
        t(IDENTIFIER_TOKEN, 'cd'),
        t(GROUPER_TOKEN, '(', PRECEDENCE['(']),
        t(IDENTIFIER_TOKEN, 'e'),
        t(GROUPER_TOKEN, ')', PRECEDENCE[')'])]);
  });

  test('should tokenize a unary plus operator', function() {
    expectTokens('+a', [
        t(OPERATOR_TOKEN, '+', PRECEDENCE['+']),
        t(IDENTIFIER_TOKEN, 'a')]);
  });

  test('should tokenize a one-character operator', function() {
    expectTokens('a + b', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(OPERATOR_TOKEN, '+', PRECEDENCE['+']),
        t(IDENTIFIER_TOKEN, 'b')]);
  });

  test('should tokenize a two-character operator', function() {
    expectTokens('a && b', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(OPERATOR_TOKEN, '&&', PRECEDENCE['&&']),
        t(IDENTIFIER_TOKEN, 'b')]);
  });

  test('should tokenize a three-character operator', function() {
    expectTokens('a !== b', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(OPERATOR_TOKEN, '!==', PRECEDENCE['!==']),
        t(IDENTIFIER_TOKEN, 'b')]);
  });


  test('should tokenize a ternary operator', function() {
    expectTokens('a ? b : c', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(OPERATOR_TOKEN, '?', PRECEDENCE['?']),
        t(IDENTIFIER_TOKEN, 'b'),
        t(COLON_TOKEN, ':', PRECEDENCE[':']),
        t(IDENTIFIER_TOKEN, 'c')]);
  });

  test('should tokenize keywords', function() {
    expectTokens('this', [t(KEYWORD_TOKEN, 'this')]);
  });

  test('should tokenize groups', function() {
    expectTokens('a(b)[]{}', [
        t(IDENTIFIER_TOKEN, 'a'),
        t(GROUPER_TOKEN, '(', PRECEDENCE['(']),
        t(IDENTIFIER_TOKEN, 'b'),
        t(GROUPER_TOKEN, ')', PRECEDENCE[')']),
        t(GROUPER_TOKEN, '[', PRECEDENCE['[']),
        t(GROUPER_TOKEN, ']', PRECEDENCE[']']),
        t(GROUPER_TOKEN, '{', PRECEDENCE['{']),
        t(GROUPER_TOKEN, '}', PRECEDENCE['}'])]);
  });

  test('should tokenize argument lists', function() {
    expectTokens('(a, b)', [
        t(GROUPER_TOKEN, '(', PRECEDENCE['(']),
        t(IDENTIFIER_TOKEN, 'a'),
        t(COMMA_TOKEN, ',', PRECEDENCE[',']),
        t(IDENTIFIER_TOKEN, 'b'),
        t(GROUPER_TOKEN, ')', PRECEDENCE[')'])]);
  });

  test('should tokenize maps', function() {
    expectTokens("{'a': b}", [
        t(GROUPER_TOKEN, '{', PRECEDENCE['{']),
        t(STRING_TOKEN, 'a'),
        t(COLON_TOKEN, ':', PRECEDENCE[':']),
        t(IDENTIFIER_TOKEN, 'b'),
        t(GROUPER_TOKEN, '}', PRECEDENCE['}'])]);
  });

  test('should tokenize lists', function() {
    expectTokens("[1, 'a', b]", [
        t(GROUPER_TOKEN, '[', PRECEDENCE['[']),
        t(INTEGER_TOKEN, '1'),
        t(COMMA_TOKEN, ',', PRECEDENCE[',']),
        t(STRING_TOKEN, 'a'),
        t(COMMA_TOKEN, ',', PRECEDENCE[',']),
        t(IDENTIFIER_TOKEN, 'b'),
        t(GROUPER_TOKEN, ']', PRECEDENCE[']'])]);
  });

  test('should tokenize integers', function() {
    expectTokens('123', [t(INTEGER_TOKEN, '123')]);
    expectTokens('+123', [t(OPERATOR_TOKEN, '+', PRECEDENCE['+']), t(INTEGER_TOKEN, '123')]);
    expectTokens('-123', [t(OPERATOR_TOKEN, '-', PRECEDENCE['-']), t(INTEGER_TOKEN, '123')]);
  });

  test('should tokenize decimals', function() {
    expectTokens('1.23', [t(DECIMAL_TOKEN, '1.23')]);
    expectTokens('+1.23', [t(OPERATOR_TOKEN, '+', PRECEDENCE['+']), t(DECIMAL_TOKEN, '1.23')]);
    expectTokens('-1.23', [t(OPERATOR_TOKEN, '-', PRECEDENCE['-']), t(DECIMAL_TOKEN, '1.23')]);
  });

  test('should tokenize booleans as identifiers', function() {
    expectTokens('true', [t(IDENTIFIER_TOKEN, 'true')]);
    expectTokens('false', [t(IDENTIFIER_TOKEN, 'false')]);
  });

  test('should tokenize name.substring(2)', function() {
    expectTokens('name.substring(2)', [
        t(IDENTIFIER_TOKEN, 'name'),
        t(DOT_TOKEN, '.', POSTFIX_PRECEDENCE),
        t(IDENTIFIER_TOKEN, 'substring'),
        t(GROUPER_TOKEN, '(', PRECEDENCE['(']),
        t(INTEGER_TOKEN, '2'),
        t(GROUPER_TOKEN, ')', PRECEDENCE[')']),
    ]);
  });
});
