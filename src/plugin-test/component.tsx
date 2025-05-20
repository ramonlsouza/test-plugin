/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  FloatingWindow,
  BbbPluginSdk,
  DataChannelTypes,
  RESET_DATA_CHANNEL,
} from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';

interface PluginPinMessageProps {
  pluginUuid: string;
}

function PluginPinMessage(
  { pluginUuid }: PluginPinMessageProps,
): React.ReactElement<PluginPinMessageProps> {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi = BbbPluginSdk.getPluginApi(pluginUuid);

  interface Message {
    messageId: string;
    messageText: string;
    senderUserId: string;
  }

  interface PinnedMessage {
    senderUserId: string;
    messageText: string;
    messageId: string;
    pinnedBy: string;
  }

  const {
    data: pinnedMessageResponse,
    pushEntry: pushPinnedMessage,
    deleteEntry: deletePinnedMessage,
  } = pluginApi.useDataChannel<PinnedMessage>('pinMessage', DataChannelTypes.LATEST_ITEM);

  const currentUser = pluginApi.useCurrentUser();

  useEffect(() => {
    // highlight the pinned message in the chat window
    const lastPinnedMessage = pinnedMessageResponse?.data?.length >= 1
      ? pinnedMessageResponse?.data[0]?.payloadJson?.messageText
      : '';

    if (lastPinnedMessage === '') {
      pluginApi.setFloatingWindows([]);
      return;
    }

    const floatingWindow = new FloatingWindow({
      top: 50,
      left: 50,
      movable: true,
      backgroundColor: '#f1f1f1',
      boxShadow: '2px 2px 10px #777',
      contentFunction: (element: HTMLElement) => {
        const root = ReactDOM.createRoot(element);
        root.render(
          <div
            className="pinned-message"
            style={{
              backgroundColor: '#f8f8f8',
              borderLeft: '3px solid #ffcc00',
              padding: '10px 10px',
              position: 'relative',
            }}
            role="region"
            aria-label="Pinned message"
          >
            <div
              className="pinned-message-header"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '5px',
              }}
            >
              <div
                className="header-left"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  className="pin-icon"
                  aria-hidden="true"
                  style={{
                    marginRight: '5px',
                  }}
                >
                  📌
                </span>
                <span
                  className="pinned-label"
                  style={{
                    fontWeight: 'bold',
                    color: '#555',
                  }}
                >
                  Pinned Message
                </span>
              </div>
              {currentUser?.data?.role === 'MODERATOR' && (
                <button
                  className="unpin-button"
                  aria-label="Unpin this message"
                  onClick={() => {
                    deletePinnedMessage([RESET_DATA_CHANNEL]);
                  }}
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.8em',
                    color: '#666',
                    cursor: 'pointer',
                    marginLeft: '10px',
                  }}
                >
                  Unpin
                </button>
              )}
            </div>
            <div
              className="pinned-message-content"
              style={{
                margin: '8px 0',
                whiteSpace: 'pre-wrap',
                userSelect: 'text',
                padding: '0 5px',
                maxWidth: '20em',
                overflowWrap: 'break-word',
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {lastPinnedMessage}
            </div>
            <div
              className="pinned-message-meta"
              style={{
                fontSize: '0.9em',
                color: '#666',
                marginTop: '5px',
                padding: '0 5px',
              }}
            >
              {`Pinned by ${pinnedMessageResponse?.data[0]?.payloadJson?.pinnedBy}`}
            </div>
          </div>,
        );
        return root;
      },
    });
    pluginApi.setFloatingWindows([floatingWindow]);
  }, [pinnedMessageResponse, currentUser]);

  const [
    chatMessages,
    setChatMessages,
  ] = useState<Message[]>([]);

  const responseLoadedChatMessages = pluginApi.useLoadedChatMessages();
  const pinnedMessageId = pinnedMessageResponse?.data?.length >= 1
    ? pinnedMessageResponse?.data[0]?.payloadJson?.messageId
    : '';

  useEffect(() => {
    if (responseLoadedChatMessages.data) {
      const loadedMessages = responseLoadedChatMessages.data.filter(
        (message) => message.message !== '',
      ).map((message) => ({
        messageId: message.messageId,
        messageText: message.message,
        senderUserId: message.senderUserId,
      }));
      setChatMessages(loadedMessages);
    }
  }, [responseLoadedChatMessages]);

  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(chatMessages
    .map((message) => message.messageId));

  useEffect(() => {
    if (currentUser?.data?.role !== 'MODERATOR') {
      return;
    }

    chatMessagesDomElements?.map((chatMessageDomElement) => {
      // only append if the button is not already there
      const codeButton = chatMessageDomElement.querySelector('.btn-pin');
      if (codeButton) {
        return false;
      }

      const toolbar = chatMessageDomElement.querySelector('.chat-message-toolbar');
      if (toolbar === null) {
        return false;
      }

      // check if the message is pinned
      const messageId = chatMessageDomElement.dataset.chatMessageId;
      const isPinned = pinnedMessageId === messageId;

      if (isPinned) {
        return false;
      }

      // create a new element and append it to the DOM
      const button = document.createElement('button');
      button.classList.add('btn');
      button.classList.add('btn-default');
      button.classList.add('btn-sm');
      button.classList.add('btn-pin');
      button.style.padding = '0 5px';
      button.style.fontSize = '0.8em';
      button.style.cursor = 'pointer';
      button.style.borderRadius = '4px';
      button.style.border = 'none';
      button.style.backgroundColor = 'transparent';
      button.innerText = '📌';
      button.setAttribute('title', 'Pin this message');
      button.setAttribute('data-message-id', messageId);
      button.addEventListener('click', () => {
        // get text from the chat message
        const messageData = chatMessages.find((message) => message.messageId === messageId);

        const messageText = messageData?.messageText || '';
        const senderUserId = messageData?.senderUserId || '';

        if (messageText === '') {
          return;
        }

        const message = {
          senderUserId,
          messageText,
          messageId,
          pinnedBy: currentUser.data?.name || '',
        };

        // send message to data-channel
        pushPinnedMessage(message);
      });
      toolbar.appendChild(button);

      return true;
    });
  }, [chatMessages, chatMessagesDomElements, currentUser, pinnedMessageResponse]);

  useEffect(() => {
    const isModerator = currentUser?.data?.role === 'MODERATOR';

    // if not moderator, remove all btn-pin buttons
    if (!isModerator) {
      const buttons = document.querySelectorAll('.btn-pin');
      buttons.forEach((button) => {
        button.remove();
      });
    }
  }, [currentUser]);

  useEffect(() => {
    // remove button if message is pinned
    const buttons = document.querySelectorAll('.btn-pin');
    buttons.forEach((button) => {
      const { messageId } = (button as HTMLButtonElement).dataset;
      if (pinnedMessageId === messageId) {
        button.remove();
      }
    });
  }, [pinnedMessageResponse]);

  return null;
}
export default PluginPinMessage;
