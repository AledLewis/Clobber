'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var uuid = require('uuid');
var format = require('string-format');
var temp = require('temp');
var glob = require('glob');
var Promise = require('promise');


format.extend(String.prototype);

var clobberDirName = '.clobber';
var cmdSrBuild = 'java -jar "{0}" -build {1} -label {2} -outfile {3} -logdir {4}';
var cmdSrRun = 'java -jar "{0}" -run {1} -jdbc {2} -user {3} -password {4} -logdir {5}';

exports.getInstance= function(config){
return function(changedFilePath, outcome) {
  
  var result;
  var runid = uuid.v1();  
  var fileRelativeDir = path.relative(config.scriptrunner.codeSourcePath,path.dirname(changedFilePath));
  var relativeFile = path.join(fileRelativeDir, path.basename(changedFilePath));
  
  console.log("Attempting to clob "+ changedFilePath);
  
  
  temp.mkdir(clobberDirName, function(err, targetWorkingDir){

    if (err) throw err;
    var targetBuildDir = path.join(targetWorkingDir, 'build');
    var targetBuildFilePath = path.join(targetBuildDir, fileRelativeDir, path.basename(changedFilePath));
    var buildLabel = 'clobber-{0}-{1}'.format(os.hostname(), runid);
    var buildConfigLocation = 
      config.scriptrunner.builderConfigLocation?
        config.scriptrunner.builderConfigLocation:'builder.cfg';
      
    var buildCmd = cmdSrBuild.format(
        config.scriptrunner.jarLocation,
        targetBuildDir, 
        buildLabel,
        path.join(targetWorkingDir, buildLabel + '.zip'),
        targetWorkingDir
     );
	
    var runCmd = cmdSrRun.format(
      config.scriptrunner.jarLocation,
      path.join(targetWorkingDir, buildLabel + '.zip'),
      config.scriptrunner.jdbc, 
      config.scriptrunner.user, 
      config.scriptrunner.password, 
      targetWorkingDir
    );
	
    
  
    console.log("Target build directory is: "+targetBuildDir);
  
    function createBuildFileStub(message){
     
      return new Promise(function(resolve, reject){        
        fs.ensureFile(targetBuildFilePath, function(err){
          
          if(err){
            reject(err);
          }
          console.log("Created stub file and required directories in build directory");
          resolve();
        });  
      });
    }
    
    function copyBuildFile(){
      return new Promise(function(resolve,reject){
        fs.copy(changedFilePath, targetBuildFilePath, function(err){
          if(err) reject(err);
          console.log("Copied changed file to build directory");
          resolve();
        });
      });
    }
    
    function copyScriptrunnerDir(){
      return new Promise(function(resolve,reject){
        
        fs.copy(
          path.join(config.scriptrunner.codeSourcePath,'ScriptRunner'), 
          path.join(targetBuildDir, 'ScriptRunner'),
          { 
            filter : function(file){return file.split('.').pop() != 'mf'}
          },
          function(err){
            var now = new Date().getTime();
            while(new Date().getTime() < now + 1000){ /* do nothing */ } 
            if (err) reject(err);
            console.log("Copied ScriptRunner branch to build dir");
            resolve();
        });
      });
    };
    
    function findUnneededConfigFiles(){
      return new Promise(function(resolve,reject){    
        
        glob(path.join(targetBuildDir,'ScriptRunner','builder*.cfg'), function(err, files){
          console.log("Attempting to remove unneed config files ");  
          resolve(files.filter(function(fileName){
            console.log("Comparing "+ path.basename(fileName) + " to " +buildConfigLocation );
            return path.basename(fileName) !== buildConfigLocation            
          }));          
        });
      });
    }
    
    function deleteFile(fileName){
    
      return new Promise(function(resolve,reject){
        fs.remove(fileName, function(err){
          if(err) reject(err);
          console.log("Deleted file:" + fileName);
          resolve();
        });
      });     
    }
    
    function deleteFiles(fileNames){
 
      var promiseArray = fileNames.map(function(fileName){
        return deleteFile(fileName);
      });
 
      return new Promise.all(promiseArray); 
    }
    
    function sbuild(){
      return new Promise(function(resolve,reject){    
        exec(buildCmd, function(err,stdout,stderr){
          console.log("Building ScriptRunner archive");
          if (err){ 
            err.stderr = stdout;
            reject(err);
          };
          resolve(stdout);
        });
      });
    }
    
    function srun(){
      return new Promise(function(resolve,reject){    
        exec(runCmd, function(err,stdout,stderr){
          console.log("Running scriptrunner");
          if (err){ 
            err.stderr = stderr;
            reject(stderr);
          };
          resolve(stdout);
        });
      });
    }
    
    var clobWork = Promise.resolve();
  
    clobWork
      .then(createBuildFileStub)
      .then(copyBuildFile)
      .then(copyScriptrunnerDir)
      .then(findUnneededConfigFiles)
      .then(deleteFiles)
      .then(sbuild)
      .then(srun)
      .then(function(){
        outcome({
          "result":"success", 
          "clobFile":relativeFile
        });
      })
      .catch(function(err){
        console.log(err);
        outcome({
          "result":"failure",
          "clobFile":relativeFile,
          "err":JSON.stringify(err)
        });
      });
    
   
  });
};
};
