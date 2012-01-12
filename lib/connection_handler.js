Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	
	return this.push.apply(this, rest);
};

var net = require('net'),
	user_connection = require('./user_connection.js').user_connection;


var connection_handler = function(){
	var self = this;

	self.server = null;

	self.current_controller = null;
	
	// lets queue people as they come in so that everyone can get a turn!!
	self.user_queue = [];

	self.connected_users = [];

}

connection_handler.prototype = {
	create_server: function(){
		var self = this;
		
		self.server = net.createServer(function(socket){
			var user_conn = new user_connection(socket, self);
		});

	},
	listen: function(){
		var self = this;

		self.server.listen(8080);
	},
	add_user: function(user){
		var self = this;
		
		// add user to the connected users pool
		self.connected_users.push(user);
	},
	remove_user: function(client_addr){
		var self = this;
		
		for(var i = 0; i < self.connected_users.length; i++){
			if(self.connected_users[i].client_addr == client_addr){
				self.connected_users.remove(i);
			}
		}
	},
	get_connected_users: function(){
		var self = this;
	}	
};

exports.connection_handler = new connection_handler();
