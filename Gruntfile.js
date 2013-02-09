module.exports = function(grunt) {

	grunt.initConfig({
		pkg : '<json:package.json>',
		permissions : {
			'app/storage' : '777'
		},
		bootstrap : {
			scssSrc : 'bootstrap-sass/lib/*.scss',
			scssDest : 'public/scss/bootstrap'
		}
	});


	grunt.registerTask('setup', ['composer-install', 'set-permissions', 'jam-install', 'upgrade-bootstrap']);

	grunt.registerTask('composer-install', function() {
		var done = this.async(),
			exec  = require('child_process').exec;

		var i = setInterval(function() {
			console.log('Composer install running...');
		}, 5000);
		exec('composer install', function(err, stdout, stderr) {
			clearInterval(i);
			if (err) {
				console.error(stderr);
			}
			console.log(stdout);
			done();
		});
	});

	grunt.registerTask('set-permissions', function() {
		var fs    = require('fs'),
			files = grunt.config.get('permissions');
		for(var f in files) {
			fs.chmodSync(f, files[f]);
		}
	});

	grunt.registerTask('jam-install', function() {
		var done = this.async();
		var exec = require('child_process').exec;
		exec('jam install', function(err, stdout, stderr) {
			if (err) {
				console.error(stderr);
			}
			console.log(stdout);
			done();
		});
	});

	grunt.registerTask('upgrade-bootstrap', function() {
		var done = this.async(),
			exec = require('child_process').exec,
			path = require('path'),
			fs   = require('fs');

		exec('jam upgrade bootstrap-sass', function(err, stdout, stderr) {
			if (err) {
				console.error(stderr);
				return;
			}
			console.log(stdout);

			var packageDir = grunt.config.get('pkg.jam.packageDir'),
				bootstrapConfig = grunt.config.get('bootstrap'),
				scssFiles = grunt.file.expand(path.join(packageDir, bootstrapConfig.scssSrc));

			fs.exists(bootstrapConfig.scssDest, function(exists) {
				if (!exists) {
					grunt.file.mkdir(bootstrapConfig.scssDest);
				}

				for (var i = 0, l = scssFiles.length; i < l; i++) {
					var temp = scssFiles[i].split('/');
					var fname = temp[temp.length - 1];
					grunt.file.copy(scssFiles[i], path.join(bootstrapConfig.scssDest, fname));
				}
				done();
			});

		})
	});

};
