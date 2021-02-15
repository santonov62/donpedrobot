import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Label, Header, Button, Icon, Dimmer, Loader, Item} from 'semantic-ui-react';
import {allDisputes, fetchAwaitingResults, removeDispute} from './disputeSlice';
import moment from 'moment';
moment.locale('ru');

export function Dispute() {
  const disputes = useSelector(allDisputes);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAwaitingResults());
  }, []);
  const date = moment('2021-02-15T12:34:03.445Z').format('Do MMMM YYYY, HH:mm');
  return(
      <Item.Group divided>
        {disputes.map(({id, title, username, chat_id, created_at, resolved_at}) => {
          return (
              <Item key={id}>
                <Item.Content>
                  <Item.Header as='a'>{title}</Item.Header>
                  <Item.Meta>
                    <Label color="blue">{username}</Label>
                    <Label color="grey">chat: {chat_id}</Label>
                    <Label color="grey">created: {moment(created_at).format('Do MMMM YYYY, HH:mm')}</Label>
                    <Label color="grey">resolved: {moment(resolved_at).format('Do MMMM YYYY, HH:mm')}</Label>
                  </Item.Meta>
                  <Item.Description>

                  </Item.Description>
                  Who wins?
                  <Item.Extra>
                    <Button floated='left'>
                      <Icon name='left chevron' />
                      No, incorrect
                    </Button>
                    <Button floated='left'>
                      Yes, correct
                      <Icon name='right chevron' />
                    </Button>
                    <Button floated='right' color='red' onClick={() => dispatch(removeDispute({id}))}>
                      Delete
                    </Button>
                  </Item.Extra>
                </Item.Content>
              </Item>
          )
        })}
      </Item.Group>
  )
}
