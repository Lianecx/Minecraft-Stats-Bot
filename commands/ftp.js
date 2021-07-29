module.exports = {
    name: 'ftp',
    aliases: ['ftpconnect', 'connectftp', 'server', 'connectserver', 'serverconnect'],
    usage: 'ftp <host> <username> <password> <port> <path to world folder (Format: /path/path)> <minecraft-version>',
    example: 'ftp localhost lianecx supersecretpassword 21 /minecraftbukkit/supercoolworld 1.17',
    description: "Connect your minecraft Server with the bot. Can only be used by **admins**. \n**Need help getting the ftp credentials?**\nJoin the [Support Server](https://discord.gg/rX36kZUGNK).",
    async execute(message, args) {
        const ftp = require('../ftp');
        const sftp = require('../sftp');
        const fs = require("fs");

        let host = (args[0]);
        let user = (args[1]);
        let password = (args[2]);
        let port = parseInt(args[3]);
        let path = (args[4]);
        let version = (args[5]);
        
        if(!host || !user || !password || !port || !version || !path) {
            console.log(message.member.user.tag + ' executed ^ftp wrong in ' + message.guild.name);
            message.reply('Incorrect Usage! Please check ^help ftp for correct usage!');
            return;
        }

        console.log(message.member.user.tag + ` executed ^ftp ${host} ${user} ${password} ${port} ${path} ${version} in ` + message.guild.name);

        if (!message.member.hasPermission('ADMINISTRATOR')) {
            message.reply(':warning: ' + "You are not an Admin!");
            console.log(message.member.user.tag + ' executed ^ftp without admin in ' + message.guild.name);
            return;
        } else if(version.startsWith('1.11') || version.startsWith('1.10') || version.startsWith('1.9') || version.startsWith('1.8') || version.startsWith('1.7')) {
            message.reply(':warning: The advancement command might not work because advancements dont exist in your Minecraft version yet.');
        } else if(!version.startsWith('1.13') && !version.startsWith('1.14') && !version.startsWith('1.15') && !version.startsWith('1.16') && !version.startsWith('1.17')) {
            message.reply(':warning: The stat and advancement commands might not work because your version isnt compatible with it.');
        }

        const connectSftp = await sftp.connect({
            host: host,
            pass: password,
            user: user,
            port: port
        });
        if(connectSftp === false) {
            const connectFtp = await ftp.connect({ 
                host: host, 
                pass: password, 
                user: user, 
                port: port 
            });

            if(connectFtp !== true) {
                console.log('Couldnt connect with sftp or ftp.');
                message.reply('<:Error:849215023264169985> Couldnt connect to server with ftp or sftp. Please check your credentials and try again.');
                return;
            }

            console.log('Connected with ftp.');

            const jsonFtp = {
                "host": host,
                "user": user,
                "password": password,
                "port": port,
                "path": path,
                "version": version,
                "protocol": 'ftp'
            }
            
            fs.writeFile('./ftp/' + message.guild.id + '.json', JSON.stringify(jsonFtp, null, 2), err => {
                if (err) {
                    console.log('Error writing ftpFile', err);
                    message.reply('<:Error:849215023264169985> Error trying to connect to server.');
                } else {
                    console.log('Successfully wrote ftpFile');
                    message.reply('<:Checkmark:849224496232660992> Succesfully connected with server.');
                }
            })
            
        } else if(connectSftp === true) {

            console.log('Connected with sftp.');

            const jsonFtp = {
                "host": host,
                "user": user,
                "password": password,
                "port": port,
                "path": path,
                "version": version,
                "protocol": 'sftp'
            }
            
            fs.writeFile('./ftp/' + message.guild.id + '.json', JSON.stringify(jsonFtp, null, 2), err => {
                if (err) {
                    console.log('Error writing ftpFile', err);
                    message.reply('<:Error:849215023264169985> Error trying to connect to server.');
                } else {
                    console.log('Successfully wrote ftpFile');
                    message.reply('<:Checkmark:849224496232660992> Succesfully connected with server.');
                }
            })
        } else {
            console.log('Couldnt connect to server.');
            message.reply('<:Error:849215023264169985> Couldnt connect to server.');
            return;
        }
    }
}