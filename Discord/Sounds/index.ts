import * as fs from 'fs';
import { joinVoiceChannel, entersState, VoiceConnectionStatus, DiscordGatewayAdapterCreator, VoiceConnection } from '@discordjs/voice';
import { Snowflake, VoiceChannel } from 'discord.js';
import { createDiscordJSAdapter } from './adapter';

const voiceConnections: Record<Snowflake, VoiceConnection> = {};

export function getCurrentSounds(): {[id: string]: string}{
    let audio: {[id: string]: string} = {}
    console.log(`dirname: ${__dirname}`)
    let dir = __dirname + '/';
    fs.readdirSync(__dirname).forEach(file => {
        if(file.includes('.mp3'))
            audio[file] = dir + file
    })
    return audio
}

export async function connectToChannel(channel: VoiceChannel): Promise<VoiceConnection>{
    console.log('Creating Connection')
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});

	try {
        console.log('Connection: ')
        console.log(connection)
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        console.log('Returning Connection')
		return connection;
	} catch (error) {
        console.log('Error Creating Connection')
		connection.destroy();
		throw error;
	}
}