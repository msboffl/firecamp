import { useEffect } from 'react';
import _cleanDeep from 'clean-deep';
import _cloneDeep from 'lodash/cloneDeep';
import shallow from 'zustand/shallow';
import { _object } from '@firecamp/utils';
import { Container, Row, Column, Loader } from '@firecamp/ui-kit';
import SidebarPanel from './sidebar-panel/SidebarPanel';
import UrlBarContainer from './common/urlbar/UrlBarContainer';
import PlaygroundPanel from './playground-panel/PlaygroundPanel';
import DocWrapper from './common/explorer/GraphQLDoc';

import { StoreProvider, createStore, useStore, IStore } from '../store';

import {
  initialiseStoreFromRequest,
  normalizeRequest,
} from '../services/request.service';

const GraphQL = ({ tab, platformContext }) => {
  const {
    isFetchingRequest,
    initialise,
    setRequestSavedFlag,
    setIsFetchingReqFlag,
    setContext,
    initialiseCollection,
  } = useStore(
    (s: IStore) => ({
      isFetchingRequest: s.ui.isFetchingRequest,
      initialise: s.initialise,
      setIsFetchingReqFlag: s.setIsFetchingReqFlag,
      setRequestSavedFlag: s.setRequestSavedFlag,
      setContext: s.setContext,
      initialiseCollection: s.initialiseCollection,
    }),
    shallow
  );

  //set context to store
  useEffect(() => {
    setContext(platformContext);
  }, []);

  /** if request is being saved then after successful flag set the request's as saved */
  useEffect(() => {
    setRequestSavedFlag(tab?.__meta?.isSaved);
  }, [tab?.__meta?.isSaved]);

  /** subscribe/ unsubscribe request changes (pull-actions) */
  useEffect(() => {
    const requestId = tab.entity?.__ref?.id;
    // subscribe request updates
    if (tab.__meta.isSaved && tab?.entity.__ref?.id) {
      platformContext.request.subscribeChanges(requestId, handlePull);
    }

    // unsubscribe request updates
    return () => {
      if (tab.__meta.isSaved && requestId) {
        platformContext.request.unsubscribeChanges(requestId);
      }
    };
  }, []);

  /** fetch request and Handle realtime changes of the Request */
  useEffect(() => {
    const _fetchRequest = async () => {
      try {
        const requestId = tab.entity?.__ref?.id;
        const isRequestSaved = !!requestId;
        // prepare a minimal request payload
        let _request = { collection: { folders: [], items: [] } }; // initialise will normalize the request to prepare minimal request for tab
        if (isRequestSaved === true) {
          setIsFetchingReqFlag(true);
          try {
            const request = await platformContext.request.fetch(requestId);
            console.log(request, 'fetch request...');
            _request = { ...request };
          } catch (error) {
            console.error({
              API: 'fetch rest request',
              error,
            });
            throw error;
          }
        }
        const { collection, ...request } = _request;
        /** initialise graphql store on tab load */
        initialise(request, tab.id);
        if (collection && !_object.isEmpty(collection))
          initialiseCollection(collection);
        setIsFetchingReqFlag(false);
      } catch (error) {
        console.error({
          API: 'fetch and normalize rest request',
          error,
        });
      }
    };
    _fetchRequest();
  }, []);

  const handlePull = async () => {};

  if (isFetchingRequest === true) return <Loader />;
  return (
    <Container className="h-full w-full with-divider" overflow="visible">
      <UrlBarContainer tab={tab} />
      <Container.Body>
        <Row flex={1} overflow="auto" className="with-divider h-full">
          <SidebarPanel />
          <Column>
            <PlaygroundPanel />
          </Column>
          <DocWrapper />
        </Row>
      </Container.Body>
    </Container>
  );
};

const withStore = (WrappedComponent) => {
  const MyComponent = ({ tab, ...props }) => {
    const { request = {}, id } = tab;
    const initState = initialiseStoreFromRequest(request, id);
    // console.log(tab, 'tab.....', initState)
    return (
      <StoreProvider createStore={() => createStore(initState)}>
        <WrappedComponent tab={tab} {...props} />
      </StoreProvider>
    );
  };
  return MyComponent;
};
export default withStore(GraphQL);
