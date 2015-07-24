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
return function(changed_file, outcome) {
  var result;
  var runid = uuid.v1();

  var file = new File({
    cwd: process.cwd(),
    path: changed_file.path
  });
  file.name = file.path.replace(/^.*[\\\/]/, '');
  file.dirnamerelative = file.relative.replace(path.sep + file.name, '');
  temp.mkdir(clobber_dir_name, function(err, target_working_dir){
    if (err) throw err;
    var target_build_dir = path.join(target_working_dir, 'build');
    fs.mkdirsSync(path.join(target_build_dir, file.dirnamerelative));
    fs.copySync(file.relative, path.join(target_build_dir, file.relative));
    fs.copySync('ScriptRunner', path.join(target_build_dir, 'ScriptRunner'));
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
          "file_location":changed_file.path,
          "err":err
        });
      }
      exec(run_cmd, function(err) {
        if (err) {
          outcome({
            "result":"error",
            "file_location":changed_file.path,
            "err":err
          });
        }
        fs.emptyDirSync(target_working_dir);
        fs.rmdirSync(target_working_dir);
        outcome({
          "result":"success",
          "file_location":changed_file.path,
          "build_location":target_working_dir
        });
      });
    
    });
  });
};
};
