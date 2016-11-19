# Slobber
Slobber is a utility that runs a [ScriptRunner](https://github.com/Fivium/ScriptRunner) build and run of a file against a database.
## Usage
```javascript
var slobber = require('slobber');
var slobInstance = slobber.getInstance({
  "jdbc": "jdbc:oracle:thin:@localhost:1521:xe",
  "user": "promotemgr",
  "password": "pass",
  "jarLocation": "path/to/ScriptRunner.jar",
  "codeSourcePath":"path/to/scriptrunner/build/dir",
  "builderConfigLocation": "builder.cfg"
});

slobInstance('path/to/file',function(slobResult){
 console.log(slobResult.result);
});
```
