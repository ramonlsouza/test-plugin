import { BbbPluginSdk } from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface PluginHelloWorldProps {
  pluginUuid: string;
}

function PluginHelloWorld(
  { pluginUuid }: PluginHelloWorldProps,
): React.ReactElement<PluginHelloWorldProps> {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi = BbbPluginSdk.getPluginApi(pluginUuid);

  interface MessageIdAndCodeLanguage {
    messageId: string;
    messageText: string;
  }

  const [
    chatMessagesToApplyHighlights,
    setChatIdsToApplyHighlights,
  ] = useState<MessageIdAndCodeLanguage[]>([]);

  const responseLoadedChatMessages = pluginApi.useLoadedChatMessages();

  useEffect(() => {
    if (responseLoadedChatMessages.data) {
      const messagesToHighlight = responseLoadedChatMessages.data.filter(
        (message) => message.message !== '',
      ).map((message) => ({
        messageId: message.messageId,
        messageText: message.message,
      }));
      setChatIdsToApplyHighlights(messagesToHighlight);
    }
  }, [responseLoadedChatMessages]);

  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(chatMessagesToApplyHighlights
    .map((message) => message.messageId));

  useEffect(() => {
    chatMessagesDomElements?.map((chatMessageDomElement) => {
      // TODO: send message to the data-channel
      // TODO: highlight the pinned message in the chat window
      // TODO: this option should only be available for moderators
      // TODO: only one message can be pinned - pinning a second message should unpin the first one
      // TODO: if the message is edited/removed, the pinned message should be unpinned or updated

      const toolbar = chatMessageDomElement.querySelector('.chat-message-toolbar');
      if (toolbar === null) {
        return false;
      }

      // only append if the button is not already there
      const codeButton = chatMessageDomElement.querySelector('.btn-pin');
      if (codeButton) {
        return false;
      }

      // create a new element and append it to the DOM
      const button = document.createElement('button');
      button.classList.add('btn');
      button.classList.add('btn-default');
      button.classList.add('btn-sm');
      button.classList.add('btn-pin');
      button.innerText = 'Pin';
      button.addEventListener('click', () => {
        const messageId = chatMessageDomElement.dataset.chatMessageId;
        alert(`Pin: ${messageId}`);
      });
      toolbar.appendChild(button);

      return true;
    });
  }, [chatMessagesToApplyHighlights, chatMessagesDomElements]);

  return null;
}
export default PluginHelloWorld;
