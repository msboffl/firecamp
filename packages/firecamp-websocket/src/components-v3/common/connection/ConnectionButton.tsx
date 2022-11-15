import { Button } from '@firecamp/ui-kit';
import shallow from 'zustand/shallow';

import { EConnectionState } from '../../../constants';
import CloseConnection from './CloseConnection';

import { IWebsocketStore, useWebsocketStore } from '../../../store';

const ConnectionButton = () => {
  let { connectionState, activePlayground, connect, disconnect } =
    useWebsocketStore(
      (s: IWebsocketStore) => ({
        connectionState:
          s.playgrounds[s.runtime.activePlayground]?.connectionState ||
          EConnectionState.IDEAL,
        activePlayground: s.runtime.activePlayground,
        connect: s.connect,
        disconnect: s.disconnect,
      }),
      shallow
    );

  let _renderConnectionButton = () => {
    switch (connectionState) {
      case EConnectionState.OPEN:
        return (
          <CloseConnection
            buttonId={`close-connection-${activePlayground}`}
            activePlayground={activePlayground}
            onClose={disconnect}
          />
        );
        break;
      case EConnectionState.CONNECTING:
        return (
          <Button
            text="Connecting"
            // TODO: add class font-light invert-icon-onhover
            // iconPath={'/packages-platform/core/public/assets/icon/png/heartbeat-icon.png'}
            // iconPathHover={'/packages-platform/core/public/assets/icon/png/heartbeat-icon.png'}
            onClick={(_) => {
              disconnect(activePlayground);
            }}
            primary
            sm
            iconLeft
          />
        );
        break;
      case EConnectionState.CLOSING:
        return (
          <Button
            text="Connect"
            // TODO: add class font-light invert-icon-onhover
            // TODO: add className={'small  font-light with-icon-left'}
            // iconPath={'/packages-platform/core/public/assets/icon/png/connecting.png'}
            // iconPathHover={'/packages-platform/core/public/assets/icon/png/connection.png'}
            onClick={(_) => connect(activePlayground)}
            primary
            xs
            iconLeft
          />
        );
        break;
      case EConnectionState.CLOSED:
        return (
          <Button
            text="Disconnected"
            // TODO: add class font-light invert-icon-onhover
            // TODO: add className={'small  font-light with-icon-left'}
            // iconPath={'/packages-platform/core/public/assets/icon/png/broken-connection.png'}
            // iconPathHover={'/packages-platform/core/public/assets/icon/png/connection.png'}
            onClick={(_) => connect(activePlayground)}
            primary
            xs
            iconLeft
          />
        );
        break;
      default:
        return (
          <Button
            text="Connect"
            // TODO: add class font-light invert-icon-onhover
            // TODO: add className={'small font-light with-icon-left'}
            // iconPath={'/packages-platform/core/public/assets/icon/png/broken-connection.png'}
            // iconPathHover={'/packages-platform/core/public/assets/icon/png/connection.png'}
            onClick={(_) => connect(activePlayground)}
            primary
            xs
            iconLeft
          />
        );
    }
  };

  return <div className="flex items-center">{_renderConnectionButton()}</div>;
};
export default ConnectionButton;
