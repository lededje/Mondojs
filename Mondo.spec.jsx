
import Mondo, {ENDPOINTS, API} from './Mondo.jsx';
import chai, {expect} from 'chai';
import {sinon} from 'sinon';
import _ from 'lodash';

describe('Mondo', () => {

	describe('constructor', () => {

		it('should throw an error if you don\'t pass in a client id and secret')
		it('should set an internal oauth instance containing client ids, secrets and endpoints')

	});

	describe('auth', () => {

		it('should throw an error if you don\'t provide a username and string')
		it('should request a token with the username and password provided')
		it('should store successful token requests on the instance')
		it('should return a promise')

	});

	describe('expired', () => {
		it('should throw an error if there is no token stored on the instance')
		it('should return whether or not the token is expired')

	});

	describe('refresh', () => {
		it('should throw an error if no token is stored on the instance')
		it('should return a promise')
	});

	describe('revoke', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should revoke both the access_token and the refresh_token');
		it('should return a promise')
	});

	describe('accounts', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should request the accounts endpoint with the instances\' token');
		it('should return a promise');
	});

	describe('balance', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should request the balance endpoint with the instances\' token');
		it('should return a promise');

	});

	describe('transactions', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should throw an error if no account id is provided')
		it('should request the transactions endpoint with the instances\' token and the provided account id');
		it('should return a promise');

	});

	describe('transaction', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should throw an error if no transaction id is provided')
		it('should request the balance endpoint with the instances\' token and provided transaction id');
		it('should return a promise');

	});

	describe('annotate', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should throw an error if no transaction id is provided')
		it('should throw an error if no annotation hash is provided')
		it('should throw an error the annotation hash donesn\'t contain the required fields')
		it('should patch the transaction endpoint with the instances\' token and provided annotation hash in correctly formed headers');
		it('should return a promise');

	});

	describe('feed', () => {
		it('should throw an error if a token isn\'t stored on the instance');
		it('should throw an error if no  id is provided')
		it('should throw an error if no annotation hash is provided')
		it('should throw an error the annotation hash donesn\'t contain the required fields')
		it('should post the transaction endpoint with the instances\' token and provided annotation hash in correctly formed headers');
		it('should return a promise');

	});
});