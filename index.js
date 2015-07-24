'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;
var File = require('vinyl');
var fs = require('fs-extra');
var uuid = require('uuid');
var format = require('string-format');
var temp = require('temp');

format.extend(String.prototype);

var clobber_dir_name = '.clobber';
var cmd_sr_build = 'java -jar "{0}" -build {1} -label {2} -outfile {3} -logdir {4}';
var cmd_sr_run = 'java -jar "{0}" -run {1} -jdbc {2} -user {3} -password {4} -logdir {5}';

exports.get_instance= function(config){
return function(changed_file_path, outcome) {
  var result;
  var runid = uuid.v1();  
  console.log(changed_file_path);
  var fileRelativeDir = path.relative(config.scriptrunner.codeSourcePath,path.dirname(changed_file_path));
  



  temp.mkdir(clobber_dir_name, function(err, target_working_dir){
    if (err) throw err;
    var target_build_dir = path.join(target_working_dir, 'build');
    //make the directory to the changed file
    var target_build_file_path = path.join(target_build_dir, fileRelativeDir, path.basename(changed_file_path));

    
    fs.ensureFile(target_build_file_path, function(err){
      console.log(err);
      fs.copySync(changed_file_path, target_build_file_path);
    });
   
    fs.copySync(
      path.join(config.scriptrunner.codeSourcePath,'ScriptRunner'), 
      path.join(target_build_dir, 'ScriptRunner')
    );

    fs.emptyDirSync(path.join(target_build_dir, 'ScriptRunner', 'Utils'));
    fs.rmdirSync(path.join(target_build_dir, 'ScriptRunner', 'Utils'));
    fs.emptyDirSync(path.join(target_build_dir, 'ScriptRunner', 'Jobs'));
    fs.rmdirSync(path.join(target_build_dir, 'ScriptRunner', 'Jobs'));
    var build_label = 'clobber-{0}-{1}'.format(os.hostname(), runid);
    var build_cmd = cmd_sr_build.format(
      config.scriptrunner.jarLocation,
      target_build_dir, 
      build_label,
      path.join(target_working_dir, build_label + '.zip'),
      target_working_dir
    );
    var run_cmd = cmd_sr_run.format(
      config.scriptrunner.jarLocation,
      path.join(target_working_dir, build_label + '.zip'),
      config.scriptrunner.jdbc, 
      config.scriptrunner.user, 
      config.scriptrunner.password, target_working_dir
    );
    
    exec(build_cmd, function(err) {
      if (err) {
        outcome({
          "result":"error",
          "file_location":changed_file_path,
          "err":err
        });
      }
      exec(run_cmd, function(err) {
        if (err) {
          outcome({
            "result":"error",
            "file_location":changed_file_path,
            "err":err
          });
        }
        fs.emptyDirSync(target_working_dir);
        fs.rmdirSync(target_working_dir);
        outcome({
          "result":"success",
          "file_location":changed_file_path,
          "build_location":target_working_dir
        });
      });
    
    });
  });
};
};
