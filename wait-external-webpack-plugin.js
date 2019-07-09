'use strict';

const ConcatSource = require("webpack-sources").ConcatSource;
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");

class WaitExternalPlugin {

	constructor(args) {
		if (typeof args !== 'object') {
			throw new TypeError('Argument "args" must be an object.');
		}
		this.test = args.hasOwnProperty('test') ? args.test : '';
	}

	getVarForGlobalVariableExternal(variableName, type) {
		if (!Array.isArray(variableName)) {
			variableName = [variableName];
		}
		// needed for e.g. window["some"]["thing"]
		const objectLookup = variableName
			.map(r => `[${JSON.stringify(r)}]`)
			.join("");
		return `${type}${objectLookup}`;
	}

	getVarForDefaultCase(request) {
		if (!Array.isArray(request)) {
			request = [request];
		}
		const variableName = request[0];
		const objectLookup = request
			.slice(1)
			.map(r => `[${JSON.stringify(r)}]`)
			.join("");
		return `${variableName}${objectLookup}`;
	}

	apply(compiler) {
		const tester = {test: this.test};
		compiler.hooks.compilation.tap('WaitExternalPlugin', (compilation) => {
			compilation.hooks.optimizeChunkAssets.tapAsync('WaitExternalPlugin', (chunks, done) => {
				wrapChunks(compilation, chunks);
				done();
			})
		});

		const wrapFile = (compilation, fileName, chunk) => {
			const externalVars = chunk.getModules().filter(item => {
				if (item.external) {
					return true;
				}
			}).map(item => {
				const {
					request,
					externalType,
				} = item;
				switch (externalType) {
					case "this":
					case "window":
					case "self":
						return this.getVarForGlobalVariableExternal(request, externalType)
					case "var":
						return this.getVarForDefaultCase(request);
					default:
						console.warn(`\n[wait-external-webpack-plugin] ignore: ${externalType} ${request}\n`);
						return;
				}
			}).filter(item => {
				return !!item;
			})

			if (externalVars.length === 0) return;
			compilation.assets[fileName] = new ConcatSource(
				`(function () {
	var entryInit = function () {`,
				compilation.assets[fileName],
				`\n
	};
	if (${externalVars.join(' && ')}) {
		entryInit();
	} else {
		var hasInit = false; 
		var callback = function () {
			if(hasInit) return;
			if (${externalVars.join(' && ')}) {
				hasInit = true;
				document.removeEventListener('load', callback, true);
				entryInit();
			}
		};    
		document.addEventListener('load', callback, true);
	}
})();`
			);
		}

		function wrapChunks(compilation, chunks) {
			chunks.forEach((chunk) => {
				if (!chunk.hasRuntime()) return;
				chunk.files.forEach(fileName => {
					if (ModuleFilenameHelpers.matchObject(tester, fileName)) {
						wrapFile(compilation, fileName, chunk);
					}
				});
			});
		}
	}
}

module.exports = WaitExternalPlugin;
