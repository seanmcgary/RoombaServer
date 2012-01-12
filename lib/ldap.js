var ldap_connection = require('./node-LDAP').Connection;
var util = require('util');

function LDAPHandler(){
    var self = this;
	
	self.host = 'ldap://ldap.csh.rit.edu';
	self.version = 3;
}

LDAPHandler.prototype = {
    ldap_time: function(){
        var self = this;
        return util.get_time() + ' (ldap)';
    },
    connect: function(){
        var self = this;

        self.ldap = new ldap_connection();

        self.ldap.open(self.host, self.version);
    },
    close: function(){
        var self = this;
        self.ldap.close();
    },
    /**
     * Authenticate a user using their username/password by attempting to bind to ldap
     * 
     * @param username          Users CSH username
     * @param password          Users CSH password
     * @param callback(authed)  True for authed, false on fail
     */
    auth_user: function(username, password, callback){
        var self = this;
        self.connect();

        self.ldap.simpleBind('uid=' + username + ',ou=Users,dc=csh,dc=rit,dc=edu', password, function(msg_id, error){
            if(error == null){
                self.ldap.search('ou=Users,dc=csh,dc=rit,dc=edu', self.ldap.SUBTREE, "(uid=" + username + ")", "*", function(msg, error, data){
                    if(error == null){
                        if(data.length > 0){
                            // return user data
                            data = data[0];
                            var user_data = {
                                username: data.uid[0],
                            };

                            callback(user_data);
                            self.close();
                        } else {
                            callback(false);
                            self.close();
                        }
                    } else {
                        callback(false);
                        self.close();
                    }
                });
            } else {
                callback(false);
                self.close();
            }
        });
    }
};

exports.LDAPHandler = LDAPHandler;
