
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


[http://daewon.github.io/higher-order.js/](http://daewon.github.io/higher-order.js/)
