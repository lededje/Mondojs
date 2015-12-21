import _ from 'lodash';
import oauth2 from 'simple-oauth2';

const API = 'https://production-api.gmon.io';

const ENDPOINTS = {
	AUTHENTICATION: {
		OAUTH2: '/oauth2/token',
		PING: '/ping/whoami'
	},
	ACCOUNTS: '/accounts',
	BALANCE: '/balance?account_id=<%= accountId %>',
	TRANSACTION: '/transactions/<%= transactionId %>',
	TRANSACTIONS: '/transactions',
	FEED: '/feed'
};

export default class Mondo {

	VERSION: Number;

	oath: Object;
	token: Object;

	constructor(clientId: String, clientSecret: String) {

		if (!_.isString(clientId) || !_.isString(clientSecret)) {
			throw new Error('Client id and client password must be defined for instance construction.');
		}

		this.oauth = oauth2({
			clientID: clientId,
			clientSecret: clientSecret,
			site: API,
			tokenPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2,
			authorizationPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2
		});

	}

	auth (username: String, password: String) : Promise {

		if (!_.isString(username) || !_.isString(password)) {
			throw new Error('Username and password must be defined for authorization.');
		}

		return this.oauth.password.getToken({username, password})
			.then((result) : Promise => {
				this.token = this.oauth.accessToken.create(result);
				return this.token;
			});
		;
	}

	expired () {
		if(_.isUndefined(token)) {
			throw new Error('Token not found.');
		}
		return token.expired();
	}

	refresh () {

		if(_.isUndefined(token)) {
			throw new Error('Token not found.');
		}

		return token.refresh();
	}

	revoke () {
		console.warn('No revoke enpoint available.');
		return new Promise().reject()
		// token.revoke('refresh_token');
	}

	accounts () {
		return this.oauth.api('GET', ENDPOINTS.ACCOUNTS, { access_token: this.token.token.access_token });
	}

	balance (accountId: String) {

		if(!_.isString(accountId)) {
			throw new Error('Account id is require to lookup balance.');
		}

		let endpoint: String = _.template(ENDPOINTS.BALANCE)({accountId});

		return this.oauth.api('GET', endpoint, { access_token: this.token.token.access_token });
	}

}