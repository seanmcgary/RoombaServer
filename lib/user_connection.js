var ldap = require('./ldap.js').LDAPHandler;

var user_connection = function(socket, connection_handler){
	var self = this;

	self.is_controlling = false;
	self.socket = socket;
	self.connection_handler = connection_handler;

	self.username = null;
	self.client_addr = self.socket.remoteAddress;
		
	self.ldap = new ldap();
	
	self.init_socket();
	
};

user_connection.prototype = {
	init_socket: function(){
		var self = this;

		self.socket.on('data', function(data){
			self.recv_data(data);
		});

		self.socket.on('error', function(data){
			console.log('ERROR ' + self.client_address);
			
			self.connection_handler.remove_user(self.client_addr);
		});

		self.socket.on('end', function(data){
			console.log('Client connection ended: ' + self.client_addr);
			self.connection_handler.remove_user(self.client_addr);
		});

		self.socket.on('timeout', function(data){
			console.log('Client connection timeout: ' + self.client_addr);
			self.connection_handler.remove_user(self.client_addr);
		});

		self.socket.on('close', function(data){
			console.log('Client connection close:  ' + self.client_addr);
			self.connection_handler.remove_user(self.client_addr);
		});

	},
	recv_data: function(data){
		var self = this;
		data = data.toString().replace('\r', '').replace('\n', '');

		try {
			data = JSON.parse(data);
		} catch(e){
			console.log(e);
		}

		switch(data.opcode){
			case 'login':
				
				if(!('username' in data) || !('password' in data)){
					self.send_msg({opcode: 'err', msg: 'missing username or password'});
					break;
				}

				// login to ldap here
				self.ldap.auth_user(data.username, data.password, function(data){
					console.log(data);
				});
				
				break;
			default:
				self.send_msg({opcode: 'err', msg: 'invalid command'});
				break;
		}

	},
	login: function(username, password){

	},
	logout: function(){
		var self = this;
	},
	send_msg: function(data){
		var self = this;

		data = JSON.stringify(data);

		data += '\n';

		self.socket.write(data);
	}

};

exports.user_connection = user_connection;

