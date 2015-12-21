
import gulp from 'gulp';
import lambda from 'gulp-awslambda';
import zip from 'gulp-zip';
import rename from 'gulp-rename';
import {argv} from 'yargs';
import webpack from 'gulp-webpack';
import foreach from 'gulp-foreach';
import debug from 'gulp-debug';
import path from 'path';
import _ from 'lodash';

const mochaOpts = {
	reporter: 'list'
}

gulp.task('default', () => {

	return gulp.src('src/Mondo.js')
		.pipe(webpack({
			output: {
				library: '',
				libraryTarget: 'commonjs',
			},
			module: {
				loaders : [
					{ test: /\.js?$/, include: path.resolve(__dirname, 'src'), exclude: /node_modules/, loader: 'babel-loader' },
					{ test: /\.json$/, loader: "json-loader" }
				]
			}
		}))
		.pipe(rename('./Mondo.js'))
		.pipe(gulp.dest('dest'))
	;
});

gulp.task('test:watch', () => {
    gulp.watch('src/**/*.js', ['test']);
});