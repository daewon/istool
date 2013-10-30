## istool.js - higher-order functions

```bash
npm install istool
```

### usage
```javascript
var is = require('istool')
```

#### functions

##### `equal` is.eq 

```javascript
var arr = ['daewon', 'dun'].filter(is.eq('daewon'));
// ['daewon']
```


##### `not equal` is.ne
```javascript
var arr = ['daewon', 'dun'].filter(is.ne('daewon'));
// ['dun']
```

##### `pluck` is.pluck
```javascript
var arr = [{name: 'daewon', age: 19}, {name: 'dun', age: 32}].map(is.pluck('name'));
// ['daewon', 'dun']
```

