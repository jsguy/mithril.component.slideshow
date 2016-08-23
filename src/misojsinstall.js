#!/usr/bin/env node
var fs = require('fs-extra'),
	path = require('path'),
	fileExists = function(filePath) {
	    try {
	        return fs.statSync(filePath).isFile();
	    } catch (err) {
	        return false;
	    }
	},
	//	Ref: http://stackoverflow.com/a/4482701/6637332
	directoryExists = function(directoryPath) {
		try {
			fs.accessSync(directoryPath, fs.F_OK);
			return true;
		} catch (err) {
			return false;
		}
	},
	installDir = process.cwd(),
	projectDir = installDir.substr(0, installDir.lastIndexOf("node_modules/") - 1),
	projectPackage = projectDir + "/package.json",
	projectExternal = projectDir + "/public/external",
    external = {
		"dist/mithril.component.slideshow.css": "mithril.component.slideshow/mithril.component.slideshow.css",
		"dist/mithril.component.slideshow.min.js": "mithril.component.slideshow/mithril.component.slideshow.min.js"
    };

//	Check if it is a project directory
if(fileExists(projectPackage) && directoryExists(projectExternal)) {
	console.log("Install external dependencies for Misojs, don't forget to include:\n");
	//	Install externals
	Object.keys(external).map(function(key){
		var value = external[key],
			src = installDir + "/" + key,
			dest = projectExternal + "/" + value,
			dirStructure = dest.substr(0, dest.lastIndexOf("/"));
		fs.mkdirsSync(dirStructure);
		fs.copySync(src, dest);
	});

	console.log("\t" + Object.keys(external).join("\n\t") + "\n\nin your project's layout or other views");
	console.log();
}
