
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Http Remote Plugin
## Features

- Exposes a HomeKit TV accessory
- Characteristics changes trigger HTTP requests to user-defined URLs
- Every request customizable with HTTP method, headers and body

Add the platform to your Homebridge config.json file. You can find your file location [here](https://github.com/homebridge/homebridge/wiki).
```json
{
    "platforms": [
        {
            "platform": "http-tv",
            "devices": {
                "device config here, see below": ""
            }
        }
    ]
}
```
## Configuration
You can use the visual config editor in [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x). However for more detailed configuration you may have to edit the config.json file directly. 

### A note on HTTP requests
Generally you can globally define headers and http body in the main device config. However, every object marked **\<HTTPRequest\>** can include `method`, `headers`, and `body` properties, that only get used for *that* HTTP request. See [example below](#config-example).

### Config Properties
- `name` \<string\> **required**: Defines the name which is later displayed in HomeKit

- `power` \<HTTPRequest\> **required**:
    - `onUrl` \<URL\> **required**: The URL to be requested when the TV is turned **on**.
    - `offUrl` \<URL\> **required**: The URL to be requested when the TV is turned **off**.

- `sources` \<Array\<HTTPRequest\>\> **required**: The input sources available.
    - `name` \<string\> **required**: The name for the input source
    - `url` \<URL\> **required**: The URL to query when this input is selected.
    - `type` \<number\> **optional** \(Default: **3 (HDMI)**\): The input type as defined [here](https://developers.homebridge.io/#/characteristic/InputSourceType)

- `method` \<string\> **optional** \(Default: **"GET"**\): The HTTP method to be used for **all** requests.
- `headers` \<object\> **optional**: Key-Value object for HTTP headers to be included in every request.

- `serialNumber` \<string\> **optional** \(Default: **"TV01"**\): Defines a custom serial number shown in the home app.


- `model` \<string\> **optional** \(Default: **"TV"**\): Defines a custom model name shown in the home app.
- `manufacturer` \<string\> **optional** \(Default: **"Mateffy"**\): Defines a custom manufacturer name shown in the home app.

##### HTTPRequest: The HTTP request object
- `method` \<string\> **optional** \(Default: **"TV01"**\): The HTTP method to be used for **all** requests.
- `headers` \<object\> **optional**: Key-Value object for HTTP headers to be included in every request.
- `body` \<string\> **optional**: The HTTP body

### Config Example
```json
{
    "platforms": [
        {
            "platform": "http-remote",
            "devices": [
              {
                "name": "Projector",
                "serialNumber": "my-http-tv-1",
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer token-example"
                },
                "power": {
                    "onUrl": "http://192.168.0.106/projector/on",
                    "offUrl": "http://192.168.0.106/projector/off",
                    "headers": {
                        "X-Custom-Header": "Value"
                    }
                },
                "button": {
                    "nextUrl": "http://192.168.0.106/projector/next",
                    "previousUrl": "http://192.168.0.106/projector/prev",
                    "upUrl": "http://192.168.0.106/projector/u",
                    "downUrl": "http://192.168.0.106/projector/d",
                    "leftUrl": "http://192.168.0.106/projector/l",
                    "rightUrl": "http://192.168.0.106/projector/r",
                    "selectUrl": "http://192.168.0.106/projector/ok",
                    "backUrl": "http://192.168.0.106/projector/back",
                    "exitUrl": "http://192.168.0.106/projector/back",
                    "playUrl": "http://192.168.0.106/projector/play",
                    "infoUrl": "http://192.168.0.106/projector/hdmi"
                },
                "sources": [
                    {
                        "name": "HDMI1",
                        "url": "http://bridge.local/tv/source/1",
                        "type": 3,
                        "method": "PATCH",
                        "headers": {
                            "X-Custom-Header-2": "value"
                        }
                    },
                    {
                        "name": "HDMI2",
                        "url": "http://bridge.local/tv/source/2",
                        "type": 3,
                        "body": "custom request body"
                    }
                ],
                "model": "HTTP TV",
                "manufacturer": "Lukas Mateffy"
              }
            ]
        }
    ]
}
```
