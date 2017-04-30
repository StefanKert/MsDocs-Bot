var restify = require('restify');
var request = require('request');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hello... I'm a api searching bot.");
        session.beginDialog('rootMenu');
    },
    function (session, results) {
        session.endConversation("Goodbye until next time...");
    }
]);
server.post('/api/messages', connector.listen());


// Add root menu dialog
bot.dialog('rootMenu', [
    function (session) {
        builder.Prompts.choice(session, "Choose an option:", '.NET Core|.NET Framework|Quit');
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('netCore');
                break;
            case 1:
                session.beginDialog('netFramework');
                break;
            default:
                session.endDialog();
                break;
        }
    },
    function (session) {
        // Reload menu
        session.replaceDialog('rootMenu');
    }
]).reloadAction('showMenu', null, {
    matches: /^(menu|back)/i
});

// Flip a coin
bot.dialog('netCore', [
    function (session) {
        builder.Prompts.text(session, "So what API Element are you looking for?")
    },
    function (session, results) {
        var card = createHeroCard(session, `https://docs.microsoft.com/en-us/dotnet/api/?view=netcore-1.1&term=${results.response}`);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]);

function createHeroCard(session, url) {
    return new builder.HeroCard(session)
        .title('Microsoft Docs')
        .text('Click here to get further information for the term you´re searching for.')
        .buttons([
            builder.CardAction.openUrl(session, url, 'Go')
        ]);
}


// Roll some dice
bot.dialog('netFramework', [
    function (session) {
        builder.Prompts.text("So what API Element are you looking for?")
    },
    function (session, results) {
        var card = createHeroCard(session, `https://docs.microsoft.com/en-us/dotnet/api/?view=netframework-4.7&term=${results.response}`);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]);