#Clobber
Clobber is a utility that runs a [ScriptRunner](https://github.com/Fivium/ScriptRunner) build and run of a file against a database.
##Usage
```javascript
var clobber = require('clobber');
var clobInstance = clobber.getInstance({
  "scriptrunner": {
    "jdbc": "jdbc:oracle:thin:@localhost:1521:xe",
    "user": "promotemgr",
    "password": "pass",
    "jarLocation": "path/to/ScriptRunner.jar",
    "codeSourcePath":"path/to/scriptrunner/build/dir",
    "builder_config_location": "builder.cfg"
  }
});

clobInstance('path/to/file',function(clobResult){
 console.log(clobResult.result);
});
```
