var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const SECRETS = require('./_SECRETS');

var app = express();

//I think there's things I want to do that handlebars cannot do
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(SECRETS.cookieSign));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/user', require('./routes/user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
/*
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send('oopsies ' + res.locals.error);
});
*/

module.exports = app;
