require("dotenv").config();
const axios = require("axios");
const qs = require("qs");
let textVersion = require("textversionjs");

class GmailAPI {
  accessToken = "";
  constructor() {
    this.accessToken = this.getAcceToken();
  }

  getAcceToken = async () => {
    const data = qs.stringify({
      client_id: process.env.CLIENT_ID_GMAIL,
      client_secret: process.env.CLIENT_SECRET_GMAIL,
      refresh_token: process.env.REFRESH_TOKEN_GMAIL,
      grant_type: "refresh_token",
    });
    const config = {
      method: "post",
      url: process.env.API_URL_GMAIL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    let accessToken = "";

    await axios(config)
      .then(async function (response) {
        console.log("response",    response.data);
        accessToken = await response.data.access_token;

        // console.log("Access Token " + accessToken);
      })
      .catch(function (error) {
        console.log(error);
      });

    return accessToken;
  };

  searchGmail = async (searchItem) => {
    const config1 = {
      method: "get",
      url:
        "https://www.googleapis.com/gmail/v1/users/me/messages?q=" + searchItem,
      headers: {
        Authorization: `Bearer ${await this.accessToken} `,
      },
    };
    let threadId = "";

    await axios(config1)
      .then(async function (response) {
        threadId = await response.data["messages"][0].id;

        // console.log("ThreadId = " + threadId);
      })
      .catch(function (error) {
        console.log(error);
      });
    return threadId;
  };

  readGmailContent = async (messageId) => {
    const config = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      headers: {
        Authorization: `Bearer ${await this.accessToken}`,
      },
    };

    let data = {};

    await axios(config)
      .then(async function (response) {
        data = await response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    return data;
  };

  readInboxContent = async (searchText) => {
    const threadId = await this.searchGmail(searchText);
    const message = await this.readGmailContent(threadId);
    const encodedMessage = await message.payload["parts"][0].body.data;
    const decodedStr = Buffer.from(encodedMessage, "base64").toString("utf8");
    return decodedStr;
  };


  getAllData = async (ctx) => {

    const query = ctx.query;

    let page = query.page || 0,
    rows = query.rows || 10,
    data = {}

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${rows}&pageToken=${page}`

    const config1 = {
        method: "get",
        url,
        headers: {
          Authorization: `Bearer ${await this.accessToken} `,
        },
    };

    let messages = [],
    nextPageToken,
    resultSizeEstimate

    await axios(config1)
    .then(async function (response) {
        messages = await response.data["messages"];
        nextPageToken = response.data["nextPageToken"];
        resultSizeEstimate = response.data["resultSizeEstimate"];
        // console.log("response", response.data)
    })
    .catch(function (error) {
        console.log(error);
    });

    messages = await Promise.all(messages.map(async (e) => {
        const message = await this.readGmailContent(e.threadId);
        return {
            // ...message,  //data all
            threadId: message.threadId,
            headers: {
                from: this.getHeader(message.payload.headers, 'From'),
                subject: this.getHeader(message.payload.headers, 'Subject'),
                date: this.getHeader(message.payload.headers, 'Date'),
            },
            // body: this.getBody(message.payload),
            body_print: this.getBodyPrint(message.payload)
        }
    }))

    //FILTER

    const type_service = [
      {
        business: 'BITEL',
        services: ['RECARGA INTERNET']
      },
      {
        business: 'BITEL - POSTPAGO',
        services: ['POSTPAGO BITEL (SOLES)', 'POSTPAGO BITEL (DOLARES)']
      },
      {
        business: 'ENTEL PERU S.A.',
        services: ['PAGO CON NUMERO TELEFONO']
      },
      {
        business: 'ENOSA',
        services: ['CONSUMO DE ENERGIA']
      },
      {
        business: 'MOVISTAR RECARGAS',
        services: ['RECARGAS VIRTUALES']
      },
      {
        business: 'DIRECTV PERU SRL',
        services: ['C.-RECARGA DIRECTV']
      },
      {
        business: 'PAGOEFECTIVO',
        services: ['PAGOEFECTIVO SOLES']
      }
    ]

    //VALIDA SI LA EMPRESA Y EL SERVICIO A CONSULTAR EXISTE EN LOS DEFAULT

    if(type_service.some(e => e.business === query.business && e.services.includes(query.service))) {
      messages = messages.filter(e => e.body.indexOf(query.service) != -1)
    }

    data = {
      messages,
      nextPageToken,
      resultSizeEstimate
    }

    return data;
  }

  getBodyPrint(message) {

    let html = this.getBody(message)
    html = html.replace(/<tr[^>]*>/g,'').replace(/<\/tr>/g,'');
    html = html.replace(/(<td)/igm, '<div').replace(/<\/td>/igm, '</div>');
    let plainText = textVersion(html);

    return plainText
  }

  getBody(message) {
    let encodedBody = '';
    if(typeof message.parts === 'undefined') {
        encodedBody = message.body.data;
    } else {
        encodedBody = this.getHTMLPart(message.parts);
    }
    const decodedStr = Buffer.from(encodedBody, "base64").toString("utf8");
    return decodedStr
  }

  getHeader(headers, index) {
    const header = headers.find(e => e.name === index).value
    return header || '';
  }

  getHTMLPart(arr) {
    for(let x = 0; x <= arr.length; x++) {
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
}

module.exports = new GmailAPI();
