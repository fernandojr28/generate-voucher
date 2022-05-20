<template>
    <div class="container">
      <h1>Gmail API demo</h1>

      <button @click="handleAuthClick" id="authorize-button" class="btn btn-primary hidden">Authorize</button>

      <table class="table table-striped table-inbox hidden">
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
            <th>Date/Time</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="i in 10" :key="i"></tr>
        </tbody>
      </table>
    </div>
</template>

<script>
var clientId = '120096392903-lm8gs5t0t3ldbclu1sd8iugd8tk3k1er.apps.googleusercontent.com';
var apiKey = 'AIzaSyD-il_-TtCXVbRHWfj-Bd-uC8jJsXrAc24';
var scopes = 'https://www.googleapis.com/auth/gmail.readonly';



function appendMessageRow(message) {
    console.log("message", message);
    $('.table-inbox tbody').append(
        '<tr>\
        <td>'+getHeader(message.payload.headers, 'From')+'</td>\
        <td>\
            <a href="#message-modal-' + message.id +
            '" data-toggle="modal" id="message-link-' + message.id+'">' +
            getHeader(message.payload.headers, 'Subject') +
            '</a>\
        </td>\
        <td>'+getHeader(message.payload.headers, 'Date')+'</td>\
        </tr>'
    );

    $('body').append(
        '<div class="modal fade" id="message-modal-' + message.id +
            '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
        <div class="modal-dialog modal-lg">\
            <div class="modal-content">\
            <div class="modal-header">\
                <button type="button"\
                        class="close"\
                        data-dismiss="modal"\
                        aria-label="Close">\
                <span aria-hidden="true">&times;</span></button>\
                <h4 class="modal-title" id="myModalLabel">' +
                getHeader(message.payload.headers, 'Subject') +
                '</h4>\
            </div>\
            <div class="modal-body">\
                <iframe id="message-iframe-'+message.id+'" srcdoc="<p>Loading...</p>">\
                </iframe>\
            </div>\
            </div>\
        </div>\
        </div>'
    );

    $('#message-link-'+message.id).on('click', function(){
        var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
        $('body', ifrm).html(getBody(message.payload));
    });
}

function getHeader(headers, index) {
    var header = '';

    $.each(headers, function(){
        if(this.name === index){
            header = this.value;
        }
    });
    return header;
}

function getBody(message) {
    var encodedBody = '';
    if(typeof message.parts === 'undefined') {
        encodedBody = message.body.data;
    } else {
        encodedBody = getHTMLPart(message.parts);
    }
    encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
    // console.log("encodedBody", decodeURIComponent(escape(window.atob(encodedBody))));
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

function getHTMLPart(arr) {
    for(var x = 0; x <= arr.length; x++) {
        if(typeof arr[x].parts === 'undefined') {
            if(arr[x].mimeType === 'text/html') {
                return arr[x].body.data;
            }
        } else {
            return getHTMLPart(arr[x].parts);
        }
    }
    return '';
}


export default {
    head() {
        return {
            title: 'GMAIL - IMBOX', // Other meta information
            link: [
                {
                    rel: "stylesheet",
                    href:
                    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
                }
            ],
            script: [
                {
                    src:
                    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
                    type: "text/javascript"
                },
                {
                    src:
                    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js",
                    type: "text/javascript"
                }
            ]
        }
    },
    data() {
        return {
            gapi: null
        }
    },
    mounted() {
        this.initClient()
    },
    methods: {

        initClient() {
            gapi.client.setApiKey(apiKey)
            window.setTimeout(this.checkAuth, 1)

        },

        loadGmailApi() {
            gapi.client.load('gmail', 'v1', this.displayInbox);
        },

        displayInbox() {
            var request = gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'labelIds': 'INBOX',
                'maxResults': 2
            });

            request.execute(function(response) {
                $.each(response.messages, function() {
                    var messageRequest = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': this.id
                    })
                    /*.then(function(response){
                        console.log("response", response);
                    })*/

                    // messageRequest.execute(appendMessageRow);
                });
            });
        },

        checkAuth() { 
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true
            }, this.handleAuthResult)
        },

        handleAuthResult(authResult) {
            // console.log("authResult", authResult)
            if(authResult && !authResult.error) {
                this.loadGmailApi()
                $('#authorize-button').remove()
                $('.table-inbox').removeClass("hidden")
            } else {
                $('#authorize-button').removeClass("hidden")
                // $('#authorize-button').on('click', function(){
                //     this.handleAuthClick();
                // });
            }
        },
        handleAuthClick() {
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: false
            }, this.handleAuthResult)
            return false
        }
    }
}
</script>
<style>
iframe {
    width: 100%;
    border: 0;
    min-height: 80%;
    height: 600px;
    display: flex;
}
</style>