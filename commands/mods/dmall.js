const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'dmall',
    aliases: ['massdm', 'senddm'],
    description: 'Envoie un message en privé à tous les membres du serveur.',
    run: async (client, message, args) => {
        // Vérification des permissions
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
        }

        // Vérification des arguments
        if (!args.length) {
            return message.channel.send("Veuillez spécifier le message à envoyer.");
        }

        const dmMessage = args.join(' ');

        // Confirmation avant d'envoyer le DM
        const confirmation = await message.channel.send(`Êtes-vous sûr de vouloir envoyer ce message à tous les membres ? Tapez "oui" pour confirmer.`);
        const filter = response => response.author.id === message.author.id && response.content.toLowerCase() === 'oui';
        const collector = message.channel.createMessageCollector({ filter, time: 30000 });

        collector.on('collect', async () => {
            confirmation.delete();
            collector.stop();

            let successCount = 0;
            let errorCount = 0;

            // Envoi du message à tous les membres
            message.guild.members.cache.forEach(member => {
                if (!member.user.bot) {
                    member.send(dmMessage)
                        .then(() => successCount++)
                        .catch(() => errorCount++);
                }
            });

            // Affichage des résultats
            setTimeout(() => {
                message.channel.send(`Envoi terminé !\n${successCount} messages envoyés avec succès.\n${errorCount} erreurs.`);
            }, 1000);
        });

        collector.on('end', collected => {
            if (!collected.size) {
                confirmation.delete();
                message.channel.send("Commande annulée.");
            }
        });
    },
};
