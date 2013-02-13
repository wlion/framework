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


	grunt.registerTask('setup', ['composer-install', 'set-permissions', 'jam-install', 'upgrade-bootstrap', 'move-files']);

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
			path  = require('path'),
			files = grunt.config.get('permissions');

		function chmodSyncRecursive(file, mode) {
			var fstats = fs.lstatSync(file);
			if (fstats.isDirectory()) {
				var dirFiles = fs.readdirSync(file);
				for (var i = 0, l = dirFiles.length; i < l; i++) {
					var curStats = fs.lstatSync(path.join(file, dirFiles[i]));
					if (curStats.isDirectory()) {
						chmodSyncRecursive(path.join(file, dirFiles[i]), mode);
					}
					fs.chmodSync(path.join(file, dirFiles[i]), mode);
				}
			}
			fs.chmodSync(file, mode);
		};

		for(var f in files) {
			chmodSyncRecursive(f, files[f]);
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

	grunt.registerTask('move-files', function() {
		var fs = require('fs'),
			path = require('path');

		fs.writeFileSync('index.php', fs.readFileSync(path.join('public', 'index.php'), 'utf8').replace(/\.\.\/bootstrap/g, 'bootstrap'));
		fs.unlinkSync(path.join('public', 'index.php'));
		fs.writeFileSync('.htaccess', fs.readFileSync(path.join('public', '.htaccess'), 'utf8'));
		fs.unlinkSync(path.join('public', '.htaccess'));
	});

};
