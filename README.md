# 📌 BigBlueButton Pinned Messages Plugin

This plugin adds support for **pinning important messages** in the chat during BigBlueButton conferences. Ideal for keeping key information visible in busy sessions such as online classes, webinars, or team meetings.

![Screenshot from 2025-04-10 14-48-00](https://github.com/user-attachments/assets/45d5c92b-fe07-4a9a-833f-974fffcb2f47)

## Features
- Pin/unpin messages with a single click (moderator-only)
- Pinned messages stay visible at the top of the chat panel
- Works seamlessly with BigBlueButton’s existing chat interface

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd $HOME/src/pin-message-plugin
npm ci
npm run build-bundle
```

The above command will generate the `dist` folder, containing the bundled JavaScript file named `PinMessagePlugin.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the Plugin separated to the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
