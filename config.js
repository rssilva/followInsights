/**
 * This is a config file to add static (or almost static :)) variables or configs
 * @param {String} env with the environment that you'll set. 
 * I have just dev and production now.
 * @return {Object} with the configs according with the passed environment
 */
module.exports = function (env) {
	var dbConfig = {
		dev: {
			host: 'localhost',
			name: ''
		},
		prod: {
			host: '',
			name: ''
		}
	}

	return {
		setEnv: function (env) {
			this.db = dbConfig[env];
		},
		db: env ? dbConfig[env] : dbConfig.dev
	}
}