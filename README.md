## istool.js - higher-order functions

```bash
npm install istool
```

### usage
```javascript
var is = require('istool')
```

#### API References

###### `is.eq`
equal

```javascript
var arr = ['daewon', 'dun'].filter(is.eq('daewon'));
// ['daewon']
```


###### `is.ne`
not equal

```javascript
var arr = ['daewon', 'dun'].filter(is.ne('daewon'));
// ['dun']
```

###### `is.pluck`
extract field

```javascript
var arr = [{name: 'daewon', age: 19}, {name: 'dun', age: 32}].map(is.pluck('name'));
// ['daewon', 'dun']
```

