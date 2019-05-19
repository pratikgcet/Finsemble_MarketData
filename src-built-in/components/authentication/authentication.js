var inLogin = true;
/************************************************
 * 			SAMPLE AUTHENTICATION
 ************************************************/
//On ready, check to see if the user has a valid session
FSBL.Clients.RouterClient.onReady(() => {
    checkAuthorizationStatus();
});

$('#authAction').click(function (e) {
    var text = inLogin ? "Sign Up" : "Login"
    var actionLink = inLogin ? "Login" : "Sign Up";
    inLogin = !inLogin;
    $('#submitButton').html(text);
    $('#authAction').html(actionLink);
});

document.body.addEventListener('keydown', handleKeydown);

//Submits credentials on enter, closes on quit.
function handleKeydown(e) {
    if (e.code === 'Enter' && e.shiftKey === false) {
        processAuthInput();
    }

    if (e.code === 'Escape') {
        quit();
    }
}

//Here, you may want to hit a server and request the user's session information. If the session is valid, log them in automatically. This sample code assumes that they are not logged in and just shows the authentication page.
function checkAuthorizationStatus() {
    FSBL.System.Window.getCurrent().show();
    //setTimeout(processAuthInput, 0);
}

//Dummy function that just dumbly accepts whatever is in the form.
function processAuthInput() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    // real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects back when authenticated
    // below is a dummy example that just accepts credentials from the form and publishes them out.
    var data = { username: username, password: password }
    FSBL.System.Window.getCurrent().hide();

    //FSBL.Clients.WindowClient.finsembleWindow.hide();
    //In the real world, you'd get this from a server. Send joe's credentials to a server, and get back entitlements/basic config. For this example, we just accept the credentials.
    publishCredentials(data)
}

//Pass credentials to the application.
function publishCredentials(user) {
    FSBL.Clients.AuthenticationClient.publishAuthorization(user.username, user);
}

//CLose app when the X is clicked.
function quit() {
    FSBL.shutdownApplication();
}

// Add events to HTML elements
$("#submitButton").click(processAuthInput);
$("#FSBL-close").click(quit);

// For this example, the password doesn't do anything, so we are disabling it and setting a tooltip to let the user
// know they don't need to enter a password. This should be removed in a production implementation.
$("#password")
    .prop("disabled", true)
    .prop("placeholder", "Demo needs no password");









/************************************************
 * 				UNUSED EXAMPLE CODE
 ************************************************/

//Add the config to the config service. Our sample has nothing, b
function updateConfig(config, cb) {
    var configSet = {}
    if (config.components) configSet["components"] = config.components;
    if (config.menuItems) configSet["menus"] = config.menuItems;
    if (config.defaultWorkspace) configSet["workspaces"] = config.defaultWorkspace.workspaces;

    //if (config.overrides) configSet["cssOverridePath"] = config.overrides;
    FSBL.Clients.ConfigClient.processAndSet(
        {
            newConfig: configSet,
            overwrite: true,
            replace: true
        },
        function (err, config) {
            return cb(err)
        })
}

//Get a config for the user
function getConfig(cb) {
    fetch("/user/config", {
        method: "GET",
        credentials: 'include'
    })
        .catch((reason) => {
            console.warn("Fail Auth Get", reason);
        })
        .then((res) => {
            return res.json();
        }).then(data => {
            if (data) {
                updateConfig(data, cb);
            }
        });
}


function displayErrorMessage() {
    fin.desktop.Window.getCurrent().show();
    var ERROR_MESSAGE = $('.fsbl-input-error-message');
    var INPUTS = $('.fsbl-auth-input');
    const INPUT_ERROR_CLASS = 'fsbl-input-error';

    INPUTS.addClass(INPUT_ERROR_CLASS);

    ERROR_MESSAGE.show();

    INPUTS.on('keydown', function () {
        INPUTS.removeClass(INPUT_ERROR_CLASS)
        ERROR_MESSAGE.hide();
    });
}