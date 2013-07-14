var hi = require('../hi');
var assert = require('assert');

// test object
var Person = function(firstName, lastName, yearOfBirth) {
  this.firstName = firstName;
  this.lastName = lastName;

  this.fullName = function() {
    return firstName + " " + lastName; 
  };
  
  this.getAge = function() {
    return (new Date()).getFullYear() - yearOfBirth;
  };
};

var persons = [
  new Person('daewon', 'jeong', 1982),
  new Person('John', 'McCarthy', 1927),
  new Person('Dennis', 'Ritchie', 1941),
  new Person('kenneth', 'Thompson', 1943),
  new Person('Frederick', 'Brooks', 1931),
  new Person('Donald', 'Knuth', 1938)
];

var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('hi.eq', function() {
  it('should equal', function() {
    assert.equal(hi.eq('daewon')('daewon'), true);
    assert.equal(hi.eq('daewon')('Dennis'), false);
    assert.deepEqual(nums.filter(hi.eq(2)), [2]);
    assert.deepEqual(nums.filter(hi.eq(10)), [10]);
  });
});

describe('hi.ne', function() {
  it('should not equal', function() {
    assert.equal(hi.ne('daewon')('Dennis'), true);
    assert.equal(hi.ne('daewon')('daewon'), false);
    assert.deepEqual(nums.filter(hi.ne(2)), [1, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(nums.filter(hi.ne(10)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('hi.peq', function() {
  it('should equal', function() {
    assert.deepEqual(persons.filter(hi.peq('lastName', 'jeong')), [persons[0]]);
  });
});

describe('hi.ieq', function() {
  it('should equal', function() {
    assert.deepEqual(persons.filter(hi.ieq('getAge', 31)), [persons[0]]);
  });
});

describe('hi.ieq', function() {
  it('should equal', function() {
    assert.deepEqual(persons.filter(hi.ieq('getAge', 31)), [persons[0]]);
  });
});


